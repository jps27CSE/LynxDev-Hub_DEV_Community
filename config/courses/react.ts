import type { CourseData } from "./types";
import { codeBlock, externalLink, BOX_STYLE } from "./format";

export const reactCourse: CourseData = {
  title: "React — Build Interactive UIs",
  description:
    "The library behind this platform — 10 hands-on lessons plus 3 projects (todo app, weather widget, mini dashboard). Components, props, state, effects, and context. Requires JavaScript & TypeScript basics.",
  icon: "",
  difficulty: "Intermediate",
  category: "Frontend",
  order_index: 7,
  chapters: [
    {
      title: "1. What Is React?",
      content: {
        type: "browser",
        instructions: `
<h2>A library for building UIs</h2>
<p><strong>React</strong> is a JavaScript library for building user interfaces out of <strong>components</strong> — reusable, self-contained pieces of UI. It was created by Meta and powers this very platform.</p>

<h3>Why React?</h3>
<ul>
  <li><strong>Declarative</strong> — describe what the UI should look like for a given state; React figures out how to update the DOM</li>
  <li><strong>Component-based</strong> — build complex UIs from small, reusable pieces</li>
  <li><strong>Unidirectional data flow</strong> — data flows down via props, events flow up via callbacks</li>
  <li><strong>Huge ecosystem</strong> — Next.js, React Router, React Query, shadcn/ui all build on React</li>
</ul>

<h3>JSX — HTML in JavaScript</h3>
<p>React uses <strong>JSX</strong>, a syntax extension that looks like HTML but is JavaScript:</p>
${codeBlock(`// JSX (what you write)
function Hello() {
  const name = "Ada";
  return <h1>Hello, {name}!</h1>;
}

// Compiles to (what runs)
function Hello() {
  const name = "Ada";
  return React.createElement("h1", null, "Hello, ", name, "!");
}`)}

<h3>Virtual DOM</h3>
<p>React keeps a lightweight copy of the DOM in memory (the Virtual DOM). When state changes, it diffs the new tree against the old and updates only the changed parts in the real DOM — fast and efficient.</p>

<h3>React in this course</h3>
<p>This course shows React code in code blocks (read-only). To run it, create a Vite + React project locally: <code>npm create vite@latest my-app -- --template react-ts</code>. The concepts transfer directly to this platform's codebase.</p>

<h3>Learn more</h3>
<p>${externalLink("React Docs — Quick Start", "https://react.dev/learn")} · ${externalLink("React Docs — Thinking in React", "https://react.dev/learn/thinking-in-react")} · ${externalLink("Vite + React", "https://vitejs.dev/guide/")}</p>

<h3>Your task</h3>
<p>Install Node.js, then run <code>npm create vite@latest my-react-app -- --template react-ts</code>, <code>cd my-react-app && npm install && npm run dev</code>. Open the browser and confirm the starter page renders. Explore <code>src/App.tsx</code>.</p>
`,
        initialCode: `// React — Chapter 1 scratchpad (JSX shown for reference)
// Run this in a real Vite + React project, not here.

// Your first component:
function Hello() {
  const name = "Ada";
  return <h1>Hello, {name}!</h1>;
}

export default Hello;

// Setup command:
// npm create vite@latest my-react-app -- --template react-ts
// cd my-react-app && npm install && npm run dev`,
        solution: `// Expected: Vite dev server runs on http://localhost:5173
// src/App.tsx renders the starter page
// You'll replace App's content with your own components`,
      },
      points_reward: 10,
    },
    {
      title: "2. JSX & Rendering",
      content: {
        type: "browser",
        instructions: `
<h2>JSX rules and expressions</h2>
<p>JSX looks like HTML but has rules. Elements must be closed, attributes use camelCase, and JavaScript expressions go inside <code>{}</code>.</p>

${codeBlock(`// JSX
function Greeting() {
  const name = "Ada";
  const loggedIn = true;
  return (
    <div className="card">
      <h1>Hello, {name.toUpperCase()}!</h1>
      <p>{loggedIn ? "Welcome back" : "Please sign in"}</p>
      <img src="/avatar.png" alt="avatar" />
    </div>
  );
}`)}

<h3>JSX rules</h3>
<ul>
  <li>Must return a single root element (or use a Fragment <code>&lt;&gt;...&lt;/&gt;</code>)</li>
  <li>Attributes: <code>className</code> not <code>class</code>, <code>htmlFor</code> not <code>for</code></li>
  <li>Self-close empty tags: <code>&lt;img /&gt;</code>, <code>&lt;br /&gt;</code></li>
  <li>JavaScript expressions inside <code>{}</code> — any expression, not statements</li>
  <li>Comments: <code>{/* like this */}</code></li>
</ul>

<h3>Rendering lists</h3>
${codeBlock(`function List() {
  const items = ["React", "TypeScript", "Vite"];
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}`)}
<p>Always provide a <code>key</code> prop for list items — React uses it to track which items changed.</p>

<h3>Learn more</h3>
<p>${externalLink("React Docs — Writing Markup with JSX", "https://react.dev/learn/writing-markup-with-jsx")} · ${externalLink("React Docs — JavaScript in JSX", "https://react.dev/learn/javascript-in-jsx-with-curly-braces")}</p>

<h3>Your task</h3>
<p>In your Vite project, create a <code>Greeting</code> component that shows a name (from a variable), a conditional "Welcome back"/"Sign in" message, and a list of 3 skills. Use a Fragment to avoid an extra wrapper div.</p>
`,
        initialCode: `// JSX practice (run in your Vite project)

function Greeting() {
  const name = "Ada";
  const loggedIn = true;
  const skills = ["React", "TypeScript", "CSS"];

  return (
    <>
      <h1>Hello, {name.toUpperCase()}!</h1>
      <p>{loggedIn ? "Welcome back" : "Please sign in"}</p>
      <ul>
        {skills.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </>
  );
}

export default Greeting;`,
        solution: `// Expected: renders greeting, welcome message, and a 3-item list
// No wrapper div (Fragment used)`,
      },
      points_reward: 10,
    },
    {
      title: "3. Components & Props",
      content: {
        type: "browser",
        instructions: `
<h2>Reusable building blocks</h2>
<p>A <strong>component</strong> is a function that returns JSX. <strong>Props</strong> are the inputs — like function arguments.</p>

${codeBlock(`// Component with props
function Button({ label, onClick, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// Usage
<Button label="Save" onClick={handleSave} />
<Button label="Cancel" onClick={handleCancel} disabled />`)}

<h3>Props are read-only</h3>
<p>A component must never modify its own props. Data flows down from parent to child; to change data, the parent passes new props.</p>

<h3>Composition</h3>
${codeBlock(`function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </div>
  );
}

// children = anything between the tags
<Card title="Profile">
  <p>Name: Ada</p>
  <p>Role: Engineer</p>
</Card>`)}

<h3>Extracting components</h3>
<p>When a piece of UI repeats or gets complex, extract it into its own component. Rule of thumb: if you can name it, extract it.</p>

<h3>Learn more</h3>
<p>${externalLink("React Docs — Your First Component", "https://react.dev/learn/your-first-component")} · ${externalLink("React Docs — Passing Props", "https://react.dev/learn/passing-props-to-a-component")}</p>

<h3>Your task</h3>
<p>Create a <code>ProfileCard</code> component that takes <code>name</code>, <code>role</code>, and <code>avatarUrl</code> props and renders a card. Use it three times with different data. Add a <code>children</code> slot for extra content.</p>
`,
        initialCode: `// Components & Props (run in your Vite project)

function ProfileCard({ name, role, avatarUrl, children }) {
  return (
    <div className="card">
      <img src={avatarUrl} alt={name} width={64} height={64} />
      <h2>{name}</h2>
      <p>{role}</p>
      {children}
    </div>
  );
}

function App() {
  return (
    <div>
      <ProfileCard name="Ada" role="Engineer" avatarUrl="https://i.pravatar.cc/64?img=1">
        <button>Follow</button>
      </ProfileCard>
      <ProfileCard name="Bob" role="Designer" avatarUrl="https://i.pravatar.cc/64?img=2" />
    </div>
  );
}

export default App;`,
        solution: `// Expected: two profile cards render, first has a Follow button`,
      },
      points_reward: 10,
    },
    {
      title: "4. State with useState",
      content: {
        type: "browser",
        instructions: `
<h2>Memory in components</h2>
<p><strong>State</strong> is data that changes over time and triggers re-renders. The <code>useState</code> hook adds state to a function component.</p>

${codeBlock(`import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}`)}

<h3>How useState works</h3>
<ul>
  <li><code>useState(initialValue)</code> returns <code>[currentValue, setter]</code></li>
  <li>Calling the setter schedules a re-render with the new value</li>
  <li>State is preserved across re-renders (per component instance)</li>
  <li>Never mutate state directly — always use the setter</li>
</ul>

<h3>Functional updates</h3>
${codeBlock(`// When new state depends on old state, use the functional form
setCount((prev) => prev + 1);   // safe even with batching
setCount(count + 1);            // can be stale in async code`)}

<h3>Multiple state variables</h3>
${codeBlock(`const [name, setName] = useState("");
const [age, setAge] = useState(0);
// or one object:
const [user, setUser] = useState({ name: "", age: 0 });
setUser((prev) => ({ ...prev, name: "Ada" })); // spread to update one field`)}

<h3>Learn more</h3>
<p>${externalLink("React Docs — State: A Component's Memory", "https://react.dev/learn/state-a-components-memory")} · ${externalLink("React Docs — useState", "https://react.dev/reference/react/useState")}</p>

<h3>Your task</h3>
<p>Build a <code>Counter</code> with increment, decrement, and reset buttons. Then add a <code>name</code> input (controlled) that updates a greeting above. Use functional updates for the counter.</p>
`,
        initialCode: `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      <button onClick={() => setCount((c) => c - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>

      <hr />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
      />
      <p>Hello, {name || "stranger"}!</p>
    </div>
  );
}

export default Counter;`,
        solution: `// Expected: counter updates on button clicks; greeting updates as you type`,
      },
      points_reward: 10,
    },
    {
      title: "5. Effects with useEffect",
      content: {
        type: "browser",
        instructions: `
<h2>Side effects and lifecycle</h2>
<p><strong>useEffect</strong> runs code after render — for data fetching, subscriptions, timers, or DOM manipulation. It's the escape hatch from React's pure rendering.</p>

${codeBlock(`import { useState, useEffect } from "react";

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id); // cleanup
  }, []); // empty deps = run once on mount

  return <p>Elapsed: {seconds}s</p>;
}`)}

<h3>Dependency array</h3>
<ul>
  <li><code>[]</code> — run once on mount, cleanup on unmount</li>
  <li><code>[a, b]</code> — run when <code>a</code> or <code>b</code> changes</li>
  <li>no array — run after every render (rare; usually a bug)</li>
</ul>

<h3>Cleanup</h3>
<p>The function returned from useEffect runs before the next effect and on unmount. Use it to clear timers, cancel requests, remove listeners.</p>

<h3>Data fetching pattern</h3>
${codeBlock(`useEffect(() => {
  let cancelled = false;
  fetch("/api/user")
    .then((r) => r.json())
    .then((data) => { if (!cancelled) setUser(data); });
  return () => { cancelled = true; };
}, []);`)}

<h3>Learn more</h3>
<p>${externalLink("React Docs — Synchronizing with Effects", "https://react.dev/learn/synchronizing-with-effects")} · ${externalLink("React Docs — useEffect", "https://react.dev/reference/react/useEffect")}</p>

<h3>Your task</h3>
<p>Build a component that fetches a random joke from <code>https://official-joke-api.appspot.com/random_joke</code> on mount and shows a "Get another" button that refetches. Handle loading and error states.</p>
`,
        initialCode: `import { useState, useEffect } from "react";

function Joke() {
  const [joke, setJoke] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchJoke = () => {
    setLoading(true);
    fetch("https://official-joke-api.appspot.com/random_joke")
      .then((r) => r.json())
      .then((data) => { setJoke(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchJoke(); }, []);

  if (loading) return <p>Loading...</p>;
  if (!joke) return <p>Failed to load.</p>;
  return (
    <div>
      <p>{joke.setup}</p>
      <p><strong>{joke.punchline}</strong></p>
      <button onClick={fetchJoke}>Get another</button>
    </div>
  );
}

export default Joke;`,
        solution: `// Expected: shows a joke on load; button fetches a new one`,
      },
      points_reward: 10,
    },
    {
      title: "6. Conditional Rendering & Lists",
      content: {
        type: "browser",
        instructions: `
<h2>Show/hide and render collections</h2>
<p>React renders based on conditions using <code>&&</code>, ternaries, or early returns.</p>

${codeBlock(`function Status({ isOnline }) {
  // Early return
  if (isOnline === null) return <p>Checking...</p>;

  return (
    <div>
      {/* && for show/hide */}
      {isOnline && <span className="dot green" />}

      {/* ternary for either/or */}
      <p>{isOnline ? "Online" : "Offline"}</p>
    </div>
  );
}`)}

<h3>Rendering lists with keys</h3>
${codeBlock(`function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          {todo.done ? <s>{todo.text}</s> : todo.text}
        </li>
      ))}
    </ul>
  );
}`)}

<h3>Key rules</h3>
<ul>
  <li>Keys must be unique among siblings</li>
  <li>Use stable IDs, not array index, when items can reorder</li>
  <li>Keys are hints to React, not passed to components</li>
</ul>

<h3>Empty states</h3>
${codeBlock(`{todos.length === 0 ? (
  <p>No todos yet. Add one!</p>
) : (
  <TodoList todos={todos} />
)}`)}

<h3>Learn more</h3>
<p>${externalLink("React Docs — Conditional Rendering", "https://react.dev/learn/conditional-rendering")} · ${externalLink("React Docs — Rendering Lists", "https://react.dev/learn/rendering-lists")}</p>

<h3>Your task</h3>
<p>Build a <code>TaskList</code> that renders tasks with a done/undone toggle, shows an empty state, and conditionally shows a "Clear completed" button only when at least one task is done.</p>
`,
        initialCode: `import { useState } from "react";

function TaskList() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Learn React", done: false },
    { id: 2, text: "Build a project", done: true },
  ]);

  const toggle = (id) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const clearDone = () => setTasks((ts) => ts.filter((t) => !t.done));

  const hasDone = tasks.some((t) => t.done);

  return (
    <div>
      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <ul>
          {tasks.map((t) => (
            <li key={t.id}>
              <label>
                <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
                {t.done ? <s>{t.text}</s> : t.text}
              </label>
            </li>
          ))}
        </ul>
      )}
      {hasDone && <button onClick={clearDone}>Clear completed</button>}
    </div>
  );
}

export default TaskList;`,
        solution: `// Expected: toggling updates strikethrough; empty state shows when all cleared; button appears only with done tasks`,
      },
      points_reward: 10,
    },
    {
      title: "7. Forms & Controlled Components",
      content: {
        type: "browser",
        instructions: `
<h2>Controlled inputs</h2>
<p>In React, form inputs are <strong>controlled</strong> when their value is driven by state. The input's <code>value</code> prop reflects state; <code>onChange</code> updates state.</p>

${codeBlock(`function Form() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
}`)}

<h3>One handler for many fields</h3>
${codeBlock(`const [form, setForm] = useState({ name: "", email: "", age: 0 });

const handleChange = (e) => {
  const { name, value, type } = e.target;
  setForm((prev) => ({
    ...prev,
    [name]: type === "number" ? Number(value) : value,
  }));
};

<input name="name" value={form.name} onChange={handleChange} />
<input name="age" type="number" value={form.age} onChange={handleChange} />`)}

<h3>Validation</h3>
<p>Validate on submit (or on blur). Show errors per field. Disable submit until valid.</p>

<h3>Learn more</h3>
<p>${externalLink("React Docs — Sharing State Between Components", "https://react.dev/learn/sharing-state-between-components")} · ${externalLink("React Docs — <form>", "https://react.dev/reference/react-dom/components/form")}</p>

<h3>Your task</h3>
<p>Build a signup form with name, email, and password. Validate: name min 2 chars, email contains @, password min 8 chars. Show per-field errors and disable submit until all valid.</p>
`,
        initialCode: `import { useState } from "react";

function SignupForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});

  const validate = (f) => {
    const e = {};
    if (f.name.trim().length < 2) e.name = "Min 2 chars";
    if (!f.email.includes("@")) e.email = "Valid email required";
    if (f.password.length < 8) e.password = "Min 8 chars";
    return e;
  };

  const handleChange = (ev) => {
    const { name, value } = ev.target;
    const next = { ...form, [name]: value };
    setForm(next);
    setErrors(validate(next));
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length === 0) console.log("submitted", form);
  };

  const valid = Object.keys(validate(form)).length === 0;

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        {errors.name && <span style={{ color: "red" }}>{errors.name}</span>}
      </div>
      <div>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        {errors.email && <span style={{ color: "red" }}>{errors.email}</span>}
      </div>
      <div>
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
        {errors.password && <span style={{ color: "red" }}>{errors.password}</span>}
      </div>
      <button type="submit" disabled={!valid}>Sign up</button>
    </form>
  );
}

export default SignupForm;`,
        solution: `// Expected: errors appear as you type; submit disabled until all valid`,
      },
      points_reward: 10,
    },
    {
      title: "8. Lifting State Up",
      content: {
        type: "browser",
        instructions: `
<h2>Sharing state between components</h2>
<p>When two components need the same data, <strong>lift the state up</strong> to their closest common ancestor and pass it down via props.</p>

${codeBlock(`function Parent() {
  const [value, setValue] = useState("");
  return (
    <>
      <Input value={value} onChange={setValue} />
      <Display value={value} />
    </>
  );
}

function Input({ value, onChange }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}

function Display({ value }) {
  return <p>You typed: {value}</p>;
}`)}

<h3>The pattern</h3>
<ol>
  <li>Find the closest common parent of the components that need the state</li>
  <li>Move <code>useState</code> there</li>
  <li>Pass the value down as a prop</li>
  <li>Pass the setter (or a callback) down so children can update it</li>
</ol>

<h3>When NOT to lift</h3>
<p>If many components need the same state, prop drilling gets painful — that's when you reach for Context (next chapter) or a state library (Zustand, Redux).</p>

<h3>Learn more</h3>
<p>${externalLink("React Docs — Sharing State Between Components", "https://react.dev/learn/sharing-state-between-components")}</p>

<h3>Your task</h3>
<p>Build a temperature converter: two inputs (Celsius and Fahrenheit) that stay in sync. Lifting state to a parent that holds the value in Celsius and derives Fahrenheit.</p>
`,
        initialCode: `import { useState } from "react";

function TemperatureConverter() {
  const [celsius, setCelsius] = useState("");

  const fahrenheit = celsius === "" ? "" : (Number(celsius) * 9) / 5 + 32;

  return (
    <div>
      <label>
        Celsius:
        <input
          value={celsius}
          onChange={(e) => setCelsius(e.target.value)}
          type="number"
        />
      </label>
      <label>
        Fahrenheit:
        <input
          value={fahrenheit}
          onChange={(e) => {
            const f = e.target.value;
            setCelsius(f === "" ? "" : ((Number(f) - 32) * 5) / 9);
          }}
          type="number"
        />
      </label>
    </div>
  );
}

export default TemperatureConverter;`,
        solution: `// Expected: typing in either input updates the other`,
      },
      points_reward: 10,
    },
    {
      title: "9. Custom Hooks",
      content: {
        type: "browser",
        instructions: `
<h2>Extract reusable logic</h2>
<p>A <strong>custom hook</strong> is a function starting with <code>use</code> that calls other hooks. It lets you extract stateful logic from components and reuse it.</p>

${codeBlock(`function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Usage
function App() {
  const [name, setName] = useLocalStorage("name", "");
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}`)}

<h3>Rules of hooks</h3>
<ul>
  <li>Only call hooks at the top level (not inside loops, conditions, or nested functions)</li>
  <li>Only call hooks from React function components or custom hooks</li>
  <li>Custom hooks must start with <code>use</code></li>
</ul>

<h3>Common custom hooks</h3>
<ul>
  <li><code>useFetch(url)</code> — data fetching with loading/error</li>
  <li><code>useDebounce(value, delay)</code> — debounced value</li>
  <li><code>useToggle()</code> — boolean toggle</li>
  <li><code>usePrevious(value)</code> — previous render's value</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("React Docs — Reusing Logic with Custom Hooks", "https://react.dev/learn/reusing-logic-with-custom-hooks")}</p>

<h3>Your task</h3>
<p>Build a <code>useFetch(url)</code> custom hook that returns <code>{ data, loading, error }</code>. Use it in two components fetching different endpoints.</p>
`,
        initialCode: `import { useState, useEffect } from "react";

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

function UserCard() {
  const { data, loading, error } = useFetch("https://jsonplaceholder.typicode.com/users/1");
  if (loading) return <p>Loading user...</p>;
  if (error) return <p>Error: {error}</p>;
  return <div><h3>{data.name}</h3><p>{data.email}</p></div>;
}

export default UserCard;`,
        solution: `// Expected: shows user name + email after loading`,
      },
      points_reward: 10,
    },
    {
      title: "10. Context API",
      content: {
        type: "browser",
        instructions: `
<h2>Global state without prop drilling</h2>
<p><strong>Context</strong> lets you share data across the component tree without passing props through every level.</p>

${codeBlock(`import { createContext, useContext, useState } from "react";

const ThemeContext = createContext("light");

function App() {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Header />
      <Main />
    </ThemeContext.Provider>
  );
}

function Header() {
  const { theme } = useContext(ThemeContext);
  return <header className={theme}>Header</header>;
}`)}

<h3>Pattern: context + custom hook</h3>
${codeBlock(`const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}`)}

<h3>When to use Context</h3>
<ul>
  <li>Theme, locale, auth user, global config</li>
  <li>NOT for frequently changing data (causes re-renders of all consumers)</li>
  <li>For complex global state, use Zustand/Redux instead</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("React Docs — Passing Data Deeply with Context", "https://react.dev/learn/passing-data-deeply-with-context")}</p>

<h3>Your task</h3>
<p>Build a theme toggle (light/dark) using Context. Wrap the app in a <code>ThemeProvider</code>, create a <code>useTheme</code> hook, and use it in a <code>Header</code> and <code>Content</code> component.</p>
`,
        initialCode: `import { createContext, useContext, useState } from "react";

const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

function Header() {
  const { theme, toggle } = useTheme();
  return (
    <header style={{ background: theme === "dark" ? "#222" : "#fff", color: theme === "dark" ? "#fff" : "#000" }}>
      <h1>My App</h1>
      <button onClick={toggle}>Toggle theme ({theme})</button>
    </header>
  );
}

function Content() {
  const { theme } = useTheme();
  return (
    <main style={{ background: theme === "dark" ? "#111" : "#f5f5f5", color: theme === "dark" ? "#eee" : "#333", padding: 16 }}>
      <p>Content area — theme is {theme}</p>
    </main>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Header />
      <Content />
    </ThemeProvider>
  );
}

export default App;`,
        solution: `// Expected: clicking toggle switches header + content between light/dark`,
      },
      points_reward: 10,
    },
    {
      title: "11. Project — Todo App",
      content: {
        type: "browser",
        instructions: `
<h2>Capstone part 1: a todo app</h2>
<p>Build a complete todo app using everything: components, props, state, effects, forms, lists, and localStorage persistence via a custom hook.</p>

<h3>Requirements</h3>
<ul>
  <li>Add todos (text input + button)</li>
  <li>Toggle done (checkbox)</li>
  <li>Delete todos</li>
  <li>Filter: All / Active / Completed</li>
  <li>Persist to localStorage (survives refresh)</li>
  <li>Show remaining count</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("React Docs — Thinking in React", "https://react.dev/learn/thinking-in-react")} · ${externalLink("React Docs — Queueing State Updates", "https://react.dev/learn/queueing-a-series-of-state-updates")}</p>

<h3>Your task</h3>
<p>Run the starter, then extend: add an "Edit" button that turns the todo text into an input, and a "Clear completed" button.</p>
`,
        initialCode: `import { useState, useEffect } from "react";

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}

function TodoApp() {
  const [todos, setTodos] = useLocalStorage("todos", []);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");

  const add = () => {
    if (!text.trim()) return;
    setTodos((t) => [...t, { id: Date.now(), text: text.trim(), done: false }]);
    setText("");
  };
  const toggle = (id) => setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const remove = (id) => setTodos((t) => t.filter((x) => x.id !== id));

  const visible = todos.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done
  );
  const remaining = todos.filter((t) => !t.done).length;

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1>Todos</h1>
      <div>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="What needs doing?" />
        <button onClick={add}>Add</button>
      </div>
      <div>
        {["all", "active", "completed"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ fontWeight: filter === f ? "bold" : "normal" }}>{f}</button>
        ))}
      </div>
      <ul>
        {visible.map((t) => (
          <li key={t.id}>
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
            <span style={{ textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
            <button onClick={() => remove(t.id)}>x</button>
          </li>
        ))}
      </ul>
      <p>{remaining} item{remaining !== 1 ? "s" : ""} left</p>
    </div>
  );
}

export default TodoApp;`,
        solution: `// Expected: add/toggle/delete/filter/persist all work; survives refresh`,
      },
      points_reward: 20,
    },
    {
      title: "12. Project — Weather Widget",
      content: {
        type: "browser",
        instructions: `
<h2>Capstone part 2: a weather widget</h2>
<p>Build a weather widget that fetches from a public API, handles loading/error states, and lets the user search by city. Combines effects, custom hooks, forms, and conditional rendering.</p>

<h3>Requirements</h3>
<ul>
  <li>Search input + button to fetch weather for a city</li>
  <li>Show temperature, condition, humidity, wind</li>
  <li>Loading spinner and error message</li>
  <li>Recent searches (persisted to localStorage)</li>
  <li>Use a custom <code>useFetch</code> hook</li>
</ul>

<h3>API</h3>
<p>Use <code>https://wttr.in/{city}?format=j1</code> (free, no key) or OpenWeatherMap (needs free key).</p>

<h3>Learn more</h3>
<p>${externalLink("wttr.in", "https://wttr.in/:help")} · ${externalLink("React Docs — You Might Not Need an Effect", "https://react.dev/learn/you-might-not-need-an-effect")}</p>

<h3>Your task</h3>
<p>Run the starter, then add a 5-day forecast section and a "use my location" button using the Geolocation API.</p>
`,
        initialCode: `import { useState } from "react";

function WeatherWidget() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (c) => {
    if (!c.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://wttr.in/" + encodeURIComponent(c) + "?format=j1");
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeather({ city: c, ...data.current_condition[0] });
    } catch (e) {
      setError(e.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "0 auto" }}>
      <h1>Weather</h1>
      <div>
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" onKeyDown={(e) => e.key === "Enter" && fetchWeather(city)} />
        <button onClick={() => fetchWeather(city)}>Search</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {weather && (
        <div>
          <h2>{weather.city}</h2>
          <p>{weather.weatherDesc[0].value}</p>
          <p>Temp: {weather.temp_C}°C / {weather.temp_F}°F</p>
          <p>Humidity: {weather.humidity}%</p>
          <p>Wind: {weather.windspeedKmph} km/h</p>
        </div>
      )}
    </div>
  );
}

export default WeatherWidget;`,
        solution: `// Expected: search shows current weather; loading/error states work`,
      },
      points_reward: 20,
    },
    {
      title: "13. Final Project — Mini Dashboard",
      content: {
        type: "browser",
        instructions: `
<h2>Capstone: a mini dashboard</h2>
<p>Combine everything — components, props, state, effects, context, custom hooks, forms, lists — into a small dashboard with a sidebar, user profile, and a data table.</p>

<h3>Requirements</h3>
<ul>
  <li>Layout: sidebar nav + main content area</li>
  <li>Theme toggle (light/dark) via Context</li>
  <li>User profile card (props + composition)</li>
  <li>Data table fetching from a public API with loading/error states</li>
  <li>Search/filter input (controlled) that filters the table</li>
  <li>Persist theme + last search to localStorage (custom hook)</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("React Docs — Thinking in React", "https://react.dev/learn/thinking-in-react")} · ${externalLink("shadcn/ui", "https://ui.shadcn.com/")}</p>

<h3>Your task</h3>
<p>Run the starter, then add a "Favorites" feature: star rows to save them, persisted to localStorage, with a separate "Favorites" view.</p>
`,
        initialCode: `import { useState, useEffect, createContext, useContext } from "react";

// --- Theme Context ---
const ThemeContext = createContext(null);
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  useEffect(() => { localStorage.setItem("theme", theme); }, [theme]);
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
function useTheme() { return useContext(ThemeContext); }

// --- Custom hook: localStorage ---
function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; } });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}

// --- Components ---
function Sidebar({ view, setView }) {
  const { theme, toggle } = useTheme();
  return (
    <aside style={{ width: 180, padding: 12, background: theme === "dark" ? "#222" : "#eee" }}>
      <h3>Nav</h3>
      <button onClick={() => setView("users")} style={{ display: "block", width: "100%" }}>Users</button>
      <button onClick={() => setView("favorites")} style={{ display: "block", width: "100%" }}>Favorites</button>
      <button onClick={toggle} style={{ marginTop: 12 }}>Theme: {theme}</button>
    </aside>
  );
}

function UserTable({ users, query }) {
  const filtered = users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr><th>Name</th><th>Email</th><th>City</th></tr></thead>
      <tbody>
        {filtered.map((u) => (
          <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.address?.city}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

function App() {
  const [view, setView] = useState("users");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((r) => r.json())
      .then((d) => { setUsers(d); setLoading(false); });
  }, []);

  return (
    <ThemeProvider>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar view={view} setView={setView} />
        <main style={{ flex: 1, padding: 16 }}>
          <h1>Dashboard</h1>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." />
          {loading ? <p>Loading...</p> : <UserTable users={users} query={query} />}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;`,
        solution: `// Expected: sidebar nav, theme toggle, user table with search filter`,
      },
      points_reward: 25,
    },
  ],
};
