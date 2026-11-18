"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  Dumbbell,
  FileText,
  GraduationCap,
  Minus,
  PlayCircle,
  Sparkles,
  X,
} from "lucide-react";
import type { CourseKey } from "@/config/courses/types";
import type {
  PlatformCourseRef,
  RoadmapNode,
  RoadmapResourceType,
} from "@/config/roadmaps/types";
import type { RoadmapNodeStatus } from "@/lib/roadmap-progress";
import { resolvePlatformEntries } from "@/config/roadmaps/platform";
import type { PlatformEntry } from "@/config/roadmaps/platform";

const RESOURCE_META: Record<
  RoadmapResourceType,
  { label: string; icon: typeof FileText; className: string }
> = {
  article: {
    label: "Article",
    icon: FileText,
    className: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },
  docs: {
    label: "Docs",
    icon: BookOpen,
    className: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  },
  video: {
    label: "Video",
    icon: PlayCircle,
    className: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  },
  course: {
    label: "Course",
    icon: GraduationCap,
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },
  practice: {
    label: "Practice",
    icon: Dumbbell,
    className: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  },
};

const LEVEL_CLASS: Record<string, string> = {
  beginner: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  intermediate: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  advanced: "border-rose-400/30 bg-rose-400/10 text-rose-300",
};

const STATUS_ACTION = [
  {
    key: "learning",
    label: "Learning",
    icon: Bookmark,
    activeClass: "bg-violet-500/20 text-violet-200 ring-1 ring-violet-400/40",
  },
  {
    key: "done",
    label: "Done",
    icon: Check,
    activeClass:
      "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40",
  },
  {
    key: "skipped",
    label: "Skip",
    icon: Minus,
    activeClass: "bg-white/10 text-foreground ring-1 ring-white/20",
  },
] as const;

type Props = {
  node: RoadmapNode;
  /** Ancestors from the root down to (but excluding) this node. */
  trail: RoadmapNode[];
  status?: RoadmapNodeStatus;
  platformCourses: Partial<Record<CourseKey, PlatformCourseRef>>;
  onSetStatus: (id: string, status: RoadmapNodeStatus | null) => void;
  onClose: () => void;
};

/** Kind → badge vocabulary for the in-platform block. */
const PLATFORM_KIND: Record<
  PlatformEntry["kind"],
  { label: string; icon: typeof BookOpen }
> = {
  course: { label: "Course", icon: GraduationCap },
  lesson: { label: "Lesson", icon: BookOpen },
  task: { label: "Task", icon: Dumbbell },
};

export default function RoadmapDetailPanel({
  node,
  trail,
  status,
  platformCourses,
  onSetStatus,
  onClose,
}: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      // Keep keyboard focus inside the dialog.
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const inside = panelRef.current.contains(active);

      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const parentLabel = trail
    .slice(1)
    .map((n) => n.title)
    .join(" / ");

  const platformEntries = resolvePlatformEntries(
    node.platform ?? [],
    platformCourses,
  );

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 animate-in bg-black/65 backdrop-blur-sm fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="roadmap-node-title"
        className="absolute inset-y-0 right-0 flex w-full animate-in flex-col border-l border-white/10 bg-[#0b0c11] shadow-2xl slide-in-from-right duration-200 sm:max-w-[540px]"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
          <div
            className="inline-flex items-center gap-0.5 rounded-xl border border-white/10 bg-white/[0.03] p-1"
            role="group"
            aria-label="Topic status"
          >
            {STATUS_ACTION.map(({ key, label, icon: Icon, activeClass }) => {
              const active = status === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSetStatus(node.id, active ? null : key)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? activeClass
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                  {label}
                </button>
              );
            })}
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {parentLabel && <span>{parentLabel}</span>}
            {parentLabel && <span aria-hidden="true">•</span>}
            <span>{node.children?.length ? "Section" : "Topic"}</span>
            {node.level && (
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] normal-case tracking-normal ${
                  LEVEL_CLASS[node.level]
                }`}
              >
                {node.level}
              </span>
            )}
            {node.optional && (
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] normal-case tracking-normal text-muted-foreground">
                optional
              </span>
            )}
          </div>

          <h2
            id="roadmap-node-title"
            className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground"
          >
            {node.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {node.description}
          </p>

          {/* Learn it on LynxDEV — our own courses and lessons */}
          {platformEntries.length > 0 && (
            <div className="mt-6 rounded-xl border border-amber-400/40 bg-amber-400/[0.06] p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                Learn it on LynxDEV
              </div>

              <ul className="mt-3 space-y-1">
                {platformEntries.map((entry) => {
                  const meta = PLATFORM_KIND[entry.kind];
                  const Icon = meta.icon;
                  return (
                    <li key={entry.key}>
                      <Link
                        href={entry.href}
                        className="group flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-amber-400/10"
                      >
                        <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-foreground group-hover:text-amber-100">
                            {entry.title}
                          </span>
                          {(entry.detail || entry.note) && (
                            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                              {[entry.detail, entry.note]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          )}
                        </span>
                        <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-300/60 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-300" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Resources */}
          {node.resources.length > 0 ? (
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-foreground">
                  Free resources
                </h3>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground">
                  {node.resources.length}
                </span>
              </div>

              <ul className="mt-3 space-y-1">
                {node.resources.map((resource) => {
                  const meta = RESOURCE_META[resource.type];
                  const Icon = meta.icon;
                  return (
                    <li key={resource.url}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.04]"
                      >
                        <span
                          className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.className}`}
                        >
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-foreground group-hover:text-white">
                            {resource.title}
                          </span>
                          {resource.note && (
                            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                              {resource.note}
                            </span>
                          )}
                        </span>
                        <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-muted-foreground">
              No external resources for this section yet — it groups the topics
              below it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
