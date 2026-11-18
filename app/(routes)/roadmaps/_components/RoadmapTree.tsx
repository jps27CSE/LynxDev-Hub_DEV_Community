"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useRoadmapProgress } from "@/hooks/useRoadmapProgress";
import { collectLeafIds, findNode, findPath } from "@/config/roadmaps/utils";
import type { CourseKey } from "@/config/courses/types";
import type { PlatformCourseRef, Roadmap } from "@/config/roadmaps/types";
import RoadmapStage from "./RoadmapStage";
import RoadmapDetailPanel from "./RoadmapDetailPanel";

export default function RoadmapTree({
  roadmap,
  platformCourses,
}: {
  roadmap: Roadmap;
  platformCourses: Partial<Record<CourseKey, PlatformCourseRef>>;
}) {
  const { statuses, setStatus, reset } = useRoadmapProgress(roadmap.slug);
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const leaves = useMemo(() => collectLeafIds(roadmap.root), [roadmap.root]);
  const doneCount = leaves.filter((id) => statuses[id] === "done").length;
  const skippedCount = leaves.filter((id) => statuses[id] === "skipped").length;
  const pct =
    leaves.length > 0 ? Math.round((doneCount / leaves.length) * 100) : 0;

  const nextUp = useMemo(
    () =>
      leaves.find(
        (id) => statuses[id] !== "done" && statuses[id] !== "skipped",
      ) ?? null,
    [leaves, statuses],
  );
  const nextUpTitle = nextUp ? findNode(roadmap.root, nextUp)?.title : null;

  // Deep link: /roadmaps/frontend?node=react opens that node's panel.
  useEffect(() => {
    const id = searchParams.get("node");
    if (id && findNode(roadmap.root, id)) setSelectedId(id);
  }, [searchParams, roadmap.root]);

  const openNode = useCallback((id: string) => {
    setSelectedId(id);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("node", id);
    window.history.replaceState(null, "", url);
  }, []);

  const closePanel = useCallback(() => {
    setSelectedId(null);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("node");
    window.history.replaceState(null, "", url);
  }, []);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    const path = findPath(roadmap.root, selectedId);
    if (!path) return null;
    return { node: path[path.length - 1], trail: path.slice(0, -1) };
  }, [selectedId, roadmap.root]);

  const handleReset = () => {
    if (window.confirm("Reset all progress for this roadmap?")) reset();
  };

  const events = { statuses, nextUp, onOpen: openNode, onSetStatus: setStatus };
  const children = roadmap.root.children ?? [];

  return (
    <>
      {/* Progress bar */}
      <div className="mb-4 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-sm font-bold text-emerald-300 ring-1 ring-emerald-400/25">
            {pct}%
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Your progress
            </p>
            <p className="text-sm font-medium">
              {doneCount} of {leaves.length} topics done
              {skippedCount > 0 && (
                <span className="text-muted-foreground">
                  {" "}
                  · {skippedCount} skipped
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          {nextUp && nextUpTitle && (
            <button
              type="button"
              onClick={() => openNode(nextUp)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-white/10"
            >
              Next up: <span className="max-w-40 truncate">{nextUpTitle}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
          {(doneCount > 0 || skippedCount > 0) && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-lg p-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Reset progress"
              title="Reset progress"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="rm-canvas overflow-hidden rounded-3xl border border-white/10">
        <div
          className="rm-scroll outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
          tabIndex={0}
          role="group"
          aria-label={`${roadmap.title} roadmap map`}
        >
          <div className="rm-track px-6 py-14 sm:px-12">
            <div className="mb-12 text-center">
              <h2 className="font-display text-lg font-bold tracking-tight text-white">
                {roadmap.root.title}
              </h2>
              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-white/45">
                {roadmap.root.description}
              </p>
            </div>

            {children.length > 0 ? (
              children.map((child) => (
                <RoadmapStage key={child.id} node={child} {...events} />
              ))
            ) : (
              <RoadmapStage node={roadmap.root} {...events} />
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Hover a topic to mark it as learning, done, or skipped · Click any node
        for resources
      </p>

      {selected && (
        <RoadmapDetailPanel
          node={selected.node}
          trail={selected.trail}
          status={statuses[selected.node.id]}
          platformCourses={platformCourses}
          onSetStatus={setStatus}
          onClose={closePanel}
        />
      )}
    </>
  );
}
