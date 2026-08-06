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

/**
 * Absolute-beginner JavaScript drills ("Basic" tier).
 * 32 exercises adapted from Codewars 8 kyu katas (public API, fetched/validated
 * during generation — see /tmp/opencode/gen/gen-beginner.mjs) + 4 original
 * console/print drills. Run-only self-check: every problem has an exact
 * "Expected output" block to compare against the Run panel.
 */
export const problemsData: ProblemSeed[] = [
  {
    title: "Hello, World!",
    description: `**Task:** Your very first program! Print the message \`Hello, World!\` to the console.

In JavaScript we print things with the \`console.log()\` function — whatever you put inside the parentheses appears in the Run panel.

**Example:**
\`\`\`js
console.log("Hello, World!");
// → Hello, World!
\`\`\`

**How to check:** put the message between the quotes in the starter code, then run your code.

**Expected output:**
\`\`\`text
Hello, World!
\`\`\``,
    difficulty: "basic",
    category: "Print & Basics",
    tags: ["print", "console"],
    starter_code: `// Your first program! Print the message below.
console.log(); // ← put the text between the quotes`,
    solution_code: `console.log("Hello, World!");`,
    test_cases: [],
  },
  {
    title: "My First Variables",
    description: `**Task:** A variable stores a value so you can reuse it. The starter code already creates \`myNumber\`. Now:

1. Create a variable called \`myText\` and set it to the string \`"I am learning JavaScript"\`.
2. Run your code — both variables are printed.

**Example:**
\`\`\`js
let myNumber = 42;
let myText = "I am learning JavaScript";
\`\`\`

**How to check:** run your code and compare the two printed lines.

**Expected output:**
\`\`\`text
42
I am learning JavaScript
\`\`\``,
    difficulty: "basic",
    category: "Print & Basics",
    tags: ["variables", "print"],
    starter_code: `let myNumber = 42;

// Your code here: create a variable called myText and
// set it to the string "I am learning JavaScript"

console.log(myNumber);
console.log(myText);`,
    solution_code: `let myNumber = 42;
let myText = "I am learning JavaScript";
console.log(myNumber);
console.log(myText);`,
    test_cases: [],
  },
  {
    title: "Print a Sum",
    description: `**Task:** JavaScript can do math with the \`+\` operator: \`8 + 5\` is an expression that becomes \`13\`.

Use \`console.log()\` to print the sum of the two variables \`a\` and \`b\`. You can pass the calculation directly inside the parentheses.

**Example:**
\`\`\`js
console.log(a + b);
\`\`\`

**How to check:** run your code — the answer should appear.

**Expected output:**
\`\`\`text
13
\`\`\``,
    difficulty: "basic",
    category: "Print & Basics",
    tags: ["operators", "print", "numbers"],
    starter_code: `let a = 8;
let b = 5;

// Your code here: print the sum of a and b`,
    solution_code: `let a = 8;
let b = 5;
console.log(a + b);`,
    test_cases: [],
  },
  {
    title: "Count to Five",
    description: `**Task:** Use a \`for\` loop to print the numbers from 1 to 5, one number per line.

A \`for\` loop repeats code a set number of times:

\`\`\`js
for (let i = 1; i <= 5; i++) {
  // this code runs for i = 1, 2, 3, 4, 5
}
\`\`\`

**How to check:** run your code — each number should be on its own line.

**Expected output:**
\`\`\`text
1
2
3
4
5
\`\`\``,
    difficulty: "basic",
    category: "Print & Basics",
    tags: ["loops", "print"],
    starter_code: `// Print the numbers 1 to 5, one per line.
// Tip: a for loop can do this in 3 lines.`,
    solution_code: `for (let i = 1; i <= 5; i++) {
  console.log(i);
}`,
    test_cases: [],
  },
  {
    title: "Multiply",
    description: `**Task:** This code is broken — it looks right, but running it prints \`undefined\`.

In JavaScript, a function only gives back a result when it uses the \`return\` keyword. Find the missing keyword and fix the function.

**Example:**
\`\`\`js
multiply(3, 4); // → 12
\`\`\`

**How to check:** run the starter code — it already calls the function and prints the result.

**Expected output:**
\`\`\`text
12
\`\`\``,
    difficulty: "basic",
    category: "Functions",
    tags: ["functions", "return", "debugging"],
    starter_code: `function multiply(a, b) {
  a * b // ← something is missing here!
}

console.log(multiply(3, 4));`,
    solution_code: `function multiply(a, b) {
  return a * b;
}

console.log(multiply(3, 4));`,
    test_cases: [],
  },
  {
    title: "Return Negative",
    description: `**Task:** Write a function \`makeNegative(num)\` that turns a number negative:

- If the number is already negative, return it unchanged.
- If the number is 0, return 0.
- Otherwise return the number with a minus sign.

**Example:**
\`\`\`js
makeNegative(1);  // → -1
makeNegative(-5); // → -5
makeNegative(0);  // → 0
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
-1
-5
0
\`\`\``,
    difficulty: "basic",
    category: "Functions",
    tags: ["functions", "conditionals", "math"],
    starter_code: `function makeNegative(num) {
  // Your code here
}

console.log(makeNegative(1));
console.log(makeNegative(-5));
console.log(makeNegative(0));`,
    solution_code: `function makeNegative(num) {
  return num > 0 ? -num : num;
}

console.log(makeNegative(1));
console.log(makeNegative(-5));
console.log(makeNegative(0));`,
    test_cases: [],
  },
  {
    title: "Opposite Number",
    description: `**Task:** Write a function \`opposite(number)\` that returns the opposite of a number (its additive inverse).

**Example:**
\`\`\`js
opposite(1);   // → -1
opposite(14);  // → -14
opposite(-34); // → 34
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
-1
-14
34
\`\`\``,
    difficulty: "basic",
    category: "Functions",
    tags: ["functions", "math"],
    starter_code: `function opposite(number) {
  // Your code here
}

console.log(opposite(1));
console.log(opposite(14));
console.log(opposite(-34));`,
    solution_code: `function opposite(number) {
  return -number;
}

console.log(opposite(1));
console.log(opposite(14));
console.log(opposite(-34));`,
    test_cases: [],
  },
  {
    title: "Double Char",
    description: `**Task:** Write a function \`doubleChar(str)\` that returns a new string where every character appears twice, keeping the original case.

**Example:**
\`\`\`js
doubleChar("String");      // → "SSttrriinngg"
doubleChar("Hello World"); // → "HHeelllloo  WWoorrlldd"
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
SSttrriinngg
HHeelllloo  WWoorrlldd
\`\`\``,
    difficulty: "basic",
    category: "Functions",
    tags: ["functions", "strings"],
    starter_code: `function doubleChar(str) {
  // Your code here
}

console.log(doubleChar("String"));
console.log(doubleChar("Hello World"));`,
    solution_code: `function doubleChar(str) {
  return str
    .split("")
    .map((c) => c + c)
    .join("");
}

console.log(doubleChar("String"));
console.log(doubleChar("Hello World"));`,
    test_cases: [],
  },
  {
    title: "Grasshopper — Summation",
    description: `**Task:** Write a function \`summation(num)\` that adds up every number from 1 to \`num\` (both included). The input is always a positive integer.

**Example:**
\`\`\`js
summation(2); // → 3   (1 + 2)
summation(8); // → 36  (1 + 2 + 3 + 4 + 5 + 6 + 7 + 8)
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
3
36
\`\`\``,
    difficulty: "basic",
    category: "Functions",
    tags: ["functions", "loops", "math"],
    starter_code: `function summation(num) {
  // Your code here
}

console.log(summation(2));
console.log(summation(8));`,
    solution_code: `function summation(num) {
  let total = 0;
  for (let i = 1; i <= num; i++) {
    total += i;
  }
  return total;
}

console.log(summation(2));
console.log(summation(8));`,
    test_cases: [],
  },
  {
    title: "Add a New Item (Arrays & References)",
    description: `**Task:** Write a function \`addExtra(list)\` that returns a **new** array with one extra item (for example the number 13) added at the end.

Important: you must NOT change the original array. In JavaScript, arrays are passed by reference — if you \`push\` onto \`list\`, you are changing the caller's array too. Create a fresh array instead.

**Example:**
\`\`\`js
addExtra([1, 2, 3]); // → [1, 2, 3, 13]
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
1,2,3,13
\`\`\``,
    difficulty: "basic",
    category: "Functions",
    tags: ["functions", "arrays", "reference"],
    starter_code: `function addExtra(list) {
  // ❌ This mutates the original array — don't do that!
  list.push(13);
  return list;
}

console.log(addExtra([1, 2, 3]));`,
    solution_code: `function addExtra(list) {
  return [...list, 13];
}

console.log(addExtra([1, 2, 3]));`,
    test_cases: [],
  },
  {
    title: "String Repeat",
    description: `**Task:** Write a function \`repeatStr(n, s)\` that returns the string \`s\` repeated exactly \`n\` times. \`n\` is always a non-negative integer.

**Example:**
\`\`\`js
repeatStr(6, "I");     // → "IIIIII"
repeatStr(5, "Hello"); // → "HelloHelloHelloHelloHello"
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
IIIIII
HelloHelloHelloHelloHello
\`\`\``,
    difficulty: "basic",
    category: "Strings",
    tags: ["strings", "functions"],
    starter_code: `function repeatStr(n, s) {
  // Your code here
}

console.log(repeatStr(6, "I"));
console.log(repeatStr(5, "Hello"));`,
    solution_code: `function repeatStr(n, s) {
  return s.repeat(n);
}

console.log(repeatStr(6, "I"));
console.log(repeatStr(5, "Hello"));`,
    test_cases: [],
  },
  {
    title: "Make Uppercase",
    description: `**Task:** Write a function \`makeUpperCase(str)\` that converts a string to uppercase letters.

**Example:**
\`\`\`js
makeUpperCase("hello"); // → "HELLO"
makeUpperCase("JavaScript"); // → "JAVASCRIPT"
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
HELLO
JAVASCRIPT
\`\`\``,
    difficulty: "basic",
    category: "Strings",
    tags: ["strings", "methods"],
    starter_code: `function makeUpperCase(str) {
  // Your code here
}

console.log(makeUpperCase("hello"));
console.log(makeUpperCase("JavaScript"));`,
    solution_code: `function makeUpperCase(str) {
  return str.toUpperCase();
}

console.log(makeUpperCase("hello"));
console.log(makeUpperCase("JavaScript"));`,
    test_cases: [],
  },
  {
    title: "Remove First and Last Character",
    description: `**Task:** Write a function \`removeChar(str)\` that removes the first and last characters of a string and returns the rest. The input always has at least 2 characters.

**Example:**
\`\`\`js
removeChar("eloquent"); // → "loquen"
removeChar("country");  // → "ountr"
removeChar("person");   // → "erso"
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
loquen
ountr
erso
\`\`\``,
    difficulty: "basic",
    category: "Strings",
    tags: ["strings", "methods", "slice"],
    starter_code: `function removeChar(str) {
  // Your code here
}

console.log(removeChar("eloquent"));
console.log(removeChar("country"));
console.log(removeChar("person"));`,
    solution_code: `function removeChar(str) {
  return str.slice(1, -1);
}

console.log(removeChar("eloquent"));
console.log(removeChar("country"));
console.log(removeChar("person"));`,
    test_cases: [],
  },
  {
    title: "Remove String Spaces",
    description: `**Task:** Write a function \`noSpace(str)\` that removes all spaces from a string and returns the result.

**Example:**
\`\`\`js
noSpace("hello world !"); // → "helloworld!"
noSpace("8 j 8   mBliB8g"); // → "8j8mBliB8g"
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
helloworld!
8j8mBliB8g
\`\`\``,
    difficulty: "basic",
    category: "Strings",
    tags: ["strings", "methods", "replace"],
    starter_code: `function noSpace(str) {
  // Your code here
}

console.log(noSpace("hello world !"));
console.log(noSpace("8 j 8   mBliB8g"));`,
    solution_code: `function noSpace(str) {
  return str.replaceAll(" ", "");
}

console.log(noSpace("hello world !"));
console.log(noSpace("8 j 8   mBliB8g"));`,
    test_cases: [],
  },
  {
    title: "Abbreviate a Two Word Name",
    description: `**Task:** Write a function \`abbrevName(name)\` that turns a full name into initials: take the first letter of each word, make them uppercase, and join them with a dot. The input always has exactly two words separated by one space.

**Example:**
\`\`\`js
abbrevName("Sam Harris");      // → "S.H"
abbrevName("patrick feeney");  // → "P.F"
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
S.H
P.F
\`\`\``,
    difficulty: "basic",
    category: "Strings",
    tags: ["strings", "methods", "split"],
    starter_code: `function abbrevName(name) {
  // Your code here
}

console.log(abbrevName("Sam Harris"));
console.log(abbrevName("patrick feeney"));`,
    solution_code: `function abbrevName(name) {
  return name
    .split(" ")
    .map((word) => word[0].toUpperCase())
    .join(".");
}

console.log(abbrevName("Sam Harris"));
console.log(abbrevName("patrick feeney"));`,
    test_cases: [],
  },
  {
    title: "Vowel Remover",
    description: `**Task:** Write a function \`shortcut(str)\` that removes the lowercase vowels \`a\`, \`e\`, \`i\`, \`o\`, \`u\` from a string. Uppercase vowels are kept as they are, and \`y\` is not a vowel here.

**Example:**
\`\`\`js
shortcut("hello");   // → "hll"
shortcut("HELLO");   // → "HELLO"
shortcut("goodbye"); // → "gdby"
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
hll
HELLO
gdby
\`\`\``,
    difficulty: "basic",
    category: "Strings",
    tags: ["strings", "methods", "replace"],
    starter_code: `function shortcut(str) {
  // Your code here
}

console.log(shortcut("hello"));
console.log(shortcut("HELLO"));
console.log(shortcut("goodbye"));`,
    solution_code: `function shortcut(str) {
  return str.replace(/[aeiou]/g, "");
}

console.log(shortcut("hello"));
console.log(shortcut("HELLO"));
console.log(shortcut("goodbye"));`,
    test_cases: [],
  },
  {
    title: "Find the Smallest Integer",
    description: `**Task:** Write a function \`findSmallestInt(arr)\` that returns the smallest number in an array of integers. The array is never empty.

**Example:**
\`\`\`js
findSmallestInt([34, 15, 88, 2]);      // → 2
findSmallestInt([34, -345, -1, 100]); // → -345
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
2
-345
\`\`\``,
    difficulty: "basic",
    category: "Arrays",
    tags: ["arrays", "loops", "math"],
    starter_code: `function findSmallestInt(arr) {
  // Your code here
}

console.log(findSmallestInt([34, 15, 88, 2]));
console.log(findSmallestInt([34, -345, -1, 100]));`,
    solution_code: `function findSmallestInt(arr) {
  return Math.min(...arr);
}

console.log(findSmallestInt([34, 15, 88, 2]));
console.log(findSmallestInt([34, -345, -1, 100]));`,
    test_cases: [],
  },
  {
    title: "Sum of Positive",
    description: `**Task:** Write a function \`positiveSum(arr)\` that sums up all the positive numbers in an array. Negative numbers are ignored, and if there is nothing to sum, the result is 0.

**Example:**
\`\`\`js
positiveSum([1, -4, 7, 12]); // → 20  (1 + 7 + 12)
positiveSum([-1, -2, -3]);   // → 0
positiveSum([]);             // → 0
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
20
0
0
\`\`\``,
    difficulty: "basic",
    category: "Arrays",
    tags: ["arrays", "loops", "conditionals"],
    starter_code: `function positiveSum(arr) {
  // Your code here
}

console.log(positiveSum([1, -4, 7, 12]));
console.log(positiveSum([-1, -2, -3]));
console.log(positiveSum([]));`,
    solution_code: `function positiveSum(arr) {
  let sum = 0;
  for (const num of arr) {
    if (num > 0) sum += num;
  }
  return sum;
}

console.log(positiveSum([1, -4, 7, 12]));
console.log(positiveSum([-1, -2, -3]));
console.log(positiveSum([]));`,
    test_cases: [],
  },
  {
    title: "Array Plus Array",
    description: `**Task:** Write a function \`arrayPlusArray(a, b)\` that returns the sum of all the elements of two arrays.

**Example:**
\`\`\`js
arrayPlusArray([1, 2], [3, 4]);   // → 10
arrayPlusArray([10, 20], [5]);    // → 35
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
10
35
\`\`\``,
    difficulty: "basic",
    category: "Arrays",
    tags: ["arrays", "loops", "math"],
    starter_code: `function arrayPlusArray(a, b) {
  // Your code here
}

console.log(arrayPlusArray([1, 2], [3, 4]));
console.log(arrayPlusArray([10, 20], [5]));`,
    solution_code: `function arrayPlusArray(a, b) {
  return [...a, ...b].reduce((sum, n) => sum + n, 0);
}

console.log(arrayPlusArray([1, 2], [3, 4]));
console.log(arrayPlusArray([10, 20], [5]));`,
    test_cases: [],
  },
  {
    title: "Count by X",
    description: `**Task:** Write a function \`countBy(x, n)\` that returns an array with the first \`n\` multiples of \`x\`. Both inputs are positive numbers greater than 0.

**Example:**
\`\`\`js
countBy(2, 5); // → [2, 4, 6, 8, 10]
countBy(1, 3); // → [1, 2, 3]
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
2,4,6,8,10
1,2,3
\`\`\``,
    difficulty: "basic",
    category: "Arrays",
    tags: ["arrays", "loops", "math"],
    starter_code: `function countBy(x, n) {
  // Your code here
}

console.log(countBy(2, 5));
console.log(countBy(1, 3));`,
    solution_code: `function countBy(x, n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    result.push(x * i);
  }
  return result;
}

console.log(countBy(2, 5));
console.log(countBy(1, 3));`,
    test_cases: [],
  },
  {
    title: "Reversed Digits",
    description: `**Task:** Write a function \`digitize(n)\` that takes a non-negative number and returns its digits in an array, in reverse order.

**Example:**
\`\`\`js
digitize(35231); // → [1, 3, 2, 5, 3]
digitize(0);     // → [0]
\`\`\`

**Tip:** convert the number to a string with \`String(n)\`, split it, reverse it, then convert each piece back to a number with \`Number(...)\`.

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
1,3,2,5,3
0
\`\`\``,
    difficulty: "basic",
    category: "Arrays",
    tags: ["arrays", "strings", "methods"],
    starter_code: `function digitize(n) {
  // Your code here
}

console.log(digitize(35231));
console.log(digitize(0));`,
    solution_code: `function digitize(n) {
  return String(n).split("").reverse().map(Number);
}

console.log(digitize(35231));
console.log(digitize(0));`,
    test_cases: [],
  },
  {
    title: "What Is Between?",
    description: `**Task:** Write a function \`between(a, b)\` that returns an array containing every number between \`a\` and \`b\` (both included), in ascending order. \`a\` is always less than or equal to \`b\`.

**Example:**
\`\`\`js
between(1, 4);     // → [1, 2, 3, 4]
between(-2, 2);    // → [-2, -1, 0, 1, 2]
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
1,2,3,4
-2,-1,0,1,2
\`\`\``,
    difficulty: "basic",
    category: "Arrays",
    tags: ["arrays", "loops"],
    starter_code: `function between(a, b) {
  // Your code here
}

console.log(between(1, 4));
console.log(between(-2, 2));`,
    solution_code: `function between(a, b) {
  const result = [];
  for (let i = a; i <= b; i++) {
    result.push(i);
  }
  return result;
}

console.log(between(1, 4));
console.log(between(-2, 2));`,
    test_cases: [],
  },
  {
    title: "First Non-Consecutive Number",
    description: `**Task:** Write a function \`firstNonConsecutive(arr)\` that finds the first number that is NOT exactly 1 larger than the number before it. Return \`null\` if every number is consecutive. The array always has at least 2 elements and is sorted in ascending order.

**Example:**
\`\`\`js
firstNonConsecutive([1, 2, 3, 4, 6, 7, 8]); // → 6
firstNonConsecutive([1, 2, 3]);             // → null
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
6
null
\`\`\``,
    difficulty: "basic",
    category: "Arrays",
    tags: ["arrays", "loops"],
    starter_code: `function firstNonConsecutive(arr) {
  // Your code here
}

console.log(firstNonConsecutive([1, 2, 3, 4, 6, 7, 8]));
console.log(firstNonConsecutive([1, 2, 3]));`,
    solution_code: `function firstNonConsecutive(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[i - 1] + 1) return arr[i];
  }
  return null;
}

console.log(firstNonConsecutive([1, 2, 3, 4, 6, 7, 8]));
console.log(firstNonConsecutive([1, 2, 3]));`,
    test_cases: [],
  },
  {
    title: "Even or Odd",
    description: `**Task:** Write a function \`evenOrOdd(n)\` that returns the string \`"Even"\` for even numbers and \`"Odd"\` for odd numbers.

The \`%\` operator gives the remainder of a division: \`4 % 2\` is 0 (even), \`7 % 2\` is 1 (odd).

**Example:**
\`\`\`js
evenOrOdd(4); // → "Even"
evenOrOdd(7); // → "Odd"
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
Even
Odd
\`\`\``,
    difficulty: "basic",
    category: "Conditionals",
    tags: ["conditionals", "math", "modulo"],
    starter_code: `function evenOrOdd(n) {
  // Your code here
}

console.log(evenOrOdd(4));
console.log(evenOrOdd(7));`,
    solution_code: `function evenOrOdd(n) {
  return n % 2 === 0 ? "Even" : "Odd";
}

console.log(evenOrOdd(4));
console.log(evenOrOdd(7));`,
    test_cases: [],
  },
  {
    title: "Is n Divisible by x and y?",
    description: `**Task:** Write a function \`isDivisible(n, x, y)\` that returns \`true\` if \`n\` is divisible by BOTH \`x\` and \`y\`, and \`false\` otherwise. All inputs are positive, non-zero numbers.

**Example:**
\`\`\`js
isDivisible(12, 2, 6);  // → true  (12 % 2 = 0 and 12 % 6 = 0)
isDivisible(100, 5, 3); // → false (100 % 3 ≠ 0)
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
true
false
\`\`\``,
    difficulty: "basic",
    category: "Conditionals",
    tags: ["conditionals", "modulo"],
    starter_code: `function isDivisible(n, x, y) {
  // Your code here
}

console.log(isDivisible(12, 2, 6));
console.log(isDivisible(100, 5, 3));`,
    solution_code: `function isDivisible(n, x, y) {
  return n % x === 0 && n % y === 0;
}

console.log(isDivisible(12, 2, 6));
console.log(isDivisible(100, 5, 3));`,
    test_cases: [],
  },
  {
    title: "Simple Multiplication",
    description: `**Task:** Write a function \`simpleMultiplication(n)\` that multiplies a number by 8 if it is even, and by 9 otherwise.

**Example:**
\`\`\`js
simpleMultiplication(2); // → 16  (2 × 8)
simpleMultiplication(3); // → 27  (3 × 9)
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
16
27
\`\`\``,
    difficulty: "basic",
    category: "Conditionals",
    tags: ["conditionals", "math", "modulo"],
    starter_code: `function simpleMultiplication(n) {
  // Your code here
}

console.log(simpleMultiplication(2));
console.log(simpleMultiplication(3));`,
    solution_code: `function simpleMultiplication(n) {
  return n % 2 === 0 ? n * 8 : n * 9;
}

console.log(simpleMultiplication(2));
console.log(simpleMultiplication(3));`,
    test_cases: [],
  },
  {
    title: "Do I Get a Bonus?",
    description: `**Task:** Write a function \`bonusTime(salary, bonus)\` that returns the total pay as a string with a £ prefix:

- If \`bonus\` is \`true\`, the salary is multiplied by 10.
- If \`bonus\` is \`false\`, the salary stays the same.

**Example:**
\`\`\`js
bonusTime(10000, true);  // → "£100000"
bonusTime(10000, false); // → "£10000"
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
£100000
£10000
\`\`\``,
    difficulty: "basic",
    category: "Conditionals",
    tags: ["conditionals", "strings", "booleans"],
    starter_code: `function bonusTime(salary, bonus) {
  // Your code here
}

console.log(bonusTime(10000, true));
console.log(bonusTime(10000, false));`,
    solution_code: `function bonusTime(salary, bonus) {
  return "£" + (bonus ? salary * 10 : salary);
}

console.log(bonusTime(10000, true));
console.log(bonusTime(10000, false));`,
    test_cases: [],
  },
  {
    title: "Rock Paper Scissors!",
    description: `**Task:** Write a function \`rps(player1, player2)\` that returns the result of a Rock-Paper-Scissors round:

- \`"scissors"\` beats \`"paper"\`
- \`"paper"\` beats \`"rock"\`
- \`"rock"\` beats \`"scissors"\`
- equal moves are a draw

Return \`"Player 1 won!"\`, \`"Player 2 won!"\`, or \`"Draw!"\`. Inputs are always valid lowercase moves.

**Example:**
\`\`\`js
rps("scissors", "paper"); // → "Player 1 won!"
rps("scissors", "rock");  // → "Player 2 won!"
rps("paper", "paper");    // → "Draw!"
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
Player 1 won!
Player 2 won!
Draw!
\`\`\``,
    difficulty: "basic",
    category: "Conditionals",
    tags: ["conditionals", "strings"],
    starter_code: `function rps(player1, player2) {
  // Your code here
}

console.log(rps("scissors", "paper"));
console.log(rps("scissors", "rock"));
console.log(rps("paper", "paper"));`,
    solution_code: `function rps(p1, p2) {
  if (p1 === p2) return "Draw!";
  const beats = { rock: "scissors", scissors: "paper", paper: "rock" };
  return beats[p1] === p2 ? "Player 1 won!" : "Player 2 won!";
}

console.log(rps("scissors", "paper"));
console.log(rps("scissors", "rock"));
console.log(rps("paper", "paper"));`,
    test_cases: [],
  },
  {
    title: "Convert a Boolean to a String",
    description: `**Task:** Write a function \`booleanToString(b)\` that converts a boolean value (\`true\` or \`false\`) into its string representation.

**Example:**
\`\`\`js
booleanToString(true);  // → "true"
booleanToString(false); // → "false"
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
true
false
\`\`\``,
    difficulty: "basic",
    category: "Conditionals",
    tags: ["booleans", "strings"],
    starter_code: `function booleanToString(b) {
  // Your code here
}

console.log(booleanToString(true));
console.log(booleanToString(false));`,
    solution_code: `function booleanToString(b) {
  return String(b);
}

console.log(booleanToString(true));
console.log(booleanToString(false));`,
    test_cases: [],
  },
  {
    title: "Century From Year",
    description: `**Task:** Write a function \`century(year)\` that returns the century a year belongs to. The first century is years 1–100, the second is 101–200, and so on.

**Example:**
\`\`\`js
century(1705); // → 18
century(1900); // → 19
century(2000); // → 20
century(2742); // → 28
\`\`\`

**Tip:** \`Math.ceil\` rounds a number up — \`Math.ceil(17.05)\` is 18.

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
18
19
20
28
\`\`\``,
    difficulty: "basic",
    category: "Math & Logic",
    tags: ["math", "functions"],
    starter_code: `function century(year) {
  // Your code here
}

console.log(century(1705));
console.log(century(1900));
console.log(century(2000));
console.log(century(2742));`,
    solution_code: `function century(year) {
  return Math.ceil(year / 100);
}

console.log(century(1705));
console.log(century(1900));
console.log(century(2000));
console.log(century(2742));`,
    test_cases: [],
  },
  {
    title: "Basic Mathematical Operations",
    description: `**Task:** Write a function \`basicOp(operation, value1, value2)\` that performs one of four operations given as a string: \`'+'\`, \`'-'\`, \`'*'\`, or \`'/'\`.

**Example:**
\`\`\`js
basicOp("+", 4, 7);  // → 11
basicOp("-", 15, 18); // → -3
basicOp("*", 5, 5);   // → 25
basicOp("/", 49, 7);  // → 7
\`\`\`

**Tip:** an \`if ... else if\` chain — or a \`switch\` — works well here.

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
11
-3
25
7
\`\`\``,
    difficulty: "basic",
    category: "Math & Logic",
    tags: ["math", "conditionals", "strings"],
    starter_code: `function basicOp(operation, value1, value2) {
  // Your code here
}

console.log(basicOp("+", 4, 7));
console.log(basicOp("-", 15, 18));
console.log(basicOp("*", 5, 5));
console.log(basicOp("/", 49, 7));`,
    solution_code: `function basicOp(operation, value1, value2) {
  switch (operation) {
    case "+": return value1 + value2;
    case "-": return value1 - value2;
    case "*": return value1 * value2;
    case "/": return value1 / value2;
  }
}

console.log(basicOp("+", 4, 7));
console.log(basicOp("-", 15, 18));
console.log(basicOp("*", 5, 5));
console.log(basicOp("/", 49, 7));`,
    test_cases: [],
  },
  {
    title: "Calculate Average",
    description: `**Task:** Write a function \`findAverage(arr)\` that returns the average of the numbers in an array (the sum divided by the count). An empty array should return 0.

**Example:**
\`\`\`js
findAverage([1, 2, 3]); // → 2   (6 / 3)
findAverage([]);       // → 0
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
2
0
\`\`\``,
    difficulty: "basic",
    category: "Math & Logic",
    tags: ["math", "arrays"],
    starter_code: `function findAverage(arr) {
  // Your code here
}

console.log(findAverage([1, 2, 3]));
console.log(findAverage([]));`,
    solution_code: `function findAverage(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, n) => sum + n, 0) / arr.length;
}

console.log(findAverage([1, 2, 3]));
console.log(findAverage([]));`,
    test_cases: [],
  },
  {
    title: "Expressions Matter",
    description: `**Task:** Given three positive integers \`a\`, \`b\`, \`c\`, write a function \`expressionsMatter(a, b, c)\` that returns the largest result you can get by inserting \`+\` and \`*\` (and parentheses) between them, keeping the order. You can use each operator any number of times, or not at all.

**Example:**
\`\`\`js
expressionsMatter(1, 2, 3); // → 9  ((1 + 2) * 3)
expressionsMatter(1, 1, 1); // → 3  (1 + 1 + 1)
expressionsMatter(9, 1, 1); // → 18 (9 * (1 + 1))
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
9
3
18
\`\`\``,
    difficulty: "basic",
    category: "Math & Logic",
    tags: ["math", "functions"],
    starter_code: `function expressionsMatter(a, b, c) {
  // Your code here
}

console.log(expressionsMatter(1, 2, 3));
console.log(expressionsMatter(1, 1, 1));
console.log(expressionsMatter(9, 1, 1));`,
    solution_code: `function expressionsMatter(a, b, c) {
  return Math.max(
    a + b + c,
    a * b * c,
    a + b * c,
    a * b + c,
    (a + b) * c,
    a * (b + c),
  );
}

console.log(expressionsMatter(1, 2, 3));
console.log(expressionsMatter(1, 1, 1));
console.log(expressionsMatter(9, 1, 1));`,
    test_cases: [],
  },
  {
    title: "Count the Monkeys!",
    description: `**Task:** Write a function \`monkeyCount(n)\` that returns an array with every number from 1 to \`n\` (both included), skipping zero. This is a counting loop in array form.

**Example:**
\`\`\`js
monkeyCount(10); // → [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
monkeyCount(1);  // → [1]
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
1,2,3,4,5,6,7,8,9,10
1
\`\`\``,
    difficulty: "basic",
    category: "Loops",
    tags: ["loops", "arrays"],
    starter_code: `function monkeyCount(n) {
  // Your code here
}

console.log(monkeyCount(10));
console.log(monkeyCount(1));`,
    solution_code: `function monkeyCount(n) {
  const monkeys = [];
  for (let i = 1; i <= n; i++) {
    monkeys.push(i);
  }
  return monkeys;
}

console.log(monkeyCount(10));
console.log(monkeyCount(1));`,
    test_cases: [],
  },
  {
    title: "Count Sheep",
    description: `**Task:** Write a function \`countSheep(n)\` that builds a string counting sheep: for each number from 1 to \`n\`, append the number, the word \`sheep...\`, and so on. The input is a non-negative integer.

**Example:**
\`\`\`js
countSheep(3); // → "1 sheep...2 sheep...3 sheep..."
\`\`\`

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
1 sheep...2 sheep...3 sheep...
\`\`\``,
    difficulty: "basic",
    category: "Loops",
    tags: ["loops", "strings"],
    starter_code: `function countSheep(n) {
  // Your code here
}

console.log(countSheep(3));`,
    solution_code: `function countSheep(n) {
  let result = "";
  for (let i = 1; i <= n; i++) {
    result += i + " sheep...";
  }
  return result;
}

console.log(countSheep(3));`,
    test_cases: [],
  },
  {
    title: "Total Amount of Points",
    description: `**Task:** Our football team played a championship. Each match result is a string like \`"3:1"\` — our score first, the opponent's score second.

Write a function \`points(games)\` that returns the total points:
- Win (\`x > y\`): 3 points
- Tie (\`x = y\`): 1 point
- Loss (\`x < y\`): 0 points

**Example:**
\`\`\`js
points(["3:1", "2:2", "0:1"]); // → 4  (3 + 1 + 0)
points(["1:0", "2:0", "3:0"]); // → 9
\`\`\`

**Tip:** \`"3:1".split(":")\` gives \`["3", "1"]\`, then \`Number(...)\` converts each piece.

**How to check:** run the starter code and compare with the expected output.

**Expected output:**
\`\`\`text
4
9
\`\`\``,
    difficulty: "basic",
    category: "Loops",
    tags: ["loops", "strings", "arrays"],
    starter_code: `function points(games) {
  // Your code here
}

console.log(points(["3:1", "2:2", "0:1"]));
console.log(points(["1:0", "2:0", "3:0"]));`,
    solution_code: `function points(games) {
  let total = 0;
  for (const game of games) {
    const [x, y] = game.split(":").map(Number);
    if (x > y) total += 3;
    else if (x === y) total += 1;
  }
  return total;
}

console.log(points(["3:1", "2:2", "0:1"]));
console.log(points(["1:0", "2:0", "3:0"]));`,
    test_cases: [],
  },
];
