import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Play,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseIcon from "@/components/CourseIcon";
import { getEnrollmentsByEmail } from "@/lib/enroll-data";
import { difficultyBadgeClass, difficultyIconClass } from "@/lib/interview-ui";

async function ContinueLearning({ email }: { email: string }) {
  const enrollments = await getEnrollmentsByEmail(email);
  const current = enrollments.find((e) => !e.completed_at);

  if (!current) {
    const allDone = enrollments.length > 0;
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 sm:p-10">
        <div className="absolute inset-0 bg-grid-paper" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-card/50 text-[11px] text-muted-foreground mb-4">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            {allDone ? "All courses completed" : "No course in progress yet"}
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
            {allDone ? (
              <>
                Outstanding — you finished every{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                  enrolled course
                </span>
              </>
            ) : (
              <>
                Ready to start{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                  building?
                </span>
              </>
            )}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg">
            {allDone
              ? "Pick a new skill, sharpen your interview answers, or grind some DSA problems."
              : "Enroll in a course with hands-on lessons, or dive into interview prep and problem solving."}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button asChild>
              <Link href="/courses">
                Browse Courses
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/interview">
                <Sparkles className="w-4 h-4 mr-1.5" />
                Interview Prep
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const done = current.completedCount;
  const total = current.totalChapters;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const href = current.nextChapterId
    ? `/learn/${current.course_id}/${current.nextChapterId}`
    : `/courses/${current.course_id}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6 sm:p-8">
      <div className="absolute inset-0 bg-grid-paper" />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-card/50 text-[11px] text-muted-foreground mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Continue Learning
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div
              className={`w-14 h-14 rounded-2xl ${difficultyIconClass(current.course.difficulty)} flex items-center justify-center flex-shrink-0 ring-1 ring-border`}
            >
              <CourseIcon title={current.course.title} className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-display font-bold tracking-tight truncate">
                {current.course.title}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${difficultyBadgeClass(current.course.difficulty)}`}
                >
                  {current.course.difficulty}
                </span>
                <span className="text-xs text-muted-foreground">
                  {current.nextChapterTitle
                    ? `Next up: Chapter ${current.nextChapterNumber} — ${current.nextChapterTitle}`
                    : `${done}/${total} chapters completed`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="text-2xl font-bold tracking-tight">{pct}%</p>
              <p className="text-[11px] text-muted-foreground">
                {done}/{total} chapters
              </p>
            </div>
            <Button asChild size="lg" className="gap-1.5">
              <Link href={href}>
                <Play className="w-4 h-4 fill-current" />
                Resume
              </Link>
            </Button>
          </div>
        </div>

        {total > 0 && (
          <div className="mt-6 h-2 w-full bg-muted/70 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}

        <Link
          href={`/courses/${current.course_id}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-4"
        >
          View course details
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default ContinueLearning;
