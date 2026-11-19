# Production Review — Roadmaps Module

> **Date:** 2026-11-19
> **Scope:** Roadmaps module — `/roadmaps` (index), `/roadmaps/[slug]`, `RoadmapTree`, `RoadmapDetailPanel`, `lib/roadmap-platform.ts`, `config/roadmaps/*`, `tests/roadmaps*.test.ts`. The 118 in-platform links (40 courses, 77 lessons, 1 task) are in scope.
> **Target:** 500 users on TiDB Cloud Starter (free) + Vercel Hobby (free).
> **Companion docs:** `docs/production-review-500-users.md` (app-wide), `docs/production-review-courses-module.md`, `docs/production-review-system-design-module.md`.

---

## 0. Headline

The roadmaps module is **cheap to run and safe to fail**: it performs **one cached TiDB query** (course rows, shared across all users and instances via `unstable_cache`), is **auth-gated**, **degrades gracefully** on a DB outage (course links hide, lesson links stay), and is covered by a **both-directions test gate** that would have caught the defect that shipped silently for two releases.

Its single real inefficiency is that **`/roadmaps/[slug]` is dynamic (`ƒ`) even though its content is identical for every user** — it runs a server function on every pageview when it could be ISR. At 500 users that is well inside the Vercel cap, but it is the one change that pays for itself.

**RU consumption: ~0 per request after the first cold cache (one `getAllCourses` per instance lifetime).** No new tables, no schema change.

> **Status:** No 🔴 findings. Two 🟡 worth doing before launch, the rest are 🟢 verified good.

---

## 1. Performance

### 🟡 Medium

| Finding | Evidence | Impact | Fix |
|---|---|---|---|
| **`/roadmaps/[slug]` is `ƒ` (dynamic) for content that is identical for every user** | `npm run build` route table: `├ ƒ /roadmaps/[slug]`. The page calls `getPlatformCourseMap()` (which calls `getAllCourses()`), but `getAllCourses` is cross-request cached (`ttl: false`, version-bumped). The render still runs per request | One server function invocation per pageview. At 500 users × ~5 views/day ≈ 75k/month — under the 1M cap, but it is avoidable work and adds latency on cold starts | Add `export const revalidate = 3600` (or longer) to `app/(routes)/roadmaps/[slug]/page.tsx`, or prerender via `generateStaticParams` + ISR. The page is auth-gated at the proxy, but the *content* is public-shaped and identical; ISR is safe because progress lives in `localStorage`, not the HTML. **Largest single win available in this module.** |
| **The full roadmap config is serialized into the page payload** | `config/roadmaps/frontend.ts` is 33 KB source (134 KB across all five). `RoadmapTree` is `"use client"` and receives the whole `roadmap` (incl. all 434 external resource entries) plus `platformCourses` as props | ~15–25 KB gzipped per pageview of roadmap data; client hydration cost scales with node × resource count. Not a 500-user blocker, but the dominant payload in this module | Lazy-load resources per node (e.g. fetch on panel open), or split the tree so only the visible stage hydrates. Defer until Lighthouse shows a real cost — the current scale (≤ ~40 nodes/roadmap) is fine. |
| **`resolvePlatformEntries` runs on every render** | `RoadmapDetailPanel` calls it inline for the selected node | Negligible — the array is ≤ ~6 entries and the work is a linear scan | None needed. Memoize only if profiling shows a hot path. |

### 🟢 Verified good

| Check | Result |
|---|---|
| **`/roadmaps` index is static (`○`)** | Prerendered; `RoadmapList` receives `getAllRoadmaps()` (config-only, no DB) |
| **Course DB read is cross-request cached** | `getAllCourses` wraps `withCourseCache({ tag: "courses", version: 6, ttl: false })` — one query per instance lifetime, shared across all users |
| **No N+1** | Single `getAllCourses` query; `getPlatformCourseMap` calls it once and matches in memory |
| **Per-request dedup** | `getAllCourses` also wrapped in React `cache()` |
| **No unbounded fetches** | `getCourseById` / `getChaptersByCourseId` use `.limit(1)` / indexed `course_id` |
| **Panel body is `overflow-y-auto`** | Long resource lists scroll inside the panel instead of growing the page |
| **Loading skeletons** | `loading.tsx` for both `/roadmaps` and `/roadmaps/[slug]` |

---

## 2. Scaling

| Sev | Finding |
|---|---|
| 🟡 | **No rate limiting on page routes.** `config/rate-limits.ts` only covers `/api/*`. `/roadmaps/[slug]` is auth-gated but not throttled. A scraper can drive one server function per request. Mitigation today: data is cached, so the DB is untouched; Vercel's 1M invocation cap is the only exposure. At 500 users this is fine. **Do not add DB-backed rate limiting to pages** — that reintroduces a round-trip per read for no benefit (the same conclusion the blog review reached). If abuse appears, add an in-memory edge limit (the existing `lib/memory-rate-limit.ts` primitive) keyed on IP, not on the DB counter. |
| 🟢 | **TiDB pressure: none added.** The module adds zero tables and zero new queries beyond the already-cached `getAllCourses`. `connectionLimit: 5` is untouched. |
| 🟢 | **Vercel invocations: ~75k/month at 500 users** — under the 1M cap with headroom. ISR (§1) would drop this further. |
| 🟢 | **No pagination needed** — a roadmap is one page by design (roadmap.sh parity), and the largest is ~40 nodes. |
| 🟢 | **Progress is client-side (`localStorage`)** — zero DB writes per "mark done", zero server state. This is the single biggest scaling decision in the module and it is correct. |
| 🟢 | **Auth-gated.** `/roadmaps` is not in `isPublicRoute`, so `auth.protect()` runs before the handler. Anonymous traffic never reaches the render path. |

---

## 3. Monitoring

| Sev | Finding |
|---|---|
| 🟡 | **No per-module metric for "course links hidden"** (DB-degraded state). `getPlatformCourseMap` logs via `log.error` when `getAllCourses` throws, but there is no counter for the softer case where the DB answers but a key is unresolved (e.g. a renamed course). The `tests/roadmaps.test.ts` gate catches this at build time, but a runtime signal would surface a seed/DB drift before the next deploy. Suggest: `log.warn("platform course unresolved", { unresolvedKeys })` when the resolved map is missing any shipped key. Low priority — the build gate is the real control. |
| 🟢 | **Middleware `[http]` lines** log method, path, status, ms, and `user=` for every request — enough to answer "is the roadmap page slow?" from Vercel logs. |
| 🟢 | **Error boundaries exist** for both segments: `app/(routes)/roadmaps/error.tsx` and `app/(routes)/roadmaps/[slug]/error.tsx`. A render failure shows the error UI instead of a white screen. |
| 🟢 | **Loading skeletons** for both segments (`loading.tsx`) — no layout shift on slow networks. |
| 🟢 | **Vercel Analytics + Speed Insights** are mounted in the root layout, so roadmap pageviews and Core Web Vitals are already collected (client-side injection, hence absent from SSR HTML — expected). |

---

## 4. Logging

| Sev | Finding |
|---|---|
| 🟢 | **Structured, request-correlated.** `createLogger("roadmap-platform")` emits JSON in production with `requestId`, `scope`, `msg`, `time`, and serialized error (including `code`/`errno`/`sqlState` after the I.8 fix). `log.error` on DB failure goes to console + the optional `LOG_DRAIN_URL`. |
| 🟢 | **`getPlatformCourseMap` never throws** — it catches, logs, returns `{}`. The page never 500s because of a course read. |
| 🟡 | **No logging of which roadmap slug was viewed server-side.** The `[http]` line carries the path string, so it is answerable from Vercel logs, but there is no structured event. Vercel Analytics covers the product question. **Do not add a DB write per view** — that would undo the "zero DB writes per view" property. |
| 🟢 | **Dev/prod parity.** `isProd` switches between raw-object (dev) and JSON (prod) output; the drain is fire-and-forget and never blocks the request. |

---

## 5. Security

| Sev | Finding |
|---|---|
| 🟢 | **Auth-gated.** `/roadmaps` is absent from `isPublicRoute`, so `auth.protect()` runs before the handler. Anonymous users are redirected to `/sign-in` with a `redirect_url`. |
| 🟢 | **`?node=` is validated, not trusted.** `findNode(roadmap.root, id)` returns `null` for unknown ids and the panel simply does not render. No injection surface — the id is never interpolated into HTML or a query. |
| 🟢 | **No unescaped user content.** All titles/descriptions come from config or from DB rows rendered via React (escaped). Course hrefs are `/courses/${number}` where `number` is a DB id (integer). Lesson/task hrefs are config-controlled string literals. |
| 🟢 | **No secret leakage to the client.** `config/roadmaps/platform.ts` imports only types; `lib/roadmap-platform.ts` (which touches `config/db`) is server-only and is never imported by a client component. The `platformCourses` prop exposes only `{ id, title, chapterCount }` — all public course fields. I.9 boundary respected. |
| 🟢 | **Security headers apply.** CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, HSTS, etc. are set for `/(.*)` in `next.config.ts`. |
| 🟡 | **CSP is loose app-wide** (`script-src 'unsafe-inline' 'unsafe-eval'`). Not roadmaps-specific, but the roadmaps page inherits it. Hardening this is tracked separately (gap report §4.1) and is out of scope here. |
| 🟢 | **No new API surface.** The module adds no routes under `/api/`, so there is no new endpoint to authenticate, validate, or rate-limit. This is the correct shape for a read-only content feature. |

---

## 6. Failure Recovery

| Sev | Finding |
|---|---|
| 🟢 | **DB outage degrades gracefully.** `getPlatformCourseMap()` catches, logs, returns `{}`. Course rows vanish from the amber block; lesson/task rows (no DB) still render; the page itself never 500s. Verified in the browser with the DB unreachable. |
| 🟢 | **Config drift is caught at build time.** `tests/roadmaps.test.ts` asserts every course key exists, every shipped course is linked, every lesson href names a real lesson with a matching title, every task href names a `sim` module, no duplicate key/href, no empty arrays. A renamed lesson or a typo'd slug fails `npm test` before `Build`. |
| 🟢 | **Schema drift is gated.** `npm run check:migrations` (I.15) fails if `drizzle-kit generate` would write anything. No schema change was made for this module, so there is nothing to drift. |
| 🟢 | **Unknown slug → 404.** `getRoadmapBySlug` returns `undefined` → `notFound()`. No partial render. |
| 🟢 | **Client hydration failure → error boundary.** Both segments have `error.tsx`; a crash shows the error UI instead of a blank page. |
| 🟡 | **`?node=` deep links are unreliable on a fresh document load.** The effect runs and reports `found=true` + calls `setSelectedId`, but the panel does not appear; clicking a node works. Root cause not yet determined (candidate: `useSearchParams` object identity in the effect deps). **Not a data-loss or security issue** — no state is written; the worst case is a shared link opens the map without the panel. Fix is a one-line dependency change once the cause is confirmed; tracked as an open item, not blocking launch. |
| 🟢 | **No client-side state corruption.** Progress is in `localStorage` keyed by slug; a corrupt value is scoped to one user's browser and cannot affect others. Reset is available via the in-panel button. |

---

## 7. Suggested improvements (prioritized)

1. **🟡 Make `/roadmaps/[slug]` ISR** (§1). Add `export const revalidate = 3600` (or `generateStaticParams` + revalidate). Single biggest scaling/latency win; the content is identical for all users and progress is client-side. Low risk.
2. **🟡 Add an in-memory edge rate limit to page routes** (§2) only if abuse appears — reuse `lib/memory-rate-limit.ts`, keyed on IP. Do not use the DB counter on a read path.
3. **🟡 Log unresolved platform keys at runtime** (§3) — one `log.warn` when the resolved map is missing a shipped key. Surfaces seed/DB drift between deploys.
4. **🟡 Lazy-load roadmap resources** (§1) — fetch per-node instead of shipping all 434 URLs in the initial payload. Defer until Lighthouse shows a cost.
5. **🟢 Fix the `?node=` deep-link effect** (§6) — one-line dependency change once the cause is confirmed. Improves shareability of roadmap node links.
6. **🟢 Leave the loose CSP as-is** for this module — it is app-wide and tracked in the gap report.

**Not recommended (and why):**
- **Do not add DB-backed rate limiting to pages.** It reintroduces a round-trip per read for no benefit; the data is cached and the invocation cap is not the bottleneck.
- **Do not add a DB write per "mark done".** Progress is deliberately client-side; moving it server-side would multiply TiDB writes by every interaction and consume the 50M RU budget.
- **Do not paginate roadmaps.** A roadmap is one page by design; the largest is ~40 nodes.
- **Do not add a new API route for this module.** There is no user input to validate and no state to mutate; adding one would only add an auth + rate-limit surface.

---

## 8. Verification checklist (pre-launch)

- [x] `npm test` green (717) — includes the both-directions `roadmaps.test.ts` gate
- [x] `npx tsc --noEmit` clean
- [x] `npm run build` green (`/roadmaps` static, `/roadmaps/[slug]` dynamic)
- [x] `npm run check:migrations` clean (no schema change)
- [x] DB outage drill: course links hide, lesson links render, no 500 (verified in browser)
- [x] Auth states: signed-out redirects to `/sign-in`; signed-in renders
- [x] Dark mode + responsive layout (panel `overflow-y-auto`, mobile sidebar clears the notice)
- [ ] **Manual:** ISR change (§1 item 1) measured with `npm run build` route-table diff before/after
- [ ] **Manual:** Lighthouse on `/roadmaps/frontend` to confirm hydration cost is acceptable
EOF
echo "written"; wc -l docs/production-review-roadmaps-module.md