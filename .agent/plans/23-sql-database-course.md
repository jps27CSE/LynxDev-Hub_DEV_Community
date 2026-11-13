# 23 — SQL & Databases Course (Interactive, WASM SQLite)

> Created: 2026-11-13 · Status: **planned — awaiting approval** · Branch: `feature/sql-course`
> Companion: `config/courses/sql.ts` (to be created), registered via `config/courses/index.ts`.
> Practice model: **interactive in-browser SQL** — learner writes SQL in Monaco, hits Run, a WebAssembly SQLite engine (sql.js) executes it against a per-chapter seeded in-memory DB, and results render as a table. No server-side execution, no new API route, no new DB table.

## Business problem

LynxDEV teaches HTML/CSS/JS/TS/React/Node through interactive in-browser editor chapters, but there is **no databases course**. The Backend Engineer interview category and the question bank both include a "Database" tag group, yet the course catalog has nothing covering SQL — the single most common skill tested in backend/fullstack interviews and the daily tool of every developer who touches data. Add a beginner-friendly SQL & Databases course that bridges the JS/TS/Node courses and real-world backend work, reusing the existing lesson infrastructure with no new routes, tables, or API endpoints.

## Why this approach (Option B — interactive WASM SQLite)

- Course data already lives as `CourseData` objects in `config/courses/` — one new file (`sql.ts`) follows the exact convention, no new infra.
- Chapters are stored as JSONB in the existing `chapters` table — no schema migration, no new DB table (schema stays under 20).
- SQL *can* run in the browser via WebAssembly (sql.js compiles SQLite to WASM), unlike Node/Python. So unlike Linux/Git/Node, this course can be genuinely interactive — "write a query → see rows" — which is the highest-value feedback loop for SQL and matches the platform's "learn by doing in the browser" promise.
- All execution is client-side: no serverless function per Run, no TiDB RU per Run, no rate-limit surface, no security exposure from arbitrary SQL. Free-tier safe.
- The WASM bundle (~1MB, ~300KB gzipped) is lazy-loaded only on SQL chapters, so other pages pay nothing.
- Dialect: **SQLite**. It is the engine the WASM runner actually executes, 95% compatible with standard SQL, and the realistic choice for a learner's local practice. Syntax that is MySQL/Postgres-specific is called out in lessons with a "dialect note".

Alternatives rejected:
- **A (read-only, mirror Linux/Git):** ships in days but wastes SQL's best teaching affordance (instant tabular feedback) and forces learners to install a DB client before chapter 1.
- **C (hosted sandbox API):** arbitrary SQL against a real DB is a security nightmare, costs RUs per Run, and violates the "no server-side execution" rule established for the Node course.
- **D (hybrid):** two delivery models in one course is inconsistent and confusing.

## Scope (in / out)

In scope:
- `config/courses/sql.ts` — course metadata + 12 chapters (instructions, starter SQL, solution SQL, per-chapter `seedSql`).
- Register in `config/courses/index.ts`.
- Add `"sql"` to `ChapterContent.type` union (in `config/courses/types.ts` and `LessonClient.tsx`).
- Add optional `seedSql?: string` to `ChapterContent`.
- Add `sql` → `sql` in `getCourseLanguage`.
- Bump `COURSE_CACHE_VERSION` 4 → 5.
- Add `runSql(code, seedSql)` to `lib/editor.ts` using sql.js (dynamic import, code-split).
- Add a result-table renderer (in `components/editor/` or `OutputPane`) for SQL mode.
- Update `LessonClient.tsx` to handle `type === "sql"` (Run enabled, result table output, Show Solution).
- Self-host `sql-wasm.wasm` in `public/` (copy from `node_modules/sql.js/dist/`).
- Seed into DB via existing `config/seed-courses.ts` (run manually by maintainer).

Out of scope (deferred):
- True MySQL/Postgres execution (would need a hosted engine) — follow-up; dialect notes cover the gap.
- Query plan visualization / EXPLAIN UI — follow-up.
- Multi-statement transactions UI (BEGIN/COMMIT) — supported by the runner, but no dedicated UI; follow-up.
- Persisting learner's DB across chapters (each chapter resets to its seed) — by design, for reproducibility.
- Video embeds.

## Practice model (interactive, chosen)

- **SQL type.** Each chapter = instructions HTML (concept → SQL code blocks → "Learn more" links → "Your task") + Monaco editor (SQL-highlighted scratchpad) + "Run" button + result table + "Mark as Complete".
- `initialCode` = starter query (or empty scaffold) the learner edits.
- `solution` = the expected query (loaded by "Show Solution").
- `seedSql` = CREATE TABLE + INSERT statements run into a fresh in-memory DB before the learner's query. This is what makes each chapter reproducible.
- Runner returns either a result set (columns + rows) for SELECT, or "N rows affected" for DML/DDL, or an error with the SQLite message.
- Learner can also run their own SQL in a local SQLite/DB Browser — link-out provided.

## Files & routes

| File | Purpose |
|------|---------|
| `config/courses/sql.ts` | CourseData: title, description, difficulty=Beginner, category=Backend, order_index=9, 12 chapters |
| `config/courses/types.ts` | Add `"sql"` to `type` union; add `seedSql?: string` |
| `config/courses/index.ts` | Add `sqlCourse` to `allCourses` |
| `lib/course-data.ts` | Add `sql` → `sql` in `getCourseLanguage`; bump `COURSE_CACHE_VERSION` 4 → 5 |
| `lib/editor.ts` | Add `runSql(code, seedSql)` using sql.js (dynamic import) |
| `components/editor/SqlResultTable.tsx` | New — renders columns + rows as a table |
| `app/(routes)/learn/[courseId]/[chapterId]/LessonClient.tsx` | Handle `type === "sql"`: Run enabled, result table, Show Solution |
| `public/sql-wasm.wasm` | Self-hosted WASM binary (copied from `node_modules/sql.js/dist/`) |

Routes that pick it up automatically:
- `/courses` — catalog (new course card appears)
- `/courses/[id]` — course detail
- `/learn/[courseId]/[chapterId]` — lesson page (already built)

No new routes, no schema migration, no new table, no new API route.

## Chapter plan (12 chapters)

| # | Title | Concepts | Points |
|---|-------|----------|--------|
| 1 | What Is a Database? | tables, rows, columns, keys, SQL vs NoSQL | 10 |
| 2 | SELECT & Filtering | SELECT, WHERE, AND/OR/NOT, IN, BETWEEN, LIKE, NULL | 10 |
| 3 | Sorting & Limiting | ORDER BY, LIMIT, OFFSET, DISTINCT | 10 |
| 4 | Aggregates & GROUP BY | COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING | 10 |
| 5 | JOINs | INNER, LEFT, RIGHT (via workaround), self-join, USING | 10 |
| 6 | Subqueries & CTEs | nested SELECT, WITH, readable queries | 10 |
| 7 | INSERT, UPDATE, DELETE | DML, WHERE safety, RETURNING | 10 |
| 8 | Schema Design (DDL) | CREATE TABLE, data types, constraints, PK/FK, ALTER | 10 |
| 9 | Indexes & Performance | CREATE INDEX, EXPLAIN QUERY PLAN, when to index | 10 |
| 10 | Normalization | 1NF/2NF/3NF, when to denormalize | 10 |
| 11 | Transactions & ACID | BEGIN, COMMIT, ROLLBACK, isolation, constraints | 10 |
| 12 | Project — Library Database | seeded schema; queries across books/authors/loans | 25 |

## Resources (verified free, link-out only)

| Resource | What it covers | Used in |
|----------|---------------|---------|
| SQLite Docs — SQL syntax | authoritative syntax reference | Ch 2-12 |
| SQLite Docs — CREATE TABLE / types | DDL + type affinity | Ch 8 |
| SQLite Tutorial (sqlitetutorial.net) | beginner-friendly SQLite walkthrough | Ch 1-7 |
| W3Schools SQL | quick reference for statements | Ch 2-7 |
| SQLBolt (sqlbolt.com) | interactive in-browser exercises | Ch 2-6 |
| SQLZoo (sqlzoo.net) | interactive practice with grading | Ch 2-6 |
| Mode SQL Tutorial (mode.com/sql-tutorial) | analytics-focused SQL | Ch 4-6 |
| PostgreSQL Docs — SQL | standard SQL reference (dialect notes) | Ch 8, 10 |
| DB Browser for SQLite | local GUI for practice | Ch 1-12 |
| DB Fiddle (db-fiddle.com) | online playground (MySQL/Postgres) | Ch 8-12 |

## Database / seeding

Tables already exist. No migration.

```bash
npx tsx config/seed-courses.ts
```

`order_index: 9` places it after HTML/CSS/JS/Linux/TS/Git/React/Node. `chapter_count` set by seeder (12).

## Implementation tasks

Dependencies noted. Execute in order.

1. **Research & verify resources** — confirm all URLs in the Resources table return 200 (curl). Drop any that 404/redirect. ✅ (done during planning)
2. **Install `sql.js`** — `npm install sql.js` (adds ~1MB to node_modules; only the WASM is shipped to client, lazy-loaded). Commit `package.json` + lockfile. ✅ Done — v1.16.0, `sql-wasm.wasm` is 673KB, 0 vulnerabilities.
3. **Self-host WASM** — copy `node_modules/sql.js/dist/sql-wasm.wasm` to `public/sql-wasm.wasm`. Document the copy step in the plan (re-run after `npm install`). ✅ Done — `public/sql-wasm.wasm` (673KB). Re-run `cp node_modules/sql.js/dist/sql-wasm.wasm public/sql-wasm.wasm` after any `npm install` that touches sql.js.
4. **Extend `ChapterContent` type** — add `"sql"` to `type` union in `config/courses/types.ts` and `LessonClient.tsx`; add `seedSql?: string`. ✅ Done — `config/courses/types.ts` and `LessonClient.tsx` updated; tsc clean.
5. **Implement `runSql` in `lib/editor.ts`** — dynamic import of sql.js, init with `locateFile: () => "/sql-wasm.wasm"`, run `seedSql` then `code`, return `{ columns, rows, rowCount, affectedRows, error, statementType }`. Handle multi-statement + DDL/DML (exec returns [] → use `db.run` + `getRowsModified`). Catch and return SQLite error messages. ✅ Done — `SqlRunResult` type + `runSql()` added; row cap 1000; dynamic import keeps WASM out of main bundle; `sql-js.d.ts` added for untyped module. tsc clean.
6. **Create `SqlResultTable` component** — renders columns as `<th>`, rows as `<tr>`; handles empty result, NULL display, row count footer, error state. Dark-mode friendly, responsive (horizontal scroll on mobile). ✅ Done — `components/editor/SqlResultTable.tsx` created (loading/empty/error/DML/SELECT states, NULL styling, row-count footer, truncation warning, horizontal scroll). tsc clean.
7. **Update `LessonClient.tsx`** — `isSqlMode = type === "sql"`; Run button enabled (not disabled like browser mode); on Run call `runSql(code, chapter.content.seedSql)`; render `SqlResultTable` in output pane; reset clears output; Show Solution loads solution + re-runs.
8. **Add `sql` → `sql` in `getCourseLanguage`** in `lib/course-data.ts`.
9. **Bump `COURSE_CACHE_VERSION`** 4 → 5.
10. **Create `config/courses/sql.ts`** — 12 chapters with instructions, initialCode, solution, seedSql, points_reward. (Biggest single task — content authoring.)
11. **Register in `config/courses/index.ts`** — import + add to `allCourses`.
12. **Manual review + seed** (maintainer) — `npx tsx config/seed-courses.ts`; verify card on `/courses`; open a lesson; confirm SQL highlighting, Run produces a table, error states render, Show Solution works, dark mode, mobile.
13. **Run checks** — `npm test`, `npm run build`, `npm run format:check`, `npx tsc --noEmit`.
14. **(Optional) Add a test** — `tests/sql-runner.test.ts` exercising `runSql` against a seeded DB (SELECT returns rows, bad SQL returns error, DML returns affected count). sql.js runs in Node, so this stays DB-free. Mutation-test once.

## Free-tier checklist

- [x] All DB queries paginated elsewhere (no new queries)
- [x] No new API routes
- [x] No file uploads
- [x] Soft deletes unaffected
- [x] JSON columns used (chapters JSONB)
- [x] Schema stays under 20 tables (14/20)
- [x] Images: none in lessons
- [x] TiDB pool respected (no new connections)
- [x] No server-side SQL execution (all in-browser via WASM)
- [x] WASM bundle lazy-loaded (dynamic import) — only SQL-chapter visitors pay
- [x] New dependency justified (`sql.js`) — enables interactive execution that read-only cannot provide; ~300KB gzipped, cached

## Learning summary (to fill in after implementation)

Concepts: WASM-in-browser execution, code-splitting a heavy dependency, structured query results, per-chapter DB seeding for reproducibility, dialect portability (SQLite vs standard SQL), Monaco's built-in SQL language mode.

New terms: `sql.js`, `initSqlJs`, `locateFile`, `db.exec`, `seedSql`, `COURSE_CACHE_VERSION`, `ChapterContent.type`.

Patterns used: mirror `node.ts`/`linux.ts` for read-only scaffolding; mirror `editor.ts`'s `runJavaScript` for the runner contract; reuse `OutputPane`/`LessonClient` shell.

Mistakes avoided: no server-side execution, no new API route, no new table, no hardcoded WASM URL (self-hosted), no global bundle bloat (dynamic import), no unbounded fetches.