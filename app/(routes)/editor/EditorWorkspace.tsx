"use client";

import { useEffect, useState } from "react";
import type { OnMount } from "@monaco-editor/react";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { EditorToolbar, type EditorLanguage } from "@/components/editor/EditorToolbar";
import { OutputPane } from "@/components/editor/OutputPane";
import { BrowserPreview } from "@/components/editor/BrowserPreview";
import { useCodeEditor } from "@/hooks/useCodeEditor";
import type { Problem } from "@/lib/problem-data";

const PLAYGROUND_CODE = `// LynxDEV playground — write any JavaScript and hit Run.
// Output from console.log() appears in the pane below.

function fibonacci(n) {
  if (n < 2) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

for (let i = 0; i < 10; i++) {
  console.log(fibonacci(i));
}
`;

const HTML_STARTER = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>LynxDEV playground</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; }
  </style>
</head>
<body>
  <h1>Hello, LynxDEV!</h1>
  <p>Edit this HTML — the preview updates live.</p>
</body>
</html>`;

const CSS_STARTER = `/* Style the demo page below — it updates live. */
h1 {
  color: #22d3ee;
}

.btn {
  background: #181818;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  max-width: 320px;
}
`;

const CSS_SHELL = (css: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>LynxDEV CSS playground</title>
<style>
${css}
</style>
</head>
<body>
<h1>Hello LynxDEV</h1>
<p class="tagline">Style this demo page with your CSS.</p>
<button class="btn">Click me</button>
<div class="card"><h2>Sample card</h2><p>This is a card you can style.</p></div>
</body>
</html>`;

const STARTERS: Record<EditorLanguage, string> = {
  javascript: PLAYGROUND_CODE,
  html: HTML_STARTER,
  css: CSS_STARTER,
};

type EditorWorkspaceProps = {
  language: EditorLanguage;
  problem: Problem | null;
  fontSize: number;
  onLanguageChange: (language: EditorLanguage) => void;
  onCursorChange: (line: number, column: number) => void;
  onRunningChange: (running: boolean) => void;
};

export default function EditorWorkspace({
  language,
  problem,
  fontSize,
  onLanguageChange,
  onCursorChange,
  onRunningChange,
}: EditorWorkspaceProps) {
  const [nonce, setNonce] = useState(0);
  const isWeb = language === "html" || language === "css";

  const editor = useCodeEditor({
    initialCode: problem
      ? problem.starter_code || STARTERS.javascript
      : STARTERS[language],
    storageKey: problem
      ? `problem:db:${problem.id}`
      : `editor:playground:${language}`,
  });

  useEffect(() => {
    onRunningChange(editor.running);
  }, [editor.running, onRunningChange]);

  const previewHtml =
    language === "css"
      ? CSS_SHELL(editor.code)
      : language === "html"
        ? editor.code
        : "";

  const handleRun = () => {
    if (language === "javascript") {
      editor.run();
    } else {
      setNonce((n) => n + 1);
    }
  };

  const handleEditorMount: OnMount = (instance) => {
    const pos = instance.getPosition();
    if (pos) onCursorChange(pos.lineNumber, pos.column);
    instance.onDidChangeCursorPosition((e) => {
      onCursorChange(e.position.lineNumber, e.position.column);
    });
  };

  return (
    <>
      <div className="shrink-0 bg-[#1e1e1e]">
        <EditorToolbar
          running={editor.running}
          onRun={handleRun}
          onReset={editor.reset}
          onSave={editor.downloadCode}
          onImport={editor.importFile}
          importInputRef={editor.importInputRef}
          language={language}
          onLanguageChange={problem ? undefined : onLanguageChange}
          runLabel={isWeb ? "Refresh" : "Run"}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        <div className="flex flex-col h-[45dvh] lg:h-auto lg:flex-1 min-h-0 min-w-0">
          <div className="flex-1 min-h-0 bg-[#1e1e1e]">
            <MonacoEditor
              value={editor.code}
              onChange={editor.setCode}
              height="100%"
              language={language}
              fontSize={fontSize}
              onMount={handleEditorMount}
            />
          </div>
          {language === "javascript" && (
            <OutputPane
              output={editor.output}
              error={editor.error}
              alwaysVisible
              flat
            />
          )}
        </div>

        {isWeb && (
          <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-white/5 min-h-[50dvh] lg:min-h-0 flex flex-col">
            <BrowserPreview
              html={previewHtml}
              nonce={nonce}
              title={language === "css" ? "CSS Preview" : "HTML Preview"}
            />
          </div>
        )}
      </div>
    </>
  );
}
