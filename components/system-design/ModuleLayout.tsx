"use client";

import Link from "next/link";
import type {
  SdChapter,
  SdInterviewByte,
  SdModuleKind,
} from "@/config/system-design/types";
import { lessonNav } from "@/lib/system-design/content-rules";
import { useState } from "react";

/**
 * The module overview, trimmed to what this page actually renders.
 *
 * Deliberately not `SdModule`: that would ship every lesson's prose *and* the
 * task's `startGraph`/`solutionGraph` in the page payload, none of which this
 * component reads. Measured before the trim: 65 kB of HTML for a 3-lesson
 * module; with the new 700–900 word lessons and a 10-lesson module (caching,
 * Slice B4) the same shape would have been several hundred kilobytes of JSON
 * repeated in the RSC payload. Only counts cross the boundary.
 */
export type ModuleOverview = {
  slug: string;
  order: number;
  part: number;
  partTitle: string;
  kind: SdModuleKind;
  title: string;
  description: string;
  story: string;
  chapters?: SdChapter[];
  lessons: LessonSummary[];
  interviewByte: SdInterviewByte;
  task: { brief: string };
  recap: string[];
  attribution: string;
};

export type LessonSummary = {
  slug: string;
  title: string;
  sectionCount: number;
  sourceCount: number;
};

/**
 * The module page shell: chapter tree on the left, reading column in the
 * middle, on-page nav on the right.
 *
 * **The tree is the point of this file.** Until Slice B1, `module.chapters` was
 * passed to this component and then dropped on the floor: the rail rendered
 * `module.lessons` as a flat list, so an authored outline of 75 chapter entries
 * across 10 modules was invisible, and the module that promised a
 * "Scalability Patterns" lesson did not have one. Now the outline is what the
 * learner navigates, and `lib/system-design/content-rules.ts` fails CI if a
 * leaf and a lesson disagree in either direction.
 *
 * Modules that have not been converted yet (no bound leaves) still fall back to
 * the flat lesson list. That is deliberately visible rather than silent: the
 * gate prints each one as a warning on every run until its slice lands.
 */
export function ModuleLayout({ module }: { module: ModuleOverview }) {
  const [railOpen, setRailOpen] = useState(true);
  const hasTask = module.kind === "sim";

  return (
    <div className="sd-scope flex h-[100dvh] flex-col overflow-hidden">
      {/* Top progress strip */}
      <div className="h-1 shrink-0 bg-muted/40">
        <div className="h-full w-full bg-gradient-to-r from-sd-accent/60 via-sd-accent to-sd-info/60" />
      </div>

      <div className="flex flex-1 overflow-hidden gap-6 pl-2 pr-4 py-6 sm:px-6 lg:gap-8 lg:px-8 lg:py-8">
        {/* Left lesson rail */}
        <aside
          className={`hidden shrink-0 overflow-y-auto lg:block ${railOpen ? "w-64" : "w-12"} transition-[width] duration-200`}
        >
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <Link
                href="/system-design"
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              >
                ← All modules
              </Link>
              <button
                type="button"
                onClick={() => setRailOpen((v) => !v)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={
                  railOpen ? "Collapse lesson list" : "Expand lesson list"
                }
              >
                {railOpen ? "‹" : "›"}
              </button>
            </div>

            {railOpen && (
              <>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sd-accent">
                    Part {module.part} · {module.partTitle}
                  </p>
                  <h2 className="mt-1 text-base font-semibold tracking-tight">
                    {module.title}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {module.lessons.length} lessons
                    {hasTask ? " · build task" : ""}
                  </p>
                </div>

                <LessonRail module={module} />
              </>
            )}
          </div>
        </aside>

        {/* Main reading column */}
        <div className="min-w-0 flex-1 max-w-6xl overflow-y-auto pr-2">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 text-sm text-muted-foreground"
          >
            <Link
              href="/system-design"
              className="transition-colors hover:text-foreground"
            >
              System design
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <span aria-current="page" className="text-foreground">
              {module.title}
            </span>
          </nav>

          {/*
            Below `lg` the rail is `display:none`, so the tree would be
            unreachable. A `<details>` disclosure rather than a fixed-position
            drawer: this page has no overlay in it, so there is no z-index to
            negotiate and nothing to collide with the app sidebar toggle — the
            failure recorded in feature-tracker 4.7. It is static markup, so the
            duplicate copy costs bytes and no behaviour.
          */}
          <details className="mb-6 rounded-xl border border-border bg-card px-4 py-3 lg:hidden">
            <summary className="cursor-pointer font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Contents · {module.lessons.length} lessons
            </summary>
            <div className="mt-4">
              <LessonRail module={module} />
            </div>
          </details>

          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <span>
                Part {module.part}: {module.partTitle}
              </span>
              <span aria-hidden="true">·</span>
              <span>Module {String(module.order).padStart(2, "0")}</span>
              <span aria-hidden="true">·</span>
              <span>{module.kind === "sim" ? "Simulated" : "Reading"}</span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              {module.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              {module.description}
            </p>
          </header>

          {/* Story */}
          <section
            aria-labelledby="story-heading"
            className="mb-10 rounded-2xl border border-sd-accent/20 bg-sd-accent-soft/40 p-6 sm:p-8"
          >
            <h2
              id="story-heading"
              className="font-mono text-xs uppercase tracking-[0.2em] text-sd-accent"
            >
              Where we are
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-lg leading-8">
              {module.story}
            </p>
          </section>

          {/* Lessons */}
          <section aria-labelledby="lessons-heading" className="mb-10">
            <div className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Read · reason · apply
                </p>
                <h2
                  id="lessons-heading"
                  className="mt-2 text-2xl font-semibold tracking-tight"
                >
                  Lessons
                </h2>
              </div>
              <span className="font-mono text-sm text-muted-foreground">
                {module.lessons.length} total
              </span>
            </div>

            {module.lessons.length === 0 ? (
              <p className="py-8 text-sm text-muted-foreground">
                Lessons for this module are being prepared.
              </p>
            ) : (
              <ol className="space-y-3">
                {module.lessons.map((lesson, index) => (
                  <li key={lesson.slug}>
                    <Link
                      href={`/system-design/${module.slug}/lesson/${lesson.slug}`}
                      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-sd-accent/40 hover:shadow-sm"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sd-accent-soft font-mono text-sm font-semibold text-sd-accent">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium group-hover:text-sd-accent">
                          {lesson.title}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {lesson.sectionCount} sections
                          {lesson.sourceCount > 0
                            ? ` · ${lesson.sourceCount} free read${lesson.sourceCount === 1 ? "" : "s"}`
                            : ""}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-sd-accent transition-transform group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Interview byte */}
          <section
            aria-labelledby="interview-heading"
            className="mb-10 rounded-2xl border border-border bg-card p-6 sm:p-8"
          >
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-sd-accent">
              Interview byte
            </p>
            <h2 id="interview-heading" className="mt-2 text-xl font-semibold">
              Make the answer count
            </h2>
            <div className="mt-5 grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Shape
                </h3>
                <p className="mt-2 text-sm leading-relaxed">
                  {module.interviewByte.shape}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Strong answer
                </h3>
                <p className="mt-2 text-sm leading-relaxed">
                  {module.interviewByte.strongAnswer}
                </p>
              </div>
              <div className="rounded-xl border-l-4 border-sd-warn bg-sd-warn/5 pl-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-sd-warn">
                  The trap
                </h3>
                <p className="mt-2 text-sm leading-relaxed">
                  {module.interviewByte.trap}
                </p>
              </div>
            </div>
          </section>

          {/* Build task — prose modules have no canvas, so no dead CTA */}
          {hasTask && (
            <section
              aria-labelledby="build-heading"
              className="mb-10 rounded-2xl border border-sd-accent/30 bg-gradient-to-br from-sd-accent-soft/60 to-card p-6 sm:p-8"
            >
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-sd-accent">
                Build task
              </p>
              <h2
                id="build-heading"
                className="mt-2 text-2xl font-semibold tracking-tight"
              >
                Put the design under load.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {module.task.brief}
              </p>
              <Link
                href={`/system-design/${module.slug}/task`}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sd-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sd-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sd-accent focus-visible:ring-offset-2"
              >
                Open build task <span aria-hidden="true">→</span>
              </Link>
            </section>
          )}

          {/* Recap */}
          <section
            aria-labelledby="recap-heading"
            className="mt-10 border-t border-border pt-8"
          >
            <h2 id="recap-heading" className="text-xl font-semibold">
              Keep in mind
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {module.recap.map((point, index) => (
                <li
                  key={`${index}-${point}`}
                  className="flex gap-3 rounded-xl border border-border bg-card p-4 text-sm leading-6 text-muted-foreground"
                >
                  <span aria-hidden="true" className="font-mono text-sd-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-xs leading-5 text-muted-foreground">
              Content synthesis: {module.attribution}
            </p>
          </section>
        </div>

        {/* Right rail: on-page navigation + progress */}
        <aside className="hidden shrink-0 overflow-y-auto xl:block w-44">
          <div className="space-y-4 pr-1">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                On this page
              </p>
              <nav className="mt-2 space-y-1 text-sm">
                {[
                  ["#story-heading", "Where we are"],
                  ["#lessons-heading", "Lessons"],
                  ["#interview-heading", "Interview byte"],
                  ...(hasTask ? [["#build-heading", "Build task"]] : []),
                  ["#recap-heading", "Keep in mind"],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="block rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-sd-accent-soft hover:text-sd-accent"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Progress
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {module.lessons.length}
              </p>
              <p className="text-xs text-muted-foreground">
                lessons in this module
              </p>
              {hasTask && (
                <Link
                  href={`/system-design/${module.slug}/task`}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sd-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-sd-accent/90"
                >
                  Open build task →
                </Link>
              )}
            </div>

            <Link
              href="/system-design"
              className="block rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              ← All modules
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Groups as `<details>`, leaves as links.
 *
 * No `useState` for expand/collapse: `<details open>` is keyboard accessible,
 * survives with JS disabled, and cannot desynchronise from the DOM. The only
 * state on this page is whether the whole rail is collapsed.
 */
function LessonRail({ module }: { module: ModuleOverview }) {
  const nav = lessonNav(module);
  const positionBySlug = new Map(
    nav.map((entry, index) => [entry.slug, index + 1]),
  );
  const chapters = module.chapters;

  if (!chapters || chapters.length === 0) {
    return (
      <nav aria-label="Lessons in this module" className="space-y-1">
        {nav.map((entry, index) => (
          <Link
            key={entry.slug}
            href={`/system-design/${module.slug}/lesson/${entry.slug}`}
            className="group flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-sd-accent-soft hover:text-sd-accent"
          >
            <span className="mt-0.5 font-mono text-[10px] text-muted-foreground group-hover:text-sd-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1 leading-snug">{entry.title}</span>
          </Link>
        ))}
        {nav.length === 0 && (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            Lessons coming soon.
          </p>
        )}
      </nav>
    );
  }

  return (
    <nav aria-label="Chapters in this module" className="space-y-2">
      {chapters.map((chapter) => {
        const isGroup = Boolean(chapter.children && chapter.children.length);
        if (!isGroup) {
          return (
            <ChapterLeafLink
              key={chapter.slug}
              moduleSlug={module.slug}
              chapter={chapter}
              position={positionBySlug.get(chapter.lessonSlug ?? "")}
            />
          );
        }
        return (
          <details key={chapter.slug} open className="group/chapter">
            <summary className="cursor-pointer rounded-lg px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground">
              {chapter.title}
            </summary>
            <div className="mt-1 space-y-0.5 border-l border-border pl-2">
              {chapter.children?.map((child) => (
                <ChapterLeafLink
                  key={child.slug}
                  moduleSlug={module.slug}
                  chapter={child}
                  position={positionBySlug.get(child.lessonSlug ?? "")}
                />
              ))}
            </div>
          </details>
        );
      })}
    </nav>
  );
}

function ChapterLeafLink({
  moduleSlug,
  chapter,
  position,
}: {
  moduleSlug: string;
  chapter: SdChapter;
  position: number | undefined;
}) {
  // An unbound leaf has no lesson to open. Rendering it as a link would be a
  // 404 the learner can see; the gate reports it as a failure before that.
  if (!chapter.lessonSlug) {
    return (
      <span className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground/70">
        <span className="mt-0.5 font-mono text-[10px]">--</span>
        <span className="min-w-0 flex-1 leading-snug">{chapter.title}</span>
        <span className="font-mono text-[9px] uppercase">soon</span>
      </span>
    );
  }

  return (
    <Link
      href={`/system-design/${moduleSlug}/lesson/${chapter.lessonSlug}`}
      className="group flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-sd-accent-soft hover:text-sd-accent"
    >
      <span className="mt-0.5 font-mono text-[10px] text-muted-foreground group-hover:text-sd-accent">
        {position ? String(position).padStart(2, "0") : "--"}
      </span>
      <span className="min-w-0 flex-1 leading-snug">
        {chapter.title}
        {chapter.description ? (
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
            {chapter.description}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
