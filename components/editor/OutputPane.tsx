"use client";

import { Terminal, XCircle } from "lucide-react";

type OutputPaneProps = {
  output: string | null;
  error: string | null;
};

export function OutputPane({ output, error }: OutputPaneProps) {
  if (output === null) return null;

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
