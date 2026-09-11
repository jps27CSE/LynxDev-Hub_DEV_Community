# Profile Module — Production Review (500 Users)

**Date:** 2026-08-24
**Last updated:** 2026-09-03
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
| 1.6 | **`console.info` in production** | Low | **Fixed** | `request-log.ts` now outputs structured JSON in production with request ID, status, duration, and query count. Human-readable in dev. |

### Recommendations

- ~~Merge `loadProfile` and `refreshStats` into one function (fetch profile + enrollment in parallel via `Promise.all`)~~ **Done**
- ~~Add `Cache-Control: private, max-age=30` on GET responses~~ **Done**
- ~~Throttle focus refetch (only refetch if last fetch was >30s ago)~~ **Done**
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
| **`rate_limits` table** | **Fixed** — cron cleanup daily at 3am UTC | Old window rows deleted after 7 days via `/api/cron/cleanup`. Vercel cron configured in `vercel.json`. |

### Recommendations

- ~~Add a periodic cleanup cron for `rate_limits` table (delete rows older than 7 days)~~ **Done**
- Monitor TiDB query count — if profile visits spike, the enrollment query (2 sub-queries) is the bottleneck

---

## 3. Monitoring

| # | Gap | Severity | Detail |
|---|-----|----------|--------|
| 3.1 | **No APM/metrics** | High | **Partially Fixed** | `lib/logger.ts` now outputs structured JSON in production. `lib/request-log.ts` includes request ID, status, duration, query count. Still no external APM (Sentry/Vercel Analytics). |
| 3.2 | **No slow-query alerting** | Medium | `logger.ts:35` warns on queries >250ms but only to `console.warn`. No alerting. A TiDB cold start (10-15s) would go unnoticed. |
| 3.3 | **No user-facing error tracking** | Medium | **Partially Fixed** | `handleSave` now shows toast on failure. Still no Sentry for full client-side tracking. |
| 3.4 | **No DB pool monitoring** | Medium | If queue fills up (25 queued), requests fail with a pool error. No metric tracks pool saturation. |
| 3.5 | **No Clerk webhook monitoring** | Low | If Clerk webhooks fail, self-heal retries 3x then shows toast. No server-side alert. |

### Recommendations

- Add Vercel Analytics or lightweight APM (e.g., `@vercel/analytics`)
- Consider Sentry for client-side error tracking (silent `catch` in `handleSave`)
- Log pool saturation events (when `queueLimit` is hit)

---

## 4. Logging

| # | Issue | Severity | Status | Detail |
|---|-------|----------|--------|--------|
| 4.1 | **Unstructured logs** | Medium | **Fixed** | `lib/logger.ts` outputs structured JSON in production (`{"level","scope","msg","time",...}`). Human-readable in dev. |
| 4.2 | **No request ID** | Medium | **Fixed** | `lib/request-log.ts` generates UUID per request. Production logs include `requestId`. Exported `getRequestId()` for downstream use. |
| 4.3 | **PII in logs** | Low | **Fixed** | `lib/enroll-data.ts` masks emails as `j***@example.com` and Clerk IDs as `user_***` in production. `lib/db-rate-limit.ts` masks userId in bucket. |
| 4.4 | **No log levels** | Low | **Fixed** | `lib/logger.ts` now supports `error`, `warn`, `info` levels. Production emits level in JSON. |

### Recommendations

- ~~Switch to structured JSON logging (e.g., `pino` or a simple JSON wrapper)~~ **Done**
- ~~Add a request ID (nanoid) to `withRequestLog` and pass via `X-Request-Id` header~~ **Done**
- ~~Redact emails/userIds from logs in production~~ **Done**

---

## 5. Security

| # | Issue | Severity | Status | Detail |
|---|-------|----------|--------|--------|
| 5.1 | **No input sanitization on bio** | Medium | **Fixed** | Added `z.string().max(2000)` to bio Zod schema. Added `maxLength={2000}` + character counter in UI. |
| 5.2 | **No skills deduplication** | Low | **Fixed** | Added `[...new Set(updates.skills)]` in PATCH handler before saving. |
| 5.3 | **No CSRF protection** | Low | Open | PATCH uses `fetch` with JSON body. Clerk handles auth, but no CSRF token. Low risk since it's API-only. |
| 5.4 | **Avatar URL trust** | Low | Open | `clerkUser.imageUrl` is rendered as `<img src>`. Clerk URLs are trusted, but no `referrerpolicy` or CSP for the image. |
| 5.5 | **Self-healing backfill risk** | Medium | Open | `api/user/route.ts:56-60` backfills `clerk_id` by email match. If two accounts share an email (legacy data), this could claim the wrong account. |
| 5.6 | **GET rate limit easily hit** | Low | **Fixed** | Focus refetch now throttled to 30s cooldown via `lastFetchRef`. Reduces redundant requests from multiple tabs. |
| 5.7 | **Cron route auth bypass** | High | **Fixed** | `/api/cron/cleanup` now validates `CRON_SECRET` exists before comparing. Returns 500 if env var missing. |

### Recommendations

- ~~Add `z.string().max(2000)` to bio field~~ **Done**
- ~~Deduplicate skills server-side: `[...new Set(skills)]`~~ **Done**
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

- ~~**Critical:** Show an error toast on profile save failure (`handleSave` catch block)~~ **Done**
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
| 6 | **Throttle focus refetch** (>30s cooldown) | Reduces unnecessary requests | 10 min | **Done** |
| 7 | **Add `rate_limits` cleanup cron** | Prevents table growth | 30 min | **Done** |
| 8 | **Structured JSON logging** | Production debuggability | 1-2 hrs | **Done** |
| 9 | **Sentry for client errors** | Visibility into silent failures | 30 min | Open |
| 10 | **Request ID in logs** | Correlation | 30 min | **Done** |
| 11 | **PII redaction in logs** | Privacy compliance | 15 min | **Done** |
| 12 | **Cron route auth bypass fix** | Security | 5 min | **Done** |

---

## Appendix — Key Code References

| Concern | File | Line(s) | Status |
|---------|------|---------|--------|
| Profile page (monolith) | `app/(routes)/profile/page.tsx` | 1-357 | Modified |
| Error toast on save | `app/(routes)/profile/page.tsx` | 128-148 | **Added** |
| Merged loadAll (Promise.all) | `app/(routes)/profile/page.tsx` | 40-76 | **Added** |
| Focus refetch (throttled 30s) | `app/(routes)/profile/page.tsx` | 104-114 | **Modified** |
| Bio maxLength + counter | `app/(routes)/profile/page.tsx` | 270-280 | **Added** |
| PATCH update + re-query | `app/api/user/profile/route.ts` | 73-84 | Open |
| Bio validation (max 2000) | `app/api/user/profile/route.ts` | 18 | **Fixed** |
| Skills deduplication | `app/api/user/profile/route.ts` | 65-67 | **Added** |
| Cache-Control header | `app/api/user/profile/route.ts` | 36-38 | **Added** |
| Cache-Control (enroll) | `app/api/enroll/route.ts` | 131-133 | **Added** |
| Rate limits cleanup cron | `app/api/cron/cleanup/route.ts` | 1-35 | **Added** |
| Vercel cron schedule | `vercel.json` | 1-8 | **Added** |
| Self-heal backfill | `app/api/user/route.ts` | 56-60 | Open |
| Enrollment 2-query fetch | `lib/enroll-data.ts` | 97-182 | Open |
| PII masking (email/ID) | `lib/enroll-data.ts` | 11-24 | **Added** |
| Structured JSON logger | `lib/logger.ts` | 1-79 | **Rewritten** |
| Request log + request ID | `lib/request-log.ts` | 1-54 | **Rewritten** |
| PII masking (bucket) | `lib/db-rate-limit.ts` | 84-90 | **Modified** |
| DB pool config | `config/db.tsx` | 15-26 | Reference |
| Rate limit config | `config/rate-limits.ts` | 59-68 | Reference |
| DB retry (1 attempt) | `lib/db-retry.ts` | 47-61 | Open |
| Provider sync (3 retries) | `app/provider.tsx` | 31-54 | Reference |

---

## Changelog

### 2026-09-03 — Round 2 Fixes (6/7 completed)

| Fix | Files Changed |
|-----|---------------|
| Throttle focus refetch (>30s cooldown) | `app/(routes)/profile/page.tsx` |
| `rate_limits` cleanup cron (daily at 3am UTC) | `app/api/cron/cleanup/route.ts`, `vercel.json` |
| Structured JSON logging (prod: JSON, dev: human) | `lib/logger.ts` |
| Request ID in logs (UUID per request) | `lib/request-log.ts` |
| PII redaction (email, userId, bucket) | `lib/enroll-data.ts`, `lib/db-rate-limit.ts` |
| Cron route auth bypass fix (validate CRON_SECRET exists) | `app/api/cron/cleanup/route.ts` |

### 2026-08-24 — Round 1 Fixes (5/12 completed)

| Fix | Files Changed |
|-----|---------------|
| Error toast on profile save failure | `app/(routes)/profile/page.tsx` |
| Bio max length (2000) + character counter | `app/api/user/profile/route.ts`, `app/(routes)/profile/page.tsx` |
| Skills deduplication (`[...new Set()]`) | `app/api/user/profile/route.ts` |
| Merged double profile fetch (`Promise.all`) | `app/(routes)/profile/page.tsx` |
| Cache-Control headers on GET | `app/api/user/profile/route.ts`, `app/api/enroll/route.ts` |

### Remaining

| # | Fix | Effort |
|---|-----|--------|
| 9 | Sentry for client errors | 30 min |
| 1.4 | PATCH return patched values (skip re-query) | 15 min |
| 1.5 | Enrollment query optimization (single query) | 1 hr |
| 5.3 | CSRF token on PATCH | 30 min |
| 5.5 | Self-heal backfill uniqueness check | 15 min |
