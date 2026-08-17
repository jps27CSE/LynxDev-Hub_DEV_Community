# 11 — Beginner Problems (In-House Basic Track)

**Status:** Implemented — 36 absolute-beginner JS drills replace the 10 DSA clones; pending manual browser verify
**Phase:** 2.5 (Problem solving) · **Depends on:** #10 (unified problems workspace)

## Goal

The in-house problems are now a **Basic track** for total beginners (bootcamp users just
learning programming): print/console, variables, arrays, strings, functions & arguments,
conditionals, loops. LeetCode's 183 cover DSA; in-house covers "first hour of JavaScript".

## Source & Licensing

- 32 exercises adapted from **Codewars 8 kyu** katas — the canonical "total beginner"
  drill set. Ingested at dev time via the public API
  (`GET /api/v1/code-challenges/{slug}`, no auth): name, rank, tags, description validated
  (rank = 8kyu, `javascript` supported). Generator: `/tmp/opencode/gen/gen-beginner.mjs`.
- 4 original print/console drills (Hello World, variables, sum, count loop) — katas are
  return-based; `console.log` practice is explicit in the 4 originals and in every
  starter's "test your function" lines.
- Statements are **rewritten** into our format (not verbatim copies).

## Format

Every problem: Task → Example(s) → "How to check" → exact **Expected output** block.
Run-only self-check (no judge, consistent with #10): the starter code ends with
`console.log(...)` calls, so Run prints exactly what "Expected output" shows.

`console.log` formatting in the worker (`lib/editor.ts`): args joined with single spaces,
arrays print comma-joined **without** brackets (`1,2,3`), booleans as `true`/`false`,
no output → `No output`. Expected-output blocks match this.

## Data

`config/problems/seed-data.ts` — 36 entries, all `difficulty: "basic"`:

| Category | Count | Examples |
|---|---|---|
| Print & Basics | 4 | Hello World, variables, print a sum, count to 5 (all original) |
| Functions | 6 | Multiply (debug `return`), Return Negative, Opposite Number, Double Char, Summation, Add New Item (arrays pass by reference) |
| Strings | 6 | String Repeat, Make Uppercase, Remove First/Last, Remove Spaces, Abbreviate Name, Vowel Remover |
| Arrays | 7 | Smallest Integer, Sum of Positive, Array Plus Array, Count by X, Reversed Digits, What Is Between, First Non-Consecutive |
| Conditionals | 6 | Even or Odd, Divisible by x and y, Simple Multiplication, Bonus Time, Rock Paper Scissors, Boolean to String |
| Math & Logic | 4 | Century From Year, Basic Math Ops, Average, Expressions Matter |
| Loops | 3 | Count Monkeys, Count Sheep, Total Points |

`config/seed-problems.ts` now **clears the table before seeding** (was insert-only) —
safe for dev reseed; in-house URLs `/problems/:id` change on reseed (ids are opaque).

## Tier UI

New 4th difficulty **basic** (cyan):
- `lib/interview-ui.ts` — colors/accents/dots/text/iconBg maps + `DIFFICULTY_ORDER: basic: -1`
- `lib/problem-data.ts` — `WorkspaceProblem.difficulty` union + both resolver mappings
- `ProblemBrowser` — Basic chip + cyan dot/label
- `getInHouseSummaries` limit raised **20 → 100** (was silently truncating the sidebar)

## Files

| File | Change |
|---|---|
| `config/problems/seed-data.ts` | Replaced 10 DSA with 36 beginner drills |
| `config/seed-problems.ts` | Clear-then-seed |
| `lib/problem-data.ts` | `basic` tier + limit fix |
| `lib/interview-ui.ts` | `basic` color maps |
| `app/(routes)/problems/[slug]/_components/ProblemBrowser.tsx` | Basic chip |

## Verify

- [x] 36 problems seeded (all `basic`), 183 top unaffected — sidebar shows In-House · 36
- [x] `tsc`, Prettier, build green
- [ ] Manual: run "Hello, World!" → expected output; walk a starter through Run;
      Basic chip filter; mobile picker shows `(basic)` labels
