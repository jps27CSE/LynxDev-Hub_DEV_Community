"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import type { DsaFrame } from "@/config/dsa/types";
import { ArrayVisualizer } from "./visualizers/ArrayVisualizer";
import { TreeVisualizer } from "./visualizers/TreeVisualizer";
import { GraphVisualizer } from "./visualizers/GraphVisualizer";
import { LinkedListVisualizer } from "./visualizers/LinkedListVisualizer";
import { StackVisualizer } from "./visualizers/StackVisualizer";
import { QueueVisualizer } from "./visualizers/QueueVisualizer";
import { HeapVisualizer } from "./visualizers/HeapVisualizer";

type Props = {
  frames: DsaFrame[];
};

const SPEEDS = [0.5, 1, 2] as const;

export default function VisualPlayer({ frames }: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clamp = useCallback(
    (i: number) => Math.max(0, Math.min(frames.length - 1, i)),
    [frames.length],
  );

  const go = useCallback(
    (i: number) => setIndex(clamp(i)),
    [clamp],
  );

  const stepNext = useCallback(() => {
    setIndex((prev) => {
      if (prev >= frames.length - 1) {
        setPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [frames.length]);

  // Auto-advance while playing.
  useEffect(() => {
    if (!playing) return;
    if (index >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    const delay = 1200 / speed;
    timerRef.current = setTimeout(() => {
      stepNext();
    }, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, index, speed, frames.length, stepNext]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(index + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    },
    [go, index],
  );

  if (frames.length === 0) {
    return (
      <div className="rounded-lg border border-border/40 bg-card p-4 text-sm text-muted-foreground">
        No animation frames.
      </div>
    );
  }

  const frame = frames[index];

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKey}
      className="rounded-lg border border-border/40 bg-card overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground">
          Step {index + 1} / {frames.length}
        </span>
        <div className="flex items-center gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`text-[11px] px-2 py-0.5 rounded ${
                speed === s
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 min-h-[140px] flex items-center justify-center">
        {frame.state.kind === "array" && <ArrayVisualizer state={frame.state} />}
        {frame.state.kind === "tree" && <TreeVisualizer state={frame.state} />}
        {frame.state.kind === "graph" && <GraphVisualizer state={frame.state} />}
        {frame.state.kind === "linkedlist" && (
          <LinkedListVisualizer state={frame.state} />
        )}
        {frame.state.kind === "stack" && <StackVisualizer state={frame.state} />}
        {frame.state.kind === "queue" && <QueueVisualizer state={frame.state} />}
        {frame.state.kind === "heap" && <HeapVisualizer state={frame.state} />}
      </div>

      <div className="px-4 pb-3 text-sm text-foreground/80">{frame.caption}</div>

      <div className="flex items-center gap-2 px-3 py-2 border-t border-border/40 bg-muted/20">
        <button
          onClick={() => go(0)}
          disabled={index === 0}
          className="p-1.5 rounded hover:bg-accent disabled:opacity-40"
          aria-label="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="p-1.5 rounded hover:bg-accent disabled:opacity-40"
          aria-label="Previous"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="p-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={() => go(index + 1)}
          disabled={index === frames.length - 1}
          className="p-1.5 rounded hover:bg-accent disabled:opacity-40"
          aria-label="Next"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
