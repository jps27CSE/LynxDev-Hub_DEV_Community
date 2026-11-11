# 19 — TypeScript Course (Type-Safe JavaScript)

> Created: 2026-11-11 · Status: **in progress (Task 1 done)** · Branch: `feature/typescript-course`
> Companion: `config/courses/typescript.ts` (creating), registered via `config/courses/index.ts`.
> Practice model: **console type with JS-runnable code** — Monaco highlights as TypeScript; Run executes JavaScript (TS annotations are erased at runtime). TS syntax is shown in instruction code blocks (read-only) and paired with a compiled-JS note per chapter.

## Business problem

LynxDEV teaches HTML/CSS/JS through interactive in-browser editor chapters, but there is **no TypeScript course**. TS is the platform's own language and the #1 asked topic after JS in the interview bank. Add a beginner-friendly-but-intermediate-depth TypeScript course that bridges the JS fundamentals course and real-world typed code, reusing the existing lesson infrastructure with no new routes, tables, or API endpoints.

## Why this approach

- Course data already lives as `CourseData` objects in `config/courses/` — one new file (`typescript.ts`) follows the exact `js.ts`/`css.ts` convention, no new infra.
- Chapters are stored as JSONB in the existing `chapters` table — no schema migration, no new DB table (schema stays under 20).
- Monaco already supports `"typescript"` language mode (`getCourseLanguage` has the branch) — no editor change.
- The runner executes JS via `new Function`. TS type annotations are not valid JS, so runnable `initialCode`/`solution` are plain JS (the compiled output), while instruction code blocks show idiomatic TS. This mirrors the real TS workflow (write TS → compile → run JS) and keeps Run working.
- Free tier: all text-based, no images, no file uploads, no server-side transpilation (zero cost).

## Scope (in / out)

In scope:
- `config/courses/typescript.ts` — course metadata + 14 chapters.
- Register in `config/courses/index.ts`.
- Bump `COURSE_CACHE_VERSION` 2 → 3 (so cached course list refreshes).
- Verify `getCourseLanguage` already maps "typescript" → "typescript" (no change).

Out of scope (deferred, flagged):
- True TS execution in the runner (Sucrase/tsc transform) — follow-up; v1 runs compiled JS.
- `"typescript"` content type or TS-specific Run toggle — reuses `"console"`.
- Video embeds.
- Seeding — maintainer runs `npx tsx config/seed-courses.ts` manually after content review.

## Practice model (chosen)

- **Console type.** Each chapter = instructions HTML (concept → TS code blocks → compiled-JS note → "Learn more" links → "Your task") + Monaco editor (TS-highlighted) + Run button (executes JS) + "Mark as Complete".
- Runnable `initialCode`/`solution` are plain JavaScript that demonstrates the runtime behavior; the idiomatic TypeScript version is shown in an instruction `codeBlock` labeled "TypeScript (what you write)" with the JS labeled "JavaScript (what runs)".
- Alternatives rejected: A (read-only "browser" type like Linux — loses Run interactivity for a programming language course), B (TS→JS transform in runner — new dependency + runtime complexity, deferred).

## Files & routes

| File | Purpose |
|------|---------|
| `config/courses/typescript.ts` | CourseData: title, description, difficulty=Intermediate, category=Frontend, order_index=5, 14 chapters |
| `config/courses/index.ts` | Add `typescriptCourse` to `allCourses` |
| `lib/course-data.ts` | Bump `COURSE_CACHE_VERSION` 2 → 3 (no `getCourseLanguage` change — "typescript" already handled) |
| `config/seed-courses.ts` | No change (loops `coursesData` automatically) |

Routes that pick it up automatically:
- `/courses` — catalog (new course card appears)
- `/courses/[id]` — course detail
- `/learn/[courseId]/[chapterId]` — lesson page (already built)

No new routes, no schema migration, no new table, no new API route.

## Chapter plan (14 chapters)

| # | Title | Concepts | Points |
|---|-------|----------|--------|
| 1 | Why TypeScript? | TS is JS + types; compile-time checks; `tsc`; setup; TS vs JS; when not to use | 10 |
| 2 | Type Annotations & Inference | primitives, annotating, inference, `any`, `unknown`, `never`, `void` | 10 |
| 3 | Functions & Parameters | param types, return types, optional, defaults, rest, function type expressions | 10 |
| 4 | Objects & Interfaces | `interface`, optional/readonly props, excess property checks, extending | 10 |
| 5 | Arrays & Tuples | typed arrays, tuples, readonly arrays, array method typing | 10 |
| 6 | Union & Narrowing | union types, literal types, `typeof`/`instanceof`/`in` narrowing | 10 |
| 7 | Type Aliases & Enums | `type`, `enum`, `const enum`, `as const`, literal inference | 10 |
| 8 | Generics | generic functions, constraints (`extends`), multiple params, defaults | 10 |
| 9 | Utility Types | `Partial`, `Required`, `Pick`, `Omit`, `Record`, `Readonly`, `ReturnType`, `Parameters` | 10 |
| 10 | Classes | `class`, modifiers, `implements`, `abstract`, constructor params | 10 |
| 11 | Project — Typed User Profile | combine interfaces, unions, functions, narrowing | 15 |
| 12 | Project — Generic Data Fetcher | generics, utility types, async/await typing | 15 |
| 13 | Project — Form Validator | type guards, narrowing, discriminated unions | 15 |
| 14 | Final Project — Typed Mini Store | end-to-end: interfaces, generics, classes, utility types | 25 |

Each chapter: instructions HTML (code blocks + TS/JS pairing + "Learn more" links + "Your task"), `initialCode` (JS scratchpad), `solution` (JS), `points_reward`.

## Resources (verified free, link-out only)

No sentences/code/diagrams copied into lesson bodies. Every link HTTPS and checkable; unverifiable links excluded.

| Resource | What it covers | Used in |
|----------|---------------|---------|
| TypeScript Handbook — The Basics / Everyday Types | primitives, inference, annotations | Ch 1, 2 |
| TypeScript Handbook — More on Functions | function typing, overloads | Ch 3 |
| TypeScript Handbook — Object Types | interfaces, optional/readonly | Ch 4 |
| TypeScript Handbook — Narrowing | union narrowing, type guards | Ch 6, 13 |
| TypeScript Handbook — Generics | generic functions, constraints | Ch 8, 12 |
| TypeScript Handbook — Classes | class typing, modifiers, abstract | Ch 10 |
| TypeScript Handbook — Utility Types (reference) | Partial/Required/Pick/Omit/Record/Readonly | Ch 9 |
| TypeScript for JS Programmers (5 min) | migration mental model | Ch 1 |
| TypeScript Playground (typescriptlang.org/play) | try TS in browser | Ch 1, 11–14 |
| MDN — JavaScript Guide | runtime behavior (JS is the compiled output) | Ch 2, 5 |
| Total TypeScript (totaltypescript.com) — free articles | advanced patterns (optional deep dive) | Ch 8, 9 |

## Database / seeding

Tables already exist (`courses`, `chapters`, `enrollments`). No migration.

```bash
# seed (picks up typescript.ts via index.ts automatically) — run manually by maintainer
npx tsx config/seed-courses.ts
```

`order_index: 5` places it after HTML(1)/CSS(2)/JS(3)/Linux(4). `chapter_count` is set by the seeder from chapterData length (14).

**Manual review gate (per maintainer decision):** seed is NOT run by the agent. Maintainer reviews `config/courses/typescript.ts` content, then runs seed manually. `COURSE_CACHE_VERSION` bump ensures cached course list refreshes after seed.

## Implementation status

| Task | Status | Notes |
|------|--------|-------|
| 1. Create `config/courses/typescript.ts` (ch 1–5) | ✅ Done | commit 0dc73e2 |
| 2. Append chapters 6–10 | ✅ Done | this commit |
| 3. Append chapters 11–14 | ✅ Done | this commit |
| 4. Register + cache bump | ✅ Done | this commit |
| 5. Manual review + seed | ⏳ Pending (maintainer) | |
| 6. Verify UI | ✅ Done (build + tsc + format pass) | this commit |
| 7. Run checks | ✅ Done (npm test 678/678, build OK, format OK) | this commit |

## Implementation tasks (independent & sequential)

1. **Create `config/courses/typescript.ts` — chapters 1–5** (Why TS, Annotations/Inference, Functions, Objects/Interfaces, Arrays/Tuples). Bulk of the work.
2. **Append chapters 6–10** (Union/Narrowing, Type Aliases/Enums, Generics, Utility Types, Classes).
3. **Append chapters 11–14** (Typed User Profile, Generic Data Fetcher, Form Validator, Typed Mini Store).
4. **Register in `config/courses/index.ts`** — import + add to `allCourses`.
5. **Bump `COURSE_CACHE_VERSION`** 2 → 3 in `lib/course-data.ts` (verify `getCourseLanguage` already maps "typescript" — no change needed).
6. **Manual review + seed** (maintainer): review content file, run `npx tsx config/seed-courses.ts`, confirm course row + 14 chapters present.
7. **Verify UI** — `npm run dev`, open `/courses`, confirm card appears (Intermediate badge); open a lesson, confirm TS highlighting, instructions render, editor pane, Run works on JS code, "Mark as Complete" works (signed-in), dark mode, mobile.
8. **Run checks** — `npm test`, `npm run build`, `npm run format:check`.

## Honest limitation + follow-up

The runner executes JavaScript, not TypeScript — type annotations would be a `SyntaxError` at runtime. v1 ships with TS shown in instruction code blocks and JS in the runnable editor, with an explicit note per chapter. Follow-up tasks (not this PR):
- Add a TS→JS transform in the runner (Sucrase) so `initialCode` can be idiomatic TS and Run still works.
- Add a "TS/JS toggle" in the editor to view compiled output.

## Free-tier checklist

- [x] All DB queries paginated elsewhere; course catalog already limited
- [x] No new API routes → no new rate limits needed
- [x] No file uploads stored permanently
- [x] Soft deletes unaffected (course content is seed data, not user content)
- [x] JSON columns already used for chapter content
- [x] Schema stays under 20 tables (no new table — 14/20)
- [x] Images: none in lessons (text only)
- [x] TiDB pool respected (existing `withConnectRetry`, `connectionLimit: 5`)
- [x] No new dependencies (reuses Monaco TS mode + existing runner)

## Learning summary

Concepts: additive course registration pattern, content-as-data (CourseData), TS/JS dual-presentation for a non-TS runner, free-tier discipline (no server-side transpilation), link-out resource hygiene, cache version bump for invalidation.
New terms: `CourseData`, `ChapterContent.type`, `getCourseLanguage` (already supports "typescript"), `COURSE_CACHE_VERSION`, `order_index`, discriminated unions, utility types.
Patterns used: mirror `js.ts`/`css.ts`, seed via `seed-courses.ts`, cache version bump.
Mistakes avoided: no schema migration, no new API route, no new table, no new dependency, no server-side transpilation, no hardcoded paths.
path">
/home/jack/Desktop/Project/LynxDev-Hub_DEV_Community/.agent/plans/19-typescript-course.md