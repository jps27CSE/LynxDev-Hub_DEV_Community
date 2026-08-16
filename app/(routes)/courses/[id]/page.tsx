import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Coins,
  Layers,
  Play,
  Trophy,
} from "lucide-react";
import { getCourseById, getChaptersByCourseId } from "@/lib/course-data";
import { getEnrollmentsByEmail } from "@/lib/enroll-data";
import { difficultyBadgeClass, difficultyIconClass } from "@/lib/interview-ui";
import EnrollButton from "./EnrollButton";
import CourseIcon from "@/components/CourseIcon";
import ChapterTimeline from "./ChapterTimeline";
import type { Chapter } from "@/lib/course-data";

function totalPoints(chapters: Chapter[]): number {
  return chapters.reduce((sum, c) => sum + (c.points_reward ?? 0), 0);
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseId = parseInt(id);
  if (!Number.isInteger(courseId)) {
    notFound();
  }
  const course = await getCourseById(courseId);
  const chapterList = await getChaptersByCourseId(courseId);

  if (!course) {
    notFound();
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;
  const enrollments = email ? await getEnrollmentsByEmail(email) : [];
  const enrollment = enrollments.find((e) => e.course_id === courseId) ?? null;

  const completedIds = new Set(
    enrollment?.progress.completedChapters ?? ([] as number[]),
  );
  const completedCount = chapterList.filter((c) =>
    completedIds.has(c.id),
  ).length;
  const isEnrolled = Boolean(enrollment);
  const courseComplete =
    isEnrolled &&
    chapterList.length > 0 &&
    completedCount === chapterList.length;
  const pct =
    isEnrolled && chapterList.length > 0
      ? Math.round((completedCount / chapterList.length) * 100)
      : 0;
  const resumeHref = enrollment?.nextChapterId
    ? `/learn/${courseId}/${enrollment.nextChapterId}`
    : `/learn/${courseId}/${chapterList[0]?.id}`;
  const points = totalPoints(chapterList);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="mb-6">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>
      </nav>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-card mb-10">
        <div className="absolute inset-0 bg-grid-paper" aria-hidden />
        <div
          className={`absolute -top-32 -right-24 w-96 h-96 rounded-full blur-3xl ${
            course.difficulty === "Beginner"
              ? "bg-emerald-500/10"
              : course.difficulty === "Intermediate"
                ? "bg-yellow-500/10"
                : "bg-red-500/10"
          }`}
          aria-hidden
        />

        <div className="relative p-6 sm:p-8">
          <div className="flex items-start gap-4 sm:gap-5">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${difficultyIconClass(course.difficulty)} flex items-center justify-center flex-shrink-0 ring-1 ring-border`}
            >
              <CourseIcon
                title={course.title}
                className="w-8 h-8 sm:w-9 sm:h-9"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
                  {course.title}
                </h1>
                <Badge
                  variant="outline"
                  className={`${difficultyBadgeClass(course.difficulty)}`}
                >
                  {course.difficulty}
                </Badge>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
                {course.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 sm:gap-7 mt-5 pt-5 border-t border-border/40 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Layers className="w-3.5 h-3.5" />
              {chapterList.length}{" "}
              {chapterList.length === 1 ? "chapter" : "chapters"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Coins className="w-3.5 h-3.5" />
              {points} pts to earn
            </span>
            {course.category && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Trophy className="w-3.5 h-3.5" />
                {course.category}
              </span>
            )}
          </div>

          {isEnrolled && chapterList.length > 0 && (
            <div className="mt-6 rounded-2xl border border-border/50 bg-background/60 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      courseComplete
                        ? "bg-emerald-500"
                        : "bg-primary animate-pulse"
                    }`}
                  />
                  <p className="text-sm font-medium truncate">
                    {courseComplete
                      ? "Course completed — great work!"
                      : enrollment?.nextChapterTitle
                        ? `Next up: ${enrollment.nextChapterTitle}`
                        : "Course in progress"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xl font-bold tracking-tight leading-none">
                      {pct}%
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {completedCount}/{chapterList.length} chapters
                    </p>
                  </div>
                  <Button asChild size="lg" className="gap-1.5">
                    <Link href={resumeHref}>
                      {courseComplete ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Review
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          Resume
                        </>
                      )}
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    courseComplete
                      ? "bg-emerald-500"
                      : "bg-gradient-to-r from-primary to-primary/60"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {!isEnrolled && chapterList.length > 0 && (
            <div className="flex items-center gap-3 mt-6 flex-wrap">
              <EnrollButton courseId={course.id} />
              <Button asChild size="lg" variant="outline" className="gap-1.5">
                <Link href={resumeHref}>
                  Start Learning
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Course Content</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isEnrolled && chapterList.length > 0
              ? `${completedCount}/${chapterList.length} completed`
              : "A guided path through every lesson"}
          </p>
        </div>
        {isEnrolled && chapterList.length > 0 && (
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
              courseComplete
                ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                : "text-primary border-primary/30 bg-primary/10"
            }`}
          >
            {courseComplete ? "Completed" : `${pct}% done`}
          </span>
        )}
      </div>

      {chapterList.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card text-center py-16">
          <div className="absolute inset-0 bg-grid-paper" aria-hidden />
          <div className="relative">
            <p className="text-muted-foreground">
              No chapters available yet. Check back soon!
            </p>
          </div>
        </div>
      ) : (
        <ChapterTimeline
          courseId={course.id}
          courseTitle={course.title}
          chapters={chapterList}
          completedIds={completedIds}
          nextChapterId={enrollment?.nextChapterId ?? null}
        />
      )}
    </div>
  );
}
