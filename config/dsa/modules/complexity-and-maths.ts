import type { DsaModule } from "../types";

export const complexityAndMathsModule: DsaModule = {
  slug: "complexity-and-maths",
  order: 2,
  part: 0,
  partTitle: "Foundations",
  title: "Complexity & Maths",
  description:
    "Counting operations, solving recurrences, and the number theory every DSA problem assumes.",
  kind: "lesson",
  story:
    "Half of 'hard' problems are easy once you can count operations and spot a recurrence.",
  chapters: [
    {
      slug: "counting-ops",
      title: "Counting operations",
      lessonSlug: "counting-ops",
    },
    { slug: "recurrences", title: "Recurrences", lessonSlug: "recurrences" },
    {
      slug: "number-basics",
      title: "Number basics",
      lessonSlug: "number-basics",
    },
  ],
  lessons: [
    {
      slug: "counting-ops",
      title: "Counting operations",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>You write two versions of the same feature. Both return <code>true</code> if an array contains a duplicate. The first compares every pair with a double loop; the second sorts a copy and scans it once. On ten items you cannot tell them apart — both finish before you blink.</p>
            <p>On 100,000 items the difference is not a constant factor. The pair loop performs about 5,000,000,000 comparisons in the worst case; the sort performs about 1,700,000. One is a demo, the other is a feature.</p>
            <p>The question this lesson answers is: how could you have known that before running either one? The answer is to count operations as a function of the input size, then keep only the part that grows fastest.</p>
          `,
        },
        {
          kind: "concept",
          title: "Count the work, not the lines",
          body: `
            <p>An <strong>elementary operation</strong> is anything the machine does in roughly constant time: an addition, a comparison, an array read, a variable assignment. Counting them is not about milliseconds. It is about how the count changes when <code>n</code> changes.</p>
            <p>Start with three loops and count exactly:</p>
            <ul>
              <li>A loop <code>for (let i = 0; i &lt; n; i++)</code> runs its body <code>n</code> times → <code>n</code>.</li>
              <li>Two nested loops over the same range run the inner body <code>n · n</code> times → <code>n²</code>.</li>
              <li>A loop that does <code>i *= 2</code> starting at 1 runs while <code>i &lt; n</code>. The values are 1, 2, 4, …, so it runs <code>⌈log₂ n⌉</code> times → <code>log n</code>.</li>
            </ul>
            <p>Now the two rules that turn an exact count into a complexity class. <strong>Drop constant factors:</strong> <code>3n</code> and <code>n</code> grow at the same rate, so both are <code>O(n)</code>. <strong>Drop lower-order terms:</strong> <code>n² + 5n + 100</code> is <code>O(n²)</code>, because at large <code>n</code> the squared term is the only one that decides whether doubling the input doubles the work or quadruples it.</p>
            <p>Formally, <code>f(n) = O(g(n))</code> means there are constants <code>c</code> and <code>n₀</code> such that <code>f(n) ≤ c · g(n)</code> for every <code>n ≥ n₀</code>. The constants are allowed to be ugly. What is not allowed is a different growth shape.</p>
          `,
        },
        {
          kind: "concept",
          title: "A trace you can do on paper",
          body: `
            <p>Take <code>n = 8</code> and the halving loop above. The values are 1, 2, 4 — three iterations, because the next value is 8 and the condition is <code>i &lt; n</code>. For <code>n = 1024</code> the values are 1, 2, 4, …, 512: ten iterations. Each iteration removes half of the remaining possibilities, which is why the count is logarithmic rather than linear.</p>
            <p>The same method works for a triangular loop:</p>
            <pre><code>for (let i = 0; i &lt; n; i++)
  for (let j = 0; j &lt;= i; j++)
    work();</code></pre>
            <p>When <code>i = 0</code> the inner body runs once; when <code>i = 1</code>, twice; …; when <code>i = n − 1</code>, <code>n</code> times. The total is <code>1 + 2 + … + n = n(n + 1)/2</code>. That is <code>n²/2 + n/2</code>, and after dropping the constant factor and the lower-order term it is <code>O(n²)</code>. You did not need a stopwatch; you needed the sum.</p>
            <p>Two loops written one after the other add: <code>O(n) + O(n) = O(n)</code>. A loop inside a loop multiplies: <code>O(n) · O(n) = O(n²)</code>. That is the whole arithmetic of complexity, and most “tricky” examples are one of these two moves plus a logarithm.</p>
          `,
        },
        {
          kind: "concept",
          title: "Worst case, average case, and amortised cost",
          body: `
            <p>An exact count usually depends on the input, not only its size. Linear search finds a match on the first comparison in the best case, on the last comparison in the worst case, and after about <code>n/2</code> comparisons on average. Big-O normally quotes the <strong>worst case</strong>, because that is the promise you can make without knowing the data.</p>
            <p>Amortised cost is different. A dynamic array that doubles its capacity when full performs <code>n</code> appends in <code>1 + 2 + 4 + … + n &lt; 2n</code> element copies, so the copies cost <code>O(1)</code> per append on average, even though one append in the sequence costs <code>O(n)</code>. The average is over a sequence of operations, not over random inputs.</p>
            <p>Space is counted the same way. Reversing an array in place uses a constant number of indices → <code>O(1)</code> auxiliary space. Building a second array of <code>n</code> elements → <code>O(n)</code>. A recursion that goes <code>n</code> levels deep uses <code>O(n)</code> stack frames even if every call does constant work.</p>
          `,
        },
        {
          kind: "concept",
          title: "Where counting goes wrong",
          body: `
            <p>The most common mistake is counting the lines you can see and missing the loop hidden inside a built-in. <code>arr.includes(x)</code> inside a loop over <code>n</code> elements is <code>O(n²)</code>, not <code>O(n)</code>. <code>arr.slice(0, k)</code> copies <code>k</code> elements. <code>str += ch</code> in a loop may copy the whole string each time in a language where strings are immutable. <code>splice(0, 1)</code> shifts every remaining element. None of those looks like a loop, and all of them are one.</p>
            <p>The second mistake is assuming a hash map is always <code>O(1)</code>. It is <code>O(1)</code> on average with a good hash function and a sane load factor; an adversarial set of keys that collide can degrade a lookup to <code>O(n)</code>. The average is a property of the hash function and the input distribution, not a law.</p>
            <p>The third is forgetting that recursion multiplies. A function that calls itself twice on <code>n − 1</code> does not do <code>2n</code> work; it does <code>2ⁿ</code>. Draw the first three levels and the branching becomes obvious. Memoisation is the standard fix, and it changes the count from the number of calls to the number of distinct subproblems.</p>
          `,
        },
        {
          kind: "code",
          title: "Count the iterations",
          language: "javascript",
          starter: `function triangular(n) {
  // Return the exact number of inner-loop runs for:
  // for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) work();
  return 0;
}

function halvingSteps(n) {
  // Return how many times n = Math.floor(n / 2) runs before n reaches 0.
  return 0;
}`,
          solution: `function triangular(n) {
  return (n * (n + 1)) / 2;
}

function halvingSteps(n) {
  let steps = 0;
  while (n > 0) {
    n = Math.floor(n / 2);
    steps += 1;
  }
  return steps;
}`,
          tests: [
            { input: "triangular(4)", expected: "10" },
            { input: "triangular(0)", expected: "0" },
            { input: "triangular(1)", expected: "1" },
            { input: "halvingSteps(8)", expected: "4" },
            { input: "halvingSteps(1)", expected: "1" },
            { input: "halvingSteps(0)", expected: "0" },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "Take a function you wrote recently that contains a loop. Write its iteration count as a formula in n, then reduce it to a complexity class. Now look for a hidden loop inside a built-in — includes, slice, splice, or string concatenation — and add its cost to the same formula.",
        },
        {
          kind: "recap",
          points: [
            "Count elementary operations as a function of n, then drop constants and lower-order terms.",
            "Sequential loops add; nested loops multiply; halving the range gives log n.",
            "Quote the worst case unless you can state the input distribution; amortised cost averages over a sequence of operations.",
            "Built-ins hide loops: includes, slice, splice and string concatenation can turn O(n) into O(n²).",
          ],
        },
      ],
      sources: [
        {
          label: "Princeton — Analysis of Algorithms (1.4)",
          url: "https://algs4.cs.princeton.edu/14analysis/",
        },
        {
          label: "MIT 6.006 — Introduction to Algorithms, lecture notes",
          url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/lecture-notes/",
        },
      ],
      attribution:
        "Synthesis of Princeton's Analysis of Algorithms (Sedgewick/Wayne) and MIT 6.006's lecture notes.",
    },
    {
      slug: "recurrences",
      title: "Recurrences (Master theorem)",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>Merge sort has no loop over the whole array that you can count. It splits the array in half, sorts each half the same way, then merges. To describe its cost you have to write the cost in terms of itself: <code>T(n) = 2T(n/2) + O(n)</code>.</p>
            <p>That equation is a <strong>recurrence</strong>. It is not circular — it is a recipe: two subproblems of half the size, plus linear work to combine them. Solve it and you get <code>O(n log n)</code>. Guess wrong about the recurrence and every later optimisation is aimed at the wrong term.</p>
            <p>The tools in this lesson are the recursion tree, which shows where the work actually goes, and the Master theorem, which answers the common shapes in one comparison.</p>
          `,
        },
        {
          kind: "concept",
          title: "Read the recurrence off the code",
          body: `
            <p>For a recursive function, the recurrence has two parts: how many recursive calls it makes, and how much non-recursive work it does around them.</p>
            <ul>
              <li>Binary search calls itself once on half the range and does constant work: <code>T(n) = T(n/2) + O(1)</code>.</li>
              <li>Merge sort calls itself twice on half and merges in linear time: <code>T(n) = 2T(n/2) + O(n)</code>.</li>
              <li>A function that loops over <code>n</code> items and then recurses on <code>n − 1</code>: <code>T(n) = T(n − 1) + O(n)</code>.</li>
              <li>Naive Fibonacci calls itself twice on <code>n − 1</code> and <code>n − 2</code>: <code>T(n) = T(n − 1) + T(n − 2) + O(1)</code>.</li>
            </ul>
            <p>Only the first two have the form the Master theorem handles: every subproblem is the same fraction <code>1/b</code> of the parent. The last two shrink by a constant instead of a factor, which produces a chain rather than a tree, and need substitution or a recursion tree.</p>
            <p>The base case matters too. <code>T(1) = O(1)</code> is the usual assumption; if the base case does <code>O(n)</code> work, that cost belongs in the recurrence.</p>
          `,
        },
        {
          kind: "concept",
          title: "The recursion tree shows where the work goes",
          body: `
            <p>Expand <code>T(n) = 2T(n/2) + n</code> one level at a time. The root costs <code>n</code>. It has two children, each costing <code>n/2</code>, so the second level also costs <code>n</code>. Each of those splits into two nodes costing <code>n/4</code>, so the third level costs <code>n</code> again. Every full level costs <code>n</code>.</p>
            <p>How many levels? The subproblem size goes <code>n → n/2 → n/4 → … → 1</code>, which takes <code>log₂ n</code> halvings. So the total is <code>n · log₂ n</code>. That is the whole proof for merge sort, and it did not require the Master theorem.</p>
            <p>Change the combine cost and the picture changes:</p>
            <ul>
              <li><code>T(n) = T(n/2) + 1</code>: one node per level, each costing 1, <code>log n</code> levels → <code>O(log n)</code>.</li>
              <li><code>T(n) = 2T(n/2) + 1</code>: level costs 1, 2, 4, …, <code>n</code>; the sum is <code>2n − 1</code> → <code>O(n)</code>. The leaves dominate.</li>
              <li><code>T(n) = 2T(n/2) + n²</code>: root costs <code>n²</code>, next level <code>n²/2</code>, then <code>n²/4</code>; the sum is less than <code>2n²</code> → <code>O(n²)</code>. The root dominates.</li>
            </ul>
            <p>Those three pictures are the three cases of the Master theorem, seen instead of memorised.</p>
          `,
        },
        {
          kind: "concept",
          title: "The Master theorem, stated carefully",
          body: `
            <p>For <code>T(n) = a·T(n/b) + f(n)</code> with <code>a ≥ 1</code> and <code>b &gt; 1</code>, compute the <strong>watershed</strong> <code>n^(log_b a)</code> — the total size of the leaves if you expanded the whole tree. Compare <code>f(n)</code> to it:</p>
            <ul>
              <li><strong>Case 1:</strong> <code>f(n) = O(n^(log_b a − ε))</code> for some <code>ε &gt; 0</code>. The leaves dominate; <code>T(n) = Θ(n^(log_b a))</code>.</li>
              <li><strong>Case 2:</strong> <code>f(n) = Θ(n^(log_b a))</code>. Every level costs about the same; <code>T(n) = Θ(n^(log_b a) · log n)</code>.</li>
              <li><strong>Case 3:</strong> <code>f(n) = Ω(n^(log_b a + ε))</code> and the regularity condition <code>a·f(n/b) ≤ c·f(n)</code> holds for some <code>c &lt; 1</code>. The root dominates; <code>T(n) = Θ(f(n))</code>.</li>
            </ul>
            <p>Check merge sort: <code>a = 2</code>, <code>b = 2</code>, so the watershed is <code>n^(log₂ 2) = n</code>. The merge cost is <code>f(n) = n</code>, which is case 2 → <code>Θ(n log n)</code>. Check binary search: <code>a = 1</code>, <code>b = 2</code>, watershed <code>n⁰ = 1</code>, <code>f(n) = 1</code> → case 2 → <code>Θ(log n)</code>.</p>
            <p>The regularity condition is not decoration. It rules out functions that grow fast but oscillate so badly that the recursion's shrinking argument fails. For the polynomial and logarithmic costs you meet in practice, it holds.</p>
          `,
        },
        {
          kind: "concept",
          title: "Where it breaks",
          body: `
            <p>The Master theorem is a tool with a shape, not a universal solver. It does not apply when the subproblems are not equal fractions: <code>T(n) = T(n/3) + T(2n/3) + n</code> has a recursion tree whose levels still cost <code>n</code>, but the depth is uneven and the theorem's <code>a·T(n/b)</code> form does not match. The tree gives <code>O(n log n)</code>; Akra–Bazzi handles the general case.</p>
            <p>It does not apply to <code>T(n) = T(n − 1) + O(n)</code> either, because the subproblem shrinks by a constant, not a factor. Substitute: <code>T(n) = O(n) + O(n−1) + … + O(1) = O(n²)</code>. Naive Fibonacci is worse: the number of calls grows exponentially — <code>Θ(φⁿ)</code> with <code>φ ≈ 1.618</code>, bounded by <code>2ⁿ</code> — and memoisation is what turns it into <code>O(n)</code> distinct states.</p>
            <p>Two more traps. First, <code>f(n)</code> must be only the work outside the recursive calls; if your merge step copies the array, that copy is part of <code>f(n)</code>. Second, a correct time bound can still ship a stack overflow: a recursion <code>n</code> levels deep uses <code>O(n)</code> stack space even when the time is <code>O(n)</code>. The recurrence describes time unless you write a second one for space.</p>
          `,
        },
        {
          kind: "code",
          title: "Count the calls in a recursion tree",
          language: "javascript",
          starter: `function treeSize(n) {
  // Number of calls made by T(n) = 2*T(floor(n/2)) + 1, with T(1) = 1.
  // Define T(0) = 0.
  return 0;
}`,
          solution: `function treeSize(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  return 2 * treeSize(Math.floor(n / 2)) + 1;
}`,
          tests: [
            { input: "treeSize(0)", expected: "0" },
            { input: "treeSize(1)", expected: "1" },
            { input: "treeSize(2)", expected: "3" },
            { input: "treeSize(7)", expected: "7" },
            { input: "treeSize(8)", expected: "15" },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "Write the recurrence for binary search and solve it with the Master theorem. Then write the recurrence for a function that splits an array into thirds and recurses on two of them. Why does the Master theorem not apply to the second one, and what does the recursion tree suggest?",
        },
        {
          kind: "recap",
          points: [
            "A recurrence reads the recursive structure of the code: number of calls, subproblem size, and work outside the calls.",
            "The recursion tree shows the cost per level; the watershed n^(log_b a) is the total leaf size.",
            "The Master theorem has three cases — leaves dominate, levels tie, or root dominates — and applies only to equal-fraction splits.",
            "T(n − 1) and T(n − 2) recurrences are not Master-theorem shapes; substitute or draw the tree.",
          ],
        },
      ],
      sources: [
        {
          label: "Cornell CS 3110 — Recursion Trees and the Master Method",
          url: "https://www.cs.cornell.edu/courses/cs3110/2012sp/lectures/lec20-master/lec20.html",
        },
        {
          label: "VisuAlgo — Recursion tree",
          url: "https://visualgo.net/en/recursion",
        },
      ],
      attribution:
        "Synthesis of Cornell CS 3110's recursion-tree and Master-method lecture and VisuAlgo's recursion-tree visualisation.",
    },
    {
      slug: "number-basics",
      title: "Number basics",
      sections: [
        {
          kind: "scenario",
          title: "The problem",
          body: `
            <p>Three problems that look unrelated. Reduce <code>48/18</code> to lowest terms. List every prime below 100. Compute <code>2^100 mod 1,000,000,007</code> without building a 31-digit integer. The first is a GCD, the second is a sieve, the third is modular exponentiation — and all three are the same habit: replace a large number with a smaller equivalent one.</p>
            <p>They also share a failure mode. Each is easy to write in a way that is correct on small inputs and wrong on the inputs that matter: a negative remainder, a sieve that marks <code>0</code> and <code>1</code> as prime, a multiplication that silently loses precision past <code>2^53</code>.</p>
          `,
        },
        {
          kind: "concept",
          title: "Euclid's algorithm and why it terminates",
          body: `
            <p>The identity is <code>gcd(a, b) = gcd(b, a mod b)</code>. Why it is true: write <code>a = q·b + r</code>, so <code>r = a − q·b</code>. Any number that divides both <code>a</code> and <code>b</code> also divides <code>r</code>. Any number that divides both <code>b</code> and <code>r</code> also divides <code>a</code>. So the two pairs have exactly the same set of common divisors, and therefore the same greatest one.</p>
            <p>Trace <code>gcd(48, 18)</code>: <code>48 = 2·18 + 12</code> → <code>gcd(18, 12)</code>; <code>18 = 1·12 + 6</code> → <code>gcd(12, 6)</code>; <code>12 = 2·6 + 0</code> → <code>gcd(6, 0)</code>. When the second argument is zero, the first is the answer: <code>6</code>.</p>
            <p>Termination is guaranteed because the remainder is strictly smaller than the divisor: <code>0 ≤ a mod b &lt; b</code>. The pair <code>(a, b)</code> becomes <code>(b, r)</code> with <code>r &lt; b</code>, so the second coordinate strictly decreases and cannot go below zero. The loop ends at <code>b = 0</code>.</p>
            <p>Cost: every two steps at least halve the smaller number, so the number of steps is <code>O(log min(a, b))</code>. The worst case is consecutive Fibonacci numbers, where the quotients are all 1 and the remainders shrink as slowly as possible.</p>
          `,
        },
        {
          kind: "concept",
          title: "Primes and the sieve",
          body: `
            <p>A prime has exactly two divisors, 1 and itself. Testing one number by trial division costs <code>O(√n)</code>: if <code>n = a·b</code> and both factors were greater than <code>√n</code>, their product would exceed <code>n</code>. That is fine for one number and hopeless for every number below <code>10⁸</code>.</p>
            <p>The sieve of Eratosthenes reverses the work. Start with a boolean array of size <code>n + 1</code>, all true except indices 0 and 1. For each prime <code>p</code> from 2 up to <code>√n</code>, mark every multiple of <code>p</code> starting at <code>p²</code> as composite. Starting at <code>p²</code> is the key: the multiples <code>2p, 3p, …, (p−1)p</code> have a smaller factor and were already marked.</p>
            <p>Trace <code>n = 30</code>: mark multiples of 2 from 4; of 3 from 9; of 5 from 25. Stop at <code>p = 5</code>, because <code>6² = 36 &gt; 30</code>. Whatever is still true is prime: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29.</p>
            <p>Cost: the total markings are <code>n/2 + n/3 + n/5 + … = n · log log n</code>, which is close to linear for practical sizes. Space is <code>O(n)</code> booleans. For a range too large to hold in memory, a segmented sieve processes blocks and keeps only the base primes up to <code>√n</code>.</p>
          `,
        },
        {
          kind: "concept",
          title: "Modular arithmetic without losing precision",
          body: `
            <p>Modular arithmetic works because addition and multiplication respect the modulus: <code>(a + b) mod m = ((a mod m) + (b mod m)) mod m</code>, and the same for multiplication. Reduce after every operation and the numbers never grow beyond <code>m²</code>.</p>
            <p>In JavaScript that is not automatically safe. Numbers are IEEE-754 doubles, so integers are exact only up to <code>2^53 − 1</code> (about <code>9·10¹⁵</code>). If <code>m = 10⁹ + 7</code>, then <code>a·b</code> can reach <code>10¹⁸</code> and the low digits are already gone before you take the remainder. Use <code>BigInt</code> for the product, or split one factor into high and low parts, or keep <code>m</code> small enough that <code>m² ≤ 2^53</code>.</p>
            <p>JavaScript's <code>%</code> keeps the sign of the dividend: <code>-7 % 3</code> is <code>-1</code>, not <code>2</code>. Normalise with <code>((x % m) + m) % m</code> whenever negative values are possible. And division is not ordinary division modulo <code>m</code>: dividing by <code>a</code> means multiplying by the modular inverse, which exists only when <code>gcd(a, m) = 1</code>. For a prime <code>m</code>, Fermat's little theorem gives <code>a^(m−2) mod m</code>.</p>
          `,
        },
        {
          kind: "concept",
          title: "Binary exponentiation",
          body: `
            <p>Computing <code>aⁿ</code> by multiplying <code>n</code> times is <code>O(n)</code>. Binary exponentiation uses the binary digits of <code>n</code>: square the base at every step, and multiply it into the result whenever the current bit is 1. The exponent halves each step, so the cost is <code>O(log n)</code> multiplications.</p>
            <p>Trace <code>3¹³</code>. <code>13</code> is <code>1101₂ = 8 + 4 + 1</code>, so <code>3¹³ = 3⁸ · 3⁴ · 3¹</code>. The loop keeps <code>base = 3¹, 3², 3⁴, 3⁸</code> by squaring, and multiplies <code>result</code> by the powers whose bit is set. Four squarings and three multiplications instead of twelve multiplications.</p>
            <p>Edge cases: <code>a⁰ = 1</code> for every <code>a</code>, including 0 (by convention); a negative exponent needs a modular inverse; a negative base must be normalised into <code>[0, m)</code> first, because JavaScript's <code>%</code> keeps the sign; and the squaring step is exactly where the precision trap above appears, so reduce the modulus after every multiplication rather than at the end.</p>
          `,
        },
        {
          kind: "code",
          title: "GCD and modular exponentiation",
          language: "javascript",
          starter: `function gcd(a, b) {
  // Greatest common divisor, including zero and negative inputs.
  return 0;
}

function powMod(base, exp, mod) {
  // (base ** exp) % mod without losing precision.
  return 0;
}`,
          solution: `function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a;
}

function powMod(base, exp, mod) {
  const m = BigInt(mod);
  let result = 1n;
  let b = ((BigInt(base) % m) + m) % m;
  let e = BigInt(exp);
  while (e > 0n) {
    if (e % 2n === 1n) result = (result * b) % m;
    b = (b * b) % m;
    e = e / 2n;
  }
  return Number(result);
}`,
          tests: [
            { input: "gcd(48, 18)", expected: "6" },
            { input: "gcd(10, 0)", expected: "10" },
            { input: "gcd(0, 0)", expected: "0" },
            { input: "gcd(-48, 18)", expected: "6" },
            { input: "powMod(2, 10, 1000)", expected: "24" },
            { input: "powMod(5, 3, 13)", expected: "8" },
            { input: "powMod(2, 0, 7)", expected: "1" },
            { input: "powMod(10, 5, 1)", expected: "0" },
            { input: "powMod(-2, 3, 5)", expected: "2" },
          ],
        },
        {
          kind: "your_turn",
          prompt:
            "Why does the sieve start marking at p² rather than 2p? And why is gcd(a, b) = gcd(b, a mod b) true? Answer both from the invariant, without looking back.",
        },
        {
          kind: "recap",
          points: [
            "Euclid replaces (a, b) with (b, a mod b); the common divisors never change and the remainder strictly shrinks.",
            "The sieve marks from p² because smaller multiples already have a smaller factor; total cost is O(n log log n).",
            "Reduce modulo m after every operation, and use BigInt when m² exceeds 2^53.",
            "Binary exponentiation squares the base and halves the exponent, giving O(log n) multiplications.",
          ],
        },
      ],
      sources: [
        {
          label: "CP-Algorithms — Euclidean algorithm for GCD",
          url: "https://cp-algorithms.com/algebra/euclid-algorithm.html",
        },
        {
          label: "CP-Algorithms — Sieve of Eratosthenes",
          url: "https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html",
        },
        {
          label: "CP-Algorithms — Binary exponentiation",
          url: "https://cp-algorithms.com/algebra/binary-exp.html",
        },
      ],
      attribution:
        "Synthesis of CP-Algorithms' Euclid, sieve and binary-exponentiation articles.",
    },
  ],
  interviewByte: {
    shape: "What is the time complexity of this function?",
    strongAnswer:
      "Count the dominant operation, express it in terms of n, drop constants, and state both time and space. For recursion, write the recurrence and solve it.",
    trap: "Describing the loop count in words ('it loops n times') instead of a complexity class, or quoting a recurrence without solving it.",
  },
  recap: [
    "Count dominant operations, drop constants and lower-order terms.",
    "Read recurrences off recursive code; the recursion tree and Master theorem cover the common shapes.",
    "Euclid, the sieve and binary exponentiation are the number-theory tools you will reuse.",
    "Every numeric algorithm has a boundary case: zero, negatives, overflow, or a non-monotone predicate.",
  ],
  attribution:
    "Synthesis of Princeton 1.4, MIT 6.006/6.042, CP-Algorithms and VisuAlgo.",
};
