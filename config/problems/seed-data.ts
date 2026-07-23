import type { TestCase } from "@/lib/problem-data";

type ProblemSeed = {
  title: string;
  description: string;
  difficulty: string;
  category: string;
  tags: string[];
  starter_code: string;
  solution_code: string;
  test_cases: TestCase[];
};

export const problemsData: ProblemSeed[] = [
  {
    title: "Two Sum",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers that add up to \`target\`.

You may assume that each input has exactly one solution, and you may not use the same element twice.

**Example:**
\`\`\`
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9
\`\`\`

Constraints:
- 2 ≤ nums.length ≤ 10⁴
- -10⁹ ≤ nums[i] ≤ 10⁹
- -10⁹ ≤ target ≤ 10⁹
- Only one valid answer exists.`,
    difficulty: "easy",
    category: "Arrays & Hashing",
    tags: ["arrays", "hash-map"],
    starter_code: `function twoSum(nums, target) {
  // Your code here
}`,
    solution_code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    test_cases: [
      { input: "nums = [2,7,11,15], target = 9", expected: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", expected: "[1,2]" },
      { input: "nums = [3,3], target = 6", expected: "[0,1]" },
    ],
  },
  {
    title: "Reverse a String",
    description: `Write a function that reverses a string in-place.

Modify the input array \`s\` of characters directly. Do not allocate extra space for another array.

**Example:**
\`\`\`
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]
\`\`\`

Constraints:
- 1 ≤ s.length ≤ 10⁵
- s[i] is a printable ASCII character.`,
    difficulty: "easy",
    category: "Strings",
    tags: ["strings", "two-pointers"],
    starter_code: `function reverseString(s) {
  // Your code here
}`,
    solution_code: `function reverseString(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]];
    left++;
    right--;
  }
  return s;
}`,
    test_cases: [
      { input: "s = ['h','e','l','l','o']", expected: "['o','l','l','e','h']" },
      { input: "s = ['H','a','n','n','a','h']", expected: "['h','a','n','n','a','H']" },
    ],
  },
  {
    title: "Valid Parentheses",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\`, and \`']'\`, determine if the input string is valid.

A string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

**Example:**
\`\`\`
Input: s = "()[]{}"
Output: true

Input: s = "(]"
Output: false
\`\`\`

Constraints:
- 1 ≤ s.length ≤ 10⁴
- s consists of parentheses only.`,
    difficulty: "easy",
    category: "Stacks",
    tags: ["stack", "strings"],
    starter_code: `function isValid(s) {
  // Your code here
}`,
    solution_code: `function isValid(s) {
  const stack = [];
  const pairs = { '(': ')', '{': '}', '[': ']' };
  for (const char of s) {
    if (pairs[char]) {
      stack.push(pairs[char]);
    } else if (stack.pop() !== char) {
      return false;
    }
  }
  return stack.length === 0;
}`,
    test_cases: [
      { input: "s = '()'", expected: "true" },
      { input: "s = '()[]{}'", expected: "true" },
      { input: "s = '(]'", expected: "false" },
      { input: "s = '([)]'", expected: "false" },
    ],
  },
  {
    title: "Merge Two Sorted Lists",
    description: `Merge two sorted linked lists and return it as a sorted list.

Given the heads of two sorted linked lists \`list1\` and \`list2\`, merge them into one sorted list.

**Example:**
\`\`\`
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]
\`\`\`

Constraints:
- The number of nodes in both lists is in the range [0, 50].
- -100 ≤ Node.val ≤ 100
- Both lists are sorted in non-decreasing order.`,
    difficulty: "medium",
    category: "Linked Lists",
    tags: ["linked-list", "recursion"],
    starter_code: `function ListNode(val, next) {
  this.val = (val === undefined ? 0 : val);
  this.next = (next === undefined ? null : next);
}

function mergeTwoLists(list1, list2) {
  // Your code here
}`,
    solution_code: `function mergeTwoLists(list1, list2) {
  if (!list1) return list2;
  if (!list2) return list1;
  if (list1.val < list2.val) {
    list1.next = mergeTwoLists(list1.next, list2);
    return list1;
  } else {
    list2.next = mergeTwoLists(list1, list2.next);
    return list2;
  }
}`,
    test_cases: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", expected: "[1,1,2,3,4,4]" },
      { input: "list1 = [], list2 = []", expected: "[]" },
      { input: "list1 = [], list2 = [0]", expected: "[0]" },
    ],
  },
  {
    title: "Maximum Subarray (Kadane's Algorithm)",
    description: `Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

**Example:**
\`\`\`
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.
\`\`\`

Constraints:
- 1 ≤ nums.length ≤ 10⁵
- -10⁴ ≤ nums[i] ≤ 10⁴`,
    difficulty: "medium",
    category: "Dynamic Programming",
    tags: ["dynamic-programming", "arrays"],
    starter_code: `function maxSubArray(nums) {
  // Your code here
}`,
    solution_code: `function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`,
    test_cases: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", expected: "6" },
      { input: "nums = [1]", expected: "1" },
      { input: "nums = [5,4,-1,7,8]", expected: "23" },
    ],
  },
  {
    title: "Binary Search",
    description: `Given an array of integers \`nums\` sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, return its index. Otherwise, return \`-1\`.

**Example:**
\`\`\`
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
\`\`\`

Constraints:
- 1 ≤ nums.length ≤ 10⁴
- -10⁴ < nums[i], target < 10⁴
- All integers in nums are unique.
- nums is sorted in ascending order.`,
    difficulty: "easy",
    category: "Binary Search",
    tags: ["binary-search", "arrays"],
    starter_code: `function search(nums, target) {
  // Your code here
}`,
    solution_code: `function search(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    test_cases: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", expected: "4" },
      { input: "nums = [-1,0,3,5,9,12], target = 2", expected: "-1" },
    ],
  },
  {
    title: "Climbing Stairs",
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

**Example:**
\`\`\`
Input: n = 3
Output: 3
Explanation: (1+1+1, 1+2, 2+1)
\`\`\`

Constraints:
- 1 ≤ n ≤ 45`,
    difficulty: "easy",
    category: "Dynamic Programming",
    tags: ["dynamic-programming", "fibonacci"],
    starter_code: `function climbStairs(n) {
  // Your code here
}`,
    solution_code: `function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}`,
    test_cases: [
      { input: "n = 2", expected: "2" },
      { input: "n = 3", expected: "3" },
      { input: "n = 5", expected: "8" },
    ],
  },
  {
    title: "Invert Binary Tree",
    description: `Given the \`root\` of a binary tree, invert the tree (swap every left and right child) and return its root.

**Example:**
\`\`\`
Input: root = [4,2,7,1,3,6,9]
Output: [4,7,2,9,6,3,1]
\`\`\`

Constraints:
- The number of nodes in the tree is in the range [0, 100].
- -100 ≤ Node.val ≤ 100`,
    difficulty: "easy",
    category: "Trees",
    tags: ["tree", "recursion", "dfs"],
    starter_code: `function TreeNode(val, left, right) {
  this.val = (val === undefined ? 0 : val);
  this.left = (left === undefined ? null : left);
  this.right = (right === undefined ? null : right);
}

function invertTree(root) {
  // Your code here
}`,
    solution_code: `function invertTree(root) {
  if (!root) return null;
  const temp = root.left;
  root.left = invertTree(root.right);
  root.right = invertTree(temp);
  return root;
}`,
    test_cases: [
      { input: "root = [4,2,7,1,3,6,9]", expected: "[4,7,2,9,6,3,1]" },
      { input: "root = [2,1,3]", expected: "[2,3,1]" },
      { input: "root = []", expected: "[]" },
    ],
  },
  {
    title: "LRU Cache",
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the \`LRUCache\` class:
- \`LRUCache(capacity)\` Initialize with positive size capacity.
- \`get(key)\` Return value or -1 if not exists.
- \`put(key, value)\` Update value if key exists. Otherwise add key-value pair. If the number of keys exceeds capacity, evict the least recently used key.

**Example:**
\`\`\`
Input:
["LRUCache","put","put","get","put","get","put","get","get","get"]
[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]
Output: [null,null,null,1,null,-1,null,-1,3,4]
\`\`\`

Constraints:
- 1 ≤ capacity ≤ 3000
- 0 ≤ key ≤ 10⁴
- 0 ≤ value ≤ 10⁵`,
    difficulty: "hard",
    category: "Design",
    tags: ["design", "hash-map", "linked-list"],
    starter_code: `class LRUCache {
  constructor(capacity) {
    // Your code here
  }

  get(key) {
    // Your code here
  }

  put(key, value) {
    // Your code here
  }
}`,
    solution_code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      this.cache.delete(this.cache.keys().next().value);
    }
    this.cache.set(key, value);
  }
}`,
    test_cases: [
      { input: "LRUCache(2) → put(1,1), put(2,2), get(1)", expected: "1" },
      { input: "put(3,3) → get(2)", expected: "-1" },
      { input: "put(4,4) → get(1), get(3), get(4)", expected: "-1,3,4" },
    ],
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.

**Example:**
\`\`\`
Input: s = "abcabcbb"
Output: 3
Explanation: "abc" with length 3.
\`\`\`

Constraints:
- 0 ≤ s.length ≤ 5 × 10⁴
- s consists of English letters, digits, symbols, and spaces.`,
    difficulty: "medium",
    category: "Sliding Window",
    tags: ["sliding-window", "strings", "hash-map"],
    starter_code: `function lengthOfLongestSubstring(s) {
  // Your code here
}`,
    solution_code: `function lengthOfLongestSubstring(s) {
  const seen = new Map();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (seen.has(char) && seen.get(char) >= left) {
      left = seen.get(char) + 1;
    }
    seen.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
    test_cases: [
      { input: "s = 'abcabcbb'", expected: "3" },
      { input: "s = 'bbbbb'", expected: "1" },
      { input: "s = 'pwwkew'", expected: "3" },
    ],
  },
];
