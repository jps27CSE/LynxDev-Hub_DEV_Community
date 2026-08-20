"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { OnMount } from "@monaco-editor/react";
import {
  MonacoErrorBoundary,
  MonacoTextareaFallback,
} from "@/components/editor/MonacoFallback";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const MONACO_LOAD_TIMEOUT_MS = 10_000;

type MonacoEditorProps = {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  language?: string;
  fontSize?: number;
  onMount?: OnMount;
};

export function MonacoEditor({
  value,
  onChange,
  height = "400px",
  language = "javascript",
  fontSize = 13,
  onMount,
}: MonacoEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const timer = setTimeout(
      () => setLoadTimedOut(true),
      MONACO_LOAD_TIMEOUT_MS,
    );
    return () => clearTimeout(timer);
  }, [mounted]);

  const fallback = (
    <MonacoTextareaFallback
      value={value}
      onChange={onChange}
      height={height}
      fontSize={fontSize}
      language={language}
    />
  );

  if (loadTimedOut) return fallback;

  return (
    <MonacoErrorBoundary fallback={fallback}>
      <Monaco
        height={height}
        language={language}
        value={value}
        onChange={(next) => onChange(next ?? "")}
        onMount={(editor, monaco) => {
          setMounted(true);
          onMount?.(editor, monaco);
        }}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize,
          fontFamily: "var(--font-jetbrains-mono), monospace",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 12, bottom: 12 },
          wordWrap: "on",
        }}
      />
    </MonacoErrorBoundary>
  );
}