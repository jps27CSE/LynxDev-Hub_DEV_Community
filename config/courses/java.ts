import type { CourseData } from "./types";

export const javaCourse: CourseData = {
  title: "Java for Absolute Beginners",
  description:
    "Learn Java from scratch — the language of Android, enterprise apps, and large-scale systems. Write once, run anywhere.",
  icon: "☕",
  difficulty: "Beginner",
  category: "Programming",
  order_index: 6,
  chapters: [
    {
      title: "Java Basics — Your First Program",
      content: {
        instructions: `Java is a compiled, statically-typed language that runs on any device with the Java Virtual Machine (JVM). Every Java program needs a class and a main method — this is the entry point where execution begins, like the front door of a house.

System.out.println() prints text to the console. The semicolon at the end of each statement is like a period at the end of a sentence — it tells Java the instruction is complete.

Your task: write a complete Java program that prints "Hello, World!" to the console. Remember that Java is case-sensitive and the file name must match the class name.`,
        initialCode: `public class Main {
    public static void main(String[] args) {
        // Use System.out.println() to print a message
        System.out.println();
    }
}`,
        solution: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Variables and Data Types",
      content: {
        instructions: `Java is statically-typed, meaning you must declare the type of every variable before using it. The main primitive types are int (whole numbers), double (decimals), boolean (true/false), and char (single characters). String is a reference type for text, written with a capital S.

Think of variables as labeled containers — int boxes can only hold whole numbers, double boxes hold decimals, and boolean boxes hold true or false. The 'final' keyword makes a variable unchangeable, like a constant.

Your task: declare variables of different types — a String for your name, an int for your age, a double for your height, and a boolean for whether you like coding. Also create a final constant for the year. Print them all.`,
        initialCode: `public class Main {
    public static void main(String[] args) {
        // Declare variables with explicit types
        // String: text in double quotes
        // int: whole number
        // double: decimal number
        // boolean: true or false
        // final: makes a value constant (unchangeable)

        String name = "";    // put your name in quotes
        int age = 0;         // put your age
        double height = 0.0; // put your height in meters
        boolean likesCoding = ; // set to true or false
        final int CURRENT_YEAR = 0; // set to the current year

        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Height: " + height + "m");
        System.out.println("Likes coding: " + likesCoding);
        System.out.println("Year: " + CURRENT_YEAR);
    }
}`,
        solution: `public class Main {
    public static void main(String[] args) {
        String name = "Alice";
        int age = 25;
        double height = 1.68;
        boolean likesCoding = true;
        final int CURRENT_YEAR = 2026;

        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Height: " + height + "m");
        System.out.println("Likes coding: " + likesCoding);
        System.out.println("Year: " + CURRENT_YEAR);
    }
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Conditionals and Loops",
      content: {
        instructions: `Conditionals (if-else) let your program make decisions. Java evaluates a boolean condition and runs the matching block. The switch statement is great for checking one variable against many possible values — like a multi-way fork in the road.

Loops repeat code. A for loop is perfect when you know how many times to repeat. A while loop keeps going as long as a condition is true. Think of a for loop like counting laps around a track ("run 10 laps"), and a while loop like "keep stirring until the soup is hot."

Your task: write a program that takes a number grade (0-100) and prints the letter grade (A, B, C, D, F) using if-else. Then use a for loop to print numbers 1-10 and a while loop to print only the even numbers between 2 and 10.`,
        initialCode: `public class Main {
    public static void main(String[] args) {
        int score = 85;

        // Use if-else to determine letter grade
        // A: 90-100, B: 80-89, C: 70-79, D: 60-69, F: below 60
        if (score >= 90) {
            System.out.println("Grade: A");
        } else if () {
            // add conditions for B, C, D, F
        }

        System.out.println("--- Counting 1 to 10 ---");

        // For loop: print numbers 1 to 10
        for (int i = 1; ; i++) {
            System.out.println(i);
        }

        System.out.println("--- Even numbers 2 to 10 ---");

        // While loop: print even numbers (2, 4, 6, 8, 10)
        int num = 2;
        while () {
            System.out.println(num);
            num += 2; // add 2 each time
        }
    }
}`,
        solution: `public class Main {
    public static void main(String[] args) {
        int score = 85;

        if (score >= 90) {
            System.out.println("Grade: A");
        } else if (score >= 80) {
            System.out.println("Grade: B");
        } else if (score >= 70) {
            System.out.println("Grade: C");
        } else if (score >= 60) {
            System.out.println("Grade: D");
        } else {
            System.out.println("Grade: F");
        }

        System.out.println("--- Counting 1 to 10 ---");

        for (int i = 1; i <= 10; i++) {
            System.out.println(i);
        }

        System.out.println("--- Even numbers 2 to 10 ---");

        int num = 2;
        while (num <= 10) {
            System.out.println(num);
            num += 2;
        }
    }
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Methods and Arrays",
      content: {
        instructions: `Methods (also called functions in other languages) let you group reusable code. A method has a return type (or 'void' for no return), a name, parameters in parentheses, and a body in curly braces. Methods help you avoid repeating yourself — write once, use many times.

Arrays are fixed-length containers that hold multiple values of the same type. You declare them with square brackets: int[] numbers = {1, 2, 3};. Array indices start at 0, so the first element is at index 0, the second at index 1, etc.

Your task: create a method called 'sumArray' that takes an int array and returns the sum of all elements. Then in main, create an array, call the method, and print the result.`,
        initialCode: `public class Main {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30, 40, 50};

        // Call sumArray and store the result
        int total = sumArray();

        System.out.println("Sum: " + total);
    }

    // Create a method called sumArray that takes an int[] parameter
    // Use a for loop to add each element to a sum variable
    // Return the total sum
    public static int sumArray(int[] arr) {
        // loop through arr and add each element to sum
        return 0; // change this
    }
}`,
        solution: `public class Main {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30, 40, 50};

        int total = sumArray(numbers);

        System.out.println("Sum: " + total);
    }

    public static int sumArray(int[] arr) {
        int sum = 0;
        for (int i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum;
    }
}`,
        type: "console",
      },
      points_reward: 15,
    },
    {
      title: "Object-Oriented Java",
      content: {
        instructions: `Java is an object-oriented language. A class is a blueprint, and an object is an instance of that blueprint. Think of a class like a cookie cutter and objects like the cookies you make with it. Each object has its own values for the fields defined in the class.

The constructor is a special method that runs when you create a new object with 'new'. The 'this' keyword refers to the current object — it's like saying "my" or "this one's" to distinguish object fields from parameters.

Your task: create a 'Student' class with name, age, and grade fields. Add a constructor that sets all three. Add a method called 'displayInfo' that prints the student's details. In main, create two Student objects and call their displayInfo methods.`,
        initialCode: `public class Main {
    public static void main(String[] args) {
        // Create two Student objects using 'new'
        // Call displayInfo() on each
    }
}

// Define a Student class
class Student {
    // Fields: name (String), age (int), grade (String)

    // Constructor: public Student(String name, int age, String grade)
    // Use 'this' to assign parameter values to fields

    // Method: public void displayInfo()
    // Print all fields like "Name: [name], Age: [age], Grade: [grade]"
}`,
        solution: `public class Main {
    public static void main(String[] args) {
        Student s1 = new Student("Alice", 20, "A");
        Student s2 = new Student("Bob", 19, "B");

        s1.displayInfo();
        s2.displayInfo();
    }
}

class Student {
    String name;
    int age;
    String grade;

    public Student(String name, int age, String grade) {
        this.name = name;
        this.age = age;
        this.grade = grade;
    }

    public void displayInfo() {
        System.out.println("Name: " + name + ", Age: " + age + ", Grade: " + grade);
    }
}`,
        type: "console",
      },
      points_reward: 15,
    },
    {
      title: "Inheritance and Polymorphism",
      content: {
        instructions: `Inheritance lets one class (child) get fields and methods from another (parent). The keyword 'extends' creates this relationship. It's like a child inheriting traits from their parents, but adding their own unique features too.

The 'super' keyword calls the parent class's constructor from the child. Method overriding means the child redefines a method from the parent with its own implementation — same name, different behavior.

Your task: create a base 'Animal' class with a 'makeSound' method. Then create 'Dog' and 'Cat' classes that extend Animal and override makeSound. In main, create an array of Animal references and loop through to demonstrate polymorphism.`,
        initialCode: `public class Main {
    public static void main(String[] args) {
        // Create Dog and Cat objects using Animal references
        // Store them in an Animal array
        // Loop through and call makeSound() on each
    }
}

class Animal {
    public void makeSound() {
        System.out.println("Some sound");
    }
}

// Dog extends Animal — override makeSound() to print "Woof!"
class Dog extends Animal {
    public void makeSound() {
        // use super to call parent version first
        super.makeSound();
        System.out.println("Woof!");
    }
}

// Cat extends Animal — override makeSound() to print "Meow!"
class Cat extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Meow!");
    }
}`,
        solution: `public class Main {
    public static void main(String[] args) {
        Animal[] animals = { new Dog(), new Cat() };

        for (Animal a : animals) {
            a.makeSound();
        }
    }
}

class Animal {
    public void makeSound() {
        System.out.println("Some sound");
    }
}

class Dog extends Animal {
    @Override
    public void makeSound() {
        super.makeSound();
        System.out.println("Woof!");
    }
}

class Cat extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Meow!");
    }
}`,
        type: "console",
      },
      points_reward: 15,
    },
  ],
};
