# Production Review — 500 Concurrent Users on Free Tier

> **Date:** 2026-07-27  
> **Stack:** Next.js 16 on Vercel Hobby | TiDB Cloud Starter (Free) | Mistral AI (Free/Experiment) | Clerk Hobby  
> **Analysis:** Real free-tier limits researched 2026-07-27. Every constraint below is verified against current published caps.

> **Update (2026-07-31):** Tier 1 complete — Mistral retry (1.6), `.env.example` (1.5), provider cleanup. Added `GET /api/health` (3.2). **Actual scale is 3-4 active users (max ~100)** — at this level every quota is under ~5% utilization, so Sentry (2.4), pino (2.3), and UptimeRobot were deliberately deferred (see Tier 2/3). 2.5 (`currentUser()` → `auth()`) reassessed — naive swap is impossible (see note in Tier 2).

---

## Free Tier Limits Reference

### TiDB Cloud Starter (Free — no credit card)

| Resource | Free Cap | Notes |
|----------|----------|-------|
| Concurrent connections | **400** (5,000 with spending limit) | Per-instance. Well above 500-user needs if pooled properly |
| Row storage | 5 GiB | ~25M rows of typical interview data — plenty for seed data |
| Request Units (RUs) | **50 million / month** | **HARD BOTTLENECK** — complex queries burn RUs fast |
| Memory per query | 256 MiB | Large JOINs or unbounded queries hit this and slow down |
| Quota exceeded | Connections denied, existing throttled | App goes read-only or fails open until reset |

### Vercel Hobby (Free)

| Resource | Free Cap | Notes |
|----------|----------|-------|
| Function invocations | **1,000,000 / month** | ✅ Adequate for 500 users at ~130K invocations/month |
| Bandwidth | **100 GB / month** | ⚠️ Tight — ~75 GB estimated at moderate usage |
| Active CPU time | **4 CPU-hours / month** | ⚠️ **HARD BOTTLENECK** — estimated ~7 CPU-hours needed |
| Function timeout | 60 seconds | ✅ OK for current routes (streaming mentor may hit this) |
| Concurrent builds | 1 | ✅ Fine for single-dev workflow |
| Commercial use | **Not allowed** | ⚠️ Personal/non-commercial only |

### Clerk Hobby (Free)

| Resource | Free Cap | Notes |
|----------|----------|-------|
| Monthly Retained Users | **50,000 MRU** | ✅ 500 users is 1% of this — zero concern |
| Organizations | 100 | ✅ Fine |
| Session lifetime | 7 days | ✅ Acceptable for MVP |
| Log retention | 1 day | ⚠️ Debugging outages is harder |

### Mistral AI (Free/Experiment Tier)

| Resource | Free Cap | Notes |
|----------|----------|-------|
| Requests per minute | **1 RPM** | **🔴 CRITICAL BOTTLENECK** — only 1 user/minute can chat |
| Token throughput | 500,000 tokens/min | ✅ Fine at 1 RPM |
| Monthly tokens | ~1 billion | ✅ Fine if RPM wasn't the blocker |
| Available models | Mistral 7B, Mixtral 8x7B | Smaller models than paid tier |
| Data training opt-out | Required manually | ⚠️ Sensitive inputs may train Mistral models |

---

## 1. Performance

### 🔴 Critical

| Issue | Evidence | RU Impact | Fix Priority |
|-------|----------|-----------|-------------|
| ~~**N+1 in mentor context**~~ | ✅ Batched with `inArray()` — reduced from 10 to 4 queries per `getUserContext()` call (`lib/mentor.ts:25-47`). | ~400 RU per mentor message (was 850). 500 users × 5 msg/day = ~1M RU/day (was 2.1M) | **Tier 1** |
| ~~**N+1 in interview category page**~~ | ✅ `getQuestionsByChapterIds()` batches all chapters into 1 `inArray()` query. 1 query instead of 5-8. | ~150 RU per view (was 700) | **Tier 1** |
| ~~**No pagination** on question & problem queries~~ | ✅ `getQuestionsByCategorySlug()`, `getAllProblems()`, `getDistinctTagsByCategorySlug()` all paginated. Problems page: 20/page with server-side filters. Practice page: progressive prefetch. Tag extraction: direct query. | ~5M RU/month saved | **Tier 1** |
| ~~**Duplicate dashboard API calls**~~ | ✅ Server component fetches once, passes as props. No more duplicate `GET /api/enroll`. | ~1,200 RU/day saved | **Tier 2** |

### 🟡 Medium

| Issue | Detail | RU Impact |
|-------|--------|-----------|
| ~~`getUserContext()` re-queried on every mentor POST~~ | ✅ Memoized with React `cache()` per request `lib/mentor.ts:8` | Resolved — single query per request regardless of call count |
| ~~No `react.cache()` or ISR for DB queries~~ | ✅ All 15 DB query functions wrapped with React `cache()` across `lib/course-data.ts`, `enroll-data.ts`, `interview-data.ts`, `problem-data.ts` | Deduplicates queries within same request — reduces duplicate page load cost |
| No dynamic imports | MentorChat (460 lines) + CategoryClient (464 lines) eager-loaded | Not an RU concern, but impacts TTFB and CPU time |

### 🟢 Quick Wins (under 1 hour each)

| Fix | RU Saved / Month |
|-----|-----------------|
| ~~Batch `getQuestionsByChapterId()` into 1 `inArray()` query~~ | ✅ Implemented `lib/interview-data.ts` — `getQuestionsByChapterIds()` |
| ~~Memoize `getUserContext()` per request with React `cache()`~~ | ✅ Implemented `lib/mentor.ts:8` |
| ~~Add `.limit(20)` to question/problem queries~~ | ✅ Implemented — paginated `getAllProblems()`, `getQuestionsByCategorySlug()`, direct tag query |
| ~~Lift dashboard data to server component~~ | ✅ `dashboard/page.tsx` fetches via `getEnrollmentsByEmail()`, passes `EnrolledCourse[]` as prop. Updated `EnrolledCourses.tsx`, `WelcomeBanner.tsx`. Chapter count scoped to enrolled courses only via `inArray()`. | ~1M RU |

---

## 2. Scaling

### Where you'll actually hit limits first

```
500 users → 30 days from cold start:
┌─────────────────────────────────────────────────┐
│  Day 1-5:  Everything works                     │
│  Day 6-10: Mistral 1 RPM starts queuing users   │
│  Day 11-20: TiDB RU runs out → DB throttled     │
│  Day 21-30: Vercel CPU limit hit → 504 errors   │
└─────────────────────────────────────────────────┘
```

### 🔴 Critical

| Constraint | Actual Limit | When You Hit It | Mitigation |
|------------|-------------|-----------------|------------|
| **Mistral RPM (1 req/min)** | 1,440 requests/day | **Day 1** — 500 users wanting 5 chats/day = 2,500 requests/day. Impossible. | Upgrade to paid tier OR implement queue + offline responses |
| **TiDB RUs (50M/month)** | ~50M RU/month | **~Day 14-18** at current query efficiency | Batch queries, cache aggressively, reduce N+1s |
| **Vercel CPU (4 CPU-hrs/month)** | 14,400 CPU-seconds | **~Day 18-22** | Reduce function complexity, add caching, move heavy work to edge |
| **Vercel bandwidth (100 GB)** | 100 GB/month | **~Day 25-28** | Optimize images, compress responses, add CDN caching |

### 🟡 Medium

| Issue | Risk |
|-------|------|
| ~~No rate limiting on any route~~ | ✅ DB-backed, handler-level rate limiting — `lib/db-rate-limit.ts` + `rate_limits` table (`config/schema.tsx`), global across serverless instances, fail-closed atomic upsert. Limits from `config/rate-limits.ts`: 10 req/min `generate`, 5 req/min `mentor/chat`, 20 req/min default. Middleware is auth-only. |
| ~~No connection pool config~~ | ✅ Explicit pool config in `config/db.tsx` — `connectionLimit: 5`, `queueLimit: 25`, `idleTimeout: 30s`, keep-alive enabled. Prevents connection pile-up and detects dead connections. |
| ~~256 MiB query memory limit~~ | ✅ Mitigated — `getAllProblems()` and `getQuestionsByCategorySlug()` now return 20 rows. `getDistinctTagsByCategorySlug()` returns tags only. Reduced to ~0.75KB per query. |

---

## 3. Monitoring

### 🔴 Critical

| Gap | Where | Impact |
|-----|-------|--------|
| **No RU tracking** | No visibility into TiDB RU consumption per query | Can't predict when quota will run out |
| **No error logging** | `catch { return [] }` in `lib/course-data.ts`, `lib/problem-data.ts`, `lib/interview-data.ts` (12 empty catches total) | Errors silently swallowed — no way to debug production issues |
| **No structured logging** | No `pino`/`winston` installed | Can't correlate errors, traces, or performance data |
| **No APM** | No Sentry, Datadog, OpenTelemetry | Zero insight into which queries are slow under load |

### 🟡 Medium

| Gap | Detail |
|-----|--------|
| No request/response logging middleware | Can't measure endpoint latency, error rates, or usage patterns |
| No client-side error reporting | React Error Boundaries exist but don't report anywhere |
| No uptime monitoring | Can't detect when TiDB or Mistral goes down — users just see errors |
| No Vercel Analytics or Speed Insights | No insight into real-user performance data |

---

## 4. Logging

### 🔴 Critical

| Issue | Files | Lines |
|-------|-------|-------|
| ~~Empty catch blocks swallow errors~~ | ✅ All 14 catches fixed — `console.error("[module] fn:", error)` added. Interview API route catches (`questions`, `questions-by-tags`, `generate`) also log via `console.error("[interview/<route>] METHOD:", error)` | `lib/course-data.ts` (3), `lib/problem-data.ts` (3), `lib/interview-data.ts` (8), `app/api/interview/*` (3) |
| ~~`console.log(result)` in production~~ | ✅ Removed from `app/provider.tsx` — `CreateNewUser` now catches failures: `console.error("[provider] CreateNewUser:", error)` + sonner error toast | — |

### 🟡 Medium

| Issue | Detail |
|-------|--------|
| No log levels (info/warn/error) | All logging would be unstructured |
| No correlation IDs | Cannot trace a single user request across the system |
| No API route logging middleware | Each route handles errors independently, nothing is aggregated |

---

## 5. Security

### 🔴 Critical

| Issue | Detail | Status |
|-------|--------|--------|
| ~~No explicit auth on interview routes~~ | ✅ `auth()` + `unauthorized()` 401 guard in all 3 interview routes (`questions`, `questions-by-tags`, `generate`) — handler-level JWT verification, defense-in-depth | ✅ Fixed |
| ~~No rate limiting~~ | ✅ DB-backed rate limiting — `lib/db-rate-limit.ts` + `rate_limits` table, atomic `INSERT ... ON DUPLICATE KEY UPDATE` + `LAST_INSERT_ID` upsert, fail-closed, global across instances (survives the old per-instance in-memory `Map` problem). 10 req/min on `generate`, 5 req/min on `mentor/chat`, 20 req/min default | ✅ Mitigated — RU bombing risk contained |
| ~~`.env` with live credentials, no `.env.example`~~ | ✅ Mitigated 2026-07-31 — `.env` confirmed git-ignored (`.env*` pattern + verified via `git check-ignore`); `.env.example` created and un-ignored (`!.env.example`) for safe onboarding | ⚠️ Leak risk contained — remaining risk only if someone force-adds `.env` |
| No CORS configuration | No explicit policy if served from alternate origin | ❌ |

### 🟡 Medium

| Issue | Detail |
|-------|--------|
| Uses `currentUser()` instead of `auth()` | `currentUser()` fetches from Clerk API — adds external HTTP call per request. Reassessed 2026-07-31: swap not feasible without `usersTable.clerk_id` schema (see Tier 2 note 2.5). Deferred |
| No input sanitization beyond Zod | Tags, names, bios stored verbatim — potential XSS in rendered HTML |
| No Mistral data-training opt-out | Free tier may use API inputs for model training by default |

### ✅ Fixed This Sprint

| Issue | Detail |
|-------|--------|
| Zod validation on all 7 API routes | `lib/api-error.ts` + per-route schemas |
| `//@ts-ignore` removed from enroll + progress | Type safety restored |
| `getUserContext()` memoized with React `cache()` | `lib/mentor.ts:8` — duplicate DB queries eliminated per request |
| Paginated problems list | `getAllProblems(limit/offset)` + `getProblemCategories()` + ProblemsClient with URL-driven filters & page nav. 20 per page. |
| Paginated practice questions | `getQuestionsByCategorySlug(limit/offset)` + `getQuestionCountByCategorySlug()` + PracticeClient with progressive prefetch via `GET /api/interview/questions` |
| `getDistinctTagsByCategorySlug` rewritten | Direct `SELECT tags` query instead of loading all question data and extracting in JS |
| Batched interview questions | `getQuestionsByChapterIds()` replaces N per-chapter queries with 1 `inArray()` query. ~10M RU/month saved. |
| Batched mentor context queries | `getUserContext()` `lib/mentor.ts:25-47` — per-enrollment course+chapter loop replaced with 2 `inArray()` batch queries. 4 total queries (was 10 @ 4 courses). ~1.1M RU/month saved. |
| Dashboard duplicate API call fix | Server component fetches once via `getEnrollmentsByEmail()`, passes as props. `WelcomeBanner` + `EnrolledCourses` no longer call `GET /api/enroll`. Shared lib `lib/enroll-data.ts`. |
| Chapter count scoped to enrolled courses | `GROUP BY` on all courses → `inArray()` on enrolled course IDs only. Saves rows per dashboard load. |
| React `cache()` on all 15 DB query functions | Wrapped `getAllCourses`, `getCourseById`, `getChaptersByCourseId`, `getEnrollmentsByEmail`, `getAllCategories`, `getCategoryBySlug`, `getQuestionsByCategorySlug`, `getQuestionCountByCategorySlug`, `getQuestionsByCategorySlugAndTags`, `getDistinctTagsByCategorySlug`, `getChaptersByCategorySlug`, `getQuestionsByChapterIds`, `getAllProblems`, `getProblemCategories`, `getProblemById` — deduplicates per request |
| Rate limiting on all API routes | `lib/db-rate-limit.ts` + `config/rate-limits.ts` + `rate_limits` table. DB-backed, per-user fixed window, global across serverless instances (replaces the removed in-memory middleware limiter). Atomic `INSERT ... ON DUPLICATE KEY UPDATE` + `LAST_INSERT_ID` (TiDB has no `INSERT ... RETURNING`), fail-closed. 10 req/min on `generate`, 5 req/min on `mentor/chat`, 20 req/min default. 429 response with `Retry-After` + `X-RateLimit-*` headers. |
| TiDB connection pool config | `config/db.tsx` — explicit `connectionLimit: 5`, `queueLimit: 25`, `idleTimeout: 30s`, `enableKeepAlive: true`. Replaces mysql2 defaults. Prevents connection pile-up and detects dropped connections. |
| Empty catch blocks log errors | All 14 empty catches in `lib/course-data.ts`, `lib/problem-data.ts`, `lib/interview-data.ts` now log via `console.error("[module] fn:", error)` before returning fallback. |
| `auth()` on all 3 interview routes | `app/api/interview/questions`, `questions-by-tags`, `generate` — handler-level `auth()` + 401 guard via `unauthorized()`. Hoisted above `try` so Clerk throws aren't swallowed as "Failed to fetch" 500s; route catches now log via `console.error("[interview/<route>] METHOD:", error)`. `auth()` is local JWT verification — zero external HTTP (unlike `currentUser()`). Defense-in-depth per Clerk pattern: middleware = routing/rate limiting, handlers = enforcement. |
| Mistral retry w/ exponential backoff | `callMistral()` `lib/mentor.ts` — 3 attempts, 500ms→1s + jitter, retries 408/429/500/502/503/504 + network errors, fail-fast on 4xx (non-retryable errors no longer re-attempted — fixes a bug where 401s were retried 3×), honors `Retry-After` (capped 5s, positive-only), abort-aware `sleep()`. Retry covers the request phase only — mid-stream SSE failures emit an error event (inherent to streaming). |
| `GET /api/health` | `app/api/health/route.ts` — `SELECT 1` via pool with 5s timeout race, timer cleaned in `finally`. `200 {status,db,timestamp}` / `503 {status:"degraded"}`. `/api/health(.*)` added to public matcher in `middleware.ts` so uptime monitors pass auth. Mistral deliberately not probed — health pings would burn the 1 RPM free-tier quota. |
| `.env.example` + `.gitignore` | `.env.example` created with all 9 keys (Clerk ×6, `DATABASE_URL`, `MISTRAL_API_KEY`) + usage comments. `.gitignore` updated: `.env*` stays ignored, `!.env.example` un-ignored so the template is committable. |
| Provider cleanup | `app/provider.tsx` — removed `console.log(result)` (exposed API response in browser console). `CreateNewUser` now catches failures: `console.error("[provider] CreateNewUser:", error)` + sonner error toast. |
| 2.5 reassessed | `currentUser()` → `auth()` is **not feasible as a swap** — all routes need email for DB lookup, `auth()` returns only Clerk `userId`. Real fix = `usersTable.clerk_id` schema change (see Tier 2 note). Deferred — low value at current scale. |

---

## 6. Failure Recovery

### 🔴 Critical

| Issue | Detail | Fix |
|-------|--------|-----|
| ~~**No Mistral retry logic**~~ | ✅ `callMistral()` (`lib/mentor.ts`) retries transient failures — 3 attempts, exponential backoff 500ms→1s + jitter, retries 408/429/5xx + network errors, fail-fast on 4xx, honors `Retry-After` (capped 5s), abort-aware | Add exponential backoff (3 attempts) |
| **No DB connection retry** | `mysql.createPool()` has no retry config — TiDB blip = total failure | Add connection retry + pool health check |
| **Empty catch returns `[]`** — indistinguishable from empty data | User sees "no courses" instead of "service degraded" | Return `{data, error}` tuples instead of bare arrays |

### 🟡 Medium

| Issue | Detail |
|-------|--------|
| No graceful degradation for AI mentor | If Mistral is down, mentor page errors entirely — no FAQ fallback |
| ~~No health check endpoint~~ | ✅ `GET /api/health` (`app/api/health/route.ts`) — `SELECT 1` with 5s timeout race, `200 {status:ok,db:ok}` / `503 {status:degraded}`, exempted from auth in `middleware.ts` for uptime monitors. Mistral deliberately NOT checked (pings would burn 1 RPM free tier). Timer cleaned in `finally` |
| No loading/error states in failing components | `Suspense fallback={null}` — component just vanishes during async work |

---

## 7. Prioritized Action Plan

### Tier 0 — Immediate (day 1, before launch)

| # | Action | Constraint Solved | Developer Hours |
|---|--------|-------------------|-----------------|
| 0.1 | Set up Mistral paid tier ($14.99/mo) or implement request queue | 1 RPM bottleneck is non-negotiable for 500 users | 0.1 |
| ~~0.2~~ | ~~Set explicit TiDB pool config~~ | ✅ `config/db.tsx` — 5 connections, 25 queue, 30s idle, keep-alive on | 0.1 |

### Tier 1 — Must fix within first 2 weeks

| # | Action | RU Saved / Month | CPU Saved / Month | Effort |
|---|--------|-------------------|-------------------|--------|
| ~~1.1~~ | ~~Memoize `getUserContext()` with React `cache()`~~ | ✅ Implemented `lib/mentor.ts:8` | ~15M RU | ~2 CPU-hrs | — |
| ~~1.2~~ | ~~Batch interview questions — 1 `inArray()` query, not N queries~~ | ✅ `getQuestionsByChapterIds()` with `inArray()` | ~10M RU | ~0.5 CPU-hrs | — |
| ~~1.3~~ | ~~Add `.limit(20)` to question & problem queries~~ | ✅ Paginated `getAllProblems()` + `getQuestionsByCategorySlug()` + `getDistinctTagsByCategorySlug()` rewrite + `GET /api/interview/questions` | ~5M RU | ~0.3 CPU-hrs | — |
| ~~1.4~~ | ~~Fix empty catch blocks to log errors~~ | ✅ All 14 catches in `course-data.ts` (3), `problem-data.ts` (3), `interview-data.ts` (8) now log via `console.error("[module] fn:", error)` | N/A | — |
| ~~1.5~~ | ~~Create `.env.example`, remove `.env` from git~~ | ✅ `.env.example` created with all 9 keys + comments; `.env` confirmed git-ignored (`.env*` + `!.env.example` in `.gitignore`) | N/A | — |
| ~~1.6~~ | ~~Add Mistral retry with exponential backoff (3 attempts)~~ | ✅ `lib/mentor.ts` — 3 attempts, 500ms→1s backoff + jitter, retries 408/429/5xx/network, fail-fast on 4xx, `Retry-After` capped at 5s, abort-aware | N/A | — |

### Tier 2 — High priority (weeks 2-4)

| # | Action | RU Saved / Month | Effort |
|---|--------|-------------------|--------|
| ~~2.1~~ | ~~Lift dashboard data to server component (eliminate duplicate API calls)~~ | ✅ Server fetch + props. `lib/enroll-data.ts` shared. Chapter count scoped. | ~1M RU | — |
| ~~2.2~~ | ~~Add `@upstash/ratelimit` on Mistral + interview routes~~ | ✅ Implemented with DB-backed rate limiting — `lib/db-rate-limit.ts` + `rate_limits` table (shipped 2026-08-05/06, replacing the ineffective in-memory middleware limiter). Global across serverless instances, fail-closed, covers all API routes. | Prevents RU bombing | — |
| 2.3 | Add `pino` for structured logging + API middleware | Debuggability | ⏸️ Deferred 2026-07-31 — scale is 3-4 users (max ~100); Vercel logs + `console.error("[module] fn:")` patterns are sufficient. Revisit if unreproducible production bugs appear |
| 2.4 | Add Sentry (free tier covers 5K events/month) | Error monitoring | ⏸️ Deferred 2026-07-31 — 30-min add when real users arrive or a production bug can't be reproduced locally. Skipped for now: adds CPU overhead on the tightest Vercel resource for zero current value |
| 2.5 | Switch from `currentUser()` to `auth()` | Reduces Clerk API calls | ⚠️ **Reassessed 2026-07-31: not feasible as written.** All 7 API routes need the user's *email* to look up the DB user, but `auth()` only returns the Clerk `userId` (JWT, zero HTTP) — no email. Naive swap breaks every route. Only real fix: add `clerk_id` column to `usersTable`, look up by `auth().userId` (schema + migration + backfill + 6 route changes, ~1.5 hrs). Saves ~30K Clerk calls/month at 500 users — negligible vs 1M/mo budget. Skip unless email-change identity robustness is wanted |

### Tier 3 — Important (month 2)

| # | Action | Benefit | Effort |
|---|--------|---------|--------|
| 3.1 | Add Vercel Analytics + Speed Insights | Track real-user performance | 0.2 hr |
| ~~3.2~~ | ~~Add `GET /api/health` endpoint~~ | ✅ `app/api/health/route.ts` — `SELECT 1` + 5s timeout race (timer cleaned in `finally`), `200/503`, public via `middleware.ts` matcher. Pair with UptimeRobot (1h interval) later — deliberately NOT configured now (at 3-4 users, self-detected downtime is fine; 720 pings/mo = 0.07% of invocations when added) | Uptime monitoring | — |
| 3.3 | Differentiate empty vs error in data access functions | Better UX on failure | 1 hr |
| 3.4 | Add `Suspense` boundaries with skeleton loading | Perceived performance | 1 hr |
| ~~3.5~~ | ~~Add explicit `auth()` to interview routes (defense-in-depth)~~ | ✅ All 3 routes: `const { userId } = await auth(); if (!userId) return unauthorized();` hoisted above try/catch — auth failures never masked as data errors | Security | — |

### Tier 4 — Nice to have

| # | Action | Benefit | Effort |
|---|--------|---------|--------|
| 4.1 | `next/dynamic` for MentorChat + CategoryClient | Reduces initial JS bundle | 0.5 hr |
| ~~4.2~~ | ~~Enable React `cache()` for all DB queries~~ | ✅ Implemented — all 15 functions wrapped | — |
| 4.3 | Add CORS configuration | Future-proofing | 0.2 hr |
| 4.4 | Add correlation IDs to request chain | Debugging complex issues | 1 hr |
| 4.5 | Opt out of Mistral data training | Privacy | 0.1 hr |

---

## RU Budget Breakdown (Current vs Optimized)

| Feature | Current RU/request | Requests/day (500 users) | Current RU/day | Optimized RU/request | Optimized RU/day |
|---------|-------------------|------------------------|----------------|--------------------|-----------------|
| Dashboard load | ~600 | 1,500 | 900,000 | ~200 (batched + cached) | 300,000 |
| Interview category | ~700 | 1,000 | 700,000 | ~80 (batched + paginated) | 80,000 |
| Mentor chat (5 msgs) | ~4,250 | 2,500 | 10,625,000 | ~550 (batched + cached) | 1,375,000 |
| Course browsing | ~100 | 1,000 | 100,000 | ~80 | 80,000 |
| Problems | ~50 | 500 | 25,000 | ~20 | 10,000 |
| Profile | ~200 | 500 | 100,000 | ~100 | 50,000 |
| Other (enroll, progress, etc.) | ~300 | 500 | 150,000 | ~150 | 75,000 |
| **Total** | | | **12,600,000** | | **1,970,000** |

| Metric | Current | Optimized |
|--------|---------|-----------|
| Daily RU burn | 12.6M | 1.97M |
| Monthly RU burn | **378M** | **59M** |
| RU budget (free) | 50M | 50M |
| **Days to exhaust** | **~4 days** | **~25 days** |
| Feasible on free tier? | ❌ No | ⚠️ Marginal (needs further optimization + caching) |

---

## Verdict

**With current code, 500 users exhausts the free tier in ~4 days.** The killers are:
1. **Mistral 1 RPM** — 500 users literally cannot chat simultaneously. Paid tier or queue required.
2. **TiDB RU budget** — 50M RU/month runs out in 4 days at current efficiency, ~16 days with optimization
3. **Vercel CPU** — 4 CPU-hours/month runs out around day 18-22

**After Tier 1+2 optimizations, 500 users survives ~16 days on free tier** before RU runs out — still not a full month. To stay on free tier, you'd need either: fewer than ~150 active users, or aggressive caching that reduces RU burn by another 50%+.

**Realistic recommendation:** Upgrade Vercel to Pro ($20/mo, removes CPU limit, 300s timeout) + keep TiDB free (with RU monitoring) + upgrade Mistral to paid tier ($14.99/mo for 20 RPM). Total: ~$35/month for a comfortable 500-user experience.
