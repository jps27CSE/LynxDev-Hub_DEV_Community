import type { CourseData } from "./types";

export const csharpCourse: CourseData = {
  title: "C# for Absolute Beginners",
  description:
    "Learn C# from scratch — the language for .NET apps, games (Unity), and enterprise software. Modern, powerful, and versatile.",
  icon: "💠",
  difficulty: "Beginner",
  category: "Programming",
  order_index: 7,
  chapters: [
    {
      title: "C# Basics — Your First Program",
      content: {
        instructions: `C# (pronounced "C sharp") is a modern, object-oriented language from Microsoft. Every C# program starts with a 'using' directive to import built-in functionality, a 'namespace' to organize code, and a 'class' containing the Main method — the program's entry point.

Console.WriteLine() prints text to the console. Like Java, C# uses semicolons to end statements. C# is case-sensitive, so 'Console' with a capital C is required.

Your task: write a complete C# program that prints "Hello, World!" to the console. Follow the standard structure with 'using System;', a namespace, a class, and a Main method.`,
        initialCode: `using System;

namespace MyApp
{
    class Program
    {
        static void Main(string[] args)
        {
            // Use Console.WriteLine() to print a message
            Console.WriteLine();
        }
    }
}`,
        solution: `using System;

namespace MyApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello, World!");
        }
    }
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Variables and Input",
      content: {
        instructions: `C# is statically-typed like Java, but also has 'var' which lets the compiler figure out the type for you. Common types are int (whole numbers), double (decimals), string (text), and bool (true/false). Strings in C# are nullable by default and excellent for text handling.

Console.ReadLine() reads what the user types into the console as a string. You can convert it to other types with methods like int.Parse(). Think of it like asking a question and getting an answer back.

Your task: declare a string variable for your name, an int for your age, and a double for your height. Use Console.ReadLine() to get user input for each. Print a summary sentence using string concatenation.`,
        initialCode: `using System;

namespace MyApp
{
    class Program
    {
        static void Main(string[] args)
        {
            // Ask for the user's name
            Console.Write("Enter your name: ");
            string name = Console.ReadLine();

            // Ask for age (hint: use int.Parse() to convert)
            Console.Write("Enter your age: ");
            int age = 0; // read and convert

            // Ask for height in meters
            Console.Write("Enter your height (m): ");
            double height = 0.0; // read and convert with double.Parse()

            // Print a summary
            Console.WriteLine("Hi, " + name + "! You are " + age + " years old and " + height + "m tall.");
        }
    }
}`,
        solution: `using System;

namespace MyApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Write("Enter your name: ");
            string name = Console.ReadLine();

            Console.Write("Enter your age: ");
            int age = int.Parse(Console.ReadLine());

            Console.Write("Enter your height (m): ");
            double height = double.Parse(Console.ReadLine());

            Console.WriteLine("Hi, " + name + "! You are " + age + " years old and " + height + "m tall.");
        }
    }
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Conditionals and Loops",
      content: {
        instructions: `Conditionals in C# work like other C-style languages — if, else if, else, and switch. C# switch statements are powerful: you can match on types (C# 7+) and use case guards with 'when'. This makes decision-making code cleaner.

Loops include for (count-controlled), foreach (iterate over collections), and while (condition-controlled). The foreach loop is especially handy — it automatically goes through every item without needing an index.

Your task: write a program that asks for a day number (1-7) and prints the day name using a switch statement. Then use a for loop to print numbers 1-10, and a foreach loop to iterate over an array of weekdays.`,
        initialCode: `using System;

namespace MyApp
{
    class Program
    {
        static void Main(string[] args)
        {
            // Ask for a day number
            Console.Write("Enter a day number (1-7): ");
            int day = int.Parse(Console.ReadLine());

            // Use switch to print the day name
            // 1 = Monday, 2 = Tuesday, etc.
            switch (day)
            {
                case 1:
                    Console.WriteLine("Monday");
                    break;
                // Add cases for Tuesday through Sunday
                default:
                    Console.WriteLine("Invalid day");
                    break;
            }

            Console.WriteLine("--- Numbers 1 to 10 ---");

            // For loop: print 1 to 10
            for () {
                Console.WriteLine(i);
            }

            Console.WriteLine("--- Weekdays ---");

            string[] weekdays = { "Mon", "Tue", "Wed", "Thu", "Fri" };
            // Foreach loop: iterate over weekdays
            foreach () {
                Console.WriteLine(dayName);
            }
        }
    }
}`,
        solution: `using System;

namespace MyApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Write("Enter a day number (1-7): ");
            int day = int.Parse(Console.ReadLine());

            switch (day)
            {
                case 1:
                    Console.WriteLine("Monday");
                    break;
                case 2:
                    Console.WriteLine("Tuesday");
                    break;
                case 3:
                    Console.WriteLine("Wednesday");
                    break;
                case 4:
                    Console.WriteLine("Thursday");
                    break;
                case 5:
                    Console.WriteLine("Friday");
                    break;
                case 6:
                    Console.WriteLine("Saturday");
                    break;
                case 7:
                    Console.WriteLine("Sunday");
                    break;
                default:
                    Console.WriteLine("Invalid day");
                    break;
            }

            Console.WriteLine("--- Numbers 1 to 10 ---");

            for (int i = 1; i <= 10; i++)
            {
                Console.WriteLine(i);
            }

            Console.WriteLine("--- Weekdays ---");

            string[] weekdays = { "Mon", "Tue", "Wed", "Thu", "Fri" };
            foreach (string dayName in weekdays)
            {
                Console.WriteLine(dayName);
            }
        }
    }
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Arrays and Lists",
      content: {
        instructions: `Arrays in C# are fixed-size collections with a set type. You declare them like int[] numbers = {1, 2, 3}; or with 'new' like int[] numbers = new int[5];. They're great when you know exactly how many items you need.

List<T> is more flexible — it grows and shrinks automatically. Use List<int> for a list of integers, List<string> for strings. Add items with .Add(), remove with .RemoveAt(), and get the count with .Count. You can loop through lists with foreach just like arrays.

Your task: create an array of five favorite movies (strings). Then create a List<string> of hobbies, add at least three, insert one at position 0, and remove the last one. Print both collections using foreach loops.`,
        initialCode: `using System;
using System.Collections.Generic;

namespace MyApp
{
    class Program
    {
        static void Main(string[] args)
        {
            // Array of 5 favorite movies
            string[] movies = ; // declare and initialize

            Console.WriteLine("--- My Favorite Movies ---");
            foreach () {
                Console.WriteLine(movie);
            }

            // List of hobbies
            List<string> hobbies = new List<string>();
            hobbies.Add("Coding"); // add at least 3 hobbies

            // Insert one at index 0
            hobbies.Insert(0, "");

            // Remove the last item
            // Hint: hobbies.Count gives the number of items

            Console.WriteLine("--- My Hobbies ---");
            foreach () {
                Console.WriteLine(hobby);
            }

            Console.WriteLine("Total hobbies: " + hobbies.Count);
        }
    }
}`,
        solution: `using System;
using System.Collections.Generic;

namespace MyApp
{
    class Program
    {
        static void Main(string[] args)
        {
            string[] movies = { "Inception", "The Matrix", "Interstellar", "The Dark Knight", "Avatar" };

            Console.WriteLine("--- My Favorite Movies ---");
            foreach (string movie in movies)
            {
                Console.WriteLine(movie);
            }

            List<string> hobbies = new List<string>();
            hobbies.Add("Coding");
            hobbies.Add("Reading");
            hobbies.Add("Gaming");

            hobbies.Insert(0, "Photography");

            hobbies.RemoveAt(hobbies.Count - 1);

            Console.WriteLine("--- My Hobbies ---");
            foreach (string hobby in hobbies)
            {
                Console.WriteLine(hobby);
            }

            Console.WriteLine("Total hobbies: " + hobbies.Count);
        }
    }
}`,
        type: "console",
      },
      points_reward: 15,
    },
    {
      title: "Methods and Classes",
      content: {
        instructions: `Methods in C# are declared with a return type, name, and parameters. The 'static' keyword means the method belongs to the class itself, not an instance. Methods let you organize code into reusable, testable pieces — like having a labeled drawer for each type of tool.

Classes are blueprints for objects. Properties with { get; set; } are a C# convenience — they look like fields but behave like methods, giving you control over reading and writing values. The constructor ('public ClassName(...)') runs when you create a new object.

Your task: create a 'Book' class with Title, Author, and Year properties (using auto-properties). Add a constructor that sets all three. Create a method 'GetDescription' that returns a formatted string. In Main, create two Book objects and display their descriptions.`,
        initialCode: `using System;

namespace MyApp
{
    class Program
    {
        static void Main(string[] args)
        {
            // Create two Book objects
            // Print their descriptions
        }
    }

    class Book
    {
        // Auto-properties with { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public int Year { get; set; }

        // Constructor
        public Book(string title, string author, int year)
        {
            // assign parameters to properties
        }

        // Method: GetDescription()
        // Return something like "'Title' by Author (Year)"
        public string GetDescription()
        {
            return ""; // fix this
        }
    }
}`,
        solution: `using System;

namespace MyApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Book book1 = new Book("1984", "George Orwell", 1949);
            Book book2 = new Book("To Kill a Mockingbird", "Harper Lee", 1960);

            Console.WriteLine(book1.GetDescription());
            Console.WriteLine(book2.GetDescription());
        }
    }

    class Book
    {
        public string Title { get; set; }
        public string Author { get; set; }
        public int Year { get; set; }

        public Book(string title, string author, int year)
        {
            Title = title;
            Author = author;
            Year = year;
        }

        public string GetDescription()
        {
            return "'" + Title + "' by " + Author + " (" + Year + ")";
        }
    }
}`,
        type: "console",
      },
      points_reward: 15,
    },
    {
      title: "Inheritance and Interfaces",
      content: {
        instructions: `Inheritance in C# uses the ':' symbol (instead of 'extends' like Java). A derived class inherits all non-private members from its base class. You can override methods using the 'virtual' keyword in the base class and 'override' in the derived class.

Interfaces define a contract — a set of methods and properties that a class must implement. An interface has no implementation, just signatures. Think of it like a job posting: it lists what you need to do, not how to do it. A class can implement multiple interfaces.

Your task: create an 'IVehicle' interface with a 'Move' method. Then create a base 'Vehicle' class and two derived classes 'Car' and 'Bicycle' that implement IVehicle. Override Move in each. In Main, create instances and call Move on each.`,
        initialCode: `using System;

namespace MyApp
{
    class Program
    {
        static void Main(string[] args)
        {
            // Create Car and Bicycle objects
            // Call Move() on each
        }
    }

    // Define an interface IVehicle with a void Move() method
    interface IVehicle
    {
        void Move();
    }

    // Base class Vehicle that implements IVehicle
    class Vehicle : IVehicle
    {
        public virtual void Move()
        {
            Console.WriteLine("Vehicle moves");
        }
    }

    // Car inherits from Vehicle
    class Car : Vehicle
    {
        // Override Move() to print "Car drives on roads"
    }

    // Bicycle inherits from Vehicle
    class Bicycle : Vehicle
    {
        // Override Move() to print "Bicycle pedals along"
    }
}`,
        solution: `using System;

namespace MyApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Car car = new Car();
            Bicycle bike = new Bicycle();

            car.Move();
            bike.Move();
        }
    }

    interface IVehicle
    {
        void Move();
    }

    class Vehicle : IVehicle
    {
        public virtual void Move()
        {
            Console.WriteLine("Vehicle moves");
        }
    }

    class Car : Vehicle
    {
        public override void Move()
        {
            Console.WriteLine("Car drives on roads");
        }
    }

    class Bicycle : Vehicle
    {
        public override void Move()
        {
            Console.WriteLine("Bicycle pedals along");
        }
    }
}`,
        type: "console",
      },
      points_reward: 15,
    },
  ],
};
