import type { DsaModule } from "../types";

export const sortingModule: DsaModule = {
  slug: "sorting",
  order: 6,
  part: 1,
  partTitle: "Core data structures",
  title: "Sorting",
  description:
    "Bubble, selection, insertion, merge, quick, counting, radix — and when to use which.",
  kind: "lesson+task",
  story:
    "Every search, every merge, every 'is this sorted?' check assumes you can sort. Sorting is the foundation most other algorithms build on.",
  chapters: [
    {
      slug: "elementary",
      title: "Elementary sorts",
      lessonSlug: "elementary-sorts",
    },
    { slug: "merge-sort", title: "Merge sort", lessonSlug: "merge-sort" },
    { slug: "quick-sort", title: "Quick sort", lessonSlug: "quick-sort" },
    {
      slug: "linear-sorts",
      title: "Linear-time sorts",
      lessonSlug: "linear-sorts",
    },
  ],
  lessons: [
    {
      slug: "elementary-sorts",
      title: "Elementary sorts (bubble, selection, insertion)",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>A log viewer receives 50,000 events per hour. Almost all arrive in timestamp order; the network occasionally swaps two adjacent events, so about 200 adjacent pairs are out of place. Calling <code>sort()</code> on every refresh is <code>O(n log n)</code> and reorders the whole array, even though only those pairs need fixing.</p>
            <p>Insertion sort on this input does one comparison per event plus one shift per inversion. With 200 inversions that is about 50,000 comparisons and 200 shifts — not 50,000 multiplications by 16. The <code>O(n²)</code> label describes the worst case, not this one.</p>
            <p>The three elementary sorts are usually dismissed as teaching examples. That is half true: their worst case is quadratic, but they optimise different things. Insertion sort is adaptive, selection sort minimises writes, and bubble sort can detect an already-sorted array in one pass. Knowing which invariant each maintains is how you know when the label matters.</p>
          `,
        },
        {
          kind: "concept",
          title: "Insertion sort: grow a sorted prefix",
          body: `
            <p>The invariant is: before iteration <code>i</code>, <code>arr[0 … i−1]</code> is sorted and contains exactly the first <code>i</code> original elements. Take the next element as <code>key</code>, shift every larger element in the prefix one slot right, and drop <code>key</code> into the gap.</p>
            <p>Trace <code>[5, 2, 4, 6, 1, 3]</code>:</p>
            <ul>
              <li><code>i = 1</code>, key 2: shift 5 → <code>[2, 5, 4, 6, 1, 3]</code>.</li>
              <li><code>i = 2</code>, key 4: shift 5 → <code>[2, 4, 5, 6, 1, 3]</code>.</li>
              <li><code>i = 3</code>, key 6: 6 is already larger than 5 → no shift.</li>
              <li><code>i = 4</code>, key 1: shift 6, 5, 4, 2 → <code>[1, 2, 4, 5, 6, 3]</code>.</li>
              <li><code>i = 5</code>, key 3: shift 6, 5, 4 → <code>[1, 2, 3, 4, 5, 6]</code>.</li>
            </ul>
            <p>The number of shifts equals the number of <strong>inversions</strong>: pairs <code>i &lt; j</code> with <code>arr[i] &gt; arr[j]</code>. Comparisons are <code>(n − 1) + inversions</code>, because each iteration makes one comparison that stops the scan. Best case is a sorted array: <code>n − 1</code> comparisons, <code>O(n)</code>. Worst case is reverse-sorted: <code>n(n − 1)/2</code> comparisons and shifts, <code>O(n²)</code>. Space is <code>O(1)</code>.</p>
            <p>The loop shifts while <code>arr[j] &gt; key</code>, not <code>&gt;=</code>. That single character is what makes insertion sort <strong>stable</strong>: equal elements never jump over each other.</p>
          `,
        },
        {
          kind: "concept",
          title: "Selection sort: n − 1 swaps",
          body: `
            <p>Selection sort maintains a different invariant: <code>arr[0 … i−1]</code> holds the <code>i</code> smallest elements, in sorted order. To extend it, scan the unsorted suffix for its minimum and swap that minimum into position <code>i</code>.</p>
            <p>Trace <code>[5, 3, 8, 1]</code>: the minimum of the whole array is 1 at index 3, so swap with index 0 → <code>[1, 3, 8, 5]</code>. The suffix minimum is 3, already in place. Then 5 at index 3 swaps with index 2 → <code>[1, 3, 5, 8]</code>.</p>
            <p>The comparison count never changes: finding the minimum of a suffix of length <code>k</code> takes <code>k − 1</code> comparisons, so the total is <code>n(n − 1)/2</code> regardless of the input. But the number of writes is exactly <code>n − 1</code> swaps — at most <code>3(n − 1)</code> assignments. That is why selection sort is used when writes are expensive: flash memory, EEPROM, or a remote store with a write budget.</p>
            <p>It is <strong>not stable</strong>. On <code>[2a, 2b, 1]</code>, the first swap moves 1 to the front and 2a to the end, producing <code>[1, 2b, 2a]</code> — the two equal keys changed order. If stability matters, selection sort is the wrong tool.</p>
          `,
        },
        {
          kind: "concept",
          title: "Bubble sort: the pass invariant",
          body: `
            <p>Bubble sort compares adjacent pairs and swaps when they are out of order. After pass <code>k</code>, the largest <code>k</code> elements are in their final positions at the end of the array: each pass bubbles the largest remaining value to the right.</p>
            <p>Trace <code>[5, 3, 8, 1]</code>. Pass 1: compare 5 and 3 → swap → <code>[3, 5, 8, 1]</code>; compare 5 and 8 → no swap; compare 8 and 1 → swap → <code>[3, 5, 1, 8]</code>. Pass 2 works on <code>[3, 5, 1]</code>: 3 and 5 stay, 5 and 1 swap → <code>[3, 1, 5, 8]</code>. Pass 3: 3 and 1 swap → <code>[1, 3, 5, 8]</code>.</p>
            <p>The worst case is <code>n(n − 1)/2</code> comparisons and swaps, and each swap is three writes, so it is usually slower than insertion sort on the same input. Its one practical trick is the <strong>early exit</strong>: keep a flag set whenever a swap happens; if a full pass makes no swaps, the array is sorted and the algorithm stops. On already-sorted input that is <code>n − 1</code> comparisons and <code>O(n)</code> time.</p>
            <p>Bubble sort is stable because it swaps only when <code>arr[j] &gt; arr[j + 1]</code>. Equal neighbours are left alone.</p>
          `,
        },
        {
          kind: "concept",
          title: "Choosing one, and where they break",
          body: `
            <p>Use insertion sort when the array is small or nearly sorted, because its cost tracks the number of inversions. Use selection sort when writes are much more expensive than reads. Use bubble sort when you need a one-pass sortedness check or when you are teaching the swap primitive — not when you need throughput.</p>
            <p>All three are comparison sorts, and every comparison sort has an <code>Ω(n log n)</code> lower bound in the worst case: with <code>n!</code> possible orders, a decision tree needs at least <code>log₂(n!) = Θ(n log n)</code> comparisons. Elementary sorts beat that bound only on inputs that are already partly ordered, which is exactly what adaptivity buys.</p>
            <p>Edge cases decide correctness. An empty array and a one-element array must not enter the loop. All-equal input is the best case for insertion and bubble (<code>O(n)</code> comparisons, zero shifts) but the worst case for selection, which still scans every suffix. Reverse-sorted input is the worst case for all three. And stability matters when you sort records by one key after another: a stable sort preserves the previous order among equal keys, which is what makes multi-key sorting work.</p>
            <p>None of this makes the algorithms obsolete. Timsort, the sort behind JavaScript's <code>Array.prototype.sort</code>, uses insertion sort for short runs and merges them. The quadratic algorithm is a component, not a competitor.</p>
          `,
        },
        {
          kind: "code",
          title: "Insertion sort and inversion count",
          language: "javascript",
          starter: `function insertionSort(arr) {
  // Sort in place and return arr.
  return arr;
}

function countInversions(arr) {
  // Count pairs i < j with arr[i] > arr[j], in O(n^2).
  return 0;
}`,
          solution: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

function countInversions(arr) {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) count++;
    }
  }
  return count;
}`,
          tests: [
            { input: "insertionSort([])", expected: "[]" },
            { input: "insertionSort([1])", expected: "[1]" },
            { input: "insertionSort([3,2,1])", expected: "[1,2,3]" },
            { input: "insertionSort([1,2,3])", expected: "[1,2,3]" },
            { input: "insertionSort([2,1,2,1])", expected: "[1,1,2,2]" },
            { input: "insertionSort([5,-1,0,-3])", expected: "[-3,-1,0,5]" },
            { input: "countInversions([3,2,1])", expected: "3" },
            { input: "countInversions([2,1,3])", expected: "1" },
            { input: "countInversions([1,2,3])", expected: "0" },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "Insertion sort on an already-sorted array is O(n), but selection sort is always O(n²). Explain both from their invariants, then name one real workload where selection sort's n − 1 swaps make it the better choice.",
        },
        {
          kind: "recap",
          points: [
            "Insertion sort grows a sorted prefix; its comparisons are (n − 1) + inversions, so it is O(n) on sorted input and O(n²) on reverse-sorted input.",
            "Selection sort always does n(n − 1)/2 comparisons but only n − 1 swaps; it is not stable.",
            "Bubble sort's pass invariant puts the largest k elements in place after k passes; the no-swap flag gives an O(n) best case.",
            "Comparison sorts are Ω(n log n) in the worst case; elementary sorts win only on small, nearly sorted, or write-constrained inputs.",
          ],
        },
      ],
      sources: [
        {
          label: "Princeton — Elementary Sorts (2.1)",
          url: "https://algs4.cs.princeton.edu/21elementary/",
        },
        {
          label: "VisuAlgo — Sorting",
          url: "https://visualgo.net/en/sorting",
        },
      ],
      attribution:
        "Synthesis of Princeton's Elementary Sorts (Sedgewick/Wayne) and VisuAlgo's sorting visualisation.",
    },
    {
      slug: "merge-sort",
      title: "Merge sort",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>A dashboard must sort ten million rows that do not fit in memory. Quicksort needs random access to the whole array; merge sort reads two sorted runs sequentially, writes one, and repeats. That is exactly the shape of external sorting, where the data lives on disk and sequential I/O is the only cheap operation.</p>
            <p>The same merge step appears far beyond sorting: merging two sorted lists, merging <code>k</code> sorted lists with a heap, counting inversions, and computing the union of two sorted sets all use the same two-pointer walk. Learn the merge invariant once and you reuse it everywhere.</p>
          `,
        },
        {
          kind: "concept",
          title: "Divide, sort, merge",
          body: `
            <p>Merge sort splits the array at the midpoint, sorts each half recursively, and merges the two sorted halves. The base case is a range of length 0 or 1, which is already sorted.</p>
            <p>Trace <code>[5, 2, 4, 6, 1, 3]</code>. Split into <code>[5, 2, 4]</code> and <code>[6, 1, 3]</code>. The left half splits into <code>[5]</code> and <code>[2, 4]</code>; <code>[2, 4]</code> splits into <code>[2]</code> and <code>[4]</code> and merges back to <code>[2, 4]</code>, then <code>[5]</code> merges with <code>[2, 4]</code> to give <code>[2, 4, 5]</code>. The right half becomes <code>[1, 3, 6]</code> the same way.</p>
            <p>The final merge walks two pointers. Compare 2 and 1 → take 1. Compare 2 and 3 → take 2. Compare 4 and 3 → take 3. Compare 4 and 6 → take 4. Compare 5 and 6 → take 5. The right half is exhausted, so append 6. Result: <code>[1, 2, 3, 4, 5, 6]</code>.</p>
            <p>The merge invariant is: <code>out</code> contains the smallest <code>i + j</code> elements of the two inputs, in sorted order. Each comparison appends the smaller head and advances that pointer, so the invariant is preserved. When one input is exhausted, the other is already sorted, so its remainder can be appended without comparisons.</p>
          `,
        },
        {
          kind: "concept",
          title: "Why the merge is correct — and stable",
          body: `
            <p>Correctness follows from the invariant. At every step, the smallest remaining element of either input is at one of the two heads: if it were deeper, a smaller element would have to precede it, contradicting sortedness. Taking the smaller head is therefore safe. The loop ends when one pointer reaches the end, and the append step handles the rest.</p>
            <p>Stability comes from one comparison: when <code>a[i] === b[j]</code>, take from the left input. Equal elements from the left half then appear before equal elements from the right half, which is their original relative order. Changing <code>&lt;=</code> to <code>&lt;</code> silently breaks stability.</p>
            <p>This is also why merge sort is the standard choice for linked lists. Merging two sorted lists only rewires <code>next</code> pointers; no element moves and no auxiliary array is needed. The recursion still uses <code>O(log n)</code> stack frames, and a bottom-up version can avoid even that.</p>
          `,
        },
        {
          kind: "concept",
          title: "Cost: n per level, log n levels",
          body: `
            <p>Write the recurrence: <code>T(n) = 2T(n/2) + Θ(n)</code>. The <code>Θ(n)</code> is the merge, which examines each element once. Expand it as a tree. The root costs <code>n</code>. Its two children each cost <code>n/2</code>, so the second level costs <code>n</code>. Every full level costs <code>n</code>, and the subproblem size halves until it reaches 1, which takes <code>log₂ n</code> levels. Total: <code>Θ(n log n)</code>.</p>
            <p>The Master theorem agrees: <code>a = 2</code>, <code>b = 2</code>, so the watershed is <code>n^(log₂ 2) = n</code>; the merge cost is <code>Θ(n)</code>, which is case 2, giving <code>Θ(n log n)</code>.</p>
            <p>Space is the price. An array implementation needs an auxiliary buffer of <code>n</code> elements for the merge, plus <code>O(log n)</code> recursion frames. Some implementations allocate a fresh array at every merge, which is still <code>O(n)</code> at the top level but creates a lot of garbage; a single reusable buffer is kinder to the allocator.</p>
            <p>The comparison count is between roughly <code>(n log₂ n)/2</code> and <code>n log₂ n</code>. That is the same order as the lower bound, but with a constant factor that is larger than quicksort's on typical in-memory data.</p>
          `,
        },
        {
          kind: "concept",
          title: "Where it breaks, and when it wins",
          body: `
            <p>The <code>O(n)</code> extra memory is the main objection. For a few hundred elements, insertion sort is faster because it has no allocation and better constants. Production merge sorts therefore stop recursing at a cutoff (often 7–16 elements) and finish with insertion sort; Timsort goes further and detects existing runs before merging.</p>
            <p>Merge sort is not adaptive on its own: it does the same <code>n log n</code> work on sorted input. It is also not in-place, and the recursive version can overflow the stack only at absurd depths because the depth is logarithmic.</p>
            <p>Choose merge sort when you need stability, when the data is a linked list, when you are sorting externally, or when you need a guaranteed <code>n log n</code> bound regardless of input order. Choose quicksort when you need in-place operation and average speed on arrays. Choose a linear sort when the keys are bounded integers — the next lessons cover both.</p>
            <p>The merge step itself is the reusable asset. “Merge two sorted arrays” is a one-pass <code>O(n + m)</code> operation, and “merge k sorted lists” is the same walk driven by a min-heap.</p>
          `,
        },
        {
          kind: "code",
          title: "Merge sort",
          language: "javascript",
          starter: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  // TODO: merge left and right
  return arr;
}

function merge(a, b) {
  // TODO: merge two sorted arrays into one sorted array.
  return [];
}`,
          solution: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}`,
          tests: [
            { input: "mergeSort([])", expected: "[]" },
            { input: "mergeSort([1])", expected: "[1]" },
            { input: "mergeSort([3,2,1])", expected: "[1,2,3]" },
            { input: "mergeSort([2,1,2,1])", expected: "[1,1,2,2]" },
            { input: "mergeSort([5,-1,0,-3])", expected: "[-3,-1,0,5]" },
            { input: "merge([1,3,5],[2,4])", expected: "[1,2,3,4,5]" },
            { input: "merge([],[1,2])", expected: "[1,2]" },
            { input: "merge([1,2],[])", expected: "[1,2]" },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "Change the merge comparison from `a[i] <= b[j]` to `a[i] < b[j]` and find an input where the sorted values are identical but the stability guarantee is broken. Then explain why the trailing loops need no comparisons.",
        },
        {
          kind: "recap",
          points: [
            "Merge sort splits at the midpoint, sorts both halves, and merges them with two pointers.",
            "The merge invariant — out holds the smallest i + j elements in order — proves correctness; taking from the left on ties preserves stability.",
            "T(n) = 2T(n/2) + Θ(n) gives Θ(n log n) time, with n per level over log₂ n levels.",
            "It costs O(n) auxiliary space and is not adaptive; it wins when stability, linked lists, external sorting, or a guaranteed bound matter.",
          ],
        },
      ],
      sources: [
        {
          label: "Princeton — Mergesort (2.2)",
          url: "https://algs4.cs.princeton.edu/22mergesort/",
        },
        {
          label: "VisuAlgo — Sorting",
          url: "https://visualgo.net/en/sorting",
        },
      ],
      attribution:
        "Synthesis of Princeton's Mergesort (Sedgewick/Wayne) and VisuAlgo's sorting visualisation.",
    },
    {
      slug: "quick-sort",
      title: "Quick sort",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>You need to sort a million 32-bit integers in memory, as fast as possible. Merge sort gives a guaranteed <code>n log n</code> but allocates a second array; quicksort partitions in place, and its sequential accesses are friendly to the cache. The catch is that the same algorithm is <code>O(n²)</code> on sorted input if the pivot is chosen badly, and it is not stable.</p>
            <p>Quicksort is the classic example of an algorithm whose average case is excellent and whose worst case is catastrophic. The engineering is in making the worst case unlikely and in knowing when that is not enough.</p>
          `,
        },
        {
          kind: "concept",
          title: "Partition around a pivot",
          body: `
            <p>Pick a pivot, rearrange the range so that everything at or below the pivot is on its left and everything above is on its right, then recurse on both sides. The pivot ends in its final sorted position, so it is excluded from both recursive calls.</p>
            <p>Lomuto's scheme uses the last element as the pivot and one boundary index <code>i</code>. Walk <code>j</code> from <code>lo</code> to <code>hi − 1</code>; whenever <code>arr[j] &lt;= pivot</code>, swap it to <code>i</code> and advance <code>i</code>. At the end, swap the pivot into <code>i</code>.</p>
            <p>Trace <code>[5, 2, 4, 6, 1, 3]</code> with pivot 3:</p>
            <ul>
              <li><code>j = 0</code>, 5 &gt; 3: no swap.</li>
              <li><code>j = 1</code>, 2 ≤ 3: swap indices 0 and 1 → <code>[2, 5, 4, 6, 1, 3]</code>, <code>i = 1</code>.</li>
              <li><code>j = 2</code>, 4 &gt; 3: no swap; <code>j = 3</code>, 6 &gt; 3: no swap.</li>
              <li><code>j = 4</code>, 1 ≤ 3: swap indices 1 and 4 → <code>[2, 1, 4, 6, 5, 3]</code>, <code>i = 2</code>.</li>
              <li>Swap the pivot at index 5 with index 2 → <code>[2, 1, 3, 6, 5, 4]</code>; partition returns 2.</li>
            </ul>
            <p>Recurse on <code>[2, 1]</code> and <code>[6, 5, 4]</code>, and the result is <code>[1, 2, 3, 4, 5, 6]</code>. The partition invariant is: <code>arr[lo … i−1] ≤ pivot</code>, <code>arr[i … j−1] &gt; pivot</code>, and <code>arr[j … hi−1]</code> is unexamined. The final swap places the pivot between the two regions.</p>
          `,
        },
        {
          kind: "concept",
          title: "Why it works, and why equal keys matter",
          body: `
            <p>Each partition returns an index <code>p</code> with the pivot in its final position. The left range is strictly smaller than the original (it excludes <code>p</code>), and so is the right range, so the recursion terminates. By induction, both sides sort correctly, and the pivot is already where it belongs.</p>
            <p>Lomuto's scheme sends every element equal to the pivot to the left. On an array of identical values, every partition returns <code>hi</code>, so the left call is on <code>n − 1</code> elements and the right call is empty. That is the worst-case split, repeated: <code>T(n) = T(n − 1) + Θ(n) = Θ(n²)</code>, even though the array is already sorted.</p>
            <p>Hoare's two-pointer partition handles equal keys better: pointers move inward from both ends and stop on equal elements, so an all-equal array splits roughly in half. If you expect many duplicates, use a three-way partition (Dutch national flag) that groups <code>&lt; pivot</code>, <code>= pivot</code>, and <code>&gt; pivot</code> in one pass and recurses only on the outer groups.</p>
          `,
        },
        {
          kind: "concept",
          title: "Cost: balanced versus unbalanced",
          body: `
            <p>A balanced partition gives <code>T(n) = 2T(n/2) + Θ(n)</code>, the same recurrence as merge sort, so <code>Θ(n log n)</code>. An unbalanced partition that removes one element gives <code>T(n) = T(n − 1) + Θ(n)</code>, which sums to <code>Θ(n²)</code>.</p>
            <p>With a random pivot, every split is a random variable, and the expected number of comparisons is about <code>1.39 n log₂ n</code> (equivalently <code>2n ln n</code>). That is why quicksort is usually faster than merge sort on arrays: it does fewer comparisons on average and partitions in place.</p>
            <p>Space is the recursion stack: <code>O(log n)</code> on balanced splits, <code>O(n)</code> in the worst case. Recurse on the smaller side first and loop on the larger side, and the stack depth becomes <code>O(log n)</code> even when the splits are bad.</p>
            <p>Pivot choice is the control. Taking the last element makes sorted or reverse-sorted input the worst case. Randomising the pivot makes that input benign with high probability. Median-of-three (first, middle, last) is a cheap deterministic improvement, and introsort switches to heapsort after <code>2⌊log₂ n⌋</code> levels, which turns the worst case into <code>O(n log n)</code>.</p>
          `,
        },
        {
          kind: "concept",
          title: "Where it breaks, and what production sorts do",
          body: `
            <p>Quicksort is not stable. Equal keys can cross during a partition, so it cannot be the last step of a multi-key sort unless you sort by a composite key.</p>
            <p>Adversarial input is real. If an attacker knows your pivot rule, they can craft an array that forces quadratic behaviour — the classic “quicksort killer”. Randomisation or a deterministic median-of-three with an introsort fallback closes that hole.</p>
            <p>Small ranges are dominated by overhead. Production implementations switch to insertion sort below a cutoff (often 8–16 elements), where the quadratic algorithm has better constants. They also avoid recursive calls on the larger side to bound stack depth.</p>
            <p>JavaScript's <code>Array.prototype.sort</code> is Timsort, not quicksort, because the language promises stability. If you need quicksort's in-place behaviour, you write it yourself. If you need the <code>k</code>-th smallest element rather than a full sort, quickselect recurses only into the side containing <code>k</code> and runs in <code>O(n)</code> average time.</p>
          `,
        },
        {
          kind: "code",
          title: "Quicksort (Lomuto partition)",
          language: "javascript",
          starter: `function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr;
  // TODO: partition, then recurse on both sides.
  return arr;
}

function partition(arr, lo, hi) {
  // TODO: Lomuto partition around arr[hi]; return the pivot index.
  return lo;
}`,
          solution: `function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr;
  const p = partition(arr, lo, hi);
  quickSort(arr, lo, p - 1);
  quickSort(arr, p + 1, hi);
  return arr;
}

function partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  return i;
}`,
          tests: [
            { input: "quickSort([])", expected: "[]" },
            { input: "quickSort([1])", expected: "[1]" },
            { input: "quickSort([3,2,1])", expected: "[1,2,3]" },
            { input: "quickSort([1,2,3])", expected: "[1,2,3]" },
            { input: "quickSort([2,2,1])", expected: "[1,2,2]" },
            { input: "quickSort([5,-1,0,-3])", expected: "[-3,-1,0,5]" },
            {
              input:
                "(() => { const a = [3,1,2]; const p = partition(a, 0, 2); return [p, ...a]; })()",
              expected: "[1,1,2,3]",
            },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "Run the Lomuto partition on `[1, 1, 1, 1]` by hand and count the comparisons. Then explain why three-way partitioning changes the recurrence on this input.",
        },
        {
          kind: "recap",
          points: [
            "Partition puts the pivot in its final position and divides the range into ≤ pivot and > pivot regions.",
            "Balanced splits give Θ(n log n); a split that removes one element gives Θ(n²), which is why pivot choice matters.",
            "Random pivots, median-of-three, and an introsort depth limit make the worst case unlikely or bounded.",
            "Quicksort is in-place but not stable; duplicates and sorted input are the two traps.",
          ],
        },
      ],
      sources: [
        {
          label: "Princeton — Quicksort (2.3)",
          url: "https://algs4.cs.princeton.edu/23quicksort/",
        },
        {
          label: "VisuAlgo — Sorting",
          url: "https://visualgo.net/en/sorting",
        },
      ],
      attribution:
        "Synthesis of Princeton's Quicksort (Sedgewick/Wayne) and VisuAlgo's sorting visualisation.",
    },
    {
      slug: "linear-sorts",
      title: "Linear-time sorts (counting, radix, bucket)",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>You must sort one million exam scores, each an integer from 0 to 100. A comparison sort needs about 20 million comparisons. Counting sort needs one pass to count, one pass over 101 buckets, and one pass to write — roughly two million operations, because it never compares two scores.</p>
            <p>The catch is the constraint: bounded integer keys. Remove it and the method collapses. Counting sort on 32-bit ids would allocate an array of four billion counters; bucket sort on keys that all land in one bucket degenerates to insertion sort. These algorithms trade generality for a smaller asymptotic class, and the trade only works when the key structure is known.</p>
          `,
        },
        {
          kind: "concept",
          title: "Counting sort",
          body: `
            <p>Counting sort assumes integer keys in a known range. Count how many times each value occurs, turn the counts into starting positions with a prefix sum, then place each element at its position. For plain numbers, the count-and-expand version is enough; for records, place from right to left so equal keys keep their original order.</p>
            <p>Trace <code>[4, 2, 2, 8, 3, 3, 1]</code>. The counts for values 1 through 8 are <code>[1, 2, 2, 1, 0, 0, 0, 1]</code>. Expanding in value order gives <code>[1, 2, 2, 3, 3, 4, 8]</code>. The cost is <code>O(n + k)</code>, where <code>k</code> is the number of possible values, and the space is <code>O(n + k)</code>.</p>
            <p>Negative keys are handled with an offset: subtract the minimum before indexing and add it back on output, so <code>k = max − min + 1</code>. If <code>k</code> is much larger than <code>n</code> — say, 32-bit ids with a sparse range — the counter array dominates and counting sort loses to a comparison sort.</p>
          `,
        },
        {
          kind: "concept",
          title: "Radix sort",
          body: `
            <p>Radix sort removes the “small range” restriction by sorting one digit at a time. LSD radix sort processes the least significant digit first, using a <strong>stable</strong> counting sort for each digit. After <code>d</code> passes, the keys are sorted.</p>
            <p>Trace <code>[13, 21, 32, 11]</code> in base 10. Sort by units: 21 and 11 have unit 1 (in that order), 32 has 2, 13 has 3 → <code>[21, 11, 32, 13]</code>. Sort by tens: 11 and 13 have ten 1 (in that order), 21 has 2, 32 has 3 → <code>[11, 13, 21, 32]</code>. Sorted.</p>
            <p>Stability is not a nicety here; it is the correctness argument. A later pass must not disturb the order established by earlier passes. The cost is <code>O(d · (n + b))</code> for <code>d</code> digits in base <code>b</code>, with <code>O(n + b)</code> space. For 32-bit integers, four passes of 8 bits each is a common choice.</p>
            <p>MSD radix sort goes the other way and is useful for strings: partition by the first character, then recurse within each group. It can stop early on short keys, but it needs a more careful implementation than the LSD loop.</p>
          `,
        },
        {
          kind: "concept",
          title: "Bucket sort",
          body: `
            <p>Bucket sort assumes the keys are spread evenly over a range. Divide the range into <code>k</code> buckets, distribute each element into its bucket, sort each bucket with insertion sort, and concatenate the buckets in order.</p>
            <p>If the distribution is uniform, each bucket holds about <code>n/k</code> elements, and the total expected cost is <code>O(n + k)</code>. If every key lands in one bucket, the algorithm is just insertion sort on <code>n</code> elements: <code>O(n²)</code>. The distribution assumption is the whole algorithm.</p>
            <p>Bucket sort is common for floating-point values in <code>[0, 1)</code>: multiply by <code>k</code>, floor to get the bucket. It is stable if each bucket sort is stable and the buckets are concatenated in order. It is not a comparison sort, so the <code>Ω(n log n)</code> lower bound does not apply.</p>
          `,
        },
        {
          kind: "concept",
          title: "The lower bound, and when linear sorts apply",
          body: `
            <p>Every comparison sort has a decision tree with <code>n!</code> leaves, one per possible ordering. A binary tree with <code>n!</code> leaves has depth at least <code>log₂(n!)</code>, and Stirling's approximation gives <code>log₂(n!) = Θ(n log n)</code>. That is the bound counting, radix, and bucket sort escape: they do not compare keys, they use the keys' structure.</p>
            <p>The constraints are strict. Counting sort needs a small integer range. Radix sort needs fixed-width digits and a stable per-digit sort. Bucket sort needs a distribution that is close to uniform. Strings work with radix if you handle variable length, but the implementation is more involved; arbitrary objects with no meaningful digit decomposition do not work at all.</p>
            <p>Where they break: a sparse 32-bit range blows up counting sort's memory; negative numbers need an offset or a sign split; a skewed distribution turns bucket sort quadratic; and a non-stable digit sort silently produces a wrong radix result. In JavaScript, <code>Array.prototype.sort</code> is comparison-based, so these algorithms are manual loops. Also avoid <code>Math.max(...arr)</code> on very large arrays — the spread becomes an argument list and can overflow the call stack; scan with a loop instead.</p>
          `,
        },
        {
          kind: "code",
          title: "Counting sort with negative keys",
          language: "javascript",
          starter: `function countingSort(arr) {
  // Sort integers (including negatives) in O(n + k),
  // where k = max - min + 1. Return a new sorted array.
  return arr;
}`,
          solution: `function countingSort(arr) {
  if (arr.length === 0) return arr;

  let min = arr[0];
  let max = arr[0];
  for (const x of arr) {
    if (x < min) min = x;
    if (x > max) max = x;
  }

  const count = new Array(max - min + 1).fill(0);
  for (const x of arr) count[x - min]++;

  const out = [];
  for (let i = 0; i < count.length; i++) {
    for (let c = 0; c < count[i]; c++) out.push(i + min);
  }
  return out;
}`,
          tests: [
            { input: "countingSort([])", expected: "[]" },
            { input: "countingSort([1])", expected: "[1]" },
            {
              input: "countingSort([4,2,2,8,3,3,1])",
              expected: "[1,2,2,3,3,4,8]",
            },
            { input: "countingSort([0,0,0])", expected: "[0,0,0]" },
            { input: "countingSort([-3,0,-3,2])", expected: "[-3,-3,0,2]" },
            { input: "countingSort([5,-1,0,-3])", expected: "[-3,-1,0,5]" },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "A colleague uses counting sort on 32-bit user ids and the process runs out of memory. Explain why, then describe the two changes that would make radix sort a better fit and the extra cost each one adds.",
        },
        {
          kind: "recap",
          points: [
            "Counting sort counts keys and expands them in order: O(n + k) time and space for integer keys in a range of size k.",
            "Radix sort applies a stable counting sort per digit: O(d(n + b)) for d digits in base b.",
            "Bucket sort distributes keys into buckets and sorts each: O(n) expected for uniform keys, O(n²) if they cluster.",
            "Comparison sorts are Ω(n log n); linear sorts win only when key structure — bounded range, fixed width, or uniform distribution — is guaranteed.",
          ],
        },
      ],
      sources: [
        {
          label: "Princeton — Radix Sort (5.1)",
          url: "https://algs4.cs.princeton.edu/51radix/",
        },
        {
          label: "Open Data Structures, ch. 11 — Sorting Algorithms",
          url: "https://opendatastructures.org/ods-java/11_Sorting_Algorithms.html",
        },
      ],
      attribution:
        "Synthesis of Princeton's Radix Sort (Sedgewick/Wayne) and Open Data Structures ch. 11 (Morin).",
    },
  ],
  task: {
    brief:
      "Merge sort's merge step must handle leftover elements in both arrays. The start code forgets the trailing loops. Fix it.",
    startState: {
      data: {
        code: "while (i < a.length && j < b.length) { ... } // missing trailing loops",
      },
      completedSteps: [],
      criteriaMet: [],
      attempts: 0,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    solutionState: {
      data: {
        code: "while (i < a.length && j < b.length) { ... } while (i < a.length) out.push(a[i++]); while (j < b.length) out.push(b[j++]);",
      },
      completedSteps: ["add-trailing"],
      criteriaMet: ["merge-complete"],
      attempts: 1,
      revealed: [],
      updatedAt: new Date().toISOString(),
    },
    steps: [
      {
        id: "add-trailing",
        title: "Drain the remainder",
        brief:
          "After the main loop, push any remaining elements from both arrays.",
        hint: "One of a or b may still have elements when the other is exhausted.",
        reveal:
          "while (i < a.length) out.push(a[i++]); while (j < b.length) out.push(b[j++]);",
        check: (s) => {
          const d = s.data as { code: string };
          return {
            passed: d.code.includes("while (i < a.length)"),
            progress: d.code.includes("while (i < a.length)") ? "1/1" : "0/1",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "merge-complete",
        label: "merge drains both arrays",
        required: true,
        assert: (s) => {
          const d = s.data as { code: string };
          return (
            d.code.includes("while (i < a.length)") &&
            d.code.includes("while (j < b.length)")
          );
        },
        explain:
          "Forgetting the trailing loops drops elements and produces a shorter array.",
      },
    ],
  },
  interviewByte: {
    shape: "Which sort would you use and why?",
    strongAnswer:
      "Ask about stability, memory, and key constraints first. Comparison sorts are Ω(n log n): merge sort is stable with O(n) space, quicksort is in-place with an O(n²) worst case, and counting/radix sorts need bounded integer keys.",
    trap: "Quoting average O(n log n) without mentioning quicksort's worst case, stability, or merge sort's O(n) extra space.",
  },
  recap: [
    "Elementary sorts are O(n²), but insertion sort is adaptive and selection sort minimises writes.",
    "Merge sort is stable with O(n) extra space; quicksort is in-place with an O(n²) worst case.",
    "Comparison sorts are Ω(n log n); counting, radix, and bucket sorts win only with bounded keys or uniform distribution.",
    "Stability is a requirement, not a detail — it decides whether multi-key sorts work.",
  ],
  attribution:
    "Synthesis of Princeton 2.1–2.3 and 5.1, VisuAlgo, and Open Data Structures ch. 11.",
};
