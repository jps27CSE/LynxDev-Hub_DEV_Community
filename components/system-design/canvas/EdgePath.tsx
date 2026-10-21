"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import type { SdEdge, SdNode } from "@/config/system-design/types";
import {
  NODE_WIDTH,
  NODE_HEIGHT,
  getPortPosition,
  getControlPoints,
  getPointOnBezier,
  getTangentOnBezier,
  type Point,
} from "@/lib/system-design/geometry";

interface EdgePathProps {
  edge: SdEdge;
  fromNode: SdNode | undefined;
  toNode: SdNode | undefined;
  scale: number;
  pan: { x: number; y: number };
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  particleProgress?: number;
  isFlowAnimating?: boolean;
}

export function EdgePath({
  edge,
  fromNode,
  toNode,
  scale,
  pan,
  selected,
  onSelect,
  onDelete,
  particleProgress = 0,
  isFlowAnimating = false,
}: EdgePathProps) {
  const [hovered, setHovered] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  // Measure path length when path ref is available
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [edge, fromNode, toNode, scale, pan]);

  if (!fromNode || !toNode) return null;

  const fromPos = getPortPosition(fromNode, pan, scale, true);
  const toPos = getPortPosition(toNode, pan, scale, false);

  const { cp1, cp2 } = getControlPoints(fromPos, toPos);

  const pathD = `M${fromPos.x} ${fromPos.y} C${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${toPos.x} ${toPos.y}`;

  const arrowHead = useMemo(
    () => (
      <marker
        id={`arrowhead-${edge.id}`}
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,0 L0,7 L10,3.5 Z" fill="currentColor" />
      </marker>
    ),
    [edge.id]
  );

  // Memoize particle to avoid recreating on every render during animation
  const particle = useMemo(() => {
    if (!isFlowAnimating || particleProgress <= 0 || particleProgress >= 1 || pathLength <= 0) {
      return null;
    }

    const point = getPointOnBezier(particleProgress, fromPos, cp1, cp2, toPos);
    const tangent = getTangentOnBezier(particleProgress, fromPos, cp1, cp2, toPos);
    const angle = Math.atan2(tangent.y, tangent.x) * 180 / Math.PI;

    return (
      <g transform={`translate(${point.x}, ${point.y}) rotate(${angle})`}>
        <circle r="3" fill="hsl(var(--primary))" opacity="0.9" />
        <circle r="1.5" fill="white" opacity="0.6" />
      </g>
    );
  }, [isFlowAnimating, particleProgress, pathLength, fromPos, cp1, cp2, toPos]);

  return (
    <g>
      <defs>{arrowHead}</defs>
      <path
        ref={pathRef}
        d={pathD}
        stroke={selected ? "hsl(var(--primary))" : hovered ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground/0.5))"}
        strokeWidth={selected ? 2.5 : 1.5}
        fill="none"
        strokeDasharray={edge.partitioned ? "8,4" : "none"}
        markerEnd={`url(#arrowhead-${edge.id})`}
        className="transition-all duration-150"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(edge.id);
        }}
      />
      {particle}
      {(selected || hovered) && (
        <foreignObject
          x={(fromPos.x + toPos.x) / 2 - 40}
          y={(fromPos.y + toPos.y) / 2 - 20}
          width="80"
          height="40"
          style={{ pointerEvents: "auto" }}
        >
          <div
            className="absolute flex items-center justify-center"
            style={{ pointerEvents: "auto" }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(edge.id);
              }}
              className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 transition-colors"
              title="Delete connection"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </foreignObject>
      )}
    </g>
  );
}