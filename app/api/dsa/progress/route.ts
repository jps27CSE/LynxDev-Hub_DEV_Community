import { z } from "zod";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  validationError,
  badJson,
  unauthorized,
  notFound,
  serverError,
} from "@/lib/api-error";
import { createLogger } from "@/lib/logger";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import { withRequestLog } from "@/lib/request-log";
import { markLessonComplete } from "@/lib/dsa-data";

const log = createLogger("api/dsa/progress");

const ProgressSchema = z.object({
  moduleSlug: z.string().min(1).max(120),
  lessonSlug: z.string().min(1).max(120),
});

export async function POST(req: NextRequest) {
  return withRequestLog("POST /api/dsa/progress", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const limited = await enforceDbRateLimit(
      userId,
      "dsa-progress",
      "/api/dsa/progress",
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

    const { moduleSlug, lessonSlug } = parsed.data;
    const lessonKey = `${moduleSlug}/${lessonSlug}`;

    // Resolve Clerk user → DB user.
    let dbUserId: number;
    try {
      const users = await db
        .select({ id: usersTable.id, points: usersTable.points })
        .from(usersTable)
        .where(eq(usersTable.clerk_id, userId))
        .limit(1);
      if (users.length === 0) return unauthorized();
      dbUserId = users[0].id;

      const { alreadyCompleted } = await markLessonComplete(dbUserId, lessonKey);

      let pointsAwarded = 0;
      let newPoints = users[0].points ?? 0;
      if (!alreadyCompleted) {
        pointsAwarded = 10;
        newPoints = (users[0].points ?? 0) + pointsAwarded;
        await db
          .update(usersTable)
          .set({ points: newPoints })
          .where(eq(usersTable.id, dbUserId));
      }

      return NextResponse.json({
        points: newPoints,
        pointsAwarded,
        alreadyCompleted,
        message: alreadyCompleted ? "Already completed" : "ok",
      });
    } catch (error) {
      log.error("failed to save dsa progress", error);
      return serverError("Failed to save progress");
    }
  });
}
