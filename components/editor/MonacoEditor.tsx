"use client";

import dynamic from "next/dynamic";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type MonacoEditorProps = {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  language?: string;
};

export function MonacoEditor({
  value,
  onChange,
  height = "400px",
  language = "javascript",
}: MonacoEditorProps) {
  return (
    <Monaco
      height={height}
      language={language}
      value={value}
      onChange={(next) => onChange(next ?? "")}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 13,
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
