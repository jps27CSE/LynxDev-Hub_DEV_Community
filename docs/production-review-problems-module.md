# Production Review — Problems Module (500 Concurrent Users, Free Tier)

> **Date:** 2026-08-06
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
| Every page view = 3 DB queries, uncached across requests | `app/(routes)/problems/[slug]/page.tsx:14` → `resolveWorkspaceProblem` (1× `SELECT`, in-house only) + `getAllWorkspaceSummaries` → `getAllProblems` = COUNT + full-table SELECT (`lib/problem-data.ts:45-60`). `React cache()` dedupes *within* a request only — every navigation re-queries | 🟡 |
| The app's own cache layer is bypassed | `createContentCache` (`lib/content-cache.ts:19`) used by `lib/interview-data.ts:25` and `lib/dashboard-stats.ts:21` — problems is the odd one out. Problems data changes **only on reseed** | 🟡 |
| Monaco loading — good | `next/dynamic` + `ssr:false` (`components/editor/MonacoEditor.tsx:5`); `@monaco-editor/react` loads Monaco from jsDelivr CDN | ✅ |
| Client bundle hygiene — good | `TOP_STATEMENTS` (237KB) is server-only; all workspace imports are `import type` (erased at compile time) | ✅ |
| Query volume: COUNT + SELECT | Could be a single SELECT with `count` in the row — marginal, moot once cached | 🟢 |

## 2. Scaling (RU Math)

| Metric | Value |
|---|---|
| Views: 500 users × 3/day | 45,000 / month |
| RU per view (uncached) | ~50-60 RU → **~6.5-8M RU/month** = 13-16% of the 50M budget. Survivable, but wasteful and unnecessary |
| RU per view (cached, TTL 1h) | ~0 after warm-up |
| Vercel invocations | 45K/mo vs 1M cap = **4.5%** ✅ |
| Vercel bandwidth | HTML + statement ≈ 50KB/view ≈ 2.2 GB/mo vs 100 GB cap ✅ |
| First bottleneck | Nothing module-specific — global RU/CPU budget. (Mentor/AI is the app-wide killer, see `production-review-500-users.md`) |

## 3. Monitoring

| Gap | Detail | Fix |
|---|---|---|
| No slow-query visibility in this module | `lib/logger.ts` already ships `log.timed()` (warns > 250ms via `SLOW_DB_THRESHOLD_MS`) — **zero usages in the codebase** | Wrap the two problem queries with `log.timed` — slow-DB alerts surface in Vercel logs (~10 min) |
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
| **Worker sandbox is leaky** | User code runs with full worker globals: `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts` — **plus same-origin cookies**. A "paste a blog snippet" case could silently call `/api/*` or exfiltrate the user's own session data | 🟡 Strip the globals in the worker bootstrap (`lib/editor.ts:22-41`, ~8 lines). One fix covers `/problems`, `/editor`, and code-block Run |
| Statements are static, inert markdown | No injection surface (no `dangerouslySetInnerHTML`) | ✅ |
| No API routes → no rate-limit surface | The DB-backed `rate_limits` work isn't needed here | ✅ |
| Opaque numeric IDs | `/problems/123` probing is harmless — public data | ✅ |
| Solved markers localStorage-only | Nothing server-side to attack | ✅ |

## 6. Failure Recovery

| Scenario | Today | After Fix |
|---|---|---|
| TiDB blip | In-house problems → `notFound()` 404; sidebar silently shows 0 in-house (the "empty vs error" gap, July doc §3.3) | Content-cache serves stale summaries/statements through brief outages (stale-while-revalidate — verify Next 16 throw behavior at implementation) |
| Accidental prod reseed | `config/seed-problems.ts` **clears the table with no guard** — one mistaken run wipes all 36 in-house problems | Refuse to run when `NODE_ENV === "production"` (or require `--force`) |
| Infinite loop / hang in Run | 5s worker timeout + terminate — handled | ✅ |

---

## Prioritized Action Plan

### Tier 1 — Recommended (~1 hour total)

| # | Action | Benefit | Effort |
|---|--------|---------|--------|
| 1.1 | **Content-cache the problems queries** — wrap `getAllProblems` + `getProblemById` in `createContentCache` (tag `problems`, TTL 3600, bump `version` on reseed). Pattern already proven in `interview-data.ts` / `dashboard-stats.ts` | Saves ~7M RU/month, faster TTFB, DB blip resilience — module becomes DB-free at runtime | 0.5 hr |
| 1.2 | **Harden the worker sandbox** — strip `fetch` / `XMLHttpRequest` / `WebSocket` / `importScripts` in `lib/editor.ts` bootstrap | Removes the only real security gap in the module (and `/editor`, code-block Run) | 0.25 hr |
| 1.3 | **Seed wipe guard** — refuse to clear the table in production | Ops safety: no accidental 36-problem wipe | 0.1 hr |

### Tier 2 — Optional

| # | Action | Note |
|---|--------|------|
| 2.1 | `log.timed` on the two problem queries | Slow-query visibility in Vercel logs (~10 min) |
| 2.2 | ~~Move in-house problems to static config~~ | Content-cache achieves the same outcome — skip (YAGNI) |
| 2.3 | ~~Solved-state → DB table~~ | localStorage is *better* on free tier (zero RUs, zero writes). A DB table only makes sense for cross-device stats — product call, not infra |
