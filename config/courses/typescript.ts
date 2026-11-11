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
    {
      title: "6. Union & Narrowing",
      content: {
        type: "console",
        instructions: `
<h2>Values that can be more than one type</h2>
<p>A <strong>union type</strong> says "this value is one of these types" using <code>|</code>:</p>
${codeBlock(`// TypeScript
type Status = "loading" | "success" | "error";
let s: Status = "loading";
s = "done";   // Error: Type '"done"' is not assignable to type 'Status'`)}

<h3>Union of primitives</h3>
${codeBlock(`// TypeScript
function formatId(id: number | string): string {
  return "ID-" + id;
}
formatId(42);      // OK
formatId("abc");   // OK
formatId(true);    // Error`)}

<h3>Narrowing — proving what a value is</h3>
<p>With a union, you can't use type-specific methods until you <strong>narrow</strong> the type:</p>
${codeBlock(`// TypeScript
function printId(id: number | string) {
  // id.toUpperCase(); // Error: Property 'toUpperCase' does not exist on type 'number'
  if (typeof id === "string") {
    console.log(id.toUpperCase()); // OK — narrowed to string
  } else {
    console.log(id.toFixed(2));    // OK — narrowed to number
  }
}`)}

<h3>Narrowing tools</h3>
<ul>
  <li><code>typeof x === "string"</code> — primitives</li>
  <li><code>x instanceof Date</code> — classes</li>
  <li><code>"prop" in x</code> — object shapes</li>
  <li><code>x === null</code> / truthiness checks</li>
  <li>Discriminated unions (next) — the most powerful</li>
</ul>

<h3>Literal types & discriminated unions</h3>
${codeBlock(`// TypeScript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "rect":   return s.width * s.height;
  }
}`)}
<p>The <code>kind</code> field is the <strong>discriminant</strong> — TS narrows automatically inside each <code>case</code>.</p>

<h3>Learn more</h3>
<p>${externalLink("Narrowing", "https://www.typescriptlang.org/docs/handbook/2/narrowing.html")} · ${externalLink("Union Types", "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types")}</p>

<h3>Your task</h3>
<p>Write <code>describe(value: string | number | boolean)</code> that returns a string: strings uppercased, numbers formatted to 2 decimals, booleans as "yes"/"no". Use <code>typeof</code> narrowing.</p>
`,
        initialCode: `// describe(value) -> string
function describe(value) {
  // TODO: narrow with typeof
  return String(value);
}

console.log(describe("hello"));   // "HELLO"
console.log(describe(42));        // "42.00"
console.log(describe(true));      // "yes"

// Discriminated union practice
const events = [
  { type: "click", x: 10, y: 20 },
  { type: "keypress", key: "Enter" },
];

function handle(e) {
  if (e.type === "click") {
    return "clicked at " + e.x + "," + e.y;
  }
  return "pressed " + e.key;
}

events.forEach((e) => console.log(handle(e)));`,
        solution: `function describe(value) {
  if (typeof value === "string") return value.toUpperCase();
  if (typeof value === "number") return value.toFixed(2);
  return value ? "yes" : "no";
}

console.log(describe("hello"));   // "HELLO"
console.log(describe(42));        // "42.00"
console.log(describe(true));      // "yes"

function handle(e) {
  if (e.type === "click") {
    return "clicked at " + e.x + "," + e.y;
  }
  return "pressed " + e.key;
}

// TypeScript version:
// function describe(value: string | number | boolean): string { ... }
// type Event = { type: "click"; x: number; y: number } | { type: "keypress"; key: string };`,
      },
      points_reward: 10,
    },
    {
      title: "7. Type Aliases & Enums",
      content: {
        type: "console",
        instructions: `
<h2>Naming types and named constants</h2>
<p>A <strong>type alias</strong> gives a name to any type with the <code>type</code> keyword:</p>
${codeBlock(`// TypeScript
type ID = string | number;
type Point = { x: number; y: number };
type Callback = (err: Error | null, data: string) => void;`)}
<p>Aliases are just names — they don't create new types, just shortcuts.</p>

<h3>Enums — named sets of constants</h3>
${codeBlock(`// TypeScript
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right,   // 3
}
let d: Direction = Direction.Up;`)}
<p>Enums compile to a real JS object (reverse mapping included). String enums are safer and clearer:</p>
${codeBlock(`// TypeScript
enum Status {
  Pending = "PENDING",
  Active  = "ACTIVE",
  Done    = "DONE",
}
console.log(Status.Active); // "ACTIVE"`)}

<h3><code>const enum</code> — erased at compile time</h3>
${codeBlock(`// TypeScript
const enum Size { Small, Medium, Large }
const s = Size.Medium; // compiles to: const s = 1; (no object emitted)`)}

<h3><code>as const</code> — make values readonly & literal</h3>
${codeBlock(`// TypeScript
const config = { host: "localhost", port: 3000 } as const;
// config.port = 4000; // Error: Cannot assign to 'port' because it is a read-only property
// type of config.port is 3000 (literal), not number`)}

<h3>When to use which</h3>
<ul>
  <li><code>type</code> — unions, tuples, function types, primitives</li>
  <li><code>interface</code> — object shapes you'll extend</li>
  <li><code>enum</code> — named constant sets (prefer string enums)</li>
  <li><code>as const</code> — freeze a config object's literal types</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("Type Aliases", "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-aliases")} · ${externalLink("Enums", "https://www.typescriptlang.org/docs/handbook/enums.html")}</p>

<h3>Your task</h3>
<p>Define a <code>Role</code> enum (Admin, Editor, Viewer) and a <code>User</code> type alias combining name, role, and permissions array. Create two users and log their roles.</p>
`,
        initialCode: `// Role enum + User type
const Role = { Admin: "ADMIN", Editor: "EDITOR", Viewer: "VIEWER" };

const u1 = { name: "Ada", role: Role.Admin, permissions: ["read", "write", "delete"] };
const u2 = { name: "Bob", role: Role.Viewer, permissions: ["read"] };

function label(u) {
  return u.name + " (" + u.role + ") -> " + u.permissions.join(", ");
}
console.log(label(u1));
console.log(label(u2));

// as const practice
const ROUTES = { home: "/", about: "/about", contact: "/contact" };
console.log(ROUTES.home);`,
        solution: `const Role = { Admin: "ADMIN", Editor: "EDITOR", Viewer: "VIEWER" };

const u1 = { name: "Ada", role: Role.Admin, permissions: ["read", "write", "delete"] };
const u2 = { name: "Bob", role: Role.Viewer, permissions: ["read"] };

function label(u) {
  return u.name + " (" + u.role + ") -> " + u.permissions.join(", ");
}
console.log(label(u1)); // Ada (ADMIN) -> read, write, delete
console.log(label(u2)); // Bob (VIEWER) -> read

// TypeScript version:
// enum Role { Admin = "ADMIN", Editor = "EDITOR", Viewer = "VIEWER" }
// type User = { name: string; role: Role; permissions: string[] };
// const ROUTES = { home: "/", about: "/about", contact: "/contact" } as const;`,
      },
      points_reward: 10,
    },
    {
      title: "8. Generics",
      content: {
        type: "console",
        instructions: `
<h2>Code that works for many types</h2>
<p><strong>Generics</strong> let you write a function/type once and use it with any type, while keeping type safety:</p>
${codeBlock(`// TypeScript
function identity<T>(value: T): T {
  return value;
}
identity<number>(42);     // T = number
identity<string>("hi");   // T = string
identity(42);             // T inferred as number`)}

<h3>Generic arrays & utilities</h3>
${codeBlock(`// TypeScript
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
first([1, 2, 3]);        // number | undefined
first(["a", "b"]);       // string | undefined`)}

<h3>Constraints with <code>extends</code></h3>
${codeBlock(`// TypeScript
function getLength<T extends { length: number }>(x: T): number {
  return x.length;
}
getLength("hello");      // OK — string has length
getLength([1, 2, 3]);    // OK — array has length
getLength(42);           // Error — number has no length`)}

<h3>Multiple type parameters</h3>
${codeBlock(`// TypeScript
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
pair("age", 30); // [string, number]`)}

<h3>Generic interfaces</h3>
${codeBlock(`// TypeScript
interface Box<T> {
  value: T;
  map<U>(fn: (x: T) => U): Box<U>;
}
const b: Box<number> = { value: 5, map: (fn) => ({ value: fn(5), map: (g) => ({ value: g(5), map: (h) => ({ value: h(5), map }) }) }) };`)}

<h3>Default type parameters</h3>
${codeBlock(`// TypeScript
interface Container<T = string> { value: T; }
const c: Container = { value: "hi" };        // T defaults to string
const n: Container<number> = { value: 42 };  // T overridden`)}

<h3>Learn more</h3>
<p>${externalLink("Generics", "https://www.typescriptlang.org/docs/handbook/2/generics.html")}</p>

<h3>Your task</h3>
<p>Implement <code>wrapped(value)</code> that returns <code>{ value, get }</code> where <code>get</code> returns the value. Then implement <code>mapBox(box, fn)</code> that transforms the value. Run with a number and a string.</p>
`,
        initialCode: `// wrapped(value) -> { value, get() }
function wrapped(value) {
  return { value: value, get: () => value };
}

const n = wrapped(42);
console.log(n.get()); // 42

const s = wrapped("hello");
console.log(s.get().toUpperCase()); // HELLO

// mapBox: transform the value
function mapBox(box, fn) {
  return wrapped(fn(box.get()));
}
const doubled = mapBox(n, (x) => x * 2);
console.log(doubled.get()); // 84`,
        solution: `function wrapped(value) {
  return { value: value, get: () => value };
}

const n = wrapped(42);
console.log(n.get()); // 42

const s = wrapped("hello");
console.log(s.get().toUpperCase()); // HELLO

function mapBox(box, fn) {
  return wrapped(fn(box.get()));
}
const doubled = mapBox(n, (x) => x * 2);
console.log(doubled.get()); // 84

// TypeScript version:
// function wrapped<T>(value: T): { value: T; get: () => T } { ... }
// function mapBox<T, U>(box: { get: () => T }, fn: (x: T) => U): { value: U; get: () => U } { ... }`,
      },
      points_reward: 10,
    },
    {
      title: "9. Utility Types",
      content: {
        type: "console",
        instructions: `
<h2>Built-in type transformations</h2>
<p>TypeScript ships <strong>utility types</strong> that transform existing types. They're the bread and butter of real TS code:</p>

<h3><code>Partial&lt;T&gt;</code> — all properties optional</h3>
${codeBlock(`// TypeScript
interface User { id: number; name: string; email: string; }
type UserPatch = Partial<User>;
// { id?: number; name?: string; email?: string; }`)}

<h3><code>Required&lt;T&gt;</code> — all properties required</h3>
${codeBlock(`// TypeScript
type Strict = Required<{ name?: string; age?: number }>;
// { name: string; age: number; }`)}

<h3><code>Pick&lt;T, K&gt;</code> and <code>Omit&lt;T, K&gt;</code></h3>
${codeBlock(`// TypeScript
type UserPreview = Pick<User, "id" | "name">;   // { id: number; name: string; }
type UserNoEmail = Omit<User, "email">;          // { id: number; name: string; }`)}

<h3><code>Record&lt;K, V&gt;</code> — dictionary type</h3>
${codeBlock(`// TypeScript
type Scores = Record<string, number>;
const scores: Scores = { math: 90, english: 85 };`)}

<h3><code>Readonly&lt;T&gt;</code> — all properties readonly</h3>
${codeBlock(`// TypeScript
const frozen: Readonly<User> = { id: 1, name: "Ada", email: "a@b.com" };
frozen.name = "X"; // Error`)}

<h3><code>ReturnType&lt;T&gt;</code> and <code>Parameters&lt;T&gt;</code></h3>
${codeBlock(`// TypeScript
function fetchUser(id: number): Promise<User> { /* ... */ }
type R = ReturnType<typeof fetchUser>;   // Promise<User>
type P = Parameters<typeof fetchUser>;   // [number]`)}

<h3>Learn more</h3>
<p>${externalLink("Utility Types (reference)", "https://www.typescriptlang.org/docs/handbook/utility-types.html")}</p>

<h3>Your task</h3>
<p>Given a <code>User</code> type, build <code>UserPatch</code> (partial), <code>UserSummary</code> (pick id+name), and a <code>scores</code> record. Run the JS version and log the patched + summary objects.</p>
`,
        initialCode: `// User shape
const user = { id: 1, name: "Ada", email: "ada@example.com" };

// UserPatch: partial update (any subset of fields)
const patch = { name: "Ada Lovelace" };

// Apply patch
const updated = { ...user, ...patch };
console.log("updated:", JSON.stringify(updated));

// UserSummary: pick id + name only
const summary = { id: updated.id, name: updated.name };
console.log("summary:", JSON.stringify(summary));

// Record<string, number> scores
const scores = { math: 90, english: 85, science: 92 };
const total = Object.values(scores).reduce((a, b) => a + b, 0);
console.log("total score:", total);`,
        solution: `const user = { id: 1, name: "Ada", email: "ada@example.com" };
const patch = { name: "Ada Lovelace" };
const updated = { ...user, ...patch };
console.log("updated:", JSON.stringify(updated));
const summary = { id: updated.id, name: updated.name };
console.log("summary:", JSON.stringify(summary));
const scores = { math: 90, english: 85, science: 92 };
const total = Object.values(scores).reduce((a, b) => a + b, 0);
console.log("total score:", total); // 267

// TypeScript version:
// interface User { id: number; name: string; email: string; }
// type UserPatch = Partial<User>;
// type UserSummary = Pick<User, "id" | "name">;
// type Scores = Record<string, number>;`,
      },
      points_reward: 10,
    },
    {
      title: "10. Classes",
      content: {
        type: "console",
        instructions: `
<h2>Typed classes</h2>
<p>Classes in TS get typed properties, constructor params, and access modifiers:</p>
${codeBlock(`// TypeScript
class User {
  id: number;
  name: string;
  private secret: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
    this.secret = "shh";
  }

  greet(): string {
    return "Hi, " + this.name;
  }
}`)}

<h3>Parameter properties (shorthand)</h3>
${codeBlock(`// TypeScript — auto-assigns constructor params to fields
class User {
  constructor(public id: number, public name: string, private secret = "shh") {}
  greet(): string { return "Hi, " + this.name; }
}`)}

<h3>Access modifiers</h3>
<ul>
  <li><code>public</code> — default, accessible anywhere</li>
  <li><code>private</code> — only inside the class</li>
  <li><code>protected</code> — inside the class and subclasses</li>
  <li><code>readonly</code> — set once (in constructor), never reassigned</li>
</ul>

<h3><code>implements</code> — satisfy an interface</h3>
${codeBlock(`// TypeScript
interface Printable { print(): string; }
class Invoice implements Printable {
  constructor(public amount: number) {}
  print(): string { return "Invoice: $" + this.amount; }
}`)}

<h3>Abstract classes</h3>
${codeBlock(`// TypeScript
abstract class Animal {
  abstract speak(): string;
  move(): string { return "moving"; }
}
class Dog extends Animal {
  speak(): string { return "woof"; }
}`)}

<h3>Learn more</h3>
<p>${externalLink("Classes", "https://www.typescriptlang.org/docs/handbook/2/classes.html")}</p>

<h3>Your task</h3>
<p>Build a <code>BankAccount</code> class with a private balance, <code>deposit</code>, <code>withdraw</code> (fails if insufficient), and <code>balance()</code> getter. Create an account, deposit 100, withdraw 30, and log the balance.</p>
`,
        initialCode: `class BankAccount {
  constructor(owner, initial = 0) {
    this.owner = owner;
    this._balance = initial;
  }
  deposit(amount) {
    this._balance += amount;
  }
  withdraw(amount) {
    if (amount > this._balance) {
      console.log("Insufficient funds");
      return false;
    }
    this._balance -= amount;
    return true;
  }
  balance() {
    return this._balance;
  }
}

const acc = new BankAccount("Ada", 0);
acc.deposit(100);
acc.withdraw(30);
console.log(acc.owner + " balance:", acc.balance()); // Ada balance: 70
console.log("withdraw 100:", acc.withdraw(100));     // Insufficient funds -> false`,
        solution: `class BankAccount {
  constructor(owner, initial = 0) {
    this.owner = owner;
    this._balance = initial;
  }
  deposit(amount) {
    this._balance += amount;
  }
  withdraw(amount) {
    if (amount > this._balance) {
      console.log("Insufficient funds");
      return false;
    }
    this._balance -= amount;
    return true;
  }
  balance() {
    return this._balance;
  }
}

const acc = new BankAccount("Ada", 0);
acc.deposit(100);
acc.withdraw(30);
console.log(acc.owner + " balance:", acc.balance()); // Ada balance: 70
console.log("withdraw 100:", acc.withdraw(100));     // Insufficient funds -> false

// TypeScript version:
// class BankAccount {
//   private _balance: number;
//   constructor(public owner: string, initial: number = 0) { this._balance = initial; }
//   deposit(amount: number): void { this._balance += amount; }
//   withdraw(amount: number): boolean { ... }
//   balance(): number { return this._balance; }
// }`,
      },
      points_reward: 10,
    },
    {
      title: "11. Project — Typed User Profile",
      content: {
        type: "console",
        instructions: `
<h2>Put it together: a typed user profile</h2>
<p>Build a <code>User</code> profile module using everything so far: interfaces, optional/readonly props, unions, and functions. The code below is JavaScript (compiled output); the TypeScript version is in the solution.</p>

<h3>Requirements</h3>
<ul>
  <li><code>User</code> interface: <code>id</code> (readonly number), <code>name</code>, <code>email</code>, <code>role</code> ("admin" | "member"), <code>bio?</code> (optional string)</li>
  <li><code>createUser(input)</code> — validates required fields, returns a <code>User</code></li>
  <li><code>updateUser(user, patch)</code> — applies a <code>Partial&lt;User&gt;</code> patch, returns a new user (immutable)</li>
  <li><code>describe(user)</code> — returns a one-line summary string</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("TypeScript Playground", "https://www.typescriptlang.org/play")} · ${externalLink("Object Types", "https://www.typescriptlang.org/docs/handbook/2/objects.html")}</p>

<h3>Your task</h3>
<p>Run the starter, then extend it: add a <code>formatRole</code> helper and a second user, and log both summaries. Try breaking it (e.g., pass a number for <code>name</code>) to see what TS would catch.</p>
`,
        initialCode: `// User profile module (JavaScript — compiled output of TypeScript)

function createUser(input) {
  if (!input.name || !input.email) throw new Error("name and email required");
  return {
    id: input.id ?? Math.floor(Math.random() * 10000),
    name: input.name,
    email: input.email,
    role: input.role ?? "member",
    bio: input.bio,
  };
}

function updateUser(user, patch) {
  return { ...user, ...patch };
}

function describe(user) {
  const bio = user.bio ? " — " + user.bio : "";
  return user.name + " (" + user.role + ")" + bio;
}

const u1 = createUser({ name: "Ada", email: "ada@example.com", role: "admin", bio: "Engineer" });
const u2 = createUser({ name: "Bob", email: "bob@example.com" });

console.log(describe(u1));
console.log(describe(u2));

const u1b = updateUser(u1, { bio: "Senior Engineer" });
console.log(describe(u1b));
console.log("original unchanged:", u1.bio);`,
        solution: `function createUser(input) {
  if (!input.name || !input.email) throw new Error("name and email required");
  return {
    id: input.id ?? Math.floor(Math.random() * 10000),
    name: input.name,
    email: input.email,
    role: input.role ?? "member",
    bio: input.bio,
  };
}

function updateUser(user, patch) {
  return { ...user, ...patch };
}

function describe(user) {
  const bio = user.bio ? " — " + user.bio : "";
  return user.name + " (" + user.role + ")" + bio;
}

const u1 = createUser({ name: "Ada", email: "ada@example.com", role: "admin", bio: "Engineer" });
const u2 = createUser({ name: "Bob", email: "bob@example.com" });

console.log(describe(u1));   // Ada (admin) — Engineer
console.log(describe(u2));   // Bob (member)

const u1b = updateUser(u1, { bio: "Senior Engineer" });
console.log(describe(u1b));  // Ada (admin) — Senior Engineer
console.log("original unchanged:", u1.bio); // Engineer (immutable)

// TypeScript version:
// interface User { readonly id: number; name: string; email: string; role: "admin" | "member"; bio?: string; }
// function createUser(input: { name: string; email: string; role?: "admin" | "member"; bio?: string; id?: number }): User { ... }
// function updateUser(user: User, patch: Partial<User>): User { ... }
// function describe(user: User): string { ... }`,
      },
      points_reward: 15,
    },
    {
      title: "12. Project — Generic Data Fetcher",
      content: {
        type: "console",
        instructions: `
<h2>Generic async data fetcher</h2>
<p>Build a reusable <code>fetchData&lt;T&gt;</code> wrapper that handles loading/error/data states. This is the pattern behind React Query / SWR, typed end to end.</p>

<h3>Requirements</h3>
<ul>
  <li><code>fetchData(url, parse)</code> returns <code>Promise&lt;{ data, error }&gt;</code></li>
  <li><code>parse</code> is a function turning raw JSON into a typed <code>T</code></li>
  <li>On failure, return <code>{ data: null, error: string }</code></li>
  <li>Support a <code>Result&lt;T&gt;</code> discriminated union for callers</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("Generics", "https://www.typescriptlang.org/docs/handbook/2/generics.html")} · ${externalLink("TypeScript Playground", "https://www.typescriptlang.org/play")}</p>

<h3>Your task</h3>
<p>Run the starter. Then add a <code>fetchUser(id)</code> and <code>fetchPosts()</code> built on top of <code>fetchData</code>, each with its own parse function, and log the results.</p>
`,
        initialCode: `// Generic data fetcher (JavaScript — compiled output)

async function fetchData(url, parse) {
  try {
    // Simulated network: resolve with mock data based on url
    const raw = await mockFetch(url);
    const data = parse(raw);
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message || "Unknown error" };
  }
}

async function mockFetch(url) {
  if (url === "/api/user/1") return { id: 1, name: "Ada", email: "ada@example.com" };
  if (url === "/api/posts") return [{ id: 1, title: "Hello" }, { id: 2, title: "World" }];
  throw new Error("404 Not Found: " + url);
}

// Parse functions
function parseUser(raw) {
  if (!raw || typeof raw.id !== "number") throw new Error("bad user");
  return { id: raw.id, name: raw.name, email: raw.email };
}
function parsePosts(raw) {
  if (!Array.isArray(raw)) throw new Error("expected array");
  return raw.map((p) => ({ id: p.id, title: p.title }));
}

(async () => {
  const r1 = await fetchData("/api/user/1", parseUser);
  console.log("user:", JSON.stringify(r1));

  const r2 = await fetchData("/api/posts", parsePosts);
  console.log("posts:", JSON.stringify(r2));

  const r3 = await fetchData("/api/missing", parseUser);
  console.log("missing:", JSON.stringify(r3));
})();`,
        solution: `async function fetchData(url, parse) {
  try {
    const raw = await mockFetch(url);
    const data = parse(raw);
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message || "Unknown error" };
  }
}

async function mockFetch(url) {
  if (url === "/api/user/1") return { id: 1, name: "Ada", email: "ada@example.com" };
  if (url === "/api/posts") return [{ id: 1, title: "Hello" }, { id: 2, title: "World" }];
  throw new Error("404 Not Found: " + url);
}

function parseUser(raw) {
  if (!raw || typeof raw.id !== "number") throw new Error("bad user");
  return { id: raw.id, name: raw.name, email: raw.email };
}
function parsePosts(raw) {
  if (!Array.isArray(raw)) throw new Error("expected array");
  return raw.map((p) => ({ id: p.id, title: p.title }));
}

(async () => {
  const r1 = await fetchData("/api/user/1", parseUser);
  console.log("user:", JSON.stringify(r1));
  const r2 = await fetchData("/api/posts", parsePosts);
  console.log("posts:", JSON.stringify(r2));
  const r3 = await fetchData("/api/missing", parseUser);
  console.log("missing:", JSON.stringify(r3));
})();

// TypeScript version:
// type Result<T> = { data: T; error: null } | { data: null; error: string };
// async function fetchData<T>(url: string, parse: (raw: unknown) => T): Promise<Result<T>> { ... }`,
      },
      points_reward: 15,
    },
    {
      title: "13. Project — Form Validator",
      content: {
        type: "console",
        instructions: `
<h2>Discriminated-union form validation</h2>
<p>Build a typed form validator that returns either a success with parsed data or a failure with field errors. This is the shape used by Zod/React Hook Form under the hood.</p>

<h3>Requirements</h3>
<ul>
  <li><code>validate(input)</code> returns <code>{ ok: true, data } | { ok: false, errors }</code></li>
  <li>Validate: name (required, min 2 chars), email (required, contains @), age (number, 0-120)</li>
  <li><code>errors</code> is a record of field -> message</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("Narrowing", "https://www.typescriptlang.org/docs/handbook/2/narrowing.html")} · ${externalLink("TypeScript Playground", "https://www.typescriptlang.org/play")}</p>

<h3>Your task</h3>
<p>Run the starter. Test it with a valid input and an invalid one. Add a new field (e.g., <code>website</code> URL) with its own rule.</p>
`,
        initialCode: `// Form validator (JavaScript — compiled output)

function validate(input) {
  const errors = {};
  if (!input.name || input.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }
  if (!input.email || !input.email.includes("@")) {
    errors.email = "Valid email required";
  }
  const age = Number(input.age);
  if (isNaN(age) || age < 0 || age > 120) {
    errors.age = "Age must be a number between 0 and 120";
  }
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, data: { name: input.name.trim(), email: input.email, age } };
}

const good = validate({ name: "Ada", email: "ada@example.com", age: 30 });
console.log("good:", JSON.stringify(good));

const bad = validate({ name: "A", email: "nope", age: 200 });
console.log("bad:", JSON.stringify(bad));

// Caller narrows on ok
function submit(input) {
  const r = validate(input);
  if (r.ok) {
    console.log("Submitting:", r.data.name, r.data.age);
  } else {
    console.log("Fix errors:", Object.keys(r.errors).join(", "));
  }
}
submit({ name: "Bob", email: "bob@example.com", age: 25 });
submit({ name: "", email: "", age: -1 });`,
        solution: `function validate(input) {
  const errors = {};
  if (!input.name || input.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }
  if (!input.email || !input.email.includes("@")) {
    errors.email = "Valid email required";
  }
  const age = Number(input.age);
  if (isNaN(age) || age < 0 || age > 120) {
    errors.age = "Age must be a number between 0 and 120";
  }
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, data: { name: input.name.trim(), email: input.email, age } };
}

const good = validate({ name: "Ada", email: "ada@example.com", age: 30 });
console.log("good:", JSON.stringify(good));
const bad = validate({ name: "A", email: "nope", age: 200 });
console.log("bad:", JSON.stringify(bad));

function submit(input) {
  const r = validate(input);
  if (r.ok) {
    console.log("Submitting:", r.data.name, r.data.age);
  } else {
    console.log("Fix errors:", Object.keys(r.errors).join(", "));
  }
}
submit({ name: "Bob", email: "bob@example.com", age: 25 });
submit({ name: "", email: "", age: -1 });

// TypeScript version:
// type ValidationResult =
//   | { ok: true; data: { name: string; email: string; age: number } }
//   | { ok: false; errors: Record<string, string> };
// function validate(input: unknown): ValidationResult { ... }`,
      },
      points_reward: 15,
    },
    {
      title: "14. Final Project — Typed Mini Store",
      content: {
        type: "console",
        instructions: `
<h2>Final project: a typed mini store</h2>
<p>Combine everything — interfaces, generics, classes, utility types, discriminated unions — into a small typed store (products + cart). This is the capstone of the course.</p>

<h3>Requirements</h3>
<ul>
  <li><code>Product</code> interface: id, name, price, stock</li>
  <li><code>Cart</code> class: add, remove, total, items (readonly)</li>
  <li><code>applyDiscount(cart, percent)</code> generic-ish helper returning a new cart total</li>
  <li>Discriminated union for cart events: <code>add</code> | <code>remove</code> | <code>checkout</code></li>
  <li><code>handleEvent(event)</code> that narrows and acts</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("TypeScript Playground", "https://www.typescriptlang.org/play")} · ${externalLink("Classes", "https://www.typescriptlang.org/docs/handbook/2/classes.html")}</p>

<h3>Your task</h3>
<p>Run the starter. Add a <code>quantity</code> field to cart items, and a <code>checkout()</code> method that returns a receipt string and clears the cart.</p>
`,
        initialCode: `// Typed mini store (JavaScript — compiled output)

class Cart {
  constructor() {
    this._items = [];
  }
  add(product, qty = 1) {
    const existing = this._items.find((i) => i.product.id === product.id);
    if (existing) existing.qty += qty;
    else this._items.push({ product, qty });
  }
  remove(productId) {
    this._items = this._items.filter((i) => i.product.id !== productId);
  }
  total() {
    return this._items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  }
  items() {
    return this._items.slice();
  }
}

const p1 = { id: 1, name: "Keyboard", price: 49.99, stock: 10 };
const p2 = { id: 2, name: "Mouse", price: 19.99, stock: 5 };

const cart = new Cart();
cart.add(p1, 1);
cart.add(p2, 2);
cart.add(p1, 1); // increments qty

console.log("items:", JSON.stringify(cart.items()));
console.log("total:", cart.total().toFixed(2));

cart.remove(2);
console.log("after remove:", JSON.stringify(cart.items()));
console.log("total:", cart.total().toFixed(2));

// Event handling (discriminated union)
function handleEvent(cart, event) {
  if (event.type === "add") {
    cart.add(event.product, event.qty);
    console.log("added", event.product.name);
  } else if (event.type === "remove") {
    cart.remove(event.productId);
    console.log("removed", event.productId);
  } else if (event.type === "checkout") {
    const t = cart.total();
    console.log("checkout total:", t.toFixed(2));
  }
}

handleEvent(cart, { type: "add", product: p2, qty: 1 });
handleEvent(cart, { type: "checkout" });`,
        solution: `class Cart {
  constructor() {
    this._items = [];
  }
  add(product, qty = 1) {
    const existing = this._items.find((i) => i.product.id === product.id);
    if (existing) existing.qty += qty;
    else this._items.push({ product, qty });
  }
  remove(productId) {
    this._items = this._items.filter((i) => i.product.id !== productId);
  }
  total() {
    return this._items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  }
  items() {
    return this._items.slice();
  }
  checkout() {
    const t = this.total();
    this._items = [];
    return "Receipt: $" + t.toFixed(2) + " — thank you!";
  }
}

const p1 = { id: 1, name: "Keyboard", price: 49.99, stock: 10 };
const p2 = { id: 2, name: "Mouse", price: 19.99, stock: 5 };

const cart = new Cart();
cart.add(p1, 1);
cart.add(p2, 2);
cart.add(p1, 1);

console.log("items:", JSON.stringify(cart.items()));
console.log("total:", cart.total().toFixed(2));

cart.remove(2);
console.log("after remove:", JSON.stringify(cart.items()));
console.log("total:", cart.total().toFixed(2));

function handleEvent(cart, event) {
  if (event.type === "add") {
    cart.add(event.product, event.qty);
    console.log("added", event.product.name);
  } else if (event.type === "remove") {
    cart.remove(event.productId);
    console.log("removed", event.productId);
  } else if (event.type === "checkout") {
    console.log(cart.checkout());
  }
}

handleEvent(cart, { type: "add", product: p2, qty: 1 });
handleEvent(cart, { type: "checkout" });

// TypeScript version would type Product, CartItem, Cart, and a discriminated
// union CartEvent = {type:"add";product:Product;qty:number} | {type:"remove";productId:number} | {type:"checkout"};`,
      },
      points_reward: 25,
    },
  ],
};
