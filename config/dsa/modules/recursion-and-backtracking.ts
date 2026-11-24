import type { DsaModule } from "../types";

export const recursionAndBacktrackingModule: DsaModule = {
  slug: "recursion-and-backtracking",
  order: 11,
  part: 2,
  partTitle: "Patterns",
  title: "Recursion & Backtracking",
  description: "Subsets, permutations, combinations, N-queens, pruning.",
  kind: "lesson",
  story:
    "Backtracking is DFS with an undo step. It is how you search a space of possibilities without committing to a bad branch.",
  chapters: [
    { slug: "recursion-patterns", title: "Recursion patterns", lessonSlug: "recursion-patterns" },
    { slug: "subsets-permutations", title: "Subsets & permutations", lessonSlug: "subsets-and-permutations" },
    { slug: "backtracking", title: "Backtracking", lessonSlug: "backtracking" },
  ],
  lessons: [
    {
      slug: "recursion-patterns",
      title: "Recursion patterns",
      sections: [
        {
          kind: "concept",
          title: "The template",
          body: "Every backtracking solution has: a choice (what can I put here?), a constraint (is this choice valid?), and a goal (is the solution complete?). Recurse on the next position, then undo the choice.",
        },
        {
          kind: "code",
          title: "Subsets (power set)",
          language: "javascript",
          starter:
            "function subsets(nums) {\n  const res = [];\n  function dfs(i, cur) {\n    // record and branch\n  }\n  dfs(0, []);\n  return res;\n}\n\nconsole.log(subsets([1, 2, 3]));",
          solution:
            "function subsets(nums) {\n  const res = [];\n  function dfs(i, cur) {\n    res.push([...cur]);\n    for (let j = i; j < nums.length; j++) {\n      cur.push(nums[j]);\n      dfs(j + 1, cur);\n      cur.pop();\n    }\n  }\n  dfs(0, []);\n  return res;\n}\n\nconsole.log(subsets([1, 2, 3]));",
          tests: [
            { input: "subsets([]).length", expected: "1" },
            { input: "subsets([1,2]).length", expected: "4" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Backtracking = DFS + undo.",
            "Record the current state at each node.",
            "Prune branches that cannot lead to a solution.",
          ],
        },
      ],
      sources: [{ label: "Backtracking (VisuAlgo)", url: "https://visualgo.net/en/recursion" }],
      attribution: "Synthesis of Striver's A2Z recursion section.",
    },
    {
      slug: "subsets-and-permutations",
      title: "Subsets & permutations",
      sections: [
        {
          kind: "concept",
          title: "Permutations",
          body: "Generate all orderings of a set. Swap-based or used-array approaches both O(n·n!). Handle duplicates by sorting and skipping equal adjacent values at the same level.",
        },
        {
          kind: "code",
          title: "Permutations",
          language: "javascript",
          starter:
            "function permute(nums) {\n  const res = [];\n  // generate all permutations\n  return res;\n}\n\nconsole.log(permute([1, 2, 3]));",
          solution:
            "function permute(nums) {\n  const res = [];\n  function dfs(remaining, cur) {\n    if (remaining.length === 0) { res.push([...cur]); return; }\n    for (let i = 0; i < remaining.length; i++) {\n      cur.push(remaining[i]);\n      dfs(remaining.slice(0, i).concat(remaining.slice(i + 1)), cur);\n      cur.pop();\n    }\n  }\n  dfs(nums, []);\n  return res;\n}\n\nconsole.log(permute([1, 2, 3]));",
          tests: [
            { input: "permute([]).length", expected: "1" },
            { input: "permute([1,2,3]).length", expected: "6" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Permutations: n! results.",
            "Handle duplicates by sorting + skipping.",
          ],
        },
      ],
      sources: [{ label: "Backtracking (LeetCode)", url: "https://leetcode.com" }],
      attribution: "Synthesis of Striver's A2Z.",
    },
    {
      slug: "backtracking",
      title: "Backtracking problems",
      sections: [
        {
          kind: "concept",
          title: "N-Queens and beyond",
          body: "Place queens row by row, checking columns and diagonals. Prune when a placement is invalid. Same template solves sudoku, word search, and combination sum.",
        },
        {
          kind: "code",
          title: "Combination sum",
          language: "javascript",
          starter:
            "function combinationSum(candidates, target) {\n  const res = [];\n  // find all unique combos that sum to target\n  return res;\n}\n\nconsole.log(combinationSum([2, 3, 6, 7], 7));",
          solution:
            "function combinationSum(candidates, target) {\n  const res = [];\n  function dfs(start, remaining, cur) {\n    if (remaining === 0) { res.push([...cur]); return; }\n    if (remaining < 0) return;\n    for (let i = start; i < candidates.length; i++) {\n      cur.push(candidates[i]);\n      dfs(i, remaining - candidates[i], cur);\n      cur.pop();\n    }\n  }\n  dfs(0, target, []);\n  return res;\n}\n\nconsole.log(combinationSum([2, 3, 6, 7], 7));",
          tests: [
            { input: "combinationSum([2,3,6,7], 7).length", expected: "2" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Same template: choice, constraint, goal.",
            "Prune early to cut the search space.",
            "Combination sum reuses the same candidate (i, not i+1).",
          ],
        },
      ],
      sources: [{ label: "Backtracking (LeetCode)", url: "https://leetcode.com" }],
      attribution: "Synthesis of Striver's A2Z.",
    },
  ],
  interviewByte: {
    shape: "Generate all subsets of a set.",
    strongAnswer:
      "DFS: at each index, include or exclude. O(2ⁿ) time and space. Handle duplicates by sorting.",
    trap: "Mutating the current array without copying (push/pop) or forgetting to copy on record.",
  },
  recap: [
    "Backtracking = DFS + undo.",
    "Subsets O(2ⁿ), permutations O(n!).",
    "Prune invalid branches early.",
  ],
  attribution: "Synthesis of Striver's A2Z.",
};
