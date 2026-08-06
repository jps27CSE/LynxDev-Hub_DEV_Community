"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FileCode2 } from "lucide-react";
import { difficultyBadgeClass } from "@/lib/interview-ui";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { OutputPane } from "@/components/editor/OutputPane";
import { useCodeEditor } from "@/hooks/useCodeEditor";
import type { Problem } from "@/lib/problem-data";

type EditorClientProps = {
  problem: Problem | null;
};

const PLAYGROUND_CODE = `// LynxDev playground — write any JavaScript and hit Run.
// Output from console.log() appears in the pane below.

function fibonacci(n) {
  if (n < 2) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

for (let i = 0; i < 10; i++) {
  console.log(fibonacci(i));
}
`;

export default function EditorClient({ problem }: EditorClientProps) {
  const editor = useCodeEditor({
    initialCode: problem?.starter_code || PLAYGROUND_CODE,
    storageKey: problem ? `problem:db:${problem.id}` : "editor:playground",
  });

  return (
    <div className="min-h-screen bg-[#05060a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <FileCode2 className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-display font-bold tracking-tight">
              {problem ? problem.title : "Code Playground"}
            </h1>
            {problem && (
              <Badge
                variant="outline"
                className={difficultyBadgeClass(problem.difficulty)}
              >
                {problem.difficulty}
              </Badge>
            )}
          </div>
          {problem && (
            <Link
              href={`/problems/${problem.id}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Back to Problem
            </Link>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <EditorToolbar
            running={editor.running}
            onRun={editor.run}
            onReset={editor.reset}
            onSave={editor.downloadCode}
            onImport={editor.importFile}
            importInputRef={editor.importInputRef}
          />
          <div className="bg-[#1e1e1e]">
            <MonacoEditor
              value={editor.code}
              onChange={editor.setCode}
              height="60vh"
            />
          </div>
        </div>

        <div className="mt-4">
          <OutputPane output={editor.output} error={editor.error} />
        </div>
      </div>
    </div>
  );
}
