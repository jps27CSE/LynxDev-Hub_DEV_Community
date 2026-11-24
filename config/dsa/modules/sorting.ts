import type { DsaModule } from "../types";

export const sortingModule: DsaModule = {
  slug: "sorting",
  order: 6,
  part: 1,
  partTitle: "Core data structures",
  title: "Sorting",
  description:
    "Bubble, selection, insertion, merge, quick, counting, radix — and when to use which.",
  kind: "lesson+task",
  story:
    "Every search, every merge, every 'is this sorted?' check assumes you can sort. Sorting is the foundation most other algorithms build on.",
  chapters: [
    { slug: "elementary", title: "Elementary sorts", lessonSlug: "elementary-sorts" },
    { slug: "merge-sort", title: "Merge sort", lessonSlug: "merge-sort" },
    { slug: "quick-sort", title: "Quick sort", lessonSlug: "quick-sort" },
    { slug: "linear-sorts", title: "Linear-time sorts", lessonSlug: "linear-sorts" },
  ],
  lessons: [
    {
      slug: "elementary-sorts",
      title: "Elementary sorts (bubble, selection, insertion)",
      sections: [
        {
          kind: "concept",
          title: "Bubble sort",
          body: "Repeatedly swap adjacent out-of-order elements. Each pass bubbles the largest remaining value to the end. O(n²) time, O(1) space, stable. Useless on large data but teaches the swap primitive and is the basis for detecting 'almost sorted' input.",
        },
        {
          kind: "concept",
          title: "Selection sort",
          body: "Each pass pick the minimum of the unsorted suffix and swap it to the front. O(n²) time, O(1) space, <em>not</em> stable. Exactly n-1 swaps — useful when writes are expensive (flash memory).",
        },
        {
          kind: "concept",
          title: "Insertion sort",
          body: "Grow a sorted prefix by inserting each next element into its correct position. O(n²) worst case, O(n) best case on already-sorted input, O(1) space, stable. The right choice for small or nearly-sorted arrays; also the base case of Timsort.",
        },
        {
          kind: "visual",
          title: "Bubble sort pass",
          frames: [
            {
              id: "f1",
              kind: "array",
              caption: "Array [5, 3, 8, 1]. First pass compares adjacent pairs.",
              state: { kind: "array", values: [5, 3, 8, 1], highlight: [0, 1] },
            },
            {
              id: "f2",
              kind: "array",
              caption: "5 > 3, swap → [3, 5, 8, 1]. Next pair 5, 8 no swap.",
              state: { kind: "array", values: [3, 5, 8, 1], highlight: [1, 2] },
            },
            {
              id: "f3",
              kind: "array",
              caption: "8 > 1, swap → [3, 5, 1, 8]. Largest value bubbled to the end.",
              state: { kind: "array", values: [3, 5, 1, 8], highlight: [2, 3] },
            },
            {
              id: "f4",
              kind: "array",
              caption: "Next pass works on [3, 5, 1] (last element settled).",
              state: { kind: "array", values: [3, 5, 1, 8], range: [0, 2] },
            },
          ],
        },
        {
          kind: "code",
          title: "Insertion sort",
          language: "javascript",
          starter:
            "function insertionSort(arr) {\n  // sort in place\n  return arr;\n}\n\nconsole.log(insertionSort([5, 2, 4, 6, 1, 3]));",
          solution:
            "function insertionSort(arr) {\n  for (let i = 1; i < arr.length; i++) {\n    const key = arr[i];\n    let j = i - 1;\n    while (j >= 0 && arr[j] > key) {\n      arr[j + 1] = arr[j];\n      j--;\n    }\n    arr[j + 1] = key;\n  }\n  return arr;\n}\n\nconsole.log(insertionSort([5, 2, 4, 6, 1, 3]));",
          tests: [
            { input: "insertionSort([])", expected: "[]" },
            { input: "insertionSort([1])", expected: "[1]" },
            { input: "insertionSort([3,2,1])", expected: "[1,2,3]" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Bubble/selection/insertion are O(n²) — only for small or nearly-sorted data.",
            "Insertion sort is stable and adaptive (fast on sorted input).",
            "Selection sort minimises writes.",
          ],
        },
      ],
      sources: [
        { label: "Sorting algorithms (VisuAlgo)", url: "https://visualgo.net/en/sorting" },
      ],
      attribution: "Synthesis of Striver's A2Z sorting section and VisuAlgo.",
    },
    {
      slug: "merge-sort",
      title: "Merge sort",
      sections: [
        {
          kind: "concept",
          title: "Divide and conquer",
          body: "Split the array in half, sort each half recursively, then merge the two sorted halves in O(n). Recurrence T(n)=2T(n/2)+O(n) → O(n log n) by the Master theorem. O(n) extra space. Stable. The merge step is the reusable primitive.",
        },
        {
          kind: "code",
          title: "Merge sort",
          language: "javascript",
          starter:
            "function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  // split, recurse, merge\n  return arr;\n}\n\nconsole.log(mergeSort([5, 2, 4, 6, 1, 3]));",
          solution:
            "function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\nfunction merge(a, b) {\n  const out = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) {\n    if (a[i] <= b[j]) out.push(a[i++]);\n    else out.push(b[j++]);\n  }\n  while (i < a.length) out.push(a[i++]);\n  while (j < b.length) out.push(b[j++]);\n  return out;\n}\n\nconsole.log(mergeSort([5, 2, 4, 6, 1, 3]));",
          tests: [
            { input: "mergeSort([])", expected: "[]" },
            { input: "mergeSort([1])", expected: "[1]" },
            { input: "mergeSort([3,2,1])", expected: "[1,2,3]" },
          ],
        },
        {
          kind: "recap",
          points: [
            "O(n log n) time, O(n) space.",
            "Stable; ideal for linked lists and external sorting.",
            "The merge step is reusable in many problems.",
          ],
        },
      ],
      sources: [{ label: "Merge sort (VisuAlgo)", url: "https://visualgo.net/en/sorting" }],
      attribution: "Synthesis of Striver's A2Z and CLRS.",
    },
    {
      slug: "quick-sort",
      title: "Quick sort",
      sections: [
        {
          kind: "concept",
          title: "Partitioning",
          body: "Pick a pivot, partition so smaller values go left and larger go right, then recurse on both sides. Average O(n log n), worst O(n²) (already sorted with bad pivot). In-place, O(log n) stack. Not stable. Fastest in practice due to cache locality.",
        },
        {
          kind: "code",
          title: "Quick sort (Lomuto partition)",
          language: "javascript",
          starter:
            "function quickSort(arr, lo = 0, hi = arr.length - 1) {\n  if (lo >= hi) return arr;\n  // partition and recurse\n  return arr;\n}\n\nconsole.log(quickSort([5, 2, 4, 6, 1, 3]));",
          solution:
            "function quickSort(arr, lo = 0, hi = arr.length - 1) {\n  if (lo >= hi) return arr;\n  const p = partition(arr, lo, hi);\n  quickSort(arr, lo, p - 1);\n  quickSort(arr, p + 1, hi);\n  return arr;\n}\nfunction partition(arr, lo, hi) {\n  const pivot = arr[hi];\n  let i = lo;\n  for (let j = lo; j < hi; j++) {\n    if (arr[j] <= pivot) {\n      [arr[i], arr[j]] = [arr[j], arr[i]];\n      i++;\n    }\n  }\n  [arr[i], arr[hi]] = [arr[hi], arr[i]];\n  return i;\n}\n\nconsole.log(quickSort([5, 2, 4, 6, 1, 3]));",
          tests: [
            { input: "quickSort([])", expected: "[]" },
            { input: "quickSort([3,2,1])", expected: "[1,2,3]" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Average O(n log n), worst O(n²).",
            "In-place, cache-friendly.",
            "Pivot choice matters: random or median-of-three avoids worst case.",
          ],
        },
      ],
      sources: [{ label: "Quick sort (VisuAlgo)", url: "https://visualgo.net/en/sorting" }],
      attribution: "Synthesis of Striver's A2Z and CLRS.",
    },
    {
      slug: "linear-sorts",
      title: "Linear-time sorts (counting, radix, bucket)",
      sections: [
        {
          kind: "concept",
          title: "When O(n log n) is not enough",
          body: "Counting sort counts occurrences of each value: O(n + k) where k is the value range. Radix sort sorts digit by digit using counting sort: O(d·(n+k)). Bucket sort distributes into buckets then sorts each: O(n) average. All require integer or bounded keys.",
        },
        {
          kind: "code",
          title: "Counting sort",
          language: "javascript",
          starter:
            "function countingSort(arr) {\n  if (arr.length === 0) return arr;\n  const max = Math.max(...arr);\n  const count = new Array(max + 1).fill(0);\n  for (const x of arr) count[x]++;\n  const out = [];\n  for (let v = 0; v <= max; v++) for (let c = 0; c < count[v]; c++) out.push(v);\n  return out;\n}\n\nconsole.log(countingSort([4, 2, 2, 8, 3, 3, 1]));",
          solution:
            "function countingSort(arr) {\n  if (arr.length === 0) return arr;\n  const max = Math.max(...arr);\n  const count = new Array(max + 1).fill(0);\n  for (const x of arr) count[x]++;\n  const out = [];\n  for (let v = 0; v <= max; v++) for (let c = 0; c < count[v]; c++) out.push(v);\n  return out;\n}\n\nconsole.log(countingSort([4, 2, 2, 8, 3, 3, 1]));",
          tests: [
            { input: "countingSort([])", expected: "[]" },
            { input: "countingSort([1])", expected: "[1]" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Comparison sorts are Ω(n log n); linear sorts beat that with constraints.",
            "Counting sort: O(n + k). Radix: O(d(n + k)).",
            "Use linear sorts only when keys are integers in a bounded range.",
          ],
        },
      ],
      sources: [{ label: "Counting/radix sort (VisuAlgo)", url: "https://visualgo.net/en/sorting" }],
      attribution: "Synthesis of Striver's A2Z and CLRS.",
    },
  ],
  task: {
    brief:
      "Merge sort's merge step must handle leftover elements in both arrays. The start code forgets the trailing loops. Fix it.",
    startState: {
      data: { code: "while (i < a.length && j < b.length) { ... } // missing trailing loops" },
      completedSteps: [],
      criteriaMet: [],
      attempts: 0,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    solutionState: {
      data: { code: "while (i < a.length && j < b.length) { ... } while (i < a.length) out.push(a[i++]); while (j < b.length) out.push(b[j++]);" },
      completedSteps: ["add-trailing"],
      criteriaMet: ["merge-complete"],
      attempts: 1,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    steps: [
      {
        id: "add-trailing",
        title: "Drain the remainder",
        brief: "After the main loop, push any remaining elements from both arrays.",
        hint: "One of a or b may still have elements when the other is exhausted.",
        reveal: "while (i < a.length) out.push(a[i++]); while (j < b.length) out.push(b[j++]);",
        check: (s) => {
          const d = s.data as { code: string };
          return { passed: d.code.includes("while (i < a.length)"), progress: d.code.includes("while (i < a.length)") ? "1/1" : "0/1" };
        },
      },
    ],
    passCriteria: [
      {
        id: "merge-complete",
        label: "merge drains both arrays",
        required: true,
        assert: (s) => {
          const d = s.data as { code: string };
          return d.code.includes("while (i < a.length)") && d.code.includes("while (j < b.length)");
        },
        explain: "Forgetting the trailing loops drops elements and produces a shorter array.",
      },
    ],
  },
  interviewByte: {
    shape: "Which sort would you use and why?",
    strongAnswer:
      "Compare O(n log n) comparison sorts vs O(n) linear sorts; mention stability, space, and input constraints.",
    trap: "Defaulting to quick sort without considering worst case or stability requirements.",
  },
  recap: [
    "Elementary sorts: O(n²), O(1) space.",
    "Merge/quick: O(n log n); merge stable, quick in-place.",
    "Linear sorts: O(n) with bounded integer keys.",
  ],
  attribution: "Synthesis of Striver's A2Z and CLRS.",
};
