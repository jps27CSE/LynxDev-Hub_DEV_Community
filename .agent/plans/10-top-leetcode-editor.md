# Top 200 LeetCode Problems + Browser Code Editor

> **Phase:** 2 (DSA Problems) / 4 (Resource Hub adjacent)
> **Status:** Implemented — Parts A and B shipped (tasks 1–5 done); only manual browser verify of task 6 remains
> **Date:** 2026-08-06

---

## Goals

1. **Top LeetCode problems section** — a curated list of ~200 popular LeetCode problems (mostly easy/medium, some hard), each with difficulty, topics, and an official "Solve on LeetCode" link.
2. **Dedicated code editor** — a `/editor` page where anyone can write and run JavaScript, save their code as a file, and import it back. Also openable from a problem's detail page.
3. **No test cases / no judge anywhere** — in both the problem tab and `/editor`, users just write code and see the compile/run result (output or error). No PASS/FAIL, no hidden tests.

## Cost Analysis (free-tier safe)

The editor is 100% client-side. **No database, no API routes, no TiDB writes.**

| Cost item | Free-tier impact |
|---|---|
| Monaco editor (lazy-loaded via `next/dynamic`, `ssr: false`) | $0. ~2–5 MB chunk, downloaded once per browser then cached. Vercel Hobby 100 GB/mo ≈ 30k+ first-time editor loads — trivially fine at 500 users |
| JS execution | $0 — runs in-browser via `new Function` (pattern in `ProblemDetailClient.tsx`) |
| Top problems list | $0 — static config data in `config/`, no DB, no server work |
| TiDB | untouched — no migration, no new tables |

**Constraints honored:**
- No server-side execution of untrusted code (Vercel serverless cannot sandbox it)
- No per-keystroke autosave (would burn function invocations) — localStorage autosave is client-side only
- No third-party execution APIs (Piston etc.) at launch

## Scope Decisions (confirmed with user)

- Problem list: **top ~200 on LeetCode**, mostly easy/medium + some hard
- Editor: **JavaScript only** at launch
- **No test cases, no judge** — problem tab editor + `/editor` are Run-only: write code → see output or compile/runtime error
- Save = **export to file / import from file** (not database)
- Persistence: **localStorage only** — code follows the browser, not the account

---

## Part A — Top 200 LeetCode Problems

### Data source

Curate during implementation from public web sources:

- LeetCode **Top Interview 150** (official curated list)
- LeetCode **Top 100 Liked**
- Dedupe + fill to ~200 problems

Each entry:

```ts
type TopProblem = {
  title: string;          // "Two Sum"
  slug: string;           // "two-sum" (used in the LeetCode URL)
  difficulty: "easy" | "medium" | "hard";
  topics: string[];       // ["arrays", "hash-map"]
  leetcodeUrl: string;    // https://leetcode.com/problems/two-sum/
};
```

### Files

| File | Purpose |
|---|---|
| `config/problems/top-problems.ts` | The curated ~200-entry dataset (config data lives in `config/` — existing convention) |
| `app/(routes)/problems/top/page.tsx` | Server Component: search + difficulty/topic filter, list rows with difficulty badge and **"Solve on LeetCode ↗"** |

### Design notes

- Separate route `/problems/top` instead of a tab inside `ProblemsClient` — the existing page is a paginated DB-backed client; two data sources in one page adds needless complexity
- Add a small "Top LeetCode" entry/link on `/problems` pointing to it
- Static render, zero queries, zero cache concerns

---

## Part B — Browser Code Editor (`/editor`)

### Dependency

- `@monaco-editor/react` (MIT, free) — lazy-loaded with `next/dynamic`, `ssr: false` so the ~5 MB chunk never touches the first paint

### Files

| File | Purpose |
|---|---|
| `lib/editor.ts` | **Single source of truth** for editor logic: `runJavaScript` (in-browser exec, output/error), `saveCodeAsFile`, `readCodeFile`, localStorage load/save |
| `hooks/useCodeEditor.ts` | **One shared hook** — code/output/error/running state + run/reset/save/import + debounced autosave. Used by problem page, `/editor`, and popup |
| `components/editor/MonacoEditor.tsx` | Shared Monaco wrapper (`next/dynamic`, `ssr: false`) |
| `components/editor/EditorToolbar.tsx` | Shared toolbar: Reset, Save, Import, **Run** |
| `components/editor/OutputPane.tsx` | Shared output pane (success/error states) |
| `components/editor/EditorDialog.tsx` | **Popup small editor** — same shared pieces, compact (280px Monaco) — opened from any code block |
| `components/code-block.tsx` | **Every code block in all content** (interview, stack, custom practice, mentor answers) gets `▶ Run` (inline output below snippet) + `Open in Editor` (popup) for JS blocks |
| `app/(routes)/editor/page.tsx` | Server shell — reads `?problemId=` search param, resolves problem via existing `getProblemById`, passes starter code + title down |
| `app/(routes)/editor/EditorClient.tsx` | Full-view Monaco editor (60vh) — same shared components as everywhere else |
| Edit: `app/(routes)/problems/[id]/ProblemDetailClient.tsx` | Strip the judge (delete `runTests`, `passed` state, **Test** button, pass/fail banner); **keep inline editor** (shared components) + add **"Open in Editor"** button → `/editor?problemId=N` |
| Edit: `app/(routes)/_components/Sidebar.tsx` | Add **Editor** nav link |

### Shared editor — one implementation, four surfaces

The problem tab inline editor, the `/editor` full view, the popup dialog, and the inline code-block Run all use the **exact same** `lib/editor.ts` + `useCodeEditor` + Monaco/toolbar/output components. Nothing is duplicated per surface.

### Editor features

- **Run** — executes JS in-browser (`new Function`), prints `console.log` output into an output pane; compile/runtime errors shown in red. **No test cases, no PASS/FAIL**
- **Save as file** — Blob download `solution.js`
- **Import file** — hidden `<input type="file">`, reads text into editor
- **localStorage autosave** — code persists across reloads (key per problem id / blank playground); popup dialog does **not** persist (transient snippets)
- **Reset** — restore starter code
- **Code blocks everywhere** — `▶ Run` inline + `Open in Editor` popup on every JS block in reading content
- Output pane with success/error states

---

## Out of Scope (explicitly decided)

- TiDB save of code (`problem_solutions` table) — no
- `/api/solutions` routes — no
- Multi-language (Python/C++/Java) — no
- Piston / external execution API — no
- **Test-case judge** — the existing **Test** button/runner on the problem tab is removed; `test_cases` column stays in the schema but is unused by the UI
- DB migration — none needed

---

## Tasks

1. ✅ Curate + generate `config/problems/top-problems.ts` — **183 problems** (150 + 100 deduped). Source: LeetCode GraphQL `studyPlanV2Detail` for `top-interview-150` + `top-100-liked` (the legacy `/api/problems/all/` no longer returns tags and problem-list pages are Cloudflare-walled). Every slug validated against the authoritative 4013-problem API — 0 dead links, 0 difficulty mismatches
2. ✅ Build `/problems/top` page (search, difficulty chips, topic/group dropdown, LeetCode links, empty state — static, zero DB queries) + "Top LeetCode" entry button on `/problems`
3. ✅ Strip the judge from `ProblemDetailClient`
4. ✅ Build shared editor (`/editor` page, inline problem editor, popup dialog, code-block Run)
5. ✅ Add "Open in Editor" to problem detail page
6. ☐ Verify: `npm run typecheck` ✅, Prettier ✅, build ✅ — pending **manual browser test** (signed-in): top-page search/filters/links + editor run/save/import on mobile + dark mode

## Risks

- Curated list source accuracy — verify URLs resolve (slug ↔ URL consistency) during generation
- Monaco first-load weight (~5 MB) — lazy-loaded + cached; acceptable on Hobby bandwidth
- `new Function` execution is sandbox-light — fine for a single-user learning tool, never feed it untrusted server data
