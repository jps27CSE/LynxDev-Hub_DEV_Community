import type { CourseData } from "./types";

export const htmlCourse: CourseData = {
  title: "HTML for Absolute Beginners",
  description: "Learn HTML from scratch — the language that structures every website. No prior experience needed. Live browser preview included.",
  icon: "🌐",
  difficulty: "Beginner",
  category: "Frontend",
  order_index: 1,
  chapters: [
    {
      title: "What is HTML? Your First Webpage",
      content: {
        type: "browser",
        instructions: `<p>HTML (HyperText Markup Language) is the skeleton of every webpage. Think of it like a blueprint for a house — it defines where the walls, roof, and doors go. The browser reads your HTML and displays it as a visual page.</p><p>Every HTML document starts with a <code>&lt;!DOCTYPE html&gt;</code> declaration and uses <strong>tags</strong> like <code>&lt;h1&gt;</code> for headings and <code>&lt;p&gt;</code> for paragraphs. Tags usually come in pairs: an opening tag <code>&lt;h1&gt;</code> and a closing tag <code>&lt;/h1&gt;</code>.</p><p><strong>Your task:</strong> Look at the example below. Try changing the text inside the <code>&lt;h1&gt;</code> and <code>&lt;p&gt;</code> tags to say something about yourself, then see the result in the preview panel.</p>`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My First Page</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>This is my first webpage.</p>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My First Page</title>
</head>
<body>
  <h1>Hi, I'm Alex!</h1>
  <p>I'm learning HTML and this is my very first webpage.</p>
</body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "Headings and Paragraphs",
      content: {
        type: "browser",
        instructions: `<p>HTML provides six levels of headings — <code>&lt;h1&gt;</code> through <code>&lt;h6&gt;</code>. Think of them like a book's chapter structure: <code>&lt;h1&gt;</code> is the main title, <code>&lt;h2&gt;</code> is a section heading, <code>&lt;h3&gt;</code> a subsection, and so on. Headings help readers (and search engines) understand the hierarchy of your content.</p><p>Paragraphs use the <code>&lt;p&gt;</code> tag. Browsers automatically add space before and after each paragraph. You can have multiple paragraphs to break up your text into readable chunks.</p><p><strong>Your task:</strong> The page below is missing headings. Add an <code>&lt;h1&gt;</code> for the main title and <code>&lt;h2&gt;</code> tags for each section heading to create a well-structured page.</p>`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Headings Demo</title>
</head>
<body>
  <!-- Add an h1 main title here -->

  <p>Welcome to my website about cats.</p>

  <!-- Add an h2 section heading here -->

  <p>Cats are amazing animals. They have been domesticated for thousands of years and make wonderful companions.</p>

  <!-- Add another h2 here -->

  <p>There are over 70 different cat breeds worldwide, from the hairless Sphynx to the fluffy Maine Coon.</p>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Headings Demo</title>
</head>
<body>
  <h1>All About Cats</h1>

  <p>Welcome to my website about cats.</p>

  <h2>Why Cats Are Great</h2>

  <p>Cats are amazing animals. They have been domesticated for thousands of years and make wonderful companions.</p>

  <h2>Cat Breeds</h2>

  <p>There are over 70 different cat breeds worldwide, from the hairless Sphynx to the fluffy Maine Coon.</p>
</body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "Text Formatting & Lists",
      content: {
        type: "browser",
        instructions: `<p>HTML lets you emphasize text with <code>&lt;strong&gt;</code> (bold) and <code>&lt;em&gt;</code> (italic). Use <code>&lt;strong&gt;</code> for important words and <code>&lt;em&gt;</code> for stress or emphasis. You can also use <code>&lt;br&gt;</code> to insert a line break.</p><p>Lists come in two flavors: <strong>unordered</strong> (<code>&lt;ul&gt;</code>) with bullet points, and <strong>ordered</strong> (<code>&lt;ol&gt;</code>) with numbers. Each item inside a list uses the <code>&lt;li&gt;</code> tag. Lists are perfect for steps, ingredients, features, or any group of related items.</p><p><strong>Your task:</strong> The initial code has a plain list. Add <code>&lt;strong&gt;</code> to the important words and convert the items into a proper <code>&lt;ul&gt;</code> or <code>&lt;ol&gt;</code>.</p>`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lists & Formatting</title>
</head>
<body>
  <h1>My Morning Routine</h1>

  <p>Here are the steps I follow every morning to start my day right:</p>

  Wake up
  Brush teeth
  Eat breakfast
  Check emails
  Start coding

  <p>Remember: staying consistent is the key to building good habits.</p>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lists & Formatting</title>
</head>
<body>
  <h1>My Morning Routine</h1>

  <p>Here are the steps I follow every morning to start my day <strong>right</strong>:</p>

  <ol>
    <li>Wake up</li>
    <li>Brush <em>teeth</em></li>
    <li>Eat breakfast</li>
    <li>Check emails</li>
    <li>Start coding</li>
  </ol>

  <p>Remember: staying <strong>consistent</strong> is the <em>key</em> to building good habits.</p>
</body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "Links and Images",
      content: {
        type: "browser",
        instructions: `<p>What makes the web a "web" is links! The <code>&lt;a&gt;</code> tag (anchor) creates hyperlinks to other pages. Use the <code>href</code> attribute to set the destination: <code>&lt;a href="https://example.com"&gt;click here&lt;/a&gt;</code>. Add <code>target="_blank"</code> to open the link in a new tab.</p><p>Images are added with the <code>&lt;img&gt;</code> tag, which is self-closing. The <code>src</code> attribute points to the image file, and <code>alt</code> provides text for screen readers and when the image fails to load: <code>&lt;img src="photo.jpg" alt="A sunny beach"&gt;</code>.</p><p><strong>Your task:</strong> The page has placeholder content. Add a real link to your favorite website and an image using a public image URL from the web (try searching for a free image URL or use picsum.photos).</p>`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Links & Images</title>
</head>
<body>
  <h1>My Favorite Things</h1>

  <h2>My Favorite Website</h2>
  <!-- Add a link here -->

  <h2>A Cool Image</h2>
  <!-- Add an image here -->

</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Links & Images</title>
</head>
<body>
  <h1>My Favorite Things</h1>

  <h2>My Favorite Website</h2>
  <p>Check out <a href="https://en.wikipedia.org" target="_blank">Wikipedia</a> — the free encyclopedia.</p>

  <h2>A Cool Image</h2>
  <img src="https://picsum.photos/400/300" alt="A randomly generated scenic photo" width="400" height="300">

</body>
</html>`,
      },
      points_reward: 10,
    },
    {
      title: "Tables and Forms",
      content: {
        type: "browser",
        instructions: `<p>Tables organize data into rows and columns. Use <code>&lt;table&gt;</code> as the container, <code>&lt;tr&gt;</code> for each row, <code>&lt;th&gt;</code> for header cells, and <code>&lt;td&gt;</code> for data cells. A <code>&lt;caption&gt;</code> gives your table a title.</p><p>Forms collect user input. The <code>&lt;form&gt;</code> tag wraps everything. Inside, use <code>&lt;input&gt;</code> for text fields, buttons, and checkboxes. Each input needs a <code>type</code> attribute (like <code>"text"</code>, <code>"email"</code>, or <code>"submit"</code>) and a <code>name</code> attribute. Pair inputs with <code>&lt;label&gt;</code> tags for accessibility.</p><p><strong>Your task:</strong> The page has a basic table and a form. Add a new row to the table with your own data, and add a "phone" input field to the form.</p>`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tables & Forms</title>
</head>
<body>
  <h1>Team Members</h1>

  <table border="1">
    <caption>Project Team</caption>
    <tr>
      <th>Name</th>
      <th>Role</th>
    </tr>
    <tr>
      <td>Alice</td>
      <td>Designer</td>
    </tr>
    <tr>
      <td>Bob</td>
      <td>Developer</td>
    </tr>
  </table>

  <h2>Contact Form</h2>
  <form>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name"><br><br>

    <label for="email">Email:</label>
    <input type="email" id="email" name="email"><br><br>

    <input type="submit" value="Send">
  </form>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tables & Forms</title>
</head>
<body>
  <h1>Team Members</h1>

  <table border="1">
    <caption>Project Team</caption>
    <tr>
      <th>Name</th>
      <th>Role</th>
    </tr>
    <tr>
      <td>Alice</td>
      <td>Designer</td>
    </tr>
    <tr>
      <td>Bob</td>
      <td>Developer</td>
    </tr>
    <tr>
      <td>Charlie</td>
      <td>Tester</td>
    </tr>
  </table>

  <h2>Contact Form</h2>
  <form>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name"><br><br>

    <label for="email">Email:</label>
    <input type="email" id="email" name="email"><br><br>

    <label for="phone">Phone:</label>
    <input type="tel" id="phone" name="phone"><br><br>

    <input type="submit" value="Send">
  </form>
</body>
</html>`,
      },
      points_reward: 15,
    },
    {
      title: "Semantic HTML & Divs",
      content: {
        type: "browser",
        instructions: `<p>Semantic HTML means using tags that describe their meaning — like <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;article&gt;</code>, and <code>&lt;footer&gt;</code>. These give structure and meaning to your page, helping search engines and assistive technologies understand your content.</p><p>The <code>&lt;div&gt;</code> tag is a generic container for grouping elements, while <code>&lt;span&gt;</code> is an inline container for styling small pieces of text. Use semantic tags when possible and reserve <code>&lt;div&gt;</code> for when no semantic tag fits.</p><p><strong>Your task:</strong> The starter code uses only <code>&lt;div&gt;</code> tags. Replace them with proper semantic tags (<code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;footer&gt;</code>) to make the page more meaningful.</p>`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Semantic HTML</title>
</head>
<body>
  <div>
    <h1>My Blog</h1>
    <p>Welcome to my corner of the web.</p>
  </div>

  <div>
    <div>
      <h2>First Post</h2>
      <p>This is my first blog post. I'm excited to share my journey learning web development.</p>
    </div>
    <div>
      <h2>Another Post</h2>
      <p>Today I learned about semantic HTML. It makes websites more accessible and easier to read.</p>
    </div>
  </div>

  <div>
    <p>&copy; 2026 My Blog</p>
  </div>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Semantic HTML</title>
</head>
<body>
  <header>
    <h1>My Blog</h1>
    <p>Welcome to my corner of the web.</p>
  </header>

  <main>
    <section>
      <h2>First Post</h2>
      <p>This is my first blog post. I'm excited to share my journey learning web development.</p>
    </section>
    <section>
      <h2>Another Post</h2>
      <p>Today I learned about semantic HTML. It makes websites more accessible and easier to read.</p>
    </section>
  </main>

  <footer>
    <p>&copy; 2026 My Blog</p>
  </footer>
</body>
</html>`,
      },
      points_reward: 15,
    },
  ],
};
