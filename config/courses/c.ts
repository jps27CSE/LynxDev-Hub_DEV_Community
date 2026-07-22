import type { CourseData } from "./types";

export const cCourse: CourseData = {
  title: "C Programming for Absolute Beginners",
  description: "Learn C from scratch — the language that powers operating systems. Understand memory, pointers, and how computers really work.",
  icon: "⚙️",
  difficulty: "Beginner",
  category: "Programming",
  order_index: 4,
  chapters: [
    {
      title: "Introduction to C — Your First Program",
      content: {
        instructions: `C is one of the oldest and most influential programming languages. It's like the foundation of a house — almost every modern language borrows ideas from C. Every C program needs a main() function — that's where execution begins, like the front door to your code.

printf() is your output tool in C. It prints text to the console (terminal). The '#include <stdio.h>' line at the top pulls in the standard input/output library so you can use printf and other I/O functions.

Your task: write a complete C program that prints "Hello, World!" to the console. This is the traditional first step in learning C.`,
        initialCode: `// Every C program needs: #include <stdio.h> and int main()
// printf("text"); prints to the console
// Use \\n for a new line

#include <stdio.h>

int main() {
    // Use printf() to print "Hello, World!"
    printf();
    return 0;
}`,
        solution: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Variables and Data Types",
      content: {
        instructions: `Variables in C are like labeled containers — each one holds a specific kind of data. The main data types are int (whole numbers), float (decimal numbers), char (single characters), and double (large decimal numbers). Unlike some languages, C requires you to declare the type upfront.

Format specifiers tell printf() what kind of data to print: %d for integers, %f for floats, %c for characters, and %lf for doubles. It's like labeling a package so the post office knows how to handle it.

Your task: declare an int, a float, a char, and a double variable with values of your choice. Print each one using the correct format specifier.`,
        initialCode: `// Data types: int, float, char, double
// Format specifiers: %d (int), %f (float), %c (char), %lf (double)

#include <stdio.h>

int main() {
    int age = ;           // pick an age
    float price = ;       // a decimal price (add f at end like 5.99f)
    char grade = ;        // a single letter in single quotes like 'A'
    double pi = ;         // a large decimal like 3.14159

    // Print each variable using its format specifier
    printf("Age: %d\\n", age);
    printf("Price: %f\\n", price);
    printf("Grade: %c\\n", grade);
    printf("Pi: %lf\\n", pi);

    return 0;
}`,
        solution: `#include <stdio.h>

int main() {
    int age = 25;
    float price = 5.99f;
    char grade = 'A';
    double pi = 3.14159;

    printf("Age: %d\\n", age);
    printf("Price: %f\\n", price);
    printf("Grade: %c\\n", grade);
    printf("Pi: %lf\\n", pi);

    return 0;
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Input, Output & Conditionals",
      content: {
        instructions: `scanf() is C's way of reading user input from the keyboard. It uses format specifiers just like printf. The '&' symbol before a variable (like &age) tells scanf where to store the input — it's the "address of" operator, which you'll learn more about with pointers.

Conditionals (if, else if, else) let your program make decisions. Comparison operators like >, <, == (equal), != (not equal) compare values. It's like a traffic light — different conditions lead to different actions.

Your task: ask the user for their age using scanf, then check if they are a child (0-12), teenager (13-19), adult (20-64), or senior (65+). Print the appropriate message.`,
        initialCode: `// scanf("%d", &variable) reads an integer from the user
// Remember the & before the variable name!
// if (condition) { ... } else if (condition) { ... } else { ... }

#include <stdio.h>

int main() {
    int age;
    
    printf("Enter your age: ");
    scanf("%d", &age);
    
    // Check age ranges using if-else if-else
    if () {
        printf("You are a child.\\n");
    } else if () {
        printf("You are a teenager.\\n");
    } else if () {
        printf("You are an adult.\\n");
    } else {
        printf("You are a senior.\\n");
    }
    
    return 0;
}`,
        solution: `#include <stdio.h>

int main() {
    int age;
    
    printf("Enter your age: ");
    scanf("%d", &age);
    
    if (age >= 0 && age <= 12) {
        printf("You are a child.\\n");
    } else if (age >= 13 && age <= 19) {
        printf("You are a teenager.\\n");
    } else if (age >= 20 && age <= 64) {
        printf("You are an adult.\\n");
    } else {
        printf("You are a senior.\\n");
    }
    
    return 0;
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Loops in C",
      content: {
        instructions: `Loops let you repeat code without copying and pasting. A 'for' loop is perfect when you know how many times to repeat — like counting to 10. A 'while' loop runs as long as a condition is true — like "keep walking until you reach the door."

The for loop has three parts: initialization (int i = 0), condition (i < 5), and increment (i++). The do-while loop is unique — it always runs at least once because it checks the condition after executing the block.

Your task: write a for loop that prints numbers 1 to 10. Then write a while loop that prints even numbers from 2 to 20. Then write a do-while loop that counts down from 5 to 1.`,
        initialCode: `// for (init; condition; increment) { ... }
// while (condition) { ... }
// do { ... } while (condition);
// i++ means "add 1 to i"; i += 2 means "add 2 to i"

#include <stdio.h>

int main() {
    // For loop — print 1 to 10
    for () {
        printf("%d\\n", i);
    }
    
    printf("---\\n");
    
    // While loop — print even numbers 2 to 20
    int j = 2;
    while () {
        printf("%d\\n", j);
        j += 2;
    }
    
    printf("---\\n");
    
    // Do-while loop — count down from 5 to 1
    int k = 5;
    do {
        printf("%d\\n", k);
        k--;
    } while ();
    
    return 0;
}`,
        solution: `#include <stdio.h>

int main() {
    for (int i = 1; i <= 10; i++) {
        printf("%d\\n", i);
    }
    
    printf("---\\n");
    
    int j = 2;
    while (j <= 20) {
        printf("%d\\n", j);
        j += 2;
    }
    
    printf("---\\n");
    
    int k = 5;
    do {
        printf("%d\\n", k);
        k--;
    } while (k >= 1);
    
    return 0;
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Functions and Arrays",
      content: {
        instructions: `Functions in C are reusable blocks of code — like a recipe you can use again and again. You declare the return type (int, float, void, etc.), the name, and parameters in parentheses. The 'return' keyword sends a value back. A void function doesn't return anything.

Arrays are collections of the same data type stored in consecutive memory locations. Think of an array like a row of lockers — each locker has a number (index) starting at 0. You access elements with square brackets: arr[0] gets the first element.

Your task: write a function called 'add' that takes two integers and returns their sum. Then write a void function called 'printArray' that takes an array and its size, and prints all elements. In main(), create an array of 5 numbers and call both functions.`,
        initialCode: `// Function: returnType name(parameters) { ... }
// Array: type name[size] = { values };
// Array index starts at 0

#include <stdio.h>

// TODO: Write a function called 'add' that returns the sum of two ints
int add(int a, int b) {
    
}

// TODO: Write a void function called 'printArray' that prints all elements
void printArray(int arr[], int size) {
    
}

int main() {
    int numbers[5] = {10, 20, 30, 40, 50};
    
    // Call add() and print the result
    int sum = add(15, 25);
    printf("Sum: %d\\n", sum);
    
    // Call printArray() to print all numbers
    printArray(numbers, 5);
    
    return 0;
}`,
        solution: `#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

void printArray(int arr[], int size) {
    for (int i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
}

int main() {
    int numbers[5] = {10, 20, 30, 40, 50};
    
    int sum = add(15, 25);
    printf("Sum: %d\\n", sum);
    
    printArray(numbers, 5);
    
    return 0;
}`,
        type: "console",
      },
      points_reward: 15,
    },
    {
      title: "Strings and Pointers Introduction",
      content: {
        instructions: `Strings in C are just arrays of characters ending with a special null character '\\0'. Unlike other languages, C has no built-in string type — you use char arrays. The <string.h> library provides helpful functions like strlen() (get length), strcpy() (copy), and strcmp() (compare).

Pointers are variables that store memory addresses instead of values. Think of it like a house address — instead of carrying the house around, you just remember where it is. The '*' declares a pointer, and '&' gets the address of a variable. Pointers are what make C powerful (and challenging).

Your task: create a char array with your name, use strlen() to find its length, and use strcmp() to compare it with another string. Then declare an integer variable, create a pointer to it, and print both the value and the memory address.`,
        initialCode: `// Strings: char name[] = "text";
// strlen(str) — get length, strcmp(str1, str2) — compare (0 if equal)
// Pointer: int* ptr = &variable;  *ptr dereferences (gets the value)

#include <stdio.h>
#include <string.h>

int main() {
    // Create a name string
    char name[] = "";
    
    // Print the string and its length using strlen()
    printf("Name: %s\\n", name);
    printf("Length: %zu\\n", );  // call strlen() here
    
    // Compare with another string using strcmp()
    char other[] = "Alice";
    if () {  // strcmp returns 0 if equal
        printf("Names are the same!\\n");
    } else {
        printf("Names are different.\\n");
    }
    
    // Pointer basics
    int number = 42;
    int* ptr = ;  // store the address of number
    
    printf("Value: %d\\n", number);
    printf("Address: %p\\n", ptr);  // %p prints a pointer/address
    printf("Value via pointer: %d\\n", *ptr);  // dereference
    
    return 0;
}`,
        solution: `#include <stdio.h>
#include <string.h>

int main() {
    char name[] = "Bob";
    
    printf("Name: %s\\n", name);
    printf("Length: %zu\\n", strlen(name));
    
    char other[] = "Alice";
    if (strcmp(name, other) == 0) {
        printf("Names are the same!\\n");
    } else {
        printf("Names are different.\\n");
    }
    
    int number = 42;
    int* ptr = &number;
    
    printf("Value: %d\\n", number);
    printf("Address: %p\\n", ptr);
    printf("Value via pointer: %d\\n", *ptr);
    
    return 0;
}`,
        type: "console",
      },
      points_reward: 15,
    },
  ],
};
