import { z } from "zod";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  unauthorized,
  notFound,
  validationError,
  badJson,
} from "@/lib/api-error";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";

const UserSyncSchema = z.object({}).strict();

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

  const parsed = UserSyncSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const limited = await enforceDbRateLimit(
    clerkUser.id,
    "user-sync",
    "/api/user",
    "POST",
  );
  if (limited) return limited;

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existing.length > 0) {
    return NextResponse.json(existing[0]);
  }

  await db.insert(usersTable).values({
    name: clerkUser.fullName ?? " ",
    email,
    points: 0,
  });

  const created = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  return NextResponse.json(created[0]);
}
