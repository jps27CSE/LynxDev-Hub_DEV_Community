# Feature Implementation Tracker

## Phase 1 — Foundation (Current Sprint)

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 1.1 | Homepage redesign | Done | High | Hero, Features, YouTube carousel, course preview |
| 1.2 | Course catalog | Done | High | Browse available courses from DB; 13 courses seeded (8 beginner + 5 AI/DevOps) |
| 1.3 | Course chapters | Done | High | Chapter list with navigation; ~52 chapters across all courses |
| 1.4 | Code editor | Done | High | Editor with run/reset/solution; browser preview for HTML/CSS, console eval for others |
| 1.5 | Course content | Done | High | Seed data split into config/courses/*.ts; beginner-friendly with real-life analogies |
| 1.6 | Progress system | Done | Medium | Stars, points, badges per course |
| 1.7 | Enrollment flow | Done | High | Enroll in courses, track enrolled |

## Phase 2 — Interview + Problem Solving

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 2.1 | Interview categories | Done | High | FE, BE, Fullstack, DevOps, QA, etc. |
| 2.2 | Tag system | Done | High | Angular, Spring Boot, React, etc. |
| 2.3 | Question generation | Done | High | POST /api/interview/generate with template-based AI; Generate button on category page |
| 2.4 | Top 50 questions | Done | Medium | Tab-based toggle (All / Top 50) on category page |
| 2.5 | Problem solving list | Done | High | Unified workspace `/problems/[slug]` — 10 in-house + 183 top LeetCode problems, split-pane statement/editor, Run-only |
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
| 4.6 | Admin tools | Pending | Low | Your control panel |

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
| I.4 | Rate limiting on all API routes | ✅ Done | In-memory rate limiting via `middleware.ts` + `lib/rate-limit.ts` + `config/rate-limits.ts`. 10 req/min on `generate`, 5 req/min on `mentor/chat`, 20 req/min default. |
| I.5 | TiDB connection pool config | ✅ Done | `config/db.tsx` — explicit `connectionLimit: 5`, `queueLimit: 25`, `idleTimeout: 30s`, keep-alive enabled. Replaces untuned mysql2 defaults. |
| I.6 | Empty catch blocks log errors | ✅ Done | All 14 empty catches across `lib/course-data.ts`, `lib/problem-data.ts`, `lib/interview-data.ts` now log via `console.error("[module] fn:", error)`. |

## Free Tier Checklist

- [x] All DB queries paginated (max 20 per page)
- [x] API rate-limited (per-route limits: 5-30 req/min, in-memory middleware)
- [ ] No file uploads stored permanently
- [ ] Soft deletes everywhere
- [ ] JSON columns used for flexible metadata
- [ ] Schema under 20 tables
- [ ] Images served from GitHub URLs / CDN
