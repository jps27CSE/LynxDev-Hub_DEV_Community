# Production Review — Dashboard Module (target: 500 users)

> **Date:** 2026-08-04
> **Scope:** `app/(routes)/dashboard/page.tsx`, its 6 components, `lib/enroll-data.ts`, `config/db.tsx`, `middleware.ts`, `lib/rate-limit.ts`, `config/rate-limits.ts`, `config/schema.tsx`

**Verdict:** functionally solid and auth-safe, but not yet production-hardened. The two biggest risks are (1) a single TiDB hiccup takes down the dashboard for **all** users, and (2) zero observability means you'll never know why. 500 users is small — every issue below is about **bursts and incident response**, not raw throughput.

> **Update (2026-08-04):** Batch 1 (resilience + query reduction) implemented — see [Implementation Status](#batch-1-implementation-status) and the updated fix lists below. Remaining items: Upstash rate limiting, Sentry/Analytics. `chapter_count` denormalization shipped 2026-08-05.

---

## Batch 1 Implementation Status

**Shipped — resilience + query reduction (zero external dependencies):**

- `app/(routes)/dashboard/error.tsx` + `loading.tsx` — error boundary with retry button; content-matched skeleton shell
- `app/(routes)/dashboard/_components/skeletons.tsx` — shared, content-shaped skeletons used by both `loading.tsx` and the per-section `<Suspense>` fallbacks (identical markup, no layout jump)
- `lib/dashboard-stats.ts` — `unstable_cache`-wrapped stat counts (mirrors `lib/interview-data.ts` pattern: tag `dashboard-stats`, 1h TTL, version-keyed)
- `InterviewStats` — 3 → 2 queries (`Promise.all`), fail-soft `—` fallback
- `ProblemStats` — 4 → 1 grouped query (`GROUP BY difficulty`), fail-soft
- `lib/enroll-data.ts` — exported `getUserByEmail()`; DB errors now logged with context and rethrown (silent `[]` only for the genuine "no user" case)
- `WelcomeBanner`, `EnrolledCourses`, `DailyTip` — all Server Components (props-only; deterministic tip by day-of-year)
- `dashboard/page.tsx` — user detail server-fetched once (deduped via react `cache()`), `Promise.all`, 3 Suspense boundaries → **~3 queries/load in steady state** (stats cached)
- `app/api/enroll/route.ts` — GET returns consistent `{ error }` 500 on DB failure instead of a misleading `[]`

**Self-review follow-ups (same session):**
- `profile/page.tsx` hardened against the new `{ error }` 500 shape (`Array.isArray` guard)
- `WelcomeBanner` name now trimmed (`name?.trim() || "Developer"` — seed writes `" "` when Clerk fullName is null)
- `skills` validated at runtime with an `isStringArray` type guard (JSON column cast was a render-crash risk)
- Types renamed `InterviewStats` → `InterviewStatsData`, `ProblemStats` → `ProblemStatsData` (collided with component names)

**Deferred (needs external accounts / separate sessions):**
- Upstash rate limiting — the AI-endpoint cost-abuse vector remains open
- Sentry + Vercel Analytics — zero observability remains
- `chapter_count` column on `courses` — ✅ done (2026-08-05): migration `drizzle/0003`, seed writes it, `config/backfill-chapter-count.ts` for existing rows, `enroll-data.ts`/`courses/page.tsx`/`mentor.ts` read the column
- Provider `POST /api/user` scoping — intentionally kept (`LessonClient` depends on `setUserDetail`)
- `currentUser()` → `auth()` + session claims — deferred to the webhook/email-join work (claim-staleness trade-off)
- Page `metadata` + middleware matcher trim

**Status:** `npm run typecheck` and Prettier clean. Manual `npm run dev` verification pending (no `.env.local` in the working environment).

---

## 1. Performance

| Severity | Issue | Evidence |
|---|---|---|
| **High** | 10 DB queries per dashboard load, all sequential: `InterviewStats` (3 counts), `ProblemStats` (4 counts), `getEnrollmentsByEmail` (3 queries) | `InterviewStats.tsx:9-18`, `ProblemStats.tsx:8-23`, `enroll-data.ts:27-57` |
| **High** | The 7 stat-card counts are **static seed data that never changes**, yet run on every render for every user. No caching. | `InterviewStats.tsx`, `ProblemStats.tsx` |
| Medium | Full-page TTFB = sum of all queries. No `loading.tsx`, no `Suspense`, no `error.tsx` in the route | `glob "app/**/{loading,error}.tsx"` → none found |
| Medium | React `cache()` in `enroll-data.ts:24` dedupes only **within a single render pass** — it does not cache across requests. It's not load-bearing here. | `enroll-data.ts:24` |
| Low | Hydration mismatch risk: `DailyTip` renders `tips[0]` on server, random tip on client (`DailyTip.tsx:16-20`). Extra client JS for zero benefit. | `DailyTip.tsx:1-21` |
| Low | `EnrolledCourses` is `"use client"` with no interactivity (only `Link`s) — could be a Server Component. | `EnrolledCourses.tsx:1` |

### Suggestions
- Wrap the 7 stat counts in `unstable_cache` revalidated after seed runs (`next: { tags: ["stats"] }`), or better: fold them into seed-time config — they're constants.
- Cut 10 queries → ~3 per load: `Promise.all` the page's fetches, combine counts into 1–2 SQL statements, and drop the `chapters` groupBy query (`enroll-data.ts:50-57`) by adding a `chapter_count` column on `courses` (denormalized at seed time).
- Add `loading.tsx` + `Suspense` around stat cards so the page streams.
- Compute the tip server-side (index by date) and make `DailyTip` a Server Component — removes the mismatch and a client chunk.

## 2. Scaling (500 users)

| Severity | Issue | Evidence |
|---|---|---|
| **High** | **In-memory rate limiter in middleware is ineffective on serverless.** Vercel runs many isolated instances; the `Map` (`rate-limit.ts:3`) isn't shared, and middleware instances are ephemeral. Every `/api/mentor/chat` call is a fresh counter → Mistral cost abuse is wide open. | `rate-limit.ts:1-38`, `middleware.ts:26-40` |
| **High** | Pool config: `connectionLimit: 5`, `queueLimit: 25` (`db.tsx:8-9`). At 50 concurrent dashboard loads (~10 queries each = 500 queued acquires), users hit "too many connections in queue" errors → 500s. The dashboard's query count is the bottleneck multiplier. | `db.tsx:8-9` |
| Medium | Nothing about the dashboard is cached across users — every nav to `/dashboard` pays full DB cost. With 500 users × ~3 visits/day ≈ 15k queries/day, fine on TiDB free — but bursts are the risk, not averages. | — |

### Suggestions
- Replace in-memory rate limiting with **Upstash Ratelimit** (free tier) or DB-backed throttling. Protect `/api/mentor/chat` and `/api/interview/generate` first — they burn Mistral tokens per request.
- Keep `connectionLimit: 5` (TiDB free constraint) but reduce per-request queries (see Performance) and set an explicit `acquireTimeout` (~5s) so slow pools **fail fast** instead of queueing the site into a timeout spiral.
- Add `Index: enrollments(user_id, course_id)` — the join + filter in `enroll-data.ts:37-44` benefits at 500+ users (currently implicit FK index only).

## 3. Monitoring

| Severity | Issue |
|---|---|
| **Critical** | **Zero observability.** No Sentry, no Vercel Analytics/Speed Insights, no metrics, no query timing. You cannot answer "is the dashboard slow?" or "did users hit errors yesterday?" |
| High | No DB query latency tracking — when a dashboard feels slow you can't tell if it's the 10 queries, TiDB, or Clerk. |

### Suggestions
- Enable Vercel Analytics + Speed Insights (free).
- Add Sentry on the free tier — its Next.js integration captures both RSC and client errors automatically.
- A ~15-line timing wrapper around `db` (or Drizzle's `logger` option) logging query count/duration per request gives you dashboards for free.

## 4. Logging

| Severity | Issue | Evidence |
|---|---|---|
| **High** | `getEnrollmentsByEmail` **swallows all errors**: `catch { return [] }`. A TiDB outage renders an empty, misleading dashboard and produces zero log lines. Engineers can't distinguish "user has no courses" from "database is down". | `enroll-data.ts:81-83` |
| High | No structured logging anywhere in the module (no pino/winston; no consistent `console.error` pattern). | — |

### Suggestions
- Log with context in the catch: `console.error("[enroll-data] query failed", { email, error })` (pino when you outgrow it). Only return `[]` for the genuine "no user/no rows" case; let real failures propagate to an error boundary.
- Define one small `lib/logger.ts` now — every route copies the pattern later.

## 5. Security

| Severity | Finding |
|---|---|
| OK | Auth is correct: middleware `auth.protect()` + `currentUser()` on the page; data is fetched by the session user's email — no IDOR surface on the dashboard itself. |
| **High** | Rate limiting is ineffective per-instance (see Scaling) — the real-world exposure is **cost abuse of the paid AI endpoints**, since the dashboard links straight into them. |
| Medium | Email-join fragility: if Clerk's email casing/spacing differs from `usersTable.email`, the user silently gets an empty dashboard with no error path (`enroll-data.ts:27-33`). The silent catch makes this undebuggable in production. |
| Low | `UserDetailContext` typed `any` (`context/UserDetailContext.tsx:3`) — not dashboard-specific, but flagged since `WelcomeBanner` relies on it. |

### Suggestions
- Fix rate limiting (above) — this is the top security item.
- Consider joining on Clerk `userId` via webhook synced to `usersTable` instead of email (also fixes the case-mismatch class of bugs).
- Surface a "couldn't load your courses" state instead of an empty one.

## 6. Failure Recovery

| Severity | Issue | Evidence |
|---|---|---|
| **Critical** | **No `error.tsx`** for the route, and `InterviewStats`/`ProblemStats` have **no try/catch**. One TiDB blip → 500 for every user hitting the dashboard simultaneously. | `InterviewStats.tsx:8-18`, `ProblemStats.tsx:7-23` |
| High | No `loading.tsx` → long blank page under slow queries (compounds the queue-timeout scenario above). | — |
| Medium | `getEnrollmentsByEmail` degrades "gracefully" but misleadingly; no retry/backoff for transient DB failures; the partial-render path (courses load, stats fail) crashes the whole page instead of degrading per-card. | `enroll-data.ts:81-83` |
| OK | `/api/health` is public and excluded from rate limiting — a minimal health check exists. | `middleware.ts:6-11` |

### Suggestions
- Add `app/(routes)/dashboard/error.tsx` (with retry button) and `loading.tsx` — cheap, immediate blast-radius reduction.
- Make `InterviewStats`/`ProblemStats` fail soft: wrap in try/catch → `null` fallback, and/or render under `Suspense` so one failing card never kills the page.

---

## Prioritized Fix List

| # | Fix | Effort | Status |
|---|-----|--------|--------|
| 1 | `error.tsx` + `loading.tsx` for the dashboard route | ~30 min | DONE — Batch 1 |
| 2 | Cache/eliminate the 7 static stat queries — `unstable_cache` or seed-time config | 1–2 hrs | DONE — `lib/dashboard-stats.ts` (`unstable_cache`, tag `dashboard-stats`, 1h TTL) |
| 3 | Move rate limiting to Upstash — protects AI spend | 2–3 hrs | DEFERRED — needs Upstash account/env vars |
| 4 | Stop swallowing DB errors — log + only return `[]` for true empty cases | ~30 min | DONE — logged + rethrown; `{ error }` 500 on `/api/enroll` GET |
| 5 | Add Sentry + Vercel Analytics | config only | DEFERRED — needs accounts |
| 6 | Reduce per-load queries via `Promise.all` + `chapter_count` denormalization | 2–3 hrs | DONE — `Promise.all` + Suspense; `chapter_count` column added (fix in `drizzle/0003`), seed/backfill scripts, `enroll-data.ts` + `courses/page.tsx` + `mentor.ts` all read the column |
| 7 | Fix `DailyTip` hydration and server-ify `EnrolledCourses` | ~30 min | DONE — `WelcomeBanner` also server-ified |

---

# Next.js Senior Review — Dashboard Module

> Reviewed 2026-08-04 — Server Components, streaming, caching, middleware/Edge, hydration, bundle

## 1. Server/Client component boundary (the headline issue)

```
page.tsx          → Server ✓
InterviewStats    → Server ✓
ProblemStats      → Server ✓
QuickLinks        → Server ✓
WelcomeBanner     → Client ✗  (needs only useUser + context — both replaceable by server props)
EnrolledCourses   → Client ✗  (zero interactivity, only <Link>s)
DailyTip          → Client ✗  (zero interactivity, Math.random in effect)
```

3 of 7 components carry `"use client"` for no interactivity. This is pure serialized JS added to the dashboard route's bundle (`_next/static` → shipped to 500 users) with no runtime benefit. `WelcomeBanner.tsx:15-16`, `EnrolledCourses.tsx:1`, `DailyTip.tsx:1`.

**Fix:** the page already calls `currentUser()` server-side (`page.tsx:10`) — pass `name`/`email` down as props and server-fetch points/skills in `page.tsx`, eliminating the client `useUser()` plus the `UserDetailContext` coupling in `WelcomeBanner.tsx:16-20`.

## 2. Duplicate user fetch: server + client per dashboard load

The page looks up the DB user via `getEnrollmentsByEmail` (`enroll-data.ts:27-33`) **and** the root `Provider` fires `POST /api/user` on every mount (`provider.tsx:20-23`), which does its own full user lookup/upsert (`api/user/route.ts:15-33`). Two DB round-trips for the same user, and the banner's point/skill numbers only appear **after** hydration + API round-trip → visible layout shift in `WelcomeBanner`.

**Fix:** single server-side user fetch in `page.tsx`, pass points/skills as props. `Provider`'s client sync should be restricted to the auth *creation* path, not every navigation.

## 3. Data fetching: sequential waterfall, zero streaming

Without `Suspense`, the RSC renderer awaits each async child in order → `page.tsx` → `getEnrollmentsByEmail` (3 queries) → `InterviewStats` (3) → `ProblemStats` (4) execute **sequentially**, TTFB = sum of all 10. No `loading.tsx` exists anywhere in the route (confirmed `glob app/**/{loading,error}.tsx` = none).

**Fix (the big qualitative win):** wrap each card in `<Suspense fallback={<Skeleton/>}>` — overlapping query execution, shell streams instantly, and a DB stall can't block the whole page. Classic React 19 `use(promise)` pattern, fully supported in Next 16.

## 4. Caching strategy: the codebase already has the pattern — the dashboard just doesn't use it

`lib/interview-data.ts:29` already wraps queries in `unstable_cache` with a version key. The dashboard has **zero** caching: the 7 stat-card counts are constants (seed data) re-counted per user per visit. Fix: wrap stat counts in `unstable_cache` (or lift to seed-time config) — matches the existing codebase pattern, DRY.

Note react `cache()` (`enroll-data.ts:24`) only dedupes in-flight within one request — not across requests. It's doing the right job; it's just not a cache.

## 5. Routing/rendering mode

- Correct call: dashboard **should** be `force-dynamic` (personalized); `currentUser()` already opts it out of static anyway. No ISR/`revalidate` needed here.
- **PPR opportunity:** `next.config.ts` has no `experimental.ppr`. With Partial Prerendering (stable-ish in 16), the static shell (QuickLinks, DailyTip) could serve instantly while enrollment data streams. Suspense streaming (item 3) is the 80% of this win; PPR is the remaining polish at 500 users.
- No `metadata` on `dashboard/page.tsx` → falls back to root title "LynxDev HUB" for the app's most-visited page.

## 6. Middleware & Edge runtime

- The in-memory rate limiter (`rate-limit.ts:3`) also **imports into Edge middleware** — a module-level `Map` + `setInterval` (`rate-limit.ts:5-10`) running on serverless Edge isolates. Each isolate has its own store and its own timer; Vercel can freeze/GC idle isolates. Rate limiting is **structurally broken** as deployed — every `/api/mentor/chat` is effectively unlimited across instances → paid-AI cost exposure.
- `clerkMiddleware` runs on **every** RSC prefetch and navigation, adding auth round-trips to all client-side transitions (sidebar nav to/from dashboard). Consider handler-level `auth()` for non-gateway routes and/or trimming the matcher.
- **Fix:** Upstash Ratelimit (Edge-native, free tier) or DB-backed; keep hard auth in handlers, middleware only for redirect routing.

## 7. Hydration & bundle

- `DailyTip.tsx:16-20` initializes to `tips[0]` on both ends (so **no** mismatch error), but swaps content post-hydration → a flash, plus an unnecessary client component. Server-compute the index (e.g., `dayOfYear % tips.length`) and the whole component is static.
- `layout.tsx:34,37` liberally uses `suppressHydrationWarning` — usually fine for themes, but it silently suppresses real mismatch errors site-wide. Revisit.
- No `next/dynamic` needs on this route once the 3 client components go server-side.

## 8. Infrastructure config

- `next.config.ts` is minimal: only YouTube image pattern. No `poweredByHeader: false`, no security headers, no PPR, no `instrumentation`/logging hooks.
- Middleware matcher correctly excludes `_next` and static assets ✓.

---

## Prioritized Next.js action list

| # | Action | Effort | Status |
|---|--------|--------|--------|
| 1 | `Suspense` + skeleton around the 3 dashboard sections; add `loading.tsx` + `error.tsx` | 1 hr | DONE — shared content-shaped skeletons (`_components/skeletons.tsx`) |
| 2 | Convert `WelcomeBanner`/`EnrolledCourses`/`DailyTip` to Server Components | 1 hr | DONE |
| 3 | Server-fetch points/skills once in `page.tsx`; scope `Provider` sync to user creation only | 30 min | PARTIAL — server-fetch done (deduped via react `cache()`); Provider scoping intentionally kept (`LessonClient` needs `setUserDetail`) |
| 4 | `unstable_cache` the stat counts (mirror `lib/interview-data.ts`) | 30 min | DONE — `lib/dashboard-stats.ts` |
| 5 | Upstash rate limiting; move hard auth to handlers | 2–3 hrs | DEFERRED |
| 6 | Add `metadata` to `dashboard/page.tsx`; trim middleware matcher | 30 min | NOT DONE |
| 7 | (Optional) enable PPR in `next.config.ts` | 30 min | NOT DONE |
