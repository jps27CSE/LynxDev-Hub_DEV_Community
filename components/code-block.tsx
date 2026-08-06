"use client";

import { isValidElement, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Play,
  Terminal,
  XCircle,
} from "lucide-react";
import { runJavaScript, type RunResult } from "@/lib/editor";
import { EditorDialog } from "@/components/editor/EditorDialog";

function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return extractText(props.children);
  }
  return "";
}

const RUNNABLE_LANGUAGES = new Set(["javascript", "js"]);

export function CodeBlock({
  children,
  className,
  language,
}: {
  children: React.ReactNode;
  className?: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const raw = extractText(children).replace(/\n$/, "");
  const isRunnable = RUNNABLE_LANGUAGES.has(language);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const run = () => setRunResult(runJavaScript(raw));

  return (
    <div className="code-window group relative my-5 overflow-hidden rounded-xl border border-border/50 bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.03]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          {language && (
            <span className="ml-2.5 text-[11px] font-mono text-white/40 uppercase tracking-wider">
              {language}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isRunnable && (
            <>
              <button
                onClick={run}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors"
                aria-label="Run code"
              >
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Run</span>
              </button>
              <button
                onClick={() => setEditorOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors"
                aria-label="Open in editor"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open in Editor</span>
              </button>
            </>
          )}
          <button
            onClick={() => void copy()}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors"
            aria-label={copied ? "Copied" : "Copy code"}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <pre
        className={
          language ? "overflow-x-auto" : "whitespace-pre-wrap break-words"
        }
      >
        <code
          className={`block text-[13.5px] leading-relaxed font-mono ${className ?? ""}`}
        >
          {children}
        </code>
      </pre>

      {runResult && (
        <div className="border-t border-white/[0.06] bg-black/40 px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            {runResult.error ? (
              <XCircle className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
              {runResult.error ? "Error" : "Output"}
            </span>
          </div>
          <pre
            className={`text-[13px] font-mono whitespace-pre-wrap ${
              runResult.error ? "text-red-400" : "text-white/70"
            }`}
          >
            {runResult.output}
          </pre>
        </div>
      )}

      <EditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initialCode={raw}
        title={`${language || "js"} — editor`}
      />
    </div>
  );
}
