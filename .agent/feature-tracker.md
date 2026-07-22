# Feature Implementation Tracker

## Phase 1 — Foundation (Current Sprint)

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 1.1 | Homepage redesign | Done | High | Hero, Features, YouTube carousel, course preview |
| 1.2 | Course catalog | Done | High | Browse available courses from DB; 13 courses seeded (8 beginner + 5 AI/DevOps) |
| 1.3 | Course chapters | Done | High | Chapter list with navigation; ~52 chapters across all courses |
| 1.4 | Code editor | Done | High | Editor with run/reset/solution; browser preview for HTML/CSS, console eval for others |
| 1.5 | Course content | Done | High | Seed data split into config/courses/*.ts; beginner-friendly with real-life analogies |
| 1.6 | Progress system | Pending | Medium | Stars, points, badges per course |
| 1.7 | Enrollment flow | Pending | High | Enroll in courses, track enrolled |

## Phase 2 — Interview + Problem Solving

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 2.1 | Interview categories | Pending | High | FE, BE, Fullstack, DevOps, QA, etc. |
| 2.2 | Tag system | Pending | High | Angular, Spring Boot, React, etc. |
| 2.3 | Question generation | Pending | High | AI-generated 50 questions based on tags |
| 2.4 | Top 50 questions | Pending | Medium | Curated per category |
| 2.5 | Problem solving list | Pending | High | Important DSA/algorithm problems |

## Phase 3 — Community + AI

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 3.1 | Community posts | Pending | High | Create, read, like posts |
| 3.2 | Comment system | Pending | High | Nested or flat comments |
| 3.3 | AI Mentor chat | Pending | High | Gemini/Groq integration |
| 3.4 | Developer notebook | Pending | Medium | Notes + code snippets |

## Phase 4 — Resource Hub + Polish

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 4.1 | YouTube playlist integration | Pending | Medium | Auto-scrolling carousel |
| 4.2 | Blog/articles | Pending | Low | Resource hub |
| 4.3 | Challenge arena | Pending | Low | Weekly challenges |
| 4.4 | Resume analyzer | Pending | Low | Ephemeral AI analysis |
| 4.5 | Notifications | Pending | Low | Comment replies, reminders |
| 4.6 | Admin tools | Pending | Low | Your control panel |

---

## Legend

- **Pending** — Not started
- **In Progress** — Being worked on
- **Done** — Complete
- **Blocked** — Waiting on dependency
- **Cancelled** — Won't implement

## Free Tier Checklist

- [ ] All DB queries paginated (max 20 per page)
- [ ] AI rate-limited (10 req/min per user)
- [ ] No file uploads stored permanently
- [ ] Soft deletes everywhere
- [ ] JSON columns used for flexible metadata
- [ ] Schema under 20 tables
- [ ] Images served from GitHub URLs / CDN
