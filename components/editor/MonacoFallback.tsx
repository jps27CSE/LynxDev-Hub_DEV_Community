"use client";

import { Component, type ReactNode } from "react";

type MonacoTextareaFallbackProps = {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  fontSize?: number;
  language?: string;
};

export function MonacoTextareaFallback({
  value,
  onChange,
  height = "400px",
  fontSize = 13,
  language = "javascript",
}: MonacoTextareaFallbackProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      className="w-full resize-y border-0 bg-[#1e1e1e] p-3 text-slate-200 outline-none placeholder:text-slate-600"
      style={{
        height,
        minHeight: 200,
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize,
        lineHeight: 1.6,
        tabSize: 2,
      }}
      aria-label={`${language} editor (basic fallback)`}
    />
  );
}

type MonacoErrorBoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
};

type MonacoErrorBoundaryState = {
  hasError: boolean;
};

/**
 * Catches Monaco chunk-load failures (deploy race, flaky network on the
 * dynamic import) and swaps in the plain textarea so editing + Run survive.
 * CDN script failures do NOT throw — those are handled by the 10s load
 * timeout in MonacoEditor instead.
 */
export class MonacoErrorBoundary extends Component<
  MonacoErrorBoundaryProps,
  MonacoErrorBoundaryState
> {
  state: MonacoErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MonacoErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("Canceled")) return;
    console.warn("[editor] Monaco failed to load:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
