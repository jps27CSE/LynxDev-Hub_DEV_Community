"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Play, RotateCcw, Upload } from "lucide-react";

export type EditorLanguage = "javascript" | "html" | "css";

const LANGUAGE_LABELS: Record<EditorLanguage, string> = {
  javascript: "JS",
  html: "HTML",
  css: "CSS",
};

type EditorToolbarProps = {
  running: boolean;
  onRun: () => void;
  onReset: () => void;
  onSave: () => void;
  onImport: (file: File | undefined) => void;
  importInputRef: React.RefObject<HTMLInputElement | null>;
  language?: EditorLanguage;
  onLanguageChange?: (language: EditorLanguage) => void;
  runLabel?: string;
};

export function EditorToolbar({
  running,
  onRun,
  onReset,
  onSave,
  onImport,
  importInputRef,
  language = "javascript",
  onLanguageChange,
  runLabel = "Run",
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
      {onLanguageChange ? (
        <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
          {(Object.keys(LANGUAGE_LABELS) as EditorLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-3 h-6 rounded-md text-[11px] font-mono transition-colors ${
                language === lang
                  ? "bg-cyan-400/15 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={language === lang}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      ) : (
        <span className="text-xs font-medium text-muted-foreground">
          {LANGUAGE_LABELS[language]}
        </span>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={importInputRef}
          type="file"
          accept=".js,.txt,text/javascript,.html,text/html,.css,text/css"
          className="hidden"
          onChange={(e) => {
            onImport(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 text-xs gap-1"
          title="Restore starter code"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className="h-7 text-xs gap-1"
          title="Download code as solution.js"
        >
          <Download className="w-3 h-3" />
          Save
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => importInputRef.current?.click()}
          className="h-7 text-xs gap-1"
          title="Import code from a file"
        >
          <Upload className="w-3 h-3" />
          Import
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRun}
          disabled={running}
          className="h-7 text-xs gap-1"
        >
          <Play className="w-3 h-3" />
          {running ? "Running..." : runLabel}
        </Button>
      </div>
    </div>
  );
}
