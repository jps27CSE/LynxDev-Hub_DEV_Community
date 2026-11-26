import type { DsaModule } from "../types";

export const foundationsModule: DsaModule = {
  slug: "foundations",
  order: 1,
  part: 0,
  partTitle: "Foundations",
  title: "Foundations of DSA",
  description:
    "What data structures and algorithms are, why they matter, and how to measure their cost.",
  kind: "lesson",
  story:
    "You can write code that works on day one. The question is whether it still works when the input grows 1000x.",
  chapters: [
    { slug: "what-is-dsa", title: "What is DSA?", lessonSlug: "what-is-dsa" },
    {
      slug: "measuring-cost",
      title: "Measuring cost",
      lessonSlug: "measuring-cost",
    },
    {
      slug: "recursion-basics",
      title: "Recursion basics",
      lessonSlug: "recursion-basics",
    },
  ],
  lessons: [
    {
      slug: "what-is-dsa",
      title: "What is DSA?",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>Your app has a <code>users</code> table with ten rows. A request asks for the user whose email is <code>ada@example.com</code>, so you loop over the rows and compare the email. On ten rows that is instant.</p>
            <p>Now the table has one million rows. The same loop still works — but it may compare one million emails before it finds the last one, or discover the address is not there at all. Nothing in the loop got slower. There is simply more work to do.</p>
            <p>The fix is not a faster loop. It is a different structure: an index that maps an email to a row, so the lookup does not depend on how many rows exist. That is the subject of this module.</p>
          `,
        },
        {
          kind: "concept",
          title: "A data structure is a contract",
          body: `
            <p>A <strong>data structure</strong> is not just a way to store values. It is a set of promises about which operations are cheap and which invariants stay true.</p>
            <ul>
              <li>An array promises <code>O(1)</code> access by position, because the address of index <code>i</code> can be computed. It does not promise fast search by value.</li>
              <li>A sorted array promises that binary search works, because every element to the left of a position is smaller. The order is an invariant the structure maintains.</li>
              <li>A hash map promises <code>O(1)</code> average lookup by key. It does not promise that keys stay in order.</li>
              <li>A balanced tree promises <code>O(log n)</code> lookup <em>and</em> ordered traversal. It pays for that with extra pointers and rotations.</li>
            </ul>
            <p>An <strong>algorithm</strong> is a finite procedure that exploits one of those promises. Binary search is only correct because the array is sorted; the algorithm cannot create the invariant it depends on. This is why "which data structure?" and "which algorithm?" are one question, not two.</p>
          `,
        },
        {
          kind: "concept",
          title: "The same data answers different questions",
          body: `
            <p>Consider the same set of one million user ids, stored three ways.</p>
            <ul>
              <li><strong>Unsorted array.</strong> "Does id 7 exist?" is <code>O(n)</code> — check every cell. "What is the smallest id?" is also <code>O(n)</code>.</li>
              <li><strong>Hash set.</strong> "Does id 7 exist?" is <code>O(1)</code> average. "What is the smallest id?" is <code>O(n)</code>, because the set has no order.</li>
              <li><strong>Sorted array or balanced tree.</strong> "Does id 7 exist?" is <code>O(log n)</code>. "What is the smallest id?" is <code>O(1)</code> for the first array cell, or <code>O(log n)</code> for the leftmost tree node.</li>
            </ul>
            <p>None of these is "best". Each makes a different question cheap, and you pay in memory, ordering or update cost. A hash set is excellent when the question is "is this here?" and useless when the question is "what is in the range 100 to 200?"</p>
            <p>The engineering move is to write down the operations your feature actually performs, then pick the structure whose promises cover the frequent ones. Choosing by habit — "arrays are simple" or "maps are fast" — is guessing.</p>
          `,
        },
        {
          kind: "concept",
          title: "A worked choice",
          body: `
            <p>You are building a "recently viewed" rail. The requirements are: add a view, return the last 20 items for a user, do not show the same item twice in a row, and expire old entries.</p>
            <ul>
              <li>An array handles order, but removing a duplicate in the middle is <code>O(n)</code> and checking for one is <code>O(n)</code>.</li>
              <li>A hash set makes the duplicate check <code>O(1)</code>, but it cannot tell you the 20 most recent items.</li>
              <li>A hash map from item id to a linked-list node, plus a doubly linked list in recency order, gives <code>O(1)</code> move-to-front, <code>O(1)</code> duplicate checks, and an <code>O(20)</code> read of the tail. That is the core of an LRU cache.</li>
            </ul>
            <p>Notice that the answer is a combination. Real systems rarely pick one textbook structure; they compose two so that each covers the other's weakness. The interview question "design an LRU cache" is really "can you name the two operations that must both be cheap?"</p>
          `,
        },
        {
          kind: "concept",
          title: "Why a faster machine cannot save you",
          body: `
            <p>Suppose a linear scan does one unit of work per element, and a hash lookup does ten units. At <code>n = 10</code>, the scan does 10 units and the hash does 10 — a tie. At <code>n = 1,000,000</code>, the scan does 1,000,000 units and the hash still does 10.</p>
            <p>A machine twice as fast turns 1,000,000 into 500,000. It does not turn a line into a constant. That is why the rest of this module measures <em>growth</em> instead of milliseconds. A benchmark tells you how one input behaved on one machine. A growth class tells you what happens when the input gets bigger, which is the only thing that separates code that survives production from code that works in a demo.</p>
            <p>Constants still matter at small sizes: a hash lookup with a bad hash function can be slower than a scan of ten items. The point is not that constants are irrelevant. The point is that they are the second question. The first is the shape.</p>
          `,
        },
        {
          kind: "your_turn",
          prompt:
            "List the three operations your current project performs most often on a collection. For each, name the structure that makes it cheapest and the property you would give up (order, memory, simple code).",
        },
        {
          kind: "recap",
          points: [
            "A data structure is a contract: which operations are cheap, and which invariants it maintains.",
            "An algorithm is only correct if the structure provides the invariant it assumes — binary search needs sorted data.",
            "The same values stored three ways answer three different questions cheaply.",
            "Growth beats constant factors at scale; measure the shape before optimizing the machine.",
          ],
        },
      ],
      sources: [
        {
          label: "Open Data Structures, ch. 1 — Introduction",
          url: "https://opendatastructures.org/ods-java/1_Introduction.html",
        },
        {
          label: "Tech Interview Handbook — study cheatsheet",
          url: "https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/",
        },
      ],
      attribution:
        "Synthesis of Open Data Structures ch. 1 (Morin) and the Tech Interview Handbook's study cheatsheet.",
    },
    {
      slug: "measuring-cost",
      title: "Measuring cost (Big-O)",
      sections: [
        {
          kind: "concept",
          title: "What Big-O actually claims",
          body: `
            <p>Big-O is a statement about growth, not a stopwatch. We say <code>f(n) = O(g(n))</code> when there exist positive constants <code>c</code> and <code>n₀</code> such that <code>f(n) ≤ c · g(n)</code> for every <code>n ≥ n₀</code>. In plain words: past some input size, the work is bounded by a constant multiple of <code>g</code>.</p>
            <p>Two consequences follow. First, constants and lower-order terms are dropped: <code>3n² + 40n + 7</code> is <code>O(n²)</code>, because for large <code>n</code> the <code>n²</code> term dominates. Second, Big-O is an <em>upper bound</em>. Saying a sort is <code>O(n²)</code> does not mean it always takes quadratic time; it means it never grows faster than quadratic in the case you are describing.</p>
            <p>The related symbols matter in an interview. <strong>Big-Ω</strong> is a lower bound, <strong>Big-Θ</strong> is both an upper and a lower bound (a tight bound), and <strong>Big-O</strong> is the upper bound. People usually say "O" when they mean "Θ". Be precise when the distinction changes the answer, and do not be surprised when the interviewer is not.</p>
          `,
        },
        {
          kind: "concept",
          title: "How to count without running it",
          body: `
            <p>You do not need a timer. You need to count how many times the dominant operation runs as a function of <code>n</code>.</p>
            <ul>
              <li><strong>One loop over the input:</strong> <code>n</code> iterations → <code>O(n)</code>.</li>
              <li><strong>Nested loop, both over the input:</strong> <code>n · n = n²</code> → <code>O(n²)</code>. If the inner loop starts at the outer index, it is <code>n(n−1)/2</code>, which is still <code>Θ(n²)</code> after dropping the constant <code>1/2</code>.</li>
              <li><strong>Loop that halves:</strong> <code>n → n/2 → n/4 → … → 1</code> takes <code>log₂ n</code> steps → <code>O(log n)</code>.</li>
              <li><strong>Two loops one after the other:</strong> <code>n + n = 2n</code> → <code>O(n)</code>. Sequential work adds; nested work multiplies.</li>
              <li><strong>Loop over <code>n</code>, with an <code>O(log n)</code> operation inside:</strong> <code>n log n</code> → <code>O(n log n)</code>.</li>
            </ul>
            <p>A worked comparison: for <code>n = 1,000</code>, a linear scan performs 1,000 comparisons. Binary search performs about 10, because <code>2¹⁰ = 1,024</code>. For <code>n = 1,000,000</code>, the scan performs 1,000,000 and binary search about 20. The gap is not a faster CPU; it is the difference between adding one step per element and adding one step per doubling of the input.</p>
          `,
        },
        {
          kind: "concept",
          title: "The classes, with arithmetic",
          body: `
            <p>These are the classes you will meet in almost every interview. The numbers beside them are arithmetic at <code>n = 1,000</code>, not benchmark results.</p>
            <ul>
              <li><code>O(1)</code> — 1 step. Array index, hash lookup (average), stack push.</li>
              <li><code>O(log n)</code> — about 10 steps. Binary search, balanced-tree lookup.</li>
              <li><code>O(n)</code> — 1,000 steps. One pass, linear search, counting frequencies.</li>
              <li><code>O(n log n)</code> — about 10,000 steps. Merge sort, heap sort, comparison sorting in general.</li>
              <li><code>O(n²)</code> — 1,000,000 steps. Nested loops, bubble/selection/insertion sort.</li>
              <li><code>O(2ⁿ)</code> — about 10³⁰¹ steps. Every subset; brute-force knapsack.</li>
              <li><code>O(n!)</code> — about 10²⁵⁶⁷ steps. Every ordering; brute-force travelling salesperson.</li>
            </ul>
            <p>The last two are not "slow". They are unusable beyond roughly <code>n = 20</code> and <code>n = 12</code> respectively, no matter how fast the machine is. When a problem's constraints say <code>n ≤ 20</code>, that is often a hint that an exponential solution is intended. When they say <code>n ≤ 200,000</code>, an <code>O(n²)</code> solution is not.</p>
            <p>Constants are real. At <code>n = 10</code>, an <code>O(n²)</code> loop with a tiny body can beat an <code>O(n log n)</code> sort with a large constant. That is why "use the asymptotically better algorithm" is a rule of thumb, not a law. Profile when the input is small or the constant is suspicious; reason about growth when the input is large.</p>
          `,
        },
        {
          kind: "concept",
          title: "Space, and the three cases",
          body: `
            <p>Time is only half the answer. <strong>Auxiliary space</strong> is the extra memory an algorithm uses beyond its input. A merge sort needs an <code>O(n)</code> temporary array; an in-place quicksort needs <code>O(log n)</code> stack frames on average. Recursion's space cost is its depth, even when it allocates nothing explicit.</p>
            <p>Best, average and worst case answer different questions. Linear search is <code>O(1)</code> best (the first element matches) and <code>O(n)</code> worst (the last, or absent). Quicksort is <code>O(n log n)</code> average and <code>O(n²)</code> worst when the pivot is always the smallest or largest. A hash map is <code>O(1)</code> average and <code>O(n)</code> worst when every key collides. State which case you mean; "it's O(n)" without a case is incomplete.</p>
            <p><strong>Amortised</strong> cost is the average per operation over a sequence. A dynamic array's <code>push</code> is <code>O(1)</code> amortised: most pushes are constant, and the occasional resize copies <code>n</code> elements, but the copy cost spread over the pushes since the last resize is constant. That is different from average case over random inputs; amortised is a guarantee about a sequence of operations.</p>
          `,
        },
        {
          kind: "code",
          title: "Counting operations",
          language: "javascript",
          starter:
            "function countPairs(arr) {\n  let count = 0;\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = i + 1; j < arr.length; j++) {\n      count++;\n    }\n  }\n  return count;\n}\n\nconsole.log(countPairs([1, 2, 3, 4]));",
          solution:
            "function countPairs(arr) {\n  let count = 0;\n  // The inner loop runs n - 1 - i times, so the total is\n  // (n-1) + (n-2) + ... + 1 = n(n-1)/2. Drop the 1/2: O(n^2).\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = i + 1; j < arr.length; j++) {\n      count++;\n    }\n  }\n  return count;\n}\n\nconsole.log(countPairs([1, 2, 3, 4])); // 6 = 4 choose 2",
          tests: [
            { input: "countPairs([1,2,3])", expected: "3" },
            { input: "countPairs([])", expected: "0" },
            {
              input: "countPairs(Array.from({ length: 100 }, (_, i) => i))",
              expected: "4950",
            },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "Take a function you wrote last week. Count its loops and write down its Big-O. Then find the input size at which a quadratic version would exceed one second on a machine doing 10⁸ simple operations per second. This is arithmetic, not a benchmark.",
        },
        {
          kind: "recap",
          points: [
            "Big-O bounds growth: drop constants and lower-order terms, and say which case you mean.",
            "Sequential work adds; nested work multiplies; halving the input gives a logarithm.",
            "State both time and space, including recursion depth.",
            "Know the classes and the input sizes where exponential and factorial solutions stop being usable.",
          ],
        },
      ],
      sources: [
        {
          label: "Princeton Algorithms §1.4 — Analysis of Algorithms",
          url: "https://algs4.cs.princeton.edu/14analysis/",
        },
        {
          label: "Big-O Cheat Sheet",
          url: "https://www.bigocheatsheet.com/",
        },
      ],
      attribution:
        "Synthesis of Princeton Algorithms §1.4 (Sedgewick/Wayne) and the Big-O Cheat Sheet; the arithmetic is our own.",
    },
    {
      slug: "recursion-basics",
      title: "Recursion basics",
      sections: [
        {
          kind: "concept",
          title: "The shape of a recursive function",
          body: `
            <p>A recursive function solves a problem by calling itself on a smaller instance of the same problem. Every correct recursive function has two parts:</p>
            <ul>
              <li><strong>A base case</strong> that answers the smallest instance directly, without another call.</li>
              <li><strong>A recursive case</strong> that makes the problem smaller, calls the function, and combines the result.</li>
            </ul>
            <p>For factorial, the base case is <code>factorial(0) = 1</code> (or <code>factorial(1) = 1</code>), and the recursive case is <code>factorial(n) = n * factorial(n - 1)</code>. For a tree, the base case is an empty node, and the recursive case visits the children.</p>
            <p>The mental trap is trying to trace every call at once. Do not. Assume the smaller call returns the correct answer — the <em>recursive leap of faith</em> — and check only that combining it with the current value is correct. The proof that the assumption is valid is induction, and the next section makes that concrete.</p>
            <p>The same two parts appear when the data is a list. To sum a linked list, the base case is an empty list, which sums to 0; the recursive case is the head's value plus the sum of the rest. The measure is the number of remaining nodes, and each call removes one. This is why recursion feels natural on trees and lists: their definition is already recursive — a tree is a value plus zero or more smaller trees.</p>
          `,
        },
        {
          kind: "concept",
          title: "The call stack, mechanically",
          body: `
            <p>When a function calls another, the runtime pushes a <strong>frame</strong> onto the call stack. The frame holds the arguments, the local variables and the point to return to. A recursive call is no different: each level gets its own frame, with its own <code>n</code>.</p>
            <p>Trace <code>factorial(4)</code>:</p>
            <ol>
              <li><code>factorial(4)</code> waits for <code>factorial(3)</code>, holding <code>4</code>.</li>
              <li><code>factorial(3)</code> waits for <code>factorial(2)</code>, holding <code>3</code>.</li>
              <li><code>factorial(2)</code> waits for <code>factorial(1)</code>, holding <code>2</code>.</li>
              <li><code>factorial(1)</code> hits the base case and returns <code>1</code>.</li>
              <li>The stack unwinds: <code>2 * 1 = 2</code>, then <code>3 * 2 = 6</code>, then <code>4 * 6 = 24</code>.</li>
            </ol>
            <p>At the deepest point there are four frames alive. That is why recursion has a space cost even when it allocates no arrays: the depth <em>is</em> the memory. In JavaScript, V8 throws <code>RangeError: Maximum call stack size exceeded</code> somewhere around ten thousand frames, depending on frame size. A recursion of depth <code>10⁶</code> will not finish, no matter how correct the logic is.</p>
          `,
        },
        {
          kind: "concept",
          title: "Why it works: a decreasing measure",
          body: `
            <p>Two obligations must hold for a recursive function to terminate and be correct.</p>
            <ol>
              <li><strong>The base case is correct.</strong> It must return the right answer for the smallest instance, not a placeholder.</li>
              <li><strong>Every recursive call moves toward the base case.</strong> Name a measure — <code>n</code>, the remaining list length, the subtree height — and show that it strictly decreases. If it does not, the function recurses forever.</li>
            </ol>
            <p>Factorial passes both: <code>n</code> decreases by one each call and <code>n = 1</code> stops. A function that calls <code>factorial(n)</code> instead of <code>factorial(n - 1)</code> fails the second obligation and overflows the stack. A function with <code>if (n === 0) return 1</code> but no handling for negative <code>n</code> fails the first: <code>factorial(-1)</code> keeps going away from zero.</p>
            <p>This is induction in disguise. The base case is the induction basis; the recursive case is the induction step. If you can state both, you can explain the algorithm in an interview without tracing a single call.</p>
          `,
        },
        {
          kind: "concept",
          title: "When recursion is the wrong tool",
          body: `
            <p>Recursion is the clearest choice when the data is recursive: trees, nested documents, backtracking over choices. It is the wrong choice in three common situations.</p>
            <ul>
              <li><strong>Deep linear work.</strong> Summing an array of ten million numbers with <code>sum(arr, i + 1)</code> creates ten million frames. A loop uses one. Use the loop.</li>
              <li><strong>Overlapping subproblems.</strong> Naive <code>fib(n)</code> calls <code>fib(n - 1)</code> and <code>fib(n - 2)</code>, which recompute the same values exponentially often. The recursion is correct but the call tree is <code>O(2ⁿ)</code>. Memoisation or tabulation fixes it; that is the dynamic-programming module.</li>
              <li><strong>Tail calls in JavaScript.</strong> Some languages turn a tail-recursive call into a jump that reuses the frame. JavaScript engines are not required to, and V8 does not in practice. Writing <code>return helper(n - 1, acc)</code> does not make depth <code>10⁶</code> safe.</li>
            </ul>
            <p>The decision rule is not "recursion is elegant". It is: does the recursive structure match the data, and is the depth bounded? If yes, recursion. If no, iterate or use an explicit stack.</p>
          `,
        },
        {
          kind: "code",
          title: "Factorial: iterative vs recursive",
          language: "javascript",
          starter:
            "function factorialRecursive(n) {\n  if (n <= 1) return 1;\n  return n * factorialRecursive(n - 1);\n}\n\nfunction factorialIterative(n) {\n  let result = 1;\n  for (let i = 2; i <= n; i++) result *= i;\n  return result;\n}\n\nconsole.log(factorialRecursive(5));\nconsole.log(factorialIterative(5));",
          solution:
            "function factorialRecursive(n) {\n  if (n <= 1) return 1; // base case\n  return n * factorialRecursive(n - 1); // one frame per level\n}\n\nfunction factorialIterative(n) {\n  let result = 1; // O(1) space: one accumulator, no frames\n  for (let i = 2; i <= n; i++) result *= i;\n  return result;\n}\n\nconsole.log(factorialRecursive(5)); // 120\nconsole.log(factorialIterative(5)); // 120",
          tests: [
            { input: "factorialRecursive(0)", expected: "1" },
            { input: "factorialRecursive(6)", expected: "720" },
            { input: "factorialIterative(6)", expected: "720" },
            { input: "factorialRecursive(10)", expected: "3628800" },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "Rewrite factorialRecursive with an accumulator so the recursive call is the last operation. Then call it with n = 100000. What happens, and why does the accumulator not save you?",
        },
        {
          kind: "recap",
          points: [
            "A recursive function needs a correct base case and a recursive case that moves toward it.",
            "Every call owns a stack frame; depth is the space cost, not the number of calls.",
            "Termination needs a measure that strictly decreases toward the base case.",
            "Recursion fits recursive data; deep linear work and overlapping subproblems need iteration or memoisation.",
          ],
        },
      ],
      sources: [
        {
          label: "VisuAlgo — Recursion",
          url: "https://visualgo.net/en/recursion",
        },
        {
          label: "Tech Interview Handbook — recursion",
          url: "https://www.techinterviewhandbook.org/algorithms/recursion/",
        },
      ],
      attribution:
        "Synthesis of VisuAlgo's recursion module and the Tech Interview Handbook's recursion guide.",
    },
  ],
  interviewByte: {
    shape: "Explain Big-O and give the complexity of this snippet.",
    strongAnswer:
      "State the dominant term, drop constants, and give both time and space. Mention best/average/worst when they differ.",
    trap: "Saying 'it's fast' or quoting wall-clock time instead of growth class.",
  },
  recap: [
    "DSA is about growth, not speed.",
    "Big-O classes: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n!).",
    "Recursion costs stack depth; iteration costs O(1) stack.",
  ],
  attribution:
    "Synthesis of Open Data Structures (Morin), Princeton Algorithms (Sedgewick/Wayne), VisuAlgo and the Tech Interview Handbook.",
};
