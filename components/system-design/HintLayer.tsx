"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { SdStep, StepResult } from "@/config/system-design/types";

interface HintLayerProps {
  step: SdStep;
  result: StepResult;
  onReveal: () => void;
  onClose: () => void;
}

type HintTier = "nudge" | "hint" | "reveal";

const TIER_LABELS: Record<HintTier, string> = {
  nudge: "Nudge",
  hint: "Hint",
  reveal: "Reveal",
};

const TIER_ICONS: Record<HintTier, React.ReactNode> = {
  nudge: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
  hint: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <rect x="2" y="11" width="20" height="7" rx="2" />
      <path d="M6 11V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v0" />
    </svg>
  ),
  reveal: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

export function HintLayer({ step, result, onReveal, onClose }: HintLayerProps) {
  const [currentTier, setCurrentTier] = useState<HintTier>("nudge");
  const [showContent, setShowContent] = useState(true);

  const handleTierClick = useCallback((tier: HintTier) => {
    if (tier === "reveal") {
      onReveal();
    }
    setCurrentTier(tier);
    setShowContent(true);
  }, [onReveal]);

  const handleClose = useCallback(() => {
    setShowContent(false);
    onClose();
  }, [onClose]);

  const isPassed = result.passed;
  const isRevealed = currentTier === "reveal";

  // Don't show if passed and not revealed
  if (isPassed && !isRevealed) {
    return null;
  }

  // Auto-advance tier based on progress
  // If nudge is shown and step has some progress, could auto-advance
  // For now, manual progression

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", !showContent && "hidden")}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Hint Card */}
      <div className={cn(
        "relative w-full max-w-md bg-card border border-border rounded-xl shadow-xl p-6",
        "animate-in fade-in-0 zoom-in-95 duration-200"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-foreground">
            Step: {step.title}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close hint"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className="font-mono text-foreground">{result.progress}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                isPassed ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: isPassed ? "100%" : "33%" }}
            />
          </div>
        </div>

        {/* Tier Buttons */}
        <div className="flex gap-2 mb-4">
          {(["nudge", "hint", "reveal"] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => handleTierClick(tier)}
              disabled={currentTier === tier && tier !== "reveal"}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all",
                "flex items-center justify-center gap-1.5",
                currentTier === tier
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/50",
                tier === "reveal" && "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
              )}
            >
              {TIER_ICONS[tier]}
              <span>{TIER_LABELS[tier]}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={cn("space-y-2 p-3 rounded-lg bg-muted/50", !showContent && "hidden")}>
          {currentTier === "nudge" && (
            <p className="text-sm text-muted-foreground">
              {step.brief}
            </p>
          )}
          {currentTier === "hint" && (
            <p className="text-sm text-foreground">
              {step.hint}
            </p>
          )}
          {currentTier === "reveal" && (
            <p className="text-sm text-foreground">
              {step.reveal}
            </p>
          )}
        </div>

        {/* Progress text */}
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            {isPassed
              ? "✓ Step completed"
              : currentTier === "reveal"
              ? "Reveal shown — try applying it"
              : currentTier === "hint"
              ? "Hint shown — try again"
              : "Nudge shown — give it a try"}
          </p>
        </div>
      </div>
    </div>
  );
}