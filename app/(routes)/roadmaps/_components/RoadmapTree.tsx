"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRoadmapProgress } from "@/hooks/useRoadmapProgress";
import { collectLeafIds } from "@/config/roadmaps/utils";
import type { Roadmap } from "@/config/roadmaps/types";
import RoadmapTreeNode from "./RoadmapTreeNode";

export default function RoadmapTree({
  roadmap,
  courseIdByTitle,
}: {
  roadmap: Roadmap;
  courseIdByTitle: Record<string, number>;
}) {
  const { completed, toggle, isCompleted } = useRoadmapProgress(roadmap.slug);
  const searchParams = useSearchParams();

  const allLeaves = useMemo(() => collectLeafIds(roadmap.root), [roadmap.root]);

  // Expanded nodes (children visible). Root expanded by default.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([roadmap.root.id]));
  // Currently selected node for detail panel.
  const [selected, setSelected] = useState<string>(roadmap.root.id);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // "Next up": first non-completed leaf in DFS order.
  const nextUp = useMemo(() => {
    return allLeaves.find((id) => !completed.has(id)) ?? null;
  }, [allLeaves, completed]);

  // Deep link: ?node=xxx → expand path + select.
  useEffect(() => {
    const nodeParam = searchParams.get("node");
    if (!nodeParam) return;
    const findPath = (node: Roadmap["root"], target: string, path: string[]): string[] | null => {
      if (node.id === target) return [...path, node.id];
      for (const c of node.children ?? []) {
        const r = findPath(c, target, [...path, node.id]);
        if (r) return r;
      }
      return null;
    };
    const path = findPath(roadmap.root, nodeParam, []);
    if (path) {
      setExpanded((prev) => {
        const next = new Set(prev);
        path.forEach((id) => next.add(id));
        return next;
      });
      setSelected(nodeParam);
    }
  }, [searchParams, roadmap.root]);

  const doneCount = allLeaves.filter((id) => completed.has(id)).length;
  const pct = allLeaves.length > 0 ? Math.round((doneCount / allLeaves.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* Tree */}
      <div className="rounded-2xl border border-border/50 bg-card/40 p-4 sm:p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Roadmap tree
          </h2>
          <span className="text-xs text-muted-foreground">
            {doneCount}/{allLeaves.length} topics · {pct}%
          </span>
        </div>
        <RoadmapTreeNode
          node={roadmap.root}
          depth={0}
          expanded={expanded}
          onToggleExpand={toggleExpand}
          selected={selected}
          onSelect={setSelected}
          isCompleted={isCompleted}
          onToggleComplete={toggle}
          nextUp={nextUp}
        />
      </div>

      {/* Detail panel */}
      <aside className="lg:sticky lg:top-20 h-fit">
        <NodeDetail
          roadmap={roadmap}
          selectedId={selected}
          isCompleted={isCompleted}
          onToggleComplete={toggle}
          courseIdByTitle={courseIdByTitle}
        />
      </aside>
    </div>
  );
}

function NodeDetail({
  roadmap,
  selectedId,
  isCompleted,
  onToggleComplete,
  courseIdByTitle,
}: {
  roadmap: Roadmap;
  selectedId: string;
  isCompleted: (id: string) => boolean;
  onToggleComplete: (id: string) => void;
  courseIdByTitle: Record<string, number>;
}) {
  const node = useMemo(() => {
    const find = (n: Roadmap["root"], id: string): Roadmap["root"] | null => {
      if (n.id === id) return n;
      for (const c of n.children ?? []) {
        const r = find(c, id);
        if (r) return r;
      }
      return null;
    };
    return find(roadmap.root, selectedId);
  }, [roadmap.root, selectedId]);
  if (!node) return null;

  const platformCourseId =
    node.platformCourseTitle
      ? courseIdByTitle[node.platformCourseTitle.trim().toLowerCase()]
      : undefined;

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-lg">{node.title}</h3>
        {node.optional && (
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground">
            optional
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-2">{node.description}</p>

      {node.level && (
        <div className="mt-3 text-xs text-muted-foreground">
          Level: <span className="text-foreground">{node.level}</span>
        </div>
      )}

      <div className="mt-4">
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isCompleted(node.id)}
            onChange={() => onToggleComplete(node.id)}
            className="w-4 h-4 rounded border-border/50 accent-primary"
          />
          Mark as completed
        </label>
      </div>

      {node.resources.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Resources
          </h4>
          <ul className="space-y-2">
            {node.resources.map((res, i) => (
              <li key={i}>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <span className="text-[10px] uppercase text-muted-foreground w-14 shrink-0">
                    {res.type}
                  </span>
                  <span className="truncate">{res.title}</span>
                </a>
                {res.note && (
                  <p className="text-xs text-muted-foreground ml-16 mt-0.5">{res.note}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {platformCourseId && (
        <div className="mt-5 pt-4 border-t border-border/50">
          <a
            href={`/courses/${platformCourseId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Start this topic on LynxDEV →
          </a>
        </div>
      )}
    </div>
  );
}