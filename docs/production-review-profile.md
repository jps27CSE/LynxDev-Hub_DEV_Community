# Profile Module — Production Review (500 Users)

**Date:** 2026-08-24
**Last updated:** 2026-08-24
**Scope:** Profile page, API routes, data layer, provider sync
**Load assumption:** 500 concurrent users on Vercel Free + TiDB Free

---

## Architecture Overview

```
Browser → GET/PATCH /api/user/profile → Clerk auth() → Drizzle → TiDB
         GET /api/enroll              → Clerk auth() → Drizzle → TiDB (enrollment stats)
         POST /api/user               → Clerk currentUser() → Drizzle (user sync/self-heal)
```

**Files involved:**

| File | Lines | Role |
|------|-------|------|
| `app/(routes)/profile/page.tsx` | 335 | Monolithic client component — fetch, form, save |
| `app/api/user/profile/route.ts` | 83 | GET + PATCH handlers |
| `app/api/user/route.ts` | 79 | POST user sync/self-heal |
| `app/api/enroll/route.ts` | 140 | GET enrollments |
| `lib/enroll-data.ts` | 195 | Cached DB queries with graceful degradation |
| `app/provider.tsx` | 67 | User sync on Clerk mount (retry x3) |

---

## 1. Performance

| # | Issue | Severity | Status | Detail |
|---|-------|----------|--------|--------|
| 1.1 | **Double fetch on mount** | Medium | **Fixed** | Merged `loadProfile` + `refreshStats` into `loadAll` using `Promise.all`. Mount now fires 2 parallel requests instead of 3 sequential. |
| 1.2 | **No caching headers** | Medium | **Fixed** | Added `Cache-Control: private, max-age=30` to `GET /api/user/profile` and `GET /api/enroll`. |
| 1.3 | **Focus refetch fires 2 requests** | Low | **Fixed** | Focus handler now only hits `/api/enroll` (enrollment stats). Profile data not re-fetched on focus. |
| 1.4 | **PATCH does 2 queries** | Low | Open | `profile/route.ts:70-81` runs UPDATE then SELECT to return the updated row. Could return patched values from request body instead. |
| 1.5 | **Enrollment query overhead** | Medium | Open | `GET /api/enroll` → `getEnrollmentsByClerkId` → `fetchEnrollments` runs 2 queries (enrollments + chapters). 500 users = 1000 queries/min. |
| 1.6 | **`console.info` in production** | Low | Open | `request-log.ts:27` logs every request. 500 users × ~3 requests/page = ~1500 log lines/min. Adds to Vercel log costs. |

### Recommendations

- Merge `loadProfile` and `refreshStats` into one function (fetch profile + enrollment in parallel via `Promise.all`)
- Add `Cache-Control: private, max-age=30` on GET responses
- Throttle focus refetch (only refetch if last fetch was >30s ago)
- Return patched values from request body in PATCH instead of re-querying

---

## 2. Scaling (500 Users)

| Constraint | Current | 500-User Impact |
|------------|---------|-----------------|
| **TiDB connection pool** | `connectionLimit: 5`, `queueLimit: 25` | Profile page = 3 queries. 50 concurrent users = 15 queries. Pool handles it, but queue limit (25) is the backstop. |
| **Rate limits** | GET: 20/min, PATCH: 10/min, sync: 10/min | Reasonable. 500 users × 20 GET/min = 10,000 queries/min max. TiDB free tier handles this. |
| **Vercel function duration** | 60s Hobby limit | Profile queries are fast (<100ms). No risk. |
| **Vercel bandwidth** | 100GB/mo | Profile payloads are tiny (~1KB). No risk. |
| **DB row growth** | 500 rows in `users` table | Trivial. `rate_limits` table grows by ~500 rows/week (one per user per scope). Needs periodic cleanup. |
| **`rate_limits` table** | No cleanup cron | Old window rows accumulate. At 500 users × 8 scopes = 4000 rows. Not large, but unbounded growth. |

### Recommendations

- Add a periodic cleanup cron for `rate_limits` table (delete rows older than 7 days)
- Monitor TiDB query count — if profile visits spike, the enrollment query (2 sub-queries) is the bottleneck

---

## 3. Monitoring

| # | Gap | Severity | Detail |
|---|-----|----------|--------|
| 3.1 | **No APM/metrics** | High | No structured metrics for request latency, error rates, or DB query counts. `console.info` logs are unstructured. |
| 3.2 | **No slow-query alerting** | Medium | `logger.ts:35` warns on queries >250ms but only to `console.warn`. No alerting. A TiDB cold start (10-15s) would go unnoticed. |
| 3.3 | **No user-facing error tracking** | Medium | Partially fixed | `handleSave` now shows toast on failure. Still no Sentry for full client-side tracking. |
| 3.4 | **No DB pool monitoring** | Medium | If queue fills up (25 queued), requests fail with a pool error. No metric tracks pool saturation. |
| 3.5 | **No Clerk webhook monitoring** | Low | If Clerk webhooks fail, self-heal retries 3x then shows toast. No server-side alert. |

### Recommendations

- Add Vercel Analytics or lightweight APM (e.g., `@vercel/analytics`)
- Consider Sentry for client-side error tracking (silent `catch` in `handleSave`)
- Log pool saturation events (when `queueLimit` is hit)

---

## 4. Logging

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| 4.1 | **Unstructured logs** | Medium | `console.info`, `console.error`, `console.warn` — no JSON structure. Searching Vercel dashboard at 500 users is painful. |
| 4.2 | **No request ID** | Medium | `withRequestLog` logs label + status + duration, but no unique request ID. Can't correlate client error to server log. |
| 4.3 | **PII in logs** | Low | `enroll-data.ts:38` logs `email`. `db-rate-limit.ts:85` logs `bucket` which contains `userId`. |
| 4.4 | **No log levels** | Low | Everything goes to `console.*`. No way to filter debug vs info vs error in production. |

### Recommendations

- Switch to structured JSON logging (e.g., `pino` or a simple JSON wrapper)
- Add a request ID (nanoid) to `withRequestLog` and pass via `X-Request-Id` header
- Redact emails/userIds from logs in production

---

## 5. Security

| # | Issue | Severity | Status | Detail |
|---|-------|----------|--------|--------|
| 5.1 | **No input sanitization on bio** | Medium | **Fixed** | Added `z.string().max(2000)` to bio Zod schema. Added `maxLength={2000}` + character counter in UI. |
| 5.2 | **No skills deduplication** | Low | **Fixed** | Added `[...new Set(updates.skills)]` in PATCH handler before saving. |
| 5.3 | **No CSRF protection** | Low | Open | PATCH uses `fetch` with JSON body. Clerk handles auth, but no CSRF token. Low risk since it's API-only. |
| 5.4 | **Avatar URL trust** | Low | Open | `clerkUser.imageUrl` is rendered as `<img src>`. Clerk URLs are trusted, but no `referrerpolicy` or CSP for the image. |
| 5.5 | **Self-healing backfill risk** | Medium | Open | `api/user/route.ts:56-60` backfills `clerk_id` by email match. If two accounts share an email (legacy data), this could claim the wrong account. |
| 5.6 | **GET rate limit easily hit** | Low | Open | `GET /api/user/profile` is 20/min, but profile page calls it 2x on mount + on every focus. 50 browser tabs could hit 20/min. |

### Recommendations

- Add `z.string().max(2000)` to bio field
- Deduplicate skills server-side: `[...new Set(skills)]`
- Add a `clerk_id` uniqueness check in self-heal path (if multiple rows match email, don't backfill — flag for manual review)

---

## 6. Failure Recovery

| Scenario | Current Behavior | Gap |
|----------|-----------------|-----|
| **TiDB cold start** | `withConnectRetry` retries once after 3s. | 2 attempts may not be enough for a 10-15s wake. First user sees error. |
| **Clerk outage** | `auth()` throws → `unauthorized()` returned. | No retry. User sees nothing (loading state hangs). |
| **Profile save failure** | `catch {}` — silent. User sees nothing. | **Fixed.** Error toast shown via `sonner` for both network and server errors. |
| **Enrollment fetch failure** | Returns `[]`. Stats show 0 enrolled, 0 completed. | User thinks they have no enrollments. Misleading. |
| **User sync failure** | Retries 3x, then toast error. `userDetail` stays `undefined`. | Components depending on `UserDetailContext` may crash. |
| **Rate limit hit** | Returns 429 with `Retry-After` header. | Client doesn't read `Retry-After`. User retries immediately, gets blocked again. |
| **DB pool exhaustion** | `queueLimit: 25` — 26th request fails immediately. | No retry. A spike (everyone logs in at once) could hit this. |

### Recommendations

- **Critical:** Show an error toast on profile save failure (`handleSave` catch block)
- Add exponential backoff retry for enrollment fetch
- Show a "retry" button when profile/enrollment data fails to load
- Consider a circuit breaker pattern for TiDB (fail fast for 30s on pool exhaustion)

---

## Summary — Priority Fixes for 500 Users

| # | Fix | Impact | Effort | Status |
|---|-----|--------|--------|--------|
| 1 | **Show error toast on profile save failure** | Prevents silent data loss | 5 min | **Done** |
| 2 | **Merge double profile fetch** (loadProfile + refreshStats) | -50% requests on mount | 15 min | **Done** |
| 3 | **Add `max(2000)` to bio validation** | Prevents DB bloat | 2 min | **Done** |
| 4 | **Deduplicate skills server-side** | Clean data | 5 min | **Done** |
| 5 | **Add `Cache-Control: private, max-age=30` on GET** | Reduces redundant DB queries | 10 min | **Done** |
| 6 | **Throttle focus refetch** (>30s cooldown) | Reduces unnecessary requests | 10 min | Open |
| 7 | **Add `rate_limits` cleanup cron** | Prevents table growth | 30 min | Open |
| 8 | **Structured JSON logging** | Production debuggability | 1-2 hrs | Open |
| 9 | **Sentry for client errors** | Visibility into silent failures | 30 min | Open |
| 10 | **Request ID in logs** | Correlation | 30 min | Open |

---

## Appendix — Key Code References

| Concern | File | Line(s) | Status |
|---------|------|---------|--------|
| Profile page (monolith) | `app/(routes)/profile/page.tsx` | 1-343 | Modified |
| Error toast on save | `app/(routes)/profile/page.tsx` | 119-134 | **Added** |
| Merged loadAll (Promise.all) | `app/(routes)/profile/page.tsx` | 39-82 | **Added** |
| Focus refetch (enrollment only) | `app/(routes)/profile/page.tsx` | 84-98 | **Modified** |
| Bio maxLength + counter | `app/(routes)/profile/page.tsx` | 257-266 | **Added** |
| PATCH update + re-query | `app/api/user/profile/route.ts` | 73-84 | Open |
| Bio validation (max 2000) | `app/api/user/profile/route.ts` | 18 | **Fixed** |
| Skills deduplication | `app/api/user/profile/route.ts` | 65-67 | **Added** |
| Cache-Control header | `app/api/user/profile/route.ts` | 36-38 | **Added** |
| Cache-Control (enroll) | `app/api/enroll/route.ts` | 131-133 | **Added** |
| Self-heal backfill | `app/api/user/route.ts` | 56-60 | Open |
| Enrollment 2-query fetch | `lib/enroll-data.ts` | 84-169 | Open |
| DB pool config | `config/db.tsx` | 15-26 | Reference |
| Rate limit config | `config/rate-limits.ts` | 59-68 | Reference |
| Request logging (unstructured) | `lib/request-log.ts` | 27-29 | Open |
| Logger (no levels) | `lib/logger.ts` | 1-41 | Open |
| DB retry (1 attempt) | `lib/db-retry.ts` | 47-61 | Open |
| Provider sync (3 retries) | `app/provider.tsx` | 31-54 | Reference |

---

## Changelog

### 2026-08-24 — Round 1 Fixes (5/10 completed)

| Fix | Files Changed | Commit |
|-----|---------------|--------|
| Error toast on profile save failure | `app/(routes)/profile/page.tsx` | — |
| Bio max length (2000) + character counter | `app/api/user/profile/route.ts`, `app/(routes)/profile/page.tsx` | — |
| Skills deduplication (`[...new Set()]`) | `app/api/user/profile/route.ts` | — |
| Merged double profile fetch (`Promise.all`) | `app/(routes)/profile/page.tsx` | — |
| Cache-Control headers on GET | `app/api/user/profile/route.ts`, `app/api/enroll/route.ts` | — |

### Remaining (Round 2)

| # | Fix | Effort |
|---|-----|--------|
| 6 | Throttle focus refetch (>30s cooldown) | 10 min |
| 7 | `rate_limits` cleanup cron | 30 min |
| 8 | Structured JSON logging (pino) | 1-2 hrs |
| 9 | Sentry for client errors | 30 min |
| 10 | Request ID in logs | 30 min |
