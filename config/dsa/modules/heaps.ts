import type { DsaModule } from "../types";

export const heapsModule: DsaModule = {
  slug: "heaps",
  order: 13,
  part: 2,
  partTitle: "Patterns",
  title: "Heaps & Priority Queues",
  description: "Min/max heap, heapify, top-K, median from stream.",
  kind: "lesson",
  story:
    "A heap gives O(1) access to the min/max and O(log n) insert/remove. It is the engine behind priority queues, schedulers, and Dijkstra.",
  chapters: [
    { slug: "heap-basics", title: "Heap basics", lessonSlug: "heap-basics" },
    { slug: "heap-ops", title: "Heap operations", lessonSlug: "heap-operations" },
    { slug: "top-k", title: "Top-K problems", lessonSlug: "top-k" },
  ],
  lessons: [
    {
      slug: "heap-basics",
      title: "Heap basics",
      sections: [
        {
          kind: "concept",
          title: "Complete binary tree",
          body: "A min-heap is a complete binary tree where every parent is ≤ its children. Stored in an array: parent of i is (i-1)/2, children are 2i+1 and 2i+2. The root is the minimum.",
        },
        {
          kind: "code",
          title: "Min heap (array)",
          language: "javascript",
          starter:
            "class MinHeap {\n  constructor() { this.h = []; }\n  push(x) {}\n  pop() { return null; }\n  peek() { return this.h[0]; }\n}\n\nconst h = new MinHeap();\nh.push(3); h.push(1); h.push(2);\nconsole.log(h.peek());",
          solution:
            "class MinHeap {\n  constructor() { this.h = []; }\n  push(x) {\n    this.h.push(x);\n    let i = this.h.length - 1;\n    while (i > 0 && this.h[i] < this.h[Math.floor((i - 1) / 2)]) {\n      const p = Math.floor((i - 1) / 2);\n      [this.h[i], this.h[p]] = [this.h[p], this.h[i]];\n      i = p;\n    }\n  }\n  pop() {\n    if (this.h.length === 0) return null;\n    const top = this.h[0];\n    this.h[0] = this.h.pop();\n    let i = 0;\n    while (true) {\n      const l = 2 * i + 1, r = 2 * i + 2;\n      let smallest = i;\n      if (l < this.h.length && this.h[l] < this.h[smallest]) smallest = l;\n      if (r < this.h.length && this.h[r] < this.h[smallest]) smallest = r;\n      if (smallest === i) break;\n      [this.h[i], this.h[smallest]] = [this.h[smallest], this.h[i]];\n      i = smallest;\n    }\n    return top;\n  }\n  peek() { return this.h[0]; }\n}\n\nconst h = new MinHeap();\nh.push(3); h.push(1); h.push(2);\nconsole.log(h.peek()); // 1",
          tests: [
            { input: "const h=new MinHeap(); h.push(5); h.push(1); h.peek()", expected: "1" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Min-heap: parent ≤ children, root is min.",
            "Array storage: parent (i-1)/2, children 2i+1, 2i+2.",
            "Push/pop O(log n).",
          ],
        },
      ],
      sources: [{ label: "Heap (VisuAlgo)", url: "https://visualgo.net/en/heap" }],
      attribution: "Synthesis of Striver's A2Z heaps section.",
    },
    {
      slug: "heap-operations",
      title: "Heapify and build-heap",
      sections: [
        {
          kind: "concept",
          title: "Heapify",
          body: "Heapify (sift-down) restores the heap property for a subtree rooted at i, assuming children are heaps. Building a heap by heapifying from the last parent down to the root is O(n), not O(n log n).",
        },
        {
          kind: "code",
          title: "Build heap",
          language: "javascript",
          starter:
            "function buildHeap(arr) {\n  // heapify from last parent down to root\n  return arr;\n}\n\nconsole.log(buildHeap([4, 10, 3, 5, 1]));",
          solution:
            "function buildHeap(arr) {\n  const n = arr.length;\n  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {\n    siftDown(arr, i, n);\n  }\n  return arr;\n}\nfunction siftDown(arr, i, n) {\n  while (true) {\n    const l = 2 * i + 1, r = 2 * i + 2;\n    let smallest = i;\n    if (l < n && arr[l] < arr[smallest]) smallest = l;\n    if (r < n && arr[r] < arr[smallest]) smallest = r;\n    if (smallest === i) break;\n    [arr[i], arr[smallest]] = [arr[smallest], arr[i]];\n    i = smallest;\n  }\n}\n\nconsole.log(buildHeap([4, 10, 3, 5, 1]));",
          tests: [{ input: "buildHeap([])", expected: "[]" }],
        },
        {
          kind: "recap",
          points: [
            "Heapify: sift-down from a node.",
            "Build heap: O(n) via bottom-up heapify.",
            "Heap sort: build heap + repeated pop.",
          ],
        },
      ],
      sources: [{ label: "Heap (VisuAlgo)", url: "https://visualgo.net/en/heap" }],
      attribution: "Synthesis of Striver's A2Z heaps section.",
    },
    {
      slug: "top-k",
      title: "Top-K problems",
      sections: [
        {
          kind: "concept",
          title: "Top-K pattern",
          body: "To find the K largest elements: use a min-heap of size K. Push each element; when size exceeds K, pop the min. Result is the K largest. O(n log K). For K smallest, use a max-heap.",
        },
        {
          kind: "code",
          title: "Kth largest element",
          language: "javascript",
          starter:
            "function kthLargest(nums, k) {\n  // min-heap of size k\n  return null;\n}\n\nconsole.log(kthLargest([3, 2, 1, 5, 6, 4], 2));",
          solution:
            "function kthLargest(nums, k) {\n  const heap = [];\n  for (const x of nums) {\n    heap.push(x);\n    heap.sort((a, b) => a - b);\n    if (heap.length > k) heap.shift();\n  }\n  return heap[0];\n}\n\nconsole.log(kthLargest([3, 2, 1, 5, 6, 4], 2)); // 5",
          tests: [
            { input: "kthLargest([3,2,1,5,6,4], 1)", expected: "6" },
            { input: "kthLargest([1], 1)", expected: "1" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Top-K largest: min-heap of size K.",
            "O(n log K) time, O(K) space.",
            "Median from stream: two heaps (max-heap for lower half, min-heap for upper).",
          ],
        },
      ],
      sources: [{ label: "Heap problems (LeetCode)", url: "https://leetcode.com" }],
      attribution: "Synthesis of Striver's A2Z heaps section.",
    },
  ],
  interviewByte: {
    shape: "Find the K largest elements in an array.",
    strongAnswer:
      "Min-heap of size K, O(n log K) time, O(K) space. Mention quickselect O(n) average as an alternative.",
    trap: "Sorting the whole array (O(n log n)) when only K are needed.",
  },
  recap: [
    "Heap: complete tree, O(1) min/max, O(log n) insert/remove.",
    "Build heap in O(n).",
    "Top-K: min-heap of size K.",
  ],
  attribution: "Synthesis of Striver's A2Z heaps section.",
};
