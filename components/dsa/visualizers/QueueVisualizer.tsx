"use client";
import type { DsaFrame } from "@/config/dsa/types";
type State = Extract<DsaFrame["state"], { kind: "queue" }>;
export function QueueVisualizer({ state }: { state: State }) {
  const { values, highlight } = state;
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-muted-foreground">front</span>
      {values.map((v, i) => (
        <div
          key={i}
          className={`w-10 h-10 flex items-center justify-center rounded border text-sm font-mono ${
            highlight === i ? "bg-emerald-500/20 border-emerald-500" : "bg-card border-border/60"
          }`}
        >
          {v}
        </div>
      ))}
      <span className="text-[10px] text-muted-foreground">rear</span>
    </div>
  );
}