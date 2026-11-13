# Plan 23 — Lighthouse Desktop Audit (Free-Tier Aware)

**Branch:** `chore/lighthouse-audit`
**Status:** In progress — tooling implemented, baseline pending
**Phase:** Cross-cutting / Infrastructure (not tied to a feature phase)
**Owner:** Solo dev (Jack)

---

## 0. Purpose

Add a **local, free, read-only Lighthouse (desktop preset) audit** to the verification workflow so that every feature's impact on runtime performance and Core Web Vitals is measured *before* commit, while protecting Vercel free-tier and TiDB free-tier quotas.

Lighthouse runs on the developer's machine. It consumes zero Vercel CPU, TiDB RU, or Mistral RPM. The only DB touch is the production `npm run build`, which is already required by CI and already DB-dependent (see gap report I.12).

Bundle analysis (`@next/bundle-analyzer`) was considered and **deliberately excluded** — see §7.

---

## 1. Core principle — "Think before fix"

> **Every proposed fix must be checked against free-tier impact before it is applied.**
> If a fix does not reduce Vercel CPU / TiDB RU / bandwidth / build minutes, or actively increases them, **do not touch it** — even if it improves a Lighthouse score.

Rules:

1. **Measure first.** No optimization without a baseline number (Lighthouse score, Core Web Vitals, TiDB RU/query count).
2. **Know the context.** Before changing any file, understand *why* it was implemented that way (read the plan, ADR, code comments, and the relevant production-review doc). A pattern that looks wasteful may exist to protect a free-tier limit.
3. **Classify every finding** as 🟢 safe / 🟡 think / 🔴 avoid using the rubric in §5.
4. **Quantify the delta.** "LCP from 2.8s to 1.9s" — not "makes it faster".
5. **Prefer doing nothing** when the impact is unmeasured or the trade-off is unclear. A no-op is cheaper than a regression.
6. **Never add runtime DB work to improve a score** (e.g., caching via a new table) — reuse existing tables/columns and `unstable_cache`.

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

## 3. Tool — Lighthouse (desktop)

### 3.1 Scope

**Core (always audit, ~12 routes):**
`/`, `/dashboard`, `/courses`, `/problems`, `/interview`, `/mentor`, `/profile`, `/blog`, 5 blog posts, `/system-design`, `/editor`, `/whats-new`, `/feedback`

**Dynamic samples (1 representative each, optional):**
`/courses/[id]`, `/learn/[courseId]/[chapterId]`, `/problems/[slug]`, `/interview/[category]`, `/system-design/[module]`, `/system-design/[module]/lesson/[lesson]`, `/system-design/[module]/task`

**Auth/admin (signed-out shell only):**
`/sign-in`, `/admin`, `/admin/users`, `/admin/feedback`, `/admin/site-notice`

**Excluded (variants of audited templates):** custom-practice, practice, stack, customize.

### 3.2 Method

1. `npm run build` (production; requires DB — warm up TiDB first).
2. `npm run start` on port 3000, backgrounded.
3. Warm-up request to `/interview` (TiDB cold start 10–15s).
4. For each route in `scripts/lighthouse-routes.txt`:
   ```
   npx lighthouse http://localhost:3000/<route> \
     --preset=desktop --output=json --output-path=./.lhr/<slug>.json \
     --chrome-flags="--headless --no-sandbox" --quiet
   ```
5. Parse scores + top 5 audits (by savings/weight) + LCP/CLS/TBT/FCP.
6. Aggregate into `docs/lighthouse-<date>.md`.

### 3.3 Authenticated routes
Audit the signed-out shell by default (that's what crawlers/anonymous visitors see). Optional `--auth-cookie` flag for logged-in UX. Do not treat the login shell score as the app score.

### 3.4 Free-tier considerations
- Lighthouse runs locally → zero Vercel/TiDB/Mistral cost.
- Findings must be filtered through free-tier impact (see §5 rubric). A score improvement that increases RU or bandwidth is not a win.
- TiDB cold starts inflate LCP on cold routes → warm up first; flag cold-start suspects in the report.
- Vercel image optimization quota → `next/image` remote optimization is a quota risk; prefer static/CDN assets or `unoptimized` where needed.
- Prefetching every route burns bandwidth (100GB) → prefetch on hover, limit to critical paths.

---

## 4. Tooling (implemented)

| File | Purpose |
|------|---------|
| `scripts/lighthouse-audit.mjs` | Runner: warms up TiDB, runs Lighthouse desktop per route, writes per-route JSON + Markdown report, soft budget check |
| `scripts/lighthouse-routes.txt` | Route list (Tier 1 core + 5 blog posts; Tier 2 dynamic samples commented out) |
| `lighthouse-budget.json` | Soft budget (Perf ≥80, A11y ≥90, BP ≥90, SEO ≥90, LCP ≤2.5s, CLS ≤0.1, TBT ≤300ms) — warn only |
| `package.json` | Added `"lighthouse": "node scripts/lighthouse-audit.mjs"` |
| `.gitignore` | Added `/.lhr/` (raw per-route JSON) |

### Usage
```bash
# Production (recommended — accurate numbers)
npm run build && npm run start          # in one terminal
npm run lighthouse                      # in another

# Quick check against dev server (inflated scores, but fast)
npm run dev
npm run lighthouse
```

Output: `docs/lighthouse-<date>.md` (summary table + per-route top audits) + `.lhr/<slug>.json` (raw, gitignored).

### Auth-gated routes
Pass `--auth-cookie="session=..."` to audit a logged-in view.

---

## 5. Fix classification rubric (apply to every finding)

For every Lighthouse finding, the report includes:

```
Finding: <audit name>
Route(s): ...
Score impact: High/Med/Low
Free-tier impact: Vercel CPU / TiDB RU / Bandwidth / none
Risk: Low / Med / High
Category: 🟢 safe / 🟡 think / 🔴 avoid
Recommendation: Fix now / Approve trade-off / Skip
Estimated quota delta: e.g. "LCP 2.8s -> 1.9s"
```

### 🟢 Safe wins — fix freely (zero or negative quota cost)
Image dimensions/alt/CLS reservation; `next/image` with proper `sizes` + modern formats; font `display: swap`; meta/SEO tags; accessibility; caching headers on static assets; lazy-load below-the-fold; removing unused deps.

### 🟡 Think before fixing — trade-offs, decide per case
ISR/revalidate on SSR pages (freshness vs RU); `unstable_cache` for DB counts (memory + staleness); prefetching strategy; reducing animation (design loss); removing deps (feature loss); runtime image optimization (Vercel image quota); edge runtime (complexity); memoization (complexity).

### 🔴 Avoid / gate heavily — free-tier dangerous
DB-backed analytics/view counters; real-time polling/websockets/SSE; middleware that queries DB; writing to DB on every keystroke; auto-rebuild on content change; uncached SSR for high-traffic pages; adding a second DB/cache service; runtime image optimization for all remote images; prefetching every route on load.

**Rule:** 🟢 auto-recommended. 🟡 ship only after approving the trade-off. 🔴 never without explicit approval.

---

## 6. Workflow integration

### 6.1 Recommended cadence
```
After coding + tests:
  1. npm run build           (always)
  2. npm run lighthouse      (only for UI/perf-sensitive features; core routes)
  3. Manual: dark mode, mobile, signed-in/out states
  4. You commit
```

### 6.2 Final Checks (ENGINEERING.md) additions (pending)
```
- [ ] Lighthouse desktop: no route regressed vs baseline (soft gate)
- [ ] Free-tier: any new SSR/DB work is cached or ISR'd
```

### 6.3 What we are NOT doing (to keep it lean)
- No Lighthouse in CI — too heavy, server-dependent, DB-dependent build. Local gate only.
- No automatic commit gating — performance is a local discipline, not a CI blocker.
- No hard budget gate on day one — soft (warn) for the first month, then harden once baseline is stable.
- No per-route audit on every commit — only core routes, only before releases / perf-sensitive changes.

---

## 7. Why bundle analysis was excluded

`@next/bundle-analyzer` (and the Turbopack-native `next analyze`) were evaluated and **deliberately excluded**:

1. **`@next/bundle-analyzer` is webpack-based**, but this app builds with Turbopack by default. Running `ANALYZE=true next build --webpack` produces a treemap, but it does not reflect the production (Turbopack) bundle, so the numbers are not trustworthy for production decisions.
2. **The Turbopack-native `next analyze`** command panics on this app's Clerk server actions and is a diagnostics viewer, not a treemap.
3. **The highest-leverage free-tier win is backend (TiDB RU via ISR/caching), not frontend bundle size.** Frontend bundle size is a real but secondary concern (Vercel bandwidth, 100 GB/mo). It is not worth adding a tool that cannot measure the production bundle accurately.
4. **RUM (`@vercel/analytics` + `@vercel/speed-insights`, already installed) is the real production signal** and costs nothing. Synthetic Lighthouse is a local diagnostic; RUM reflects real users on real networks.

If bundle analysis is needed later, re-add with `npm install -D @next/bundle-analyzer` and the webpack wrapper — the integration is documented in git history (commit `a98dcce` era). Keep it as a separate, opt-in tool, not part of the default workflow.

---

## 8. What is more valuable than all of this

`@vercel/analytics` and `@vercel/speed-insights` are already installed. **After deploy, watch those dashboards.** Real user data on real devices/networks beats 100 localhost Lighthouse runs. Run Lighthouse on a specific route only when RUM shows it is slow. That is how real teams prioritize performance work — by measured impact, not speculative audits.

---

## 9. Execution order (when approved)

1. ✅ Tooling implemented (script, route list, budget, package.json, .gitignore).
2. ⏳ Run Lighthouse over core routes against prod build; generate first report. (Task 2)
3. ⏳ Wire workflow docs (WORKFLOW.md Step 7, ENGINEERING.md Final Checks). (Task 3)
4. ⏳ Hand to user for review — no auto-commit.

Each task stops for manual verification before the next.

---

## 10. Open decisions (need your input)

1. Budget thresholds — `Perf ≥ 80`, `A11y ≥ 90`, `BP ≥ 90`, `SEO ≥ 90`, `LCP ≤ 2.5s`, `CLS ≤ 0.1`, `TBT ≤ 300ms`? Or adjust?
2. Route list scope — Tier-1 only (~12 routes) or include Tier-2 dynamic samples (~19 routes)?
3. Add a "perf" section to PR descriptions (Lighthouse before/after)?
4. Wire the Lighthouse gate into ENGINEERING.md Final Checks now, or after the first baseline?

---

## 11. Context-preservation rule for any future fix

Before editing any file to "fix" a Lighthouse finding:

- Read the feature plan in `.agent/plans/` and the relevant `docs/production-review-*.md`.
- Read the code comments around the target (free-tier constraints are usually documented there, e.g., `config/db.tsx`, `lib/db-rate-limit.ts`).
- State in the PR/commit: **why it was like this**, **what changes after**, **measured delta**, **free-tier impact (🟢/🟡/🔴)**.
- If the delta is unmeasured or the trade-off unclear → do not touch.

---

## Today You Learned (concepts)

- Synthetic Lighthouse is a local diagnostic; RUM (already installed) is the real production signal.
- Free-tier fixes must be classified by quota impact, not just score impact.
- The highest-leverage free-tier win is likely ISR + on-demand revalidation on SSR content routes — but only after measuring RU.
- Bundle analysis was evaluated and excluded because it cannot measure the production (Turbopack) bundle accurately on this stack.