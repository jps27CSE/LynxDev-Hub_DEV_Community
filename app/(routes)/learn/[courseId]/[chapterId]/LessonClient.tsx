"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Eye } from "lucide-react";

type ChapterData = {
  id: number;
  title: string;
  content: {
    instructions: string;
    initialCode: string;
    solution: string;
    type?: "console" | "browser";
  };
};

export default function LessonClient({
  chapter,
  courseId,
}: {
  chapter: ChapterData;
  courseId: number;
}) {
  const [code, setCode] = useState(chapter.content.initialCode);
  const [output, setOutput] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isBrowserMode = chapter.content.type === "browser";

  const runCode = () => {
    if (isBrowserMode) {
      setOutput("");
      return;
    }

    try {
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(String).join(" "));
      };
      eval(code);
      console.log = originalLog;
      setOutput(logs.join("\n") || "Code executed successfully (no output)");
    } catch (e) {
      setOutput(`Error: ${(e as Error).message}`);
    }
  };

  useEffect(() => {
    if (isBrowserMode && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  }, [code, isBrowserMode]);

  const resetCode = () => {
    setCode(chapter.content.initialCode);
    setOutput("");
    setShowSolution(false);
  };

  const handleShowSolution = () => {
    setCode(chapter.content.solution);
    setShowSolution(true);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <div className="lg:w-2/5 border-b lg:border-b-0 lg:border-r border-border/40 overflow-y-auto p-6 bg-card">
        <div className="max-w-none">
          <h2 className="text-lg font-bold mb-4">{chapter.title}</h2>
          <div
            className="text-sm leading-relaxed text-muted-foreground lesson-content"
            dangerouslySetInnerHTML={{ __html: chapter.content.instructions }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-4 bg-[#1e1e1e]">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full min-h-[250px] bg-transparent text-[#d4d4d4] font-mono text-sm resize-none outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          <div className="border-t border-border/40 bg-card p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" onClick={runCode} disabled={isBrowserMode}>
                <Play className="w-4 h-4 mr-1" />
                Run
              </Button>
              <Button size="sm" variant="outline" onClick={resetCode}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleShowSolution}
              >
                <Eye className="w-4 h-4 mr-1" />
                Show Solution
              </Button>
            </div>

            {!isBrowserMode && output && (
              <div className="mt-3 rounded-lg bg-[#1e1e1e] p-3">
                <pre className="text-sm text-[#d4d4d4] font-mono whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>

        {isBrowserMode && (
          <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-border/40 bg-white">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#f5f5f5] border-b border-border/40">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground ml-2">
                Browser Preview
              </span>
            </div>
            <iframe
              ref={iframeRef}
              className="w-full h-full min-h-[300px]"
              title="Browser Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
