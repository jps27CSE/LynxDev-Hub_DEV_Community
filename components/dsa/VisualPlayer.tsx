"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import type { DsaFrame } from "@/config/dsa/types";
import PracticePanel from "./PracticePanel";
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

/**
 * Step-through animation player.
 *
 * Frames are authored, not computed (see `config/dsa/types.ts`), so this is a
 * transport control over a fixed list: prev, next, play, reset, speed. The
 * timeline is the addition that matters — with it the learner can scrub and
 * see how many steps exist before committing to the animation, which is the
 * difference between watching and inspecting.
 *
 * Keyboard support is on the outer region, not on the buttons, so an arrow key
 * works wherever focus happens to be inside the panel.
 */
export default function VisualPlayer({ frames }: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clamp = useCallback(
    (i: number) => Math.max(0, Math.min(frames.length - 1, i)),
    [frames.length],
  );

  const go = useCallback((i: number) => setIndex(clamp(i)), [clamp]);

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
        // Space on a focused button already activates it; hijacking it there
        // would double-fire (toggle, then the button's own click).
        const target = e.target as HTMLElement;
        if (target.closest("button")) return;
        e.preventDefault();
        setPlaying((p) => !p);
      }
    },
    [go, index],
  );

  if (frames.length === 0) {
    return (
      <PracticePanel label="Animation">
        <p className="px-4 py-8 text-sm text-cp-panel-ink/60">
          This animation has no frames yet.
        </p>
      </PracticePanel>
    );
  }

  const frame = frames[index];

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKey}
      role="group"
      aria-label={`Animation, step ${index + 1} of ${frames.length}`}
      className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cp-accent/60"
    >
      <PracticePanel
        label="Animation"
        meta={`${String(index + 1).padStart(2, "0")} / ${String(frames.length).padStart(2, "0")}`}
        headerActions={SPEEDS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSpeed(option)}
            aria-pressed={speed === option}
            className={`cp-tabular rounded px-1.5 py-0.5 font-mono text-[11px] transition-colors ${
              speed === option
                ? "bg-cp-accent/15 text-cp-accent"
                : "text-cp-panel-ink/45 hover:text-cp-panel-ink/80"
            }`}
          >
            {option}×
          </button>
        ))}
        footer={
          <div className="space-y-2.5">
            {/* Timeline: one hit area per frame, so scrubbing is a real control
                and not decoration. 16px tall targets wrapping a 2px rule. */}
            <div
              className="flex items-center gap-1"
              role="group"
              aria-label="Jump to step"
            >
              {frames.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    go(i);
                  }}
                  aria-label={`Step ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  className="group flex h-4 flex-1 items-center"
                >
                  <span
                    className={`h-0.5 w-full rounded-full transition-all ${
                      i === index
                        ? "h-1 bg-cp-accent"
                        : i < index
                          ? "bg-cp-accent/40 group-hover:bg-cp-accent/70"
                          : "bg-cp-panel-ink/20 group-hover:bg-cp-panel-ink/40"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <TransportButton
                label="Back to start"
                onClick={() => {
                  setPlaying(false);
                  go(0);
                }}
                disabled={index === 0}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </TransportButton>
              <TransportButton
                label="Previous step"
                onClick={() => {
                  setPlaying(false);
                  go(index - 1);
                }}
                disabled={index === 0}
              >
                <SkipBack className="h-3.5 w-3.5" />
              </TransportButton>
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause" : "Play"}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-cp-accent text-cp-on-accent transition-colors hover:bg-cp-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cp-accent/60"
              >
                {playing ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
              </button>
              <TransportButton
                label="Next step"
                onClick={() => {
                  setPlaying(false);
                  go(index + 1);
                }}
                disabled={index === frames.length - 1}
              >
                <SkipForward className="h-3.5 w-3.5" />
              </TransportButton>
              <span className="ml-auto hidden font-mono text-[10px] text-cp-panel-ink/40 sm:block">
                ← → step · space play
              </span>
            </div>
          </div>
        }
      >
        <div className="cp-grid flex min-h-[190px] items-center justify-center overflow-x-auto px-4 py-6">
          {frame.state.kind === "array" && (
            <ArrayVisualizer state={frame.state} />
          )}
          {frame.state.kind === "tree" && (
            <TreeVisualizer state={frame.state} />
          )}
          {frame.state.kind === "graph" && (
            <GraphVisualizer state={frame.state} />
          )}
          {frame.state.kind === "linkedlist" && (
            <LinkedListVisualizer state={frame.state} />
          )}
          {frame.state.kind === "stack" && (
            <StackVisualizer state={frame.state} />
          )}
          {frame.state.kind === "queue" && (
            <QueueVisualizer state={frame.state} />
          )}
          {frame.state.kind === "heap" && (
            <HeapVisualizer state={frame.state} />
          )}
        </div>

        {/* Fixed height: a one-line and a two-line caption must not move the
            controls under the cursor mid-animation. */}
        <p className="min-h-[3.25rem] border-t border-cp-panel-edge px-4 py-3 text-sm leading-6 text-cp-panel-ink/80">
          {frame.caption}
        </p>
      </PracticePanel>
    </div>
  );
}

function TransportButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-md text-cp-panel-ink/60 transition-colors hover:bg-cp-panel-ink/10 hover:text-cp-panel-ink disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cp-accent/60"
    >
      {children}
    </button>
  );
}
