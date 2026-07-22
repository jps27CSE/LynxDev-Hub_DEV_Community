import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const courses = [
  {
    title: "HTML & CSS Fundamentals",
    description:
      "Build your first web pages with semantic HTML and modern CSS.",
    icon: "📁",
    difficulty: "Beginner" as const,
    chapters: 12,
  },
  {
    title: "JavaScript Essentials",
    description:
      "Master variables, functions, DOM manipulation, and ES6+ features.",
    icon: "📁",
    difficulty: "Beginner" as const,
    chapters: 16,
  },
  {
    title: "React Development",
    description:
      "Build modern UIs with components, hooks, and state management.",
    icon: "📁",
    difficulty: "Intermediate" as const,
    chapters: 20,
  },
  {
    title: "Node.js Backend",
    description:
      "Create REST APIs, handle databases, and deploy your backend.",
    icon: "📁",
    difficulty: "Intermediate" as const,
    chapters: 14,
  },
];

const difficultyColor = {
  Beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  Intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

function CoursePreview() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Start Learning Today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Hands-on courses designed to take you from beginner to confident
            developer.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.title}
              className="group rounded-xl border border-border/50 bg-card p-6 hover:border-border transition-all hover:shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                <span className="text-2xl">{course.icon}</span>
              </div>
              <h3 className="font-semibold mb-2">{course.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {course.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={
                    difficultyColor[course.difficulty]
                  }
                >
                  {course.difficulty}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {course.chapters} chapters
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/courses">
            <Button variant="outline" size="lg">
              View All Courses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CoursePreview;
