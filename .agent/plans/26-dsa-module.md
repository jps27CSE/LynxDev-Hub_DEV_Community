# DSA Learning Module — interactive data structures & algorithms

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a first-class `/dsa` learning module that mirrors `/system-design` in shape (index → module → lessons → task) but is purpose-built for data structures and algorithms: concept lessons with runnable code, pattern-based practice, and step-through visual animations of algorithms operating on real data structures. Content is config-driven (no DB rows for lessons), progress is persisted per user, and the interactive core is a frame-based visual player rather than a graph canvas.

**Architecture:** A new dependency-free contract (`config/dsa/types.ts`) shared by content, engine and canvas, mirroring `config/system-design/types.ts`. Modules live as files under `config/dsa/modules/` and register through `config/dsa/registry.ts`. Routes mirror system design: `/dsa`, `/dsa/[module]`, `/dsa/[module]/lesson/[slug]`, `/dsa/[module]/task`. Visual animations are frame arrays rendered by a generic `VisualPlayer` with per-structure renderers (Array, Tree, Graph, LinkedList). Code practice reuses the existing Monaco + `runJavaScript` runner from `/learn` and `/problems`. Progress persists in a new `dsa_user_state` table (one row per user), mirroring `sd_user_state`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Drizzle/TiDB, Tailwind v4, Monaco editor (existing), `node:test` via tsx, Prettier. No new runtime dependency.

**Spec:** §2 of this document (design agreed in conversation, 2026-11-23).

> **Status:** Tasks 1–2 done. Task 1 (commit `542837e`): contract `config/dsa/types.ts`. Task 2 (commit pending): registry `config/dsa/registry.ts` + `tests/dsa-registry.test.ts` (5 new tests, all green). Task 3 next.

## Context

LynxDEV already has three overlapping surfaces for "algorithms":

1. **Courses** (`/learn/[courseId]/[chapterId]`) — config-driven chapters, Monaco editor, Run/Reset/Solution, mark-complete, points. Language courses (HTML, JS, SQL, …). No DSA content today; courses are being rebuilt from scratch (Phase 1.2/1.3 "Restart").
2. **Problems** (`/problems/[slug]`) — LeetCode/Codewars drills, split-pane statement + editor, Run-only. Practice, not teaching.
3. **System Design** (`/system-design/...`) — the gold-standard module shape: config-driven modules with left-rail chapters, lessons (scenario/concept/diagram/your_turn/compare/recap/video), Build Tasks on a canvas with steps + pass criteria, persisted progress in `sd_user_state`, content rules enforced by `check:system-design`.

The user explicitly wants DSA to be **a separate module like system design**, not a course and not a problem list. That means: its own route namespace, its own config tree, its own progress table, its own interactive task page — while reusing the proven machinery (Monaco runner, progress/points UX, content-rule gates, sidebar entry).

**Why a separate module and not a course:** courses are linear chapter lists with a single editor; system-design-style modules carry structured lessons with named sections, a visual/diagram block, retrieval-practice (`your_turn`), and a Build Task that grades a *decision* rather than a *score*. DSA's value is in *seeing* an algorithm move (pointers, swaps, traversals) — that needs a visual player, which courses don't have. DSA also spans 18+ topics, which as one course would be an unreadable chapter rail.

**Free-tier constraints (from `.agent/architecture.md` / I.3):** no new dependency, no file uploads, schema stays under 20 tables (currently 14), TiDB RU budget ~5M/month at 150 active users, Vercel Hobby CPU. The visual player must be pure client-side (no server render of animations); code execution stays in-browser (no Python runner — see §Decisions).

## Global Constraints

- `npm test` must stay green and must never import `config/db` (tests run before `Build` in CI).
- TypeScript strict: no `any`, no `as` casts on Drizzle results.
- Client components may only `import type` from modules that reach `config/db` (I.9). `config/dsa/types.ts` and `config/dsa/registry.ts` must stay runtime-dependency-free.
- No new runtime dependency. Visual player uses SVG + React state only.
- No DB schema change beyond the single `dsa_user_state` table. Schema count 14 → 15 (still under 20).
- DSA code execution is **JavaScript only** for v1 (reuses `runJavaScript`/`runTypeScript`). Python/C++ are out of scope; noted as a future slice (see §Non-goals).
- Content rules enforced by a `check:dsa` script (mirroring `check:system-design`) plus `npm test` gates, so a broken link / unbound lesson fails CI rather than shipping.
- Prettier enforced on every touched file.
- No agent commits. Each task ends with a manual-test handoff; the user commits.

## Decisions (agreed)

1. **Interactive core = hybrid (option 4):** each module has read-only concept lessons *with* a step-through visual animation where the topic visualises well (Two Pointers, Sliding Window, Binary Search, BFS/DFS, Tree traversals, Sorting), *plus* a code challenge with hidden tests where applicable. The animation is the differentiator; the code challenge is the practice. Topics that don't visualise cleanly (Hashing internals, DP tables) ship as concept + code only.
2. **Visual player is frame-based, not a canvas editor.** A lesson/task provides an ordered array of `DsaFrame`s; the player renders the current frame with Prev/Next/Play/Auto controls and a caption. Renderers: `ArrayVisualizer` (cells + pointer arrows + highlighted ranges), `TreeVisualizer`, `GraphVisualizer`, `LinkedListVisualizer`. This is ~10× cheaper than a graph editor and is incremental per topic.
3. **Progress model mirrors system design:** `dsa_user_state` with `lessonsCompleted: string[]` and `tasks: Record<slug, DsaTaskState>`. A "lesson" id is `<module>/<lesson-slug>`; a task id is `<module>/task`.
4. **Code language = JavaScript** for v1. Reuses existing runner; no infra change. Python is a documented non-goal.
5. **Content is config-driven**, like system design, so there are no seed scripts and no DB rows for lessons. Only user progress touches the DB.
6. **Points/awards:** reuse the existing `/api/progress` points flow? No — that's course/chapter keyed. DSA awards points via a thin `POST /api/dsa/progress` that increments `users.points` and records the lesson in `dsa_user_state`. Keeps DSA self-contained and avoids coupling to course ids.

## Non-goals (v1)

- Python/C++/Java code execution.
- A graph-editor canvas like system design (frame-based player only).
- Adaptive difficulty / spaced repetition (Striver-style) — content ordering only.
- Mock-interview integration (Phase 5).
- Admin authoring UI — content is code, like system design.

## Syllabus — beginner → intermediate → advanced

Derived from Striver's A2Z (474 problems), WSCubeTech 2026 syllabus, the 8-week interview plan, NeetCode patterns, and Namaste DSA. Organised into **modules** (each = one `config/dsa/modules/<slug>.ts`), each with 3–6 lessons + an optional Build Task. Difficulty tiers are a *content* property (`part`), not a separate route.

### Part 0 — Foundations (beginner)
- **M0 `foundations`** — what DSA is, Big-O/Theta/Omega, time vs space, best/avg/worst case, recursion basics (call stack, base case), iteration vs recursion. *Prose + code. No visual.*
- **M1 `complexity-and-maths`** — counting operations, loop analysis, recurrence (T(n)=2T(n/2)+n), Master theorem intro, bit/number basics (gcd, sieve, primes). *Prose + code.*

### Part 1 — Core data structures (beginner → intermediate)
- **M2 `arrays-and-strings`** — array memory model, traversal, in-place ops, prefix sums, two-pointer intro, string immutability. *Visual: two pointers on an array.*
- **M3 `searching`** — linear search, binary search (iterative + recursive), search on answer space, lower/upper bound. *Visual: binary search halving.*
- **M4 `sorting`** — bubble, selection, insertion, merge, quick, counting, radix; stability; when to use which. *Visual: sorting a bar chart step by step.*
- **M5 `hashing`** — hash functions, collisions, chaining vs open addressing, hash map/set, frequency counting, anagram/grouping. *Prose + code.*
- **M6 `linked-lists`** — node, singly/doubly/circular, insert/delete at head/tail, reverse (iterative + recursive), cycle detection (Floyd), merge two sorted lists. *Visual: pointer rewiring.*
- **M7 `stacks-and-queues`** — array vs linked impl, monotonic stack, min-stack, deque, circular queue, BFS queue. *Visual: stack push/pop.*

### Part 2 — Patterns (intermediate)
- **M8 `two-pointers-and-sliding-window`** — opposite ends, fast/slow, fixed window, variable window, "at most K distinct", minimum window substring. *Visual: window expansion/contraction.*
- **M9 `recursion-and-backtracking`** — subsets, permutations, combinations, N-queens, sudoku, pruning. *Visual: recursion tree.*
- **M10 `binary-trees`** — representation, traversals (pre/in/post/level), height, diameter, LCA, path sums, serialize/deserialize. *Visual: traversal highlighting.*
- **M11 `binary-search-trees`** — BST property, insert/delete/search, validation, kth smallest, LCA in BST. *Visual: BST insert.*
- **M12 `heaps`** — min/max heap, heapify, priority queue, top-K, median from stream, task scheduler. *Visual: heap sift-up/sift-down.*
- **M13 `greedy`** — interval scheduling, jump game, fractional knapsack, Huffman, proof intuition. *Prose + code.*

### Part 3 — Advanced
- **M14 `graphs`** — representation (adjacency list/matrix), BFS, DFS, cycle detection (undirected/directed), topological sort (Kahn + DFS), shortest paths (Dijkstra, Bellman-Ford, 0-1 BFS), MST (Prim, Kruskal), union-find. *Visual: BFS layers, Dijkstra relaxation.*
- **M15 `dynamic-programming`** — memoization vs tabulation, 1D/2D DP, knapsack, LCS, LIS, coin change, grid DP, state compression intro. *Visual: DP table fill.*
- **M16 `tries`** — trie node, insert/search/prefix, word search II, xor basis intro. *Visual: trie insertion.*
- **M17 `advanced-topics`** — bit manipulation patterns, segment tree / Fenwick tree, sqrt decomposition, string algorithms (KMP, Rabin-Karp), union-find advanced. *Prose + code, selected visuals.*

**MVP content scope (this plan):** infrastructure + Part 0 (M0, M1) + three representative Part 1/2 modules that exercise every rendering path — M2 (arrays, two-pointer visual), M3 (binary search visual), M10 (tree traversal visual) + their Build Tasks. Remaining modules are content slices authored after the module proves out, following the system-design slice pattern (B2–B7). Total target: 18 modules; MVP ships 5.

## File structure

| File | Responsibility |
|---|---|
| `config/dsa/types.ts` (create) | Dependency-free contract: `DsaNode`, `DsaFrame`, `DsaVisualKind`, `DsaLessonSection`, `DsaLesson`, `DsaChapter`, `DsaTaskDef`, `DsaStep`, `DsaPassCriterion`, `DsaModule`, `DsaModuleKind`, `DsaUserState`, `DsaTaskState`. |
| `config/dsa/registry.ts` (create) | `loadAllDsaModules`, `getModule`, `getLesson`, `getAllModuleSlugs`. Prototype-chain guard on `getModule`. |
| `config/dsa/modules/*.ts` (create) | One file per module (content + task). MVP: `foundations.ts`, `complexity-and-maths.ts`, `arrays-and-strings.ts`, `searching.ts`, `binary-trees.ts`. |
| `config/dsa/visuals.ts` (create) | Shared frame builders + sample frames for MVP modules. |
| `config/schema.tsx` (modify) | Add `dsa_user_state` table. |
| `drizzle/00XX_*.sql` (generated) | Migration for `dsa_user_state`. |
| `lib/dsa-data.ts` (create) | `getDsaUserState`, `markLessonComplete`, `saveTaskState`. Rate-limited, try/catch, logging. |
| `app/(routes)/dsa/page.tsx` (create) | Module index (list modules by part, progress). |
| `app/(routes)/dsa/[module]/page.tsx` (create) | Module page: chapters rail + lessons list + task entry. |
| `app/(routes)/dsa/[module]/lesson/[slug]/page.tsx` (create) | Lesson page: sections + visual player + code runner + mark complete. |
| `app/(routes)/dsa/[module]/task/page.tsx` (create) | Build Task page: visual player + steps + pass criteria + save. |
| `components/dsa/VisualPlayer.tsx` (create) | Frame-based player (Prev/Next/Play/Auto, caption, speed). |
| `components/dsa/visualizers/{Array,Tree,Graph,LinkedList}Visualizer.tsx` (create) | Per-structure renderers. |
| `components/dsa/DsaCodeRunner.tsx` (create) | Monaco + run/reset/solution, reused runner. |
| `app/api/dsa/progress/route.ts` (create) | `POST` mark lesson complete → updates `dsa_user_state` + `users.points`. Zod + Clerk auth + rate limit. |
| `app/api/dsa/task-state/route.ts` (create) | `GET`/`POST` task state (save graph-less task progress). |
| `app/(routes)/_components/Sidebar.tsx` (modify) | Add "DSA" entry (icon `Binary` or `Brackets`). |
| `tests/dsa-registry.test.ts` (create) | Registry gate both directions. |
| `tests/dsa-content.test.ts` (create) | Content rules: every lesson bound, every visual frame valid, every code sample runnable shape. |
| `scripts/check-dsa.ts` (create) | Post-build guard (mirrors `check:system-design`). |
| `.agent/feature-tracker.md` (modify) | Add Phase 6.x or new Phase 7 row for DSA. |

## Design

### 1. Contract (`config/dsa/types.ts`) — dependency-free

Mirrors `SdLessonSection` but DSA-specific. Key additions over system design:

```ts
export type DsaVisualKind = "array" | "tree" | "graph" | "linkedlist" | "stack" | "queue" | "heap";

export type DsaFrame = {
  /** Stable id within the animation. */
  id: string;
  /** Which renderer to use. */
  kind: DsaVisualKind;
  /** Caption shown under the visual (one sentence, beginner language). */
  caption: string;
  /** Renderer-specific payload. Kept as a discriminated union so a missed field is a compile error. */
  state:
    | { kind: "array"; values: (number | string)[]; pointers?: { index: number; label: string; color?: string }[]; highlight?: number[]; range?: [number, number] }
    | { kind: "tree"; nodes: { id: string; value: number | string; left?: string; right?: string }[]; root: string; highlight?: string[]; pointers?: { nodeId: string; label: string }[] }
    | { kind: "graph"; nodes: { id: string; label: string }[]; edges: { from: string; to: string; weight?: number; directed?: boolean }[]; highlightNodes?: string[]; highlightEdges?: string[] }
    | { kind: "linkedlist"; nodes: { value: number | string; next?: string }[]; head: string; highlight?: string[]; pointers?: { nodeId: string; label: string }[] }
    | { kind: "stack"; values: (number | string)[]; highlight?: number }
    | { kind: "queue"; values: (number | string)[]; highlight?: number }
    | { kind: "heap"; values: (number | string)[]; highlight?: number[] };
};

export type DsaLessonSection =
  | { kind: "scenario"; title: string; body: string }
  | { kind: "concept"; title: string; body: string }
  | { kind: "visual"; title: string; frames: DsaFrame[] }   // NEW: step-through animation
  | { kind: "code"; title: string; language: "javascript" | "typescript"; starter: string; solution: string; tests?: { input: string; expected: string }[] }
  | { kind: "your_turn"; prompt: string }
  | { kind: "compare"; body: string }
  | { kind: "recap"; points: string[] }
  | { kind: "video"; videoId: string; title: string; caption?: string };

export type DsaLesson = {
  slug: string;
  title: string;
  sections: DsaLessonSection[];
  sources?: { label: string; url: string }[];
  attribution: string;
};

export type DsaChapter = { slug: string; title: string; description?: string; children?: DsaChapter[] } & (
  | { lessonSlug: string }
  | { children: DsaChapter[] }
);

export type DsaStep = { id: string; title: string; brief: string; hint: string; reveal: string; check: (state: DsaTaskState) => { passed: boolean; progress: string } };
export type DsaPassCriterion = { id: string; label: string; required: boolean; assert: (state: DsaTaskState) => boolean; explain: string };

export type DsaTaskDef = {
  brief: string;
  /** Starting state the learner manipulates (e.g. an array + a target). */
  startState: DsaTaskState;
  /** Reference solution state. */
  solutionState: DsaTaskState;
  steps: DsaStep[];
  passCriteria: DsaPassCriterion[];
};

export type DsaTaskState = {
  /** Free-form JSON the task manipulates (array, pointers, etc.). Schema is per-task. */
  data: unknown;
  completedSteps: string[];
  criteriaMet: string[];
  attempts: number;
  revealed: string[];
  updatedAt: string;
};

export type DsaModuleKind = "lesson" | "lesson+task";

export type DsaModule = {
  slug: string;
  order: number;
  part: 0 | 1 | 2 | 3;
  partTitle: string;
  title: string;
  description: string;
  kind: DsaModuleKind;
  story: string;
  chapters?: DsaChapter[];
  lessons: DsaLesson[];
  interviewByte?: { shape: string; strongAnswer: string; trap: string };
  task?: DsaTaskDef;
  recap: string[];
  attribution: string;
};

export type DsaUserState = {
  lessonsCompleted: string[];
  tasks?: Record<string, DsaTaskState>;
};
```

Notes:
- `DsaFrame.state` is a discriminated union so a typo'd field is a compile error.
- `DsaTaskState.data` is `unknown` because each task's shape differs (array + two pointers vs tree + target). Steps/criteria are per-task code, so they narrow internally. This mirrors how system design keeps `SdGraph` generic but typed.

### 2. Registry (`config/dsa/registry.ts`)

Mirrors `config/system-design/registry.ts`:
- `loadAllDsaModules(): DsaModule[]` — static imports of all module files, sorted by `order`.
- `getModule(slug): DsaModule | undefined` — prototype-chain guard (`Object.hasOwn`), so `getModule("__proto__")` returns `undefined`.
- `getLesson(moduleSlug, lessonSlug): DsaLesson | undefined`.
- `getAllModuleSlugs(): string[]`.

Dependency-free. No DB.

### 3. Progress (`dsa_user_state`)

Schema (Drizzle):
```ts
dsaUserState: mysqlTable("dsa_user_state", {
  userId: varchar("user_id", { length: 255 }).primaryKey(), // Clerk userId
  lessonsCompleted: json("lessons_completed").$type<string[]>().default([]),
  tasks: json("tasks").$type<Record<string, DsaTaskState>>().default({}),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
})
```
One row per user. Mirrors `sd_user_state`. camelCase at the TS edge, snake_case columns.

Rate-limited endpoints (per I.4 pattern):
- `POST /api/dsa/progress` — `{ moduleSlug, lessonSlug }` → marks lesson complete, awards points (e.g. 10 per lesson), updates `dsa_user_state`. Zod + Clerk auth + 10 req/min.
- `GET/POST /api/dsa/task-state` — read/write task state. 10 req/min.

### 4. Routes

Mirror system design exactly:
- `/dsa` — server component, lists modules grouped by `part`, shows completion counts from `dsa_user_state` (if signed in).
- `/dsa/[module]` — module page: chapters rail (left) + lessons list + task entry (if `kind === "lesson+task"`).
- `/dsa/[module]/lesson/[slug]` — lesson page: sections rendered top-to-bottom; `visual` → `<VisualPlayer frames=.../>`; `code` → `<DsaCodeRunner/>`; mark-complete button.
- `/dsa/[module]/task` — task page: visual player seeded with `startState`, steps list with hint/reveal ladder, pass criteria, save state.

### 5. Visual player (`components/dsa/VisualPlayer.tsx`)

Client component. Props: `frames: DsaFrame[]`. State: `index`, `playing`, `speed`. Controls: Prev, Next, Play/Pause, Reset, speed (0.5×/1×/2×). Renders the frame's renderer based on `frame.state.kind`. Caption below. Auto-advance on Play with `setTimeout` (no `setInterval` leak — cleared on unmount). Keyboard: ←/→ step, Space play/pause (when focused).

Renderers are pure presentational: given a frame state, draw SVG/divs. No engine, no simulation. Animation is *authored* as frames, not computed — this is the key simplification that keeps it cheap and reviewable.

### 6. Code runner (`components/dsa/DsaCodeRunner.tsx`)

Reuses `MonacoEditor` + `runJavaScript`/`runTypeScript` from `lib/editor`. Adds: starter/solution toggle, "Run tests" button that runs each `tests[i]` by injecting a call and comparing `console.log` output to `expected`. Lightweight — no Jest; just eval + capture. Reuses the sandboxed-iframe pattern for safety (lesson code runs in `allow-scripts` iframe).

### 7. Content rules (`lib/dsa/content-rules.ts` + `scripts/check-dsa.ts`)

Mirrors `lib/system-design/content-rules.ts`:
- Every `DsaChapter` leaf has a `lessonSlug` and that lesson exists.
- No duplicate lesson slugs within a module.
- Every `visual` section has ≥ 1 frame; every frame's `state.kind` matches its renderer.
- Every `code` section has non-empty `starter` and `solution`.
- `check-dsa` runs after build (reads prerendered HTML) and asserts module/lesson routes resolve.

### 8. Sidebar + sitemap

Add `{ label: "DSA", href: "/dsa", icon: Binary }` (or `Brackets`) to `Sidebar.tsx` links. Add `/dsa` to sitemap. Feature-tracker row.

## Tasks

### Task 1: Contract types

**Files:** `config/dsa/types.ts` (create). No test yet (types only).

- [ ] **Step 1:** Create `config/dsa/types.ts` with the contract in §Design.1. Dependency-free (no imports). Include a header comment explaining the I.9 boundary (like system design's).
- [ ] **Step 2:** `npx tsc --noEmit` → clean.
- [ ] **Step 3:** Handoff.

### Task 2: Registry

**Files:** `config/dsa/registry.ts` (create), `tests/dsa-registry.test.ts` (create).

- [ ] **Step 1: Write failing test** — import `loadAllDsaModules`, `getModule`, `getLesson`; assert `getModule("__proto__")` is `undefined`; assert every module's `lessons` slugs are unique; assert `getLesson(m, l)` returns the right lesson for a known pair (will be populated in Task 5).
- [ ] **Step 2:** Run `npm test` → fails (module not found).
- [ ] **Step 3:** Implement registry mirroring system design's. Static imports array starts empty (modules added in Task 5); `loadAllDsaModules` returns `[]` until then. `getModule` uses `Object.hasOwn`.
- [ ] **Step 4:** Run `npm test` → green (empty registry passes the structural assertions).
- [ ] **Step 5:** Handoff.

### Task 3: DB schema + migration

**Files:** `config/schema.tsx` (modify), generated migration.

- [ ] **Step 1:** Add `dsaUserState` table per §Design.3.
- [ ] **Step 2:** `npx drizzle-kit generate` → review SQL → `npx drizzle-kit migrate` in dev.
- [ ] **Step 3:** `npm run check:migrations` → green (no drift).
- [ ] **Step 4:** Handoff.

### Task 4: Data access + API routes

**Files:** `lib/dsa-data.ts` (create), `app/api/dsa/progress/route.ts` (create), `app/api/dsa/task-state/route.ts` (create).

- [ ] **Step 1:** Implement `getDsaUserState(userId)`, `markLessonComplete(userId, moduleSlug, lessonSlug)` (idempotent, awards 10 points via `users.points` increment, upserts row), `getTaskState`, `saveTaskState`.
- [ ] **Step 2:** `POST /api/dsa/progress` — Zod `{ moduleSlug, lessonSlug }`, Clerk `auth()`, rate limit 10/min, calls `markLessonComplete`, returns `{ points, pointsAwarded, alreadyCompleted }`.
- [ ] **Step 3:** `GET/POST /api/dsa/task-state` — Zod `{ moduleSlug }` (GET) / `{ moduleSlug, taskSlug, state }` (POST), auth, rate limit 10/min.
- [ ] **Step 4:** `npx tsc --noEmit` + manual curl signed-out → 401/307. Handoff.

### Task 5: First content modules (MVP content)

**Files:** `config/dsa/modules/foundations.ts`, `complexity-and-maths.ts`, `arrays-and-strings.ts`, `searching.ts`, `binary-trees.ts` (create); update registry imports.

Each module: 3–5 lessons following the section kinds, at least one `visual` section per module that visualises (arrays: two-pointer; searching: binary search; trees: inorder traversal), at least one `code` section, a Build Task for arrays + searching + trees, an `interviewByte`, `recap`, `attribution`.

Content authoring rules (from system-design lessons learned):
- Every `visual` frame's `state.kind` matches a renderer.
- Every lesson slug unique within module.
- `sources` 1–3 per lesson, https only.
- Copy titles verbatim where cross-linking; no paraphrase.

- [ ] **Step 1:** Author `foundations.ts` (prose + code, no visual) and `complexity-and-maths.ts`.
- [ ] **Step 2:** Author `arrays-and-strings.ts` with two-pointer visual + code + task.
- [ ] **Step 3:** Author `searching.ts` with binary-search visual + code + task.
- [ ] **Step 4:** Author `binary-trees.ts` with traversal visual + code + task.
- [ ] **Step 5:** Register all five in `registry.ts`.
- [ ] **Step 6:** `npm test` → registry gate green. Handoff.

### Task 6: Visual player + renderers

**Files:** `components/dsa/VisualPlayer.tsx`, `components/dsa/visualizers/{Array,Tree,Graph,LinkedList,Stack,Queue,Heap}Visualizer.tsx`.

- [ ] **Step 1:** `VisualPlayer` — frame index state, Prev/Next/Play/Pause/Reset, speed selector, auto-advance with cleared timeout on unmount, keyboard shortcuts, caption. Client component. No DB imports.
- [ ] **Step 2:** Renderers — pure presentational, take a frame state, draw with SVG/divs + Tailwind. Dark-mode aware.
- [ ] **Step 3:** Storybook-ish manual check: render player with a sample frames array in a scratch page; verify step-through, play, reset, keyboard. Handoff.

### Task 7: Code runner

**Files:** `components/dsa/DsaCodeRunner.tsx`.

- [ ] **Step 1:** Monaco editor + Run/Reset/Solution + console output, reusing `runJavaScript`/`runTypeScript`. Test runner: for each `tests[i]`, eval `solution(input)` and compare to `expected` (stringified). Show pass/fail per test.
- [ ] **Step 2:** Typecheck + manual run. Handoff.

### Task 8: Routes

**Files:** `app/(routes)/dsa/page.tsx`, `app/(routes)/dsa/[module]/page.tsx`, `app/(routes)/dsa/[module]/lesson/[slug]/page.tsx`, `app/(routes)/dsa/[module]/task/page.tsx`.

- [ ] **Step 1:** `/dsa` index — server component, lists modules grouped by `part`, shows completion counts (from `dsa_user_state` if signed in). Static where possible.
- [ ] **Step 2:** `/dsa/[module]` — module page: chapters rail + lessons list + task entry.
- [ ] **Step 3:** `/dsa/[module]/lesson/[slug]` — lesson page: sections top-to-bottom, `visual`→player, `code`→runner, mark-complete.
- [ ] **Step 4:** `/dsa/[module]/task` — task page: player seeded with `startState`, steps with hint/reveal ladder, pass criteria, save state via `/api/dsa/task-state`.
- [ ] **Step 5:** `npm run build` → routes resolve; `npx tsc` clean. Handoff.

### Task 9: Content rules + check script

**Files:** `lib/dsa/content-rules.ts` (create), `scripts/check-dsa.ts` (create), `package.json` (add `check:dsa`).

- [ ] **Step 1:** Content rules: leaf-has-lesson, unique slugs, visual has frames, code non-empty, frame state kind matches renderer set.
- [ ] **Step 2:** `check-dsa` post-build script asserting module/lesson/task routes resolve in prerendered HTML (mirrors `check:system-design`).
- [ ] **Step 3:** Wire `check:dsa` into CI after `Build` (note in plan; user/CI owner adds step).
- [ ] **Step 4:** `npm test` + `npm run check:dsa` (after build) green. Handoff.

### Task 10: Sidebar + sitemap + tracker

**Files:** `app/(routes)/_components/Sidebar.tsx` (modify), sitemap, `.agent/feature-tracker.md` (modify).

- [ ] **Step 1:** Add DSA sidebar entry (icon `Binary`).
- [ ] **Step 2:** Sitemap includes `/dsa` and module/lesson routes.
- [ ] **Step 3:** Tracker row: add Phase 7 "DSA Learning Module" (or extend Phase 2) with MVP modules listed; status In Progress.
- [ ] **Step 4:** Handoff.

### Task 11: Tests + verification

- [ ] **Step 1:** `tests/dsa-registry.test.ts` — both directions: every module slug resolves, every lesson slug resolves, no prototype-chain leak.
- [ ] **Step 2:** `tests/dsa-content.test.ts` — content rules gate (mutation-tested: drop a lessonSlug → fail; duplicate binding → fail).
- [ ] **Step 3:** `npm test`, `npx tsc --noEmit`, `npm run build`, `npm run check:dsa`.
- [ ] **Step 4:** Manual smoke: `/dsa`, one module, one lesson (visual plays), one task (saves state), signed-out → redirect. Handoff.

## Review focus

- **Visual player perf:** auto-play must not leak timers on unmount; test by navigating away mid-play.
- **Client bundle boundary (I.9):** `config/dsa/types.ts` and `registry.ts` must have zero imports; verify `npm run build` doesn't pull mysql2 into the DSA client bundle.
- **Progress correctness:** marking a lesson complete twice must not double-award points (idempotent).
- **Content drift:** `check:dsa` must catch a renamed lesson slug before deploy.
- **Free-tier:** `dsa_user_state` writes only on explicit completion/save, never on render or auto-save (no 2s autosave storm like system design had).

## Shipped record (to be filled on completion)

- Tests: ___ → ___
- Modules shipped (MVP): 5
- Visual animations: ___ frames across ___ modules
- Schema: 14 → 15 tables
- Deviations: (record here)

## Appendix A — Full syllabus (content roadmap beyond MVP)

Part 0 — Foundations: M0 `foundations`, M1 `complexity-and-maths`.
Part 1 — Core: M2 `arrays-and-strings`, M3 `searching`, M4 `sorting`, M5 `hashing`, M6 `linked-lists`, M7 `stacks-and-queues`.
Part 2 — Patterns: M8 `two-pointers-and-sliding-window`, M9 `recursion-and-backtracking`, M10 `binary-trees`, M11 `binary-search-trees`, M12 `heaps`, M13 `greedy`.
Part 3 — Advanced: M14 `graphs`, M15 `dynamic-programming`, M16 `tries`, M17 `advanced-topics`.

MVP ships M0, M1, M2, M3, M10. Remaining 13 modules are content slices to be authored after the module infrastructure proves out, one module per slice, following the system-design slice pattern (infrastructure already in place, so each slice is content + a test).

## Appendix B — Best external resources (for `sources` blocks)

- **Striver's A2Z DSA Sheet** (takeuforward.org) — 474 problems, 18 sections, A-to-Z ordering; best single ordered path for interview prep.
- **NeetCode 150 / Blind 75** — pattern-grouped problem lists; use for the "pattern tracks" cross-link.
- **Princeton Algorithms (Sedgewick/Wayne)** — rigorous free academic course (Java); best for theory depth.
- **Stanford Algorithms (Roughgarden)** — conceptual, language-agnostic; best for "why".
- **GeeksforGeeks DSA Tutorial** — broad reference for individual topics.
- **VisuAlgo** (visualgo.net) — gold-standard algorithm visualizations; cite as a source, do not embed (licensing).
- **Namaste DSA** (namastedev.com) — beginner-friendly roadmap with videos.
- **8-week interview plan** (onlinecourseing.com) — pacing reference for the syllabus ordering.

## Appendix C — Visual animation design notes

- Frames are *authored*, not computed. Each module author writes the frame array by hand (like system design authors graphs). This makes animations reviewable and deterministic; no animation engine to debug.
- A topic gets a visual only if it has a clean "state + pointers" story. If not, it ships as concept + code.
- Renderers stay dumb: they receive a frame state and draw it. No logic, no simulation. All "intelligence" lives in the authored frames.
- Max ~30 frames per animation to keep payload small and the learner's attention.
- Auto-play defaults to 1× and pauses on the last frame (no loop) so the learner isn't forced to watch repeats.