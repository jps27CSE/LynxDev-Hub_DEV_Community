"use client";

import type { ReactNode } from "react";

/**
 * The frame shared by the two practice surfaces — the animation arena and the
 * code runner.
 *
 * One frame, two contents: that is what makes them read as the same instrument
 * rather than two unrelated widgets bolted into a reading column. The panel
 * sits below the page background on purpose, so a verdict or a frame caption
 * reads as output and not as prose.
 */
export default function PracticePanel({
  label,
  meta,
  headerActions,
  children,
  footer,
}: {
  /** Instrument name — `ANIMATION`, `RUNNER`. Set in the tool's own register. */
  label: string;
  /** Right-hand facts: step counter, language, test count. */
  meta?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-cp-panel-edge bg-cp-panel px-3.5 py-2">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-cp-panel-ink/55">
            {label}
          </span>
          {meta ? (
            <span className="cp-tabular font-mono text-[11px] text-cp-panel-ink/45">
              {meta}
            </span>
          ) : null}
        </div>
        {headerActions ? (
          <div className="flex items-center gap-1">{headerActions}</div>
        ) : null}
      </div>

      <div className="bg-cp-panel">{children}</div>

      {footer ? (
        <div className="border-t border-cp-panel-edge bg-cp-panel px-3 py-2">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
