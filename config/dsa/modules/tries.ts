import type { DsaModule } from "../types";

export const triesModule: DsaModule = {
  slug: "tries",
  order: 17,
  part: 3,
  partTitle: "Advanced",
  title: "Tries",
  description: "Trie node, insert/search/prefix, word search.",
  kind: "lesson",
  story:
    "A trie (prefix tree) makes prefix search O(L) where L is the word length. It is the engine behind autocomplete and spell-check.",
  chapters: [
    { slug: "trie-basics", title: "Trie basics", lessonSlug: "trie-basics" },
    {
      slug: "trie-problems",
      title: "Trie problems",
      lessonSlug: "trie-problems",
    },
  ],
  lessons: [
    {
      slug: "trie-basics",
      title: "Trie basics",
      sections: [
        {
          kind: "concept",
          title: "Node and trie",
          body: "Each node has a map of children (char → node) and an `isEnd` flag. Insert walks/creates nodes for each char and marks the end. Search walks nodes; if it reaches the end and isEnd is true, the word exists. Prefix search is the same walk without the isEnd check.",
        },
        {
          kind: "code",
          title: "Trie implementation",
          language: "javascript",
          starter:
            "class TrieNode {\n  constructor() { this.children = {}; this.isEnd = false; }\n}\nclass Trie {\n  constructor() { this.root = new TrieNode(); }\n  insert(word) {}\n  search(word) { return false; }\n  startsWith(prefix) { return false; }\n}\n\nconst t = new Trie();\nt.insert('apple');\nconsole.log(t.search('apple'), t.search('app'), t.startsWith('app'));",
          solution:
            "class TrieNode {\n  constructor() { this.children = {}; this.isEnd = false; }\n}\nclass Trie {\n  constructor() { this.root = new TrieNode(); }\n  insert(word) {\n    let node = this.root;\n    for (const c of word) {\n      if (!node.children[c]) node.children[c] = new TrieNode();\n      node = node.children[c];\n    }\n    node.isEnd = true;\n  }\n  search(word) {\n    let node = this.root;\n    for (const c of word) {\n      if (!node.children[c]) return false;\n      node = node.children[c];\n    }\n    return node.isEnd;\n  }\n  startsWith(prefix) {\n    let node = this.root;\n    for (const c of prefix) {\n      if (!node.children[c]) return false;\n      node = node.children[c];\n    }\n    return true;\n  }\n}\n\nconst t = new Trie();\nt.insert('apple');\nconsole.log(t.search('apple'), t.search('app'), t.startsWith('app')); // true false true",
          tests: [
            {
              input: "const t=new Trie(); t.insert('a'); t.search('a')",
              expected: "true",
            },
            {
              input: "const t=new Trie(); t.insert('a'); t.search('b')",
              expected: "false",
            },
            {
              input: "const t=new Trie(); t.insert('abc'); t.startsWith('ab')",
              expected: "true",
            },
          ],
        },
        {
          kind: "recap",
          points: [
            "Trie: char → node map + isEnd flag.",
            "Insert/search/prefix: O(L) where L = word length.",
            "Space: O(total characters) worst case.",
          ],
        },
      ],
      sources: [
        { label: "Trie (VisuAlgo)", url: "https://visualgo.net/en/trie" },
      ],
      attribution: "Synthesis of Striver's A2Z tries section.",
    },
    {
      slug: "trie-problems",
      title: "Trie problems",
      sections: [
        {
          kind: "concept",
          title: "Word search II",
          body: "Build a trie of the dictionary, then DFS the board. At each cell, walk the trie; when isEnd, record the word. Prune trie nodes with no remaining children to avoid re-exploring. O(M·N·4·L) where L is max word length.",
        },
        {
          kind: "recap",
          points: ["Trie + board DFS for word search.", "Prune dead branches."],
        },
      ],
      sources: [
        {
          label: "Word search II (LeetCode)",
          url: "https://leetcode.com/problems/word-search-ii/",
        },
      ],
      attribution: "Synthesis of Striver's A2Z tries section.",
    },
  ],
  interviewByte: {
    shape: "Implement a trie with insert, search, and startsWith.",
    strongAnswer:
      "Node with children map + isEnd. O(L) per operation. Explain space trade-off.",
    trap: "Using an array of size 26 (wastes space for unicode) or forgetting isEnd.",
  },
  recap: [
    "Trie: prefix tree, O(L) ops.",
    "Use for autocomplete, spell-check, word search.",
  ],
  attribution: "Synthesis of Striver's A2Z tries section.",
};
