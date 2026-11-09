"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  CircleHelp,
  LockKeyhole,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  SdPassCriterion,
  SimulationResult,
} from "@/config/system-design/types";

interface CriteriaPanelProps {
  criteria: SdPassCriterion[];
  result: SimulationResult | null;
  criteriaMet: string[];
  revealed: string[];
  onRevealSolution: () => void;
}

export function CriteriaPanel({
  criteria,
  result,
  criteriaMet,
  revealed,
  onRevealSolution,
}: CriteriaPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const required = criteria.filter((criterion) => criterion.required);
  const passedRequired = required.filter((criterion) =>
    criteriaMet.includes(criterion.id),
  ).length;
  const allRequiredPassed =
    required.length > 0 && passedRequired === required.length;
  const solutionRevealed = revealed.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Consequence
            </p>
            <h2 className="mt-1 text-base font-semibold">Pass criteria</h2>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
            {passedRequired}/{required.length} required
          </span>
        </div>
        <div
          className={cn(
            "mt-4 flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
            allRequiredPassed
              ? "border-sd-success/30 bg-sd-success/5 text-sd-success"
              : "border-border bg-muted/40 text-muted-foreground",
          )}
          role="status"
        >
          {allRequiredPassed ? (
            <>
              <Unlock size={15} />
              Design meets the required criteria
            </>
          ) : (
            <>
              <LockKeyhole size={15} />
              {result
                ? "The gate stays closed until required checks pass"
                : "Run your design to check the numbers"}
            </>
          )}
        </div>
      </div>

      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {criteria.map((criterion) => {
          const isMet = criteriaMet.includes(criterion.id);
          const currentPass =
            result?.valid === true && criterion.assert(result);
          const isExpanded = expandedId === criterion.id;
          const hasBeenRevealed = revealed.includes(criterion.id);

          return (
            <li
              key={criterion.id}
              className={cn(
                "overflow-hidden rounded-lg border bg-background/70",
                isMet
                  ? "border-emerald-500/25"
                  : criterion.required
                    ? "border-border"
                    : "border-dashed border-border",
              )}
            >
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() =>
                  setExpandedId((current) =>
                    current === criterion.id ? null : criterion.id,
                  )
                }
                className="flex w-full items-center gap-3 px-3 py-3 text-left"
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full",
                    isMet
                      ? "bg-sd-success text-white"
                      : currentPass
                        ? "bg-sd-success/15 text-sd-success"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isMet ? <Check size={14} /> : <CircleHelp size={14} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    {criterion.label}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block text-xs",
                      isMet || currentPass
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground",
                    )}
                  >
                    {isMet
                      ? "Passed and saved"
                      : currentPass
                        ? "Passes on this run"
                        : result
                          ? "Not met yet"
                          : criterion.required
                            ? "Required"
                            : "Advisory"}
                    {!criterion.required && " · advisory"}
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
                <div className="border-t border-border px-3 py-3">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {criterion.explain}
                  </p>
                  {hasBeenRevealed && (
                    <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                      Senior design revealed — this is not counted as a pass.
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={onRevealSolution}
          disabled={solutionRevealed}
          className="min-h-10 w-full rounded-xl border border-border px-3 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-60"
        >
          {solutionRevealed
            ? "Senior design revealed"
            : "Show me the senior engineer’s design"}
        </button>
        <p className="mt-2 text-center text-xs leading-5 text-muted-foreground">
          Revealing the solution never unlocks the task.
        </p>
      </div>
    </div>
  );
}
