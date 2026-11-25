"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useCompletedLessons } from "@/hooks/useDsaProgress";
import {
  nextIncompleteLesson,
  partNumber,
  progressRatio,
  type DsaModuleOverview,
  type DsaTotals,
} from "@/lib/dsa/view-model";

type Props = {
  modules: DsaModuleOverview[];
  totals: DsaTotals;
};

/**
 * The syllabus.
 *
 * Shaped as a ledger, not a card grid, because that is what the content is: 18
 * ordered rows with a position, a size and a completion state. A grid of equal
 * cards throws away the ordering — which is the one thing a curriculum has that
 * a list of articles does not.
 *
 * Part headings carry the difficulty tier. There is no separate "difficulty"
 * field to invent chips from, and `part` already means exactly that.
 */
export default function DsaIndexView({ modules, totals }: Props) {
  const completed = useCompletedLessons();

  const known = new Set(
    modules.flatMap((module) =>
      module.sequence.map((entry) => `${module.slug}/${entry.slug}`),
    ),
  );
  const doneCount = completed.filter((key) => known.has(key)).length;
  const ratio = progressRatio(doneCount, totals.lessons);
  const resume = nextIncompleteLesson(modules, completed);

  const parts = [...new Set(modules.map((module) => module.part))].sort(
    (a, b) => a - b,
  );

  return (
    <div className="cp-scope">
      {/* `pt-16` on phones, not `pt-10`: `AppShell`'s sidebar toggle is a
          fixed 36px button at top-3 (bottom edge 48px), so anything less than
          ~64px puts the page title underneath it. It is `lg:hidden`, which is
          why the desktop padding stays small. */}
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pt-10">
        <header>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Data structures &amp; algorithms
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Lessons, step-through animations, runnable code and build tasks in
            one ordered path. Read the idea, watch it move, then write it until
            the tests pass.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <span className="cp-tabular">{totals.modules} modules</span>
            <span aria-hidden="true">·</span>
            <span className="cp-tabular">{totals.lessons} lessons</span>
            <span aria-hidden="true">·</span>
            <span className="cp-tabular">{totals.tasks} build tasks</span>
          </div>

          {/*
            The progress line only appears once the store knows something.
            Rendering "0 / 54" before the fetch lands would flash a number that
            is almost certainly wrong for a returning learner.
          */}
          {completed.length > 0 || doneCount > 0 ? (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div
                className="h-1 w-full max-w-56 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={totals.lessons}
                aria-valuenow={doneCount}
                aria-label="Lessons completed"
              >
                <div
                  className="h-full rounded-full bg-cp-accent transition-[width] duration-500"
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
              <span className="cp-tabular text-sm text-muted-foreground">
                {doneCount} / {totals.lessons} lessons
                {doneCount === totals.lessons ? " — path complete" : ""}
              </span>
            </div>
          ) : null}
        </header>

        {resume ? (
          <Link
            href={`/dsa/${resume.moduleSlug}/lesson/${resume.lessonSlug}`}
            className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-cp-accent transition-colors hover:text-cp-accent/80"
          >
            {doneCount > 0 ? "Continue" : "Start"} — {resume.title}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        ) : null}

        <div className="mt-12">
          {parts.map((part) => {
            const inPart = modules.filter((module) => module.part === part);
            return (
              <section key={part} className="mt-10 first:mt-0">
                <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
                  <h2 className="font-display text-lg font-medium tracking-tight">
                    Part {partNumber(part)} — {inPart[0].partTitle}
                  </h2>
                  <span className="cp-tabular text-xs text-muted-foreground">
                    {inPart.length} module{inPart.length === 1 ? "" : "s"}
                  </span>
                </div>

                <ol>
                  {inPart.map((module) => {
                    const done = module.sequence.filter((entry) =>
                      completed.includes(`${module.slug}/${entry.slug}`),
                    ).length;
                    const complete =
                      module.sequence.length > 0 &&
                      done === module.sequence.length;

                    return (
                      <li key={module.slug}>
                        <Link
                          href={`/dsa/${module.slug}`}
                          className="group grid grid-cols-[2.25rem_1fr_auto] items-center gap-x-4 border-b border-border/40 py-3.5 transition-colors hover:bg-muted/30"
                        >
                          <span
                            className={`cp-tabular pl-1 font-mono text-xs ${
                              complete
                                ? "text-cp-pass"
                                : "text-muted-foreground group-hover:text-cp-accent"
                            }`}
                          >
                            {String(module.order).padStart(2, "0")}
                          </span>

                          <span className="min-w-0">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-[0.95rem] font-medium transition-colors group-hover:text-cp-accent">
                                {module.title}
                              </span>
                              {complete ? (
                                <Check
                                  className="h-3.5 w-3.5 shrink-0 text-cp-pass"
                                  aria-label="Completed"
                                />
                              ) : null}
                            </span>
                            <span className="mt-0.5 line-clamp-1 text-[13px] text-muted-foreground">
                              {module.description}
                            </span>
                          </span>

                          <span className="flex items-center gap-4 pr-1">
                            <span className="cp-tabular hidden text-xs text-muted-foreground sm:block">
                              {module.lessons.length} lesson
                              {module.lessons.length === 1 ? "" : "s"}
                              {module.hasTask ? " · task" : ""}
                            </span>
                            <span
                              className={`cp-tabular w-9 text-right font-mono text-xs ${
                                done > 0
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                              aria-label={`${done} of ${module.sequence.length} lessons complete`}
                            >
                              {done}/{module.sequence.length}
                            </span>
                            <ArrowRight
                              className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-cp-accent"
                              aria-hidden="true"
                            />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
