import type { DsaModule } from "../types";

export const advancedTopicsModule: DsaModule = {
  slug: "advanced-topics",
  order: 18,
  part: 3,
  partTitle: "Advanced",
  title: "Advanced Topics",
  description:
    "Bit manipulation, segment tree, Fenwick tree, union-find, string algorithms.",
  kind: "lesson",
  story:
    "The toolkit for when standard structures are not enough: bit tricks, range queries, and string matching.",
  chapters: [
    {
      slug: "bit-manipulation",
      title: "Bit manipulation",
      lessonSlug: "bit-manipulation",
    },
    { slug: "segment-tree", title: "Segment tree", lessonSlug: "segment-tree" },
    {
      slug: "string-algos",
      title: "String algorithms",
      lessonSlug: "string-algorithms",
    },
  ],
  lessons: [
    {
      slug: "bit-manipulation",
      title: "Bit manipulation",
      sections: [
        {
          kind: "concept",
          title: "Common tricks",
          body: "Check odd: x & 1. Power of two: x & (x-1) === 0. Count set bits: Brian Kernighan (x &= x-1). XOR of a number with itself is 0 (find the unique element). Subset enumeration via bitmask (0..2ⁿ-1).",
        },
        {
          kind: "code",
          title: "Count set bits",
          language: "javascript",
          starter:
            "function countBits(n) {\n  let c = 0;\n  while (n) { n &= n - 1; c++; }\n  return c;\n}\n\nconsole.log(countBits(13));",
          solution:
            "function countBits(n) {\n  let c = 0;\n  while (n) { n &= n - 1; c++; }\n  return c;\n}\n\nconsole.log(countBits(13)); // 1101 → 3",
          tests: [
            { input: "countBits(0)", expected: "0" },
            { input: "countBits(7)", expected: "3" },
          ],
        },
        {
          kind: "recap",
          points: [
            "x & (x-1) clears lowest set bit.",
            "XOR finds the unique element.",
            "Bitmask enumerates subsets.",
          ],
        },
      ],
      sources: [
        {
          label: "Bit manipulation (CP-Algorithms)",
          url: "https://cp-algorithms.com/algebra/bit-manipulation.html",
        },
      ],
      attribution: "Synthesis of Striver's A2Z bit manipulation section.",
    },
    {
      slug: "segment-tree",
      title: "Segment tree & Fenwick",
      sections: [
        {
          kind: "concept",
          title: "Range queries",
          body: "Segment tree: O(log n) range query and point update on an array. Fenwick tree (BIT): simpler, O(log n) for prefix sums and point updates. Use when you need many range queries with updates.",
        },
        {
          kind: "code",
          title: "Fenwick tree (prefix sum)",
          language: "javascript",
          starter:
            "class Fenwick {\n  constructor(n) { this.n = n; this.bit = new Array(n + 1).fill(0); }\n  update(i, delta) {}\n  query(i) { return 0; } // prefix sum [0..i]\n}\n\nconst f = new Fenwick(5);\nf.update(2, 3); f.update(4, 1);\nconsole.log(f.query(4));",
          solution:
            "class Fenwick {\n  constructor(n) { this.n = n; this.bit = new Array(n + 1).fill(0); }\n  update(i, delta) { for (i++; i <= this.n; i += i & -i) this.bit[i] += delta; }\n  query(i) { let s = 0; for (i++; i > 0; i -= i & -i) s += this.bit[i]; return s; }\n}\n\nconst f = new Fenwick(5);\nf.update(2, 3); f.update(4, 1);\nconsole.log(f.query(4)); // 4",
          tests: [
            {
              input: "const f=new Fenwick(3); f.update(0,5); f.query(0)",
              expected: "5",
            },
            {
              input: "const f=new Fenwick(3); f.update(0,5); f.query(2)",
              expected: "5",
            },
          ],
        },
        {
          kind: "recap",
          points: [
            "Segment tree: O(log n) range query + update.",
            "Fenwick: O(log n) prefix sum + point update.",
            "Use for dynamic range queries.",
          ],
        },
      ],
      sources: [
        {
          label: "Fenwick tree (CP-Algorithms)",
          url: "https://cp-algorithms.com/data_structures/fenwick.html",
        },
      ],
      attribution: "Synthesis of Striver's A2Z and CP-Algorithms.",
    },
    {
      slug: "string-algorithms",
      title: "String algorithms",
      sections: [
        {
          kind: "concept",
          title: "KMP and Rabin-Karp",
          body: "KMP finds a pattern in O(n+m) using a failure (LPS) array to avoid re-checking matched prefixes. Rabin-Karp uses rolling hashes to compare substrings in O(1), giving O(n+m) average. Z-algorithm computes the longest common prefix of the string with each suffix.",
        },
        {
          kind: "code",
          title: "KMP search",
          language: "javascript",
          starter:
            "function kmpSearch(text, pattern) {\n  // return index of first occurrence or -1\n  return -1;\n}\n\nconsole.log(kmpSearch('ababcabcabababd', 'ababd'));",
          solution:
            "function kmpSearch(text, pattern) {\n  if (pattern.length === 0) return 0;\n  // build LPS\n  const lps = new Array(pattern.length).fill(0);\n  let len = 0, i = 1;\n  while (i < pattern.length) {\n    if (pattern[i] === pattern[len]) { len++; lps[i] = len; i++; }\n    else if (len !== 0) len = lps[len - 1];\n    else { lps[i] = 0; i++; }\n  }\n  // search\n  let ti = 0, pi = 0;\n  while (ti < text.length) {\n    if (text[ti] === pattern[pi]) { ti++; pi++; }\n    if (pi === pattern.length) return ti - pi;\n    else if (ti < text.length && text[ti] !== pattern[pi]) {\n      if (pi !== 0) pi = lps[pi - 1];\n      else ti++;\n    }\n  }\n  return -1;\n}\n\nconsole.log(kmpSearch('ababcabcabababd', 'ababd')); // 10",
          tests: [
            { input: "kmpSearch('hello', 'll')", expected: "2" },
            { input: "kmpSearch('aaaa', 'aa')", expected: "0" },
            { input: "kmpSearch('abc', 'd')", expected: "-1" },
          ],
        },
        {
          kind: "recap",
          points: [
            "KMP: O(n+m) with LPS array.",
            "Rabin-Karp: rolling hash, O(n+m) average.",
            "Z-algorithm: LCP of string with each suffix.",
          ],
        },
      ],
      sources: [
        {
          label: "Prefix function / KMP (CP-Algorithms)",
          url: "https://cp-algorithms.com/string/prefix-function.html",
        },
      ],
      attribution: "Synthesis of Striver's A2Z and CP-Algorithms.",
    },
  ],
  interviewByte: {
    shape: "Find all occurrences of a pattern in a text.",
    strongAnswer:
      "KMP in O(n+m) time. Explain the LPS array and how it avoids re-matching.",
    trap: "Naive O(n·m) search, or confusing KMP with Rabin-Karp.",
  },
  recap: [
    "Bit tricks: x & (x-1), XOR, bitmask.",
    "Segment/Fenwick: O(log n) range queries.",
    "KMP: O(n+m) pattern matching.",
  ],
  attribution: "Synthesis of Striver's A2Z advanced section.",
};
