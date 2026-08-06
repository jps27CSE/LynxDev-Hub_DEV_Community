# Top 200 LeetCode Problems + Browser Code Editor

> **Phase:** 2 (DSA Problems) / 4 (Resource Hub adjacent)
> **Status:** Implemented — unified Problems workspace shipped; remaining: manual browser verify
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

### Files (shipped — superseded by the unified workspace below)

| File | Purpose |
|---|---|
| `config/problems/top-problems.ts` | Curated dataset: **183 problems** (Top Interview 150 + Top 100 Liked, deduped — 46 easy / 114 medium / 23 hard) with title/slug/difficulty/topics/group |
| `config/problems/top-statements.ts` | **Full LeetCode statements (markdown) + real JS starter code** for all 183 — generated once via `question(titleSlug){content, codeSnippets}` (anonymous GraphQL), HTML→markdown with turndown at generation time |

### ⭐ Unified Problems Workspace (replaces Part A design + inline editor page)

One **split-pane workspace** at `/problems/[slug]` — the editor has a real job on every problem:

- **`/problems/two-sum`** (slug) = top LeetCode problem; **`/problems/3`** (numeric) = in-house DB problem. One resolver in `lib/problem-data.ts` normalizes both into `WorkspaceProblem`
- **Left browser**: search (`/` shortcut), source segmented (All / In-House / LeetCode), difficulty chips, grouped rows (In-House · Top LeetCode) with ✓ solved markers + colored difficulty dots, solved counter — persisted in localStorage (`ws-solved:${key}`)
- **Right pane**: sticky problem header (title, difficulty, tags, prev/next, **Mark solved**, **Solve on LeetCode ↗**), statement rendered with the existing `AnswerMarkdown` stack (markdown = inert, no sanitizer needed), shared editor (Monaco + Run/Reset/Save/Import + output) preloaded with **LeetCode's real starter template**, `Ctrl+Enter` runs, localStorage autosave keyed `problem:${key}` (unified with `/editor` via `problem:db:${id}`)
- `/problems` → redirects to first problem (`/problems/merge-sorted-array`); `/problems/top` route + badge button **deleted**; old paginated `ProblemsClient` deleted
- Mobile: sidebar collapses to a problem `<select>` + search bar
- **No judge, no test cases** (unchanged): Run-only + console.log self-testing; real validation happens on LeetCode

### Files

| File | Purpose |
|---|---|
| `app/(routes)/problems/[slug]/page.tsx` | Server: resolves slug (top) or numeric id (DB) → `WorkspaceProblem`; `notFound()` on miss |
| `app/(routes)/problems/[slug]/ProblemWorkspace.tsx` | Workspace shell: filter state, solved tracking, keyboard (`/` focus search, `Ctrl+Enter` run), mobile bar |
| `app/(routes)/problems/[slug]/_components/ProblemBrowser.tsx` | Sidebar list: search, source/difficulty filters, grouped rows with ✓/dot status |
| `app/(routes)/problems/[slug]/_components/ProblemPane.tsx` | Statement (`AnswerMarkdown`) + shared editor + sticky header (keyed by problem) |
| `app/(routes)/problems/page.tsx` | Redirect → first top problem |

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
| ~~Edit: `ProblemDetailClient.tsx`~~ | **Superseded** — replaced by the unified workspace (`/problems/[slug]`); judge stripped, shared editor used everywhere |
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

1. ✅ Curate + generate `config/problems/top-problems.ts` — **183 problems** (150 + 100 deduped). Source: LeetCode GraphQL `studyPlanV2Detail`. Every slug validated against the authoritative 4013-problem API — 0 dead links, 0 difficulty mismatches
2. ✅ Generate `config/problems/top-statements.ts` — full statements (markdown) + JS starter code for all 183 via anonymous `question{content, codeSnippets}`, HTML→markdown (turndown, dev-time)
3. ✅ Strip the judge; build the **unified workspace** (`/problems/[slug]` split-pane: browser + statement + editor); `/problems` → redirect; delete `/problems/top`, badge button, old `ProblemsClient`/`ProblemDetailClient`
4. ✅ Shared editor (`/editor` page, workspace editor, popup dialog, code-block Run) — worker-based execution (5s timeout, no tab freeze)
5. ✅ Solved tracking (localStorage `ws-solved:*`) + keyboard shortcuts (`/` search, `Ctrl+Enter` run)
6. ☐ Verify: `npm run typecheck` ✅, Prettier ✅, build ✅ — pending **manual browser test** (signed-in): browsing/filters, statement render, Run (incl. infinite loop → timeout), mark-solved persistence, mobile

## Risks

- ✅ Curated list source accuracy — validated against authoritative 4013-problem API during generation
- Monaco first-load weight (~5 MB) — lazy-loaded + cached; acceptable on Hobby bandwidth
- ✅ `new Function` execution — moved into a Web Worker: infinite loops terminated after 5s, no tab freeze, no DOM access
- Mirroring LeetCode statements/templates into static config — their content, but standard practice for OSS learning platforms (single-user, educational)
