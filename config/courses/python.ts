import type { CourseData } from "./types";

export const pythonCourse: CourseData = {
  title: "Python for Absolute Beginners",
  description: "Learn Python from scratch — the most beginner-friendly language. Used for web dev, data science, AI, and automation.",
  icon: "🐍",
  difficulty: "Beginner",
  category: "Programming",
  order_index: 8,
  chapters: [
    {
      title: "Python Basics — Your First Program",
      content: {
        instructions: `Python is designed to be readable and beginner-friendly. Unlike Java or C#, it uses indentation (spaces) instead of curly braces to define blocks of code. No semicolons needed — just write your code and Python understands it.

print() is Python's built-in function for output. It's like shouting a message to the console. Python runs line by line, top to bottom, so the order of your code matters.

Your task: write a single line of Python that prints "Hello, World!" to the console. This is the traditional first program and a great way to verify everything is working.`,
        initialCode: `# Use print() to display text
# In Python, strings can use single or double quotes
# Example: print("Hello") or print('Hello')

print()`,
        solution: `print("Hello, World!")`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Variables and Data Types",
      content: {
        instructions: `Python is dynamically-typed — you don't need to declare a type. Just assign a value and Python figures it out. The main types are int (whole numbers), float (decimals), str (text), and bool (True/False). Note the capital T and F for booleans.

Use type() to check what type a variable is. It's like a label on a box that tells you what's inside. Variable names should be descriptive and use snake_case (words separated by underscores).

Your task: create a variable for your name (string), age (int), height (float), and whether you're a student (bool). Print each variable and its type using type().`,
        initialCode: `# Python is dynamically typed — just assign a value
# String: "text" or 'text'
# int: whole number (no quotes)
# float: decimal number
# bool: True or False (capital letters!)
# Use type() to check the type: type(variable)

name = ""    # your name
age = 0      # your age as an int
height = 0.0 # your height as a float
is_student = # True or False

print("Name:", name, "| Type:", type(name))
print("Age:", age, "| Type:", type(age))
print("Height:", height, "| Type:", type(height))
print("Student:", is_student, "| Type:", type(is_student))`,
        solution: `name = "Alice"
age = 25
height = 1.68
is_student = True

print("Name:", name, "| Type:", type(name))
print("Age:", age, "| Type:", type(age))
print("Height:", height, "| Type:", type(height))
print("Student:", is_student, "| Type:", type(is_student))`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Strings and Input",
      content: {
        instructions: `Strings in Python are packed with useful methods. .upper(), .lower(), .strip(), .replace(), and .split() let you manipulate text easily. You can also check length with len() and access characters with [index] (starting at 0).

f-strings (f"...") let you embed variables directly inside curly braces — no messy concatenation needed. input() reads user input from the console as a string. Combine these to create interactive programs.

Your task: ask the user for their first and last name using input(). Combine them into a full name, then print the following using f-strings: the name in uppercase, its length, and a greeting.`,
        initialCode: `# input() gets text from the user
# len() gives the length of a string
# .upper() makes everything uppercase
# f-strings: f"Hello {name}" embeds variables

# Ask for first name
first = input("Enter your first name: ")

# Ask for last name
last = input("Enter your last name: ")

# Combine into full name with a space between
full_name = # combine first + " " + last

# Print with f-strings:
# "Hello, FULL_NAME! Your name has N letters."
# (use .upper() on the name)
print()`,
        solution: `first = input("Enter your first name: ")
last = input("Enter your last name: ")

full_name = first + " " + last

print(f"Hello, {full_name.upper()}! Your name has {len(full_name)} letters.")`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Conditionals",
      content: {
        instructions: `Python uses 'if', 'elif' (short for else if), and 'else' for decision-making. The condition is followed by a colon, and the indented block underneath runs if the condition is True. Unlike other languages, no parentheses are needed around conditions.

Comparison operators include == (equal), != (not equal), >, <, >=, <=. The 'in' keyword checks if something is inside a collection — like checking if a book is in your backpack.

Your task: ask the user for a number. Check if it's positive, negative, or zero using if-elif-else. Also use 'in' to check if the number is in a list of lucky numbers [7, 13, 21] and print a special message if so.`,
        initialCode: `# if condition:
#     indented code runs if True
# elif other_condition:
#     runs if first was False but this is True
# else:
#     runs if all above were False
# in keyword: value in collection -> True/False

number = int(input("Enter a number: "))

# Check positive / negative / zero
if number > 0:
    print("Positive")
# add elif for negative
# add else for zero

# Lucky numbers check
lucky_numbers = [7, 13, 21]
# Use 'in' to check if number is in lucky_numbers
# If so, print "That's a lucky number!"
if :
    print("That's a lucky number!")`,
        solution: `number = int(input("Enter a number: "))

if number > 0:
    print("Positive")
elif number < 0:
    print("Negative")
else:
    print("Zero")

lucky_numbers = [7, 13, 21]
if number in lucky_numbers:
    print("That's a lucky number!")`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Loops and Lists",
      content: {
        instructions: `Loops in Python come in two flavors. 'for' loops iterate over a sequence (like a list or a range of numbers). 'while' loops repeat as long as a condition is True. range(start, stop, step) generates a sequence of numbers — perfect for counting.

Lists are Python's most versatile collection. They're created with square brackets [], can hold any types, and have handy methods like .append(), .remove(), .sort(), and .pop(). len() gives the count of items.

Your task: create a list of 5 numbers. Use a for loop to print each number. Then use a while loop to count down from 5 to 1. Finally, use range() in a for loop to print only the even numbers from 2 to 10.`,
        initialCode: `# Lists: numbers = [1, 2, 3]
# for item in list: iterates over each item
# range(start, stop, step): generates numbers
# while condition: loops while True
# .append(item): adds to end of list

my_numbers = [10, 20, 30, 40, 50]

# For loop: print each number in my_numbers
for num in :
    print(num)

print("--- Countdown ---")

# While loop: count down from 5 to 1
count = 5
while count > 0:
    print(count)
    # decrement count

print("--- Even numbers ---")

# For loop with range: print even numbers 2 to 10 (step by 2)
for n in range(, , ):
    print(n)`,
        solution: `my_numbers = [10, 20, 30, 40, 50]

for num in my_numbers:
    print(num)

print("--- Countdown ---")

count = 5
while count > 0:
    print(count)
    count -= 1

print("--- Even numbers ---")

for n in range(2, 11, 2):
    print(n)`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Functions and Dictionaries",
      content: {
        instructions: `Functions are defined with 'def', a name, parentheses for parameters, and a colon. The indented block is the function body. Use 'return' to send a value back, or omit it to return None (Python's null).

Dictionaries (dicts) store key-value pairs using curly braces: {"key": "value"}. Think of a dictionary like a real dictionary — you look up a word (key) and get its definition (value). Dictionaries are flexible and fast for lookups.

Your task: define a function 'create_profile' that takes a name, age, and city and returns a dictionary with those keys. Then define a function 'birthday' that takes a person dict and increments the age by 1. Create a profile, call birthday on it, and print the updated dict.`,
        initialCode: `# def function_name(param1, param2):
#     body
#     return value
# Dict: person = {"name": "Alice", "age": 30}
# Access: person["name"], person.get("name")

def create_profile(name, age, city):
    # Return a dictionary with keys: "name", "age", "city"
    return {} # fix this

def birthday(person):
    # Increment the "age" value in the dict by 1
    # Hint: person["age"] += 1
    pass # remove this

# Create a profile
profile = create_profile("Alice", 25, "New York")

# Call birthday on the profile
birthday(profile)

# Print the updated profile
print(profile)`,
        solution: `def create_profile(name, age, city):
    return {"name": name, "age": age, "city": city}

def birthday(person):
    person["age"] += 1

profile = create_profile("Alice", 25, "New York")
birthday(profile)
print(profile)`,
        type: "console",
      },
      points_reward: 15,
    },
    {
      title: "Tuples and Sets",
      content: {
        instructions: `Tuples are like lists but immutable — once created, you can't change them. Use parentheses () or just commas. They're great for data that shouldn't change, like coordinates (x, y) or days of the week. Access items by index just like lists.

Sets are unordered collections of unique items, created with curly braces {} or set(). Duplicates are automatically removed. They're perfect for eliminating duplicates, checking membership (fast!), and set operations like union (|), intersection (&), and difference (-).

Your task: create a tuple with the first 3 months of the year. Try to change one (and see it fail — comment it out). Then create two sets of numbers, add an element to one, remove one from the other, and print the union and intersection of both sets.`,
        initialCode: `# Tuple: immutable = can't change
# Tuple: months = ("Jan", "Feb", "Mar")
# Access: months[0] -> "Jan"

# Set: unordered, unique items
# Set: colors = {"red", "blue", "green"}
# .add(item): add to set
# .remove(item): remove from set

# Create a tuple with 3 months
months = ("January", "February", "March")
print("First month:", months[0])

# Try to change months[0] to "Jan" — it will error!
# Uncomment the next line and see what happens:
# months[0] = "Jan"
# Then comment it back out

# Create two sets: set_a = {1, 2, 3, 4} and set_b = {3, 4, 5, 6}
set_a = {1, 2, 3, 4}
set_b = {3, 4, 5, 6}

# Add 7 to set_a
set_a

# Remove 3 from set_b
set_b

# Print union (all unique items from both)
# Print intersection (items in both)
print("Union:", set_a | set_b)
print("Intersection:", set_a & set_b)`,
        solution: `months = ("January", "February", "March")
print("First month:", months[0])

set_a = {1, 2, 3, 4}
set_b = {3, 4, 5, 6}

set_a.add(7)
set_b.remove(3)

print("Union:", set_a | set_b)
print("Intersection:", set_a & set_b)`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Modules and Files Intro",
      content: {
        instructions: `Modules are Python files containing reusable code. Python has a huge standard library — import math for math functions, import random for randomness, import os for file operations. The 'from ... import ...' syntax lets you bring in specific functions.

Reading files is done with the built-in open() function. Using 'with' ensures the file closes automatically even if errors occur. Files are a fundamental way to persist data between program runs.

Your task: import the math module and print the value of pi and the square root of 144. Then import the random module and generate 5 random numbers between 1 and 100. Finally, use the 'with' statement to write a line to a file called 'output.txt' and read it back.`,
        initialCode: `# import module_name
# from module_name import specific_function
# math.pi, math.sqrt()
# random.randint(a, b) -> random integer between a and b
# with open("file.txt", "w") as f: f.write("text")
# with open("file.txt", "r") as f: content = f.read()

import math

# Print pi and sqrt(144)
print("Pi:", )
print("Sqrt of 144:", )

import random

# Generate and print 5 random numbers between 1 and 100
print("5 random numbers:")
for i in range(5):
    print() # use random.randint()

# Write to a file
with open("output.txt", "w") as file:
    file.write("Learning Python is fun!")

# Read it back
with open("output.txt", "r") as file:
    content = file.read()
    print("File content:", content)`,
        solution: `import math

print("Pi:", math.pi)
print("Sqrt of 144:", math.sqrt(144))

import random

print("5 random numbers:")
for i in range(5):
    print(random.randint(1, 100))

with open("output.txt", "w") as file:
    file.write("Learning Python is fun!")

with open("output.txt", "r") as file:
    content = file.read()
    print("File content:", content)`,
        type: "console",
      },
      points_reward: 15,
    },
  ],
};
