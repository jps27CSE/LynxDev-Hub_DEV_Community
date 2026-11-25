import type { DsaModule } from "../types";

export const binarySearchTreesModule: DsaModule = {
  slug: "binary-search-trees",
  order: 12,
  part: 2,
  partTitle: "Patterns",
  title: "Binary Search Trees",
  description: "BST property, insert/delete/search, validation, LCA.",
  kind: "lesson",
  story:
    "A BST gives O(log n) search/insert/delete when balanced — the bridge between arrays and hash maps.",
  chapters: [
    { slug: "bst-property", title: "BST property", lessonSlug: "bst-property" },
    { slug: "operations", title: "Operations", lessonSlug: "operations" },
    { slug: "problems", title: "BST problems", lessonSlug: "bst-problems" },
  ],
  lessons: [
    {
      slug: "bst-property",
      title: "BST property",
      sections: [
        {
          kind: "concept",
          title: "The property",
          body: "For every node, all values in the left subtree are smaller and all in the right subtree are larger. In-order traversal yields sorted order. Search/insert/delete are O(h) where h is height — O(log n) if balanced, O(n) if skewed.",
        },
        {
          kind: "code",
          title: "Validate BST",
          language: "javascript",
          starter:
            "class TreeNode { constructor(val, left=null, right=null){this.val=val;this.left=left;this.right=right;} }\nfunction isValidBST(root) {\n  // check BST property\n  return true;\n}\n\nconst root = new TreeNode(2, new TreeNode(1), new TreeNode(3));\nconsole.log(isValidBST(root));",
          solution:
            "class TreeNode { constructor(val, left=null, right=null){this.val=val;this.left=left;this.right=right;} }\nfunction isValidBST(root) {\n  function helper(node, lo, hi) {\n    if (!node) return true;\n    if (node.val <= lo || node.val >= hi) return false;\n    return helper(node.left, lo, node.val) && helper(node.right, node.val, hi);\n  }\n  return helper(root, -Infinity, Infinity);\n}\n\nconst root = new TreeNode(2, new TreeNode(1), new TreeNode(3));\nconsole.log(isValidBST(root)); // true",
          tests: [
            {
              input: "isValidBST(new TreeNode(1, new TreeNode(2)))",
              expected: "false",
            },
          ],
        },
        {
          kind: "recap",
          points: [
            "Left < node < right for every node.",
            "In-order yields sorted order.",
            "O(h) operations; h = height.",
          ],
        },
      ],
      sources: [
        { label: "BST (VisuAlgo)", url: "https://visualgo.net/en/bst" },
      ],
      attribution: "Synthesis of Striver's A2Z BST section.",
    },
    {
      slug: "operations",
      title: "Insert, delete, search",
      sections: [
        {
          kind: "concept",
          title: "Insert",
          body: "Search for the key; when you reach null, attach the new node there. O(h). Delete: leaf → remove; one child → replace; two children → replace with in-order successor (min of right subtree) then delete successor.",
        },
        {
          kind: "code",
          title: "Insert into BST",
          language: "javascript",
          starter:
            "class TreeNode { constructor(val, left=null, right=null){this.val=val;this.left=left;this.right=right;} }\nfunction insert(root, val) {\n  // insert val, return root\n  return root;\n}\n\nconst root = new TreeNode(4, new TreeNode(2), new TreeNode(7));\nconsole.log(insert(root, 5).right.left.val);",
          solution:
            "class TreeNode { constructor(val, left=null, right=null){this.val=val;this.left=left;this.right=right;} }\nfunction insert(root, val) {\n  if (!root) return new TreeNode(val);\n  if (val < root.val) root.left = insert(root.left, val);\n  else if (val > root.val) root.right = insert(root.right, val);\n  return root;\n}\n\nconst root = new TreeNode(4, new TreeNode(2), new TreeNode(7));\nconsole.log(insert(root, 5).right.left.val); // 5",
          tests: [{ input: "insert(null, 5).val", expected: "5" }],
        },
        {
          kind: "recap",
          points: [
            "Insert: search then attach at null.",
            "Delete two-child: replace with in-order successor.",
            "All O(h).",
          ],
        },
      ],
      sources: [
        { label: "BST (VisuAlgo)", url: "https://visualgo.net/en/bst" },
      ],
      attribution: "Synthesis of Striver's A2Z BST section.",
    },
    {
      slug: "bst-problems",
      title: "BST problems",
      sections: [
        {
          kind: "concept",
          title: "LCA in BST",
          body: "Use the property: if both targets are smaller than the node, go left; if both larger, go right; otherwise the node is the LCA. O(h).",
        },
        {
          kind: "code",
          title: "LCA in BST",
          language: "javascript",
          starter:
            "class TreeNode { constructor(val, left=null, right=null){this.val=val;this.left=left;this.right=right;} }\nfunction lca(root, p, q) {\n  return null;\n}\n\nconst root = new TreeNode(6, new TreeNode(2, new TreeNode(0), new TreeNode(4)), new TreeNode(8));\nconsole.log(lca(root, 2, 8).val);",
          solution:
            "class TreeNode { constructor(val, left=null, right=null){this.val=val;this.left=left;this.right=right;} }\nfunction lca(root, p, q) {\n  let cur = root;\n  while (cur) {\n    if (p < cur.val && q < cur.val) cur = cur.left;\n    else if (p > cur.val && q > cur.val) cur = cur.right;\n    else return cur;\n  }\n  return null;\n}\n\nconst root = new TreeNode(6, new TreeNode(2, new TreeNode(0), new TreeNode(4)), new TreeNode(8));\nconsole.log(lca(root, 2, 8).val); // 6",
          tests: [
            {
              input:
                "lca(new TreeNode(2, new TreeNode(1), new TreeNode(3)), 1, 3).val",
              expected: "2",
            },
          ],
        },
        {
          kind: "recap",
          points: [
            "BST LCA uses the ordering property.",
            "O(h) with no extra space.",
          ],
        },
      ],
      sources: [
        { label: "BST (VisuAlgo)", url: "https://visualgo.net/en/bst" },
      ],
      attribution: "Synthesis of Striver's A2Z BST section.",
    },
  ],
  interviewByte: {
    shape: "Validate a binary search tree.",
    strongAnswer:
      "Recursive with a (min, max) range; O(n) time, O(h) space. Watch for the strict inequality.",
    trap: "Only checking immediate children instead of the whole subtree range.",
  },
  recap: [
    "BST: left < node < right.",
    "O(h) search/insert/delete.",
    "Delete two-child uses in-order successor.",
  ],
  attribution: "Synthesis of Striver's A2Z BST section.",
};
