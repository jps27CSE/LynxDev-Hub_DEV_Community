"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  SdGraph,
  SdLesson,
  SdLessonSection,
} from "@/config/system-design/types";
import { AnswerMarkdown } from "@/components/markdown-answer";
import { NODE_TYPES } from "@/lib/system-design/nodes";
import { useRouter } from "next/navigation";

interface LessonFlowProps {
  moduleSlug: string;
  moduleTitle: string;
  lessons: SdLesson[];
  lesson: SdLesson;
}

export function LessonFlow({
  moduleSlug,
  moduleTitle,
  lessons,
  lesson,
}: LessonFlowProps) {
  const { user, isLoaded } = useUser();
  const [completedLessonKey, setCompletedLessonKey] = useState<string | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [reflectionState, setReflectionState] = useState<{
    lessonKey: string;
    promptIndexes: Set<number>;
  }>({ lessonKey: "", promptIndexes: new Set() });

  const lessonKey = `${moduleSlug}/${lesson.slug}`;
  const isComplete = completedLessonKey === lessonKey;
  const completionStorageKey = user ? `sd-lessons:${user.id}` : null;
  const lessonIndex = lessons.findIndex((item) => item.slug === lesson.slug);
  const previousLesson = lessonIndex > 0 ? lessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex >= 0 ? (lessons[lessonIndex + 1] ?? null) : null;
  const router = useRouter();

  // Estimated reading time (rough: 200 wpm over section bodies)
  const wordCount = lesson.sections.reduce((acc, s) => {
    const text =
      "body" in s
        ? s.body
        : "prompt" in s
          ? s.prompt
          : "points" in s
            ? s.points.join(" ")
            : "";
    return acc + (text?.split(/\s+/).length ?? 0);
  }, 0);
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));

  useEffect(() => {
    setCompletedLessonKey(null);
    if (!isLoaded || !completionStorageKey) return;

    try {
      const storedProgress = window.localStorage.getItem(completionStorageKey);
      if (!storedProgress) return;
      const completedLessons: unknown = JSON.parse(storedProgress);
      if (
        !Array.isArray(completedLessons) ||
        !completedLessons.every(
          (item): item is string => typeof item === "string",
        )
      ) {
        throw new Error("Stored lesson progress has an invalid format.");
      }
      if (completedLessons.includes(lessonKey))
        setCompletedLessonKey(lessonKey);
    } catch (error) {
      console.error(
        "Failed to load local system-design lesson progress",
        error,
      );
      toast.error("Could not load locally saved lesson progress.");
    }
  }, [completionStorageKey, isLoaded, lessonKey]);

  function markPromptReflected(promptIndex: number) {
    setReflectionState((previous) => {
      const promptIndexes =
        previous.lessonKey === lessonKey
          ? new Set(previous.promptIndexes)
          : new Set<number>();
      promptIndexes.add(promptIndex);
      return { lessonKey, promptIndexes };
    });
  }

  function isPromptReflected(promptIndex: number) {
    return (
      reflectionState.lessonKey === lessonKey &&
      reflectionState.promptIndexes.has(promptIndex)
    );
  }

  function precedingPromptIndex(sectionIndex: number): number | null {
    for (let index = sectionIndex - 1; index >= 0; index -= 1) {
      if (lesson.sections[index].kind === "your_turn") return index;
    }
    return null;
  }

  function isComparisonReflected(sectionIndex: number): boolean {
    const promptIndex = precedingPromptIndex(sectionIndex);
    return promptIndex === null || isPromptReflected(promptIndex);
  }

  async function markComplete() {
    const storageKey = completionStorageKey;
    if (isComplete || isSaving || !user || !storageKey) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/system-design/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "lesson-complete", slug: lessonKey }),
      });
      if (!response.ok)
        throw new Error(`Progress save failed (${response.status})`);
      setCompletedLessonKey(lessonKey);

      try {
        const storedProgress = window.localStorage.getItem(storageKey);
        const completedLessons: unknown = storedProgress
          ? JSON.parse(storedProgress)
          : [];
        if (
          !Array.isArray(completedLessons) ||
          !completedLessons.every(
            (item): item is string => typeof item === "string",
          )
        ) {
          throw new Error("Stored lesson progress has an invalid format.");
        }
        if (!completedLessons.includes(lessonKey)) {
          completedLessons.push(lessonKey);
          window.localStorage.setItem(
            storageKey,
            JSON.stringify(completedLessons),
          );
        }
      } catch (error) {
        console.error("Failed to cache system-design lesson progress", error);
        toast.error(
          "Completion synced, but could not be cached on this device.",
        );
      }
      toast.success("Lesson marked complete");
    } catch (error) {
      console.error("Failed to save system-design lesson progress", error);
      toast.error("Could not save lesson progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target && (e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "ArrowLeft" && previousLesson) {
        router.push(
          `/system-design/${moduleSlug}/lesson/${previousLesson.slug}`,
        );
      } else if (e.key === "ArrowRight" && nextLesson) {
        router.push(`/system-design/${moduleSlug}/lesson/${nextLesson.slug}`);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previousLesson, nextLesson, moduleSlug, router]);

  const progressPct =
    lessons.length > 0 ? ((lessonIndex + 1) / lessons.length) * 100 : 0;

  return (
    <div className="sd-scope flex h-[100dvh] flex-col overflow-hidden">
      {/* Top progress bar */}
      <div className="h-1 shrink-0 bg-muted/40">
        <div
          className="h-full bg-gradient-to-r from-sd-accent to-sd-info transition-[width] duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex flex-1 overflow-hidden w-full gap-6 pl-2 pr-4 py-6 sm:px-6 lg:py-8">
        <aside className="hidden shrink-0 overflow-y-auto md:block w-36">
          <div className="space-y-4 pr-1">
            <div>
              <Link
                href={`/system-design/${moduleSlug}`}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              >
                ← {moduleTitle}
              </Link>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-sd-accent">
                Lessons
              </p>
            </div>
            <nav className="space-y-1">
              {lessons.map((item, index) => {
                const isActive = item.slug === lesson.slug;
                return (
                  <Link
                    key={item.slug}
                    href={`/system-design/${moduleSlug}/lesson/${item.slug}`}
                    className={cn(
                      "block rounded-lg px-2 py-1.5 text-xs transition-colors",
                      isActive
                        ? "bg-sd-accent/10 font-medium text-sd-accent"
                        : "text-muted-foreground hover:bg-sd-accent-soft hover:text-sd-accent",
                    )}
                  >
                    <span className="mr-1 font-mono text-[10px] text-sd-accent/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto pr-2">
          <div className="w-full">
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
              <Link
                href={`/system-design/${moduleSlug}`}
                className="transition-colors hover:text-foreground"
              >
                {moduleTitle}
              </Link>
              <span aria-hidden="true" className="mx-2">
                /
              </span>
              <span aria-current="page" className="text-foreground">
                {lesson.title}
              </span>
            </nav>

            <header className="mb-10 border-b border-border pb-8">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                <span>
                  Lesson {String(lessonIndex + 1).padStart(2, "0")} /{" "}
                  {String(lessons.length).padStart(2, "0")}
                </span>
                <span aria-hidden="true">·</span>
                <span>{readingMinutes} min read</span>
                <span aria-hidden="true">·</span>
                <span className="text-sd-accent">{moduleTitle}</span>
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                {lesson.title}
              </h1>
            </header>

            <div className="space-y-8">
              {lesson.sections.map((section, index) => (
                <div
                  key={`${section.kind}-${index}`}
                  id={`section-${index}`}
                  className="scroll-mt-20"
                >
                  <LessonSection
                    section={section}
                    index={index}
                    hasReflected={
                      section.kind === "your_turn"
                        ? isPromptReflected(index)
                        : section.kind === "compare"
                          ? isComparisonReflected(index)
                          : false
                    }
                    onReflect={() => markPromptReflected(index)}
                  />
                </div>
              ))}
            </div>

            {lesson.sections.some(
              (section, index) =>
                section.kind === "compare" && !isComparisonReflected(index),
            ) && (
              <p
                role="status"
                className="mx-auto mt-4 max-w-3xl text-sm text-muted-foreground"
              >
                Take a moment to think through the question above before opening
                the comparison.
              </p>
            )}

            <section className="mt-10 border-t border-border pt-6">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Sources & synthesis
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {lesson.attribution}
              </p>
            </section>

            <footer className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={markComplete}
                  disabled={!isLoaded || !user || isComplete || isSaving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sd-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sd-accent/90 disabled:cursor-default disabled:opacity-70"
                >
                  {isComplete
                    ? "✓ Lesson complete"
                    : isSaving
                      ? "Saving…"
                      : "Mark lesson complete"}
                </button>
                <span className="text-xs text-muted-foreground">
                  Progress syncs to your account
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                {previousLesson ? (
                  <Link
                    href={`/system-design/${moduleSlug}/lesson/${previousLesson.slug}`}
                    className="rounded-xl border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <span />
                )}
                {nextLesson ? (
                  <Link
                    href={`/system-design/${moduleSlug}/lesson/${nextLesson.slug}`}
                    className="rounded-xl bg-sd-accent/10 px-4 py-2 text-sm font-medium text-sd-accent transition-colors hover:bg-sd-accent/20"
                  >
                    Next lesson →
                  </Link>
                ) : (
                  <Link
                    href={`/system-design/${moduleSlug}/task`}
                    className="rounded-xl bg-sd-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sd-accent/90"
                  >
                    Go to build task →
                  </Link>
                )}
              </div>
            </footer>
          </div>
        </main>

        <aside className="hidden shrink-0 overflow-y-auto md:block w-40">
          <div className="space-y-4 pr-1">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                On this page
              </p>
              <nav className="mt-2 space-y-1 text-sm">
                {lesson.sections.map((section, index) => {
                  const title =
                    "title" in section && section.title
                      ? section.title
                      : section.kind.replace("_", " ");
                  return (
                    <a
                      key={`${section.kind}-${index}`}
                      href={`#section-${index}`}
                      className="block rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-sd-accent-soft hover:text-sd-accent"
                    >
                      <span className="mr-1 font-mono text-[10px] text-sd-accent/70">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {title}
                    </a>
                  );
                })}
              </nav>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Progress
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {lessonIndex + 1}
                <span className="text-base text-muted-foreground">
                  {" "}
                  / {lessons.length}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                lessons in this module
              </p>
            </div>

            <div className="space-y-2">
              {previousLesson && (
                <Link
                  href={`/system-design/${moduleSlug}/lesson/${previousLesson.slug}`}
                  className="block rounded-lg border border-border px-3 py-2 text-xs transition-colors hover:bg-muted"
                >
                  ← {previousLesson.title}
                </Link>
              )}
              {nextLesson && (
                <Link
                  href={`/system-design/${moduleSlug}/lesson/${nextLesson.slug}`}
                  className="block rounded-lg border border-sd-accent/30 bg-sd-accent/5 px-3 py-2 text-xs font-medium text-sd-accent transition-colors hover:bg-sd-accent/10"
                >
                  {nextLesson.title} →
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function LessonSection({
  section,
  index,
  hasReflected,
  onReflect,
}: {
  section: SdLessonSection;
  index: number;
  hasReflected: boolean;
  onReflect: () => void;
}) {
  switch (section.kind) {
    case "scenario":
      return (
        <section className="rounded-2xl border border-sd-info/30 bg-sd-info/5 p-6 sm:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-sd-info">
            The situation · {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            {section.title}
          </h2>
          <div className="mt-4 leading-7">
            <AnswerMarkdown content={section.body} />
          </div>
        </section>
      );
    case "concept":
      return (
        <section className="py-2">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Concept · {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            {section.title}
          </h2>
          <div className="mt-4 leading-7 text-foreground/90">
            <AnswerMarkdown content={section.body} />
          </div>
        </section>
      );
    case "diagram":
      return <LessonDiagram graph={section.graph} caption={section.caption} />;
    case "your_turn":
      return (
        <section className="rounded-2xl border border-sd-warn/30 bg-sd-warn/5 p-6 sm:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-sd-warn">
            Your turn
          </p>
          <div className="mt-3 leading-7">
            <AnswerMarkdown content={section.prompt} />
          </div>
          <button
            type="button"
            onClick={onReflect}
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-sd-warn/40 bg-background px-4 py-2 text-sm font-medium text-sd-warn transition-colors hover:bg-sd-warn/10"
          >
            {hasReflected ? "✓ Comparison unlocked" : "I've thought it through"}
          </button>
        </section>
      );
    case "compare":
      return hasReflected ? (
        <section className="rounded-2xl border-l-4 border-sd-accent bg-sd-accent-soft/30 p-6 sm:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-sd-accent">
            Compare with a senior engineer
          </p>
          <div className="mt-3 leading-7">
            <AnswerMarkdown content={section.body} />
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
          Comparison stays closed until you've worked through the prompt above.
        </section>
      );
    case "video":
      return (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <a
            href={`https://www.youtube.com/watch?v=${section.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block mx-auto max-w-md"
          >
            <img
              src={`https://i.ytimg.com/vi/${section.videoId}/hqdefault.jpg`}
              alt={section.title}
              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform group-hover:scale-110">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="ml-1 h-7 w-7"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>
          </a>
          <div className="p-4 sm:p-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Watch on YouTube
            </p>
            <p className="mt-1 text-sm font-medium leading-6 text-foreground">
              {section.title}
            </p>
            {section.caption ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {section.caption}
              </p>
            ) : null}
          </div>
        </section>
      );
    case "recap":
      return (
        <section className="rounded-2xl border border-sd-success/30 bg-sd-success/5 p-6 sm:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-sd-success">
            Recap
          </p>
          <ul className="mt-4 space-y-3">
            {section.points.map((point, pointIndex) => (
              <li
                key={`${pointIndex}-${point}`}
                className="flex gap-3 text-sm leading-6"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sd-success/15 font-mono text-[10px] font-semibold text-sd-success"
                >
                  {String(pointIndex + 1).padStart(2, "0")}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      );
  }
}

function LessonDiagram({
  graph,
  caption,
}: {
  graph: SdGraph;
  caption: string;
}) {
  if (graph.nodes.length === 0) {
    return (
      <p
        role="status"
        className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground"
      >
        This diagram has no nodes yet.
      </p>
    );
  }

  const nodeWidth = 176;
  const nodeHeight = 64;
  const padding = 32;
  const minX = Math.min(...graph.nodes.map((node) => node.x));
  const minY = Math.min(...graph.nodes.map((node) => node.y));
  const maxX = Math.max(...graph.nodes.map((node) => node.x + nodeWidth));
  const maxY = Math.max(...graph.nodes.map((node) => node.y + nodeHeight));
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const offsetX = (x: number) => x - minX + padding;
  const offsetY = (y: number) => y - minY + padding;

  return (
    <figure className="rounded-2xl border border-border bg-card shadow-sm">
      <figcaption className="border-b border-border bg-muted/30 px-5 py-3 text-sm text-muted-foreground">
        {caption}
      </figcaption>
      <div className="overflow-auto p-5">
        <svg
          role="img"
          aria-label={caption}
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          className="min-w-[520px]"
        >
          <defs>
            <marker
              id="lesson-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 z" className="fill-sd-accent" />
            </marker>
          </defs>
          {graph.edges.map((edge) => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);
            if (!from || !to) return null;
            return (
              <g key={edge.id}>
                <path
                  d={`M ${offsetX(from.x + nodeWidth)} ${offsetY(from.y + nodeHeight / 2)} C ${offsetX(from.x + nodeWidth + 28)} ${offsetY(from.y + nodeHeight / 2)}, ${offsetX(to.x - 28)} ${offsetY(to.y + nodeHeight / 2)}, ${offsetX(to.x)} ${offsetY(to.y + nodeHeight / 2)}`}
                  fill="none"
                  className="stroke-sd-accent/70"
                  strokeWidth="2"
                  markerEnd="url(#lesson-arrow)"
                />
                {edge.label && (
                  <text
                    x={(offsetX(from.x + nodeWidth) + offsetX(to.x)) / 2}
                    y={
                      (offsetY(from.y + nodeHeight / 2) +
                        offsetY(to.y + nodeHeight / 2)) /
                        2 -
                      8
                    }
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    fontSize="11"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
          {graph.nodes.map((node) => (
            <g
              key={node.id}
              transform={`translate(${offsetX(node.x)} ${offsetY(node.y)})`}
            >
              <rect
                width={nodeWidth}
                height={nodeHeight}
                rx="10"
                className="fill-background stroke-border"
                strokeWidth="1.5"
              />
              <text
                x="14"
                y="27"
                className="fill-foreground"
                fontSize="13"
                fontWeight="600"
              >
                {node.label || "Client"}
              </text>
              <text
                x="14"
                y="47"
                className="fill-muted-foreground"
                fontSize="10"
              >
                {NODE_TYPES[node.type].label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </figure>
  );
}
