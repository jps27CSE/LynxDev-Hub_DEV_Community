import { db } from "@/config/db";
import { sql } from "drizzle-orm";
import { createLogger } from "@/lib/logger";
import { getRateLimitConfig } from "@/config/rate-limits";
import { rateLimited } from "@/lib/api-error";

const log = createLogger("db-rate-limit");

export type RateLimitScope = "mentor-chat" | "interview-generate";

export type DbRateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

/**
 * Fixed-window rate limit enforced in the shared TiDB table.
 *
 * Unlike the middleware's in-memory limiter (per-Vercel-instance), the counter
 * here is global — it survives across serverless instances. One row per
 * (user, scope): expired windows overwrite in place, so the table stays
 * bounded by distinct users, never by request volume.
 *
 * The increment and the read-back are atomic: the upsert sets LAST_INSERT_ID
 * to the new count and the SELECT reads it back on the same pinned
 * connection. No separate SELECT of the row, so concurrent bursts never read
 * a stale count (each caller gets exactly its own position). This is the
 * MySQL `INSERT ... ON DUPLICATE KEY UPDATE` + `LAST_INSERT_ID` pattern;
 * TiDB serverless has no `INSERT ... RETURNING`.
 *
 * Intentionally fail-closed: if TiDB is unreachable the call throws (→ 500)
 * instead of silently allowing unlimited AI spend.
 */
export async function consumeDbRateLimit(
  userId: string,
  scope: RateLimitScope,
  limit: number,
  windowMs: number,
): Promise<DbRateLimitResult> {
  if (limit <= 0) {
    return { success: false, remaining: 0, reset: Date.now() + windowMs };
  }

  const bucket = `user:${userId}:${scope}`;
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;

  try {
    const count = await db.transaction(async (tx) => {
      await tx.execute(sql`
        INSERT INTO rate_limits (bucket, window_start, count)
        VALUES (${bucket}, ${windowStart}, LAST_INSERT_ID(1))
        ON DUPLICATE KEY UPDATE
          count = LAST_INSERT_ID(
            IF(window_start >= ${windowStart}, count + 1, 1)
          ),
          window_start = IF(
            window_start >= ${windowStart},
            window_start,
            ${windowStart}
          )
      `);

      const rows = await tx.execute(sql`SELECT LAST_INSERT_ID() AS c`);
      const result = rows as unknown as Array<Array<{ c: number }>>;
      return result[0]?.[0]?.c ?? 1;
    });

    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count),
      reset: windowStart + windowMs,
    };
  } catch (error) {
    log.error("consumeDbRateLimit failed", error, { bucket });
    throw error;
  }
}

/**
 * Convenience wrapper for API routes: enforces the configured limit for a
 * path/method and returns the 429 response, or null when the call passes.
 */
export async function enforceDbRateLimit(
  userId: string,
  scope: RateLimitScope,
  pathname: string,
  method: "GET" | "POST" | "PATCH",
): Promise<Response | null> {
  const config = getRateLimitConfig(pathname, method);
  const result = await consumeDbRateLimit(
    userId,
    scope,
    config.limit,
    config.windowMs,
  );
  if (result.success) return null;

  return rateLimited(
    Math.ceil((result.reset - Date.now()) / 1000),
    config.limit,
    result.remaining,
    result.reset,
  );
}
