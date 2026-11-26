# DSA content depth — lessons that explain, with sources that exist

> **For agentic workers:** Follow this plan slice by slice. Each slice ends with
> the verification in §6 and a manual-test handoff. Do not commit; the user
> commits.

**Goal:** Replace the 60-word definitions in all 59 DSA lessons with lessons
that teach the mechanism, the invariant, the cost derivation and the failure
modes — and give every lesson 2–3 free sources that are specific to it and
return 200.

**Status:** Approved 2026-11-26. **Slice 0 implemented** (gate, dead links,
foundations). Uncommitted pending manual test. Slices 1–7 pending.

**Builds on:** `.agent/plans/26-dsa-module.md` (routes, schema, engine, visual
player). This plan changes content, one content-rule gate, and the word-count
helpers. It does not change routes, the database, the visual player or the UI.

---

## 0. Decisions requested

1. **Depth target:** 650 prose words is the floor, ~900 is the target. Code,
   visuals and captions are excluded from the count. A lesson at 900 words is
   about 5 minutes of reading.
2. **Pilot, then batches.** Rewrite `foundations` (3 lessons) first so the
   shape can be judged before 56 more lessons copy it. Then six batches.
3. **A ratchet, not a red tree.** A ledger names the lessons converted so far.
   A converted lesson below the floor fails the suite; an unconverted lesson
   produces one module-level warning instead of failing. The warning count is
   the progress metric and cannot grow silently.
4. **Two or three lesson-specific sources.** Replace the 13 copies of one
   Striver sheet, the 6 links to `leetcode.com`'s root and the 4 dead links
   with sources that go deeper on that lesson.
5. **No video sections in this pass.** The type supports them; adding one
   verified video per module is a separate decision after the text lands.

If any of these should change, say so before slice 0.

---

## 1. Diagnosis (measured 2026-11-26)

### 1.1 Depth

`lessonWordCount` counts prose (scenario, concept, compare, recap), strips
tags, and excludes code and visual captions.

| #   | Module                            | Lessons | Words | Per lesson       |
| --- | --------------------------------- | ------: | ----: | ---------------- |
| 1   | foundations                       |       3 |   482 | 210 / 155 / 117  |
| 2   | complexity-and-maths              |       3 |   188 | 62 / 64 / 62     |
| 3   | arrays-and-strings                |       3 |   195 | 85 / 62 / 48     |
| 4   | searching                         |       3 |   158 | 48 / 54 / 56     |
| 5   | binary-trees                      |       3 |   184 | 59 / 60 / 65     |
| 6   | sorting                           |       4 |   327 | 133 / 60 / 59/75 |
| 7   | hashing                           |       4 |   208 | 49 / 65 / 52/42  |
| 8   | linked-lists                      |       4 |   201 | 58 / 42 / 55/46  |
| 9   | stacks-and-queues                 |       4 |   214 | 42 / 43 / 62/67  |
| 10  | two-pointers-and-sliding-window   |       3 |   206 | 72 / 79 / 55     |
| 11  | recursion-and-backtracking        |       3 |   132 | 53 / 34 / 45     |
| 12  | binary-search-trees               |       3 |   142 | 56 / 50 / 36     |
| 13  | heaps                             |       3 |   163 | 50 / 53 / 60     |
| 14  | greedy                            |       3 |   145 | 59 / 37 / 49     |
| 15  | graphs                            |       4 |   218 | 41 / 49 / 50/78  |
| 16  | dynamic-programming               |       4 |   195 | 76 / 39 / 38/42  |
| 17  | tries                             |       2 |   117 | 69 / 48          |
| 18  | advanced-topics                   |       3 |   164 | 53 / 54 / 57     |
|     | **Total**                         |  **59** | **3,639** | **avg 62**   |

The thinnest lessons are `recursion-and-backtracking/subsets-and-permutations`
(34 words), `binary-search-trees/bst-problems` (36) and
`greedy/interval-scheduling` (37). The fattest is
`foundations/what-is-dsa` (210).

### 1.2 Sources

- **59 source refs, 22 distinct URLs, 0 lessons with more than one source.**
- 13 lessons cite the same Striver A2Z sheet.
- 6 cite `https://leetcode.com` (the root), 4 cite
  `https://neetcode.io/practice`, 6 cite `https://visualgo.net/en/list` — all
  landing pages, not readings.
- **4 distinct URLs (6 refs) return 404:** `visualgo.net/en/trie`,
  `cp-algorithms.com/string/kmp.html`, `takeuforward.org/dynamic-programming/`
  (3 refs) and `takeuforward.org/bit-manipulation/`.
- 3 LeetCode URLs return 403 to `curl` but work in a browser (bot blocking).
  They are not counted as dead.

So the problem is not only that the prose is short. The "Free reads" block is
one link, often a landing page, and sometimes dead — there is nothing specific
to read after the lesson ends.

### 1.3 What the learner cannot answer today

For any given lesson, the current text usually does not answer:

1. What concrete input does this solve, and what breaks without it?
2. What exactly happens, step by step, on a small example?
3. Why is it correct — what invariant holds, and why does the loop terminate?
4. Where does the complexity come from — can the learner derive it?
5. When does it fail: duplicates, empty input, adversarial data, overflow,
   negative weights, skewed trees, hash collisions?
6. What should they read or try next?

The deep format answers all six.

---

## 2. What a deep lesson contains

### 2.1 Section budget

Prose sections are the existing `scenario`, `concept` and `compare` kinds. The
target is 800–1,000 prose words, with 650 as the gate floor.

| Section                    | Kind                | Target words | Job                                                           |
| -------------------------- | ------------------- | -----------: | ------------------------------------------------------------- |
| The problem                | `scenario`          |      100–160 | One concrete input; what goes wrong; the question of the lesson |
| How it works               | `concept`           |      220–280 | Definition, then a trace with real indices/values              |
| Why it works               | `concept`           |      200–260 | Invariant, correctness, termination                            |
| What it costs              | `concept`           |      180–240 | Derivation, best/average/worst, space                          |
| Where it breaks            | `concept`/`compare` |      140–200 | Edge cases, adversarial input, when not to use                 |
| Code or visual             | `code`/`visual`     |            — | Existing artifact, with tests widened to the failure modes     |
| Retrieval                  | `your_turn`         |            — | One prompt, answerable from the lesson                         |
| Recap                      | `recap`             |       50–80 | Four sharp points, not a summary of the summary                |

Not every lesson needs the same shape. A lesson may merge "how" and "why" or
"cost" and "breaks", but a deepened lesson must have **at least three
explanatory sections** (`scenario` + `concept`/`compare`) and **at least two
sources**.

### 2.2 Worked example — `searching/binary-search`

This is the level of explanation the plan is asking for, not a template to
copy verbatim:

- **The problem.** A sorted array of one million ids. Linear search reads up to
  1,000,000 entries; binary search reads at most 20. The hard part is not the
  loop — it is knowing which half is still possible after each comparison.
- **How it works.** Trace `lo=0`, `hi=9` on
  `[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]` for target `23`. Show `mid`, the
  comparison, and which bound moves at each step. Include the final state where
  `lo > hi` and the answer is "not found".
- **Why it works.** Invariant: if the target exists, its index is always in
  `[lo, hi]`. `mid` is checked; every index on the wrong side is provably not
  the target because the array is sorted. Each iteration removes `mid` and at
  least half of the remaining range, so the interval strictly shrinks and the
  loop terminates.
- **What it costs.** `n → n/2 → n/4 → … → 1` is `k` halvings with `2^k ≤ n`, so
  `k = ⌊log₂ n⌋ + 1` comparisons, `O(log n)`. Iterative space is `O(1)`;
  recursive space is `O(log n)` call frames.
- **Where it breaks.** Unsorted input (the invariant is false); duplicates
  (plain binary search finds *a* match, not the first — lower bound is a
  different loop); `(lo + hi) / 2` overflow in fixed-width languages; a `lo =
  mid` update that never removes `mid` (infinite loop); "search on the answer"
  only when the predicate is monotone.
- **Code.** Iterative + lower bound, with tests for empty, one element, first,
  last, missing, duplicates.
- **Your turn.** Write `lowerBound` and explain why `hi = mid` rather than
  `hi = mid - 1`.
- **Recap.** Four points: invariant, halving derivation, duplicates trap, when
  monotonicity is the real precondition.

### 2.3 Honesty rules for the prose

- No invented company metrics, benchmark numbers or "we measured" claims. If a
  number is illustrative, write the input size, not a fake production result.
- A source is a reading, not a claim of authority. `attribution` names what the
  lesson actually synthesises; do not list a source the lesson does not reflect.
- Do not add a URL without opening it. `curl` status is the first check; the
  page must also be about the lesson's topic.
- Prefer the primary explanation (CLRS-adjacent course notes, VisuAlgo,
  CP-Algorithms, Open Data Structures, Princeton) over content farms. GFG is
  acceptable only where it is the specific free explanation (two pointers,
  prefix sums, monotonic stack, LRU, activity selection) and is paired with a
  stronger source.
- Keep the learner's language: second person, short sentences, concrete nouns.
  A deep lesson is not a formal paper.

---

## 3. The gate — how depth stops regressing

### 3.1 One definition of "word count"

`countWords`, `sectionProse` and `lessonWordCount` currently live in
`lib/dsa/view-model.ts`. **Move them to `lib/dsa/content-rules.ts`** (which is
dependency-free apart from the type import) and have `view-model.ts` import
`lessonWordCount`. Update the two other call sites:
`app/(routes)/dsa/[module]/lesson/[slug]/page.tsx` and
`tests/dsa-judge.test.ts`.

Why: the gate and the displayed reading time must never disagree about what a
word is. Two implementations would drift, and the displayed "5 min" would
eventually describe a lesson the gate thinks is 400 words.

### 3.2 The ledger

In `lib/dsa/content-rules.ts`:

```ts
export const DEPTH_FLOOR = 650;
export const DEPTH_TARGET = 900;

/**
 * The ratchet. A lesson listed here must meet the floor; one that is not
 * listed warns instead of failing, so unfinished work never makes the suite
 * red. Keys are `<module>/<lesson>`.
 */
const DEEPENED_LESSONS = new Set<string>([
  // slice 0
  "foundations/what-is-dsa",
  "foundations/measuring-cost",
  "foundations/recursion-basics",
]);
```

When the ledger reaches 59/59, delete the ledger and make the floor
unconditional in a follow-up change. A ratchet that outlives its purpose is
just a list to forget.

### 3.3 Rules

Inside `inspectModuleContent(module)`, for each lesson:

| Condition                                                        | Level | Code                   |
| ---------------------------------------------------------------- | ----- | ---------------------- |
| Ledger lesson, prose words < 650                                  | fail  | `lesson-depth`         |
| Ledger lesson, fewer than 2 sources                               | fail  | `lesson-sources-thin`  |
| Ledger lesson, fewer than 3 explanatory sections                  | fail  | `lesson-theory-thin`   |
| Ledger lesson, recap has fewer than 3 points                      | fail  | `recap-thin`           |
| Not in ledger                                                     | warn  | one per module, not per lesson |

The module warning is aggregated:

```
WARN [module-not-deepened] foundations: 1 of 3 lessons deepened; thin: measuring-cost (155), recursion-basics (117)
```

That is 18 lines at the start, not 56, and each line names the remaining work
and its current depth. A new lesson added to a converted module is thin by
definition and appears here immediately.

A second pure function, `inspectDepthLedger(modules)`, fails with
`depth-ledger-stale` if a key in the ledger no longer exists. Without it, a
renamed lesson would silently leave the ledger guarding nothing.

### 3.4 Tests (`tests/dsa-content.test.ts`)

1. **Every ledger key exists** in the loaded modules (`depth-ledger-stale`
   returns nothing).
2. **A converted lesson below the floor fails** — build a minimal module with
   one ledger lesson of 20 words; expect `lesson-depth`. This is a fixture, not
   a real module, so it stays stable as content grows.
3. **A converted lesson with one source fails** — expect
   `lesson-sources-thin`.
4. **An unconverted lesson warns, never fails** — the same fixture without the
   ledger key; expect `module-not-deepened` at `warn`.
5. **A stale key fails** — call `inspectDepthLedger([])`; the real ledger has
   keys, so every one is stale. Assert the code.
6. **Mutation check** (manual, recorded in the slice log): lower a real
   converted lesson below 650 words, confirm `npm test` goes red with
   `lesson-depth`, restore byte-identically; remove one source, confirm
   `lesson-sources-thin`, restore.

`scripts/check-dsa.ts` adds `inspectDepthLedger` to its findings loop and
prints a summary line:

```
DSA depth: 3 of 59 lessons deepened (floor 650 words, target 900)
```

### 3.5 What the gate cannot do

A word floor is a proxy. It cannot tell an explanation from 900 words of
repetition. The real gate is the slice review: does the lesson answer the six
questions in §1.3? Say this in the code comment beside `DEPTH_FLOOR` so nobody
mistakes green for good.

---

## 4. Source pool (checked 2026-11-26)

Every URL below returned 200 to `curl -sL -A 'Mozilla/5.0'` on 2026-11-26.
Four candidates returned 404 and were replaced; those replacements are included
below. LeetCode URLs return 403 to `curl` but load in a browser; they are used
sparingly and never as the only source.

### 4.1 Foundations and complexity

| Lesson                     | Sources                                                                                                                                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| what-is-dsa                | [Open Data Structures, ch. 1](https://opendatastructures.org/ods-java/1_Introduction.html) · [Tech Interview Handbook study cheatsheet](https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/)                     |
| measuring-cost             | [Princeton 1.4 Analysis of Algorithms](https://algs4.cs.princeton.edu/14analysis/) · [Big-O Cheat Sheet](https://www.bigocheatsheet.com/)                                                                                       |
| recursion-basics           | [VisuAlgo Recursion](https://visualgo.net/en/recursion) · [Tech Interview Handbook recursion](https://www.techinterviewhandbook.org/algorithms/recursion/)                                                                      |
| counting-ops               | [Princeton 1.4](https://algs4.cs.princeton.edu/14analysis/) · [MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/lecture-notes/)                                         |
| recurrences                | [MIT 6.042 Mathematics for CS](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/) · [VisuAlgo Recursion](https://visualgo.net/en/recursion)                                                      |
| number-basics              | [CP-Algorithms Euclid](https://cp-algorithms.com/algebra/euclid-algorithm.html) · [Sieve](https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html) · [Binary exponentiation](https://cp-algorithms.com/algebra/binary-exp.html) |

### 4.2 Arrays, searching and sorting

| Lesson            | Sources                                                                                                                                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| array-basics      | [Open Data Structures, ch. 2](https://opendatastructures.org/ods-java/2_Array_Based_Lists.html) · [Tech Interview Handbook array](https://www.techinterviewhandbook.org/algorithms/array/)                                                           |
| two-pointers      | [GFG two pointers](https://www.geeksforgeeks.org/two-pointers-technique/) · [Tech Interview Handbook array](https://www.techinterviewhandbook.org/algorithms/array/)                                                                                  |
| prefix-sums       | [GFG prefix sum](https://www.geeksforgeeks.org/prefix-sum-array-implementation-applications-competitive-programming/) · [Tech Interview Handbook array](https://www.techinterviewhandbook.org/algorithms/array/)                                      |
| linear-search     | [GFG linear search](https://www.geeksforgeeks.org/linear-search/) · [Open Data Structures, ch. 2](https://opendatastructures.org/ods-java/2_Array_Based_Lists.html)                                                                                    |
| binary-search     | [CP-Algorithms binary search](https://cp-algorithms.com/num_methods/binary_search.html) · [GFG binary search](https://www.geeksforgeeks.org/binary-search/)                                                                                            |
| search-on-answer  | [CP-Algorithms binary search](https://cp-algorithms.com/num_methods/binary_search.html) · [GFG binary search](https://www.geeksforgeeks.org/binary-search/)                                                                                            |
| elementary-sorts  | [Princeton 2.1](https://algs4.cs.princeton.edu/21elementary/) · [VisuAlgo Sorting](https://visualgo.net/en/sorting)                                                                                                                                  |
| merge-sort        | [Princeton 2.2 Mergesort](https://algs4.cs.princeton.edu/22mergesort/) · [VisuAlgo Sorting](https://visualgo.net/en/sorting)                                                                                                                         |
| quick-sort        | [Princeton 2.3 Quicksort](https://algs4.cs.princeton.edu/23quicksort/) · [VisuAlgo Sorting](https://visualgo.net/en/sorting)                                                                                                                         |
| linear-sorts      | [Princeton 5.1 Radix sort](https://algs4.cs.princeton.edu/51radix/) · [Open Data Structures, ch. 11](https://opendatastructures.org/ods-java/11_Sorting_Algorithms.html)                                                                              |

### 4.3 Hashing, linked lists, stacks and queues

| Lesson           | Sources                                                                                                                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hash-functions   | [Open Data Structures, ch. 5](https://opendatastructures.org/ods-java/5_Hash_Tables.html) · [CP-Algorithms string hashing](https://cp-algorithms.com/string/string-hashing.html)                                              |
| collisions       | [Open Data Structures, ch. 5](https://opendatastructures.org/ods-java/5_Hash_Tables.html) · [VisuAlgo Hash Table](https://visualgo.net/en/hashtable)                                                                           |
| maps-and-sets    | [Open Data Structures, ch. 5](https://opendatastructures.org/ods-java/5_Hash_Tables.html) · [Tech Interview Handbook hash table](https://www.techinterviewhandbook.org/algorithms/hash-table/)                                |
| frequency-patterns | [Tech Interview Handbook hash table](https://www.techinterviewhandbook.org/algorithms/hash-table/) · [VisuAlgo Hash Table](https://visualgo.net/en/hashtable)                                                               |
| basics           | [Open Data Structures, ch. 3](https://opendatastructures.org/ods-java/3_Linked_Lists.html) · [VisuAlgo Linked List](https://visualgo.net/en/list)                                                                            |
| operations       | [Open Data Structures, ch. 3](https://opendatastructures.org/ods-java/3_Linked_Lists.html) · [Tech Interview Handbook linked list](https://www.techinterviewhandbook.org/algorithms/linked-list/)                            |
| cycle-detection  | [CP-Algorithms tortoise and hare](https://cp-algorithms.com/others/tortoise_and_hare.html) · [VisuAlgo Linked List](https://visualgo.net/en/list)                                                                             |
| merge-lists      | [GFG merge two sorted lists](https://www.geeksforgeeks.org/merge-two-sorted-linked-lists/) · [Tech Interview Handbook linked list](https://www.techinterviewhandbook.org/algorithms/linked-list/)                             |
| stack            | [Open Data Structures, ch. 2](https://opendatastructures.org/ods-java/2_Array_Based_Lists.html) · [Princeton 1.3 Stacks and Queues](https://algs4.cs.princeton.edu/13stacks/)                                                |
| queue            | [Open Data Structures, ch. 2](https://opendatastructures.org/ods-java/2_Array_Based_Lists.html) · [Princeton 1.3 Stacks and Queues](https://algs4.cs.princeton.edu/13stacks/)                                                |
| monotonic-stack  | [CP-Algorithms stack/queue modification](https://cp-algorithms.com/data_structures/stack_queue_modification.html) · [GFG monotonic stack](https://www.geeksforgeeks.org/introduction-to-monotonic-stack-2/)                    |
| lru-cache        | [GFG LRU cache](https://www.geeksforgeeks.org/lru-cache-implementation/) · [LeetCode 146](https://leetcode.com/problems/lru-cache/) (browser only)                                                                            |

### 4.4 Trees, heaps, recursion and greedy

| Lesson              | Sources                                                                                                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| representation      | [Open Data Structures, ch. 6](https://opendatastructures.org/ods-java/6_Binary_Trees.html) · [Princeton 3.2 BST](https://algs4.cs.princeton.edu/32bst/)                                                                            |
| traversals          | [VisuAlgo BST](https://visualgo.net/en/bst) · [Princeton 3.2 BST](https://algs4.cs.princeton.edu/32bst/)                                                                                                                           |
| height-and-diameter | [Princeton 3.2 BST](https://algs4.cs.princeton.edu/32bst/) · [GFG diameter](https://www.geeksforgeeks.org/diameter-of-a-binary-tree/)                                                                                              |
| bst-property        | [VisuAlgo BST](https://visualgo.net/en/bst) · [Open Data Structures, ch. 6](https://opendatastructures.org/ods-java/6_Binary_Trees.html)                                                                                           |
| operations          | [Open Data Structures, ch. 6](https://opendatastructures.org/ods-java/6_Binary_Trees.html) · [Princeton 3.2 BST](https://algs4.cs.princeton.edu/32bst/)                                                                             |
| bst-problems        | [GFG kth smallest in BST](https://www.geeksforgeeks.org/kth-largest-element-in-bst-when-modification-to-bst-is-not-allowed/) · [VisuAlgo BST](https://visualgo.net/en/bst)                                                         |
| heap-basics         | [VisuAlgo Heap](https://visualgo.net/en/heap) · [Open Data Structures, ch. 10](https://opendatastructures.org/ods-java/10_Heaps.html)                                                                                              |
| heap-operations     | [Open Data Structures, ch. 10](https://opendatastructures.org/ods-java/10_Heaps.html) · [Princeton 2.4 Priority Queues](https://algs4.cs.princeton.edu/24pq/)                                                                       |
| top-k               | [GFG k most frequent](https://www.geeksforgeeks.org/find-k-most-frequent-in-linear-time/) · [VisuAlgo Heap](https://visualgo.net/en/heap)                                                                                          |
| recursion-patterns  | [Tech Interview Handbook recursion](https://www.techinterviewhandbook.org/algorithms/recursion/) · [VisuAlgo Recursion](https://visualgo.net/en/recursion)                                                                          |
| subsets-and-permutations | [CP-Algorithms generating combinations](https://cp-algorithms.com/combinatorics/generating_combinations.html) · [GFG subsets](https://www.geeksforgeeks.org/backtracking-to-find-all-subsets/)                                  |
| backtracking        | [CP-Algorithms generating combinations](https://cp-algorithms.com/combinatorics/generating_combinations.html) · [GFG N-Queens](https://www.geeksforgeeks.org/n-queen-problem-backtracking-3/)                                       |
| greedy-basics       | [GFG greedy algorithms](https://www.geeksforgeeks.org/greedy-algorithms/) · [CP-Algorithms scheduling](https://cp-algorithms.com/schedules/schedule_one_machine.html)                                                               |
| interval-scheduling | [GFG activity selection](https://www.geeksforgeeks.org/activity-selection-problem-greedy-algo-1/) · [CP-Algorithms scheduling](https://cp-algorithms.com/schedules/schedule_one_machine.html)                                       |
| classic-greedy      | [GFG Huffman coding](https://www.geeksforgeeks.org/huffman-coding-greedy-algo-3/) · [GFG greedy algorithms](https://www.geeksforgeeks.org/greedy-algorithms/)                                                                       |

### 4.5 Graphs, DP, tries and advanced

| Lesson             | Sources                                                                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| representation (graphs) | [VisuAlgo Graph DS](https://visualgo.net/en/graphds) · [Princeton 4.1 Undirected Graphs](https://algs4.cs.princeton.edu/41graph/)                                                                                            |
| traversals         | [VisuAlgo DFS/BFS](https://visualgo.net/en/dfsbfs) · [CP-Algorithms DFS](https://cp-algorithms.com/graph/depth-first-search.html)                                                                                            |
| shortest-paths     | [VisuAlgo SSSP](https://visualgo.net/en/sssp) · [CP-Algorithms Dijkstra](https://cp-algorithms.com/graph/dijkstra.html)                                                                                                      |
| mst-and-union-find | [VisuAlgo MST](https://visualgo.net/en/mst) · [CP-Algorithms Kruskal](https://cp-algorithms.com/graph/mst_kruskal.html) · [CP-Algorithms DSU](https://cp-algorithms.com/data_structures/disjoint_set_union.html)             |
| dp-basics          | [CP-Algorithms intro to DP](https://cp-algorithms.com/dynamic_programming/intro-to-dp.html) · [Tech Interview Handbook DP](https://www.techinterviewhandbook.org/algorithms/dynamic-programming/)                            |
| one-d-dp           | [Tech Interview Handbook DP](https://www.techinterviewhandbook.org/algorithms/dynamic-programming/) · [CP-Algorithms intro to DP](https://cp-algorithms.com/dynamic_programming/intro-to-dp.html)                             |
| two-d-dp           | [CP-Algorithms knapsack](https://cp-algorithms.com/dynamic_programming/knapsack.html) · [Tech Interview Handbook DP](https://www.techinterviewhandbook.org/algorithms/dynamic-programming/)                                   |
| knapsack           | [CP-Algorithms knapsack](https://cp-algorithms.com/dynamic_programming/knapsack.html) · [GFG 0/1 knapsack](https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/)                                                        |
| trie-basics        | [Princeton 5.2 Tries](https://algs4.cs.princeton.edu/52trie/) · [Tech Interview Handbook trie](https://www.techinterviewhandbook.org/algorithms/trie/)                                                                       |
| trie-problems      | [Princeton 5.2 Tries](https://algs4.cs.princeton.edu/52trie/) · [LeetCode 212](https://leetcode.com/problems/word-search-ii/) (browser only)                                                                                 |
| bit-manipulation   | [CP-Algorithms bit manipulation](https://cp-algorithms.com/algebra/bit-manipulation.html) · [GFG bit tricks](https://www.geeksforgeeks.org/bit-tricks-competitive-programming/)                                              |
| segment-tree       | [CP-Algorithms segment tree](https://cp-algorithms.com/data_structures/segment_tree.html) · [CP-Algorithms Fenwick](https://cp-algorithms.com/data_structures/fenwick.html)                                                  |
| string-algorithms  | [CP-Algorithms prefix function](https://cp-algorithms.com/string/prefix-function.html) · [CP-Algorithms string hashing](https://cp-algorithms.com/string/string-hashing.html)                                                |

### 4.6 Dead links to repair first (6 refs, 4 URLs)

| Where                                   | Dead URL                                        | Replace with                                                    |
| --------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| `tries/trie-basics`                     | `https://visualgo.net/en/trie`                  | `https://algs4.cs.princeton.edu/52trie/`                        |
| `advanced-topics/string-algorithms`     | `https://cp-algorithms.com/string/kmp.html`     | `https://cp-algorithms.com/string/prefix-function.html`         |
| `dynamic-programming/one-d-dp`          | `https://takeuforward.org/dynamic-programming/` | `https://www.techinterviewhandbook.org/algorithms/dynamic-programming/` |
| `dynamic-programming/two-d-dp`          | `https://takeuforward.org/dynamic-programming/` | `https://cp-algorithms.com/dynamic_programming/knapsack.html`   |
| `dynamic-programming/knapsack`          | `https://takeuforward.org/dynamic-programming/` | `https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/`     |
| `advanced-topics/bit-manipulation`      | `https://takeuforward.org/bit-manipulation/`    | `https://cp-algorithms.com/algebra/bit-manipulation.html`       |

Repairing these before the pilot means the module stops shipping known-dead
links while the deeper rewrite is still in progress.

---

## 5. Slices

Each slice is one reviewable hand-off. Do not start the next slice until the
user has tested and committed the previous one.

### Slice 0 — pilot (3 lessons + gate + dead links)

1. Move the word-count helpers; add the ledger, rules, tests and checker
   summary.
2. Repair the six dead source refs in §4.6.
3. Rewrite the three `foundations` lessons to the §2 shape, add their ledger
   keys, and verify each source by opening it.

**Why foundations first:** it is the smallest module (3 lessons), it is the
first thing a learner reads, and it contains the two ideas every later lesson
assumes (cost and recursion). If the format is wrong, three lessons are wrong,
not fifty-nine.

**Acceptance:** every foundations lesson ≥ 650 words (target ~900), ≥ 2
specific sources, ≥ 3 explanatory sections, 4-point recap; `npm test` green;
`check:dsa` prints `3 of 59 deepened`; the gate mutation goes red; rendered
lesson page shows 4–5 min read and a 6–7 entry contents rail; no horizontal
overflow at 375 px; page bytes recorded before/after.

### Slice 1 — Part 0/1 basics (9 lessons)

`complexity-and-maths` (3), `arrays-and-strings` (3), `searching` (3).

### Slice 2 — sorting and hashing (8 lessons)

`sorting` (4), `hashing` (4).

### Slice 3 — linear structures (8 lessons)

`linked-lists` (4), `stacks-and-queues` (4).

### Slice 4 — trees and heaps (9 lessons)

`binary-trees` (3), `binary-search-trees` (3), `heaps` (3).

### Slice 5 — patterns (6 lessons)

`two-pointers-and-sliding-window` (3),
`recursion-and-backtracking` (3).

### Slice 6 — greedy and graphs (7 lessons)

`greedy` (3), `graphs` (4).

### Slice 7 — DP, tries, advanced (9 lessons)

`dynamic-programming` (4), `tries` (2), `advanced-topics` (3).

After slice 7: delete the ledger and make the floor unconditional, update
`.agent/feature-tracker.md` row 7.1 with the measured totals, and update
`diagrams/28-dsa-module.md` only if the content shape changed the render path
(it should not).

**Total:** 59 lessons, target ~53,000 prose words (from 3,639). That is why
this is sliced.

---

## 6. Verification per slice

Run from the repo root:

```bash
npx tsc --noEmit
npm test
npm run build
npm run check:dsa
npm run format:check
```

Then:

- **Sources:** `curl -sL -o /dev/null -w '%{http_code}' -A 'Mozilla/5.0' <url>`
  for every URL added in the slice. Record any non-200 in the slice log. A 403
  from LeetCode is bot blocking, not a dead page; say so if it appears.
- **Rendered page:** open one rewritten lesson at 375 px and 1280 px. Check the
  contents rail has one entry per section, the read time is plausible, the
  sources block shows every link, and nothing overflows horizontally.
- **Mutation:** once per slice, break one converted lesson below the floor and
  confirm `npm test` fails with `lesson-depth`; restore byte-identically
  (`sha256sum` before/after).
- **Record in this plan:** words per lesson, page bytes before/after, the
  verification command output, and any deviation. Follow the §7.x record style
  in plan 17.

---

## 7. Risks and non-goals

### Risks

- **A word floor is not a quality gate.** 900 padded words pass. The slice
  review must ask the six questions in §1.3, not just count. The comment beside
  `DEPTH_FLOOR` says this.
- **Content volume.** ~53,000 words is a large diff even sliced. If a slice is
  too large to review, split it at the module boundary.
- **Page weight.** Prose grows the prerendered HTML. Measure after the pilot;
  if a lesson page grows past ~60 KB, check whether the section bodies are
  being duplicated into a client boundary (the system-design module hit this).
- **Source drift.** Links rot. The pool is verified at authoring time, not
  forever. A future network-dependent CI check is deliberately not added: it
  would be flaky and slow. Re-verify when a slice touches a module.
- **LeetCode 403.** Do not "fix" a working LeetCode link because `curl` says
  403. Check in a browser.

### Non-goals

- No schema change, no new dependency, no route change.
- No visual-player or code-runner change unless a rewritten lesson exposes a
  real bug (record it; fix separately).
- No UI redesign. The current lesson surface already renders `concept`,
  `compare`, `sources` and `recap`; longer prose is the change.
- No video sections in this pass.
- No new exercises/problems. The `your_turn` prompt stays a prompt; the code
  section's tests may be widened to cover the failure modes the lesson names.
- No rewriting of module `story`, `interviewByte` or task briefs unless they
  contradict the deeper lesson. If they do, fix the contradiction and record
  it.

---

## 8. Open questions (answer before slice 0 if they matter)

1. **Depth:** is ~900 words per lesson the right target, or do you want
   shorter (600) / longer (1,200)?
2. **Sources:** 2–3 per lesson, or exactly 2 to keep the block compact?
3. **Videos:** leave them out of this pass (recommended), or add one verified
   video per module?

If there is no preference, the plan proceeds with 650/900, 2–3 sources, and no
videos.

**Answered 2026-11-26:** proceed with 650/900, 2–3 sources, no videos.

---

## 9. Slice log

### Slice 0 — gate, dead links, foundations (2026-11-26)

**Status:** implemented, verified, uncommitted. Awaiting manual test.

#### 9.1 Gate

- `countWords`, `sectionProse` and `lessonWordCount` moved from
  `lib/dsa/view-model.ts` to `lib/dsa/content-rules.ts`; the view model, the
  lesson page and `tests/dsa-judge.test.ts` now import one definition.
- `DEPTH_FLOOR = 650`, `DEPTH_TARGET = 900`, `DEEPENED_LESSONS` (3 keys) and
  `inspectDepthLedger` added. `inspectModuleContent` takes an optional ledger
  so fixtures can pass their own set.
- New findings: `lesson-depth`, `lesson-sources-thin`,
  `lesson-theory-thin`, `recap-thin` (all `fail`), `module-not-deepened`
  (one `warn` per module), `depth-ledger-stale` (fail).
- `scripts/check-dsa.ts` runs the ledger check and prints
  `depth: 3 of 59 lessons deepened (floor 650, target 900)`.
- `tests/dsa-content.test.ts` grew from 4 to 10 cases: floor failure, one
  source, a passing deep fixture, an unconverted lesson warning, a stale key,
  and every real ledger key resolving.

#### 9.2 Lessons

| Lesson             | Words | Sources | Sections | Before bytes | After bytes |
| ------------------ | ----: | ------: | -------: | -----------: | ----------: |
| `what-is-dsa`      |   839 |       2 |        7 |       48,866 |      61,456 |
| `measuring-cost`   |   802 |       2 |        7 |       52,283 |      67,862 |
| `recursion-basics` |   780 |       2 |        7 |       52,481 |      66,945 |

Each follows the §2 shape: concrete problem → trace/mechanism → invariant and
termination → derived cost → failure modes → code with widened tests →
retrieval → 4-point recap. `recursion-basics` gained one extra paragraph on
lists after the first count, which is why it is 780 rather than 700.

Sources added (all curl 200 on 2026-11-26):

- `what-is-dsa`: Open Data Structures ch. 1; Tech Interview Handbook study
  cheatsheet.
- `measuring-cost`: Princeton §1.4 Analysis of Algorithms; Big-O Cheat Sheet.
- `recursion-basics`: VisuAlgo Recursion; Tech Interview Handbook recursion.

#### 9.3 Dead links repaired (6 refs, 4 URLs)

| File                        | Was                                             | Now                                                     |
| --------------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| `tries.ts`                  | `visualgo.net/en/trie`                          | `algs4.cs.princeton.edu/52trie/`                        |
| `advanced-topics.ts`        | `takeuforward.org/bit-manipulation/`            | `cp-algorithms.com/algebra/bit-manipulation.html`       |
| `advanced-topics.ts`        | `cp-algorithms.com/string/kmp.html`             | `cp-algorithms.com/string/prefix-function.html`         |
| `dynamic-programming.ts` ×3 | `takeuforward.org/dynamic-programming/`         | Tech Interview Handbook DP / CP-Algorithms knapsack / GFG 0/1 knapsack |

#### 9.4 Verification

- `npx tsc --noEmit` clean.
- `npm test`: **754 pass, 0 fail** (748 before this slice).
- `npm run build`: compiled; the three foundations lesson routes prerender.
- `npm run check:dsa`: all checks passed for 18 modules, **17 warnings**
  (one per unconverted module), `depth: 3 of 59 lessons deepened`.
- `npm run format:check`: green.
- **Mutation:** `DEPTH_FLOOR` 650 → 1000 produced 3 `lesson-depth` failures,
  then `content-rules.ts` was restored byte-identically
  (sha256 `23747b76…a3a2558` before and after).
- **Rendered pages** (dark, headless Chrome):
  - 375, 1000, 1280, 1600 px: `scrollWidth === clientWidth`, no horizontal
    overflow.
  - 1600 px: three columns; on-page rail has **7 entries**, every anchor
    resolves; prose measure 661 px at 17/29.75 px; read time **4 min**.
  - Sources block renders both links with their domains; recap renders 4
    points; mobile contents disclosure lists 3 lessons.

#### 9.5 Deviations and observations

1. **Light mode is unreadable, and it is pre-existing.** Headless Chrome
   defaults to `prefers-color-scheme: light`, which flips `next-themes` to
   `html.light`; the `.cp-scope` light tokens then paint near-black text over
   `AppShell`'s hardcoded `bg-[#05060a]`. The effect is app-wide, not caused
   by this slice, and choosing between forcing dark and using `bg-background`
   is a separate decision. Verification above was run with
   `prefers-color-scheme: dark`. Manual test should use dark mode until that
   bug is decided.
2. The floating help button overlaps the mobile "Next lesson" card at 375 px.
   Pre-existing; not touched here.
3. Every deep lesson uses exactly 2 sources rather than 2–3. The block stays
   one line per source on desktop; a third link is added only when it says
   something the other two do not.
