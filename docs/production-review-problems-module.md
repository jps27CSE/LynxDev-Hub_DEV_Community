# Production Review — Problems Module (500 Concurrent Users, Free Tier)

> **Date:** 2026-08-06
> **Last updated:** 2026-08-20 — Tier 1 (1.1 content cache, 1.2 sandbox via editor fix, 1.3 seed guard) + 2.1 (log.timed) implemented
> **Scope:** `/problems` workspace, in-house Basic track (36), top LeetCode set (183), shared browser editor
> **Stack:** Next.js 16 on Vercel Hobby | TiDB Cloud Starter (Free) | Clerk Hobby
> **Basis:** free-tier caps verified in `docs/production-review-500-users.md` (2026-07-27)

## Verdict

The problems module is the **most scale-safe module in the app**:

- Zero API routes → no rate-limit surface, nothing to abuse
- No per-user DB writes (solved state is localStorage)
- Monaco (~5MB) served from jsDelivr CDN — never touches Vercel bandwidth
- Statements served server-side at ~1-5 KB per problem (237KB dataset stays on the server)

**Nothing module-specific breaks at 500 users.** The one real gap is architectural
inconsistency: **no cross-request caching** — the app already built `lib/content-cache.ts`
(`unstable_cache`) and uses it for dashboard/interview data, but the problems module
re-queries the DB on every page view.

---

## 1. Performance

| Finding | Evidence | Severity |
|---|---|---|
| Every page view = 3 DB queries, uncached across requests | **Fixed 2026-08-20** — `getAllProblems` + `getProblemById` wrapped in `createContentCache` (tag `problems`, TTL 3600, version-bump invalidation) at the DB layer; sidebar, workspace, and `/editor` all inherit. Failures throw out of the cache (never cached) and fall back fresh | ✅ |
| The app's own cache layer is bypassed | **Fixed 2026-08-20** — problems now uses the same `createContentCache` pattern as interview-data / dashboard-stats (`lib/problem-data.ts:16-29`). Bump `PROBLEMS_DATA_CACHE_VERSION` on reseed | ✅ |
| Monaco loading — good | `next/dynamic` + `ssr:false` (`components/editor/MonacoEditor.tsx:5`); `@monaco-editor/react` loads Monaco from jsDelivr CDN | ✅ |
| Client bundle hygiene — good | `TOP_STATEMENTS` (237KB) is server-only; all workspace imports are `import type` (erased at compile time) | ✅ |
| Query volume: COUNT + SELECT | Could be a single SELECT with `count` in the row — marginal, moot once cached | 🟢 |

## 2. Scaling (RU Math)

| Metric | Value |
|---|---|
| Views: 500 users × 3/day | 45,000 / month |
| RU per view (uncached) | ~50-60 RU → **~6.5-8M RU/month** = 13-16% of the 50M budget. Survivable, but wasteful and unnecessary |
| RU per view (cached, TTL 1h) | ~0 after warm-up ✅ (**Fixed 2026-08-20**) |
| Vercel invocations | 45K/mo vs 1M cap = **4.5%** ✅ |
| Vercel bandwidth | HTML + statement ≈ 50KB/view ≈ 2.2 GB/mo vs 100 GB cap ✅ |
| First bottleneck | Nothing module-specific — global RU/CPU budget. (Mentor/AI is the app-wide killer, see `production-review-500-users.md`) |

## 3. Monitoring

| Gap | Detail | Fix |
|---|---|---|
| No slow-query visibility in this module | `lib/logger.ts` already ships `log.timed()` (warns > 250ms via `SLOW_DB_THRESHOLD_MS`) — **zero usages in the codebase** | **Fixed 2026-08-20** — `getAllProblems` + `getProblemById` wrapped in `log.timed` (first usages); slow-DB warnings surface in Vercel logs, cold-cache path only |
| No real-user metrics | Vercel Analytics / Speed Insights still deferred (July doc Tier 3.1) | Enable when launching — free, 0.2 hr |
| Client Run failures surface in UI only | Worker errors shown in the Run panel, never reported | Acceptable at this scale; Sentry intentionally deferred (July doc 2.4) |

## 4. Logging

| Finding | Detail |
|---|---|
| ✅ Consistent | `createLogger("problem-data")` + `log.error` on all catch paths (`lib/problem-data.ts:9,69,86,107`) |
| ✅ No new module logging needed | `notFound()` on bad slugs intentionally unlogged (avoids scanner noise) |

## 5. Security

| Finding | Detail | Severity / Fix |
|---|---|---|
| **Worker sandbox is leaky** | **Fixed 2026-08-20 via editor-module fix `38a16f0`** — `lib/editor.ts` shadows `fetch` / `XMLHttpRequest` / `WebSocket` / `importScripts` / `navigator` / `self` / `globalThis` / `postMessage` before evaluating user code. One fix covers `/problems`, `/editor`, and code-block Run | ✅ |
| Statements are static, inert markdown | No injection surface (no `dangerouslySetInnerHTML`) | ✅ |
| No API routes → no rate-limit surface | The DB-backed `rate_limits` work isn't needed here | ✅ |
| Opaque numeric IDs | `/problems/123` probing is harmless — public data | ✅ |
| Solved markers localStorage-only | Nothing server-side to attack | ✅ |

## 6. Failure Recovery

| Scenario | Today | After Fix |
|---|---|---|
| TiDB blip | In-house problems → `notFound()` 404; sidebar silently shows 0 in-house (the "empty vs error" gap, July doc §3.3) | **Fixed 2026-08-20** — content-cache serves cached summaries/statements through brief outages; failures throw out of the cache (never cached), so recovery is immediate once TiDB returns | ✅ |
| Accidental prod reseed | `config/seed-problems.ts` **clears the table with no guard** — one mistaken run wipes all 36 in-house problems | **Fixed 2026-08-20** — refuses to run when `NODE_ENV === "production"` unless `--force` is passed | ✅ |
| Infinite loop / hang in Run | 5s worker timeout + terminate — handled | ✅ |

---

## Prioritized Action Plan

### Tier 1 — Recommended (~1 hour total) — ✅ All done 2026-08-20

| # | Action | Benefit | Effort |
|---|--------|---------|--------|
| 1.1 | **Content-cache the problems queries** — wrap `getAllProblems` + `getProblemById` in `createContentCache` (tag `problems`, TTL 3600, bump `version` on reseed). Pattern already proven in `interview-data.ts` / `dashboard-stats.ts` | Saves ~7M RU/month, faster TTFB, DB blip resilience — module becomes DB-free at runtime. **✅ Done** | 0.5 hr |
| 1.2 | **Harden the worker sandbox** — strip `fetch` / `XMLHttpRequest` / `WebSocket` / `importScripts` in `lib/editor.ts` bootstrap | Removes the only real security gap in the module (and `/editor`, code-block Run). **✅ Done via editor fix `38a16f0`** | 0.25 hr |
| 1.3 | **Seed wipe guard** — refuse to clear the table in production | Ops safety: no accidental 36-problem wipe. **✅ Done** (`--force` to override) | 0.1 hr |

### Tier 2 — Optional

| # | Action | Note |
|---|--------|------|
| 2.1 | `log.timed` on the two problem queries | Slow-query visibility in Vercel logs (~10 min). **✅ Done 2026-08-20** — first `log.timed` usages in the codebase |
| 2.2 | ~~Move in-house problems to static config~~ | Content-cache achieves the same outcome — skip (YAGNI) |
| 2.3 | ~~Solved-state → DB table~~ | localStorage is *better* on free tier (zero RUs, zero writes). A DB table only makes sense for cross-device stats — product call, not infra |
