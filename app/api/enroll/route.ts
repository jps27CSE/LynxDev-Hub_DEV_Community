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
import { getEnrollmentsByEmail } from "@/lib/enroll-data";

const EnrollSchema = z.object({
  courseId: z.number().int().positive(),
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

  const parsed = EnrollSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { courseId } = parsed.data;

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (users.length === 0) return notFound("User");

  const userId = users[0].id;

  const existing = await db
    .select()
    .from(enrollments)
    .where(
      and(eq(enrollments.user_id, userId), eq(enrollments.course_id, courseId)),
    );

  if (existing.length > 0) return NextResponse.json(existing[0]);

  await db.insert(enrollments).values({ user_id: userId, course_id: courseId });

  const created = await db
    .select()
    .from(enrollments)
    .where(
      and(eq(enrollments.user_id, userId), eq(enrollments.course_id, courseId)),
    );

  return NextResponse.json(created[0]);
}

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) return unauthorized();

  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) return NextResponse.json([], { status: 200 });

  const data = await getEnrollmentsByEmail(email);
  return NextResponse.json(data);
}
