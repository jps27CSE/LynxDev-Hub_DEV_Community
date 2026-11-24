"use client";

import type { DsaFrame } from "@/config/dsa/types";

type State = Extract<DsaFrame["state"], { kind: "array" }>;

export function ArrayVisualizer({ state }: { state: State }) {
  const { values, pointers = [], highlight = [], range } = state;
  const isHighlighted = (i: number) => highlight.includes(i);
  const inRange = (i: number) =>
    range ? i >= range[0] && i <= range[1] : true;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-1">
        {values.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded border text-sm font-mono transition-colors ${
                isHighlighted(i)
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                  : inRange(i)
                    ? "bg-card border-border/60"
                    : "bg-muted/30 border-border/30 text-muted-foreground"
              }`}
            >
              {v}
            </div>
            <span className="text-[10px] text-muted-foreground">{i}</span>
          </div>
        ))}
      </div>
      {pointers.length > 0 && (
        <div className="flex gap-1">
          {values.map((_, i) => {
            const ps = pointers.filter((p) => p.index === i);
            return (
              <div key={i} className="w-10 flex flex-col items-center">
                {ps.map((p, j) => (
                  <span
                    key={j}
                    className="text-[10px] font-medium"
                    style={{ color: p.color ?? "#60a5fa" }}
                  >
                    ↑ {p.label}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
