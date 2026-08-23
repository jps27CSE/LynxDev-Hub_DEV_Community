"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Circle,
} from "lucide-react";
import { difficultyBadgeClass } from "@/lib/interview-ui";
import { AnswerMarkdown } from "@/components/markdown-answer";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { OutputPane } from "@/components/editor/OutputPane";
import { useCodeEditor } from "@/hooks/useCodeEditor";
import type { WorkspaceProblem } from "@/lib/problem-data";

type ProblemPaneProps = {
  problem: WorkspaceProblem;
  isSolved: boolean;
  onToggleSolved: () => void;
  runRef: React.MutableRefObject<(() => void) | null>;
  prevKey: string | null;
  nextKey: string | null;
  onNavigate: (key: string) => void;
};

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 rounded border border-border/50 bg-muted/40 font-mono text-[10px] text-muted-foreground">
      {children}
    </kbd>
  );
}

export function ProblemPane({
  problem,
  isSolved,
  onToggleSolved,
  runRef,
  prevKey,
  nextKey,
  onNavigate,
}: ProblemPaneProps) {
  const editor = useCodeEditor({
    initialCode: problem.starterCode || "",
    storageKey: `problem:${problem.key}`,
  });

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState(0);

  const measureEditor = useCallback(() => {
    if (editorContainerRef.current) {
      const rect = editorContainerRef.current.getBoundingClientRect();
      if (rect.height > 0) setEditorHeight(rect.height);
    }
  }, []);

  useEffect(() => {
    measureEditor();
    const observer = new ResizeObserver(measureEditor);
    if (editorContainerRef.current) observer.observe(editorContainerRef.current);
    return () => observer.disconnect();
  }, [measureEditor]);

  useEffect(() => {
    runRef.current = editor.run;
    return () => {
      runRef.current = null;
    };
  }, [editor.run, runRef]);

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 border-b border-border/40 bg-[#05060a]/90 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-display font-bold text-lg truncate">
                {problem.title}
              </h1>
              <Badge
                variant="outline"
                className={difficultyBadgeClass(problem.difficulty)}
              >
                {problem.difficulty}
              </Badge>
              {problem.group && (
                <Badge variant="secondary" className="text-xs">
                  {problem.group}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {problem.topics.slice(0, 4).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[11px] bg-muted/50"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={!prevKey}
              onClick={() => prevKey && onNavigate(prevKey)}
              aria-label="Previous problem"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={!nextKey}
              onClick={() => nextKey && onNavigate(nextKey)}
              aria-label="Next problem"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSolved}
              className={`h-8 text-xs gap-1.5 ${
                isSolved
                  ? "text-emerald-400 border-emerald-500/40 hover:text-emerald-300"
                  : ""
              }`}
            >
              {isSolved ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Circle className="w-3.5 h-3.5" />
              )}
              {isSolved ? "Solved" : "Mark solved"}
            </Button>
            {problem.leetcodeUrl && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                asChild
              >
                <Link
                  href={problem.leetcodeUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Solve on LeetCode
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 lg:grid lg:grid-cols-2">
        <section className="min-h-0 lg:overflow-y-auto p-4 sm:p-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Problem
            </h2>
            <AnswerMarkdown content={problem.statement} />
          </div>

          <div className="mt-4 flex items-center gap-4 font-mono text-[11px] text-muted-foreground/60">
            <span className="flex items-center gap-1.5">
              <Kbd>Ctrl+Enter</Kbd> run
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>/</Kbd> search
            </span>
          </div>
        </section>

        <section className="flex flex-col min-h-0 lg:border-l lg:border-border/40 bg-background p-3 lg:p-0">
          <div className="flex flex-col min-h-0 flex-1 overflow-hidden rounded-2xl border border-border lg:rounded-none lg:border-0">
            <EditorToolbar
              running={editor.running}
              onRun={editor.run}
              onReset={editor.reset}
              onSave={editor.downloadCode}
              onImport={editor.importFile}
              importInputRef={editor.importInputRef}
            />
            <div ref={editorContainerRef} className="flex-1 min-h-[200px] bg-[#1e1e1e]">
              {editorHeight > 0 && (
                <MonacoEditor
                  value={editor.code}
                  onChange={editor.setCode}
                  height={`${editorHeight}px`}
                />
              )}
            </div>
            <div className="shrink-0 p-4 bg-[#05060a] border-t border-border/40 max-h-[220px] overflow-y-auto">
              <OutputPane output={editor.output} error={editor.error} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
