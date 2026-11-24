"use client";

import type { DsaFrame } from "@/config/dsa/types";

type State = Extract<DsaFrame["state"], { kind: "linkedlist" }>;

export function LinkedListVisualizer({ state }: { state: State }) {
  const { nodes, head, highlight = [], pointers = [] } = state;
  const nodeWidth = 48;
  const gap = 24;
  const height = 70;

  const pointerAt = (id: string) => pointers.filter((p) => p.nodeId === id);

  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {nodes.map((node, i) => {
        const isHi = highlight.includes(String(i));
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-12 h-10 flex items-center justify-center rounded border text-sm font-mono ${
                  isHi
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                    : "bg-card border-border/60"
                }`}
              >
                {node.value}
              </div>
              {pointerAt(node.value as string).length > 0 && (
                <div className="flex gap-1">
                  {pointerAt(node.value as string).map((p, j) => (
                    <span key={j} className="text-[10px] text-blue-400">
                      ↑{p.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {i < nodes.length - 1 && (
              <span className="mx-1 text-muted-foreground">→</span>
            )}
          </div>
        );
      })}
      <span className="ml-2 text-xs text-muted-foreground">null</span>
    </div>
  );
}
