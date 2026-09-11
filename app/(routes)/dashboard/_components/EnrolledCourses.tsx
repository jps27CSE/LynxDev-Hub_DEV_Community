import { BookOpen, ChevronRight, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CourseIcon from "@/components/CourseIcon";
import { difficultyBadgeClass, difficultyIconClass } from "@/lib/interview-ui";
import type { EnrolledCourse } from "@/lib/enroll-data";

const EnrolledCourses = ({
  enrollments,
}: {
  enrollments: EnrolledCourse[];
}) => {
  if (enrollments.length === 0) {
    return (
      <div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-4 sm:mb-6">
          Your Enrolled Courses
        </h2>
        <div className="flex flex-col items-center gap-4 py-12 sm:py-16 px-4 rounded-xl sm:rounded-2xl border border-border bg-card">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-base sm:text-lg">No enrolled courses yet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
              Start your learning journey by enrolling in a course that
              interests you.
            </p>
          </div>
          <Link href="/courses">
            <Button className="mt-2" size="sm">Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            Your Enrolled Courses
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pick up where you left off
          </p>
        </div>
        <Link href="/courses" className="shrink-0">
          <Button variant="outline" size="sm">
            Browse All
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {enrollments.map((enrollment) => {
          const done = enrollment.completedCount;
          const total = enrollment.totalChapters;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <Link
              key={enrollment.id}
              href={
                enrollment.completed_at || !enrollment.nextChapterId
                  ? `/courses/${enrollment.course_id}`
                  : `/learn/${enrollment.course_id}/${enrollment.nextChapterId}`
              }
              className="group relative rounded-xl sm:rounded-2xl border border-border/50 bg-card p-3 sm:p-4 lg:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none overflow-hidden"
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
              <div className="flex items-start gap-3 sm:gap-4 relative">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl ${difficultyIconClass(enrollment.course.difficulty)} flex items-center justify-center flex-shrink-0 ring-1 ring-border`}
                >
                  <CourseIcon
                    title={enrollment.course.title}
                    className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h3
                      className="font-semibold text-xs sm:text-sm group-hover:text-primary transition-colors truncate min-w-0"
                      title={enrollment.course.title}
                    >
                      {enrollment.course.title}
                    </h3>
                    {enrollment.completed_at && (
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-3 mt-1.5 sm:mt-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-medium border ${difficultyBadgeClass(enrollment.course.difficulty)}`}
                    >
                      {enrollment.course.difficulty}
                    </span>
                    {!enrollment.completed_at ? (
                      <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {done}/{total}
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-500 font-medium">
                        Completed
                      </span>
                    )}
                    {enrollment.course.category && (
                      <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
                        {enrollment.course.category}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0 mt-1 sm:mt-2 group-hover:text-foreground transition-colors" />
              </div>
              {!enrollment.completed_at && total > 0 && (
                <div className="mt-3 sm:mt-4">
                  <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">
                      Progress
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 overflow-hidden">
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
