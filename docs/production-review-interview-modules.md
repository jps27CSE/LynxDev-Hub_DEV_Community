# Production Review — Interview Modules for 500 Concurrent Users

> **Date:** 2026-08-03
> **Status:** T0-1 (`a9a447a`), T0-2/T0-3, T1-1/T1-2, T2-1, and the stack tag-scan cache shipped 2026-08-04. Remaining: T2-2 (deferred — YAGNI until ~10K questions).
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

### ✅ Resolved 2026-08-03 → 2026-08-04

| Issue | Evidence | Fix (shipped) |
|-------|----------|--------|
| **Chapter hub shipped ALL category questions in the initial payload** | `[category]/page.tsx` passed every question **with full answers** into the RSC payload (~550KB for software-engineer) while only the active chapter's 10–20 questions were visible | Server now renders only the active chapter's questions (~40KB) + per-chapter question ids (rail progress, TOC counts). Other chapters fetch on rail select via `GET /api/interview/questions?category=&chapter=`, with cache + in-flight guards, silent adjacent prefetch, skeleton + Retry (T0-1, `a9a447a`) |
| **`questions-by-tags` returns unbounded results** | `getQuestionsByCategorySlugAndTags()` (`lib/interview-data.ts:193`) calls `getQuestionsByCategorySlug()` with **no limit** then filters in JS. A no-tags POST returns up to 382 full answers ≈ **500KB JSON per request** | `.max(50)` on the `tags` array + response capped at 100 rows → `{ questions, total, truncated }`; client shows "X of Y found" + refine hint when truncated (T0-2, 2026-08-04) |
| **Question cards not memoized** | Toggling reviewed/collapse re-parses all expanded `AnswerMarkdown` (react-markdown + rehype-highlight) | Extracted `QuestionCard` (`React.memo`, primitive props, stable callbacks — only the toggled card re-renders) + `ChapterHubClient` via `next/dynamic` `ssr: false` behind `ChapterHubLoader` (hub chunk ~53KB + card chunk ~25KB load client-side; no SSR markdown parse) (T0-3, 2026-08-04) |

### 🟡 Medium

| Issue | Detail | Fix |
|-------|--------|-----|
| `getQuestionsByStack` full-table scan | `lib/interview-data.ts:327` — loads the `tags` column of all 899 rows + JS filter per POST. Fine at 899 rows, unbounded pattern | SQL-side filtering (JSON containment) or normalized `question_tags` table before data grows |
| Practice prefetch silent-failure window | (fixed 2026-08-03) — now validates response, removes consumed offset, shows Retry | ✅ |

### 🟢 Quick Wins (already done)

- ✅ **Hub lazy-loading** — active chapter only (~550KB → ~40KB first paint); lazy chapter fetches + adjacent prefetch (shipped `a9a447a`)
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
│  Tier 0 shipped (2026-08-04) — hub lazy-loading │
│  + capped questions-by-tags + memoized cards    │
│  Next bottleneck: TiDB RU (static content       │
│        re-queried per user — no cross-request   │
│        caching)                                 │
└─────────────────────────────────────────────────┘
```

### 🔴 Critical

| Constraint | Actual Limit | When You Hit It | Mitigation |
|------------|-------------|-----------------|------------|
| **No cross-request caching** | Static seed content re-queried per user per view | RU pressure grows linearly with users — now the #1 remaining constraint | ✅ Resolved T1-1 — `unstable_cache` (1h TTL, `interview-data` tag) on `getAllCategories`, `getChaptersByCategorySlug`, `getQuestionsByChapterIds`, `getTopTags` **+ `getQuestionIdsByChapterIds`** (same static join, ~3K RU/day in budget); version-bump invalidation on re-seed |
| **`questions-by-tags` unbounded response** | ~500KB JSON per POST at current data size | Every custom-practice session | ✅ Resolved T0-2 — capped at 100 rows + `total`/`truncated` |
| **Vercel CPU** | 4 CPU-hrs/mo | Client markdown parsing + payload serialization | ✅ Resolved T0-3 — memoized cards + `ssr: false` hub (no server markdown parse) |

### 🟡 Medium

| Issue | Risk |
|-------|------|
| `getQuestionsByStack` in-memory tag filter | O(all rows) per POST — fine now, not at 10K+ questions |
| In-memory rate limits | Single-instance assumption — fine on Vercel Hobby (1 instance) |

---

## 3. Monitoring

| Gap | Where | Status |
|-----|-------|--------|
| No RU tracking per query | Doc-wide gap (deferred by design at 3–4 users) | ⏸️ Consistent with doc stance |
| No payload-size / duration logging on heavy routes | `questions-by-tags`, `stack` return unbounded data with no observability | ✅ Resolved T1-2 — `console.info` row count + total + duration on both routes |
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
| Chapter hub — lazy chapter fetches → skeleton + Retry (shipped `a9a447a`) | ✅ |
| Chapter hub — initial SSR DB failure → silent "No chapters available" empty state | 🟡 Doc-wide gap 3.3 (differentiate empty vs error), deferred consistently |
| DB pool connection retry | ❌ Doc-wide gap — no retry config on `mysql.createPool()` |
| `generate` — zero external dependencies | ✅ Robust by design |

---

## 7. Prioritized Action Plan

### Tier 0 — Do this week (under ~2.5 hours)

| # | Action | Constraint Solved | Effort | Status |
|---|--------|-------------------|--------|--------|
| T0-1 | **Hub lazy-loading**: server passes chapters + per-chapter question counts + active chapter's questions only; fetch others on select via extended `GET /api/interview/questions?chapter=` + adjacent prefetch. Payload ~550KB → ~40KB | TTFB, bandwidth, CPU | 1.5h | ✅ shipped `a9a447a` |
| T0-2 | `.max(50)` on `questions-by-tags` tags array + `.limit()` on its response | Security, RU, memory | 20min | ✅ shipped 2026-08-04 |
| T0-3 | `React.memo` on question cards + `next/dynamic` for `ChapterHubClient` | Client CPU, bundle | 30min | ✅ shipped 2026-08-04 |

### Tier 1 — Scale hardening (shipped 2026-08-04)

| # | Action | Benefit | Effort | Status |
|---|--------|---------|--------|--------|
| T1-1 | `unstable_cache` + `revalidate` on `getAllCategories`, `getChaptersByCategorySlug`, `getQuestionsByChapterIds`, `getTopTags` (invalidate on re-seed) | RU ~90% reduction on static content | 1h | ✅ shipped — 1h TTL + version-bump invalidation (seed scripts run outside Next runtime, so `revalidateTag` unusable there); also cached `getQuestionIdsByChapterIds` |
| T1-2 | Row-count + duration logging on `questions-by-tags` and `stack` | Observability | 20min | ✅ shipped — `console.info` row count, total, ms on both routes |

### Tier 2 — Nice to have

| # | Action | Benefit | Effort | Status |
|---|--------|---------|--------|--------|
| T2-1 | Move `generate` templates to `config/` | Code org, content consistency | 1h | ✅ shipped — `config/interview/generate-templates.ts` (`questionTemplates` + `InterviewTemplate` type); route slimmed 318 → 118 lines |
| T2-2 | SQL-side tag filtering (JSON containment or normalized table) | Scaling beyond ~10K questions | 1h | ⏸️ Deferred — YAGNI at 899 rows; JS filter fine until ~10K |

> Also shipped 2026-08-04: `getQuestionTagRows` wrapped in `unstable_cache` — the stack practice per-POST 899-row tag scan now hits the Data Cache (1h TTL), removing the biggest remaining uncached DB line (~2K RU/day → ~0).

---

## Interview RU Budget Snapshot (at 500 users, post T1-1 caching)

Cross-request caching now absorbs ~90% of static reads: `getAllCategories`, `getChaptersByCategorySlug`, `getQuestionsByChapterIds`, `getQuestionIdsByChapterIds`, `getTopTags` hit the Data Cache after the first request per key (1h TTL). TiDB RU is now dominated by uncached paths.

| Page/Route | RU/request (est., cached vs miss) | Requests/day | RU/day (steady state) |
|------------|-----------------------------------|--------------|--------|
| Interview home | ~60 (miss) / ~0 (hit) | 500 | ~150 (first hits per key) |
| Chapter hub (SSR chapter ids + on-demand chapter fetches) | ~1 / ~0 | 3,000 | ~3 (per key per hour) |
| Practice (paginated 20/page + prefetch) | ~2 / ~0 | 1,500 | ~15 |
| Stack practice (tag scan cached via `getQuestionTagRows`) | ~4 (miss) / ~0 (hit) | 500 | ~4 |
| Custom practice (questions-by-tags, capped 100, uncached) | ~3 | 300 | 900 |
| Customize (top tags, cached) | ~1 / ~0 | 200 | ~1 |
| **Total** | | | **~1,100/day ≈ 33K/month** (custom practice dominates) |

Mistral RUs are not applicable — `generate` is template-based and mentor chat is out of interview scope (1 RPM, per original doc).

## Verdict

The interview modules are **query-efficient and secure** — the 500-user risk is not in SQL (899 rows, indexed, batched, cached per request) but in **unbounded payload paths and missing cross-request caching**:

1. **Hub payload (#1 risk) — resolved** (`a9a447a`): ~550KB → ~40KB first paint; chapter fetches are lazy, guarded, prefetched, and retryable.
2. **`questions-by-tags` unbounded path — resolved** (T0-2): tags `.max(50)`, response capped at 100 with `total`/`truncated` surfaced in the UI.
3. **Question-card re-parse on toggle — resolved** (T0-3): memoized `QuestionCard` + `ssr: false` hub → server never parses hub markdown, cards only re-render when their own state changes.
4. **No cross-request caching — resolved** (T1-1): `unstable_cache` on 5 static fns → interview RU/day drops from ~39K to ~3K steady state; the remaining TiDB load is the two uncached POST paths (stack scan, custom practice), tracked via T1-2 logging.
5. Everything else (auth, rate limits, logging, retry states) already meets the production-review standard from `docs/production-review-500-users.md`.

**After Tier 0 + 1 + T2-1:** interview modules contribute ~1.1K RU/day steady state (uncached custom-practice POSTs dominate) vs the doc's global budget — the section stops being a bottleneck and stays free-tier viable at 500 users. Only T2-2 (SQL-side tag filtering) remains, deferred as YAGNI until ~10K questions.

---

## 8. Follow-up Incident: 429 on `POST /api/user` (2026-08-03)

**Symptom** — console `AxiosError: Request failed with status code 429` at `app/provider.tsx:24`, toast "Failed to load your profile".

**Root cause** — the app's **own middleware rate limiter**, not Clerk:
- `config/rate-limits.ts` capped `POST /api/user` at **3 requests/min per user** (keyed `user:${userId}` via `getRateLimitKey`)
- `app/provider.tsx` fired `CreateNewUser()` on every provider mount, and dev React StrictMode **double-fires effects** → **2 POSTs per page load**
- Two quick reloads within a minute = 4 requests → 429 on the 4th. Any fast-reloading dev (or a client bug looping the effect) trips a 3/min limit instantly.

**Fix (shipped)**:
- `app/provider.tsx` — in-flight promise dedupe (StrictMode double-effect → 1 request), `syncedUserId` guard so an already-synced user is never re-POSTed, effect dep narrowed to `user?.id`
- `config/rate-limits.ts` — `POST /api/user` limit 3 → **10/min** (blocks buggy loops, tolerates normal reloading)

**Production note** — create-on-mount is inherently chatty: every full page load still costs 1 request. The production-grade pattern is a Clerk `user.created` webhook creating the DB row, making `POST /api/user` a pure idempotent read. Deferred to Phase 3+; the current 10/min per-user limit covers 500 users comfortably (1 request per login/session).

**Takeaway for other 3/min-style limits** — any client call that fires on mount needs either dedupe, a higher per-user ceiling, or both. Audit future routes before setting limits below expected mount frequency.
