"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import { NODE_TYPES } from "@/lib/system-design/nodes";
import type {
  SdGraph,
  SdLesson,
  SdLessonSection,
} from "@/config/system-design/types";
import { AnswerMarkdown } from "@/components/markdown-answer";

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

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/system-design" className="hover:text-foreground">
          System design
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <Link
          href={`/system-design/${moduleSlug}`}
          className="hover:text-foreground"
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

      <header className="mt-8 border-b border-border pb-7">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          Lesson {String(lessonIndex + 1).padStart(2, "0")} /{" "}
          {String(lessons.length).padStart(2, "0")}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {lesson.title}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Part of <span className="text-foreground">{moduleTitle}</span>
        </p>
      </header>

      <div className="mt-8 space-y-8">
        {lesson.sections.map((section, index) => (
          <LessonSection
            key={`${section.kind}-${index}`}
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
        ))}
      </div>

      {lesson.sections.some(
        (section, index) =>
          section.kind === "compare" && !isComparisonReflected(index),
      ) && (
        <p role="status" className="mt-6 text-sm text-muted-foreground">
          Take a moment to think through the question above before opening the
          comparison.
        </p>
      )}

      <section className="mt-12 border-t border-border pt-6">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Sources &amp; synthesis
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {lesson.attribution}
        </p>
      </section>

      <footer className="mt-8 flex flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={markComplete}
            disabled={!isLoaded || !user || isComplete || isSaving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-default disabled:opacity-70"
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
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {nextLesson ? (
            <Link
              href={`/system-design/${moduleSlug}/lesson/${nextLesson.slug}`}
              className="rounded-md bg-secondary px-3 py-2 text-sm hover:bg-secondary/80"
            >
              Next lesson →
            </Link>
          ) : (
            <Link
              href={`/system-design/${moduleSlug}/task`}
              className="rounded-md bg-secondary px-3 py-2 text-sm hover:bg-secondary/80"
            >
              Go to build task →
            </Link>
          )}
        </div>
      </footer>
    </main>
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
        <section className="rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            The situation · {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-3 text-xl font-semibold">{section.title}</h2>
          <div className="mt-4">
            <AnswerMarkdown content={section.body} />
          </div>
        </section>
      );
    case "concept":
      return (
        <section>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Concept · {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            {section.title}
          </h2>
          <div className="mt-4">
            <AnswerMarkdown content={section.body} />
          </div>
        </section>
      );
    case "diagram":
      return <LessonDiagram graph={section.graph} caption={section.caption} />;
    case "your_turn":
      return (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
            Your turn
          </p>
          <div className="mt-3">
            <AnswerMarkdown content={section.prompt} />
          </div>
          <button
            type="button"
            onClick={onReflect}
            className="mt-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            {hasReflected ? "Comparison unlocked" : "I’ve thought it through"}
          </button>
        </section>
      );
    case "compare":
      return hasReflected ? (
        <section className="border-l-2 border-primary/50 pl-5 sm:pl-7">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Compare with a senior engineer
          </p>
          <div className="mt-3">
            <AnswerMarkdown content={section.body} />
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-border px-5 py-4 text-sm text-muted-foreground">
          Comparison stays closed until you’ve worked through the prompt above.
        </section>
      );
    case "recap":
      return (
        <section className="rounded-xl border border-border bg-card p-5 sm:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
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
                  className="font-mono text-muted-foreground"
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
        className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground"
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
    <figure className="overflow-hidden rounded-xl border border-border bg-card">
      <figcaption className="border-b border-border px-4 py-3 text-sm text-muted-foreground">
        {caption}
      </figcaption>
      <div className="overflow-x-auto p-4">
        <svg
          role="img"
          aria-label={caption}
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto min-w-[520px] max-w-full"
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
              <path d="M0,0 L8,4 L0,8 z" className="fill-muted-foreground" />
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
                  className="stroke-muted-foreground"
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
                {node.label || NODE_TYPES[node.type].label}
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
