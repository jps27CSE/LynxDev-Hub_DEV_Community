import { BookOpen, ChevronRight, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CourseIcon from "@/components/CourseIcon";
import type { EnrolledCourse } from "@/lib/enroll-data";

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

const EnrolledCourses = ({
  enrollments,
}: {
  enrollments: EnrolledCourse[];
}) => {
  if (enrollments.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Your Enrolled Courses
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Pick up where you left off
            </p>
          </div>
          <Link href="/courses">
            <Button variant="outline" size="sm">
              Browse All
            </Button>
          </Link>
        </div>
        <div className="flex flex-col items-center gap-4 py-16 px-4 rounded-xl border border-border/50 bg-card">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">No enrolled courses yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Start your learning journey by enrolling in a course that
              interests you.
            </p>
          </div>
          <Link href="/courses">
            <Button className="mt-2">Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Your Enrolled Courses
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pick up where you left off
          </p>
        </div>
        <Link href="/courses">
          <Button variant="outline" size="sm">
            Browse All
          </Button>
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {enrollments.map((enrollment) => {
          const done = enrollment.progress.completedChapters.length;
          const total = enrollment.totalChapters;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const diff =
            diffConfig[enrollment.course.difficulty] || diffConfig["Beginner"];

          return (
            <Link
              key={enrollment.id}
              href={
                enrollment.completed_at
                  ? `/courses/${enrollment.course_id}`
                  : `/learn/${enrollment.course_id}/${enrollment.progress.currentChapter}`
              }
              className="group relative rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-sm overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  boxShadow: "inset 0 1px 0 0 rgb(255 255 255 / 0.05)",
                  background:
                    enrollment.course.difficulty === "Beginner"
                      ? "linear-gradient(135deg, rgba(34,197,94,0.03), transparent)"
                      : enrollment.course.difficulty === "Intermediate"
                        ? "linear-gradient(135deg, rgba(234,179,8,0.03), transparent)"
                        : "linear-gradient(135deg, rgba(239,68,68,0.03), transparent)",
                }}
              />
              <div className="flex items-start gap-4 relative">
                <div
                  className={`w-12 h-12 rounded-xl ${diff.light} flex items-center justify-center flex-shrink-0 ring-1 ring-white/5`}
                >
                  <CourseIcon
                    title={enrollment.course.title}
                    className="w-6 h-6"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                      {enrollment.course.title}
                    </h3>
                    {enrollment.completed_at && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${diff.badge}`}
                    >
                      {enrollment.course.difficulty}
                    </span>
                    <span className="text-muted-foreground/30">&middot;</span>
                    {!enrollment.completed_at ? (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {done}/{total} chapters
                      </span>
                    ) : (
                      <span className="text-xs text-green-500 font-medium">
                        Completed
                      </span>
                    )}
                    {enrollment.course.category && (
                      <>
                        <span className="text-muted-foreground/30">
                          &middot;
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {enrollment.course.category}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-2 group-hover:text-foreground transition-colors" />
              </div>
              {!enrollment.completed_at && total > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Progress
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default EnrolledCourses;
