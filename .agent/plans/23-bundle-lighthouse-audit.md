# Plan 23 — Bundle Analyzer + Lighthouse Audit (Free-Tier Aware)

**Branch:** `chore/bundle-lighthouse-audit-plan`
**Status:** Draft — planning only. No code changes yet.
**Phase:** Cross-cutting / Infrastructure (not tied to a feature phase)
**Owner:** Solo dev (Jack)

---

## 0. Purpose

Add two **local, free, read-only diagnostic tools** to the verification workflow so that every feature's impact on bundle size and runtime performance is measured *before* commit, while protecting Vercel free-tier and TiDB free-tier quotas.

Tools:
1. **`@next/bundle-analyzer`** — interactive treemap of client + server chunks.
2. **Lighthouse (desktop preset)** — per-route Performance / Accessibility / Best Practices / SEO scores + Core Web Vitals.

Both run on the developer's machine. Neither consumes Vercel CPU, TiDB RU, or Mistral RPM. The only DB touch is the production `npm run build`, which is already required by CI and already DB-dependent (see gap report I.12).

---

## 1. Core principle — "Think before fix"

> **Every proposed fix must be checked against free-tier impact before it is applied.**
> If a fix does not reduce Vercel CPU / TiDB RU / bandwidth / build minutes, or actively increases them, **do not touch it** — even if it improves a Lighthouse score.

Rules:

1. **Measure first.** No optimization without a baseline number (bundle KB, Lighthouse score, TiDB RU/query count).
2. **Know the context.** Before changing any file, understand *why* it was implemented that way (read the plan, ADR, code comments, and the relevant production-review doc). A pattern that looks wasteful may exist to protect a free-tier limit.
3. **Classify every finding** as 🟢 safe / 🟡 think / 🔴 avoid using the rubric in §4.
4. **Quantify the delta.** "Reduces First Load JS from 180KB to 120KB (-33%)" — not "makes it faster".
5. **Prefer doing nothing** when the impact is unmeasured or the trade-off is unclear. A no-op is cheaper than a regression.
6. **Never add a dependency to shrink the bundle** unless the net size delta is negative and measured.
7. **Never add runtime DB work to improve a score** (e.g., caching via a new table) — reuse existing tables/columns and `unstable_cache`.

---

## 2. Free-tier budget (what we protect)

| Resource | Free limit | Primary threat |
|----------|-----------|----------------|
| Vercel bandwidth | 100 GB/mo | Large JS bundles, unoptimized images, no caching |
| Vercel CPU | 4 CPU-hr/mo (60s/function cap) | Heavy SSR, per-request DB work, cold starts |
| Vercel build minutes | 6,000/mo | Frequent rebuilds, heavy deps |
| Vercel image optimization | limited/mo | Runtime `next/image` remote optimization |
| TiDB RU | ~50 RU/1M reads, 500 RU/1M writes | Uncached SSR queries, writes on keystroke |
| TiDB storage | 0.5 GB | Bloat, no soft-delete cleanup |
| TiDB connections | 5 pooled | Unbounded concurrency |
| Mistral RPM | free tier | Per-request AI calls without rate limit |
| Clerk MAU | 10,000 | (not a concern yet) |

### Highest-impact free-tier fix (preview, unverified)
ISR + on-demand revalidation on SSR content routes (courses, interview chapters, problems, system-design). These hit TiDB on every request. The site-notice module already proves the pattern (`unstable_cache` + `revalidateTag` on admin write). This is a 🟡 item — freshness trade-off must be approved per route. **Do not apply without measuring RU first.**

---

## 3. Tool 1 — Bundle Analyzer

### 3.1 Setup (Part A)

1. Install devDep: `npm install -D @next/bundle-analyzer`
2. Wrap `next.config.ts`:
   ```ts
   import bundleAnalyzer from "@next/bundle-analyzer";
   const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });
   export default withBundleAnalyzer(nextConfig);
   ```
3. Add script: `"analyze": "ANALYZE=true npm run build"`
4. Add to `.gitignore`: `.next/analyze/`
5. Run once → baseline treemaps (client + server). Identify top chunks (expected offenders: `@monaco-editor/react` ~2MB, `recharts`, `react-markdown` + `rehype-highlight`, `@clerk/nextjs`).

### 3.2 Usage cadence
- On demand, before large PRs. Not every commit.
- Compare treemap against the previous run; flag any new >100KB chunk.

### 3.3 Candidate optimizations (apply only with measured evidence)
- Dynamic import heavy, route-specific libs (`next/dynamic`, `ssr: false` for Monaco).
- `experimental.optimizePackageImports` for `lucide-react`, `recharts`, radix.
- Tree-shake `date-fns` (named imports only).
- Remove unused deps via `depcheck`.

### 3.4 Free-tier impact of bundle fixes
🟢 All bundle-size reductions reduce Vercel bandwidth + parse CPU. Safe wins — apply freely once measured.

---

## 4. Tool 2 — Lighthouse (desktop)

### 4.1 Scope

**Core (always audit, ~12 routes):**
`/`, `/dashboard`, `/courses`, `/problems`, `/interview`, `/mentor`, `/profile`, `/blog`, 5 blog posts, `/system-design`, `/editor`, `/whats-new`, `/feedback`

**Dynamic samples (1 representative each):**
`/courses/[id]`, `/learn/[courseId]/[chapterId]`, `/problems/[slug]`, `/interview/[category]`, `/system-design/[module]`, `/system-design/[module]/lesson/[lesson]`, `/system-design/[module]/task`

**Auth/admin (signed-out shell only):**
`/sign-in`, `/admin`, `/admin/users`, `/admin/feedback`, `/admin/site-notice`

**Excluded (variants of audited templates):** custom-practice, practice, stack, customize.

### 4.2 Method

1. `npm run build` (production; requires DB — warm up TiDB first).
2. `npm run start` on port 3000, backgrounded.
3. Warm-up request to `/interview` (TiDB cold start 10–15s).
4. For each route:
   ```
   npx lighthouse http://localhost:3000/<route> \
     --preset=desktop --output=json --output-path=./.lhr/<slug>.json \
     --chrome-flags="--headless --no-sandbox" --quiet
   ```
5. Parse scores + top 5 audits (by savings/weight) + LCP/CLS/TBT/FCP.
6. Aggregate into `docs/lighthouse-audit-<date>.md`.

### 4.3 Authenticated routes
Audit the signed-out shell by default (that's what crawlers/anonymous visitors see). Optional `--auth-cookie` flag for logged-in UX. Do not treat the login shell score as the app score.

### 4.4 Free-tier considerations
- Lighthouse runs locally → zero Vercel/TiDB/Mistral cost.
- Findings must be filtered through free-tier impact (see §4.6 rubric). A score improvement that increases RU or bandwidth is not a win.
- TiDB cold starts inflate LCP on cold routes → warm up first; flag cold-start suspects in the report.
- Vercel image optimization quota → `next/image` remote optimization is a quota risk; prefer static/CDN assets or `unoptimized` where needed.
- Prefetching every route burns bandwidth (100GB) → prefetch on hover, limit to critical paths.

---

## 5. Fix classification rubric (apply to every finding)

For every Lighthouse/bundle finding, the report includes:

```
Finding: <audit name>
Route(s): ...
Score impact: High/Med/Low
Free-tier impact: Vercel CPU / TiDB RU / Bandwidth / none
Risk: Low / Med / High
Category: 🟢 safe / 🟡 think / 🔴 avoid
Recommendation: Fix now / Approve trade-off / Skip
Estimated quota delta: e.g. "-33% First Load JS"
```

### 🟢 Safe wins — fix freely (zero or negative quota cost)
Image dimensions/alt/CLS reservation; `next/image` with proper `sizes` + modern formats; remove unused JS/tree-shake; dynamic import heavy libs; font `display: swap`; meta/SEO tags; accessibility; caching headers on static assets; `optimizePackageImports`; remove unused deps; lazy-load below-the-fold.

### 🟡 Think before fixing — trade-offs, decide per case
ISR/revalidate on SSR pages (freshness vs RU); `unstable_cache` for DB counts (memory + staleness); prefetching strategy; lazy Monaco (first-interaction latency); reducing animation (design loss); removing deps (feature loss); runtime image optimization (Vercel image quota); edge runtime (complexity); memoization (complexity).

### 🔴 Avoid / gate heavily — free-tier dangerous
DB-backed analytics/view counters; real-time polling/websockets/SSE; middleware that queries DB; writing to DB on every keystroke; auto-rebuild on content change; uncached SSR for high-traffic pages; adding a second DB/cache service; runtime image optimization for all remote images; prefetching every route on load.

**Rule:** 🟢 auto-recommended. 🟡 ship only after approving the trade-off. 🔴 never without explicit approval.

---

## 6. Workflow integration

### 6.1 `package.json` scripts
```json
"analyze": "ANALYZE=true npm run build",
"lighthouse": "node scripts/lighthouse-audit.mjs",
"verify": "npm test && npm run typecheck && npm run build"
```

### 6.2 `scripts/lighthouse-audit.mjs` (new)
- Reads route list from `scripts/lighthouse-routes.txt` (one path per line, `#` comments).
- Assumes `npm run start` is running on port 3000; fails fast with a clear message otherwise.
- Writes per-route JSON to `.lhr/` (gitignored) and a summary Markdown to `docs/lighthouse-<date>.md`.
- Auth-gated routes audited as signed-out shell by default; optional `--auth-cookie`.
- Warm-up request to `/interview` before starting; flag cold-start suspects.

### 6.3 `scripts/lighthouse-routes.txt`
Tier-1 + Tier-2 sample routes. Editable without code changes. New features add their route here as part of the PR.

### 6.4 `lighthouse-budget.json` (soft gate, warn only for first month)
```json
{
  "performance": 80, "accessibility": 90, "bestPractices": 90, "seo": 90,
  "maxFirstLoadJS_KB": 150, "maxLCP_ms": 2500
}
```
Script exits 1 on miss (local gate, not CI).

### 6.5 Workflow (WORKFLOW.md Step 7)
```
- npm run build           (always)
- npm run analyze         (only if deps/heavy components added)
- npm run lighthouse      (only for UI/perf-sensitive features; 3-5 key routes)
- Manual: dark mode, mobile, signed-in/out states
- You commit
```

### 6.6 Final Checks (ENGINEERING.md) additions
```
- [ ] Bundle: no new >100KB chunk added without justification
- [ ] Lighthouse desktop: no route regressed vs baseline (soft gate)
- [ ] Free-tier: any new SSR/DB work is cached or ISR'd
```

### 6.7 `.gitignore` additions
`.lhr/`, `.next/analyze/`.

---

## 7. What we are NOT doing (to keep it lean)

- No Lighthouse in CI — too heavy, server-dependent, DB-dependent build. Local gate only.
- No bundle-size tracking service (bundlewatch etc.) — `analyze` + build output is enough at this scale.
- No automatic commit gating — performance is a local discipline, not a CI blocker.
- No hard budget gate on day one — soft (warn) for the first month, then harden once baseline is stable.
- No per-route audit on every commit — only key routes, only before releases / perf-sensitive changes.

---

## 8. What is more valuable than all of this

`@vercel/analytics` and `@vercel/speed-insights` are already installed. **After deploy, watch those dashboards.** Real user data on real devices/networks beats 100 localhost Lighthouse runs. Run Lighthouse on a specific route only when RUM shows it is slow. That is how real teams prioritize performance work — by measured impact, not speculative audits.

---

## 9. Execution order (when approved)

1. Part A — add bundle analyzer + script + `.gitignore`. (Task 1)
2. Run `npm run build` baseline + `npm run analyze` once. (Task 2)
3. Create `scripts/lighthouse-audit.mjs` + `scripts/lighthouse-routes.txt` + `lighthouse-budget.json`. (Task 3)
4. Run Lighthouse over Tier-1 routes against prod build; generate first report. (Task 4)
5. Wire workflow docs (WORKFLOW.md Step 7, ENGINEERING.md Final Checks). (Task 5)
6. Hand to user for review — no auto-commit.

Each task stops for manual verification before the next.

---

## 10. Open decisions (need your input)

1. Budget thresholds — `Perf ≥ 80`, `A11y ≥ 90`, `BP ≥ 90`, `SEO ≥ 90`, `First Load JS ≤ 150KB`, `LCP ≤ 2.5s`? Or adjust?
2. Lighthouse against dev server (fast, inflated) or prod build (accurate, needs build)? Recommend: dev for quick checks, prod for pre-commit on big features.
3. Route list scope — Tier-1 only (~12 routes, ~6 min) or Tier-1 + Tier-2 samples (~19 routes, ~10 min)?
4. Add a "perf" section to PR descriptions (bundle delta + Lighthouse before/after)?

---

## 11. Context-preservation rule for any future fix

Before editing any file to "fix" a performance/bundle finding:

- Read the feature plan in `.agent/plans/` and the relevant `docs/production-review-*.md`.
- Read the code comments around the target (free-tier constraints are usually documented there, e.g., `config/db.tsx`, `lib/db-rate-limit.ts`).
- State in the PR/commit: **why it was like this**, **what changes after**, **measured delta**, **free-tier impact (🟢/🟡/🔴)**.
- If the delta is unmeasured or the trade-off unclear → do not touch.

---

## Today You Learned (concepts)

- Bundle analysis is standard; per-route Lighthouse on every commit is not.
- RUM (already installed) is the real production signal; synthetic Lighthouse is a local diagnostic.
- Free-tier fixes must be classified by quota impact, not just score impact.
- The highest-leverage free-tier win is likely ISR + on-demand revalidation on SSR content routes — but only after measuring RU.
