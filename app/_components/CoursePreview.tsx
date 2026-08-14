import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CourseIcon from "@/components/CourseIcon";
import { difficultyBadgeClass, difficultyIconClass } from "@/lib/interview-ui";

const courses = [
  {
    title: "Learn HTML — Build Websites From Scratch",
    description:
      "Semantic markup, forms, tables, and accessibility — build real multi-page sites starting from your first chapter.",
    difficulty: "Beginner" as const,
    chapters: 14,
  },
  {
    title: "CSS Essentials — Style the Web",
    description:
      "Colors, the box model, flexbox, and positioning — style complete layouts like profile cards and hero sections.",
    difficulty: "Beginner" as const,
    chapters: 14,
  },
  {
    title: "JavaScript Fundamentals — Code It Yourself",
    description:
      "Variables, functions, arrays, and objects — write and run real programs in the embedded browser editor.",
    difficulty: "Beginner" as const,
    chapters: 14,
  },
];

function CoursePreview() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-[#05060a]">
      <div className="absolute inset-0 bg-grid-paper" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 h-64 w-[50rem] rounded-full bg-cyan-500/[0.07] blur-[120px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] font-mono text-xs text-muted-foreground mb-5">
            <span className="neon-pulse w-1.5 h-1.5 rounded-full bg-lime-400" />
            <span className="text-lime-400">$</span> {courses.length} paths to
            start
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight leading-[1.1] text-balance">
            Start <span className="neon-text-gradient">learning today</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Hands-on courses designed to take you from beginner to confident
            developer — with real exercises, not just videos.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            return (
              <div
                key={course.title}
                className="group relative rounded-2xl border border-white/10 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_28px_rgba(34,211,238,0.14)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    boxShadow: "inset 0 1px 0 0 rgb(255 255 255 / 0.05)",
                    background:
                      course.difficulty === "Beginner"
                        ? "linear-gradient(135deg, rgba(34,211,238,0.06), transparent)"
                        : course.difficulty === "Intermediate"
                          ? "linear-gradient(135deg, rgba(232,121,249,0.06), transparent)"
                          : "linear-gradient(135deg, rgba(239,68,68,0.06), transparent)",
                  }}
                />
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-2xl ${difficultyIconClass(course.difficulty)} flex items-center justify-center mb-4 ring-1 ring-white/10`}
                  >
                    <CourseIcon title={course.title} className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-base group-hover:text-cyan-200 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border/30">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${difficultyBadgeClass(course.difficulty)}`}
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
