import type { DsaModule } from "../types";

export const foundationsModule: DsaModule = {
  slug: "foundations",
  order: 1,
  part: 0,
  partTitle: "Foundations",
  title: "Foundations of DSA",
  description:
    "What data structures and algorithms are, why they matter, and how to measure their cost.",
  kind: "lesson",
  story:
    "You can write code that works on day one. The question is whether it still works when the input grows 1000x.",
  chapters: [
    { slug: "what-is-dsa", title: "What is DSA?", lessonSlug: "what-is-dsa" },
    {
      slug: "measuring-cost",
      title: "Measuring cost",
      lessonSlug: "measuring-cost",
    },
    {
      slug: "recursion-basics",
      title: "Recursion basics",
      lessonSlug: "recursion-basics",
    },
  ],
  lessons: [
    {
      slug: "what-is-dsa",
      title: "What is DSA?",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: "You write a search over 10 users and it is instant. The same search over 10 million users takes 40 seconds. The code did not change — the input did. Data structures and algorithms are the study of how to keep code fast as input grows.",
        },
        {
          kind: "concept",
          title: "Data structure vs algorithm",
          body: "A <strong>data structure</strong> is a way to organise data so that a particular operation is cheap: arrays give O(1) index access, hash maps give O(1) lookup by key, trees give O(log n) search in sorted data. An <strong>algorithm</strong> is a step-by-step procedure that uses those structures to solve a problem. The two are inseparable: the right structure makes the algorithm trivial, and the wrong one makes it impossible.",
        },
        {
          kind: "concept",
          title: "Why not just use arrays for everything",
          body: "Arrays are the default, and often the right answer. But 'find if a value exists' in an array is O(n) — you must check every element. A hash set makes the same check O(1) on average. The trade-off is memory and ordering: hash sets use more memory and do not preserve insertion order (in most languages). Choosing is the skill.",
        },
        {
          kind: "your_turn",
          prompt:
            "Name one operation your current app does in a loop over a list. Could a different structure make it O(1)?",
        },
        {
          kind: "recap",
          points: [
            "A data structure optimises one operation; an algorithm combines structures.",
            "Arrays are the default — replace them only when profiling shows a bottleneck.",
            "The cost is always measured in growth, not in milliseconds on your laptop.",
          ],
        },
      ],
      sources: [
        {
          label: "Striver's A2Z — Learn the basics",
          url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
        },
      ],
      attribution:
        "Synthesis of Striver's A2Z 'Learn the basics' and NeetCode's foundations.",
    },
    {
      slug: "measuring-cost",
      title: "Measuring cost (Big-O)",
      sections: [
        {
          kind: "concept",
          title: "Why Big-O",
          body: "Big-O describes how an operation's cost grows with input size n, ignoring constants. We ignore constants because a 2x faster machine changes milliseconds, not the shape of growth. An O(n²) algorithm on n=10⁶ is 10¹² operations — no machine saves you.",
        },
        {
          kind: "concept",
          title: "Common classes",
          body: "O(1) constant — hash lookup. O(log n) — binary search. O(n) — single pass. O(n log n) — efficient sort. O(n²) — nested loops over the same data. O(2ⁿ) — brute-force subsets. O(n!) — permutations. Each step up is roughly 10-100x worse at scale.",
        },
        {
          kind: "code",
          title: "Counting operations",
          language: "javascript",
          starter:
            "function countPairs(arr) {\n  let count = 0;\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = i + 1; j < arr.length; j++) {\n      count++;\n    }\n  }\n  return count;\n}\n\nconsole.log(countPairs([1, 2, 3, 4]));",
          solution:
            "function countPairs(arr) {\n  let count = 0;\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = i + 1; j < arr.length; j++) {\n      count++;\n    }\n  }\n  return count;\n}\n\nconsole.log(countPairs([1, 2, 3, 4])); // 6 = 4 choose 2",
          tests: [
            { input: "countPairs([1,2,3])", expected: "3" },
            { input: "countPairs([])", expected: "0" },
          ],
        },
        {
          kind: "compare",
          body: "Time vs space: an algorithm can trade one for the other. Memoisation turns O(2ⁿ) time into O(n) time at the cost of O(n) space. Hash maps turn O(n) search into O(1) at the cost of O(n) extra memory. Always state both when you describe a solution.",
        },
        {
          kind: "recap",
          points: [
            "Big-O measures growth, not speed.",
            "Know the seven classes and which operations belong to each.",
            "State both time and space complexity for every solution.",
          ],
        },
      ],
      sources: [
        {
          label: "Big-O cheat sheet",
          url: "https://www.bigocheatsheet.com/",
        },
      ],
      attribution:
        "Synthesis of Princeton Algorithms Part I (Sedgewick/Wayne) and NeetCode.",
    },
    {
      slug: "recursion-basics",
      title: "Recursion basics",
      sections: [
        {
          kind: "concept",
          title: "What recursion is",
          body: "Recursion is a function calling itself on a smaller version of the same problem, with a base case that stops the chain. Every recursive solution has two parts: the base case (smallest input, answered directly) and the recursive step (break the problem down, recurse, combine).",
        },
        {
          kind: "concept",
          title: "The call stack",
          body: "Each recursive call pushes a frame onto the call stack, holding its arguments and local variables. Deep recursion (n = 10⁵) can overflow the stack. Iteration uses O(1) stack space; recursion uses O(depth). Know the depth of your recursion before you ship it.",
        },
        {
          kind: "code",
          title: "Factorial: iterative vs recursive",
          language: "javascript",
          starter:
            "function factorialRecursive(n) {\n  if (n <= 1) return 1;\n  return n * factorialRecursive(n - 1);\n}\n\nfunction factorialIterative(n) {\n  let result = 1;\n  for (let i = 2; i <= n; i++) result *= i;\n  return result;\n}\n\nconsole.log(factorialRecursive(5));\nconsole.log(factorialIterative(5));",
          solution:
            "function factorialRecursive(n) {\n  if (n <= 1) return 1; // base case\n  return n * factorialRecursive(n - 1); // recursive step\n}\n\nfunction factorialIterative(n) {\n  let result = 1;\n  for (let i = 2; i <= n; i++) result *= i;\n  return result;\n}\n\nconsole.log(factorialRecursive(5)); // 120\nconsole.log(factorialIterative(5)); // 120",
          tests: [
            { input: "factorialRecursive(0)", expected: "1" },
            { input: "factorialRecursive(6)", expected: "720" },
            { input: "factorialIterative(6)", expected: "720" },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "Rewrite factorialRecursive so it uses an accumulator parameter (tail recursion). Does your engine optimise it?",
        },
        {
          kind: "recap",
          points: [
            "Recursion = base case + recursive step.",
            "Each call costs a stack frame; depth is the space cost.",
            "When in doubt, write it recursively first, then convert to iteration.",
          ],
        },
      ],
      sources: [
        {
          label: "Recursion visualiser",
          url: "https://visualgo.net/en/recursion",
        },
      ],
      attribution: "Synthesis of Striver's A2Z recursion section and VisuAlgo.",
    },
  ],
  interviewByte: {
    shape: "Explain Big-O and give the complexity of this snippet.",
    strongAnswer:
      "State the dominant term, drop constants, and give both time and space. Mention best/average/worst when they differ.",
    trap: "Saying 'it's fast' or quoting wall-clock time instead of growth class.",
  },
  recap: [
    "DSA is about growth, not speed.",
    "Big-O classes: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n!).",
    "Recursion costs stack depth; iteration costs O(1) stack.",
  ],
  attribution: "Synthesis of Striver's A2Z, NeetCode, Princeton Algorithms.",
};
