"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { difficultyBadgeClass } from "@/lib/interview-ui";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { OutputPane } from "@/components/editor/OutputPane";
import { useCodeEditor } from "@/hooks/useCodeEditor";
import type { Problem } from "@/lib/problem-data";

export default function ProblemDetailClient({ problem }: { problem: Problem }) {
  const editor = useCodeEditor({
    initialCode: problem.starter_code || "",
    storageKey: `problem:${problem.id}`,
  });

  return (
    <div className="min-h-screen bg-[#05060a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/problems"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
        >
          &larr; Back to Problems
        </Link>

        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold tracking-tight">
                {problem.title}
              </h1>
              <Badge
                variant="outline"
                className={difficultyBadgeClass(problem.difficulty)}
              >
                {problem.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {problem.category && (
                <Badge variant="secondary" className="text-xs">
                  {problem.category}
                </Badge>
              )}
              {problem.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs bg-muted/50"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            asChild
          >
            <Link href={`/editor?problemId=${problem.id}`}>
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Editor
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="prose prose-sm prose-invert max-w-none">
              {problem.description.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <EditorToolbar
                running={editor.running}
                onRun={editor.run}
                onReset={editor.reset}
                onSave={editor.saveFile}
                onImport={editor.importFile}
                importInputRef={editor.importInputRef}
              />
              <MonacoEditor
                value={editor.code}
                onChange={editor.setCode}
                height="420px"
              />
            </div>

            <OutputPane output={editor.output} error={editor.error} />
          </div>
        </div>
      </div>
    </div>
  );
}
