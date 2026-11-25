"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { UserDetailContext } from "@/context/UserDetailContext";
import VisualPlayer from "./VisualPlayer";
import DsaCodeRunner from "./DsaCodeRunner";
import {
  lessonKey,
  markLessonDone,
  useCompletedLessons,
} from "@/hooks/useDsaProgress";
import type { DsaLesson, DsaLessonSection } from "@/config/dsa/types";

type NavEntry = { slug: string; title: string };

type Props = {
  moduleSlug: string;
  moduleTitle: string;
  lesson: DsaLesson;
  /** Reading order for the whole module — slugs and titles only. */
  nav: NavEntry[];
  position: number;
  readMinutes: number;
  hasTask: boolean;
};

/**
 * A lesson, as a reading surface.
 *
 * Three columns because the three jobs are different: where am I (rail), what
 * does this say (column), what is in it (contents). The centre column owns the
 * scroll — `AppShell`'s `<main>` is `overflow-hidden`, so a `position: sticky`
 * rail inside it would stick to a container that never scrolls and silently do
 * nothing. A child with `h-[100dvh]` and its own `overflow-y-auto` is the only
 * arrangement that actually behaves; the system-design module settled on the
 * same shell for the same reason.
 *
 * Completion is read from `useDsaProgress`, not assumed. The previous version
 * started every lesson `false` and only turned green in the tab where you
 * clicked, so a finished lesson looked unfinished on the next visit.
 */
export default function DsaLessonView({
  moduleSlug,
  moduleTitle,
  lesson,
  nav,
  position,
  readMinutes,
  hasTask,
}: Props) {
  const { setUserDetail } = useContext(UserDetailContext);
  const completedLessons = useCompletedLessons();
  const key = lessonKey(moduleSlug, lesson.slug);
  const isDone = completedLessons.includes(key);

  const [saving, setSaving] = useState(false);
  const [readPct, setReadPct] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const frame = useRef<number | null>(null);

  const index = nav.findIndex((entry) => entry.slug === lesson.slug);
  const prev = index > 0 ? nav[index - 1] : null;
  const next = index >= 0 ? (nav[index + 1] ?? null) : null;

  const onScroll = useCallback(() => {
    if (frame.current !== null) return;
    frame.current = window.requestAnimationFrame(() => {
      frame.current = null;
      const el = scrollerRef.current;
      if (!el) return;
      const scrollable = el.scrollHeight - el.clientHeight;
      const pct = scrollable <= 0 ? 1 : el.scrollTop / scrollable;
      setReadPct(Math.min(1, Math.max(0, pct)));
    });
  }, []);

  useEffect(() => {
    return () => {
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  // Scroll spy. `root` is the centre column, not the viewport: the rail beside
  // it never scrolls, so a viewport-rooted observer would report the wrong
  // thing the moment the lesson is longer than one screen.
  useEffect(() => {
    const root = scrollerRef.current;
    const targets = sectionRefs.current.filter(
      (node): node is HTMLElement => node !== null,
    );
    if (!root || targets.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        if (visible.size === 0) return;
        // Topmost visible section wins; ties break on document order.
        let bestId: string | null = null;
        let bestTop = Number.POSITIVE_INFINITY;
        for (const id of visible) {
          const node = document.getElementById(id);
          if (!node) continue;
          const top = node.getBoundingClientRect().top;
          if (top < bestTop) {
            bestTop = top;
            bestId = id;
          }
        }
        if (bestId) setActiveSection(bestId);
      },
      { root, rootMargin: "-80px 0px -55% 0px", threshold: 0 },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [lesson.slug]);

  useEffect(() => {
    // A new lesson starts at the top, and the first section is the active one.
    const el = scrollerRef.current;
    if (el) el.scrollTop = 0;
    setActiveSection("section-0");
    setReadPct(0);
  }, [lesson.slug]);

  const markComplete = async () => {
    if (isDone || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/dsa/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ moduleSlug, lessonSlug: lesson.slug }),
      });
      if (!res.ok) throw new Error(`save failed (${res.status})`);
      const data = (await res.json()) as {
        points?: number;
        pointsAwarded?: number;
        alreadyCompleted?: boolean;
      };
      markLessonDone(moduleSlug, lesson.slug);
      if (typeof data.points === "number") {
        setUserDetail?.((current) =>
          current ? { ...current, points: data.points as number } : current,
        );
      }
      if (data.alreadyCompleted) {
        toast("Already completed");
      } else {
        toast(`Lesson complete · +${data.pointsAwarded ?? 10} points`, {
          icon: "⭐",
        });
      }
    } catch {
      toast.error("Could not save progress. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const toc = lesson.sections.map((section, i) => ({
    id: `section-${i}`,
    label: sectionLabel(section),
  }));

  return (
    <div className="cp-scope flex h-[100dvh] flex-col overflow-hidden">
      <div className="h-0.5 shrink-0 bg-border/40">
        <div
          className="h-full bg-cp-accent transition-[width] duration-150 ease-out"
          style={{ width: `${readPct * 100}%` }}
        />
      </div>

      <div className="flex flex-1 gap-10 overflow-hidden px-4 sm:px-6 lg:px-8">
        {/* Rail */}
        <aside
          className="hidden w-52 shrink-0 overflow-y-auto py-8 lg:block"
          aria-label="Module lessons"
        >
          <Link
            href={`/dsa/${moduleSlug}`}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← {moduleTitle}
          </Link>

          <div className="mt-6 flex items-baseline justify-between gap-2 border-b border-border/70 pb-2">
            <h2 className="text-xs font-medium">Contents</h2>
            <span className="cp-tabular font-mono text-[10px] text-muted-foreground">
              {String(index + 1).padStart(2, "0")}/
              {String(nav.length).padStart(2, "0")}
            </span>
          </div>

          <ol className="mt-2">
            {nav.map((entry, i) => {
              const active = entry.slug === lesson.slug;
              const done = completedLessons.includes(
                lessonKey(moduleSlug, entry.slug),
              );
              return (
                <li key={entry.slug}>
                  <Link
                    href={`/dsa/${moduleSlug}/lesson/${entry.slug}`}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-start gap-2 py-1.5 ${
                      active ? "text-cp-accent" : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`cp-tabular mt-0.5 w-4 shrink-0 font-mono text-[10px] ${
                        done
                          ? "text-cp-pass"
                          : active
                            ? "text-cp-accent"
                            : "text-muted-foreground/60"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`min-w-0 flex-1 text-xs leading-snug ${
                        active
                          ? "font-medium text-cp-accent"
                          : "group-hover:text-foreground"
                      }`}
                    >
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

          {hasTask ? (
            <Link
              href={`/dsa/${moduleSlug}/task`}
              className="mt-2 flex items-center gap-2 border-t border-border/60 pt-2.5 text-xs text-muted-foreground transition-colors hover:text-cp-accent"
            >
              <span aria-hidden="true" className="font-mono text-[10px]">
                ★
              </span>
              Build task
            </Link>
          ) : null}
        </aside>

        {/* Reading column */}
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          // `pt-16` on phones clears the fixed sidebar toggle; the rail is
          // already hidden there, so this is the only thing near the corner.
          className="min-w-0 flex-1 overflow-y-auto pb-8 pl-0.5 pr-1 pt-16 lg:pt-8"
        >
          <div className="mx-auto max-w-[46rem]">
            <nav
              aria-label="Breadcrumb"
              className="text-xs text-muted-foreground"
            >
              <Link
                href="/dsa"
                className="transition-colors hover:text-foreground"
              >
                DSA
              </Link>
              <span aria-hidden="true" className="mx-1.5">
                /
              </span>
              <Link
                href={`/dsa/${moduleSlug}`}
                className="transition-colors hover:text-foreground"
              >
                {moduleTitle}
              </Link>
              <span aria-hidden="true" className="mx-1.5">
                /
              </span>
              <span aria-current="page" className="text-foreground/80">
                {lesson.title}
              </span>
            </nav>

            <header className="mt-6">
              <div className="cp-tabular flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-muted-foreground">
                <span>
                  Lesson {String(position).padStart(2, "0")} /{" "}
                  {String(nav.length).padStart(2, "0")}
                </span>
                <span aria-hidden="true">·</span>
                <span>{readMinutes} min read</span>
                <span aria-hidden="true">·</span>
                <span>
                  {lesson.sections.length} section
                  {lesson.sections.length === 1 ? "" : "s"}
                </span>
              </div>
              <h1 className="mt-3 font-display text-[2rem] font-semibold leading-[1.12] tracking-tight sm:text-[2.6rem]">
                {lesson.title}
              </h1>
            </header>

            {/*
              Phone navigation. A `<details>` rather than a drawer: this page
              has no overlay, so there is no z-index to negotiate with the app
              sidebar toggle — the collision recorded in feature-tracker 4.7.
            */}
            <details className="mt-7 rounded-lg border border-border/70 px-4 py-3 lg:hidden">
              <summary className="cursor-pointer text-xs text-muted-foreground">
                Contents · {nav.length} lessons
              </summary>
              <ol className="mt-3 space-y-1">
                {nav.map((entry, i) => (
                  <li key={entry.slug}>
                    <Link
                      href={`/dsa/${moduleSlug}/lesson/${entry.slug}`}
                      className={`flex gap-2 text-[13px] ${
                        entry.slug === lesson.slug
                          ? "text-cp-accent"
                          : "text-foreground/75"
                      }`}
                    >
                      <span className="cp-tabular w-4 shrink-0 font-mono text-[10px] text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {entry.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </details>

            <div className="mt-10 space-y-12">
              {lesson.sections.map((section, i) => (
                <section
                  key={`${section.kind}-${i}`}
                  id={`section-${i}`}
                  ref={(node) => {
                    sectionRefs.current[i] = node;
                  }}
                  className="scroll-mt-6"
                >
                  <SectionBody section={section} />
                </section>
              ))}
            </div>

            {lesson.sources && lesson.sources.length > 0 ? (
              <section className="mt-14">
                <h2 className="text-sm font-medium text-foreground/80">
                  Free reads
                </h2>
                <ul className="mt-3 divide-y divide-border/50 border-y border-border/50">
                  {lesson.sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 py-2.5"
                      >
                        <ExternalLink
                          className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-cp-accent"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground/80 transition-colors group-hover:text-cp-accent">
                          {source.label}
                        </span>
                        <span className="hidden max-w-[14rem] truncate font-mono text-[10px] text-muted-foreground sm:block">
                          {source.url.replace(/^https:\/\//, "").split("/")[0]}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <p className="mt-8 text-[11px] leading-5 text-muted-foreground">
              {lesson.attribution}
            </p>

            <footer className="mt-10 border-t border-border/70 pt-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <button
                  type="button"
                  onClick={markComplete}
                  disabled={isDone || saving}
                  className={`inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cp-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    isDone
                      ? "border border-cp-pass/40 text-cp-pass"
                      : "bg-cp-accent text-cp-on-accent hover:bg-cp-accent/90 disabled:opacity-60"
                  }`}
                >
                  {saving ? (
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {isDone ? "Completed" : saving ? "Saving" : "Mark complete"}
                </button>
                <span className="text-xs text-muted-foreground">
                  {isDone
                    ? "Recorded on your account."
                    : "Completion is saved to your account."}
                </span>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {prev ? (
                  <Link
                    href={`/dsa/${moduleSlug}/lesson/${prev.slug}`}
                    className="group rounded-lg border border-border/70 px-4 py-3 transition-colors hover:border-cp-accent/40"
                  >
                    <span className="block font-mono text-[10px] text-muted-foreground">
                      Previous
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-foreground/85 group-hover:text-cp-accent">
                      {prev.title}
                    </span>
                  </Link>
                ) : (
                  <span aria-hidden="true" />
                )}

                {next ? (
                  <Link
                    href={`/dsa/${moduleSlug}/lesson/${next.slug}`}
                    className="group rounded-lg border border-border/70 px-4 py-3 text-right transition-colors hover:border-cp-accent/40 sm:col-start-2"
                  >
                    <span className="block font-mono text-[10px] text-muted-foreground">
                      Next
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-foreground/85 group-hover:text-cp-accent">
                      {next.title}
                    </span>
                  </Link>
                ) : hasTask ? (
                  <Link
                    href={`/dsa/${moduleSlug}/task`}
                    className="group rounded-lg bg-cp-accent px-4 py-3 text-right text-cp-on-accent transition-colors hover:bg-cp-accent/90 sm:col-start-2"
                  >
                    <span className="block font-mono text-[10px] opacity-70">
                      Last lesson
                    </span>
                    <span className="mt-0.5 flex items-center justify-end gap-1.5 truncate text-sm font-semibold">
                      Open the build task
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                ) : (
                  <Link
                    href={`/dsa/${moduleSlug}`}
                    className="group rounded-lg border border-border/70 px-4 py-3 text-right transition-colors hover:border-cp-accent/40 sm:col-start-2"
                  >
                    <span className="block font-mono text-[10px] text-muted-foreground">
                      Last lesson
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-foreground/85 group-hover:text-cp-accent">
                      Back to {moduleTitle}
                    </span>
                  </Link>
                )}
              </div>
            </footer>
          </div>
        </div>

        {/* Contents rail. `2xl`, not `xl`: the app sidebar takes 16rem before
            this shell is laid out, so at a 1280px window the third column would
            squeeze the prose under 60 characters to show four links. */}
        <aside
          className="hidden w-40 shrink-0 overflow-y-auto py-8 2xl:block"
          aria-label="On this page"
        >
          <p className="border-b border-border/70 pb-2 text-xs font-medium">
            On this page
          </p>
          <ul className="mt-3 space-y-1.5">
            {toc.map((entry, i) => {
              const active = activeSection === entry.id;
              return (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    onClick={(event) => {
                      // Anchor navigation would move the window, not the centre
                      // column; scroll the container the sections live in.
                      event.preventDefault();
                      const node = document.getElementById(entry.id);
                      const scroller = scrollerRef.current;
                      if (!node || !scroller) return;
                      const top =
                        node.getBoundingClientRect().top -
                        scroller.getBoundingClientRect().top +
                        scroller.scrollTop -
                        24;
                      scroller.scrollTo({ top, behavior: "smooth" });
                    }}
                    aria-current={active ? "true" : undefined}
                    className={`flex gap-2 py-0.5 text-[12px] leading-snug transition-colors ${
                      active
                        ? "text-cp-accent"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`cp-tabular shrink-0 font-mono text-[10px] ${
                        active ? "text-cp-accent" : "text-muted-foreground/50"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">{entry.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function SectionBody({ section }: { section: DsaLessonSection }) {
  switch (section.kind) {
    case "scenario":
    case "concept":
      return (
        <>
          <h2 className="font-display text-xl font-medium tracking-tight">
            {section.title}
          </h2>
          <div
            className="cp-prose mt-4"
            dangerouslySetInnerHTML={{ __html: section.body }}
          />
        </>
      );

    case "compare":
      return (
        <div className="rounded-xl border border-border/70 bg-card/30 p-5 sm:p-6">
          <div
            className="cp-prose"
            dangerouslySetInnerHTML={{ __html: section.body }}
          />
        </div>
      );

    case "visual":
      return (
        <>
          <h2 className="font-display text-xl font-medium tracking-tight">
            {section.title}
          </h2>
          <div className="mt-4">
            <VisualPlayer frames={section.frames} />
          </div>
        </>
      );

    case "code":
      return (
        <>
          <h2 className="font-display text-xl font-medium tracking-tight">
            {section.title}
          </h2>
          <div className="mt-4">
            <DsaCodeRunner
              starter={section.starter}
              solution={section.solution}
              language={section.language}
              tests={section.tests}
            />
          </div>
        </>
      );

    case "your_turn":
      return (
        <div className="rounded-xl border border-cp-accent/30 bg-cp-accent-soft/40 p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cp-accent">
            Your turn
          </p>
          <p className="mt-2 text-[1.0625rem] leading-7 text-foreground/90">
            {section.prompt}
          </p>
        </div>
      );

    case "recap":
      return (
        <>
          <h2 className="font-display text-xl font-medium tracking-tight">
            Recap
          </h2>
          <ul className="mt-4 space-y-2">
            {section.points.map((point) => (
              <li key={point} className="flex gap-3 text-[0.95rem] leading-7">
                <Check
                  className="mt-1.5 h-3.5 w-3.5 shrink-0 text-cp-pass"
                  aria-hidden="true"
                />
                <span className="text-foreground/85">{point}</span>
              </li>
            ))}
          </ul>
        </>
      );

    case "video":
      return (
        <>
          <h2 className="font-display text-xl font-medium tracking-tight">
            {section.title}
          </h2>
          <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-border/70">
            <iframe
              src={`https://www.youtube.com/embed/${section.videoId}`}
              title={section.title}
              className="h-full w-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {section.caption ? (
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {section.caption}
            </p>
          ) : null}
        </>
      );

    default:
      return null;
  }
}

/** Short label for the contents rail. Titles where they exist, kind where not. */
function sectionLabel(section: DsaLessonSection): string {
  switch (section.kind) {
    case "scenario":
    case "concept":
    case "visual":
    case "code":
    case "video":
      return section.title;
    case "compare":
      return "Trade-off";
    case "your_turn":
      return "Your turn";
    case "recap":
      return "Recap";
    default:
      return "Section";
  }
}
