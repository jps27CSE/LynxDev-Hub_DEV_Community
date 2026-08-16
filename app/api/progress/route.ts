import { z } from "zod";
import { db } from "@/config/db";
import { enrollments, usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  validationError,
  badJson,
  unauthorized,
  notFound,
} from "@/lib/api-error";
import { createLogger } from "@/lib/logger";
import { getChaptersMetaByCourseId } from "@/lib/course-data";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";

const log = createLogger("api/progress");

const ProgressSchema = z.object({
  courseId: z.number().int().positive(),
  chapterId: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  const clerkUser = await currentUser();
  if (!clerkUser) return unauthorized();

  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) return notFound("Email");

  const limited = await enforceDbRateLimit(
    clerkUser.id,
    "progress",
    "/api/progress",
    "POST",
  );
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badJson();
  }

  const parsed = ProgressSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { courseId, chapterId } = parsed.data;

  const allChapters = await getChaptersMetaByCourseId(courseId);
  const pointsReward =
    allChapters.find((ch) => ch.id === chapterId)?.points_reward ?? 10;

  const result = await log.timed("progress upsert", () =>
    db.transaction(async (tx) => {
      const users = await tx
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (users.length === 0) return { status: "not-found" } as const;

      const user = users[0];

      const enrollment = await tx
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.user_id, user.id),
            eq(enrollments.course_id, courseId),
          ),
        )
        .limit(1);

      let enrollmentRecord = enrollment[0];
      if (!enrollmentRecord) {
        await tx
          .insert(enrollments)
          .values({ user_id: user.id, course_id: courseId });
        const created = await tx
          .select()
          .from(enrollments)
          .where(
            and(
              eq(enrollments.user_id, user.id),
              eq(enrollments.course_id, courseId),
            ),
          );
        enrollmentRecord = created[0];
      }

      const progress = (enrollmentRecord.progress as {
        completedChapters: number[];
        currentChapter: number;
      }) || {
        completedChapters: [],
        currentChapter: 1,
      };

      if (progress.completedChapters.includes(chapterId)) {
        return { status: "already" as const, progress };
      }

      progress.completedChapters = [...progress.completedChapters, chapterId];
      progress.currentChapter = chapterId;

      await tx
        .update(enrollments)
        .set({ progress, updated_at: new Date() })
        .where(eq(enrollments.id, enrollmentRecord.id));

      const newPoints = (user.points ?? 0) + pointsReward;
      await tx
        .update(usersTable)
        .set({ points: newPoints })
        .where(eq(usersTable.id, user.id));

      const allDone = allChapters.every((ch) =>
        progress.completedChapters.includes(ch.id),
      );
      if (allDone) {
        await tx
          .update(enrollments)
          .set({ completed_at: new Date() })
          .where(eq(enrollments.id, enrollmentRecord.id));
      }

      return {
        status: "ok" as const,
        points: newPoints,
        pointsAwarded: pointsReward,
        progress,
        courseCompleted: allDone,
      };
    }),
  );

  if (result.status === "not-found") return notFound("User");
  if (result.status === "already") {
    return NextResponse.json({
      message: "Already completed",
      progress: result.progress,
    });
  }

  const { points, pointsAwarded, progress, courseCompleted } = result;
  return NextResponse.json({
    points,
    pointsAwarded,
    progress,
    courseCompleted,
  });
}
