"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Eye, CheckCircle, Loader2, Star } from "lucide-react";
import axios from "axios";
import { UserDetailContext } from "@/context/UserDetailContext";
import { toast } from "sonner";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { runJavaScript } from "@/lib/editor";

const IFRAME_SCROLLBAR_CSS = [
  "html{scrollbar-width:thin;scrollbar-color:rgba(100,116,139,0.35) transparent}",
  "::-webkit-scrollbar{width:8px;height:8px}",
  "::-webkit-scrollbar-track{background:transparent}",
  "::-webkit-scrollbar-thumb{background:rgba(100,116,139,0.35);border-radius:9999px}",
  "::-webkit-scrollbar-thumb:hover{background:rgba(100,116,139,0.55)}",
].join("");

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
  language,
}: {
  chapter: ChapterData;
  courseId: number;
  language: string;
}) {
  const [code, setCode] = useState(chapter.content.initialCode);
  const [output, setOutput] = useState("");
  const [runError, setRunError] = useState(false);
  const [running, setRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isBrowserMode = chapter.content.type === "browser";
  const { setUserDetail } = useContext(UserDetailContext);

  const runCode = async () => {
    if (isBrowserMode) {
      setOutput("");
      return;
    }

    setRunning(true);
    try {
      const result = await runJavaScript(code);
      setOutput(result.error ? `Error: ${result.error}` : result.output);
      setRunError(result.error !== null);
    } finally {
      setRunning(false);
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
        const style = doc.createElement("style");
        style.textContent = IFRAME_SCROLLBAR_CSS;
        doc.head?.appendChild(style);
      }
    }
  }, [code, isBrowserMode]);

  const resetCode = () => {
    setCode(chapter.content.initialCode);
    setOutput("");
    setRunError(false);
    setShowSolution(false);
  };

  const handleShowSolution = () => {
    setCode(chapter.content.solution);
    setShowSolution(true);
  };

  const handleMarkComplete = async () => {
    setCompleting(true);
    try {
      const res = await axios.post("/api/progress", {
        courseId,
        chapterId: chapter.id,
      });
      setCompleted(true);
      setUserDetail?.((prev) =>
        prev ? { ...prev, points: res.data.points } : prev,
      );
      toast(`+${res.data.pointsAwarded} points`, {
        icon: <Star className="w-4 h-4 text-yellow-500" />,
      });
      if (res.data.courseCompleted) {
        toast("Course completed! Great job!", {
          icon: "🎉",
        });
      }
    } catch {
      toast("Already completed or error occurred");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 lg:overflow-hidden">
      <div className="lg:w-2/5 border-b lg:border-b-0 lg:border-r border-border/40 overflow-y-auto bg-card min-h-0 scrollbar-thin overscroll-contain max-h-[45dvh] lg:max-h-none">
        <div className="p-6 max-w-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-card/50 text-[11px] text-muted-foreground mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Hands-on Lesson
          </div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold tracking-tight">
              {chapter.title}
            </h2>
            {completed && (
              <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Completed
              </span>
            )}
          </div>
          <div
            className="text-[15px] leading-7 text-foreground/80 lesson-content max-w-prose"
            dangerouslySetInnerHTML={{ __html: chapter.content.instructions }}
          />
          <div className="mt-6">
            <Button
              size="sm"
              onClick={handleMarkComplete}
              disabled={completed || completing}
              variant={completed ? "outline" : "default"}
              className="w-full"
            >
              {completing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : completed ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {completed ? "Completed" : "Mark as Complete"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0">
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 min-h-[250px] p-4 bg-[#1e1e1e]">
            <MonacoEditor
              value={code}
              onChange={setCode}
              height="100%"
              language={language}
            />
          </div>

          <div className="border-t border-border/40 bg-card p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" onClick={runCode} disabled={isBrowserMode || running}>
                {running ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-1" />
                )}
                {running ? "Running..." : "Run"}
              </Button>
              <Button size="sm" variant="outline" onClick={resetCode}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button size="sm" variant="outline" onClick={handleShowSolution}>
                <Eye className="w-4 h-4 mr-1" />
                Show Solution
              </Button>
            </div>

            {!isBrowserMode && (output || runError) && (
              <div className="mt-3 rounded-lg bg-[#1e1e1e] max-h-64 overflow-y-auto scrollbar-thin overscroll-contain">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border-b border-white/10 sticky top-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      runError ? "bg-red-500" : "bg-emerald-500 animate-pulse"
                    }`}
                  />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Console Output
                  </span>
                </div>
                <pre
                  className={`text-sm font-mono whitespace-pre-wrap p-3 ${
                    runError ? "text-red-400" : "text-[#d4d4d4]"
                  }`}
                >
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>

        {isBrowserMode && (
          <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-border/40 bg-white flex flex-col min-h-0 min-w-0">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#f5f5f5] border-b border-border/40 flex-none">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground ml-2">
                Browser Preview
              </span>
            </div>
            <iframe
              ref={iframeRef}
              className="w-full flex-1 min-h-[300px] lg:min-h-0"
              title="Browser Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
