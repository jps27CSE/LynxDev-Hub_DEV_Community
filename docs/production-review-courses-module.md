# Production Review — Courses Module

> **Date:** 2026-08-16
> **Scope:** Courses module only — `/courses`, `/courses/[id]`, `/learn/[courseId]/[chapterId]`, `/api/enroll`, `/api/progress`, and their lib/schema dependencies.
> **Target:** 500 users on TiDB Cloud Starter (free) + Vercel Hobby (free).
> **Companion doc:** `docs/production-review-500-users.md` (app-wide review, 2026-07-27).

> **Update (2026-08-16):** Improvements #1 and #2 implemented.
> - #1: `getAllCourses`, `getCourseById`, `getChaptersByCourseId` cached via `unstable_cache` (`COURSE_CACHE_VERSION = 1`, tag `"courses"`, **`ttl: false`** — indefinite, version-bump is the only invalidation) using the try → cache → catch pattern from `lib/dashboard-stats.ts`. Failures are never cached. New lean `getChaptersMetaByCourseId` (no lesson content JSON) powers the enroll + progress routes. `CourseRow`/`Chapter` types derive from the schema via `$inferSelect`.
> - #2: catalog page uses `getAllCourses()` — the last raw-query page is gone.
> - **Post-review hardening:** `parsePositiveInt` (`lib/parse-id.ts`) rejects `"1.5"`/`"1abc"`/`<= 0` ids on both course pages (no junk cache keys); progress route validates `chapterId` belongs to the course **before** awarding points (phantom-id points inflation closed — was +600 pts/hr at the 10/min rate limit).

> **Update (2026-08-17):** Improvements #3 and #5 implemented.
> - #3: lesson code execution swapped from main-thread `eval()` to the sandboxed `runJavaScript()` worker (`lib/editor.ts:14`, 5s timeout) in `LessonClient.tsx`. Run button gets spinner + disabled-while-running state; output panel styles via `runError` state instead of string-sniffing. Infinite loops now return a timeout message instead of freezing the tab; self-XSS vector (eval + localStorage code) closed.
> - #5: `EnrollButton.tsx` silent `catch {}` replaced with `toast.error("Enrollment failed. Please try again.")`; success path toasts `toast.success(...)`. Failed enrollment no longer looks like success.

> **Update (2026-08-17):** Improvement #4 implemented.
> - #4: `loading.tsx` + `error.tsx` added to `/courses`, `/courses/[id]`, and `/learn/[courseId]/[chapterId]` (6 files). Skeletons mirror the dashboard pattern (shared `Skeleton` primitive, hero/card-grid/timeline/split-pane shapes); errors use a new shared `components/PageError.tsx` (icon + title + `reset()`), keeping failures segment-local. No more blank TTFB on slow DB or full-page blowups.

**Bottom line:** the module is in better shape than the rest of the app (React `cache()`, batched enrollment queries, single-transaction progress, global DB-backed rate limits, tuned pool — all already applied). It is **not** the bottleneck at 500 users — mentor chat is. The dominant cost driver — **zero cross-request caching for 100%-static seed content** — is now fixed (items #1-2), cutting the module's ~20M RU/month burn to **~6M/month** (~12% of the 50M free budget). Items #3-5 (worker sandbox, enroll toasts, loading/error states) are done as of 2026-08-17. Remaining course-module risks are telemetry (#6-7) and stale docs (#10).

---

## 1. Performance

| Sev | Finding | Evidence |
|-----|---------|----------|
| 🔴 | ~~**No cross-request caching.** Every catalog/detail/learn render re-queries TiDB.~~ ✅ **Fixed 2026-08-16** — all course queries wrapped in `unstable_cache` via `createContentCache` (`lib/course-data.ts`), **`ttl: false`** (indefinite, version-bump invalidation). Courses/chapters are immutable seed data — perfect cache candidates. | ~~`lib/course-data.ts:46,59,75`~~ → `lib/course-data.ts:55-136` — React `cache()` dedupes per request, `unstable_cache` across requests |
| 🔴 | ~~**Learn page = biggest RU burner**: 3+ fresh queries per render (course + all chapters + enrollments) at ~2,000 renders/day → ~12M RU/month.~~ ✅ Caching kills this — course + chapters served from cache after first visit; only per-user enrollments hit TiDB. | `app/(routes)/learn/[courseId]/[chapterId]/page.tsx:18-19` |
| 🟡 | ~~`courses/page.tsx` bypasses the cached `getAllCourses()` with a raw `db.select()` — duplicated logic, uncached.~~ ✅ **Fixed 2026-08-16** — uses `getAllCourses()`; unused `db`/`courses`/`eq`/`asc` imports removed; dead `chapter_count || 0` removed. | `app/(routes)/courses/page.tsx:34` |
| 🟡 | ~~Main-thread `eval(code)` — a freeze/critical stall risk and an unsafe execution path.~~ ✅ **Fixed 2026-08-17** — lesson Run now uses the sandboxed worker `runJavaScript()` (`lib/editor.ts:14`, 5s timeout); infinite loops → "Execution timed out" instead of tab freeze. | ~~`LessonClient.tsx:61`~~ → `LessonClient.tsx:51-65` |
| 🟡 | ~~No `loading.tsx`/`error.tsx` in `courses/` or `learn/` — synchronous Server Components → blank TTFB on slow DB. Dashboard has both.~~ ✅ **Fixed 2026-08-17** — both added to all three segments; shared `PageError.tsx` for fallbacks. | route dirs → `courses/{loading,error}.tsx`, `courses/[id]/*`, `learn/[courseId]/[chapterId]/*` |
| 🟡 | `currentUser()` external Clerk HTTP per render — also **forces dynamic rendering**, limiting caching benefits. | `courses/page.tsx:42` |
| ✅ | Enrollment data: 2 batched queries (no N+1), progress route: single transaction, idempotent, atomic. | `lib/enroll-data.ts:64-91`, `app/api/progress/route.ts:56-138` |

**RU math (500 users, 30 days):** catalog ~3M + learn ~12M + enroll/progress ~4.5M + dashboard's enrollment share ~9M ≈ **~28M RU/month combined**. Caching courses+chapters cuts the module to **~6M/month**, keeping total app burn (mentor excluded) under the 50M budget.

## 2. Scaling

| Sev | Finding |
|-----|---------|
| ✅ | Rate limits are **DB-backed and global across serverless instances** (`lib/db-rate-limit.ts`) — 5/min enroll, 10/min progress, 10/min user-sync. Better than the middleware in-memory approach the docs claim. |
| ✅ | Pool tuned: `connectionLimit: 5, queueLimit: 25, idleTimeout: 30s, keepAlive` (`config/db.tsx`). |
| ✅ | Unique index on `(user_id, course_id)` prevents double enrollment. |
| 🟡 | **`chapter_count` denormalization drift** — read at `lib/enroll-data.ts:136`; set only at seed time. Any manual chapter change silently breaks dashboard percentages unless `backfill-chapter-count.ts` is re-run. |
| 🟡 | Enroll POST = 5 sequential queries + cached chapter fetch. Rate limit bounds blast radius, but could collapse to 2 (insert + return via `onDuplicateKeyUpdate`). |
| 🟡 | `GET /api/enroll` unpaginated — bounded per user (≤ course count), fine now; flag for Phase 3+ when notes/posts arrive. |
| 🟡 | **Docs mismatch**: `feature-tracker.md` I.4 and `docs/production-review-500-users.md:112,193` claim middleware in-memory limiting + `lib/rate-limit.ts` — that file doesn't exist. Real implementation is handler-level DB limiting. Stale docs are a hazard for future agents. |

## 3. Monitoring

| Sev | Finding |
|-----|---------|
| 🔴 | **No RU tracking** — the one metric that decides survival on TiDB free tier. You can't predict the quota-exhaustion day (currently ~day 14-18 app-wide per the doc). TiDB console shows it, but nothing in-code correlates per endpoint. |
| 🟡 | `log.timed()` warns on DB calls >250ms (`lib/logger.ts`) — good, but only used in 2 of ~6 course paths (progress route, course-data, enroll-data). |
| 🟡 | `GET /api/health` exists (SELECT 1, 5s timeout) but nothing polls it — UptimeRobot deliberately deferred. At 500 users, self-detected downtime is 30-min add. |
| 🟡 | No Vercel Analytics / Speed Insights — 0.2 hr add for real-user LCP data. |

## 4. Logging

| Sev | Finding |
|-----|---------|
| ✅ | All catches log via `console.error("[module] fn:", error)` — no silent swallows in data layer. |
| 🟡 | Unstructured logs — no levels, no correlation IDs, no per-request duration/status lines for API routes. At 500 users, Vercel's plain-text logs become unsearchable. |
| 🟡 | No request logging middleware → can't compute per-endpoint error rate / p95 latency from logs. |
| 🟡 | `pino` deliberately deferred (correct call at 3-4 users; revisit at 500 — 30-min swap). |

## 5. Security

| Sev | Finding |
|-----|---------|
| ✅ | ~~**Points inflation via unvalidated `chapterId`**~~ — progress route awarded points for phantom chapters (+10 each, +600/hr at rate limit). **Fixed 2026-08-16**: `chapterId` must exist in the course's chapters (`progress/route.ts:52-53` → 404 otherwise) |
| 🟡 | ~~**`eval()` at `LessonClient.tsx:61`** — combined with saved code in localStorage (`lib/editor.ts:80-90`), a persistent self-XSS vector and a tab-freeze risk.~~ ✅ **Fixed 2026-08-17** — `runJavaScript()` worker (no `window`/`document` access) wired into the lesson Run path; self-XSS + freeze risks closed. Note: worker sandbox means lesson code can no longer touch page globals — fine for current seed lessons, a constraint to remember when authoring new content. |
| 🟡 | `dangerouslySetInnerHTML` for chapter instructions (`LessonClient.tsx:143`) — safe today (static seed), an XSS hole the moment content becomes user-editable. Add an escape function if that changes. |
| 🟡 | No CORS policy (`docs`: 4.3, 0.2 hr) — fine same-origin, cheap insurance. |
| ✅ | Zod on both routes, `auth()`/`currentUser()` 401s, DB rate limits fail-closed, `.env` hygiene verified, no secrets in client bundles. |

## 6. Failure Recovery

| Sev | Finding |
|-----|---------|
| 🔴 | **Error and empty are indistinguishable.** `getAllCourses()`/`getChaptersByCourseId()` return `[]`/`null` on failure → catalog shows "No courses available yet" (page.tsx:112-117) during a DB outage instead of an error state. Silent degradation — the doc's own Tier 3.3, still open. |
| 🟡 | **No retry on transient TiDB failures** — pool keep-alive helps, but a TiDB blip = failed requests; a small retry wrapper (reuse Mistral's backoff pattern in `lib/mentor.ts`) on idempotent reads is cheap. |
| 🟡 | ~~`EnrollButton` swallows errors (`catch {}`, `EnrollButton.tsx:25`) — failed enrollment looks like success (button stops spinning, no toast).~~ ✅ **Fixed 2026-08-17** — error toast on failure, success toast on enroll; no more silent failure. |
| ✅ | Progress is a single transaction, idempotent, auto-enrolls, rate-limited — double-click safe. |
| ✅ | Rate limiter is fail-closed (throws → 500, no bypass). |
| 🟡 | ~~No React Error Boundaries in `courses/`/`learn/` — a single Server Component throw blows the whole page.~~ ✅ **Fixed 2026-08-17** — segment-level `error.tsx` on all three routes; throws stay local, layout survives. |

---

## Suggested improvements (prioritized)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| ~~1~~ | ~~Wrap `getAllCourses`/`getCourseById`/`getChaptersByCourseId` in `createContentCache` (TTL 1hr, version-bump invalidation — seed data never changes at runtime)~~ | ✅ Implemented 2026-08-16 — `lib/course-data.ts`: try → cache → catch, failures never cached, `chapter_count` added to `Course` type | Cuts module RU ~65% → ~6M/month |
| ~~2~~ | ~~Point `courses/page.tsx:36` at `getAllCourses()`~~ | ✅ Implemented 2026-08-16 — catalog now served from cache; dead imports + `\|\| 0` removed | Consistency + cache |
| ~~3~~ | ~~Swap `eval()` → `runJavaScript()` worker in `LessonClient`~~ | ✅ Implemented 2026-08-17 — worker sandbox wired into lesson Run; spinner + disabled state; output styled via `runError` state | Freeze/XSS elimination |
| ~~4~~ | ~~Add `loading.tsx` + `error.tsx` to `/courses`, `/courses/[id]`, `/learn/*`~~ | ✅ Implemented 2026-08-17 — 6 files; shared `PageError.tsx`; skeletons match dashboard style | UX + failure visibility |
| ~~5~~ | ~~EnrollButton: replace silent `catch` with toast; progress route already toasts~~ | ✅ Implemented 2026-08-17 — error + success toasts via sonner (already mounted) | Failure transparency |
| 6 | Add RU/query-count telemetry: extend `logger.timed()` to emit per-route query counts + duration to Vercel logs; poll TiDB console weekly | 1 hr | Predict quota exhaustion |
| 7 | API request logging middleware (method, path, status, ms, user) | 30 min | Error rate + p95 from logs |
| 8 | `currentUser()` → `auth()` + `usersTable.clerk_id` migration (doc estimates 1.5 hr, ~6 routes) | 1.5 hr | Removes Clerk HTTP per render, enables edge caching |
| 9 | Badges: either build the `badges` table or remove the "You earned a badge!" toast — currently users are promised storage that doesn't exist | 1 hr | Correctness |
| 10 | Correct stale rate-limit docs (I.4, production-review 2.2/5.2) | 10 min | Agent reliability |
| 11 | Vercel Speed Insights + Analytics | 15 min | Real-user perf |
| 12 | Empty-vs-error distinction (doc 3.3) | 1 hr | Kill silent degradation |

Items 1-5 alone move the module from ~28M → ~8M RU/month combined with dashboard — the difference between surviving the month and hitting the wall at ~day 14-18.
