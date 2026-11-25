import type { DsaModule } from "../types";

export const twoPointersAndSlidingWindowModule: DsaModule = {
  slug: "two-pointers-and-sliding-window",
  order: 10,
  part: 2,
  partTitle: "Patterns",
  title: "Two Pointers & Sliding Window",
  description: "Opposite ends, fast/slow, fixed and variable windows.",
  kind: "lesson+task",
  story:
    "These two patterns turn O(n²) brute force into O(n) on arrays and strings. They are the backbone of medium-difficulty problems.",
  chapters: [
    { slug: "two-pointers", title: "Two pointers", lessonSlug: "two-pointers" },
    {
      slug: "sliding-window",
      title: "Sliding window",
      lessonSlug: "sliding-window",
    },
    {
      slug: "advanced-windows",
      title: "Advanced windows",
      lessonSlug: "advanced-windows",
    },
  ],
  lessons: [
    {
      slug: "two-pointers",
      title: "Two pointers",
      sections: [
        {
          kind: "concept",
          title: "Opposite ends",
          body: "On a sorted array, place one pointer at each end and move them toward each other based on a comparison. Finds pairs, triplets, and container-with-most-water in O(n).",
        },
        {
          kind: "concept",
          title: "Fast and slow",
          body: "Both pointers start at the beginning; one moves faster. Used to detect cycles (Floyd), find the middle of a list, and remove duplicates in place.",
        },
        {
          kind: "code",
          title: "Container with most water",
          language: "javascript",
          starter:
            "function maxArea(height) {\n  // two pointers from both ends\n  return 0;\n}\n\nconsole.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]));",
          solution:
            "function maxArea(height) {\n  let left = 0, right = height.length - 1, best = 0;\n  while (left < right) {\n    best = Math.max(best, Math.min(height[left], height[right]) * (right - left));\n    if (height[left] < height[right]) left++;\n    else right--;\n  }\n  return best;\n}\n\nconsole.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49",
          tests: [
            { input: "maxArea([1,1])", expected: "1" },
            { input: "maxArea([4,3,2,1,4])", expected: "16" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Opposite ends: sorted input, pair finding.",
            "Fast/slow: cycle detection, middle, dedup.",
            "Each pointer moves at most n steps → O(n).",
          ],
        },
      ],
      sources: [
        {
          label: "NeetCode two-pointer problems",
          url: "https://neetcode.io/practice",
        },
      ],
      attribution: "Synthesis of Striver's A2Z and NeetCode.",
    },
    {
      slug: "sliding-window",
      title: "Sliding window",
      sections: [
        {
          kind: "concept",
          title: "Fixed window",
          body: "Window of size k slides by one each step: add the new element, remove the old. O(n) for sums, averages, max-in-window (with a deque).",
        },
        {
          kind: "concept",
          title: "Variable window",
          body: "Expand the right pointer to include elements; shrink the left when a constraint is violated. Tracks the longest/shortest subarray satisfying a condition. O(n) because each pointer moves at most n steps.",
        },
        {
          kind: "visual",
          title: "Variable window",
          frames: [
            {
              id: "f1",
              kind: "array",
              caption:
                "Array [1,2,1,0,1,1,0], find longest subarray with at most 2 zeros. Window [0,0].",
              state: {
                kind: "array",
                values: [1, 2, 1, 0, 1, 1, 0],
                range: [0, 0],
                pointers: [
                  { index: 0, label: "L" },
                  { index: 0, label: "R" },
                ],
              },
            },
            {
              id: "f2",
              kind: "array",
              caption: "Expand R to index 3 (includes one zero). Window [0,3].",
              state: {
                kind: "array",
                values: [1, 2, 1, 0, 1, 1, 0],
                range: [0, 3],
                highlight: [0, 1, 2, 3],
              },
            },
            {
              id: "f3",
              kind: "array",
              caption:
                "Expand R to index 6 (second zero). Window [0,6], zeros=2 OK.",
              state: {
                kind: "array",
                values: [1, 2, 1, 0, 1, 1, 0],
                range: [0, 6],
                highlight: [0, 1, 2, 3, 4, 5, 6],
              },
            },
          ],
        },
        {
          kind: "code",
          title: "Longest substring without repeating chars",
          language: "javascript",
          starter:
            "function lengthOfLongestSubstring(s) {\n  // sliding window with a set\n  return 0;\n}\n\nconsole.log(lengthOfLongestSubstring('abcabcbb'));",
          solution:
            "function lengthOfLongestSubstring(s) {\n  const set = new Set();\n  let left = 0, best = 0;\n  for (let right = 0; right < s.length; right++) {\n    while (set.has(s[right])) { set.delete(s[left]); left++; }\n    set.add(s[right]);\n    best = Math.max(best, right - left + 1);\n  }\n  return best;\n}\n\nconsole.log(lengthOfLongestSubstring('abcabcbb')); // 3",
          tests: [
            { input: "lengthOfLongestSubstring('')", expected: "0" },
            { input: "lengthOfLongestSubstring('bbbbb')", expected: "1" },
            { input: "lengthOfLongestSubstring('pwwkew')", expected: "3" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Fixed window: size k, slide by one.",
            "Variable window: expand R, shrink L on violation.",
            "O(n) because each pointer moves at most n steps.",
          ],
        },
      ],
      sources: [
        {
          label: "NeetCode sliding window problems",
          url: "https://neetcode.io/practice",
        },
      ],
      attribution: "Synthesis of Striver's A2Z and NeetCode.",
    },
    {
      slug: "advanced-windows",
      title: "Advanced windows",
      sections: [
        {
          kind: "concept",
          title: "Minimum window substring",
          body: "Find the smallest window containing all characters of a target. Expand R until all required chars are covered, then shrink L as much as possible while still valid. O(n) with a frequency map and a 'formed' counter.",
        },
        {
          kind: "code",
          title: "Minimum window substring",
          language: "javascript",
          starter:
            "function minWindow(s, t) {\n  // smallest substring of s containing all chars of t\n  return '';\n}\n\nconsole.log(minWindow('ADOBECODEBANC', 'ABC'));",
          solution:
            "function minWindow(s, t) {\n  const need = new Map();\n  for (const c of t) need.set(c, (need.get(c) || 0) + 1);\n  let have = 0, required = need.size;\n  const window = new Map();\n  let left = 0, best = { len: Infinity, l: 0 };\n  for (let right = 0; right < s.length; right++) {\n    const c = s[right];\n    window.set(c, (window.get(c) || 0) + 1);\n    if (need.has(c) && window.get(c) === need.get(c)) have++;\n    while (have === required) {\n      if (right - left + 1 < best.len) best = { len: right - left + 1, l: left };\n      const lc = s[left];\n      window.set(lc, window.get(lc) - 1);\n      if (need.has(lc) && window.get(lc) < need.get(lc)) have--;\n      left++;\n    }\n  }\n  return best.len === Infinity ? '' : s.slice(best.l, best.l + best.len);\n}\n\nconsole.log(minWindow('ADOBECODEBANC', 'ABC')); // BANC",
          tests: [
            { input: "minWindow('a', 'a')", expected: "'a'" },
            { input: "minWindow('a', 'aa')", expected: "''" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Expand until valid, then shrink while valid.",
            "Track 'formed' count vs required count.",
            "O(n) with a frequency map.",
          ],
        },
      ],
      sources: [
        {
          label: "NeetCode sliding window problems",
          url: "https://neetcode.io/practice",
        },
      ],
      attribution: "Synthesis of Striver's A2Z and NeetCode.",
    },
  ],
  task: {
    brief:
      "Variable window: expand R, and shrink L while the constraint is violated. The start code never shrinks L. Fix it.",
    startState: {
      data: {
        code: "for (let right = 0; right < s.length; right++) { set.add(s[right]); best = Math.max(best, right-left+1); }",
      },
      completedSteps: [],
      criteriaMet: [],
      attempts: 0,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    solutionState: {
      data: {
        code: "for (let right = 0; right < s.length; right++) { while (set.has(s[right])) { set.delete(s[left]); left++; } set.add(s[right]); best = Math.max(best, right-left+1); }",
      },
      completedSteps: ["shrink"],
      criteriaMet: ["shrinks-left"],
      attempts: 1,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    steps: [
      {
        id: "shrink",
        title: "Shrink while invalid",
        brief:
          "Add a while loop that removes s[left] and increments left while the constraint holds.",
        hint: "The window must stay valid; never let a duplicate survive.",
        reveal: "while (set.has(s[right])) { set.delete(s[left]); left++; }",
        check: (s) => {
          const d = s.data as { code: string };
          return {
            passed: d.code.includes("while (set.has"),
            progress: d.code.includes("while (set.has") ? "1/1" : "0/1",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "shrinks-left",
        label: "shrinks left while invalid",
        required: true,
        assert: (s) => {
          const d = s.data as { code: string };
          return d.code.includes("while (set.has");
        },
        explain:
          "Without shrinking, the window grows forever and counts duplicates.",
      },
    ],
  },
  interviewByte: {
    shape: "Find the longest substring without repeating characters.",
    strongAnswer:
      "Variable sliding window with a set, O(n) time, O(min(n, alphabet)) space.",
    trap: "Using a fixed window or restarting from scratch on each duplicate (O(n²)).",
  },
  recap: [
    "Two pointers: opposite ends or fast/slow, O(n).",
    "Sliding window: fixed size or variable with shrink-on-violation.",
    "Each pointer moves at most n steps → O(n) total.",
  ],
  attribution: "Synthesis of Striver's A2Z and NeetCode.",
};
