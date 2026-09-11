"use client";

import { useState, useContext, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  RotateCcw,
  Eye,
  CheckCircle,
  Loader2,
  Star,
  Code2,
  Globe,
} from "lucide-react";
import axios from "axios";
import { UserDetailContext } from "@/context/UserDetailContext";
import { toast } from "sonner";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { runJavaScript, buildSandboxedSrcDoc } from "@/lib/editor";

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
  const [mobileTab, setMobileTab] = useState<"code" | "preview">("code");
  const isBrowserMode = chapter.content.type === "browser";
  const { setUserDetail } = useContext(UserDetailContext);

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
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = args.map(String).join(" ");
      if (msg.includes("Canceled")) return;
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  const runCode = async () => {
    if (isBrowserMode) {
      setOutput("");
      return;
    }

    setRunning(true);
    try {
      const result = await runJavaScript(code);
      if (result.error) {
        console.warn("[editor] run failed:", result.error);
      }
      setOutput(result.error ? `Error: ${result.error}` : result.output);
      setRunError(result.error !== null);
    } finally {
      setRunning(false);
    }
  };

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
      if (res.data.message === "Already completed") {
        setCompleted(true);
        return;
      }
      setCompleted(true);
      setUserDetail?.((prev) =>
        prev ? { ...prev, points: res.data.points } : prev,
      );
      toast(`+${res.data.pointsAwarded} points`, {
        icon: <Star className="w-4 h-4 text-yellow-500" />,
      });
      if (res.data.courseCompleted) {
        toast("Course completed! Great job!", {
          icon: "\uD83C\uDF89",
        });
      }
    } catch {
      toast.error("Failed to save progress. Please try again.");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
      {/* Instructions panel */}
      <div className="lg:w-2/5 border-b lg:border-b-0 lg:border-r border-border/40 overflow-y-auto bg-card min-h-0 scrollbar-thin overscroll-contain max-h-[40dvh] lg:max-h-none shrink-0">
        <div className="p-4 sm:p-6 max-w-none">
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
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {completed ? "Completed" : "Mark as Complete"}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile tab toggle — only in browser mode, only on mobile */}
      {isBrowserMode && (
        <div className="flex lg:hidden border-b border-border/40 bg-card shrink-0">
          <button
            onClick={() => setMobileTab("code")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              mobileTab === "code"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              mobileTab === "preview"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>
      )}

      {/* Editor + Preview — original desktop layout preserved */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0 overflow-hidden">
        <div
          className={`flex-1 flex flex-col min-w-0 min-h-0 ${
            isBrowserMode && mobileTab !== "code" ? "hidden lg:flex" : ""
          }`}
        >
          <div
            ref={editorContainerRef}
            className="h-[38dvh] lg:h-auto lg:flex-1 p-3 sm:p-4 bg-[#1e1e1e] overflow-hidden"
          >
            {editorHeight > 0 && (
              <MonacoEditor
                value={code}
                onChange={setCode}
                height={`${editorHeight}px`}
                language={language}
              />
            )}
          </div>

          <div className="border-t border-border/40 bg-card p-3 sm:p-4 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={runCode}
                disabled={isBrowserMode || running}
              >
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
              <Button
                size="sm"
                variant="outline"
                onClick={handleShowSolution}
              >
                <Eye className="w-4 h-4 mr-1" />
                Show Solution
              </Button>
            </div>

            {!isBrowserMode && (output || runError) && (
              <div className="mt-3 rounded-lg bg-[#1e1e1e] max-h-64 overflow-y-auto scrollbar-thin overscroll-contain">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border-b border-white/10 sticky top-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      runError
                        ? "bg-red-500"
                        : "bg-emerald-500 animate-pulse"
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
          <div
            className={`border-t lg:border-t-0 lg:border-l border-border/40 bg-white flex flex-col min-h-0 min-w-0 ${
              mobileTab !== "preview" ? "hidden lg:flex" : "flex-1"
            } lg:w-1/2`}
          >
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#f5f5f5] border-b border-border/40 flex-none">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
              <span className="text-[10px] sm:text-xs text-muted-foreground ml-1 sm:ml-2">
                Browser Preview
              </span>
            </div>
            <iframe
              srcDoc={buildSandboxedSrcDoc(code, IFRAME_SCROLLBAR_CSS)}
              sandbox="allow-scripts"
              className="w-full flex-1 min-h-[300px] lg:min-h-0"
              title="Browser Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
