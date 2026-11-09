# Phase 3 (placeholder) — Linux Commands Course

> Created: 2026-10-28 · Status: plan only · Nothing wired yet.
> Companion to: the `config/courses/linux.ts` content file (to be created).

## Business problem

Users on LynxDEV learn HTML/CSS/JS through interactive editor chapters, but there is **no command-line / DevOps course**. A working developer needs Linux daily (navigate files, read logs, manage permissions, chain commands, inspect systems). Add a beginner Linux Commands course so a user can learn the terminal alongside frontend skills.

## Why this approach

- Course data already lives as `CourseData` objects in `config/courses/` — one new file (`linux.ts`) follows the exact `css.ts`/`js.ts` convention, no new infra.
- Chapters are stored as JSONB in the existing `chapters` table — no schema migration, no new DB table (schema stays under 20).
- The editor supports `"browser"`-type chapters (iframe sandbox, works immediately) and `"console"`-type chapters (runs JS). **There is no real Linux terminal today**, so chapters are `"browser"` type: instructions contain exact commands + expected output, user types them in their own terminal (WSL/Ubuntu/macOS Terminal).
- Free tier: all text-based, no images, no file uploads, no server-side command execution (zero cost, zero sandbox risk).

## Scope (in / out)

In scope:
- `config/courses/linux.ts` — course metadata + 10 chapters (instructions, example commands, expected output, task).
- Register in `config/courses/index.ts`.
- Bash syntax highlighting via `getCourseLanguage` in `lib/course-data.ts`.
- Seed into DB via existing `config/seed-courses.ts`.

Out of scope (deferred, flagged):
- Real in-browser terminal (xterm.js + mock filesystem) — tracked as follow-up task.
- Auto-validation of terminal commands (can't run a shell server-side on free tier without risk).
- Video embeds.

## Files & routes

| File | Purpose |
|------|---------|
| `config/courses/linux.ts` | CourseData: title, description, difficulty=Beginner, category=DevOps, order_index=3, 10 chapters |
| `config/courses/index.ts` | Add `linuxCourse` to `allCourses` array |
| `lib/course-data.ts` | Add `lower.includes("linux") => "bash"` to `getCourseLanguage` |
| `config/seed-courses.ts` | No change (loops `coursesData` automatically) |
| `config/reset-courses.ts` | No change |

Routes that pick it up automatically:
- `/courses` — catalog (new course card appears)
- `/courses/[id]` — course detail
- `/learn/[courseId]/[chapterId]` — lesson page (already built)

No new routes needed.

## Chapter plan (10 chapters)

| # | Title | Commands covered | Points |
|---|-------|------------------|--------|
| 1 | Meet the Terminal | pwd, whoami, clear, opening terminal | 10 |
| 2 | Navigate the Filesystem | ls, ls -la, cd, cd .., cd ~, cd -, absolute vs relative | 10 |
| 3 | Create, Copy, Move, Delete | mkdir, touch, cp, mv, rm, rmdir | 10 |
| 4 | Read File Contents | cat, head, tail, less, file | 10 |
| 5 | Search Files & Content | find, grep, which | 10 |
| 6 | Get Help Without Leaving the Terminal | man, --help, whatis, apropos | 10 |
| 7 | Permissions & Ownership | ls -l, chmod, chown, sudo | 10 |
| 8 | Redirect Output & Pipes | >, >>, |, tee, echo | 10 |
| 9 | Inspect the System | ps aux, top, kill, df -h, du -sh, free -m | 10 |
| 10 | Project — Mini Sysadmin Task | Combine all above (6-step scenario) | 25 |

Each chapter: instructions HTML (code blocks + expected output + warning boxes), initialCode (scratchpad), solution (expected terminal session).

## Resources to use (verified free)

These were located via web search (2026-10-28). All are free, text-based, no login wall for the lesson content. Links are cited in lesson `Learn more` sections only — lesson prose is self-contained.

| Resource | What it covers | Used in |
|----------|---------------|---------|
| Ubuntu — "The Linux command line for beginners" (official) | Terminal access, file manipulation, chaining, sudo | Ch 1, 2, 10 |
| https://ubuntu.com/tutorials/command-line-for-beginners | | |
| Linux Journey (interactive, gamified CLI) | End-to-end CLI curriculum | Ch 1, 5, 6, 10 |
| https://linuxjourney.com/ | | |
| Opensource.com — 12 essential Linux commands | pwd, ls, cd, touch, chmod with examples | Ch 2, 3, 7 |
| https://opensource.com/article/22/5/essential-linux-commands | | |
| Linuxize — Linux commands cheat sheet (updated 2026) | Categorized quick reference | Ch 8 |
| https://linuxize.com/cheatsheet/linux-commands | | |
| Red Hat — 20 essential Linux commands | cat, head, tail, networking-focused | Ch 4, 9 |
| https://www.redhat.com/en/blog/20-essential-linux-commands-every-user | | |
| Opensource.com — chmod cheat sheet | File permissions | Ch 7 |
| https://opensource.com/article/19/11/cheat-sheet-common-linux-commands | | |

Link hygiene rule (mirrors the system-design resource map): **link out, never paste.** No sentences/code/diagrams copied from these sources into lesson bodies. Every link is HTTPS and checkable; a link that can't be verified is excluded rather than left to rot.

## Database / seeding

Tables already exist (`courses`, `chapters`, `enrollments`). No migration.

```bash
# optional: wipe existing course data first
npx tsx config/reset-courses.ts

# seed (picks up linux.ts via index.ts automatically)
npx tsx config/seed-courses.ts
```

`order_index: 3` places it after HTML/CSS/JS. `chapter_count` is set by the seeder from chapterData length (10).

## Implementation tasks (independent & sequential)

1. **Create `config/courses/linux.ts`** — 10 chapters following `css.ts` conventions (`codeBlock`, `externalLink`, `BOX_STYLE`).
2. **Register in `config/courses/index.ts`** — import + add to `allCourses`.
3. **Add Bash highlighting in `lib/course-data.ts:getCourseLanguage`** — `linux` → `"bash"`.
4. **Seed & verify DB** — run reset + seed, confirm course row + 10 chapters present.
5. **Verify UI** — `npm run dev`, open `/courses`, confirm card appears; open a lesson, confirm instructions render, editor pane, "Mark as Complete" works (signed-in).
6. **Run checks** — `npm test`, `npm run build`, `npm run format:check` (config/courses files are value-only, no `config/db` import, so bundle-safe).

## Honest limitation + follow-up

The editor cannot run a real Linux shell (`"console"` runs JavaScript; `"browser"` renders HTML). Users type commands in their **own** terminal and verify output against the lesson's expected-output blocks.

Follow-up task (not this PR): add a client-side terminal with `xterm.js` + an in-memory mock filesystem — runs fully in the browser, zero server cost, fits free tier. File it as a separate plan when ready.

## Free-tier checklist

- [x] All DB queries paginated elsewhere; course catalog already paginated/limited
- [x] No new API routes → no new rate limits needed
- [x] No file uploads stored permanently
- [x] Soft deletes unaffected (course content is seed data, not user content)
- [x] JSON columns already used for chapter content
- [x] Schema stays under 20 tables (no new table)
- [x] Images: none in lessons (text only)
- [x] TiDB pool respected (existing `withConnectRetry`, `connectionLimit: 5`)
