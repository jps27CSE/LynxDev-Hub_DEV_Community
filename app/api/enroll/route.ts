import { z } from "zod";
import { db } from "@/config/db";
import { enrollments, usersTable } from "@/config/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  validationError,
  badJson,
  unauthorized,
  notFound,
  serverError,
} from "@/lib/api-error";
import { getEnrollmentsByClerkId } from "@/lib/enroll-data";
import { getChaptersMetaByCourseId, type ChapterMeta } from "@/lib/course-data";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import { withRequestLog } from "@/lib/request-log";

const EnrollSchema = z.object({
  courseId: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  return withRequestLog("POST /api/enroll", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const limited = await enforceDbRateLimit(
      userId,
      "enroll",
      "/api/enroll",
      "POST",
    );
    if (limited) return limited;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badJson();
    }

    const parsed = EnrollSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { courseId } = parsed.data;

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerk_id, userId))
      .limit(1);

    if (users.length === 0) return notFound("User");

    const dbUserId = users[0].id;

    const existing = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.user_id, dbUserId),
          eq(enrollments.course_id, courseId),
        ),
      );

    if (existing.length > 0) return NextResponse.json(existing[0]);

    let firstChapter: ChapterMeta[];
    try {
      firstChapter = await getChaptersMetaByCourseId(courseId);
    } catch (error) {
      console.error("[api/enroll] failed to load course chapters:", error);
      return serverError("Failed to load course data");
    }

    await db.insert(enrollments).values({
      user_id: dbUserId,
      course_id: courseId,
      progress: {
        completedChapters: [],
        currentChapter: firstChapter[0]?.id ?? 1,
      },
    });

    const created = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.user_id, dbUserId),
          eq(enrollments.course_id, courseId),
        ),
      );

    return NextResponse.json(created[0]);
  });
}

export async function GET() {
  return withRequestLog("GET /api/enroll", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    try {
      const data = await getEnrollmentsByClerkId(userId);
      return NextResponse.json(data);
    } catch (error) {
      console.error("[api/enroll] GET failed:", error);
      return NextResponse.json(
        { error: "Failed to load enrollments" },
        { status: 500 },
      );
    }
  });
}
