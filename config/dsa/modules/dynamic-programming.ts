import type { DsaModule } from "../types";

export const dynamicProgrammingModule: DsaModule = {
  slug: "dynamic-programming",
  order: 16,
  part: 3,
  partTitle: "Advanced",
  title: "Dynamic Programming",
  description: "Memoization, tabulation, 1D/2D DP, knapsack, LCS, LIS.",
  kind: "lesson",
  story:
    "DP is recursion with a memory. If a recursive solution recomputes the same subproblem, DP makes it fast.",
  chapters: [
    { slug: "dp-basics", title: "DP basics", lessonSlug: "dp-basics" },
    { slug: "1d-dp", title: "1D DP", lessonSlug: "one-d-dp" },
    { slug: "2d-dp", title: "2D DP", lessonSlug: "two-d-dp" },
    { slug: "knapsack", title: "Knapsack", lessonSlug: "knapsack" },
  ],
  lessons: [
    {
      slug: "dp-basics",
      title: "DP basics",
      sections: [
        {
          kind: "concept",
          title: "Memoization vs tabulation",
          body: "Memoization (top-down): recursive, cache results in a map. Tabulation (bottom-up): fill a table from small subproblems up. Both O(states × transitions). Tabulation avoids recursion depth limits and is usually faster.",
        },
        {
          kind: "concept",
          title: "When to use DP",
          body: "DP applies when a problem has optimal substructure (optimal solution built from optimal sub-solutions) and overlapping subproblems (same subproblem solved many times). If subproblems don't overlap, it is just divide-and-conquer.",
        },
        {
          kind: "code",
          title: "Fibonacci: naive vs DP",
          language: "javascript",
          starter:
            "function fib(n) {\n  if (n <= 1) return n;\n  return fib(n - 1) + fib(n - 2);\n}\n\nconsole.log(fib(10));",
          solution:
            "function fib(n) {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) { const c = a + b; a = b; b = c; }\n  return b;\n}\n\nconsole.log(fib(10)); // 55",
          tests: [
            { input: "fib(0)", expected: "0" },
            { input: "fib(1)", expected: "1" },
            { input: "fib(20)", expected: "6765" },
          ],
        },
        {
          kind: "recap",
          points: [
            "DP = recursion + memory.",
            "Memoization (top-down) vs tabulation (bottom-up).",
            "Needs optimal substructure + overlapping subproblems.",
          ],
        },
      ],
      sources: [{ label: "DP (VisuAlgo)", url: "https://visualgo.net/en" }],
      attribution: "Synthesis of Striver's A2Z DP section.",
    },
    {
      slug: "one-d-dp",
      title: "1D DP",
      sections: [
        {
          kind: "concept",
          title: "Climbing stairs, house robber",
          body: "dp[i] depends on dp[i-1], dp[i-2], … Define the state, the transition, the base case, and the answer. Climbing stairs: dp[i]=dp[i-1]+dp[i-2]. House robber: dp[i]=max(dp[i-1], dp[i-2]+nums[i]).",
        },
        {
          kind: "code",
          title: "Climbing stairs",
          language: "javascript",
          starter:
            "function climbStairs(n) {\n  // number of ways to climb n steps (1 or 2 at a time)\n  return 0;\n}\n\nconsole.log(climbStairs(5));",
          solution:
            "function climbStairs(n) {\n  if (n <= 2) return n;\n  let a = 1, b = 2;\n  for (let i = 3; i <= n; i++) { const c = a + b; a = b; b = c; }\n  return b;\n}\n\nconsole.log(climbStairs(5)); // 8",
          tests: [
            { input: "climbStairs(1)", expected: "1" },
            { input: "climbStairs(2)", expected: "2" },
            { input: "climbStairs(10)", expected: "89" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Define state, transition, base case, answer.",
            "1D DP: O(n) time, O(1) space with rolling variables.",
          ],
        },
      ],
      sources: [
        {
          label: "DP (Striver)",
          url: "https://takeuforward.org/dynamic-programming/",
        },
      ],
      attribution: "Synthesis of Striver's A2Z DP section.",
    },
    {
      slug: "two-d-dp",
      title: "2D DP",
      sections: [
        {
          kind: "concept",
          title: "Grid DP",
          body: "dp[i][j] depends on dp[i-1][j] and dp[i][j-1]. Unique paths, minimum path sum, longest common subsequence. O(m·n) time and space; space can be reduced to O(n) with rolling arrays.",
        },
        {
          kind: "code",
          title: "Unique paths",
          language: "javascript",
          starter:
            "function uniquePaths(m, n) {\n  // paths from top-left to bottom-right moving only right/down\n  return 0;\n}\n\nconsole.log(uniquePaths(3, 7));",
          solution:
            "function uniquePaths(m, n) {\n  const dp = Array.from({ length: m }, () => new Array(n).fill(1));\n  for (let i = 1; i < m; i++)\n    for (let j = 1; j < n; j++)\n      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];\n  return dp[m - 1][n - 1];\n}\n\nconsole.log(uniquePaths(3, 7)); // 28",
          tests: [
            { input: "uniquePaths(1, 1)", expected: "1" },
            { input: "uniquePaths(2, 2)", expected: "2" },
          ],
        },
        {
          kind: "recap",
          points: [
            "2D grid DP: O(mn) time/space.",
            "Rolling array reduces space to O(n).",
          ],
        },
      ],
      sources: [
        {
          label: "DP (Striver)",
          url: "https://takeuforward.org/dynamic-programming/",
        },
      ],
      attribution: "Synthesis of Striver's A2Z DP section.",
    },
    {
      slug: "knapsack",
      title: "Knapsack",
      sections: [
        {
          kind: "concept",
          title: "0/1 knapsack",
          body: "Choose items to maximise value with weight limit. dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i]). O(n·W) time and space; space can be reduced to O(W) by iterating w backwards.",
        },
        {
          kind: "code",
          title: "0/1 knapsack",
          language: "javascript",
          starter:
            "function knapsack(weights, values, W) {\n  // max value with capacity W\n  return 0;\n}\n\nconsole.log(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7));",
          solution:
            "function knapsack(weights, values, W) {\n  const n = weights.length;\n  const dp = new Array(W + 1).fill(0);\n  for (let i = 0; i < n; i++) {\n    for (let w = W; w >= weights[i]; w--) {\n      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);\n    }\n  }\n  return dp[W];\n}\n\nconsole.log(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7)); // 9",
          tests: [
            { input: "knapsack([], [], 5)", expected: "0" },
            { input: "knapsack([2], [3], 1)", expected: "0" },
          ],
        },
        {
          kind: "recap",
          points: [
            "0/1 knapsack: O(nW) time.",
            "Iterate weight backwards for O(W) space.",
            "Unbounded knapsack: iterate forwards.",
          ],
        },
      ],
      sources: [
        {
          label: "Knapsack (Striver)",
          url: "https://takeuforward.org/dynamic-programming/",
        },
      ],
      attribution: "Synthesis of Striver's A2Z DP section.",
    },
  ],
  interviewByte: {
    shape: "How do you approach a DP problem?",
    strongAnswer:
      "Find the state, transition, base case, and answer. Check for overlapping subproblems. Start with recursion + memo, then convert to tabulation.",
    trap: "Jumping to tabulation without defining the state, or missing the base case.",
  },
  recap: [
    "DP: optimal substructure + overlapping subproblems.",
    "State, transition, base case, answer.",
    "1D O(n), 2D O(mn), knapsack O(nW).",
  ],
  attribution: "Synthesis of Striver's A2Z DP section.",
};
