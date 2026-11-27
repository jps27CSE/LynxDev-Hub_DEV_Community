import type { DsaModule } from "../types";

export const arraysAndStringsModule: DsaModule = {
  slug: "arrays-and-strings",
  order: 3,
  part: 1,
  partTitle: "Core data structures",
  title: "Arrays & Strings",
  description:
    "Array memory model, traversal, in-place ops, prefix sums, and the two-pointer technique.",
  kind: "lesson+task",
  story:
    "Your app stores a feed in an array and searches it linearly for every request. At 10⁵ users that is 10¹⁰ operations a day.",
  chapters: [
    { slug: "array-basics", title: "Array basics", lessonSlug: "array-basics" },
    { slug: "two-pointers", title: "Two pointers", lessonSlug: "two-pointers" },
    { slug: "prefix-sums", title: "Prefix sums", lessonSlug: "prefix-sums" },
  ],
  lessons: [
    {
      slug: "array-basics",
      title: "Array basics",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>A feed screen holds 100,000 posts in an array. Every refresh removes the oldest post with <code>posts.splice(0, 1)</code>. On a demo with ten posts it is instant. In production the screen gets slower as the array grows, and nothing in the line looks expensive.</p>
            <p><code>splice(0, 1)</code> is not a removal at the front. It shifts all 99,999 remaining elements one slot to the left, then shortens the array. That is <code>O(n)</code> work disguised as one call.</p>
            <p>This lesson is about the array's memory model, because that model explains both the fastest operation you have — <code>arr[i]</code> in constant time — and the slowest one you will accidentally write.</p>
          `,
        },
        {
          kind: "concept",
          title: "The memory model: why arr[i] is O(1)",
          body: `
            <p>An array is a contiguous block of memory holding values of the same size. The machine knows the block's base address and the element size, so the address of index <code>i</code> is <code>base + i · size</code>. One multiplication and one addition — no traversal. That is why random access is <code>O(1)</code> and why it stays <code>O(1)</code> at a million elements.</p>
            <p>A linked list has the opposite trade-off. To reach index <code>i</code> you follow <code>i</code> <code>next</code> pointers, so access is <code>O(i)</code>. It pays for that by making insertion at a known node <code>O(1)</code>, because no elements shift.</p>
            <p>JavaScript arrays are objects with numeric keys, but engines store a “packed” array of numbers or object references contiguously when you use it like an array. Mixing types, deleting with <code>delete arr[i]</code>, or creating holes can push it into a slower dictionary representation. The asymptotic story survives; the constant factor does not.</p>
            <p>Contiguity is also why the constant factor is small: the CPU prefetches neighbouring cache lines, so a scan reads memory in order. A linked list performs the same number of comparisons but follows pointers to scattered addresses, and each hop can be a cache miss. Same big-O, different wall clock.</p>
          `,
        },
        {
          kind: "concept",
          title: "Insert, delete and the cost of shifting",
          body: `
            <p>Take <code>[10, 20, 30, 40]</code> and insert <code>25</code> at index 2. The array must become <code>[10, 20, 25, 30, 40]</code>: <code>30</code> moves to index 3, <code>40</code> to index 4, then <code>25</code> is written at index 2. The number of moves is <code>n − index</code>. Inserting at the front moves everything; inserting at the end moves nothing.</p>
            <p>Deletion is the mirror image. Removing index 2 shifts <code>30</code> and <code>40</code> left. Removing the last element only decrements the length. Searching by value is <code>O(n)</code> on an unsorted array, because there is no address formula for “where is 25?”; on a sorted array it is <code>O(log n)</code> with binary search.</p>
            <p>Appending is the interesting case. A dynamic array keeps a capacity larger than its length. When the capacity is full, it allocates a bigger block (typically double), copies the old elements, and continues. A single append can cost <code>O(n)</code>, but <code>n</code> appends copy <code>1 + 2 + 4 + … + n &lt; 2n</code> elements total, so the amortised cost per append is <code>O(1)</code>. The price is up to <code>2n</code> slots of memory for <code>n</code> elements.</p>
          `,
        },
        {
          kind: "concept",
          title: "Strings are arrays with a different contract",
          body: `
            <p>A string is a sequence of characters, and in JavaScript it is immutable. <code>s[0] = "x"</code> does nothing useful; <code>s.toUpperCase()</code> returns a new string. Indexing is <code>O(1)</code>, but every “modification” allocates.</p>
            <p>That changes the cost of a familiar loop. Building a string with <code>result += ch</code> inside a loop looks linear, but in a language with immutable strings each concatenation can copy the whole prefix, giving <code>O(n²)</code>. Engines sometimes optimise this with ropes or cons-strings, but that is an implementation detail, not a guarantee. The reliable pattern is to push characters into an array and <code>join("")</code> once at the end — <code>O(n)</code> total.</p>
            <p>There is a second trap: JavaScript strings are sequences of UTF-16 code units, not Unicode code points. <code>"😀".length</code> is <code>2</code>, and <code>s[i]</code> can return half of a surrogate pair. <code>Array.from(s)</code> or <code>[...s]</code> iterates code points. If your algorithm counts “characters” for a user, decide which definition you mean.</p>
          `,
        },
        {
          kind: "concept",
          title: "In-place operations and their invariant",
          body: `
            <p>Reversing an array in place uses two indices: <code>left = 0</code> and <code>right = n − 1</code>. Swap the values, move both inward, stop when <code>left ≥ right</code>. The invariant is that every position outside <code>[left, right]</code> already holds its final value. Each swap fixes two positions and strictly shrinks the unknown region, so the loop terminates after <code>⌊n/2⌋</code> swaps.</p>
            <p>“In place” means <code>O(1)</code> auxiliary space, not zero extra memory: two indices and one temporary value are fine. It also does not mean the operation is free; it means the extra memory does not grow with <code>n</code>.</p>
            <p>In-place algorithms are easy to get wrong at the boundaries. An empty array has <code>right = −1</code>, so the loop must not run. A one-element array swaps with itself unless the condition is <code>left &lt; right</code>, not <code>left ≤ right</code>. Both cases are cheap to test and expensive to debug in production.</p>
          `,
        },
        {
          kind: "code",
          title: "Reverse in place",
          language: "javascript",
          starter: `function reverse(arr) {
  // Reverse arr in place: O(n) time, O(1) extra space.
  return arr;
}`,
          solution: `function reverse(arr) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  return arr;
}`,
          tests: [
            { input: "reverse([1, 2, 3])", expected: "[3,2,1]" },
            { input: "reverse([])", expected: "[]" },
            { input: "reverse([7])", expected: "[7]" },
            { input: "reverse([1, 2])", expected: "[2,1]" },
            { input: "reverse([5, 5, 7])", expected: "[7,5,5]" },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "You delete the first element of an array k times. What is the total cost in big-O? Name a structure that makes each deletion O(1), and state what it gives up in exchange.",
        },
        {
          kind: "recap",
          points: [
            "Index access is O(1) because the address is base + i·size; a linked list pays O(i) for the same access.",
            "Insert and delete in the middle are O(n) because every later element shifts; append is amortised O(1).",
            "Strings are immutable in JavaScript: repeated concatenation can be O(n²), so collect parts and join once.",
            "In-place reversal keeps an invariant — everything outside [left, right] is final — and uses O(1) extra space.",
          ],
        },
      ],
      sources: [
        {
          label: "Open Data Structures, ch. 2 — Array-Based Lists",
          url: "https://opendatastructures.org/ods-java/2_Array_Based_Lists.html",
        },
        {
          label: "Tech Interview Handbook — Array",
          url: "https://www.techinterviewhandbook.org/algorithms/array/",
        },
      ],
      attribution:
        "Synthesis of Open Data Structures ch. 2 (Morin) and the Tech Interview Handbook's array guide.",
    },
    {
      slug: "two-pointers",
      title: "Two pointers",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>You have 100,000 prices sorted ascending and a budget. You need two prices whose sum is exactly the budget. The double loop tries every pair: about <code>5·10⁹</code> comparisons. The two-pointer scan tries at most 100,000.</p>
            <p>The saving does not come from a faster comparison. It comes from an invariant: on sorted data, one comparison can prove that an entire row or column of the pair table cannot contain the answer. Discarding a whole row per step is what turns <code>n²</code> into <code>n</code>.</p>
          `,
        },
        {
          kind: "concept",
          title: "The invariant that makes it linear",
          body: `
            <p>Put <code>left</code> at the smallest element and <code>right</code> at the largest. Look at <code>sum = arr[left] + arr[right]</code>.</p>
            <ul>
              <li>If <code>sum === target</code>, you found a pair.</li>
              <li>If <code>sum &lt; target</code>, then for this <code>left</code>, every <code>right' ≤ right</code> gives a sum no larger. None of them can reach the target, so <code>left</code> is not part of any valid pair. Discard it: <code>left++</code>.</li>
              <li>If <code>sum &gt; target</code>, then for this <code>right</code>, every <code>left' ≥ left</code> gives a sum no smaller. None can reach the target, so <code>right</code> is not part of any valid pair. Discard it: <code>right--</code>.</li>
            </ul>
            <p>The invariant is: if a valid pair exists in the original array, at least one valid pair lies entirely inside <code>[left, right]</code>. The discard argument preserves it, because the element removed was just proven not to belong to any pair. Each iteration removes exactly one element, so after at most <code>n − 1</code> iterations either a pair is found or the interval is empty and no pair exists.</p>
            <p>This is the part to say out loud in an interview. “I move the smaller pointer because sortedness proves that element cannot be in any valid pair” is the correctness argument; “I use two pointers” is only the technique.</p>
          `,
        },
        {
          kind: "concept",
          title: "A trace with a discard",
          body: `
            <p>Array <code>[1, 2, 3, 4, 6]</code>, target <code>9</code>.</p>
            <ul>
              <li><code>left = 0</code> (1), <code>right = 4</code> (6): sum 7 &lt; 9. Discard 1; <code>left = 1</code>.</li>
              <li><code>left = 1</code> (2), <code>right = 4</code> (6): sum 8 &lt; 9. Discard 2; <code>left = 2</code>.</li>
              <li><code>left = 2</code> (3), <code>right = 4</code> (6): sum 9. Found <code>[2, 4]</code>.</li>
            </ul>
            <p>Three comparisons instead of ten pairs. For target <code>100</code>, the same loop discards 1, 2, 3, 4, then <code>left</code> meets <code>right</code> and returns <code>null</code> — four comparisons to prove that no pair exists, which the double loop could only prove after all ten.</p>
            <p>Notice that the trace never moves <code>right</code> in this example. A target below the current sum would move it; the direction of each move is forced by the comparison, which is why the algorithm needs no backtracking. The loop stops at <code>left === right</code> because a pair needs two distinct indices — with <code>left &lt;= right</code>, an element could be paired with itself and a single value equal to <code>target / 2</code> would produce a false match.</p>
          `,
        },
        {
          kind: "concept",
          title: "When it applies, and when it silently fails",
          body: `
            <p>The precondition is not “an array”. It is a <strong>monotone</strong> relationship: moving <code>left</code> up never decreases the sum, and moving <code>right</code> down never increases it. Sorted order gives that for sums. It does not give it for arbitrary functions — for a product of mixed-sign numbers, moving a pointer can move the product in either direction, and the discard argument collapses.</p>
            <p>On unsorted data you can sort first in <code>O(n log n)</code>, but sorting changes the indices. If the question asks for values, that is fine; if it asks for original positions, store <code>(value, index)</code> pairs before sorting. Duplicates are also subtle: the standard scan returns one pair, not all pairs, and “the first pair” depends on the movement rule.</p>
            <p>Two other patterns share the name but not the invariant. Fast and slow pointers move at different speeds to detect a cycle or find the middle of a list; they rely on the distance between the pointers, not on sorted order. A sliding window keeps a contiguous range and moves both ends in the same direction; it relies on a window property that can be maintained incrementally. Reach for the right one by naming the property, not the pointer count.</p>
          `,
        },
        {
          kind: "concept",
          title: "Two pointers versus a hash map",
          body: `
            <p>For an unsorted array, a hash map solves two-sum in <code>O(n)</code> time and <code>O(n)</code> space: for each value, check whether <code>target − value</code> was seen. Two pointers on a sorted array solve it in <code>O(n)</code> time and <code>O(1)</code> space. Same time, different memory.</p>
            <p>If the data is already sorted, two pointers is strictly better on space and has better cache behaviour. If sorting would destroy information you need, or the data is a stream you cannot revisit, the hash map is the right tool. The interview answer is not “use a hash map because it is O(n)”; it is “here is the trade-off, and here is which one this input makes cheap”.</p>
          `,
        },
        {
          kind: "visual",
          title: "Two pointers finding a pair sum",
          frames: [
            {
              id: "f1",
              kind: "array",
              caption:
                "Sorted array [1,2,3,4,6], target 9. left=0 (1), right=4 (6): 1+6=7 < 9, so 1 cannot be in any valid pair. Move left.",
              state: {
                kind: "array",
                values: [1, 2, 3, 4, 6],
                pointers: [
                  { index: 0, label: "left", color: "#22c55e" },
                  { index: 4, label: "right", color: "#ef4444" },
                ],
              },
            },
            {
              id: "f2",
              kind: "array",
              caption:
                "left=1 (2), right=4 (6): 2+6=8 < 9, so 2 cannot be in any valid pair either. Move left again.",
              state: {
                kind: "array",
                values: [1, 2, 3, 4, 6],
                pointers: [
                  { index: 1, label: "left", color: "#22c55e" },
                  { index: 4, label: "right", color: "#ef4444" },
                ],
              },
            },
            {
              id: "f3",
              kind: "array",
              caption:
                "left=2 (3), right=4 (6): 3+6=9. Pair found at indices 2 and 4.",
              state: {
                kind: "array",
                values: [1, 2, 3, 4, 6],
                pointers: [
                  { index: 2, label: "left", color: "#22c55e" },
                  { index: 4, label: "right", color: "#ef4444" },
                ],
                highlight: [2, 4],
              },
            },
          ],
        },
        {
          kind: "code",
          title: "Two-sum on a sorted array",
          language: "javascript",
          starter: `function twoSumSorted(arr, target) {
  // Return indices [i, j] with arr[i] + arr[j] === target, or null.
  return null;
}`,
          solution: `function twoSumSorted(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return null;
}`,
          tests: [
            { input: "twoSumSorted([1,2,3,4,6], 5)", expected: "[0,3]" },
            { input: "twoSumSorted([1,2,3,4,6], 9)", expected: "[2,4]" },
            { input: "twoSumSorted([1,2,3,4,6], 100)", expected: "null" },
            { input: "twoSumSorted([], 5)", expected: "null" },
            { input: "twoSumSorted([5], 5)", expected: "null" },
            { input: "twoSumSorted([2,2,3], 4)", expected: "[0,1]" },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "Explain why moving left when the sum is too small can never skip a valid pair. Then modify the loop to return every unique value pair, not just the first index pair.",
        },
        {
          kind: "recap",
          points: [
            "Sorted order makes the sum monotone: moving left up never decreases it, moving right down never increases it.",
            "Each comparison proves one element cannot belong to any valid pair, so the range shrinks by one per step.",
            "Two pointers on sorted data is O(n) time and O(1) space; a hash map is O(n) time and O(n) space.",
            "The precondition is monotonicity, not the number of pointers — products and mixed signs break the discard argument.",
          ],
        },
      ],
      sources: [
        {
          label: "GeeksforGeeks — Two Pointers Technique",
          url: "https://www.geeksforgeeks.org/two-pointers-technique/",
        },
        {
          label: "Tech Interview Handbook — Array",
          url: "https://www.techinterviewhandbook.org/algorithms/array/",
        },
      ],
      attribution:
        "Synthesis of GeeksforGeeks' two-pointers guide and the Tech Interview Handbook's array material.",
    },
    {
      slug: "prefix-sums",
      title: "Prefix sums",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>A dashboard shows total revenue for arbitrary date ranges over a table of one million daily rows. Each page view asks ten thousand range questions. Summing each range directly costs up to one million additions per query — <code>10¹⁰</code> operations for the page.</p>
            <p>The data does not change between queries. That is the opening: pay one <code>O(n)</code> pass to build a table of running totals, then answer every range with two subtractions. The same idea generalises to rectangles, to range updates, and to any operation that can be “subtracted” — which is exactly the limit you need to know.</p>
          `,
        },
        {
          kind: "concept",
          title: "The definition and the invariant",
          body: `
            <p>Define <code>prefix[0] = 0</code> and <code>prefix[i + 1] = prefix[i] + arr[i]</code>. Then <code>prefix[i]</code> is the sum of the first <code>i</code> elements, <code>arr[0] … arr[i − 1]</code>. The array has length <code>n + 1</code>, and the extra leading zero is what removes the special case for ranges that start at index 0.</p>
            <p>The range sum follows: <code>sum(l, r) = prefix[r + 1] − prefix[l]</code>. Why: <code>prefix[r + 1]</code> is everything up to and including <code>r</code>; <code>prefix[l]</code> is everything before <code>l</code>; subtracting removes the prefix and leaves exactly <code>arr[l] … arr[r]</code>.</p>
            <p>Trace <code>[1, 2, 3, 4, 5]</code>. The prefix array is <code>[0, 1, 3, 6, 10, 15]</code>. The sum of indices 1 through 3 is <code>prefix[4] − prefix[1] = 10 − 1 = 9</code>, which matches <code>2 + 3 + 4</code>. A single element is <code>prefix[i + 1] − prefix[i]</code>, and the whole array is <code>prefix[n] − prefix[0]</code>. Both fall out of the same formula.</p>
          `,
        },
        {
          kind: "concept",
          title: "The trade-off: build once, query many",
          body: `
            <p>Building the prefix array costs <code>O(n)</code> time and <code>O(n)</code> extra space. Each query then costs <code>O(1)</code>. Answering <code>q</code> queries directly costs <code>O(q·n)</code>; with prefix sums it costs <code>O(n + q)</code>.</p>
            <p>The break-even is worth stating. If <code>q</code> is 1, prefix sums do <code>n</code> work to save one range sum that might be much shorter than <code>n</code> — a loss. If <code>q</code> is 10,000 and <code>n</code> is 1,000,000, it is a factor of roughly 10,000. The structure is a bet that reads outnumber writes; if the array changes between queries, the prefix array is stale.</p>
            <p>Two generalisations follow the same shape. A <strong>2D prefix sum</strong> stores the sum of every rectangle from <code>(0, 0)</code> to <code>(i, j)</code>, and answers an arbitrary rectangle with four lookups and inclusion–exclusion. A <strong>difference array</strong> stores <code>diff[i] = arr[i] − arr[i − 1]</code>; adding <code>x</code> to a range becomes two point updates, and one prefix pass materialises the result. Build cost and query cost trade places, but the invariant — a running total lets you subtract away a prefix — is the same.</p>
          `,
        },
        {
          kind: "concept",
          title: "Where prefix sums break",
          body: `
            <p>Negative numbers are fine. Unlike a sliding window, prefix sums do not assume the values are positive; subtracting a negative prefix still cancels correctly. Overflow is the real numeric limit: in JavaScript, sums above <code>2^53 − 1</code> lose integer precision, so use <code>BigInt</code> or reduce modulo a modulus at every step if the problem allows it.</p>
            <p>Mutability is the structural limit. A point update invalidates every prefix from that index onward, so rebuilding costs <code>O(n)</code>. If updates and queries are interleaved, a Fenwick tree or segment tree gives <code>O(log n)</code> for both. Prefix sums are the right tool for a static array with many reads, not a live one.</p>
            <p>Finally, subtraction only works for operations that have an inverse. Sum, XOR and count all do. Minimum and maximum do not: knowing the minimum of <code>[0, r]</code> and the minimum of <code>[0, l)</code> does not tell you the minimum of <code>[l, r]</code>, because the smaller value might be in the part you subtracted. Range-minimum queries need a sparse table, a segment tree, or a monotonic deque for sliding windows.</p>
            <p>The most common bug is an off-by-one in the bounds, usually from mixing conventions. With the leading zero, <code>sum(l, r)</code> is <code>prefix[r + 1] − prefix[l]</code>; writing <code>prefix[r] − prefix[l]</code> silently drops <code>arr[r]</code> and returns a plausible wrong answer. Decide once whether the second index is inclusive, and test the single-element case <code>l === r</code>.</p>
          `,
        },
        {
          kind: "compare",
          body: `
            <p>Prefix sums and a sliding window both answer range questions without rescanning, but they assume different things. A sliding window maintains a property of a contiguous window while both ends move forward; it needs that property to be maintainable when an element leaves. That works for sums of positive numbers, but not for sums with negatives: adding a negative can make a shorter window better, so the rule for moving the left end no longer holds.</p>
            <p>Prefix sums do not care about sign. They need the operation to be invertible, so sums and XOR work and minimum does not. The trade is memory: an <code>O(n)</code> prefix array versus <code>O(1)</code> window state. If the data is all positive and the question is “longest or shortest window satisfying X”, reach for the window. If the question is “sum of this exact range” and negatives are allowed, reach for the prefix.</p>
          `,
        },
        {
          kind: "code",
          title: "Range sum query",
          language: "javascript",
          starter: `function buildPrefix(arr) {
  const p = [0];
  for (let i = 0; i < arr.length; i++) p.push(p[p.length - 1] + arr[i]);
  return p;
}

function rangeSum(prefix, l, r) {
  // Sum of arr[l..r] inclusive, using the prefix array.
  return 0;
}`,
          solution: `function buildPrefix(arr) {
  const p = [0];
  for (let i = 0; i < arr.length; i++) p.push(p[p.length - 1] + arr[i]);
  return p;
}

function rangeSum(prefix, l, r) {
  return prefix[r + 1] - prefix[l];
}`,
          tests: [
            {
              input: "rangeSum(buildPrefix([1,2,3,4,5]), 0, 4)",
              expected: "15",
            },
            {
              input: "rangeSum(buildPrefix([1,2,3,4,5]), 2, 2)",
              expected: "3",
            },
            {
              input: "rangeSum(buildPrefix([1,2,3,4,5]), 0, 0)",
              expected: "1",
            },
            {
              input: "rangeSum(buildPrefix([1,2,3,4,5]), 4, 4)",
              expected: "5",
            },
            {
              input: "rangeSum(buildPrefix([1,2,3,4,5]), 2, 4)",
              expected: "12",
            },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "A prefix array is built once and then ten range updates arrive, each adding 5 to a range. Why does rebuilding after each update cost O(n) per update, and how does a difference array make each update O(1)? What does the final materialisation cost?",
        },
        {
          kind: "recap",
          points: [
            "prefix[i] is the sum of the first i elements; the leading zero removes the range-start special case.",
            "A range sum is two subtractions, so O(1) per query after O(n) build time and O(n) space.",
            "The structure pays off only when queries outnumber updates; a point update invalidates the suffix.",
            "Subtraction needs an inverse, so prefix sums handle sums, XOR and counts but not minimum or maximum.",
          ],
        },
      ],
      sources: [
        {
          label: "GeeksforGeeks — Prefix Sum Array",
          url: "https://www.geeksforgeeks.org/prefix-sum-array-implementation-applications-competitive-programming/",
        },
        {
          label: "Tech Interview Handbook — Array",
          url: "https://www.techinterviewhandbook.org/algorithms/array/",
        },
      ],
      attribution:
        "Synthesis of GeeksforGeeks' prefix-sum guide and the Tech Interview Handbook's array material.",
    },
  ],
  task: {
    brief:
      "Given a sorted array and a target, find two indices whose values sum to the target using two pointers. Start state has the pointers both at index 0 — wrong. Fix them.",
    startState: {
      data: { arr: [1, 2, 3, 4, 6], target: 7, left: 0, right: 0 },
      completedSteps: [],
      criteriaMet: [],
      attempts: 0,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    solutionState: {
      data: { arr: [1, 2, 3, 4, 6], target: 7, left: 0, right: 4 },
      completedSteps: ["place-right"],
      criteriaMet: ["pointers-correct"],
      attempts: 1,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    steps: [
      {
        id: "place-right",
        title: "Place the right pointer",
        brief: "Move `right` to the last index (arr.length - 1).",
        hint: "The right pointer starts at the end so the pair spans the whole array.",
        reveal:
          "right = arr.length - 1. With both pointers at 0 you only ever compare an element with itself.",
        check: (s) => {
          const d = s.data as { right: number; arr: number[] };
          return {
            passed: d.right === d.arr.length - 1,
            progress: d.right === d.arr.length - 1 ? "1/1" : "0/1",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "pointers-correct",
        label: "right pointer at last index",
        required: true,
        assert: (s) => {
          const d = s.data as { right: number; arr: number[] };
          return d.right === d.arr.length - 1;
        },
        explain:
          "Two pointers need to span the array; both at index 0 can never find a pair.",
      },
    ],
  },
  interviewByte: {
    shape: "Find two numbers in a sorted array that sum to a target.",
    strongAnswer:
      "Two pointers from both ends, O(n) time and O(1) space. Explain why sortedness is required and why discarding one element per step is safe.",
    trap: "Using a hash map and forgetting to state it needs O(n) extra space, or ignoring that the array must be sorted.",
  },
  recap: [
    "Arrays: O(1) index, O(n) middle insert, amortised O(1) append.",
    "Two pointers: O(n) on sorted input, with an invariant that proves each discard.",
    "Prefix sums: O(1) range queries after O(n) prep, for static data with many reads.",
  ],
  attribution:
    "Synthesis of Open Data Structures ch. 2, the Tech Interview Handbook, and GeeksforGeeks' two-pointers and prefix-sum guides.",
};
