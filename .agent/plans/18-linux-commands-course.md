# 18 — Linux Commands Course (12 chapters, practice model C)

> Created: 2026-11-10 · Status: **implemented (Tasks 1-5 done; Task 6 manual verification pending)** · Branch: `feature/linux-basic-command-course`
> Companion: `config/courses/linux.ts` (created), registered via `config/courses/index.ts`.
> Practice model: **C — read-only lessons, learner runs commands in their own terminal.**

## Business problem

LynxDEV teaches HTML/CSS/JS through interactive in-browser editor chapters, but there is **no command-line / DevOps course**. A working developer needs Linux daily (navigate files, read logs, manage permissions, chain commands, inspect systems). Add a beginner Linux Commands course so a user can learn the terminal alongside frontend skills, without breaking any existing course, route, or DB table.

## Why this approach

- Course data already lives as `CourseData` objects in `config/courses/` — one new file (`linux.ts`) follows the exact `css.ts`/`js.ts` convention, no new infra.
- Chapters are stored as JSONB in the existing `chapters` table — no schema migration, no new DB table (schema stays under 20).
- The editor supports `"browser"`-type chapters (Run disabled) and `"console"`-type (runs JS). **There is no real Linux terminal today**, so chapters are `"browser"` type: instructions contain exact commands + expected output; user types them in their own terminal (WSL/Ubuntu/macOS Terminal).
- Free tier: all text-based, no images, no file uploads, no server-side command execution (zero cost, zero sandbox risk).

## Scope (in / out)

In scope:
- `config/courses/linux.ts` — course metadata + 12 chapters (instructions, example commands, expected output, task).
- Register in `config/courses/index.ts`.
- Bash syntax highlighting via `getCourseLanguage` in `lib/course-data.ts`.
- Bump `COURSE_CACHE_VERSION` 1 → 2.
- Seed into DB via existing `config/seed-courses.ts` (run manually by maintainer after content review).

Out of scope (deferred, flagged):
- Real in-browser terminal (xterm.js + mock filesystem) — tracked as follow-up.
- Auto-validation of terminal commands (can't run a shell server-side on free tier without risk).
- `"terminal"` content type for clean UX (follow-up; this PR reuses `"browser"` type to stay additive).
- Video embeds.

## Practice model (C — chosen)

- **Read-only lessons.** Each chapter = instructions HTML (concept → code blocks → expected output → "Learn more" links → "Your task" with verification steps) + a scratchpad editor (Monaco, bash-highlighted) + "Mark as Complete".
- Learner runs commands in their **own** terminal (WSL / Ubuntu / macOS Terminal) and matches output against the lesson's expected-output blocks.
- **Run button disabled** (no JS execution of bash). External sandbox links (Linux Journey, Boot.dev, LabEx) cited as "Try it online".
- Alternatives rejected: A (WebVM/JSLinux iframe — heavy, vendor lock-in), B (JS command simulator — large scope, deferred to Phase 4).

## Files & routes

| File | Purpose |
|------|---------|
| `config/courses/linux.ts` | CourseData: title, description, difficulty=Beginner, category=DevOps, order_index=4, 12 chapters |
| `config/courses/index.ts` | Add `linuxCourse` to `allCourses` array |
| `lib/course-data.ts` | Add `lower.includes("linux") => "bash"` to `getCourseLanguage` |
| `lib/course-data.ts` | Bump `COURSE_CACHE_VERSION` 1 → 2 |
| `config/seed-courses.ts` | No change (loops `coursesData` automatically) |
| `config/reset-courses.ts` | No change |

Routes that pick it up automatically:
- `/courses` — catalog (new course card appears)
- `/courses/[id]` — course detail
- `/learn/[courseId]/[chapterId]` — lesson page (already built)

No new routes needed. No existing file's behavior changes.

## Chapter plan (12 chapters)

| # | Title | Commands covered | Points |
|---|-------|------------------|--------|
| 1 | Meet the Terminal | pwd, whoami, clear, opening terminal, Tab completion, history, !! | 10 |
| 2 | Navigate the Filesystem | ls, ls -la, cd, cd .., cd ~, cd -, absolute vs relative paths | 10 |
| 3 | Create, Copy, Move, Delete | mkdir, touch, cp, mv, rm, rmdir, ln (hard/soft) | 10 |
| 4 | Read File Contents | cat, less, more, head, tail, wc, file | 10 |
| 5 | Search Files & Content | grep, grep -rn, find, locate, which, whereis | 10 |
| 6 | Get Help Without Leaving the Terminal | man, --help, whatis, apropos, tldr | 10 |
| 7 | Permissions & Ownership | ls -l, chmod (numeric+symbolic), chown, chgrp, sudo, su | 10 |
| 8 | Redirect Output & Pipes | >, >>, <, \|, tee, echo, xargs | 10 |
| 9 | Text Processing | sort, uniq, cut, awk, sed, tr, paste | 10 |
| 10 | Inspect the System | ps aux, top/htop, kill, killall, df -h, du -sh, free -m, uptime | 10 |
| 11 | Networking Basics | ping, curl, wget, ip addr, ss, netstat, dig, nslookup | 10 |
| 12 | Project — Mini Sysadmin Task | 8-step scenario combining all above + tar/gzip/zip + env ($PATH, export, which) | 25 |

Each chapter: instructions HTML (code blocks + expected output + warning boxes), initialCode (scratchpad bash comments), solution (expected terminal session transcript).

**Content type:** `"browser"` (Run disabled, no preview needed — initialCode is bash-comment-only so iframe preview is harmless). Reuses existing type to stay additive; `"terminal"` type deferred.

## Resources (verified free, link-out only)

No sentences/code/diagrams copied into lesson bodies. Every link HTTPS and checkable; unverifiable links excluded.

| Resource | What it covers | Used in |
|----------|---------------|---------|
| Ubuntu — "The Linux command line for beginners" | Terminal access, file manipulation, chaining, sudo | Ch 1, 2, 12 |
| Linux Journey (interactive, gamified CLI) | End-to-end CLI curriculum | Ch 1, 5, 6, 12 |
| Opensource.com — 12 essential Linux commands | pwd, ls, cd, touch, chmod with examples | Ch 2, 3, 7 |
| Linuxize — Linux commands cheat sheet (updated 2026) | Categorized quick reference | Ch 8 |
| Red Hat — 20 essential Linux commands | cat, head, tail, networking-focused | Ch 4, 11 |
| Opensource.com — chmod cheat sheet | File permissions | Ch 7 |
| Boot.dev — Learn Linux (interactive, in-browser terminal) | Filesystem, programs, I/O, pipes | Ch 2, 4, 8, 9 |
| LabEx — Linux commands practice online | Hands-on practice playground | Ch 3, 5, 10 |
| TLDR pages (tldr.sh) | Concise command examples | Ch 6 |

## Database / seeding

Tables already exist (`courses`, `chapters`, `enrollments`). No migration.

```bash
# seed (picks up linux.ts via index.ts automatically)
npx tsx config/seed-courses.ts
```

`order_index: 4` places it after HTML(1)/CSS(2)/JS(3). `chapter_count` is set by the seeder from chapterData length (12).

**Manual review gate (per maintainer decision):** seed is NOT run by the agent. Maintainer reviews `config/courses/linux.ts` content, then runs seed manually. `COURSE_CACHE_VERSION` bump (task) ensures cached course list refreshes after seed.

## Implementation status (updated 2026-11-10)

| Task | Status | Commit |
|------|--------|--------|
| 1. Create `config/courses/linux.ts` (ch 1-4) | ✅ Done | `8f5ea81` |
| 2. Append chapters 5-8 | ✅ Done | `9cd1427` |
| 3. Append chapters 9-12 | ✅ Done | `c7bfa80` |
| 4. Register + language + cache bump | ✅ Done | `a6c9dbb` |
| 5. Build/test/format verification | ✅ Done | `d1a32f4` (format) |
| 6. Manual UI verification + seed | ⏳ Pending (maintainer) | — |

Verification results (Task 5): `npm test` 678/678 pass; `npm run build` success; format:check pass on touched files.

## Implementation tasks (independent & sequential) — reference

1. **Create `config/courses/linux.ts`** — 12 chapters following `css.ts` conventions (`codeBlock`, `externalLink`, `BOX_STYLE`). Bulk of the work.
2. **Register in `config/courses/index.ts`** — import + add to `allCourses`.
3. **Add Bash highlighting in `lib/course-data.ts:getCourseLanguage`** — `linux` → `"bash"`.
4. **Bump `COURSE_CACHE_VERSION`** 1 → 2 in `lib/course-data.ts`.
5. **Manual review + seed** (maintainer): review content file, run `npx tsx config/seed-courses.ts`, confirm course row + 12 chapters present.
6. **Verify UI** — `npm run dev`, open `/courses`, confirm card appears; open a lesson, confirm instructions render, editor pane, "Mark as Complete" works (signed-in), dark mode, mobile.
7. **Run checks** — `npm test`, `npm run build`, `npm run format:check`.

## Honest limitation + follow-up

The editor cannot run a real Linux shell (`"console"` runs JavaScript; `"browser"` renders HTML). Users type commands in their **own** terminal and verify output against the lesson's expected-output blocks.

Follow-up tasks (not this PR):
- Add `"terminal"` content type for clean UX (no iframe preview).
- Client-side terminal with `xterm.js` + in-memory mock filesystem (runs fully in browser, zero server cost, fits free tier) — filed as separate plan when ready.

## Free-tier checklist

- [x] All DB queries paginated elsewhere; course catalog already limited
- [x] No new API routes → no new rate limits needed
- [x] No file uploads stored permanently
- [x] Soft deletes unaffected (course content is seed data, not user content)
- [x] JSON columns already used for chapter content
- [x] Schema stays under 20 tables (no new table — 14/20)
- [x] Images: none in lessons (text only)
- [x] TiDB pool respected (existing `withConnectRetry`, `connectionLimit: 5`)

## Learning summary

Concepts: additive course registration pattern, content-as-data (CourseData), reuse of existing lesson infrastructure, free-tier discipline (no server-side shell), link-out resource hygiene.
New terms: `CourseData`, `ChapterContent.type`, `getCourseLanguage`, `COURSE_CACHE_VERSION`, `order_index`.
Patterns used: mirror `css.ts`/`js.ts`, seed via `seed-courses.ts`, cache version bump for invalidation.
Mistakes avoided: no schema migration, no new API route, no new table, no hardcoded paths, no server-side command execution.