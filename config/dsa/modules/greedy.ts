import type { DsaModule } from "../types";

export const greedyModule: DsaModule = {
  slug: "greedy",
  order: 14,
  part: 2,
  partTitle: "Patterns",
  title: "Greedy Algorithms",
  description: "Interval scheduling, jump game, fractional knapsack, Huffman.",
  kind: "lesson",
  story:
    "Greedy: make the locally optimal choice and hope it is globally optimal. The art is proving (or finding a counterexample to) that hope.",
  chapters: [
    { slug: "greedy-basics", title: "Greedy basics", lessonSlug: "greedy-basics" },
    { slug: "interval", title: "Interval scheduling", lessonSlug: "interval-scheduling" },
    { slug: "classic", title: "Classic greedy", lessonSlug: "classic-greedy" },
  ],
  lessons: [
    {
      slug: "greedy-basics",
      title: "Greedy basics",
      sections: [
        {
          kind: "concept",
          title: "When greedy works",
          body: "Greedy works when the problem has optimal substructure and the greedy choice property: a locally optimal choice leads to a globally optimal solution. Always try to find a counterexample before committing; if you cannot, prove it via exchange argument.",
        },
        {
          kind: "code",
          title: "Jump game",
          language: "javascript",
          starter:
            "function canJump(nums) {\n  // can you reach the last index?\n  return false;\n}\n\nconsole.log(canJump([2, 3, 1, 1, 4]));",
          solution:
            "function canJump(nums) {\n  let reach = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (i > reach) return false;\n    reach = Math.max(reach, i + nums[i]);\n  }\n  return true;\n}\n\nconsole.log(canJump([2, 3, 1, 1, 4])); // true",
          tests: [
            { input: "canJump([3,2,1,0,4])", expected: "false" },
            { input: "canJump([0])", expected: "true" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Greedy: locally optimal → globally optimal.",
            "Prove via exchange argument or find a counterexample.",
            "Jump game: track farthest reachable index.",
          ],
        },
      ],
      sources: [{ label: "Greedy (VisuAlgo)", url: "https://visualgo.net/en" }],
      attribution: "Synthesis of Striver's A2Z greedy section.",
    },
    {
      slug: "interval-scheduling",
      title: "Interval scheduling",
      sections: [
        {
          kind: "concept",
          title: "Earliest finish time",
          body: "To maximise the number of non-overlapping intervals, sort by end time and greedily pick the earliest-finishing compatible interval. This is the classic greedy proof (exchange argument).",
        },
        {
          kind: "code",
          title: "Non-overlapping intervals (min removals)",
          language: "javascript",
          starter:
            "function eraseOverlapIntervals(intervals) {\n  // min intervals to remove so the rest don't overlap\n  return 0;\n}\n\nconsole.log(eraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]]));",
          solution:
            "function eraseOverlapIntervals(intervals) {\n  intervals.sort((a, b) => a[1] - b[1]);\n  let count = 0, end = -Infinity;\n  for (const [s, e] of intervals) {\n    if (s >= end) end = e;\n    else count++;\n  }\n  return count;\n}\n\nconsole.log(eraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]])); // 1",
          tests: [
            { input: "eraseOverlapIntervals([])", expected: "0" },
            { input: "eraseOverlapIntervals([[1,2],[1,2],[1,2]])", expected: "2" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Sort by end time, pick earliest compatible.",
            "Exchange argument proves optimality.",
          ],
        },
      ],
      sources: [{ label: "Interval scheduling (LeetCode)", url: "https://leetcode.com" }],
      attribution: "Synthesis of Striver's A2Z greedy section.",
    },
    {
      slug: "classic-greedy",
      title: "Classic greedy problems",
      sections: [
        {
          kind: "concept",
          title: "Fractional knapsack, Huffman",
          body: "Fractional knapsack: sort by value/weight ratio, take as much as possible. Huffman coding: repeatedly merge the two smallest frequencies; the tree gives optimal prefix codes. Both are greedy and provably optimal.",
        },
        {
          kind: "recap",
          points: [
            "Fractional knapsack: sort by value/weight.",
            "Huffman: merge smallest frequencies.",
            "Greedy needs a proof; otherwise it is a heuristic.",
          ],
        },
      ],
      sources: [{ label: "Greedy (LeetCode)", url: "https://leetcode.com" }],
      attribution: "Synthesis of Striver's A2Z greedy section.",
    },
  ],
  interviewByte: {
    shape: "When is a greedy choice safe?",
    strongAnswer:
      "When the problem has optimal substructure and the greedy choice property; prove via exchange argument.",
    trap: "Applying greedy to 0/1 knapsack (needs DP) or assuming local optimum is global.",
  },
  recap: [
    "Greedy: local optimum → global (when provable).",
    "Interval scheduling: sort by end time.",
    "Jump game: track farthest reach.",
  ],
  attribution: "Synthesis of Striver's A2Z greedy section.",
};
