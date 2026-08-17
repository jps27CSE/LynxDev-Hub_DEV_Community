"use client";

import dynamic from "next/dynamic";
import type { OnMount } from "@monaco-editor/react";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

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
  return (
    <Monaco
      height={height}
      language={language}
      value={value}
      onChange={(next) => onChange(next ?? "")}
      onMount={onMount}
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
  );
}
