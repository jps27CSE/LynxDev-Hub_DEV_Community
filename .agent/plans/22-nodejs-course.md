# 22 — Node.js & Express Course (Backend from Scratch)

> Created: 2026-11-11 · Status: **implemented (Tasks 1-4 done; manual seed pending)** · Branch: `feature/nodejs-course`
> Companion: `config/courses/node.ts` (created), registered via `config/courses/index.ts`.
> Practice model: **read-only lessons (browser type) — Node code shown in code blocks; learner runs code in their own Node install.**

## Business problem

LynxDEV teaches HTML/CSS/JS/TS/React through interactive in-browser editor chapters, but there is **no backend course**. The Backend Engineer interview category exists with no corresponding course. Add a beginner-friendly Node.js & Express course that bridges the JS/TS courses and real-world backend development, reusing the existing lesson infrastructure with no new routes, tables, or API endpoints.

## Why this approach

- Course data already lives as `CourseData` objects in `config/courses/` — one new file (`node.ts`) follows the exact convention, no new infra.
- Chapters are stored as JSONB in the existing `chapters` table — no schema migration, no new DB table (schema stays under 20).
- The editor runs JS via `new Function`; Node-specific APIs (fs, http, require) are unavailable in the browser sandbox. Chapters use `"browser"` type (Run disabled) with Node code in code blocks — mirroring the Linux/Git/React read-only model. Learners run code with `node file.js`.
- Free tier: all text-based, no images, no file uploads, no server-side execution (zero cost).

## Scope (in / out)

In scope:
- `config/courses/node.ts` — course metadata + 12 chapters (instructions, Node code blocks, task).
- Register in `config/courses/index.ts`.
- Add `node` → `javascript` in `getCourseLanguage`.
- Bump `COURSE_CACHE_VERSION` 3 → 4.
- Seed into DB via existing `config/seed-courses.ts` (run manually by maintainer).

Out of scope (deferred):
- True Node execution in the runner (would need a sandboxed Node environment) — follow-up.
- Video embeds.
- Database integration (Drizzle/PostgreSQL) — covered by platform's own codebase, not this course.

## Practice model (read-only, chosen)

- **Browser type.** Each chapter = instructions HTML (concept → Node code blocks → "Learn more" links → "Your task") + Monaco editor (JS-highlighted scratchpad) + "Mark as Complete". Run button disabled.
- Learner runs code with `node file.js` in their own terminal.
- Alternatives rejected: A (console type with browser-compatible JS — loses Node feel), B (Node sandbox in browser — heavy, deferred).

## Files & routes

| File | Purpose |
|------|---------|
| `config/courses/node.ts` | CourseData: title, description, difficulty=Intermediate, category=Backend, order_index=8, 12 chapters |
| `config/courses/index.ts` | Add `nodeCourse` to `allCourses` |
| `lib/course-data.ts` | Add `node` → `javascript` in `getCourseLanguage`; bump `COURSE_CACHE_VERSION` 3 → 4 |
| `config/seed-courses.ts` | No change |

Routes that pick it up automatically:
- `/courses` — catalog (new course card appears)
- `/courses/[id]` — course detail
- `/learn/[courseId]/[chapterId]` — lesson page (already built)

No new routes, no schema migration, no new table, no new API route.

## Chapter plan (12 chapters)

| # | Title | Concepts | Points |
|---|-------|----------|--------|
| 1 | What Is Node.js? | runtime, V8, event loop, Node vs browser | 10 |
| 2 | Modules & npm | CommonJS, require/exports, package.json, npm | 10 |
| 3 | File System (fs) | fs/promises, readFile/writeFile, path, dirs | 10 |
| 4 | HTTP Server from Scratch | http module, req/res, routing manually | 10 |
| 5 | Express Basics | app, routes, middleware, response helpers | 10 |
| 6 | Routing & Route Params | params, query, Express Router | 10 |
| 7 | Middleware | app.use, error handling, auth middleware | 10 |
| 8 | REST API Design | HTTP methods, status codes, URL design, pagination | 10 |
| 9 | Working with Data | file-based persistence, JSON storage | 10 |
| 10 | Project — Notes API | full CRUD + pagination + search + persistence | 20 |
| 11 | Project — Auth API | signup/login with bcrypt + JWT | 20 |
| 12 | Final Project — Task Manager API | users + tasks + JWT + filter + 404 handler | 25 |

## Resources (verified free, link-out only)

| Resource | What it covers | Used in |
|----------|---------------|---------|
| Node.js Docs — Introduction | runtime, getting started | Ch 1 |
| Node.js Docs — Modules | CommonJS, ESM | Ch 2 |
| Node.js Docs — fs | file system API | Ch 3 |
| Node.js Docs — http | HTTP server | Ch 4 |
| Express Docs — Getting Started | Express basics, routing, middleware | Ch 5-7 |
| MDN — HTTP methods | REST methods | Ch 8 |
| bcrypt / jsonwebtoken (npm) | auth packages | Ch 11 |
| OWASP Auth Cheat Sheet | auth best practices | Ch 11 |

## Database / seeding

Tables already exist. No migration.

```bash
npx tsx config/seed-courses.ts
```

`order_index: 8` places it after HTML/CSS/JS/Linux/TS/Git/React. `chapter_count` set by seeder (12).

## Implementation tasks

1. **Create `config/courses/node.ts`** — 12 chapters. ✅ Done
2. **Register in `config/courses/index.ts`** — import + add to `allCourses`. ✅ Done
3. **Add JS highlighting in `lib/course-data.ts:getCourseLanguage`** — `node` → `javascript`. ✅ Done
4. **Bump `COURSE_CACHE_VERSION`** 3 → 4. ✅ Done
5. **Manual review + seed** (maintainer). ⏳ Pending
6. **Verify UI** — `npm run dev`, open `/courses`, confirm card; open a lesson, confirm JS highlighting, instructions render, "Mark as Complete" works, dark mode, mobile.
7. **Run checks** — `npm test`, `npm run build`, `npm run format:check`.

## Free-tier checklist

- [x] All DB queries paginated elsewhere
- [x] No new API routes
- [x] No file uploads
- [x] Soft deletes unaffected
- [x] JSON columns used
- [x] Schema stays under 20 tables
- [x] Images: none in lessons
- [x] TiDB pool respected
- [x] No new dependencies

## Learning summary

Concepts: additive course registration, content-as-data, read-only Node model for non-Node runner, free-tier discipline (no server-side execution), link-out resource hygiene, cache version bump.
New terms: `CourseData`, `ChapterContent.type`, `getCourseLanguage`, `COURSE_CACHE_VERSION`, `order_index`, CommonJS, Express, middleware, REST.
Patterns used: mirror `linux.ts`/`git.ts`, seed via `seed-courses.ts`, cache version bump.
Mistakes avoided: no schema migration, no new API route, no new table, no new dependency, no server-side execution, no hardcoded paths.
path">
/home/jack/Desktop/Project/LynxDev-Hub_DEV_Community/.agent/plans/22-nodejs-course.md