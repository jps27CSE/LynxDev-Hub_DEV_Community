# 21 — React Course (Build Interactive UIs)

> Created: 2026-11-11 · Status: **implemented (Tasks 1-4 done; manual seed pending)** · Branch: `feature/react-course`
> Companion: `config/courses/react.ts` (created), registered via `config/courses/index.ts`.
> Practice model: **read-only lessons (browser type) — JSX shown in code blocks; learner runs code in their own Vite + React project.**

## Business problem

LynxDEV teaches HTML/CSS/JS/TS through interactive in-browser editor chapters, but there is **no React course**. React is the platform's own UI library and the most in-demand frontend skill. Add a beginner-friendly React course that bridges the JS/TS courses and real-world component development, reusing the existing lesson infrastructure with no new routes, tables, or API endpoints.

## Why this approach

- Course data already lives as `CourseData` objects in `config/courses/` — one new file (`react.ts`) follows the exact convention, no new infra.
- Chapters are stored as JSONB in the existing `chapters` table — no schema migration, no new DB table (schema stays under 20).
- The editor runs JS via `new Function`; JSX is not valid JS, so runnable code can't execute React. Chapters use `"browser"` type (Run disabled) with JSX in code blocks — mirroring the Linux/Git read-only model. Learners run code in their own Vite + React project.
- Free tier: all text-based, no images, no file uploads, no server-side rendering of React (zero cost).

## Scope (in / out)

In scope:
- `config/courses/react.ts` — course metadata + 13 chapters (instructions, JSX code blocks, task).
- Register in `config/courses/index.ts`.
- Add `react` → `typescript` (TSX highlighting) in `getCourseLanguage`.
- Bump `COURSE_CACHE_VERSION` 3 → 4.
- Seed into DB via existing `config/seed-courses.ts` (run manually by maintainer).

Out of scope (deferred):
- True JSX execution in the runner (Sucrase/Babel transform) — follow-up.
- Video embeds.

## Practice model (read-only, chosen)

- **Browser type.** Each chapter = instructions HTML (concept → JSX code blocks → "Learn more" links → "Your task") + Monaco editor (TSX-highlighted scratchpad) + "Mark as Complete". Run button disabled.
- Learner runs code in their own Vite + React project.
- Alternatives rejected: A (console type with DOM-based JS — loses React feel), B (JSX transform in runner — new dependency + runtime cost, deferred).

## Files & routes

| File | Purpose |
|------|---------|
| `config/courses/react.ts` | CourseData: title, description, difficulty=Intermediate, category=Frontend, order_index=7, 13 chapters |
| `config/courses/index.ts` | Add `reactCourse` to `allCourses` |
| `lib/course-data.ts` | Add `react` → `typescript` in `getCourseLanguage`; bump `COURSE_CACHE_VERSION` 3 → 4 |
| `config/seed-courses.ts` | No change |

Routes that pick it up automatically:
- `/courses` — catalog (new course card appears)
- `/courses/[id]` — course detail
- `/learn/[courseId]/[chapterId]` — lesson page (already built)

No new routes, no schema migration, no new table, no new API route.

## Chapter plan (13 chapters)

| # | Title | Concepts | Points |
|---|-------|----------|--------|
| 1 | What Is React? | components, JSX, virtual DOM, declarative | 10 |
| 2 | JSX & Rendering | JSX rules, expressions, lists, keys | 10 |
| 3 | Components & Props | function components, props, composition, children | 10 |
| 4 | State with useState | useState, events, controlled inputs, functional updates | 10 |
| 5 | Effects with useEffect | side effects, cleanup, deps, data fetching | 10 |
| 6 | Conditional Rendering & Lists | &&, ternary, keys, empty states | 10 |
| 7 | Forms & Controlled Components | controlled inputs, validation, submit | 10 |
| 8 | Lifting State Up | shared state, prop drilling | 10 |
| 9 | Custom Hooks | use* functions, rules of hooks, reuse | 10 |
| 10 | Context API | createContext, useContext, providers, useTheme | 10 |
| 11 | Project — Todo App | full CRUD + localStorage + filter | 20 |
| 12 | Project — Weather Widget | fetch, loading/error, search, recent | 20 |
| 13 | Final Project — Mini Dashboard | layout, theme, table, search, favorites | 25 |

## Resources (verified free, link-out only)

| Resource | What it covers | Used in |
|----------|---------------|---------|
| React Docs — Quick Start | components, JSX, state | Ch 1-4 |
| React Docs — Thinking in React | component design | Ch 3, 11 |
| Vite + React | project setup | Ch 1 |
| React Docs — Effects | useEffect, cleanup | Ch 5 |
| shadcn/ui | component library (used by this platform) | Ch 13 |

## Database / seeding

Tables already exist. No migration.

```bash
npx tsx config/seed-courses.ts
```

`order_index: 7` places it after HTML/CSS/JS/Linux/TS/Git. `chapter_count` set by seeder (13).

## Implementation tasks

1. **Create `config/courses/react.ts`** — 13 chapters. ✅ Done
2. **Register in `config/courses/index.ts`** — import + add to `allCourses`. ✅ Done
3. **Add TSX highlighting in `lib/course-data.ts:getCourseLanguage`** — `react` → `typescript`. ✅ Done
4. **Bump `COURSE_CACHE_VERSION`** 3 → 4. ✅ Done
5. **Manual review + seed** (maintainer). ⏳ Pending
6. **Verify UI** — `npm run dev`, open `/courses`, confirm card; open a lesson, confirm TSX highlighting, instructions render, "Mark as Complete" works, dark mode, mobile.
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

Concepts: additive course registration, content-as-data, read-only JSX model for non-JSX runner, free-tier discipline (no server-side React), link-out resource hygiene, cache version bump.
New terms: `CourseData`, `ChapterContent.type`, `getCourseLanguage`, `COURSE_CACHE_VERSION`, `order_index`, JSX, hooks, context.
Patterns used: mirror `linux.ts`/`git.ts`, seed via `seed-courses.ts`, cache version bump.
Mistakes avoided: no schema migration, no new API route, no new table, no new dependency, no server-side rendering, no hardcoded paths.
path">
/home/jack/Desktop/Project/LynxDev-Hub_DEV_Community/.agent/plans/21-react-course.md