import type { DsaModule } from "../types";

export const stacksAndQueuesModule: DsaModule = {
  slug: "stacks-and-queues",
  order: 9,
  part: 1,
  partTitle: "Core data structures",
  title: "Stacks & Queues",
  description: "Stack, queue, deque, monotonic stack, and LRU cache.",
  kind: "lesson",
  story:
    "Undo, parsing, BFS, rate limiting — stacks and queues are the control flow of algorithms.",
  chapters: [
    { slug: "stack", title: "Stack", lessonSlug: "stack" },
    { slug: "queue", title: "Queue", lessonSlug: "queue" },
    { slug: "monotonic", title: "Monotonic stack", lessonSlug: "monotonic-stack" },
    { slug: "lru", title: "LRU cache", lessonSlug: "lru-cache" },
  ],
  lessons: [
    {
      slug: "stack",
      title: "Stack (LIFO)",
      sections: [
        {
          kind: "concept",
          title: "Operations",
          body: "Push, pop, peek — all O(1). Implement with an array (amortised) or a linked list. Use for undo, function call stack, expression evaluation, and DFS.",
        },
        {
          kind: "visual",
          title: "Stack push/pop",
          frames: [
            {
              id: "f1",
              kind: "stack",
              caption: "Stack: [1, 2]. Top is 2.",
              state: { kind: "stack", values: [1, 2], highlight: 1 },
            },
            {
              id: "f2",
              kind: "stack",
              caption: "Push 3 → [1, 2, 3].",
              state: { kind: "stack", values: [1, 2, 3], highlight: 2 },
            },
            {
              id: "f3",
              kind: "stack",
              caption: "Pop → [1, 2]. Returned 3.",
              state: { kind: "stack", values: [1, 2], highlight: 1 },
            },
          ],
        },
        {
          kind: "code",
          title: "Min stack",
          language: "javascript",
          starter:
            "class MinStack {\n  constructor() { this.stack = []; }\n  push(x) {}\n  pop() {}\n  top() {}\n  getMin() {}\n}\n\nconst s = new MinStack();\ns.push(3); s.push(1); s.push(2);\nconsole.log(s.getMin());",
          solution:
            "class MinStack {\n  constructor() { this.stack = []; this.mins = []; }\n  push(x) {\n    this.stack.push(x);\n    if (this.mins.length === 0 || x <= this.mins[this.mins.length - 1]) this.mins.push(x);\n  }\n  pop() {\n    const x = this.stack.pop();\n    if (x === this.mins[this.mins.length - 1]) this.mins.pop();\n    return x;\n  }\n  top() { return this.stack[this.stack.length - 1]; }\n  getMin() { return this.mins[this.mins.length - 1]; }\n}\n\nconst s = new MinStack();\ns.push(3); s.push(1); s.push(2);\nconsole.log(s.getMin()); // 1",
          tests: [
            { input: "const s=new MinStack(); s.push(5); s.getMin()", expected: "5" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Stack is LIFO; push/pop/peek O(1).",
            "Min stack: keep a parallel min stack.",
            "Use for undo, parsing, DFS.",
          ],
        },
      ],
      sources: [{ label: "Stack (VisuAlgo)", url: "https://visualgo.net/en/list" }],
      attribution: "Synthesis of Striver's A2Z stacks section.",
    },
    {
      slug: "queue",
      title: "Queue (FIFO)",
      sections: [
        {
          kind: "concept",
          title: "Operations",
          body: "Enqueue, dequeue, front — O(1). Use an array with a head pointer (or a linked list / deque) to avoid O(n) shift. Use for BFS, task scheduling, rate limiting.",
        },
        {
          kind: "visual",
          title: "Queue enqueue/dequeue",
          frames: [
            {
              id: "f1",
              kind: "queue",
              caption: "Queue: [1, 2]. Front is 1.",
              state: { kind: "queue", values: [1, 2], highlight: 0 },
            },
            {
              id: "f2",
              kind: "queue",
              caption: "Enqueue 3 → [1, 2, 3].",
              state: { kind: "queue", values: [1, 2, 3], highlight: 2 },
            },
            {
              id: "f3",
              kind: "queue",
              caption: "Dequeue → [2, 3]. Returned 1.",
              state: { kind: "queue", values: [2, 3], highlight: 0 },
            },
          ],
        },
        {
          kind: "code",
          title: "Queue with two stacks",
          language: "javascript",
          starter:
            "class Queue {\n  constructor() { this.in = []; this.out = []; }\n  enqueue(x) { this.in.push(x); }\n  dequeue() { return null; }\n  front() { return null; }\n}\n\nconst q = new Queue();\nq.enqueue(1); q.enqueue(2);\nconsole.log(q.dequeue());",
          solution:
            "class Queue {\n  constructor() { this.in = []; this.out = []; }\n  enqueue(x) { this.in.push(x); }\n  dequeue() {\n    if (this.out.length === 0) while (this.in.length) this.out.push(this.in.pop());\n    return this.out.pop();\n  }\n  front() {\n    if (this.out.length === 0) while (this.in.length) this.out.push(this.in.pop());\n    return this.out[this.out.length - 1];\n  }\n}\n\nconst q = new Queue();\nq.enqueue(1); q.enqueue(2);\nconsole.log(q.dequeue()); // 1",
          tests: [
            { input: "const q=new Queue(); q.enqueue(1); q.enqueue(2); q.dequeue(); q.dequeue()", expected: "2" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Queue is FIFO; enqueue/dequeue O(1).",
            "Two-stack queue: amortised O(1).",
            "Use for BFS and scheduling.",
          ],
        },
      ],
      sources: [{ label: "Queue (VisuAlgo)", url: "https://visualgo.net/en/list" }],
      attribution: "Synthesis of Striver's A2Z queues section.",
    },
    {
      slug: "monotonic-stack",
      title: "Monotonic stack",
      sections: [
        {
          kind: "concept",
          title: "Idea",
          body: "Maintain a stack that is always increasing or decreasing. When a new element arrives, pop until the invariant holds. Used for 'next greater element', 'largest rectangle in histogram', and sliding-window maxima. O(n) total because each element is pushed and popped at most once.",
        },
        {
          kind: "code",
          title: "Next greater element",
          language: "javascript",
          starter:
            "function nextGreater(arr) {\n  const res = new Array(arr.length).fill(-1);\n  const stack = [];\n  for (let i = 0; i < arr.length; i++) {\n    // pop while top < arr[i], set result\n  }\n  return res;\n}\n\nconsole.log(nextGreater([4, 5, 2, 10]));",
          solution:
            "function nextGreater(arr) {\n  const res = new Array(arr.length).fill(-1);\n  const stack = [];\n  for (let i = 0; i < arr.length; i++) {\n    while (stack.length && arr[stack[stack.length - 1]] < arr[i]) {\n      res[stack.pop()] = arr[i];\n    }\n    stack.push(i);\n  }\n  return res;\n}\n\nconsole.log(nextGreater([4, 5, 2, 10])); // [5, 10, 10, -1]",
          tests: [
            { input: "nextGreater([])", expected: "[]" },
            { input: "nextGreater([1])", expected: "[-1]" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Monotonic stack: pop until invariant holds.",
            "O(n) total — each element pushed/popped once.",
            "Solves NGE, histogram, sliding window max.",
          ],
        },
      ],
      sources: [{ label: "Monotonic stack (LeetCode)", url: "https://leetcode.com" }],
      attribution: "Synthesis of Striver's A2Z stacks section.",
    },
    {
      slug: "lru-cache",
      title: "LRU cache",
      sections: [
        {
          kind: "concept",
          title: "Design",
          body: "Least Recently Used cache: O(1) get and put. Combine a hash map (key → node) with a doubly linked list (recency order). On access, move the node to the front; on overflow, evict the tail. This is the canonical 'two structures, one purpose' design problem.",
        },
        {
          kind: "code",
          title: "LRU cache (Map-based, O(1))",
          language: "javascript",
          starter:
            "class LRUCache {\n  constructor(capacity) { this.cap = capacity; this.map = new Map(); }\n  get(key) { return -1; }\n  put(key, value) {}\n}\n\nconst c = new LRUCache(2);\nc.put(1, 1); c.put(2, 2);\nconsole.log(c.get(1));",
          solution:
            "class LRUCache {\n  constructor(capacity) { this.cap = capacity; this.map = new Map(); }\n  get(key) {\n    if (!this.map.has(key)) return -1;\n    const v = this.map.get(key);\n    this.map.delete(key);\n    this.map.set(key, v);\n    return v;\n  }\n  put(key, value) {\n    if (this.map.has(key)) this.map.delete(key);\n    this.map.set(key, value);\n    if (this.map.size > this.cap) {\n      const first = this.map.keys().next().value;\n      this.map.delete(first);\n    }\n  }\n}\n\nconst c = new LRUCache(2);\nc.put(1, 1); c.put(2, 2);\nconsole.log(c.get(1)); // 1",
          tests: [
            { input: "const c=new LRUCache(1); c.put(1,1); c.put(2,2); c.get(1)", expected: "-1" },
          ],
        },
        {
          kind: "recap",
          points: [
            "LRU = hash map + doubly linked list (or ordered Map).",
            "O(1) get and put.",
            "Evict the least recently used on overflow.",
          ],
        },
      ],
      sources: [{ label: "LRU cache (LeetCode 146)", url: "https://leetcode.com/problems/lru-cache/" }],
      attribution: "Synthesis of Striver's A2Z and LeetCode.",
    },
  ],
  interviewByte: {
    shape: "Design an LRU cache.",
    strongAnswer:
      "Hash map + doubly linked list, O(1) get/put. Explain eviction and recency update.",
    trap: "Using an array and shifting (O(n) per op) instead of a linked list.",
  },
  recap: [
    "Stack LIFO, queue FIFO — both O(1) ops.",
    "Monotonic stack solves NGE/histogram in O(n).",
    "LRU cache: hash map + linked list.",
  ],
  attribution: "Synthesis of Striver's A2Z stacks/queues section.",
};
