import type { CourseData } from "./types";

export const jsCourse: CourseData = {
  title: "JavaScript for Absolute Beginners",
  description:
    "Learn JavaScript from scratch — variables, functions, loops, objects, DOM, and events. The language that makes websites interactive.",
  icon: "⚡",
  difficulty: "Beginner",
  category: "Frontend",
  order_index: 3,
  chapters: [
    {
      title: "What is JavaScript? Your First Code",
      content: {
        instructions: `JavaScript is the programming language of the web. It turns static HTML pages into interactive experiences. Think of it like giving instructions to a robot — you tell it exactly what to do, and it follows step by step.

console.log() is your window into what your code is doing. It prints values to the browser's console (like a message log). Every programmer uses it constantly to check their work and debug problems.

Your task: write code that prints "Hello, World!" to the console. This is the traditional first step in learning any programming language.`,
        initialCode: `// Use console.log() to print a message
// Example: console.log("Your message here");

console.log(); // <- put "Hello, World!" inside the parentheses`,
        solution: `console.log("Hello, World!");`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Variables and Data Types",
      content: {
        instructions: `Variables are like labeled boxes where you store information. In JavaScript, you use 'let' for values that can change and 'const' for values that stay the same. The main data types are strings (text in quotes), numbers (integers and decimals), and booleans (true/false).

Think of 'let' as a whiteboard you can erase and rewrite, and 'const' as a permanent marker engraving. Choose wisely based on whether the value needs to change later.

Your task: create a constant with your name, a let variable with your age, and a boolean for whether you're learning JavaScript. Then log all three.`,
        initialCode: `// Create variables using let (changeable) and const (unchangeable)
// String: wrapped in quotes like "hello"
// Number: just the digits like 42
// Boolean: true or false

const name = "";       // put your name in quotes
let age = 0;           // put your age as a number
let isLearning = ;     // set this to true or false

console.log("Name:", name);
console.log("Age:", age);
console.log("Learning JS:", isLearning);`,
        solution: `const name = "Alex";
let age = 25;
let isLearning = true;

console.log("Name:", name);
console.log("Age:", age);
console.log("Learning JS:", isLearning);`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Operators and Conditionals",
      content: {
        instructions: `Operators let you do math (+, -, *, /) and compare values (===, >, <, >=, <=). Conditionals (if/else) let your code make decisions — like a fork in the road. JavaScript checks whether a condition is true and runs the matching block.

Logical operators (&& for AND, || for OR, ! for NOT) let you combine multiple conditions. It's like asking "is it sunny AND warm?" before deciding to go outside.

Your task: write a program that checks if a number is positive, negative, or zero. Use comparison operators and if/else if/else.`,
        initialCode: `// Comparison operators: === (equal), > (greater), < (less)
// if-else structure:
// if (condition) { ... } else if (condition) { ... } else { ... }

let number = 7;

// Write an if-else chain to check if the number is positive, negative, or zero
if () {
  console.log("Positive");
}  else if () {
  console.log("Negative");
}  else {
  console.log("Zero");
}`,
        solution: `let number = 7;

if (number > 0) {
  console.log("Positive");
} else if (number < 0) {
  console.log("Negative");
} else {
  console.log("Zero");
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Loops",
      content: {
        instructions: `Loops let you repeat code without writing it over and over. A 'for' loop is great when you know how many times to repeat — like counting to 10. A 'while' loop runs as long as a condition is true — like "keep stirring until the soup is hot."

The classic for loop has three parts: a starting variable (let i = 0), a condition (i < 5), and an increment (i++). The loop runs the code block, then increments i, then checks the condition again.

Your task: write a for loop that prints numbers from 1 to 10. Then write a while loop that counts down from 5 to 1.`,
        initialCode: `// For loop: for (start; condition; increment) { ... }
// While loop: while (condition) { ... }
// i++ means "add 1 to i"

// For loop — count up from 1 to 10
for () {
  console.log(i);
}

console.log("--- Countdown ---");

// While loop — count down from 5 to 1
let count = 5;
while () {
  console.log(count);
  count--; // subtract 1
}`,
        solution: `for (let i = 1; i <= 10; i++) {
  console.log(i);
}

console.log("--- Countdown ---");

let count = 5;
while (count >= 1) {
  console.log(count);
  count--;
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Functions",
      content: {
        instructions: `Functions are reusable blocks of code — like a recipe you can use again and again. You define a function once with 'function' or with an arrow function (=>), then "call" it whenever you need it.

Functions can take parameters (inputs in the parentheses) and return a value (output). Think of it like a vending machine: you put in money and a selection (parameters), and it gives you a snack (return value).

Your task: write a function called 'greet' that takes a name parameter and returns a greeting string. Then write an arrow function that adds two numbers.`,
        initialCode: `// Function definition: function name(param1, param2) { return ...; }
// Arrow function: const name = (param) => { return ...; }

// TODO: Write a function called greet that takes a name and returns "Hello, [name]!"
function greet(name) {
  // return a greeting string
}

console.log(greet("Alice")); // should print "Hello, Alice!"

// TODO: Write an arrow function called add that takes two numbers and returns their sum
const add = (a, b) => {
  // return the sum
};

console.log(add(3, 7)); // should print 10`,
        solution: `function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("Alice"));

const add = (a, b) => {
  return a + b;
};

console.log(add(3, 7));`,
        type: "console",
      },
      points_reward: 15,
    },
    {
      title: "Arrays",
      content: {
        instructions: `Arrays are ordered lists of data, written with square brackets: [ ]. You can store any type — numbers, strings, even other arrays. Each item has an index starting at 0 (the first item is at position 0).

push() adds an item to the end of an array, pop() removes the last item. You can loop through an array with a for loop or the handy forEach() method.

Your task: create an array of your three favorite foods. Use push() to add one more. Loop through the array and print each item with its position number.`,
        initialCode: `// Array: const arr = [item1, item2, item3];
// push() adds to the end: arr.push(newItem);
// Loop through with for or .forEach()

const favoriteFoods = ["Pizza", "Sushi", "Tacos"]; // feel free to change these

// Add one more food using push()


// Loop through and print each item with its index
// Desired output: "1. Pizza", "2. Sushi", etc.
for () {
  // print index+1 and the food
}`,
        solution: `const favoriteFoods = ["Pizza", "Sushi", "Tacos"];

favoriteFoods.push("Pasta");

for (let i = 0; i < favoriteFoods.length; i++) {
  console.log((i + 1) + ". " + favoriteFoods[i]);
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Objects",
      content: {
        instructions: `Objects store data in key-value pairs using curly braces: { }. Think of an object like a person's profile — they have a name, age, city, etc. Each piece of info is a "property" with a label (key) and a value.

You can also put functions inside objects — those are called "methods". Objects can even contain other objects or arrays, making them super flexible for real-world data.

Your task: create a 'person' object with name, age, city, and a hobbies array. Add a method called 'introduce' that returns a sentence introducing the person.`,
        initialCode: `// Object: const obj = { key: value, key2: value2 };
// Access: obj.key or obj["key"]
// Method: a function stored as a property

const person = {
  name: "",     // your name
  age: 0,       // your age
  city: "",     // your city
  hobbies: [],  // array of hobbies
  introduce: function() {
    // return "Hi, I'm [name] from [city]"
  }
};

// Call the method and log the result
console.log(person.introduce());
console.log(person.name + "'s hobbies:", person.hobbies);`,
        solution: `const person = {
  name: "Maya",
  age: 28,
  city: "Portland",
  hobbies: ["reading", "hiking", "coding"],
  introduce: function() {
    return "Hi, I'm " + this.name + " from " + this.city;
  }
};

console.log(person.introduce());
console.log(person.name + "'s hobbies:", person.hobbies);`,
        type: "console",
      },
      points_reward: 15,
    },
    {
      title: "DOM & Events Introduction",
      content: {
        instructions: `The DOM (Document Object Model) is JavaScript's way of talking to your HTML page. With document.querySelector() you can grab any element from the page, and properties like .textContent let you change what's inside it.

Events let your code respond when users interact — clicking a button, typing in a field, moving their mouse. addEventListener() is how you say "when this thing happens, run this function."

Your task: select the page's <h1> element and change its text. Then find a button (or create one in your mind) and log a message when it's "clicked." Since this runs in the console, we'll simulate by selecting an element and listening.`,
        initialCode: `// document.querySelector("selector") - gets the first matching element
// element.textContent = "new text" - changes the text inside
// element.addEventListener("click", function) - runs code on click

// Select the h1 element and change its text
// Try changing it to something fun!

console.log("DOM manipulation ready!");

// If there's a button on the page, this would work:
// const btn = document.querySelector("button");
// btn.addEventListener("click", () => {
//   console.log("Button was clicked!");
// });`,
        solution: `const heading = document.querySelector("h1");
if (heading) {
  heading.textContent = "JavaScript is awesome!";
}

console.log("DOM manipulation ready!");

const btn = document.querySelector("button");
if (btn) {
  btn.addEventListener("click", () => {
    console.log("Button was clicked!");
  });
}`,
        type: "console",
      },
      points_reward: 15,
    },
  ],
};
