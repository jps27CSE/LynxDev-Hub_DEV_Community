"use client";
import type { DsaFrame } from "@/config/dsa/types";
type State = Extract<DsaFrame["state"], { kind: "heap" }>;
export function HeapVisualizer({ state }: { state: State }) {
  const { values, highlight = [] } = state;
  return (
    <div className="flex flex-wrap gap-1 justify-center max-w-[240px]">
      {values.map((v, i) => (
        <div
          key={i}
          className={`w-10 h-10 flex items-center justify-center rounded border text-sm font-mono ${
            highlight.includes(i)
              ? "bg-emerald-500/20 border-emerald-500"
              : "bg-card border-border/60"
          }`}
        >
          {v}
        </div>
      ))}
    </div>
  );
}
