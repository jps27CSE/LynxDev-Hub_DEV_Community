"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  CloudUpload,
  FileCode2,
  Loader2,
  Minus,
  Plus,
  Type,
} from "lucide-react";
import { difficultyBadgeClass } from "@/lib/interview-ui";
import type { EditorLanguage } from "@/components/editor/EditorToolbar";
import EditorWorkspace from "./EditorWorkspace";
import type { Problem } from "@/lib/problem-data";

type EditorClientProps = {
  problem: Problem | null;
};

const LANGUAGE_LABELS: Record<EditorLanguage, string> = {
  javascript: "JavaScript",
  html: "HTML",
  css: "CSS",
};

export default function EditorClient({ problem }: EditorClientProps) {
  const [language, setLanguage] = useState<EditorLanguage>("javascript");
  const [fontSize, setFontSize] = useState(13);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [running, setRunning] = useState(false);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("editor:fontSize"));
      if (saved >= 10 && saved <= 24) setFontSize(saved);
    } catch {
      // localStorage unavailable — keep default size
    }
  }, []);

  const handleLanguageChange = useCallback((next: EditorLanguage) => {
    setLanguage(next);
    try {
      localStorage.setItem("editor:language", next);
    } catch {
      // Non-persisting choice is acceptable when storage is blocked
    }
  }, []);

  useEffect(() => {
    if (problem) return;
    try {
      const saved = localStorage.getItem("editor:language");
      if (saved === "html" || saved === "css") setLanguage(saved);
    } catch {
      // localStorage unavailable — keep default
    }
  }, [problem]);

  const setFontSizeAndPersist = (next: number) => {
    const clamped = Math.min(24, Math.max(10, next));
    setFontSize(clamped);
    try {
      localStorage.setItem("editor:fontSize", String(clamped));
    } catch {
      // Non-persisting size is acceptable when storage is blocked
    }
  };

  const changeFontSize = (delta: number) => {
    setFontSizeAndPersist(fontSize + delta);
  };

  const fileName = problem
    ? `${problem.id}-solution.js`
    : language === "css"
      ? "styles.css"
      : language === "html"
        ? "index.html"
        : "playground.js";

  const handleCursorChange = useCallback((line: number, column: number) => {
    setCursor({ line, column });
  }, []);

  const handleRunningChange = useCallback((isRunning: boolean) => {
    setRunning(isRunning);
  }, []);

  return (
    <div className="h-dvh flex flex-col bg-[#05060a] overflow-hidden">
      {/* VS Code-style title bar */}
      <div className="shrink-0 flex items-center justify-between gap-2 sm:gap-3 h-10 sm:h-11 px-2 sm:px-4 bg-[#181818] border-b border-white/5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <FileCode2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-mono text-muted-foreground truncate">
            <span className="hidden sm:inline">{problem ? problem.title : "Code Playground"} — </span>
            {fileName}
          </span>
          {problem && (
            <Badge
              variant="outline"
              className={`${difficultyBadgeClass(problem.difficulty)} shrink-0 hidden sm:inline-flex`}
            >
              {problem.difficulty}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div
            className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/[0.03] px-1 py-1 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.04)]"
            title="Editor font size"
          >
            <Type className="w-3.5 h-3.5 text-cyan-400/80 ml-0.5 shrink-0" />
            <button
              onClick={() => changeFontSize(-1)}
              disabled={fontSize <= 10}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition-colors"
              aria-label="Decrease font size"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min={10}
              max={24}
              value={fontSize}
              onChange={(e) => setFontSizeAndPersist(Number(e.target.value))}
              className="hidden sm:block w-20 h-6 accent-cyan-400 cursor-pointer"
              aria-label="Font size slider"
            />
            <button
              onClick={() => changeFontSize(1)}
              disabled={fontSize >= 24}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition-colors"
              aria-label="Increase font size"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <span className="w-9 text-center text-[10px] font-mono text-muted-foreground border-l border-white/10 ml-1 shrink-0">
              {fontSize}px
            </span>
          </div>
          {problem && (
            <Link
              href={`/problems/${problem.id}`}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="hidden sm:inline">&larr; Back to Problem</span>
              <span className="sm:hidden">&larr;</span>
            </Link>
          )}
        </div>
      </div>

      <EditorWorkspace
        key={`${problem?.id ?? "playground"}:${language}`}
        language={language}
        problem={problem}
        fontSize={fontSize}
        onLanguageChange={handleLanguageChange}
        onCursorChange={handleCursorChange}
        onRunningChange={handleRunningChange}
      />

      {/* VS Code-style status bar */}
      <footer className="shrink-0 flex items-center justify-between gap-3 h-6 px-3 bg-[#007acc] text-white font-mono text-[11px] select-none">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center gap-1.5 truncate">
            <CloudUpload className="w-3 h-3 shrink-0" />
            Autosave: On
          </span>
          {running && (
            <span className="flex items-center gap-1.5 truncate">
              <Loader2 className="w-3 h-3 shrink-0 animate-spin" />
              Running...
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-white/90 shrink-0">
          <span className="tabular-nums">
            Ln {cursor.line}, Col {cursor.column}
          </span>
          <span className="hidden sm:inline">Spaces: 2</span>
          <span className="hidden sm:inline">{LANGUAGE_LABELS[language]}</span>
          <span className="hidden md:inline">UTF-8</span>
          <span className="tabular-nums">{fontSize}px</span>
        </div>
      </footer>
    </div>
  );
}
