import type { CourseData } from "./types";
import { codeBlock, externalLink, BOX_STYLE } from "./format";

export const jsCourse: CourseData = {
  title: "JavaScript Fundamentals — Code It Yourself",
  description:
    "The language of the browser — 9 hands-on lessons plus 5 console projects (string utils, bill splitter, challenges, grade analyzer, store cart). Hit Run, read the console, learn by doing.",
  icon: "",
  difficulty: "Beginner",
  category: "Frontend",
  order_index: 3,
  chapters: [
    {
      title: "1. Variables & Values",
      content: {
        type: "console",
        instructions: `
<h2>Storing values in memory</h2>
<p><strong>Variables</strong> are named boxes that hold values. JavaScript gives you three keywords to declare them:</p>
${codeBlock(`let points = 150;   // can be reassigned later
const name = "Alex";  // cannot be reassigned — the default choice
var legacy = 1;      // old-style; don't use it anymore`)}
<ul>
  <li><code>const</code> — use it by <strong>default</strong>; reassign only when needed (<code>let</code>)</li>
  <li><code>var</code> — legacy from 1995; modern code never writes it</li>
  <li>Names: <code>camelCase</code>, start with a letter, no spaces, no reserved words</li>
</ul>

<h3>The value types you'll meet daily</h3>
${codeBlock(`"hello"        // string — text, in quotes
42            // number — integers and decimals
3.14          // also a number
true          // boolean — true or false`)}
<p><code>typeof</code> tells you a value's type — great for debugging:</p>
${codeBlock(`console.log(typeof "hello"); // -> string
console.log(typeof 42);      // -> number
console.log(typeof true);    // -> boolean`)}
<p>Press <strong>Run</strong> — whatever you <code>console.log</code> appears in the console panel below the editor. That tab is your friend for the whole course.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — variables", "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/Variables")} · ${externalLink("MDN — const", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const")} · ${externalLink("MDN — typeof", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof")}</p>

<h3>Your task</h3>
<p>Build a mini developer profile in variables: <code>const name</code> (a string), <code>const role</code> (a string), <code>const isEmployed</code> (a boolean) and <code>let points</code> (a number, start at 150). Log the <code>typeof</code> of each one, then add 50 to <code>points</code> and log it again — proving <code>let</code> can be reassigned.</p>
`,
        initialCode: `// Build your developer profile below
// 1. Declare: const name (string), const role (string)
//    const isEmployed (boolean), let points (number = 150)
//
// 2. Log typeof for each variable
//
// 3. Add 50 to points, then log points again

console.log("Start coding!");`,
        solution: `const name = "Alex";
const role = "Frontend learner";
const isEmployed = true;
let points = 150;

console.log(typeof name);       // -> string
console.log(typeof role);       // -> string
console.log(typeof isEmployed); // -> boolean
console.log(typeof points);     // -> number

points += 50;
console.log(points);            // -> 200 (let can change)`,
      },
      points_reward: 10,
    },
    {
      title: "2. Strings & Template Literals",
      content: {
        type: "console",
        instructions: `
<h2>Text is everywhere — master it</h2>
<p>Strings are text wrapped in quotes. Modern JavaScript prefers <strong>template literals</strong> — backticks that embed values with <code>\${...}</code>:</p>
${codeBlock(`const name = "Alex";
const role = "developer";

// Old way — gluing with +
const old = "Hello, " + name + "!";

// Modern way — template literal
const msg = \`Hello, \${name}! You are a \${role}.\`;
console.log(msg);`)}
<ul>
  <li>Template literals keep <em>whitespace and newlines</em> — multiline text without hacks</li>
  <li><code>\${expression}</code> runs JavaScript <em>inside</em> the string — any expression</li>
  <li>They beat <code>+</code> concatenation for readability — used everywhere in production</li>
</ul>

<h3>Handy string methods</h3>
${codeBlock(`"LynxDEV".length          // 7 — how many characters
"LynxDEV".toUpperCase()  // LYNXDEV
"LynxDEV".toLowerCase()  // lynxdev
"lynx".includes("ynx")   // true — contains?
"  hi ".trim()           // "hi" — strip surrounding spaces
"Dev"[0]                 // "D" — first character (indexes start at 0)`)}
<p>Methods are called on values with a dot and <code>()</code>. They don't change the original string — strings are <strong>immutable</strong>; they return a new string.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — template literals", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals")} · ${externalLink("MDN — string basics", "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/Strings")}</p>

<h3>Your task</h3>
<p>Rewrite these concatenated strings as <strong>template literals</strong>: a greeting for a user, and an announce line combining course + lesson. Then log <code>course.length</code>, an uppercase shout of the course, and a check whether the title <code>includes</code> the word "JavaScript".</p>
`,
        initialCode: `const user = "Ada";
const course = "JavaScript Fundamentals";
const lesson = "Strings & Template Literals";

// Task 1: rebuild this as a template literal
console.log("Hello, " + user + "!");

// Task 2: rebuild as a template literal
console.log(course + " — Lesson: " + lesson);

// Task 3: log the length of course

// Task 4: log course in ALL CAPS

// Task 5: does the course title include "JavaScript"? log it`,
        solution: `const user = "Ada";
const course = "JavaScript Fundamentals";
const lesson = "Strings & Template Literals";

// Task 1: template literal
console.log(\`Hello, \${user}!\`); // -> Hello, Ada!

// Task 2: template literal
console.log(\`\${course} — Lesson: \${lesson}\`);

// Task 3: length
console.log(course.length); // -> 23

// Task 4: uppercase
console.log(course.toUpperCase());

// Task 5: includes
console.log(course.includes("JavaScript")); // -> true`,
      },
      points_reward: 10,
    },
    {
      title: "3. Numbers & Math",
      content: {
        type: "console",
        instructions: `
<h2>Computers were built for this</h2>
<p>Numbers and arithmetic are the foundation of every program — prices, scores, physics, you name it.</p>

<h3>Operators</h3>
${codeBlock(`10 + 3   // 13  addition
10 - 3   // 7   subtraction
10 * 3   // 30  multiplication
10 / 3   // 3.3333...  division
10 % 3   // 1   remainder (modulo)
10 ** 2  // 100 exponent`)}
<ul>
  <li><code>%</code> (modulo) — remainder after division. Odd/even checks, wrapping items, calendar math</li>
  <li><code>**</code> — exponent (power)</li>
  <li>Precedence works like math class: <code>*</code>/<code>/</code> before <code>+</code>/<code>-</code>; parentheses override</li>
</ul>

<h3>Two special numbers</h3>
${codeBlock(`"abc" * 2   // NaN — "Not a Number": math that isn't math
1 / 0       // Infinity — division by zero doesn't crash JS`)}
<p><code>NaN</code> is the #1 silent bug source: it propagates through calculations. Check with <code>Number.isNaN(x)</code>, never <code>x === NaN</code> (it's never equal to itself).</p>

<h3>The Math object</h3>
${codeBlock(`Math.round(3.6);            // 4 — nearest integer
Math.floor(3.9);            // 3 — always down
Math.ceil(3.1);             // 4 — always up
Math.max(3, 9, 4);          // 9
Math.min(3, 9, 4);          // 3
Math.random();              // decimal between 0 (inclusive) and 1 (exclusive)
Math.floor(Math.random() * 6) + 1;  // classic: dice roll 1-6`)}
<p>Two decimals is a common need — the classic trick: <code>Math.round(x * 100) / 100</code>.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — Math", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math")} · ${externalLink("MDN — numbers", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number")}</p>

<h3>Your task</h3>
<p>A bike team is planning a one-day trip. Compute and log: (1) average speed for a 286 km ride in 4 hours, (2) the leftover riders when 17 riders are split into groups of 5 (<code>%</code>), (3) a tip of 13.5% on a coffee costing $8.75, rounded to 2 decimals, (4) one random dice roll, (5) the result of <code>"abc" * 3</code> and the <code>Number.isNaN</code> check on it.</p>
`,
        initialCode: `// Bike team calculations
// 1. Average speed: 286 km / 4 hours
// 2. Riders left over: 17 % 5
// 3. Coffee tip: 8.75 * 0.135, rounded to 2 decimals
// 4. One random dice roll (1-6)
// 5. NaN check: log "abc" * 3, then Number.isNaN(...) on it
// (dice roll uses Math.floor(Math.random() * 6) + 1)

console.log("Let's plan the trip!");`,
        solution: `// 1. Average speed
console.log(286 / 4); // -> 71.5 km/h

// 2. Leftover riders when grouping 17 into 5s
console.log(17 % 5); // -> 2 riders left over

// 3. Coffee tip, 2 decimals
const tip = Math.round(8.75 * 0.135 * 100) / 100;
console.log(tip); // -> 1.18

// 4. Dice roll 1-6
console.log(Math.floor(Math.random() * 6) + 1);

// 5. NaN propagation
const broken = "abc" * 3;
console.log(broken); // -> NaN
console.log(Number.isNaN(broken)); // -> true`,
      },
      points_reward: 10,
    },
    {
      title: "4. Conditionals & Logic",
      content: {
        type: "console",
        instructions: `
<h2>Making decisions in code</h2>
<p>Programs branch on conditions: <code>if</code>, <code>else if</code>, <code>else</code>.</p>

<h3>The if family</h3>
${codeBlock(`const score = 78;

if (score >= 90) {
  console.log("A");
} else if (score >= 75) {
  console.log("B");    // -> this runs
} else {
  console.log("Keep going!");
}`)}
<ul>
  <li>Conditions are <strong>booleans</strong>; <code>else if</code> chains evaluate top-down, first match wins</li>
  <li>Curly braces <em>always</em> — even for one-liners (industry rule)</li>
  <li>Combine conditions with <strong>logical operators</strong>: <code>&&</code> (and), <code>||</code> (or), <code>!</code> (not)</li>
</ul>

<h3>=== vs == — the strict one</h3>
${codeBlock(`"42" == 42   // true  — loose: JS converts types (dangerous)
"42" === 42  // false — strict: compares type + value (always use)`)}
<p>Use <code>===</code>/<code>!==</code> everywhere. Loose equality's type coercion is a legendary source of bugs.</p>

<h3>Truthy &amp; falsy</h3>
<p>Inside conditions, these are <strong>falsy</strong> — everything else is truthy:</p>
${codeBlock(`false, 0, "" (empty string), null, undefined, NaN`)}
<p>So <code>if (username)</code> means "if username has content" — the standard idiom for missing-data checks.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — if/else", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else")} · ${externalLink("MDN — equality", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness")}</p>

<h3>Your task</h3>
<p>Given <code>experienceYears = 4</code> and <code>portfolioUrl = "https://alex.dev"</code>: (1) log a ranking — "Junior" under 2 years, "Mid" under 5, "Senior" at 5+. (2) Log "Ready to hire" only when years ≥ 2 <strong>and</strong> there's a portfolio URL. (3) Prove <code>"5" == 5</code> is true while <code>"5" === 5</code> is false. (4) Log whether each of <code>""</code>, <code>"cat"</code>, <code>0</code> is truthy or falsy.</p>
`,
        initialCode: `const experienceYears = 4;
const portfolioUrl = "https://alex.dev";

// Task 1: log "Junior" (<2 years), "Mid" (under 5), "Senior" (5+)

// Task 2: "Ready to hire" only when years >= 2 AND portfolioUrl is truthy

// Task 3: prove "5" == 5 is true but "5" === 5 is false

// Task 4: for "", "cat" and 0, log whether each is truthy or falsy

console.log("Profile check done");`,
        solution: `const experienceYears = 4;
const portfolioUrl = "https://alex.dev";

// Task 1: ranking
if (experienceYears < 2) {
  console.log("Junior");
} else if (experienceYears < 5) {
  console.log("Mid"); // -> this runs
} else {
  console.log("Senior");
}

// Task 2: hiring verdict
if (experienceYears >= 2 && portfolioUrl) {
  console.log("Ready to hire");
} else {
  console.log("Build a portfolio first");
}

// Task 3: strict vs loose
console.log("5" == 5); // -> true (loose coerces)
console.log("5" === 5); // -> false (strict)

// Task 4: truthy/falsy
console.log(Boolean("")); // -> false (falsy)
console.log(Boolean("cat")); // -> true
console.log(Boolean(0)); // -> false (falsy)`,
      },
      points_reward: 10,
    },
    {
      title: "5. Loops",
      content: {
        type: "console",
        instructions: `
<h2>Repeat without copying</h2>
<p>Loops execute code many times. Two you'll use daily:</p>

<h3>for — counting loops</h3>
${codeBlock(`for (let i = 0; i < 5; i++) {
  console.log("Step", i);
}
// -> Step 0 ... Step 4`)}
<ul>
  <li><code>i = 0</code> — start; <code>i &lt; 5</code> — keep going while true; <code>i++</code> — step</li>
  <li>Start at <strong>0</strong> — arrays are zero-indexed, and loops almost always index them</li>
</ul>

<h3>while — condition loops</h3>
${codeBlock(`let fuel = 3;
while (fuel > 0) {
  console.log("Fuel left:", fuel);
  fuel--;
}
// -> 3, 2, 1 — then stops`)}
<div style="${BOX_STYLE}"><strong>Infinite loop warning:</strong> if the condition never becomes false, the program spins forever and hangs the browser. Always make progress toward the exit (like <code>fuel--</code>).</div>

<h3>Looping over arrays — for...of</h3>
${codeBlock(`const skills = ["HTML", "CSS", "JS"];
for (const skill of skills) {
  console.log("Skill:", skill);
}`)}
<p><code>for...of</code> hands you each item directly — no indexes, no <code>arr[i]</code>. The go-to for reading arrays.</p>

<h3>break &amp; continue</h3>
${codeBlock(`for (const n of [1, 2, 3, 4]) {
  if (n === 3) break;       // stop the loop entirely
  if (n === 2) continue;    // skip just this iteration
  console.log(n);           // -> 1
}`)}
<p><code>break</code> leaves; <code>continue</code> skips. Both are early exits for special values.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — for", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for")} · ${externalLink("MDN — while", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while")} · ${externalLink("MDN — for...of", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of")}</p>

<h3>Your task</h3>
<p>Print 1 to 10, each tagged <code>even</code> or <code>odd</code> (use <code>%</code>). Sum all numbers from 1 to 100 in a loop and log the total. Then loop <code>["Learn", "Build", "Ship"]</code> with <code>for...of</code>, logging <code>Phase 1: Learn</code> style lines — track the index with a counter.</p>
`,
        initialCode: `// Task 1: loop 1..10, log each with "even" or "odd"
// Task 2: sum 1..100 in a loop, log the total
// Task 3: for...of over ["Learn","Build","Ship"] -> "Phase 1: Learn" ...

console.log("Looping time!");`,
        solution: `// Task 1: even/odd for 1..10
for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) {
    console.log(i, "even");
  } else {
    console.log(i, "odd");
  }
}

// Task 2: sum 1..100
let total = 0;
for (let i = 1; i <= 100; i++) {
  total += i;
}
console.log("Sum:", total); // -> 5050

// Task 3: phases with index
const phases = ["Learn", "Build", "Ship"];
let index = 1;
for (const phase of phases) {
  console.log(\`Phase \${index}: \${phase}\`);
  index++;
}`,
      },
      points_reward: 10,
    },
    {
      title: "6. Functions",
      content: {
        type: "console",
        instructions: `
<h2>Reusable blocks of logic</h2>
<p><strong>Functions</strong> package behavior under a name, take inputs, and return outputs. DRY — don't repeat yourself — is why they exist.</p>

<h3>Anatomy</h3>
${codeBlock(`function greet(name, greeting = "Hello") {
  const message = \`\${greeting}, \${name}!\`;
  return message;
}

console.log(greet("Ada"));       // -> Hello, Ada!
console.log(greet("Bob", "Hi")); // -> Hi, Bob!`)}
<ul>
  <li><code>name</code> and <code>greeting</code> — parameters (inputs); <code>greeting = "Hello"</code> is a <strong>default parameter</strong></li>
  <li><code>return</code> — hands the result back. Without it the function returns <code>undefined</code></li>
  <li>Functions <em>return</em> values; they don't <em>print</em> them — printing is the caller's job</li>
</ul>

<h3>Arrow functions — the modern syntax</h3>
${codeBlock(`const double = (x) => x * 2;   // one expression — implicit return
const add = (a, b) => a + b;
const sayHello = () => "Hi!";      // no parameters

console.log(double(21)); // -> 42`)}
<p>Arrows are concise and behave like functions almost everywhere. You'll see them constantly in modern code — learn both styles.</p>

<h3>Why functions matter</h3>
<ul>
  <li>Name complex logic once, use it everywhere</li>
  <li>Fix a bug in one place, not twenty</li>
  <li>Small pure functions (same input → same output) are testable — big engineering teams build on that</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("MDN — functions", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions")} · ${externalLink("MDN — arrow functions", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions")}</p>

<h3>Your task</h3>
<p>Write three functions: <code>describePlanet(name, moons = 0)</code> returning a template-literal sentence; <code>area(width, height)</code> returning <code>width * height</code>; and an arrow <code>tax(price)</code> returning 8% tax. Call each one twice and log the results — including one call that uses the default parameter.</p>
`,
        initialCode: `// Task 1: function describePlanet(name, moons = 0)
//   -> returns: "Mars has 2 moons."
// Task 2: function area(width, height)
//   -> width * height
// Task 3: arrow function tax(price) -> price * 0.08

// Log one call of each (plus a second call using a default parameter)

console.log("Ready — write the three functions and call them!");`,
        solution: `function describePlanet(name, moons = 0) {
  return \`\${name} has \${moons} moons.\`;
}

function area(width, height) {
  return width * height;
}

const tax = (price) => price * 0.08;

console.log(describePlanet("Mars", 2)); // -> Mars has 2 moons.
console.log(describePlanet("Venus"));   // -> Venus has 0 moons. (default)
console.log(area(8, 5));                // -> 40
console.log(area(3, 3));                // -> 9
console.log(tax(100));                  // -> 8
console.log(tax(250));                  // -> 20`,
      },
      points_reward: 10,
    },
    {
      title: "7. Arrays & Array Methods",
      content: {
        type: "console",
        instructions: `
<h2>Lists of data</h2>
<p><strong>Arrays</strong> hold ordered lists of values, indexed from 0. The daily toolkit:</p>

<h3>Creating &amp; reading</h3>
${codeBlock(`const todos = ["learn", "build", "ship"];
todos[0]                    // "learn" — first item
todos.length                // 3
todos[todos.length - 1]     // "ship" — last item`)}
<p>Indexes start at 0, so the last item lives at <code>length - 1</code>.</p>

<h3>Mutation duo — add &amp; remove</h3>
${codeBlock(`todos.push("deploy");      // add to the END
todos.pop();               // remove from the END
todos.unshift("plan");     // add to the START
todos.shift();             // remove from the START`)}
<p><code>push</code>/<code>pop</code> are the workhorses (stacks, undo logs); <code>unshift</code>/<code>shift</code> are rarer — avoid them in hot loops, they shift every index.</p>

<h3>The reader methods</h3>
${codeBlock(`todos.indexOf("build");     // 1 — position of an item
todos.includes("deploy");   // false — membership check
todos.slice(0, 2);          // ["learn","build"] — copy items [0..2)
todos.join(" -> ");         // "learn -> build -> ship" — printable list`)}
<p><code>slice</code> returns a <em>copy</em>, <code>join</code> turns the array into a display string — perfect for that "your list: A, B, C" output.</p>

<h3>Copying the right way</h3>
${codeBlock(`const copy = [...todos];   // spread — a real copy
const alias = todos;        // NOT a copy — both names see the same array`)}
<p>Arrays are <strong>reference values</strong>: <code>alias</code> points at the same array, and mutating one changes the other. Spread (<code>...</code>) creates a new one. This trips up every beginner at least once.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — arrays", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array")} · ${externalLink("MDN — spread", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax")}</p>

<h3>Your task</h3>
<p>Start from <code>["learn", "build"]</code> and: (1) <code>push("ship")</code> and <code>unshift("plan")</code>. (2) Copy with spread, then <code>pop()</code> and <code>shift()</code> the <em>copy</em> and log both arrays — proof that the original wasn't touched. (3) Log <code>indexOf("build")</code> and <code>includes("deploy")</code>. (4) Log the first two items via <code>slice</code> and the whole list via <code>join(" -> ")</code>.</p>
`,
        initialCode: `const todos = ["learn", "build"];

// Task 1: push("ship") and unshift("plan") on todos

// Task 2: copy todos with spread, then pop() + shift() the copy;
//         log BOTH arrays — the original must be unchanged

// Task 3: log indexOf("build") and includes("deploy")

// Task 4: log slice(0, 2) and the full list joined with " -> "

console.log("Ready — todos array loaded");`,
        solution: `const todos = ["learn", "build"];

// Task 1
todos.push("ship");
todos.unshift("plan");
// todos: ["plan", "learn", "build", "ship"]

// Task 2
const copy = [...todos];
copy.pop();
copy.shift();
console.log(todos); // -> ["plan", "learn", "build", "ship"]
console.log(copy);  // -> ["learn", "build"]

// Task 3
console.log(todos.indexOf("build")); // -> 2
console.log(todos.includes("deploy")); // -> false

// Task 4
console.log(todos.slice(0, 2)); // -> ["plan", "learn"]
console.log(todos.join(" -> ")); // -> plan -> learn -> build -> ship`,
      },
      points_reward: 10,
    },
    {
      title: "8. Higher-Order Array Methods",
      content: {
        type: "console",
        instructions: `
<h2>Functions that transform lists</h2>
<p>Four methods power most list processing. Each takes a <strong>callback function</strong> (a function passed as an argument) and returns a new array.</p>

<h3>map — transform every item</h3>
${codeBlock(`const prices = [10, 20, 30];
const doubled = prices.map((p) => p * 2);
// [20, 40, 60] — same length, new values`)}
<p><code>map</code> builds a new array of the same length by applying the callback to each item.</p>

<h3>filter — keep what matches</h3>
${codeBlock(`const ratings = [5, 3, 4, 1, 5, 2];
const good = ratings.filter((r) => r >= 4);
// [5, 4, 5] — only items where the callback is true`)}
<p><code>filter</code> shrinks the list; the callback is a yes/no test per item.</p>

<h3>find — the first match</h3>
${codeBlock(`const firstGood = ratings.find((r) => r >= 4);
// 5 — first match only, or undefined if none`)}
<h3>reduce — boil down to one value</h3>
${codeBlock(`const total = ratings.reduce((sum, r) => sum + r, 0);
// 20 — walk the array, accumulating into sum.
// The 0 is the starting value of sum.`)}
<p>Everything you could do with a loop + accumulator is <code>reduce</code> — totals, averages, counts.</p>

<h3>Chaining &amp; sorting</h3>
${codeBlock(`const stats = ratings
  .filter((r) => r >= 4)
  .map((r) => r * 10)
  .join(", ");   // "50, 40, 50"

[3, 10, 2].sort();              // [10, 2, 3] — sorts as STRINGS!
[3, 10, 2].sort((a, b) => a - b); // [2, 3, 10] — numbers, the right way`)}
<div style="${BOX_STYLE}"><strong>Classic trap:</strong> <code>sort()</code> with no argument sorts alphabetically — <code>10</code> comes before <code>2</code>. Numeric sorting always passes <code>(a, b) => a - b</code>.</div>

<h3>Learn more</h3>
<p>${externalLink("MDN — Array methods", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#instance_methods")} · ${externalLink("MDN — reduce", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce")}</p>

<h3>Your task</h3>
<p>An inventory has three items (<code>{ name, price }</code> objects). (1) <code>map</code> to a 10%-off price, rounded to 2 decimals. (2) <code>filter</code> items under budget 25. (3) <code>find</code> the first item above 100. (4) <code>reduce</code> to a total. (5) Chain: log the discounted prices in a comma string, and log prices sorted ascending with the numeric comparator.</p>
`,
        initialCode: `const inventory = [
  { name: "Kettle", price: 24 },
  { name: "Screen", price: 140 },
  { name: "Mouse", price: 12 },
];

// Task 1: map -> 10% off (rounded to 2 decimals), log
// Task 2: filter -> items under 25, log names
// Task 3: find -> first item above 100, log its name
// Task 4: reduce -> total price, log
// Task 5: chain discounted prices with join(", ");
//         log prices sorted ascending (numeric comparator)

console.log("Ready — inventory loaded");`,
        solution: `const inventory = [
  { name: "Kettle", price: 24 },
  { name: "Screen", price: 140 },
  { name: "Mouse", price: 12 },
];

// Task 1: 10% off
const discounted = inventory.map((item) =>
  Math.round(item.price * 0.9 * 100) / 100
);
console.log(discounted); // -> [21.6, 126, 10.8]

// Task 2: under 25
console.log(inventory.filter((item) => item.price < 25).map((i) => i.name));
// -> ["Kettle", "Mouse"]

// Task 3: first above 100
console.log(inventory.find((item) => item.price > 100)?.name);
// -> "Screen"

// Task 4: total
const total = inventory.reduce((sum, item) => sum + item.price, 0);
console.log(total); // -> 176

// Task 5: chains
console.log(discounted.join(", "));
// -> 21.6, 126, 10.8
console.log(inventory.map((i) => i.price).sort((a, b) => a - b));
// -> [12, 24, 140]`,
      },
      points_reward: 10,
    },
    {
      title: "9. Objects & Scope",
      content: {
        type: "console",
        instructions: `
<h2>Key-value pairs — the shape of data</h2>
<p><strong>Objects</strong> group related values under named keys. APIs, user profiles, cart items — all objects.</p>

<h3>Creating &amp; reading</h3>
${codeBlock(`const user = {
  name: "Alex",
  role: "learner",
  points: 150,
  address: { city: "Lisbon" },  // nested — objects inside objects
};

user.name            // "Alex" — dot access
user["role"]         // "learner" — bracket access (dynamic keys)
user.address.city    // "Lisbon" — walk the nesting
const key = "points";
user[key]            // 150 — bracket access with a variable`)}
<p>Dot access for known keys; brackets when the key is dynamic. Just like arrays, objects are <strong>reference values</strong> — <code>const</code> protects the binding, not the object: <code>user.points = 200</code> is allowed.</p>

<h3>Destructuring — unpack in one line</h3>
${codeBlock(`const { name, points } = user;
// name = "Alex", points = 150 — variables declared from keys

const { address: { city } } = user;  // nested destructure
console.log(city); // -> Lisbon`)}
<p>Destructuring is everywhere in modern code — React components, responses, config objects.</p>

<h3>Spreading objects</h3>
${codeBlock(`const upgraded = { ...user, points: 250 };
// a copy with points replaced — the original stays intact`)}
<p><code>{...obj}</code> shallow-copies; later keys win. The pattern for "give me a new version" instead of mutating.</p>

<h3>Scope — where variables live</h3>
${codeBlock(`const globalVar = "visible everywhere";

function demo() {
  const inside = "only inside demo";
  if (true) {
    const block = "only inside this block";
    console.log(inside); // works — parent scopes are visible
  }
  // console.log(block); // ReferenceError — out of scope
}`)}
<ul>
  <li><code>let</code>/<code>const</code> are <strong>block-scoped</strong> — visible only within their <code>{ }</code> and nested blocks</li>
  <li>Inner scopes <em>see</em> outer ones; the reverse is forbidden</li>
  <li>'Scope creep' bugs are almost always "used a variable that doesn't exist here" — the error message names it</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("MDN — objects", "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Basics")} · ${externalLink("MDN — destructuring", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment")} · ${externalLink("MDN — scope", "https://developer.mozilla.org/en-US/docs/Glossary/Scope")}</p>

<h3>Your task</h3>
<p>Build a <code>user</code> object: <code>name</code>, <code>score</code>, <code>isActive</code>, and a nested <code>skills</code> array. Log <code>name</code> by dot access and <code>score</code> via a dynamic key variable. Destructure <code>{ name, score }</code> and log them. Create an <code>upgraded</code> copy with <code>score + 100</code> via spread and log both scores to prove immutability. Then demonstrate scope: declare a <code>const message</code> inside an <code>if</code> block and try to log it <em>outside</em> — observe the error, then fix it by moving the declaration out.</p>
`,
        initialCode: `const user = {
  name: "Alex",
  score: 150,
  isActive: true,
  skills: ["HTML", "CSS"],
};

// Task 1: log name (dot) and score (bracket, via a dynamic key variable)

// Task 2: destructure { name, score } from user and log both

// Task 3: spread copy with score + 100 -> "upgraded"; log both scores

// Task 4: scope demo: declare const message inside an if (true) { }
//         block, log it OUTSIDE, see the error, then fix it

console.log("Ready — user object created");`,
        solution: `const user = {
  name: "Alex",
  score: 150,
  isActive: true,
  skills: ["HTML", "CSS"],
};

// Task 1
console.log(user.name); // -> Alex
const key = "score";
console.log(user[key]); // -> 150

// Task 2
const { name, score } = user;
console.log(name, score); // -> Alex 150

// Task 3
const upgraded = { ...user, score: score + 100 };
console.log(user.score); // -> 150 (unchanged)
console.log(upgraded.score); // -> 250 (new object)

// Task 4 — fixed: declare the message OUTSIDE the block
const message = "visible anywhere in this scope";
if (true) {
  console.log(message);
}
console.log(message); // works now`,
      },
      points_reward: 10,
    },
    {
      title: "10. Project — String Utilities",
      content: {
        type: "console",
        instructions: `
<h2>Project 1 of 5: a mini string library</h2>
<p>Real projects are collections of small, pure functions. Every function here returns a value — the test calls at the bottom prove them.</p>

<h3>Requirements (user stories)</h3>
<ul>
  <li><code>slugify(text)</code> — lowercase, trim, replace spaces with <code>-</code>: <code>"My Blog Post"</code> → <code>"my-blog-post"</code> (URLs and ids)</li>
  <li><code>countVowels(text)</code> — how many of <code>a e i o u</code> (case-insensitive; loop or array methods)</li>
  <li><code>isPalindrome(text)</code> — true when reversed equals original, ignoring case: <code>"Racecar"</code> → <code>true</code></li>
  <li><code>reverseWords(sentence)</code> — word order reversed, not letters: <code>"one two"</code> → <code>"two one"</code> (hint: <code>split(" ")</code>, <code>reverse()</code>, <code>join(" ")</code>)</li>
  <li>Below the functions, <strong>test calls</strong> showing each one working</li>
</ul>

<h3>Stretch goals</h3>
<ul>
  <li>Make <code>reverseWords</code> collapse double spaces</li>
  <li>Handle <code>"a"</code> and <code>""</code> in <code>isPalindrome</code> (should both be <code>true</code> — think about why)</li>
</ul>
`,
        initialCode: `// String Utility Library
// Implement the four functions below.
// Hints: .toLowerCase() .trim() .split(" ") .reverse() .join(" ") .includes()

function slugify(text) {
  // -> "My Blog Post" becomes "my-blog-post"
}

function countVowels(text) {
  // -> count of a, e, i, o, u (any case)
}

function isPalindrome(text) {
  // -> true when reversed (ignoring case) equals the original
}

function reverseWords(sentence) {
  // -> "one two" becomes "two one"
}

// ---- Test calls ----
console.log(slugify("My Blog Post"));
console.log(countVowels("Hello World"));
console.log(isPalindrome("Racecar"));
console.log(reverseWords("one two three"));`,
        solution: `// String Utility Library

function slugify(text) {
  return text.toLowerCase().trim().replaceAll(" ", "-");
}

function countVowels(text) {
  let count = 0;
  for (const ch of text.toLowerCase()) {
    if ("aeiou".includes(ch)) count++;
  }
  return count;
}

function isPalindrome(text) {
  const lower = text.toLowerCase();
  return lower === lower.split("").reverse().join("");
}

function reverseWords(sentence) {
  return sentence.split(" ").reverse().join(" ");
}

// ---- Test calls ----
console.log(slugify("My Blog Post")); // -> my-blog-post
console.log(countVowels("Hello World")); // -> 3 (e, o, o)
console.log(isPalindrome("Racecar")); // -> true
console.log(reverseWords("one two three")); // -> three two one`,
      },
      points_reward: 25,
    },
    {
      title: "11. Project — Bill Splitter",
      content: {
        type: "console",
        instructions: `
<h2>Project 2 of 5: the dinner bill, done right</h2>
<p>Money math is where rounding, types and edge cases matter. This project builds a small calculator family:</p>

<h3>Requirements (user stories)</h3>
<ul>
  <li><code>tipAmount(bill, tipPercent)</code> — the tip: <code>bill * (tipPercent / 100)</code></li>
  <li><code>totalWithTip(bill, tipPercent)</code> — bill + tip</li>
  <li><code>perPerson(bill, tipPercent, people)</code> — total split evenly, rounded to <strong>2 decimals</strong> with the <code>Math.round(x * 100) / 100</code> trick</li>
  <li><code>people &gt; 0</code> guard — return <code>0</code> when people is 0 or negative (no dividing by zero!)</li>
  <li>Test calls: <code>(80, 15, 2)</code> → per person <code>46</code>; <code>(120, 0, 3)</code> → <code>40</code>; <code>(45, 20, 1)</code> → <code>54</code>; <code>(60, 10, 0)</code> → guard <code>0</code></li>
</ul>

<h3>Stretch goals</h3>
<ul>
  <li>Log a full receipt line per call: <code>Bill: $80 · Tip 15% · 2 people → $46.00 each</code></li>
  <li>Handle a string bill gracefully (coerce with <code>Number()</code> or return NaN loudly)</li>
</ul>
`,
        initialCode: `// Bill Splitter
// Implement: tipAmount, totalWithTip, perPerson
// Round perPerson to 2 decimals: Math.round(x * 100) / 100
// Guard: people <= 0 -> return 0

function tipAmount(bill, tipPercent) {
  // bill * (tipPercent / 100)
}

function totalWithTip(bill, tipPercent) {
  // reuses tipAmount
}

function perPerson(bill, tipPercent, people) {
  // guard first, then totalWithTip / people, rounded
}

// ---- Test calls ----
console.log(perPerson(80, 15, 2)); // -> 46
console.log(perPerson(120, 0, 3)); // -> 40
console.log(perPerson(45, 20, 1)); // -> 54
console.log(perPerson(60, 10, 0)); // -> 0 (guard)`,
        solution: `// Bill Splitter

function tipAmount(bill, tipPercent) {
  return bill * (tipPercent / 100);
}

function totalWithTip(bill, tipPercent) {
  return bill + tipAmount(bill, tipPercent);
}

function perPerson(bill, tipPercent, people) {
  if (people <= 0) return 0;
  const share = totalWithTip(bill, tipPercent) / people;
  return Math.round(share * 100) / 100;
}

// ---- Test calls ----
console.log(perPerson(80, 15, 2)); // -> 46
console.log(perPerson(120, 0, 3)); // -> 40
console.log(perPerson(45, 20, 1)); // -> 54
console.log(perPerson(60, 10, 0)); // -> 0 (guard)`,
      },
      points_reward: 25,
    },
    {
      title: "12. Project — Code Challenges Pack",
      content: {
        type: "console",
        instructions: `
<h2>Project 3 of 5: the classic interview warm-ups</h2>
<p>FizzBuzz, primes and Fibonacci appear in screening rounds for a reason — they test loop logic, early returns and edge cases.</p>

<h3>Requirements (user stories)</h3>
<ul>
  <li><code>fizzBuzz(limit)</code> — for 1..limit log <code>Fizz</code> on multiples of 3, <code>Buzz</code> on 5, <code>FizzBuzz</code> on both, else the number. <strong>Check the "both" case first</strong> (the legendary bug is 15 printing "Fizz")</li>
  <li><code>isPrime(n)</code> — <code>false</code> for <code>n &lt; 2</code>; check divisors from 2 up to <code>n - 1</code>, early-return <code>false</code> on the first hit; else <code>true</code></li>
  <li><code>nthFibonacci(n)</code> — the <code>n</code>-th Fibonacci number with a loop (<code>n = 0</code> → 0, <code>n = 1</code> → 1, <code>n = 6</code> → 8)</li>
  <li>Test calls: <code>fizzBuzz(15)</code>, <code>isPrime(2)</code>/<code>isPrime(9)</code>/<code>isPrime(1)</code>, <code>nthFibonacci(6)</code> and <code>nthFibonacci(10)</code></li>
</ul>

<h3>Stretch goals</h3>
<ul>
  <li>Optimize <code>isPrime</code> to check only up to <code>Math.sqrt(n)</code> — explain why that's safe</li>
  <li>Render FizzBuzz as one comma-joined string instead of many logs</li>
</ul>
`,
        initialCode: `// Code Challenges Pack
// Implement: fizzBuzz, isPrime, nthFibonacci

function fizzBuzz(limit) {
  // for i in 1..limit:
  //   multiple of 3 AND 5 -> "FizzBuzz"  (check FIRST!)
  //   multiple of 3 -> "Fizz"
  //   multiple of 5 -> "Buzz"
  //   else -> the number
}

function isPrime(n) {
  // n < 2 -> false
  // loop divisors 2..n-1, early return false on first hit
  // otherwise true
}

function nthFibonacci(n) {
  // n = 0 -> 0, n = 1 -> 1
  // loop: next = prev + current ...
}

// ---- Test calls ----
fizzBuzz(15);
console.log("---");
console.log(isPrime(2)); // true
console.log(isPrime(9)); // false
console.log(isPrime(1)); // false
console.log(nthFibonacci(6)); // 8
console.log(nthFibonacci(10)); // 55`,
        solution: `// Code Challenges Pack

function fizzBuzz(limit) {
  for (let i = 1; i <= limit; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      console.log("FizzBuzz");
    } else if (i % 3 === 0) {
      console.log("Fizz");
    } else if (i % 5 === 0) {
      console.log("Buzz");
    } else {
      console.log(i);
    }
  }
}

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d < n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

function nthFibonacci(n) {
  if (n === 0) return 0;
  let prev = 0;
  let current = 1;
  for (let i = 2; i <= n; i++) {
    const next = prev + current;
    prev = current;
    current = next;
  }
  return current;
}

// ---- Test calls ----
fizzBuzz(15);
console.log("---");
console.log(isPrime(2)); // true
console.log(isPrime(9)); // false
console.log(isPrime(1)); // false
console.log(nthFibonacci(6)); // 8
console.log(nthFibonacci(10)); // 55`,
      },
      points_reward: 25,
    },
    {
      title: "13. Project — Grade Analyzer",
      content: {
        type: "console",
        instructions: `
<h2>Project 4 of 5: report cards with map, filter &amp; reduce</h2>
<p>Data analysis is where higher-order methods shine. This project turns an array of student objects into a readable report.</p>

<h3>Requirements (user stories)</h3>
<ul>
  <li>Data: <code>students</code> — array of <code>{ name, score }</code> objects (5 students, scores between 40 and 95)</li>
  <li><code>classAverage(students)</code> — <code>reduce</code> the scores, divide by length</li>
  <li><code>bestStudent(students)</code> — highest score. Hint: reduce works, or copy + sort + take first</li>
  <li><code>passedStudents(students, minScore = 60)</code> — <code>filter</code> by score</li>
  <li><code>letterGrade(score)</code> — A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, else F</li>
  <li><code>report(students)</code> — logs: average, best student with their grade, count passed, and one grade line per student</li>
</ul>

<h3>Stretch goals</h3>
<ul>
  <li>Top 3 by score: copy, sort with comparator, slice(0, 3)</li>
  <li>Handle an empty array — average should be 0, not NaN</li>
</ul>
`,
        initialCode: `// Grade Analyzer
// Data: students = [{ name, score }, ...] — 5 entries, scores 40-95

const students = [
  { name: "Ada", score: 92 },
  { name: "Grace", score: 78 },
  { name: "Linus", score: 55 },
  { name: "Margaret", score: 88 },
  { name: "Alan", score: 41 },
];

function classAverage(students) {
  // reduce scores -> sum, then / length (guard empty -> 0)
}

function bestStudent(students) {
  // highest score
}

function passedStudents(students, minScore = 60) {
  // filter >= minScore
}

function letterGrade(score) {
  // A >= 90, B >= 80, C >= 70, D >= 60, else F
}

function report(students) {
  // log average, best student + grade, count passed,
  // and a line per student: "Ada: 92 (A)"
}

// ---- Kick it off ----
console.log("Ready — analyze the class!");
report(students);`,
        solution: `// Grade Analyzer

const students = [
  { name: "Ada", score: 92 },
  { name: "Grace", score: 78 },
  { name: "Linus", score: 55 },
  { name: "Margaret", score: 88 },
  { name: "Alan", score: 41 },
];

function classAverage(students) {
  if (students.length === 0) return 0;
  const sum = students.reduce((acc, s) => acc + s.score, 0);
  return sum / students.length;
}

function bestStudent(students) {
  return students.reduce((best, s) => (s.score > best.score ? s : best));
}

function passedStudents(students, minScore = 60) {
  return students.filter((s) => s.score >= minScore);
}

function letterGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function report(students) {
  console.log(\`Class average: \${classAverage(students).toFixed(1)}\`);
  const best = bestStudent(students);
  console.log(\`Best: \${best.name} — \${letterGrade(best.score)}\`);
  console.log(\`Passed: \${passedStudents(students).length}\`);
  for (const s of students) {
    console.log(\`\${s.name}: \${s.score} (\${letterGrade(s.score)})\`);
  }
}

// ---- Kick it off ----
report(students);`,
      },
      points_reward: 25,
    },
    {
      title: "14. Final Project — Console Store Cart",
      content: {
        type: "console",
        instructions: `
<h2>Capstone: a checkout engine end to end</h2>
<p>Everything from this course — objects, arrays, higher-order methods, functions, template literals, guards — ships in one program: a store cart with tiered discounts and a receipt printer.</p>

<h3>Requirements (user stories)</h3>
<ul>
  <li><code>cart</code> — array of <code>{ name, price, qty }</code> (4 items, mixed quantities)</li>
  <li><code>subtotal(cart)</code> — reduce over <code>price * qty</code></li>
  <li><code>discountRate(subtotal)</code> — <code>0.2</code> over $250, <code>0.1</code> over $100, else <code>0</code> (tiered — <code>if/else if</code>)</li>
  <li><code>applyDiscount(cart)</code> — subtotal minus discount, min <code>0</code></li>
  <li><code>addTax(amount, rate = 0.08)</code> — total with 8% tax, 2 decimals</li>
  <li><code>checkout(cart)</code> — logs a full receipt: each item line with line total, subtotal, discount rate + amount, tax, <strong>grand total</strong>; returns the total (functions <em>return</em>, printing is the caller's job)</li>
</ul>

<h3>Stretch goals</h3>
<ul>
  <li><code>mostExpensiveItem(cart)</code> — the item with the highest line total (<code>reduce</code>)</li>
  <li>Guard: empty cart → subtotal <code>0</code>, checkout logs <code>"Cart is empty"</code></li>
</ul>
`,
        initialCode: `// Console Store Cart
// Data: cart = [{ name, price, qty }, ...] — 4 items

const cart = [
  { name: "Mechanical keyboard", price: 89, qty: 1 },
  { name: "USB-C hub", price: 45, qty: 2 },
  { name: "Notebook (3-pack)", price: 12, qty: 3 },
  { name: "Desk lamp", price: 34, qty: 1 },
];

function subtotal(cart) {
  // reduce: price * qty
}

function discountRate(subtotal) {
  // > 250 -> 0.2, > 100 -> 0.1, else 0
}

function applyDiscount(cart) {
  // subtotal - subtotal * discountRate, minimum 0
}

function addTax(amount, rate = 0.08) {
  // round to 2 decimals
}

function checkout(cart) {
  // item lines: "keyboard x1 -> $89"
  // subtotal / discount / tax / grand total lines
  // return the grand total
}

// ---- Kick it off ----
const total = checkout(cart);
console.log(\`Returned total: \${total}\`);`,
        solution: `// Console Store Cart

const cart = [
  { name: "Mechanical keyboard", price: 89, qty: 1 },
  { name: "USB-C hub", price: 45, qty: 2 },
  { name: "Notebook (3-pack)", price: 12, qty: 3 },
  { name: "Desk lamp", price: 34, qty: 1 },
];

function subtotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function discountRate(subtotal) {
  if (subtotal > 250) return 0.2;
  if (subtotal > 100) return 0.1;
  return 0;
}

function applyDiscount(cart) {
  const base = subtotal(cart);
  const discounted = base - base * discountRate(base);
  return Math.max(0, discounted);
}

function addTax(amount, rate = 0.08) {
  return Math.round(amount * (1 + rate) * 100) / 100;
}

function checkout(cart) {
  if (cart.length === 0) {
    console.log("Cart is empty");
    return 0;
  }

  for (const item of cart) {
    console.log(\`\${item.name} x\${item.qty} -> $\${(item.price * item.qty).toFixed(2)}\`);
  }

  const base = subtotal(cart);
  const rate = discountRate(base);
  const afterDiscount = applyDiscount(cart);
  const total = addTax(afterDiscount);

  console.log(\`Subtotal: $\${base.toFixed(2)}\`);
  console.log(\`Discount (\${Math.round(rate * 100)}%): -$\${(base - afterDiscount).toFixed(2)}\`);
  console.log(\`Tax (8%): $\${(total - afterDiscount).toFixed(2)}\`);
  console.log(\`GRAND TOTAL: $\${total.toFixed(2)}\`);
  return total;
}

// ---- Kick it off ----
const total = checkout(cart);
console.log(\`Returned total: \${total}\`);`,
      },
      points_reward: 25,
    },
  ],
};