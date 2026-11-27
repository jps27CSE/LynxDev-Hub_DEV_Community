import type { DsaModule } from "../types";

export const searchingModule: DsaModule = {
  slug: "searching",
  order: 4,
  part: 1,
  partTitle: "Core data structures",
  title: "Searching",
  description:
    "Linear search, binary search, and searching on the answer space.",
  kind: "lesson+task",
  story:
    "A lookup that scans 10⁶ rows per request is 10⁶ operations you did not need to do.",
  chapters: [
    { slug: "linear", title: "Linear search", lessonSlug: "linear-search" },
    { slug: "binary", title: "Binary search", lessonSlug: "binary-search" },
    {
      slug: "search-on-answer",
      title: "Search on answer",
      lessonSlug: "search-on-answer",
    },
  ],
  lessons: [
    {
      slug: "linear-search",
      title: "Linear search",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>A support tool receives a ticket id and checks it against a list of 50,000 open tickets. The list is append-only and unsorted. The lookup scans from the start; on average it reads 25,000 ids, and when the id is absent it reads all 50,000.</p>
            <p>Is that a bug? Not automatically. Linear search is the correct algorithm when the data has no order and you query it once. It becomes a bug when the same list is scanned thousands of times per minute, or when the scan is hidden inside a loop and turns an <code>O(n)</code> feature into <code>O(n²)</code>.</p>
            <p>This lesson is about knowing which situation you are in, and about the invariant that makes the simple loop correct.</p>
          `,
        },
        {
          kind: "concept",
          title: "The algorithm and its invariant",
          body: `
            <p>The loop is three lines: for each index <code>i</code> from 0 to <code>n − 1</code>, compare <code>arr[i]</code> with the target; return <code>i</code> on equality; return <code>-1</code> after the loop.</p>
            <p>The invariant is: before iteration <code>i</code>, no index smaller than <code>i</code> holds the target. It is true at the start because there are no indices smaller than 0. Each iteration checks index <code>i</code>; if it is not the target, the invariant extends to <code>i + 1</code>. If the loop finishes, the invariant at <code>i = n</code> says no index in the array holds the target, so <code>-1</code> is correct.</p>
            <p>Trace <code>[4, 2, 7, 1]</code> with target <code>7</code>: index 0 is 4, index 1 is 2, index 2 is 7 → return 2. With target <code>9</code>: four comparisons, then <code>-1</code>. The loop does not need to know where the target is; it only needs to prove, one index at a time, that the target is not behind it.</p>
          `,
        },
        {
          kind: "concept",
          title: "Cost: best, worst, average and space",
          body: `
            <p>Best case: the target is at index 0 → one comparison, <code>O(1)</code>. Worst case: the target is at the last index or absent → <code>n</code> comparisons, <code>O(n)</code>. Average case, if the target is equally likely to be at any index, is <code>(n + 1)/2</code> comparisons → still <code>Θ(n)</code>. The average does not change the class; it only changes the constant.</p>
            <p>Space is <code>O(1)</code>: one index and one comparison. That is the algorithm's one real advantage over a hash set, which needs <code>O(n)</code> memory to make lookup constant.</p>
            <p>There is a practical factor big-O hides: a linear scan reads contiguous memory, so the CPU prefetcher can stream it. A linked-list scan of the same <code>n</code> values follows pointers to scattered addresses and can be several times slower. The asymptotic class is the same; the constants are not, and at small <code>n</code> the constants decide.</p>
          `,
        },
        {
          kind: "concept",
          title: "When linear search is the right answer",
          body: `
            <p>Use it when the data is unsorted and queried once, when <code>n</code> is small enough that setup costs dominate, when the collection is a stream or a linked list with no random access, or when you need the first match, the last match, or every match and a hash map would lose the order.</p>
            <p>Put numbers on the decision. One thousand searches over 10,000 items is 10⁷ comparisons. Building a hash set costs 10,000 insertions plus 1,000 lookups — about 11,000 operations, three orders of magnitude less. The scan only wins when the number of searches is small or the collection changes between them, because then the preparation is paid again.</p>
            <p>Sentinel search is a classic micro-optimisation: place the target at the end of the array so the loop does not need a bounds check on every iteration, then restore the original value. It removes one comparison per iteration and mutates the array — a bad trade if the array is shared or read-only.</p>
            <p>The decision is not “linear search is slow”. It is “how many times will I search this data, and what does it cost to prepare it?” One search on 50,000 items: scan. Ten thousand searches on the same 50,000 items: build a hash set once, or sort once and binary search. The preparation cost is paid once; the query cost is paid every time.</p>
          `,
        },
        {
          kind: "concept",
          title: "Where it breaks",
          body: `
            <p>The worst case is the absent element: every unsuccessful lookup pays the full <code>n</code>. If misses are common and the data is static, that is exactly the case to optimise.</p>
            <p>Equality is another trap. <code>[NaN].indexOf(NaN)</code> is <code>-1</code>, because <code>indexOf</code> uses strict equality and <code>NaN !== NaN</code>; <code>includes</code> uses SameValueZero and finds it. Objects are compared by reference, so two structurally equal objects are different values. Sparse arrays and holes behave differently again. Decide what “equal” means before you write the loop.</p>
            <p>And the hidden-loop failure: calling <code>includes</code> inside a loop over the same array is <code>O(n²)</code>. The call looks like one operation; it is a scan. If you see a search built-in inside a loop, count it as a loop.</p>
          `,
        },
        {
          kind: "code",
          title: "Linear search",
          language: "javascript",
          starter: `function linearSearch(arr, target) {
  // Return the first index holding target, or -1.
  return -1;
}`,
          solution: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
          tests: [
            { input: "linearSearch([4,2,7,1], 4)", expected: "0" },
            { input: "linearSearch([4,2,7,1], 1)", expected: "3" },
            { input: "linearSearch([4,2,7,1], 9)", expected: "-1" },
            { input: "linearSearch([], 1)", expected: "-1" },
            { input: "linearSearch([5,5,5], 5)", expected: "0" },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "You call linear search 1,000 times on the same 10,000-element unsorted array. What is the total cost? Name two changes that reduce it and the price each one pays.",
        },
        {
          kind: "recap",
          points: [
            "The invariant is that every index before i has been checked and is not the target.",
            "Best case O(1), worst and average O(n), space O(1) — the class does not change with the average.",
            "Linear search is correct on unsorted or one-off data; repeated lookups should pay once to prepare.",
            "Equality is language-specific, and a search built-in inside a loop is a hidden O(n) scan.",
          ],
        },
      ],
      sources: [
        {
          label: "GeeksforGeeks — Linear Search",
          url: "https://www.geeksforgeeks.org/linear-search/",
        },
        {
          label: "Open Data Structures, ch. 2 — Array-Based Lists",
          url: "https://opendatastructures.org/ods-java/2_Array_Based_Lists.html",
        },
      ],
      attribution:
        "Synthesis of GeeksforGeeks' linear-search article and Open Data Structures ch. 2 (Morin).",
    },
    {
      slug: "binary-search",
      title: "Binary search",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>A sorted array holds one million ids. Linear search reads up to one million entries; binary search reads at most twenty. The difference is not a faster comparison — it is that each comparison eliminates half of the remaining candidates.</p>
            <p>The loop is short enough to memorise, which is exactly why it is dangerous. Most binary-search bugs are not in the idea; they are in the boundary: an off-by-one in <code>mid</code>, a pointer update that fails to remove <code>mid</code>, or a duplicate that makes “found” mean “found one of them”.</p>
            <p>This lesson builds the loop from the invariant, traces it on a real array, and then breaks it in the five ways that matter.</p>
          `,
        },
        {
          kind: "concept",
          title: "The algorithm and a full trace",
          body: `
            <p>Keep a range <code>[lo, hi]</code> that is still possible. Compute <code>mid = lo + Math.floor((hi − lo) / 2)</code>. Compare <code>arr[mid]</code> with the target and move one bound past <code>mid</code>.</p>
            <p>Trace <code>[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]</code>, target <code>23</code>:</p>
            <ul>
              <li><code>lo = 0</code>, <code>hi = 9</code>, <code>mid = 4</code>, <code>arr[4] = 16 &lt; 23</code> → <code>lo = 5</code>.</li>
              <li><code>lo = 5</code>, <code>hi = 9</code>, <code>mid = 7</code>, <code>arr[7] = 56 &gt; 23</code> → <code>hi = 6</code>.</li>
              <li><code>lo = 5</code>, <code>hi = 6</code>, <code>mid = 5</code>, <code>arr[5] = 23</code> → found at index 5.</li>
            </ul>
            <p>Now target <code>24</code>: same first two steps, then <code>lo = 5</code>, <code>hi = 6</code>, <code>mid = 5</code>, <code>23 &lt; 24</code> → <code>lo = 6</code>; <code>lo = 6</code>, <code>hi = 6</code>, <code>mid = 6</code>, <code>38 &gt; 24</code> → <code>hi = 5</code>; now <code>lo &gt; hi</code>, the range is empty, return <code>-1</code>. The final state is not an accident; it is the proof that no candidate remains.</p>
          `,
        },
        {
          kind: "concept",
          title: "Why it is correct: the invariant",
          body: `
            <p>The invariant is: if the target exists in the array, its index is always inside <code>[lo, hi]</code>. It holds at the start, because the range is the whole array. It is preserved by each comparison:</p>
            <ul>
              <li>If <code>arr[mid] &lt; target</code>, sortedness says every index <code>≤ mid</code> holds a value <code>≤ arr[mid] &lt; target</code>. None of them can be the target, so moving <code>lo</code> to <code>mid + 1</code> discards only impossible indices.</li>
              <li>If <code>arr[mid] &gt; target</code>, every index <code>≥ mid</code> holds a value <code>≥ arr[mid] &gt; target</code>. Moving <code>hi</code> to <code>mid − 1</code> is safe.</li>
              <li>If they are equal, the index is returned.</li>
            </ul>
            <p>Each iteration removes <code>mid</code> and at least half of the remaining range, so the interval strictly shrinks. A strictly shrinking integer interval must terminate. When <code>lo &gt; hi</code>, the invariant says the target cannot exist, so <code>-1</code> is correct.</p>
            <p>The sorted precondition is not a suggestion. Without it, “everything to the left of <code>mid</code> is smaller” is false, and every discard step can throw away the answer.</p>
          `,
        },
        {
          kind: "concept",
          title: "Deriving O(log n)",
          body: `
            <p>After <code>k</code> iterations the range size is at most <code>n / 2^k</code>. The loop stops when the range is empty, i.e. when <code>n / 2^k &lt; 1</code>, so <code>k &gt; log₂ n</code>. The number of comparisons is at most <code>⌊log₂ n⌋ + 1</code>.</p>
            <p>That is why the numbers feel small: 1,000 → 10, 1,000,000 → 20, 1,000,000,000 → 30. Doubling the input adds one comparison, not one pass. The base of the logarithm does not matter asymptotically; <code>log₂ n</code> and <code>log₁₀ n</code> differ by a constant factor, which big-O drops.</p>
            <p>Space is <code>O(1)</code> for the iterative version: two bounds and a midpoint. The recursive version uses <code>O(log n)</code> stack frames, because each call waits for the next. Both are correct; the iterative one is the safer default for large <code>n</code>.</p>
          `,
        },
        {
          kind: "concept",
          title: "Where it breaks: five classic bugs",
          body: `
            <p><strong>Unsorted input.</strong> The invariant is false, so the result is arbitrary. If the data is not sorted, sort it first (<code>O(n log n)</code>) or use a hash map.</p>
            <p><strong>Duplicates.</strong> Plain binary search returns <em>a</em> matching index, not the first or last. Finding the first occurrence needs a lower-bound loop: when <code>arr[mid] ≥ target</code>, set <code>hi = mid</code> and do not return early. The loop condition becomes <code>lo &lt; hi</code>, and the answer is <code>lo</code> after it ends.</p>
            <p><strong>Overflow in <code>mid</code>.</strong> In a fixed-width language, <code>(lo + hi)</code> can exceed the integer range even when both bounds fit. Write <code>lo + (hi − lo) / 2</code>. JavaScript numbers are doubles, so this specific overflow is rare, but the habit transfers.</p>
            <p><strong><code>lo = mid</code> instead of <code>mid + 1</code>.</strong> When the range has two elements, <code>mid</code> equals <code>lo</code>, and setting <code>lo = mid</code> leaves the range unchanged: an infinite loop. Every update must move a bound <em>past</em> the examined element.</p>
            <p><strong>Mismatched loop condition and update.</strong> <code>while (lo &lt;= hi)</code> pairs with <code>hi = mid − 1</code>; <code>while (lo &lt; hi)</code> pairs with <code>hi = mid</code>. Mixing them either skips a candidate or loops forever. Pick one template and write down its invariant before typing.</p>
          `,
        },
        {
          kind: "visual",
          title: "Binary search halving the range",
          frames: [
            {
              id: "f1",
              kind: "array",
              caption:
                "Array [1,3,5,7,9,11], target 7. The range is the whole array: lo=0, hi=5, mid=2, arr[2]=5 < 7.",
              state: {
                kind: "array",
                values: [1, 3, 5, 7, 9, 11],
                range: [0, 5],
                highlight: [2],
                pointers: [{ index: 2, label: "mid", color: "#a855f7" }],
              },
            },
            {
              id: "f2",
              kind: "array",
              caption:
                "5 is too small, so every index ≤ 2 is impossible. lo=3, hi=5, mid=4, arr[4]=9 > 7.",
              state: {
                kind: "array",
                values: [1, 3, 5, 7, 9, 11],
                range: [3, 5],
                highlight: [4],
                pointers: [{ index: 4, label: "mid", color: "#a855f7" }],
              },
            },
            {
              id: "f3",
              kind: "array",
              caption:
                "9 is too large, so every index ≥ 4 is impossible. lo=3, hi=3, mid=3, arr[3]=7.",
              state: {
                kind: "array",
                values: [1, 3, 5, 7, 9, 11],
                range: [3, 3],
                highlight: [3],
                pointers: [{ index: 3, label: "mid", color: "#22c55e" }],
              },
            },
            {
              id: "f4",
              kind: "array",
              caption:
                "arr[3] equals the target. Found at index 3 after three comparisons instead of four.",
              state: {
                kind: "array",
                values: [1, 3, 5, 7, 9, 11],
                highlight: [3],
              },
            },
          ],
        },
        {
          kind: "code",
          title: "Binary search (iterative)",
          language: "javascript",
          starter: `function binarySearch(arr, target) {
  // Return an index holding target, or -1.
  return -1;
}`,
          solution: `function binarySearch(arr, target) {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
          tests: [
            { input: "binarySearch([1,3,5,7,9,11], 1)", expected: "0" },
            { input: "binarySearch([1,3,5,7,9,11], 11)", expected: "5" },
            { input: "binarySearch([1,3,5,7,9,11], 7)", expected: "3" },
            { input: "binarySearch([1,3,5,7,9,11], 4)", expected: "-1" },
            { input: "binarySearch([1,3,5,7,9,11], 0)", expected: "-1" },
            { input: "binarySearch([], 1)", expected: "-1" },
            { input: "binarySearch([7], 7)", expected: "0" },
            { input: "binarySearch([1,2,2,2,3], 2)", expected: "2" },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "Write lowerBound(arr, target) — the first index with arr[i] >= target — using hi = mid instead of hi = mid - 1. Explain why the loop condition must be lo < hi and why it terminates.",
        },
        {
          kind: "recap",
          points: [
            "The invariant is that if the target exists, its index is inside [lo, hi]; every update preserves it.",
            "Each comparison removes mid and at least half the range, giving at most ⌊log₂ n⌋ + 1 comparisons.",
            "Sorted input is the precondition; duplicates need lower-bound or upper-bound, not the plain loop.",
            "Every bound update must move past mid, and the loop condition must match the update rule.",
          ],
        },
      ],
      sources: [
        {
          label: "CP-Algorithms — Binary Search",
          url: "https://cp-algorithms.com/num_methods/binary_search.html",
        },
        {
          label: "GeeksforGeeks — Binary Search",
          url: "https://www.geeksforgeeks.org/binary-search/",
        },
      ],
      attribution:
        "Synthesis of CP-Algorithms' binary-search article and GeeksforGeeks' binary-search guide.",
    },
    {
      slug: "search-on-answer",
      title: "Search on answer",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>Koko has piles <code>[3, 6, 7, 11]</code> and eight hours. She eats at a constant speed <code>k</code> bananas per hour, and each pile takes <code>ceil(pile / k)</code> hours. What is the smallest <code>k</code> that finishes in time?</p>
            <p>You cannot binary search the piles: the answer is a speed, not an index. But you can test any candidate speed in one pass over the piles. “Can I finish at speed <code>k</code>?” is a yes/no question, and it is monotone: if speed <code>k</code> works, every speed above <code>k</code> also works.</p>
            <p>That is enough. Binary search the answer space, not the data.</p>
          `,
        },
        {
          kind: "concept",
          title: "The pattern: a monotone predicate over a numeric range",
          body: `
            <p>Define <code>feasible(x)</code> as “the task can be completed with parameter <code>x</code>”. For Koko, <code>feasible(k)</code> sums <code>ceil(pile / k)</code> over the piles and compares the total with the hours available.</p>
            <p>The key property is monotonicity: <code>feasible(k)</code> is false for small <code>k</code>, true for large <code>k</code>, and never flips back. The answer is the boundary — the smallest <code>k</code> where it becomes true.</p>
            <p>Use the lower-bound template over the integer range <code>[lo, hi]</code>:</p>
            <pre><code>while (lo &lt; hi) {
  const mid = lo + Math.floor((hi - lo) / 2);
  if (feasible(mid)) hi = mid;
  else lo = mid + 1;
}
return lo;</code></pre>
            <p>Trace piles <code>[3, 6, 7, 11]</code>, hours <code>8</code>, range <code>[1, 11]</code>:</p>
            <ul>
              <li><code>mid = 6</code>: hours <code>1 + 1 + 2 + 2 = 6 ≤ 8</code> → <code>hi = 6</code>.</li>
              <li><code>mid = 3</code>: <code>1 + 2 + 3 + 4 = 10 &gt; 8</code> → <code>lo = 4</code>.</li>
              <li><code>mid = 5</code>: <code>1 + 2 + 2 + 3 = 8 ≤ 8</code> → <code>hi = 5</code>.</li>
              <li><code>mid = 4</code>: <code>1 + 2 + 2 + 3 = 8 ≤ 8</code> → <code>hi = 4</code>.</li>
              <li><code>lo = hi = 4</code>. Answer: 4.</li>
            </ul>
            <p>Check the boundary: speed 3 needs 10 hours (fails), speed 4 needs 8 (works). The loop returns the first feasible speed, not merely a feasible one.</p>
          `,
        },
        {
          kind: "concept",
          title: "Why it works, and what the invariant is",
          body: `
            <p>The invariant is: the answer is always inside <code>[lo, hi]</code>. Initially, the answer is at least 1 (you cannot eat zero) and at most the largest pile (at that speed every pile takes one hour, and the problem guarantees the hour budget is at least the number of piles; a larger speed never helps). If <code>feasible(mid)</code> is true, the answer is at most <code>mid</code>, so <code>hi = mid</code> keeps it. If false, the answer is greater than <code>mid</code>, so <code>lo = mid + 1</code> keeps it.</p>
            <p>The loop ends when <code>lo === hi</code>. The invariant then says the answer is inside a one-element range, so it is that element. Termination is guaranteed because <code>hi − lo</code> strictly decreases: <code>mid &lt; hi</code> whenever <code>lo &lt; hi</code>, so <code>hi = mid</code> shrinks the range, and <code>lo = mid + 1</code> does too.</p>
            <p>The cost is <code>O(n · log R)</code>, where <code>n</code> is the cost of one predicate evaluation and <code>R</code> is the size of the answer range. The logarithm is over the range, not the data. For <code>R = 10⁹</code>, that is about 30 evaluations.</p>
          `,
        },
        {
          kind: "concept",
          title: "Designing the predicate is the whole problem",
          body: `
            <p>Three questions decide whether the pattern applies. Is the predicate monotone? Is it cheap enough to run <code>log R</code> times? Is it correct at both boundaries?</p>
            <p>Monotonicity is the one people skip. “Can we ship all packages within <code>D</code> days at capacity <code>c</code>?” is monotone in <code>c</code>. “Is the closest pair distance exactly <code>d</code>?” is not monotone — it can be true, false, then true again as <code>d</code> grows — so binary search has nothing to follow. A non-monotone predicate does not fail loudly; it returns a plausible wrong answer.</p>
            <p>Boundary correctness is where the bugs live. For Koko, <code>ceil(pile / k)</code> must use ceiling division; integer division floors, and flooring undercounts the hours. The upper bound must be feasible: the largest pile works because one pile per hour finishes each pile in one hour. The lower bound must be a value you are willing to return: 1, not 0, because division by zero is undefined.</p>
            <p>Floating-point answers need a different loop: fix the number of iterations (say 100) or stop when <code>hi − lo &lt; ε</code>. Comparing floats with <code>lo &lt; hi</code> can run forever when the midpoint rounds to a bound.</p>
          `,
        },
        {
          kind: "concept",
          title: "Where it breaks",
          body: `
            <p>If the predicate is not monotone, the result is meaningless. If it is expensive — <code>O(n²)</code> or worse — the <code>log R</code> factor does not save you; a direct search may be faster. If the range is wrong, the answer is wrong: a lower bound above the true answer skips it, and an upper bound below it never becomes feasible, so the loop returns an infeasible value.</p>
            <p>“Minimum” and “maximum” flip the template. For the largest feasible value, switch to the upper midpoint <code>mid = lo + Math.floor((hi − lo + 1) / 2)</code>, then <code>lo = mid</code> when feasible and <code>hi = mid − 1</code> otherwise, and return <code>lo</code>; or negate the predicate and reuse the minimum template. Mixing the two produces an off-by-one that passes small tests.</p>
            <p>Finally, the answer space must be discrete or the comparison must be tolerant. Integer ranges are the easy case. Continuous ranges need an iteration budget, not an equality test.</p>
          `,
        },
        {
          kind: "code",
          title: "Minimum eating speed",
          language: "javascript",
          starter: `function minEatingSpeed(piles, h) {
  // Smallest integer speed k such that sum(ceil(pile / k)) <= h.
  return 1;
}`,
          solution: `function minEatingSpeed(piles, h) {
  let lo = 1;
  let hi = 0;
  for (const pile of piles) if (pile > hi) hi = pile;

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    let hours = 0;
    for (const pile of piles) hours += Math.ceil(pile / mid);
    if (hours <= h) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
          tests: [
            { input: "minEatingSpeed([3,6,7,11], 8)", expected: "4" },
            { input: "minEatingSpeed([30,11,23,4,20], 5)", expected: "30" },
            { input: "minEatingSpeed([30,11,23,4,20], 6)", expected: "23" },
            { input: "minEatingSpeed([1], 1)", expected: "1" },
            { input: "minEatingSpeed([100], 1)", expected: "100" },
            { input: "minEatingSpeed([1,1,1], 3)", expected: "1" },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "Given package weights and a day limit, write shipWithinDays(weights, days) — the smallest capacity that ships everything in time. Write the predicate first, then the bounds, then the loop. Explain why the answer is the smallest feasible capacity, not the average weight.",
        },
        {
          kind: "recap",
          points: [
            "Binary search works on any monotone predicate, not only on a sorted array.",
            "The answer is the boundary between infeasible and feasible; the invariant keeps it inside [lo, hi].",
            "Cost is O(n log R): one O(n) predicate evaluation per halving of the answer range.",
            "A non-monotone predicate, a wrong bound, or a floored division in the predicate all return plausible wrong answers.",
          ],
        },
      ],
      sources: [
        {
          label: "CP-Algorithms — Binary Search",
          url: "https://cp-algorithms.com/num_methods/binary_search.html",
        },
        {
          label: "GeeksforGeeks — Binary Search",
          url: "https://www.geeksforgeeks.org/binary-search/",
        },
      ],
      attribution:
        "Synthesis of CP-Algorithms' binary-search article and GeeksforGeeks' binary-search guide.",
    },
  ],
  task: {
    brief:
      "Binary search must use mid = floor((lo+hi)/2) and narrow with lo=mid+1 / hi=mid-1. The start code uses mid = (lo+hi)/2 (float) and lo=mid (infinite loop). Fix it.",
    startState: {
      data: { code: "while (lo <= hi) { const mid = (lo+hi)/2; ... }" },
      completedSteps: [],
      criteriaMet: [],
      attempts: 0,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    solutionState: {
      data: {
        code: "while (lo <= hi) { const mid = Math.floor((lo+hi)/2); ... }",
      },
      completedSteps: ["fix-mid"],
      criteriaMet: ["mid-integer"],
      attempts: 1,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    steps: [
      {
        id: "fix-mid",
        title: "Integer mid",
        brief: "Use Math.floor((lo + hi) / 2) so mid is an integer index.",
        hint: "A float mid is not a valid array index and the loop never terminates.",
        reveal: "const mid = Math.floor((lo + hi) / 2);",
        check: (s) => {
          const d = s.data as { code: string };
          return {
            passed: d.code.includes("Math.floor"),
            progress: d.code.includes("Math.floor") ? "1/1" : "0/1",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "mid-integer",
        label: "mid is floored to an integer",
        required: true,
        assert: (s) => {
          const d = s.data as { code: string };
          return d.code.includes("Math.floor");
        },
        explain: "A non-integer mid breaks indexing and can infinite-loop.",
      },
    ],
  },
  interviewByte: {
    shape: "Implement binary search and state its complexity.",
    strongAnswer:
      "O(log n) time, O(1) space iterative. State the invariant, the sorted precondition, and the boundary updates. For search-on-answer, state the monotone predicate and the range.",
    trap: "Forgetting the array must be sorted, using mid = (lo+hi)/2 with overflow risk, or binary-searching a predicate that is not monotone.",
  },
  recap: [
    "Linear search O(n); binary search O(log n) on sorted input.",
    "Binary search on answer: the predicate must be monotone, and the answer is its boundary.",
    "Every bound update must move past mid, and the loop condition must match the update rule.",
    "Duplicates need lower-bound or upper-bound; plain binary search returns an arbitrary match.",
  ],
  attribution:
    "Synthesis of CP-Algorithms and GeeksforGeeks' binary-search material, with Open Data Structures ch. 2 for linear search.",
};
