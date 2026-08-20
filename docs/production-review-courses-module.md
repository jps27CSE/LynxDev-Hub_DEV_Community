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

> **Update (2026-08-18):** Improvement #12 implemented.
> - #12: `lib/course-data.ts` no longer swallows DB failures — all four queries now log + **rethrow** (matching the `enroll-data.ts` pattern). An outage now surfaces as a real error state via the segment `error.tsx` files (built in #4) instead of "No courses available yet" or a misleading 404. `[]`/`null` now mean genuine empty/not-found only. API routes (`/api/enroll`, `/api/progress`) catch the meta-fetch failure and return 500 `{ error: "Failed to load course data" }` via the new `serverError()` helper (`lib/api-error.ts`) instead of "Chapter not found".

> **Update (2026-08-18):** Improvement #6 implemented.
> - #6: per-request RU telemetry. New `lib/request-log.ts` (`AsyncLocalStorage` per-request counter + `withRequestLog(label, fn)`) wraps all 13 API handlers across the 10 routes; drizzle's `logger` hook in `config/db.tsx` counts **every** query (select/insert/update/delete, including inside transactions). Each request emits one line: `[req] POST /api/enroll 200 45ms 5 queries` — per-endpoint RU estimates are now computable from Vercel logs (requests × queries-per-request × RU-per-query). ALS (not a module counter) so concurrent requests on one instance don't mix counts; `countQuery()` is a no-op outside wrapped requests. Redundant manual `performance.now()` lines removed from `interview/stack` + `questions-by-tags`. Verified live: `[req] GET /api/health 200 892ms 1 queries`.
> - **New finding from live logs (2026-08-18):** rate-limit upsert looked slow — `[db-rate-limit] slow db: rate-limit upsert (2260ms)` = ~80% of a 2864ms `/api/user` request. **On review: not an index problem** (`bucket` is the PK, `schema.tsx:131-135`); likely the explicit 2-statement transaction (TiDB tx overhead) or a cold pooled-connection TLS handshake on the dev box. Single observation — collect more `[req]` samples before acting.

> **Update (2026-08-18):** Improvement #8 implemented.
> - #8: `currentUser()` → `auth()` everywhere it can work. Added `usersTable.clerk_id` (nullable, unique — migration `drizzle/0007_naive_blue_shield.sql`, applied). New `getUserByClerkId` + `getEnrollmentsByClerkId` (`lib/enroll-data.ts`); shared internal `fetchEnrollments(userId)` keeps email + clerk variants DRY. `getUserContext` (`lib/mentor.ts`) resolves by clerk_id. Swapped to zero-HTTP `auth()`: enroll POST/GET, progress POST, user/profile GET/PATCH, mentor/chat GET/POST + pages `/courses`, `/courses/[id]`, `/mentor`. **12 → 3 `currentUser()` call sites.**
> - Kept deliberately: `/api/user` POST (the one place with profile data — creates the row and **self-heals clerk_id for legacy rows** on next session sync) and `/dashboard` (needs Clerk `imageUrl` for the avatar; not available from `auth()` — would need an `avatar_url` column, YAGNI until asked).
> - Note: `auth()` still marks pages dynamic (reads cookies) — the win is removing the external Clerk HTTP call per render (~100-300ms + Clerk API quota), not static rendering.

> **Update (2026-08-18):** Improvement #10 implemented.
> - #10: stale rate-limit docs corrected. `feature-tracker.md` I.4 + free-tier checklist, `production-review-500-users.md` (lines 112, 166, 193, 198, 250), and `production-review-interview-modules.md:17` now describe the real implementation: **DB-backed, handler-level** limiting via `lib/db-rate-limit.ts` + `config/rate-limits.ts` + `rate_limits` table — middleware is auth-only. Also fixed the health row's false "rate limiting still applies" claim. Future agents reading docs will now build the right thing.

> **Update (2026-08-18):** Fresh senior-engineer review of the Courses module (full pass: learn page + LessonClient, EnrollButton, provider user-sync, ContinueLearning, editor sandbox, middleware, enroll/progress routes, schema). Two new real findings + one race + one housekeeping item:
> - 🟡 **Browser-preview iframe is same-origin and unsandboxed** — the #3 fix sandboxed the console Run path (worker) but not browser-mode lessons: `LessonClient.tsx:229-233` + `doc.write()` (72-74) execute lesson HTML/JS with the app's **full origin** (no `sandbox` attribute), persisted across visits via localStorage-saved code. It can call the app's authenticated APIs (e.g. `POST /api/progress`) or read same-origin storage. Self-XSS only — flagged because #3 explicitly claimed the self-XSS vector was closed. Fix: `srcdoc` + `sandbox="allow-scripts"` + postMessage (frame becomes opaque, `contentDocument` writes stop working). See #13.
> - 🟡 **Lesson "Mark as Complete" never syncs with server truth; toast conflates cases** — `completed` starts `false` on every mount (`LessonClient.tsx:45`), so refreshing a completed chapter shows the button again; the catch branch (113-114) toasts "Already completed or error occurred" for both a real 500 and the 200 `{ message: "Already completed" }` response. Fix: check `res.data.message === "Already completed"` → `setCompleted(true)`; distinct error toast. See #14.
> - 🟡 **Enroll POST check-then-insert race** — two concurrent POSTs (progress auto-enroll racing enroll, or a retried request) both pass the existence check (`route.ts:58-68`) → the second insert violates `enrollments_user_id_course_id_idx` → 500 "Enrollment failed" despite being enrolled. Fix: catch `ER_DUP_ENTRY` (1062) → return existing row. See #15.
> - 🧹 **Next.js 16.1.1 deprecates `middleware.ts`** — dev logs warn "The 'middleware' file convention is deprecated. Please use 'proxy' instead." Mechanical rename (`middleware.ts` → `proxy.ts`, same `clerkMiddleware` API). Do before Next 17. See #16.
> - Noted positive: Monaco already lazy-loaded via `next/dynamic` + `ssr: false` (`MonacoEditor.tsx:6`); provider user-sync retries with backoff (3 attempts, `provider.tsx:31-54`); learn page server component does no per-user queries (only cached course/chapter reads); EnrollButton double-tap safe (disabled while loading).

> **Update (2026-08-18):** Improvements #13-16 implemented.
> - #13: browser previews sandboxed. New `buildSandboxedSrcDoc()` (`lib/editor.ts`) injects the scrollbar CSS into the lesson document; both `LessonClient.tsx` and the shared `components/editor/BrowserPreview.tsx` (used by `/editor`) now render `<iframe srcDoc sandbox="allow-scripts">` — lesson code runs in an **opaque origin**: no parent access, no cookies, no credentialed fetches, no same-origin storage. The `doc.write` + `contentDocument` ref-effect pattern is gone; the `nonce` key still forces reload on Run in the editor. Live typing in lessons still re-renders via `srcDoc` change (same reload-on-change behavior as before).
> - #14: `LessonClient` syncs with server truth — `res.data.message === "Already completed"` → `setCompleted(true)` (stale "Mark as Complete" self-corrects on click instead of erroring); the catch now toasts a real error ("Failed to save progress. Please try again.") instead of the conflated "Already completed or error occurred". No per-user query added to the learn page — click-time sync only.
> - #15: enroll POST catches `ER_DUP_ENTRY` (1062) → re-selects + returns the existing enrollment instead of a 500 (progress auto-enroll race / retried request). Non-dup insert failures now return `{ error: "Failed to enroll" }` instead of the bare Next default 500.
> - #16: `middleware.ts` → `proxy.ts` (Next 16.1.1 convention; same `clerkMiddleware` API + matcher). Build output confirms **"ƒ Proxy (Middleware)"** — deprecation warning gone.

> **Update (2026-08-19):** Improvement #7 implemented.
> - #7: request-logging middleware — `proxy.ts` now wraps `clerkMiddleware` and emits `[http] METHOD /path status ms user=<clerkId>` for **every** matched request (page renders + API + edge), closing the last unlogged surface: `[http] GET /courses 200 42ms user=user_2x...`. The clerk factory is invoked per request (cheap — closure setup only; the auth work runs inside the returned middleware) so `userId` is captured via per-request closure, never module state (concurrent edge requests stay isolated). Distinct `[http]` prefix separates middleware lines from handler-level `[req]` lines (which still carry query counts + true status). Two honest caveats logged in docs: (a) middleware cannot observe the final page status — pass-through renders always read 200, so page-level 5xx are visible only via segment `error.tsx` (still unlogged); (b) API routes now emit both `[http]` and `[req]` lines — expected, different axes (edge time + user vs handler time + query count).

**Bottom line:** the module is in better shape than the rest of the app (React `cache()`, batched enrollment queries, single-transaction progress, global DB-backed rate limits, tuned pool — all already applied). It is **not** the bottleneck at 500 users — mentor chat is. The dominant cost driver — **zero cross-request caching for 100%-static seed content** — is now fixed (items #1-2), cutting the module's ~20M RU/month burn to **~6M/month** (~12% of the 50M free budget). Items #3-5 (worker sandbox, enroll toasts, loading/error states) are done as of 2026-08-17; #12 (empty-vs-error), #6 (per-request query-count telemetry), #8 (`currentUser()` → `auth()`, 12 → 3 call sites), and #10 (stale rate-limit docs) as of 2026-08-18; #13-16 (browser sandbox, honest lesson state, idempotent enroll, `proxy.ts` rename) and **#7 (request-logging middleware) as of 2026-08-19**. Remaining course-module risks are the once-observed slow rate-limit upsert (~2.2s, single sample — needs more telemetry) and page-render error visibility (segment `error.tsx` renders fallbacks but doesn't log — candidates for a future pass, none blocking 500 users).

---

## 1. Performance

| Sev | Finding | Evidence |
|-----|---------|----------|
| 🔴 | ~~**No cross-request caching.** Every catalog/detail/learn render re-queries TiDB.~~ ✅ **Fixed 2026-08-16** — all course queries wrapped in `unstable_cache` via `createContentCache` (`lib/course-data.ts`), **`ttl: false`** (indefinite, version-bump invalidation). Courses/chapters are immutable seed data — perfect cache candidates. | ~~`lib/course-data.ts:46,59,75`~~ → `lib/course-data.ts:55-136` — React `cache()` dedupes per request, `unstable_cache` across requests |
| 🔴 | ~~**Learn page = biggest RU burner**: 3+ fresh queries per render (course + all chapters + enrollments) at ~2,000 renders/day → ~12M RU/month.~~ ✅ Caching kills this — course + chapters served from cache after first visit; only per-user enrollments hit TiDB. | `app/(routes)/learn/[courseId]/[chapterId]/page.tsx:18-19` |
| 🟡 | ~~`courses/page.tsx` bypasses the cached `getAllCourses()` with a raw `db.select()` — duplicated logic, uncached.~~ ✅ **Fixed 2026-08-16** — uses `getAllCourses()`; unused `db`/`courses`/`eq`/`asc` imports removed; dead `chapter_count || 0` removed. | `app/(routes)/courses/page.tsx:34` |
| 🟡 | ~~Main-thread `eval(code)` — a freeze/critical stall risk and an unsafe execution path.~~ ✅ **Fixed 2026-08-17** — lesson Run now uses the sandboxed worker `runJavaScript()` (`lib/editor.ts:14`, 5s timeout); infinite loops → "Execution timed out" instead of tab freeze. | ~~`LessonClient.tsx:61`~~ → `LessonClient.tsx:51-65` |
| 🟡 | ~~No `loading.tsx`/`error.tsx` in `courses/` or `learn/` — synchronous Server Components → blank TTFB on slow DB. Dashboard has both.~~ ✅ **Fixed 2026-08-17** — both added to all three segments; shared `PageError.tsx` for fallbacks. | route dirs → `courses/{loading,error}.tsx`, `courses/[id]/*`, `learn/[courseId]/[chapterId]/*` |
| 🟡 | ~~`currentUser()` external Clerk HTTP per render — also **forces dynamic rendering**, limiting caching benefits.~~ ✅ **Fixed 2026-08-18** (#8) — pages + 9 API handlers use local-JWT `auth()`; 12 → 3 call sites. Kept only where profile data is required: `/api/user` POST (row creation + clerk_id self-heal backfill) and `/dashboard` (avatar `imageUrl`). | `courses/page.tsx`, `courses/[id]/page.tsx`, `mentor/page.tsx` |
| 🟡 | **Rate-limit upsert latency** — observed `[db-rate-limit] slow db: rate-limit upsert (2260ms)`, ~80% of a 2864ms `/api/user` request (2026-08-18, dev logs). Not an index issue (`bucket` is PK, `schema.tsx:131-135`) — suspect TiDB tx overhead (2-statement explicit transaction) or cold-connection handshake. One sample; needs more `[req]` telemetry before concluding. | `lib/db-rate-limit.ts:57-77`, `[req]` telemetry from #6 |
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
| 🟡 | ~~**Docs mismatch**: `feature-tracker.md` I.4 and `docs/production-review-500-users.md:112,193` claim middleware in-memory limiting + `lib/rate-limit.ts` — that file doesn't exist. Real implementation is handler-level DB limiting. Stale docs are a hazard for future agents.~~ ✅ **Fixed 2026-08-18** (#10) — `feature-tracker.md` I.4 + checklist, `production-review-500-users.md` (112, 166, 193, 198, 250), and `production-review-interview-modules.md:17` now describe the DB-backed handler-level limiter. |

## 3. Monitoring

| Sev | Finding |
|-----|---------|
| ✅ | ~~**No RU tracking** — the one metric that decides survival on TiDB free tier.~~ **Fixed 2026-08-18** — every API request logs one line via `withRequestLog` (#6): method, path, status, duration ms, query count. Per-endpoint RU now computable from Vercel logs (requests × queries × RU-per-query). Still poll TiDB console weekly for the true total. Caveat: for `POST /api/mentor/chat` the line measures handler time (stream creation), not full stream duration — the `[http]` middleware line (2026-08-19, #7) adds edge time but not stream completion either; mentor latency still undercounted. |
| 🟡 | `log.timed()` warns on DB calls >250ms (`lib/logger.ts`) — good, but only used in 2 of ~6 course paths (progress route, course-data, enroll-data). |
| 🟡 | `GET /api/health` exists (SELECT 1, 5s timeout) but nothing polls it — UptimeRobot deliberately deferred. At 500 users, self-detected downtime is 30-min add. |
| 🟡 | No Vercel Analytics / Speed Insights — 0.2 hr add for real-user LCP data. |

## 4. Logging

| Sev | Finding |
|-----|---------|
| ✅ | All catches log via `console.error("[module] fn:", error)` — no silent swallows in data layer. |
| 🟡 | ~~No per-request duration/status lines for API routes~~ — **Fixed 2026-08-18** (#6): every API request emits `[req] METHOD /path status ms queries`. Still no log levels or correlation IDs; page renders + edge requests now covered by the `[http]` middleware lines (2026-08-19, #7). |
| 🟡 | ~~No request logging middleware → can't compute per-endpoint error rate / p95 latency from logs.~~ ✅ **Fixed 2026-08-19** (#7) — `proxy.ts` logs every matched request: method, path, middleware status (307 redirects / 200 pass-through), edge duration, clerk userId. Page-render p95 now computable; page **error** rates still need `error.tsx` logging (fallbacks render silently). |
| 🟡 | `pino` deliberately deferred (correct call at 3-4 users; revisit at 500 — 30-min swap). |

## 5. Security

| Sev | Finding |
|-----|---------|
| ✅ | ~~**Points inflation via unvalidated `chapterId`**~~ — progress route awarded points for phantom chapters (+10 each, +600/hr at rate limit). **Fixed 2026-08-16**: `chapterId` must exist in the course's chapters (`progress/route.ts:52-53` → 404 otherwise) |
| 🟡 | ~~**`eval()` at `LessonClient.tsx:61`** — combined with saved code in localStorage (`lib/editor.ts:80-90`), a persistent self-XSS vector and a tab-freeze risk.~~ ✅ **Fixed 2026-08-17** — `runJavaScript()` worker (no `window`/`document` access) wired into the lesson Run path; self-XSS + freeze risks closed. Note: worker sandbox means lesson code can no longer touch page globals — fine for current seed lessons, a constraint to remember when authoring new content. |
| 🟡 | `dangerouslySetInnerHTML` for chapter instructions (`LessonClient.tsx:143`) — safe today (static seed), an XSS hole the moment content becomes user-editable. Add an escape function if that changes. |
| 🟡 | ~~**Browser-preview iframe is same-origin + unsandboxed** — browser-mode lessons run via `doc.write` into an iframe with no `sandbox` attribute (`LessonClient.tsx:229-233`). Console path is worker-sandboxed (#3) but this path can call authenticated APIs and read same-origin storage; persisted via localStorage code. Self-XSS only, but contradicts the "self-XSS closed" claim from #3. Fix: `srcdoc` + `sandbox="allow-scripts"` + postMessage.~~ ✅ **Fixed 2026-08-18** (#13) — `srcDoc` + `sandbox="allow-scripts"` on both `LessonClient.tsx` and the shared `BrowserPreview.tsx` (`/editor`); opaque-origin execution via `buildSandboxedSrcDoc()` (`lib/editor.ts`). |
| 🟡 | No CORS policy (`docs`: 4.3, 0.2 hr) — fine same-origin, cheap insurance. |
| ✅ | Zod on both routes, `auth()`/`currentUser()` 401s, DB rate limits fail-closed, `.env` hygiene verified, no secrets in client bundles. |

## 6. Failure Recovery

| Sev | Finding |
|-----|---------|
| 🔴 | ~~**Error and empty are indistinguishable.** `getAllCourses()`/`getChaptersByCourseId()` return `[]`/`null` on failure → catalog shows "No courses available yet" (page.tsx:112-117) during a DB outage instead of an error state. Silent degradation — the doc's own Tier 3.3, still open.~~ ✅ **Fixed 2026-08-18** — `lib/course-data.ts` logs + rethrows (enroll-data pattern); segment `error.tsx` renders the failure state; `/api/enroll` + `/api/progress` return 500 via `serverError()` instead of misleading 404s. |
| 🟡 | **No retry on transient TiDB failures** — pool keep-alive helps, but a TiDB blip = failed requests; a small retry wrapper (reuse Mistral's backoff pattern in `lib/mentor.ts`) on idempotent reads is cheap. **Observed live 2026-08-18:** one `npm run build` failed with `connect ETIMEDOUT` during `/interview` static generation; retry passed. |
| 🟡 | ~~**Enroll POST check-then-insert race** — concurrent POSTs (progress auto-enroll racing enroll, retried request) both pass the `existing` check (`route.ts:58-68`) → dup-key 500 on `enrollments_user_id_course_id_idx` despite being enrolled. Catch `ER_DUP_ENTRY` (1062) → re-select + return existing row.~~ ✅ **Fixed 2026-08-18** (#15) — insert wrapped; `ER_DUP_ENTRY` → re-select + return existing enrollment; other insert failures → `serverError("Failed to enroll")`. |
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
| ~~6~~ | ~~Add RU/query-count telemetry: extend `logger.timed()` to emit per-route query counts + duration to Vercel logs; poll TiDB console weekly~~ | ✅ Implemented 2026-08-18 — `lib/request-log.ts` (`AsyncLocalStorage` + `withRequestLog`) wraps all 13 API handlers; drizzle `logger` hook in `config/db.tsx` counts every query. Per-endpoint RU estimable from Vercel logs. Went further than `logger.timed()`: the db-level hook catches queries that aren't wrapped. | Predict quota exhaustion |
| 7 | ~~API request logging middleware (method, path, status, ms, user)~~ | ✅ Implemented 2026-08-19 — `proxy.ts` wraps `clerkMiddleware`; every matched request logs `[http] METHOD /path status ms user=<clerkId>` (per-request closure for userId, no module state). Caveat: pass-through renders always report 200 — middleware can't see the final page status; API handlers still log true status + query counts via `[req]`. | Error rate + p95 from logs |
| ~~8~~ | ~~`currentUser()` → `auth()` + `usersTable.clerk_id` migration (doc estimates 1.5 hr, ~6 routes)~~ | ✅ Implemented 2026-08-18 — `clerk_id` column (migration `0007`), `getUserByClerkId`/`getEnrollmentsByClerkId`, 9 API handlers + 3 pages on `auth()`. `/api/user` POST self-heals legacy rows; dashboard keeps `currentUser()` (avatar). 12 → 3 call sites. | Removes Clerk HTTP per render |
| ~~9~~ | ~~Badges: either build the `badges` table or remove the "You earned a badge!" toast — currently users are promised storage that doesn't exist~~ | ✅ Implemented 2026-08-17 — commit `2410857`: toast now says "Course completed! Great job!", hero copy drops the badge mention. No toast promises storage that doesn't exist. | Correctness |
| ~~10~~ | ~~Correct stale rate-limit docs (I.4, production-review 2.2/5.2)~~ | ✅ Implemented 2026-08-18 — 8 stale claims across 3 files corrected to the real DB-backed handler-level limiter (`lib/db-rate-limit.ts` + `rate_limits` table); bonus: health doc row no longer claims a rate limit it doesn't have | Agent reliability |
| 11 | Vercel Speed Insights + Analytics | 15 min | Real-user perf |
| ~~12~~ | ~~Empty-vs-error distinction (doc 3.3)~~ | ✅ Implemented 2026-08-18 — `course-data.ts` rethrows after logging; `error.tsx` (from #4) renders the failure state; enroll/progress return 500 via `serverError()` | Kill silent degradation |
| ~~13~~ | ~~Sandbox the browser-preview iframe — `srcdoc` + `sandbox="allow-scripts"` + postMessage (frame becomes opaque; `contentDocument` writes stop working)~~ | ✅ Implemented 2026-08-18 — `buildSandboxedSrcDoc()` helper (`lib/editor.ts`); `LessonClient.tsx` + shared `BrowserPreview.tsx` on `srcDoc` + `sandbox="allow-scripts"`; `doc.write`/ref-effect pattern removed; `nonce` key preserved for editor Run-reload | Closes the last self-XSS path |
| ~~14~~ | ~~LessonClient: sync `completed` with server truth (`res.data.message === "Already completed"` → `setCompleted(true)`), separate error toast~~ | ✅ Implemented 2026-08-18 — stale complete state self-corrects on click; catch toasts "Failed to save progress. Please try again."; no extra learn-page query (click-time sync only) | Honest states + honest errors |
| ~~15~~ | ~~Enroll POST: catch `ER_DUP_ENTRY` → return existing enrollment~~ | ✅ Implemented 2026-08-18 — insert wrapped, dup-key → re-select + return existing row; other failures → 500 `{ error: "Failed to enroll" }` | Idempotent under concurrency |
| ~~16~~ | ~~Rename `middleware.ts` → `proxy.ts` (Next 16.1.1 deprecation warning)~~ | ✅ Implemented 2026-08-18 — `git mv`; build shows "ƒ Proxy (Middleware)", warning gone; same `clerkMiddleware` API | Future-proofing; required by Next 17 |

Items 1-5 alone move the module from ~28M → ~8M RU/month combined with dashboard — the difference between surviving the month and hitting the wall at ~day 14-18.
