/**
 * Per-instance fixed-window rate limiter.
 *
 * This exists for exactly one route, `app/api/system-design/state`, and for one
 * reason: the DB-backed limiter in `lib/db-rate-limit.ts` costs two TiDB
 * statements per request (`INSERT … ON DUPLICATE KEY` + `SELECT
 * LAST_INSERT_ID`), which is a third of everything that route spends — 200 RU
 * of the ~600 RU an autosave costs. Paying that to protect an endpoint with no
 * external spend is the wrong trade: the resource at risk here is CPU on the
 * instance handling the request, and this counter is per instance.
 *
 * What is given up, stated plainly: the DB counter is global across serverless
 * instances and survives a cold start. This one does not. A client spread over
 * N warm instances gets N × `limit`, and a cold start resets it. That is
 * acceptable for this route and nowhere else in the app — the other limited
 * routes spend money (Mistral, AI generation) and keep the global counter.
 *
 * It is also fail-open by construction: there is no I/O, so a TiDB blip can no
 * longer turn every autosave into a 500.
 */
export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
};

export type MemoryRateLimiter = (
  key: string,
  now?: number,
) => RateLimitDecision;

export function createMemoryRateLimiter({
  limit,
  windowMs,
  maxKeys = 5_000,
}: {
  limit: number;
  windowMs: number;
  maxKeys?: number;
}): MemoryRateLimiter {
  const buckets = new Map<string, { windowStart: number; count: number }>();

  return function check(key, now = Date.now()) {
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const existing = buckets.get(key);
    const count =
      existing && existing.windowStart === windowStart ? existing.count + 1 : 1;

    // Delete-then-set keeps Map insertion order equal to recency, so the
    // eviction below drops the coldest key rather than an arbitrary one. The
    // map is bounded by distinct users, never by request volume.
    buckets.delete(key);
    buckets.set(key, { windowStart, count });
    if (buckets.size > maxKeys) {
      const coldest = buckets.keys().next();
      if (!coldest.done) buckets.delete(coldest.value);
    }

    return {
      allowed: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      resetMs: windowStart + windowMs,
    };
  };
}
