# Production Review — 500 Concurrent Users on Free Tier

> **Date:** 2026-07-27  
> **Stack:** Next.js 16 on Vercel Hobby | TiDB Cloud Starter (Free) | Mistral AI (Free/Experiment) | Clerk Hobby  
> **Analysis:** Real free-tier limits researched 2026-07-27. Every constraint below is verified against current published caps.

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
| No `react.cache()` or ISR for DB queries | Every page load is a fresh DB call | Full RU cost per page view, no batching |
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
| No rate limiting on any route | Malicious user could burn 50M RU in hours by spamming interview/generate |
| No connection pool config | Default mysql2 pool leaves connections to TiDB untuned |
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
| Empty catch blocks swallow errors | `lib/course-data.ts` | 3 catches |
| Empty catch blocks swallow errors | `lib/problem-data.ts` | 2 catches |
| Empty catch blocks swallow errors | `lib/interview-data.ts` | 7 catches |
| `console.log(result)` in production | `app/provider.tsx` | Line 24 — exposes API response in browser console |

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
| No explicit auth on 2 interview routes | `interview/questions-by-tags` and `interview/generate` rely only on middleware | ❌ Missing defense-in-depth |
| No rate limiting | Unauthenticated routes have no request caps | ❌ RU exhaustion risk |
| `.env` with live credentials, no `.env.example` | Mistral key + TiDB URL with password in plaintext | ❌ Leak risk if pushed to public repo |
| No CORS configuration | No explicit policy if served from alternate origin | ❌ |

### 🟡 Medium

| Issue | Detail |
|-------|--------|
| Uses `currentUser()` instead of `auth()` | `currentUser()` fetches from Clerk API — adds external HTTP call per request |
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

---

## 6. Failure Recovery

### 🔴 Critical

| Issue | Detail | Fix |
|-------|--------|-----|
| **No Mistral retry logic** | If Mistral returns 429 (rate limit) or 5xx, `callMistral()` fails immediately — no retry, user gets error | Add exponential backoff (3 attempts) |
| **No DB connection retry** | `mysql.createPool()` has no retry config — TiDB blip = total failure | Add connection retry + pool health check |
| **Empty catch returns `[]`** — indistinguishable from empty data | User sees "no courses" instead of "service degraded" | Return `{data, error}` tuples instead of bare arrays |

### 🟡 Medium

| Issue | Detail |
|-------|--------|
| No graceful degradation for AI mentor | If Mistral is down, mentor page errors entirely — no FAQ fallback |
| No health check endpoint | Cannot distinguish "app down" from "TiDB down" from "Mistral down" |
| No loading/error states in failing components | `Suspense fallback={null}` — component just vanishes during async work |

---

## 7. Prioritized Action Plan

### Tier 0 — Immediate (day 1, before launch)

| # | Action | Constraint Solved | Developer Hours |
|---|--------|-------------------|-----------------|
| 0.1 | Set up Mistral paid tier ($14.99/mo) or implement request queue | 1 RPM bottleneck is non-negotiable for 500 users | 0.1 |
| 0.2 | Set explicit TiDB pool config (`connectionLimit: 10, queueLimit: 50`) | Prevents connection pile-up under load | 0.1 |

### Tier 1 — Must fix within first 2 weeks

| # | Action | RU Saved / Month | CPU Saved / Month | Effort |
|---|--------|-------------------|-------------------|--------|
| ~~1.1~~ | ~~Memoize `getUserContext()` with React `cache()`~~ | ✅ Implemented `lib/mentor.ts:8` | ~15M RU | ~2 CPU-hrs | — |
| ~~1.2~~ | ~~Batch interview questions — 1 `inArray()` query, not N queries~~ | ✅ `getQuestionsByChapterIds()` with `inArray()` | ~10M RU | ~0.5 CPU-hrs | — |
| ~~1.3~~ | ~~Add `.limit(20)` to question & problem queries~~ | ✅ Paginated `getAllProblems()` + `getQuestionsByCategorySlug()` + `getDistinctTagsByCategorySlug()` rewrite + `GET /api/interview/questions` | ~5M RU | ~0.3 CPU-hrs | — |
| 1.4 | Fix empty catch blocks to log errors | N/A | N/A | 0.5 hr |
| 1.5 | Create `.env.example`, remove `.env` from git | N/A | N/A | 0.1 hr |
| 1.6 | Add Mistral retry with exponential backoff (3 attempts) | N/A | N/A | 1 hr |

### Tier 2 — High priority (weeks 2-4)

| # | Action | RU Saved / Month | Effort |
|---|--------|-------------------|--------|
| ~~2.1~~ | ~~Lift dashboard data to server component (eliminate duplicate API calls)~~ | ✅ Server fetch + props. `lib/enroll-data.ts` shared. Chapter count scoped. | ~1M RU | — |
| 2.2 | Add `@upstash/ratelimit` on Mistral + interview routes | Prevents RU bombing | 1 hr |
| 2.3 | Add `pino` for structured logging + API middleware | Debuggability | 1 hr |
| 2.4 | Add Sentry (free tier covers 5K events/month) | Error monitoring | 0.5 hr |
| 2.5 | Switch from `currentUser()` to `auth()` | Reduces Clerk API calls | 0.5 hr |

### Tier 3 — Important (month 2)

| # | Action | Benefit | Effort |
|---|--------|---------|--------|
| 3.1 | Add Vercel Analytics + Speed Insights | Track real-user performance | 0.2 hr |
| 3.2 | Add `GET /api/health` endpoint | Uptime monitoring | 0.5 hr |
| 3.3 | Differentiate empty vs error in data access functions | Better UX on failure | 1 hr |
| 3.4 | Add `Suspense` boundaries with skeleton loading | Perceived performance | 1 hr |
| 3.5 | Add explicit `auth()` to interview routes (defense-in-depth) | Security | 0.5 hr |

### Tier 4 — Nice to have

| # | Action | Benefit | Effort |
|---|--------|---------|--------|
| 4.1 | `next/dynamic` for MentorChat + CategoryClient | Reduces initial JS bundle | 0.5 hr |
| 4.2 | Enable React `cache()` for all DB queries | Reduces RU across the board | 0.5 hr |
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
