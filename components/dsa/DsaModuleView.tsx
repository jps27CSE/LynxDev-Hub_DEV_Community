"use client";

import Link from "next/link";
import { ArrowRight, Check, TriangleAlert } from "lucide-react";
import { useCompletedLessons } from "@/hooks/useDsaProgress";
import { partNumber } from "@/lib/dsa/view-model";
import type { DsaLessonSummary, DsaModuleOverview } from "@/lib/dsa/view-model";

/**
 * A module's front page.
 *
 * The old version rendered `chapters` and `lessons` as two separate lists of the
 * same four things — every chapter in DSA content binds exactly one lesson, so
 * the page showed each entry twice and numbered neither. One ordered list now,
 * because the order is the information.
 *
 * `recap` was authored on all 18 modules and never rendered anywhere. It is the
 * module's own "what you should be able to say afterwards", which is the most
 * useful thing on this page after the lesson list.
 */
export default function DsaModuleView({
  module,
}: {
  module: DsaModuleOverview;
}) {
  const completed = useCompletedLessons();
  const lessonBySlug = new Map(
    module.lessons.map((lesson) => [lesson.slug, lesson]),
  );
  const doneCount = module.sequence.filter((entry) =>
    completed.includes(`${module.slug}/${entry.slug}`),
  ).length;

  return (
    <div className="cp-scope">
      {/* `pt-16` clears the fixed mobile sidebar toggle (36px at top-3). */}
      <div className="mx-auto grid max-w-6xl gap-x-12 gap-y-10 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:px-8 lg:pt-10">
        {/* Desktop only. The article below already lists every lesson with its
            number and state, so repeating that list above the title on a phone
            would recreate the duplication this page exists to remove. Not
            sticky either: `main` in AppShell is `overflow-hidden`, which makes
            it the nearest scrolling ancestor for a `position: sticky`
            descendant, and it never scrolls — the rail would silently sit
            still and pretend to work. */}
        <aside className="hidden lg:block" aria-label="Module contents">
          <Link
            href="/dsa"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All modules
          </Link>

          <div className="mt-6 flex items-baseline justify-between gap-2 border-b border-border pb-2">
            <h2 className="font-display text-sm font-medium">Contents</h2>
            <span className="cp-tabular text-xs text-muted-foreground">
              {doneCount}/{module.sequence.length}
            </span>
          </div>

          <ol className="mt-2">
            {module.sequence.map((entry, index) => {
              const done = completed.includes(`${module.slug}/${entry.slug}`);
              return (
                <li key={entry.slug}>
                  <Link
                    href={`/dsa/${module.slug}/lesson/${entry.slug}`}
                    className="group flex items-start gap-2.5 py-1.5"
                  >
                    <span
                      className={`cp-tabular mt-0.5 w-4 shrink-0 font-mono text-[11px] ${
                        done ? "text-cp-pass" : "text-muted-foreground"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 text-[13px] leading-snug text-foreground/75 transition-colors group-hover:text-cp-accent">
                      {entry.title}
                    </span>
                    {done ? (
                      <Check
                        className="mt-0.5 h-3 w-3 shrink-0 text-cp-pass"
                        aria-label="Completed"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ol>

          {module.hasTask ? (
            <Link
              href={`/dsa/${module.slug}/task`}
              className="group mt-2 flex items-center gap-2 border-t border-border/60 pt-2.5 text-[13px] text-foreground/75 transition-colors hover:text-cp-accent"
            >
              <span className="mt-0.5 w-4 shrink-0 font-mono text-[11px] text-muted-foreground">
                ★
              </span>
              Build task
              <ArrowRight
                className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </Link>
          ) : null}
        </aside>

        {/* Centred while the rail is hidden, left-aligned once it is not. */}
        <div className="mx-auto w-full min-w-0 max-w-3xl lg:mx-0">
          <nav
            aria-label="Breadcrumb"
            className="text-sm text-muted-foreground"
          >
            <Link
              href="/dsa"
              className="transition-colors hover:text-foreground"
            >
              DSA
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <span className="text-foreground">{module.title}</span>
          </nav>

          <header className="mt-6">
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {module.title}
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
              {module.description}
            </p>
            <p className="cp-tabular mt-4 text-xs text-muted-foreground">
              Part {partNumber(module.part)} · {module.partTitle} · Module{" "}
              {String(module.order).padStart(2, "0")} · {module.sequence.length}{" "}
              lessons
            </p>
          </header>

          {/* No panel and no rule: the story is a paragraph that matters, so it
              is set larger and left alone. A coloured left border here is the
              callout cliché this page does not need. */}
          <p className="mt-8 max-w-2xl text-xl leading-9 text-foreground/75">
            {module.story}
          </p>

          <section className="mt-12">
            <h2 className="font-display text-xl font-medium tracking-tight">
              Lessons
            </h2>
            <ol className="mt-3 border-t border-border">
              {module.sequence.map((entry, index) => {
                const lesson = lessonBySlug.get(entry.slug);
                const done = completed.includes(`${module.slug}/${entry.slug}`);
                return (
                  <li key={entry.slug}>
                    <Link
                      href={`/dsa/${module.slug}/lesson/${entry.slug}`}
                      className="group grid grid-cols-[2.25rem_1fr_auto] items-center gap-x-3 border-b border-border/50 py-4 transition-colors hover:bg-muted/30"
                    >
                      <span
                        className={`cp-tabular pl-1 font-mono text-xs ${
                          done ? "text-cp-pass" : "text-muted-foreground"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="text-[0.95rem] font-medium transition-colors group-hover:text-cp-accent">
                            {entry.title}
                          </span>
                          {done ? (
                            <Check
                              className="h-3.5 w-3.5 shrink-0 text-cp-pass"
                              aria-label="Completed"
                            />
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {lesson ? lessonShape(lesson) : "Section"}
                        </span>
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-cp-accent"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>

          {module.interviewByte ? (
            <section className="mt-14">
              <h2 className="font-display text-xl font-medium tracking-tight">
                If they ask
              </h2>
              <dl className="mt-4 divide-y divide-border/60 border-y border-border/60">
                <div className="grid gap-1 py-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6">
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Shape
                  </dt>
                  <dd className="text-[0.95rem] leading-7">
                    {module.interviewByte.shape}
                  </dd>
                </div>
                <div className="grid gap-1 py-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6">
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Strong answer
                  </dt>
                  <dd className="text-[0.95rem] leading-7">
                    {module.interviewByte.strongAnswer}
                  </dd>
                </div>
                <div className="grid gap-1 py-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6">
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-cp-fail/90">
                    <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                    The trap
                  </dt>
                  <dd className="text-[0.95rem] leading-7">
                    {module.interviewByte.trap}
                  </dd>
                </div>
              </dl>
            </section>
          ) : null}

          {module.hasTask && module.taskBrief ? (
            <section className="mt-14">
              <h2 className="font-display text-xl font-medium tracking-tight">
                Build task
              </h2>
              <p className="mt-3 max-w-2xl text-[0.95rem] leading-7 text-muted-foreground">
                {module.taskBrief}
              </p>
              <Link
                href={`/dsa/${module.slug}/task`}
                className="group mt-5 inline-flex items-center gap-2 rounded-lg bg-cp-accent px-4 py-2.5 text-sm font-semibold text-cp-on-accent transition-colors hover:bg-cp-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cp-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Open build task
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </section>
          ) : null}

          <section className="mt-14">
            <h2 className="font-display text-xl font-medium tracking-tight">
              Keep in mind
            </h2>
            <ul className="mt-4 space-y-2.5">
              {module.recap.map((point) => (
                <li key={point} className="flex gap-3 text-[0.95rem] leading-7">
                  <Check
                    className="mt-1.5 h-4 w-4 shrink-0 text-cp-accent"
                    aria-hidden="true"
                  />
                  <span className="text-foreground/85">{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-14 border-t border-border/60 pt-6 text-xs leading-5 text-muted-foreground">
            Content synthesis: {module.attribution}
          </p>
        </div>
      </div>
    </div>
  );
}

/** `5 sections · 1 animation · 2 runnable · 3 min` — the lesson's shape, from data. */
function lessonShape(lesson: DsaLessonSummary): string {
  const bits = [`${lesson.sectionCount} sections`];
  if (lesson.kinds.visual) {
    bits.push(
      `${lesson.kinds.visual} animation${lesson.kinds.visual === 1 ? "" : "s"}`,
    );
  }
  if (lesson.kinds.code) {
    bits.push(`${lesson.kinds.code} runnable`);
  }
  bits.push(`${lesson.readMinutes} min`);
  return bits.join(" · ");
}
