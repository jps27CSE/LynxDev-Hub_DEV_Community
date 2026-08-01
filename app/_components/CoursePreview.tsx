import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CourseIcon from "@/components/CourseIcon";

const courses = [
  {
    title: "HTML & CSS Fundamentals",
    description:
      "Build your first web pages with semantic HTML and modern CSS — the foundation of every website.",
    difficulty: "Beginner" as const,
    chapters: 12,
  },
  {
    title: "JavaScript Essentials",
    description:
      "Master variables, functions, DOM manipulation, and ES6+ features to bring your pages to life.",
    difficulty: "Beginner" as const,
    chapters: 16,
  },
  {
    title: "React Development",
    description:
      "Build modern UIs with components, hooks, state management, and the full React ecosystem.",
    difficulty: "Intermediate" as const,
    chapters: 20,
  },
  {
    title: "Node.js Backend",
    description:
      "Create REST APIs, handle databases, authenticate users, and deploy your backend to production.",
    difficulty: "Intermediate" as const,
    chapters: 14,
  },
];

const diffConfig: Record<
  string,
  { color: string; light: string; badge: string }
> = {
  Beginner: {
    color: "text-green-500",
    light: "bg-green-500/10",
    badge: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  Intermediate: {
    color: "text-yellow-500",
    light: "bg-yellow-500/10",
    badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
  Advanced: {
    color: "text-red-500",
    light: "bg-red-500/10",
    badge: "bg-red-500/10 text-red-500 border-red-500/20",
  },
};

function CoursePreview() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-card/50 text-xs text-muted-foreground mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {courses.length} paths to start
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight leading-[1.1]">
            Start{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Learning Today
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Hands-on courses designed to take you from beginner to confident
            developer — with real exercises, not just videos.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {courses.map((course) => {
            const diff = diffConfig[course.difficulty];
            return (
              <div
                key={course.title}
                className="group relative rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-lg overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    boxShadow: "inset 0 1px 0 0 rgb(255 255 255 / 0.05)",
                    background:
                      course.difficulty === "Beginner"
                        ? "linear-gradient(135deg, rgba(34,197,94,0.03), transparent)"
                        : course.difficulty === "Intermediate"
                          ? "linear-gradient(135deg, rgba(234,179,8,0.03), transparent)"
                          : "linear-gradient(135deg, rgba(239,68,68,0.03), transparent)",
                  }}
                />
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-2xl ${diff.light} flex items-center justify-center mb-4 ring-1 ring-white/5`}
                  >
                    <CourseIcon title={course.title} className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border/30">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${diff.badge}`}
                    >
                      {course.difficulty}
                    </span>
                    <span className="text-muted-foreground/30">&middot;</span>
                    <span className="text-xs text-muted-foreground">
                      {course.chapters}{" "}
                      {course.chapters === 1 ? "chapter" : "chapters"}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Link href="/courses">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground group/btn"
                      >
                        View Course
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-10">
          <Link href="/courses">
            <Button variant="outline" size="lg" className="gap-2">
              View All Courses
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CoursePreview;
