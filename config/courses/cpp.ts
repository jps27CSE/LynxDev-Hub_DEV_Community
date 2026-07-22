import type { CourseData } from "./types";

export const cppCourse: CourseData = {
  title: "C++ for Absolute Beginners",
  description: "Learn C++ from scratch — an extension of C with object-oriented programming. Build games, apps, and understand modern software.",
  icon: "🔷",
  difficulty: "Beginner",
  category: "Programming",
  order_index: 5,
  chapters: [
    {
      title: "C++ Basics — Your First Program",
      content: {
        instructions: `C++ is an extension of C that adds object-oriented programming. It's like C with superpowers — you can write low-level code AND organize large programs with classes and objects. '#include <iostream>' gives you input/output tools, and 'using namespace std;' lets you write cout/cin without std:: in front.

cout (pronounced "see-out") prints output to the console using the << operator. cin (pronounced "see-in") reads input from the keyboard using the >> operator. Think of << and >> as arrows pointing the direction data flows.

Your task: write a C++ program that prints "Hello, World!" to the console using cout. Then use cin to ask the user for their name and print a greeting.`,
        initialCode: `// #include <iostream> for input/output
// using namespace std; lets you write cout instead of std::cout
// cout << "text" prints; cin >> variable reads input

#include <iostream>
using namespace std;

int main() {
    // Print "Hello, World!" using cout
    cout <<  << endl;
    
    string name;
    cout << "Enter your name: ";
    // Read input with cin
    cin >> ;
    
    // Greet the user
    cout << "Hello, " << name << "!" << endl;
    
    return 0;
}`,
        solution: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    
    string name;
    cout << "Enter your name: ";
    cin >> name;
    
    cout << "Hello, " << name << "!" << endl;
    
    return 0;
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Variables, Input & Strings",
      content: {
        instructions: `C++ has a built-in 'string' type that makes working with text much easier than in C. You don't need to worry about character arrays or null terminators — just #include <string> and you're set. Strings can use + for concatenation (joining), just like numbers use + for addition.

cin stops reading at whitespace (spaces, tabs), so to read a full line including spaces, use getline(cin, variable). Type conversion lets you change between types, like turning a string into an integer with stoi().

Your task: ask the user for their full name (using getline), their age, and their favorite number. Convert the favorite number from string to int using stoi(), then print a summary sentence combining all the info.`,
        initialCode: `// string type: #include <string>
// getline(cin, variable) — reads a whole line including spaces
// stoi(string) — converts string to int

#include <iostream>
#include <string>
using namespace std;

int main() {
    string fullName;
    int age;
    string favoriteNumberStr;
    
    // Ask for full name (use getline to capture spaces)
    cout << "Enter your full name: ";
    getline(cin, fullName);
    
    // Ask for age
    cout << "Enter your age: ";
    cin >> age;
    
    // Ask for favorite number (as string)
    cout << "Enter your favorite number: ";
    cin >> favoriteNumberStr;
    
    // Convert favoriteNumberStr to int using stoi()
    int favNum = ;
    
    // Print a summary
    cout << "Hello, " << fullName << "! You are " << age 
         << " years old and your favorite number is " << favNum << "." << endl;
    
    return 0;
}`,
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string fullName;
    int age;
    string favoriteNumberStr;
    
    cout << "Enter your full name: ";
    getline(cin, fullName);
    
    cout << "Enter your age: ";
    cin >> age;
    
    cout << "Enter your favorite number: ";
    cin >> favoriteNumberStr;
    
    int favNum = stoi(favoriteNumberStr);
    
    cout << "Hello, " << fullName << "! You are " << age 
         << " years old and your favorite number is " << favNum << "." << endl;
    
    return 0;
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Functions with Overloading",
      content: {
        instructions: `C++ lets you have multiple functions with the same name — that's called function overloading. As long as the parameters are different (different count or types), the compiler knows which one to call. It's like saying "open the door" VS "open the jar" — same verb, different action based on context.

Default parameters let you skip arguments when calling a function. If a parameter has a default value, you can leave it out and the default is used. References (int &x) let a function modify the original variable directly, without copying — like handing someone the actual document instead of a photocopy.

Your task: write three overloaded 'print' functions — one for int, one for double, and one for string. Then write a function called 'square' that uses a reference parameter to modify the original variable in-place.`,
        initialCode: `// Overloading: same name, different parameters
// Default params: int func(int x, int y = 10)
// Reference: void func(int &x) — modifies the original

#include <iostream>
#include <string>
using namespace std;

// Overloaded print functions — one for each type
void print(int value) {
    cout << "Integer: " << value << endl;
}

void print(double value) {
    // Print as "Double: [value]"
    
}

void print(string value) {
    // Print as "String: [value]"
    
}

// Function with reference parameter — squares the original variable
void square(int &x) {
    // Multiply x by itself (this changes the original!)
    
}

int main() {
    // Test overloaded print functions
    print(42);
    print(3.14);
    print("Hello!");
    
    cout << "---" << endl;
    
    // Test reference square function
    int num = 5;
    cout << "Before square: " << num << endl;
    square(num);  // should change num to 25
    cout << "After square: " << num << endl;
    
    return 0;
}`,
        solution: `#include <iostream>
#include <string>
using namespace std;

void print(int value) {
    cout << "Integer: " << value << endl;
}

void print(double value) {
    cout << "Double: " << value << endl;
}

void print(string value) {
    cout << "String: " << value << endl;
}

void square(int &x) {
    x = x * x;
}

int main() {
    print(42);
    print(3.14);
    print("Hello!");
    
    cout << "---" << endl;
    
    int num = 5;
    cout << "Before square: " << num << endl;
    square(num);
    cout << "After square: " << num << endl;
    
    return 0;
}`,
        type: "console",
      },
      points_reward: 15,
    },
    {
      title: "Arrays and Vectors",
      content: {
        instructions: `C++ arrays work like C arrays — a fixed-size collection of elements with zero-based indexing. But C++ also offers the vector container (#include <vector>), which is like a dynamic array that can grow and shrink. Think of an array as a fixed parking lot and a vector as a parking garage that can add more floors.

Vectors have handy methods: push_back() adds to the end, size() returns the count, pop_back() removes the last element, and you can loop through them with a range-based for loop: for (int x : vec). The range-based loop is simpler and safer than traditional index loops.

Your task: create a vector of strings (your favorite movies). Use push_back() to add at least three. Print them using a range-based for loop. Then create a traditional array of 5 integers, calculate their sum, and print the average.`,
        initialCode: `// Vector: #include <vector>, vector<type> name;
// push_back(item), size(), pop_back()
// Range-based for: for (type var : container)

#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    // Create a vector of strings for favorite movies
    vector<string> movies;
    
    // Use push_back to add at least 3 movies
    
    
    // Print all movies using a range-based for loop
    cout << "My favorite movies:" << endl;
    for () {
        cout << "- " << movie << endl;
    }
    
    cout << "---" << endl;
    
    // Traditional array of 5 integers
    int numbers[5] = {8, 15, 23, 42, 16};
    int sum = 0;
    
    // Calculate the sum using a traditional for loop
    for (int i = 0; i < 5; i++) {
        sum += numbers[i];
    }
    
    // Calculate and print the average
    double average = (double)sum / 5;
    cout << "Sum: " << sum << endl;
    cout << "Average: " << average << endl;
    
    return 0;
}`,
        solution: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    vector<string> movies;
    
    movies.push_back("The Matrix");
    movies.push_back("Inception");
    movies.push_back("Interstellar");
    
    cout << "My favorite movies:" << endl;
    for (string movie : movies) {
        cout << "- " << movie << endl;
    }
    
    cout << "---" << endl;
    
    int numbers[5] = {8, 15, 23, 42, 16};
    int sum = 0;
    
    for (int i = 0; i < 5; i++) {
        sum += numbers[i];
    }
    
    double average = (double)sum / 5;
    cout << "Sum: " << sum << endl;
    cout << "Average: " << average << endl;
    
    return 0;
}`,
        type: "console",
      },
      points_reward: 10,
    },
    {
      title: "Classes and Objects",
      content: {
        instructions: `A class is a blueprint for creating objects. Think of a class like a cookie cutter — it defines the shape, and each object is a cookie you make with it. Classes bundle data (member variables) and functions (methods) together. The 'public' keyword means anyone can access those members; 'private' means only the class itself can.

A constructor is a special method that runs when you create a new object. It has the same name as the class and no return type. Constructors are perfect for setting up initial values — like configuring a new phone when you first unbox it.

Your task: create a 'Student' class with private name and grade variables, a constructor that sets both, and public getter methods. In main(), create two Student objects and print their info.`,
        initialCode: `// class ClassName { public: ... private: ... };
// Constructor: ClassName(params) { ... } — no return type
// Getters: methods that return private values

#include <iostream>
#include <string>
using namespace std;

class Student {
private:
    string name;
    char grade;  // 'A', 'B', 'C', etc.
    
public:
    // Constructor — takes name and grade, sets member variables
    Student(string studentName, char studentGrade) {
        name = studentName;
        grade = studentGrade;
    }
    
    // Getter for name
    
    
    // Getter for grade
    
    
};

int main() {
    // Create two Student objects using the constructor
    Student student1("Alice", 'A');
    Student student2("Bob", 'B');
    
    // Print their info using getters
    cout << "Student 1: " << student1.getName() << " - Grade: " << student1.getGrade() << endl;
    cout << "Student 2: " << student2.getName() << " - Grade: " << student2.getGrade() << endl;
    
    return 0;
}`,
        solution: `#include <iostream>
#include <string>
using namespace std;

class Student {
private:
    string name;
    char grade;
    
public:
    Student(string studentName, char studentGrade) {
        name = studentName;
        grade = studentGrade;
    }
    
    string getName() {
        return name;
    }
    
    char getGrade() {
        return grade;
    }
};

int main() {
    Student student1("Alice", 'A');
    Student student2("Bob", 'B');
    
    cout << "Student 1: " << student1.getName() << " - Grade: " << student1.getGrade() << endl;
    cout << "Student 2: " << student2.getName() << " - Grade: " << student2.getGrade() << endl;
    
    return 0;
}`,
        type: "console",
      },
      points_reward: 15,
    },
    {
      title: "Inheritance and Polymorphism Intro",
      content: {
        instructions: `Inheritance lets you create a new class based on an existing one. The new class (derived/child) inherits all the public members of the base class (parent). Think of it like a family — a child inherits traits from parents but can also have their own unique features. The syntax is: class Dog : public Animal { ... };

Polymorphism means "many forms" — using virtual functions, a derived class can override a base class method. When you call that method through a base class pointer, the correct version runs based on the actual object type. The 'virtual' keyword in the base class makes this possible, and 'override' in the derived class makes it explicit.

Your task: create an Animal base class with a virtual makeSound() method. Then create Dog and Cat classes that inherit from Animal and override makeSound(). In main(), use Animal pointers to demonstrate polymorphism.`,
        initialCode: `// Inheritance: class Child : public Parent { ... };
// Virtual function: virtual returnType funcName() { ... }
// Override: returnType funcName() override { ... }

#include <iostream>
#include <string>
using namespace std;

// Base class
class Animal {
public:
    // Virtual function — derived classes can override this
    virtual void makeSound() {
        cout << "Some generic animal sound" << endl;
    }
};

// Derived class Dog — inherits from Animal
class Dog : public Animal {
public:
    // Override makeSound() — use the 'override' keyword
    void makeSound() override {
        
    }
};

// Derived class Cat — inherits from Animal
class Cat : public Animal {
public:
    void makeSound() override {
        
    }
};

int main() {
    // Create objects
    Dog dog;
    Cat cat;
    
    // Use pointers to demonstrate polymorphism
    Animal* animal1 = &dog;
    Animal* animal2 = &cat;
    
    // Even though animal1 and animal2 are Animal pointers,
    // they call the correct makeSound() based on the actual object type
    cout << "Dog says: ";
    animal1->makeSound();
    
    cout << "Cat says: ";
    animal2->makeSound();
    
    // Direct calls also work
    cout << "---" << endl;
    dog.makeSound();
    cat.makeSound();
    
    return 0;
}`,
        solution: `#include <iostream>
#include <string>
using namespace std;

class Animal {
public:
    virtual void makeSound() {
        cout << "Some generic animal sound" << endl;
    }
};

class Dog : public Animal {
public:
    void makeSound() override {
        cout << "Woof!" << endl;
    }
};

class Cat : public Animal {
public:
    void makeSound() override {
        cout << "Meow!" << endl;
    }
};

int main() {
    Dog dog;
    Cat cat;
    
    Animal* animal1 = &dog;
    Animal* animal2 = &cat;
    
    cout << "Dog says: ";
    animal1->makeSound();
    
    cout << "Cat says: ";
    animal2->makeSound();
    
    cout << "---" << endl;
    dog.makeSound();
    cat.makeSound();
    
    return 0;
}`,
        type: "console",
      },
      points_reward: 15,
    },
  ],
};
