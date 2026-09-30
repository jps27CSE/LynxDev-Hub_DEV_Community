# Feature Implementation Tracker

## Phase 1 — Foundation (Current Sprint)

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 1.1 | Homepage redesign | Done | High | Hero, Features, YouTube carousel, course preview |
| 1.2 | Course catalog | Restart | High | Existing seed data + DB rows cleared (2026-08-07) — building from scratch; pages kept, allowlist filter removed, `config/courses/` empty, `config/reset-courses.ts` added |
| 1.3 | Course chapters | Restart | High | All existing chapter seed data cleared with courses reset |
| 1.4 | Code editor | Done | High | Editor with run/reset/solution; browser preview for HTML/CSS, console eval for others |
| 1.5 | Course content | Restart | High | All existing lesson content cleared — new curriculum to be authored |
| 1.6 | Progress system | Done | Medium | Stars, points, badges per course |
| 1.7 | Enrollment flow | Done | High | Enroll in courses, track enrolled |

## Phase 2 — Interview + Problem Solving

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 2.1 | Interview categories | Done | High | FE, BE, Fullstack, DevOps, QA, etc. |
| 2.2 | Tag system | Done | High | Angular, Spring Boot, React, etc. |
| 2.3 | Question generation | Done | High | POST /api/interview/generate with template-based AI; Generate button on category page |
| 2.4 | Top 50 questions | Done | Medium | Tab-based toggle (All / Top 50) on category page |
| 2.5 | Problem solving list | Done | High | Unified workspace `/problems/[slug]` — 36 in-house Basic drills (Codewars 8kyu-sourced) + 183 top LeetCode, split-pane statement/editor, Run-only |
| 2.6 | Interview docs layout | Done | High | Left sidebar chapter nav + right side content with real-life scenarios, deep dives, code examples |
| 2.7 | Interview chapter notes | Done | High | 15 chapters across 6 categories with markdown rendering (react-markdown + highlight.js) |
| 2.8 | Dashboard stats cards | Done | Medium | Interview Prep + Problem Solving stat cards with live DB counts |
| 2.9 | Pages redesign | Done | Medium | Interview listing and Courses page — hero, dot-grid, gradient headings, color-coded cards with hover lift |
| 2.10 | Question bank expansion | Done | High | 25K+ lines seed data: HTML/CSS/JS, React, AI/Angular/State/Testing, DB, Spring Boot, .NET, Laravel |
| 2.11 | Custom practice page | Done | Medium | `/interview/[category]/custom-practice` — practice by selected topics |
| 2.12 | Interview customize page | Done | Medium | `/interview/customize` — customize question set |
| 2.13 | Questions-by-tags API | Done | Medium | `GET /api/interview/questions-by-tags` — filter questions by tag |
| 2.14 | Route refresh fix | Done | Medium | Fix category page navigation/refresh issue |

## Phase 3 — Community + AI

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 3.1 | Community posts | Pending | High | Create, read, like posts |
| 3.2 | Comment system | Pending | High | Nested or flat comments |
| 3.3 | AI Mentor chat | Done | High | Mistral AI — streaming chat, user context, skill-aware |
| 3.4 | Developer notebook | Pending | Medium | Notes + code snippets |

## Phase 4 — Resource Hub + Polish

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 4.1 | YouTube playlist integration | Done | Medium | Auto-scrolling carousel on homepage |
| 4.2 | Blog/articles | Pending | Low | Resource hub |
| 4.3 | Challenge arena | Pending | Low | Weekly challenges |
| 4.4 | Resume analyzer | Pending | Low | Ephemeral AI analysis |
| 4.5 | Notifications | Pending | Low | Comment replies, reminders |
| 4.6 | Admin tools | Done | Low | Control panel at `/admin` — Overview, Feedback (`.agent/plans/12-admin-module.md`), Users (`.agent/plans/13-admin-users-section.md`). Env allowlist auth via `lib/admin-auth.ts` (`ADMIN_EMAILS` / `ADMIN_CLERK_IDS`), fail-closed, layout guard + per-handler `isAdmin()`. |
| 4.7 | Site notice banner | In Progress | Medium | Admin-toggled global maintenance/warning notice — banner or modal, severity levels, auto-expiry. `.agent/plans/14-site-notice.md`. Tasks 1-5 done (schema, data layer, banner component, root-layout mount, PATCH endpoint), reviewed and fixed — plan §17, §19. TTL corrected 60s → 1h after measuring ISR cost (§16.1). Reviewing my own §19.1 fix surfaced a shared logger defect — production serialization inlined Drizzle bound params 4x per failed write while dropping `cause` and its error code; `lib/logger.ts` fixed, all 43 `log.error` sites benefit (§20, I.8). Tasks 6-9 pending. |

## Phase 5 — Mock Interview + Skills Roadmap

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 5.1 | Mock interview templates | Pending | High | Readymade junior-level templates (FE, BE, Fullstack) |
| 5.2 | Custom topic selector | Pending | High | User picks which topics to be interviewed on |
| 5.3 | AI voice interview (TTS) | Pending | High | Browser Web Speech API for AI interviewer voice |
| 5.4 | Coding editor in interview | Pending | High | Embedded editor with test validation during interview |
| 5.5 | Feedback + scoring | Pending | High | Post-interview score (0-100), per-question feedback, improvement suggestions |
| 5.6 | Weekly limit (1/user) | Pending | Medium | One completed interview per user per week |
| 5.7 | Skills roadmap tree | Pending | High | Interactive skill nodes with resources (articles, docs, videos) |
| 5.8 | YouTube video courses | Pending | High | Videos from CodeInsightsByJack channel, mark complete with progress |

---

## Legend

- **Pending** — Not started
- **In Progress** — Being worked on
- **Done** — Complete
- **Blocked** — Waiting on dependency
- **Cancelled** — Won't implement

## Infrastructure / Cross-Cutting

| # | Item | Status | Notes |
|---|------|--------|-------|
| I.1 | Zod validation on all API routes | ✅ Done | All 7 POST/PATCH routes validated — see `lib/api-error.ts` |
| I.2 | Remove `//@ts-ignore` | ✅ Done | Removed from `enroll/route.ts` and `progress/route.ts` |
| I.3 | Production review (500 users on free tier) | ✅ Updated | `docs/production-review-500-users.md` — accurate TiDB RU, Vercel CPU, Mistral RPM constraints |
| I.4 | Rate limiting on all API routes | ✅ Done | **DB-backed, handler-level** via `lib/db-rate-limit.ts` + `config/rate-limits.ts` + `rate_limits` table (`config/schema.tsx`). Global across serverless instances, fail-closed, atomic upsert. Limits: 10 req/min `generate`, 5 req/min `mentor/chat`, 5 req/min `enroll`, 10 req/min `progress`, 10 req/min `user-sync`, 10 req/min `PATCH /api/admin/site-notice`, 20/min default. Edge proxy stays auth-only — no DB, no rate limiting (`proxy.ts`). |
| I.5 | TiDB connection pool config | ✅ Done | `config/db.tsx` — explicit `connectionLimit: 5`, `queueLimit: 25`, `connectTimeout: 15s`, `acquireTimeout: 15s`, `idleTimeout: 300s` (5 min), keep-alive enabled. Replaces untuned mysql2 defaults. `connectTimeout` covers TiDB serverless scale-to-zero cold start; `withConnectRetry` (`lib/db-retry.ts`) retries once on transient connect failures. |
| I.6 | Empty catch blocks log errors | ✅ Done | All 14 empty catches across `lib/course-data.ts`, `lib/problem-data.ts`, `lib/interview-data.ts` now log via `console.error("[module] fn:", error)`. |
| I.7 | Cross-request content cache | ✅ Done | `lib/content-cache.ts` — `createContentCache({ tag, version, ttl })` wrapper over `unstable_cache`. Reused by `lib/site-notice.ts` (tag `site-notice`, **1h**). `revalidateTag` is now called from the first admin write endpoint — see 4.7. |
| I.8 | Log error serialization | ✅ Done | `lib/logger.ts` `serializeError` walked only `{name, message, stack}` and dropped `cause` — so production logs inlined Drizzle's **bound SQL params** (repeated by `ON DUPLICATE KEY UPDATE`, ~4x per failed write) while losing `code`/`errno`/`sqlState`. Now walks `cause` (bounded, 3 levels, cycle-safe), redacts `params` via a non-line-based lookahead (notice text is multi-line by design), and surfaces `code`/`errno`/`sqlState`/`sqlMessage`. Benefits all **43** `log.error` sites with no call-site change; dev still gets the raw object. Found by reviewing the 4.7 §19.1 fix — see plan §20. |

## Free Tier Checklist

- [x] All DB queries paginated (max 20 per page)
- [x] API rate-limited (per-route limits: 5-30 req/min, DB-backed via `lib/db-rate-limit.ts`)
- [ ] No file uploads stored permanently
- [ ] Soft deletes everywhere — `feedback_tickets` has `is_deleted`; `users` / `posts` do not exist yet
- [x] JSON columns used for flexible metadata
- [x] Schema under 20 tables — **14 / 20**
- [x] Images served from GitHub URLs / CDN

## Known Debt

- `npm run format:check` fails on **45 files** repo-wide — pre-existing, not from any recent task. `npx prettier --write .` clears it, but that is a repo-wide diff that should be its own commit, not smuggled into a feature. Of the files this feature touches, only `config/schema.tsx` is listed, and only for the pre-existing `feedback_user_idx` line (84 chars) at `:171` — the new `siteNotices` block is prettier-clean.
- The main app sidebar (`app/(routes)/_components/Sidebar.tsx:20-26`) has no Admin link, so `/admin` is reachable only by typing the URL.
- `db.execute()` returns a `[rows, fields]` tuple on this stack, not rows. Use the Drizzle query builder (`db.select().from(...)`) as every other `lib/*` file does — a raw-SQL helper that treats the result as rows reads the field-metadata array instead.
- The site notice renders only after hydration, not in SSR HTML — the dismissal check reads `sessionStorage` in an effect, so SSR must render `null`. Accepted: every interactive page on this app needs JS anyway. See plan §16.2 for the no-flash upgrade path if a no-JS route ever needs it.
- A cache TTL set inside a layout becomes that route's ISR window, not just a cache lifetime. `unstable_cache({ revalidate })` propagates to the enclosing route. Measured: a 60s notice TTL turned 4 fully static routes into per-minute revalidation, ~26% of the Vercel Hobby function budget. Always diff the `npm run build` route table when adding a layout-level cache. See plan §16.1.
- Any new `fixed top-*` overlay must be checked against every other `fixed` element, not just its own z-index. The site notice banner at `z-40` covered the `z-30` mobile sidebar toggle because they occupied the same 12px origin — it made phone navigation impossible. Overlap in space, not just stacking order, is the failure mode. See plan §17.1.
- `revalidateTag` in Next 16 takes a second argument (`profile`). `updateTag` is the stronger read-your-own-writes primitive but is Server-Action-only, so Route Handlers must use `revalidateTag(tag, { expire: 0 })`. See plan §18.1.
- A `catch` that returns `serverError()` without logging the error leaves a 500 with no diagnosable cause. `withRequestLog` records the status but not the reason. `app/api/admin/site-notice/route.ts` logs via `log.error`; the three older `app/api/admin/*` routes still do not. See plan §19.1.
- `proxy.ts` runs `auth.protect()` on every route outside its public list, so unsigned API calls get a 307 to `/sign-in` before the handler runs. Handler-level `auth()` / `isAdmin()` are defense-in-depth, and the 401 / 403 / 405 they return are unreachable unsigned — do not treat them as the auth boundary. See plan §18.2.
- `log.error(err)` looked safe because dev prints the raw object — but production serializes through `lib/logger.ts`, and that serialization was the thing that could leak. It kept only `{name, message, stack}` and dropped `cause`, so Drizzle's bound params (repeated by `ON DUPLICATE KEY UPDATE`, ~4x per write) landed in the log while `code`/`errno`/`sqlState` were lost. Two rules: **always verify a log change in `NODE_ENV=production`**, never trust the dev output, and note that redaction cannot be line-based when a value is legitimately multi-line. See plan §20.
