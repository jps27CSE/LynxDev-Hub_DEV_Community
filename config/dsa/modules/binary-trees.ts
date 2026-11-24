import type { DsaModule } from "../types";

export const binaryTreesModule: DsaModule = {
  slug: "binary-trees",
  order: 5,
  part: 2,
  partTitle: "Patterns",
  title: "Binary Trees",
  description:
    "Tree representation, traversals, height, diameter, and lowest common ancestor.",
  kind: "lesson+task",
  story:
    "Hierarchical data (org charts, file systems, DOM) is a tree. Knowing the traversals is knowing how to walk any of them.",
  chapters: [
    { slug: "representation", title: "Representation", lessonSlug: "representation" },
    { slug: "traversals", title: "Traversals", lessonSlug: "traversals" },
    { slug: "height-diameter", title: "Height & diameter", lessonSlug: "height-and-diameter" },
  ],
  lessons: [
    {
      slug: "representation",
      title: "Tree representation",
      sections: [
        {
          kind: "concept",
          title: "Node and tree",
          body: "A binary tree node holds a value plus left and right child pointers (possibly null). The tree is defined by its root. Unlike arrays, there is no index — you reach nodes by following pointers.",
        },
        {
          kind: "code",
          title: "Node definition",
          language: "javascript",
          starter:
            "class TreeNode {\n  constructor(val, left = null, right = null) {\n    this.val = val;\n    this.left = left;\n    this.right = right;\n  }\n}\n\nconst root = new TreeNode(1, new TreeNode(2), new TreeNode(3));\nconsole.log(root.val, root.left.val, root.right.val);",
          solution:
            "class TreeNode {\n  constructor(val, left = null, right = null) {\n    this.val = val;\n    this.left = left;\n    this.right = right;\n  }\n}\n\nconst root = new TreeNode(1, new TreeNode(2), new TreeNode(3));\nconsole.log(root.val, root.left.val, root.right.val); // 1 2 3",
          tests: [{ input: "new TreeNode(5).val", expected: "5" }],
        },
        {
          kind: "recap",
          points: [
            "A node is value + left + right.",
            "The tree is its root; null means no child.",
            "Traversal visits every node exactly once: O(n).",
          ],
        },
      ],
      sources: [{ label: "Striver's A2Z DSA Sheet", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/" }],
      attribution: "Synthesis of Striver's A2Z binary trees section.",
    },
    {
      slug: "traversals",
      title: "Traversals",
      sections: [
        {
          kind: "concept",
          title: "Pre / in / post / level order",
          body: "Pre-order: root, left, right. In-order: left, root, right (yields sorted order for a BST). Post-order: left, right, root. Level order: BFS by depth. All are O(n) time and O(h) space (h = height) for the recursive ones; level order is O(n) space.",
        },
        {
          kind: "visual",
          title: "In-order traversal",
          frames: [
            {
              id: "f1",
              kind: "tree",
              caption: "Tree: root 2, left 1, right 3. In-order visits left, root, right.",
              state: {
                kind: "tree",
                nodes: [
                  { id: "2", value: 2, left: "1", right: "3" },
                  { id: "1", value: 1 },
                  { id: "3", value: 3 },
                ],
                root: "2",
              },
            },
            {
              id: "f2",
              kind: "tree",
              caption: "Visit left subtree first: node 1.",
              state: {
                kind: "tree",
                nodes: [
                  { id: "2", value: 2, left: "1", right: "3" },
                  { id: "1", value: 1 },
                  { id: "3", value: 3 },
                ],
                root: "2",
                highlight: ["1"],
              },
            },
            {
              id: "f3",
              kind: "tree",
              caption: "Then the root: node 2.",
              state: {
                kind: "tree",
                nodes: [
                  { id: "2", value: 2, left: "1", right: "3" },
                  { id: "1", value: 1 },
                  { id: "3", value: 3 },
                ],
                root: "2",
                highlight: ["1", "2"],
              },
            },
            {
              id: "f4",
              kind: "tree",
              caption: "Then the right subtree: node 3. Result: [1, 2, 3].",
              state: {
                kind: "tree",
                nodes: [
                  { id: "2", value: 2, left: "1", right: "3" },
                  { id: "1", value: 1 },
                  { id: "3", value: 3 },
                ],
                root: "2",
                highlight: ["1", "2", "3"],
              },
            },
          ],
        },
        {
          kind: "code",
          title: "In-order (recursive)",
          language: "javascript",
          starter:
            "class TreeNode {\n  constructor(val, left = null, right = null) {\n    this.val = val; this.left = left; this.right = right;\n  }\n}\nfunction inorder(root, out = []) {\n  // fill out in in-order\n  return out;\n}\n\nconst root = new TreeNode(2, new TreeNode(1), new TreeNode(3));\nconsole.log(inorder(root));",
          solution:
            "class TreeNode {\n  constructor(val, left = null, right = null) {\n    this.val = val; this.left = left; this.right = right;\n  }\n}\nfunction inorder(root, out = []) {\n  if (!root) return out;\n  inorder(root.left, out);\n  out.push(root.val);\n  inorder(root.right, out);\n  return out;\n}\n\nconst root = new TreeNode(2, new TreeNode(1), new TreeNode(3));\nconsole.log(inorder(root)); // [1, 2, 3]",
          tests: [
            { input: "inorder(new TreeNode(1))", expected: "[1]" },
            { input: "inorder(null)", expected: "[]" },
          ],
        },
        {
          kind: "recap",
          points: [
            "In-order on a BST yields sorted values.",
            "All traversals are O(n) time.",
            "Recursive traversals cost O(h) stack space.",
          ],
        },
      ],
      sources: [{ label: "Striver's A2Z DSA Sheet", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/" }],
      attribution: "Synthesis of Striver's A2Z binary trees section.",
    },
    {
      slug: "height-and-diameter",
      title: "Height & diameter",
      sections: [
        {
          kind: "concept",
          title: "Height",
          body: "Height of a node = 1 + max(height(left), height(right)), with height(null) = 0 (or -1 depending on convention — pick one and be consistent). Diameter = longest path between any two nodes, possibly through the root: max(leftHeight + rightHeight) over all nodes.",
        },
        {
          kind: "code",
          title: "Height and diameter",
          language: "javascript",
          starter:
            "class TreeNode {\n  constructor(val, left = null, right = null) {\n    this.val = val; this.left = left; this.right = right;\n  }\n}\nfunction height(root) {\n  return 0;\n}\nfunction diameter(root) {\n  return 0;\n}\n\nconst root = new TreeNode(1, new TreeNode(2, new TreeNode(4), new TreeNode(5)), new TreeNode(3));\nconsole.log(height(root));\nconsole.log(diameter(root));",
          solution:
            "class TreeNode {\n  constructor(val, left = null, right = null) {\n    this.val = val; this.left = left; this.right = right;\n  }\n}\nfunction height(root) {\n  if (!root) return 0;\n  return 1 + Math.max(height(root.left), height(root.right));\n}\nlet best = 0;\nfunction diameter(root) {\n  if (!root) return 0;\n  const lh = height(root.left);\n  const rh = height(root.right);\n  best = Math.max(best, lh + rh);\n  diameter(root.left);\n  diameter(root.right);\n  return best;\n}\n\nconst root = new TreeNode(1, new TreeNode(2, new TreeNode(4), new TreeNode(5)), new TreeNode(3));\nconsole.log(height(root)); // 3\nconsole.log(diameter(root)); // 3 (path 4-2-1-3)",
          tests: [
            { input: "height(null)", expected: "0" },
            { input: "height(new TreeNode(1))", expected: "1" },
          ],
        },
        {
          kind: "recap",
          points: [
            "Height: 1 + max(left, right), null = 0.",
            "Diameter: max(leftHeight + rightHeight) over all nodes.",
            "A single DFS can compute both in O(n).",
          ],
        },
      ],
      sources: [{ label: "Striver's A2Z DSA Sheet", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/" }],
      attribution: "Synthesis of Striver's A2Z binary trees section.",
    },
  ],
  task: {
    brief:
      "In-order traversal must push the root value between the left and right recursive calls. The start code pushes before recursing left (that is pre-order). Fix the order.",
    startState: {
      data: { order: "root-left-right" },
      completedSteps: [],
      criteriaMet: [],
      attempts: 0,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    solutionState: {
      data: { order: "left-root-right" },
      completedSteps: ["fix-order"],
      criteriaMet: ["inorder-correct"],
      attempts: 1,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    steps: [
      {
        id: "fix-order",
        title: "Left, root, right",
        brief: "Recurse left first, then push root.val, then recurse right.",
        hint: "In-order = left, root, right. Pre-order = root, left, right.",
        reveal: "inorder(root.left); out.push(root.val); inorder(root.right);",
        check: (s) => {
          const d = s.data as { order: string };
          return {
            passed: d.order === "left-root-right",
            progress: d.order === "left-root-right" ? "1/1" : "0/1",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "inorder-correct",
        label: "traversal order is left, root, right",
        required: true,
        assert: (s) => {
          const d = s.data as { order: string };
          return d.order === "left-root-right";
        },
        explain: "In-order must visit left before root to yield sorted order on a BST.",
      },
    ],
  },
  interviewByte: {
    shape: "What does in-order traversal yield on a BST?",
    strongAnswer:
      "The values in sorted (ascending) order. State the three traversals and their use cases.",
    trap: "Confusing pre-order and in-order, or claiming level order is recursive.",
  },
  recap: [
    "Node = value + left + right.",
    "In-order: left, root, right (sorted on BST).",
    "Height O(n); diameter = max(leftH + rightH).",
  ],
  attribution: "Synthesis of Striver's A2Z binary trees section.",
};
