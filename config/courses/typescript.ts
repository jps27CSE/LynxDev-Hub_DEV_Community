import type { CourseData } from "./types";
import { codeBlock, externalLink, BOX_STYLE } from "./format";

export const typescriptCourse: CourseData = {
  title: "TypeScript — Type-Safe JavaScript",
  description:
    "JavaScript with types — 10 hands-on lessons plus 4 projects (typed user profile, generic data fetcher, form validator, mini store). Catch bugs before they run. Requires JavaScript Fundamentals.",
  icon: "",
  difficulty: "Intermediate",
  category: "Frontend",
  order_index: 5,
  chapters: [
    {
      title: "1. Why TypeScript?",
      content: {
        type: "console",
        instructions: `
<h2>JavaScript, but with a safety net</h2>
<p><strong>TypeScript</strong> (TS) is a superset of JavaScript: every valid JS program is also valid TS. What TS adds is a <em>static type system</em> — you annotate values with types, and the compiler checks them <em>before</em> the code runs. Bugs that would explode at runtime in JS get caught at compile time in TS.</p>

<h3>The problem TS solves</h3>
${codeBlock(`// JavaScript: nothing stops this
function greet(user) {
  return "Hello, " + user.name.toUpperCase();
}
greet(42); // -> TypeError at runtime: Cannot read properties of undefined`)}
<p>In TS, the same mistake is a red squiggle in your editor — before you ever run it:</p>
${codeBlock(`// TypeScript
function greet(user: { name: string }) {
  return "Hello, " + user.name.toUpperCase();
}
greet(42); // Compile error: Argument of type 'number' is not assignable to parameter of type '{ name: string }'`)}
<ul>
  <li><strong>Static</strong> = checked before running (at build/edit time)</li>
  <li><strong>Dynamic (JS)</strong> = checked while running — too late, the user already saw the crash</li>
  <li>TS never changes how your code <em>runs</em> — it compiles to plain JS</li>
</ul>

<h3>What TS actually does</h3>
<ol>
  <li>You write <code>.ts</code> files with type annotations.</li>
  <li>The <code>tsc</code> compiler type-checks them and emits plain <code>.js</code>.</li>
  <li>The browser/Node runs the <code>.js</code> — types are <em>erased</em>, zero runtime cost.</li>
</ol>
${codeBlock(`// TypeScript (what you write)
const points: number = 150;
const name: string = "Alex";
console.log(points + 10, name.toUpperCase());

// JavaScript (what runs — types erased)
const points = 150;
const name = "Alex";
console.log(points + 10, name.toUpperCase());`)}

<h3>How this course runs code</h3>
<p>This editor runs <strong>JavaScript</strong> (types are erased at runtime, so the Run button executes the compiled output). Each chapter shows the idiomatic <strong>TypeScript</strong> in the lesson, then gives you JavaScript to run. Try typing the TS version in the <a href="https://www.typescriptlang.org/play" target="_blank" rel="noopener noreferrer">TypeScript Playground &#8599;</a> to see the compiler check it.</p>

<h3>When NOT to use TypeScript</h3>
<ul>
  <li>Tiny scripts / one-off snippets — overhead not worth it</li>
  <li>Teams with no TS experience and tight deadlines — learning curve is real</li>
  <li>Code that changes shape constantly (rapid prototyping) — types fight you</li>
</ul>
<p>For anything shipped to users or maintained by a team, TS pays for itself.</p>

<h3>Learn more</h3>
<p>${externalLink("TypeScript for JS Programmers (5 min)", "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html")} · ${externalLink("Why TypeScript", "https://www.typescriptlang.org/why-create-typescript/")} · ${externalLink("TypeScript Playground", "https://www.typescriptlang.org/play")}</p>

<h3>Your task</h3>
<p>Run the starter code. Then change <code>const points</code> to a string and <code>const name</code> to a number — observe nothing breaks at runtime (JS doesn't care). That's exactly the bug class TS exists to prevent. Write a comment explaining why static types help.</p>
`,
        initialCode: `// Run this — it's JavaScript (the compiled output of TypeScript)
const points = 150;
const name = "Alex";

console.log(points + 10);        // 160
console.log(name.toUpperCase()); // ALEX

// TODO: swap the types (points -> string, name -> number) and see
// that JS happily runs garbage. TypeScript would have stopped you.`,
        solution: `// JavaScript (compiled output) — runs fine even with wrong types
const points = "150";   // was number
const name = 42;        // was string

console.log(points + 10);        // "15010"  (string concat, not math!)
console.log(name.toUpperCase()); // TypeError at runtime

// TypeScript (what you'd write) would catch both before running:
// const points: number = "150";  // Error: Type 'string' is not assignable to type 'number'
// const name: string = 42;       // Error: Type 'number' is not assignable to type 'string'`,
      },
      points_reward: 10,
    },
    {
      title: "2. Type Annotations & Inference",
      content: {
        type: "console",
        instructions: `
<h2>Telling TypeScript what a value is</h2>
<p>A <strong>type annotation</strong> is a colon + type after a variable name. It tells the compiler what values are allowed:</p>
${codeBlock(`// TypeScript
let points: number = 150;
let name: string = "Alex";
let isActive: boolean = true;
let nothing: null = null;`)}
<p>JS has no annotations — you just write the value. TS checks the annotation matches the value:</p>
${codeBlock(`// TypeScript error
let points: number = "150"; // Error: Type 'string' is not assignable to type 'number'`)}

<h3>Type inference (let TS do the work)</h3>
<p>You rarely need to annotate everything. TS <strong>infers</strong> the type from the value you assign:</p>
${codeBlock(`// TypeScript — no annotation needed
let points = 150;        // inferred: number
let name = "Alex";       // inferred: string
let isActive = true;     // inferred: boolean

points = "150";          // Error: Type 'string' is not assignable to type 'number'`)}
<p>Rule of thumb: annotate function parameters and return types (the public contract); let inference handle local variables.</p>

<h3>The primitive types</h3>
<ul>
  <li><code>string</code>, <code>number</code>, <code>boolean</code> — the basics</li>
  <li><code>null</code> and <code>undefined</code> — "no value"</li>
  <li><code>bigint</code>, <code>symbol</code> — advanced</li>
  <li><code>any</code> — "I don't know / I don't care" (escape hatch; avoid)</li>
  <li><code>unknown</code> — "I don't know yet, but I'll check before using" (safer than <code>any</code>)</li>
  <li><code>never</code> — "this never happens" (exhaustive checks)</li>
  <li><code>void</code> — "returns nothing" (functions)</li>
</ul>

<h3><code>any</code> vs <code>unknown</code></h3>
${codeBlock(`// TypeScript
let a: any = "hello";
a.toUpperCase();        // OK — any disables all checking (dangerous)
a.foo.bar.baz();        // OK — no error, crashes at runtime

let u: unknown = "hello";
u.toUpperCase();        // Error: Object is of type 'unknown'
if (typeof u === "string") {
  u.toUpperCase();      // OK — narrowed to string
}`)}
<p>Prefer <code>unknown</code> over <code>any</code>. <code>any</code> turns off the type checker; <code>unknown</code> forces you to prove what it is first.</p>

<h3>Learn more</h3>
<p>${externalLink("Everyday Types", "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html")} · ${externalLink("Type Inference", "https://www.typescriptlang.org/docs/handbook/type-inference.html")} · ${externalLink("MDN — JavaScript data types", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures")}</p>

<h3>Your task</h3>
<p>Annotate the variables below with the correct types, then run. Bonus: try assigning the wrong type and see the (compile-time) error conceptually — here, just log a note.</p>
`,
        initialCode: `// Annotate each variable with the right type (in TS you'd write :type)
const name = "Ada";          // string
const age = 30;              // number
const isMember = true;       // boolean
const tags = ["js", "ts"];   // string[]

console.log(name, age, isMember, tags);

// Inference check: what type is \`total\`?
const total = age * 2 + tags.length;
console.log("total:", total, " (inferred: number)");`,
        solution: `const name: string = "Ada";
const age: number = 30;
const isMember: boolean = true;
const tags: string[] = ["js", "ts"];

console.log(name, age, isMember, tags);

const total: number = age * 2 + tags.length;
console.log("total:", total); // 62`,
      },
      points_reward: 10,
    },
    {
      title: "3. Functions & Parameters",
      content: {
        type: "console",
        instructions: `
<h2>Typing the contract of a function</h2>
<p>Functions are where types pay off most. Annotate <strong>parameters</strong> (inputs) and the <strong>return type</strong> (output) — that's the function's contract:</p>
${codeBlock(`// TypeScript
function add(a: number, b: number): number {
  return a + b;
}

const greet = (name: string): string => {
  return "Hello, " + name;
};`)}
<p>JS has no annotations — the same code runs, but nothing checks the inputs:</p>
${codeBlock(`// JavaScript (compiled output)
function add(a, b) { return a + b; }
add("1", 2); // -> "12" (string concat) — silent bug`)}

<h3>Optional and default parameters</h3>
${codeBlock(`// TypeScript
function log(msg: string, level?: string): void {
  console.log("[" + (level ?? "info") + "] " + msg);
}

function greet(name: string, greeting: string = "Hello"): string {
  return greeting + ", " + name;
}`)}
<ul>
  <li><code>param?: Type</code> — optional (may be <code>undefined</code>)</li>
  <li><code>param: Type = value</code> — default value</li>
  <li><code>void</code> return type — "returns nothing"</li>
</ul>

<h3>Rest parameters</h3>
${codeBlock(`// TypeScript
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3); // -> 6`)}

<h3>Function type expressions</h3>
<p>Describe a function's shape as a type — useful for callbacks:</p>
${codeBlock(`// TypeScript
type MathOp = (a: number, b: number) => number;

const add: MathOp = (a, b) => a + b;
const multiply: MathOp = (a, b) => a * b;

function apply(op: MathOp, x: number, y: number): number {
  return op(x, y);
}`)}

<h3>Learn more</h3>
<p>${externalLink("More on Functions", "https://www.typescriptlang.org/docs/handbook/2/functions.html")} · ${externalLink("Function Type Expressions", "https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions")}</p>

<h3>Your task</h3>
<p>Implement <code>formatUser(name, age, role?)</code> that returns a string like <code>"Ada (30) — admin"</code>. Make <code>role</code> optional with default <code>"member"</code>. Run it with and without the role argument.</p>
`,
        initialCode: `// Implement formatUser(name, age, role?) -> string
// role defaults to "member"
function formatUser(name, age, role) {
  // TODO
  return "";
}

console.log(formatUser("Ada", 30, "admin"));   // "Ada (30) — admin"
console.log(formatUser("Bob", 25));            // "Bob (25) — member"

// Rest params practice
function total(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
console.log("total:", total(1, 2, 3, 4)); // 10`,
        solution: `function formatUser(name, age, role = "member") {
  return name + " (" + age + ") — " + role;
}

console.log(formatUser("Ada", 30, "admin"));   // "Ada (30) — admin"
console.log(formatUser("Bob", 25));            // "Bob (25) — member"

function total(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
console.log("total:", total(1, 2, 3, 4)); // 10

// TypeScript version (what you'd write):
// function formatUser(name: string, age: number, role: string = "member"): string { ... }
// function total(...nums: number[]): number { ... }`,
      },
      points_reward: 10,
    },
    {
      title: "4. Objects & Interfaces",
      content: {
        type: "console",
        instructions: `
<h2>Describing the shape of an object</h2>
<p>An <strong>interface</strong> names the shape of an object — which properties exist and their types:</p>
${codeBlock(`// TypeScript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = { id: 1, name: "Ada", email: "ada@example.com" };
user.id = 2;            // OK
user.age = 30;          // Error: Property 'age' does not exist on type 'User'`)}
<p>JS just has objects — no shape check, so typos slip through:</p>
${codeBlock(`// JavaScript
const user = { id: 1, name: "Ada", email: "ada@example.com" };
user.emial = "x";       // typo: silently creates a new property, no error`)}

<h3>Optional and readonly properties</h3>
${codeBlock(`// TypeScript
interface User {
  readonly id: number;     // cannot be reassigned after creation
  name: string;
  email?: string;          // optional — may be undefined
}

const u: User = { id: 1, name: "Ada" };  // email omitted — OK
u.id = 2;                // Error: Cannot assign to 'id' because it is a read-only property`)}

<h3>Excess property checks</h3>
<p>TS catches extra properties when you assign an object literal directly:</p>
${codeBlock(`// TypeScript
interface User { name: string; }
const u: User = { name: "Ada", age: 30 }; // Error: Object literal may only specify known properties`)}

<h3>Extending interfaces</h3>
${codeBlock(`// TypeScript
interface Person { name: string; age: number; }
interface Employee extends Person {
  role: string;
  salary: number;
}
const e: Employee = { name: "Ada", age: 30, role: "dev", salary: 90000 };`)}

<h3>interface vs type</h3>
<ul>
  <li><code>interface</code> — describes object shapes; can be extended/merged (preferred for objects)</li>
  <li><code>type</code> — alias for any type (unions, primitives, tuples); more flexible</li>
  <li>For object shapes, either works; teams pick one and stay consistent</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("Object Types", "https://www.typescriptlang.org/docs/handbook/2/objects.html")} · ${externalLink("Interfaces", "https://www.typescriptlang.org/docs/handbook/2/objects.html#interfaces")}</p>

<h3>Your task</h3>
<p>Define a <code>Product</code> interface (id, name, price, inStock optional) and create two products — one in stock, one out of stock. Log a summary string for each.</p>
`,
        initialCode: `// Define a Product shape and create two products
// Product: { id: number, name: string, price: number, inStock?: boolean }

const p1 = { id: 1, name: "Keyboard", price: 49.99, inStock: true };
const p2 = { id: 2, name: "Mouse", price: 19.99 }; // inStock omitted

function summary(p) {
  const stock = p.inStock ? "in stock" : "out of stock";
  return p.name + " — $" + p.price.toFixed(2) + " (" + stock + ")";
}

console.log(summary(p1));
console.log(summary(p2));`,
        solution: `const p1 = { id: 1, name: "Keyboard", price: 49.99, inStock: true };
const p2 = { id: 2, name: "Mouse", price: 19.99 };

function summary(p) {
  const stock = p.inStock ? "in stock" : "out of stock";
  return p.name + " — $" + p.price.toFixed(2) + " (" + stock + ")";
}

console.log(summary(p1)); // Keyboard — $49.99 (in stock)
console.log(summary(p2)); // Mouse — $19.99 (out of stock)

// TypeScript version:
// interface Product { id: number; name: string; price: number; inStock?: boolean; }
// function summary(p: Product): string { ... }`,
      },
      points_reward: 10,
    },
    {
      title: "5. Arrays & Tuples",
      content: {
        type: "console",
        instructions: `
<h2>Typed collections</h2>
<p>Annotate arrays with the element type followed by <code>[]</code>, or use <code>Array&lt;T&gt;</code>:</p>
${codeBlock(`// TypeScript
const nums: number[] = [1, 2, 3];
const names: Array<string> = ["Ada", "Bob"];
const mixed: (string | number)[] = ["a", 1, "b"];`)}

<h3>Inference on arrays</h3>
${codeBlock(`// TypeScript
const tags = ["js", "ts"];   // inferred: string[]
tags.push(42);               // Error: Argument of type 'number' is not assignable`)}

<h3>Tuples — fixed-length, typed positions</h3>
<p>A <strong>tuple</strong> is an array with a fixed number of elements where each position has a known type:</p>
${codeBlock(`// TypeScript
type Point = [number, number];
const p: Point = [10, 20];
p[0] = 30;          // OK
p.push(40);         // Error: Tuple type has no element at index 2 (with noUncheckedIndexedAccess)

// Real use: returning multiple values
function minMax(nums: number[]): [number, number] {
  return [Math.min(...nums), Math.max(...nums)];
}
const [lo, hi] = minMax([3, 1, 4, 1, 5]); // lo=1, hi=5`)}

<h3>Readonly arrays</h3>
${codeBlock(`// TypeScript
const frozen: readonly number[] = [1, 2, 3];
frozen.push(4);   // Error: Property 'push' does not exist on type 'readonly number[]'`)}

<h3>Array methods keep types</h3>
${codeBlock(`// TypeScript
const nums: number[] = [1, 2, 3, 4];
const doubled = nums.map((n) => n * 2);     // number[]
const evens   = nums.filter((n) => n % 2 === 0); // number[]
const found   = nums.find((n) => n > 2);    // number | undefined`)}

<h3>Learn more</h3>
<p>${externalLink("Everyday Types — Arrays", "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#arrays")} · ${externalLink("Tuple Types", "https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types")}</p>

<h3>Your task</h3>
<p>Given a list of scores, compute the min and max using a tuple return, then print <code>"min=.. max=.. avg=.."</code>. Treat the result of <code>find</code> carefully (it may be <code>undefined</code>).</p>
`,
        initialCode: `const scores = [88, 72, 95, 60, 83];

// Compute min, max, and average
function stats(nums) {
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return [min, max, avg];
}

const [min, max, avg] = stats(scores);
console.log("min=" + min + " max=" + max + " avg=" + avg.toFixed(1));

// find() may return undefined — handle it
const firstHigh = scores.find((s) => s > 90);
console.log("first > 90:", firstHigh);`,
        solution: `const scores = [88, 72, 95, 60, 83];

function stats(nums) {
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return [min, max, avg];
}

const [min, max, avg] = stats(scores);
console.log("min=" + min + " max=" + max + " avg=" + avg.toFixed(1));
// min=60 max=95 avg=79.6

const firstHigh = scores.find((s) => s > 90);
console.log("first > 90:", firstHigh); // 95

// TypeScript version:
// function stats(nums: number[]): [number, number, number] { ... }
// const firstHigh: number | undefined = scores.find((s) => s > 90);`,
      },
      points_reward: 10,
    },
  ],
};
