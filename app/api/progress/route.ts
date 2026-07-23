import { db } from "@/config/db";
import { enrollments, usersTable, chapters } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, chapterId } = await req.json();
  if (!courseId || !chapterId) {
    return NextResponse.json({ error: "courseId and chapterId required" }, { status: 400 });
  }

  const users = await db
    .select()
    .from(usersTable)
    //@ts-ignore
    .where(eq(usersTable.email, clerkUser.primaryEmailAddress?.emailAddress));

  if (users.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const user = users[0];

  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.user_id, user.id), eq(enrollments.course_id, courseId)))
    .limit(1);

  let enrollmentRecord = enrollment[0];
  if (!enrollmentRecord) {
    const [newEnrollment] = await db
      .insert(enrollments)
      .values({ user_id: user.id, course_id: courseId })
      .returning();
    enrollmentRecord = newEnrollment;
  }
  const progress = (enrollmentRecord.progress as { completedChapters: number[]; currentChapter: number }) || {
    completedChapters: [],
    currentChapter: 1,
  };

  if (progress.completedChapters.includes(chapterId)) {
    return NextResponse.json({ message: "Already completed", progress });
  }

  progress.completedChapters = [...progress.completedChapters, chapterId];
  progress.currentChapter = chapterId;

  const chapter = await db
    .select()
    .from(chapters)
    .where(eq(chapters.id, chapterId))
    .limit(1);

  const pointsReward = chapter[0]?.points_reward ?? 10;

  await db
    .update(enrollments)
    .set({ progress })
    .where(eq(enrollments.id, enrollmentRecord.id));

  const newPoints = (user.points ?? 0) + pointsReward;
  await db
    .update(usersTable)
    .set({ points: newPoints })
    .where(eq(usersTable.id, user.id));

  // check if all chapters done → mark completed_at
  const allChapters = await db
    .select()
    .from(chapters)
    .where(eq(chapters.course_id, courseId));

  const allDone = allChapters.every((ch) => progress.completedChapters.includes(ch.id));
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
