import type { CourseData } from "./types";
import { codeBlock, externalLink, BOX_STYLE } from "./format";

export const nodeCourse: CourseData = {
  title: "Node.js & Express — Backend from Scratch",
  description:
    "Build backend servers with Node.js and Express — 10 hands-on lessons plus 3 projects (notes API, auth API, task manager). HTTP, routing, middleware, REST APIs. Requires JavaScript & TypeScript basics.",
  icon: "",
  difficulty: "Intermediate",
  category: "Backend",
  order_index: 8,
  chapters: [
    {
      title: "1. What Is Node.js?",
      content: {
        type: "browser",
        instructions: `
<h2>JavaScript on the server</h2>
<p><strong>Node.js</strong> is a runtime that lets you run JavaScript outside the browser. It's built on Chrome's V8 engine and uses an event-driven, non-blocking I/O model — great for servers, CLIs, and build tools.</p>

<h3>Why Node.js?</h3>
<ul>
  <li><strong>Same language</strong> — JS on frontend and backend</li>
  <li><strong>Non-blocking I/O</strong> — handles thousands of concurrent connections efficiently</li>
  <li><strong>Huge ecosystem</strong> — npm has 2M+ packages</li>
  <li><strong>Fast</strong> — V8 compiles JS to native machine code</li>
</ul>

<h3>Node vs Browser</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
  <tr><th style="text-align:left;padding:6px;">Feature</th><th style="text-align:left;padding:6px;">Browser</th><th style="text-align:left;padding:6px;">Node.js</th></tr>
  <tr><td style="padding:6px;">DOM/window</td><td style="padding:6px;">✅</td><td style="padding:6px;">❌</td></tr>
  <tr><td style="padding:6px;">File system</td><td style="padding:6px;">❌</td><td style="padding:6px;">✅ (fs module)</td></tr>
  <tr><td style="padding:6px;">HTTP server</td><td style="padding:6px;">❌</td><td style="padding:6px;">✅ (http module)</td></tr>
  <tr><td style="padding:6px;">Modules</td><td style="padding:6px;">ESM</td><td style="padding:6px;">CommonJS + ESM</td></tr>
</table>

<h3>Run your first Node script</h3>
${codeBlock(`// hello.js
console.log("Hello from Node!");
console.log("Node version:", process.version);
console.log("Platform:", process.platform);`)}

${codeBlock(`# Run it
node hello.js`)}

<h3>The event loop</h3>
<p>Node is single-threaded but non-blocking: I/O operations (file reads, network) are delegated to the OS and callbacks run when done. This is why Node excels at I/O-heavy workloads.</p>

<h3>Learn more</h3>
<p>${externalLink("Node.js Docs — Introduction", "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs")} · ${externalLink("Node.js — About", "https://nodejs.org/en/about")}</p>

<h3>Your task</h3>
<p>Install Node.js (LTS) from nodejs.org. Create <code>hello.js</code> with the code above, run it with <code>node hello.js</code>. Then try <code>node -e "console.log(process.versions)"</code> and <code>node --version</code>.</p>
`,
        initialCode: `// Node.js — Chapter 1 scratchpad (run with: node hello.js)

console.log("Hello from Node!");
console.log("Node version:", process.version);
console.log("Platform:", process.platform);

// Try in your terminal:
// node -e "console.log(process.versions)"
// node --version`,
        solution: `// Expected output (versions will vary):
// Hello from Node!
// Node version: v20.x.x
// Platform: linux (or darwin/win32)`,
      },
      points_reward: 10,
    },
    {
      title: "2. Modules & npm",
      content: {
        type: "browser",
        instructions: `
<h2>Organize code and use packages</h2>
<p>Node uses <strong>CommonJS modules</strong> by default: <code>require()</code> to import, <code>module.exports</code> to export. (ESM with <code>import/export</code> is also supported.)</p>

<h3>CommonJS</h3>
${codeBlock(`// math.js
function add(a, b) { return a + b; }
module.exports = { add };

// app.js
const { add } = require("./math");
console.log(add(2, 3)); // 5`)}

<h3>npm — the package manager</h3>
${codeBlock(`# Initialize a project
npm init -y

# Install a package
npm install express

# Install dev dependency
npm install --save-dev nodemon

# Run scripts
npm run dev`)}

<h3>package.json</h3>
${codeBlock(`{
  "name": "my-api",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}`)}

<h3>node_modules & .gitignore</h3>
<p>Always add <code>node_modules/</code> to <code>.gitignore</code>. Commit <code>package.json</code> and <code>package-lock.json</code>, not the modules.</p>

<h3>Learn more</h3>
<p>${externalLink("Node.js Docs — Modules", "https://nodejs.org/api/modules.html")} · ${externalLink("npm Docs", "https://docs.npmjs.com/")}</p>

<h3>Your task</h3>
<p>Create a new folder, run <code>npm init -y</code>, create <code>math.js</code> (export add/multiply) and <code>app.js</code> (require and use them). Run <code>node app.js</code>. Add <code>.gitignore</code> with <code>node_modules/</code>.</p>
`,
        initialCode: `// Node.js — Chapter 2 scratchpad (run with: node app.js)

// math.js
function add(a, b) { return a + b; }
function multiply(a, b) { return a * b; }
module.exports = { add, multiply };

// app.js
// const { add, multiply } = require("./math");
// console.log(add(2, 3));       // 5
// console.log(multiply(4, 5));  // 20`,
        solution: `// Expected: 5 and 20 printed
// Directory contains: math.js, app.js, package.json, .gitignore`,
      },
      points_reward: 10,
    },
    {
      title: "3. File System (fs)",
      content: {
        type: "browser",
        instructions: `
<h2>Read and write files</h2>
<p>The <code>fs</code> module lets Node read/write files. Prefer the promise-based API (<code>fs/promises</code>) in modern code.</p>

${codeBlock(`const fs = require("fs").promises;

// Read
const data = await fs.readFile("data.txt", "utf-8");
console.log(data);

// Write (overwrites)
await fs.writeFile("out.txt", "Hello, Node!");

// Append
await fs.appendFile("log.txt", "new line\\n");

// Check existence
try { await fs.access("file.txt"); console.log("exists"); }
catch { console.log("missing"); }`)}

<h3>Sync vs async</h3>
<ul>
  <li><code>fs.readFileSync</code> — blocks the event loop; use only at startup</li>
  <li><code>fs.readFile</code> (callback) or <code>fs/promises</code> — non-blocking; preferred</li>
</ul>

<h3>Paths</h3>
${codeBlock(`const path = require("path");
path.join("/a", "b", "c.txt");   // /a/b/c.txt
path.resolve("data.txt");         // absolute path
path.extname("file.txt");         // .txt
path.basename("/a/b/c.txt");      // c.txt
__dirname;                        // current file's directory
__filename;                       // current file path`)}

<h3>Directories</h3>
${codeBlock(`await fs.mkdir("logs", { recursive: true });
const files = await fs.readdir(".");
await fs.rm("temp", { recursive: true, force: true });`)}

<h3>Learn more</h3>
<p>${externalLink("Node.js Docs — fs", "https://nodejs.org/api/fs.html")} · ${externalLink("Node.js Docs — path", "https://nodejs.org/api/path.html")}</p>

<h3>Your task</h3>
<p>Write a script that reads <code>input.txt</code>, counts words and lines, and writes a summary to <code>stats.json</code>. Use <code>fs/promises</code> and <code>path</code>.</p>
`,
        initialCode: `// Node.js — Chapter 3 scratchpad (run with: node stats.js)

const fs = require("fs").promises;
const path = require("path");

async function main() {
  const input = await fs.readFile("input.txt", "utf-8");
  const lines = input.split("\\n").length;
  const words = input.trim().split(/\\s+/).filter(Boolean).length;
  const stats = { lines, words, chars: input.length };
  await fs.writeFile("stats.json", JSON.stringify(stats, null, 2));
  console.log("Stats:", stats);
}

main().catch(console.error);

// Create input.txt first:
// echo "hello world\\nfoo bar baz" > input.txt`,
        solution: `// Expected stats.json:
// { "lines": 2, "words": 5, "chars": 21 }
// (exact char count depends on trailing newline)`,
      },
      points_reward: 10,
    },
    {
      title: "4. HTTP Server from Scratch",
      content: {
        type: "browser",
        instructions: `
<h2>Serve HTTP without a framework</h2>
<p>Node's built-in <code>http</code> module can create a server. Understanding it makes Express (next) much clearer.</p>

${codeBlock(`const http = require("http");

const server = http.createServer((req, res) => {
  console.log(req.method, req.url);
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello, World!");
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});`)}

<h3>Request & Response</h3>
<ul>
  <li><code>req.method</code> — GET, POST, etc.</li>
  <li><code>req.url</code> — path + query string</li>
  <li><code>req.headers</code> — incoming headers</li>
  <li><code>res.statusCode</code> — set status (200, 404, 500)</li>
  <li><code>res.setHeader()</code> / <code>res.writeHead()</code></li>
  <li><code>res.end()</code> — send body and close</li>
</ul>

<h3>Reading request body</h3>
${codeBlock(`let body = "";
req.on("data", (chunk) => { body += chunk; });
req.on("end", () => {
  console.log("Body:", body);
  res.end("Received");
});`)}

<h3>Routing manually</h3>
${codeBlock(`if (req.url === "/" && req.method === "GET") { res.end("Home"); }
else if (req.url === "/about") { res.end("About"); }
else { res.statusCode = 404; res.end("Not Found"); }`)}

<h3>Learn more</h3>
<p>${externalLink("Node.js Docs — http", "https://nodejs.org/api/http.html")}</p>

<h3>Your task</h3>
<p>Build a server that responds to <code>GET /</code> with "Home", <code>GET /about</code> with "About", and 404 for anything else. Test with <code>curl http://localhost:3000/</code>.</p>
`,
        initialCode: `// Node.js — Chapter 4 scratchpad (run with: node server.js)

const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.end("Home");
  } else if (req.url === "/about" && req.method === "GET") {
    res.end("About");
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

server.listen(3000, () => console.log("http://localhost:3000/"));`,
        solution: `// Test:
// curl http://localhost:3000/        -> Home
// curl http://localhost:3000/about  -> About
// curl http://localhost:3000/x      -> Not Found (404)`,
      },
      points_reward: 10,
    },
    {
      title: "5. Express Basics",
      content: {
        type: "browser",
        instructions: `
<h2>The most popular Node framework</h2>
<p><strong>Express</strong> is a minimal, flexible web framework for Node.js. It handles routing, middleware, and HTTP helpers so you don't have to.</p>

${codeBlock(`const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.listen(3000, () => {
  console.log("Server on http://localhost:3000");
});`)}

<h3>Install & run</h3>
${codeBlock(`npm install express
node index.js
# or with auto-restart:
npm install -D nodemon
npx nodemon index.js`)}

<h3>Response helpers</h3>
${codeBlock(`res.send("text");              // send text/HTML
res.json({ ok: true });        // send JSON
res.status(404).send("nope");  // status + body
res.redirect("/login");        // 302 redirect
res.sendFile("/path/file.pdf"); // send file`)}

<h3>Middleware</h3>
<p>Middleware functions run between request and response. They have access to <code>req</code>, <code>res</code>, and <code>next</code>.</p>
${codeBlock(`app.use((req, res, next) => {
  console.log(req.method, req.url);
  next(); // pass to next middleware/route
});

app.use(express.json()); // parse JSON bodies`)}

<h3>Learn more</h3>
<p>${externalLink("Express Docs — Getting Started", "https://expressjs.com/en/starter/hello-world.html")} · ${externalLink("Express Docs — Middleware", "https://expressjs.com/en/guide/using-middleware.html")}</p>

<h3>Your task</h3>
<p>Create an Express server with <code>/</code>, <code>/about</code>, and <code>/api/health</code> (returns JSON). Add a logging middleware. Test all three routes with curl.</p>
`,
        initialCode: `// Node.js — Chapter 5 scratchpad (run with: node index.js)

const express = require("express");
const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use(express.json());

app.get("/", (req, res) => res.send("Home"));
app.get("/about", (req, res) => res.send("About"));
app.get("/api/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.listen(3000, () => console.log("http://localhost:3000"));`,
        solution: `// Test:
// curl http://localhost:3000/            -> Home
// curl http://localhost:3000/about      -> About
// curl http://localhost:3000/api/health -> {"status":"ok","uptime":...}`,
      },
      points_reward: 10,
    },
    {
      title: "6. Routing & Route Params",
      content: {
        type: "browser",
        instructions: `
<h2>Dynamic routes and query strings</h2>
<p>Express routes can have parameters (<code>:id</code>) and query strings (<code>?q=...</code>).</p>

${codeBlock(`app.get("/users/:id", (req, res) => {
  res.json({ id: req.params.id });
});

app.get("/search", (req, res) => {
  res.json({ q: req.query.q, page: req.query.page });
});`)}

<h3>Route params vs query</h3>
<ul>
  <li><code>/users/42</code> → <code>req.params.id = "42"</code> (required, part of path)</li>
  <li><code>/search?q=react&page=2</code> → <code>req.query.q = "react"</code> (optional, after ?)</li>
</ul>

<h3>Express Router (modular routes)</h3>
${codeBlock(`// routes/users.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.json([]));
router.get("/:id", (req, res) => res.json({ id: req.params.id }));
router.post("/", (req, res) => res.status(201).json(req.body));

module.exports = router;

// index.js
app.use("/api/users", require("./routes/users"));`)}

<h3>Multiple methods</h3>
${codeBlock(`app.route("/items")
  .get((req, res) => res.json([]))
  .post((req, res) => res.status(201).json(req.body));`)}

<h3>Learn more</h3>
<p>${externalLink("Express Docs — Routing", "https://expressjs.com/en/guide/routing.html")} · ${externalLink("Express Router", "https://expressjs.com/en/4x/api.html#router")}</p>

<h3>Your task</h3>
<p>Create a <code>/api/users</code> router with GET (list), GET /:id, POST (create), PUT /:id (update), DELETE /:id. Use an in-memory array. Test all 5 with curl.</p>
`,
        initialCode: `// Node.js — Chapter 6 scratchpad (run with: node index.js)

const express = require("express");
const app = express();
app.use(express.json());

const users = [
  { id: 1, name: "Ada", email: "ada@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

const router = express.Router();
router.get("/", (req, res) => res.json(users));
router.get("/:id", (req, res) => {
  const u = users.find((x) => x.id === Number(req.params.id));
  if (!u) return res.status(404).json({ error: "not found" });
  res.json(u);
});
router.post("/", (req, res) => {
  const u = { id: users.length + 1, ...req.body };
  users.push(u);
  res.status(201).json(u);
});
router.put("/:id", (req, res) => {
  const i = users.findIndex((x) => x.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: "not found" });
  users[i] = { ...users[i], ...req.body };
  res.json(users[i]);
});
router.delete("/:id", (req, res) => {
  const i = users.findIndex((x) => x.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: "not found" });
  users.splice(i, 1);
  res.status(204).end();
});

app.use("/api/users", router);
app.listen(3000, () => console.log("http://localhost:3000"));`,
        solution: `// Test:
// curl http://localhost:3000/api/users
// curl http://localhost:3000/api/users/1
// curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"name":"Eve","email":"eve@x.com"}'
// curl -X PUT http://localhost:3000/api/users/1 -H "Content-Type: application/json" -d '{"name":"Ada L."}'
// curl -X DELETE http://localhost:3000/api/users/2`,
      },
      points_reward: 10,
    },
    {
      title: "7. Middleware",
      content: {
        type: "browser",
        instructions: `
<h2>The request pipeline</h2>
<p>Middleware functions sit between the request arriving and the route handler running. They can modify <code>req</code>/<code>res</code>, end the request, or call <code>next()</code> to continue.</p>

${codeBlock(`app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});`)}

<h3>Types of middleware</h3>
<ul>
  <li><strong>Application-level</strong> — <code>app.use(fn)</code>, runs for all routes</li>
  <li><strong>Router-level</strong> — <code>router.use(fn)</code>, scoped to a router</li>
  <li><strong>Built-in</strong> — <code>express.json()</code>, <code>express.static()</code></li>
  <li><strong>Error-handling</strong> — 4-arg function <code>(err, req, res, next)</code></li>
  <li><strong>Third-party</strong> — <code>cors</code>, <code>helmet</code>, <code>morgan</code></li>
</ul>

<h3>Error-handling middleware</h3>
${codeBlock(`// Must have 4 params — Express detects by arity
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Trigger it:
app.get("/boom", (req, res, next) => {
  next(new Error("something broke"));
});`)}

<h3>Auth middleware example</h3>
${codeBlock(`function requireAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  req.user = { id: 1, name: "Ada" }; // decode token in real code
  next();
}

app.get("/profile", requireAuth, (req, res) => {
  res.json(req.user);
});`)}

<h3>Learn more</h3>
<p>${externalLink("Express Docs — Using Middleware", "https://expressjs.com/en/guide/using-middleware.html")} · ${externalLink("Express Docs — Error Handling", "https://expressjs.com/en/guide/error-handling.html")}</p>

<h3>Your task</h3>
<p>Add a request logger, an auth middleware that checks for <code>Authorization: Bearer secret</code>, and an error handler. Protect <code>/api/secret</code> with auth; leave <code>/api/public</code> open.</p>
`,
        initialCode: `// Node.js — Chapter 7 scratchpad (run with: node index.js)

const express = require("express");
const app = express();
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Auth middleware
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  if (auth !== "Bearer secret") return res.status(401).json({ error: "Unauthorized" });
  req.user = { id: 1, name: "Ada" };
  next();
}

app.get("/api/public", (req, res) => res.json({ msg: "public" }));
app.get("/api/secret", requireAuth, (req, res) => res.json({ msg: "secret", user: req.user }));

// Error handler (4 params)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.get("/boom", (req, res, next) => next(new Error("boom")));

app.listen(3000, () => console.log("http://localhost:3000"));`,
        solution: `// Test:
// curl http://localhost:3000/api/public
// curl http://localhost:3000/api/secret                          -> 401
// curl -H "Authorization: Bearer secret" http://localhost:3000/api/secret -> 200
// curl http://localhost:3000/boom                               -> 500`,
      },
      points_reward: 10,
    },
    {
      title: "8. REST API Design",
      content: {
        type: "browser",
        instructions: `
<h2>Designing clean APIs</h2>
<p>REST (Representational State Transfer) uses HTTP methods and status codes to operate on resources (nouns, not verbs).</p>

<h3>HTTP methods</h3>
<ul>
  <li><code>GET</code> — read (safe, idempotent)</li>
  <li><code>POST</code> — create (not idempotent)</li>
  <li><code>PUT</code> — replace (idempotent)</li>
  <li><code>PATCH</code> — partial update</li>
  <li><code>DELETE</code> — remove (idempotent)</li>
</ul>

<h3>Status codes</h3>
<ul>
  <li><code>200</code> OK, <code>201</code> Created, <code>204</code> No Content</li>
  <li><code>400</code> Bad Request, <code>401</code> Unauthorized, <code>403</code> Forbidden, <code>404</code> Not Found</li>
  <li><code>409</code> Conflict, <code>422</code> Unprocessable, <code>500</code> Server Error</li>
</ul>

<h3>URL design</h3>
${codeBlock(`/api/users           GET (list), POST (create)
/api/users/:id       GET (one), PUT (replace), PATCH (update), DELETE
/api/users/:id/posts GET (nested collection)`)}

<h3>Consistent response shape</h3>
${codeBlock(`// Success
{ "data": { ... }, "meta": { "page": 1, "total": 42 } }

// Error
{ "error": "Validation failed", "details": { "email": "required" } }`)}

<h3>Pagination, filtering, sorting</h3>
${codeBlock(`/api/users?page=2&limit=20&sort=name&order=asc&q=ada`)}

<h3>Learn more</h3>
<p>${externalLink("MDN — HTTP request methods", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods")} · ${externalLink("REST API best practices", "https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/")}</p>

<h3>Your task</h3>
<p>Design and implement a REST API for a "books" resource with all CRUD endpoints, pagination (<code>?page&limit</code>), and a consistent response shape. Test every endpoint with curl.</p>
`,
        initialCode: `// Node.js — Chapter 8 scratchpad (run with: node index.js)

const express = require("express");
const app = express();
app.use(express.json());

let books = [
  { id: 1, title: "1984", author: "Orwell", year: 1949 },
  { id: 2, title: "Dune", author: "Herbert", year: 1965 },
];
let nextId = 3;

app.get("/api/books", (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const start = (page - 1) * limit;
  const data = books.slice(start, start + limit);
  res.json({ data, meta: { page, limit, total: books.length } });
});

app.get("/api/books/:id", (req, res) => {
  const b = books.find((x) => x.id === Number(req.params.id));
  if (!b) return res.status(404).json({ error: "Not found" });
  res.json({ data: b });
});

app.post("/api/books", (req, res) => {
  const { title, author, year } = req.body;
  if (!title || !author) return res.status(400).json({ error: "title and author required" });
  const b = { id: nextId++, title, author, year: year || null };
  books.push(b);
  res.status(201).json({ data: b });
});

app.put("/api/books/:id", (req, res) => {
  const i = books.findIndex((x) => x.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: "Not found" });
  books[i] = { ...books[i], ...req.body, id: books[i].id };
  res.json({ data: books[i] });
});

app.delete("/api/books/:id", (req, res) => {
  const i = books.findIndex((x) => x.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: "Not found" });
  books.splice(i, 1);
  res.status(204).end();
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
        solution: `// Test all endpoints with curl; verify pagination, validation, status codes`,
      },
      points_reward: 10,
    },
    {
      title: "9. Working with Data",
      content: {
        type: "browser",
        instructions: `
<h2>Persisting data beyond memory</h2>
<p>In-memory arrays reset on restart. For real apps, persist to a database (PostgreSQL, MongoDB) or files (JSON). This chapter covers file-based persistence as a stepping stone.</p>

<h3>JSON file storage</h3>
${codeBlock(`const fs = require("fs").promises;
const path = require("path");
const DB = path.join(__dirname, "db.json");

async function readDB() {
  try { return JSON.parse(await fs.readFile(DB, "utf-8")); }
  catch { return []; }
}
async function writeDB(data) {
  await fs.writeFile(DB, JSON.stringify(data, null, 2));
}`)}

<h3>Using it in routes</h3>
${codeBlock(`app.get("/api/items", async (req, res) => {
  const items = await readDB();
  res.json({ data: items });
});

app.post("/api/items", async (req, res) => {
  const items = await readDB();
  const item = { id: Date.now(), ...req.body };
  items.push(item);
  await writeDB(items);
  res.status(201).json({ data: item });
});`)}

<h3>When to use a real DB</h3>
<ul>
  <li>Multiple users / concurrent writes</li>
  <li>Complex queries (joins, filters, search)</li>
  <li>Large data (files don't scale)</li>
  <li>Transactions and consistency</li>
</ul>
<p>This platform uses PostgreSQL (Neon) + Drizzle ORM — see the <code>config/schema.tsx</code> and <code>lib/</code> data-access patterns.</p>

<h3>Learn more</h3>
<p>${externalLink("Node.js Docs — fs/promises", "https://nodejs.org/api/fs.html#fspromises")} · ${externalLink("Drizzle ORM", "https://orm.drizzle.team/")}</p>

<h3>Your task</h3>
<p>Convert the books API from Ch 8 to use a <code>db.json</code> file. Verify data survives a server restart.</p>
`,
        initialCode: `// Node.js — Chapter 9 scratchpad (run with: node index.js)

const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const app = express();
app.use(express.json());

const DB = path.join(__dirname, "db.json");

async function readDB() {
  try { return JSON.parse(await fs.readFile(DB, "utf-8")); }
  catch { return []; }
}
async function writeDB(data) {
  await fs.writeFile(DB, JSON.stringify(data, null, 2));
}

app.get("/api/items", async (req, res) => {
  res.json({ data: await readDB() });
});
app.post("/api/items", async (req, res) => {
  const items = await readDB();
  const item = { id: Date.now(), ...req.body };
  items.push(item);
  await writeDB(items);
  res.status(201).json({ data: item });
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
        solution: `// Test: POST an item, restart server, GET -> item still there`,
      },
      points_reward: 10,
    },
    {
      title: "10. Project — Notes API",
      content: {
        type: "browser",
        instructions: `
<h2>Capstone part 1: a notes REST API</h2>
<p>Build a complete notes API with CRUD, validation, error handling, and file persistence. This mirrors the developer notebook feature (Phase 3.4) of this platform.</p>

<h3>Requirements</h3>
<ul>
  <li><code>GET /api/notes</code> — list all (with pagination)</li>
  <li><code>GET /api/notes/:id</code> — get one (404 if missing)</li>
  <li><code>POST /api/notes</code> — create (validate title + content)</li>
  <li><code>PUT /api/notes/:id</code> — update</li>
  <li><code>DELETE /api/notes/:id</code> — delete</li>
  <li>Persist to <code>notes.json</code></li>
  <li>Consistent error responses</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("Express Docs — Routing", "https://expressjs.com/en/guide/routing.html")} · ${externalLink("REST API design", "https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/")}</p>

<h3>Your task</h3>
<p>Run the starter, test all 5 endpoints with curl, then add a <code>?q=</code> search filter on GET list.</p>
`,
        initialCode: `// Node.js — Chapter 10 scratchpad (run with: node index.js)

const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const app = express();
app.use(express.json());

const DB = path.join(__dirname, "notes.json");
async function readDB() { try { return JSON.parse(await fs.readFile(DB, "utf-8")); } catch { return []; } }
async function writeDB(d) { await fs.writeFile(DB, JSON.stringify(d, null, 2)); }

app.get("/api/notes", async (req, res) => {
  let notes = await readDB();
  if (req.query.q) {
    const q = req.query.q.toLowerCase();
    notes = notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const start = (page - 1) * limit;
  res.json({ data: notes.slice(start, start + limit), meta: { page, limit, total: notes.length } });
});

app.get("/api/notes/:id", async (req, res) => {
  const notes = await readDB();
  const n = notes.find((x) => x.id === Number(req.params.id));
  if (!n) return res.status(404).json({ error: "Not found" });
  res.json({ data: n });
});

app.post("/api/notes", async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: "title and content required" });
  const notes = await readDB();
  const note = { id: Date.now(), title, content, createdAt: new Date().toISOString() };
  notes.push(note);
  await writeDB(notes);
  res.status(201).json({ data: note });
});

app.put("/api/notes/:id", async (req, res) => {
  const notes = await readDB();
  const i = notes.findIndex((x) => x.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: "Not found" });
  notes[i] = { ...notes[i], ...req.body, id: notes[i].id };
  await writeDB(notes);
  res.json({ data: notes[i] });
});

app.delete("/api/notes/:id", async (req, res) => {
  const notes = await readDB();
  const i = notes.findIndex((x) => x.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: "Not found" });
  notes.splice(i, 1);
  await writeDB(notes);
  res.status(204).end();
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
        solution: `// Test all 5 endpoints + search:
// curl "http://localhost:3000/api/notes?q=react"`,
      },
      points_reward: 20,
    },
    {
      title: "11. Project — Auth API",
      content: {
        type: "browser",
        instructions: `
<h2>Capstone part 2: authentication API</h2>
<p>Build a signup/login API with password hashing (bcrypt) and JWT tokens. This is the foundation of any real backend.</p>

<h3>Requirements</h3>
<ul>
  <li><code>POST /api/auth/signup</code> — create user (hash password with bcrypt)</li>
  <li><code>POST /api/auth/login</code> — verify password, return JWT</li>
  <li><code>GET /api/auth/me</code> — protected route, returns current user from token</li>
  <li>Store users in <code>users.json</code></li>
  <li>Validate inputs; return consistent errors</li>
</ul>

<h3>Packages</h3>
${codeBlock(`npm install bcrypt jsonwebtoken`)}

<h3>Learn more</h3>
<p>${externalLink("bcrypt", "https://www.npmjs.com/package/bcrypt")} · ${externalLink("jsonwebtoken", "https://www.npmjs.com/package/jsonwebtoken")} · ${externalLink("OWASP Auth Cheat Sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html")}</p>

<h3>Your task</h3>
<p>Run the starter, test signup → login → /me flow with curl. Then add a <code>POST /api/auth/logout</code> (stateless: client discards token) and rate limiting on login.</p>
`,
        initialCode: `// Node.js — Chapter 11 scratchpad (run with: node index.js)

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs").promises;
const path = require("path");
const app = express();
app.use(express.json());

const DB = path.join(__dirname, "users.json");
const SECRET = "dev-secret-change-in-prod";
async function readDB() { try { return JSON.parse(await fs.readFile(DB, "utf-8")); } catch { return []; } }
async function writeDB(d) { await fs.writeFile(DB, JSON.stringify(d, null, 2)); }

app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  if (password.length < 8) return res.status(400).json({ error: "password min 8 chars" });
  const users = await readDB();
  if (users.find((u) => u.email === email)) return res.status(409).json({ error: "email exists" });
  const hash = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), email, password: hash };
  users.push(user);
  await writeDB(users);
  res.status(201).json({ data: { id: user.id, email: user.email } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const users = await readDB();
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: "invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1h" });
  res.json({ data: { token } });
});

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing token" });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: "invalid token" }); }
}

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  const users = await readDB();
  const u = users.find((x) => x.id === req.user.id);
  res.json({ data: { id: u.id, email: u.email } });
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
        solution: `// Test flow:
// 1. POST /api/auth/signup {"email":"a@b.com","password":"password123"}
// 2. POST /api/auth/login {"email":"a@b.com","password":"password123"} -> token
// 3. GET /api/auth/me -H "Authorization: Bearer <token>" -> user`,
      },
      points_reward: 20,
    },
    {
      title: "12. Final Project — Task Manager API",
      content: {
        type: "browser",
        instructions: `
<h2>Capstone: a full task manager API</h2>
<p>Combine everything — Express, routing, middleware, REST design, file persistence, auth — into a task manager API with users, tasks, and JWT auth.</p>

<h3>Requirements</h3>
<ul>
  <li>Auth: signup/login (from Ch 11)</li>
  <li>Tasks: CRUD scoped to the authenticated user</li>
  <li>Task fields: id, title, description, status (todo/doing/done), dueDate, userId</li>
  <li>Filter tasks by status: <code>GET /api/tasks?status=done</code></li>
  <li>Validation + consistent errors</li>
  <li>Persist users + tasks to separate JSON files</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("Express Docs", "https://expressjs.com/")} · ${externalLink("REST API design", "https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/")}</p>

<h3>Your task</h3>
<p>Run the starter, complete the missing endpoints (update, delete, filter), test the full flow, then add a <code>PATCH /api/tasks/:id</code> for partial updates and a 404 handler for unknown routes.</p>
`,
        initialCode: `// Node.js — Chapter 12 scratchpad (run with: node index.js)

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs").promises;
const path = require("path");
const app = express();
app.use(express.json());

const USERS = path.join(__dirname, "users.json");
const TASKS = path.join(__dirname, "tasks.json");
const SECRET = "dev-secret-change-in-prod";

async function readDB(file) { try { return JSON.parse(await fs.readFile(file, "utf-8")); } catch { return []; } }
async function writeDB(file, d) { await fs.writeFile(file, JSON.stringify(d, null, 2)); }

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing token" });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: "invalid token" }); }
}

// --- Auth (from Ch 11) ---
app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  const users = await readDB(USERS);
  if (users.find((u) => u.email === email)) return res.status(409).json({ error: "email exists" });
  const hash = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), email, password: hash };
  users.push(user);
  await writeDB(USERS, users);
  res.status(201).json({ data: { id: user.id, email: user.email } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const users = await readDB(USERS);
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: "invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1h" });
  res.json({ data: { token } });
});

// --- Tasks ---
app.get("/api/tasks", authMiddleware, async (req, res) => {
  const tasks = await readDB(TASKS);
  let mine = tasks.filter((t) => t.userId === req.user.id);
  if (req.query.status) mine = mine.filter((t) => t.status === req.query.status);
  res.json({ data: mine });
});

app.post("/api/tasks", authMiddleware, async (req, res) => {
  const { title, description, status, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });
  const tasks = await readDB(TASKS);
  const task = { id: Date.now(), title, description: description || "", status: status || "todo", dueDate: dueDate || null, userId: req.user.id };
  tasks.push(task);
  await writeDB(TASKS, tasks);
  res.status(201).json({ data: task });
});

// TODO: GET /api/tasks/:id, PUT /api/tasks/:id, DELETE /api/tasks/:id, PATCH /api/tasks/:id
// TODO: 404 handler for unknown routes

app.listen(3000, () => console.log("http://localhost:3000"));`,
        solution: `// Complete the TODOs:
// app.get("/api/tasks/:id", authMiddleware, async (req, res) => { ... })
// app.put("/api/tasks/:id", authMiddleware, async (req, res) => { ... })
// app.delete("/api/tasks/:id", authMiddleware, async (req, res) => { ... })
// app.patch("/api/tasks/:id", authMiddleware, async (req, res) => { ... })
// app.use((req, res) => res.status(404).json({ error: "Route not found" }))

// TypeScript/Node best practice: move to TypeScript + Drizzle + Neon for production`,
      },
      points_reward: 25,
    },
  ],
};
