"use client";

import type { DsaFrame } from "@/config/dsa/types";

type State = Extract<DsaFrame["state"], { kind: "tree" }>;

export function TreeVisualizer({ state }: { state: State }) {
  const { nodes, root, highlight = [] } = state;
  const byId = new Map(nodes.map((n) => [n.id, n]));

  // Compute depth and parent for each node.
  const depth = new Map<string, number>();
  const parent = new Map<string, string>();
  const queue: string[] = [root];
  depth.set(root, 0);
  while (queue.length) {
    const id = queue.shift()!;
    const n = byId.get(id);
    if (!n) continue;
    if (n.left) {
      depth.set(n.left, depth.get(id)! + 1);
      parent.set(n.left, id);
      queue.push(n.left);
    }
    if (n.right) {
      depth.set(n.right, depth.get(id)! + 1);
      parent.set(n.right, id);
      queue.push(n.right);
    }
  }

  // Group nodes by depth.
  const levels = new Map<number, string[]>();
  for (const [id, d] of depth) {
    if (!levels.has(d)) levels.set(d, []);
    levels.get(d)!.push(id);
  }

  const maxDepth = Math.max(...depth.values(), 0);
  const levelHeight = 60;
  const nodeRadius = 18;
  const width = Math.max(200, (nodes.length + 1) * 40);
  const height = (maxDepth + 1) * levelHeight + 20;

  // Assign x positions: evenly space within each level.
  const pos = new Map<string, { x: number; y: number }>();
  for (const [d, ids] of levels) {
    const count = ids.length;
    ids.forEach((id, i) => {
      const x = ((i + 1) * width) / (count + 1);
      const y = d * levelHeight + 30;
      pos.set(id, { x, y });
    });
  }

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* edges */}
      {nodes.map((n) => {
        if (!n.left) return null;
        const p = pos.get(n.id);
        const c = pos.get(n.left);
        if (!p || !c) return null;
        return (
          <line
            key={`e-${n.id}-L`}
            x1={p.x}
            y1={p.y}
            x2={c.x}
            y2={c.y}
            stroke="currentColor"
            strokeOpacity={0.4}
          />
        );
      })}
      {nodes.map((n) => {
        if (!n.right) return null;
        const p = pos.get(n.id);
        const c = pos.get(n.right);
        if (!p || !c) return null;
        return (
          <line
            key={`e-${n.id}-R`}
            x1={p.x}
            y1={p.y}
            x2={c.x}
            y2={c.y}
            stroke="currentColor"
            strokeOpacity={0.4}
          />
        );
      })}
      {/* nodes */}
      {nodes.map((n) => {
        const p = pos.get(n.id);
        if (!p) return null;
        const isHi = highlight.includes(n.id);
        return (
          <g key={n.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={nodeRadius}
              className={
                isHi
                  ? "fill-emerald-500/20 stroke-emerald-500"
                  : "fill-card stroke-border"
              }
              strokeWidth={2}
            />
            <text
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground text-xs font-mono"
            >
              {n.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
