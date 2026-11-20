# Roadmaps — Production Review Fixes

> **Branch:** `fix/roadmaps-production-review` (cut from `development-branch` after merging `feature/roadmaps-module`)
> **Source:** `docs/production-review-roadmaps-module.md` §7
> **Target:** 500 users on TiDB Cloud Starter (free) + Vercel Hobby (free).
> **Status:** Items 1 and 3 done (2026-11-20). Items 2, 4, 5 remain deferred/open. Run `npm test`, `npx tsc --noEmit`, `npm run build` after each.

## Priority legend

- 🔴 Blocker for launch
- 🟡 Worth doing before launch
- 🟢 Nice to have / defer

---

## ✅ 1. Make `/roadmaps/[slug]` ISR — DONE (2026-11-20)

**Why:** content is identical for every user (progress lives in `localStorage`), yet the route was `ƒ` (dynamic) and ran a server function per pageview. At 500 users × ~5 views/day ≈ 75k/month (under the 1M cap, but avoidable work + cold-start latency).

**Where:** `app/(routes)/roadmaps/[slug]/page.tsx`

**Change (done):** added `generateStaticParams` + `export const revalidate = 3600`. Build now shows `●` with all 5 slugs prerendered (`frontend`, `backend`, `full-stack`, `ai-engineer`, `system-design`). tsc clean, 718 tests pass, format:check green. Auth still enforced at the proxy.

**Verify:** `npm run build` route table flipped `ƒ` → `●`; `npm test` green.

**Effort:** small. **Done.**

---

## 🟡 2. In-memory edge rate limit on page routes (only if abuse appears)

**Why:** `/api/*` is rate-limited (`config/rate-limits.ts`) but page routes are not. A scraper can drive one server function per request. Data is cached so the DB is untouched; Vercel's 1M invocation cap is the only exposure.

**Where:** `proxy.ts` (currently auth-only by design) + `lib/memory-rate-limit.ts`.

**Change:** reuse the existing in-memory limiter, keyed on IP, for `/roadmaps(.*)` and other page routes. Do **not** use the DB-backed counter on a read path.

**Verify:** hammer `/roadmaps/frontend` beyond the limit → 429; normal browsing unaffected.

**Effort:** small. **Defer unless abuse is observed.**

---

## ✅ 3. Log unresolved platform keys at runtime — DONE (2026-11-20)

**Why:** `getPlatformCourseMap()` returned `{}` only on a thrown error. If the DB answers but a shipped course key is unresolved (renamed course, seed drift), course links silently vanish with no signal between deploys. The build gate catches it at build time, but a runtime warn surfaces drift earlier.

**Where:** `lib/roadmap-platform.ts` (`getPlatformCourseMap`); `config/roadmaps/platform.ts` (`findUnresolvedCourseKeys`).

**Change (done):** added `findUnresolvedCourseKeys()` (pure, tested) and `log.warn("platform course unresolved", { unresolvedKeys })` in the loader. 1 new test (13 in `roadmaps-platform.test.ts`).

**Verify:** unit test passes; tsc clean.

**Effort:** small. **Done.**

---

## 🟢 4. Lazy-load roadmap resources

**Why:** all 434 external resource entries ship in the initial payload of `/roadmaps/[slug]` (frontend roadmap ≈ 33 KB source, ~15–25 KB gzipped). Hydration cost scales with node × resource count.

**Where:** `app/(routes)/roadmaps/_components/RoadmapDetailPanel.tsx` (resources list) and/or `config/roadmaps/*.ts`.

**Change:** fetch resources per node on panel open instead of serializing them all up front. Or split the tree so only the visible stage hydrates.

**Verify:** Lighthouse on `/roadmaps/frontend` shows a measurable reduction in initial JS; `npm test` + `npm run build` green.

**Effort:** medium. **Defer until Lighthouse shows a real cost** (≤ ~40 nodes/roadmap is fine today).

---

## 🟢 5. Fix the `?node=` deep-link effect

**Why:** the effect runs and reports `found=true` + calls `setSelectedId`, but the panel does not appear on a fresh document load. Clicking a node works. Suspect: `useEffect` dependency on `searchParams` (object identity) rather than the primitive `node` value.

**Where:** `app/(routes)/roadmaps/_components/RoadmapTree.tsx` (the deep-link `useEffect`).

**Change:** depend on `searchParams.get("node")` (primitive) instead of the `searchParams` object. Confirm empirically that deep links open reliably before merging.

**Verify:** open `/roadmaps/frontend?node=html` in a fresh tab → panel opens without a click; repeat 5×.

**Effort:** small. **Cause not yet confirmed — investigate before fixing.**

---

## Not recommended (and why)

- **DB-backed rate limiting on pages** — reintroduces a round-trip per read for no benefit; data is cached.
- **Server-side "mark done" writes** — progress is deliberately client-side; moving it server-side multiplies TiDB writes by every interaction and burns the 50M RU budget.
- **Pagination of roadmaps** — a roadmap is one page by design; largest is ~40 nodes.
- **A new API route for this module** — no user input to validate, no state to mutate; adds an auth + rate-limit surface for nothing.
- **Hardening the loose CSP** (`script-src 'unsafe-inline' 'unsafe-eval'`) — app-wide, tracked in `docs/engineering-gap-report.md` §4.1, out of scope here.

## Definition of done

- [x] Item 1 done.
- [x] Item 3 done.
- [ ] Items 2, 4, 5 done or explicitly deferred with a note.
- [ ] `npm test`, `npx tsc --noEmit`, `npm run build`, `npm run check:migrations` all green.
- [ ] `docs/production-review-roadmaps-module.md` §7 updated to reflect what was fixed. (done)
- [ ] Feature tracker row `5.9` flipped to `Done` when merged.
EOF
echo "recreated"