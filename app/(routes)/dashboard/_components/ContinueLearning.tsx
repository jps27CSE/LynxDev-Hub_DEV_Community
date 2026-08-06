import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseIcon from "@/components/CourseIcon";
import { getEnrollmentsByEmail } from "@/lib/enroll-data";
import { difficultyIconClass } from "@/lib/interview-ui";

async function ContinueLearning({ email }: { email: string }) {
  const enrollments = await getEnrollmentsByEmail(email);
  const current = enrollments.find((e) => !e.completed_at);

  if (!current) {
    const allDone = enrollments.length > 0;
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold text-sm mb-1">Continue Learning</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {allDone
            ? "You've completed all your enrolled courses. Great work!"
            : "No course in progress yet. Pick one to get started."}
        </p>
        <Link href="/courses" className="mt-4 block">
          <Button size="sm" className="w-full gap-1.5">
            Browse Courses
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const done = current.progress.completedChapters.length;
  const total = current.totalChapters;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const href = `/learn/${current.course_id}/${current.progress.currentChapter}`;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold text-sm mb-4">Continue Learning</h3>
      <div className="flex items-start gap-3">
        <div
          className={`w-11 h-11 rounded-xl ${difficultyIconClass(current.course.difficulty)} flex items-center justify-center flex-shrink-0`}
        >
          <CourseIcon title={current.course.title} className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={href}
            className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1"
            title={current.course.title}
          >
            {current.course.title}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chapter {current.progress.currentChapter} of {total}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-muted-foreground font-medium">
            {done}/{total} chapters
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
      <Link href={href} className="mt-4 block">
        <Button size="sm" className="w-full gap-1.5">
          Resume
          <ChevronRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}

export default ContinueLearning;
