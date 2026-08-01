"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import type { Problem } from "@/lib/problem-data";

const difficultyColor: Record<string, string> = {
  easy: "bg-green-500/10 text-green-500 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function ProblemDetailClient({
  problem,
}: {
  problem: Problem;
}) {
  const [code, setCode] = useState(problem.starter_code || "");
  const [output, setOutput] = useState<string | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [running, setRunning] = useState(false);

  const runCode = async () => {
    setRunning(true);
    setOutput(null);
    setPassed(null);

    try {
      const logs: string[] = [];
      const mockConsole = { log: (...args: unknown[]) => logs.push(args.map(String).join(" ")) };

      const fn = new Function("console", code);
      fn(mockConsole);

      setOutput(logs.join("\n") || "No output");
      setPassed(null);
    } catch (err: unknown) {
      setOutput(err instanceof Error ? err.message : "Error executing code");
      setPassed(false);
    } finally {
      setRunning(false);
    }
  };

  const runTests = async () => {
    if (!problem.test_cases) return;
    setRunning(true);
    setOutput(null);
    setPassed(null);

    try {
      let allPassed = true;
      const results: string[] = [];

      for (const tc of problem.test_cases) {
        try {
          const fn = new Function(code);
          const result = fn();
          results.push(`Test: ${tc.input} → ${result === tc.expected ? "PASS" : `FAIL (got ${result})`}`);
          if (result !== tc.expected) allPassed = false;
        } catch (err: unknown) {
          results.push(`Test: ${tc.input} → ERROR: ${err instanceof Error ? err.message : "Unknown error"}`);
          allPassed = false;
        }
      }

      setOutput(results.join("\n"));
      setPassed(allPassed);
    } catch (err: unknown) {
      setOutput(err instanceof Error ? err.message : "Error running tests");
      setPassed(false);
    } finally {
      setRunning(false);
    }
  };

  const resetCode = () => {
    setCode(problem.starter_code || "");
    setOutput(null);
    setPassed(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/problems"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
        >
          &larr; Back to Problems
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold tracking-tight">
                {problem.title}
              </h1>
              <Badge
                variant="outline"
                className={
                  difficultyColor[problem.difficulty] ||
                  "bg-muted text-muted-foreground"
                }
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="prose prose-sm prose-invert max-w-none">
              {problem.description.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
                <span className="text-xs font-medium text-muted-foreground">
                  JavaScript
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetCode}
                    className="h-7 text-xs gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={runCode}
                    disabled={running}
                    className="h-7 text-xs gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Run
                  </Button>
                  {problem.test_cases && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={runTests}
                      disabled={running}
                      className="h-7 text-xs gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Test
                    </Button>
                  )}
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-card text-sm font-mono p-4 outline-none resize-none"
                style={{ minHeight: "300px" }}
                spellCheck={false}
              />
            </div>

            {output !== null && (
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  {passed === true && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-medium text-green-500">All tests passed!</span>
                    </>
                  )}
                  {passed === false && (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-medium text-red-500">Tests failed</span>
                    </>
                  )}
                  {passed === null && (
                    <span className="text-xs font-medium text-muted-foreground">Output</span>
                  )}
                </div>
                <pre className="text-sm font-mono text-muted-foreground whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
