import type { CourseData } from "./types";

export const cssCourse: CourseData = {
  title: "CSS for Absolute Beginners",
  description:
    "Learn CSS from scratch — make websites beautiful with colors, layouts, and animations. Live browser preview included.",
  icon: "🎨",
  difficulty: "Beginner",
  category: "Frontend",
  order_index: 2,
  chapters: [
    {
      title: "What is CSS? Your First Styles",
      content: {
        instructions: `CSS stands for Cascading Style Sheets — think of it as the "clothing" for your HTML. If HTML is the skeleton of a webpage, CSS is what makes it look good: colors, sizes, spacing, and layout.

There are three ways to add CSS: inline (inside a tag's style attribute), internal (inside a <style> tag in the head), and external (a separate .css file). In this course we'll use internal CSS so you can see everything in one place.

Try changing the color of the h1 to "blue" and the font-size of the paragraph to "18px".`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>My First CSS</title>
  <style>
    h1 {
      color: red;
    }
    p {
      font-size: 16px;
    }
  </style>
</head>
<body>
  <h1>Hello, CSS!</h1>
  <p>This is a paragraph with some text.</p>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>My First CSS</title>
  <style>
    h1 {
      color: blue;
    }
    p {
      font-size: 18px;
    }
  </style>
</head>
<body>
  <h1>Hello, CSS!</h1>
  <p>This is a paragraph with some text.</p>
</body>
</html>`,
        type: "browser",
      },
      points_reward: 10,
    },
    {
      title: "Colors, Backgrounds & Fonts",
      content: {
        instructions: `Colors bring your page to life. You can set text color with "color" and background color with "background-color". CSS supports named colors (like "tomato"), hex codes (like "#ff6347"), and rgb values.

Fonts control how your text looks. "font-family" sets the typeface, "font-size" controls size, and "font-weight" makes text bold or light. You can also use "text-align" to center or left-align text.

Try giving the body a background-color of "lightblue", make the heading color "darkblue", and change the font-family of the paragraph to "Arial".`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Colors & Fonts</title>
  <style>
    body {
      background-color: white;
    }
    h1 {
      color: black;
      text-align: center;
    }
    p {
      font-size: 16px;
    }
  </style>
</head>
<body>
  <h1>Welcome!</h1>
  <p>This page needs some color and style.</p>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Colors & Fonts</title>
  <style>
    body {
      background-color: lightblue;
    }
    h1 {
      color: darkblue;
      text-align: center;
    }
    p {
      font-family: Arial;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <h1>Welcome!</h1>
  <p>This page needs some color and style.</p>
</body>
</html>`,
        type: "browser",
      },
      points_reward: 10,
    },
    {
      title: "The Box Model",
      content: {
        instructions: `Every HTML element is a rectangular box. The box model is made of four layers: content (the innermost part), padding (space inside the border), border (the edge), and margin (space outside the border).

Think of it like a framed picture: the photo is the content, the mat board is padding, the frame is the border, and the wall space around it is the margin.

Give the div a padding of "20px", a border of "2px solid black", and a margin of "10px". Then set its width to "300px".`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Box Model</title>
  <style>
    div {
      background-color: lightgray;
    }
  </style>
</head>
<body>
  <div>This is a box. Notice how it hugs the content tightly. Add some padding and margin to give it breathing room.</div>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Box Model</title>
  <style>
    div {
      background-color: lightgray;
      padding: 20px;
      border: 2px solid black;
      margin: 10px;
      width: 300px;
    }
  </style>
</head>
<body>
  <div>This is a box. Notice how it hugs the content tightly. Add some padding and margin to give it breathing room.</div>
</body>
</html>`,
        type: "browser",
      },
      points_reward: 10,
    },
    {
      title: "Selectors and Classes",
      content: {
        instructions: `Selectors tell CSS which HTML elements to style. The most common selectors are: element selectors (like "p" targets all paragraphs), class selectors (like ".my-class" targets elements with that class), and ID selectors (like "#my-id" targets a unique element).

Classes are reusable — you can apply the same class to many elements. IDs should be unique per page. In CSS, classes start with a dot (.) and IDs start with a hash (#).

Add a class called "highlight" with a yellow background, and apply it to the first paragraph. Then target the second paragraph with an ID "special" and give it a blue border.`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Selectors</title>
  <style>
    p {
      padding: 10px;
      margin: 5px;
    }
  </style>
</head>
<body>
  <p>This paragraph should be highlighted.</p>
  <p>This paragraph should have a blue border.</p>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Selectors</title>
  <style>
    p {
      padding: 10px;
      margin: 5px;
    }
    .highlight {
      background-color: yellow;
    }
    #special {
      border: 2px solid blue;
    }
  </style>
</head>
<body>
  <p class="highlight">This paragraph should be highlighted.</p>
  <p id="special">This paragraph should have a blue border.</p>
</body>
</html>`,
        type: "browser",
      },
      points_reward: 10,
    },
    {
      title: "Flexbox Layout",
      content: {
        instructions: `Flexbox is a layout tool that makes arranging items easy. Set "display: flex" on a container, and its children line up in a row. You can control alignment in both directions.

Think of flexbox like items on a store shelf: "justify-content" spreads them horizontally (like aligning left, center, or spacing evenly), and "align-items" positions them vertically (top, middle, bottom). "gap" adds space between items.

Make the container a flexbox with "justify-content: center", "align-items: center", and "gap: 20px". Also give each box a width of "100px" and height of "100px".`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Flexbox</title>
  <style>
    .container {
      border: 2px solid #ccc;
      min-height: 200px;
      padding: 10px;
    }
    .box {
      background-color: #3498db;
      color: white;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="box">1</div>
    <div class="box">2</div>
    <div class="box">3</div>
  </div>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Flexbox</title>
  <style>
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      border: 2px solid #ccc;
      min-height: 200px;
      padding: 10px;
    }
    .box {
      background-color: #3498db;
      color: white;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="box">1</div>
    <div class="box">2</div>
    <div class="box">3</div>
  </div>
</body>
</html>`,
        type: "browser",
      },
      points_reward: 15,
    },
    {
      title: "Responsive Design Basics",
      content: {
        instructions: `Responsive design makes your website look good on phones, tablets, and desktops. The key tool is "media queries" — they let you apply different CSS rules based on the screen width.

Think of it like a water bottle that changes shape: on a big screen, your layout can spread out; on a small screen, it stacks vertically. The "@media (max-width: 600px)" rule targets screens smaller than 600px wide.

Add a media query that changes the flexbox direction to "column" when the screen is 600px or narrower. Also reduce the body font-size to "14px" for small screens.`,
        initialCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Responsive Design</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial;
      margin: 20px;
    }
    .container {
      display: flex;
      gap: 10px;
    }
    .card {
      background-color: #f0f0f0;
      padding: 20px;
      border-radius: 8px;
      flex: 1;
    }
    h1 {
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>Responsive Cards</h1>
  <div class="container">
    <div class="card">Card 1</div>
    <div class="card">Card 2</div>
    <div class="card">Card 3</div>
  </div>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Responsive Design</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial;
      margin: 20px;
    }
    .container {
      display: flex;
      gap: 10px;
    }
    .card {
      background-color: #f0f0f0;
      padding: 20px;
      border-radius: 8px;
      flex: 1;
    }
    h1 {
      text-align: center;
    }
    @media (max-width: 600px) {
      body {
        font-size: 14px;
      }
      .container {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <h1>Responsive Cards</h1>
  <div class="container">
    <div class="card">Card 1</div>
    <div class="card">Card 2</div>
    <div class="card">Card 3</div>
  </div>
</body>
</html>`,
        type: "browser",
      },
      points_reward: 15,
    },
  ],
};
