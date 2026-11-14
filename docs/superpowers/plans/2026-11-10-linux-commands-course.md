# Linux Commands Course — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 12-chapter beginner Linux Commands course to LynxDEV, mirroring the existing HTML/CSS/JS course pattern, with read-only lessons (learner runs commands in their own terminal).

**Architecture:** Additive only. One new content file `config/courses/linux.ts` exporting a `CourseData`. Register it in `config/courses/index.ts`. Add `"shell"` language mapping in `lib/course-data.ts:getCourseLanguage`. Bump `COURSE_CACHE_VERSION` so the cached course list refreshes. No schema, no API routes, no new tables. Chapters use `type: "browser"` so Run is disabled and no shell executes server-side.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Drizzle ORM (TiDB), shadcn/ui, Monaco editor (shell language), Tailwind v4.

**Spec:** `.agent/plans/18-linux-commands-course.md`

## Global Constraints

- Content file must import only from `./types` and `./format` (value-only, no `config/db` import) so it stays client-bundle safe (I.9).
- Reuse `codeBlock`, `externalLink`, `BOX_STYLE` from `./format` — do not redefine.
- Instructions are HTML strings inside template literals; escape backticks/`${}` inside bash examples by using template-literal interpolation `${codeBlock(...)}` for code, and avoid raw `${` in prose (use `\${` if needed, or reword).
- `ChapterContent.type` = `"browser"` for every chapter (Run disabled).
- `initialCode` = bash-comment-only scratchpad (so the iframe preview is harmless text).
- `solution` = expected terminal session transcript.
- `points_reward`: 10 for chapters 1–11, 25 for chapter 12.
- `order_index`: 4 (after HTML 1, CSS 2, JS 3).
- Language returned by `getCourseLanguage` for linux = `"shell"` (Monaco's built-in shell language; "bash" is not a registered Monaco language and would fall back to plain text).
- `COURSE_CACHE_VERSION` 1 → 2.
- No `console.log`/debug, no unused imports, dark-mode-friendly (text-only, no new colors).
- Seed is NOT run by the agent — maintainer runs it manually after content review.

## Review Focus

1. Bash snippets inside TS template literals with backticks or `${}` break compilation — verify every chapter compiles (`tsc`).
2. Monaco language id mismatch ("bash" vs "shell") — using "shell" ensures highlighting; "bash" silently disables it.
3. `order_index` collision — confirm no existing course uses 4 (existing: 1,2,3).
4. Stale cache — without the version bump, the new course won't appear even after seed.
5. `externalLink`/`codeBlock` signature drift — helpers take (text,url) and (code); misuse silently produces broken HTML.

---

### Task 1: Create `config/courses/linux.ts` — chapters 1–4

**Files:**
- Create: `config/courses/linux.ts`

**Interfaces:**
- Produces: `linuxCourse: CourseData` (exported const), consumed by Task 4.
- Uses: `CourseData`, `ChapterContent` from `./types`; `codeBlock`, `externalLink`, `BOX_STYLE` from `./format`.

- [ ] **Step 1: Write the file skeleton + course metadata + chapters 1–4.**

Create `config/courses/linux.ts` with the import lines, the `linuxCourse` export with metadata (title "Linux Commands — The Terminal from Scratch", description, icon "", difficulty "Beginner", category "DevOps", order_index 4), and 4 chapters following the `css.ts` convention: each chapter has `title`, `content: { type: "browser", instructions: \`...\`, initialCode, solution }`, `points_reward: 10`. Chapters:
1. "1. Meet the Terminal" — pwd, whoami, clear, Tab completion, history, `!!`
2. "2. Navigate the Filesystem" — ls, ls -la, cd, cd .., cd ~, cd -, absolute vs relative
3. "3. Create, Copy, Move, Delete" — mkdir, touch, cp, mv, rm, rmdir, ln
4. "4. Read File Contents" — cat, less, more, head, tail, wc, file

Each `instructions` must include: concept prose, `codeBlock` examples, expected output, "Learn more" links via `externalLink`, and a "Your task" section with verification steps. `initialCode` = bash comments only. `solution` = transcript.

- [ ] **Step 2: Typecheck.**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit.**

```bash
git add config/courses/linux.ts
git commit -m "feat(courses): add Linux Commands course — chapters 1-4"
```

---

### Task 2: Append chapters 5–8 to `config/courses/linux.ts`

**Files:**
- Modify: `config/courses/linux.ts`

**Interfaces:**
- Consumes: same helpers as Task 1.
- Produces: chapters 5–8 appended to `linuxCourse.chapters`.

- [ ] **Step 1: Append 4 chapters.**

Append to the `chapters` array (before the closing `]`):
5. "5. Search Files & Content" — grep, grep -rn, find, locate, which, whereis
6. "6. Get Help Without Leaving the Terminal" — man, --help, whatis, apropos, tldr
7. "7. Permissions & Ownership" — ls -l, chmod (numeric+symbolic), chown, chgrp, sudo, su
8. "8. Redirect Output & Pipes" — >, >>, <, |, tee, echo, xargs

Same content conventions as Task 1 (10 pts each).

- [ ] **Step 2: Typecheck.**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit.**

```bash
git add config/courses/linux.ts
git commit -m "feat(courses): add Linux Commands course — chapters 5-8"
```

---

### Task 3: Append chapters 9–12 to `config/courses/linux.ts`

**Files:**
- Modify: `config/courses/linux.ts`

**Interfaces:**
- Consumes: same helpers.
- Produces: chapters 9–12 (chapter 12 = 25 pts project).

- [ ] **Step 1: Append 4 chapters.**

9. "9. Text Processing" — sort, uniq, cut, awk, sed, tr, paste
10. "10. Inspect the System" — ps aux, top/htop, kill, killall, df -h, du -sh, free -m, uptime
11. "11. Networking Basics" — ping, curl, wget, ip addr, ss, netstat, dig, nslookup
12. "12. Project — Mini Sysadmin Task" — 8-step scenario combining all above + tar/gzip/zip + env ($PATH, export, which). `points_reward: 25`.

- [ ] **Step 2: Typecheck.**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit.**

```bash
git add config/courses/linux.ts
git commit -m "feat(courses): add Linux Commands course — chapters 9-12"
```

---

### Task 4: Register course + language mapping + cache bump

**Files:**
- Modify: `config/courses/index.ts`
- Modify: `lib/course-data.ts`

**Interfaces:**
- Consumes: `linuxCourse` from `./linux` (Task 1).
- Produces: `allCourses` includes linux; `getCourseLanguage` returns `"shell"` for linux titles; `COURSE_CACHE_VERSION` = 2.

- [ ] **Step 1: Register in `config/courses/index.ts`.**

Add `import { linuxCourse } from "./linux";` and push `linuxCourse` into `allCourses` (after jsCourse).

- [ ] **Step 2: Add language mapping in `lib/course-data.ts:getCourseLanguage`.**

Add branch: `if (lower.includes("linux")) return "shell";` (place before the fallback).

- [ ] **Step 3: Bump cache version.**

In `lib/course-data.ts`, set `const COURSE_CACHE_VERSION = 2;`.

- [ ] **Step 4: Typecheck.**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit.**

```bash
git add config/courses/index.ts lib/course-data.ts
git commit -m "feat(courses): register Linux Commands course + bash highlighting + cache bump"
```

---

### Task 5: Verification (build, tests, format)

**Files:** none new.

- [ ] **Step 1: Run unit tests.**

Run: `npm test`
Expected: all tests pass (no DB required).

- [ ] **Step 2: Run build.**

Run: `npm run build`
Expected: build succeeds; `/courses` and a `/learn/...` route prerender without error.

- [ ] **Step 3: Run format check.**

Run: `npm run format:check`
Expected: exit 0. If fails on new file, run `npx prettier --write config/courses/linux.ts` and re-check.

- [ ] **Step 4: Commit any formatting fix.**

```bash
git add -A
git commit -m "chore(courses): format linux course file"  # only if changes
```

---

### Task 6: Manual UI verification (maintainer)

**Files:** none.

- [ ] **Step 1: Review content file** `config/courses/linux.ts` for accuracy, tone, link validity.
- [ ] **Step 2: Seed DB** (maintainer only): `npx tsx config/seed-courses.ts`. Confirm course row + 12 chapters present.
- [ ] **Step 3: Run dev server** `npm run dev`. Open `/courses` → confirm new card appears. Open a lesson → confirm instructions render, editor pane shows, "Mark as Complete" works (signed-in), dark mode OK, mobile layout OK.
- [ ] **Step 4: Verify links** — spot-check 3 `externalLink` URLs resolve.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-11-10-linux-commands-course.md`. Please review the plan. Does it capture what you want?

If you'd like me to implement, say "go" and I'll start with Task 1 (content authoring — the bulk of the work). I recommend **Native** execution (I implement task-by-task in this session) because the tasks are sequential and share one file, with a single review at the end — cheaper and faster for content-heavy work.