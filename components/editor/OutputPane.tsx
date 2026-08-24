"use client";

import { Terminal, XCircle } from "lucide-react";

type OutputPaneProps = {
  output: string | null;
  error: string | null;
  alwaysVisible?: boolean;
  flat?: boolean;
};

export function OutputPane({
  output,
  error,
  alwaysVisible = false,
  flat = false,
}: OutputPaneProps) {
  const hasContent = output !== null || error !== null;
  if (!hasContent && !alwaysVisible) return null;

  if (flat) {
    return (
      <div className="shrink-0 border-t border-white/10 bg-[#181818]">
        <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2">
          {error ? (
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="text-[11px] font-mono text-muted-foreground tracking-wider">
            {error ? "ERROR" : "OUTPUT"}
          </span>
        </div>
        {hasContent ? (
          <pre
            className={`text-xs sm:text-sm font-mono whitespace-pre-wrap px-3 sm:px-4 pb-2 sm:pb-3 max-h-20 sm:max-h-64 overflow-y-auto ${
              error ? "text-red-400" : "text-slate-300"
            }`}
          >
            {error ?? output}
          </pre>
        ) : (
          <p className="px-4 pb-3 text-xs font-mono text-slate-500">
            Run your code to see output here.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        {error ? (
          <XCircle className="w-4 h-4 text-red-500" />
        ) : (
          <Terminal className="w-4 h-4 text-cyan-400" />
        )}
        <span className="text-xs font-medium text-muted-foreground">
          {error ? "Error" : "Output"}
        </span>
      </div>
      <pre
        className={`text-sm font-mono whitespace-pre-wrap ${
          error ? "text-red-400" : "text-muted-foreground"
        }`}
      >
        {output}
      </pre>
    </div>
  );
}
