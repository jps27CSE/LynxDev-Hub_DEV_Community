# 20 — Git & GitHub Course (Version Control from Scratch)

> Created: 2026-11-11 · Status: **implemented (Tasks 1-4 done; manual seed pending)** · Branch: `feature/git-github-course`
> Companion: `config/courses/git.ts` (created), registered via `config/courses/index.ts`.
> Practice model: **C — read-only lessons, learner runs commands in their own terminal.**

## Business problem

LynxDEV teaches HTML/CSS/JS/TS through interactive in-browser editor chapters, but there is **no version control course**. Git is a universal prerequisite for every developer and the #1 tool asked about in interviews. Add a beginner Git & GitHub course that reuses the existing lesson infrastructure with no new routes, tables, or API endpoints.

## Why this approach

- Course data already lives as `CourseData` objects in `config/courses/` — one new file (`git.ts`) follows the exact `linux.ts` convention, no new infra.
- Chapters are stored as JSONB in the existing `chapters` table — no schema migration, no new DB table (schema stays under 20).
- The editor supports `"browser"`-type chapters (Run disabled) and `"console"`-type (runs JS). There is no real Git terminal in-browser, so chapters are `"browser"` type: instructions contain exact commands + expected output; user types them in their own terminal.
- Free tier: all text-based, no images, no file uploads, no server-side command execution (zero cost, zero sandbox risk).

## Scope (in / out)

In scope:
- `config/courses/git.ts` — course metadata + 10 chapters (instructions, example commands, expected output, task).
- Register in `config/courses/index.ts`.
- Bump `COURSE_CACHE_VERSION` 3 → 4.
- Seed into DB via existing `config/seed-courses.ts` (run manually by maintainer after content review).

Out of scope (deferred, flagged):
- Real in-browser terminal (xterm.js + mock filesystem) — tracked as follow-up (shared with Linux course).
- Auto-validation of git commands (can't run git server-side on free tier without risk).
- Video embeds.

## Practice model (C — chosen)

- **Read-only lessons.** Each chapter = instructions HTML (concept → code blocks → expected output → "Learn more" links → "Your task" with verification steps) + a scratchpad editor (Monaco, shell-highlighted) + "Mark as Complete".
- Learner runs commands in their **own** terminal and matches output against the lesson's expected-output blocks.
- **Run button disabled** (no JS execution of bash/git). External links (Pro Git book, GitHub Skills, Learn Git Branching) cited as "Try it online".
- Alternatives rejected: A (WebVM/JSLinux iframe — heavy, vendor lock-in), B (JS command simulator — large scope, deferred).

## Files & routes

| File | Purpose |
|------|---------|
| `config/courses/git.ts` | CourseData: title, description, difficulty=Beginner, category=Tools, order_index=6, 10 chapters |
| `config/courses/index.ts` | Add `gitCourse` to `allCourses` |
| `lib/course-data.ts` | Bump `COURSE_CACHE_VERSION` 3 → 4 (no `getCourseLanguage` change — "git"/"github" not a language; defaults to shell via "linux"? see note) |
| `config/seed-courses.ts` | No change (loops `coursesData` automatically) |

Note: `getCourseLanguage` has no "git" branch. The course title "Git & GitHub — ..." doesn't contain "linux", so it falls through to `contentType === "browser" ? ...` → returns "html" by default for browser type. Monaco would highlight as HTML. To get shell highlighting, either add a "git" branch or rely on the default. Since chapters are `browser` type with `initialCode` bash comments, highlighting as bash is nicer. Adding `lower.includes("git") => "shell"` would also affect any future course with "git" in the title. Decision: add the branch for better UX, mirroring Linux.

Routes that pick it up automatically:
- `/courses` — catalog (new course card appears)
- `/courses/[id]` — course detail
- `/learn/[courseId]/[chapterId]` — lesson page (already built)

No new routes, no schema migration, no new table, no new API route.

## Chapter plan (10 chapters)

| # | Title | Commands covered | Points |
|---|-------|------------------|--------|
| 1 | What Is Version Control? | concepts, Git vs GitHub, snapshots, three states | 10 |
| 2 | Install & Configure Git | config --global, identity, default branch, levels | 10 |
| 3 | Your First Repository | init, add, commit, status, log, .gitignore | 10 |
| 4 | Viewing History | log, diff, show, blame, HEAD~n | 10 |
| 5 | Branching | switch, branch, merge, fast-forward, delete | 10 |
| 6 | Resolving Conflicts | conflict markers, resolve, abort, mergetool | 10 |
| 7 | Remote Repositories | clone, remote, push, pull, fetch, tracking | 10 |
| 8 | GitHub Essentials | PRs, forks, issues, Actions, README | 10 |
| 9 | Undoing Changes | restore, reset, revert, amend, stash | 10 |
| 10 | Project — Collaborative Workflow | full scenario end-to-end | 25 |

Each chapter: instructions HTML (code blocks + expected output), initialCode (bash scratchpad), solution (expected terminal output).

**Content type:** `"browser"` (Run disabled, no preview needed — initialCode is bash-comment-only so iframe preview is harmless). Reuses existing type to stay additive.

## Resources (verified free, link-out only)

No sentences/code/diagrams copied into lesson bodies. Every link HTTPS and checkable; unverifiable links excluded.

| Resource | What it covers | Used in |
|----------|---------------|---------|
| Pro Git book (git-scm.com/book) | End-to-end Git reference, free online | Ch 1-9 |
| GitHub Docs | Hello World, create repo, PRs, Actions | Ch 1, 7, 8 |
| Learn Git Branching (interactive) | Visual branching/merging | Ch 5, 6 |
| GitHub Skills (interactive courses) | Hands-on GitHub workflows | Ch 8, 10 |
| Atlassian Git tutorials | Concise command reference | Ch 3, 4, 9 |
| Oh My Git (game) | Gamified Git learning | Ch 5 |

## Database / seeding

Tables already exist (`courses`, `chapters`, `enrollments`). No migration.

```bash
# seed (picks up git.ts via index.ts automatically)
npx tsx config/seed-courses.ts
```

`order_index: 6` places it after HTML(1)/CSS(2)/JS(3)/Linux(4)/TS(5). `chapter_count` is set by the seeder from chapterData length (10).

**Manual review gate (per maintainer decision):** seed is NOT run by the agent. Maintainer reviews `config/courses/git.ts` content, then runs seed manually. `COURSE_CACHE_VERSION` bump ensures cached course list refreshes after seed.

## Implementation tasks

1. **Create `config/courses/git.ts`** — 10 chapters following `linux.ts` conventions (`codeBlock`, `externalLink`, `BOX_STYLE`). Bulk of the work. ✅ Done
2. **Register in `config/courses/index.ts`** — import + add to `allCourses`. ✅ Done
3. **Add shell highlighting in `lib/course-data.ts:getCourseLanguage`** — add `lower.includes("git") => "shell"` (mirroring Linux). ✅ Done
4. **Bump `COURSE_CACHE_VERSION`** 3 → 4 in `lib/course-data.ts`. ✅ Done
5. **Manual review + seed** (maintainer): review content file, run `npx tsx config/seed-courses.ts`, confirm course row + 10 chapters present. ⏳ Pending
6. **Verify UI** — `npm run dev`, open `/courses`, confirm card appears; open a lesson, confirm instructions render, editor pane, "Mark as Complete" works (signed-in), dark mode, mobile.
7. **Run checks** — `npm test`, `npm run build`, `npm run format:check`.

## Free-tier checklist

- [x] All DB queries paginated elsewhere; course catalog already limited
- [x] No new API routes → no new rate limits needed
- [x] No file uploads stored permanently
- [x] Soft deletes unaffected (course content is seed data, not user content)
- [x] JSON columns already used for chapter content
- [x] Schema stays under 20 tables (no new table — 14/20)
- [x] Images: none in lessons (text only)
- [x] TiDB pool respected (existing `withConnectRetry`, `connectionLimit: 5`)
- [x] No new dependencies

## Learning summary

Concepts: additive course registration pattern, content-as-data (CourseData), reuse of existing lesson infrastructure, free-tier discipline (no server-side git), link-out resource hygiene, cache version bump for invalidation.
New terms: `CourseData`, `ChapterContent.type`, `getCourseLanguage`, `COURSE_CACHE_VERSION`, `order_index`.
Patterns used: mirror `linux.ts`, seed via `seed-courses.ts`, cache version bump.
Mistakes avoided: no schema migration, no new API route, no new table, no new dependency, no server-side command execution, no hardcoded paths.
path">
/home/jack/Desktop/Project/LynxDev-Hub_DEV_Community/.agent/plans/20-git-github-course.md