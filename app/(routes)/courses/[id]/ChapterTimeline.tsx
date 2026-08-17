import Link from "next/link";
import {
  Check,
  ChevronRight,
  Clock,
  Coins,
  Code2,
  Monitor,
} from "lucide-react";
import { getCourseLanguage, type Chapter } from "@/lib/course-data";

type ChapterTimelineProps = {
  courseId: number;
  courseTitle: string;
  chapters: Chapter[];
  completedIds: Set<number>;
  nextChapterId: number | null;
};

function estimateMinutes(chapter: Chapter): number {
  const words = chapter.content.instructions?.trim().split(/\s+/).length ?? 0;
  const targetWordsPerMinute = 180;
  return Math.max(1, Math.round(words / targetWordsPerMinute));
}

export default function ChapterTimeline({
  courseId,
  courseTitle,
  chapters,
  completedIds,
  nextChapterId,
}: ChapterTimelineProps) {
  return (
    <div className="relative space-y-3">
      {chapters.map((chapter, index) => {
        const completed = completedIds.has(chapter.id);
        const isNext = chapter.id === nextChapterId;
        const isLast = index === chapters.length - 1;
        const isBrowser = chapter.content.type === "browser";
        const language = getCourseLanguage(courseTitle, chapter.content.type);

        return (
          <div key={chapter.id} className="relative">
            {!isLast && (
              <div
                className={`absolute left-5 top-14 bottom-[-12px] w-px ${
                  completed ? "bg-emerald-500/40" : "bg-border"
                }`}
                aria-hidden
              />
            )}

            <Link
              href={`/learn/${courseId}/${chapter.id}`}
              className={`group flex items-start gap-4 p-4 rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none ${
                isNext
                  ? "border-primary/40 bg-gradient-to-br from-primary/[0.06] via-card to-card hover:border-primary/60"
                  : completed
                    ? "border-border/60 hover:border-emerald-500/40"
                    : "border-border hover:border-border"
              }`}
            >
              <div className="relative shrink-0 mt-0.5">
                {isNext && (
                  <span
                    className="absolute inset-0 rounded-full bg-primary/30 animate-ping"
                    aria-hidden
                  />
                )}
                <div
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ring-4 ${
                    completed
                      ? "bg-emerald-500 text-emerald-950 ring-emerald-500/15"
                      : isNext
                        ? "bg-primary text-primary-foreground ring-primary/15"
                        : "bg-muted text-muted-foreground ring-border/40"
                  }`}
                >
                  {completed ? (
                    <Check className="w-5 h-5" strokeWidth={3} />
                  ) : (
                    index + 1
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    className={`font-semibold text-sm leading-5 group-hover:text-primary transition-colors ${
                      completed ? "text-muted-foreground" : ""
                    }`}
                  >
                    {chapter.title}
                  </h3>
                  {isNext && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                      <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                      Continue here
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Code2 className="w-3 h-3" />
                    {language}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    {isBrowser ? (
                      <Monitor className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {isBrowser
                      ? "Browser preview"
                      : `~${estimateMinutes(chapter)} min`}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-500/90 dark:text-amber-400/90">
                    <Coins className="w-3 h-3" />+{chapter.points_reward ?? 0}{" "}
                    pts
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-2 shrink-0" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
