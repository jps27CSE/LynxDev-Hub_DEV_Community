"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  CircleHelp,
  Eye,
  EyeOff,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SdStep, StepResult } from "@/config/system-design/types";

interface StepRailProps {
  steps: SdStep[];
  results: StepResult[];
  onRun: () => void;
  attempts: number;
}

export function StepRail({ steps, results, onRun, attempts }: StepRailProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    steps[0]?.id ?? null,
  );
  const [hintTierByStep, setHintTierByStep] = useState<Record<string, number>>(
    {},
  );
  const completedCount = results.filter((result) => result.passed).length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-card/50">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Build sequence
            </p>
            <h2 className="mt-1 text-base font-semibold">Design steps</h2>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
            {completedCount}/{steps.length}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Build steps completed"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={completedCount}
          className="mt-4 h-1 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-sd-accent transition-[width]"
            style={{
              width: `${steps.length ? (completedCount / steps.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {steps.map((step, index) => {
          const result = results[index];
          const isComplete = result?.passed ?? false;
          const isExpanded = expandedId === step.id;
          const hintTier = hintTierByStep[step.id] ?? 0;

          return (
            <li
              key={step.id}
              className={cn(
                "overflow-hidden rounded-lg border transition-colors",
                isComplete
                  ? "border-sd-success/30 bg-sd-success/5"
                  : "border-border bg-background/70",
                isExpanded && !isComplete && "border-sd-accent/40",
              )}
            >
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() =>
                  setExpandedId((current) =>
                    current === step.id ? null : step.id,
                  )
                }
                className="flex w-full items-center gap-3 px-3 py-3 text-left"
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px]",
                    isComplete
                      ? "bg-sd-success text-white"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {isComplete ? <Check size={14} /> : String(index + 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {step.title}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block truncate text-xs",
                      isComplete
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground",
                    )}
                  >
                    {result?.progress ?? "Not checked yet"}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  size={15}
                  className={cn(
                    "shrink-0 text-muted-foreground transition-transform",
                    isExpanded && "rotate-180",
                  )}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-border px-3 pb-3 pt-3">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {step.brief}
                  </p>
                  {hintTier > 0 && (
                    <div className="mt-3 rounded-md border border-amber-500/20 bg-amber-500/[0.06] p-3 text-sm leading-6">
                      <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        {hintTier === 1 ? (
                          <CircleHelp size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                        {hintTier === 1 ? "Nudge" : "Reasoning"}
                      </p>
                      {hintTier === 1
                        ? step.hint
                        : `${step.hint} ${step.reveal}`}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setHintTierByStep((current) => {
                        const currentTier = current[step.id] ?? 0;
                        return {
                          ...current,
                          [step.id]: currentTier === 2 ? 0 : currentTier + 1,
                        };
                      })
                    }
                    className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {hintTier === 0 ? (
                      <>
                        <Eye size={14} /> Show a nudge
                      </>
                    ) : hintTier === 1 ? (
                      <>
                        <Eye size={14} /> Reveal reasoning
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} /> Hide hint
                      </>
                    )}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="border-t border-border p-3">
        <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {attempts} {attempts === 1 ? "run" : "runs"} · no penalty
        </p>
        <button
          type="button"
          onClick={onRun}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sd-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-sd-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sd-accent focus-visible:ring-offset-2"
        >
          <Play size={15} fill="currentColor" />
          Run design
        </button>
      </div>
    </div>
  );
}
