import type { DsaModule } from "../types";

export const hashingModule: DsaModule = {
  slug: "hashing",
  order: 7,
  part: 1,
  partTitle: "Core data structures",
  title: "Hashing",
  description: "Hash functions, collisions, hash maps and sets, and frequency counting.",
  kind: "lesson",
  story:
    "A hash map turns 'does this exist?' from O(n) to O(1). It is the single most useful structure in interview problems.",
  chapters: [
    { slug: "hash-functions", title: "Hash functions", lessonSlug: "hash-functions" },
    { slug: "collisions", title: "Collisions", lessonSlug: "collisions" },
    { slug: "maps-and-sets", title: "Maps & sets", lessonSlug: "maps-and-sets" },
    { slug: "patterns", title: "Frequency patterns", lessonSlug: "frequency-patterns" },
  ],
  lessons: [
    {
      slug: "hash-functions",
      title: "Hash functions",
      sections: [
        {
          kind: "concept",
          title: "What a hash function does",
          body: "A hash function maps a key to an integer (bucket index). A good hash function is fast, deterministic, and spreads keys uniformly across buckets. Poor spread causes collisions and degrades to O(n).",
        },
        {
          kind: "code",
          title: "A simple hash",
          language: "javascript",
          starter:
            "function hash(str, size) {\n  let h = 0;\n  for (let i = 0; i < str.length; i++) {\n    h = (h * 31 + str.charCodeAt(i)) % size;\n  }\n  return h;\n}\n\nconsole.log(hash('abc', 10));",
          solution:
            "function hash(str, size) {\n  let h = 0;\n  for (let i = 0; i < str.length; i++) {\n    h = (h * 31 + str.charCodeAt(i)) % size;\n  }\n  return h;\n}\n\nconsole.log(hash('abc', 10));",
          tests: [{ input: "hash('abc', 10)", expected: "4" }],
        },
        {
          kind: "recap",
          points: [
            "Hash maps keys to bucket indices.",
            "Good hashing = uniform spread.",
            "Bad spread → collisions → O(n).",
          ],
        },
      ],
      sources: [{ label: "Hash table (VisuAlgo)", url: "https://visualgo.net/en/hashtable" }],
      attribution: "Synthesis of Striver's A2Z hashing section.",
    },
    {
      slug: "collisions",
      title: "Collisions",
      sections: [
        {
          kind: "concept",
          title: "Chaining vs open addressing",
          body: "Chaining stores a list per bucket. Open addressing probes for the next free slot (linear, quadratic, or double hashing). Load factor α = n/m; when α exceeds ~0.7 (open addressing) or ~1.0 (chaining), resize and rehash. Rehashing is O(n) but amortised O(1) per insert.",
        },
        {
          kind: "recap",
          points: [
            "Chaining: list per bucket; open addressing: probe for free slot.",
            "Resize when load factor is too high.",
            "Average O(1), worst O(n).",
          ],
        },
      ],
      sources: [{ label: "Hash table (VisuAlgo)", url: "https://visualgo.net/en/hashtable" }],
      attribution: "Synthesis of Striver's A2Z hashing section.",
    },
    {
      slug: "maps-and-sets",
      title: "Maps & sets",
      sections: [
        {
          kind: "concept",
          title: "When to use which",
          body: "Map (dictionary): key → value, O(1) average lookup/insert/delete. Set: membership only, O(1) average. Use a Map when you need to associate data with a key (counts, indices); use a Set for deduplication and membership tests.",
        },
        {
          kind: "code",
          title: "Frequency count",
          language: "javascript",
          starter:
            "function freq(arr) {\n  const m = new Map();\n  for (const x of arr) m.set(x, (m.get(x) || 0) + 1);\n  return m;\n}\n\nconsole.log([...freq([1, 2, 2, 3, 3, 3]).entries()]);",
          solution:
            "function freq(arr) {\n  const m = new Map();\n  for (const x of arr) m.set(x, (m.get(x) || 0) + 1);\n  return m;\n}\n\nconsole.log([...freq([1, 2, 2, 3, 3, 3]).entries()]);",
          tests: [
            { input: "freq([]).size", expected: "0" },
            { input: "freq([1,1,1]).get(1)", expected: "3" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Map: key → value; Set: membership.",
            "Both O(1) average.",
            "Frequency counting is the #1 hash map pattern.",
          ],
        },
      ],
      sources: [{ label: "Hash table (VisuAlgo)", url: "https://visualgo.net/en/hashtable" }],
      attribution: "Synthesis of Striver's A2Z hashing section.",
    },
    {
      slug: "frequency-patterns",
      title: "Frequency patterns",
      sections: [
        {
          kind: "concept",
          title: "The patterns",
          body: "Counting frequencies, finding the majority element (Boyer-Moore), anagram grouping (sorted key or frequency signature), and 'contains duplicate' (set membership). These cover a large share of easy/medium hash problems.",
        },
        {
          kind: "code",
          title: "Anagram groups",
          language: "javascript",
          starter:
            "function groupAnagrams(strs) {\n  const map = new Map();\n  for (const s of strs) {\n    const key = s.split('').sort().join('');\n    if (!map.has(key)) map.set(key, []);\n    map.get(key).push(s);\n  }\n  return [...map.values()];\n}\n\nconsole.log(groupAnagrams(['eat','tea','tan','ate','nat','bat']));",
          solution:
            "function groupAnagrams(strs) {\n  const map = new Map();\n  for (const s of strs) {\n    const key = s.split('').sort().join('');\n    if (!map.has(key)) map.set(key, []);\n    map.get(key).push(s);\n  }\n  return [...map.values()];\n}\n\nconsole.log(groupAnagrams(['eat','tea','tan','ate','nat','bat']));",
          tests: [
            { input: "groupAnagrams([]).length", expected: "0" },
            { input: "groupAnagrams(['a']).length", expected: "1" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Frequency signature groups anagrams.",
            "Set membership solves 'contains duplicate'.",
            "Majority element: Boyer-Moore O(1) space.",
          ],
        },
      ],
      sources: [{ label: "NeetCode anagram problems", url: "https://neetcode.io/practice" }],
      attribution: "Synthesis of Striver's A2Z and NeetCode.",
    },
  ],
  interviewByte: {
    shape: "When would you use a hash map vs a sorted array?",
    strongAnswer:
      "Hash map for O(1) lookup/insert when order doesn't matter; sorted array for range queries and O(log n) search with no extra memory.",
    trap: "Ignoring the O(n) worst case of hash maps or the memory overhead.",
  },
  recap: [
    "Hash maps give O(1) average lookup.",
    "Collisions: chaining or open addressing; resize at high load factor.",
    "Frequency counting is the most common pattern.",
  ],
  attribution: "Synthesis of Striver's A2Z and VisuAlgo.",
};
