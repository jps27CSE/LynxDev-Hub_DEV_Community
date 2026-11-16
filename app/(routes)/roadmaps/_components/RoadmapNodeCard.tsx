"use client";

import { Bookmark, Check, Minus, Plus } from "lucide-react";
import type { RoadmapNode } from "@/config/roadmaps/types";
import type { RoadmapNodeStatus } from "@/lib/roadmap-progress";

export type RoadmapNodeVariant = "section" | "topic";

export type RoadmapNodeEvents = {
  statuses: Record<string, RoadmapNodeStatus>;
  nextUp: string | null;
  onOpen: (id: string) => void;
  onSetStatus: (id: string, status: RoadmapNodeStatus | null) => void;
};

type Props = RoadmapNodeEvents & {
  node: RoadmapNode;
  variant: RoadmapNodeVariant;
};

const STATUS_META = {
  learning: { label: "Learning", icon: Bookmark },
  done: { label: "Done", icon: Check },
  skipped: { label: "Skip", icon: Minus },
} as const;

export default function RoadmapNodeCard({
  node,
  variant,
  statuses,
  nextUp,
  onOpen,
  onSetStatus,
}: Props) {
  const status = statuses[node.id];
  const isNext = nextUp === node.id && !status;

  const statusClass = status ? ` rm-node--${status}` : "";
  const nextClass = isNext ? " rm-node--next" : "";
  const variantClass = variant === "section" ? "rm-node--section" : "rm-node--topic";

  return (
    <div className="rm-node-wrap">
      <button
        type="button"
        onClick={() => onOpen(node.id)}
        className={`rm-node ${variantClass}${statusClass}${nextClass}`}
        title={node.title}
        aria-label={`Open details for ${node.title}`}
      >
        <span className="line-clamp-2">{node.title}</span>
        {node.optional && (
          <span
            className="shrink-0 rounded-full border border-black/25 px-1.5 text-[9px] font-bold uppercase tracking-wide text-black/55"
            title="Optional — not required to finish this roadmap"
          >
            opt
          </span>
        )}
      </button>

      {/* Status badge on the card edge */}
      <button
        type="button"
        onClick={() => onSetStatus(node.id, status === "done" ? null : "done")}
        className="rm-badge"
        data-status={status ?? "none"}
        aria-label={
          status === "done" ? `Mark ${node.title} as not started` : `Mark ${node.title} as done`
        }
        title={status === "done" ? "Done — click to clear" : "Mark as done"}
      >
        {status === "done" ? (
          <Check className="h-3 w-3" strokeWidth={3} />
        ) : status === "learning" ? (
          <Bookmark className="h-3 w-3" strokeWidth={3} />
        ) : status === "skipped" ? (
          <Minus className="h-3 w-3" strokeWidth={3} />
        ) : (
          <Plus className="h-3 w-3" strokeWidth={3} />
        )}
      </button>

      {/* Hover / focus quick actions */}
      <div className="rm-actions" role="group" aria-label={`Set status for ${node.title}`}>
        {(Object.keys(STATUS_META) as RoadmapNodeStatus[]).map((key) => {
          const { label, icon: Icon } = STATUS_META[key];
          const active = status === key;
          return (
            <button
              key={key}
              type="button"
              className="rm-action"
              data-active={active}
              aria-pressed={active}
              onClick={() => onSetStatus(node.id, active ? null : key)}
            >
              <Icon className="h-3 w-3" strokeWidth={3} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
