# Production Review — Interview Modules for 500 Concurrent Users

> **Date:** 2026-08-03
> **Stack:** Next.js 16 on Vercel Hobby | TiDB Cloud Starter (Free) | Clerk Hobby | Mistral AI (Free/Experiment)
> **Scope:** All interview modules — chapter hub, practice, custom practice, stack, customize, home, and their 4 API routes
> **Baseline:** Live DB audit 2026-08-03 — 899 questions, 35 chapters, avg answer 1,074 chars (max 4,229). Per category: software-engineer 382, frontend-engineer 336, backend-engineer 306.
> **Context:** This is a focused follow-up to `docs/production-review-500-users.md`. Every constraint in that doc applies; this review only covers the interview section.

---

## Verified Good Baseline

| Item | Status | Where |
|------|--------|-------|
| `auth()` + Zod on all 4 interview API routes | ✅ | `app/api/interview/{questions,stack,questions-by-tags,generate}/route.ts` |
| Rate limits | ✅ | `config/rate-limits.ts` — questions 30/min, stack 20/min, questions-by-tags 20/min, generate 10/min, in-memory via middleware |
| React `cache()` on all data functions | ✅ | `lib/interview-data.ts` — all 11 interview fns wrapped |
| Chapter questions batched in 1 `inArray()` query | ✅ | `getQuestionsByChapterIds()` |
| Home page queries batched with `Promise.all` | ✅ | `interview/page.tsx` — 5 queries reduced to 3 |
| FK indexes on join tables | ✅ | Verified via `SHOW INDEX` — TiDB auto-created `question_id_fk`, `chapter_id_fk`, `fk_icc_category`, `fk_icc_chapter` |
| Error logging on all routes + data-fn catches | ✅ | `console.error("[interview/<route>] METHOD:", error)` pattern |
| `generate` is template-based, zero Mistral dependency | ✅ | No 1 RPM bottleneck on interview routes |
| TiDB pool config (5 conns, 25 queue) | ✅ | `config/db.tsx` |

---

## 1. Performance

### 🔴 Critical

| Issue | Evidence | Impact |
|-------|----------|--------|
| **Chapter hub ships ALL category questions in the initial payload** | `[category]/page.tsx` → `getQuestionsByChapterIds()` passes every question **with full answers** into the RSC payload. Software-engineer = 382 questions × ~1.1KB avg answer ≈ **500KB+ of answer text** + ~100KB chapter content per hub view — while only the active chapter's 10–20 questions are visible (answers expanded by default) | TTFB (serialization), bandwidth (500 users × ~12 views/mo ≈ **3–4 GB/mo on this one page** vs 100 GB cap), Vercel CPU (4 CPU-hrs/mo) |
| **`questions-by-tags` returns unbounded results** | `getQuestionsByCategorySlugAndTags()` (`lib/interview-data.ts:193`) calls `getQuestionsByCategorySlug()` with **no limit** then filters in JS. A no-tags POST returns up to 382 full answers ≈ **500KB JSON per request** — the one query the original doc's "pagination" item did not cover | RU, memory, bandwidth |

### 🟡 Medium

| Issue | Detail | Fix |
|-------|--------|-----|
| `getQuestionsByStack` full-table scan | `lib/interview-data.ts:327` — loads the `tags` column of all 899 rows + JS filter per POST. Fine at 899 rows, unbounded pattern | SQL-side filtering (JSON containment) or normalized `question_tags` table before data grows |
| Question cards not memoized | Toggling reviewed/collapse re-parses all expanded `AnswerMarkdown` (react-markdown + rehype-highlight) | `React.memo` on the question card + `next/dynamic` for the hub (doc Tier 4.1) |
| Practice prefetch silent-failure window | (fixed 2026-08-03) — now validates response, removes consumed offset, shows Retry | ✅ |

### 🟢 Quick Wins (already done)

- ✅ `getQuestionsByChapterIds()` — 1 query instead of N
- ✅ Home page: 5 queries → 3, `Promise.all`-parallel
- ✅ `ChapterRail` O(n²) `findIndex` → index map
- ✅ React `cache()` on all 11 interview data functions

---

## 2. Scaling

### Where the interview module hits limits first

```
500 users → 30 days (interview modules only):
┌─────────────────────────────────────────────────┐
│  Chapter hub payload = the first bottleneck     │
│  ~550KB RSC per hub view → bandwidth + TTFB     │
│  T0 lazy-loading fix → ~40KB first paint        │
│  Then: TiDB RU (static content re-queried per   │
│        user — no cross-request caching)         │
│  Then: Vercel CPU from client-side markdown     │
└─────────────────────────────────────────────────┘
```

### 🔴 Critical

| Constraint | Actual Limit | When You Hit It | Mitigation |
|------------|-------------|-----------------|------------|
| **Hub payload size** | ~550KB RSC per view | Day 1 — every hub view pays it | Lazy-load questions per chapter (T0-1) |
| **No cross-request caching** | Static seed content re-queried per user per view | RU pressure grows linearly with users | `unstable_cache` + revalidate on the 4 static data fns |
| **Vercel CPU** | 4 CPU-hrs/mo | Client markdown parsing + payload serialization | Lazy-load + memoize + dynamic import |

### 🟡 Medium

| Issue | Risk |
|-------|------|
| `questions-by-tags` unpaginated response | 500KB JSON per POST at current data size |
| `getQuestionsByStack` in-memory tag filter | O(all rows) per POST — fine now, not at 10K+ questions |
| In-memory rate limits | Single-instance assumption — fine on Vercel Hobby (1 instance) |

---

## 3. Monitoring

| Gap | Where | Status |
|-----|-------|--------|
| No RU tracking per query | Doc-wide gap (deferred by design at 3–4 users) | ⏸️ Consistent with doc stance |
| No payload-size / duration logging on heavy routes | `questions-by-tags`, `stack` return unbounded data with no observability | Cheap add: log row count + ms |
| No per-route metrics | — | ⏸️ Deferred with Sentry (doc 2.4) |

---

## 4. Logging

- ✅ All 4 interview routes log via `console.error("[interview/<route>] METHOD:", error)`
- ✅ All 8 interview data-fn catches log `console.error("[interview-data] fn:", error)`
- ⏸️ No structured logging (pino) — deferred per doc Tier 2.3 — consistent
- 🟡 Recommend: `console.info` row-count + duration on `questions-by-tags` and `stack` responses so payload regressions surface in Vercel logs

---

## 5. Security

### 🟡 Medium

| Issue | Detail | Fix |
|-------|--------|-----|
| **Unbounded `tags` array on `questions-by-tags`** | Zod schema has no `.max()` (unlike `stack`'s `max(50)`). 5,000 tags × 382 questions ≈ 2M `includes()` ops per request — CPU amplification vector behind a 20/min limit | Add `z.array(z.string()).max(50)` |
| `generate` templates hardcoded in route | `questionTemplates` lives in `app/api/interview/generate/route.ts` — content drift risk vs seeded DB | Move to `config/` |

### ✅ Verified

- `auth()` + 401 guard on all 4 routes (handler-level, defense-in-depth)
- Zod validation on all 4 routes
- No XSS — React escapes output; react-markdown renders no raw HTML; links use `rel="noreferrer noopener"`
- No secrets client-side; localStorage only for reviewed/collapsed state
- Rate limits cover all interview API routes

---

## 6. Failure Recovery

| Area | Status |
|------|--------|
| StackClient — error + Retry button | ✅ |
| PracticeClient — prefetch failure → Retry (added 2026-08-03) | ✅ |
| CustomPracticeClient — error message, button disabled while loading | ✅ (no dedicated retry button, re-click works) |
| Chapter hub — server DB failure → silent "No chapters available" empty state | 🟡 Doc-wide gap 3.3 (differentiate empty vs error), deferred consistently |
| DB pool connection retry | ❌ Doc-wide gap — no retry config on `mysql.createPool()` |
| `generate` — zero external dependencies | ✅ Robust by design |

---

## 7. Prioritized Action Plan

### Tier 0 — Do this week (under ~2.5 hours)

| # | Action | Constraint Solved | Effort |
|---|--------|-------------------|--------|
| T0-1 | **Hub lazy-loading**: server passes chapters + per-chapter question counts + active chapter's questions only; fetch others on select via existing `GET /api/interview/questions` (extend with optional `chapter` param) + prefetch adjacent. Payload ~550KB → ~40KB | TTFB, bandwidth, CPU | 1.5h |
| T0-2 | `.max(50)` on `questions-by-tags` tags array + `.limit()` on its response | Security, RU, memory | 20min |
| T0-3 | `React.memo` on question cards + `next/dynamic` for `ChapterHubClient` | Client CPU, bundle | 30min |

### Tier 1 — Scale hardening (weeks 2–4)

| # | Action | Benefit | Effort |
|---|--------|---------|--------|
| T1-1 | `unstable_cache` + `revalidate` on `getAllCategories`, `getChaptersByCategorySlug`, `getQuestionsByChapterIds`, `getTopTags` (invalidate on re-seed) | RU ~90% reduction on static content | 1h |
| T1-2 | Row-count + duration logging on `questions-by-tags` and `stack` | Observability | 20min |

### Tier 2 — Nice to have

| # | Action | Benefit | Effort |
|---|--------|---------|--------|
| T2-1 | Move `generate` templates to `config/` | Code org, content consistency | 1h |
| T2-2 | SQL-side tag filtering (JSON containment or normalized table) | Scaling beyond ~10K questions | 1h |

---

## Interview RU Budget Snapshot (at 500 users)

| Page/Route | RU/request (est.) | Requests/day | RU/day |
|------------|-------------------|--------------|--------|
| Interview home | ~60 | 500 | 30,000 |
| Chapter hub (current, 382-row answer fetch) | ~8 | 1,000 | 8,000 |
| Chapter hub (after T0-1 lazy-load) | ~1 | 3,000 | 3,000 |
| Practice (paginated 20/page + prefetch) | ~2 | 1,500 | 3,000 |
| Stack practice (full tag scan) | ~4 | 500 | 2,000 |
| Custom practice (questions-by-tags, unbounded) | ~8 | 300 | 2,400 |
| Customize (top tags scan) | ~1 | 200 | 200 |
| **Total** | | | **~48,600/day ≈ 1.5M/month** |

Mistral RUs are not applicable — `generate` is template-based and mentor chat is out of interview scope (1 RPM, per original doc).

## Verdict

The interview modules are **query-efficient and secure** — the 500-user risk is not in SQL (899 rows, indexed, batched, cached per request) but in **payload size**:

1. **Chapter hub ~550KB RSC payload is the #1 issue** — it taxes TTFB, the 100 GB bandwidth cap, and Vercel CPU simultaneously. T0-1 fixes it with one API param.
2. **`questions-by-tags` is the only unpaginated data path** — one Zod `.max()` + one `.limit()` closes it.
3. **Static content has zero cross-request caching** — `unstable_cache` is the single biggest RU lever when user count grows.
4. Everything else (auth, rate limits, logging, retry states) already meets the production-review standard from `docs/production-review-500-users.md`.

**After Tier 0:** interview modules contribute well under the doc's global RU/bandwidth/CPU estimates — the section stops being a bottleneck and stays free-tier viable at 500 users.
