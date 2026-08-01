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
import { getChaptersByCourseId } from "@/lib/course-data";

const ProgressSchema = z.object({
  courseId: z.number().int().positive(),
  chapterId: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  const clerkUser = await currentUser();
  if (!clerkUser) return unauthorized();

  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) return notFound("Email");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badJson();
  }

  const parsed = ProgressSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { courseId, chapterId } = parsed.data;

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (users.length === 0) return notFound("User");

  const user = users[0];

  const enrollment = await db
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
    await db
      .insert(enrollments)
      .values({ user_id: user.id, course_id: courseId });
    const created = await db
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
    return NextResponse.json({ message: "Already completed", progress });
  }

  progress.completedChapters = [...progress.completedChapters, chapterId];
  progress.currentChapter = chapterId;

  const allChapters = await getChaptersByCourseId(courseId);
  const pointsReward =
    allChapters.find((ch) => ch.id === chapterId)?.points_reward ?? 10;

  await db
    .update(enrollments)
    .set({ progress })
    .where(eq(enrollments.id, enrollmentRecord.id));

  const newPoints = (user.points ?? 0) + pointsReward;
  await db
    .update(usersTable)
    .set({ points: newPoints })
    .where(eq(usersTable.id, user.id));

  const allDone = allChapters.every((ch) =>
    progress.completedChapters.includes(ch.id),
  );
  if (allDone) {
    await db
      .update(enrollments)
      .set({ completed_at: new Date() })
      .where(eq(enrollments.id, enrollmentRecord.id));
  }

  return NextResponse.json({
    points: newPoints,
    pointsAwarded: pointsReward,
    progress,
    courseCompleted: allDone,
  });
}
