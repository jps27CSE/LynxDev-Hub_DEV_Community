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
import { withRequestLog } from "@/lib/request-log";

const UserSyncSchema = z.object({}).strict();

export async function POST(req: NextRequest) {
  return withRequestLog("POST /api/user", async () => {
    // Deliberately uses currentUser(), not auth(): this is the only place
    // that has the profile data (email, name) needed to create the DB row.
    // Runs once per session — the client syncs on mount. It is also the
    // self-healing backfill for clerk_id (legacy rows created before the
    // column existed).
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
      const user = existing[0];
      if (!user.clerk_id) {
        await db
          .update(usersTable)
          .set({ clerk_id: clerkUser.id })
          .where(eq(usersTable.email, email));
      }
      return NextResponse.json({ ...user, clerk_id: clerkUser.id });
    }

    await db.insert(usersTable).values({
      clerk_id: clerkUser.id,
      name: clerkUser.fullName ?? " ",
      email,
      points: 0,
    });

    const created = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    return NextResponse.json(created[0]);
  });
}
