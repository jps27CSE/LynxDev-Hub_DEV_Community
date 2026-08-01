import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/config/db";
import { courses, chapters } from "@/config/schema";
import { eq, count, asc } from "drizzle-orm";
import CourseIcon from "@/components/CourseIcon";

const difficultyConfig: Record<string, { color: string; light: string; badge: string }> = {
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

const ALLOWED_COURSES = [
  "HTML & CSS Fundamentals",
  "JavaScript Essentials",
  "React Development",
  "Angular Development",
  "Node.js Backend",
  "Express.js API Development",
];

export default async function CoursesPage() {
  const allCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.is_published!, true))
    .orderBy(asc(courses.order_index));

  const filteredCourses = allCourses.filter((c) =>
    ALLOWED_COURSES.includes(c.title)
  );

  const chapterCounts = await db
    .select({
      course_id: chapters.course_id,
      value: count(),
    })
    .from(chapters)
    .groupBy(chapters.course_id);

  const countMap = new Map<number, number>();
  for (const row of chapterCounts) {
    countMap.set(row.course_id, Number(row.value));
  }

  return (<>
    <div className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="pt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          <div className="py-16 sm:py-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-card/50 text-xs text-muted-foreground mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {filteredCourses.length} courses available
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.1]">
                Learn to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-500/60">
                  Build
                </span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Hands-on courses with coding exercises, real projects, and a structured curriculum designed to take you from beginner to proficient.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-xl font-semibold">All Courses</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Pick a course and start learning at your own pace
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
            {filteredCourses.filter((c) => c.difficulty === "Beginner").length} Beginner
            <span className="mx-1.5 text-muted-foreground/30">&middot;</span>
            {filteredCourses.filter((c) => c.difficulty === "Intermediate").length} Intermediate
            <span className="mx-1.5 text-muted-foreground/30">&middot;</span>
            {filteredCourses.filter((c) => c.difficulty === "Advanced").length} Advanced
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              No courses available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => {
              const diff = difficultyConfig[course.difficulty] || difficultyConfig["Beginner"];
              const chapterCount = countMap.get(course.id) || 0;

              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
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

                  <div className="flex items-start gap-4 relative">
                    <div
                      className={`w-14 h-14 rounded-2xl ${diff.light} flex items-center justify-center flex-shrink-0 ring-1 ring-white/5`}
                    >
                      <CourseIcon title={course.title} className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-lg group-hover:text-emerald-500 transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border/30 relative">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${diff.badge}`}
                    >
                      {course.difficulty}
                    </span>
                    <span className="text-muted-foreground/30">&middot;</span>
                    <span className="text-xs text-muted-foreground">
                      {chapterCount} {chapterCount === 1 ? "chapter" : "chapters"}
                    </span>
                    {course.category && (
                      <>
                        <span className="text-muted-foreground/30">&middot;</span>
                        <span className="text-xs text-muted-foreground">{course.category}</span>
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
    </div>
  </>);
}
