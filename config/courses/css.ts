import type { CourseData } from "./types";
import { codeBlock, externalLink, BOX_STYLE } from "./format";

export const cssCourse: CourseData = {
  title: "CSS Essentials — Style the Web",
  description:
    "From your first property to full layouts — 9 hands-on lessons plus 5 real projects (profile cards, nav bars, pricing cards, hero sections) with live preview.",
  icon: "",
  difficulty: "Beginner",
  category: "Frontend",
  order_index: 2,
  chapters: [
    {
      title: "1. Your First Styles",
      content: {
        type: "browser",
        instructions: `
<h2>CSS — the styling language</h2>
<p><strong>HTML</strong> gives a page structure; <strong>CSS</strong> (Cascading Style Sheets) makes it look like something. Colors, fonts, spacing, layout — all CSS. A page without CSS is a plain text document; a page with it is a <em>website</em>.</p>

<h3>Anatomy of a rule</h3>
<p>A CSS <strong>rule</strong> has two parts: a <strong>selector</strong> (which elements to style) and a <strong>declaration block</strong> (what to do to them).</p>
${codeBlock(`p {
  color: red;
  font-size: 18px;
}`)}
<ul>
  <li><code>p</code> — the selector: every <code>&lt;p&gt;</code> on the page</li>
  <li><code>color: red;</code> — a declaration: property <code>color</code>, value <code>red</code></li>
  <li>End every declaration with a <strong>semicolon</strong> — that's the #1 beginner typo</li>
  <li>One rule can hold many declarations</li>
</ul>

<h3>Where does CSS live?</h3>
<ul>
  <li><strong>External stylesheet</strong> — a <code>.css</code> file linked via <code>&lt;link&gt;</code> (industry standard, one file styles the whole site)</li>
  <li><strong>&lt;style&gt; in the head</strong> — what we use in this course: convenient while learning</li>
  <li><strong>Inline <code>style=""</code></strong> — on a single element. Avoid: hard to maintain, beats other rules</li>
</ul>

<h3>Comments</h3>
${codeBlock(`/* Comments are for humans. Browsers ignore them. */`)}
<p>Same idea as <code>&lt;!-- HTML comments --&gt;</code> — they explain, never execute.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — CSS first steps", "https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps")} · ${externalLink("MDN — Getting started with CSS", "https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps/Getting_started")}</p>

<h3>Your task</h3>
<p>In the editor you'll find a page with an empty <code>&lt;style&gt;</code> block. Write rules so that: the <code>&lt;h1&gt;</code> turns <strong>teal</strong> (<code>#0d9488</code>), and both paragraphs get <code>font-size: 18px</code>. Watch the preview update as you type.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>First Styles</title>
    <style>
      /* Your styles go here */

    </style>
  </head>
  <body>
    <h1>Playing with color</h1>
    <p>This paragraph is waiting for a font size.</p>
    <p>CSS turns plain HTML into a designed page.</p>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>First Styles</title>
    <style>
      h1 {
        color: #0d9488;
      }

      p {
        font-size: 18px;
      }
    </style>
  </head>
  <body>
    <h1>Playing with color</h1>
    <p>This paragraph is waiting for a font size.</p>
    <p>CSS turns plain HTML into a designed page.</p>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "2. Colors & Backgrounds",
      content: {
        type: "browser",
        instructions: `
<h2>Color is the first thing people notice</h2>
<p>Two properties control most of what you see: <code>color</code> (text) and <code>background-color</code> (behind elements). Both accept the same <strong>color values</strong>.</p>

<h3>Ways to write a color</h3>
${codeBlock(`h1 {
  color: teal;              /* named color */
  color: #008080;           /* hex: #RRGGBB */
  color: rgb(0, 128, 128);  /* red, green, blue 0-255 */
  color: rgba(0, 128, 128, 0.5); /* ...plus alpha (transparency) */
}`)}
<ul>
  <li><strong>Hex</strong> — <code>#ff6600</code>; two digits per channel. <code>#0f0</code> (short form) is <code>#00ff00</code></li>
  <li><strong>rgb() / rgba()</strong> — same colors numerically; <code>a</code> = alpha from 0 (invisible) to 1 (solid)</li>
  <li>Named colors (there are ~148) are fine for learning — teams use hex/rgb</li>
  <li>Your editor shows a color swatch when you hover a value — click it to pick</li>
</ul>

<h3>Contrast matters</h3>
<p>Dark text on dark background is unreadable. Humans read best with strong contrast — designers check it with tools like <em>WebAIM contrast checker</em>. Rule of thumb: dark text on light backgrounds, or light text on dark ones.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — color", "https://developer.mozilla.org/en-US/docs/Web/CSS/color")} · ${externalLink("MDN — background-color", "https://developer.mozilla.org/en-US/docs/Web/CSS/background-color")}</p>

<h3>Your task</h3>
<p>Three "palette cards" are waiting to be painted: give card A a <strong>named color</strong> background, card B a <strong>hex</strong> background, and card C an <strong>rgba()</strong> background (any colors). On every card, make the text a light color so it's readable. The "tip" box at the bottom uses a <code>#fee2e2</code> background with dark text.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Palette Cards</title>
    <style>
      .palette {
        height: 80px;
        border-radius: 8px;
        margin: 10px 0;
        padding: 10px;
      }
    </style>
  </head>
  <body>
    <h1>My color palette</h1>

    <!-- Card A: named color background, light text -->
    <div class="palette">Named color</div>

    <!-- Card B: hex background, light text -->
    <div class="palette">Hex color</div>

    <!-- Card C: rgba background, light text -->
    <div class="palette">rgba color</div>

    <!-- Tip box: light background, dark text -->
    <div class="tip">Tip: always check contrast!</div>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Palette Cards</title>
    <style>
      .palette {
        height: 80px;
        border-radius: 8px;
        margin: 10px 0;
        padding: 10px;
        color: #ffffff;
        font-size: 18px;
        font-weight: bold;
      }

      .palette:nth-child(1) {
        background-color: teal;
      }

      .palette:nth-child(2) {
        background-color: #7c3aed;
      }

      .palette:nth-child(3) {
        background-color: rgba(225, 29, 72, 0.7);
      }

      .tip {
        background-color: #fee2e2;
        color: #7f1d1d;
        border-radius: 8px;
        padding: 12px 16px;
        margin-top: 16px;
      }
    </style>
  </head>
  <body>
    <h1>My color palette</h1>

    <!-- Card A: named color background, light text -->
    <div class="palette">Named color</div>

    <!-- Card B: hex background, light text -->
    <div class="palette">Hex color</div>

    <!-- Card C: rgba background, light text -->
    <div class="palette">rgba color</div>

    <!-- Tip box: light background, dark text -->
    <div class="tip">Tip: always check contrast!</div>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "3. Text & Fonts",
      content: {
        type: "browser",
        instructions: `
<h2>Typography is 90% of web design</h2>
<p>Most pages are mostly text. The properties below are the daily toolkit of every frontend developer.</p>

<h3>font-family</h3>
<p>Browsers only have a few fonts installed. A <strong>font stack</strong> lists fallbacks from most to least preferred:</p>
${codeBlock(`body {
  font-family: Georgia, "Times New Roman", serif;
}`)}
<ul>
  <li><code>serif</code> — classic, books (Georgia, Times). Good for long reading</li>
  <li><code>sans-serif</code> — modern, clean (Arial, Helvetica). Standard for UI</li>
  <li><code>monospace</code> — code and numbers</li>
  <li>Names with spaces need quotes: <code>"Segoe UI"</code></li>
</ul>

<h3>font-size &amp; font-weight</h3>
${codeBlock(`h1 { font-size: 32px; font-weight: 700; }
p { font-size: 16px; }`)}
<ul>
  <li>Sizes are usually <strong>px</strong> (exact) — <code>em</code>/<code>rem</code> relative units come later</li>
  <li><code>font-weight</code>: 400 = normal, 700 = bold. Never fake bold with <code>&lt;b&gt;</code> — style it</li>
</ul>

<h3>line-height &amp; text-align</h3>
${codeBlock(`p {
  line-height: 1.6;   /* 1.6x the font size — comfortable reading */
  text-align: justify;
}`)}
<p><code>line-height: 1.6</code> makes dense paragraphs breathable. <code>text-align</code> accepts <code>left</code>, <code>center</code>, <code>right</code>, <code>justify</code>.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — font-family", "https://developer.mozilla.org/en-US/docs/Web/CSS/font-family")} · ${externalLink("MDN — font-size", "https://developer.mozilla.org/en-US/docs/Web/CSS/font-size")} · ${externalLink("MDN — line-height", "https://developer.mozilla.org/en-US/docs/Web/CSS/line-height")}</p>

<h3>Your task</h3>
<p>A poem page is unstyled. Make it readable: <code>&lt;body&gt;</code> in a <strong>serif</strong> stack at <code>18px</code> with <code>line-height: 1.7</code>; the <code>&lt;h1&gt;</code> centered in <strong>sans-serif</strong>, weight <code>700</code>; all centered pretty? Keep the poem left-aligned, but center the title and the author line.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Poetry Corner</title>
    <style>
      /* Style the poem */
    </style>
  </head>
  <body>
    <h1>The Web</h1>
    <p class="author">by Ada Lovelace</p>
    <p>
      A page of tags, a wall of text,<br />
      a blank white screen, a thing is next.<br />
      With styles applied it comes alive,<br />
      the typography starts to thrive.
    </p>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Poetry Corner</title>
    <style>
      body {
        font-family: Georgia, "Times New Roman", serif;
        font-size: 18px;
        line-height: 1.7;
        max-width: 560px;
        margin: 0 auto;
        padding: 32px 16px;
      }

      h1 {
        font-family: Arial, Helvetica, sans-serif;
        font-weight: 700;
        text-align: center;
      }

      .author {
        text-align: center;
        font-style: italic;
        color: #64748b;
      }
    </style>
  </head>
  <body>
    <h1>The Web</h1>
    <p class="author">by Ada Lovelace</p>
    <p>
      A page of tags, a wall of text,<br />
      a blank white screen, a thing is next.<br />
      With styles applied it comes alive,<br />
      the typography starts to thrive.
    </p>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "4. The Box Model",
      content: {
        type: "browser",
        instructions: `
<h2>Every element is a box</h2>
<p>The single most important concept in CSS: everything on a page is a rectangle made of four layers.</p>
${codeBlock(`.box {
  width: 200px;        /* content */
  padding: 20px;       /* space INSIDE, around content */
  border: 4px solid black; /* the visible edge */
  margin: 12px;        /* space OUTSIDE, pushes neighbors */
}`)}
<ul>
  <li><strong>content</strong> — the actual text/image</li>
  <li><strong>padding</strong> — inside the border; gets the background color</li>
  <li><strong>border</strong> — visible outline; width, style, color</li>
  <li><strong>margin</strong> — outside; transparent; creates gaps</li>
</ul>
<p>Shorthands: <code>padding: 20px</code> = all sides; <code>margin: 10px 20px</code> = vertical, horizontal. Same for <code>border-width</code>.</p>

<h3>The famous width mystery</h3>
${codeBlock(`.card {
  width: 200px;
  padding: 20px;
  border: 4px solid #333;
  /* "2+0? The card is actually 200 + 40 + 8 = 248px wide!" */
}`)}
<p>Default <code>box-sizing: content-box</code> adds padding and border on top of width. One line — the <strong>universal selector</strong> — fixes that forever:</p>
${codeBlock(`* {
  box-sizing: border-box;  /* width now INCLUDES padding + border */
}`)}
<p>With <code>border-box</code>, 200px means 200px. Real projects ship this on every page.</p>

<h3>Centering a block</h3>
${codeBlock(`.card {
  width: 300px;
  margin: 0 auto;  /* top/bottom 0, left/right auto = centered */
}`)}
<p>Block boxes with a fixed width can be centered horizontally with <code>margin: 0 auto</code>. One of the most-used patterns ever.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — the box model", "https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model")} · ${externalLink("MDN — box-sizing", "https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing")}</p>

<h3>Your task</h3>
<p>Fix the broken card: it claims <code>width: 200px</code> but renders wider — add the universal <code>box-sizing</code> fix, give it padding, a rounded border and center it with <code>margin: 0 auto</code>. Then add a small inner <code>&lt;div class="badge"&gt;</code> with its own background and padding.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Box Model Lab</title>
    <style>
      /* Fix: add the box-sizing reset ("*" selector) at the top */

      .card {
        width: 200px;
        margin: 0 auto;    /* center the card */
        padding: 20px;
        border: 4px solid #0d9488;
        border-radius: 12px;
        background-color: #f0fdfa;
      }

      /* Style the badge: background, padding, radius */
    </style>
  </head>
  <body>
    <div class="card">
      <div class="badge">NEW</div>
      <h1>Box Model</h1>
      <p>With border-box, 200px truly means 200px.</p>
    </div>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Box Model Lab</title>
    <style>
      * {
        box-sizing: border-box;
      }

      .card {
        width: 200px;
        margin: 0 auto;
        padding: 20px;
        border: 4px solid #0d9488;
        border-radius: 12px;
        background-color: #f0fdfa;
      }

      .badge {
        display: inline-block;
        background-color: #0d9488;
        color: #ffffff;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="badge">NEW</div>
      <h1>Box Model</h1>
      <p>With border-box, 200px truly means 200px.</p>
    </div>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "5. Selectors & Specificity",
      content: {
        type: "browser",
        instructions: `
<h2>Reaching the elements you want</h2>
<p>Selectors answer one question: <em>which elements does this rule apply to?</em></p>

<h3>The selector family</h3>
${codeBlock(`p { }              /* element — every <p> */
.highlight { }     /* class — every element with class="highlight" */
#header { }        /* id — the one element with id="header" */
.card p { }        /* descendant — <p> inside .card */
h1, h2 { }         /* grouping — both */
* { }              /* universal — everything */`)}
<ul>
  <li><strong>Class</strong> <code>.name</code> — reusable on many elements. The workhorse of CSS</li>
  <li><strong>ID</strong> <code>#name</code> — must be unique on the page; one element only</li>
  <li>Descendant <code>.card p</code> — "p that is inside card" (any depth)</li>
</ul>

<h3>Specificity — who wins when rules conflict?</h3>
${codeBlock(`p { color: red; }          /* element   -> 0-0-1 */
.intro { color: blue; }     /* class     -> 0-1-0 */
#special { color: green; }  /* id        -> 1-0-0 */`)}
<p>The cascade ranks by specificity: <strong>id &gt; class &gt; element</strong>. Then ties go to the <strong>last rule in the file</strong>. That's the "cascading" in CSS — the browser walks stylesheets and picks winners.</p>
<div style="${BOX_STYLE}"><strong>Anti-pattern:</strong> <code>!important</code> overrides everything and turns your stylesheet into a guessing game. Teams ban it; instead, write a more specific selector.</div>

<h3>Learn more</h3>
<p>${externalLink("MDN — CSS selectors", "https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors")} · ${externalLink("MDN — specificity", "https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity")}</p>

<h3>Your task</h3>
<p>Two story cards, <code>.story</code> each. Style the shared card parts (background, padding, radius) with the class. Then the featured card reuses <code>.story</code> <strong>plus</strong> a <code>.story.featured</code> class to get an accent border. Give the first paragraph of each card the class <code>.lead</code> with a larger font. And the heading uses <code>#story-2</code>-style ids? No — keep it class-based and watch everything cascade.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Story Cards</title>
    <style>
      /* Shared card styles via .story */
    </style>
  </head>
  <body>
    <div class="story">
      <h2>First steps</h2>
      <p class="lead">It all started with a single tag.</p>
      <p>The rest of the story goes here.</p>
    </div>

    <div class="story featured">
      <h2>Featured tale</h2>
      <p class="lead">This card deserves an accent border.</p>
      <p>Feature it with a second class, not a second style.</p>
    </div>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Story Cards</title>
    <style>
      .story {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px 20px;
        margin: 12px 0;
        max-width: 420px;
      }

      .story.featured {
        border: 2px solid #7c3aed;
        background-color: #f5f3ff;
      }

      .story .lead {
        font-size: 18px;
        color: #334155;
      }
    </style>
  </head>
  <body>
    <div class="story">
      <h2>First steps</h2>
      <p class="lead">It all started with a single tag.</p>
      <p>The rest of the story goes here.</p>
    </div>

    <div class="story featured">
      <h2>Featured tale</h2>
      <p class="lead">This card deserves an accent border.</p>
      <p>Feature it with a second class, not a second style.</p>
    </div>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "6. Pseudo-classes & Transitions",
      content: {
        type: "browser",
        instructions: `
<h2>Interactivity without JavaScript</h2>
<p><strong>Pseudo-classes</strong> style elements based on <em>state</em> — hovered, focused, first child. They're how websites feel alive.</p>

<h3>The famous four</h3>
${codeBlock(`a:hover { color: #0d9488; }   /* mouse is over it */
a:active { color: #f00; }      /* being clicked */
a:focus { outline: 2px solid; } /* keyboard / tab reached it */
a:visited { color: #6b21a8; }  /* already visited */`)}
<ul>
  <li><code>:hover</code> — instant feedback for mice</li>
  <li><code>:focus</code> — <strong>accessibility:</strong> keyboard users navigate with Tab; visible focus is legally required on real sites</li>
  <li><code>:visited</code> — browsers restrict its styles for privacy</li>
</ul>

<h3>Positional pseudo-classes</h3>
${codeBlock(`li:nth-child(odd) { background: #f8fafc; }  /* zebra rows */
li:first-child { font-weight: 700; }`)}
<p><code>:nth-child(2)</code> = second child, <code>:nth-child(odd/even)</code> = alternating, <code>:last-child</code> = final one. Perfect for tables and lists.</p>

<h3>Transitions — make changes smooth</h3>
${codeBlock(`a {
  color: #334155;
  transition: color 0.2s ease;
}
a:hover { color: #0d9488; }`)}
<p><code>transition</code> animates property changes: <code>transition: [property] [duration] [easing]</code>. Without it, hovers snap; with it, they glide.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — pseudo-classes", "https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors/Pseudo-classes_and_pseudo-elements")} · ${externalLink("MDN — transition", "https://developer.mozilla.org/en-US/docs/Web/CSS/transition")}</p>

<h3>Your task</h3>
<p>Make the list interactive: links turn <code>#0d9488</code> on hover (with a <code>0.2s</code> transition), the submit button lifts slightly on hover (<code>transform: translateY(-2px)</code>) plus a shadow, zebra rows via <code>:nth-child(odd)</code>, and <code>:focus</code> rings on the links.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Interactive List</title>
    <style>
      /* Style links, button, zebra rows and focus below */
    </style>
  </head>
  <body>
    <h1>Daily links</h1>
    <ul>
      <li><a href="#">MDN documentation</a></li>
      <li><a href="#">freeCodeCamp</a></li>
      <li><a href="#">htmlreference.io</a></li>
      <li><a href="#">css-tricks</a></li>
    </ul>
    <button>Save changes</button>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Interactive List</title>
    <style>
      a {
        color: #334155;
        transition: color 0.2s ease;
      }

      a:hover {
        color: #0d9488;
      }

      a:focus {
        outline: 2px solid #0d9488;
        outline-offset: 2px;
        border-radius: 4px;
      }

      li {
        padding: 8px 12px;
      }

      li:nth-child(odd) {
        background-color: #f8fafc;
        border-radius: 8px;
      }

      button {
        background-color: #0d9488;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        padding: 10px 18px;
        font-size: 15px;
        cursor: pointer;
        margin-top: 12px;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }

      button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(13, 148, 136, 0.3);
      }
    </style>
  </head>
  <body>
    <h1>Daily links</h1>
    <ul>
      <li><a href="#">MDN documentation</a></li>
      <li><a href="#">freeCodeCamp</a></li>
      <li><a href="#">htmlreference.io</a></li>
      <li><a href="#">css-tricks</a></li>
    </ul>
    <button>Save changes</button>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "7. Display & Flow",
      content: {
        type: "browser",
        instructions: `
<h2>Block vs inline — how boxes lay out</h2>
<p>Every element has a <code>display</code> behavior that decides how it flows. The two classics:</p>
${codeBlock(`p, div, h1 { display: block; }   /* default for these */
a, span { display: inline; }    /* default for these */`)}
<ul>
  <li><strong>block</strong> — starts on a new line, stretches full width, respects <code>width</code>/<code>height</code>/<code>margin</code></li>
  <li><strong>inline</strong> — flows inside text, sized by content; <code>width</code>/<code>height</code> ignored, vertical margins ignored</li>
</ul>

<h3>inline-block — the best of both</h3>
${codeBlock(`a.pill {
  display: inline-block;
  padding: 6px 14px;         /* works on inline-block! */
  background: #e2e8f0;
  border-radius: 9999px;     /* pill shape */
}`)}
<p><code>display: inline-block</code> keeps elements in a row but gives them box properties (padding, margins, size). That's how tag pills, badges and buttons are built.</p>

<h3>Centering text inside a box</h3>
${codeBlock(`.banner { text-align: center; }  /* centers INLINE children (text, a, span) */`)}
<p>Important distinction: <code>text-align</code> centers <strong>inline</strong> content. A <code>block</code> child needs <code>margin: 0 auto</code>. The two techniques cover 90% of centering until Flexbox.</p>
<div style="${BOX_STYLE}"><strong>Tip:</strong> <code>display: none</code> removes an element completely (used for mobile menus). It's not the same as <code>visibility: hidden</code> (still takes space).</div>

<h3>Learn more</h3>
<p>${externalLink("MDN — display", "https://developer.mozilla.org/en-US/docs/Web/CSS/display")} · ${externalLink("MDN — block and inline layout", "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Block_and_inline_layout_in_normal_flow")}</p>

<h3>Your task</h3>
<p>A "reading time" banner is plain text. Turn each category link into an <code>inline-block</code> pill (background <code>#e2e8f0</code>, radius <code>9999px</code>, padding <code>6px 14px</code>), center them with <code>text-align: center</code> on the container, and give the title a <code>block</code> look with bottom margin. Watch the pills sit on one line.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Reading Mode</title>
    <style>
      /* Turn the links into pills, center the banner */
    </style>
  </head>
  <body>
    <div class="banner">
      <h2>Reading time: 5 min</h2>
      <a href="#">HTML</a>
      <a href="#">CSS</a>
      <a href="#">JavaScript</a>
      <a href="#">DevOps</a>
    </div>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Reading Mode</title>
    <style>
      .banner {
        text-align: center;
        background-color: #f8fafc;
        border-radius: 12px;
        padding: 24px 16px;
        max-width: 480px;
        margin: 0 auto;
      }

      .banner h2 {
        display: block;
        margin-bottom: 16px;
        color: #0f172a;
      }

      .banner a {
        display: inline-block;
        background-color: #e2e8f0;
        color: #334155;
        padding: 6px 14px;
        border-radius: 9999px;
        margin: 4px;
        text-decoration: none;
        font-size: 14px;
        transition: background-color 0.15s ease;
      }

      .banner a:hover {
        background-color: #0d9488;
        color: #ffffff;
      }
</style>
  </head>
  <body>
    <div class="banner">
      <h2>Reading time: 5 min</h2>
      <a href="#">HTML</a>
      <a href="#">CSS</a>
      <a href="#">JavaScript</a>
      <a href="#">DevOps</a>
    </div>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "8. Flexbox",
      content: {
        type: "browser",
        instructions: `
<h2>The layout superpower</h2>
<p><strong>Flexbox</strong> arranges a container's children in a row or column and distributes the space. It replaced floats for 95% of UI layouts. Give a parent <code>display: flex</code> and its children become <strong>flex items</strong> on one line.</p>

<h3>Direction &amp; axis</h3>
${codeBlock(`.row {
  display: flex;
  flex-direction: row;            /* default: left to right */
}
.column { display: flex; flex-direction: column; }`)}
<p>Flexbox works on two axes: <strong>main</strong> (direction) and <strong>cross</strong> (perpendicular). Two properties position items:</p>
${codeBlock(`.container {
  display: flex;
  justify-content: space-between;  /* main axis: gaps between */
  align-items: center;             /* cross axis: vertical centering */
  gap: 12px;                       /* space BETWEEN items (no margins!) */
}`)}
<ul>
  <li><code>justify-content</code>: <code>flex-start</code> (default), <code>center</code>, <code>flex-end</code>, <code>space-between</code>, <code>space-around</code></li>
  <li><code>align-items</code>: <code>stretch</code> (default), <code>center</code>, <code>flex-start</code>, <code>flex-end</code></li>
  <li><code>gap</code> — modern spacing: no more margin hacks</li>
</ul>

<h3>Growing and wrapping</h3>
${codeBlock(`.card { flex: 1; }   /* grow to share the row equally */
.container { flex-wrap: wrap; } /* items drop to a new line on narrow screens */`)}
<p><code>flex: 1</code> = "grow to fill". <code>flex-wrap: wrap</code> turns a row into an auto-flowing grid.</p>

<h3>The centering mantra</h3>
${codeBlock(`.center {
  display: flex;
  justify-content: center;
  align-items: center;
} /* the famous three lines — used everywhere */`)}
<p>This is how you center content both ways without hacks.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — flexbox", "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox")} · ${externalLink("MDN — justify-content", "https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content")} · ${externalLink("Flexbox Froggy (game)", "https://flexboxfroggy.com/")}</p>

<h3>Your task</h3>
<p>Build a toolbar: the logo on the left, a search pill in the middle (growing with <code>flex: 1</code>), a button on the right. Use <code>justify-content: space-between</code>, <code>align-items: center</code>, <code>gap: 12px</code> and <code>flex-wrap: wrap</code> so it survives narrow previews.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Toolbar</title>
    <style>
      /* Make .toolbar a flex container and distribute its children */
    </style>
  </head>
  <body>
    <div class="toolbar">
      <div class="logo">✨ LynxDEV</div>
      <input class="search" type="text" placeholder="Search courses..." />
      <button class="cta">Sign up</button>
    </div>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Toolbar</title>
    <style>
      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        padding: 12px 16px;
        background-color: #0f172a;
        border-radius: 12px;
      }

      .logo {
        color: #ffffff;
        font-weight: 700;
        font-size: 18px;
      }

      .search {
        flex: 1;
        min-width: 140px;
        padding: 8px 14px;
        border: 1px solid #334155;
        border-radius: 9999px;
        background-color: #1e293b;
        color: #ffffff;
        font-size: 14px;
      }

      .cta {
        background-color: #0d9488;
        color: #ffffff;
        border: none;
        border-radius: 9999px;
        padding: 8px 18px;
        font-weight: 600;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <div class="logo">✨ LynxDEV</div>
      <input class="search" type="text" placeholder="Search courses..." />
      <button class="cta">Sign up</button>
    </div>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "9. Positioning & Layers",
      content: {
        type: "browser",
        instructions: `
<h2>Taking boxes out of flow</h2>
<p><code>position</code> decides where an element sits relative to what. Four values matter:</p>

<h3>The family</h3>
${codeBlock(`.static-default { }                      /* normal flow (default) */
.nudge { position: relative; top: 4px; }  /* shift from where it WOULD be */
.sticker {
  position: absolute;
  top: 8px; right: 8px;                  /* relative to nearest positioned ancestor */
}
.navbar { position: fixed; top: 0; left: 0; } /* relative to the VIEWPORT, never scrolls */`)}
<ul>
  <li><strong>relative</strong> — stays in flow, but offsets (<code>top</code>/<code>right</code>/<code>bottom</code>/<code>left</code>) nudge it. Also becomes the anchor for children</li>
  <li><strong>absolute</strong> — removed from flow; positioned against the nearest <em>positioned</em> ancestor (often a <code>relative</code> parent). Perfect for badges and popovers</li>
  <li><strong>fixed</strong> — pinned to the viewport. Navbars and "back to top" buttons</li>
</ul>
<p>Gotcha: an <code>absolute</code> element with no positioned ancestor positions against the page. Give the parent <code>position: relative</code> first.</p>

<h3>Z-stacking</h3>
${codeBlock(`.badge { z-index: 10; }  /* higher = on top */`)}
<p><code>z-index</code> only works on <em>positioned</em> elements. Equal values? Later DOM order wins. Keep numbers small (1-10); giant numbers like <code>999999</code> are a code smell.</p>

<h3>Learn more</h3>
<p>${externalLink("MDN — position", "https://developer.mozilla.org/en-US/docs/Web/CSS/position")} · ${externalLink("MDN — z-index", "https://developer.mozilla.org/en-US/docs/Web/CSS/z-index")}</p>

<h3>Your task</h3>
<p>Create a product card: a <code>relative</code> card with an <code>absolute</code> "SALE" badge on the corner (needs <code>z-index</code> to sit above the image), and a <code>fixed</code> bottom bar with a "Back to top" link that survives scrolling.</p>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Product Card</title>
    <style>
      /* Position the badge absolutely inside the card, pin the footer */
    </style>
  </head>
  <body>
    <div class="card">
      <img
        src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg"
        alt="A product photo: a relaxed cat"
        width="240"
      />
      <div class="badge">SALE</div>
      <h3>Premium Cloud Nap</h3>
      <p>High-quality rest for busy developers.</p>
    </div>

    <div class="bottom-bar">
      <a href="#">Back to top</a>
    </div>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Product Card</title>
    <style>
      .card {
        position: relative;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
        max-width: 260px;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
      }

      .card img {
        display: block;
        max-width: 100%;
        border-radius: 8px;
      }

      .badge {
        position: absolute;
        top: 8px;
        left: 8px;
        z-index: 10;
        background-color: #e11d48;
        color: #ffffff;
        font-size: 12px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 6px;
      }

      .bottom-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #0f172a;
        color: #ffffff;
        display: flex;
        justify-content: center;
        padding: 12px;
      }

      .bottom-bar a {
        color: #2dd4bf;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <img
        src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg"
        alt="A product photo: a relaxed cat"
        width="240"
      />
      <div class="badge">SALE</div>
      <h3>Premium Cloud Nap</h3>
      <p>High-quality rest for busy developers.</p>
    </div>

    <div class="bottom-bar">
      <a href="#">Back to top</a>
    </div>
  </body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "10. Project — Profile Card",
      content: {
        type: "browser",
        instructions: `
<h2>Project 1 of 5: a profile card people want to click</h2>
<p>A card is the internet's favorite UI shape. This one combines <strong>box model</strong>, <strong>colors</strong>, <strong>fonts</strong>, <strong>inline-block pills</strong>, a <strong>gradient</strong> and a <strong>hover lift</strong>.</p>

<h3>Requirements (user stories)</h3>
<ul>
  <li>Centered card (max-width ~320px, <code>margin: 0 auto</code>) with rounded corners and a subtle shadow</li>
  <li>A <strong>gradient banner</strong> at the top — <code>background: linear-gradient(...)</code></li>
  <li>Circular avatar image overlapping the banner (<code>border-radius: 50%</code> + negative <code>margin-top</code> or absolute position — your pick)</li>
  <li>Name, role, short bio</li>
  <li>Skill pills: <code>display: inline-block</code>, light background, full radius</li>
  <li>A "Follow" button that <strong>darkens</strong> on hover with a <code>0.2s</code> transition</li>
  <li>Whole card lifts on hover: <code>transform: translateY(-4px)</code> + stronger shadow</li>
</ul>

<h3>Stretch goals</h3>
<ul>
  <li><code>:focus</code> ring on the button (keyboard users!)</li>
  <li>Use an <code>rgba()</code> overlay on the banner</li>
</ul>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Profile Card</title>
    <style>
      /* Design the card: gradient banner, avatar, pills, button */
    </style>
  </head>
  <body>
    <div class="card">
      <div class="banner"></div>
      <img
        class="avatar"
        src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/cats-2.jpg"
        alt="Profile picture of a kitten"
        width="96"
      />
      <h2>Alex Developer</h2>
      <p class="role">Frontend learner at LynxDEV</p>
      <p class="bio">Turning curiosity into code — one project at a time.</p>
      <div class="skills">
        <span>HTML</span>
        <span>CSS</span>
        <span>JS soon</span>
      </div>
      <button>Follow</button>
    </div>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Profile Card</title>
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
        background-color: #f1f5f9;
        padding: 32px 16px;
      }

      .card {
        max-width: 320px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        text-align: center;
        padding-bottom: 28px;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
      }

      .banner {
        height: 96px;
        background: linear-gradient(135deg, #0d9488, #7c3aed);
      }

      .avatar {
        width: 96px;
        height: 96px;
        border-radius: 50%;
        border: 4px solid #ffffff;
        margin-top: -48px;
        object-fit: cover;
      }

      .role {
        color: #0d9488;
        font-weight: 700;
        font-size: 14px;
        margin-top: 4px;
      }

      .bio {
        color: #64748b;
        font-size: 14px;
        padding: 0 24px;
      }

      .skills {
        margin: 12px 0 20px;
      }

      .skills span {
        display: inline-block;
        background-color: #f1f5f9;
        color: #334155;
        border-radius: 9999px;
        padding: 4px 12px;
        font-size: 13px;
        margin: 4px;
      }

      button {
        background-color: #0d9488;
        color: #ffffff;
        border: none;
        border-radius: 9999px;
        padding: 10px 32px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      button:hover {
        background-color: #0f766e;
      }

      button:focus {
        outline: 2px solid #0d9488;
        outline-offset: 2px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="banner"></div>
      <img
        class="avatar"
        src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/cats-2.jpg"
        alt="Profile picture of a kitten"
        width="96"
      />
      <h2>Alex Developer</h2>
      <p class="role">Frontend learner at LynxDEV</p>
      <p class="bio">Turning curiosity into code — one project at a time.</p>
      <div class="skills">
        <span>HTML</span>
        <span>CSS</span>
        <span>JS soon</span>
      </div>
      <button>Follow</button>
    </div>
  </body>
</html>`,
      },
      points_reward: 25,
    },
    {
      title: "11. Project — Navigation Bar",
      content: {
        type: "browser",
        instructions: `
<h2>Project 2 of 5: a navbar that never moves</h2>
<p>Every site has one. This project nails the classic recipe: <code>position: fixed</code> + <strong>flexbox</strong> + <strong>hover states</strong>.</p>

<h3>Requirements (user stories)</h3>
<ul>
  <li><code>fixed</code> navbar across the top with a solid background and subtle shadow/border</li>
  <li>Logo on the left, links on the right (<code>display: flex; justify-content: space-between; align-items: center</code>)</li>
  <li>Links: comfortable padding, <code>border-radius</code>, no underline, hover = background tint or underline sweep</li>
  <li>One link marked <code>.active</code> (current page) with a distinct accent color</li>
  <li><code>body { padding-top: 64px }</code> so content doesn't hide underneath the fixed bar</li>
  <li>On narrow windows (<code>max-width: 560px</code> media query) the links wrap or shrink — try <code>flex-wrap: wrap</code></li>
</ul>

<h3>Stretch goals</h3>
<ul>
  <li>Add a <code>:focus-visible</code> style for keyboard nav</li>
  <li>Two-line layout on mobile: logo on top, links below (use <code>flex-direction: column</code> inside the query)</li>
</ul>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Navbar Project</title>
    <style>
      /* Build the fixed navbar here */
    </style>
  </head>
  <body>
    <nav class="navbar">
      <div class="logo">LynxDEV</div>
      <div class="links">
        <a class="active" href="#">Courses</a>
        <a href="#">Interview</a>
        <a href="#">Problems</a>
        <a href="#">About</a>
      </div>
    </nav>

    <main>
      <h1>Learning never stops</h1>
      <p>
        This content scrolls under the fixed navbar. Give the body enough
        top padding and nothing will ever be hidden.
      </p>
      <p>
        Lorem ipsum-like filler: keep scrolling and watch the navbar stay
        pinned to the top of the viewport.
      </p>
    </main>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Navbar Project</title>
    <style>
      body {
        margin: 0;
        padding-top: 72px;
        font-family: Arial, Helvetica, sans-serif;
        background-color: #f8fafc;
      }

      .navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        background-color: #0f172a;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.25);
        z-index: 100;
      }

      .logo {
        color: #ffffff;
        font-weight: 700;
        font-size: 20px;
      }

      .links {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .links a {
        color: #cbd5e1;
        text-decoration: none;
        padding: 8px 14px;
        border-radius: 8px;
        font-size: 15px;
        transition: background-color 0.15s ease, color 0.15s ease;
      }

      .links a:hover {
        background-color: #1e293b;
        color: #ffffff;
      }

      .links a.active {
        background-color: #0d9488;
        color: #ffffff;
      }

      .links a:focus-visible {
        outline: 2px solid #2dd4bf;
        outline-offset: 2px;
      }

      main {
        max-width: 640px;
        margin: 0 auto;
        padding: 0 24px;
      }

      @media (max-width: 560px) {
        .navbar {
          flex-direction: column;
          gap: 12px;
        }
        body {
          padding-top: 108px;
        }
      }
    </style>
  </head>
  <body>
    <nav class="navbar">
      <div class="logo">LynxDEV</div>
      <div class="links">
        <a class="active" href="#">Courses</a>
        <a href="#">Interview</a>
        <a href="#">Problems</a>
        <a href="#">About</a>
      </div>
    </nav>

    <main>
      <h1>Learning never stops</h1>
      <p>
        This content scrolls under the fixed navbar. Give the body enough
        top padding and nothing will ever be hidden.
      </p>
      <p>
        Lorem ipsum-like filler: keep scrolling and watch the navbar stay
        pinned to the top of the viewport.
      </p>
    </main>
  </body>
</html>`,
      },
      points_reward: 25,
    },
    {
      title: "12. Project — Pricing Cards",
      content: {
        type: "browser",
        instructions: `
<h2>Project 3 of 5: three pricing cards that sell</h2>
<p>This project is a flexbox classic: one row, three cards, the middle one the hero. Plus an <strong>absolute badge</strong> and a <strong>hover</strong>.</p>

<h3>Requirements (user stories)</h3>
<ul>
  <li>Three cards side by side: <code>display: flex</code> + <code>gap</code>, each card <code>flex: 1</code> so they share width equally</li>
  <li>Plan tier name, price (large, bold), a feature list (checkmark-before rows), and a button</li>
  <li>The middle "Pro" card stands out:
    <ul>
      <li>Accent border or <code>transform: scale(1.05)</code></li>
      <li>A "MOST POPULAR" badge, <code>position: absolute</code> on a <code>relative</code> card</li>
    </ul>
  </li>
  <li>Buttons: primary style for Pro, outline/secondary for the others</li>
  <li>Hover lift on every card: <code>translateY(-4px)</code> + shadow transition</li>
  <li><code>flex-wrap: wrap</code> on the row so cards stack on narrow previews</li>
</ul>

<h3>Stretch goals</h3>
<ul>
  <li>Dark theme cards (<code>background: #0f172a</code>, light text)</li>
  <li>Zebra checklists via <code>:nth-child</code> spacing</li>
</ul>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Pricing</title>
    <style>
      /* Flex row + cards + Pro highlight */
    </style>
  </head>
  <body>
    <h1>Pick your plan</h1>

    <div class="plans">
      <div class="plan">
        <h2>Starter</h2>
        <p class="price">$0<span>/mo</span></p>
        <ul>
          <li>1 course</li>
          <li>Community access</li>
          <li>Notes (mobile)</li>
        </ul>
        <button>Get started</button>
      </div>

      <div class="plan pro">
        <div class="badge">MOST POPULAR</div>
        <h2>Pro</h2>
        <p class="price">$9<span>/mo</span></p>
        <ul>
          <li>All courses</li>
          <li>Mock interviews</li>
          <li>AI mentor, unlimited</li>
          <li>Certificates</li>
        </ul>
        <button>Go Pro</button>
      </div>

      <div class="plan">
        <h2>Team</h2>
        <p class="price">$29<span>/mo</span></p>
        <ul>
          <li>Everything in Pro</li>
          <li>5 seats</li>
          <li>Progress reports</li>
        </ul>
        <button>Contact sales</button>
      </div>
    </div>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Pricing</title>
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
        background-color: #f1f5f9;
        text-align: center;
        padding: 24px 16px;
      }

      .plans {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        justify-content: center;
        max-width: 900px;
        margin: 0 auto;
      }

      .plan {
        flex: 1;
        min-width: 220px;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 24px 20px;
        text-align: left;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .plan:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.14);
      }

      .plan.pro {
        position: relative;
        border: 2px solid #0d9488;
        transform: scale(1.05);
      }

      .badge {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #0d9488;
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.5px;
        padding: 4px 12px;
        border-radius: 9999px;
      }

      .price {
        font-size: 36px;
        font-weight: 700;
        color: #0f172a;
        margin: 8px 0;
      }

      .price span {
        font-size: 14px;
        font-weight: 400;
        color: #64748b;
      }

      .plan ul {
        list-style: none;
        padding: 0;
        margin: 16px 0 20px;
      }

      .plan li {
        padding: 6px 0;
        color: #475569;
        font-size: 14px;
      }

      .plan li::before {
        content: "✓ ";
        color: #0d9488;
        font-weight: 700;
      }

      button {
        border: 1px solid #0d9488;
        color: #0d9488;
        background: transparent;
        border-radius: 9999px;
        padding: 10px 0;
        width: 100%;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      .pro button {
        background-color: #0d9488;
        color: #ffffff;
      }

      .pro button:hover {
        background-color: #0f766e;
      }
    </style>
  </head>
  <body>
    <h1>Pick your plan</h1>

    <div class="plans">
      <div class="plan">
        <h2>Starter</h2>
        <p class="price">$0<span>/mo</span></p>
        <ul>
          <li>1 course</li>
          <li>Community access</li>
          <li>Notes (mobile)</li>
        </ul>
        <button>Get started</button>
      </div>

      <div class="plan pro">
        <div class="badge">MOST POPULAR</div>
        <h2>Pro</h2>
        <p class="price">$9<span>/mo</span></p>
        <ul>
          <li>All courses</li>
          <li>Mock interviews</li>
          <li>AI mentor, unlimited</li>
          <li>Certificates</li>
        </ul>
        <button>Go Pro</button>
      </div>

      <div class="plan">
        <h2>Team</h2>
        <p class="price">$29<span>/mo</span></p>
        <ul>
          <li>Everything in Pro</li>
          <li>5 seats</li>
          <li>Progress reports</li>
        </ul>
        <button>Contact sales</button>
      </div>
    </div>
  </body>
</html>`,
      },
      points_reward: 25,
    },
    {
      title: "13. Project — Hero Section",
      content: {
        type: "browser",
        instructions: `
<h2>Project 4 of 5: a hero that lands the first impression</h2>
<p>The hero is the top of a landing page — headline, subtext, call-to-action. You'll build one with a <strong>gradient</strong>, <strong>flexbox centering</strong>, <strong>pill badges</strong> and <strong>hover effects</strong>.</p>

<h3>Requirements (user stories)</h3>
<ul>
  <li>Full-viewport-ish hero (<code>min-height: 320px</code> or so) with a diagonal or vertical <code>linear-gradient</code> background</li>
  <li>Content centered both ways: <code>display: flex; justify-content: center; align-items: center; text-align: center</code></li>
  <li>A "NEW" pill badge above the headline</li>
  <li>Big headline (top <code>font-size</code>), short sub-paragraph, two buttons: solid primary + outline secondary</li>
  <li>Buttons react to hover (fill/tint change with transition)</li>
  <li>A little visual proof below the buttons — a rounded image row or a "trusted by" caption — your choice</li>
</ul>

<h3>Stretch goals</h3>
<ul>
  <li>Overlay a subtle radial highlight (<code>radial-gradient</code>) on the hero</li>
  <li>Add <code>:focus-visible</code> styles on the buttons</li>
</ul>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hero</title>
    <style>
      /* Gradient hero + centered content + buttons */
    </style>
  </head>
  <body>
    <section class="hero">
      <div class="badge">NEW · Season 2026</div>
      <h1>Become the developer you dream of</h1>
      <p class="sub">
        Learn HTML, CSS and JavaScript with real projects, live previews and
        an AI mentor that knows your level.
      </p>
      <div class="actions">
        <a class="btn primary" href="#">Start learning</a>
        <a class="btn outline" href="#">Browse courses</a>
      </div>
    </section>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hero</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
      }

      .hero {
        min-height: 340px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 48px 24px;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0d9488 130%);
        color: #ffffff;
      }

      .badge {
        background-color: rgba(45, 212, 191, 0.15);
        border: 1px solid rgba(45, 212, 191, 0.4);
        color: #2dd4bf;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 1px;
        padding: 6px 16px;
        border-radius: 9999px;
        margin-bottom: 20px;
      }

      .hero h1 {
        max-width: 680px;
        margin: 0;
        font-size: 40px;
        line-height: 1.2;
      }

      .sub {
        max-width: 520px;
        color: #cbd5e1;
        font-size: 17px;
        line-height: 1.6;
        margin: 16px 0 28px;
      }

      .actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .btn {
        display: inline-block;
        padding: 12px 28px;
        border-radius: 9999px;
        text-decoration: none;
        font-weight: 600;
        font-size: 15px;
        transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      }

      .btn.primary {
        background-color: #0d9488;
        color: #ffffff;
      }

      .btn.primary:hover {
        background-color: #14b8a6;
      }

      .btn.outline {
        border: 1px solid #64748b;
        color: #e2e8f0;
      }

      .btn.outline:hover {
        border-color: #e2e8f0;
        background-color: rgba(255, 255, 255, 0.08);
      }

      .btn:focus-visible {
        outline: 2px solid #2dd4bf;
        outline-offset: 2px;
      }
    </style>
  </head>
  <body>
    <section class="hero">
      <div class="badge">NEW · Season 2026</div>
      <h1>Become the developer you dream of</h1>
      <p class="sub">
        Learn HTML, CSS and JavaScript with real projects, live previews and
        an AI mentor that knows your level.
      </p>
      <div class="actions">
        <a class="btn primary" href="#">Start learning</a>
        <a class="btn outline" href="#">Browse courses</a>
      </div>
    </section>
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
<h2>Capstone: an entire landing page, styled end to end</h2>
<p>Everything combines into one page: <strong>fixed navbar</strong>, <strong>gradient hero</strong>, <strong>flexbox project cards</strong>, <strong>pill skills</strong>, <strong>hover transitions</strong>, <strong>media queries</strong>. This is the page that could become your real portfolio.</p>

<h3>Requirements (user stories)</h3>
<ul>
  <li><code>fixed</code> navbar: logo left, four links right, <code>.active</code> style, mobile stack via media query</li>
  <li><strong>Hero</strong>: gradient background, avatar in a circle, big headline, sub, two CTA buttons</li>
  <li><strong>Projects section</strong>: a <code>flex-wrap</code> row of three cards (<code>flex: 1</code>, min-width ~240px), each with an image, title, description and "View project" link; hover lift</li>
  <li><strong>Skills section</strong>: skills as <code>inline-block</code> pills centered, one pill with an accent background (the "strongest" skill)</li>
  <li><strong>Contact section</strong>: a centered card with name/email inputs and a message textarea — style inputs with padding, radius, focus border</li>
  <li><code>footer</code>: dark bar, centered, links that tint on hover</li>
  <li>Cohesive palette: pick 2 accent colors and reuse them everywhere (this solution uses teal + slate)</li>
</ul>

<div style="${BOX_STYLE}"><strong>Boss level:</strong> before writing CSS, label each section in your head with its pattern — navbar = flex + fixed, hero = centered flex + gradient, cards = flex-wrap row, pills = inline-block. If it feels repetitive, you're doing it right: those patterns ARE frontend work.</div>

<h3>Stretch goals</h3>
<ul>
  <li>Smooth-scroll the anchor links: <code>html { scroll-behavior: smooth; }</code></li>
  <li>Make the CTA buttons <code>:hover</code> swap colors with a transition</li>
</ul>
`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Alex — Portfolio</title>
    <style>
      /* Build the full landing page */
    </style>
  </head>
  <body>
    <nav class="navbar">
      <div class="logo">Alex.</div>
      <div class="links">
        <a class="active" href="#hero">Home</a>
        <a href="#projects">Projects</a>
        <a href="#skills">Skills</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>

    <section id="hero" class="hero">
      <img
        class="avatar"
        src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg"
        alt="Portrait of Alex"
        width="120"
      />
      <h1>Hi, I'm Alex, a frontend learner</h1>
      <p>I build small, polished web UIs and write about everything I learn.</p>
      <div class="actions">
        <a class="btn primary" href="#projects">See my work</a>
        <a class="btn outline" href="#contact">Say hi</a>
      </div>
    </section>

    <section id="projects">
      <h2>Projects</h2>
      <div class="cards">
        <!-- three cards: image, title, description, link -->
      </div>
    </section>

    <section id="skills">
      <h2>Skills</h2>
      <div class="pills">
        <!-- skill pills, one highlighted -->
      </div>
    </section>

    <section id="contact">
      <h2>Contact</h2>
      <form class="contact-form">
        <label for="name">Name</label>
        <input id="name" type="text" placeholder="Your name" />
        <label for="email">Email</label>
        <input id="email" type="email" placeholder="you@example.com" />
        <label for="message">Message</label>
        <textarea id="message" rows="4" placeholder="Hi Alex!"></textarea>
        <button type="submit">Send</button>
      </form>
    </section>

    <footer>
      <p>&copy; 2026 Alex · built with pure HTML + CSS</p>
    </footer>
  </body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Alex — Portfolio</title>
    <style>
      * {
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        background-color: #f8fafc;
        color: #0f172a;
      }

      section {
        padding: 72px 24px;
      }

      section h2 {
        text-align: center;
        font-size: 30px;
        margin-bottom: 32px;
      }

      /* ---------- Navbar ---------- */
      .navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 28px;
        background-color: #0f172a;
        z-index: 100;
      }

      .logo {
        color: #ffffff;
        font-weight: 700;
        font-size: 20px;
      }

      .links {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .links a {
        color: #cbd5e1;
        text-decoration: none;
        padding: 8px 14px;
        border-radius: 8px;
        transition: background-color 0.15s ease, color 0.15s ease;
      }

      .links a:hover {
        color: #ffffff;
        background-color: #1e293b;
      }

      .links a.active {
        background-color: #0d9488;
        color: #ffffff;
      }

      /* ---------- Hero ---------- */
      .hero {
        min-height: 420px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        background: linear-gradient(135deg, #0f172a, #134e4a 120%);
        color: #ffffff;
        padding-top: 110px;
      }

      .avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        border: 4px solid rgba(255, 255, 255, 0.2);
        object-fit: cover;
        margin-bottom: 20px;
      }

      .hero h1 {
        font-size: 36px;
        margin: 0;
      }

      .hero p {
        color: #cbd5e1;
        font-size: 17px;
        max-width: 480px;
      }

      .actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 12px;
      }

      .btn {
        display: inline-block;
        padding: 11px 26px;
        border-radius: 9999px;
        text-decoration: none;
        font-weight: 600;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      .btn.primary {
        background-color: #0d9488;
        color: #ffffff;
      }

      .btn.primary:hover {
        background-color: #14b8a6;
      }

      .btn.outline {
        border: 1px solid #64748b;
        color: #e2e8f0;
      }

      .btn.outline:hover {
        background-color: rgba(255, 255, 255, 0.08);
      }

      /* ---------- Projects ---------- */
      .cards {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        justify-content: center;
        max-width: 960px;
        margin: 0 auto;
      }

      .card {
        flex: 1;
        min-width: 240px;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.14);
      }

      .card img {
        display: block;
        max-width: 100%;
        border-radius: 8px;
      }

      .card h3 {
        margin: 12px 0 6px;
      }

      .card p {
        color: #64748b;
        font-size: 14px;
        margin: 0 0 12px;
      }

      .card a {
        color: #0d9488;
        font-weight: 600;
        text-decoration: none;
      }

      .card a:hover {
        text-decoration: underline;
      }

      /* ---------- Skills ---------- */
      .pills {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        max-width: 640px;
        margin: 0 auto;
      }

      .pill {
        background-color: #e2e8f0;
        color: #334155;
        border-radius: 9999px;
        padding: 8px 20px;
        font-size: 15px;
      }

      .pill.accent {
        background-color: #0d9488;
        color: #ffffff;
        font-weight: 700;
      }

      /* ---------- Contact ---------- */
      .contact-form {
        max-width: 420px;
        margin: 0 auto;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .contact-form label {
        font-size: 14px;
        font-weight: 600;
        margin-top: 8px;
      }

      .contact-form input,
      .contact-form textarea {
        padding: 10px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 15px;
        font-family: inherit;
        transition: border-color 0.15s ease;
      }

      .contact-form input:focus,
      .contact-form textarea:focus {
        outline: none;
        border-color: #0d9488;
      }

      .contact-form button {
        margin-top: 16px;
        background-color: #0d9488;
        color: #ffffff;
        border: none;
        border-radius: 9999px;
        padding: 12px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .contact-form button:hover {
        background-color: #0f766e;
      }

      /* ---------- Footer ---------- */
      footer {
        background-color: #0f172a;
        color: #94a3b8;
        text-align: center;
        padding: 24px;
        font-size: 14px;
      }

      @media (max-width: 560px) {
        .navbar {
          flex-direction: column;
          gap: 8px;
        }
        .hero {
          padding-top: 140px;
        }
      }
    </style>
  </head>
  <body>
    <nav class="navbar">
      <div class="logo">Alex.</div>
      <div class="links">
        <a class="active" href="#hero">Home</a>
        <a href="#projects">Projects</a>
        <a href="#skills">Skills</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>

    <section id="hero" class="hero">
      <img
        class="avatar"
        src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg"
        alt="Portrait of Alex"
        width="120"
      />
      <h1>Hi, I'm Alex, a frontend learner</h1>
      <p>I build small, polished web UIs and write about everything I learn.</p>
      <div class="actions">
        <a class="btn primary" href="#projects">See my work</a>
        <a class="btn outline" href="#contact">Say hi</a>
      </div>
    </section>

    <section id="projects">
      <h2>Projects</h2>
      <div class="cards">
        <article class="card">
          <img
            src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/cats.jpg"
            alt="Thumbnail of CatWeather project"
            width="240"
          />
          <h3>CatWeather</h3>
          <p>A purrcast app dashboard with semantic HTML.</p>
          <a href="#">View project</a>
        </article>
        <article class="card">
          <img
            src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/cats-2.jpg"
            alt="Thumbnail of RecipeBook project"
            width="240"
          />
          <h3>RecipeBook</h3>
          <p>My recipe collection with nested lists and tables.</p>
          <a href="#">View project</a>
        </article>
        <article class="card">
          <img
            src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg"
            alt="Thumbnail of TinyShop project"
            width="240"
          />
          <h3>TinyShop</h3>
          <p>A storefront concept built on a solid grid.</p>
          <a href="#">View project</a>
        </article>
      </div>
    </section>

    <section id="skills">
      <h2>Skills</h2>
      <div class="pills">
        <span class="pill accent">HTML</span>
        <span class="pill">CSS</span>
        <span class="pill">Responsive design</span>
        <span class="pill">Git basics</span>
        <span class="pill">JavaScript (soon)</span>
      </div>
    </section>

    <section id="contact">
      <h2>Contact</h2>
      <form class="contact-form">
        <label for="name">Name</label>
        <input id="name" type="text" placeholder="Your name" />
        <label for="email">Email</label>
        <input id="email" type="email" placeholder="you@example.com" />
        <label for="message">Message</label>
        <textarea id="message" rows="4" placeholder="Hi Alex!"></textarea>
        <button type="submit">Send</button>
      </form>
    </section>

    <footer>
      <p>&copy; 2026 Alex · built with pure HTML + CSS</p>
    </footer>
  </body>
</html>`,
      },
      points_reward: 25,
    },
  ],
};
