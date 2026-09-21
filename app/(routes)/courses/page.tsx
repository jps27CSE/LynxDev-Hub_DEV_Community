import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Code2, GraduationCap, Trophy } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import CourseIcon from "@/components/CourseIcon";
import { getEnrollmentsByClerkId } from "@/lib/enroll-data";
import { difficultyBadgeClass, difficultyIconClass } from "@/lib/interview-ui";
import { getAllCourses } from "@/lib/course-data";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Free web development courses — HTML, CSS, JavaScript, React, and more. Learn by coding hands-on lessons in the browser.",
};

const howItWorks = [
  {
    icon: GraduationCap,
    title: "Enroll in a course",
    description:
      "Pick a track that matches your goal — HTML, JavaScript, React, and more — and enroll in seconds.",
    accent: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: Code2,
    title: "Code hands-on lessons",
    description:
      "Learn by building: read short lessons, write real code in the browser editor, and run it instantly.",
    accent: "bg-sky-500/10 text-sky-500",
  },
  {
    icon: Trophy,
    title: "Earn points & track progress",
    description:
      "Complete chapters to earn points while watching your progress bar fill up.",
    accent: "bg-amber-500/10 text-amber-500",
  },
];

export default async function CoursesPage() {
  const publishedCourses = await getAllCourses();

  const { userId } = await auth();
  const enrollments = userId ? await getEnrollmentsByClerkId(userId) : [];
  const enrollmentByCourse = new Map(enrollments.map((e) => [e.course_id, e]));

  return (
    <>
      <div className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-grid-paper" />
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
                {publishedCourses.length} courses available
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.1]">
                Learn to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-500/60">
                  Build
                </span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Hands-on courses with coding exercises, real projects, and a
                structured curriculum designed to take you from beginner to
                proficient.
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
            {
              publishedCourses.filter((c) => c.difficulty === "Beginner").length
            }{" "}
            Beginner
            <span className="mx-1.5 text-muted-foreground/30">&middot;</span>
            {
              publishedCourses.filter((c) => c.difficulty === "Intermediate")
                .length
            }{" "}
            Intermediate
            <span className="mx-1.5 text-muted-foreground/30">&middot;</span>
            {
              publishedCourses.filter((c) => c.difficulty === "Advanced").length
            }{" "}
            Advanced
          </div>
        </div>

        {publishedCourses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              No courses available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {publishedCourses.map((course) => {
              const chapterCount = course.chapter_count;
              const enrollment = enrollmentByCourse.get(course.id) ?? null;
              const coursePct =
                enrollment && enrollment.totalChapters > 0
                  ? Math.round(
                      (enrollment.completedCount / enrollment.totalChapters) *
                        100,
                    )
                  : 0;

              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group relative rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none overflow-hidden"
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
                      className={`w-14 h-14 rounded-2xl ${difficultyIconClass(course.difficulty)} flex items-center justify-center flex-shrink-0 ring-1 ring-border`}
                    >
                      <CourseIcon title={course.title} className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-lg leading-7 line-clamp-2 min-h-14 group-hover:text-emerald-500 transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border/30 relative">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${difficultyBadgeClass(course.difficulty)}`}
                    >
                      {course.difficulty}
                    </span>
                    <span className="text-muted-foreground/30">&middot;</span>
                    <span className="text-xs text-muted-foreground">
                      {chapterCount}{" "}
                      {chapterCount === 1 ? "chapter" : "chapters"}
                    </span>
                    {course.category && (
                      <>
                        <span className="text-muted-foreground/30">
                          &middot;
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {course.category}
                        </span>
                      </>
                    )}
                  </div>

                  {enrollment && (
                    <div className="relative mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[11px] font-medium ${
                            coursePct === 100
                              ? "text-emerald-500"
                              : "text-primary"
                          }`}
                        >
                          {coursePct === 100 ? "Completed" : "In progress"}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {enrollment.completedCount}/{enrollment.totalChapters}{" "}
                          chapters
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            coursePct === 100
                              ? "bg-emerald-500"
                              : "bg-gradient-to-r from-primary to-primary/60"
                          }`}
                          style={{ width: `${coursePct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-semibold">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          {howItWorks.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${step.accent} flex items-center justify-center flex-shrink-0`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-3xl font-display font-bold text-muted-foreground/20">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-semibold mt-4">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
