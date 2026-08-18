import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  validationError,
  badJson,
  unauthorized,
  notFound,
} from "@/lib/api-error";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import { withRequestLog } from "@/lib/request-log";

const UpdateProfileSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  bio: z.string().optional(),
  skills: z.array(z.string().max(255)).max(50).optional(),
});

export async function GET() {
  return withRequestLog("GET /api/user/profile", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerk_id, userId))
      .limit(1);

    if (users.length === 0) return notFound("User");

    return NextResponse.json(users[0]);
  });
}

export async function PATCH(req: NextRequest) {
  return withRequestLog("PATCH /api/user/profile", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const limited = await enforceDbRateLimit(
      userId,
      "profile-update",
      "/api/user/profile",
      "PATCH",
    );
    if (limited) return limited;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badJson();
    }

    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const updates = parsed.data;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.clerk_id, userId));

    const updated = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerk_id, userId))
      .limit(1);

    return NextResponse.json(updated[0]);
  });
}
