import type { DsaModule } from "../types";

export const searchingModule: DsaModule = {
  slug: "searching",
  order: 4,
  part: 1,
  partTitle: "Core data structures",
  title: "Searching",
  description:
    "Linear search, binary search, and searching on the answer space.",
  kind: "lesson+task",
  story:
    "A lookup that scans 10⁶ rows per request is 10⁶ operations you did not need to do.",
  chapters: [
    { slug: "linear", title: "Linear search", lessonSlug: "linear-search" },
    { slug: "binary", title: "Binary search", lessonSlug: "binary-search" },
    {
      slug: "search-on-answer",
      title: "Search on answer",
      lessonSlug: "search-on-answer",
    },
  ],
  lessons: [
    {
      slug: "linear-search",
      title: "Linear search",
      sections: [
        {
          kind: "concept",
          title: "When to use it",
          body: "Linear search checks every element until a match is found: O(n) worst case, O(1) space. Use it on unsorted data or when n is small. On sorted data, binary search is always better.",
        },
        {
          kind: "code",
          title: "Linear search",
          language: "javascript",
          starter:
            "function linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) return i;\n  }\n  return -1;\n}\n\nconsole.log(linearSearch([4, 2, 7, 1], 7));",
          solution:
            "function linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) return i;\n  }\n  return -1;\n}\n\nconsole.log(linearSearch([4, 2, 7, 1], 7)); // 2",
          tests: [
            { input: "linearSearch([4,2,7,1], 9)", expected: "-1" },
            { input: "linearSearch([], 1)", expected: "-1" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Linear search: O(n) time, O(1) space.",
            "Only correct choice on unsorted data (or tiny n).",
          ],
        },
      ],
      sources: [
        {
          label: "Striver's A2Z DSA Sheet",
          url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
        },
      ],
      attribution: "Synthesis of Striver's A2Z searching section.",
    },
    {
      slug: "binary-search",
      title: "Binary search",
      sections: [
        {
          kind: "concept",
          title: "The idea",
          body: "On a sorted array, compare the target to the middle element. If smaller, search the left half; if larger, the right half. Each step halves the range: O(log n) time, O(1) space (iterative).",
        },
        {
          kind: "visual",
          title: "Binary search halving the range",
          frames: [
            {
              id: "f1",
              kind: "array",
              caption:
                "Array [1,3,5,7,9,11]. Target 7. Range covers the whole array.",
              state: {
                kind: "array",
                values: [1, 3, 5, 7, 9, 11],
                range: [0, 5],
                highlight: [2],
                pointers: [{ index: 2, label: "mid", color: "#a855f7" }],
              },
            },
            {
              id: "f2",
              kind: "array",
              caption:
                "arr[mid]=5 < 7, so search the right half. New range [3,5].",
              state: {
                kind: "array",
                values: [1, 3, 5, 7, 9, 11],
                range: [3, 5],
                highlight: [4],
                pointers: [{ index: 4, label: "mid", color: "#a855f7" }],
              },
            },
            {
              id: "f3",
              kind: "array",
              caption:
                "arr[mid]=9 > 7, so search the left half. New range [3,3].",
              state: {
                kind: "array",
                values: [1, 3, 5, 7, 9, 11],
                range: [3, 3],
                highlight: [3],
                pointers: [{ index: 3, label: "mid", color: "#22c55e" }],
              },
            },
            {
              id: "f4",
              kind: "array",
              caption: "arr[mid]=7 == target. Found at index 3.",
              state: {
                kind: "array",
                values: [1, 3, 5, 7, 9, 11],
                highlight: [3],
              },
            },
          ],
        },
        {
          kind: "code",
          title: "Binary search (iterative)",
          language: "javascript",
          starter:
            "function binarySearch(arr, target) {\n  let lo = 0;\n  let hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}\n\nconsole.log(binarySearch([1, 3, 5, 7, 9, 11], 7));",
          solution:
            "function binarySearch(arr, target) {\n  let lo = 0;\n  let hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}\n\nconsole.log(binarySearch([1, 3, 5, 7, 9, 11], 7)); // 3",
          tests: [
            { input: "binarySearch([1,3,5,7,9,11], 1)", expected: "0" },
            { input: "binarySearch([1,3,5,7,9,11], 11)", expected: "5" },
            { input: "binarySearch([1,3,5,7,9,11], 4)", expected: "-1" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Binary search requires sorted input.",
            "O(log n) time, O(1) space (iterative).",
            "Watch for off-by-one in the loop condition and mid calculation.",
          ],
        },
      ],
      sources: [
        {
          label: "Striver's A2Z DSA Sheet",
          url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
        },
      ],
      attribution: "Synthesis of Striver's A2Z binary search section.",
    },
    {
      slug: "search-on-answer",
      title: "Search on answer",
      sections: [
        {
          kind: "concept",
          title: "Idea",
          body: "Sometimes the answer itself is a number in a range, and you can test a candidate answer in O(n). Binary search over the candidate range gives O(n log(range)). Classic examples: square root, minimum capacity to ship packages, Koko eating bananas.",
        },
        {
          kind: "code",
          title: "Square root (integer)",
          language: "javascript",
          starter:
            "function isqrt(n) {\n  // largest integer x with x*x <= n\n  return 0;\n}\n\nconsole.log(isqrt(10));",
          solution:
            "function isqrt(n) {\n  let lo = 0;\n  let hi = n;\n  let ans = 0;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (mid * mid <= n) {\n      ans = mid;\n      lo = mid + 1;\n    } else {\n      hi = mid - 1;\n    }\n  }\n  return ans;\n}\n\nconsole.log(isqrt(10)); // 3",
          tests: [
            { input: "isqrt(0)", expected: "0" },
            { input: "isqrt(16)", expected: "4" },
            { input: "isqrt(17)", expected: "4" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Binary search applies whenever a predicate is monotonic.",
            "Identify the search space and the predicate first.",
          ],
        },
      ],
      sources: [
        {
          label: "Striver's A2Z DSA Sheet",
          url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
        },
      ],
      attribution: "Synthesis of Striver's A2Z binary search on answer.",
    },
  ],
  task: {
    brief:
      "Binary search must use mid = floor((lo+hi)/2) and narrow with lo=mid+1 / hi=mid-1. The start code uses mid = (lo+hi)/2 (float) and lo=mid (infinite loop). Fix it.",
    startState: {
      data: { code: "while (lo <= hi) { const mid = (lo+hi)/2; ... }" },
      completedSteps: [],
      criteriaMet: [],
      attempts: 0,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    solutionState: {
      data: {
        code: "while (lo <= hi) { const mid = Math.floor((lo+hi)/2); ... }",
      },
      completedSteps: ["fix-mid"],
      criteriaMet: ["mid-integer"],
      attempts: 1,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    steps: [
      {
        id: "fix-mid",
        title: "Integer mid",
        brief: "Use Math.floor((lo + hi) / 2) so mid is an integer index.",
        hint: "A float mid is not a valid array index and the loop never terminates.",
        reveal: "const mid = Math.floor((lo + hi) / 2);",
        check: (s) => {
          const d = s.data as { code: string };
          return {
            passed: d.code.includes("Math.floor"),
            progress: d.code.includes("Math.floor") ? "1/1" : "0/1",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "mid-integer",
        label: "mid is floored to an integer",
        required: true,
        assert: (s) => {
          const d = s.data as { code: string };
          return d.code.includes("Math.floor");
        },
        explain: "A non-integer mid breaks indexing and can infinite-loop.",
      },
    ],
  },
  interviewByte: {
    shape: "Implement binary search and state its complexity.",
    strongAnswer:
      "O(log n) time, O(1) space iterative. Mention sorted precondition and off-by-one guards.",
    trap: "Forgetting the array must be sorted, or using mid = (lo+hi)/2 with overflow risk (use lo + (hi-lo)/2 in large inputs).",
  },
  recap: [
    "Linear search O(n); binary search O(log n) on sorted input.",
    "Binary search on answer: predicate must be monotonic.",
    "Guard the mid calculation against overflow.",
  ],
  attribution: "Synthesis of Striver's A2Z and NeetCode.",
};
