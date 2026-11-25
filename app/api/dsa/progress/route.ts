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
  rateLimited,
  serverError,
} from "@/lib/api-error";
import { createLogger } from "@/lib/logger";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import { createMemoryRateLimiter } from "@/lib/memory-rate-limit";
import { getRateLimitConfig } from "@/config/rate-limits";
import { withRequestLog } from "@/lib/request-log";
import { getDsaUserState, markLessonComplete } from "@/lib/dsa-data";

const log = createLogger("api/dsa/progress");

const ROUTE_PATH = "/api/dsa/progress";

/**
 * Per-instance limit for the read path, not the shared TiDB counter.
 *
 * Same trade-off as `app/api/system-design/state`: the counter costs two
 * statements (approximately 200 RU) to protect a query that costs two, which
 * doubles the bill for no external spend. What is at risk here is CPU, and a
 * per-instance counter is enough for that. The write path keeps the global
 * counter, because it moves points.
 */
const readLimiter = createMemoryRateLimiter(
  getRateLimitConfig(ROUTE_PATH, "GET"),
);

const ProgressSchema = z.object({
  moduleSlug: z.string().min(1).max(120),
  lessonSlug: z.string().min(1).max(120),
});

/**
 * Everything this learner has completed, as `moduleSlug/lessonSlug` keys.
 *
 * Exists so the syllabus and the lesson rail can render ticks without making
 * `/dsa` dynamic. The alternative — reading state in the page loader — would
 * turn 18 statically prerendered routes into per-user renders and put a TiDB
 * query in front of every visit.
 */
export async function GET() {
  return withRequestLog("GET /api/dsa/progress", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const decision = readLimiter(userId);
    if (!decision.allowed) {
      return rateLimited(
        Math.ceil((decision.resetMs - Date.now()) / 1000),
        decision.limit,
        decision.remaining,
        decision.resetMs,
      );
    }

    try {
      const users = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.clerk_id, userId))
        .limit(1);
      if (users.length === 0) return unauthorized();

      const state = await getDsaUserState(users[0].id);
      return NextResponse.json({ lessonsCompleted: state.lessonsCompleted });
    } catch (error) {
      log.error("failed to read dsa progress", error);
      return serverError("Failed to read progress");
    }
  });
}

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

      const { alreadyCompleted } = await markLessonComplete(
        dbUserId,
        lessonKey,
      );

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
