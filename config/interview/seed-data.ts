export const categoriesData = [
  {
    name: "Software Engineer",
    slug: "software-engineer",
    description: "General software engineering concepts, OOP, system design, data structures, and algorithms.",
    icon: "💻",
    color: "text-blue-500",
    order_index: 1,
  },
  {
    name: "Frontend Engineer",
    slug: "frontend-engineer",
    description: "HTML, CSS, JavaScript, React, Angular, and browser concepts.",
    icon: "🎨",
    color: "text-sky-500",
    order_index: 2,
  },
  {
    name: "Backend Engineer",
    slug: "backend-engineer",
    description: "Server-side programming, APIs, databases, authentication, and scalability.",
    icon: "⚙️",
    color: "text-emerald-500",
    order_index: 3,
  },
  {
    name: "Fullstack Engineer",
    slug: "fullstack-engineer",
    description: "End-to-end development, frontend + backend integration, deployment, and DevOps.",
    icon: "🌐",
    color: "text-purple-500",
    order_index: 4,
  },
  {
    name: "DevOps Engineer",
    slug: "devops-engineer",
    description: "CI/CD, cloud infrastructure, containerization, monitoring, and automation.",
    icon: "🚀",
    color: "text-orange-500",
    order_index: 5,
  },
  {
    name: "QA Engineer",
    slug: "qa-engineer",
    description: "Testing methodologies, automation frameworks, bug tracking, and quality assurance.",
    icon: "🧪",
    color: "text-red-500",
    order_index: 6,
  },
];

export const questionsData: Record<string, { question: string; answer: string; difficulty: string; tags: string[]; is_top50: boolean }[]> = {
  "software-engineer": [
    {
      question: "What is the difference between an array and a linked list?",
      answer: "An array is a contiguous block of memory where elements are accessed by index in O(1) time, but insertion/deletion is O(n). A linked list consists of nodes with pointers — insertion/deletion is O(1) at known position, but access is O(n). Arrays have better cache locality; linked lists use more memory per element.",
      difficulty: "easy",
      tags: ["data-structures"],
      is_top50: true,
    },
    {
      question: "Explain the concept of Big O notation.",
      answer: "Big O notation describes the upper bound of an algorithm's time or space complexity as input size grows. It ignores constants and lower-order terms. Common complexities: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n), O(n²) quadratic, O(2ⁿ) exponential. It helps compare algorithm efficiency.",
      difficulty: "easy",
      tags: ["algorithms"],
      is_top50: true,
    },
    {
      question: "What is the difference between TCP and UDP?",
      answer: "TCP is connection-oriented, guarantees delivery, ensures ordering, and provides flow control — used for web browsing, email, file transfer. UDP is connectionless, faster, with no guarantee of delivery or ordering — used for streaming, gaming, DNS queries. TCP has higher overhead; UDP is lightweight.",
      difficulty: "medium",
      tags: ["networking"],
      is_top50: true,
    },
    {
      question: "Explain how a hash table works.",
      answer: "A hash table stores key-value pairs. A hash function maps each key to an index (bucket). Collisions are handled via chaining (linked list per bucket) or open addressing (probing). Average lookup is O(1), worst-case O(n) with many collisions. Good hash functions distribute keys uniformly.",
      difficulty: "medium",
      tags: ["data-structures"],
      is_top50: true,
    },
    {
      question: "What is the difference between processes and threads?",
      answer: "A process is an independent program with its own memory space (isolated). A thread is a lightweight unit of execution within a process, sharing memory with sibling threads. Processes are more expensive to create and switch between. Threads enable parallelism within a process but require synchronization.",
      difficulty: "medium",
      tags: ["operating-systems"],
      is_top50: true,
    },
    {
      question: "Explain the CAP theorem.",
      answer: "The CAP theorem states a distributed system can only provide two of three guarantees: Consistency (all nodes see the same data), Availability (every request gets a response), and Partition Tolerance (system works despite network failures). In practice, CP systems sacrifice availability during partitions; AP systems sacrifice consistency.",
      difficulty: "hard",
      tags: ["distributed-systems"],
      is_top50: true,
    },
    {
      question: "Describe the differences between REST and GraphQL.",
      answer: "REST uses fixed endpoints with HTTP methods; each endpoint returns a predefined data structure. GraphQL uses a single endpoint where clients specify exactly what fields they need. REST is simpler for basic CRUD; GraphQL reduces over-fetching/under-fetching. REST relies on HTTP caching; GraphQL requires custom caching.",
      difficulty: "medium",
      tags: ["api-design"],
      is_top50: true,
    },
    {
      question: "What is dependency injection and why use it?",
      answer: "Dependency injection is a design pattern where dependencies are provided (injected) to a class rather than the class creating them itself. Benefits: loose coupling, easier testing (mocking), improved maintainability, and configuration flexibility. Typically done via constructor injection or setter injection.",
      difficulty: "medium",
      tags: ["design-patterns"],
      is_top50: true,
    },
    {
      question: "What is the difference between an interface and an abstract class in Java?",
      answer: "An interface provides 100% abstraction and allows multiple inheritance, while an abstract class is partially abstract and can contain normal methods and state. Interfaces cannot have constructors, but abstract classes can. Choose an interface when defining capability (behavior) and an abstract class when defining a base template for subclasses.",
      difficulty: "medium",
      tags: ["oop", "design-patterns"],
      is_top50: true,
    },
    {
      question: "What is hoisting in JavaScript?",
      answer: "Hoisting is JavaScript's behavior of moving declarations to the top of their scope before execution. var gets hoisted and initialized with undefined, but let and const are hoisted without initialization, causing a ReferenceError if used before declaration (Temporal Dead Zone).",
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is the difference between == and === in JavaScript?",
      answer: "== compares values after type coercion, while === compares both value and type without conversion. For example, '5' == 5 is true, but '5' === 5 is false. Always use === in modern JavaScript to avoid unexpected behavior from automatic type conversion.",
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "Explain the Event Loop in JavaScript.",
      answer: "The event loop allows JavaScript to run asynchronous operations even though it is single-threaded. It moves callbacks from the microtask queue (Promises) and macrotask queue (setTimeout, DOM events) to the call stack when the stack is empty, enabling non-blocking behavior. Execution order: synchronous code → microtasks → macrotasks.",
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is the Java Stream API and when do we use it?",
      answer: "Stream API provides a functional way to process data in collections using operations like filter, map, reduce, and collect. Benefits include less boilerplate, parallel processing capability, and easy chaining of operations. It allows writing clean, declarative code for data manipulation tasks.",
      difficulty: "medium",
      tags: ["java", "functional"],
      is_top50: true,
    },
    {
      question: "What is the difference between synchronous and asynchronous JavaScript?",
      answer: "Synchronous code blocks execution until it finishes, executing line by line. Asynchronous code allows the program to continue running by pushing long operations to the event loop. JavaScript uses callbacks, Promises, and async/await to handle async tasks without blocking the main thread.",
      difficulty: "medium",
      tags: ["javascript", "concurrency"],
      is_top50: true,
    },
    {
      question: "What is the difference between monolithic and microservices architecture?",
      answer: "A monolithic architecture keeps the entire application in one codebase and is easy to build initially but hard to scale. Microservices break the system into small independent services with their own databases, allowing faster deployment, better fault isolation, and independent scaling.",
      difficulty: "hard",
      tags: ["architecture", "system-design"],
      is_top50: false,
    },
    {
      question: "What is the difference between SQL and NoSQL databases?",
      answer: "SQL databases store structured data in tables with predefined schemas and ensure ACID compliance. NoSQL databases store unstructured or semi-structured data (documents, key-value, graphs) and scale horizontally more easily. SQL is ideal for relational data and complex queries; NoSQL works best for flexible schemas and high-scale applications.",
      difficulty: "medium",
      tags: ["databases"],
      is_top50: true,
    },
    {
      question: "What is Garbage Collection in Java?",
      answer: "Garbage Collection is Java's automatic memory management mechanism that removes unused or unreachable objects from the heap, preventing memory leaks. Common GC implementations include Serial GC, Parallel GC, and G1 GC (modern default). Developers don't need manual memory management.",
      difficulty: "medium",
      tags: ["java", "memory-management"],
      is_top50: true,
    },
    {
      question: "What is polymorphism in OOP?",
      answer: "Polymorphism allows one method or interface to behave differently based on context. Compile-time polymorphism (method overloading) uses the same method name with different parameters. Runtime polymorphism (method overriding) lets a child class override a parent class method. This improves flexibility and reusability.",
      difficulty: "easy",
      tags: ["oop", "design-patterns"],
      is_top50: true,
    },
    {
      question: "What is the difference between map() and forEach() in JavaScript?",
      answer: "map() returns a new array after transforming each element, making it ideal for creating new data structures. forEach() is used only for iteration and returns nothing (undefined). map() is chainable and follows functional programming principles; forEach() is typically used for side effects.",
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is the difference between == and .equals() in Java?",
      answer: "In Java, == compares memory addresses (reference equality), while .equals() compares values/content. For example, comparing two String objects with the same content using == returns false, but .equals() returns true. Most classes override .equals() for content-based comparison. Improper usage causes logic bugs, especially in Strings and Collections.",
      difficulty: "medium",
      tags: ["java", "oop"],
      is_top50: true,
    },
    {
      question: "What are Promises in JavaScript and why do we need them?",
      answer: "Promises handle asynchronous operations without callback hell. A Promise has three states: pending, fulfilled, and rejected. Promises provide cleaner async code with .then() and .catch() for error handling, and work seamlessly with async/await syntax.",
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "How does the Event Loop handle microtasks and macrotasks?",
      answer: "After each macrotask (setTimeout, DOM events, I/O), the event loop processes all microtasks (Promise.then, queueMicrotask, MutationObserver) before proceeding to the next macrotask. This ensures Promise callbacks execute promptly. Example: a Promise resolves before the next setTimeout callback runs.",
      difficulty: "hard",
      tags: ["javascript"],
      is_top50: false,
    },
  ],
  "frontend-engineer": [
    // ──────── HTML & The DOM ────────
    {
      question: "What is the purpose of the DOCTYPE declaration in HTML?",
      answer: `The DOCTYPE declaration (\`<!DOCTYPE html>\`) is a required preamble that tells the browser which version of HTML to expect. In modern HTML5, \`<!DOCTYPE html>\` triggers **standards mode**, ensuring the page is rendered according to CSS and HTML specifications. Without it, browsers fall back to **quirks mode**, emulating old IE5-era behavior which causes inconsistent layouts, broken box models, and unpredictable rendering.

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Standards Mode</title>
</head>
<body>
  <p>This page renders in standards mode.</p>
</body>
</html>
\`\`\`

The DOCTYPE is not an HTML element or tag — it is a declaration that must appear at the very top of the document, before the \`<html>\` element. In legacy HTML versions (HTML 4.01), the DOCTYPE referenced a DTD (Document Type Definition), but HTML5 simplified it to a single, memorizable form.

**Key Takeaway:** Always include \`<!DOCTYPE html>\` as the first line of every HTML document to guarantee consistent cross-browser rendering.`,
      difficulty: "easy",
      tags: ["html", "document-structure"],
      is_top50: true,
    },
    {
      question: "What are the essential elements of an HTML document structure?",
      answer: `Every valid HTML document follows a standard structure comprising four essential sections:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document Title</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header>Page Header</header>
  <main>
    <article>Primary Content</article>
  </main>
  <footer>Page Footer</footer>
  <script src="app.js"></script>
</body>
</html>
\`\`\`

| Element | Purpose |
|---------|---------|
| \`<!DOCTYPE html>\` | Triggers standards mode |
| \`<html>\` | Root element; the \`lang\` attribute is critical for accessibility and SEO |
| \`<head>\` | Container for metadata — character set, viewport, title, stylesheets, SEO meta tags |
| \`<body>\` | Contains all visible content rendered by the browser |

The \`<head>\` section must include \`<meta charset="UTF-8">\` for proper text encoding and a \`<title>\` for accessibility and SEO. The \`<body>\` should follow a logical document outline using semantic elements.`,
      difficulty: "easy",
      tags: ["html", "document-structure"],
      is_top50: true,
    },
    {
      question: "What meta tags are essential for SEO and responsive design?",
      answer: `Meta tags provide structured metadata about the HTML document. The most critical ones are:

\`\`\`html
<!-- Character encoding — must be in first 1024 bytes -->
<meta charset="UTF-8" />

<!-- Viewport for responsive design -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<!-- SEO: description (used in search snippet) -->
<meta name="description" content="A concise description of the page content, 150-160 characters." />

<!-- SEO: robots (indexing instructions) -->
<meta name="robots" content="index, follow" />

<!-- Open Graph for social sharing -->
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Social share description" />
<meta property="og:image" content="https://example.com/thumbnail.jpg" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />

<!-- Canonical URL (prevents duplicate content issues) -->
<link rel="canonical" href="https://example.com/page" />
\`\`\`

The viewport meta tag (\`width=device-width, initial-scale=1.0\`) is **required** for mobile-responsive pages — without it, mobile browsers render the page at a desktop width and zoom out, making text unreadable. The \`description\` meta tag directly influences click-through rates from search engine results.`,
      difficulty: "easy",
      tags: ["html", "meta", "seo"],
      is_top50: true,
    },
    {
      question: "How do you include CSS and JavaScript in an HTML document?",
      answer: `CSS and JavaScript are included via the \`<link>\` and \`<script>\` elements respectively, with specific placement rules:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- CSS: <link> in <head> blocks rendering but prevents FOUC -->
  <link rel="stylesheet" href="styles.css" />

  <!-- Alternative: inline critical CSS for above-the-fold content -->
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; }
    header { background: #1a1a2e; color: white; padding: 1rem; }
  </style>

  <!-- Preload key resources -->
  <link rel="preload" href="hero.webp" as="image" />
</head>
<body>
  <!-- Page content -->

  <!-- JavaScript: <script> at end of <body> to not block HTML parsing -->
  <!-- Without defer/async, JS blocks DOM construction -->
  <script src="app.js"></script>

  <!-- Or: using defer (preserves order, downloads while parsing) -->
  <script defer src="analytics.js"></script>

  <!-- Or: using async (downloads while parsing, executes as soon as ready) -->
  <script async src="widget.js"></script>
</body>
</html>
\`\`\`

**Best practices:**
- CSS goes in the \`<head>\` to start downloading early and prevent FOUC (Flash of Unstyled Content)
- Inline critical CSS in a \`<style>\` tag to avoid render-blocking requests for above-the-fold content
- Scripts without \`defer\` or \`async\` block HTML parsing — place them just before \`</body>\`
- Use \`defer\` for scripts that need DOM access and execution order
- Use \`async\` for independent scripts (analytics, ads) where execution order doesn't matter`,
      difficulty: "medium",
      tags: ["html", "performance", "css", "javascript"],
      is_top50: true,
    },
    {
      question: "What are semantic HTML elements and why are they important?",
      answer: `Semantic HTML elements clearly describe their meaning to both the browser and developer. Unlike generic \`<div>\` and \`<span>\`, semantic elements convey the role and structure of content:

\`\`\`html
<!-- ❌ Non-semantic (div soup) -->
<div class="header">
  <div class="nav"><a href="/">Home</a></div>
</div>
<div class="main">
  <div class="article">
    <div class="section">Content here</div>
  </div>
</div>

<!-- ✅ Semantic -->
<header>
  <nav><a href="/">Home</a></nav>
</header>
<main>
  <article>
    <section>Content here</section>
  </article>
</main>
\`\`\`

**Key semantic elements and their purposes:**

| Element | Meaning |
|---------|---------|
| \`<header>\` | Introductory content or navigational aids |
| \`<nav>\` | Navigation links |
| \`<main>\` | Dominant content (one per page) |
| \`<section>\` | Thematic grouping of content |
| \`<article>\` | Self-contained composition (blog post, news story) |
| \`<aside>\` | Content indirectly related (sidebar, pull quote) |
| \`<footer>\` | Footer for nearest section |
| \`<figure>\` / \`<figcaption>\` | Self-contained media with caption |

**Benefits of semantic HTML:**
- **Accessibility:** Screen readers and assistive technologies use element semantics to navigate (e.g., jumping from landmark to landmark)
- **SEO:** Search engines understand content structure and assign higher relevance to properly structured content
- **Maintainability:** Code is self-documenting and easier for teams to understand
- **Future-proof:** Browsers provide default styles and behaviors for semantic elements`,
      difficulty: "easy",
      tags: ["html", "semantic-html", "accessibility"],
      is_top50: true,
    },
    {
      question: "Explain the purpose of HTML5 semantic elements: header, nav, main, section, article, aside, footer.",
      answer: `HTML5 introduced a set of semantic elements that define the structure of a web page more meaningfully than generic \`<div>\` elements. Here's how each is used:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Semantic HTML Example</title>
</head>
<body>
  <header>
    <h1>My Blog</h1>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <header>
        <h2>Article Title</h2>
        <time datetime="2025-03-15">March 15, 2025</time>
      </header>
      <section>
        <h3>Introduction</h3>
        <p>Opening paragraph of the article.</p>
      </section>
      <section>
        <h3>Key Points</h3>
        <p>Detailed content organized in sections.</p>
      </section>
      <footer>
        <p>Tags: <a href="/tag/html">HTML</a></p>
      </footer>
    </article>

    <aside>
      <h3>Related Articles</h3>
      <ul>
        <li><a href="/post/1">How CSS Grid Works</a></li>
        <li><a href="/post/2">JavaScript Fundamentals</a></li>
      </ul>
    </aside>
  </main>

  <footer>
    <p>&copy; 2025 My Blog. All rights reserved.</p>
  </footer>
</body>
</html>
\`\`\`

**Important rules:**
- Use \`<main>\` only **once** per page — it wraps the primary content
- \`<nav>\` is for major navigation blocks (not all link groups)
- \`<article>\` is self-contained and can be syndicated independently
- \`<section>\` should have a heading (h1-h6) as a child
- \`<aside>\` contains content tangentially related to the surrounding content
- \`<header>\` and \`<footer>\` can be used within both page-level and sectioning elements`,
      difficulty: "easy",
      tags: ["html", "semantic-html"],
      is_top50: true,
    },
    {
      question: "What is the purpose of the <figure> and <figcaption> elements?",
      answer: `The \`<figure>\` element represents self-contained content, such as illustrations, diagrams, code snippets, or photos, optionally with a caption (\`<figcaption>\`). It creates a semantic association between the media and its description:

\`\`\`html
<!-- Image with caption -->
<figure>
  <img src="architecture-diagram.png"
       alt="System architecture showing microservices connected via API gateway" />
  <figcaption>Figure 1: Microservices architecture overview with API Gateway, service mesh, and database per service.</figcaption>
</figure>

<!-- Code snippet with caption -->
<figure>
  <pre><code>
function greet(name) {
  return \`Hello, \${name}!\`;
}
  </code></pre>
  <figcaption>Example 2: A simple JavaScript greeting function.</figcaption>
</figure>

<!-- Multiple images in one figure -->
<figure>
  <img src="before.jpg" alt="UI before redesign" />
  <img src="after.jpg" alt="UI after redesign" />
  <figcaption>Before and after the UI redesign — note the improved spacing and contrast.</figcaption>
</figure>

<!-- Pull quote with citation -->
<figure>
  <blockquote>
    <p>The best way to predict the future is to invent it.</p>
  </blockquote>
  <figcaption>— Alan Kay, <cite>computer scientist</cite></figcaption>
</figure>
\`\`\`

**Key points:**
- \`<figure>\` can be moved to the side of a page (like a pull quote) without affecting the main content flow
- \`<figcaption>\` can appear as the first or last child of \`<figure>\`
- The \`<figcaption>\` is not required — a \`<figure>\` can exist without it
- Unlike a plain \`<div>\`, \`<figure>\` creates a semantic landmark, improving accessibility and SEO`,
      difficulty: "easy",
      tags: ["html", "semantic-html"],
      is_top50: true,
    },
    {
      question: "Explain the <details> and <summary> elements.",
      answer: `The \`<details>\` element creates a disclosure widget that users can toggle open and closed. The \`<summary>\` element provides the visible label for the widget. This is a pure HTML way to create expand/collapse interactions without JavaScript:

\`\`\`html
<!-- Basic usage -->
<details>
  <summary>What is the difference between let and const?</summary>
  <p><code>let</code> allows reassignment while <code>const</code> does not. However, <code>const</code> does not make objects immutable — it prevents reassignment of the variable binding, not the value itself.</p>
</details>

<!-- Open by default -->
<details open>
  <summary>Frequently Asked Questions</summary>
  <ul>
    <li><strong>Q:</strong> How do I open this by default? <strong>A:</strong> Add the <code>open</code> attribute.</li>
    <li><strong>Q:</strong> Can I style it? <strong>A:</strong> Yes, using CSS and the <code>::marker</code> pseudo-element.</li>
  </ul>
</details>

<!-- Nested details -->
<details>
  <summary>HTML Topics</summary>
  <details>
    <summary>Semantic Elements</summary>
    <p>Elements like <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code> give meaning to structure.</p>
  </details>
  <details>
    <summary>Forms</summary>
    <p>Forms handle user input with validation, submission, and various input types.</p>
  </details>
</details>
\`\`\`

**Key behaviors:**
- The widget has two states: closed (default) and open (with the \`open\` attribute)
- The \`<summary>\` is always visible — click it to toggle
- The arrow icon (▶ / ▼) can be styled using \`summary::marker\` or removed with \`summary::marker { display: none; }\`
- \`<details>\` fires a \`toggle\` event when its state changes
- Nesting \`<details>\` elements creates an accordion-like experience, though each panel toggles independently

This is the only native HTML widget that provides show/hide behavior without any JavaScript, making it ideal for FAQs, documentation, and progressive disclosure patterns.`,
      difficulty: "easy",
      tags: ["html", "semantic-html"],
      is_top50: true,
    },
    {
      question: "Explain the difference between innerHTML, textContent, and innerText.",
      answer: `These three properties read and write content inside an element, but they behave very differently:

\`\`\`html
<div id="demo">
  <p>Hello <span style="display: none;">hidden</span> world!</p>
  <!-- comment -->
</div>
\`\`\`

\`\`\`javascript
const el = document.getElementById("demo");

// innerHTML — returns/sets HTML markup, including tags
// ⚠️ Security risk: when setting, can execute XSS if content is user-provided
console.log(el.innerHTML);
// "<p>Hello <span style="display: none;">hidden</span> world!</p>\n  <!-- comment -->\n"
el.innerHTML = "<strong>Safe</strong> content"; // Replaces all child content

// textContent — returns ALL text, including hidden elements and script/style content
// Ignores HTML tags. Best for performance and security.
console.log(el.textContent);
// "Hello hidden world!\n  "
el.textContent = "Replaced text"; // Sets plain text (HTML is escaped)

// innerText — returns VISIBLE text only, respects CSS (triggers reflow)
// Slow — forces a layout recalculation
console.log(el.innerText);
// "Hello  world!"  (the "hidden" text is excluded because display: none)
el.innerText = "Visible text"; // Sets visible text
\`\`\`

| Behavior | innerHTML | textContent | innerText |
|----------|-----------|-------------|-----------|
| Returns HTML markup | ✅ Yes | ❌ No | ❌ No |
| Returns hidden text | ✅ Yes | ✅ Yes | ❌ No |
| CSS-aware (reflow) | ❌ No | ❌ No | ✅ Yes |
| XSS risk when setting | ⚠️ High | ✅ Safe | ✅ Safe |
| Performance | Medium | Fastest | Slowest |
| Preserves whitespace | ✅ | ✅ | ❌ (normalized) |

**Best practice:** Use \`textContent\` for reading/setting plain text (fast, safe). Use \`innerHTML\` only when you intentionally need to parse HTML from trusted sources. Never use \`innerHTML\` with user-provided input without sanitization (use DOMPurify or similar).`,
      difficulty: "medium",
      tags: ["html", "dom", "javascript"],
      is_top50: true,
    },
    {
      question: "What is the DOMContentLoaded event and how is it different from the load event?",
      answer: `The \`DOMContentLoaded\` and \`load\` events fire at different points in the page lifecycle:

\`\`\`javascript
// Fires when the HTML is fully parsed and the DOM tree is built
// CSS stylesheets, images, and subframes may still be loading
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM is ready — safe to query/manipulate elements");
  document.getElementById("app").textContent = "DOM loaded";
});

// Fires when ALL resources (images, stylesheets, scripts, iframes) have loaded
window.addEventListener("load", () => {
  console.log("Everything loaded — images, fonts, and stylesheets are ready");
  // Measure actual image dimensions, run performance audits
  const images = document.images;
  console.log(\`\${images.length} images loaded\`);
});

// Useful for checking document ready state
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp(); // DOMContentLoaded already fired
}
\`\`\`

**Timeline:**
1. HTML parsing begins
2. \`<script>\` (without \`defer\`/async) blocks parsing → script downloads & executes
3. HTML parsing completes → **\`DOMContentLoaded\` fires** (after deferred scripts execute)
4. Images, stylesheets, fonts finish downloading → **\`load\` fires**

**When to use which:**
- Use \`DOMContentLoaded\` to initialize UI (attach event handlers, render components) — it fires earlier, improving perceived performance
- Use \`load\` for measuring page performance (Web Vitals), tracking image dimensions, or actions that depend on all media being present
- Scripts with \`defer\` execute before \`DOMContentLoaded\`; scripts with \`async\` may execute before or after`,
      difficulty: "medium",
      tags: ["html", "dom", "performance"],
      is_top50: true,
    },
    {
      question: "How do you create, append, and remove DOM elements dynamically?",
      answer: `DOM manipulation is fundamental to dynamic web applications. Here are the modern approaches:

\`\`\`javascript
// ── Creating elements ──

// Method 1: createElement + setAttribute (preferred)
const div = document.createElement("div");
div.textContent = "Hello, world!";
div.className = "card";
div.setAttribute("data-id", "42");

// Method 2: innerHTML (⚠️ XSS risk with untrusted content)
const container = document.getElementById("app");
container.innerHTML = '<p class="warning">Fast but unsafe with user input</p>';

// Method 3: insertAdjacentHTML (safer than innerHTML, doesn't remove existing content)
container.insertAdjacentHTML("beforeend", '<span class="badge">New</span>');

// ── Appending elements ──

const parent = document.getElementById("list");
const item = document.createElement("li");
item.textContent = "Item 1";

parent.appendChild(item);          // Appends as last child
parent.prepend(item.cloneNode(true)); // Inserts as first child
parent.insertBefore(item.cloneNode(true), parent.children[1]); // Before specific child
parent.append(item.cloneNode(true), "some text"); // Modern: appends nodes + strings

// ── Removing elements ──

// Method 1: remove() — modern, no parent reference needed
item.remove();

// Method 2: removeChild — requires parent
parent.removeChild(parent.lastElementChild);

// Method 3: replaceChild
const newItem = document.createElement("li");
newItem.textContent = "Replacement";
parent.replaceChild(newItem, parent.children[0]);

// ── Working with DocumentFragments (batched appends) ──

const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement("li");
  li.textContent = \`Item \${i}\`;
  fragment.appendChild(li);
}
parent.appendChild(fragment); // Single reflow instead of 1000
\`\`\`

**Performance tips:**
- Batch DOM operations using \`DocumentFragment\` or a detached clone
- Minimize layout thrashing — read then write, don't interleave
- Use \`element.remove()\` over \`parent.removeChild()\` for cleaner code
- For large-scale DOM updates, consider virtual DOM libraries (React) or innerHTML`,
      difficulty: "medium",
      tags: ["html", "dom", "javascript"],
      is_top50: true,
    },
    {
      question: "What is the difference between event bubbling and event capturing?",
      answer: `Event propagation in the DOM happens in three phases: **capturing**, **target**, and **bubbling**. Understanding these phases is critical for debugging event handling and implementing patterns like event delegation.

\`\`\`html
<div id="grandparent">
  <div id="parent">
    <button id="child">Click me</button>
  </div>
</div>
\`\`\`

\`\`\`javascript
// Capturing phase (root → target) — third argument: true
document.getElementById("grandparent").addEventListener("click", () => {
  console.log("Grandparent (capturing)");
}, true);

document.getElementById("parent").addEventListener("click", () => {
  console.log("Parent (capturing)");
}, true);

// Target phase
document.getElementById("child").addEventListener("click", () => {
  console.log("Child (target)");
});

// Bubbling phase (target → root) — default (capture: false)
document.getElementById("parent").addEventListener("click", () => {
  console.log("Parent (bubbling)");
});

document.getElementById("grandparent").addEventListener("click", () => {
  console.log("Grandparent (bubbling)");
});

// Clicking the button outputs:
// Grandparent (capturing)
// Parent (capturing)
// Child (target)
// Parent (bubbling)
// Grandparent (bubbling)
\`\`\`

**Event flow diagram:**
\`\`\`
        Capturing              Bubbling
  window     ←     ←     ←     window
    ↓                         ↑
  document  ←     ←     ←   document
    ↓                         ↑
  html      ←     ←     ←    html
    ↓                         ↑
  body      ←     ←     ←    body
    ↓                         ↑
  parent     →  target  →    parent
\`\`\`

**Key concepts:**
- **Capturing phase:** Events travel from \`window\` down to the target element (use \`addEventListener(type, handler, true)\`)
- **Target phase:** The event reaches the element that triggered it
- **Bubbling phase:** Events travel back up from target to \`window\` (default behavior)
- Not all events bubble: \`focus\`, \`blur\`, \`mouseenter\`, \`mouseleave\`, \`scroll\`, \`load\`, \`error\`, \`reset\`, \`submit\` do not bubble
- **Event delegation** leverages bubbling: attach one listener to a parent to handle events from all (current and future) children

\`\`\`javascript
// Event delegation example — single listener for all list items
document.querySelector("#list").addEventListener("click", (event) => {
  const li = event.target.closest("li");
  if (li) {
    console.log("Clicked item:", li.textContent);
  }
});
\`\`\``,
      difficulty: "medium",
      tags: ["html", "dom", "events", "javascript"],
      is_top50: true,
    },
    {
      question: "What properties does the event object contain?",
      answer: `When an event fires, an \`Event\` object is passed to the handler. The properties available depend on the event type, but these are the most commonly used:

\`\`\`javascript
document.querySelector("button").addEventListener("click", (event) => {
  // ── Core properties (all events) ──
  event.type;           // "click", "keydown", "submit", etc.
  event.target;         // Element that triggered the event (origin)
  event.currentTarget;  // Element the listener is attached to (may differ from target due to bubbling)
  event.eventPhase;     // 1=capturing, 2=at target, 3=bubbling
  event.bubbles;        // Whether the event bubbles
  event.cancelable;     // Whether preventDefault() works
  event.defaultPrevented; // Was preventDefault() called?
  event.timeStamp;      // Time (in ms) from navigation start to event creation
  event.isTrusted;      // true = user action, false = dispatched by script

  // ── Mouse / Pointer events ──
  event.clientX;        // X coordinate relative to viewport
  event.clientY;        // Y coordinate relative to viewport
  event.pageX;          // X coordinate relative to document
  event.pageY;          // Y coordinate relative to document
  event.screenX;        // X coordinate relative to screen
  event.screenY;        // Y coordinate relative to screen
  event.button;         // 0=left, 1=middle, 2=right
  event.buttons;        // Bitmask of pressed buttons
  event.ctrlKey;        // Was Ctrl held?
  event.shiftKey;       // Was Shift held?
  event.altKey;         // Was Alt held?
  event.metaKey;        // Was Cmd (Mac) / Win key held?

  // ── Keyboard events ──
  event.key;            // "Enter", "a", "ArrowUp", "Escape"
  event.code;           // "KeyA", "Digit1", "ArrowUp" (physical key position)
  event.repeat;         // true if key is being held down

  // ── Touch events ──
  event.touches;        // List of all current touch points
  event.changedTouches; // Touches that changed in this event
  event.targetTouches;  // Touches on the target element

  // ── Focus events ──
  event.relatedTarget;  // Element losing focus (blur) or gaining focus (focus)

  // ── Drag events ──
  event.dataTransfer;   // Data being dragged (set during dragstart)
});

// Utility methods
event.preventDefault();   // Prevents default browser behavior (form submit, link navigate)
event.stopPropagation();  // Stops further event propagation (bubbling and capturing)
event.stopImmediatePropagation(); // Also prevents other listeners on the same element
\`\`\`

**Practical example:**
\`\`\`javascript
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    saveDocument();
  }
});
\`\`\``,
      difficulty: "easy",
      tags: ["html", "dom", "events", "javascript"],
      is_top50: true,
    },
    {
      question: "How do you stop event propagation and prevent default browser behavior?",
      answer: `Two methods control event behavior: \`stopPropagation()\` stops the event from traveling further, while \`preventDefault()\` cancels the browser's default action. Understanding the difference is critical:

\`\`\`javascript
document.querySelector("a").addEventListener("click", (e) => {
  // ❌ Prevents the browser from navigating to the href
  e.preventDefault();

  // ✅ Now we handle navigation manually via JavaScript
  navigateViaSPA(e.target.href);
});

document.querySelector(".modal-backdrop").addEventListener("click", (e) => {
  // ❌ Prevents the click from bubbling up to document/window
  e.stopPropagation();
  closeModal();
});

// The child modal should not close when clicking inside it
document.querySelector(".modal-content").addEventListener("click", (e) => {
  e.stopPropagation(); // Click inside modal doesn't reach the backdrop
});
\`\`\`

**Key differences:**

| Method | Effect | Stops other listeners on same element? |
|--------|--------|---------------------------------------|
| \`preventDefault()\` | Cancels default browser action (link nav, form submit, scroll) | ❌ No |
| \`stopPropagation()\` | Prevents event from reaching other elements (bubbling/capturing) | ❌ No |
| \`stopImmediatePropagation()\` | Prevents propagation AND stops other listeners on the same element | ✅ Yes |

\`\`\`javascript
// stopImmediatePropagation example
element.addEventListener("click", () => console.log("First listener"));
element.addEventListener("click", (e) => {
  e.stopImmediatePropagation(); // Third listener never runs
  console.log("Second listener");
});
element.addEventListener("click", () => console.log("Third listener")); // Never called
\`\`\`

**Common use cases:**
- \`preventDefault()\` on form submit to use fetch API instead of page reload
- \`preventDefault()\` on \`<a>\` links for client-side routing
- \`preventDefault()\` on \`contextmenu\` to create custom right-click menus
- \`stopPropagation()\` on nested clickable elements (modal, dropdown menu)
- \`stopImmediatePropagation()\` for emergency stop in critical error handlers`,
      difficulty: "medium",
      tags: ["html", "dom", "events", "javascript"],
      is_top50: true,
    },
    {
      question: "What are custom events and how do you create and dispatch them?",
      answer: `Custom events allow you to define your own event types and dispatch them on any DOM element. This is essential for decoupled component communication:

\`\`\`javascript
// ── Creating a custom event ──

// Method 1: CustomEvent constructor (recommended — supports detail/data)
const userEvent = new CustomEvent("user:login", {
  detail: { userId: 42, username: "alice", role: "admin" },
  bubbles: true,      // Whether the event bubbles up the DOM tree
  cancelable: true,    // Whether preventDefault() works
  composed: true,      // Whether the event crosses shadow DOM boundaries
});

// Method 2: Event constructor (simpler, no detail)
const simpleEvent = new Event("app:ready", { bubbles: true });

// ── Dispatching events ──

const button = document.querySelector("#login-btn");
button.dispatchEvent(userEvent); // Dispatches on the button, then bubbles

// ── Listening for custom events ──

document.addEventListener("user:login", (event) => {
  const { userId, username } = event.detail;
  console.log(\`User \${username} (\${userId}) logged in\`);
  updateUI(event.detail);
});

// ── Practical example: form validation event ──

class FormValidator extends HTMLElement {
  connectedCallback() {
    this.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const errors = this.validate();
      if (errors.length > 0) {
        this.dispatchEvent(new CustomEvent("validation:error", {
          detail: { errors },
          bubbles: true,
        }));
      } else {
        this.dispatchEvent(new CustomEvent("validation:success", {
          detail: { data: this.getFormData() },
          bubbles: true,
        }));
      }
    });
  }
}
customElements.define("form-validator", FormValidator);
\`\`\`

**Why use custom events?**
- Enables **pub/sub communication** between loosely coupled components
- Works across **shadow DOM boundaries** with \`composed: true\`
- Provides a clean alternative to callback props in vanilla JS component systems
- Standard \`preventDefault()\` and \`stopPropagation()\` work as expected`,
      difficulty: "medium",
      tags: ["html", "dom", "events", "javascript"],
      is_top50: true,
    },
    {
      question: "Explain the addEventListener method and its options parameter.",
      answer: `\`addEventListener\` is the modern, preferred way to register event handlers. Its third parameter accepts either a boolean (for capturing) or an options object for fine-grained control:

\`\`\`javascript
// ── Syntax ──
element.addEventListener(type, listener, options);
element.addEventListener(type, listener, useCapture);

// ── Options object ──
element.addEventListener("click", handleClick, {
  capture: false,      // If true, listener runs in capturing phase (default: false)
  once: true,          // If true, listener auto-removes after first invocation
  passive: true,       // If true, promises not to call preventDefault() — enables scroll optimization
  signal: abortSignal, // Associates listener with an AbortSignal for cleanup
});

// ── Practical examples ──

// once: fire a handler only once (no need to manually removeEventListener)
const btn = document.querySelector("#confirm");
btn.addEventListener("click", () => {
  console.log("Confirmed — this runs only once");
}, { once: true });

// passive: optimize scroll performance (cannot call preventDefault)
document.addEventListener("touchstart", (e) => {
  // Do NOT call e.preventDefault() here — browser warning if you do
  updateTouchIndicator(e.touches[0]);
}, { passive: true });

// signal: clean up multiple listeners at once
const controller = new AbortController();
const { signal } = controller;

window.addEventListener("resize", handleResize, { signal });
document.addEventListener("visibilitychange", handleVisibility, { signal });
element.addEventListener("scroll", handleScroll, { signal });

// Later: remove ALL three listeners at once
controller.abort(); // Cleaner than three removeEventListener calls

// ── Comparing with older patterns ──

// ❌ Inline HTML event handlers (avoid)
<button onclick="handleClick()">Click</button>

// ❌ DOM 0 property (only one handler allowed)
element.onclick = handleClick;

// ✅ addEventListener (multiple handlers, fine-grained control)
element.addEventListener("click", handleClick);
element.addEventListener("click", anotherHandler); // Both run
\`\`\`

**Key benefits of addEventListener over older approaches:**
- Multiple listeners for the same event type on the same element
- Fine-grained capture/bubble control
- Options for one-time, passive, and abortable listeners
- Works with any event type, including custom events`,
      difficulty: "medium",
      tags: ["html", "dom", "events", "javascript"],
      is_top50: true,
    },
    {
      question: "How does HTML form validation work without JavaScript?",
      answer: `HTML5 provides built-in form validation triggered before form submission. It works entirely with HTML attributes, requiring no JavaScript:

\`\`\`html
<form id="signup" action="/api/signup" method="POST">
  <!-- required: field must have a value -->
  <label for="name">Name *</label>
  <input type="text" id="name" name="name" required />

  <!-- type="email": browser validates email format -->
  <label for="email">Email *</label>
  <input type="email" id="email" name="email" required />

  <!-- type="url": browser validates URL format -->
  <label for="website">Website</label>
  <input type="url" id="website" name="website" placeholder="https://example.com" />

  <!-- pattern: regex validation — must be a valid phone format -->
  <label for="phone">Phone (XXX-XXX-XXXX)</label>
  <input type="tel" id="phone" name="phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
         placeholder="555-123-4567" title="Format: XXX-XXX-XXXX" />

  <!-- min, max, step for numeric inputs -->
  <label for="age">Age (18-120)</label>
  <input type="number" id="age" name="age" min="18" max="120" step="1" required />

  <!-- minlength, maxlength for text inputs -->
  <label for="username">Username (3-20 characters)</label>
  <input type="text" id="username" name="username" minlength="3" maxlength="20" required />

  <!-- Custom validation error via constraint validation API -->
  <label for="password">Password *</label>
  <input type="password" id="password" name="password" required minlength="8" />

  <button type="submit">Sign Up</button>
</form>
\`\`\`

**Browser behavior when validation fails:**
1. The \`invalid\` event fires on the first invalid field
2. The browser shows a validation message bubble (stylable via \`::validation-message\` pseudo-element)
3. The form is **not submitted** — the user must fix the errors

**Constraint Validation API (JavaScript enhancement — not required for basic validation):**
\`\`\`javascript
const form = document.querySelector("#signup");
const email = document.querySelector("#email");

// Check validity programmatically
email.checkValidity();        // Returns true/false
email.reportValidity();       // Checks validity AND shows the validation message
email.validity.valid;         // true if the field passes all constraints
email.validity.valueMissing;  // true if required and empty
email.validity.typeMismatch;  // true if value doesn't match the input type
email.validity.patternMismatch; // true if value doesn't match pattern attribute
email.validity.rangeUnderflow; // true if value < min
email.validity.rangeOverflow;  // true if value > max
email.validity.tooShort;       // true if length < minlength
email.validity.tooLong;        // true if length > maxlength

// Custom validation message
email.setCustomValidity("");  // Clear custom error
if (email.value.endsWith("@example.com")) {
  email.setCustomValidity("Temporary email addresses are not allowed");
}
\`\`\`

**CSS pseudo-classes for styling:**
\`\`\`css
input:invalid { border-color: #e74c3c; }
input:valid { border-color: #2ecc71; }
input:focus:invalid { box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.3); }
input:user-invalid { /* Firefox: user interacted and value is invalid */
  background: #fff0f0;
}
\`\`\``,
      difficulty: "medium",
      tags: ["html", "forms", "validation"],
      is_top50: true,
    },
    {
      question: "What are the different input types in HTML5 and when should you use each?",
      answer: `HTML5 introduced several new input types that provide specialized keyboard, validation, and user experience enhancements:

\`\`\`html
<form>
  <!-- Text inputs -->
  <input type="text" />         <!-- Default — generic text -->
  <input type="search" />       <!-- Search field (may show clear button) -->
  <input type="tel" />          <!-- Telephone — shows numeric keypad on mobile -->
  <input type="url" />          <!-- URL — validates format, shows .com key on mobile -->
  <input type="email" />        <!-- Email — validates format, shows @ key on mobile -->
  <input type="password" />     <!-- Password — masks input -->

  <!-- Numeric inputs -->
  <input type="number" />       <!-- Numbers with stepper — shows numeric keypad -->
  <input type="range" />        <!-- Slider for approximate values -->
  <input type="color" />        <!-- Color picker -->

  <!-- Date/Time inputs -->
  <input type="date" />         <!-- Date picker (YYYY-MM-DD) -->
  <input type="time" />         <!-- Time picker (HH:MM) -->
  <input type="datetime-local" /> <!-- Date + time without timezone -->
  <input type="month" />        <!-- Month picker (YYYY-MM) -->
  <input type="week" />         <!-- Week picker -->
  <input type="datetime" />     <!-- Deprecated: use datetime-local -->

  <!-- Other inputs -->
  <input type="file" />         <!-- File picker (accept attribute filters types) -->
  <input type="checkbox" />     <!-- Multiple choice toggle (boolean) -->
  <input type="radio" />        <!-- Single choice from group (same name) -->
  <input type="hidden" />       <!-- Hidden value, not visible to user -->

  <!-- Button inputs -->
  <input type="submit" />       <!-- Submits the form -->
  <input type="reset" />        <!-- Resets form to initial values -->
  <input type="button" />       <!-- Generic button (requires JavaScript) -->
  <input type="image" />        <!-- Image as submit button (src + alt required) -->
</form>
\`\`\`

**Mobile keyboard behavior by type:**

| Type | Mobile Keyboard |
|------|----------------|
| \`text\` | Standard alpha keyboard |
| \`search\` | Alpha keyboard with "search" action button |
| \`email\` | Alpha keyboard with @ and .com keys |
| \`url\` | Alpha keyboard with / and .com keys |
| \`tel\` | Numeric keypad |
| \`number\` | Numeric keypad (may include minus sign) |

**When to use each:**
- Use \`email\`, \`url\`, \`tel\` for appropriate fields — mobile keyboards adapt, improving UX
- Use \`number\` for numeric values (age, quantity) but \`text\` + \`inputmode="numeric"\` for IDs/codes that happen to be numeric
- Use \`range\` for approximate values where precision isn't critical
- Use \`date\` / \`time\` / \`color\` to get native browser widgets — better than custom date pickers
- Use \`search\` for search fields — some browsers show a clear button`,
      difficulty: "easy",
      tags: ["html", "forms"],
      is_top50: true,
    },
    {
      question: "Explain the difference between GET and POST methods in HTML forms.",
      answer: `The \`method\` attribute on an HTML \`<form>\` determines how form data is sent to the server:

\`\`\`html
<!-- GET: Data appended to URL as query parameters -->
<form action="/search" method="GET">
  <label for="q">Search:</label>
  <input type="search" id="q" name="q" />
  <button type="submit">Search</button>
</form>
<!-- URL becomes: /search?q=javascript+tutorial -->

<!-- POST: Data sent in request body (not visible in URL) -->
<form action="/api/signup" method="POST">
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required />

  <label for="password">Password:</label>
  <input type="password" id="password" name="password" required />

  <button type="submit">Sign Up</button>
</form>
<!-- URL stays: /api/signup (data in request body) -->
\`\`\`

**Key differences:**

| Aspect | GET | POST |
|--------|-----|------|
| Data location | URL query string (\`?key=value\`) | Request body |
| Visibility | Visible in URL, browser history, bookmarks | Not visible (but inspectable in DevTools) |
| Bookmarkable | ✅ Yes | ❌ No |
| Cacheable | ✅ Yes (browsers cache GET requests) | ❌ No |
| Browser history | Parameters stored in history | Not stored |
| Data length | Limited (~2048 chars, browser-dependent) | No practical limit |
| Encoding | \`application/x-www-form-urlencoded\` | \`multipart/form-data\` (for files) or \`application/x-www-form-urlencoded\` |
| Security | Less secure — data exposed in URL | More secure — but still need HTTPS |
| File upload | ❌ Cannot send files | ✅ Supports \`enctype="multipart/form-data"\` |
| Idempotent | ✅ Yes (safe for repeated requests) | ❌ No (submitting twice creates two records) |
| Back button / reload | ✅ Safe — re-executes query | ⚠️ "Confirm form resubmission" warning |

**When to use each:**
- **GET:** Search forms, filters, pagination, any read-only operation where the URL should represent the state
- **POST:** Login/signup forms, data submission, file uploads, any operation that changes server state

> **⚠️ Never use GET for sensitive data (passwords, credit cards) — query parameters are logged by servers, proxies, and stored in browser history.**`,
      difficulty: "easy",
      tags: ["html", "forms", "http"],
      is_top50: true,
    },
    {
      question: "What are form attributes like required, pattern, min, max, placeholder, and autocomplete?",
      answer: `HTML form attributes control validation, UX, and browser behavior without JavaScript:

\`\`\`html
<form>
  <!-- required: field must be filled before submission -->
  <input type="text" name="fullname" required />

  <!-- pattern: regex validation for the value -->
  <input type="text" name="zipcode" pattern="[0-9]{5}(-[0-9]{4})?"
         title="Enter a valid US ZIP code (e.g., 12345 or 12345-6789)" />

  <!-- min/max/step: constrain numeric/date values -->
  <input type="number" name="age" min="0" max="150" step="1" />
  <input type="date" name="arrival" min="2025-01-01" max="2025-12-31" />

  <!-- minlength/maxlength: constrain text length -->
  <input type="text" name="username" minlength="3" maxlength="20" />

  <!-- placeholder: hint text (disappears on input — not a label replacement!) -->
  <input type="search" name="q" placeholder="Search products..." />

  <!-- autocomplete: browser autofill hints -->
  <input type="text" name="fullname" autocomplete="name" />
  <input type="email" name="email" autocomplete="email" />
  <input type="tel" name="phone" autocomplete="tel" />
  <input type="text" name="address" autocomplete="street-address" />
  <input type="password" name="password" autocomplete="new-password" />
  <input type="password" name="current-password" autocomplete="current-password" />

  <!-- readonly vs disabled -->
  <input type="text" value="Cannot edit" readonly />     <!-- Submitted with form -->
  <input type="text" value="Not submitted" disabled />   <!-- Not submitted, grayed out -->

  <!-- multiple: allow multiple values (email, file) -->
  <input type="email" name="recipients" multiple />
  <input type="file" name="documents" multiple accept=".pdf,.doc" />

  <!-- autofocus: focus this field on page load -->
  <input type="text" name="search" autofocus />
</form>
\`\`\`

**Important usage notes:**

| Attribute | Purpose | Accessibility concern |
|-----------|---------|---------------------|
| \`placeholder\` | Short hint (disappears on input) | **Not a substitute for \`<label>\`** — screen readers treat it as a hint, not a label |
| \`autocomplete\` | Browser autofill hint | Improves UX but test with password managers |
| \`readonly\` | Display value, prevent modification | Announced by screen readers |
| \`disabled\` | Gray out, prevent interaction | Skipped by tab order, not submitted |

\`\`\`css
/* Styling based on attributes */
input:required { border-left: 3px solid #e74c3c; }
input:optional { border-left: 3px solid #3498db; }
input:read-only { background: #f5f5f5; }
input:disabled { opacity: 0.5; cursor: not-allowed; }
input::placeholder { color: #999; font-style: italic; }
\`\`\``,
      difficulty: "easy",
      tags: ["html", "forms"],
      is_top50: true,
    },
    {
      question: "What is the purpose of ARIA attributes?",
      answer: `ARIA (Accessible Rich Internet Applications) attributes supplement HTML semantics to make dynamic content and advanced UI controls accessible to assistive technologies like screen readers. They fill gaps where native HTML semantics are insufficient:

\`\`\`html
<!-- Landmark roles (use semantic HTML first, ARIA as fallback) -->
<div role="navigation" aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
  </ul>
</div>
<!-- ✅ Better: use <nav> instead of role="navigation" -->

<!-- Live region: announce dynamic updates -->
<div aria-live="polite" aria-atomic="true" id="notifications">
  <!-- Content changes here are announced by screen readers -->
</div>

<!-- Progress bar: convey current state -->
<div role="progressbar" aria-valuenow="60" aria-valuemin="0"
     aria-valuemax="100" aria-label="File upload progress">
  60%
</div>

<!-- Tab panel: link tab and its content -->
<div role="tablist" aria-label="Product information">
  <button role="tab" aria-selected="true" aria-controls="panel-description"
          id="tab-description">Description</button>
  <button role="tab" aria-selected="false" aria-controls="panel-reviews"
          id="tab-reviews">Reviews</button>
</div>
<div role="tabpanel" id="panel-description" aria-labelledby="tab-description">
  Product description content...
</div>

<!-- Alert/Error messages -->
<div role="alert" aria-live="assertive">
  Please enter a valid email address.
</div>

<!-- Expandable content -->
<button aria-expanded="false" aria-controls="details-content">
  Show details
</button>
<div id="details-content" hidden>
  Additional details here...
</div>
\`\`\`

**ARIA rules of thumb:**
1. **No ARIA is better than bad ARIA** — incorrect ARIA can make things worse
2. **Prefer semantic HTML first** — use native \`<nav>\`, \`<button>\`, \`<input type="checkbox"\> before ARIA roles
3. **Don't change native semantics** — \`<h1 role="button">\` removes the heading semantics
4. **All interactive ARIA controls must be keyboard accessible** — manage focus with \`tabindex\`
5. **Use \`aria-label\` for elements without visible text** (icon buttons)`,
      difficulty: "medium",
      tags: ["html", "accessibility", "aria"],
      is_top50: true,
    },
    {
      question: "What is the difference between aria-label, aria-labelledby, and aria-describedby?",
      answer: `These ARIA attributes provide accessible names and descriptions for elements. They are critical for screen reader users who cannot visually perceive the UI:

\`\`\`html
<!-- aria-label: provides a string label directly (overrides visible text) -->
<button aria-label="Close dialog">
  ✕ <!-- Screen reader reads "Close dialog" instead of "✕" -->
</button>

<!-- aria-labelledby: references another element's text as label (takes priority over aria-label) -->
<h2 id="section-title">Shipping Information</h2>
<section aria-labelledby="section-title">
  <!-- Screen reader announces "Shipping Information, region" when entering this section -->
  <p>Enter your shipping details below.</p>
</section>

<!-- Multiple IDs: combines text from multiple elements -->
<input type="text" aria-labelledby="label-name hint-format" />
<span id="label-name">Phone number</span>
<span id="hint-format">Format: XXX-XXX-XXXX</span>
<!-- Screen reader reads both as the label -->

<!-- aria-describedby: provides additional description (usually less critical than label) -->
<label for="password">Password</label>
<input type="password" id="password"
       aria-describedby="password-requirements" />
<span id="password-requirements" class="hint">
  Must be at least 8 characters with one number and one special character.
</span>
<!-- Screen reader reads "Password, edit text. Must be at least 8 characters..." -->

<!-- Priority when both are present: aria-labelledby > aria-label > visible label -->
<input type="text"
       aria-labelledby="custom-label"   <!-- Highest priority -->
       aria-label="Custom name"         <!-- Second priority -->
       placeholder="Search..." />       <!-- Last resort -->
<span id="custom-label" hidden>Find products</span>
\`\`\`

**Key differences:**

| Attribute | Purpose | Priority | Supports multiple references |
|-----------|---------|----------|---------------------------|
| \`aria-label\` | Direct string label | Medium | ❌ No (single string) |
| \`aria-labelledby\` | References text from other elements | Highest | ✅ Yes (space-separated IDs) |
| \`aria-describedby\` | Provides extended description | Supplementary | ✅ Yes (space-separated IDs) |

**Best practice:** Always provide a visible label first — use ARIA labels only when the label cannot be made visible. The ideal accessibility hierarchy is:
1. Native \`<label>\` element
2. \`aria-labelledby\` referencing a visible element
3. \`aria-label\` as last resort`,
      difficulty: "medium",
      tags: ["html", "accessibility", "aria"],
      is_top50: true,
    },
    {
      question: "How do you make a website keyboard accessible?",
      answer: `Keyboard accessibility ensures users who cannot use a mouse can navigate and interact with all features. Here are the essential techniques:

\`\`\`html
<!-- 1. Use native interactive elements (free keyboard support) -->
<button type="button">Clickable (Enter/Space to activate)</button>
<a href="/page">Link (Enter to activate)</a>
<input type="checkbox" /> Checkbox (Space to toggle)

<!-- 2. For custom interactive elements, add tabindex and keyboard handlers -->
<div class="custom-button" role="button" tabindex="0"
     aria-pressed="false"
     @click="toggleState"
     @keydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleState(); }">
  Toggle me
</div>

<!-- 3. Skip navigation link (first focusable element) -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<!-- 4. Visible focus indicators (don't remove :focus!) -->
<nav>
  <a href="/">Home</a>
  <a href="/products">Products</a>
</nav>
\`\`\`

\`\`\`css
/* Visible focus indicator — WCAG requires 2:1 contrast ratio */
*:focus-visible {
  outline: 2px solid #4A90D9;
  outline-offset: 2px;
  border-radius: 2px;
}

/* Skip link — visible only when focused */
.skip-link {
  position: absolute;
  top: -40px;
  left: 8px;
  z-index: 100;
}
.skip-link:focus {
  top: 8px;
}

/* Don't do this — removes focus, unusable for keyboard users */
*:focus { outline: none; } /* ❌ Bad */
\`\`\`

\`\`\`javascript
// 5. Trap focus in modals
function trapFocus(modal) {
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  modal.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeModal(modal); return; }
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  first.focus(); // Focus first element when modal opens
}

// 6. Manage dynamic content announcements
const announcer = document.getElementById("announcer");
announcer.textContent = ""; // Clear first (required for same-text announcements)
setTimeout(() => {
  announcer.textContent = "Cart updated: 3 items";
}, 100);
\`\`\`

**Keyboard navigation checklist:**
- [ ] All interactive elements are keyboard accessible (\`Tab\` to reach, \`Enter\`/Space to activate)
- [ ] Visible focus indicator on all elements
- [ ] Logical tab order (matches visual order)
- [ ] Skip navigation link present
- [ ] Modal/lightbox traps focus and closes with \`Escape\`
- [ ] No keyboard traps (focus gets stuck somewhere)
- [ ] Custom controls have appropriate \`role\`, \`aria-\` attributes, and keyboard handlers`,
      difficulty: "hard",
      tags: ["html", "accessibility"],
      is_top50: true,
    },
    {
      question: "What is the purpose of the alt attribute and what happens when it's missing?",
      answer: `The \`alt\` attribute on \`<img>\` elements provides a text alternative for users who cannot see the image. Its impact spans accessibility, SEO, and user experience:

\`\`\`html
<!-- ✅ Decorative image: use empty alt (screen reader skips it) -->
<img src="decorative-border.png" alt="" role="presentation" />

<!-- ✅ Informative image: describe the content or function -->
<img src="chart-q4-revenue.png"
     alt="Bar chart showing Q4 revenue increased from $1.2M to $1.8M, a 50% growth" />

<!-- ✅ Functional image (icon link): describe the destination/action -->
<a href="/settings">
  <img src="gear-icon.png" alt="Settings" />
</a>

<!-- ✅ Text in image: include the text in the alt attribute -->
<img src="logo.png" alt="Acme Corporation" />

<!-- ❌ Missing alt attribute — bad for accessibility -->
<img src="photo.jpg" />
<!-- Browser may use the src as a fallback for screen readers -->

<!-- ❌ Redundant alt text that repeats nearby content -->
<img src="profile-photo.jpg" alt="Profile photo of John Doe" />
<p>John Doe</p> <!-- Alt text duplicates visible text -->

<!-- ❌ File name as alt — useless -->
<img src="IMG_0421.jpg" alt="IMG_0421" />
\`\`\`

**WCAG requirements for alt text:**

| Image type | Alt text rule |
|------------|--------------|
| Informative | Conveys the same information as the image |
| Decorative | \`alt=""\` (empty) — screen reader ignores it |
| Functional | Describes the destination (for links) or action (for buttons) |
| Text-based | Must include the same text shown in the image |
| Complex (chart, diagram) | Short alt summary + long description nearby or via \`aria-describedby\` |

**Consequences of missing or poor alt text:**
1. **Accessibility failure** — WCAG 1.1.1 (Level A): all non-text content needs a text alternative
2. **Screen readers** read the file name or nothing, leaving users without context
3. **Broken images** show no useful information when the image fails to load
4. **SEO impact** — search engines use alt text for image indexing and ranking`,
      difficulty: "easy",
      tags: ["html", "accessibility", "seo"],
      is_top50: true,
    },
    {
      question: "What are Web Components and what technologies power them?",
      answer: `Web Components are a set of browser-native APIs that enable creating reusable, encapsulated custom HTML elements. Unlike framework components (React, Vue), Web Components work across any framework or no framework at all:

\`\`\`javascript
// ── 1. Custom Elements: define your own HTML tags ──
class UserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = \`
      <style>
        :host { display: block; border: 1px solid #ddd; border-radius: 8px;
                padding: 16px; margin: 8px 0; font-family: system-ui, sans-serif; }
        .name { font-size: 1.2em; font-weight: bold; }
        .email { color: #666; }
      </style>
      <div class="name">\${this.getAttribute("name")}</div>
      <div class="email">\${this.getAttribute("email")}</div>
      <slot></slot>
    \`;
  }
}
customElements.define("user-card", UserCard);
\`\`\`

\`\`\`html
<!-- Usage in HTML — works in any framework -->
<user-card name="Alice Johnson" email="alice@example.com">
  <p>Additional content goes into the slot.</p>
</user-card>
\`\`\`

**The three Web Component technologies:**

| Technology | Purpose |
|------------|---------|
| **Custom Elements** | Define new HTML tags with lifecycle callbacks (\`connectedCallback\`, \`disconnectedCallback\`, \`attributeChangedCallback\`) |
| **Shadow DOM** | Provides DOM and style encapsulation — component's internal structure is isolated from the main document |
| **HTML Templates** | \`<template>\` and \`<slot>\` for declarative markup that is parsed but not rendered until activated |

\`\`\`javascript
// ── 2. HTML Template (declarative component markup) ──
const template = document.createElement("template");
template.innerHTML = \`
  <style>
    .tooltip { position: relative; display: inline-block; }
    .tooltip-text { display: none; position: absolute; background: #333;
                    color: #fff; padding: 4px 8px; border-radius: 4px; }
    .tooltip:hover .tooltip-text { display: block; }
  </style>
  <span class="tooltip">
    <slot name="trigger">Hover me</slot>
    <span class="tooltip-text"><slot name="content"></slot></span>
  </span>
\`;

class CustomTooltip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}
customElements.define("custom-tooltip", CustomTooltip);
\`\`\`

**Benefits vs frameworks:**
- ✅ Framework-agnostic — use in React, Angular, Vue, or vanilla HTML
- ✅ Browser-native — no build step required
- ✅ Encapsulated styles — Shadow DOM prevents CSS leaks
- ❌ No built-in reactivity — must implement manually or pair with a library (Lit, Stencil)
- ❌ SSR/SSG support varies — requires Declarative Shadow DOM for server rendering`,
      difficulty: "hard",
      tags: ["html", "web-components", "shadow-dom"],
      is_top50: true,
    },
    {
      question: "What is the Shadow DOM and how does it provide encapsulation?",
      answer: `The Shadow DOM is a browser API that provides DOM and style encapsulation. It allows a component to have its own isolated DOM tree and CSS scope, preventing conflicts with the main document:

\`\`\`javascript
class ShadowedComponent extends HTMLElement {
  constructor() {
    super();
    // mode: "open" — accessible via element.shadowRoot
    // mode: "closed" — shadowRoot returns null (harder to test/debug)
    const shadow = this.attachShadow({ mode: "open" });

    // Styles inside the shadow tree do NOT affect the outside world
    // AND outside styles do NOT penetrate into the shadow tree
    shadow.innerHTML = \`
      <style>
        /* ✅ These styles apply ONLY within this shadow tree */
        p { color: rebeccapurple; font-weight: bold; }
        button { background: #4A90D9; color: white; border: none;
                 padding: 8px 16px; border-radius: 4px; cursor: pointer; }

        /* :host styles the custom element itself (from outside) */
        :host { display: inline-block; margin: 8px; }

        /* :host-context applies styles if a parent matches a selector */
        :host-context(.dark-theme) { background: #333; }
      </style>

      <!-- <slot> projects light DOM content into the shadow tree -->
      <p><slot name="title">Default title</slot></p>
      <button part="action-button">Click me</button>

      <!-- ::part() allows the component author to expose styling hooks -->
    \`;
  }
}
customElements.define("shadowed-comp", ShadowedComponent);
\`\`\`

\`\`\`html
<!-- These styles do NOT affect content inside the Shadow DOM -->
<style>
  p { color: red; } /* ❌ Does not overwrite "rebeccapurple" inside shadow */
</style>

<shadowed-comp>
  <span slot="title">Custom Title from Light DOM</span>
</shadowed-comp>
\`\`\`

**Shadow DOM boundary rules:**

| Rule | Description |
|------|-------------|
| **Style encapsulation** | CSS from the outer document does not apply to shadow tree elements |
| **Style isolation** | CSS inside the shadow tree does not leak out to the document |
| **DOM encapsulation** | \`document.querySelector\` and \`children\` do not traverse into shadow trees |
| **Event retargeting** | Events from inside the shadow tree appear to originate from the host element |
| **Composed events** | Events with \`composed: true\` (click, keydown) cross the boundary; non-composed (slotchange) do not |

**Practical use cases:**
- UI component libraries (Material Web Components, Shoelace)
- Embeddable widgets (chat widgets, payment forms) — host page CSS won't break them
- Legacy code integration — safely add modern components without style conflicts`,
      difficulty: "hard",
      tags: ["html", "shadow-dom", "web-components"],
      is_top50: true,
    },
    {
      question: "What are custom elements and how do you define them?",
      answer: `Custom Elements allow you to define new HTML tags with custom behavior. They are part of the Web Components standard and come with a well-defined lifecycle:

\`\`\`javascript
// ── Defining a custom element ──

class ExpandableSection extends HTMLElement {
  // 1. Called when the element is created
  constructor() {
    super();
    this._expanded = false;
    // Initialize state, set up shadow DOM, bind methods
  }

  // 2. Specify which attributes to observe for changes
  static get observedAttributes() {
    return ["open", "title"];
  }

  // 3. Called when the element is added to the DOM
  connectedCallback() {
    this.render();
    this.addEventListener("click", this._toggle);
  }

  // 4. Called when the element is removed from the DOM
  disconnectedCallback() {
    this.removeEventListener("click", this._toggle);
    // Clean up timers, subscriptions, observers
  }

  // 5. Called when an observed attribute changes
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "open") {
      this._expanded = newValue !== null;
      this.render();
    }
  }

  // 6. Called when the element is moved to a new document
  adoptedCallback() {
    console.log("Element moved to a new document");
  }

  _toggle() {
    this._expanded = !this._expanded;
    if (this._expanded) {
      this.setAttribute("open", "");
    } else {
      this.removeAttribute("open");
    }
  }

  render() {
    this.innerHTML = \`
      <div class="expandable-header">
        <h3>\${this.getAttribute("title") || "Section"}</h3>
        <span class="icon">\${this._expanded ? "▲" : "▼"}</span>
      </div>
      <div class="expandable-content" \${this._expanded ? "" : "hidden"}>
        <slot></slot>
      </div>
    \`;
  }
}

// Register the element (name MUST contain a hyphen)
customElements.define("expandable-section", ExpandableSection);
\`\`\`

\`\`\`html
<!-- Usage -->
<expandable-section title="Frequently Asked Questions">
  <p>Here are the answers to common questions...</p>
</expandable-section>

<expandable-section title="More Details" open>
  <p>This section is expanded by default.</p>
</expandable-section>
\`\`\`

**Custom element rules:**
- Name **must** contain a hyphen (\`my-component\`, \`app-header\`) — ensures no conflict with future HTML elements
- Cannot self-close (\`<my-component>\` ✅, \`<my-component />\` ❌)
- Can extend native elements using \`extends\` parameter (customized built-in, not supported in Safari)
- Lifecycle callbacks are **not** called for attributes set before the element is upgraded (use \`observedAttributes\` for reactive behavior)

\`\`\`javascript
// Detecting when custom elements are defined
customElements.whenDefined("expandable-section").then(() => {
  console.log("expandable-section is now ready to use");
});

// Checking if an element is defined
console.log(customElements.get("expandable-section")); // Returns the class
\`\`\``,
      difficulty: "hard",
      tags: ["html", "web-components", "custom-elements"],
      is_top50: true,
    },
    {
      question: "Explain the difference between async and defer attributes on script tags.",
      answer: `The \`async\` and \`defer\` attributes change how external scripts are downloaded and executed relative to HTML parsing:

\`\`\`html
<!-- Default (blocking): script downloads AND executes, halting HTML parsing -->
<script src="app.js"></script>

<!-- defer: downloads while parsing, executes after parsing, preserves order -->
<script defer src="analytics.js"></script>
<script defer src="app.js"></script>

<!-- async: downloads while parsing, executes ASAP (as soon as downloaded), no order guarantee -->
<script async src="widget.js"></script>
<script async src="ad.js"></script>
\`\`\`

**Timeline comparison:**

\`\`\`
HTML Parsing:  |████████████████████████████████████|
Default script:              |───download───||──exec──|
                              (parsing blocked during both)

With defer:    |████████████████████████████████████|
defer script:  |──────download──────|           |exec|
                                       (parsing continues, exec after)

With async:    |████████████████████████████████████|
async script:  |──────download──────||──exec──|
                   (parsing continues during download, blocked during exec)
\`\`\`

**Execution timing:**
\`\`\`javascript
// Testing execution order
console.log("Inline script (during parse)");

const script = document.createElement("script");
script.src = "deferred.js";
script.defer = true;
document.head.appendChild(script);
// defer scripts execute before DOMContentLoaded, in document order
\`\`\`

| Behavior | Default (no attr) | \`defer\` | \`async\` |
|----------|-------------------|-----------|-----------|
| Download while parsing | ❌ Blocks parsing | ✅ Yes | ✅ Yes |
| Execution timing | Immediately after download (blocks parsing) | After parsing, before \`DOMContentLoaded\` | As soon as downloaded (may block parsing) |
| Execution order | Document order | **Document order** (guaranteed) | **Download order** (not guaranteed) |
| DOMContentLoaded waits | After script executed | After deferred scripts | Does not wait |
| Use case | Small scripts, critical path | Scripts that need DOM access, maintain order | Independent scripts (analytics, ads, tracking) |

**Best practices:**
- Use \`defer\` for scripts that need full DOM access and should maintain execution order (your app code)
- Use \`async\` for independent scripts where timing doesn't matter (analytics, A/B testing, social widgets)
- For inline scripts, neither \`defer\` nor \`async\` applies — inline scripts always block parsing
- Place \`<link>\` stylesheets before \`defer\` scripts — CSS blocks deferred script execution`,
      difficulty: "medium",
      tags: ["html", "performance", "javascript"],
      is_top50: true,
    },
    {
      question: "How does script placement affect page rendering?",
      answer: `Where you place \`<script>\` tags in your HTML significantly impacts page load performance and user experience:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Script Placement Demo</title>

  <!-- ❌ BAD: Blocking script in <head> — delays entire page render -->
  <script src="slow-script.js"></script>
  <!-- HTML parsing stops here until script downloads and executes -->

  <style>
    body { font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <h1>Page Content</h1>
  <p>This content won't render until slow-script.js finishes.</p>

  <!-- ✅ GOOD: Non-blocking script at end of <body> -->
  <script src="app.js"></script>
  <!-- HTML is fully parsed before script loads — page is visible -->

  <!-- ✅ BETTER: defer — downloads while parsing, executes after -->
  <script defer src="analytics.js"></script>

  <!-- ✅ BEST FOR INDEPENDENT SCRIPTS: async -->
  <script async src="widget.js"></script>
</body>
</html>
\`\`\`

**Render-blocking analysis:**

| Placement | Blocks rendering? | Time to First Paint |
|-----------|------------------|-------------------|
| \`<head>\` without defer/async | ✅ Yes — full block | Delayed until script loads + runs |
| \`<head>\` with \`defer\` | ❌ No | Script runs after render |
| \`<head>\` with \`async\` | ❌ No (generally) | May block briefly if script finishes early |
| End of \`<body>\` (no attr) | ❌ No — parsing already complete | Fastest initial render |
| Inline \`<script>\` in \`<head>\` | ✅ Yes — blocks parsing | Delayed |

\`\`\`javascript
// Measure impact using Navigation Timing API
window.addEventListener("load", () => {
  const perf = performance.getEntriesByType("navigation")[0];
  console.log("DOM Content Loaded:", perf.domContentLoadedEventEnd);
  console.log("Page Loaded:", perf.loadEventEnd);

  // Check if scripts blocked rendering
  const paintEntries = performance.getEntriesByType("paint");
  paintEntries.forEach(entry => {
    console.log(\`\${entry.name}: \${entry.startTime}ms\`);
  });
});
\`\`\`

**Modern best practices:**
1. **Defer your app scripts** — \`<script defer src="app.js">\` in \`<head>\` (best trade-off)
2. **Async third-party scripts** — analytics, ads, trackers
3. **Inline critical JavaScript** — small amount of code needed before page render (feature detection, theme)
4. **Use preload for critical resources** — \`<link rel="preload" href="app.js" as="script">\` hints the browser
5. **Avoid synchronous scripts** in \`<head>\` at all costs — they are the #1 cause of slow Time-to-Interactive`,
      difficulty: "medium",
      tags: ["html", "performance", "javascript"],
      is_top50: true,
    },
    {
      question: "What is the DOM and how does it work?",
      answer: "The DOM (Document Object Model) is a tree-like representation of an HTML document that JavaScript can manipulate. When a page loads, the browser parses HTML into DOM nodes. JavaScript can traverse, add, remove, or modify nodes, which triggers re-rendering. Virtual DOM (used by React) batches changes for performance.",
      difficulty: "easy",
      tags: ["dom", "javascript"],
      is_top50: true,
    },
    // ──────── CSS & Visual Design ────────
    {
      question: "Explain the CSS box model and the difference between content-box and border-box.",
      answer: `The CSS box model describes how every element is rendered as a rectangular box. Every box consists of four layers from inside out: **content** (where text/images appear), **padding** (space around content, inside border), **border** (line around padding), and **margin** (space outside border, invisible).

\`\`\`css
/* Default: content-box — width/height only include content */
.box-content {
  box-sizing: content-box;
  width: 200px;
  padding: 20px;
  border: 2px solid black;
  /* Actual rendered width = 200 + 20*2 + 2*2 = 244px */
}

/* Preferred: border-box — width/height include content + padding + border */
.box-border {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 2px solid black;
  /* Actual rendered width = 200px (content is 200 - 20*2 - 2*2 = 156px) */
}

/* Apply border-box globally (recommended) */
*, *::before, *::after {
  box-sizing: border-box;
}
\`\`\`

**Visual representation:**
\`\`\`
┌─────────────────────────────────┐  ← margin (transparent)
│  ┌───────────────────────────┐  │  ← border
│  │  ┌─────────────────────┐  │  │  ← padding
│  │  │      CONTENT        │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
\`\`\`

**Key insight:** \`margin\` is outside the box — it does not count toward the element's width/height, but it affects the space the element occupies on the page. Margins can collapse (vertical margins between block elements merge into the larger of the two). Border-box is almost always preferred because it makes sizing predictable — a width of 100% means "fill the parent exactly."`,
      difficulty: "easy",
      tags: ["css", "box-model"],
      is_top50: true,
    },
    {
      question: "Explain the concept of specificity in CSS and how the cascade works.",
      answer: `Specificity determines which CSS rule is applied when multiple rules target the same element. The cascade algorithm calculates specificity as a four-part value (a, b, c, d):

| Selector Type | Specificity | Example |
|--------------|-------------|---------|
| Inline styles | (1, 0, 0, 0) | \`style="color: red"\` |
| ID selectors | (0, 1, 0, 0) | \`#header\` |
| Class, attribute, pseudo-class | (0, 0, 1, 0) | \`.nav\`, \`[type="text"]\`, \`:hover\` |
| Element, pseudo-element | (0, 0, 0, 1) | \`div\`, \`p\`, \`::before\` |

\`\`\`css
/* Specificity comparison — higher wins */
* { color: black; }                            /* (0,0,0,0) */
p { color: gray; }                             /* (0,0,0,1) */
.text { color: blue; }                         /* (0,0,1,0) */
p.text { color: green; }                       /* (0,0,1,1) */
#main p { color: red; }                        /* (0,1,0,1) */
#main .text { color: purple; }                 /* (0,1,1,0) */
<p style="color: orange">Text</p>              /* (1,0,0,0) */
\`\`\`

**Cascade order (lowest to highest priority):**
1. Browser default styles (user agent)
2. User stylesheet
3. Author stylesheet (your CSS)
4. \`!important\` declarations (reversed specificity within)
5. Animation
6. Transition

**Key rules:**
- The last rule wins when specificity is equal
- \`!important\` overrides all, but two \`!important\` rules fall back to specificity comparison
- \`<style>\` tags and external stylesheets have the same specificity — order in the document matters
- \`:is()\` and \`:not()\` take the specificity of their most specific argument
- \`:where()\` always has **zero** specificity — great for resets

\`\`\`css
/* :where() has 0 specificity — easy to override */
:where(.card) p { color: gray; }               /* (0,0,0,1) */
.card p { color: black; }                      /* (0,0,1,1) — wins */

/* :is() takes most specific argument's specificity */
:is(.card, #main) p { color: blue; }           /* (0,1,0,1) — #main makes it high */
\`\`\``,
      difficulty: "medium",
      tags: ["css", "specificity", "cascade"],
      is_top50: true,
    },
    {
      question: "What is Flexbox and how does it work?",
      answer: `Flexbox is a one-dimensional layout model that distributes space and aligns items within a container. It excels at navigation bars, centering, card rows, and any layout where items flow in a single direction:

\`\`\`css
.container {
  display: flex;           /* or inline-flex */

  /* Direction */
  flex-direction: row;     /* default — horizontal | column — vertical */
  flex-wrap: wrap;         /* allow items to wrap to next line */

  /* Shorthand: flex-flow: <direction> <wrap> */
  flex-flow: row wrap;

  /* Main-axis alignment (horizontal when flex-direction: row) */
  justify-content: flex-start;      /* default — packed at start */
  justify-content: center;          /* centered */
  justify-content: space-between;   /* equal space between items */
  justify-content: space-around;    /* space around each item */
  justify-content: space-evenly;    /* equal space everywhere */

  /* Cross-axis alignment (vertical when flex-direction: row) */
  align-items: stretch;      /* default — fill container height */
  align-items: center;       /* centered vertically */
  align-items: flex-start;   /* top */
  align-items: baseline;     /* align by text baseline */

  /* Multi-line alignment (when flex-wrap is active) */
  align-content: flex-start; /* pack lines to top */
  align-content: center;     /* center lines */
}

.item {
  /* Item sizing */
  flex-grow: 1;    /* Proportion of extra space this item absorbs */
  flex-shrink: 1;  /* Proportion this item shrinks when space is tight */
  flex-basis: auto; /* Initial size before growing/shrinking */

  /* Shorthand: flex: <grow> <shrink> <basis> */
  flex: 1 0 200px; /* grow, no shrink, start at 200px */

  /* Individual alignment (overrides container's align-items) */
  align-self: center;

  /* Order (visual reordering — use sparingly, bad for accessibility) */
  order: 0; /* default; higher values move item to the end */
}
\`\`\`

**Practical patterns:**

\`\`\`css
/* Centering — the simplest Flexbox use case */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Sticky footer — content pushes footer down */
body { display: flex; flex-direction: column; min-height: 100vh; }
main { flex: 1; } /* grows to fill space, pushing footer to bottom */

/* Responsive card grid */
.card-grid { display: flex; flex-wrap: wrap; gap: 16px; }
.card-grid > * { flex: 1 1 250px; } /* items are at least 250px, grow to fill */

/* Holy grail layout (header, footer, 3-column body) */
body { display: flex; flex-direction: column; min-height: 100vh; }
.content { display: flex; flex: 1; }
.content nav { width: 200px; }
.content article { flex: 1; }
.content aside { width: 150px; }
\`\`\`

**Key advantage over Grid:** Flexbox is one-dimensional — items wrap naturally and sizing is content-aware. Use Flexbox for components (navigation, cards, toolbars) and Grid for page-level layouts.`,
      difficulty: "medium",
      tags: ["css", "flexbox", "layout"],
      is_top50: true,
    },
    {
      question: "What is CSS Grid and how does it differ from Flexbox?",
      answer: `CSS Grid is a two-dimensional layout system that controls both rows and columns simultaneously. Unlike Flexbox (one-dimensional), Grid excels at page-level layouts where you need precise control over both axes:

\`\`\`css
.grid {
  display: grid;

  /* Define columns — use fr (fractional unit), px, %, auto, minmax(), repeat() */
  grid-template-columns: 250px 1fr 200px;        /* fixed + flexible + fixed */
  grid-template-columns: repeat(3, 1fr);          /* 3 equal columns */
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* responsive */

  /* Define rows */
  grid-template-rows: auto 1fr auto;              /* header, main, footer */
  grid-template-rows: repeat(2, 200px);

  /* Shorthand */
  grid-template: auto 1fr auto / 1fr 300px;       /* rows / columns */

  /* Gap (replaces margin hacks) */
  gap: 16px;                    /* row-gap + column-gap */
  row-gap: 24px;
  column-gap: 16px;

  /* Alignment */
  justify-items: stretch;       /* horizontal alignment of items within cells */
  align-items: stretch;         /* vertical alignment of items within cells */
  justify-content: start;       /* horizontal alignment of the entire grid */
  align-content: start;         /* vertical alignment of the entire grid */
}

/* Item placement */
.item {
  grid-column: 1 / 3;           /* span from column line 1 to 3 */
  grid-column: 1 / -1;          /* span all columns */
  grid-column: span 2;          /* span 2 columns */
  grid-row: 1 / 3;

  /* Shorthand: grid-area: row-start / col-start / row-end / col-end */
  grid-area: 1 / 1 / 3 / 3;

  /* Named grid areas (most readable for page layouts) */
  grid-area: header;
}
\`\`\`

**Named grid areas — the most readable approach:**
\`\`\`css
.page {
  display: grid;
  grid-template-areas:
    "header  header  header"
    "nav     main    aside"
    "footer  footer  footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 0;
}
header { grid-area: header; }
nav    { grid-area: nav; }
main   { grid-area: main; }
aside  { grid-area: aside; }
footer { grid-area: footer; }
\`\`\`

**Flexbox vs Grid — when to use which:**

| Criteria | Flexbox | Grid |
|----------|---------|------|
| Dimensions | One-dimensional (row OR column) | Two-dimensional (row AND column) |
| Content vs layout | Content-first — items control sizing | Layout-first — tracks control sizing |
| Wrapping | Items wrap naturally | Items snap to defined tracks |
| Overlap | Difficult without position: absolute | Easy with grid-column/row overlap |
| Browser support | Excellent | Excellent (modern) |
| Use case | Navigation, cards, centering, toolbars | Page layout, dashboards, galleries |

> **Rule of thumb:** Use Grid for page-level layouts (header, sidebar, main, footer). Use Flexbox for component-level layouts (card rows, nav items, button groups).`,
      difficulty: "medium",
      tags: ["css", "grid", "layout"],
      is_top50: true,
    },
    {
      question: "Explain CSS positioning: static, relative, absolute, fixed, and sticky.",
      answer: `The \`position\` property controls how an element is placed in the document flow. Each value behaves fundamentally differently:

\`\`\`css
/* DEFAULT — element follows normal document flow */
.element-static {
  position: static;   /* top, right, bottom, left have NO effect */
}

/* RELATIVE — offset from its normal position; still occupies original space */
.element-relative {
  position: relative;
  top: 10px;          /* moved DOWN 10px from normal position */
  left: 20px;         /* moved RIGHT 20px from normal position */
  /* Also creates a new containing block for absolutely positioned children */
}

/* ABSOLUTE — removed from flow; positioned relative to nearest positioned ancestor */
.element-absolute {
  position: absolute;
  top: 0;
  right: 0;
  /* If no positioned ancestor, positions relative to <html> (initial containing block) */
  /* Width defaults to content width (shrink-wraps) */
}

/* FIXED — removed from flow; positioned relative to the viewport */
.element-fixed {
  position: fixed;
  bottom: 20px;
  right: 20px;
  /* Stays in place even when scrolling */
  /* Fixed positioning creates a new stacking context */
}

/* STICKY — hybrid of relative and fixed */
.element-sticky {
  position: sticky;
  top: 0;             /* stick to top of viewport when scroll reaches this point */
  /* Behaves like relative until the element reaches the threshold, then becomes fixed */
  /* Requires a threshold value (top, bottom, left, or right) to work */
}
\`\`\`

**Interactive sticky example:**
\`\`\`css
/* Section headers that stick on scroll */
.section-header {
  position: sticky;
  top: 0;              /* sticks when scroll reaches top of viewport */
  background: white;
  z-index: 10;         /* ensures header stays above content */
}

/* Sticky sidebar that stops at the bottom of its parent container */
.sidebar {
  position: sticky;
  top: 20px;           /* stays 20px from top when scrolled */
  max-height: calc(100vh - 40px);
  overflow-y: auto;    /* sidebar content scrolls independently */
}
\`\`\`

**Key differences:**

| Position | Flow | Offset reference | Scroll behavior |
|----------|------|-----------------|-----------------|
| \`static\` | In flow | N/A | Scrolls normally |
| \`relative\` | In flow | Self's normal position | Scrolls normally |
| \`absolute\` | Removed from flow | Nearest positioned ancestor | Scrolls with ancestor |
| \`fixed\` | Removed from flow | Viewport | **Does not scroll** — stays in place |
| \`sticky\` | In flow until threshold | Viewport (after threshold) | Scrolls normally → sticks → scrolls when parent exits viewport |

**Practical use cases:**
- **Relative:** Container for absolute children; fine-tuning element position
- **Absolute:** Modals, tooltips, dropdown menus, badge overlays
- **Fixed:** Navigation bars, back-to-top buttons, cookie consent banners
- **Sticky:** Section headers in lists, table headers, sidebar widgets`,
      difficulty: "medium",
      tags: ["css", "positioning", "layout"],
      is_top50: true,
    },
    {
      question: "How does responsive design work with media queries?",
      answer: `Responsive design uses CSS media queries to apply different styles based on device characteristics (viewport width, orientation, resolution, user preferences). The mobile-first approach starts with base styles for small screens and adds breakpoints for larger screens:

\`\`\`css
/* ── MOBILE FIRST — base styles apply to all screens, then enhance ── */

/* Base: mobile (0-639px) — no media query needed */
body { font-size: 16px; }
.sidebar { display: none; }               /* hide sidebar on mobile */
.grid { grid-template-columns: 1fr; }     /* single column */

/* Tablet: 640px+ */
@media (min-width: 640px) {
  body { font-size: 17px; }
  .sidebar { display: block; }
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  body { font-size: 18px; }
  .grid { grid-template-columns: repeat(3, 1fr); }
  .container { max-width: 960px; margin: 0 auto; }
}

/* Wide desktop: 1280px+ */
@media (min-width: 1280px) {
  .container { max-width: 1200px; }
}

/* ── Other useful media queries ── */

/* Orientation (tablet in landscape vs portrait) */
@media (orientation: landscape) { /* ... */ }
@media (orientation: portrait) { /* ... */ }

/* Dark mode preference */
@media (prefers-color-scheme: dark) {
  body { background: #1a1a2e; color: #e0e0e0; }
}

/* Reduced motion (accessibility) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  /* Enhance borders and text contrast */
}

/* Print styles */
@media print {
  nav, .sidebar, .ads { display: none; }
  body { font-size: 12pt; color: black; }
}

/* Pointer accuracy (touch vs mouse) */
@media (pointer: coarse) {
  button, a { min-height: 44px; min-width: 44px; } /* touch targets */
}

/* Container queries (newer — component-level) */
@container (min-width: 400px) {
  .card { flex-direction: row; }
}
\`\`\`

**Common breakpoints (Tailwind v3 defaults):**
- \`sm\`: 640px — landscape phones, small tablets
- \`md\`: 768px — tablets
- \`lg\`: 1024px — small laptops
- \`xl\`: 1280px — desktops
- \`2xl\`: 1536px — wide screens

**Best practices:**
- Design mobile-first — start with the smallest screen, add complexity via \`min-width\`
- Avoid device-specific breakpoints — use breakpoints where your design breaks
- Test on real devices, not just browser DevTools resizing
- Use relative units (\`rem\`, \`em\`, \`%\`, \`vw\`) for fluid typography and spacing
- Combine media queries with \`clamp()\` for fluid typography without breakpoints`,
      difficulty: "medium",
      tags: ["css", "responsive", "media-queries"],
      is_top50: true,
    },
    {
      question: "What are CSS custom properties (variables) and how do they differ from preprocessor variables?",
      answer: `CSS Custom Properties (CSS variables) are native to the browser and cascade through the DOM, while preprocessor variables (Sass, Less) are compiled away at build time:

\`\`\`css
/* ── CSS Custom Properties (native, cascade-aware) ── */

:root {
  --primary: #4A90D9;
  --spacing: 16px;
  --radius: 8px;
  --font-base: 16px;
}

/* Override on a specific element */
.dark-section {
  --primary: #6BB5FF;      /* overrides :root value within this subtree */
  --bg: #1a1a2e;
}

/* Use with var() — fallback supported */
.button {
  background: var(--primary, #0066cc);    /* fallback if --primary is undefined */
  padding: var(--spacing) calc(var(--spacing) * 2);
  border-radius: var(--radius);
}

/* Dynamic theming with JavaScript */
button.dark-mode {
  --primary: #6BB5FF;
  --bg: #1a1a2e;
  --text: #e0e0e0;
}

/* Calc with variables */
.element { width: calc(100% - var(--spacing) * 2); }

/* ── Preprocessor variables (Sass) ── */
$primary: #4A90D9;
$spacing: 16px;

.button {
  background: $primary;
  padding: $spacing ($spacing * 2);   /* Compiled to fixed value */
  // No runtime override possible
}
\`\`\`

**Key differences:**

| Capability | CSS Custom Properties | Preprocessor Variables |
|------------|----------------------|----------------------|
| Lifecycle | Runtime — live in the browser | Build-time — compiled away |
| Cascading | ✅ Yes — inherit through DOM | ❌ No — global within scope |
| JavaScript access | ✅ \`getComputedStyle(el).getPropertyValue('--primary')\` | ❌ Not accessible |
| Dynamic changes | ✅ Re-theme at runtime | ❌ Requires recompilation |
| Media queries | ✅ Can change within queries | ✅ Can change within queries |
| \`calc()\` compatibility | ✅ Can use inside calc() | ✅ Can use inside calc() |
| Type checking | ❌ No type checking | ✅ Type checking in some preprocessors |

**Practical example — theme toggle:**
\`\`\`javascript
document.documentElement.style.setProperty('--primary', '#e74c3c');
// All elements using var(--primary) update immediately — no recompilation needed
\`\`\`

**When to use which:**
- Use CSS Custom Properties for theming, dynamic values, and runtime changes
- Use preprocessor variables for compile-time utilities (color manipulation, math, loops, mixins)
- Best practice: use both together — Sass for mixins/functions, CSS custom properties for theme values`,
      difficulty: "medium",
      tags: ["css", "custom-properties", "preprocessors"],
      is_top50: true,
    },
    {
      question: "What is the difference between em, rem, px, vw, and other CSS units?",
      answer: `CSS units fall into two categories: **absolute** (fixed size) and **relative** (size depends on context). Choosing the right unit is critical for accessible, responsive designs:

\`\`\`css
/* ── Absolute units (fixed, not recommended for text) ── */
px  /* 1px = 1/96th of an inch — most common absolute unit */
cm, mm, in, pt, pc  /* Physical units — rarely used on screens */

/* ── Relative units (recommended for responsive design) ── */

/* Font-relative */
em       /* Relative to parent element's font-size */
         /* 2em = 2 × parent's font-size — compounds (can cause runaway sizing) */

rem      /* Root em — relative to <html> font-size (usually 16px) */
         /* 2rem = 32px regardless of parent — predictable, accessible */
         /* ✅ Preferred for font-sizes, padding, margins */

/* Viewport-relative */
vw       /* 1vw = 1% of viewport width   — 100vw = full viewport width */
vh       /* 1vh = 1% of viewport height  — 100vh = full viewport height */
vmin     /* 1vmin = min(1vw, 1vh) */
vmax     /* 1vmax = max(1vw, 1vh) */
dvh      /* Dynamic viewport height — accounts for mobile browser chrome */
svh      /* Small viewport height — smallest possible viewport */
lvh      /* Large viewport height — largest possible viewport */

/* Percentage */
%        /* Relative to parent element's same property */
         /* width: 50% = half of parent width */
         /* padding-top: 50% = half of parent WIDTH (tricky!) */

/* Container-relative (newer) */
cqw      /* 1cqw = 1% of container query container's width */
cqh      /* 1cqh = 1% of container query container's height */

/* Content-based */
ch       /* Width of "0" character in current font — great for line length */
ex       /* Height of "x" character — rarely used */
\`\`\`

**Practical comparison:**
\`\`\`css
html { font-size: 100%; } /* Usually 16px — respect user's browser settings */

/* ❌ Fixed — ignores user preferences */
.px-text { font-size: 14px; }

/* ✅ Relative — respects user's font-size preference */
.rem-text { font-size: 0.875rem; } /* 14px if base is 16px */

/* Fluid typography — scales with viewport without breakpoints */
.fluid-text {
  font-size: clamp(1rem, 0.5rem + 2vw, 2rem);
  /* Minimum 1rem, scales between 0.5rem+2vw, maximum 2rem */
}

/* Spacing that scales with font-size */
.card {
  padding: 1rem;        /* Scales with root font-size */
  margin-bottom: 2rem;
  border-radius: 0.5rem;
}

/* Full-height sections */
.hero { min-height: 100dvh; } /* ✅ Use dvh to handle mobile browser chrome */
\`\`\`

**Recommendations:**
- **Font sizes:** \`rem\` — respects user preferences, predictable
- **Padding/margins:** \`rem\` (consistent) or \`em\` (proportional to component)
- **Widths:** \`%\`, \`vw\`, or \`clamp()\` for fluid layouts
- **Heights:** \`dvh\` for full-viewport sections, \`auto\` for content-driven height
- **Line length:** \`ch\` — \`max-width: 70ch\` for readable text
- **Border radius:** \`px\` — usually shouldn't scale with text size`,
      difficulty: "medium",
      tags: ["css", "units", "typography"],
      is_top50: true,
    },
    {
      question: "Explain the stacking context and how z-index works.",
      answer: `The stacking context is a three-dimensional conceptual model where elements are painted along the z-axis (front-to-back). Contrary to popular belief, \`z-index\` only works within the same stacking context:

\`\`\`css
/* Each of these creates a NEW stacking context: */
.element {
  position: relative / absolute / fixed / sticky;  /* + z-index set */
  opacity: less than 1;
  transform: any value besides none;
  filter: any value besides none;
  will-change: any property;
  mix-blend-mode: other than normal;
  isolation: isolate;           /* ✅ Intentional stacking context */
  container-type: any value;
  contain: paint / layout;
}

/* ── Example: z-index does NOT cross stacking contexts ── */

/* HTML:
  <div class="context-a">
    <div class="child" style="z-index: 999">Child A</div>
  </div>
  <div class="context-b">
    <div class="child" style="z-index: 1">Child B</div>
  </div>
*/

.context-a { position: relative; z-index: 1; opacity: 0.99; }
.context-b { position: relative; z-index: 2; }
/* Child A (z-index: 999) is INSIDE context-a (z-index: 1).
   Child B (z-index: 1) is INSIDE context-b (z-index: 2).
   Context-b paints on TOP of context-a, so Child B appears on top of Child A,
   even though Child A has a higher z-index! */
\`\`\`

**Painting order within a stacking context (back to front):**
1. Background and borders of the stacking context element
2. Negative z-index children (in z-index order)
3. In-flow, non-positioned descendants (in DOM order)
4. Floating descendants
5. In-flow, positioned descendants (in z-index order)
6. Stacking contexts with z-index: auto or 0

\`\`\`css
/* ── Practical z-index management ── */

/* Use a scale to prevent z-index wars */
:root {
  --z-dropdown:    100;
  --z-sticky:      200;
  --z-modal:       300;
  --z-tooltip:     400;
  --z-toast:       500;
}

/* Modals need their own stacking context to layer correctly */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  isolation: isolate;     /* Prevents modal content from interacting with page */
}

/* 📌 Golden rule: never use z-index: 9999 */
/* Instead, manage stacking contexts intentionally with isolation: isolate */\`\`\`

**Debugging stacking contexts in DevTools:**
- Chrome DevTools → Elements → Scroll down to "Stacking context" in the sidebar
- Look for elements with \`position\` + \`z-index\`, \`opacity < 1\`, \`transform\`, \`filter\`
- The root element (\`<html>\`) is always the root stacking context`,
      difficulty: "hard",
      tags: ["css", "stacking-context", "z-index"],
      is_top50: true,
    },
    {
      question: "What are container queries and how are they different from media queries?",
      answer: `Container queries allow components to respond to their **parent container's size** rather than the **viewport size**. This is a paradigm shift — components can be truly reusable regardless of where they're placed:

\`\`\`css
/* ── Define a containment context ── */

.card-grid {
  container-type: inline-size;    /* Responds to container's width changes */
  container-name: cards;          /* Named container for targeted queries */

  /* Shorthand: container: <name> / <type> */
  container: cards / inline-size;
}

/* ── Container query — styles apply when container is >= 400px ── */

@container cards (min-width: 400px) {
  .card {
    flex-direction: row;          /* Horizontal layout in wide containers */
  }
  .card-image {
    width: 200px;
  }
}

@container cards (min-width: 600px) {
  .card {
    grid-template-columns: 1fr 1fr;
  }
}
\`\`\`

**Practical example — responsive card in any context:**
\`\`\`css
/* Component styles are self-contained — no media queries needed */
.card-component {
  container: card / inline-size;
}

.card {
  display: flex;
  flex-direction: column;         /* Mobile: vertical by default */
  gap: 1rem;
}

/* Container-based breakpoints — component adapts to its parent */
@container card (min-width: 350px) {
  .card { flex-direction: row; }
  .card-image { width: 40%; }
}

@container card (min-width: 600px) {
  .card { padding: 2rem; }
  .card-title { font-size: 1.5rem; }
}

/* Same component used in sidebar (narrow) vs main content (wide) */
.sidebar .card { container: card / inline-size; }
.main-content .card { container: card / inline-size; }
/* Both respond to their OWN container's width, not the viewport */
\`\`\`

**Container queries vs media queries:**

| Aspect | Media Queries | Container Queries |
|--------|---------------|-------------------|
| Reference | Viewport / device | Nearest named container |
| Reusability | Component behavior changes by breakpoint | Component behaves the same everywhere |
| Component isolation | Breakpoints are global — fragile | Fully self-contained |
| Use case | Page layout, device-based changes | Component-level responsiveness |
| Browser support | Universal | ~85% (Chrome/FF/Safari 16+) |

**Container query length units:**
\`\`\`css
@container (min-width: 400px) {
  .element {
    width: 50cqw;   /* 50% of container's width */
    font-size: 5cqw;
    padding: 2cqi;  /* inline size of container */
  }
}
\`\`\`

> **Key insight:** Container queries enable "component-level responsiveness" — a card component that works equally well in a narrow sidebar, a wide main content area, or even inside another card. This was impossible with media queries alone.`,
      difficulty: "hard",
      tags: ["css", "container-queries", "responsive"],
      is_top50: true,
    },
    {
      question: "How do CSS animations work with @keyframes?",
      answer: `CSS animations allow you to animate between styles without JavaScript. They consist of two parts: the \`@keyframes\` definition (describing the animation sequence) and the \`animation\` property (configuring timing and behavior):

\`\`\`css
/* ── Define keyframes ── */

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  0%   { transform: translateX(-100%); opacity: 0; }
  50%  { transform: translateX(10%); opacity: 0.8; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.05); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes typing {
  from { width: 0; }
  to   { width: 100%; }
}

/* ── Apply animation ── */

.element {
  /* animation: name duration timing-function delay iteration-count direction fill-mode play-state */
  animation: fadeIn 0.3s ease-out;

  /* Longhand properties */
  animation-name: fadeIn;
  animation-duration: 0.3s;
  animation-timing-function: ease-out;
  animation-delay: 0s;
  animation-iteration-count: 1;
  animation-direction: normal;
  animation-fill-mode: forwards;   /* Keeps final state after animation ends */
  animation-play-state: running;

  /* Multiple animations */
  animation: fadeIn 0.3s ease-out, pulse 2s ease-in-out infinite;
}

/* ── Practical examples ── */

/* Loading spinner */
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e0e0e0;
  border-top-color: #4A90D9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Skeleton loading */
@keyframes shimmer {
  0%   { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}

/* Entrance animation with staggered delay */
.item { animation: fadeIn 0.3s ease-out forwards; opacity: 0; }
.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 100ms; }
.item:nth-child(3) { animation-delay: 200ms; }
/* Or with custom properties: */
.item { animation-delay: calc(var(--index) * 100ms); }
\`\`\`

**Animation properties explained:**

| Property | Values | Effect |
|----------|--------|--------|
| \`animation-duration\` | \`0.3s\`, \`300ms\` | How long one cycle takes |
| \`animation-timing-function\` | \`ease\`, \`linear\`, \`ease-in-out\`, \`cubic-bezier()\` | Speed curve |
| \`animation-delay\` | \`0s\`, \`-0.5s\` | Delay before start; negative starts mid-animation |
| \`animation-iteration-count\` | \`1\`, \`3\`, \`infinite\` | How many times to play |
| \`animation-direction\` | \`normal\`, \`reverse\`, \`alternate\`, \`alternate-reverse\` | Play direction |
| \`animation-fill-mode\` | \`none\`, \`forwards\`, \`backwards\`, \`both\` | Styles before/after animation |
| \`animation-play-state\` | \`running\`, \`paused\` | Pause/resume |

**Performance tip:** Only animate \`transform\` and \`opacity\` for GPU-accelerated, jank-free animations. Avoid animating \`width\`, \`height\`, \`top\`, \`left\`, \`margin\`, \`padding\` — these trigger layout recalculations.`,
      difficulty: "medium",
      tags: ["css", "animations", "keyframes"],
      is_top50: true,
    },
    {
      question: "What is the difference between CSS transitions and animations?",
      answer: `Transitions smoothly change between two states (usually triggered by a state change like :hover), while animations run independently with keyframed steps:

\`\`\`css
/* ── TRANSITIONS: state A → state B (triggered) ── */

.button {
  background: #4A90D9;
  transform: scale(1);
  /* transition: property duration timing-function delay */
  transition: background 0.2s ease, transform 0.15s ease;
  /* Shorthand: transition: all 0.2s ease (avoid "all" in production) */
}

.button:hover {
  background: #357ABD;
  transform: scale(1.05);
}

/* Transition timing functions */
.ease        { transition-timing-function: ease; }          /* slow → fast → slow */
.linear      { transition-timing-function: linear; }        /* constant speed */
.ease-in     { transition-timing-function: ease-in; }       /* slow → fast */
.ease-out    { transition-timing-function: ease-out; }      /* fast → slow */
.ease-in-out { transition-timing-function: ease-in-out; }   /* slow → fast → slow */
.cubic       { transition-timing-function: cubic-bezier(0.68, -0.55, 0.27, 1.55); } /* bounce */

/* Multiple elements with staggered transitions */
.item { transition: opacity 0.3s ease, transform 0.3s ease; transition-delay: calc(var(--index) * 50ms); }

/* ── ANIMATIONS: independent keyframed sequences ── */

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-20px); }
}

.bouncing-ball {
  animation: bounce 0.5s ease-in-out infinite;
  /* No trigger needed — runs automatically */
  /* Can loop, reverse, pause, play multiple steps */
}

/* ── Key differences ── */

/* Transitions can't do: */
.loop-example {
  /* ❌ Can't loop */
  /* ❌ Can't go backward automatically */
  /* ❌ Only two states (start/end) */
  /* ❌ Need a trigger (:hover, class change, JS) */
}

/* Animations can't do: */
.animation-example {
  /* ❌ No intermediate state from JS/class changes */
  /* ❌ More complex syntax for simple hovers */
}
\`\`\`

**When to use which:**

| Scenario | Use Transition | Use Animation |
|----------|---------------|---------------|
| Hover/focus effects | ✅ | ❌ (overkill) |
| Menu open/close | ✅ | ⚠️ Possible |
| Loading spinner | ❌ | ✅ |
| Entrance animations on page load | ❌ | ✅ |
| Bounce/pulse effects | ❌ | ✅ |
| Multi-step sequence | ❌ | ✅ |
| Infinite looping | ❌ | ✅ |
| State-driven UI (React state changes) | ✅ | ⚠️ |

\`\`\`javascript
// Triggering transitions via JavaScript
element.style.transform = 'translateX(100px)';  // Transition handles the animation
element.classList.add('visible');                // CSS transition from invisible to visible

// Triggering animations via JavaScript
element.style.animationPlayState = 'paused';     // Pause/resume
element.style.animation = 'none';                // Reset
void element.offsetHeight;                       // Force reflow
element.style.animation = 'slideIn 0.3s ease';   // Restart
\`\`\`

**Browser DevTools tip:** In Chrome DevTools → Elements → Styles, you can slow down animations (10x slower) and inspect animation keyframes in the Animations panel.`,
      difficulty: "medium",
      tags: ["css", "transitions", "animations"],
      is_top50: true,
    },
    {
      question: "How do CSS transforms work?",
      answer: `CSS transforms allow you to rotate, scale, skew, or translate an element without affecting the document layout. They are GPU-accelerated and ideal for smooth animations:

\`\`\`css
/* ── 2D Transforms ── */

.element {
  /* Translate (move) — x, y */
  transform: translateX(50px);       /* Move right 50px */
  transform: translateY(-20px);      /* Move up 20px */
  transform: translate(50px, -20px); /* Move both */

  /* Scale — ratio (1 = 100%) */
  transform: scale(1.5);            /* 150% size */
  transform: scaleX(2);             /* Double width */
  transform: scaleY(0.5);           /* Half height */
  transform: scale(1.5, 0.5);       /* Stretch horizontal, squish vertical */

  /* Rotate — degrees, rad, grad, turn */
  transform: rotate(45deg);          /* Clockwise 45° */
  transform: rotate(-90deg);         /* Counter-clockwise 90° */
  transform: rotate(0.5turn);        /* 180° */

  /* Skew — degrees */
  transform: skewX(10deg);           /* Tilt along X axis */
  transform: skewY(5deg);            /* Tilt along Y axis */
  transform: skew(10deg, 5deg);      /* Both */

  /* Multiple transforms — right-to-left order matters! */
  transform: translateX(50px) rotate(45deg) scale(1.2);
  /* ⚠️ Order: first rotate is applied to original position, THEN translate */
}

/* Transform origin — controls the pivot point */
.element {
  transform-origin: center;          /* default — middle of element */
  transform-origin: top left;        /* pivot from top-left corner */
  transform-origin: 20px 50px;       /* custom position */
}

/* ── 3D Transforms ── */

.element-3d {
  /* Requires perspective to be visible */
  perspective: 1000px;               /* On parent — creates 3D space */

  transform: rotateX(45deg);         /* Tilt toward/away */
  transform: rotateY(45deg);         /* Spin around vertical axis */
  transform: rotateZ(45deg);         /* Same as 2D rotate */
  transform: translateZ(50px);       /* Move toward viewer */
  transform: translate3d(x, y, z);   /* 3D translate shorthand */
  transform: scaleZ(2);              /* Rarely used */
  transform: matrix3d(...);          /* 4x4 matrix — for advanced users */
}

.parent-3d {
  perspective: 800px;
  perspective-origin: center;
  transform-style: preserve-3d;      /* Children maintain 3D positions */
}

.child-3d {
  transform: rotateY(45deg) translateZ(100px);
}

/* ── Practical examples ── */

/* Hover lift effect */
.card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}

/* Centering with translate (no need to know dimensions) */
.center-absolute {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Flip card */
.card-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
.card.flipped .card-inner { transform: rotateY(180deg); }
.card-front, .card-back {
  position: absolute;
  backface-visibility: hidden;
}
.card-back { transform: rotateY(180deg); }
\`\`\`

**Performance note:** Transforms only trigger compositing (GPU) — they don't cause layout or paint recalculations. This makes them the most performant way to animate position, size, and rotation. Always prefer \`transform: translate()\` over \`top\`/\`left\` for movement.`,
      difficulty: "medium",
      tags: ["css", "transforms", "performance"],
      is_top50: true,
    },
    {
      question: "Explain CSS selectors, combinators, and pseudo-classes.",
      answer: `CSS selectors determine which elements styles apply to. Mastering them reduces HTML bloat and keeps stylesheets maintainable:

\`\`\`css
/* ── Basic selectors ── */

*              { /* Universal — selects everything */ }
div            { /* Type/element selector */ }
.my-class      { /* Class selector */ }
#my-id         { /* ID selector — high specificity, use sparingly */ }
[type="text"]  { /* Attribute selector */ }
[class~="btn"] { /* Contains word "btn" in class list */ }
[href^="https"]{ /* Starts with "https" */ }
[src$=".jpg"]  { /* Ends with ".jpg" */ }
[data-*="val"] { /* Contains "val" anywhere */ }

/* ── Combinators ── */

div p          { /* Descendant — p anywhere inside div */ }
div > p        { /* Child — p is direct child of div */ }
h2 ~ p         { /* General sibling — p after h2 (same parent) */ }
h2 + p         { /* Adjacent sibling — p immediately after h2 */ }

/* ── Pseudo-classes (state/position) ── */

:hover          { /* Mouse hover */ }
:focus          { /* Element has focus */ }
:focus-visible   { /* Focus via keyboard (not mouse click) */ }
:active         { /* Being clicked/activated */ }
:disabled       { /* Disabled input */ }
:checked        { /* Checked checkbox/radio */ }
:empty          { /* No children */ }
:target         { /* Matches URL hash fragment */ }

/* Structural pseudo-classes */
:first-child    { /* First child of parent */ }
:last-child     { /* Last child of parent */ }
:nth-child(2)   { /* Second child */ }
:nth-child(odd) { /* Odd children */ }
:nth-child(3n+1){ /* Every 3rd starting from 1st */ }
:nth-last-child(2) { /* Second from last */ }
:first-of-type  { /* First of its element type */ }
:only-child     { /* Only child of parent */ }

/* Form pseudo-classes */
:required       { /* Input with required attribute */ }
:optional       { /* Input without required */ }
:valid          { /* Input with valid value */ }
:invalid        { /* Input with invalid value */ }
:in-range       { /* Number in range */ }
:placeholder-shown { /* Placeholder is visible */ }

/* ── Pseudo-elements (parts of elements) ── */

::before        { /* First child of element — content: '' required */ }
::after         { /* Last child of element — content: '' required */ }
::first-letter  { /* First letter of block */ }
::first-line    { /* First line of block */ }
::selection     { /* User-selected text */ }
::placeholder   { /* Input placeholder text */ }
::marker        { /* List marker (bullets/numbers) */ }

/* ── Modern pseudo-classes ── */

:is(.card, .panel) h2 { /* Matches .card h2 OR .panel h2 — sugar for grouping */ }
:where(.card, .panel) h2 { /* Same but 0 specificity */ }
:has(img)       { /* Parent that contains an img — "parent selector" */ }
:not(.disabled) { /* Elements without .disabled class */ }

/* ── Practical patterns using selectors ── */

/* Style everything except the last item */
.item:not(:last-child) { border-bottom: 1px solid #eee; }

/* Style alternating rows */
tr:nth-child(even) { background: #f5f5f5; }

/* Style based on data attributes */
[data-state="active"] { background: #4A90D9; color: white; }

/* Clean sticky footer with :has() — pure CSS */
body:has(footer) { min-height: 100vh; display: flex; flex-direction: column; }
main { flex: 1; }

/* Style labels only when input is focused */
label:has(+ input:focus) { color: #4A90D9; }

/* Remove margin from last child (no more .last-child hacks) */
.stack > *:not(:last-child) { margin-bottom: 1rem; }
/* Or even cleaner: */
.stack { display: flex; flex-direction: column; gap: 1rem; }
\`\`\`

**Selector performance tips:**
- Browsers parse selectors right-to-left — \`.nav a\` first finds all \`a\` elements, then filters by \`.nav\` ancestors
- Keep selectors short — avoid \`div.nav > ul.list > li.item a.link\`
- Use classes over complex descendant selectors for better performance and maintainability`,
      difficulty: "medium",
      tags: ["css", "selectors", "pseudo-classes"],
      is_top50: true,
    },
    {
      question: "What are CSS pseudo-elements and how are they used?",
      answer: `Pseudo-elements target specific parts of an element or insert content before/after an element. Unlike pseudo-classes (which describe state), pseudo-elements create virtual elements:

\`\`\`css
/* ── ::before and ::after (most commonly used) ── */

.icon-link::before {
  content: "→ ";           /* Required — can be empty string */
  /* Can't use HTML — only text or URLs */
}

.icon-link::after {
  content: url("arrow.svg"); /* Can use images */
  display: inline-block;
  margin-left: 4px;
}

/* Clearfix hack (before modern overflow/display approaches) */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

/* Tooltip with ::after */
.tooltip {
  position: relative;
}
.tooltip::after {
  content: attr(data-tooltip);  /* Reads attribute value */
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
.tooltip:hover::after { opacity: 1; }

/* Decorative quote */
blockquote::before {
  content: "\\201C";          /* Opening curly quote */
  font-size: 3em;
  color: #ccc;
  line-height: 0;
  vertical-align: -0.4em;
}
blockquote::after {
  content: "\\201D";          /* Closing curly quote */
  font-size: 3em;
  color: #ccc;
  line-height: 0;
  vertical-align: -0.2em;
}

/* ── ::first-letter and ::first-line ── */

p::first-letter {
  font-size: 3em;
  font-weight: bold;
  float: left;
  margin-right: 8px;
  color: #4A90D9;
}

p::first-line {
  font-variant: small-caps;
}

/* ── ::selection ── */

::selection {
  background: #4A90D9;
  color: white;
}

/* ── ::placeholder ── */

input::placeholder {
  color: #999;
  font-style: italic;
  opacity: 1;              /* Firefox defaults to lower opacity */
}

/* ── ::marker ── */

li::marker {
  color: #4A90D9;
  font-weight: bold;
}

/* ── ::backdrop (fullscreen elements, dialogs) ── */

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
\`\`\`

**Key limitations of ::before and ::after:**
- \`content\` property is required — use \`""\` for purely decorative elements
- They are **inline** by default — set \`display: block\` or \`inline-block\` for sizing
- Cannot use HTML inside content — only text, URLs, or \`attr()\`
- Pseudo-elements on replaced elements (\`<img>\`, \`<input>\`, \`<select>\`) don't work in most browsers
- They are **not** part of the DOM — not accessible to JavaScript \`querySelector\``,
      difficulty: "medium",
      tags: ["css", "pseudo-elements", "selectors"],
      is_top50: true,
    },
    {
      question: "What are CSS functions like calc(), min(), max(), and clamp()?",
      answer: `CSS mathematical functions perform calculations directly in stylesheets, enabling fluid layouts without JavaScript:

\`\`\`css
/* ── calc() — basic arithmetic ── */

.element {
  /* Can mix units */
  width: calc(100% - 40px);           /* Full width minus fixed sidebar */
  height: calc(100vh - 80px);         /* Viewport minus header + footer */
  padding: calc(1rem + 2vw);          /* Scales with both font-size and viewport */
  font-size: calc(14px + 0.5vw);      /* Minimum 14px + fluid scaling */
}

/* calc() in grid/flex */
.grid {
  grid-template-columns: 1fr calc(300px + 2rem);
  gap: calc(1rem * 2);               /* Math with same units */
}

/* ── min() — pick the SMALLEST value ── */

.element {
  width: min(100%, 800px);           /* Full width up to 800px — behaves like max-width */
  font-size: min(5vw, 2rem);         /* Scales up to 2rem at most */
  padding: min(2rem, 4vw);           /* 4vw but capped at 2rem */
}

/* Responsive container with min() — no media query needed */
.container {
  width: min(100% - 2rem, 1200px);   /* Fluid with padding + cap */
  margin-inline: auto;
}

/* ── max() — pick the LARGEST value ── */

.element {
  width: max(300px, 50%);            /* At least 300px wide */
  font-size: max(16px, 2vw);         /* Never smaller than 16px */
  padding: max(1rem, 3vw);
}

/* ── clamp() — combine min, preferred, max ── */

.element {
  /* clamp(MIN, PREFERRED, MAX) */
  font-size: clamp(1rem, 0.5rem + 2vw, 2rem);
  /* Minimum 1rem, grows fluidly, maximum 2rem */

  width: clamp(280px, 80%, 1200px);  /* Fluid container */
  padding: clamp(1rem, 3vw, 3rem);   /* Fluid padding */

  /* Fluid typography scale */
  --step-0: clamp(1rem, 0.5rem + 1vw, 1.125rem);     /* 16-18px */
  --step-1: clamp(1.25rem, 1rem + 2vw, 1.5rem);       /* 20-24px */
  --step-2: clamp(1.5rem, 1rem + 3vw, 2rem);          /* 24-32px */
  --step-3: clamp(2rem, 1rem + 4vw, 2.5rem);          /* 32-40px */
}

/* ── Practical pattern: fluid card grid ── */

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(200px, 30%, 300px), 1fr));
  gap: clamp(1rem, 2vw, 2rem);
}

/* ── Comparison table ── */

| Function | Returns | Use case |
|----------|---------|----------|
| \`calc()\` | Arithmetic result | Mixing units, dynamic calculations |
| \`min()\` | Smallest value | Max-width behavior, size caps |
| \`max()\` | Largest value | Min-width behavior, size floors |
| \`clamp()\` | Clamped value | Fluid typography, responsive sizing |

/* ── Other useful CSS functions ── */

/* Color functions */
color-mix(in srgb, red 50%, blue);   /* Mix colors */
rgb(100, 100, 200);                  /* RGB */
hsl(220, 80%, 50%);                  /* HSL — most intuitive */
oklch(50%, 0.2, 250);                /* Modern perceptually uniform color */

/* Filter effects */
filter: brightness(1.5) contrast(0.8) blur(2px);

/* Background gradients */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Shape functions */
clip-path: circle(50%);              /* Make element circular */
clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); /* Diamond */\`\`\`

**Browser support:** \`calc()\` — universal. \`min()\`, \`max()\`, \`clamp()\` — all modern browsers (IE not supported).`,
      difficulty: "medium",
      tags: ["css", "functions", "responsive"],
      is_top50: true,
    },
    {
      question: "Explain CSS @layer and the cascade layer system.",
      answer: `CSS \`@layer\` lets you explicitly control the cascade order of style origins, giving you power over precedence without fighting specificity wars:

\`\`\`css
/* ── Define layer order (first declaration = lowest priority) ── */
@layer reset, base, components, utilities, overrides;

/* ── Populate layers ── */

@layer reset {
  /* Lowest priority — resets and normalize */
  *, *::before, *::after { box-sizing: border-box; margin: 0; }
  body { line-height: 1.6; -webkit-font-smoothing: antialiased; }
}

@layer base {
  /* Base styles — typography, colors, links */
  body { font-family: system-ui, sans-serif; color: #333; }
  a { color: #4A90D9; text-decoration: none; }
  h1 { font-size: 2rem; font-weight: 700; }
}

@layer components {
  /* Component styles — cards, buttons, forms */
  .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
  .btn { display: inline-flex; align-items: center; padding: 0.5rem 1rem; border-radius: 6px; }
}

@layer utilities {
  /* Utility classes — spacing, typography helpers */
  .mt-4 { margin-top: 1rem; }
  .text-center { text-align: center; }
}

@layer overrides {
  /* Highest priority within layers — specific overrides */
  .btn-primary { background: #4A90D9; color: white; }
}

/* ── Nested layers ── */

@layer components {
  @layer cards, buttons, forms;

  @layer cards {
    .card { border: 1px solid #ddd; }
  }
  @layer buttons {
    .btn { background: transparent; }
  }
}
/* References: components.cards, components.buttons */

/* ── Anonymous layers ── */

@layer {
  /* No name — useful for third-party imports */
  @import url("legacy.css");
}

/* ── Layer priority demonstration ── */

/* Without @layer, this would override everything (high specificity + later in source) */
@layer overrides {
  .card { border-color: red; } /* Same specificity, but higher layer priority */
}

/* Outside any layer — highest priority (unlayered styles) */
.special-badge { background: gold; }
/* Unlayered styles beat all layered styles, regardless of specificity */
\`\`\`

**Cascade order with @layer (highest to lowest):**
1. Transition declarations
2. **!important** — unlayered (highest), then layered (in layer order)
3. Animation declarations
4. **Normal** — unlayered, then layered (in layer order — first declared = lowest)
5. User-agent styles (browser defaults)

**Why @layer is a game-changer:**

| Problem | Before @layer | After @layer |
|---------|--------------|--------------|
| Third-party CSS overrides your styles | Use \`!important\` or higher specificity | Import in a lower-priority layer |
| Reset vs component ordering | Careful import order | Declare \`reset\` first in layer list |
| Specificity escalation | \`#id .class .another-class\` | Layers handle priority — low specificity is fine |
| Unlayered overrides all layers | N/A | Keep hotfixes unlayered for emergencies |

\`\`\`css
/* ── Practical: importing third-party CSS in a low-priority layer ── */

@layer reset, components, overrides;

@layer reset {
  /* Normalize.css in reset layer — can't override our components */
  @import url("normalize.css");
}

@layer components {
  @import url("bootstrap.css"); /* Bootstrap won't override our utilities */
}

@layer overrides {
  /* Our custom styles beat both normalize and bootstrap */
}
\`\`\``,
      difficulty: "hard",
      tags: ["css", "cascade", "layers"],
      is_top50: true,
    },
    {
      question: "What is CSS nesting and how does it work?",
      answer: `CSS nesting (officially the CSS Nesting Module) lets you nest selectors inside other selectors, mirroring HTML structure. It's now natively supported in browsers (Chrome 120+, Safari 17.2+, Firefox 117+):

\`\`\`css
/* ── Without nesting (traditional) ── */
.card { border: 1px solid #ddd; border-radius: 8px; }
.card h2 { font-size: 1.25rem; }
.card p { color: #666; }
.card .badge { background: #4A90D9; color: white; }
.card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

/* ── With nesting ── */
.card {
  border: 1px solid #ddd;
  border-radius: 8px;

  /* Direct nesting (no & needed for compound selectors) */
  h2 { font-size: 1.25rem; }
  p { color: #666; }

  /* & references the parent selector */
  .badge { background: #4A90D9; color: white; }

  /* Pseudo-classes and pseudo-elements use & */
  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  &::before { content: "★"; }

  /* Nested media queries (no more separate blocks!) */
  @media (width >= 640px) {
    display: flex;
    gap: 1rem;
  }
}

/* ── More nesting patterns ── */

.card-list {
  display: grid;
  gap: 1rem;

  /* Compound selectors */
  .card {
    border: 1px solid #ddd;

    /* Deep nesting */
    .title { font-weight: bold; }
    .meta { font-size: 0.875rem; color: #666; }

    /* Sibling selector with & */
    & + & { margin-top: 0; }  /* .card + .card */
  }
}

/* ── Complex selectors with & ── */

.button {
  /* & can appear anywhere in the selector */
  .dark & { background: white; color: black; }    /* .dark .button */

  /* Adjacent sibling */
  & + & { margin-left: 8px; }                     /* .button + .button */

  /* Multiple & usage */
  &.active & { /* .button.active .button */ }

  /* Concatenation (Sass-like) */
  &-icon { /* ❌ NOT valid in native CSS nesting — use .button-icon instead */ }
}

/* ── @ nesting ── */
/* Some at-rules can also be nested: */
.element {
  @media (width <= 600px) { font-size: 0.875rem; }
  @supports (display: grid) { display: grid; }
  @container (min-width: 400px) { flex-direction: row; }
}

/* ── Comparison: Sass vs Native CSS ── */

/* Sass nesting */
.card {
  &__title { font-size: 1.25rem; }    /* BEM → .card__title */
  &--featured { border-color: gold; } /* BEM → .card--featured */
}

/* Native CSS — can't use & for concatenation, use separate selectors */
.card__title { font-size: 1.25rem; }
.card--featured { border-color: gold; }
\`\`\`

**Key rules:**
- Nesting starts with a \`&\` or a relative selector (\`h2\`, \`.class\`, \`[attr]\`)
- \`&\` always refers to the parent selector
- CSS nesting is **less powerful than Sass** — no \`&-element\` for BEM concatenation
- Max nesting depth: 3-4 levels recommended (deeper nesting creates overly specific selectors)
- Nesting doesn't change specificity — \`.card h2\` still has (0,0,1,1) whether nested or not`,
      difficulty: "medium",
      tags: ["css", "nesting", "modern-css"],
      is_top50: true,
    },
    {
      question: "What is the :has() selector and why is it called the 'parent selector'?",
      answer: `The \`:has()\` pseudo-class selects an element based on whether it **contains** (or is followed by) a specific element. It's often called the "parent selector" because it lets you style a parent based on its children:

\`\`\`css
/* ── Basic usage: style parent based on children ── */

/* Style cards that contain an image */
.card:has(img) { grid-column: span 2; }

/* Style a form field when its input is invalid */
.field:has(input:invalid) .error-message { display: block; }

/* Style a section when it has a specific child */
.sidebar:has(.active-link) { background: #f0f4ff; }

/* ── Style based on descendants ── */

/* Style the <body> when a modal is open */
body:has(.modal-open) { overflow: hidden; }

/* Style a list when it has more than 3 items (using :nth-child) */
ul:has(li:nth-child(4)) { column-count: 2; }

/* ── Style based on following siblings (forward-looking!) ── */

/* Previous sibling — impossible before :has() */
label:has(+ input:focus) { color: #4A90D9; }

/* Style a section that is followed by a related section */
.intro:has(+ .details) { border-bottom: 2px solid #eee; }

/* ── Form interaction patterns ── */

/* Highlight the entire form group when input is focused */
.form-group:has(input:focus) {
  border-color: #4A90D9;
  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.15);
}

/* Show a character counter only when input has content */
.field:has(textarea:placeholder-shown) .char-count { display: none; }

/* ── Conditional layout patterns ── */

/* Different layout when sidebar has sub-items */
.sidebar:has(.sub-menu) { padding-bottom: 2rem; }

/* Grid areas that adjust based on content */
.grid:has(.featured-card) {
  grid-template-columns: 2fr 1fr;
}

/* ── Combining with :not() and other selectors ── */

/* Cards that have an image AND are not the first child */
.card:has(img):not(:first-child) { margin-top: 2rem; }

/* Rows where a specific cell is selected */
tr:has(td.selected) { background: #fffbe6; }

/* ── Practical real-world use case: sticky sidebar ── */

/* Only make the sidebar sticky if the content is taller than it */
.layout:has(.content-long) .sidebar {
  position: sticky;
  top: 2rem;
}
\`\`\`

**Browser support:** \`:has()\` was the last major CSS feature to arrive — now supported in all modern browsers (Chrome 105+, Safari 15.4+, Firefox 121+).

**Performance note:** \`:has()\` can be expensive for the browser, especially when deeply nested or combined with other selectors. Keep selectors simple and avoid \`:has()\` inside \`:has()\`. Prefer class-based solutions for performance-critical paths, and use \`:has()\` as progressive enhancement.

**What makes :has() revolutionary:**
- First "parent selector" in CSS history
- Enables "container-agnostic" component styling (style based on content, not context)
- Eliminates many JavaScript DOM-checking patterns
- Reduces need for conditional CSS classes in frameworks`,
      difficulty: "hard",
      tags: ["css", "selectors", "has"],
      is_top50: true,
    },
    {
      question: "What is the aspect-ratio property in CSS?",
      answer: `The \`aspect-ratio\` property sets a preferred aspect ratio for an element, automatically calculating the height based on the width (or vice versa). It solves the common problem of maintaining consistent media sizing:

\`\`\`css
/* ── Basic usage ── */

/* Fixed aspect ratio — width drives height */
.video-container {
  aspect-ratio: 16 / 9;
  /* If width is 800px, height = 800 * 9/16 = 450px */
}

/* Square */
.avatar {
  width: 100px;
  aspect-ratio: 1;           /* 1/1 = square */
  border-radius: 50%;
  object-fit: cover;
}

/* Portrait */
.portrait-card {
  width: 300px;
  aspect-ratio: 3 / 4;       /* 3:4 portrait ratio */
}

/* ── Responsive with min/max constraints ── */

.responsive-media {
  width: 100%;
  max-width: 800px;
  aspect-ratio: 16 / 9;
  /* Height auto-calculates: if max-width is hit, height = 800 * 9/16 = 450px */
}

/* ── With object-fit for images ── */

.image-gallery img {
  width: 100%;
  height: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;          /* Crop to fill, maintains ratio */
  /* object-fit: contain — fits entire image, may have letterboxing */
  /* object-fit: fill — stretches, may distort */
}

/* ── Comparison: old padding-bottom hack vs aspect-ratio ── */

/* ❌ OLD: padding-bottom percentage hack */
.video-old {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;    /* 9/16 * 100 = 56.25% */
}
.video-old iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* ✅ NEW: aspect-ratio */
.video-new {
  width: 100%;
  aspect-ratio: 16 / 9;
}
.video-new iframe {
  width: 100%;
  height: 100%;
}

/* ── Auto height behavior ── */

/* Performs like "contain" — size based on content */
.auto-aspect {
  aspect-ratio: auto;        /* Default — use intrinsic dimensions */
}

/* If both width and height are set, aspect-ratio is ignored */
.fixed-size {
  width: 300px;
  height: 200px;
  aspect-ratio: 16 / 9;     /* ❌ No effect — both dimensions already set */
}
\`\`\`

**Key behaviors:**
- \`aspect-ratio\` is applied **only** when one dimension (width or height) is set to \`auto\` (default)
- If both dimensions are set, the aspect-ratio is ignored
- The property doesn't guarantee the exact ratio — it's the **preferred** ratio
- Combined with \`object-fit\`, it creates perfect image grids without JavaScript

**Use cases:**
- YouTube-embeds / video containers (16:9, 4:3)
- Image galleries with uniform ratios
- Avatar/profile photos (1:1)
- Product cards in e-commerce
- Hero sections with background images`,
      difficulty: "easy",
      tags: ["css", "aspect-ratio", "layout"],
      is_top50: true,
    },
    {
      question: "What are object-fit and object-position in CSS?",
      answer: `The \`object-fit\` and \`object-position\` properties control how replaced elements (\`<img>\`, \`<video>\`, \`<canvas>\`) fill their container. They're essential for responsive images that maintain their aspect ratio:

\`\`\`css
/* ── object-fit options ── */

.image {
  width: 300px;
  height: 200px;

  object-fit: fill;          /* Default — stretches to fill, may distort */
  object-fit: contain;       /* Fits entirely (may leave letterboxing) */
  object-fit: cover;         /* Covers container (may crop edges) — most common for thumbnails */
  object-fit: none;          /* Natural size, centered — overflows or underflows */
  object-fit: scale-down;    /* Smaller of contain or none — never upscales */
}

/* ── Visual comparison ── */
\`\`\`
Original image: 800×600 (4:3)

┌──────────────────────┐  ┌──────────────────────┐
│  fill (stretched)    │  │  contain (fits)      │
│  ────────────────    │  │    ┌──────┐          │
│  ────────────────    │  │    │  img │          │
│  ────────────────    │  │    └──────┘          │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│  cover (crops)       │  │  none (natural)      │
│  ┌─────────┐         │  │  ┌──────────────┐    │
│  │  img    │         │  │  │    img       │    │
│  └─────────┘         │  │  └──────────────┘    │
└──────────────────────┘  └──────────────────────┘
\`\`\`

\`\`\`css
/* ── object-position ── */

.image {
  object-fit: cover;
  object-position: center;         /* Default */
  object-position: top;
  object-position: bottom;
  object-position: left;
  object-position: right;
  object-position: 20% 80%;        /* Custom — 20% from left, 80% from top */
  object-position: 10px 20px;      /* Absolute offset */
}

/* ── Practical patterns ── */

/* Perfect avatar circle — always centered and cropped */
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
}

/* Product gallery — focus on the top of the image (e.g., faces) */
.product-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  object-position: center 20%;  /* Crop from top, focus on upper portion */
}

/* Hero banner — always show the center-important part */
.hero-image {
  width: 100%;
  height: 60vh;
  object-fit: cover;
  object-position: center 30%;  /* Shift focus point for different compositions */
}

/* ── Responsive focal point with CSS variables ── */

img[data-focus-x] {
  object-position: calc(var(--focus-x, 50) * 1%) calc(var(--focus-y, 50) * 1%);
}
/* HTML: <img src="photo.jpg" style="--focus-x: 30; --focus-y: 60;" /> */
\`\`\`

**Replaced elements that support object-fit:**
- \`<img>\`
- \`<video>\`
- \`<canvas>\`
- \`<iframe>\` (partial support)
- \`<embed>\` and \`<object>\`

**Comparison with \`background-size\`:**
\`\`\`css
/* Similar to object-fit but for background images */
.element {
  background-size: cover;   /* Same as object-fit: cover */
  background-size: contain; /* Same as object-fit: contain */
  background-position: center; /* Same as object-position: center */
}
\`\`\`

> **Key difference:** \`object-fit\` works on the HTML element itself (\`<img>\`), while \`background-size\` works on the CSS background. Use \`object-fit\` when the image is content (part of the document), \`background-size\` when it's decorative (CSS background).`,
      difficulty: "easy",
      tags: ["css", "images", "object-fit"],
      is_top50: true,
    },
    {
      question: "How do CSS backgrounds and gradients work?",
      answer: `CSS backgrounds can be solid colors, gradients, images, or combinations. Modern CSS supports complex multi-layer backgrounds with powerful gradient functions:

\`\`\`css
/* ── Background basics ── */

.element {
  /* Single background */
  background: #f5f5f5;

  /* Background shorthand */
  background: url("hero.jpg") center/cover no-repeat;

  /* Longhand properties */
  background-color: #f5f5f5;
  background-image: url("pattern.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  background-attachment: fixed;   /* Parallax effect */
  background-clip: padding-box;   /* Where background extends */
  background-origin: padding-box; /* Where background-position starts */
}

/* ── Linear Gradients ── */

.gradient-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.gradient-2 {
  background: linear-gradient(to right, #f857a6, #ff5858);
}
.gradient-3 {
  background: linear-gradient(90deg, #4A90D9 0%, #4A90D9 50%, transparent 50%);
  /* Hard stop — creates a sharp color boundary */
}

/* ── Radial Gradients ── */

.gradient-radial {
  background: radial-gradient(circle at center, #ff7e5f, #feb47b);
}

.gradient-radial-2 {
  background: radial-gradient(ellipse at top, #e66465, transparent),
              radial-gradient(ellipse at bottom, #4AC9A6, transparent);
}

/* ── Conic Gradients ── */

.gradient-conic {
  background: conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red);
}

/* Color wheel */
.color-wheel {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);
}

/* ── Multiple backgrounds ── */

.multi-bg {
  background:
    url("stars.png") repeat,
    linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  /* First layer is on TOP, last is on BOTTOM */
}

/* ── Practical patterns ── */

/* Subtle noise texture */
.noise-bg {
  background:
    url("data:image/svg+xml,...noise...") repeat,
    linear-gradient(135deg, #667eea, #764ba2);
}

/* Gradient overlay on image */
.hero-overlay {
  background:
    linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
    url("hero.jpg") center/cover;
}

/* Glass morphism */
.glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Checkerboard pattern */
.checkerboard {
  background:
    conic-gradient(#ccc 0 25%, transparent 0 50%, #ccc 0 75%, transparent 0) 0 0 / 20px 20px;
}

/* ── Background attachment ── */

/* Fixed background = parallax effect */
.parallax-section {
  background: url("background.jpg") center/cover fixed;
  /* Scrolling content moves over the fixed background */
}

/* Local = scrolls with content */
.local-bg {
  background-attachment: local;
}
\`\`\`

**Performance notes:**
- Gradients are generated by the browser — no additional network requests
- Multiple backgrounds add paint cost — use sparingly on scrolling content
- \`background-attachment: fixed\` can cause repaint performance issues on mobile — test carefully
- Use \`will-change: transform\` on parallax elements for GPU acceleration`,
      difficulty: "medium",
      tags: ["css", "backgrounds", "gradients"],
      is_top50: true,
    },
    {
      question: "How does the CSS cascade and inheritance work?",
      answer: `The CSS cascade determines which styles apply when multiple rules conflict. Understanding the cascade is essential for debugging CSS:

\`\`\`css
/* ── Cascade priority (highest to lowest) ── */

/*
1. Transition declarations
2. !important declarations (from browser, user, author)
3. Animation declarations
4. Normal declarations (author → user → browser)
   Within author:
   a. @layer order (last declared layer = higher priority)
   b. Specificity (inline > ID > class > element)
   c. Source order (last one wins)
*/

/* ── Inheritance ── */

/* Some properties inherit automatically */
.parent {
  color: #333;              /* ✅ Inherited by children */
  font-family: system-ui;   /* ✅ Inherited */
  font-size: 16px;          /* ✅ Inherited */
  line-height: 1.5;         /* ✅ Inherited */
  border: 1px solid red;    /* ❌ NOT inherited — children don't get red border */
  padding: 20px;            /* ❌ NOT inherited */
  margin: 10px;             /* ❌ NOT inherited */
}

/* Implicit vs explicit inheritance */
.child {
  color: inherit;           /* Forces inheritance even for non-inherited props */
  border: inherit;          /* Now the border is inherited */
  color: initial;           /* Resets to browser default (usually black) */
  color: unset;             /* inherit if property inherits, initial otherwise */
  color: revert;            /* Resets to browser's default stylesheet value */
}

/* ── Practical cascade management ── */

/* Problem: specificity wars */
#content .widget .card .title { color: red; }     /* (0,1,3,0) */
.title { color: blue; }                            /* (0,0,1,0) — loses */

/* Solutions: */

/* 1. Use @layer to control priority without high specificity */
@layer base, components;
@layer components {
  .title { color: blue; }  /* Beats .title { color: red } in a lower layer */
}

/* 2. Use :where() for zero specificity */
:where(#content .widget .card) .title { color: green; } /* (0,0,1,0) */

/* 3. Source order — last rule wins with equal specificity */
.btn { background: blue; }
.btn { background: red; }    /* Red wins — it's later */

/* ── @layer cascade demonstration ── */

@layer reset, base, utilities;

/* Declared first = lowest priority */
@layer reset {
  h1 { margin: 0; font-size: 1rem; }
}

@layer base {
  h1 { font-size: 2rem; margin: 1em 0; } /* Wins in base layer */
}

@layer utilities {
  h1 { font-size: 3rem; }  /* Wins over base within layers */
}

/* Unlayered styles win over ALL layered styles */
h1 { font-size: 4rem; }    /* Highest — overrides all layers */
\`\`\`

**Properties that inherit by default:**
- \`color\`, \`font-*\`, \`text-*\`, \`line-height\`, \`letter-spacing\`, \`word-spacing\`, \`white-space\`, \`visibility\`, \`cursor\`, \`list-style\`

**Properties that do NOT inherit:**
- \`width\`, \`height\`, \`margin\`, \`padding\`, \`border\`, \`background\`, \`position\`, \`display\`, \`overflow\`, \`transform\`, \`animation\`

**Best practices:**
- Set \`color\` and \`font-family\` on \`body\` — they cascade automatically
- Use \`inherit\` intentionally (e.g., \`button { font: inherit; }\` to fix form elements)
- Use \`initial\` to reset to spec default (often not what you want — \`unset\` is safer)
- Prefer \`@layer\` over escalating specificity`,
      difficulty: "medium",
      tags: ["css", "cascade", "inheritance"],
      is_top50: true,
    },
    {
      question: "What are CSS preprocessors (Sass, Less) and when should you use them?",
      answer: `CSS preprocessors extend CSS with programming features like variables, nesting, mixins, functions, and logic. They compile to standard CSS. While modern CSS has adopted many of these features natively, preprocessors still offer unique capabilities:

\`\`\`scss
// ── Sass features ──

// Variables (compiled away — unlike CSS custom properties)
$primary: #4A90D9;
$spacing-unit: 8px;
$breakpoint-md: 768px;

// Nesting
.card {
  border: 1px solid #ddd;
  padding: $spacing-unit * 2;

  &__title {
    font-size: 1.25rem;
    color: $primary;
  }

  &--featured {
    border-color: $primary;
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

// Mixins — reusable blocks (still unique to preprocessors)
@mixin respond-to($breakpoint) {
  @media (min-width: $breakpoint) {
    @content;
  }
}

@mixin button-variant($bg, $color: white) {
  background: $bg;
  color: $color;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: darken($bg, 10%);
  }
}

.btn-primary { @include button-variant($primary); }
.btn-danger  { @include button-variant(#e74c3c); }

// Use with @content
.card {
  @include respond-to($breakpoint-md) {
    display: flex;
    gap: 16px;
  }
}

// Functions
@function spacing($multiplier) {
  @return $spacing-unit * $multiplier;
}

.element { padding: spacing(3); } // = 24px

// Loops and conditionals
@each $color, $value in (primary: #4A90D9, success: #27ae60, danger: #e74c3c) {
  .btn-#{$color} {
    background: $value;
    &:hover { background: darken($value, 10%); }
  }
}

@for $i from 1 through 4 {
  .mt-#{$i} { margin-top: $spacing-unit * $i; }
}
\`\`\`

**Preprocessors vs Modern CSS:**

| Feature | Sass/Less | Modern CSS |
|---------|-----------|------------|
| Variables | ✅ Build-time, compiled | ✅ Runtime, cascade-aware, JS-accessible |
| Nesting | ✅ Full support, BEM concatenation | ✅ Native (no BEM concat) |
| Mixins | ✅ With parameters | ❌ Not yet (but @apply proposed) |
| Functions | ✅ darken(), lighten(), custom | ✅ color-mix(), custom via @property |
| Loops | ✅ @each, @for | ❌ Not available |
| Conditionals | ✅ @if/@else | ❌ Not available (except @media/@supports) |
| Math | ✅ Full arithmetic | ✅ calc(), min(), max(), clamp() |
| Color manipulation | ✅ darken/lighten/mix/tint | ✅ color-mix(), oklch |

**When to use preprocessors:**
- ✅ Large codebases with design tokens that benefit from loops/mixins
- ✅ Teams already invested in Sass/Less tooling
- ✅ When you need color manipulation (darken, lighten, mix) — though \`color-mix()\` is catching up
- ✅ Older projects that can't migrate to modern CSS pipelines

**When NOT to use preprocessors:**
- ❌ New projects — modern CSS nesting + custom properties + layers cover most needs
- ❌ Runtime theming — CSS custom properties are far superior
- ❌ Simple sites — the build step adds unnecessary complexity

> **Current recommendation:** Use native CSS features by default (nesting, custom properties, \`:has()\`, \`@layer\`), and reach for Sass only when you genuinely need loops, mixins with logic, or parameterized functions that CSS can't provide.`,
      difficulty: "medium",
      tags: ["css", "preprocessors", "sass"],
      is_top50: true,
    },
    {
      question: "Explain CSS methodologies like BEM, SMACSS, and utility-first CSS.",
      answer: `CSS methodologies provide naming conventions and organization patterns to keep styles maintainable at scale:

\`\`\`css
/* ── BEM (Block Element Modifier) ── */

/* Block — standalone component */
.card { }

/* Element — part of a block (double underscore) */
.card__title { }
.card__image { }
.card__action { }

/* Modifier — variation of a block/element (double dash) */
.card--featured { }
.card__title--large { }
.card--dark .card__title { }

/* HTML: <div class="card card--featured">
          <h2 class="card__title card__title--large">Title</h2>
          <button class="card__action">Click</button>
        </div> */

/* Pros: Predictable, no specificity issues, self-documenting */
/* Cons: Verbose HTML, class names can be long */

/* ── Utility-first CSS (Tailwind CSS) ── */

/* Instead of component classes, use atomic utilities in HTML */
/* HTML: <div class="flex items-center gap-4 p-6 rounded-xl shadow-md border border-gray-200"> */

/* Pros: No naming, tiny CSS bundles, consistent design system */
/* Cons: Verbose HTML, learning curve, "looks like inline styles" criticism */

/* Custom utilities in Tailwind */
@layer utilities {
  .content-auto { content-visibility: auto; }
}

/* ── SMACSS (Scalable and Modular Architecture for CSS) ── */

/* Categories:
   Base — defaults (reset, typography)
   Layout — major components (header, footer, grid)
   Module — reusable components (card, nav)
   State — dynamic states (.is-active, .is-hidden)
   Theme — visual variations (.theme-dark)
*/

/* ── CSS Modules ── */

/* Card.module.css */
.card { border: 1px solid #ddd; }
.title { font-size: 1.25rem; }

/* Component file */
// import styles from './Card.module.css';
// <div className={styles.card}>
//   <h2 className={styles.title}>Title</h2>
// </div>
/* Pros: Locally scoped, no naming collisions */
/* Cons: Dynamic class composition can be awkward */

/* ── CSS-in-JS (Styled Components, Emotion) ── */

// const Button = styled.button\`
//   background: #4A90D9;
//   color: white;
//   padding: 8px 16px;
//   border-radius: 4px;
//   border: none;
//   cursor: pointer;
//
//   &:hover { background: #357ABD; }
//
//   \${props => props.variant === 'outline' && css\`
//     background: transparent;
//     border: 2px solid #4A90D9;
//     color: #4A90D9;
//   \`}
// \`;
/* Pros: Dynamic styles, component-scoped, no dead CSS */
/* Cons: Runtime cost (or SSR setup), bundle size */

/* ── Recommendation by project type ── */

/*
| Project | Recommended Approach |
|---------|---------------------|
| Design system / component library | BEM + CSS Modules |
| Rapid prototyping | Utility-first (Tailwind) |
| Large enterprise app | CSS Modules + BEM |
| Single developer / small project | Any — consistency matters most |
| High-performance / SSR-critical | Utility-first (small bundles) |
*/

/* ── 🏆 Personal recommendation ── */
/* For most projects: Tailwind for rapid development + CSS Modules for complex components
   Naming convention: a thoughtful combination beats dogmatic adherence */
\`\`\`

**Key takeaway:** The best methodology is the one your team follows consistently. CSS Modules provide the best scoping, utilities provide the best consistency, and BEM provides the best readability. Choose based on your team's priorities.`,
      difficulty: "medium",
      tags: ["css", "methodologies", "architecture"],
      is_top50: true,
    },
    {
      question: "How does the CSS display property work and what values are available?",
      answer: `The \`display\` property controls an element's box type and how it interacts with other elements in the layout. It is the most impactful CSS property:

\`\`\`css
/* ── Outer display types (how element behaves in layout) ── */

.block {
  display: block;
  /* Takes full width by default, starts on new line */
  /* Respects width, height, padding, margin */
  /* <div>, <p>, <h1>-<h6>, <section> default to block */
}

.inline {
  display: inline;
  /* Wraps content width, no line break */
  /* ❌ Ignores width, height, top/bottom margin */
  /* <span>, <a>, <strong>, <em> default to inline */
}

.inline-block {
  display: inline-block;
  /* Wraps content but RESPECTS width, height, margin */
  /* Best of both: inline flow with block sizing */
}

/* ── Inner display types (how children are laid out) ── */

.flex {
  display: flex;        /* Block-level flex container */
  display: inline-flex; /* Inline-level flex container */
}

.grid {
  display: grid;        /* Block-level grid container */
  display: inline-grid; /* Inline-level grid container */
}

/* ── Flow-root (new BFC) ── */

.flow-root {
  display: flow-root;
  /* Creates a new Block Formatting Context (BFC) */
  /* ✅ Contains floats, prevents margin collapse */
  /* Cleaner than overflow: hidden (no clipping) */
}

/* ── Table values ── */

.table { display: table; }
.table-row { display: table-row; }
.table-cell { display: table-cell; }
.table-caption { display: table-caption; }
/* Useful for old-school table layouts or specific alignment needs */

/* ── List-item ── */

.list-item { display: list-item; }
/* Creates a list marker (bullet) before the element */

/* ── Contents ── */

.contents {
  display: contents;
  /* Box disappears — children are promoted to parent's layout level */
  /* Useful for wrapping elements that shouldn't affect layout */
  /* ⚠️ Accessibility concern: element is removed from accessibility tree */
}

/* ── None ── */

.hidden {
  display: none;
  /* Completely removes element from document flow */
  /* Unlike visibility: hidden, element takes no space */
}

/* ── Comparison with similar properties ── */

/*
| display: none | visibility: hidden | opacity: 0 |
| Removed from flow | Still occupies space | Still occupies space |
| Not focusable | Still focusable | Still focusable |
| Screen reader ignores | Screen reader sees | Screen reader sees |
| Triggers layout recalculation | No layout change | No layout change |
*/

/* ── Practical selection guide ── */

/*
| Need | Use |
|------|-----|
| Full-width section | display: block |
| Text inline with other text | display: inline |
| Icon with sizing + inline flow | display: inline-block |
| Flexbox layout | display: flex |
| 2D grid layout | display: grid |
| Remove ghost element | display: contents |
| Hide element entirely | display: none |
| Create BFC without clipping | display: flow-root |
*/

/* ── Container display ── */

.container-type { /* CSS Container Queries */
  container-type: inline-size;
  display: block; /* Still needed for the element itself */
}
\`\`\`

**Modern display values (newer additions):**
- \`display: flow-root\` — creates a new BFC without the side effects of \`overflow: hidden\`
- \`display: contents\` — removes the element's box, useful for flex/grid layouts with wrapper elements
- \`display: ruby\` — for ruby annotations (pronunciation guides in East Asian typography)

> **Rule of thumb:** Start with the simplest display value that achieves your layout goal. Don't reach for flexbox when \`inline-block\` will do. Don't use \`grid\` for a single row of items.`,
      difficulty: "easy",
      tags: ["css", "display", "layout"],
      is_top50: true,
    },
    {
      question: "What are CSS overflow and clipping techniques?",
      answer: `The \`overflow\` and \`clip\` properties control what happens when content exceeds its container's boundaries. Modern CSS also offers \`clip-path\` for advanced shape clipping:

\`\`\`css
/* ── Overflow basics ── */

.container {
  overflow: visible;    /* Default — content overflows outside box */
  overflow: hidden;     /* Content is clipped — no scrollbar, no overflow visible */
  overflow: clip;       /* Like hidden but NO programmatic scrolling — better performance */
  overflow: scroll;     /* Always shows scrollbars (even if not needed) */
  overflow: auto;       /* Shows scrollbars only when content overflows */

  /* Axis-specific */
  overflow-x: hidden;
  overflow-y: auto;

  /* Shorthand: overflow: [x] [y] */
  overflow: hidden auto;
}

/* ── Text overflow (truncation) ── */

.text-truncate {
  white-space: nowrap;      /* Prevent wrapping */
  overflow: hidden;
  text-overflow: ellipsis;  /* "..." at end of truncated text */
  /* Requires: overflow: hidden AND white-space: nowrap */
}

/* Multi-line truncation (line-clamp) */
.multiline-truncate {
  display: -webkit-box;
  -webkit-line-clamp: 3;    /* Show max 3 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Modern line-clamp (standard) ── */

.clamp-3 {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

@supports (-webkit-line-clamp: 3) {
  .clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
}

/* ── Clipping with clip-path ── */

.clip-circle {
  clip-path: circle(50%);              /* Circle — creates round images */
}

.clip-polygon {
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);  /* Diamond */
}

.clip-hexagon {
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

.clip-wavy {
  clip-path: polygon(0% 0%, 100% 0%, 100% 85%, 75% 100%, 50% 85%, 25% 100%, 0% 85%);
}

.clip-inset {
  clip-path: inset(20px 10px);         /* Rectangle with offset from edges */
}

.clip-svg {
  clip-path: url(#myClipPath);         /* Use SVG-defined clip path */
}

/* ── Scrollbar styling (Webkit) ── */

.custom-scrollbar {
  overflow-y: auto;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;                          /* Thin scrollbar */
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Firefox scrollbar (2024+) */
.custom-scrollbar {
  scrollbar-width: thin;               /* auto | thin | none */
  scrollbar-color: #888 #f1f1f1;       /* thumb track */
}

/* ── Scroll behavior ── */

.smooth-scroll {
  scroll-behavior: smooth;             /* Smooth scrolling for anchor links */
  overscroll-behavior: contain;        /* Prevent scroll chaining (useful for modals) */
  scroll-snap-type: y mandatory;       /* Scroll snapping (carousels, sections) */
}

/* ── content-visibility (performance) ── */

.off-screen-section {
  content-visibility: auto;            /* Lazy-renders off-screen content */
  contain-intrinsic-size: 0 500px;     /* Placeholder height before render */
  /* Dramatically improves initial render performance for long pages */
}
\`\`\`

**Overflow gotchas:**
- Setting \`overflow\` to anything other than \`visible\` on the parent creates a new **block formatting context** (BFC) and **stacking context**
- \`overflow: hidden\` does NOT make the container a scroll container (use \`clip\` for that)
- \`position: sticky\` stops working if the parent has \`overflow: hidden/auto/scroll\`
- Horizontal overflow (\`overflow-x: hidden\`) is common for mobile layouts to prevent unwanted sideways scrolling`,
      difficulty: "medium",
      tags: ["css", "overflow", "clipping"],
      is_top50: true,
    },
    {
      question: "What are CSS transitions and how do you use them?",
      answer: `CSS transitions allow you to smoothly animate changes to CSS properties over a specified duration. They are triggered by state changes (\`:hover\`, \`:focus\`, class toggles):

\`\`\`css
/* ── Transition shorthand ── */

.element {
  /* transition: property duration timing-function delay */
  transition: opacity 0.3s ease;

  /* Multiple properties */
  transition: opacity 0.3s ease, transform 0.2s ease-in;

  /* Explicit longhand */
  transition-property: opacity, transform;
  transition-duration: 0.3s, 0.2s;
  transition-timing-function: ease, ease-in;
  transition-delay: 0s, 0s;

  /* ❌ Avoid 'all' — transitions all properties, can cause unexpected animations */
  transition: all 0.3s ease;
}

/* ── Timing functions ── */

.ease         { transition-timing-function: ease; }          /* slow → fast → slow */
.linear       { transition-timing-function: linear; }        /* constant speed */
.ease-in      { transition-timing-function: ease-in; }       /* slow → fast */
.ease-out     { transition-timing-function: ease-out; }      /* fast → slow */
.ease-in-out  { transition-timing-function: ease-in-out; }   /* slow → fast → slow */

/* Custom cubic-bezier — create your own timing curve */
.bounce       { transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55); }
.smooth-in    { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
.smooth-out   { transition-timing-function: cubic-bezier(0.0, 0, 0.2, 1); }

/* Steps-based (discrete animation — useful for sprite sheets) */
.steps        { transition-timing-function: steps(4, end); }

/* ── Practical patterns ── */

/* Hover lift effect */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}

/* Accordion smooth height (using max-height trick) */
.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.2s ease;
  opacity: 0;
}
.accordion.open .accordion-content {
  max-height: 500px;        /* Large enough for content */
  opacity: 1;
}

/* Fade in/out */
.fade-enter { opacity: 0; }
.fade-enter-active {
  opacity: 1;
  transition: opacity 0.3s ease;
}

/* Staggered children */
.list-item {
  transition: opacity 0.3s ease, transform 0.3s ease;
  transition-delay: calc(var(--index, 0) * 50ms);
}

/* ── Transitionable vs non-transitionable properties ── */

/* ✅ CAN transition: */
/* transform, opacity, color, background-color, border-color, */
/* box-shadow, filter, font-size, width, height (not recommended) */

/* ❌ CANNOT transition: */
/* display, visibility (use opacity instead), */
/*  */
/* ⚠️ CAN but WILL HURT PERFORMANCE: */
/* width, height, top, left, right, bottom, margin, padding */
/* These trigger layout — use transform instead */

/* ── Responding to reduced motion preferences ── */

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
  }
}
\`\`\`

**Transition events in JavaScript:**
\`\`\`javascript
element.addEventListener('transitionend', (e) => {
  console.log(\`\${e.propertyName} finished transitioning\`);
});

element.addEventListener('transitionrun', (e) => {
  console.log('Transition started (including delay period)');
});

element.addEventListener('transitionstart', (e) => {
  console.log('Transition actually started animating (after delay)');
});

element.addEventListener('transitioncancel', (e) => {
  console.log('Transition was cancelled');
});
\`\`\`

**Performance best practices:**
- Only transition \`transform\` and \`opacity\` for 60fps animations
- Use \`will-change: transform\` on elements you plan to animate
- Avoid transitioning \`width\`, \`height\`, \`margin\`, \`padding\`, \`top\`, \`left\` — they cause layout recalculations
- Use \`@media (prefers-reduced-motion: reduce)\` to respect user accessibility settings`,
      difficulty: "medium",
      tags: ["css", "transitions", "animations"],
      is_top50: true,
    },
    {
      question: "Explain closures in JavaScript.",
      answer: "A closure is a function that retains access to variables from its outer (enclosing) scope even after the outer function has returned. Example: a function inside another function can access the outer function's variables. Closures enable data privacy, partial application, and callback patterns.",
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is the virtual DOM and how does React use it?",
      answer: "The virtual DOM is a lightweight JavaScript representation of the actual DOM. React uses it to optimize updates: when state changes, React creates a new virtual DOM tree, diffs it against the previous one (reconciliation), calculates minimal DOM mutations, and applies them in batch. This avoids expensive direct DOM manipulation.",
      difficulty: "medium",
      tags: ["react"],
      is_top50: true,
    },
    {
      question: "Explain event delegation in JavaScript.",
      answer: "Event delegation leverages event bubbling to handle events at a parent level rather than attaching listeners to each child. A single listener on a parent catches events from all children via `event.target`. Benefits: fewer listeners, works for dynamically added elements, better memory usage.",
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What are Web Workers and when would you use them?",
      answer: "Web Workers run JavaScript in background threads separate from the main UI thread. They communicate via postMessage. Use them for CPU-intensive tasks (image processing, large computations, data parsing) that would otherwise block the UI. They don't have DOM access and must be served from the same origin.",
      difficulty: "hard",
      tags: ["javascript", "performance"],
      is_top50: true,
    },
    {
      question: "What is the difference between var, let, and const in JavaScript?",
      answer: "var is function-scoped and can cause bugs due to hoisting. let and const are block-scoped, which makes code safer. const is used when the value should not be reassigned. In modern JavaScript, prefer let and const because they avoid scoping issues and temporal dead zone problems.",
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "Explain Observable and Promise difference in JavaScript/Angular.",
      answer: "A Promise handles one async result, while an Observable can handle multiple values over time. Observables are lazy (don't execute until subscribed), cancellable via unsubscribe, and support rich operators like map, filter, debounce. Angular's HttpClient returns Observables, favoring reactive programming.",
      difficulty: "medium",
      tags: ["javascript", "angular"],
      is_top50: true,
    },
    {
      question: "What is the Virtual DOM in React and why is it useful?",
      answer: "The Virtual DOM is a lightweight JavaScript copy of the real DOM. React compares the new Virtual DOM with the previous one (diffing), calculates the minimal set of changes, and updates only those parts in the real DOM. This avoids expensive full-DOM operations and makes rendering efficient.",
      difficulty: "medium",
      tags: ["react"],
      is_top50: true,
    },
    {
      question: "What is the use of TypeScript in Angular?",
      answer: "Angular is fully built on TypeScript for type safety, better tooling (auto-complete, IntelliSense), early error detection at compile time, and OOP features like interfaces, classes, and generics. TypeScript makes Angular applications easier to scale and maintain.",
      difficulty: "easy",
      tags: ["typescript", "angular"],
      is_top50: true,
    },
    {
      question: "What is two-way data binding in Angular?",
      answer: "Two-way data binding keeps the UI and component data in sync automatically. Angular uses [(ngModel)] syntax to bind data both ways — when the user types in an input, the component variable updates, and when the component changes the value, the UI updates instantly.",
      difficulty: "easy",
      tags: ["angular"],
      is_top50: true,
    },
    {
      question: "What are Pure Components in React?",
      answer: "A Pure Component in React prevents unnecessary re-renders by using shallow comparison on props and state. Class components extend React.PureComponent; functional components use React.memo(). Useful when props mostly remain the same and performance optimization is needed.",
      difficulty: "medium",
      tags: ["react", "performance"],
      is_top50: true,
    },
    {
      question: "What is the difference between template-driven and reactive forms in Angular?",
      answer: "Template-driven forms are easy and suitable for small forms — validation logic lives in the HTML template. Reactive forms use FormGroup and FormControl in TypeScript, providing better structure, scalability, testability, and programmatic validation. Reactive forms are ideal for enterprise-level apps.",
      difficulty: "medium",
      tags: ["angular"],
      is_top50: true,
    },
    {
      question: "What are React Hooks and why do we use them?",
      answer: "Hooks let React functional components use state and lifecycle features. useState manages state, useEffect handles side effects (data fetching, subscriptions), useContext accesses context, and useMemo/useCallback optimize performance. Hooks reduce boilerplate, make code reusable via custom hooks, and eliminate the need for class components.",
      difficulty: "medium",
      tags: ["react", "hooks"],
      is_top50: true,
    },
    {
      question: "What is Lazy Loading in Angular?",
      answer: "Lazy loading loads Angular modules only when the user navigates to them, not during the initial bundle load. Using loadChildren in routing configuration, the module is fetched on demand. This reduces initial load time, improves performance, and optimizes bundle size.",
      difficulty: "medium",
      tags: ["angular", "performance"],
      is_top50: true,
    },
    {
      question: "What is Change Detection in Angular?",
      answer: "Change detection updates the view whenever component data changes. Angular uses Zone.js to detect async operations and trigger change detection automatically. For performance optimization, OnPush strategy can be used to check only when inputs change, events fire, or observables emit.",
      difficulty: "medium",
      tags: ["angular", "performance"],
      is_top50: true,
    },
    {
      question: "What is JSX in React?",
      answer: "JSX (JavaScript XML) is a syntax extension that lets us write HTML-like code in JavaScript. It makes UI code cleaner and more readable. Under the hood, Babel compiles JSX to React.createElement() calls, which create the virtual DOM elements.",
      difficulty: "easy",
      tags: ["react"],
      is_top50: true,
    },
    {
      question: "What is the difference between useEffect and useLayoutEffect in React?",
      answer: "useEffect runs after the UI is painted to the screen, making it non-blocking. useLayoutEffect runs synchronously before the browser paints, blocking rendering until it completes. Use useLayoutEffect only for layout measurements and synchronous DOM operations; prefer useEffect for most cases.",
      difficulty: "medium",
      tags: ["react", "hooks"],
      is_top50: true,
    },
    {
      question: "What are the primitive data types in JavaScript?",
      answer: `JavaScript has **7 primitive data types**:

| Type | Description | Example |
|------|-------------|---------|
| \`string\` | Textual data | \`"hello"\`, \`'world'\`, \`\`template\`\` |
| \`number\` | Integers & floats (IEEE 754) | \`42\`, \`3.14\`, \`Infinity\`, \`NaN\` |
| \`boolean\` | True/false | \`true\`, \`false\` |
| \`null\` | Intentional absence | \`null\` |
| \`undefined\` | Uninitialized value | \`undefined\` |
| \`symbol\` | Unique identifier (ES6) | \`Symbol("id")\` |
| \`bigint\` | Arbitrary-precision integers | \`9007199254740991n\` |

**Key characteristics:**
- Primitives are **immutable** — methods like \`.toUpperCase()\` return a new value, they don't modify the original
- They are **compared by value** (\`5 === 5\` is \`true\`)
- They are stored directly in the variable (on the stack), not by reference

\`\`\`javascript
// Primitives are compared by value
console.log(5 === 5);            // true
console.log("hello" === "hello"); // true

// Immutability in action
let str = "hello";
str.toUpperCase();                // returns "HELLO", but str is still "hello"
console.log(str);                 // "hello"

// typeof check
console.log(typeof 42);           // "number"
console.log(typeof "hi");         // "string"
console.log(typeof undefined);    // "undefined"
console.log(typeof null);         // "object" — this is a historical JS bug!
console.log(typeof Symbol());     // "symbol"
console.log(typeof 10n);          // "bigint"
\`\`\`

**Note:** \`typeof null === "object"\` is a well-known bug from JavaScript's first implementation that can never be fixed without breaking existing code. Use \`value === null\` to check for null.`,
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is the difference between null and undefined?",
      answer: `**\`null\`** vs **\`undefined\`** — two distinct "nothing" values in JavaScript:

| | \`null\` | \`undefined\` |
|--|---------|-------------|
| Meaning | Intentional absence of value | Variable declared but not assigned |
| Type | \`typeof null === "object"\` (bug) | \`typeof undefined === "undefined"\` |
| Assignment | Must be explicitly assigned | Default for uninitialized variables |
| JSON | Survives JSON roundtrip | Is dropped in JSON |
| Use case | Reset/clear a value | Check if something exists |

\`\`\`javascript
// undefined — the default
let a;
console.log(a);              // undefined

function foo() {}
console.log(foo());          // undefined (implicit return)

const obj = {};
console.log(obj.x);          // undefined (missing property)

// null — intentionally set
let user = null;              // "No user yet, but I'll set it later"
user = { name: "Alice" };

// Resetting
user = null;                  // Explicitly clear

// Checking for both
console.log(value == null);   // true for both null and undefined (loose equality)
console.log(value === null);  // only true for null
console.log(value === undefined); // only true for undefined

// Default parameters handle undefined but NOT null
function greet(name = "Guest") {
  console.log(\`Hello, \${name}\`);
}
greet();                       // Hello, Guest  (undefined → default)
greet(null);                   // Hello, null   (null is NOT replaced)
\`\`\`

**Pro tip:** Use \`value ?? "default"\` (nullish coalescing) to treat both \`null\` and \`undefined\` as "nothing" and fall back to a default.`,
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "Explain the difference between == and ===.",
      answer: `**\`==\`** (abstract equality) coerces types before comparing; **\`===\`** (strict equality) compares both value and type without coercion.

\`\`\`javascript
// == — type coercion happens
5 == "5"     // true  (string "5" → number 5)
0 == false   // true  (false → 0)
"" == false  // true  (both coerce to 0)
[] == false  // true  ([] → "" → 0, false → 0)
null == undefined // true (special rule)

// === — no coercion, checks type first
5 === "5"    // false (number vs string)
0 === false  // false (number vs boolean)
null === undefined // false
"" === false // false
\`\`\`

**The coercion algorithm for \`==\`:**
1. Same type → compare directly (same as \`===\`)
2. \`null\` or \`undefined\` vs each other → \`true\`
3. \`string\` vs \`number\` → convert string to number
4. \`boolean\` vs anything → convert boolean to number (\`true → 1\`, \`false → 0\`)
5. \`object\` vs \`string\`/\`number\` → convert object to primitive (\`.valueOf()\` → \`.toString()\`)

\`\`\`javascript
// The famous coercion chaos
console.log([] + []);           // ""        (both become "")
console.log([] + {});           // "[object Object]"
console.log({} + []);           // 0         ({} is treated as block, +[] is 0)
console.log([1,2] == [1,2]);    // false     (different references)
console.log([1,2] == "1,2");    // true      (array toString → "1,2")
\`\`\`

**Best practice:** Always use \`===\` except in one case — \`value == null\` is a handy shortcut that checks both \`null\` and \`undefined\`.`,
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is the difference between var, let, and const?",
      answer: `| Feature | \`var\` | \`let\` | \`const\` |
|---------|-------|-------|---------|
| Scope | Function-scoped | Block-scoped (\`{}\`) | Block-scoped (\`{}\`) |
| Hoisting | Hoisted, initialized to \`undefined\` | Hoisted, **not initialized** (TDZ) | Hoisted, **not initialized** (TDZ) |
| Redeclaration | Allowed | Error | Error |
| Reassignment | Allowed | Allowed | Error |
| Temporal Dead Zone | No | Yes | Yes |
| Global property | Creates \`window.\` property | Does not create | Does not create |

\`\`\`javascript
// ─── Scope ───
if (true) {
  var x = 1;     // leaks out of the block
  let y = 2;     // stays in the block
  const z = 3;   // stays in the block
}
console.log(x);  // 1
console.log(y);  // ReferenceError: y is not defined

// ─── Hoisting ───
console.log(a);  // undefined (var hoisted with initialization)
var a = 5;

console.log(b);  // ReferenceError: TDZ!
let b = 5;

// ─── const ≠ immutable ───
const person = { name: "Alice" };
person.name = "Bob";    // ✅ Allowed — mutating the object
person = {};            // ❌ TypeError — reassignment is not allowed

// ─── Temporal Dead Zone ───
{
  // TDZ starts here for x
  console.log(x);       // ReferenceError
  let x = 10;           // TDZ ends here
}
\`\`\`

**Modern best practice:** Use \`const\` by default, \`let\` when you need to reassign, and never use \`var\`.`,
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is type coercion in JavaScript?",
      answer: `Type coercion is converting a value from one type to another. Two kinds:

**Explicit coercion** — you intentionally convert:
\`\`\`javascript
Number("42")        // 42
String(42)          // "42"
Boolean(0)          // false
parseInt("42px")    // 42
+"42"               // 42  (unary plus)
\`\`\`

**Implicit coercion** — JavaScript does it automatically:
\`\`\`javascript
"5" - 3             // 2   (string → number)
"5" + 3             // "53" (number → string — + favors string concat)
!"hello"            // false  (string → boolean)
if ("hello") {}     // "hello" coerces to true
5 == "5"            // true  (string → number)
\`\`\`

**The three coercion directions:**

| Operation | Coerces to | Example |
|-----------|-----------|---------|
| \`+\` with string | String | \`"a" + 1 → "a1"\` |
| \`-\`, \`*\`, \`/\`, \`%\`, \`>\`, \`<\` | Number | \`"5" - 2 → 3\` |
| \`!\`, \`&&\`, \`||\`, \`if()\` | Boolean | \`!"x" → false\` |

\`\`\`javascript
// Gotchas to watch for
[] + []       // ""      — both become ""
[] + {}       // "[object Object]"
{} + []       // 0       — {} is empty block, +[] is 0
null + 1      // 1       — null → 0
undefined + 1 // NaN     — undefined → NaN
"6" - "2"     // 4       — both → numbers (unlike +)
"6" * "2"     // 12      — both → numbers
\`\`\`

**Key takeaway:** Understanding coercion prevents subtle bugs. When in doubt, use explicit coercion (e.g., \`Number()\`, \`String()\`) for clarity.`,
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "Explain truthy and falsy values in JavaScript.",
      answer: `A value is **truthy** if it coerces to \`true\` in a boolean context, and **falsy** if it coerces to \`false\`.

**The 8 falsy values** (everything else is truthy):
\`\`\`javascript
false          // The boolean false
0              // Zero
-0             // Negative zero
0n             // BigInt zero
""             // Empty string (also '' and \`\`)
null           // No value
undefined      // Uninitialized
NaN            // Not a Number
\`\`\`

**Surprising truthy values** (commonly mistaken as falsy):
\`\`\`javascript
"0"            // Truthy! (non-empty string)
"false"        // Truthy! (non-empty string)
[]             // Truthy! (empty array)
{}             // Truthy! (empty object)
Infinity       // Truthy!
-Infinity      // Truthy!
new Date()     // Truthy!
\`\`\`

**Usage in conditionals:**
\`\`\`javascript
// Short-circuit evaluation with &&
const user = { name: "Alice" };
console.log(user && user.name);   // "Alice" — if user is truthy, access name

// Default value with ||
const name = input || "default";  // Uses "default" if input is falsy

// Nullish coalescing (newer, more precise)
const name = input ?? "default";  // Only null/undefined trigger default, NOT 0 or ""

// Guard clause
if (!data) return;                // Exit early if data is falsy
\`\`\`

**Checking emptiness:**
\`\`\`javascript
// DON'T
if (!arr) {}          // ❌ fails for empty arrays ([] is truthy!)
if (arr.length) {}    // ✅ use length for arrays
if (Object.keys(obj).length) {}  // ✅ for objects
\`\`\``,
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is the difference between primitive and reference types?",
      answer: `| | Primitives | Reference Types |
|--|-----------|----------------|
| Storage | Stored directly in variable (stack) | Stored as memory reference (heap) |
| Comparison | By value | By reference (same object?) |
| Mutability | Immutable | Mutable |
| Copy behavior | Value is copied | Reference is copied |
| Examples | \`string\`, \`number\`, \`boolean\`, \`null\`, \`undefined\`, \`symbol\`, \`bigint\` | \`object\`, \`array\`, \`function\`, \`Date\`, \`Map\`, \`Set\` |

\`\`\`javascript
// ─── Assignment behavior ───
let a = 42;
let b = a;        // value is COPIED
b = 100;
console.log(a);   // 42 — a is unchanged

let obj1 = { x: 1 };
let obj2 = obj1;  // reference is COPIED (both point to same object)
obj2.x = 999;
console.log(obj1.x); // 999 — obj1 also changed!

// ─── Comparison ───
console.log(42 === 42);            // true (value comparison)
console.log({} === {});            // false (different references)
console.log([] === []);            // false (different references)

// ─── Immutability of primitives ───
let str = "hello";
str[0] = "H";                     // silently fails in non-strict mode
console.log(str);                 // still "hello"
str = str.toUpperCase();          // must reassign to change
console.log(str);                 // "HELLO"

// ─── Deep comparison for objects ───
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
console.log(deepEqual({x:1}, {x:1})); // true
\`\`\`

**Key insight:** Reference types allocate memory on the heap and the variable holds a pointer. Two variables can point to the same object — mutating through one affects the other.`,
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "How does JavaScript handle implicit type conversion?",
      answer: `JavaScript automatically coerces types when operators encounter mismatched types. The rules depend on the operator:

**The \`+\` operator — favors string concatenation:**
\`\`\`javascript
"hello" + 42     // "hello42"  (number → string)
42 + "hello"     // "42hello"  (number → string)
1 + 2 + "3"      // "33"       (left-to-right: 1+2=3, then 3+"3"="33")
"1" + 2 + 3      // "123"      (left-to-right: "1"+2="12", then "12"+3="123")

// But - * / favor numbers:
"6" - "2"        // 4          (both → number)
"6" * "2"        // 12
"6" / "2"        // 3
\`\`\`

**Comparison operators (\`<\`, \`>\`, \`<=\`, \`>=\`) — favor numeric:**
\`\`\`javascript
"5" < 10         // true  ("5" → 5)
"abc" < 10       // false ("abc" → NaN, NaN comparisons are always false)
"10" > "2"       // false — both strings, string comparison! ("1" < "2")
"10" > 2         // true  — mixed types, string → number
\`\`\`

**Loose equality (\`==\`) rules:**
1. Same type → direct compare
2. \`null == undefined\` → \`true\`
3. String vs number → string to number
4. Boolean → \`true → 1\`, \`false → 0\`
5. Object vs primitive → object's \`.valueOf()\` / \`.toString()\`

\`\`\`javascript
// Classic gotchas
[] + []          // ""     — both arrays become ""
[] + {}          // "[object Object]"
{} + []          // 0      — {} is empty block, +[] is 0
null + 1         // 1      — null → 0
undefined + 1    // NaN    — undefined → NaN
"5" - - "3"      // 8      — both → numbers, double negative = positive
!!"false"        // true   — non-empty string is truthy
!!""             // false  — empty string is falsy
\`\`\`

**ToPrimitive algorithm:** When an object needs conversion, JS calls \`valueOf()\` first; if the result isn't a primitive, it falls back to \`.toString()\`. This is why \`[] + []\` yields \`""\`.`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What are template literals and how are they useful?",
      answer: `Template literals are strings delimited by backticks (\`) with three superpowers over regular strings:

**1. Expression interpolation (\`\${}\`):**
\`\`\`javascript
const name = "Alice";
const age = 30;
const greeting = \`Hello, I'm \${name} and I'm \${age} years old.\`;
// Compare with old way:
const old = "Hello, I'm " + name + " and I'm " + age + " years old.";
\`\`\`

**2. Multi-line strings (no \\\\n needed):**
\`\`\`javascript
const html = \`
  <div class="card">
    <h2>\${title}</h2>
    <p>\${description}</p>
  </div>
\`;
// vs old way:
const oldHtml = "<div class=\"card\">\\n" +
  "  <h2>" + title + "</h2>\\n" +
  "  <p>" + description + "</p>\\n" +
  "</div>";
\`\`\`

**3. Tagged templates — custom processing:**
\`\`\`javascript
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) =>
    \`\${result}\${str}\${values[i] ? \`<mark>\${values[i]}</mark>\` : ""}\`, ""
  );
}

const user = "Alice";
const score = 95;
const result = highlight\`User \${user} scored \${score} points.\`;
// Result: 'User <mark>Alice</mark> scored <mark>95</mark> points.'

// Built-in use case: styled-components in React
const Button = styled.button\`
  background: \${props => props.primary ? "blue" : "gray"};
  color: white;
\`;
\`\`\`

**Escape sequences inside template literals:**
\`\`\`javascript
// To include a backtick in a template literal, escape it:
const str = \`This is a backtick: \\\`\`;

// To include \${}, escape the dollar sign:
const str2 = \`This is literal: \\\${notInterpolated}\`;
\`\`\`

**Pro tip:** Template literals make building HTML, SQL queries, URLs, and error messages significantly cleaner than concatenation.`,
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "Explain the concept of 'Strict Mode' in JavaScript.",
      answer: `Strict mode opts into a restricted variant of JavaScript that catches common coding mistakes and prevents unsafe actions.

**Enabling strict mode:**
\`\`\`javascript
// For an entire script (global scope)
"use strict";
x = 3.14;     // ❌ ReferenceError (was silent in sloppy mode)

// For a specific function
function doSomething() {
  "use strict";
  y = 42;     // ❌ ReferenceError
}

// ES6 modules and classes are strict BY DEFAULT (no directive needed)
\`\`\`

**What strict mode changes:**

\`\`\`javascript
"use strict";

// 1. Prevents accidental globals
mistypedVariable = 42;     // ReferenceError instead of creating global

// 2. Eliminates silent failures
const obj = {};
Object.defineProperty(obj, "x", { value: 1, writable: false });
obj.x = 2;                 // TypeError (silent fail in sloppy mode)

// 3. Disallows duplicate parameter names
function sum(a, a, c) {}   // SyntaxError (allowed in sloppy mode)

// 4. Makes eval() have its own scope
eval("var x = 42");
console.log(x);            // ReferenceError (x only exists inside eval)

// 5. this is undefined in plain functions
function show() {
  console.log(this);       // undefined (was global object in sloppy mode)
}
show();

// 6. No with() statement
with (Math) { x = cos(2); } // SyntaxError

// 7. Disallows octal syntax
const n = 010;             // SyntaxError (use 0o10 instead)
\`\`\`

**Benefits:**
- Catches bugs early (silent → errors)
- Improves performance (some optimizations only work in strict mode)
- Future-proofs code (bans deprecated features)
- Required for classes and modules

**Recommendation:** Always use strict mode. If you use ES modules or a bundler, it's automatic. For legacy scripts, wrap in an IIFE: \`(function() { "use strict"; ... })()\`.`,
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is scope in JavaScript?",
      answer: `**Scope** determines where variables, functions, and objects are accessible in your code. JavaScript has three scope types:

| Scope | Declared with | Accessible where |
|-------|--------------|-----------------|
| Global | Any keyword outside a function/block | Everywhere |
| Function | \`var\` inside a function | Inside that function |
| Block | \`let\` / \`const\` inside \`{}\` | Inside that block |

\`\`\`javascript
// ─── Global scope ───
const globalVar = "I'm global";

function outer() {
  // ─── Function scope (var) ───
  var functionScoped = "Inside outer";

  if (true) {
    // ─── Block scope (let/const) ───
    let blockScoped = "Inside this block";
    var notBlockScoped = "Leaks out!";   // var ignores blocks!

    console.log(blockScoped);    // ✅ "Inside this block"
    console.log(functionScoped); // ✅ "Inside outer" (lexical access)
  }

  console.log(notBlockScoped);   // ✅ "Leaks out!" (var ignores block)
  console.log(blockScoped);      // ❌ ReferenceError
}
\`\`\`

**Lexical (static) scoping:** Scope is determined by where you write the code, not where it runs. An inner function can always access its outer scopes — this is the foundation of closures.

**Scope nesting:** Scopes can nest infinitely. Each inner scope has access to all outer scopes (the scope chain), but not vice versa.`,
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "Explain the difference between global scope, function scope, and block scope.",
      answer: `| | Global | Function (\`var\`) | Block (\`let\`/\`const\`) |
|--|--------|-------------------|------------------------|
| Declared | Outside any function/block | Inside a function | Inside \`{}\` |
| Accessible | Everywhere | Inside that function only | Inside that block only |
| Hoisting | N/A | Hoisted with \`undefined\` | Hoisted in TDZ |
| Redeclare | In same scope | Allowed | Error |

\`\`\`javascript
// ─── Global scope ───
const appName = "MyApp";          // Accessible everywhere

function myFunction() {
  // ─── Function scope (var) ───
  var secret = "hidden";          // Only inside myFunction
  let alsoSecret = "also hidden"; // Also block-scoped to the function

  if (true) {
    // ─── Block scope ───
    let blockVar = "only in this block";
    const blockConst = "also only in this block";
    var notBlockScoped = "available outside the block";

    console.log(appName);         // ✅ "MyApp" (global)
    console.log(secret);          // ✅ "hidden" (function scope)
  }

  console.log(notBlockScoped);    // ✅ "available outside the block"
  console.log(blockVar);          // ❌ ReferenceError
}

console.log(appName);             // ✅ "MyApp"
console.log(secret);              // ❌ ReferenceError

// ─── Nested scopes ───
function outer() {
  const x = "outer";
  function inner() {
    const y = "inner";
    console.log(x);               // ✅ "outer" (scope chain)
    console.log(y);               // ✅ "inner"
  }
  console.log(y);                 // ❌ ReferenceError
}
\`\`\`

**Key takeaway:** Use \`let\` and \`const\` for predictable scoping. \`var\` ignores block scopes (like \`if\`, \`for\`), which causes bugs.`,
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is lexical scoping in JavaScript?",
      answer: `**Lexical scoping** (also called **static scoping**) means that the scope of a variable is determined by its position in the source code at author-time, not at runtime.

\`\`\`javascript
const global = "global";

function outer() {
  const outerVar = "outer";

  function inner() {
    const innerVar = "inner";
    console.log(innerVar);  // ✅ "inner" — own scope
    console.log(outerVar);  // ✅ "outer" — parent scope
    console.log(global);    // ✅ "global" — grandparent scope
  }

  console.log(outerVar);    // ✅ "outer"
  console.log(innerVar);    // ❌ ReferenceError (not in scope)
  inner();
}

outer();
\`\`\`

**How it works:**
- Functions create a new scope at their definition location
- Inner functions can access variables from ALL outer scopes
- Outer functions CANNOT access inner variables
- Scope is determined by where you WRITE the function, not where you CALL it

\`\`\`javascript
// Demonstrating lexical vs dynamic (hypothetical)
const x = "global";

function foo() {
  console.log(x);  // "global" — lexical scope uses where foo was defined
}

function bar() {
  const x = "bar";
  foo();           // Still logs "global" because foo's lexical scope is global
}

bar();             // "global"

// If JS used dynamic scoping, this would log "bar"
\`\`\`

**Key insight:** Lexical scoping is what makes **closures** possible. When a function "remembers" its outer variables after the outer function returns, it's because the function retains a reference to its lexical environment — the scope that existed where it was defined.`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is a scope chain and how does it work?",
      answer: `The **scope chain** is the hierarchical linking of nested scopes that JavaScript uses to resolve variable lookups.

\`\`\`javascript
const global = "🌍";  // Level 0: Global scope

function outer() {
  const outerVar = "🔵";  // Level 1: Outer function scope

  function middle() {
    const middleVar = "🟢";  // Level 2: Middle function scope

    function inner() {
      const innerVar = "🔴";  // Level 3: Inner function scope

      // Scope chain lookup:
      console.log(innerVar);   // 1. Found in own scope → "🔴"
      console.log(middleVar);  // 2. Not found → check parent → found → "🟢"
      console.log(outerVar);   // 3. Not found → check grandparent → found → "🔵"
      console.log(global);     // 4. Not found → check great-grandparent → found → "🌍"
    }

    inner();
  }

  middle();
}

outer();
\`\`\`

**How lookup works:**
\`\`\`javascript
let count = 0;

function increment() {
  // JavaScript looks for 'count':
  // 1. Inside increment() scope → not found
  // 2. Inside global scope → found! → count = 0
  count++;
  console.log(count);
}

increment();  // 1

// Shadowing — inner scope "shadows" outer
const name = "Global";

function greet() {
  const name = "Local";  // shadows global 'name'

  function inner() {
    console.log(name);   // "Local" — found in parent scope first
  }

  inner();
}

greet();
\`\`\`

**Key points:**
- The chain follows the **lexical** nesting structure (where functions were defined)
- Lookup stops at the **first match** (inner scopes shadow outer ones)
- If not found anywhere → \`ReferenceError\`
- The chain is fixed at definition time, not call time`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is an execution context?",
      answer: `An **execution context** is the internal environment where JavaScript code is evaluated and executed. Think of it as a wrapper that holds all the information needed to run code.

**Two types:**
1. **Global Execution Context (GEC)** — Created when the script starts; one per page/program
2. **Function Execution Context (FEC)** — Created each time a function is invoked

**Phases of execution context:**

| Phase | What happens |
|-------|-------------|
| **Creation** | 1. Creates the \`this\` binding<br>2. Sets up the **LexicalEnvironment** (hoists declarations, builds scope chain)<br>3. Sets up the **VariableEnvironment** (for \`var\` declarations) |
| **Execution** | Runs code line by line, assigns values, executes functions |

\`\`\`javascript
// Global Execution Context (created first)
const globalVar = "I'm global";

function example(a) {
  // Function Execution Context (created when example() is called)
  var functionVar = "I'm in the function";
  let blockVar = "I'm block-scoped";

  console.log(a);             // from arguments
  console.log(globalVar);     // from outer scope (scope chain)
  console.log(functionVar);   // from own variable env
}

example(42);
// After example returns, its FEC is popped from the stack
\`\`\`

**Visualizing the creation phase (hoisting):**
\`\`\`javascript
console.log(x);  // undefined — var is hoisted with undefined
var x = 5;

// The creation phase transforms the above into:
// var x;              → hoisted, initialized to undefined
// console.log(x);     → undefined
// x = 5;              → assignment happens during execution

// let and const are hoisted but NOT initialized:
console.log(y);  // ReferenceError: TDZ
let y = 10;
\`\`\`

**Key insight:** Each execution context has its own variable environment and scope chain. When a function finishes, its context is popped from the call stack and destroyed (unless a closure retains a reference to its scope).`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "Explain variable hoisting in JavaScript.",
      answer: `**Hoisting** is JavaScript's behavior of moving declarations to the top of their scope during the creation phase, before any code executes.

**Hoisting behavior by declaration type:**

| Declaration | Hoisted? | Initialized? | Accessible before declaration? |
|------------|----------|-------------|-------------------------------|
| \`function\` | ✅ Fully | ✅ Yes (whole function) | ✅ Yes |
| \`var\` | ✅ Yes | ✅ With \`undefined\` | ✅ Yes (as \`undefined\`) |
| \`let\` | ✅ Yes | ❌ No (TDZ) | ❌ ReferenceError |
| \`const\` | ✅ Yes | ❌ No (TDZ) | ❌ ReferenceError |
| \`class\` | ✅ Yes | ❌ No (TDZ) | ❌ ReferenceError |

\`\`\`javascript
// ─── Function declarations — fully hoisted ───
sayHello();  // ✅ "Hello!"
function sayHello() {
  console.log("Hello!");
}

// ─── var — hoisted with undefined ───
console.log(x);  // undefined (not ReferenceError!)
var x = 5;
// Equivalent to:
// var x;
// console.log(x); → undefined
// x = 5;

// ─── let/const — hoisted in TDZ ───
console.log(y);  // ❌ ReferenceError: Cannot access before initialization
let y = 10;

// ─── Function expressions follow variable rules ───
foo();  // ❌ TypeError (if var) or ReferenceError (if let)
var foo = function() { console.log("hi"); };

// ─── Class declarations ───
const instance = new MyClass();  // ❌ ReferenceError
class MyClass {}
\`\`\`

**Why hoisting matters:**
- Functions can be defined at the bottom and used at the top (cleaner code organization)
- \`var\` hoisting causes subtle bugs (undefined instead of ReferenceError)
- TDZ for \`let\`/\`const\` catches errors early
- Always declare at the top of their scope for clarity`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is the Temporal Dead Zone (TDZ) in JavaScript?",
      answer: `The **Temporal Dead Zone (TDZ)** is the period between entering a scope and the actual declaration of a \`let\`, \`const\`, or \`class\` variable, during which the variable exists but cannot be accessed.

\`\`\`javascript
{
  // ─── TDZ starts here for 'name' ───
  console.log(name);  // ❌ ReferenceError: Cannot access 'name' before initialization

  // ─── TDZ ───
  // ─── TDZ ───
  // ─── TDZ ───

  const name = "Alice";  // ✅ TDZ ends here

  console.log(name);     // ✅ "Alice"
}

// ─── Visual comparison ───
{
  // var: hoisted + initialized immediately
  console.log(x);  // undefined (no TDZ)
  var x = 1;

  // let: hoisted but NOT initialized
  console.log(y);  // ReferenceError (TDZ)
  let y = 2;

  // const: same as let
  console.log(z);  // ReferenceError (TDZ)
  const z = 3;
}

// ─── typeof and TDZ ───
typeof undeclaredVariable;  // ✅ "undefined" (variable doesn't exist)
typeof tdzVariable;         // ❌ ReferenceError (variable EXISTS but is in TDZ)
let tdzVariable = 42;

// ─── Default parameters and TDZ ───
function test(a = b, b = 2) {
  // a tries to access b, but b is in TDZ → ReferenceError
}
test();  // ❌ ReferenceError: Cannot access 'b' before initialization

// ─── class TDZ ───
new MyClass();  // ❌ ReferenceError
class MyClass {}
\`\`\`

**Why TDZ exists:** It helps catch errors by ensuring variables are declared before use. Without TDZ, accessing a \`let\` before its declaration would silently return \`undefined\` (like \`var\`), hiding bugs.`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "How does the call stack work in JavaScript?",
      answer: `The **call stack** is a LIFO (Last In, First Out) data structure that tracks function execution in JavaScript's single-threaded runtime.

\`\`\`javascript
function multiply(a, b) {
  return a * b;  // 3. multiply frame pushed, computes, returns
}

function square(n) {
  return multiply(n, n);  // 2. square frame pushed, calls multiply
}

function main() {
  const result = square(5);  // 1. main frame pushed
  console.log(result);       // 4. logs 25 after square returns
}

main();

// Call stack visualization at each step:
//
// Step 1: main() called
// [main]
//
// Step 2: square(5) called
// [square]
// [main]
//
// Step 3: multiply(5,5) called
// [multiply]
// [square]
// [main]
//
// Step 4: multiply returns → popped
// [square]
// [main]
//
// Step 5: square returns → popped
// [main]
//
// Step 6: main returns → popped
// []
\`\`\`

**Stack overflow example:**
\`\`\`javascript
function infinite() {
  return infinite();  // Each call adds a frame, never pops
}
infinite();
// ❌ RangeError: Maximum call stack size exceeded
// (typically ~10,000 frames depending on the engine)
\`\`\`

**Single-threaded nature:**
- Only ONE function executes at a time
- The stack must unwind completely before the event loop can process the next task
- That's why long synchronous operations block the UI

**Each stack frame contains:**
- Function arguments
- Local variables
- Return address
- \`this\` binding`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "Explain the difference between function declarations and function expressions.",
      answer: `| | Function Declaration | Function Expression |
|--|---------------------|-------------------|
| Syntax | \`function foo() {}\` | \`const foo = function() {}\` |
| Hoisting | Fully hoisted (callable before definition) | Follows variable rules (\`var\` → \`undefined\`, \`let\`/ \`const\` → TDZ) |
| Name | Required | Optional (anonymous) |
| Use | Standalone statement | Assigned to variable/passed as argument |

\`\`\`javascript
// ─── Function Declaration ───
console.log(add(2, 3));  // ✅ 5 — fully hoisted
function add(a, b) {
  return a + b;
}

// ─── Function Expression (anonymous) ───
console.log(subtract(5, 3));  // ❌ ReferenceError (let → TDZ)
let subtract = function(a, b) {
  return a - b;
};

// ─── Named Function Expression ───
const factorial = function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1);  // ✅ fact refers to itself
};
console.log(factorial(5));   // ✅ 120
console.log(fact);           // ❌ ReferenceError — name is only internal

// ─── Arrow Function Expression ───
const double = x => x * 2;   // Always an expression

// ─── IIFE (Immediately Invoked Function Expression) ───
(function() {
  console.log("Runs immediately!");
})();

// ─── Passing as callbacks ───
[1, 2, 3].map(function(x) { return x * 2; });  // Expression as argument

// ─── Block scoping difference (strict mode) ───
"use strict";
if (true) {
  function decl() { return "A"; }  // Block-scoped in strict mode
}
console.log(decl());  // ✅ or ❌ depending on engine
\`\`\`

**Best practice:** Use function declarations for top-level utility functions (hoisting is convenient). Use function expressions for callbacks, conditional assignments, and when you need to limit scope.`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is the difference between a regular function and an arrow function in terms of scope?",
      answer: `| Feature | Regular Function | Arrow Function |
|---------|-----------------|---------------|
| \`this\` | Dynamic (determined by call site) | Lexical (inherits from enclosing scope) |
| \`arguments\` | Has its own \`arguments\` object | No \`arguments\` (use rest params) |
| \`new\` | Can be used as constructor | Cannot be used with \`new\` (throws TypeError) |
| \`prototype\` | Has \`.prototype\` property | No \`.prototype\` property |
| \`call\`/\`apply\`/\`bind\` | Can rebind \`this\` | Cannot rebind \`this\` (ignores binding) |
| \`super\` / \`new.target\` | Has own bindings | Inherits from enclosing scope |

\`\`\`javascript
// ─── this binding ───
const obj = {
  name: "Alice",
  regular: function() {
    console.log(this.name);  // "Alice" — this is obj (call site)
  },
  arrow: () => {
    console.log(this.name);  // undefined — this is outer scope (not obj!)
  }
};

obj.regular();  // "Alice"
obj.arrow();    // undefined

// ─── arguments object ───
function regular() {
  console.log(arguments[0]);  // "hello"
}
regular("hello");

const arrow = () => {
  console.log(arguments[0]);  // ❌ ReferenceError (or outer scope's arguments)
};
// Fix: use rest parameters
const arrowFixed = (...args) => {
  console.log(args[0]);  // "hello"
};

// ─── Cannot be constructors ───
const Foo = () => {};
new Foo();  // ❌ TypeError: Foo is not a constructor

// ─── call/apply/bind have no effect ───
const obj2 = { value: 42 };
const arrow2 = () => console.log(this.value);
arrow2.call(obj2);  // undefined — ignores the binding

// ─── Best use cases ───
// Arrow: callbacks, event handlers, array methods
button.addEventListener("click", () => {
  console.log(this);  // outer scope's this (not the button!)
});

// Regular: object methods, constructors, when dynamic this needed
const person = {
  name: "Bob",
  greet: function() {
    console.log(\`Hi, I'm \${this.name}\`);
  }
};
\`\`\`

**Rule of thumb:** Use arrow functions for callbacks and short inline functions. Use regular functions for methods, constructors, and when you need dynamic \`this\`.`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What are first-class functions in JavaScript?",
      answer: `**First-class functions** means functions in JavaScript are treated as **values** — they can be assigned to variables, passed as arguments, returned from other functions, and stored in data structures just like any other value (numbers, strings, objects).

\`\`\`javascript
// Assigned to a variable
const greet = function(name) {
  return \`Hello, \${name}!\`;
};

// Passed as an argument
function sayHello(greetingFn, name) {
  console.log(greetingFn(name));
}
sayHello(greet, 'Alice'); // "Hello, Alice!"

// Returned from a function
function createMultiplier(factor) {
  return function(x) {
    return x * factor;
  };
}
const double = createMultiplier(2);
console.log(double(5)); // 10

// Stored in a data structure
const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
};
console.log(operations.add(3, 4)); // 7
\`\`\`

This capability is what enables **higher-order functions**, **callbacks**, **closures**, and JavaScript's event-driven asynchronous model. Without first-class functions, patterns like \`Array.map()\`, \`setTimeout()\`, and \`Promise.then()\` would not be possible.`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What are higher-order functions?",
      answer: `A **higher-order function (HOF)** is a function that does at least one of the following:
- Takes one or more functions as **arguments**
- **Returns** a function as its result

**Built-in HOFs: map, filter, reduce**

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];

// map — transform each element
const doubled = numbers.map(n => n * 2); // [2, 4, 6, 8, 10]

// filter — keep elements that pass a test
const evens = numbers.filter(n => n % 2 === 0); // [2, 4]

// reduce — accumulate values
const sum = numbers.reduce((acc, n) => acc + n, 0); // 15
\`\`\`

**Custom HOF — function that returns a function:**

\`\`\`javascript
function withLogging(fn) {
  return function(...args) {
    console.log(\`Calling \${fn.name} with\`, args);
    const result = fn(...args);
    console.log(\`Result:\`, result);
    return result;
  };
}

const add = (a, b) => a + b;
const loggedAdd = withLogging(add);
loggedAdd(3, 4);
// "Calling add with [3, 4]"
// "Result: 7"
\`\`\`

**Custom HOF — function that takes a function:**

\`\`\`javascript
function once(fn) {
  let called = false;
  return function(...args) {
    if (called) return;
    called = true;
    return fn(...args);
  };
}

const initialize = once(() => console.log('Initialized!'));
initialize(); // "Initialized!"
initialize(); // (nothing)
\`\`\`

Higher-order functions enable **abstraction**, **code reuse**, and **declarative** programming patterns. They are fundamental to functional programming and are used extensively in modern JavaScript — from \`Array\` methods to middleware in Express and HOCs in React.`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is a callback function?",
      answer: `A **callback** is a function passed as an argument to another function, to be **called later** — either synchronously (immediately) or asynchronously (after some operation completes).

**Synchronous callback:**

\`\`\`javascript
function processArray(arr, callback) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = callback(arr[i]);
  }
}

const numbers = [1, 2, 3];
processArray(numbers, n => n * 2);
console.log(numbers); // [2, 4, 6]
\`\`\`

**Asynchronous callback:**

\`\`\`javascript
function fetchData(callback) {
  setTimeout(() => {
    callback({ id: 1, name: 'Alice' });
  }, 1000);
}

fetchData((data) => {
  console.log(data.name); // "Alice" (after 1 second)
});
\`\`\`

**Callback hell (pyramid of doom):**

\`\`\`javascript
getUser(id, (user) => {
  getPosts(user.id, (posts) => {
    getComments(posts[0].id, (comments) => {
      getLikes(comments[0].id, (likes) => {
        console.log(likes);
      });
    });
  });
});
\`\`\`

**Modern alternatives:**

| Pattern | Syntax | Use Case |
|---------|--------|----------|
| Callbacks | \`fn(() => {...})\` | Simple, one-off |
| Promises | \`fn().then(...).catch(...)\` | Chaining, error handling |
| async/await | \`const r = await fn()\` | Synchronous-style async code |

\`\`\`javascript
// Promise equivalent
getUser(id)
  .then(user => getPosts(user.id))
  .then(posts => getComments(posts[0].id))
  .then(comments => getLikes(comments[0].id))
  .then(likes => console.log(likes))
  .catch(err => console.error(err));

// async/await equivalent
async function showLikes(id) {
  const user = await getUser(id);
  const posts = await getPosts(user.id);
  const comments = await getComments(posts[0].id);
  const likes = await getLikes(comments[0].id);
  console.log(likes);
}
\`\`\`

Callbacks remain fundamental to JavaScript — they power event listeners, \`setTimeout\`, \`Array\` methods, and are the foundation upon which Promises and async/await are built.`,
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "Explain closures with a practical example.",
      answer: `A **closure** is a function that **remembers** its outer (lexical) scope even after the outer function has finished executing. The inner function "closes over" the variables it needs, keeping them alive.

**Example 1: Counter (data privacy)**

\`\`\`javascript
function createCounter() {
  let count = 0; // private variable
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.decrement(); // 1
console.log(counter.getCount()); // 1
// count is not directly accessible from outside
console.log(counter.count); // undefined
\`\`\`

**Example 2: Function factory**

\`\`\`javascript
function createMultiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
\`\`\`

**Example 3: Classic loop issue with closures**

\`\`\`javascript
// Problem: all callbacks log 3
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 3, 3, 3
}

// Fix with closure (IIFE) or let
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100); // 0, 1, 2
  })(i);
}

// Modern fix: use let (block scoping)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0, 1, 2
}
\`\`\`

**Example 4: Module pattern**

\`\`\`javascript
const UserModule = (function() {
  let users = [];

  return {
    add(name) { users.push(name); },
    getAll() { return [...users]; },
    count() { return users.length; },
  };
})();

UserModule.add('Alice');
UserModule.add('Bob');
console.log(UserModule.count()); // 2
console.log(UserModule.users); // undefined (private)
\`\`\`

Closures are the foundation of **data privacy**, **function factories**, **currying**, **memoization**, and the **module pattern** in JavaScript.`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is function currying?",
      answer: `**Currying** transforms a function that takes **multiple arguments** into a sequence of **nested functions**, each accepting a **single argument**.

\`\`\`javascript
// Normal function
const add = (a, b, c) => a + b + c;
console.log(add(1, 2, 3)); // 6

// Curried version
const curriedAdd = a => b => c => a + b + c;
console.log(curriedAdd(1)(2)(3)); // 6
\`\`\`

**Partial application** — preset some arguments:

\`\`\`javascript
const multiply = a => b => a * b;

const double = multiply(2);
const triple = multiply(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
\`\`\`

**Practical use case: logger factory**

\`\`\`javascript
const log = level => message => \`[\${level}] \${message}\`;

const info = log('INFO');
const warn = log('WARN');
const error = log('ERROR');

console.log(info('Server started'));  // [INFO] Server started
console.log(error('Disk full'));     // [ERROR] Disk full
\`\`\`

**Using Lodash \`_.curry\` for auto-currying:**

\`\`\`javascript
import _ from 'lodash';

const greet = _.curry((greeting, name) => \`\${greeting}, \${name}!\`);

const sayHello = greet('Hello');
console.log(sayHello('Alice')); // "Hello, Alice!"
console.log(greet('Hi')('Bob')); // "Hi, Bob!"
\`\`\`

| Concept | Description |
|---------|-------------|
| **Currying** | \`f(a, b, c) → f(a)(b)(c)\` (each call takes one arg) |
| **Partial application** | \`f(a, b, c) → f(a, b)(c)\` or \`f(a)(b, c)\` (presets some args) |

Currying is especially useful in **function composition** pipelines and helps create highly **reusable**, **specialized** functions from general ones.`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is function composition?",
      answer: `**Function composition** combines two or more functions to produce a new function where the **output** of one function becomes the **input** of the next. It follows the mathematical principle \`f ∘ g = f(g(x))\`.

**Manual compose and pipe:**

\`\`\`javascript
// compose — right-to-left
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

// pipe — left-to-right (more intuitive)
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);
\`\`\`

**Practical example:**

\`\`\`javascript
const trim = str => str.trim();
const lower = str => str.toLowerCase();
const slugify = str => str.replace(/\\s+/g, '-');

const createSlug = pipe(trim, lower, slugify);

console.log(createSlug('  Hello World  ')); // "hello-world"
\`\`\`

**Composing with data transformation:**

\`\`\`javascript
const users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 17 },
  { name: 'Charlie', age: 25 },
];

const adults = users => users.filter(u => u.age >= 18);
const getNames = users => users.map(u => u.name);
const sortNames = names => [...names].sort();

const getAdultNamesSorted = pipe(adults, getNames, sortNames);

console.log(getAdultNamesSorted(users)); // ["Alice", "Charlie"]
\`\`\`

**Comparison: compose vs pipe**

| Function | Order | Readability |
|----------|-------|-------------|
| \`compose(f, g)(x)\` | Right-to-left: \`f(g(x))\` | Mathematical convention |
| \`pipe(f, g)(x)\` | Left-to-right: \`g(f(x))\` | More natural, reads top-to-bottom |

Function composition enables building **complex operations** from **simple, reusable, pure functions** — a core principle of functional programming used extensively in libraries like Redux (middleware), RxJS (operators), and Lodash (\_.flow).`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is a pure function and what are its benefits?",
      answer: `A **pure function** satisfies two conditions:
1. **Same input → same output** (deterministic)
2. **No side effects** (no mutations, no I/O, no state changes)

**Pure vs Impure:**

\`\`\`javascript
// PURE — same input always gives same output
const add = (a, b) => a + b;
add(2, 3); // 5 every time

// PURE — no mutation
const addItem = (arr, item) => [...arr, item];
addItem([1, 2], 3); // [1, 2, 3] (original unchanged)

// IMPURE — depends on external state
let taxRate = 0.1;
const calculateTax = amount => amount * taxRate; // taxRate could change

// IMPURE — mutates input
const addItemImpure = (arr, item) => { arr.push(item); return arr; };

// IMPURE — side effect (console.log)
const logAdd = (a, b) => { console.log(a, b); return a + b; };
\`\`\`

**Benefits of pure functions:**

| Benefit | Explanation |
|---------|-------------|
| **Testability** | No mocking needed — just assert input → output |
| **Predictability** | Same input always yields same result |
| **Memoization** | Results can be cached by input |
| **Parallel execution** | No race conditions from shared state |
| **Referential transparency** | Expression can be replaced with its value |

**Memoization example:**

\`\`\`javascript
const memoize = fn => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const fibonacci = memoize(n => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(40)); // 102334155 (fast due to memoization)
\`\`\`

**Real-world usage:**

\`\`\`javascript
// Redux reducer (must be pure)
const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT': return state + 1;
    case 'DECREMENT': return state - 1;
    default: return state;
  }
};

// React component rendering (should be pure)
const Greeting = ({ name }) => <h1>Hello, {name}!</h1>;
\`\`\`

Pure functions are fundamental to **functional programming**, **Redux reducers**, **React rendering**, and any code that needs to be **predictable**, **testable**, and **cacheable**.`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "How does the bind() method work?",
      answer: `\`Function.prototype.bind()\` creates a **new function** with a fixed \`this\` value and optional **preset arguments** (partial application). It does **not** invoke the function immediately — it returns a bound copy.

**Basic syntax:**

\`\`\`javascript
const boundFn = fn.bind(thisArg, arg1, arg2, ...);
boundFn(remainingArgs);
\`\`\`

**Fixing \`this\` in event handlers:**

\`\`\`javascript
const button = document.querySelector('button');

const user = {
  name: 'Alice',
  greet() {
    console.log(\`Hello, I'm \${this.name}\`);
  },
};

// Without bind — this refers to button element
button.addEventListener('click', user.greet); // "Hello, I'm undefined"

// With bind — this correctly refers to user
button.addEventListener('click', user.greet.bind(user)); // "Hello, I'm Alice"
\`\`\`

**Partial application (presetting arguments):**

\`\`\`javascript
function multiply(a, b, c) {
  return a * b * c;
}

const multiplyBy2 = multiply.bind(null, 2);    // presets a=2
const multiplyBy2And3 = multiply.bind(null, 2, 3); // presets a=2, b=3

console.log(multiplyBy2(3, 4));       // 2 * 3 * 4 = 24
console.log(multiplyBy2And3(4));      // 2 * 3 * 4 = 24
\`\`\`

**Common pattern: setTimeout with object method:**

\`\`\`javascript
class Timer {
  constructor() {
    this.seconds = 0;
  }

  start() {
    // Without bind — this would be the timeout context
    setInterval(function() {
      this.seconds++; // this is undefined or window
    }, 1000);

    // With bind — this refers to the Timer instance
    setInterval(function() {
      this.seconds++;
    }.bind(this), 1000);

    // Or use arrow function (preferred in modern code)
    setInterval(() => {
      this.seconds++;
    }, 1000);
  }
}
\`\`\`

**Key points:**
- \`bind()\` returns a **new function** — it does not modify the original
- The bound \`this\` value **cannot be overridden** by \`call()\`, \`apply()\`, or another \`bind()\` on the returned function
- Arrow functions cannot be rebound — \`bind()\` has no effect on them
- Useful for **event handlers**, **timers**, **partial application**, and **callback patterns** where \`this\` context is lost`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is the difference between call(), apply(), and bind()?",
      answer: `All three methods explicitly set the \`this\` value for a function, but differ in **how** arguments are passed and **when** the function executes.

**Syntax comparison:**

\`\`\`javascript
const person = {
  name: 'Alice',
  greet(age, city) {
    return \`\${this.name} is \${age} from \${city}\`;
  },
};

const bob = { name: 'Bob' };

// call — immediate, args comma-separated
person.greet.call(bob, 25, 'London'); // "Bob is 25 from London"

// apply — immediate, args as array
person.greet.apply(bob, [25, 'London']); // "Bob is 25 from London"

// bind — returns new function, called later
const boundGreet = person.greet.bind(bob, 25);
boundGreet('London'); // "Bob is 25 from London"
\`\`\`

**Detailed comparison table:**

| Method | Invocation | Arguments | Use Case |
|--------|-----------|-----------|----------|
| \`call()\` | **Immediate** | Comma-separated: \`fn.call(ctx, a, b)\` | Known number of args |
| \`apply()\` | **Immediate** | Array: \`fn.apply(ctx, [a, b])\` | Dynamic/spread args |
| \`bind()\` | **Deferred** (returns new fn) | Comma-separated + later args | Event handlers, callbacks |

**When to use each:**

\`\`\`javascript
// call — method borrowing
const args = Array.prototype.slice.call(arguments);

// apply — spreading an array into arguments
const max = Math.max.apply(null, [1, 5, 3, 9, 2]); // 9
// Modern equivalent: Math.max(...[1, 5, 3, 9, 2])

// bind — fixing this for later execution
class Component {
  constructor(data) {
    this.data = data;
    this.render = this.render.bind(this); // bound for event handler
  }
  render() { /* uses this.data */ }
}
\`\`\`

**Key differences at a glance:**

\`\`\`javascript
function log(prefix, message) {
  console.log(\`[\${prefix}] \${message}\`);
}

const logger = { id: 1 };

log.call(logger, 'INFO', 'Server started');   // [INFO] Server started
log.apply(logger, ['WARN', 'Low memory']);    // [WARN] Low memory

const boundLog = log.bind(logger, 'ERROR');
boundLog('Something broke');                   // [ERROR] Something broke
\`\`\`

**Important notes:**
- \`call()\` and \`apply()\` are **interchangeable** with spread (\`fn.call(ctx, ...args)\` or \`fn.apply(ctx, args)\`)
- \`bind()\` does **not** invoke — it returns a new function with bound \`this\` and optional preset args
- Arrow functions **ignore** all three — their \`this\` is always lexical`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is the difference between arrow functions and regular functions?",
      answer: `Arrow functions and regular functions differ fundamentally in how they handle \`this\`, arguments, constructors, and more.

**Comparison table:**

| Feature | Regular Function | Arrow Function |
|---------|-----------------|----------------|
| Syntax | \`function() {}\` | \`() => {}\` |
| \`this\` binding | **Dynamic** (determined by call site) | **Lexical** (inherits from parent scope) |
| \`arguments\` object | Yes (array-like) | No (use rest \`...args\`) |
| Constructor (\`new\`) | Yes | **No** (throws TypeError) |
| \`prototype\` property | Yes | No |
| \`call/apply/bind\` | Can rebind \`this\` | Cannot rebind \`this\` (ignored) |
| Implicit return | Requires \`return\` | \`() => value\` (single expression) |

**\`this\` binding — the key difference:**

\`\`\`javascript
const obj = {
  name: 'Alice',
  regular: function() {
    console.log(this.name); // "Alice" — this is obj
  },
  arrow: () => {
    console.log(this.name); // undefined — this is outer scope (global/module)
  },
};

obj.regular(); // "Alice"
obj.arrow();   // undefined (or window.name in browsers)
\`\`\`

**\`arguments\` object:**

\`\`\`javascript
function regular() {
  console.log(arguments); // [1, 2, 3] (array-like)
}

const arrow = (...args) => {
  console.log(args); // [1, 2, 3] (real array)
};

regular(1, 2, 3);
arrow(1, 2, 3);
\`\`\`

**Constructor usage:**

\`\`\`javascript
function Regular(name) {
  this.name = name;
}

const Arrow = (name) => {
  this.name = name;
};

new Regular('Alice'); // ✅ Works
new Arrow('Bob');     // ❌ TypeError: Arrow is not a constructor
\`\`\`

**Methods and event handlers:**

\`\`\`javascript
class Button {
  constructor(label) {
    this.label = label;
  }

  // Regular function — loses this when passed as callback
  handleClickRegular() {
    console.log(this.label); // undefined (this is button element)
  }

  // Arrow function — captures this from class instance
  handleClickArrow = () => {
    console.log(this.label); // works correctly
  };
}

const btn = new Button('Submit');
document.querySelector('button')
  .addEventListener('click', btn.handleClickRegular); // undefined
document.querySelector('button')
  .addEventListener('click', btn.handleClickArrow);   // "Submit"
\`\`\`

**When to use each:**

| Use arrow functions for | Use regular functions for |
|------------------------|-------------------------|
| Short callbacks (\`arr.map(x => x * 2)\`) | Object methods needing dynamic \`this\` |
| Event handlers (when \`this\` from parent scope) | Constructors (\`new Class()\`) |
| Promise chains | Methods that use \`arguments\` |
| \`setTimeout\` / \`setInterval\` callbacks | Prototype methods |
| Functional utilities | Methods that need \`call/apply/bind\` rebinding |`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "How do you create an object in JavaScript?",
      answer: `JavaScript offers multiple ways to create objects, each suited to different use cases:

**1. Object Literal (\`{}\`) — Most Common**
The simplest and most readable way for creating single objects.
\`\`\`javascript
const person = {
  name: "Alice",
  age: 30,
  greet() {
    console.log(\`Hi, I'm \${this.name}\`);
  }
};
person.greet(); // "Hi, I'm Alice"
\`\`\`

**2. \`new Object()\` — Constructor**
Less common; functionally equivalent to object literal.
\`\`\`javascript
const person = new Object();
person.name = "Bob";
person.age = 25;
\`\`\`

**3. \`Object.create()\` — Prototype-Based**
Creates an object with a specific prototype.
\`\`\`javascript
const animal = { eat() { console.log("eating"); } };
const dog = Object.create(animal);
dog.bark = () => console.log("woof");
dog.eat(); // inherited from animal
\`\`\`

**4. Constructor Function — Pre-ES6 Classes**
\`\`\`javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.greet = function() {
  console.log("Hi, I'm " + this.name);
};
const alice = new Person("Alice", 30);
\`\`\`

**5. ES6 Class Syntax — Modern Standard**
Syntactic sugar over constructor functions.
\`\`\`javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  greet() {
    console.log(\`Hi, I'm \${this.name}\`);
  }
}
const alice = new Person("Alice", 30);
\`\`\`

**6. Factory Function — No \`new\` Required**
\`\`\`javascript
function createPerson(name, age) {
  return {
    name,
    age,
    greet() { console.log(\`Hi, I'm \${this.name}\`); }
  };
}
const alice = createPerson("Alice", 30);
\`\`\`

**Comparison Summary:**
| Approach | Use Case | Prototype Chain |
|---|---|---|
| Literal \`{}\` | Simple one-off objects | \`Object.prototype\` |
| \`new Object()\` | Rarely used | \`Object.prototype\` |
| \`Object.create()\` | Custom prototype | User-defined |
| Constructor | Multiple instances (legacy) | \`Constructor.prototype\` |
| \`class\` | Modern OOP | \`ClassName.prototype\` |
| Factory | Encapsulation, no \`new\` | Configurable |

Choose **object literals** for simplicity, **\`class\`** for complex hierarchies, **\`Object.create()\`** for prototypal inheritance, and **factory functions** when you want encapsulation without the \`new\` keyword.`,
      difficulty: "easy",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What are object prototypes?",
      answer: `Every JavaScript object has an internal **\`[[Prototype]]\`** property that references another object — its **prototype**. When you access a property, JS looks at the object's own properties first, then checks its prototype, forming the prototype chain.

**Shared Methods via Prototype — Memory Efficient**
\`\`\`javascript
function Person(name) {
  this.name = name;
}

// Method on prototype — shared by ALL instances
Person.prototype.sayHello = function() {
  console.log("Hello, I'm " + this.name);
};

const alice = new Person("Alice");
const bob = new Person("Bob");

alice.sayHello(); // "Hello, I'm Alice"
bob.sayHello();   // "Hello, I'm Bob"

console.log(alice.sayHello === bob.sayHello); // true — same function, saved memory
\`\`\`

**Compared to Defining Methods on \`this\` (per-instance copy)**
\`\`\`javascript
function Person(name) {
  this.name = name;
  this.sayHello = function() {  // Each instance gets its own copy
    console.log("Hello, I'm " + this.name);
  };
}

const a = new Person("Alice");
const b = new Person("Bob");
console.log(a.sayHello === b.sayHello); // false — different function objects
\`\`\`

**Checking Prototypes**
\`\`\`javascript
console.log(Object.getPrototypeOf(alice) === Person.prototype); // true
console.log(Person.prototype.isPrototypeOf(alice));             // true
console.log(alice instanceof Person);                           // true
\`\`\`

**Key Points:**
- Every function has a \`prototype\` property (used when called with \`new\`)
- Every object has a \`[[Prototype]]\` (accessible via \`Object.getPrototypeOf()\`)
- Prototypes enable memory-efficient method sharing and inheritance
- This is JavaScript's mechanism for reuse, distinct from classical inheritance in Java/C++`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "Explain the prototype chain in JavaScript.",
      answer: `The prototype chain is the mechanism JavaScript uses for inheritance. When accessing a property, JS walks up the chain looking for it.

**Visual Diagram:**
\`\`\`
                    null
                     ↑
          ┌─────────────────────┐
          │  Object.prototype   │  ← hasOwnProperty, toString, etc.
          └─────────────────────┘
                     ↑
          ┌─────────────────────┐
          │   Animal.prototype  │  ← eat()
          └─────────────────────┘
                     ↑
          ┌─────────────────────┐
          │    Dog.prototype    │  ← bark()
          └─────────────────────┘
                     ↑
          ┌─────────────────────┐
          │      myDog          │  ← name: "Rex" (own property)
          └─────────────────────┘
\`\`\`

**How Property Lookup Works:**
\`\`\`javascript
const animal = { eat() { console.log("eating"); } };
const dog = Object.create(animal);
dog.bark = () => console.log("woof");

const myDog = Object.create(dog);
myDog.name = "Rex";

// Lookup chain for myDog.bark():
// 1. myDog own properties? → No
// 2. dog (prototype of myDog)? → Yes! → "woof"

myDog.bark(); // "woof" — found on prototype

// Lookup chain for myDog.eat():
// 1. myDog own properties? → No
// 2. dog? → No
// 3. animal? → Yes! → "eating"

myDog.eat(); // "eating" — found two levels up
\`\`\`

**Shadowing (Property on instance "shadows" prototype's):**
\`\`\`javascript
animal.eat = () => console.log("animal eats"); // doesn't affect myDog
myDog.eat(); // still "eating" — own property on dog shadows animal.eat
\`\`\`

**Checking Own vs Inherited Properties:**
\`\`\`javascript
console.log(myDog.hasOwnProperty("name")); // true — own
console.log(myDog.hasOwnProperty("bark")); // false — inherited
console.log("bark" in myDog);              // true — exists in chain
\`\`\`

**Chain Termination:**
- \`Object.getPrototypeOf(Object.prototype) === null\`
- The chain always ends at \`null\`, returning \`undefined\` for missing properties`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is the difference between __proto__ and prototype?",
      answer: `This is one of the most commonly confused concepts in JavaScript.

**The Key Distinction:**
- \`__proto__\` — exists on **object instances**, points to the prototype they inherit from
- \`prototype\` — exists on **constructor functions**, gets assigned to instances' \`__proto__\` when called with \`new\`

**In Action:**
\`\`\`javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log("Hi, I'm " + this.name);
};

const alice = new Person("Alice");

// alice is an instance — has __proto__
// Person is a constructor — has prototype

console.log(alice.__proto__ === Person.prototype); // true
console.log(Person.__proto__ === Function.prototype); // true (Person is itself an object)
console.log(Person.prototype.constructor === Person);  // true
\`\`\`

**Comparison Table:**
| Aspect | \`__proto__\` | \`prototype\` |
|---|---|---|
| Exists on | Object **instances** | Constructor **functions** |
| Purpose | Points to inherited prototype | Defines what instances inherit |
| Access | \`obj.__proto__\` (deprecated) | \`Func.prototype\` (standard) |
| Modern alternative | \`Object.getPrototypeOf(obj)\` | \`Class.prototype\` |
| Use in inheritance | Reading the chain | Setting up the chain |

**Modern Best Practice — Avoid \`__proto__\`:**
\`\`\`javascript
const obj = {};
console.log(Object.getPrototypeOf(obj) === Object.prototype); // true

// Only use .prototype for adding shared methods to constructors
function Car(make) { this.make = make; }
Car.prototype.start = function() { console.log("Vroom!"); };
\`\`\`

**The Relationship When Using \`new\`:**
1. JS creates a new empty object \`{}\`
2. Sets its \`[[Prototype]]\` (\`__proto__\`) to \`Constructor.prototype\`
3. Executes constructor with \`this\` bound to the new object
4. Returns the new object

So \`f.__proto__ === Foo.prototype\` is what connects an instance to its constructor's shared methods.`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "How does prototypal inheritance work?",
      answer: `Prototypal inheritance means objects inherit directly from other objects via the prototype chain, rather than copying blueprints from classes.

**1. Using \`Object.create()\` — Pure Prototypal**
\`\`\`javascript
const animal = {
  eat() { console.log("eating"); }
};

const dog = Object.create(animal);
dog.bark = () => console.log("woof");

const myDog = Object.create(dog);
myDog.name = "Rex";

myDog.bark(); // "woof" — from dog
myDog.eat();  // "eating" — from animal
\`\`\`

**2. Constructor + \`new\` — Classic Pattern**
\`\`\`javascript
function Animal(name) {
  this.name = name;
}
Animal.prototype.eat = function() {
  console.log(this.name + " eats");
};

function Dog(name, breed) {
  Animal.call(this, name); // call parent constructor
  this.breed = breed;
}
// Set up inheritance: Dog.prototype inherits from Animal.prototype
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.bark = function() {
  console.log(this.name + " barks");
};

const rex = new Dog("Rex", "Husky");
rex.eat();  // "Rex eats"
rex.bark(); // "Rex barks"
\`\`\`

**3. ES6 \`class\` + \`extends\` — Modern Sugar**
\`\`\`javascript
class Animal {
  constructor(name) { this.name = name; }
  eat() { console.log(this.name + " eats"); }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // calls Animal constructor
    this.breed = breed;
  }
  bark() { console.log(this.name + " barks"); }
}

const rex = new Dog("Rex", "Husky");
rex.eat();  // "Rex eats"
rex.bark(); // "Rex barks"
\`\`\`

**Prototypal vs Classical Inheritance:**
| Aspect | Prototypal (JS) | Classical (Java/C++) |
|---|---|---|
| Base unit | Objects | Classes |
| Inheritance | Objects inherit from objects | Classes inherit from classes |
| Flexibility | Add/modify methods at runtime | Rigid compile-time structure |
| Instance-of | Prototype chain walk | Class hierarchy |
| \`this\` binding | Dynamic based on call | Fixed at instantiation |

**Runtime Extension — Unique to Prototypal:**
\`\`\`javascript
// Add method to ALL existing instances at runtime
Animal.prototype.sleep = function() {
  console.log(this.name + " sleeps");
};
rex.sleep(); // "Rex sleeps" — added after rex was created!
\`\`\`

This dynamic nature is prototypal inheritance's superpower — you can extend behavior at any time, affecting all linked objects.`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "How does Object.create() work?",
      answer: `\`Object.create(proto, propertiesObject)\` creates a new object with a specified prototype and optional property descriptors.

**Basic Usage — Setting Prototype:**
\`\`\`javascript
const animal = {
  eat() { console.log("eating"); }
};

const dog = Object.create(animal);
dog.bark = () => console.log("woof");

console.log(Object.getPrototypeOf(dog) === animal); // true
dog.eat(); // "eating" — inherited from animal
\`\`\`

**Second Argument — Property Descriptors:**
\`\`\`javascript
const person = Object.create(Object.prototype, {
  name: {
    value: "Alice",
    writable: true,
    enumerable: true,
    configurable: true
  },
  age: {
    value: 30,
    writable: false,  // read-only
    enumerable: true,
    configurable: false
  }
});

console.log(person.name); // "Alice"
person.age = 25;          // silently fails (or throws in strict mode)
console.log(person.age);  // 30 — unchanged
\`\`\`

**Shorthand with Object.defineProperties:**
\`\`\`javascript
const obj = Object.create(proto, {
  x: { value: 10, writable: true },
  y: { value: 20, writable: true }
});
// Equivalent to creating with {}, then Object.defineProperties()
\`\`\`

**\`Object.create(null)\` — Dictionary Objects (No Prototype):**
\`\`\`javascript
const dict = Object.create(null);
dict.key = "value";

console.log(dict.key);             // "value"
console.log(dict.toString);        // undefined — no prototype chain!
console.log(dict.hasOwnProperty);  // undefined — doesn't exist!

// Safe for user-provided keys — no prototype pollution
const safe = Object.create(null);
safe["__proto__"] = "hack";
console.log(safe.__proto__); // "hack" — it's a normal property, not prototype mutation
\`\`\`

**Implementing Classical Inheritance:**
\`\`\`javascript
function Animal(name) { this.name = name; }
Animal.prototype.eat = function() { console.log(this.name + " eats"); };

function Dog(name) {
  Animal.call(this, name);
}

// Dog.prototype inherits from Animal.prototype
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.bark = function() { console.log(this.name + " barks"); };

const rex = new Dog("Rex");
rex.eat();  // "Rex eats"
rex.bark(); // "Rex barks"
\`\`\`

**Comparison:**
| Method | Prototype of Result | When to Use |
|---|---|---|
| \`Object.create(proto)\` | \`proto\` | Pure prototypal inheritance |
| \`Object.create(null)\` | \`null\` | Dictionary/map objects |
| \`{}\` (literal) | \`Object.prototype\` | General-purpose objects |
| \`new F()\` | \`F.prototype\` | Constructor instantiation |`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is the new keyword and how does it work?",
      answer: `The \`new\` keyword creates an instance from a constructor function or class. Under the hood, it follows 4 steps.

**The 4 Steps of \`new\`:**
\`\`\`javascript
// What happens when you write: const p = new Person("Alice")

// Step 1 — Create a brand new empty object
const obj = {};

// Step 2 — Link prototype: obj.__proto__ = Person.prototype
Object.setPrototypeOf(obj, Person.prototype);
// (or: obj.__proto__ = Person.prototype)

// Step 3 — Bind this and execute constructor
const result = Person.call(obj, "Alice");
// Inside the constructor: this = obj

// Step 4 — Return the new object (unless constructor returned an object)
const p = typeof result === "object" && result !== null ? result : obj;
\`\`\`

**In Practice:**
\`\`\`javascript
function Person(name) {
  this.name = name;
  this.greet = function() {
    console.log("Hi, I'm " + this.name);
  };
  // implicit return of 'this' (step 4)
}

const alice = new Person("Alice");
console.log(alice.name);   // "Alice"
console.log(alice instanceof Person); // true
\`\`\`

**Manual Polyfill of \`new\`:**
\`\`\`javascript
function myNew(Constructor, ...args) {
  // Step 1 & 2
  const obj = Object.create(Constructor.prototype);
  // Step 3
  const result = Constructor.apply(obj, args);
  // Step 4
  return (typeof result === "object" && result !== null) ? result : obj;
}

const bob = myNew(Person, "Bob");
console.log(bob.name); // "Bob"
\`\`\`

**What Happens Without \`new\` (Bug!):**
\`\`\`javascript
function Person(name) {
  this.name = name; // 'this' is global object (or undefined in strict mode)
}

const p = Person("Alice"); // no 'new'!
console.log(p);        // undefined — no implicit return
console.log(name);     // "Alice" — leaked to global scope!
console.log(globalThis.name); // "Alice" — pollution

// Fix: add a safety check
function SafePerson(name) {
  if (!(this instanceof SafePerson)) {
    return new SafePerson(name);
  }
  this.name = name;
}
\`\`\`

**With ES6 Classes (must use \`new\`):**
\`\`\`javascript
class Person {
  constructor(name) { this.name = name; }
}
// Person("Alice"); // TypeError: Class constructor Person cannot be invoked without 'new'
const p = new Person("Alice"); // correct
\`\`\`

**\`new\` vs \`Object.create()\`:**
| Feature | \`new\` | \`Object.create()\` |
|---|---|---|
| Prototype | \`Constructor.prototype\` | Explicitly specified |
| Constructor call | Yes (initialization) | No |
| Return value | Object or constructor's return | New object |
| Use case | Instantiation with initialization | Pure prototypal inheritance |`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is a constructor function?",
      answer: `A constructor function is a regular function designed to be called with \`new\` to create objects of the same "type".

**Basic Constructor Function:**
\`\`\`javascript
// PascalCase by convention
function Person(name, age) {
  // 'this' refers to the new instance
  this.name = name;
  this.age = age;

  // Avoid defining methods here — each instance gets its own copy
  // this.greet = function() { ... };
}

// Define methods on prototype instead — shared across all instances
Person.prototype.greet = function() {
  console.log("Hi, I'm " + this.name);
};

Person.prototype.isAdult = function() {
  return this.age >= 18;
};

const alice = new Person("Alice", 30);
const bob = new Person("Bob", 17);

alice.greet();   // "Hi, I'm Alice"
bob.greet();     // "Hi, I'm Bob"
console.log(alice.greet === bob.greet); // true — same function, memory saving
console.log(alice.isAdult()); // true
console.log(bob.isAdult());   // false
\`\`\`

**Constructor's \`prototype\` Property:**
\`\`\`javascript
function Foo() {}
console.log(typeof Foo.prototype); // "object"
console.log(Foo.prototype.constructor === Foo); // true — circular reference

const f = new Foo();
console.log(Object.getPrototypeOf(f) === Foo.prototype); // true
\`\`\`

**What \`new\` Does with a Constructor:**
1. Creates empty object \`{}\`
2. Sets \`obj.__proto__ = Constructor.prototype\`
3. Runs constructor with \`this = obj\`
4. Returns \`obj\` (unless constructor returns a non-null object)

**What Happens If You Forget \`new\`?**
\`\`\`javascript
const alice = Person("Alice", 30);
// 'this' becomes global/window — pollutes global scope!
console.log(name); // "Alice" — leaked!
console.log(globalThis.name); // "Alice"

// Defensive pattern:
function Person(name, age) {
  if (!(this instanceof Person)) {
    return new Person(name, age);
  }
  this.name = name;
  this.age = age;
}
\`\`\`

**ES6 Class Syntax Equivalent:**
\`\`\`javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  greet() {
    console.log("Hi, I'm " + this.name);
  }
  isAdult() {
    return this.age >= 18;
  }
}

// Identical behavior under the hood:
const alice = new Person("Alice", 30);
console.log(typeof Person); // "function"
console.log(Person.prototype.greet); // defined on prototype
\`\`\`

**Summary:**
| Feature | Constructor Function | ES6 Class |
|---|---|---|
| Convention | PascalCase \`function Foo()\` | \`class Foo {}\` |
| Methods | \`Foo.prototype.method\` | Inside class body |
| \`new\` required | No (but bugs if missing) | Yes (error without it) |
| \`typeof\` | \`"function"\` | \`"function"\` |
| Underlying mechanism | Same | Same (syntactic sugar) |
| Inheritance | Manual \`Object.create()\` | \`extends\` keyword |`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "Explain the class syntax in JavaScript.",
      answer: `ES6 \`class\` syntax provides a cleaner, more familiar syntax for prototypal inheritance — but under the hood, it's still prototypes.

**Basic Class Definition:**
\`\`\`javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  // These go on Person.prototype
  greet() {
    console.log("Hi, I'm " + this.name);
  }

  isAdult() {
    return this.age >= 18;
  }
}

const alice = new Person("Alice", 30);
alice.greet(); // "Hi, I'm Alice"
console.log(typeof Person); // "function"
console.log(Person.prototype.greet); // [Function: greet]
\`\`\`

**Inheritance with \`extends\` and \`super\`:**
\`\`\`javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  eat() {
    console.log(this.name + " eats");
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // MUST call super before using 'this'
    this.breed = breed;
  }
  bark() {
    console.log(this.name + " barks");
  }
  // Override parent method
  eat() {
    super.eat(); // optional — still call parent's version
    console.log(this.name + " eats kibble");
  }
}

const rex = new Dog("Rex", "Husky");
rex.eat();  // "Rex eats" then "Rex eats kibble"
rex.bark(); // "Rex barks"

console.log(rex instanceof Dog);    // true
console.log(rex instanceof Animal); // true
\`\`\`

**Static Methods:**
\`\`\`javascript
class MathHelper {
  static add(a, b) { return a + b; }
  static multiply(a, b) { return a * b; }
}

console.log(MathHelper.add(2, 3)); // 5

// Static methods are on the class itself, not instances
const m = new MathHelper();
// m.add(2, 3); // TypeError: m.add is not a function
\`\`\`

**Class Fields (Public/Private):**
\`\`\`javascript
class Counter {
  // Public field
  count = 0;

  // Private field (ES2021+)
  #secret = "hidden";

  increment() {
    this.count++;
  }

  getSecret() {
    return this.#secret;
  }
}

const c = new Counter();
c.increment();
console.log(c.count); // 1
console.log(c.#secret); // SyntaxError: Private field
\`\`\`

**Getters & Setters:**
\`\`\`javascript
class Circle {
  constructor(radius) {
    this._radius = radius;
  }

  get area() {
    return Math.PI * this._radius ** 2;
  }

  set radius(value) {
    if (value <= 0) throw new Error("Radius must be positive");
    this._radius = value;
  }
}

const c = new Circle(5);
console.log(c.area); // 78.5398... (computed, not stored)
\`\`\`

**Syntactic Sugar — It's Still Prototypes:**
\`\`\`javascript
class Foo {
  bar() {}
  static baz() {}
}

// Equivalent pre-ES6:
function Foo() {}
Foo.prototype.bar = function() {};
Foo.baz = function() {};
\`\`\`

**Key Differences from Functions:**
| Feature | Class | Constructor Function |
|---|---|---|
| Hoisting | No (TDZ) | Yes |
| \`new\` required | Yes (TypeError otherwise) | No (but bugs if forgotten) |
| Strict mode | Always | Optional (unless modules) |
| Enumerable methods | No (non-enumerable) | Yes (by default) |
| \`typeof\` | \`"function"\` | \`"function"\` |
| Methods on | Prototype | Prototype (if added manually) |`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "Explain the this keyword in JavaScript.",
      answer: `The value of \`this\` is determined by **how a function is called**, not where it's defined (except arrow functions). There are 5 rules.

**Rule 1 — Default Binding (global / undefined in strict mode):**
\`\`\`javascript
function showThis() {
  console.log(this);
}
showThis(); // global object (window), or undefined in strict mode

// Strict mode:
"use strict";
function showThisStrict() {
  console.log(this);
}
showThisStrict(); // undefined
\`\`\`

**Rule 2 — Implicit Binding (method call):**
\`\`\`javascript
const obj = {
  name: "Alice",
  greet() {
    console.log("Hi, I'm " + this.name);
  }
};
obj.greet(); // "Hi, I'm Alice" — 'this' is obj

// Gotcha: losing implicit binding
const greetFn = obj.greet;
greetFn(); // "Hi, I'm undefined" — 'this' is global/undefined!

// Fix: bind
const boundGreet = obj.greet.bind(obj);
boundGreet(); // "Hi, I'm Alice"
\`\`\`

**Rule 3 — Explicit Binding (call, apply, bind):**
\`\`\`javascript
function introduce(greeting) {
  console.log(greeting + ", I'm " + this.name);
}

const person = { name: "Bob" };

introduce.call(person, "Hello");     // "Hello, I'm Bob"
introduce.apply(person, ["Hi"]);     // "Hi, I'm Bob"
const bound = introduce.bind(person);
bound("Hey");                        // "Hey, I'm Bob"
\`\`\`

**Rule 4 — \`new\` Binding:**
\`\`\`javascript
function Person(name) {
  this.name = name; // 'this' is the new instance
  console.log(this); // Person { name: "Alice" }
}
const alice = new Person("Alice");

// Arrow functions DON'T work with new:
const Arrow = () => {};
// new Arrow(); // TypeError: Arrow is not a constructor
\`\`\`

**Rule 5 — Arrow Functions (Lexical \`this\`):**
\`\`\`javascript
// Arrow functions capture 'this' from surrounding scope — no rebinding
const obj = {
  name: "Alice",
  greet: () => {
    console.log("Hi, I'm " + this.name); // 'this' is outer scope, NOT obj!
  }
};
obj.greet(); // "Hi, I'm undefined" — arrow doesn't get obj's this

// Where arrows shine — callbacks:
function Timer() {
  this.seconds = 0;

  // setInterval's callback would normally set 'this' to global
  setInterval(() => {
    this.seconds++; // 'this' is Timer instance (lexical)
    console.log(this.seconds);
  }, 1000);
}

const t = new Timer(); // 1, 2, 3, ...

// Without arrow, you'd need: .bind(this) or const self = this
\`\`\`

**Complete Reference Table:**
| Call Type | How Function is Invoked | \`this\` Value |
|---|---|---|
| Default | \`fn()\` | Global / \`undefined\` (strict) |
| Implicit | \`obj.fn()\` | \`obj\` |
| Explicit (call/apply) | \`fn.call(ctx)\` | \`ctx\` |
| Explicit (bind) | \`fn.bind(ctx)()\` | \`ctx\` (permanently) |
| \`new\` | \`new Fn()\` | New instance |
| Arrow function | \`() => {}\` | Lexical (enclosing scope) |
| Event handler | \`el.addEventListener("click", fn)\` | \`el\` (DOM element) |
| Class method | \`instance.method()\` | Instance (but watch out for passing references) |

**Common Gotchas:**

1. **Lost method context:**
\`\`\`javascript
const button = {
  text: "Click me",
  click() { console.log(this.text); }
};
setTimeout(button.click, 100); // undefined — 'this' is global
// Fix: setTimeout(() => button.click(), 100) or setTimeout(button.click.bind(button), 100)
\`\`\`

2. **Arrow function in object literal:**
\`\`\`javascript
const obj = {
  name: "Alice",
  greet: () => console.log(this.name) // 'this' is NOT obj!
};
\`\`\`

3. **Class method passed as callback:**
\`\`\`javascript
class MyClass {
  constructor() { this.name = "MyClass"; }
  log() { console.log(this.name); }
}
const instance = new MyClass();
const fn = instance.log;
fn(); // TypeError: Cannot read properties of undefined (class body is strict)
// Fix: instance.log.bind(instance) or class field: log = () => { ... }
\`\`\`

4. **\`this\` inside nested functions:**
\`\`\`javascript
const obj = {
  data: [1, 2, 3],
  process() {
    // 'this' is obj
    this.data.forEach(function(item) {
      console.log(this); // 'this' is global/undefined (inner function)
    });
    // Fix: use arrow function or .bind(this)
    this.data.forEach((item) => {
      console.log(this); // 'this' is obj (lexical)
    });
  }
};
\`\`\`

Remember the golden rule: **"Who calls the function determines \`this\`"** — except for arrow functions, which ignore the rule entirely and use their parent scope's \`this\`.`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is asynchronous programming in JavaScript?",
      answer: `# Asynchronous Programming in JavaScript

JavaScript is **single-threaded** yet **non-blocking** — it achieves concurrency via the **event loop**. Long-running operations (API calls, timers, file I/O) are delegated to Web APIs, and their callbacks are queued for later execution.

\`\`\`
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Call Stack  │◄───│  Microtask Queue │◄───│  Macrotask Queue │
│  (sync code) │    │  (Promise.then)  │    │  (setTimeout,    │
│              │    │  queueMicrotask  │    │   I/O, events)   │
└──────────────┘    └──────────────────┘    └──────────────────┘
       │                      │                       │
       └──────────────────────┴───────────────────────┘
                         Event Loop
\`\`\`

## Evolution of Async Patterns

### 1. Callbacks

\`\`\`javascript
function fetchUser(id, cb) {
  setTimeout(() => cb({ id, name: 'Alice' }), 1000);
}
fetchUser(1, (user) => console.log(user));
// Problem: callback hell with nesting
\`\`\`

### 2. Promises

\`\`\`javascript
function fetchUser(id) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, name: 'Alice' }), 1000);
  });
}
fetchUser(1).then((user) => console.log(user));
\`\`\`

### 3. Async/Await

\`\`\`javascript
async function showUser(id) {
  const user = await fetchUser(id);
  console.log(user);
}
showUser(1);
\`\`\`

Each improvement provides cleaner syntax and better error handling while still using the same event loop under the hood.`,
      difficulty: "medium",
      tags: ["javascript", "async"],
      is_top50: true,
    },
    {
      question: "What is the event loop in JavaScript?",
      answer: `# The Event Loop

The event loop enables JavaScript's non-blocking concurrency model on a single thread. It orchestrates the **call stack**, **microtask queue**, and **macrotask queue**.

## Processing Order

\`\`\`
1. Execute all synchronous code on the Call Stack
2. Empty the entire Microtask Queue
3. Pick ONE macrotask from the Callback Queue
4. Render UI (if needed)
5. Repeat from step 2
\`\`\`

## Visual Diagram

\`\`\`
┌──────────────┐         ┌──────────────────────┐
│  Call Stack  │◄────────│   Microtask Queue    │
│  console.log │         │  Promise callbacks   │
│  function()  │         │  queueMicrotask()    │
└──────┬───────┘         └──────────────────────┘
       │                         ▲
       │ processed first         │
       ▼                         │
┌──────────────────────┐         │
│   Callback Queue     │─────────┘
│  (Macrotasks)        │  one per tick
│  setTimeout, I/O     │
│  DOM events, fetch   │
└──────────────────────┘
\`\`\`

## Classic Example

\`\`\`javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// Output: 1, 4, 3, 2
//
// 1 → sync call stack
// 4 → sync call stack
// 3 → microtask queue (Promise)
// 2 → macrotask queue (setTimeout)
\`\`\`

The event loop prioritizes: **Call Stack → Microtask Queue (entirely) → Macrotask Queue (one at a time)**. This is why Promise callbacks always execute before setTimeout callbacks, even with 0ms delay.`,
      difficulty: "hard",
      tags: ["javascript", "async"],
      is_top50: true,
    },
    {
      question: "What is the difference between synchronous and asynchronous code?",
      answer: `# Synchronous vs Asynchronous Code

## Synchronous (Blocking)

\`\`\`javascript
console.log('Start');
const result = heavyComputation(); // blocks for 5 seconds
console.log('End'); // waits 5 seconds to run
// UI freezes, no other code runs
\`\`\`

## Asynchronous (Non-blocking)

\`\`\`javascript
console.log('Start');
setTimeout(() => console.log('Inside timer'), 2000);
console.log('End');
// Output: Start, End, Inside timer
// Program continues without waiting
\`\`\`

## Comparison

| Aspect | Synchronous | Asynchronous |
|--------|------------|--------------|
| Execution | Sequential, blocking | Non-blocking, concurrent |
| Thread | Blocks the single thread | Offloads to Web APIs |
| Example | \`Array.map()\`, \`JSON.parse()\` | \`fetch()\`, \`setTimeout()\`, file I/O |
| Error handling | \`try/catch\` directly | \`.catch()\` or \`try/catch\` with async/await |
| Performance | Good for CPU-bound tasks | Ideal for I/O-bound tasks |

\`\`\`javascript
// Async with fetch (non-blocking I/O)
async function loadUsers() {
  const res = await fetch('/api/users'); // non-blocking
  const users = await res.json();
  console.log(users);
}
console.log('Loading...');
loadUsers();
console.log('This runs before data arrives!');
\`\`\`

Async code keeps the UI responsive and enables efficient handling of many concurrent operations without thread overhead.`,
      difficulty: "easy",
      tags: ["javascript", "async"],
      is_top50: true,
    },
    {
      question: "What are Web APIs in the browser environment?",
      answer: `# Web APIs in the Browser

Web APIs are browser-provided interfaces that extend JavaScript beyond the core language. They run in the browser's native code (C++) and integrate with the event loop.

## Common Web APIs

| API | Purpose | Example |
|-----|---------|---------|
| **DOM** | Manipulate HTML/XML | \`document.getElementById()\`, \`addEventListener()\` |
| **Fetch** | HTTP requests | \`fetch('/api/data').then(r => r.json())\` |
| **Timers** | Delayed execution | \`setTimeout(cb, 1000)\`, \`setInterval(cb, 500)\` |
| **Storage** | Client-side data | \`localStorage.setItem('key', 'val')\` |
| **Canvas** | 2D/3D graphics | \`canvas.getContext('2d')\` |
| **Geolocation** | Device location | \`navigator.geolocation.getCurrentPosition()\` |
| **Web Workers** | Background threads | \`new Worker('worker.js')\` |
| **WebSockets** | Real-time communication | \`new WebSocket('ws://server')\` |

## How They Work with the Event Loop

\`\`\`javascript
console.log('1');

// setTimeout delegates to Web API timer
setTimeout(() => console.log('2'), 1000);
// fetch delegates to network subsystem
fetch('/api/data').then(res => console.log('3'));

console.log('4');

// 1. Call stack executes 1 and 4
// 2. Timer and fetch run in browser internals (not JS)
// 3. When done, callbacks go to their queues
// 4. Event loop picks them up when call stack is empty
\`\`\`

Web APIs are the bridge that makes JavaScript's async model work — they handle the actual I/O outside the JS thread and signal completion through the event loop.`,
      difficulty: "medium",
      tags: ["javascript", "browser"],
      is_top50: true,
    },
    {
      question: "What is a callback queue and how does it work?",
      answer: `# Callback Queue (Macrotask Queue)

The callback queue is a **FIFO** (First-In-First-Out) data structure holding callbacks from Web APIs that are ready for execution.

## What Goes in the Callback Queue?

- \`setTimeout()\` / \`setInterval()\` callbacks
- DOM event handlers (\`click\`, \`keydown\`, etc.)
- \`fetch()\` response handlers
- I/O completion callbacks
- \`requestAnimationFrame()\` callbacks

## How It Works

\`\`\`javascript
console.log('A');

setTimeout(() => console.log('B'), 0);
setTimeout(() => console.log('C'), 0);

console.log('D');
// Output: A, D, B, C
\`\`\`

\`\`\`
Event Loop Tick:
1. Execute sync code on call stack (A, D)
2. Process all microtasks (none here)
3. Pick ONE macrotask from callback queue → B
4. Process microtasks again
5. Pick next macrotask → C
\`\`\`

## Key Rules

- Only **one** macrotask is processed per event loop iteration
- Microtasks are processed **before** the next macrotask
- If a macrotask queues another macrotask, it waits its turn

\`\`\`javascript
// Relationship with microtask queue
setTimeout(() => {
  console.log('Macrotask 1');
  Promise.resolve().then(() => console.log('Microtask from macrotask'));
}, 0);

setTimeout(() => console.log('Macrotask 2'), 0);
// Output: Macrotask 1, Microtask from macrotask, Macrotask 2
\`\`\`

The callback queue ensures fair scheduling — no single macrotask can starve others, but microtasks can delay macrotasks by scheduling more microtasks.`,
      difficulty: "medium",
      tags: ["javascript", "async"],
      is_top50: true,
    },
    {
      question: "What is a microtask queue?",
      answer: `# Microtask Queue

The microtask queue has **higher priority** than the callback (macrotask) queue. It is **emptied completely** before the event loop picks the next macrotask.

## Sources of Microtasks

- \`Promise.then()\`, \`Promise.catch()\`, \`Promise.finally()\`
- \`queueMicrotask()\`
- \`MutationObserver\` callbacks
- \`process.nextTick()\` (Node.js)

## How It Works

\`\`\`javascript
console.log('1');

// Macrotask
setTimeout(() => console.log('2'), 0);

// Microtask
Promise.resolve().then(() => console.log('3'));

// Microtask
queueMicrotask(() => console.log('4'));

console.log('5');

// Output: 1, 5, 3, 4, 2
// All microtasks (3, 4) run before the macrotask (2)
\`\`\`

## Microtasks Can Starve Macrotasks

\`\`\`javascript
function recursiveMicrotask() {
  queueMicrotask(() => {
    console.log('Microtask');
    recursiveMicrotask(); // schedules another microtask
  });
}

setTimeout(() => console.log('This never runs!'), 1000);
recursiveMicrotask(); // ⚠️ infinite microtask loop blocks macrotasks
\`\`\`

## Processing Order

\`\`\`
Event Loop Iteration:
1. Execute sync code on call stack
2. WHILE microtask queue is NOT empty:
     Dequeue and execute one microtask
3. Pick ONE macrotask from callback queue
4. Render UI (if needed)
5. Go to step 2
\`\`\`

Microtask queue priority ensures Promise reactions are handled as soon as possible, maintaining the semantics of "non-blocking" async operations.`,
      difficulty: "hard",
      tags: ["javascript", "async"],
      is_top50: true,
    },
    {
      question: "Explain the difference between setTimeout and Promise in terms of execution order.",
      answer: `# setTimeout vs Promise — Execution Order

**\`setTimeout\`** schedules a **macrotask** in the callback queue.
**\`Promise.then\`** schedules a **microtask** in the microtask queue.

Microtasks always execute before macrotasks, regardless of timing.

## The Classic Interview Question

\`\`\`javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// Output: 1, 4, 3, 2
\`\`\`

## Execution Order Diagram

\`\`\`
Time ───────────────────────────────────────────────►
      │
      ├─ Synchronous (Call Stack)
      │   console.log('1')
      │   setTimeout → queued as macrotask
      │   Promise.resolve().then → queued as microtask
      │   console.log('4')
      │
      ├─ Microtask Queue (emptied completely)
      │   console.log('3')
      │
      └─ Macrotask Queue (one per tick)
          console.log('2')
\`\`\`

## Why Zero Delay Isn't Immediate

\`\`\`javascript
const start = Date.now();

setTimeout(() => {
  console.log('Ran after', Date.now() - start, 'ms');
}, 0);
// Even with 0ms, this runs after ALL sync code
// and ALL microtasks complete

// Heavy sync work delays the callback further
for (let i = 0; i < 1e9; i++); // blocks for ~500ms
// Output: Ran after ~500ms (not 0ms!)
\`\`\`

## Practical Implications

\`\`\`javascript
// Promise resolves BEFORE setTimeout even at 0ms
// Use Promise for deferring but wanting higher priority
// Use setTimeout when you want to yield to UI rendering

setTimeout(() => console.log('UI render can happen before this'));
Promise.resolve().then(() => console.log('This blocks rendering'));
\`\`\`

**Key takeaway:** \`setTimeout\` yields to the event loop (including possible UI rendering); \`Promise.then\` yields but queues a high-priority microtask.`,
      difficulty: "hard",
      tags: ["javascript", "async"],
      is_top50: true,
    },
    {
      question: "Explain the Promise object in JavaScript.",
      answer: `# The Promise Object

A Promise represents the eventual result of an asynchronous operation.

## Three States

\`\`\`
┌─────────┐
│ Pending │ ───→ resolve() ───→ ┌───────────┐
└─────────┘                     │ Fulfilled │
       │                        └───────────┘
       └──→ reject() ─────→ ┌───────────┐
                             │ Rejected  │
                             └───────────┘
A Promise is settled once it transitions to fulfilled or rejected (irreversible).
\`\`\`

## Creating and Using Promises

\`\`\`javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = Math.random() > 0.5;
    success ? resolve('Done!') : reject(new Error('Failed'));
  }, 1000);
});

promise
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('Cleanup'));
\`\`\`

## Chaining vs Nesting

\`\`\`javascript
// ✅ Chaining (clean, flat)
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => renderPosts(posts))
  .catch(err => handleError(err));

// ❌ Nesting (callback hell)
fetchUser(1, (user) => {
  fetchPosts(user.id, (posts) => {
    renderPosts(posts);
  });
});
\`\`\`

## Static Methods

| Method | Behavior | Resolves When |
|--------|----------|---------------|
| \`Promise.all()\` | All must fulfill | All fulfill (or any rejects) |
| \`Promise.allSettled()\` | All settle (resolve or reject) | All settle |
| \`Promise.race()\` | First to settle | First settles (fulfill or reject) |
| \`Promise.any()\` | First to fulfill | First fulfills (or all reject) |

\`\`\`javascript
const p1 = fetch('/api/users');
const p2 = fetch('/api/posts');

Promise.all([p1, p2])
  .then(([users, posts]) => console.log(users, posts))
  .catch(err => console.error('One request failed', err));

Promise.race([p1, p2])
  .then(first => console.log('Fastest response:', first));
\`\`\`

## Error Handling Patterns

\`\`\`javascript
// Catch at the end of the chain
fetch('/data')
  .then(res => res.json())
  .then(data => process(data))
  .catch(err => console.error('Any error in the chain', err));

// Per-operation error handling
Promise.all([
  fetch('/a').catch(e => fallbackA),
  fetch('/b').catch(e => fallbackB),
]).then(([a, b]) => render(a, b));
\`\`\`

Promises solve callback hell by providing composability, chaining, and centralized error propagation.`,
      difficulty: "medium",
      tags: ["javascript", "async"],
      is_top50: true,
    },
    {
      question: "What is async/await in JavaScript?",
      answer: `# Async/Await

\`async/await\` is syntactic sugar over Promises introduced in **ES2017**. It makes asynchronous code read like synchronous code.

## Basic Syntax

\`\`\`javascript
// async function always returns a Promise
async function fetchUser(id) {
  const response = await fetch(\`/api/users/\${id}\`);
  const user = await response.json();
  return user;
}

// Equivalent Promise chain
function fetchUserPromise(id) {
  return fetch(\`/api/users/\${id}\`).then(res => res.json());
}
\`\`\`

## Error Handling with try/catch

\`\`\`javascript
async function loadData() {
  try {
    const user = await fetchUser(1);
    const posts = await fetchPosts(user.id);
    return { user, posts };
  } catch (error) {
    console.error('Failed to load:', error);
    throw error; // re-throw if caller needs it
  } finally {
    console.log('Cleanup runs always');
  }
}
\`\`\`

## Sequential vs Concurrent

\`\`\`javascript
// ❌ Sequential (slow) — each waits for previous
async function sequential() {
  const a = await fetch('/a');  // 1s
  const b = await fetch('/b');  // 1s → total 2s
}

// ✅ Concurrent (fast) — both start together
async function concurrent() {
  const [a, b] = await Promise.all([
    fetch('/a'),  // 1s
    fetch('/b'),  // 1s → total ~1s
  ]);
}

// ⚠️ Sequential dependency
async function dependent() {
  const user = await fetchUser(1);
  const posts = await fetchPosts(user.id); // needs user first
}
\`\`\`

## await in Loops

\`\`\`javascript
// ❌ Slow — sequential
for (const id of ids) {
  const user = await fetchUser(id);
}

// ✅ Fast — parallel
const users = await Promise.all(ids.map(fetchUser));

// ✅ Sequential when needed
for (const id of ids) {
  const user = await fetchUser(id);
  process(user); // must be in order
}
\`\`\`

## Top-Level Await (ES2022)

\`\`\`javascript
// In modules (works without async wrapper)
const config = await fetch('/config.json');
console.log(config);
\`\`\`

Async/await doesn't change the underlying event loop mechanics — it's still Promises and microtasks. It just provides a more readable, synchronous-looking syntax.`,
      difficulty: "medium",
      tags: ["javascript", "async"],
      is_top50: true,
    },
    {
      question: "What will the following code output and why? console.log('1'); setTimeout(() => console.log('2'), 0); Promise.resolve().then(() => console.log('3')); console.log('4');",
      answer: `# Output: 1, 4, 3, 2

## Code

\`\`\`javascript
console.log('1');                                    // Step 1
setTimeout(() => console.log('2'), 0);               // Step 2
Promise.resolve().then(() => console.log('3'));      // Step 3
console.log('4');                                    // Step 4
\`\`\`

## Step-by-Step Event Loop Walkthrough

### Phase 1: Call Stack (Synchronous Execution)

\`\`\`
1. console.log('1')        → pushed, executes, pops → prints "1"
2. setTimeout(cb, 0)       → Web API starts timer (0ms) → cb queued as MACROTASK
3. Promise.resolve().then()→ microtask queued as MICROTASK
4. console.log('4')        → pushed, executes, pops → prints "4"

Call stack is now EMPTY
\`\`\`

### Phase 2: Microtask Queue (All microtasks processed)

\`\`\`
5. Promise.then callback   → pushed, executes, pops → prints "3"

Microtask queue is now EMPTY
\`\`\`

### Phase 3: Macrotask Queue (One task per tick)

\`\`\`
6. setTimeout callback     → pushed, executes, pops → prints "2"
\`\`\`

### Visual Timeline

\`\`\`
Time ──────────────────────────────────────────────►

Call Stack:   [1] → [4] → (empty) ──────→ [3] ────────→ [2]
                                     ▲           ▲           ▲
                              Microtask      Macrotask    Next tick
                              flushed        picked       macrotask

Output:      1    4                   3              2
\`\`\`

## Why Not 1, 4, 2, 3?

Even though \`setTimeout\` with 0ms was scheduled first, **\`Promise.then\` (microtask) outranks \`setTimeout\` (macrotask)** in the event loop priority. The 0ms delay is the *minimum* time before the callback is *queued*, not before it *executes*. Execution depends on the event loop's queue processing order.

## Key Takeaway

\`\`\`
Call Stack (sync) › Microtask Queue (all) › Macrotask Queue (one per tick)
\`\`\`

This is one of the most common JavaScript interview questions testing understanding of the event loop.`,
      difficulty: "hard",
      tags: ["javascript", "async"],
      is_top50: true,
    },
    // ──────── New JavaScript Questions (from web research) ────────
    {
      question: "What are Map and Set in JavaScript?",
      answer: `**Map** and **Set** are ES6 data structures that improve upon plain objects and arrays for specific use cases.

**Map — key-value with ANY key type:**
\`\`\`javascript
const map = new Map();

// Any value can be a key (objects, functions, primitives)
const objKey = { id: 1 };
map.set("string", "value");
map.set(42, "number");
map.set(objKey, "object");
map.set(true, "boolean");

console.log(map.get(42));       // "number"
console.log(map.get(objKey));   // "object"
console.log(map.size);          // 4
console.log(map.has("string")); // true
map.delete(42);
map.clear();

// Iteration
const users = new Map([["a", "Alice"], ["b", "Bob"]]);
for (const [key, value] of users) console.log(key, value);
users.forEach((value, key) => console.log(key, value));
console.log([...users.keys()]);   // ["a", "b"]
console.log([...users.values()]); // ["Alice", "Bob"]

// Map vs Object:
// - Map: any key type, ordered by insertion, O(1) access, iterable
// - Object: string/Symbol keys only, inherits prototype keys, not directly iterable
\`\`\`

**Set — unique values:**
\`\`\`javascript
const set = new Set([1, 2, 2, 3, 3, 4]);
console.log(set);          // Set {1, 2, 3, 4}
console.log(set.size);     // 4
set.add(5);
console.log(set.has(2));   // true
set.delete(2);

// Deduplication
const deduped = [...new Set([1, 2, 2, 3, 3, 4])]; // [1, 2, 3, 4]
const unique = new Set("hello"); // Set {'h', 'e', 'l', 'o'}

// Set operations
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);
const union = new Set([...a, ...b]);          // {1, 2, 3, 4}
const intersection = new Set([...a].filter(x => b.has(x))); // {2, 3}
const difference = new Set([...a].filter(x => !b.has(x)));  // {1}
\`\`\``,
      difficulty: "medium",
      tags: ["javascript", "es6"],
      is_top50: true,
    },
    {
      question: "What are WeakMap and WeakSet?",
      answer: `**WeakMap** and **WeakSet** hold "weak" references to their keys — if no other reference exists, the key can be garbage collected.

\`\`\`javascript
let user = { name: "Alice" };
const weakMap = new WeakMap();
weakMap.set(user, "session-data");

user = null; // The object is now eligible for GC
// weakMap reference doesn't prevent garbage collection

// Key differences from Map/Set:
// - Keys MUST be objects (no primitives)
// - No .size, .keys(), .values(), .entries(), .clear()
// - Not iterable
// - Values are garbage collected when the key object is

// ─── Practical: private data ───
const privateData = new WeakMap();

class Person {
  constructor(name) {
    privateData.set(this, { name });
  }
  getName() {
    return privateData.get(this).name;
  }
}

// ─── Practical: caching without memory leaks ───
const cache = new WeakMap();
function process(obj) {
  if (!cache.has(obj)) {
    cache.set(obj, expensiveComputation(obj));
  }
  return cache.get(obj);
}
// When obj is GC'd, the cache entry is automatically removed
\`\`\`

**Use cases:** Private instance data, DOM node metadata (without preventing node cleanup), caching that shouldn't prevent GC.`,
      difficulty: "hard",
      tags: ["javascript", "es6"],
      is_top50: true,
    },
    {
      question: "What are Generators and Iterators in JavaScript?",
      answer: `**Iterators** implement the iteration protocol (\`next()\` returns \`{value, done}\`). **Generators** are functions that can be paused/resumed, producing a sequence of values.

**Custom Iterator:**
\`\`\`javascript
const range = {
  from: 1, to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { done: true };
      }
    };
  }
};
console.log([...range]); // [1, 2, 3, 4, 5]
\`\`\`

**Generators (function*):**
\`\`\`javascript
function* idGenerator() {
  let id = 1;
  while (true) {
    yield id++;
  }
}

const gen = idGenerator();
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2
console.log(gen.next().value); // 3

// Two-way communication with .next(value)
function* ask() {
  const name = yield "What's your name?";
  const age = yield \`Hello \${name}, how old are you?\`;
  return \`\${name} is \${age} years old\`;
}
const chat = ask();
console.log(chat.next().value);        // "What's your name?"
console.log(chat.next("Alice").value); // "Hello Alice, how old are you?"
console.log(chat.next(30).value);      // "Alice is 30 years old"

// yield* delegates to another generator
function* numbers() { yield 1; yield 2; }
function* all() { yield* numbers(); yield 3; }
console.log([...all()]); // [1, 2, 3]
\`\`\`

**Built-in iterables:** \`Array\`, \`String\`, \`Map\`, \`Set\`, \`NodeList\`, \`arguments\``,
      difficulty: "hard",
      tags: ["javascript", "es6"],
      is_top50: true,
    },
    {
      question: "What are Symbols in JavaScript?",
      answer: `**Symbol** is a unique, immutable primitive (ES6) often used as object property keys to avoid name collisions.

\`\`\`javascript
// Creating symbols
const s1 = Symbol();
const s2 = Symbol("description"); // .description → "description"
const s3 = Symbol("description"); // s2 !== s3 (always unique)!

// As object keys (private-ish properties)
const API_KEY = Symbol("apiKey");
const user = {
  name: "Alice",
  [API_KEY]: "secret-123"
};
console.log(user[API_KEY]);  // "secret-123"
console.log(Object.keys(user)); // ["name"] — Symbols hidden from Object.keys
console.log(Object.getOwnPropertySymbols(user)); // [Symbol(apiKey)]

// Well-known Symbols — customize object behavior
const customToString = {
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return 42;
    return "custom";
  }
};
console.log(+customToString); // 42
console.log(\`\${customToString}\`); // "custom"

// Symbol.iterator — make objects iterable
const iterable = {
  items: [10, 20, 30],
  *[Symbol.iterator]() {
    for (const item of this.items) yield item;
  }
};
console.log([...iterable]); // [10, 20, 30]

// Symbol.for() — global symbol registry (non-unique)
const a = Symbol.for("shared");
const b = Symbol.for("shared");
console.log(a === b); // true — shared global symbol

// Symbol.keyFor()
console.log(Symbol.keyFor(a)); // "shared"
\`\`\`

**Use cases:** Defining protocol methods (iterators, async iterators), metaprogramming, avoiding property collisions in libraries.`,
      difficulty: "medium",
      tags: ["javascript", "es6"],
      is_top50: true,
    },
    {
      question: "What is the Proxy object in JavaScript?",
      answer: `**Proxy** lets you intercept and customize operations on objects (get, set, delete, has, etc.).

\`\`\`javascript
const target = { name: "Alice", age: 30 };

const handler = {
  get(obj, prop) {
    if (prop === "age") return obj[prop] + " years old";
    if (prop in obj) return obj[prop];
    return \`Property "\${prop}" not found\`;
  },
  set(obj, prop, value) {
    if (prop === "age" && typeof value !== "number") {
      throw new TypeError("Age must be a number");
    }
    obj[prop] = value;
    return true; // success
  },
  has(obj, prop) {
    if (prop === "hidden") return false;
    return prop in obj;
  },
  deleteProperty(obj, prop) {
    if (prop === "name") throw new Error("Cannot delete name");
    delete obj[prop];
    return true;
  }
};

const proxy = new Proxy(target, handler);
console.log(proxy.name);      // "Alice"
console.log(proxy.age);       // "30 years old"
console.log(proxy.unknown);   // 'Property "unknown" not found'
console.log("age" in proxy);  // true
console.log("hidden" in proxy); // false

// Practical: validation, logging, reactive state
const validatedUser = new Proxy({}, {
  set(obj, prop, value) {
    if (prop === "email" && !value.includes("@")) {
      throw new Error("Invalid email");
    }
    console.log(\`Setting \${prop} to \${value}\`);
    obj[prop] = value;
    return true;
  }
});

// Practical: negative array indexing
const safeArray = new Proxy([1, 2, 3, 4], {
  get(arr, index) {
    const num = Number(index);
    return arr[num < 0 ? arr.length + num : num];
  }
});
console.log(safeArray[-1]); // 4
\`\`\`

**Use cases:** Validation, logging/observability, lazy loading, reactive frameworks (Vue 3), access control.`,
      difficulty: "hard",
      tags: ["javascript", "es6", "metaprogramming"],
      is_top50: true,
    },
    {
      question: "What is the Reflect API in JavaScript?",
      answer: `**Reflect** is a built-in object with methods that correspond to Proxy traps, providing a standard way to perform default operations.

\`\`\`javascript
const obj = { a: 1, b: 2 };

// Instead of:
delete obj.a;
console.log("b" in obj);

// Use Reflect:
Reflect.deleteProperty(obj, "a");
console.log(Reflect.has(obj, "b")); // true

// ─── Key Reflect methods ───
console.log(Reflect.get(obj, "b"));         // 2
Reflect.set(obj, "c", 3);                   // obj.c = 3
console.log(Reflect.ownKeys(obj));          // ["b", "c"]
console.log(Reflect.getPrototypeOf(obj));   // Object.prototype

// ─── Reflect with Proxies ───
const handler = {
  get(target, prop, receiver) {
    console.log(\`Accessed: \${String(prop)}\`);
    return Reflect.get(target, prop, receiver); // default behavior
  },
  set(target, prop, value, receiver) {
    if (prop === "age" && !Number.isInteger(value)) {
      throw new Error("Age must be an integer");
    }
    return Reflect.set(target, prop, value, receiver);
  }
};

// ─── Reflect.construct (alternative to new) ───
function Person(name) { this.name = name; }
const alice = Reflect.construct(Person, ["Alice"]);
console.log(alice instanceof Person); // true

// ─── Reflect.defineProperty returns boolean ───
const success = Reflect.defineProperty(obj, "x", { value: 10 });
console.log(success); // true

// ─── Reflect.apply (alternative to Function.prototype.call) ───
const numbers = [1, 2, 3];
const max = Reflect.apply(Math.max, null, numbers);
console.log(max); // 3
\`\`\`

**Why Reflect?** Consistent return values (boolean vs throwing), cleaner syntax, works properly with Proxies (\`receiver\` parameter).`,
      difficulty: "hard",
      tags: ["javascript", "es6", "metaprogramming"],
      is_top50: true,
    },
    {
      question: "What is debouncing and throttling in JavaScript?",
      answer: `**Debouncing** delays execution until a pause in events. **Throttling** limits execution to once per interval.

\`\`\`javascript
// ─── Debounce: executes AFTER a burst of events ───
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Usage: search input
const searchInput = document.getElementById("search");
const handleSearch = debounce(async (e) => {
  const results = await fetch(\`/api/search?q=\${e.target.value}\`);
  // ...render results
}, 300);
searchInput.addEventListener("input", handleSearch);

// ─── Throttle: executes AT MOST once per interval ───
function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

// Usage: scroll handler
const handleScroll = throttle(() => {
  console.log("Scroll position:", window.scrollY);
  // Check for infinite scroll trigger
}, 200);
window.addEventListener("scroll", handleScroll);

// ─── Lodash equivalents ───
// _.debounce(fn, 300, { leading: true, trailing: true })
// _.throttle(fn, 200)

// ─── Difference at a glance ───
// Debounce: "Wait until they stop typing"
// Throttle: "Run every 200ms while scrolling"
\`\`\`

**When to use:** Debounce → search inputs, auto-save. Throttle → scroll/resize handlers, button clicks (rate limiting).`,
      difficulty: "medium",
      tags: ["javascript", "performance"],
      is_top50: true,
    },
    {
      question: "What is memoization in JavaScript?",
      answer: `**Memoization** optimizes functions by caching results based on input arguments.

\`\`\`javascript
// ─── Simple memoization ───
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Usage: expensive Fibonacci
const fib = memoize(function(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});
console.log(fib(40)); // 102334155 (instant even without optimization)

// ─── Practical: API calls ───
const fetchUser = memoize(async (id) => {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json();
});

// ─── React useMemo ───
import { useMemo } from "react";
function ExpensiveList({ items, filter }) {
  const filtered = useMemo(
    () => items.filter(item => item.name.includes(filter)),
    [items, filter]
  );
  return filtered.map(item => <div key={item.id}>{item.name}</div>);
}

// ─── When NOT to memoize ───
// - Impure functions (rely on external state)
// - Functions with side effects
// - Functions called only once
// - Overhead of caching > cost of recomputation
\`\`\`

**Trade-off:** Memory (cached results) vs speed (recomputation). Use for expensive, deterministic, frequently-called functions.`,
      difficulty: "medium",
      tags: ["javascript", "performance", "optimization"],
      is_top50: true,
    },
    {
      question: "Explain ES Modules vs CommonJS.",
      answer: `**ES Modules (ESM)** and **CommonJS (CJS)** are the two module systems in JavaScript.

| Feature | ES Modules (ESM) | CommonJS (CJS) |
|---------|-----------------|----------------|
| Syntax | \`import\` / \`export\` | \`require()\` / \`module.exports\` |
| Loading | Static (analyzed at parse time) | Dynamic (loaded at runtime) |
| Async/Sync | Async (natively) | Sync |
| Top-level \`this\` | \`undefined\` | \`module.exports\` |
| Strict mode | Always strict | Strict by default only in modules |
| Tree-shaking | Supported (static analysis) | Not supported |
| Circular deps | Handled (live bindings) | Partially (returns partial object) |

\`\`\`javascript
// ─── ES Modules ───
// math.js
export const add = (a, b) => a + b;
export default function multiply(a, b) { return a * b; }

// app.js
import multiply, { add } from "./math.js";
import * as math from "./math.js";
console.log(math.add(2, 3)); // 5

// ─── CommonJS ───
// math.js
const add = (a, b) => a + b;
module.exports = { add, multiply: (a, b) => a * b };

// app.js
const math = require("./math.js");
console.log(math.add(2, 3)); // 5

// ─── Live bindings (ESM) vs value copy (CJS) ───
// ESM: exports are live bindings
export let count = 0;
export function increment() { count++; }
// Importing module sees the updated count

// CJS: exports are value copies
let count = 0;
module.exports = { count, increment: () => count++ };
// Importing module gets a copy of count (not updated unless accessor)
\`\`\`

**Modern practice:** Use ESM for new projects (standard, tree-shakeable). Node.js supports both — use \`.mjs\` or \`"type": "module"\` in package.json for ESM.`,
      difficulty: "medium",
      tags: ["javascript", "modules"],
      is_top50: true,
    },
    {
      question: "What is optional chaining and nullish coalescing in JavaScript?",
      answer: `**Optional chaining (\`?.\`)** safely accesses nested properties without throwing on \`null\`/\`undefined\`. **Nullish coalescing (\`??\`)** returns the right side only when the left is \`null\`/\`undefined\`.

\`\`\`javascript
// ─── Optional chaining ───
const user = {
  profile: { name: "Alice" }
  // .address is not defined
};

// Old way (error-prone):
const city = user && user.address && user.address.city;
// or: const city = user ? (user.address ? user.address.city : undefined) : undefined;

// With ?. (returns undefined instead of throwing):
const city = user?.address?.city;       // undefined
const name = user?.profile?.name;       // "Alice"
const zip = user?.address?.zip ?? "N/A"; // "N/A" (?? handles undefined)

// Method calls
const result = obj.method?.();  // undefined if method doesn't exist
const value = arr?.[0];          // undefined if arr is null/undefined

// Dynamic properties
const key = "name";
console.log(user?.profile?.[key]); // "Alice"

// ─── Nullish coalescing ───
const score = 0;
const username = "";

// ❌ || treats 0, "", false as falsy
const withOr = score || 100;      // 100 (wrong! 0 is valid)
const withOr2 = username || "Guest"; // "Guest" (wrong! "" is valid)

// ✅ ?? only treats null/undefined
const withNullish = score ?? 100;      // 0 (correct!)
const withNullish2 = username ?? "Guest"; // "" (correct!)

// ─── Combining ?. and ?? ───
const displayName = user?.profile?.displayName ?? "Anonymous";

// ─── Cannot be used for assignment ───
obj?.property = "value"; // ❌ SyntaxError
\`\`\`

**Browser support:** All modern browsers (Chrome 80+, Firefox 74+, Safari 13.1+). Transpiled by Babel for older environments.`,
      difficulty: "easy",
      tags: ["javascript", "es2020"],
      is_top50: true,
    },
    {
      question: "What is destructuring in JavaScript?",
      answer: `**Destructuring** unpacks values from arrays or properties from objects into distinct variables.

\`\`\`javascript
// ─── Array destructuring ───
const colors = ["red", "green", "blue", "yellow"];
const [first, second, third] = colors;
console.log(first);  // "red"
console.log(second); // "green"

// Skip elements
const [, , thirdColor] = colors;
console.log(thirdColor); // "blue"

// Rest pattern
const [head, ...tail] = [1, 2, 3, 4];
console.log(head); // 1
console.log(tail); // [2, 3, 4]

// Default values
const [a = 10, b = 20] = [5];

// Swapping variables
let x = 1, y = 2;
[x, y] = [y, x];
console.log(x, y); // 2, 1

// ─── Object destructuring ───
const person = { name: "Alice", age: 30, city: "NYC" };
const { name, age } = person;
console.log(name); // "Alice"

// Renaming
const { name: fullName, age: years } = person;
console.log(fullName); // "Alice"

// Nested destructuring
const data = { user: { id: 1, details: { email: "a@b.com" } } };
const { user: { details: { email } } } = data;
console.log(email); // "a@b.com"

// Default values
const { salary = 50000 } = person;
console.log(salary); // 50000

// ─── Function parameter destructuring ───
function printUser({ name, age, city = "Unknown" }) {
  console.log(\`\${name} (\${age}) from \${city}\`);
}
printUser({ name: "Bob", age: 25 });

// ─── Mixed destructuring ───
const [firstItem, ...rest] = [10, 20, 30, 40];
const { length } = "hello";
console.log(length); // 5
\`\`\`

**Best practice:** Use destructuring for cleaner code, especially with function parameters (options objects) and API responses.`,
      difficulty: "easy",
      tags: ["javascript", "es6"],
      is_top50: true,
    },
    {
      question: "What is the spread and rest operator in JavaScript?",
      answer: `**Spread (\`...\`)** expands iterables into elements. **Rest (\`...\`)** collects remaining elements into an array.

\`\`\`javascript
// ─── Spread: expanding ───
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]

// Copying (shallow)
const copy = [...arr1];
const copyObj = { ...obj };

// String to characters
console.log([..."hello"]); // ['h', 'e', 'l', 'l', 'o']

// Function arguments
const numbers = [5, 10, 15];
console.log(Math.max(...numbers)); // 15

// Object spread
const base = { x: 1, y: 2 };
const extended = { ...base, z: 3 }; // {x: 1, y: 2, z: 3}
const merged = { ...{ a: 1 }, ...{ b: 2 } }; // {a: 1, b: 2}

// ─── Rest: collecting ───
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
console.log(sum(1, 2, 3, 4)); // 10

// Destructuring with rest
const [first, ...others] = [1, 2, 3, 4, 5];
console.log(first);  // 1
console.log(others); // [2, 3, 4, 5]

const { name, ...restProps } = { name: "Alice", age: 30, city: "NYC" };
console.log(name);      // "Alice"
console.log(restProps); // {age: 30, city: "NYC"}

// ─── Common patterns ───
// Removing a property
const { password, ...safeUser } = userWithPassword;

// Adding default + override
const defaults = { theme: "light", lang: "en" };
const config = { ...defaults, ...userPrefs };

// Variadic arguments (rest params preferred over arguments)
function logAll(...args) {
  args.forEach((arg, i) => console.log(i, arg));
}
\`\`\``,
      difficulty: "easy",
      tags: ["javascript", "es6"],
      is_top50: true,
    },
    {
      question: "What are the different ways to handle errors in JavaScript?",
      answer: `JavaScript provides several error handling mechanisms:

**1. try/catch/finally:**
\`\`\`javascript
try {
  const result = riskyOperation();
  console.log(result);
} catch (error) {
  console.error("Error:", error.message);
} finally {
  cleanup(); // Always runs (even if try returns)
}

// finally runs even after return
function test() {
  try { return "from try"; }
  finally { console.log("finally runs"); }
}
console.log(test()); // "finally runs" then "from try"
\`\`\`

**2. Custom errors:**
\`\`\`javascript
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

try {
  throw new ValidationError("Email is required", "email");
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(\`Field \${err.field}: \${err.message}\`);
  } else {
    throw; // re-throw unexpected errors
  }
}
\`\`\`

**3. Error types:**
\`\`\`javascript
throw new Error("Generic");
throw new SyntaxError("Parse error");
throw new TypeError("Wrong type");
throw new ReferenceError("Not defined");
throw new RangeError("Out of range");
throw new URIError("Invalid URI");
\`\`\`

**4. Async error handling:**
\`\`\`javascript
// Promises
fetch("/api/data")
  .then(res => res.json())
  .catch(err => console.error("Fetch failed:", err));

// async/await
async function getData() {
  try {
    const res = await fetch("/api/data");
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return await res.json();
  } catch (err) {
    console.error("Request failed:", err);
    return null;
  }
}

// Global handlers (last resort)
window.onerror = (msg, url, line) => console.log("Global:", msg);
window.addEventListener("unhandledrejection", event => {
  console.error("Unhandled promise rejection:", event.reason);
});
\`\`\`

**5. Error boundaries (React):**
\`\`\`jsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) { /* log error */ }
  render() { return this.props.children; }
}
\`\`\``,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "How do JavaScript timers work? (setTimeout, setInterval, requestAnimationFrame)",
      answer: `JavaScript timers schedule callbacks but don't guarantee precise timing — they queue tasks for the event loop.

\`\`\`javascript
// ─── setTimeout — runs ONCE after delay ───
const timerId = setTimeout(() => {
  console.log("Fired after 1 second");
}, 1000);
clearTimeout(timerId); // Cancel before it fires

// ─── setInterval — runs REPEATEDLY every delay ───
const intervalId = setInterval(() => {
  console.log("Every 2 seconds");
}, 2000);
clearInterval(intervalId); // Cancel

// ─── setTimeout vs setInterval (drift) ───
// setInterval can drift if callbacks take longer than interval
// Safer: recursive setTimeout
function repeat(fn, delay) {
  fn();
  setTimeout(() => repeat(fn, delay), delay);
}

// ─── requestAnimationFrame ───
// Synchronized with screen refresh (60fps), pauses when tab is hidden
function animate() {
  element.style.transform = \`translateX(\${x}px)\`;
  x++;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
// Better for: animations, canvas rendering, scroll-linked effects

// ─── Microtask vs Macrotask ───
setTimeout(() => console.log(1), 0);         // macrotask
queueMicrotask(() => console.log(2));         // microtask
Promise.resolve().then(() => console.log(3)); // microtask
console.log(4);
// Output: 4, 2, 3, 1

// ─── Debounce for timers ───
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ─── Minimum delay ───
// HTML5 spec: minimum delay for setTimeout is 4ms (after 5 nested calls)
// Browsers clamp inactive tabs to 1000ms
\`\`\`

**Key insight:** Timers only guarantee a *minimum* delay, not precise timing. The actual execution depends on the event loop queue.`,
      difficulty: "medium",
      tags: ["javascript", "async", "browser"],
      is_top50: true,
    },
    {
      question: "What is the difference between localStorage, sessionStorage, and cookies?",
      answer: `| Feature | localStorage | sessionStorage | Cookies |
|---------|-------------|---------------|---------|
| Persistence | Until manually cleared | Until tab is closed | Until expires (configurable) |
| Capacity | ~5-10MB per origin | ~5-10MB per origin | ~4KB per cookie |
| Sent to server | No | No | Yes (auto via headers) |
| Access | Any window/tab (same origin) | Only current tab | Any window/tab (same origin) |
| Scope | Per origin | Per origin + tab | Per origin + path |
| Expiration | Never | On tab close | Set via \`max-age\` or \`expires\` |
| API | \`localStorage\` object | \`sessionStorage\` object | \`document.cookie\` (string) |
| HTTP-only | No | No | Yes (via \`HttpOnly\` flag) |

\`\`\`javascript
// ─── localStorage ───
localStorage.setItem("theme", "dark");
localStorage.setItem("user", JSON.stringify({ id: 1, name: "Alice" }));
const theme = localStorage.getItem("theme"); // "dark"
const user = JSON.parse(localStorage.getItem("user"));
localStorage.removeItem("theme");
localStorage.clear();

// ─── sessionStorage (same API, different persistence) ───
sessionStorage.setItem("tab-session", "active");
// Cleared when the tab is closed

// ─── Cookies ───
document.cookie = "username=Alice; path=/; max-age=86400"; // 1 day
document.cookie = "theme=dark; path=/; Secure; HttpOnly; SameSite=Strict";
document.cookie = "lang=en-US; expires=Wed, 01 Jan 2026 00:00:00 GMT";

// Read all cookies
const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
  const [key, value] = cookie.split("=");
  acc[key] = value;
  return acc;
}, {});

// ─── When to use what ───
// localStorage: User preferences, cached data (long-term)
// sessionStorage: Form drafts, tab-specific state
// Cookies: Session IDs, auth tokens (with HttpOnly), tracking
// Modern alternative: IndexedDB for large structured data
\`\`\`

**Security:** Cookies with \`HttpOnly\` can't be accessed by JavaScript (prevents XSS). \`Secure\` flag ensures HTTPS only. \`SameSite\` prevents CSRF.`,
      difficulty: "easy",
      tags: ["javascript", "browser", "storage"],
      is_top50: true,
    },
    {
      question: "What is event delegation in JavaScript?",
      answer: `**Event delegation** leverages event bubbling to handle events at a parent level rather than attaching listeners to each child.

\`\`\`javascript
// ❌ Without delegation — many listeners
document.querySelectorAll("li").forEach(li => {
  li.addEventListener("click", () => {
    console.log("Item clicked");
  });
});

// ✅ With delegation — ONE listener
document.querySelector("ul").addEventListener("click", (event) => {
  const li = event.target.closest("li"); // Find closest matching element
  if (li) {
    console.log("Item clicked:", li.textContent);
  }
});

// ─── Practical: dynamic content ───
// Newly added items automatically handled without re-binding
document.querySelector(".list").addEventListener("click", (e) => {
  const item = e.target.closest(".item");
  if (!item) return;

  console.log("Clicked item:", item.dataset.id);

  if (e.target.matches(".delete-btn")) {
    item.remove();
  }
});

// ─── Filtering delegated events ───
document.querySelector(".toolbar").addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  switch (action) {
    case "save": saveDocument(); break;
    case "delete": deleteDocument(); break;
    case "print": printDocument(); break;
  }
});

// ─── Benefits ───
// 1. Memory efficient (1 listener vs N listeners)
// 2. Works with dynamically added elements
// 3. Easier to maintain
// 4. Less code

// ─── Caveats ───
// - Not all events bubble (focus, blur, scroll, load, error)
// - Must use event.target to identify the source
// - event.stopPropagation() blocks delegation
\`\`\`

**Use cases:** Lists, tables, menus, toolbars, any repeated element pattern.`,
      difficulty: "medium",
      tags: ["javascript", "dom", "events"],
      is_top50: true,
    },
    {
      question: "How does garbage collection work in JavaScript?",
      answer: `JavaScript uses **automatic garbage collection (GC)** — the engine automatically frees memory that is no longer reachable.

**Mark-and-Sweep algorithm (modern engines):**
1. Start from roots (global object, current function's local variables, DOM references)
2. Mark all reachable objects by traversing references
3. Sweep (free) all unmarked objects

\`\`\`javascript
// ─── Reachable → not collected ───
let user = { name: "Alice" };    // Root → reachable
let admin = user;                 // Still reachable via admin
user = null;                      // Still reachable via admin

// ─── Unreachable → collected ───
function createPerson() {
  let person = { name: "Bob" };  // Local variable
  return { getName: () => person.name }; // Closure retains person
}
const bob = createPerson();      // person is NOT collected (closure)

// ─── Common memory leaks ───
// 1. Accidental globals
function leak() {
  leaked = "global!"; // Creates window.leaked — never collected
}

// 2. Forgotten timers
const data = fetchData();
setInterval(() => {
  console.log(data); // data kept alive as long as interval runs
}, 1000);
// clearInterval() needed to free data

// 3. Detached DOM elements
const button = document.getElementById("btn");
const parent = button.parentNode;
parent.removeChild(button);
// button still referenced — not collected

// 4. Closures holding large data
function heavy() {
  const largeArray = new Array(1000000).fill("x");
  return () => console.log("still holds largeArray");
}

// 5. Event listeners not removed
element.addEventListener("scroll", handler);
// element.removeEventListener("scroll", handler) — cleanup!

// ─── WeakMap/WeakSet for safe caching ───
const cache = new WeakMap();
function process(obj) {
  if (!cache.has(obj)) cache.set(obj, expensiveComputation(obj));
  return cache.get(obj);
}
// Cache entry auto-collected when obj is GC'd
\`\`\`

**Developer tools:** Chrome DevTools → Memory tab → Heap snapshot to detect leaks. Use the Allocation Timeline to track allocations.`,
      difficulty: "hard",
      tags: ["javascript", "performance", "memory"],
      is_top50: true,
    },
    {
      question: "Explain the structuredClone API in JavaScript.",
      answer: `**\`structuredClone()\`** (ES2023) creates a deep clone of an object using the structured clone algorithm — handles circular references, Dates, Maps, Sets, RegExp, ArrayBuffers, and more.

\`\`\`javascript
const original = {
  name: "Alice",
  date: new Date(),
  nested: { arr: [1, 2, 3] },
  map: new Map([["key", "value"]]),
  set: new Set([1, 2, 3]),
  regex: /hello/gi,
  // Circular reference
};
original.self = original; // Circular!

const clone = structuredClone(original);

console.log(clone === original);           // false
console.log(clone.date === original.date); // false (new Date)
console.log(clone.nested.arr === original.nested.arr); // false (deep)
console.log(clone.self === clone);         // true (circular preserved)
console.log(clone.map === original.map);   // false

// ─── What IS supported ───
// Primitives, arrays, objects, Date, RegExp, Map, Set, Blob, File,
// FileList, ImageBitmap, ArrayBuffer, TypedArrays, Error types

// ─── What is NOT supported ───
// Functions, DOM elements, WeakMap, WeakSet, Symbols, prototypes
// class Person {}
// structuredClone(new Person()); // ❌ DataCloneError

// ─── Compare with other cloning methods ───
const obj = { a: 1, b: { c: 2 }, d: new Date() };

// Shallow copy: {...obj} or Object.assign()
// ❌ Nested objects still shared

// JSON roundtrip: JSON.parse(JSON.stringify(obj))
// ❌ Loses Date (becomes string), Map, Set, RegExp, undefined, functions
// ❌ Fails on circular references

// structuredClone: ✅ Deep ✅ Handles types ✅ Circular refs
\`\`\`

**Use cases:** Deep cloning state before mutation, serializing for Web Workers/IndexedDB, cache snapshots.`,
      difficulty: "medium",
      tags: ["javascript", "es2023"],
      is_top50: true,
    },
    {
      question: "What are regular expressions in JavaScript?",
      answer: `**Regular expressions** are patterns used to match character combinations in strings.

\`\`\`javascript
// ─── Creating regex ───
const literal = /pattern/flags;
const constructor = new RegExp("pattern", "flags");

// ─── Common flags ───
// g — global (find all matches)
// i — case-insensitive
// m — multiline
// s — dotAll (. matches newline)
// u — unicode
// y — sticky (starts from lastIndex)

// ─── Methods ───
const text = "Hello World! Hello JavaScript!";

// test() — boolean
/world/i.test(text);              // true

// exec() — returns match info
const regex = /hello/gi;
let match;
while ((match = regex.exec(text)) !== null) {
  console.log(\`Found "\${match[0]}" at \${match.index}\`);
}

// String methods with regex
text.match(/hello/gi);          // ["Hello", "Hello"]
text.search(/world/i);          // 6 (index, -1 if not found)
text.replace(/hello/gi, "Hi");  // "Hi World! Hi JavaScript!"
text.split(/\s+/);              // ["Hello", "World!", "Hello", "JavaScript!"]

// ─── Character classes ───
// .  → any character (except newline)
// \d → digit [0-9]
// \w → word char [a-zA-Z0-9_]
// \s → whitespace [ \t\n\r\f\v]
// \b → word boundary

// ─── Quantifiers ───
// +  → 1 or more
// *  → 0 or more
// ?  → 0 or 1
// {n} → exactly n
// {n,} → n or more
// {n,m} → n to m

// ─── Groups and capturing ───
const phone = /(\d{3})-(\d{3})-(\d{4})/;
const match2 = "555-123-4567".match(phone);
console.log(match2[1]); // "555"
console.log(match2[2]); // "123"
console.log(match2[3]); // "4567"

// Named groups (ES2018)
const named = /(?<area>\d{3})-(?<exchange>\d{3})-(?<line>\d{4})/;
const { groups } = "555-123-4567".match(named);
console.log(groups.area);     // "555"

// ─── Lookahead / Lookbehind ───
// Positive lookahead:  x(?=y)  — x followed by y
// Negative lookahead:  x(?!y)  — x not followed by y
// Positive lookbehind: (?<=y)x — x preceded by y (ES2018)
// Negative lookbehind: (?<!y)x — x not preceded by y (ES2018)

// ─── Practical examples ───
const emailRegex = /^[\w.-]+@[\w.-]+\.\w{2,}$/;
const urlRegex = /^https?:\/\/[\w.-]+/;
const hexColor = /^#([0-9a-f]{3}){1,2}$/i;
\`\`\`

**Performance:** Avoid catastrophic backtracking — use atomic groups and possessive quantifiers for complex patterns.`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "What is BigInt in JavaScript?",
      answer: `**BigInt** (ES2020) represents integers with arbitrary precision, beyond the \`Number.MAX_SAFE_INTEGER\` (2⁵³ - 1) limit.

\`\`\`javascript
// ─── Creating BigInt ───
const big1 = 9007199254740991n;       // n suffix
const big2 = BigInt("9007199254740991");
const big3 = BigInt(0x1FFFFFFFFFFFFF);

// ─── Operations ───
const a = 1000000000000000000000n;
const b = 2000000000000000000000n;
console.log(a + b);        // 3000000000000000000000n
console.log(a * b);        // 2000000000000000000000000000000000000000000n
console.log(a ** 100n);    // Huge!
console.log(a / 3n);       // 333333333333333333333n (truncates toward zero)
console.log(a % 3n);       // 1n

// ─── Comparison ───
console.log(1n === 1);  // false (different types)
console.log(1n == 1);   // true (loose equality)
console.log(1n < 2);    // true

// ─── Cannot mix with regular numbers ───
1n + 1;  // ❌ TypeError: Cannot mix BigInt and other types
1n + BigInt(1); // ✅ 2n
Number(1n) + 1;   // ✅ 2 (but may lose precision!)

// ─── When to use BigInt ───
// Financial calculations (precise large values)
// Cryptography and hashing
// Database IDs (64-bit integers)
// Timestamps with microsecond precision

// ─── Limitations ───
// No Math methods on BigInt
// Not JSON-serializable (TypeError)
// Can't be used with || or && in some contexts
const obj = { a: 1n };
JSON.stringify(obj); // ❌ TypeError
// Workaround: serialize as string
JSON.stringify(obj, (key, value) =>
  typeof value === "bigint" ? value.toString() + "n" : value
);
\`\`\`

**Performance:** BigInt operations are slower than Number operations. Use BigInt only when you need the precision.`,
      difficulty: "medium",
      tags: ["javascript", "es2020"],
      is_top50: true,
    },
    {
      question: "What is globalThis in JavaScript?",
      answer: `**\`globalThis\`** (ES2020) provides a standard way to access the global object across all JavaScript environments.

\`\`\`javascript
// ─── Before globalThis — environment-specific ───
// Browsers: window, self, frames
// Web Workers: self
// Node.js: global
// Any: this (in global scope, not in modules)

// ─── With globalThis — universal ───
console.log(globalThis); // Works everywhere!

// ─── Examples ───
globalThis.setTimeout(() => console.log("Hi"), 1000);
globalThis.console.log("Hello");

// Polyfill (useful for older environments)
const getGlobal = () => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof window !== "undefined") return window;
  if (typeof self !== "undefined") return self;
  if (typeof global !== "undefined") return global;
  throw new Error("Cannot find global object");
};

// ─── Practical use ───
// Setting globals in libraries
globalThis.myLibrary = { version: "1.0.0" };

// Feature detection
const hasConsole = typeof globalThis.console !== "undefined";

// Environment detection
const isBrowser = typeof globalThis.window !== "undefined";
const isNode = typeof globalThis.process !== "undefined";
\`\`\`

**Browser support:** Chrome 71+, Firefox 65+, Safari 12.1+, Node.js 12+.`,
      difficulty: "easy",
      tags: ["javascript", "es2020"],
      is_top50: true,
    },
    {
      question: "What are the different Array methods and how do map, filter, and reduce work?",
      answer: `JavaScript arrays have powerful built-in iteration methods. The "big three" are \`map\`, \`filter\`, and \`reduce\`.

**Comparison table:**

| Method | Returns | Purpose |
|--------|---------|---------|
| \`map\` | New array (same length) | Transform each element |
| \`filter\` | New array (subset) | Keep elements passing a test |
| \`reduce\` | Single value | Accumulate elements into one value |
| \`find\` | First match or \`undefined\` | Find element by condition |
| \`some\` | Boolean | Any element passes test? |
| \`every\` | Boolean | All elements pass test? |
| \`flat\` | New array (flattened) | Flatten nested arrays |
| \`flatMap\` | New array | Map then flatten 1 level |
| \`sort\` | Same array (sorted, mutated) | Sort elements |
| \`forEach\` | \`undefined\` | Execute side effect per element |

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5, 6];

// map — 1:1 transformation
const doubled = numbers.map(n => n * 2);       // [2, 4, 6, 8, 10, 12]
const objArr = numbers.map(n => ({ value: n })); // [{value:1}, ...]

// filter — keep subset
const evens = numbers.filter(n => n % 2 === 0);   // [2, 4, 6]
const big = numbers.filter(n => n > 3);            // [4, 5, 6]

// reduce — accumulate
const sum = numbers.reduce((acc, n) => acc + n, 0); // 21
const max = numbers.reduce((a, b) => Math.max(a, b)); // 6
const grouped = numbers.reduce((acc, n) => {
  const key = n % 2 === 0 ? "even" : "odd";
  acc[key].push(n);
  return acc;
}, { even: [], odd: [] });
// { even: [2, 4, 6], odd: [1, 3, 5] }

// Chaining
const result = numbers
  .filter(n => n > 2)
  .map(n => n * 3)
  .reduce((a, b) => a + b, 0); // (3+4+5+6)*3 = 54

// flat & flatMap
const nested = [[1, 2], [3, [4, 5]]];
nested.flat();              // [1, 2, 3, [4, 5]]
nested.flat(2);             // [1, 2, 3, 4, 5]

const sentences = ["hello world", "foo bar"];
sentences.flatMap(s => s.split(" ")); // ["hello", "world", "foo", "bar"]

// find & some & every
numbers.find(n => n > 4);    // 5
numbers.some(n => n > 10);   // false
numbers.every(n => n > 0);   // true

// sort (CAUTION: mutates original!)
const unsorted = [3, 1, 10, 2];
unsorted.sort();                     // [1, 10, 2, 3] (lexicographic!)
unsorted.sort((a, b) => a - b);      // [1, 2, 3, 10] (numeric!)
\`\`\`

**Performance tip:** Chain methods carefully — each creates a new array. For large datasets, consider a single \`reduce\` or a \`for\` loop.`,
      difficulty: "easy",
      tags: ["javascript", "arrays"],
      is_top50: true,
    },
    {
      question: "What is the Iterator protocol and how does for...of work?",
      answer: `The **iterator protocol** defines a standard way to produce a sequence of values. \`for...of\` loops consume iterables.

\`\`\`javascript
// ─── Iterator protocol ───
// An object is iterable if it has a [Symbol.iterator] method
// that returns an iterator (an object with .next() method)

const counter = {
  current: 0,
  max: 5,
  [Symbol.iterator]() {
    return {
      current: this.current,
      max: this.max,
      next() {
        this.current++;
        if (this.current <= this.max) {
          return { value: this.current, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

// ─── for...of — consumes iterables ───
for (const num of counter) {
  console.log(num); // 1, 2, 3, 4, 5
}

// ─── Manual iteration ───
const iter = counter[Symbol.iterator]();
console.log(iter.next()); // { value: 1, done: false }
console.log(iter.next()); // { value: 2, done: false }

// ─── Built-in iterables ───
for (const char of "hello") console.log(char);      // h, e, l, l, o
for (const [k, v] of new Map([["a", 1]])) {}       // ["a", 1]
for (const item of new Set([1, 2, 3])) {}           // 1, 2, 3
for (const arg of arguments) {}                     // function arguments
for (const node of document.querySelectorAll("div")) {} // NodeList

// ─── Spread uses iteration under the hood ───
console.log([...counter]); // [1, 2, 3, 4, 5]
console.log(Math.max(...counter)); // 5

// ─── Making objects iterable ───
const range = {
  from: 1, to: 3,
  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) {
      yield i;
    }
  }
};
console.log([...range]); // [1, 2, 3]

// ─── for...of vs for...in ───
// for...of → values of iterable (arrays, strings, Map, Set)
// for...in → enumerable property keys (objects, arrays)
const arr = ["a", "b"];
for (const v of arr) console.log(v); // "a", "b" (values)
for (const k in arr) console.log(k); // "0", "1" (indices)
\`\`\`

**Use cases:** Custom data structures, pagination, streaming data, range generators.`,
      difficulty: "medium",
      tags: ["javascript", "es6"],
      is_top50: true,
    },
    {
      question: "How does the comma operator work in JavaScript?",
      answer: `The **comma operator (\`,\`)** evaluates each operand left-to-right and returns the last value. It has the lowest precedence of all operators.

\`\`\`javascript
// ─── Basic behavior ───
let x = (1, 2, 3);
console.log(x); // 3 — returns the last expression

// ─── Common use: reduce boilerplate ───
// In for loops
for (let a = 0, b = 10; a <= b; a++, b--) {
  console.log(a, b); // 0 10, 1 9, 2 8, ...
}

// ─── With arrow functions ───
// Returning multiple expressions
const result = arr.map(x => (x++, x * 2));
//   x++   → increments x (returns original)
//   x * 2 → returns new value

// ─── Conditional execution ───
// Execute multiple statements in a ternary
const action = isAdmin
  ? (openPanel(), loadData(), log("admin"), "ready")
  : (showLogin(), "redirect");

// ─── With assignment — beware! ───
let a, b;
a = (b = 1, b + 1); // a = 2 (b = 1, then b + 1 = 2)
console.log(a);      // 2
console.log(b);      // 1

// ─── Gotcha: comma vs comma in declarations ───
let x = 1, 2, 3;     // ❌ SyntaxError
let x = (1, 2, 3);   // ✅ x = 3

// In destructuring, comma skips elements
const [a, , b] = [1, 2, 3];
console.log(a, b); // 1, 3

// ─── Comma in console.log ───
// These are multiple arguments, not the comma operator!
console.log((1, 2)); // logs 2 (comma operator inside parens)
console.log(1, 2);   // logs 1 then 2 (multiple arguments)
\`\`\`

**Use sparingly:** The comma operator can reduce readability. Best reserved for loops, small arrow functions, and code golf.`,
      difficulty: "medium",
      tags: ["javascript"],
      is_top50: true,
    },
    {
      question: "Explain the concept of temporal dead zone with let and const variables.",
      answer: `The **Temporal Dead Zone (TDZ)** is the time between entering a scope and a \`let\`/\`const\` declaration, during which the variable cannot be accessed.

\`\`\`javascript
{
  // TDZ starts for 'name'

  // ❌ Accessing during TDZ throws ReferenceError
  console.log(name); // ReferenceError: Cannot access 'name' before initialization

  const name = "Alice";
  // TDZ ends here

  console.log(name); // ✅ "Alice"
}

// ─── Why TDZ exists ───
// Without TDZ, let/const would silently return undefined like var
// TDZ helps catch bugs where you access variables before declaring them

// ─── typeof and TDZ ───
typeof undeclared;      // ✅ "undefined" — variable doesn't exist
typeof tdzVar;          // ❌ ReferenceError — variable EXISTS but in TDZ
let tdzVar = 42;

// ─── TDZ in default parameters ───
function test(a = b, b = 2) {}
test(); // ❌ ReferenceError: a tries to access b BEFORE its declaration

// Order matters: first param can use second if second is before it
function ok(a = 1, b = a) {} // ✅ a=1, b=a → b=1
function bad(a = b, b = 1) {} // ❌ TDZ for b when a tries to use it

// ─── TDZ in class inheritance ───
class Parent {}
// ❌ Cannot access Child before initialization
class Child extends Parent {}

// Let/const in TDZ are NOT hoisted like var
console.log(varVar);  // ✅ undefined (hoisted + initialized)
var varVar = 5;

console.log(letVar);  // ❌ ReferenceError (hoisted but not initialized)
let letVar = 5;

// ─── Practical impact ───
// Always declare at the top of their scope
// Use const by default, let for reassignment
// Never rely on hoisting for let/const
\`\`\`

**Key takeaway:** Unlike \`var\` (initialized with \`undefined\`), \`let\`/\`const\` are hoisted but not initialized. The TDZ prevents access before declaration, catching bugs early.`,
      difficulty: "medium",
      tags: ["javascript", "es6"],
      is_top50: true,
    },
    // ──────── React ────────
    {
      question: "What is React and how does it differ from other JavaScript frameworks?",
      answer: `React is a declarative, component-based UI library developed by Meta. Unlike full-fledged frameworks (Angular, Vue), React focuses solely on the view layer and can be integrated with other libraries for routing, state management, etc. It uses a virtual DOM for efficient updates, a unidirectional data flow, and JSX syntax. React's ecosystem is modular, giving developers flexibility to choose their tools.`,
      difficulty: "easy",
      tags: ["react", "framework"],
      is_top50: true,
    },
    {
      question: "Explain the Virtual DOM and how React uses it for performance.",
      answer: `The virtual DOM is a lightweight JavaScript representation of the actual DOM. When state changes, React creates a new virtual DOM tree, diffs it against the previous one (reconciliation), calculates the minimal set of DOM mutations, and applies them in batch. This avoids expensive direct DOM manipulation and layout recalculations. React's Fiber architecture enables incremental rendering, prioritizing urgent updates (like user input) over background ones.`,
      difficulty: "medium",
      tags: ["react", "virtual-dom", "performance"],
      is_top50: true,
    },
    {
      question: "What is JSX and why is it used in React?",
      answer: `JSX (JavaScript XML) is a syntax extension that lets you write HTML-like markup inside JavaScript. It makes component code more readable and intuitive. Under the hood, Babel compiles JSX into \`React.createElement()\` calls, which produce virtual DOM elements. JSX is not required to use React, but it is the standard approach because it keeps markup and logic colocated.`,
      difficulty: "easy",
      tags: ["react", "jsx"],
      is_top50: true,
    },
    {
      question: "Difference between functional and class components.",
      answer: `Functional components are plain JavaScript functions that accept props and return JSX. Class components extend \`React.Component\` and have a \`render()\` method. Before React 16.8, class components were required for state and lifecycle. With hooks, functional components can now manage state (\`useState\`), side effects (\`useEffect\`), and all other features, making them the modern standard. Class components are still supported but no longer recommended for new code.`,
      difficulty: "easy",
      tags: ["react", "components"],
      is_top50: true,
    },
    {
      question: "What are props and how do they differ from state?",
      answer: `Props (properties) are read-only data passed from a parent to a child component. They cannot be modified by the child. State is internal, mutable data managed within a component. When state changes, the component re-renders. Props flow downward (unidirectional); state is private to the component. Think of props as function arguments and state as local variables.`,
      difficulty: "easy",
      tags: ["react", "props", "state"],
      is_top50: true,
    },
    {
      question: "Explain the useState hook with an example.",
      answer: `\`useState\` is a hook that adds state to functional components. It returns an array with two elements: the current state value and a setter function to update it.

Example:

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

Calling \`setCount(newValue)\` triggers a re-render of the component. The initial value is only used on the first render. State updates are batched for performance and should be treated as immutable.`,
      difficulty: "easy",
      tags: ["react", "hooks", "useState"],
      is_top50: true,
    },
    {
      question: "How does useEffect work? What is the cleanup function?",
      answer: `\`useEffect\` runs side effects after render. It takes a callback and an optional dependency array. With no deps, it runs after every render. With \`[]\` it runs once on mount. With \`[a, b]\` it runs when \`a\` or \`b\` change. The cleanup function (returned from the callback) runs before the next effect and on unmount, preventing memory leaks from subscriptions, timers, or event listeners.`,
      difficulty: "medium",
      tags: ["react", "hooks", "useEffect"],
      is_top50: true,
    },
    {
      question: "What is the difference between useMemo and useCallback?",
      answer: `\`useMemo\` memoizes a computed value, recalculating only when dependencies change. \`useCallback\` memoizes a function reference. Both prevent unnecessary re-renders of child components by ensuring stable references. \`useMemo\` is for expensive computations; \`useCallback\` is for callback props passed to memoized children.

Example:

\`\`\`javascript
useMemo(() => expensive(a, b), [a, b]);
useCallback(() => doSomething(x), [x]);
\`\`\``,
      difficulty: "medium",
      tags: ["react", "hooks", "useMemo", "useCallback"],
      is_top50: true,
    },
    {
      question: "Explain useRef and its common use cases.",
      answer: `\`useRef\` returns a mutable object (\`.current\`) that persists across renders without causing re-renders. Common uses: accessing DOM elements directly (\`inputRef.current.focus()\`), storing previous values, keeping interval IDs for cleanup, and tracking mutable values that shouldn't trigger re-renders. Unlike state, mutating \`.current\` does not cause a re-render.`,
      difficulty: "medium",
      tags: ["react", "hooks", "useRef"],
      is_top50: true,
    },
    {
      question: "How does useContext work and when should you use it?",
      answer: `\`useContext\` lets you consume a React context directly in functional components. Pass the context object to \`useContext\`, and it returns the current context value. Use it to avoid prop drilling (passing props through many levels). Best for genuinely global state like themes, auth, or locale settings. For complex state logic, pair with \`useReducer\` instead of prop drilling through multiple levels.`,
      difficulty: "medium",
      tags: ["react", "hooks", "useContext", "context-api"],
      is_top50: true,
    },
    {
      question: "What is useReducer and when is it better than useState?",
      answer: `\`useReducer\` is a hook for managing complex state logic. It takes a reducer function \`(state, action) => newState\` and an initial state, returning \`[state, dispatch]\`. It's better than \`useState\` when: state has multiple sub-values, next state depends on previous state, or state transitions are complex (e.g., form state with many fields). The reducer pattern makes logic testable and predictable, similar to Redux.`,
      difficulty: "medium",
      tags: ["react", "hooks", "useReducer"],
      is_top50: true,
    },
    {
      question: "What are custom hooks? Write an example.",
      answer: `Custom hooks are JavaScript functions that start with 'use' and can call other hooks. They extract reusable stateful logic from components.

Example:

\`\`\`javascript
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
\`\`\``,
      difficulty: "medium",
      tags: ["react", "hooks", "custom-hooks"],
      is_top50: true,
    },
    {
      question: "Explain React reconciliation and the key prop.",
      answer: `Reconciliation is React's algorithm for diffing two virtual DOM trees. It determines which parts of the actual DOM need updating. React uses heuristics: comparing element types, then props. The \`key\` prop helps React identify which items in a list have changed, been added, or removed. Keys should be unique, stable, and predictable. Using index as key is discouraged when items can reorder because it causes unnecessary re-renders and state bugs.`,
      difficulty: "medium",
      tags: ["react", "reconciliation", "keys"],
      is_top50: true,
    },
    {
      question: "How does React handle events? What are synthetic events?",
      answer: `React wraps native events in \`SyntheticEvent\` objects, providing cross-browser consistency. SyntheticEvents are pooled for performance. The event object is reused, so accessing it asynchronously (inside \`setTimeout\`) requires \`event.persist()\`. React attaches event listeners at the root container using event delegation rather than to individual elements, reducing memory usage.`,
      difficulty: "medium",
      tags: ["react", "events", "synthetic-events"],
      is_top50: true,
    },
    {
      question: "Controlled vs uncontrolled components -- difference and use cases.",
      answer: `Controlled components have their value managed by React state. The component re-renders on every change. Uncontrolled components store their value in the DOM (using \`ref\`), like traditional HTML forms. Controlled components give more control (instant validation, conditional inputs) but require more code. Prefer controlled for most cases; use uncontrolled for simple, non-critical inputs or when integrating with non-React code.`,
      difficulty: "medium",
      tags: ["react", "forms", "controlled-components"],
      is_top50: true,
    },
    {
      question: "What are React Server Components (RSC)?",
      answer: `React Server Components are components that render on the server, sending only the resulting HTML to the client. They reduce client-side JavaScript bundle size, enable direct access to server-side resources (databases, file systems), and improve initial page load performance. RSC cannot use state, effects, or browser APIs. They seamlessly compose with client components, which are marked with 'use client'.`,
      difficulty: "hard",
      tags: ["react", "react-19", "server-components"],
      is_top50: true,
    },
    {
      question: "Explain the use() hook in React 19.",
      answer: `\`use()\` is a new React 19 hook that reads a promise or context directly in render. It suspends the component until the promise resolves, eliminating the need for \`useEffect + useState\` for async data fetching.

Example:

\`\`\`javascript
const data = use(fetchData());
const theme = use(ThemeContext);
\`\`\`

Unlike \`useEffect\`, \`use()\` integrates with Suspense boundaries naturally.`,
      difficulty: "hard",
      tags: ["react", "react-19", "hooks", "use"],
      is_top50: true,
    },
    {
      question: "What is useActionState and how does it simplify forms?",
      answer: `\`useActionState\` is a React 19 hook that binds form data to a server action. It returns \`[state, formAction]\` and automatically handles form submission, resetting, and pending states. It reduces boilerplate for form handling. No manual \`preventDefault\`, no \`useState\` for form state, no manual error handling. The action receives the previous state and form data, returning the new state.`,
      difficulty: "hard",
      tags: ["react", "react-19", "useActionState", "forms"],
      is_top50: true,
    },
    {
      question: "How does the React Compiler (React Forget) work?",
      answer: `The React Compiler is a build-time tool that automatically memoizes React code. It analyzes components and hooks, automatically adding \`useMemo\`, \`useCallback\`, and \`React.memo\` where needed. Developers no longer need to manually optimize with these hooks. The compiler handles it, reducing bugs from missing dependencies and over-memoization. It works at the function level, transforming valid JavaScript to memoized versions.`,
      difficulty: "hard",
      tags: ["react", "react-19", "react-compiler"],
      is_top50: true,
    },
    {
      question: "What are React 19 Actions?",
      answer: `React 19 Actions are async functions passed as the \`action\` prop to form elements. They handle pending states (\`useActionState\`, \`useFormStatus\`), optimistic updates (\`useOptimistic\`), and error handling automatically. Actions can be server functions (RSC) or client-side. This replaces manual form submission with native HTML form integration, making React work seamlessly with the platform's form semantics.`,
      difficulty: "hard",
      tags: ["react", "react-19", "actions"],
      is_top50: true,
    },
    {
      question: "How do you optimize React performance?",
      answer: `Key optimization techniques:
- \`React.memo\` for preventing unnecessary re-renders of pure components
- \`useMemo\` for expensive computations
- \`useCallback\` for stable function references
- Lazy loading with \`React.lazy + Suspense\` for code splitting
- Virtualization (\`react-window\`, \`react-virtuoso\`) for large lists
- Avoid creating new objects/arrays in render
- Use proper keys in lists
- Leverage the React Compiler (React 19) for automatic memoization

Profile with React DevTools to identify bottlenecks.`,
      difficulty: "hard",
      tags: ["react", "performance", "optimization"],
      is_top50: true,
    },
    {
      question: "What are Error Boundaries and how do you create one?",
      answer: `Error Boundaries are React components that catch JavaScript errors in their child component tree, log them, and display a fallback UI instead of crashing the whole app. They are created using class component lifecycle methods: \`static getDerivedStateFromError()\` and \`componentDidCatch()\`. There is no hook equivalent yet, but React 19 is working on one. Error Boundaries do not catch errors in event handlers, async code, or server-side rendering.`,
      difficulty: "medium",
      tags: ["react", "error-boundaries"],
      is_top50: true,
    },
    {
      question: "Explain React Context API -- when is it appropriate vs prop drilling?",
      answer: `The Context API provides a way to share values across the component tree without passing props through every level. Create context with \`createContext\`, provide with \`Provider\`, consume with \`useContext\`. Use it for low-frequency global state (theme, locale, auth user). It is not a full state management solution. Avoid it for frequently updating state (causes entire subtree re-renders). For high-frequency updates, use Zustand, Redux, or pair Context with \`useReducer\` and memoization.`,
      difficulty: "medium",
      tags: ["react", "context-api"],
      is_top50: true,
    },
    {
      question: "How does React Router work?",
      answer: `React Router enables client-side navigation in React SPAs. The latest version uses: \`BrowserRouter\` for history-based routing, \`Routes + Route\` for declarative route configuration, \`Link\` and \`NavLink\` for navigation, and \`Outlet\` for nested layouts. Key features: nested routes, data loading (loaders), actions for mutations, and lazy loading. Routes are matched by best fit, and components re-render only when relevant route params change.`,
      difficulty: "medium",
      tags: ["react", "react-router", "routing"],
      is_top50: true,
    },
    {
      question: "Composition vs inheritance in React.",
      answer: `React favors composition over inheritance. Instead of extending base components, compose smaller, focused components together. Patterns: containment (\`children\` prop), specialization (configurable components via props), and higher-order components. Inheritance hierarchies lead to tight coupling and fragile code. Composition is more flexible. You can combine components in different arrangements without modifying existing code.`,
      difficulty: "medium",
      tags: ["react", "composition", "inheritance"],
      is_top50: true,
    },
    {
      question: "What are Higher-Order Components (HOCs) and Render Props?",
      answer: `HOCs are functions that take a component and return a new enhanced component (e.g., \`withAuth(MyComponent)\`). Render props are props whose value is a function that renders JSX, letting the parent control what is rendered.

Example:

\`\`\`jsx
<DataProvider render={data => <List data={data} />} />
\`\`\`

Both patterns solve cross-cutting concerns (auth, data fetching). Custom hooks have largely replaced both as they are simpler and avoid wrapper hell.`,
      difficulty: "medium",
      tags: ["react", "hoc", "render-props"],
      is_top50: true,
    },
    {
      question: "What is the difference between useEffect and useLayoutEffect?",
      answer: `\`useEffect\` runs asynchronously after the browser paints. It does not block visual updates. \`useLayoutEffect\` runs synchronously before the browser paints, blocking rendering until it completes. Use \`useLayoutEffect\` when you need to measure DOM elements or make synchronous DOM mutations before the user sees the result. For most cases, prefer \`useEffect\` because \`useLayoutEffect\` can delay paint and impact perceived performance.`,
      difficulty: "medium",
      tags: ["react", "hooks", "useEffect", "useLayoutEffect"],
      is_top50: true,
    },
    {
      question: "What are Pure Components in React?",
      answer: `A Pure Component in React prevents unnecessary re-renders by implementing \`shouldComponentUpdate\` with a shallow comparison of props and state. Class components extend \`React.PureComponent\`. For functional components, \`React.memo\` serves the same purpose. PureComponent and React.memo only do shallow comparisons. If you pass objects or arrays, mutations won't trigger updates unless a new reference is created. They are useful for leaf components that re-render often with the same props.`,
      difficulty: "medium",
      tags: ["react", "pure-component", "performance"],
      is_top50: true,
    },
    {
      question: "Explain React.memo and when should you use it?",
      answer: `\`React.memo\` is a higher-order component that memoizes a functional component. It performs a shallow comparison of props and skips re-rendering if props haven't changed. Use it for components that: render often, receive few props that rarely change, or are expensive to render (large subtrees). Don't use it prematurely. Profile first with React DevTools. Over-memoizing can waste memory and actually harm performance from the comparison cost.`,
      difficulty: "medium",
      tags: ["react", "memo", "performance"],
      is_top50: true,
    },
    {
      question: "What is the StrictMode component in React?",
      answer: `StrictMode is a development-only wrapper that helps catch bugs. It double-invokes render functions, effects, and state initializers to surface side effects and impure logic. It also checks for deprecated APIs, unsafe lifecycle methods, and legacy context usage. StrictMode has no effect on production builds. It is essential for preparing code for concurrent features (React 18+) and future React versions.`,
      difficulty: "medium",
      tags: ["react", "strict-mode"],
      is_top50: true,
    },
    {
      question: "Explain the concept of lifting state up in React.",
      answer: `Lifting state up means moving shared state to the nearest common ancestor of components that need it. Instead of each child managing its own data, the parent holds the state and passes it down via props, along with callbacks to update it. This ensures a single source of truth, keeps data synchronized across children, and follows React's unidirectional data flow. It is the primary mechanism for component communication in React.`,
      difficulty: "medium",
      tags: ["react", "state-management", "lifting-state"],
      is_top50: true,
    },
    {
      question: "What are keys in React and why are they important?",
      answer: `Keys are special string attributes that help React identify which items in a list have changed, been added, or removed during reconciliation. They should be unique, stable (not re-generated on each render), and predictable. Using stable keys (like database IDs) preserves component state and DOM nodes across list reorders. Using index as a key is acceptable only for static, non-reordered lists. Bad keys can cause incorrect rendering, state bugs, and performance issues.`,
      difficulty: "easy",
      tags: ["react", "keys", "reconciliation"],
      is_top50: true,
    },
    {
      question: "What is the difference between Shadow DOM and Virtual DOM?",
      answer: `Shadow DOM is a browser specification for DOM and style encapsulation. It creates isolated DOM subtrees that don't leak styles. It is used by Web Components. Virtual DOM is a JavaScript-level concept used by React to optimize DOM updates by batching changes and minimizing direct DOM manipulation. Shadow DOM solves style scoping; Virtual DOM solves rendering performance. They solve different problems and can coexist.`,
      difficulty: "medium",
      tags: ["react", "virtual-dom", "shadow-dom"],
      is_top50: true,
    },
    {
      question: "How do you handle forms in React 19 vs earlier versions?",
      answer: `In React 18 and earlier, forms require controlled components with \`useState + onChange\` handlers, or uncontrolled components with refs. React 19 simplifies forms with Actions:

Example:

\`\`\`jsx
<form action={serverAction}></form>
\`\`\`

Or \`useActionState\` for client-side form handling. \`useFormStatus\` provides pending state, and \`useOptimistic\` enables optimistic UI updates. This reduces boilerplate significantly and integrates with HTML form semantics natively.`,
      difficulty: "hard",
      tags: ["react", "forms", "react-19", "actions"],
      is_top50: true,
    },
    {
      question: "What is Suspense in React?",
      answer: `Suspense is a React component that lets you declaratively specify loading states for asynchronous operations. It wraps components that may suspend (data fetching with libraries like Relay, code splitting with \`React.lazy\`). Suspense shows a fallback UI (like a spinner) until the asynchronous data is ready. React 19 extends Suspense to work with the \`use()\` hook and async server components, enabling full async rendering without \`useEffect\`.`,
      difficulty: "medium",
      tags: ["react", "suspense", "async"],
      is_top50: true,
    },
    {
      question: "Explain code splitting in React with React.lazy and Suspense.",
      answer: `Code splitting lets you split your bundle into smaller chunks loaded on demand. \`React.lazy\` takes a dynamic \`import()\` function and returns a lazy component. It must be wrapped in Suspense to handle the loading state.

Example:

\`\`\`javascript
const LazyDashboard = React.lazy(() => import('./Dashboard'));
\`\`\`

\`\`\`jsx
<Suspense fallback={<Spinner />}>
  <LazyDashboard />
</Suspense>
\`\`\`

This reduces initial bundle size and improves time-to-interactive. Combine with route-based splitting for best results.`,
      difficulty: "medium",
      tags: ["react", "code-splitting", "lazy-loading", "suspense"],
      is_top50: true,
    },
    {
      question: "What are React Portals and when would you use them?",
      answer: `React Portals let you render a child component into a different DOM node outside the parent hierarchy, while preserving React context and event bubbling.

Example:

\`\`\`javascript
createPortal(children, domNode);
\`\`\`

Common uses: modals, tooltips, dropdowns, and toast notifications. Portals are useful where \`overflow: hidden\` or \`z-index\` issues would otherwise cause problems. Portals are particularly useful for rendering overlays that need to escape parent containers.`,
      difficulty: "medium",
      tags: ["react", "portals"],
      is_top50: true,
    },
    {
      question: "What is the difference between React and ReactDOM?",
      answer: `React is the core library for creating components, elements, and hooks. ReactDOM is the renderer for web applications. It provides \`createRoot\`, \`hydrateRoot\`, and \`render\` methods that interact with the DOM. React Native replaces ReactDOM with native platform renderers. The split allows React to be platform-agnostic: the same component model works for web, mobile (React Native), desktop (Electron), and VR (React 360).`,
      difficulty: "easy",
      tags: ["react", "react-dom"],
      is_top50: true,
    },
    {
      question: "How does React's batching mechanism work?",
      answer: `React batches multiple state updates into a single re-render for performance. In React 18, automatic batching works in all contexts (event handlers, effects, timeouts, and native events). Earlier versions only batched in React event handlers.

Example:

\`\`\`javascript
setCount(c => c + 1);
setName('new');
// triggers a single render combining both updates
\`\`\`

To opt out of batching (rarely needed), use \`flushSync\`.`,
      difficulty: "medium",
      tags: ["react", "batching", "performance"],
      is_top50: true,
    },
    {
      question: "What is the useDeferredValue hook?",
      answer: `\`useDeferredValue\` allows you to defer re-rendering a non-urgent part of the UI. It returns a deferred version of the value that may lag behind the original.

Example:

\`\`\`javascript
const deferredQuery = useDeferredValue(query);
\`\`\`

The original value renders immediately, while the deferred value renders during spare time. Combined with Suspense, it helps keep the UI responsive during expensive updates (like filtering a large list while the user types).`,
      difficulty: "hard",
      tags: ["react", "hooks", "useDeferredValue", "concurrent"],
      is_top50: true,
    },
    {
      question: "What is the useTransition hook?",
      answer: `\`useTransition\` marks a state update as non-urgent (transition), allowing React to keep the current UI responsive while the update is in progress. It returns \`[isPending, startTransition]\`. Wrap non-urgent state updates in \`startTransition\` to let interruptions (like typing) take priority. This is part of React 18's concurrent features and is essential for keeping inputs responsive during complex re-renders.`,
      difficulty: "hard",
      tags: ["react", "hooks", "useTransition", "concurrent"],
      is_top50: true,
    },
    {
      question: "Explain the concept of render props in React.",
      answer: `Render props is a pattern where a component receives a function as a prop that returns JSX. The component calls this function with its internal state, allowing the parent to control rendering.

Example:

\`\`\`jsx
<Mouse render={position => <Tooltip x={position.x} y={position.y} />} />
\`\`\`

Render props enable sharing stateful logic without inheritance. Custom hooks are now the preferred alternative. They achieve the same goal without the nesting.`,
      difficulty: "medium",
      tags: ["react", "render-props", "patterns"],
      is_top50: true,
    },
    {
      question: "What is the children prop in React?",
      answer: `\`children\` is a special prop that passes content between opening and closing tags of a component. It can be any renderable content: JSX, strings, components, or functions.

Example:

\`\`\`jsx
<Card><p>Content</p></Card>
\`\`\`

The \`<p>\` becomes \`props.children\`. The \`children\` prop enables composition via containment pattern, allowing components to wrap arbitrary content. This is fundamental to React's composition model.`,
      difficulty: "easy",
      tags: ["react", "children", "composition"],
      is_top50: true,
    },
    {
      question: "How do you handle side effects in React?",
      answer: `Side effects (data fetching, subscriptions, DOM manipulation, timers) are handled using the \`useEffect\` hook. \`useEffect\` runs after render and accepts a function and dependency array. It supports cleanup via its return function. For effects that depend on values, include them in the dependency array. React 19 introduces the \`use()\` hook for simpler data fetching with Suspense, reducing the need for \`useEffect\` in data-loading scenarios.`,
      difficulty: "medium",
      tags: ["react", "side-effects", "useEffect"],
      is_top50: true,
    },
    {
      question: "What is the purpose of the useId hook?",
      answer: `\`useId\` generates unique IDs that are stable across server and client rendering, preventing hydration mismatches. It is essential for accessible components that need unique IDs for \`aria-describedby\`, \`aria-labelledby\`, or form label associations.

Example:

\`\`\`javascript
const id = useId();
\`\`\`

\`\`\`jsx
<label htmlFor={id}>Name</label>
<input id={id} />
\`\`\`

It guarantees uniqueness even if multiple instances of the same component render on the same page.`,
      difficulty: "medium",
      tags: ["react", "hooks", "useId", "accessibility"],
      is_top50: true,
    },
    {
      question: "Explain the difference between server-side rendering (SSR) and client-side rendering (CSR).",
      answer: `CSR renders the entire UI in the browser. The server sends an empty HTML shell and JavaScript builds the page. Initial load is slower (all JS must download and execute) but subsequent navigation is fast. SSR renders HTML on the server and sends a fully populated page to the client. Faster initial paint, better SEO, but slower Time to Interactive (hydration). Next.js supports both, and React Server Components blur the line by rendering on the server and streaming interactive chunks.`,
      difficulty: "medium",
      tags: ["react", "ssr", "csr", "rendering"],
      is_top50: true,
    },
    {
      question: "What is hydration in React?",
      answer: `Hydration is the process where React attaches event listeners and initializes state on server-rendered HTML, making it interactive. \`ReactDOM.hydrateRoot()\` assumes the HTML matches the server-rendered content. Mismatches (hydration errors) occur when client-side and server-side output differ. React warns and falls back to client rendering. React 19 improves hydration with error recovery and streaming hydration, allowing parts of the page to become interactive before the entire page hydrates.`,
      difficulty: "hard",
      tags: ["react", "hydration", "ssr"],
      is_top50: true,
    },
    {
      question: "How do you test React components?",
      answer: `React testing ecosystem: Jest (test runner + assertions), React Testing Library (component rendering and queries), and optionally Vitest for faster runs. Test by behavior, not implementation. Use \`getByRole\`, \`getByLabelText\`, \`findByText\` instead of testing internal state. Wrap components in needed providers (Router, Context, QueryClient). Use \`userEvent\` for realistic interactions. Test accessibility with \`jest-axe\`. For hooks, use \`renderHook\` from React Testing Library.`,
      difficulty: "medium",
      tags: ["react", "testing", "jest", "rtl"],
      is_top50: true,
    },
    {
      question: "What is the role of the ref prop in React?",
      answer: `The \`ref\` prop provides access to a DOM element or a React component instance. In React 19, \`ref\` can be passed directly as a prop (no \`forwardRef\` needed). Use cases: managing focus (\`inputRef.current.focus()\`), triggering animations, integrating with third-party DOM libraries, measuring element dimensions. Avoid overusing refs. Prefer state and props for most UI logic. Refs bridge the gap between React's declarative world and imperative DOM operations.`,
      difficulty: "medium",
      tags: ["react", "refs", "dom"],
      is_top50: true,
    },
    {
      question: "What is forwardRef in React?",
      answer: `\`forwardRef\` is a React API that lets a parent component pass a ref through to a child component's DOM node. It is needed because \`ref\` is not automatically passed like props (in React 18 and earlier). The child component wraps itself in \`React.forwardRef((props, ref) => ...)\` and attaches the ref to the desired DOM element. In React 19, \`forwardRef\` is no longer needed. Ref can be passed as a regular prop.`,
      difficulty: "medium",
      tags: ["react", "forwardRef", "refs"],
      is_top50: true,
    },
    {
      question: "Explain React Fiber architecture.",
      answer: `React Fiber is the reimplementation of React's reconciliation algorithm (introduced in React 16). It enables incremental rendering. Splitting work into units (fibers) that can be paused, resumed, or prioritized. Fiber allows: time slicing (breaking render work into chunks), prioritization (user input > animations > data fetching), error boundaries, and concurrent mode. Each fiber node represents a component instance with its state, props, and pending work.`,
      difficulty: "hard",
      tags: ["react", "fiber", "architecture"],
      is_top50: true,
    },
    {
      question: "What is the useOptimistic hook?",
      answer: `\`useOptimistic\` is a React 19 hook for optimistic UI updates. It lets you show the expected result of an async operation immediately, then reverts if the actual result differs.

Example:

\`\`\`javascript
const [optimisticMessage, addOptimistic] = useOptimistic(
  messages,
  (state, newMessage) => [...state, { ...newMessage, pending: true }]
);
\`\`\`

When the user sends a message, show it immediately with a 'pending' indicator. If the server fails, revert to the real messages. This creates a snappy user experience.`,
      difficulty: "hard",
      tags: ["react", "react-19", "useOptimistic", "optimistic-ui"],
      is_top50: true,
    },
    {
      question: "What is the useFormStatus hook?",
      answer: `\`useFormStatus\` is a React 19 hook that provides the pending state of a parent \`<form>\` action. It returns \`{ pending, data, method, action }\`. Use it in child components (like submit buttons) to show loading states without prop drilling.

Example:

\`\`\`javascript
const { pending } = useFormStatus();
\`\`\`

\`\`\`jsx
<button disabled={pending}>
  {pending ? 'Saving...' : 'Submit'}
</button>
\`\`\`

It works with both server actions and client-side form actions.`,
      difficulty: "hard",
      tags: ["react", "react-19", "useFormStatus", "forms"],
      is_top50: true,
    },
  ],
  "backend-engineer": [
    {
      question: "What is an API and how does it work?",
      answer: "An API (Application Programming Interface) defines how software components communicate. REST APIs use HTTP methods (GET, POST, PUT, DELETE) to perform CRUD operations on resources. Clients send requests with headers and body; servers return responses with status codes and data (usually JSON).",
      difficulty: "easy",
      tags: ["api-design"],
      is_top50: true,
    },
    {
      question: "Explain the difference between SQL and NoSQL databases.",
      answer: "SQL databases (PostgreSQL, MySQL) use structured schemas, tables with relationships, and ACID transactions. NoSQL databases (MongoDB, Firebase) offer flexible schemas, horizontal scaling, and eventual consistency. SQL is better for complex queries and data integrity; NoSQL for rapid iteration and large-scale distributed systems.",
      difficulty: "easy",
      tags: ["databases"],
      is_top50: true,
    },
    {
      question: "What is indexing in databases and why is it important?",
      answer: "An index is a data structure (B-tree, hash) that speeds up data retrieval by providing fast lookup paths. Without indexes, queries perform full table scans (O(n)). Indexes make SELECT queries fast but slow down INSERT/UPDATE/DELETE. Common types: primary key index, unique index, composite index, full-text index.",
      difficulty: "medium",
      tags: ["databases"],
      is_top50: true,
    },
    {
      question: "Explain the concept of normalization in databases.",
      answer: "Normalization organizes relational databases to reduce data redundancy and improve integrity. Normal forms: 1NF (atomic columns), 2NF (no partial dependencies), 3NF (no transitive dependencies). Higher normal forms exist but are less common. Trade-off: normalization reduces redundancy but may require more JOINs.",
      difficulty: "medium",
      tags: ["databases"],
      is_top50: true,
    },
    {
      question: "What is JWT and how does authentication work with it?",
      answer: "JWT (JSON Web Token) is a compact, self-contained token format for securely transmitting information. It consists of a header, payload (claims), and signature. For authentication: user logs in → server returns a JWT → client stores it (localStorage/httpOnly cookie) → sends it in Authorization header → server verifies signature.",
      difficulty: "medium",
      tags: ["authentication", "security"],
      is_top50: true,
    },
    {
      question: "Explain the difference between authentication and authorization.",
      answer: "Authentication verifies identity ('who you are') — usually via credentials (password, OAuth, biometrics). Authorization determines access ('what you can do') — checks permissions/roles after authentication. First you authenticate, then you authorize. Example: logging in (authN) vs accessing admin panel (authZ).",
      difficulty: "easy",
      tags: ["security"],
      is_top50: true,
    },
    {
      question: "What are ACID properties in databases?",
      answer: "ACID stands for Atomicity (transactions are all-or-nothing), Consistency (transactions maintain database validity), Isolation (concurrent transactions don't interfere), Durability (committed data persists even after crashes). These properties ensure reliable transaction processing, critical for financial and mission-critical systems.",
      difficulty: "medium",
      tags: ["databases"],
      is_top50: true,
    },
    {
      question: "What is the difference between horizontal and vertical scaling?",
      answer: "Vertical scaling adds more resources (CPU, RAM, disk) to a single machine — simpler but has hardware limits and creates a single point of failure. Horizontal scaling adds more machines to a pool — more complex (load balancers, distributed data) but virtually unlimited and provides fault tolerance. Modern systems favor horizontal scaling.",
      difficulty: "medium",
      tags: ["system-design"],
      is_top50: true,
    },
    {
      question: "What are the main features of Spring Boot?",
      answer: "Spring Boot simplifies Spring development with auto-configuration (automatically configures beans based on dependencies), embedded servers (Tomcat/Jetty built-in), starter dependencies (spring-boot-starter-web, starter-data-jpa), production-ready features (Actuator, metrics, health checks), and convention over configuration.",
      difficulty: "medium",
      tags: ["spring", "java"],
      is_top50: true,
    },
    {
      question: "Explain REST and its key principles.",
      answer: "REST (Representational State Transfer) is a stateless architecture where the server exposes resources using standard HTTP methods (GET, POST, PUT, DELETE). Each request contains all necessary information. Resources are identified by URIs and represented using JSON or XML. This makes systems scalable and easy to maintain.",
      difficulty: "easy",
      tags: ["api-design"],
      is_top50: true,
    },
    {
      question: "What is Dependency Injection (DI) in Spring?",
      answer: "Dependency Injection in Spring means the framework creates and manages objects instead of the developer manually instantiating them. Spring uses @Autowired, @Component, @Service, @Repository to discover and inject dependencies. Constructor injection is recommended for immutability, easier testing, and explicit dependency requirements.",
      difficulty: "medium",
      tags: ["spring", "design-patterns"],
      is_top50: true,
    },
    {
      question: "What is the difference between @Component, @Service, and @Repository in Spring?",
      answer: "@Component is the generic stereotype for Spring-managed beans. @Service is used specifically for the business logic layer and improves readability. @Repository is used for the data access layer and provides automatic exception translation — Spring converts low-level DB exceptions into DataAccessException.",
      difficulty: "medium",
      tags: ["spring"],
      is_top50: true,
    },
    {
      question: "What happens during Spring Boot application startup?",
      answer: "Spring Boot loads auto-configurations from spring.factories, performs component scanning to identify beans, creates and wires bean instances in the DI container, starts the embedded Tomcat/Jetty server (for web apps), and finally creates the ApplicationContext. The application is then ready to serve requests.",
      difficulty: "medium",
      tags: ["spring"],
      is_top50: true,
    },
    {
      question: "What is the difference between GET, POST, PUT, PATCH, and DELETE in REST APIs?",
      answer: "GET retrieves data, POST creates a resource, PUT fully replaces an existing resource, PATCH partially updates a resource, and DELETE removes a resource. GET, PUT, and DELETE are idempotent — calling them multiple times gives the same result. POST is not idempotent — multiple calls create multiple resources.",
      difficulty: "easy",
      tags: ["api-design", "rest"],
      is_top50: true,
    },
    {
      question: "What is CORS and why do we need it?",
      answer: "CORS (Cross-Origin Resource Sharing) is a browser security mechanism that blocks requests from a different origin (domain, port, protocol) unless the server explicitly allows it. It protects users from malicious cross-origin requests. Enable it on the backend using headers like Access-Control-Allow-Origin.",
      difficulty: "medium",
      tags: ["security", "api-design"],
      is_top50: true,
    },
    {
      question: "What is the difference between JPA and Hibernate?",
      answer: "JPA (Java Persistence API) is a specification for object-relational mapping — it defines standard interfaces and annotations (@Entity, @Id). Hibernate is the most popular implementation of that specification. JPA provides the rules and contracts; Hibernate provides the working engine that performs the actual ORM operations.",
      difficulty: "medium",
      tags: ["java", "databases"],
      is_top50: true,
    },
    {
      question: "What is a Bean in Spring Framework?",
      answer: "A bean is an object that Spring creates, configures, and manages in its IoC (Inversion of Control) container. Beans are discovered through annotations like @Component, @Service, @Repository, or defined explicitly in @Configuration classes. Spring manages their lifecycle and dependency injection automatically.",
      difficulty: "easy",
      tags: ["spring"],
      is_top50: true,
    },
    {
      question: "What is AOP (Aspect-Oriented Programming) in Spring?",
      answer: "AOP separates cross-cutting concerns (logging, security, transactions, caching) from business logic. Using @Aspect with @Before, @After, or @Around annotations, we can apply logic before or after method execution without touching the main business code. This keeps code clean and modular.",
      difficulty: "hard",
      tags: ["spring"],
      is_top50: true,
    },
    {
      question: "What is the Life Cycle of a Spring Bean?",
      answer: "Spring creates the bean, injects dependencies, calls lifecycle callbacks (@PostConstruct, InitializingBean.afterPropertiesSet()), and the bean becomes ready. When the container shuts down, @PreDestroy is triggered. BeanPostProcessors can modify beans before and after initialization at each step.",
      difficulty: "medium",
      tags: ["spring"],
      is_top50: true,
    },
    {
      question: "What is @RestController vs @Controller in Spring MVC?",
      answer: "@Controller is used for MVC applications that return views (HTML templates). @RestController is used for REST APIs and returns JSON directly — it combines @Controller + @ResponseBody so the return value is written directly to the HTTP response body.",
      difficulty: "medium",
      tags: ["spring"],
      is_top50: true,
    },
    {
      question: "What is Autowiring in Spring, and what are its types?",
      answer: "Autowiring is Spring's way of automatically injecting dependencies into beans. Types: no (default), byName, byType, constructor, and @Autowired annotation. Constructor-based injection is recommended for immutability, easier testing, and explicit dependency requirements.",
      difficulty: "medium",
      tags: ["spring"],
      is_top50: true,
    },
    {
      question: "What is Dependency Injection (DI) and why is it important?",
      answer: "Dependency Injection is a design pattern where the framework provides objects that a class depends on, rather than letting the class create them itself. Benefits include loose coupling, easier testing (mocking dependencies), cleaner maintainable code, and better separation of concerns.",
      difficulty: "medium",
      tags: ["design-patterns", "spring"],
      is_top50: true,
    },
    {
      question: "What is Middleware in Node.js / Express?",
      answer: "Middleware functions execute during the request-response cycle. They can modify requests, perform authentication, logging, error handling, or parse bodies before the final response is sent. Express supports application-level, router-level, error-handling, and built-in middleware (express.json()).",
      difficulty: "medium",
      tags: ["nodejs", "api-design"],
      is_top50: true,
    },
    {
      question: "What is a DispatcherServlet in Spring MVC?",
      answer: "DispatcherServlet is the front controller in Spring MVC that receives all incoming HTTP requests. It routes requests to the appropriate controller, manages the entire request-response flow, and returns the appropriate view or JSON response. It is the heart of Spring MVC architecture.",
      difficulty: "medium",
      tags: ["spring"],
      is_top50: true,
    },
    {
      question: "What is the difference between PUT and PATCH in REST API?",
      answer: "PUT replaces the entire resource with the data sent in the request body — it's a full update. PATCH updates only the fields that are sent in the request body — it's a partial update. PUT is idempotent; PATCH is not guaranteed to be idempotent.",
      difficulty: "easy",
      tags: ["api-design", "rest"],
      is_top50: true,
    },
  ],
  "fullstack-engineer": [
    {
      question: "How does a full-stack application handle CORS?",
      answer: "CORS (Cross-Origin Resource Sharing) is a browser security mechanism that restricts requests from different origins. The server must include specific headers: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`. Browsers send a preflight OPTIONS request for non-simple requests. Solutions: server-side CORS config, reverse proxy, or same-origin deployment.",
      difficulty: "medium",
      tags: ["security", "api-design"],
      is_top50: true,
    },
    {
      question: "What is the role of a reverse proxy in web applications?",
      answer: "A reverse proxy (Nginx, Caddy, HAProxy) sits in front of application servers handling: load balancing (distribute traffic), SSL termination, caching, compression, rate limiting, and serving static files. It improves security by hiding backend servers and provides a single entry point for clients.",
      difficulty: "medium",
      tags: ["devops", "networking"],
      is_top50: true,
    },
    {
      question: "Explain the concept of state management in frontend applications.",
      answer: "State management handles the data that changes over time in a UI. Options: local state (React useState, component-level), global state (Redux, Zustand, Context API), server state (React Query, SWR), URL state (query params), and persisted state (localStorage). Choose based on scope and sharing needs.",
      difficulty: "medium",
      tags: ["react", "architecture"],
      is_top50: true,
    },
    {
      question: "What is the difference between monolithic and microservices architecture?",
      answer: "Monolithic architecture is a single codebase deployed as one unit — simpler to develop and test initially but hard to scale and maintain as it grows. Microservices split functionality into independent services — each with its own database, deployable separately, independently scalable, but introduces distributed system complexity (network latency, data consistency, service discovery).",
      difficulty: "hard",
      tags: ["architecture", "system-design"],
      is_top50: true,
    },
    {
      question: "How do you optimize a web application for performance?",
      answer: "Frontend: lazy loading, code splitting, image optimization, bundling/minification, CDN, caching headers. Backend: database query optimization, connection pooling, caching (Redis), compression, async processing. Full-stack: SSR/SSG, edge functions, performance monitoring (Lighthouse, Web Vitals), reduce waterfall requests.",
      difficulty: "hard",
      tags: ["performance", "optimization"],
      is_top50: true,
    },
    {
      question: "What is a WebSocket and when would you use it?",
      answer: "WebSocket provides full-duplex, persistent communication between client and server over a single TCP connection. Unlike HTTP (request-response), the server can push data to clients at any time. Use cases: real-time chat, live notifications, collaborative editing, gaming, financial tickers. Upgrade from HTTP via the `Upgrade` header.",
      difficulty: "medium",
      tags: ["networking", "real-time"],
      is_top50: true,
    },
    {
      question: "Explain the concept of server-side rendering (SSR) vs client-side rendering (CSR).",
      answer: "CSR loads a minimal HTML shell that renders in the browser via JavaScript — fast initial load but slow time-to-interactive (TTI) and poor SEO. SSR generates HTML on the server per request — better SEO, faster first paint, but higher server load. Next.js offers both: SSR, SSG (static generation), and ISR (incremental static regeneration).",
      difficulty: "medium",
      tags: ["react", "architecture"],
      is_top50: true,
    },
    {
      question: "What are the key considerations when designing a RESTful API?",
      answer: "Consider: resource naming (plural nouns, /users not /getUsers), HTTP methods (GET for read, POST for create, PUT/PATCH for update, DELETE for remove), consistent error responses (status codes + error body), versioning (/v1/users), pagination (offset/limit or cursor-based), authentication (JWT/API keys), rate limiting, and documentation (OpenAPI/Swagger).",
      difficulty: "medium",
      tags: ["api-design"],
      is_top50: true,
    },
  ],
  "devops-engineer": [
    {
      question: "What is CI/CD and why is it important?",
      answer: "CI/CD stands for Continuous Integration/Continuous Deployment. CI automatically builds and tests code on every push to catch bugs early. CD automatically deploys code to production after passing tests. Benefits: faster release cycles, reduced manual errors, consistent processes, rapid feedback, and reliable deployments.",
      difficulty: "easy",
      tags: ["ci-cd"],
      is_top50: true,
    },
    {
      question: "Explain the difference between Docker and virtual machines.",
      answer: "Docker containers share the host OS kernel (lightweight), start in seconds, and have minimal overhead. VMs include a full guest OS per instance (heavyweight), start in minutes, and provide stronger isolation. Containers are better for microservices and scaling; VMs are better when running different OS kernels or requiring stronger security boundaries.",
      difficulty: "medium",
      tags: ["docker", "virtualization"],
      is_top50: true,
    },
    {
      question: "What is Kubernetes and what problem does it solve?",
      answer: "Kubernetes (K8s) is a container orchestration platform that automates deployment, scaling, and management of containerized applications. It solves: service discovery, load balancing, automatic scaling, rolling updates, self-healing (restarting failed containers), storage orchestration, and configuration management. It abstracts away the underlying infrastructure.",
      difficulty: "hard",
      tags: ["kubernetes", "orchestration"],
      is_top50: true,
    },
    {
      question: "What is Infrastructure as Code (IaC)?",
      answer: "IaC manages infrastructure (servers, networks, databases) through code and configuration files rather than manual processes. Tools: Terraform (multi-cloud), AWS CloudFormation, Pulumi, Ansible. Benefits: version control, reproducibility, automation, self-documentation, consistency across environments (dev/staging/prod), and reduced human error.",
      difficulty: "medium",
      tags: ["iac", "automation"],
      is_top50: true,
    },
    {
      question: "Explain the concept of blue-green deployment.",
      answer: "Blue-green deployment maintains two identical environments. Blue is live (production); green has the new version. Once green is ready and tested, the router switches traffic from blue to green. This enables zero-downtime deployments, instant rollback (switch back to blue), and easy validation before full rollout.",
      difficulty: "medium",
      tags: ["deployment", "strategies"],
      is_top50: true,
    },
    {
      question: "What is monitoring and observability in DevOps?",
      answer: "Monitoring collects metrics (CPU, memory, latency, error rates) and alerts on anomalies. Observability goes deeper — understanding system state from outputs (logs, metrics, traces). The three pillars: logs (detailed events), metrics (aggregated numbers), and traces (request flow across services). Tools: Prometheus, Grafana, Datadog, OpenTelemetry.",
      difficulty: "medium",
      tags: ["monitoring", "observability"],
      is_top50: true,
    },
    {
      question: "What is a load balancer and how does it work?",
      answer: "A load balancer distributes incoming traffic across multiple backend servers. Algorithms: round-robin, least connections, IP hash, weighted distribution. It handles health checks (removing unhealthy servers), SSL termination, and can provide session persistence. Types: Layer 4 (transport-level, faster) and Layer 7 (application-level, content-aware).",
      difficulty: "easy",
      tags: ["networking"],
      is_top50: true,
    },
    {
      question: "Explain the concept of 'shift-left' in DevOps.",
      answer: "Shift-left moves testing, security, and quality checks earlier in the development lifecycle (left on the timeline). Instead of finding bugs in production, catch them during development. Practices: unit tests, static code analysis, security scanning in CI, linting, code review. Benefits: cheaper to fix early, faster feedback, higher quality releases.",
      difficulty: "medium",
      tags: ["testing", "best-practices"],
      is_top50: true,
    },
  ],
  "qa-engineer": [
    {
      question: "What is the difference between manual and automated testing?",
      answer: "Manual testing relies on human testers to execute test cases — good for exploratory, usability, and ad-hoc testing. Automated testing uses scripts/tools (Selenium, Cypress, Playwright) to run tests — faster, repeatable, and scalable. Best approach: automate regression, smoke, and data-driven tests; keep manual for UX and exploratory testing.",
      difficulty: "easy",
      tags: ["testing-basics"],
      is_top50: true,
    },
    {
      question: "Explain the difference between unit, integration, and end-to-end testing.",
      answer: "Unit testing tests individual functions/components in isolation. Integration testing verifies that different modules work together (API + database). End-to-end (E2E) testing simulates real user flows across the entire system. The testing pyramid suggests: many unit tests, fewer integration tests, fewest E2E tests.",
      difficulty: "easy",
      tags: ["testing-types"],
      is_top50: true,
    },
    {
      question: "What is the testing pyramid?",
      answer: "The testing pyramid (by Mike Cohn) recommends: Base — many fast unit tests (isolated functions). Middle — fewer integration tests (module interactions). Top — few slow E2E tests (full user flows). This ensures fast feedback from unit tests while E2E tests catch system-level issues. Modern variants include the trophy or honeycomb shapes.",
      difficulty: "easy",
      tags: ["testing-strategy"],
      is_top50: true,
    },
    {
      question: "What is TDD (Test-Driven Development)?",
      answer: "TDD follows a red-green-refactor cycle: 1) Write a failing test (red). 2) Write minimal code to pass it (green). 3) Refactor while keeping tests green. Benefits: ensures test coverage, drives better design, provides documentation, and gives confidence for refactoring. Critics note it can slow initial development.",
      difficulty: "medium",
      tags: ["testing-methodology"],
      is_top50: true,
    },
    {
      question: "What is the difference between black-box and white-box testing?",
      answer: "Black-box testing focuses on inputs and outputs without knowledge of internal code structure — tests functionality from user perspective. White-box testing uses knowledge of internal code to design tests — covers specific paths, branches, and conditions. Gray-box testing combines both approaches.",
      difficulty: "medium",
      tags: ["testing-methodology"],
      is_top50: true,
    },
    {
      question: "What are mocking and stubbing in testing?",
      answer: "Mocking replaces real objects with simulated ones to test behavior (verify interactions). Stubbing provides predefined responses to method calls (controls inputs). Both isolate the unit under test from dependencies (databases, APIs, file systems). Libraries: Jest, Sinon, Mockito. Essential for reliable unit testing.",
      difficulty: "medium",
      tags: ["testing-tools"],
      is_top50: true,
    },
    {
      question: "What is regression testing and why is it important?",
      answer: "Regression testing verifies that new code changes don't break existing functionality. It's critical after bug fixes, feature additions, or refactoring. Automated regression suites provide rapid feedback. Risk-based regression prioritizes critical paths. Without it, software quality degrades over time.",
      difficulty: "easy",
      tags: ["testing-types"],
      is_top50: true,
    },
    {
      question: "What is the Page Object Model (POM) in test automation?",
      answer: "POM is a design pattern where each web page is represented by a class. The class encapsulates page elements (locators) and interactions (methods). Tests use page objects instead of directly manipulating DOM. Benefits: reduces code duplication, centralizes element changes, improves maintainability of test suites.",
      difficulty: "medium",
      tags: ["automation", "design-patterns"],
      is_top50: true,
    },
  ],
};
