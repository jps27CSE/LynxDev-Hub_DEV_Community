import type { CourseData } from "./types";
import { codeBlock, externalLink, BOX_STYLE } from "./format";

export const htmlCourse: CourseData = {
  title: "Learn HTML — Build Websites From Scratch",
  description:
    "Master the markup language behind every website. From your first tag to full pages — 9 hands-on lessons plus 5 real projects, all with live preview.",
  icon: "",
  difficulty: "Beginner",
  category: "Frontend",
  order_index: 1,
  chapters: [
    {
      title: "1. Your First Web Page",
      content: {
        type: "browser",
        instructions: `
<h2>Welcome to HTML</h2>
<p><strong>HTML</strong> (HyperText Markup Language) is the skeleton of every website. It describes the <em>structure</em> of a page — headings, paragraphs, images, links — using <strong>tags</strong>. Browsers read HTML and render it visually. That's exactly what the preview panel does on the right.</p>

<h3>Anatomy of a tag</h3>
<p>Most tags come in pairs: an opening tag and a closing tag. Content lives between them.</p>
${codeBlock(`<p>This is a paragraph</p>`)}
<ul>
  <li><code>&lt;p&gt;</code> — opening tag</li>
  <li><code>&lt;/p&gt;</code> — closing tag (note the forward slash)</li>
  <li>Some tags are self-closing, like <code>&lt;img&gt;</code> and <code>&lt;br&gt;</code></li>
</ul>

<h3>Every page needs this structure</h3>
${codeBlock(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>This is my first webpage.</p>
  </body>
</html>`)}
<ul>
  <li><code>&lt;!DOCTYPE html&gt;</code> — tells the browser this is HTML5</li>
  <li><code>&lt;html&gt;</code> — the root element that wraps everything</li>
  <li><code>&lt;head&gt;</code> — invisible settings: title, character set, links to CSS</li>
  <li><code>&lt;body&gt;</code> — everything the user <strong>sees</strong></li>
</ul>

<h3>Comments</h3>
<p>Comments are notes for humans. Browsers ignore them:</p>
${codeBlock(`<!-- This text will never appear on the page -->`)}

<h3>Learn more</h3>
<p>${externalLink("MDN — HTML getting started", "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Getting_started")} · ${externalLink("HTML Reference (visual)", "https://htmlreference.io/")}</p>

<h3>Your task</h3>
<p>In the editor you'll find a partial page. Your job: add a <code>&lt;h2&gt;</code> with your name, a paragraph about what you want to learn, and an <code>&lt;img&gt;</code> element that loads this image: <code>https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg</code>. Watch the preview update as you type — that's instant feedback, the same way freeCodeCamp teaches.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <!-- Add an h2 with your name below -->

    <!-- Add a paragraph about what you want to learn -->

    <!-- Add an img with src and alt below -->

  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <h2>I'm Alex</h2>
    <p>I want to learn HTML, CSS and JavaScript to build websites.</p>
    <img
      src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg"
      alt="A relaxing cat"
      width="300"
    />
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "2. Text & Headings",
      content: {
        type: "browser",
        instructions: `
<h2>Structuring text like a document</h2>
<p>Web content is mostly text, and HTML gives you tools to structure it. <strong>Headings</strong> create hierarchy (think of an outline), and <strong>paragraphs</strong> carry the body text.</p>

<h3>Headings: h1 to h6</h3>
${codeBlock(`<h1>Main page title</h1>
<h2>Section title</h2>
<h3>Sub-section</h3>
<h4>Smaller still</h4>`)}
<ul>
  <li>Use <strong>one</strong> <code>&lt;h1&gt;</code> per page — it's the main title</li>
  <li>Don't skip levels (h1 → h3 looks broken and hurts accessibility)</li>
  <li>Headings are for <em>structure</em>, not for making text big</li>
</ul>

<h3>Emphasis the right way</h3>
${codeBlock(`<strong>This is important (bold)</strong>
<em>This is emphasized (italic)</em>`)}
<ul>
  <li><code>&lt;strong&gt;</code> — importance; <code>&lt;em&gt;</code> — emphasis</li>
  <li>Never use <code>&lt;b&gt;</code>/<code>&lt;i&gt;</code> alone — they carry no meaning</li>
</ul>

<h3>Line breaks &amp; thematic breaks</h3>
${codeBlock(`<p>First line<br />second line</p>`)}
<p><code>&lt;br /&gt;</code> breaks a line inside a paragraph. <code>&lt;hr /&gt;</code> draws a horizontal rule to separate topics. Use them sparingly — browsers naturally wrap text.</p>

<h3>Preformatted text</h3>
<p>Want to show code or ASCII art exactly as typed? Use <code>&lt;pre&gt;</code> — it preserves spaces and line breaks.</p>
${codeBlock(`<pre>
  Line one
    indented line two
</pre>`)}

<h3>Learn more</h3>
<p>${externalLink("MDN — HTML text fundamentals", "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/HTML_text_fundamentals")} · ${externalLink("MDN — advanced text formatting", "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Advanced_text_formatting")}</p>

<h3>Your task</h3>
<p>Build a mini "book chapter" page: an <code>&lt;h1&gt;</code> title, <strong>two</strong> <code>&lt;h2&gt;</code> sections, each with a short paragraph. In the second paragraph, wrap one word in <code>&lt;strong&gt;</code>. Add an <code>&lt;hr /&gt;</code> between the sections.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Chapter</title>
  </head>
  <body>
    <h1>Chapter 1: The Beginning</h1>

    <!-- Add: a second <h2> section with a short paragraph,
         an <hr /> between the sections,
         and one <strong> word inside the paragraph -->
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Chapter</title>
  </head>
  <body>
    <h1>Chapter 1: The Beginning</h1>

    <h2>Where it all started</h2>
    <p>Every journey starts with a <strong>single</strong> step.</p>

    <hr />

    <h2>What comes next</h2>
    <p>We keep going, step by step — and that step is CSS.</p>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "3. Links & Images",
      content: {
        type: "browser",
        instructions: `
<h2>The web without links is a wall</h2>
<p>Links (<code>&lt;a&gt;</code>) are what make the web a <em>web</em>. Images (<code>&lt;img&gt;</code>) make it visual. These two elements power navigation and rich content.</p>

<h3>Links with &lt;a&gt;</h3>
${codeBlock(`<a href="https://freecodecamp.org">Visit freeCodeCamp</a>`)}
<ul>
  <li><code>href</code> — the destination (a URL or page path)</li>
  <li>Absolute URL for other sites; relative path for your own pages</li>
  <li><code>target="_blank"</code> opens a new tab — add <code>rel="noopener"</code> for safety</li>
  <li>The link text should describe the destination ("click here" is bad UX)</li>
</ul>
${codeBlock(`<a href="/about.html" target="_blank" rel="noopener">About me</a>`)}

<h3>Images with &lt;img&gt;</h3>
${codeBlock(`<img
  src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg"
  alt="Orange cat relaxing on a wooden bench"
  width="300"
/>`)}
<ul>
  <li><code>src</code> — where the image lives (URL or local file)</li>
  <li><code>alt</code> — <strong>always include it</strong>: shown if the image fails, read by screen readers, used by SEO</li>
  <li><code>width</code>/<code>height</code> — reserve space so the page doesn't jump</li>
  <li>Never hotlink images you don't have permission to use</li>
</ul>

<h3>Wrapping images in links</h3>
${codeBlock(`<a href="https://example.com">
  <img src="logo.png" alt="Example.com logo" />
</a>`)}
<p>An image inside an <code>&lt;a&gt;</code> becomes a clickable image. The <code>alt</code> text now doubles as the link's accessible name.</p>

<h3>Captions with figure</h3>
${codeBlock(`<figure>
  <img src="photo.jpg" alt="Sunset over the ocean" width="400" />
  <figcaption>Golden hour at the beach</figcaption>
</figure>`)}
<p><code>&lt;figure&gt;</code> groups media with its <code>&lt;figcaption&gt;</code> caption — semantically meaningful and easy to style later.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — creating hyperlinks", "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Creating_hyperlinks")} · ${externalLink("MDN — images in HTML", "https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Images_in_HTML")}</p>

<h3>Your task</h3>
<p>The starter has a photo gallery with one figure. Add <strong>two more</strong> figures using these images: <code>https://cdn.freecodecamp.org/curriculum/cat-photo-app/cats.jpg</code> and <code>https://cdn.freecodecamp.org/curriculum/cat-photo-app/cats-2.jpg</code>. Give every image a descriptive <code>alt</code>, and turn the page title into a link to <code>https://freecodecamp.org</code>.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Cat Gallery</title>
  </head>
  <body>
    <h1>Cat Gallery</h1>

    <figure>
      <img
        src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg"
        alt="A relaxed cat on a wooden bench"
        width="300"
      />
      <figcaption>Relaxing cat</figcaption>
    </figure>

    <!-- Add two more figures with cats.jpg and cats-2.jpg -->

  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Cat Gallery</title>
  </head>
  <body>
    <h1><a href="https://freecodecamp.org">Cat Gallery</a></h1>

    <figure>
      <img
        src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg"
        alt="A relaxed cat on a wooden bench"
        width="300"
      />
      <figcaption>Relaxing cat</figcaption>
    </figure>

    <figure>
      <img
        src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/cats.jpg"
        alt="Three cats sitting in a row"
        width="300"
      />
      <figcaption>Three cats, one plan</figcaption>
    </figure>

    <figure>
      <img
        src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/cats-2.jpg"
        alt="A kitten looking into the distance"
        width="300"
      />
      <figcaption>A thoughtful kitten</figcaption>
    </figure>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "4. Lists — Ordered, Unordered & Nested",
      content: {
        type: "browser",
        instructions: `
<h2>Lists organise everything</h2>
<p>Recipes, navigation menus, specs, steps — lists are everywhere. HTML has three kinds, and you can nest them to any depth.</p>

<h3>Unordered list — bullet points</h3>
${codeBlock(`<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>`)}
<p><code>&lt;ul&gt;</code> = order doesn't matter. Each item is an <code>&lt;li&gt;</code>.</p>

<h3>Ordered list — numbered steps</h3>
${codeBlock(`<ol>
  <li>Open the editor</li>
  <li>Write HTML</li>
  <li>See the preview</li>
</ol>`)}
<p><code>&lt;ol&gt;</code> = order matters. The browser numbers it for you — even if you reorder items, numbers stay correct.</p>

<h3>Nesting lists</h3>
${codeBlock(`<ul>
  <li>Frontend
    <ul>
      <li>HTML</li>
      <li>CSS</li>
      <li>JavaScript</li>
    </ul>
  </li>
  <li>Backend</li>
</ul>`)}
<p>Put a list <em>inside</em> an <code>&lt;li&gt;</code> to create a sub-list. Notice the indentation — it makes the structure readable.</p>

<h3>Description lists — term + definition</h3>
${codeBlock(`<dl>
  <dt>HTML</dt>
  <dd>The markup language that structures web content.</dd>
  <dt>CSS</dt>
  <dd>Styles that control appearance and layout.</dd>
</dl>`)}
<p><code>&lt;dt&gt;</code> is the term, <code>&lt;dd&gt;</code> its definition. Perfect for glossaries and FAQs.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — ul element", "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul")} · ${externalLink("MDN — ol element", "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol")} · ${externalLink("HTML Reference — list elements", "https://htmlreference.io/tag/#lists")}</p>

<h3>Your task</h3>
<p>Build a "Roadmap to Frontend" page: an ordered <code>&lt;ol&gt;</code> of three <strong>learning phases</strong>. Inside the first phase, nest an <code>&lt;ul&gt;</code> listing HTML, CSS and JavaScript. Below, add a <code>&lt;dl&gt;</code> defining "Frontend" and "Backend" in your own words.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Roadmap</title>
  </head>
  <body>
    <h1>Roadmap to Frontend</h1>

    <h2>Three phases</h2>
    <ol>
      <li>Learn the fundamentals</li>
      <li>Build projects</li>
      <li>Apply for jobs</li>
    </ol>

    <h2>Glossary</h2>
    <!-- Add a <dl> defining "Frontend" and "Backend" -->
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Roadmap</title>
  </head>
  <body>
    <h1>Roadmap to Frontend</h1>

    <h2>Three phases</h2>
    <ol>
      <li>Learn the fundamentals
        <ul>
          <li>HTML</li>
          <li>CSS</li>
          <li>JavaScript</li>
        </ul>
      </li>
      <li>Build projects</li>
      <li>Apply for jobs</li>
    </ol>

    <h2>Glossary</h2>
    <dl>
      <dt>Frontend</dt>
      <dd>Everything the user sees and interacts with in the browser.</dd>
      <dt>Backend</dt>
      <dd>Servers, databases and APIs that power the frontend.</dd>
    </dl>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "5. Semantic HTML — Structure With Meaning",
      content: {
        type: "browser",
        instructions: `
<h2>Div soup is a swamp</h2>
<p>A page made of nothing but <code>&lt;div&gt;</code> is technically valid but semantically empty — screen readers, search engines and other developers can't tell what anything is. <strong>Semantic elements</strong> describe their own meaning.</p>

<h3>The modern page layout</h3>
<figure style="margin:12px 0;">
  <img
    src="https://developer.mozilla.org/shared-assets/images/diagrams/learn/structuring-documents/site-structure.svg"
    alt="Diagram of a typical website structure: header on top, navigation, main content with a side bar, and footer"
    width="440"
    style="max-width:100%;border-radius:8px;"
  />
  <figcaption style="font-size:12px;opacity:.8;">Typical website structure — credit: MDN Web Docs</figcaption>
</figure>
${codeBlock(`<header>   <!-- logo, site title, top bar -->
  <nav>     <!-- main navigation links -->
    <a href="/">Home</a>
    <a href="/blog">Blog</a>
  </nav>
</header>

<main>      <!-- the unique core content -->
  <section>
    <h2>Section with its own heading</h2>
    <article>  <!-- a self-contained piece: post, card -->
      <h3>Article title</h3>
      <p>Content...</p>
    </article>
  </section>

  <aside>     <!-- sidebar: related info, ads, links -->
    <p>Related links</p>
  </aside>
</main>

<footer>    <!-- copyright, contact, sitemap -->
  <p>&copy; 2026 LynxDEV</p>
</footer>`)}

<h3>When to use what</h3>
<ul>
  <li><code>&lt;header&gt;</code> — intro block; often the top band, but can open any section</li>
  <li><code>&lt;nav&gt;</code> — major navigation blocks</li>
  <li><code>&lt;main&gt;</code> — one per page, the unique core content</li>
  <li><code>&lt;section&gt;</code> — a themed group with its own heading</li>
  <li><code>&lt;article&gt;</code> — self-contained content (blog post, comment, card)</li>
  <li><code>&lt;aside&gt;</code> — content loosely related to the main flow</li>
  <li><code>&lt;footer&gt;</code> — closing info for the page or a section</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("MDN — document and website structure", "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Document_and_website_structure")} · ${externalLink("MDN — HTML elements reference", "https://developer.mozilla.org/en-US/docs/Web/HTML/Element")}</p>

<h3>Your task</h3>
<p>Reorganize the starter page: the text is currently stuffed into <code>&lt;div&gt;</code>s. Move the site title into a <code>&lt;header&gt;</code>, the two news <code>&lt;div&gt;</code>s become <code>&lt;article&gt;</code>s inside a <code>&lt;main&gt;</code>, the "About this site" block becomes an <code>&lt;aside&gt;</code>, and the copyright becomes a <code>&lt;footer&gt;</code>. Wrap the article list in a <code>&lt;section&gt;</code>.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>TechDaily</title>
  </head>
  <body>
    <div class="site-header">
      <h1>TechDaily</h1>
    </div>

    <div class="news">
      <div class="post">
        <h2>HTML 6 is here</h2>
        <p>The web's markup language gets new form controls.</p>
      </div>
      <div class="post">
        <h2>CSS gets native masonry</h2>
        <p>Pinterest-style layouts without JavaScript.</p>
      </div>
    </div>

    <div class="sidebar">
      <h3>About this site</h3>
      <p>Daily news for web developers.</p>
    </div>

    <div class="site-footer">
      <p>&copy; 2026 TechDaily</p>
    </div>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>TechDaily</title>
  </head>
  <body>
    <header>
      <h1>TechDaily</h1>
    </header>

    <main>
      <section class="news">
        <article class="post">
          <h2>HTML 6 is here</h2>
          <p>The web's markup language gets new form controls.</p>
        </article>
        <article class="post">
          <h2>CSS gets native masonry</h2>
          <p>Pinterest-style layouts without JavaScript.</p>
        </article>
      </section>

      <aside>
        <h3>About this site</h3>
        <p>Daily news for web developers.</p>
      </aside>
    </main>

    <footer>
      <p>&copy; 2026 TechDaily</p>
    </footer>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "6. Tables — Data in Rows & Columns",
      content: {
        type: "browser",
        instructions: `
<h2>When to reach for a table</h2>
<p>Tables are for <strong>tabular data</strong> — comparisons, schedules, invoices, stats. Not for page layout (that was a 90s mistake). The markup is a grid of rows (<code>&lt;tr&gt;</code>) and cells (<code>&lt;td&gt;</code>).</p>

<h3>Table basics</h3>
${codeBlock(`<table border="1">
  <tr>
    <th>Language</th>
    <th>Purpose</th>
  </tr>
  <tr>
    <td>HTML</td>
    <td>Structure</td>
  </tr>
  <tr>
    <td>CSS</td>
    <td>Style</td>
  </tr>
</table>`)}
<ul>
  <li><code>&lt;th&gt;</code> = header cell (bold, centered by default)</li>
  <li><code>&lt;td&gt;</code> = data cell</li>
  <li>Rows are defined horizontally: one <code>&lt;tr&gt;</code> per line of the grid</li>
</ul>

<h3>Semantic table sections</h3>
${codeBlock(`<table border="1">
  <caption>Top scores this week</caption>
  <thead>
    <tr><th>Player</th><th>Score</th></tr>
  </thead>
  <tbody>
    <tr><td>Alex</td><td>1280</td></tr>
    <tr><td>Sam</td><td>1155</td></tr>
  </tbody>
  <tfoot>
    <tr><td>Average</td><td>1217</td></tr>
  </tfoot>
</table>`)}
<ul>
  <li><code>&lt;caption&gt;</code> — a title for the table (great for accessibility)</li>
  <li><code>&lt;thead&gt;</code> / <code>&lt;tbody&gt;</code> / <code>&lt;tfoot&gt;</code> — header, body, footer blocks so browsers (and CSS) can treat them separately</li>
</ul>

<h3>Spanning cells</h3>
${codeBlock(`<tr>
  <td colspan="2">This cell stretches across 2 columns</td>
</tr>
<tr>
  <td rowspan="2">This one spans 2 rows</td>
  <td>Cell A</td>
</tr>
<tr>
  <td>Cell B</td>
</tr>`)}
<p><code>colspan</code> merges across columns; <code>rowspan</code> down rows. Use them to build group headers and merged summary cells.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — table basics", "https://developer.mozilla.org/en-US/docs/Learn/HTML/Tables/Basics")} · ${externalLink("MDN — table advanced features", "https://developer.mozilla.org/en-US/docs/Learn/HTML/Tables/Advanced")}</p>

<h3>Your task</h3>
<p>Complete the league table: add a <code>&lt;caption&gt;</code> ("League Standings"), wrap existing rows in <code>&lt;thead&gt;</code> and <code>&lt;tbody&gt;</code>, and add a third team row (your choice of name and points). Then add a footer row where the first cell spans 2 columns with <code>colspan="2"</code> and says "Season ends in March".</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>League Table</title>
  </head>
  <body>
    <h1>Football League</h1>

    <table border="1">
      <!-- Add a caption: League Standings -->
      <tr>
        <th>Team</th>
        <th>Points</th>
      </tr>
      <tr>
        <td>Red Dragons</td>
        <td>34</td>
      </tr>
      <tr>
        <td>Blue Eagles</td>
        <td>31</td>
      </tr>
      <!-- Add a third team -->
      <!-- Add a footer row with colspan="2" -->
    </table>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>League Table</title>
  </head>
  <body>
    <h1>Football League</h1>

    <table border="1">
      <caption>League Standings</caption>
      <thead>
        <tr>
          <th>Team</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Red Dragons</td>
          <td>34</td>
        </tr>
        <tr>
          <td>Blue Eagles</td>
          <td>31</td>
        </tr>
        <tr>
          <td>Golden Wolves</td>
          <td>28</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2">Season ends in March</td>
        </tr>
      </tfoot>
    </table>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "7. Forms — Collecting User Input",
      content: {
        type: "browser",
        instructions: `
<h2>Forms are the gateway to interaction</h2>
<p>Sign-ups, searches, checkouts — every time you type into a website, a form is involved. A form's job: gather structured input and send it somewhere (often an API, later in this course you'll wire one up with JavaScript).</p>

<h3>The anatomy of a form</h3>
${codeBlock(`<form action="/api/signup" method="post">
  <label for="name">Name</label>
  <input id="name" name="name" type="text" required />

  <label for="email">Email</label>
  <input id="email" name="email" type="email" placeholder="you@example.com" required />

  <button type="submit">Create account</button>
</form>`)}
<ul>
  <li><code>&lt;label for="..."&gt;</code> must match an input's <code>id</code> — clicking the label focuses the input; screen readers announce the pair</li>
  <li><code>name</code> — the key sent to the server ("name=Alex")</li>
  <li><code>type</code> — email, password, number, radio... each gets native validation and the right mobile keyboard</li>
  <li><code>required</code> — browser blocks empty submissions</li>
  <li><code>placeholder</code> — hint text (never a replacement for <code>&lt;label&gt;</code>)</li>
</ul>

<h3>Other input types</h3>
${codeBlock(`<input type="email" />      <!-- email address -->
<input type="password" />   <!-- masked characters -->
<input type="number" />     <!-- numeric, with spinner -->
<input type="date" />       <!-- calendar picker -->
<input type="checkbox" />   <!-- on/off toggle -->
<input type="radio" />      <!-- pick one of a group -->
<input type="range" />      <!-- slider -->
<input type="file" />       <!-- file picker -->
<textarea rows="4"></textarea>  <!-- multi-line text -->
<select>
  <option value="html">HTML</option>
  <option value="css">CSS</option>
</select>`)}
<p>Radio buttons join a group by sharing the same <code>name</code>. A <code>&lt;select&gt;</code> dropdown is a menu of <code>&lt;option&gt;</code>s.</p>

<h3>Great UX habits</h3>
<ul>
  <li>Every input gets a label — no exceptions</li>
  <li>Group related fields with <code>&lt;fieldset&gt;</code> + <code>&lt;legend&gt;</code></li>
  <li>Use the right <code>type</code> — you get validation and keyboard for free</li>
  <li>Validate on the server too; browser validation is just the first line</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("MDN — your first form", "https://developer.mozilla.org/en-US/docs/Learn/Forms/Your_first_form")} · ${externalLink("MDN — input element reference", "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input")} · ${externalLink("HTML Reference — form elements", "https://htmlreference.io/tag/#forms")}</p>

<h3>Your task</h3>
<p>Build a sign-up form: name (text), email (email type), password (password type, minimum 8 chars via <code>minlength</code>), a <code>&lt;select&gt;</code> for skill level (Beginner / Intermediate / Advanced), a checkbox to accept terms, and a submit button. Every input needs a matching label.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Sign Up</title>
  </head>
  <body>
    <h1>Create your account</h1>

    <form action="/api/signup" method="post">
      <!-- Name input with label -->

      <!-- Email input with label -->

      <!-- Password input with label (minlength="8") -->

      <!-- Select with label: skill level -->
      <label for="level">Skill level</label>
      <select id="level" name="level">
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      <!-- Checkbox with label: accept terms -->

      <button type="submit">Sign up</button>
    </form>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Sign Up</title>
  </head>
  <body>
    <h1>Create your account</h1>

    <form action="/api/signup" method="post">
      <label for="name">Name</label>
      <br />
      <input id="name" name="name" type="text" required />
      <br /><br />

      <label for="email">Email</label>
      <br />
      <input
        id="email"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
      />
      <br /><br />

      <label for="password">Password</label>
      <br />
      <input
        id="password"
        name="password"
        type="password"
        minlength="8"
        required
      />
      <br /><br />

      <label for="level">Skill level</label>
      <br />
      <select id="level" name="level">
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <br /><br />

      <input id="terms" name="terms" type="checkbox" required />
      <label for="terms">I accept the terms and conditions</label>
      <br /><br />

      <button type="submit">Sign up</button>
    </form>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "8. Media, Entities & Embedded Content",
      content: {
        type: "browser",
        instructions: `
<h2>Audio, video and everything else</h2>
<p>Modern pages embed videos, audio players and whole external documents. HTML gives you native elements for all of it — no flashy plugins needed.</p>

<h3>Video &amp; audio</h3>
${codeBlock(`<video controls width="400" poster="poster.jpg">
  <source src="movie.mp4" type="video/mp4" />
  <p>Your browser doesn't support video.
     <a href="movie.mp4">Download it instead</a>.</p>
</video>

<audio controls>
  <source src="podcast.mp3" type="audio/mpeg" />
  <p>Your browser doesn't support audio.</p>
</audio>`)}
<ul>
  <li><code>controls</code> — show play/pause UI; without it, the media is silent and invisible to users</li>
  <li>Provide fallback text inside the element — shown when the format is unsupported</li>
  <li><code>&lt;source&gt;</code> lets you offer multiple formats so browsers pick one they know</li>
</ul>

<h3>Embedding: iframe</h3>
${codeBlock(`<iframe
  src="https://www.openstreetmap.org/export/embed.html?bbox=-0.0040,51.4768,0.0055,51.4825"
  width="500"
  height="300"
  title="Map of London"
></iframe>`)}
<p><code>&lt;iframe&gt;</code> embeds another document — maps, YouTube videos, widgets. Always give it a <code>title</code> for accessibility and use <code>loading="lazy"</code> when it's below the fold.</p>

<h3>Special characters: entities</h3>
<p>Some characters are <em>reserved</em> by HTML (<code>&lt;</code>, <code>&gt;</code>, <code>&amp;</code>). To display them, write <strong>entities</strong> — they always start with <code>&amp;</code> and end with <code>;</code>:</p>
${codeBlock(`&lt;   →  <      (less than)
&gt;   →  >      (greater than)
&amp;  →  &      (ampersand)
&nbsp; →  non-breaking space
&copy; →  ©      (copyright)
&hearts; →  ♥     (heart)`)}
<p>And if you write code in a <code>&lt;pre&gt;</code> or <code>&lt;code&gt;</code> block, escape every <code>&lt;</code> and <code>&gt;</code> — that's exactly what's happening in the examples on this page.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — video and audio content", "https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Video_and_audio_content")} · ${externalLink("MDN — iframe element", "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe")} · ${externalLink("MDN — entity reference", "https://developer.mozilla.org/en-US/docs/Glossary/Entity")}</p>

<h3>Your task</h3>
<p>In the starter, embed: (1) a video using <code>https://mdn.github.io/learning-area/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4</code> with controls and fallback text; (2) an audio player with the same rabbit MP3 source pattern using <code>.../audio/viper.mp3</code>; (3) a paragraph that shows the literal text "5 &lt; 6 &amp;&amp; 7 &gt; 5" using entities.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Media Lab</title>
  </head>
  <body>
    <h1>Media Lab</h1>

    <!-- Video: rabbit320.mp4 with controls -->

    <!-- Audio: viper.mp3 with controls -->

    <!-- Paragraph showing: 5 < 6 && 7 > 5 using entities -->
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Media Lab</title>
  </head>
  <body>
    <h1>Media Lab</h1>

    <video controls width="400">
      <source
        src="https://mdn.github.io/learning-area/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4"
        type="video/mp4"
      />
      <p>Your browser doesn't support video.</p>
    </video>

    <audio controls>
      <source
        src="https://mdn.github.io/learning-area/html/multimedia-and-embedding/video-and-audio-content/viper.mp3"
        type="audio/mpeg"
      />
      <p>Your browser doesn't support audio.</p>
    </audio>

    <p>Truth check: 5 &lt; 6 &amp;&amp; 7 &gt; 5</p>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "9. Accessibility — HTML for Everyone",
      content: {
        type: "browser",
        instructions: `
<h2>The web should work for all humans</h2>
<p>Millions of people use screen readers, keyboard-only navigation and voice control. Accessibility (a11y) isn't a feature — it's the baseline. Most of it is <strong>writing correct, semantic HTML</strong>.</p>

<h3>The four pillars</h3>
<h3>1. Text alternatives</h3>
${codeBlock(`<img src="chart.png" alt="Bar chart: sales up 20% in Q2" />`)}
<p><code>alt</code> describes <em>meaning</em>, not appearance. Decorative images get <code>alt=""</code> so screen readers skip them entirely.</p>

<h3>2. Language</h3>
${codeBlock(`<html lang="en">`)}
<p>Tell the browser the page language — it drives pronunciation engines and translation tools.</p>

<h3>3. Keyboard operability</h3>
<ul>
  <li>Never trap the keyboard: interactive elements must be reachable via <kbd>Tab</kbd> and activated with <kbd>Enter</kbd>/<kbd>Space</kbd></li>
  <li>Respect natural focus order — arrange HTML in reading order, not visual order</li>
  <li><code>tabindex="0"</code> makes a non-focusable element focusable; <code>tabindex="-1"</code> removes it from the tab sequence</li>
</ul>

<h3>4. Descriptive names</h3>
${codeBlock(`<a href="/reset">Click here</a>   <!-- bad: "click here" -->
<a href="/reset">Reset my password</a>  <!-- good -->

<button aria-label="Close dialog">X</button>`)}
<p>Link text should work on its own. <code>aria-label</code> overrides the visible name for assistive tech when the visual label is an icon or cryptic.</p>

<h3>Bonus: skip links &amp; landmarks</h3>
${codeBlock(`<a class="skip-link" href="#main-content">Skip to main content</a>
<main id="main-content">...</main>`)}
<p>A skip link lets keyboard users jump straight past the nav. Semantic landmarks (<code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;footer&gt;</code>) give screen readers a built-in page map.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — accessibility learn area", "https://developer.mozilla.org/en-US/docs/Learn/Accessibility")} · ${externalLink("W3C — accessibility fundamentals", "https://www.w3.org/WAI/fundamentals/accessibility-intro/")} · ${externalLink("MDN — HTML forms and accessibility", "https://developer.mozilla.org/en-US/docs/Learn/Forms/Accessible_forms")}</p>

<h3>Your task</h3>
<p>Fix the starter page's accessibility sins: give the image a meaningful <code>alt</code>, set the page <code>lang</code>, reword the two vague links ("click here", "read more"), give the icon-only button an <code>aria-label</code>, and add a skip link pointing to the <code>&lt;main&gt;</code> element.</p>
`,
        initialCode: `<!DOCTYPE html>
<html> <!-- missing lang -->
  <head>
    <meta charset="UTF-8" />
    <title>Fix Me</title>
  </head>
  <body>
    <nav>
      <a href="/news">News Home</a>
    </nav>

    <main id="main-content">
      <h1>Latest story</h1>
      <img src="photo.jpg" /> <!-- missing alt -->
      <p>
        <a href="/news/article-1">Click here</a> to see the full story.
      </p>
      <button>X</button> <!-- icon-only button -->
    </main>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Fix Me</title>
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to main content</a>

    <nav>
      <a href="/news">News Home</a>
    </nav>

    <main id="main-content">
      <h1>Latest story</h1>
      <img src="photo.jpg" alt="LynxDEV campus at sunset" />
      <p>
        <a href="/news/article-1">Read the full story about our campus</a>.
      </p>
      <button aria-label="Close dialog">X</button>
    </main>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "10. Project — Personal Profile Page",
      content: {
        type: "browser",
        instructions: `
<h2>Project 1 of 5: your developer profile</h2>
<p>Time to combine everything: semantic structure, headings, images, links and lists. You're building a profile page the way freeCodeCamp's curriculum teaches — write the code, see it render live, refine.</p>

<h3>Requirements (user stories)</h3>
<ul>
  <li>A <code>&lt;header&gt;</code> with your name as the <code>&lt;h1&gt;</code> and a short tagline</li>
  <li>A profile photo (<code>&lt;figure&gt;</code> + <code>&lt;figcaption&gt;</code>), with descriptive <code>alt</code> — use: <code>https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg</code></li>
  <li>An "About me" <code>&lt;section&gt;</code> with at least two paragraphs</li>
  <li>A "Skills" <code>&lt;section&gt;</code> with an <code>&lt;ul&gt;</code> of 3+ skills</li>
  <li>A "Connect" <code>&lt;section&gt;</code> with links to GitHub and LinkedIn (use <code>https://github.com</code> / <code>https://linkedin.com</code>)</li>
  <li>A <code>&lt;footer&gt;</code> with a copyright symbol written as an entity</li>
</ul>

<h3>Stretch goals (optional)</h3>
<ul>
  <li>Add <code>lang</code>, a proper <code>&lt;title&gt;</code>, a skip link</li>
  <li>Wrap the sections in <code>&lt;main&gt;</code></li>
</ul>

<div style="${BOX_STYLE}"><strong>Tip:</strong> build in this order — header → about → skills → connect → footer. Check the preview after each block so errors surface immediately.</div>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Profile</title>
  </head>
  <body>
    <header>
      <h1>Alex Developer</h1>
      <p>Aspiring frontend developer.</p>
    </header>

    <main>
      <section id="about">
        <h2>About me</h2>
        <p>Two short paragraphs about yourself, your goals and your journey.</p>
      </section>

      <section id="skills">
        <h2>Skills</h2>
        <!-- unordered list of 3+ skills -->
      </section>

      <section id="connect">
        <h2>Connect</h2>
        <!-- links to GitHub and LinkedIn -->
      </section>
    </main>

    <footer>
      <!-- copyright with &copy; entity -->
    </footer>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Profile</title>
  </head>
  <body>
    <a class="skip-link" href="#about">Skip to main content</a>

    <header>
      <h1>Alex Developer</h1>
      <p>Aspiring frontend developer.</p>
      <figure>
        <img
          src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg"
          alt="My profile photo: a relaxed cat on a wooden bench"
          width="200"
        />
        <figcaption>That's me, focused and calm.</figcaption>
      </figure>
    </header>

    <main>
      <section id="about">
        <h2>About me</h2>
        <p>
          I'm a self-taught developer who fell in love with the web because
          code produces visible results instantly. I started with HTML and I'm
          working my way through CSS, JavaScript and beyond.
        </p>
        <p>
          My goal is to build clean, accessible interfaces that make people's
          daily lives a little easier. This profile page is step one of
          many.
        </p>
      </section>

      <section id="skills">
        <h2>Skills</h2>
        <ul>
          <li>Semantic HTML</li>
          <li>Responsive design basics</li>
          <li>Version control with Git</li>
          <li>Problem solving</li>
        </ul>
      </section>

      <section id="connect">
        <h2>Connect</h2>
        <ul>
          <li><a href="https://github.com">GitHub</a></li>
          <li><a href="https://linkedin.com">LinkedIn</a></li>
        </ul>
      </section>
    </main>

    <footer>
      <p>&copy; 2026 Alex Developer</p>
    </footer>
  </body>
</html>`,
      },
      points_reward: 25,
    },
    {
      title: "11. Project — Blog Article Layout",
      content: {
        type: "browser",
        instructions: `
<h2>Project 2 of 5: publish a blog article</h2>
<p>Blogs are the classic HTML exercise — rich text content with structure. This project builds the article version first; the multi-page site project will add navigation around it.</p>

<h3>Requirements (user stories)</h3>
<ul>
  <li><code>&lt;header&gt;</code>: blog name (h1) + <code>&lt;nav&gt;</code> with three links (Home, Articles, About)</li>
  <li><code>&lt;article&gt;</code> inside <code>&lt;main&gt;</code> with:
    <ul>
      <li>Title (<code>&lt;h2&gt;</code>) and a byline paragraph — author + date</li>
      <li>Three <code>&lt;h3&gt;</code> sections, each with at least one paragraph</li>
      <li>One ordered list (steps) and one unordered list (recommendations)</li>
      <li>One image with <code>alt</code>: <code>https://cdn.freecodecamp.org/curriculum/cat-photo-app/cats.jpg</code></li>
      <li>One <code>&lt;blockquote&gt;</code> quote</li>
    </ul>
  </li>
  <li><code>&lt;aside&gt;</code> with "Related articles" (3 links)</li>
  <li><code>&lt;footer&gt;</code> with copyright</li>
</ul>

<div style="${BOX_STYLE}"><strong>Suggested topic:</strong> "How I learned HTML in a week" — write it from your own perspective. Real stories make better practice than lorem ipsum.</div>

<h3>Stretch goals</h3>
<ul>
  <li>Add a <code>&lt;time&gt;</code> element around the date</li>
  <li>Wrap each section's content in semantic tags (<code>&lt;p&gt;</code>, <code>&lt;strong&gt;</code>, <code>&lt;em&gt;</code>)</li>
</ul>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Blog</title>
  </head>
  <body>
    <header>
      <h1>Code Letters</h1>
      <nav>
        <a href="#home">Home</a>
        <a href="#articles">Articles</a>
        <a href="#about">About</a>
      </nav>
    </header>

    <main>
      <article>
        <h2>How I learned HTML in a week</h2>
        <p>By Alex · March 2026</p>

        <h3>The first hour</h3>
        <p>Write your first section here.</p>

        <h3>The practice loop</h3>
        <!-- ordered list of 3 steps -->

        <h3>What I'd recommend</h3>
        <!-- unordered list of 3 tips -->

        <!-- image with alt -->

        <blockquote>"Quote about learning here."</blockquote>
      </article>

      <aside>
        <h3>Related articles</h3>
        <!-- 3 links -->
      </aside>
    </main>

    <footer>
      <p>&copy; 2026 Code Letters</p>
    </footer>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Blog</title>
  </head>
  <body>
    <header>
      <h1>Code Letters</h1>
      <nav>
        <a href="#home">Home</a>
        <a href="#articles">Articles</a>
        <a href="#about">About</a>
      </nav>
    </header>

    <main>
      <article>
        <h2>How I learned HTML in a week</h2>
        <p>By Alex · <time datetime="2026-03-02">March 2026</time></p>

        <h3>The first hour</h3>
        <p>
          I opened an editor, copied a five-line document and hit refresh.
          Seeing a heading render on screen from my own hands hooked me
          instantly. That instant feedback loop — write, refresh, see — became
          my whole learning strategy.
        </p>

        <h3>The practice loop</h3>
        <ol>
          <li>Read one concept from MDN</li>
          <li>Build a tiny page using only that concept</li>
          <li>Combine it with everything learned before it</li>
        </ol>

        <h3>What I'd recommend</h3>
        <ul>
          <li>Type every example by hand — never copy-paste</li>
          <li>Break pages on purpose to see how browsers recover</li>
          <li>Inspect other sites' HTML with DevTools</li>
        </ul>

        <figure>
          <img
            src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/cats.jpg"
            alt="Three cats sitting together, my coding partners"
            width="320"
          />
          <figcaption>My coding partners.</figcaption>
        </figure>

        <blockquote>
          "Don't worry about understanding everything. Build things — the
          understanding catches up."
        </blockquote>
      </article>

      <aside>
        <h3>Related articles</h3>
        <ul>
          <li><a href="#a1">Why semantic HTML matters</a></li>
          <li><a href="#a2">My top 5 browser DevTools tricks</a></li>
          <li><a href="#a3">From HTML to CSS: week two</a></li>
        </ul>
      </aside>
    </main>

    <footer>
      <p>&copy; 2026 Code Letters</p>
    </footer>
  </body>
</html>`,
      },
      points_reward: 25,
    },
    {
      title: "12. Project — Registration Form",
      content: {
        type: "browser",
        instructions: `
<h2>Project 3 of 5: a real sign-up form</h2>
<p>freeCodeCamp's classic first form project, rebuilt with your own requirements. This is where the forms chapter meets accessibility — every field needs a label, the right type, and sensible grouping.</p>

<h3>Requirements (user stories)</h3>
<ul>
  <li>A <code>&lt;form&gt;</code> with <code>action="/api/register"</code> and <code>method="post"</code></li>
  <li>Personal info <code>&lt;fieldset&gt;</code> (legend: "Personal info"):
    <ul>
      <li>First name (text, required)</li>
      <li>Last name (text, required)</li>
      <li>Email (email, required, placeholder)</li>
      <li>Birthday (date)</li>
    </ul>
  </li>
  <li>Preferences <code>&lt;fieldset&gt;</code> (legend: "Preferences"):
    <ul>
      <li>Favorite stack: radio group with three options (Frontend / Backend / Fullstack) sharing one <code>name</code></li>
      <li>Interests: three checkboxes (Web design / JavaScript / DevOps)</li>
      <li>Experience level: <code>&lt;select&gt;</code> with 3 options</li>
      <li>Bio: <code>&lt;textarea&gt;</code> with rows and a maxlength</li>
    </ul>
  </li>
  <li>A <code>&lt;button type="submit"&gt;</code></li>
</ul>

<div style="${BOX_STYLE}"><strong>Check yourself:</strong> click each label in the preview — the matching input should gain focus. That's the <code>for</code>/<code>id</code> pair working.</div>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Register</title>
  </head>
  <body>
    <h1>Join the community</h1>

    <form action="/api/register" method="post">
      <fieldset>
        <legend>Personal info</legend>
        <!-- 4 labeled inputs here -->
      </fieldset>

      <fieldset>
        <legend>Preferences</legend>
        <!-- radio group, checkboxes, select, textarea -->
      </fieldset>

      <button type="submit">Create my account</button>
    </form>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Register</title>
  </head>
  <body>
    <h1>Join the community</h1>

    <form action="/api/register" method="post">
      <fieldset>
        <legend>Personal info</legend>

        <label for="first-name">First name</label>
        <input id="first-name" name="first-name" type="text" required />
        <br /><br />

        <label for="last-name">Last name</label>
        <input id="last-name" name="last-name" type="text" required />
        <br /><br />

        <label for="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
        <br /><br />

        <label for="birthday">Birthday</label>
        <input id="birthday" name="birthday" type="date" />
      </fieldset>

      <fieldset>
        <legend>Preferences</legend>

        <p>Favorite stack:</p>
        <input id="stack-frontend" name="stack" type="radio" value="frontend" />
        <label for="stack-frontend">Frontend</label>
        <input id="stack-backend" name="stack" type="radio" value="backend" />
        <label for="stack-backend">Backend</label>
        <input
          id="stack-fullstack"
          name="stack"
          type="radio"
          value="fullstack"
        />
        <label for="stack-fullstack">Fullstack</label>
        <br /><br />

        <p>Interests:</p>
        <input id="interest-design" name="interest" type="checkbox" value="design" />
        <label for="interest-design">Web design</label>
        <input
          id="interest-js"
          name="interest"
          type="checkbox"
          value="javascript"
        />
        <label for="interest-js">JavaScript</label>
        <input id="interest-devops" name="interest" type="checkbox" value="devops" />
        <label for="interest-devops">DevOps</label>
        <br /><br />

        <label for="level">Experience level</label>
        <select id="level" name="level">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <br /><br />

        <label for="bio">Bio</label>
        <textarea id="bio" name="bio" rows="4" maxlength="200"></textarea>
      </fieldset>

      <button type="submit">Create my account</button>
    </form>
  </body>
</html>`,
      },
      points_reward: 25,
    },
    {
      title: "13. Project — Multi-page Website",
      content: {
        type: "browser",
        instructions: `
<h2>Project 4 of 5: a site with real navigation</h2>
<p>Websites have more than one page. This project builds a single-document mini site — the preview only shows one document, so navigation uses <strong>ID anchor links</strong> (<code>href="#section"</code>) to jump between sections inside the page, exactly like a single-page app shell. True multi-page linking works the same way in a real project — relative paths like <code>href="about.html"</code>.</p>

<h3>Requirements (user stories)</h3>
<ul>
  <li><code>&lt;header&gt;</code> with site name + <code>&lt;nav&gt;</code>: four links — Home, <code>projects.html</code>, <code>about.html</code>, <code>contact.html</code> (all <code>href</code>s present, those pages can 404 in preview)</li>
  <li>A <code>&lt;main&gt;</code> with three anchored sections, each with an <code>id</code>:
    <ul>
      <li><code>#home</code> — hero: h2, paragraph, photo</li>
      <li><code>#projects</code> — an <code>&lt;article&gt;</code> card with image, an h3 title, and a link "View project"</li>
      <li><code>#about</code> — a short bio with a <code>&lt;dl&gt;</code> (name, location, stack)</li>
    </ul>
  </li>
  <li>In-page nav: a "Jump to" list with <code>&lt;a href="#projects"&gt;</code> style anchor links</li>
  <li><code>&lt;footer&gt;</code> with a back-to-top link (<code>href="#home"</code>)</li>
</ul>

<h3>Stretch goals</h3>
<ul>
  <li>Accessibility extras: skip link, <code>lang</code>, <code>aria-label</code> on nav</li>
  <li>Use <code>&lt;time&gt;</code> on a project card date</li>
</ul>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>DevPort</title>
  </head>
  <body>
    <header>
      <h1>DevPort</h1>
      <nav>
        <a href="#home">Home</a>
        <a href="projects.html">Projects</a>
        <a href="about.html">About</a>
        <a href="contact.html">Contact</a>
      </nav>
    </header>

    <main>
      <section id="home">
        <h2>Welcome to my corner of the web</h2>
        <p>Hero paragraph about what you do.</p>
      </section>

      <section id="projects">
        <h2>Latest project</h2>
        <article>
          <!-- image, title, description, "View project" link -->
        </article>
      </section>

      <section id="about">
        <h2>About</h2>
        <!-- dl: name, location, stack -->
      </section>
    </main>

    <footer>
      <a href="#home">Back to top</a>
      <p>&copy; 2026 DevPort</p>
    </footer>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>DevPort</title>
  </head>
  <body>
    <a class="skip-link" href="#projects">Skip to projects</a>

    <header>
      <h1>DevPort</h1>
      <nav aria-label="Main navigation">
        <a href="#home">Home</a>
        <a href="projects.html">Projects</a>
        <a href="about.html">About</a>
        <a href="contact.html">Contact</a>
      </nav>
    </header>

    <main>
      <section id="home">
        <h2>Welcome to my corner of the web</h2>
        <p>
          I build small, useful things for the web and document everything I
          learn. Browse the anchor links below to explore this single-page
          site the way a search engine would.
        </p>
        <ul>
          <li><a href="#projects">Jump to latest project</a></li>
          <li><a href="#about">Jump to about me</a></li>
        </ul>
      </section>

      <section id="projects">
        <h2>Latest project</h2>
        <article>
          <figure>
            <img
              src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/cats-2.jpg"
              alt="Screenshot of my project: a kitten-looking dashboard"
              width="280"
            />
          </figure>
          <h3>CatWeather — a purrcast app</h3>
          <p>
            A weather dashboard concept built with pure HTML: semantic
            sections, a table of forecasts and an embedded map.
          </p>
          <time datetime="2026-02-14">February 2026</time>
          <br />
          <a href="#projects">View project &#8599;</a>
        </article>
      </section>

      <section id="about">
        <h2>About</h2>
        <dl>
          <dt>Name</dt>
          <dd>Alex Developer</dd>
          <dt>Location</dt>
          <dd>Somewhere online</dd>
          <dt>Stack</dt>
          <dd>HTML, CSS, JavaScript (soon React)</dd>
        </dl>
      </section>
    </main>

    <footer>
      <a href="#home">Back to top</a>
      <p>&copy; 2026 DevPort</p>
    </footer>
  </body>
</html>`,
      },
      points_reward: 25,
    },
    {
      title: "14. Final Project — Portfolio Homepage",
      content: {
        type: "browser",
        instructions: `
<h2>Capstone: your portfolio homepage</h2>
<p>Everything you've learned so far ships in one page: semantic structure, text hierarchy, images, links, lists, forms and accessibility. This is the page that could one day become your real portfolio.</p>

<h3>Requirements (user stories)</h3>
<ul>
  <li><code>&lt;header&gt;</code>: name (<code>&lt;h1&gt;</code>) + navigation with 4 anchors (<code>#about</code>, <code>#projects</code>, <code>#skills</code>, <code>#contact</code>)</li>
  <li><code>&lt;section id="about"&gt;</code>: profile image in a <code>&lt;figure&gt;</code>, one intro paragraph, a <code>&lt;blockquote&gt;</code> personal motto</li>
  <li><code>&lt;section id="projects"&gt;</code>: three project <code>&lt;article&gt;</code> cards, each with image + title + description + "View project" link</li>
  <li><code>&lt;section id="skills"&gt;</code>: skills as a nested list (category → items)</li>
  <li><code>&lt;section id="contact"&gt;</code>: a contact form (name, email, message) with labels and required fields</li>
  <li><code>&lt;footer&gt;</code>: copyright + link to profile page from project 10</li>
</ul>

<div style="${BOX_STYLE}"><strong>This is the boss level:</strong> plan the tree before writing markup. Sketch the sections, decide what goes in each, then write top-to-bottom. Great developers design before they code.</div>

<h3>Ideas for project cards</h3>
<ul>
  <li><em>This profile page you built in project 10</em></li>
  <li><em>The blog article from project 11</em></li>
  <li><em>Your next idea — HTML only, no CSS yet</em></li>
</ul>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Alex — Portfolio</title>
  </head>
  <body>
    <header>
      <h1>Alex Developer</h1>
      <p>Frontend learner, one tag at a time.</p>
      <nav>
        <a href="#about">About</a>
        <a href="#projects">Projects</a>
        <a href="#skills">Skills</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>

    <main>
      <section id="about">
        <!-- figure with photo + about text + motto quote -->
      </section>

      <section id="projects">
        <h2>Projects</h2>
        <!-- three article cards -->
      </section>

      <section id="skills">
        <h2>Skills</h2>
        <!-- nested list: category -> items -->
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <!-- form: name, email, message -->
      </section>
    </main>

    <footer>
      <!-- copyright + link to the profile page project -->
    </footer>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Alex — Portfolio</title>
  </head>
  <body>
    <header>
      <h1>Alex Developer</h1>
      <p>Frontend learner, one tag at a time.</p>
      <nav aria-label="Page sections">
        <a href="#about">About</a>
        <a href="#projects">Projects</a>
        <a href="#skills">Skills</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>

    <main>
      <section id="about">
        <h2>About me</h2>
        <figure>
          <img
            src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg"
            alt="Portrait photo of a calm cat wearing a tiny scarf"
            width="220"
          />
          <figcaption>My developer persona.</figcaption>
        </figure>
        <p>
          I'm Alex — a developer in training on LynxDEV. I started with the
          question "what happens when I type this?" and haven't stopped asking
          since. This page is built with semantic HTML only; the styling comes
          next.
        </p>
        <blockquote>"Build first, understand fully, repeat."</blockquote>
      </section>

      <section id="projects">
        <h2>Projects</h2>

        <article>
          <h3>Personal Profile Page</h3>
          <p>
            My first project: a profile page with figure, lists and external
            links — where it all began.
          </p>
          <a href="#projects">View project &#8599;</a>
        </article>

        <article>
          <h3>Blog Article Layout</h3>
          <p>
            A full article page with headings, ordered/unordered lists,
            blockquote, aside sidebar and time element.
          </p>
          <a href="#projects">View project &#8599;</a>
        </article>

        <article>
          <h3>Registration Form</h3>
          <p>
            Accessible sign-up form: fieldset groups, radio/checkbox inputs,
            select, textarea and labels on every field.
          </p>
          <a href="#projects">View project &#8599;</a>
        </article>
      </section>

      <section id="skills">
        <h2>Skills</h2>
        <ul>
          <li>
            Markup
            <ul>
              <li>Semantic HTML</li>
              <li>Forms &amp; validation</li>
              <li>Accessible structure</li>
            </ul>
          </li>
          <li>
            Mindset
            <ul>
              <li>Incremental building</li>
              <li>Reading docs</li>
              <li>Debugging by previewing</li>
            </ul>
          </li>
        </ul>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <form action="/api/contact" method="post">
          <label for="contact-name">Name</label>
          <br />
          <input id="contact-name" name="name" type="text" required />
          <br /><br />

          <label for="contact-email">Email</label>
          <br />
          <input id="contact-email" name="email" type="email" required />
          <br /><br />

          <label for="message">Message</label>
          <br />
          <textarea id="message" name="message" rows="5" required></textarea>
          <br /><br />

          <button type="submit">Send message</button>
        </form>
      </section>
    </main>

    <footer>
      <p>&copy; 2026 Alex Developer · <a href="/courses">Back to courses</a></p>
    </footer>
  </body>
</html>`,
      },
      points_reward: 25,
    },
  ],
};
