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
          kind: "concept",
          title: "How to count",
          body: "Ignore constants and lower-order terms. A single loop over n is O(n). Two nested loops over n is O(n²). A loop that halves n each step is O(log n). A recursive function that calls itself twice is O(2ⁿ) unless memoised.",
        },
        {
          kind: "code",
          title: "Spot the complexity",
          language: "javascript",
          starter:
            "function a(n) {\n  for (let i = 0; i < n; i++) console.log(i);\n}\nfunction b(n) {\n  for (let i = 0; i < n; i++)\n    for (let j = 0; j < n; j++) console.log(i, j);\n}\nfunction c(n) {\n  if (n <= 1) return 1;\n  return c(Math.floor(n / 2)) + 1;\n}\n\nconsole.log('a: O(n), b: O(n^2), c: O(log n)');",
          solution:
            "function a(n) {\n  for (let i = 0; i < n; i++) console.log(i); // O(n)\n}\nfunction b(n) {\n  for (let i = 0; i < n; i++)\n    for (let j = 0; j < n; j++) console.log(i, j); // O(n^2)\n}\nfunction c(n) {\n  if (n <= 1) return 1; // O(log n)\n  return c(Math.floor(n / 2)) + 1;\n}\n\nconsole.log('a: O(n), b: O(n^2), c: O(log n)');",
          tests: [{ input: "c(8)", expected: "4" }],
        },
        {
          kind: "recap",
          points: [
            "One loop = O(n); nested loops over same range = O(n²).",
            "Halving each step = O(log n).",
            "Branching recursion without memoisation explodes.",
          ],
        },
      ],
      sources: [
        {
          label: "Striver's A2Z DSA Sheet",
          url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
        },
      ],
      attribution: "Synthesis of Sedgewick/Wayne and NeetCode.",
    },
    {
      slug: "recurrences",
      title: "Recurrences (Master theorem)",
      sections: [
        {
          kind: "concept",
          title: "The Master theorem",
          body: "For T(n) = a·T(n/b) + f(n): if f(n) = O(n^(log_b a - ε)) then T(n)=Θ(n^log_b a); if f(n)=Θ(n^log_b a) then T(n)=Θ(n^log_b a · log n); if f(n)=Ω(n^(log_b a + ε)) and regularity holds then T(n)=Θ(f(n)). This covers merge sort (Θ(n log n)), binary search (Θ(log n)), and most divide-and-conquer.",
        },
        {
          kind: "your_turn",
          prompt:
            "Merge sort is T(n)=2T(n/2)+O(n). Which case of the Master theorem applies, and what is the result?",
        },
        {
          kind: "recap",
          points: [
            "T(n)=aT(n/b)+f(n) is the standard divide-and-conquer form.",
            "Compare f(n) to n^(log_b a) to pick the case.",
          ],
        },
      ],
      sources: [
        {
          label: "Striver's A2Z DSA Sheet",
          url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
        },
      ],
      attribution: "Synthesis of CLRS / Stanford Algorithms.",
    },
    {
      slug: "number-basics",
      title: "Number basics",
      sections: [
        {
          kind: "concept",
          title: "GCD, primes, modular arithmetic",
          body: "GCD via Euclid's algorithm is O(log min(a,b)). Sieve of Eratosthenes finds all primes up to n in O(n log log n). Modular arithmetic keeps numbers small: (a+b) mod m = ((a mod m)+(b mod m)) mod m. These show up in hashing, cryptography, and combinatorics problems.",
        },
        {
          kind: "code",
          title: "Euclid's GCD",
          language: "javascript",
          starter:
            "function gcd(a, b) {\n  while (b !== 0) {\n    const t = b;\n    b = a % b;\n    a = t;\n  }\n  return a;\n}\n\nconsole.log(gcd(48, 18));",
          solution:
            "function gcd(a, b) {\n  while (b !== 0) {\n    const t = b;\n    b = a % b;\n    a = t;\n  }\n  return a;\n}\n\nconsole.log(gcd(48, 18)); // 6",
          tests: [
            { input: "gcd(10, 0)", expected: "10" },
            { input: "gcd(7, 5)", expected: "1" },
          ],
        },
        {
          kind: "recap",
          points: [
            "GCD is O(log min(a,b)) via Euclid.",
            "Sieve is O(n log log n).",
            "Modular arithmetic prevents overflow.",
          ],
        },
      ],
      sources: [
        {
          label: "Striver's A2Z DSA Sheet",
          url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
        },
      ],
      attribution: "Synthesis of Striver's A2Z math section.",
    },
  ],
  interviewByte: {
    shape: "What is the time complexity of this function?",
    strongAnswer:
      "Count the dominant operation, express in terms of n, drop constants, state both time and space.",
    trap: "Describing the loop count in words ('it loops n times') instead of a complexity class.",
  },
  recap: [
    "Count dominant operations, drop constants.",
    "Master theorem covers most divide-and-conquer recurrences.",
    "GCD and sieve are the two number-theory tools you will reuse.",
  ],
  attribution: "Synthesis of Striver's A2Z and Stanford Algorithms.",
};
