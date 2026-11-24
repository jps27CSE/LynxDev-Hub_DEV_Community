"use client";

import type { DsaFrame } from "@/config/dsa/types";

type State = Extract<DsaFrame["state"], { kind: "graph" }>;

export function GraphVisualizer({ state }: { state: State }) {
  const { nodes, edges, highlightNodes = [], highlightEdges = [] } = state;
  const n = nodes.length;
  const radius = 80;
  const cx = 100;
  const cy = 100;
  const size = 220;

  const pos = new Map<string, { x: number; y: number }>();
  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / Math.max(n, 1);
    pos.set(node.id, {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  });

  const edgeKey = (e: { from: string; to: string }) => `${e.from}->${e.to}`;

  return (
    <svg width={size} height={size} className="overflow-visible">
      {edges.map((e, i) => {
        const a = pos.get(e.from);
        const b = pos.get(e.to);
        if (!a || !b) return null;
        const hi = highlightEdges.includes(edgeKey(e));
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={hi ? "#22c55e" : "currentColor"}
            strokeOpacity={hi ? 1 : 0.4}
            strokeWidth={hi ? 2 : 1}
            markerEnd={e.directed ? "url(#arrow)" : undefined}
          />
        );
      })}
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="currentColor" />
        </marker>
      </defs>
      {nodes.map((node) => {
        const p = pos.get(node.id);
        if (!p) return null;
        const hi = highlightNodes.includes(node.id);
        return (
          <g key={node.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={16}
              className={hi ? "fill-emerald-500/20 stroke-emerald-500" : "fill-card stroke-border"}
              strokeWidth={2}
            />
            <text
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground text-[10px] font-mono"
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
