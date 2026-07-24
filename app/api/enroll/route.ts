import { db } from "@/config/db";
import { enrollments, usersTable, courses, chapters } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const users = await db
    .select()
    .from(usersTable)
    //@ts-ignore
    .where(eq(usersTable.email, clerkUser.primaryEmailAddress?.emailAddress));

  if (users.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const userId = users[0].id;

  const existing = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.user_id, userId), eq(enrollments.course_id, courseId)));

  if (existing.length > 0) return NextResponse.json(existing[0]);

  await db
    .insert(enrollments)
    .values({ user_id: userId, course_id: courseId });

  const created = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.user_id, userId), eq(enrollments.course_id, courseId)));

  return NextResponse.json(created[0]);
}

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await db
    .select()
    .from(usersTable)
    //@ts-ignore
    .where(eq(usersTable.email, clerkUser.primaryEmailAddress?.emailAddress));

  if (users.length === 0) return NextResponse.json([], { status: 200 });

  const userId = users[0].id;

  const chapterCounts = await db
    .select({
      course_id: chapters.course_id,
      value: count(),
    })
    .from(chapters)
    .groupBy(chapters.course_id);

  const countMap = new Map<number, number>();
  for (const row of chapterCounts) {
    countMap.set(row.course_id, Number(row.value));
  }

  const result = await db
    .select({
      enrollment: enrollments,
      course: courses,
    })
    .from(enrollments)
    .where(eq(enrollments.user_id, userId))
    .innerJoin(courses, eq(enrollments.course_id, courses.id));

  const data = result.map((r) => ({
    ...r.enrollment,
    totalChapters: countMap.get(r.course.id) || 0,
    course: r.course,
  }));

  return NextResponse.json(data);
}
