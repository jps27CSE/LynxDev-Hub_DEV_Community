import type { DsaModule } from "../types";

export const linkedListsModule: DsaModule = {
  slug: "linked-lists",
  order: 8,
  part: 1,
  partTitle: "Core data structures",
  title: "Linked Lists",
  description: "Singly, doubly, circular lists; reverse; cycle detection; merge.",
  kind: "lesson+task",
  story:
    "When you need O(1) insert/delete at the front and don't need random access, a linked list beats an array.",
  chapters: [
    { slug: "basics", title: "Basics", lessonSlug: "basics" },
    { slug: "operations", title: "Operations", lessonSlug: "operations" },
    { slug: "cycle-detection", title: "Cycle detection", lessonSlug: "cycle-detection" },
    { slug: "merge", title: "Merge lists", lessonSlug: "merge-lists" },
  ],
  lessons: [
    {
      slug: "basics",
      title: "Linked list basics",
      sections: [
        {
          kind: "concept",
          title: "Node and list",
          body: "A node holds a value and a `next` pointer. The list is reached through its head. No contiguous memory, no index: access is O(n). Insert/delete at a known node is O(1) (just rewiring pointers).",
        },
        {
          kind: "visual",
          title: "A linked list",
          frames: [
            {
              id: "f1",
              kind: "linkedlist",
              caption: "List: 1 → 2 → 3 → null. Head points to node 1.",
              state: { kind: "linkedlist", nodes: [{ value: 1, next: "2" }, { value: 2, next: "3" }, { value: 3 }], head: "1" },
            },
          ],
        },
        {
          kind: "code",
          title: "Node definition",
          language: "javascript",
          starter:
            "class ListNode {\n  constructor(val, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}\n\nconst head = new ListNode(1, new ListNode(2, new ListNode(3)));\nconsole.log(head.val, head.next.val, head.next.next.val);",
          solution:
            "class ListNode {\n  constructor(val, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}\n\nconst head = new ListNode(1, new ListNode(2, new ListNode(3)));\nconsole.log(head.val, head.next.val, head.next.next.val);",
          tests: [{ input: "new ListNode(5).val", expected: "5" }],
        },
        {
          kind: "recap",
          points: [
            "Node = value + next pointer.",
            "O(1) insert/delete at a known node; O(n) access.",
            "No random access — that is the trade-off vs arrays.",
          ],
        },
      ],
      sources: [{ label: "Linked list (VisuAlgo)", url: "https://visualgo.net/en/list" }],
      attribution: "Synthesis of Striver's A2Z linked list section.",
    },
    {
      slug: "operations",
      title: "Reverse, insert, delete",
      sections: [
        {
          kind: "concept",
          title: "Reverse in place",
          body: "Iterate with three pointers: prev, curr, next. At each step, save next, point curr.next to prev, advance. O(n) time, O(1) space. The canonical pointer-rewiring problem.",
        },
        {
          kind: "code",
          title: "Reverse a linked list",
          language: "javascript",
          starter:
            "class ListNode {\n  constructor(val, next = null) { this.val = val; this.next = next; }\n}\nfunction reverse(head) {\n  // reverse in place\n  return head;\n}\n\nconst head = new ListNode(1, new ListNode(2, new ListNode(3)));\nconsole.log(reverse(head).val);",
          solution:
            "class ListNode {\n  constructor(val, next = null) { this.val = val; this.next = next; }\n}\nfunction reverse(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}\n\nconst head = new ListNode(1, new ListNode(2, new ListNode(3)));\nconsole.log(reverse(head).val); // 3",
          tests: [
            { input: "reverse(null)", expected: "null" },
            { input: "reverse(new ListNode(1)).val", expected: "1" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Reverse: prev/curr/next, O(n) time, O(1) space.",
            "Insert/delete at a known node is O(1).",
            "Always handle null head.",
          ],
        },
      ],
      sources: [{ label: "Linked list (VisuAlgo)", url: "https://visualgo.net/en/list" }],
      attribution: "Synthesis of Striver's A2Z linked list section.",
    },
    {
      slug: "cycle-detection",
      title: "Cycle detection (Floyd)",
      sections: [
        {
          kind: "concept",
          title: "Tortoise and hare",
          body: "Two pointers: slow moves one step, fast moves two. If there is a cycle, they meet. If fast reaches null, no cycle. O(n) time, O(1) space. The meeting point can be used to find the cycle start.",
        },
        {
          kind: "code",
          title: "Has cycle",
          language: "javascript",
          starter:
            "class ListNode {\n  constructor(val, next = null) { this.val = val; this.next = next; }\n}\nfunction hasCycle(head) {\n  // Floyd's algorithm\n  return false;\n}\n\nconst a = new ListNode(1); const b = new ListNode(2); a.next = b; b.next = a;\nconsole.log(hasCycle(a));",
          solution:
            "class ListNode {\n  constructor(val, next = null) { this.val = val; this.next = next; }\n}\nfunction hasCycle(head) {\n  let slow = head, fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow === fast) return true;\n  }\n  return false;\n}\n\nconst a = new ListNode(1); const b = new ListNode(2); a.next = b; b.next = a;\nconsole.log(hasCycle(a)); // true",
          tests: [
            { input: "hasCycle(null)", expected: "false" },
            { input: "hasCycle(new ListNode(1))", expected: "false" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Floyd: slow 1 step, fast 2 steps.",
            "O(n) time, O(1) space.",
            "Meeting implies a cycle; null implies none.",
          ],
        },
      ],
      sources: [{ label: "Floyd's cycle (VisuAlgo)", url: "https://visualgo.net/en/list" }],
      attribution: "Synthesis of Striver's A2Z linked list section.",
    },
    {
      slug: "merge-lists",
      title: "Merge two sorted lists",
      sections: [
        {
          kind: "concept",
          title: "Merge in place",
          body: "Use a dummy head and a tail pointer. Compare the two current nodes, append the smaller, advance. O(n+m) time, O(1) extra space. The building block of merge sort on linked lists.",
        },
        {
          kind: "code",
          title: "Merge sorted lists",
          language: "javascript",
          starter:
            "class ListNode {\n  constructor(val, next = null) { this.val = val; this.next = next; }\n}\nfunction merge(l1, l2) {\n  return null;\n}\n\nconst a = new ListNode(1, new ListNode(3));\nconst b = new ListNode(2, new ListNode(4));\nconsole.log(merge(a, b).val);",
          solution:
            "class ListNode {\n  constructor(val, next = null) { this.val = val; this.next = next; }\n}\nfunction merge(l1, l2) {\n  const dummy = new ListNode(0);\n  let tail = dummy;\n  while (l1 && l2) {\n    if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }\n    else { tail.next = l2; l2 = l2.next; }\n    tail = tail.next;\n  }\n  tail.next = l1 || l2;\n  return dummy.next;\n}\n\nconst a = new ListNode(1, new ListNode(3));\nconst b = new ListNode(2, new ListNode(4));\nconsole.log(merge(a, b).val); // 1",
          tests: [
            { input: "merge(null, null)", expected: "null" },
            { input: "merge(new ListNode(1), null).val", expected: "1" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Dummy head simplifies edge cases.",
            "O(n+m) time, O(1) space.",
            "Foundation for merge sort on lists.",
          ],
        },
      ],
      sources: [{ label: "Merge lists (VisuAlgo)", url: "https://visualgo.net/en/list" }],
      attribution: "Synthesis of Striver's A2Z linked list section.",
    },
  ],
  task: {
    brief:
      "Reverse a linked list iteratively. The start code swaps values instead of rewiring pointers (O(n) space, and breaks node identity). Fix it to rewire pointers in O(1) space.",
    startState: {
      data: { approach: "swap-values" },
      completedSteps: [],
      criteriaMet: [],
      attempts: 0,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    solutionState: {
      data: { approach: "rewire-pointers" },
      completedSteps: ["rewire"],
      criteriaMet: ["o1-space"],
      attempts: 1,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    steps: [
      {
        id: "rewire",
        title: "Rewire pointers",
        brief: "Use prev/curr/next to reverse links in place.",
        hint: "Save next, point curr.next to prev, advance all three.",
        reveal: "const next = curr.next; curr.next = prev; prev = curr; curr = next;",
        check: (s) => {
          const d = s.data as { approach: string };
          return { passed: d.approach === "rewire-pointers", progress: d.approach === "rewire-pointers" ? "1/1" : "0/1" };
        },
      },
    ],
    passCriteria: [
      {
        id: "o1-space",
        label: "O(1) extra space via pointer rewiring",
        required: true,
        assert: (s) => {
          const d = s.data as { approach: string };
          return d.approach === "rewire-pointers";
        },
        explain: "Swapping values uses O(n) space and breaks node identity.",
      },
    ],
  },
  interviewByte: {
    shape: "Reverse a linked list and detect a cycle.",
    strongAnswer:
      "Reverse: prev/curr/next in O(n) time O(1) space. Cycle: Floyd's tortoise and hare O(n) time O(1) space.",
    trap: "Using a stack/array for reverse (O(n) space) when O(1) is expected.",
  },
  recap: [
    "Node = value + next.",
    "Reverse in O(1) space via pointer rewiring.",
    "Floyd's cycle detection: O(n) time, O(1) space.",
  ],
  attribution: "Synthesis of Striver's A2Z linked list section.",
};
