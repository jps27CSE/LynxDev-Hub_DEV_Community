"use client";

import { ChevronRight, ChevronDown } from "lucide-react";
import type { RoadmapNode } from "@/config/roadmaps/types";

type Props = {
  node: RoadmapNode;
  depth: number;
  expanded: Set<string>;
  onToggleExpand: (id: string) => void;
  selected: string;
  onSelect: (id: string) => void;
  isCompleted: (id: string) => boolean;
  onToggleComplete: (id: string) => void;
  nextUp: string | null;
};

export default function RoadmapTreeNode({
  node,
  depth,
  expanded,
  onToggleExpand,
  selected,
  onSelect,
  isCompleted,
  onToggleComplete,
  nextUp,
}: Props) {
  const hasChildren = !!node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selected === node.id;
  const done = isCompleted(node.id);
  const isNext = nextUp === node.id;

  return (
    <div className={depth > 0 ? "ml-5 pl-4 border-l border-border/40" : ""}>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
          isSelected ? "bg-primary/10" : "hover:bg-accent/40"
        } ${isNext ? "ring-1 ring-primary/40" : ""}`}
      >
        {/* Expand/collapse caret */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
            className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
            aria-label={isExpanded ? "Collapse" : "Expand"}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-5 h-5 shrink-0" />
        )}

        {/* Complete checkbox */}
        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggleComplete(node.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-border/50 accent-primary shrink-0"
          aria-label={`Mark ${node.title} complete`}
        />

        {/* Title */}
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className={`flex-1 text-left text-sm font-medium truncate ${
            done ? "line-through text-muted-foreground" : "text-foreground"
          }`}
        >
          {node.title}
        </button>

        {/* Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {node.optional && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-border/50 text-muted-foreground">
              opt
            </span>
          )}
          {node.level && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-border/50 text-muted-foreground hidden sm:inline">
              {node.level}
            </span>
          )}
          {node.resources.length > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {node.resources.length} res
            </span>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="mt-1">
          {node.children!.map((child) => (
            <RoadmapTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              selected={selected}
              onSelect={onSelect}
              isCompleted={isCompleted}
              onToggleComplete={onToggleComplete}
              nextUp={nextUp}
            />
          ))}
        </div>
      )}
    </div>
  );
}