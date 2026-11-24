"use client";
import type { DsaFrame } from "@/config/dsa/types";
type State = Extract<DsaFrame["state"], { kind: "stack" }>;
export function StackVisualizer({ state }: { state: State }) {
  const { values, highlight } = state;
  return (
    <div className="flex flex-col-reverse items-center gap-1">
      {values.map((v, i) => (
        <div
          key={i}
          className={`w-20 h-8 flex items-center justify-center rounded border text-sm font-mono ${
            highlight === i ? "bg-emerald-500/20 border-emerald-500" : "bg-card border-border/60"
          }`}
        >
          {v}
        </div>
      ))}
      <span className="text-[10px] text-muted-foreground">bottom</span>
    </div>
  );
}