import type { DsaModule } from "../types";

export const arraysAndStringsModule: DsaModule = {
  slug: "arrays-and-strings",
  order: 3,
  part: 1,
  partTitle: "Core data structures",
  title: "Arrays & Strings",
  description:
    "Array memory model, traversal, in-place ops, prefix sums, and the two-pointer technique.",
  kind: "lesson+task",
  story:
    "Your app stores a feed in an array and searches it linearly for every request. At 10⁵ users that is 10¹⁰ operations a day.",
  chapters: [
    { slug: "array-basics", title: "Array basics", lessonSlug: "array-basics" },
    { slug: "two-pointers", title: "Two pointers", lessonSlug: "two-pointers" },
    { slug: "prefix-sums", title: "Prefix sums", lessonSlug: "prefix-sums" },
  ],
  lessons: [
    {
      slug: "array-basics",
      title: "Array basics",
      sections: [
        {
          kind: "concept",
          title: "Memory model",
          body: "An array is a contiguous block of memory. Index access is O(1) because the address is base + i·size. Insertion/deletion in the middle is O(n) because elements must shift. Appending is amortised O(1).",
        },
        {
          kind: "concept",
          title: "Strings are arrays of characters",
          body: "In most languages strings are immutable: any 'change' allocates a new string. Building a string in a loop is O(n²) unless you use a builder (array of chars joined at the end).",
        },
        {
          kind: "code",
          title: "Reverse in place",
          language: "javascript",
          starter:
            "function reverse(arr) {\n  // reverse arr in place, O(n) time, O(1) space\n  return arr;\n}\n\nconsole.log(reverse([1, 2, 3, 4]));",
          solution:
            "function reverse(arr) {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left < right) {\n    [arr[left], arr[right]] = [arr[right], arr[left]];\n    left++;\n    right--;\n  }\n  return arr;\n}\n\nconsole.log(reverse([1, 2, 3, 4])); // [4, 3, 2, 1]",
          tests: [
            { input: "reverse([1,2,3])", expected: "[3,2,1]" },
            { input: "reverse([])", expected: "[]" },
            { input: "reverse([7])", expected: "[7]" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Index access O(1); middle insert O(n).",
            "Strings are immutable in most languages.",
            "Two pointers solve many array problems in O(n).",
          ],
        },
      ],
      sources: [
        {
          label: "Striver's A2Z DSA Sheet",
          url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
        },
      ],
      attribution: "Synthesis of Striver's A2Z arrays section.",
    },
    {
      slug: "two-pointers",
      title: "Two pointers",
      sections: [
        {
          kind: "concept",
          title: "The idea",
          body: "Use two indices moving through the same array, usually one from each end (opposite ends) or both from the start (fast/slow). When the array is sorted, opposite-end pointers can find a pair summing to a target in O(n) instead of O(n²).",
        },
        {
          kind: "visual",
          title: "Two pointers finding a pair sum",
          frames: [
            {
              id: "f1",
              kind: "array",
              caption:
                "Sorted array [1,2,3,4,6]. Target sum = 7. Start: left at 0 (value 1), right at 4 (value 6).",
              state: {
                kind: "array",
                values: [1, 2, 3, 4, 6],
                pointers: [
                  { index: 0, label: "left", color: "#22c55e" },
                  { index: 4, label: "right", color: "#ef4444" },
                ],
              },
            },
            {
              id: "f2",
              kind: "array",
              caption: "1 + 6 = 7 == target. Pair found: (1, 6).",
              state: {
                kind: "array",
                values: [1, 2, 3, 4, 6],
                pointers: [
                  { index: 0, label: "left", color: "#22c55e" },
                  { index: 4, label: "right", color: "#ef4444" },
                ],
                highlight: [0, 4],
              },
            },
          ],
        },
        {
          kind: "code",
          title: "Two-sum on a sorted array",
          language: "javascript",
          starter:
            "function twoSumSorted(arr, target) {\n  // return indices [i, j] with arr[i] + arr[j] === target, or null\n  return null;\n}\n\nconsole.log(twoSumSorted([1, 2, 3, 4, 6], 7));",
          solution:
            "function twoSumSorted(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left < right) {\n    const sum = arr[left] + arr[right];\n    if (sum === target) return [left, right];\n    if (sum < target) left++;\n    else right--;\n  }\n  return null;\n}\n\nconsole.log(twoSumSorted([1, 2, 3, 4, 6], 7)); // [0, 4]",
          tests: [
            { input: "twoSumSorted([1,2,3,4,6], 5)", expected: "[0,3]" },
            { input: "twoSumSorted([1,2,3,4,6], 100)", expected: "null" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Sorted input enables opposite-end two pointers.",
            "Each step discards one element — O(n) total.",
            "Fast/slow pointers detect cycles and find midpoints.",
          ],
        },
      ],
      sources: [
        {
          label: "Striver's A2Z DSA Sheet",
          url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
        },
      ],
      attribution:
        "Synthesis of Striver's A2Z arrays section and NeetCode patterns.",
    },
    {
      slug: "prefix-sums",
      title: "Prefix sums",
      sections: [
        {
          kind: "concept",
          title: "Idea",
          body: "Precompute prefix[i] = sum of arr[0..i-1]. Then range sum [l, r] = prefix[r+1] - prefix[l] in O(1) after O(n) preprocessing. Turns O(n) per query into O(1).",
        },
        {
          kind: "code",
          title: "Range sum query",
          language: "javascript",
          starter:
            "function buildPrefix(arr) {\n  const p = [0];\n  for (let i = 0; i < arr.length; i++) p.push(p[p.length - 1] + arr[i]);\n  return p;\n}\nfunction rangeSum(prefix, l, r) {\n  // sum of arr[l..r] inclusive\n  return 0;\n}\n\nconst p = buildPrefix([1, 2, 3, 4, 5]);\nconsole.log(rangeSum(p, 1, 3));",
          solution:
            "function buildPrefix(arr) {\n  const p = [0];\n  for (let i = 0; i < arr.length; i++) p.push(p[p.length - 1] + arr[i]);\n  return p;\n}\nfunction rangeSum(prefix, l, r) {\n  return prefix[r + 1] - prefix[l];\n}\n\nconst p = buildPrefix([1, 2, 3, 4, 5]);\nconsole.log(rangeSum(p, 1, 3)); // 2+3+4 = 9",
          tests: [
            {
              input: "rangeSum(buildPrefix([1,2,3,4,5]), 0, 4)",
              expected: "15",
            },
            {
              input: "rangeSum(buildPrefix([1,2,3,4,5]), 2, 2)",
              expected: "3",
            },
          ],
        },
        {
          kind: "recap",
          points: [
            "Prefix sums turn range queries into O(1).",
            "Cost: O(n) preprocessing, O(n) space.",
            "Generalises to 2D and to difference arrays for range updates.",
          ],
        },
      ],
      sources: [
        {
          label: "Striver's A2Z DSA Sheet",
          url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
        },
      ],
      attribution: "Synthesis of Striver's A2Z prefix-sum problems.",
    },
  ],
  task: {
    brief:
      "Given a sorted array and a target, find two indices whose values sum to the target using two pointers. Start state has the pointers both at index 0 — wrong. Fix them.",
    startState: {
      data: { arr: [1, 2, 3, 4, 6], target: 7, left: 0, right: 0 },
      completedSteps: [],
      criteriaMet: [],
      attempts: 0,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    solutionState: {
      data: { arr: [1, 2, 3, 4, 6], target: 7, left: 0, right: 4 },
      completedSteps: ["place-right"],
      criteriaMet: ["pointers-correct"],
      attempts: 1,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    steps: [
      {
        id: "place-right",
        title: "Place the right pointer",
        brief: "Move `right` to the last index (arr.length - 1).",
        hint: "The right pointer starts at the end so the pair spans the whole array.",
        reveal:
          "right = arr.length - 1. With both pointers at 0 you only ever compare an element with itself.",
        check: (s) => {
          const d = s.data as { right: number; arr: number[] };
          return {
            passed: d.right === d.arr.length - 1,
            progress: d.right === d.arr.length - 1 ? "1/1" : "0/1",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "pointers-correct",
        label: "right pointer at last index",
        required: true,
        assert: (s) => {
          const d = s.data as { right: number; arr: number[] };
          return d.right === d.arr.length - 1;
        },
        explain:
          "Two pointers need to span the array; both at index 0 can never find a pair.",
      },
    ],
  },
  interviewByte: {
    shape: "Find two numbers in a sorted array that sum to a target.",
    strongAnswer:
      "Two pointers from both ends, O(n) time and O(1) space. Explain why sortedness is required.",
    trap: "Using a hash map and forgetting to state it needs O(n) extra space, or ignoring that the array must be sorted.",
  },
  recap: [
    "Arrays: O(1) index, O(n) middle insert.",
    "Two pointers: O(n) on sorted input.",
    "Prefix sums: O(1) range queries after O(n) prep.",
  ],
  attribution:
    "Synthesis of Striver's A2Z arrays section and NeetCode patterns.",
};
