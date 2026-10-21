"use client";

import { useEffect, useRef, useState } from "react";
import type { SdEdge, SdNode } from "@/config/system-design/types";

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

const NODE_WIDTH = 160;
const NODE_HEIGHT = 72;
const PORT_RADIUS = 6;

function getPortPosition(
  node: SdNode,
  pan: { x: number; y: number },
  scale: number,
  isOutput: boolean
): { x: number; y: number } {
  const nodeCenterX = pan.x + node.x * scale + (NODE_WIDTH * scale) / 2;
  const nodeCenterY = pan.y + node.y * scale + (NODE_HEIGHT * scale) / 2;

  if (isOutput) {
    return {
      x: nodeCenterX + (NODE_WIDTH * scale) / 2,
      y: nodeCenterY,
    };
  } else {
    return {
      x: nodeCenterX - (NODE_WIDTH * scale) / 2,
      y: nodeCenterY,
    };
  }
}

function getControlPoints(
  from: { x: number; y: number },
  to: { x: number; y: number }
): { cp1: { x: number; y: number }; cp2: { x: number; y: number } } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.min(distance * 0.3, 100);

  const midX = from.x + dx / 2;
  const midY = from.y + dy / 2;

  const perpX = -dy / distance * offset;
  const perpY = dx / distance * offset;

  return {
    cp1: { x: midX + perpX, y: midY + perpY },
    cp2: { x: midX - perpX, y: midY - perpY },
  };
}

function getPointOnBezier(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): { x: number; y: number } {
  const u = 1 - t;
  const uu = u * u;
  const uuu = uu * u;
  const tt = t * t;
  const ttt = tt * t;

  const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
  const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;

  return { x, y };
}

function getTangentOnBezier(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): { x: number; y: number } {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;

  const x = 3 * uu * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * tt * (p3.x - p2.x);
  const y = 3 * uu * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * tt * (p3.y - p2.y);

  return { x, y };
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
  const pathLengthRef = useRef<number>(0);

  useEffect(() => {
    if (pathRef.current) {
      pathLengthRef.current = pathRef.current.getTotalLength();
    }
  }, [edge, fromNode, toNode, scale, pan]);

  if (!fromNode || !toNode) return null;

  const fromPos = getPortPosition(fromNode, pan, scale, true);
  const toPos = getPortPosition(toNode, pan, scale, false);

  const { cp1, cp2 } = getControlPoints(fromPos, toPos);

  const pathD = `M${fromPos.x} ${fromPos.y} C${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${toPos.x} ${toPos.y}`;

  const arrowHead = (
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
  );

  const particle = isFlowAnimating && particleProgress > 0 && particleProgress < 1 && pathLengthRef.current > 0 ? (
    (() => {
      const point = getPointOnBezier(particleProgress, fromPos, cp1, cp2, toPos);
      const tangent = getTangentOnBezier(particleProgress, fromPos, cp1, cp2, toPos);
      const angle = Math.atan2(tangent.y, tangent.x) * 180 / Math.PI;
      return (
        <g transform={`translate(${point.x}, ${point.y}) rotate(${angle})`}>
          <circle r="3" fill="hsl(var(--primary))" opacity="0.9" />
          <circle r="1.5" fill="white" opacity="0.6" />
        </g>
      );
    })()
  ) : null;

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