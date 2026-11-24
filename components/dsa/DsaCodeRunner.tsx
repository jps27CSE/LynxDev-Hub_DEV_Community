"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Eye, Loader2, CheckCircle, XCircle } from "lucide-react";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { runJavaScript, runTypeScript } from "@/lib/editor";
import type { RunResult } from "@/lib/editor";

type Test = { input: string; expected: string };

type Props = {
  starter: string;
  solution: string;
  language: "javascript" | "typescript";
  tests?: Test[];
};

export default function DsaCodeRunner({ starter, solution, language, tests = [] }: Props) {
  const [code, setCode] = useState(starter);
  const [output, setOutput] = useState("");
  const [runError, setRunError] = useState(false);
  const [running, setRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [testResults, setTestResults] = useState<
    { input: string; expected: string; actual: string; pass: boolean }[] | null
  >(null);

  const runCode = async () => {
    setRunning(true);
    setTestResults(null);
    try {
      const result: RunResult =
        language === "typescript"
          ? await runTypeScript(code)
          : await runJavaScript(code);
      setOutput(result.error ? `Error: ${result.error}` : result.output);
      setRunError(result.error !== null);
    } finally {
      setRunning(false);
    }
  };

  const runTests = async () => {
    setRunning(true);
    setOutput("");
    setRunError(false);
    const results: { input: string; expected: string; actual: string; pass: boolean }[] = [];
    for (const t of tests) {
      try {
        const result: RunResult =
          language === "typescript"
            ? await runTypeScript(`${code}\nconsole.log(${t.input});`)
            : await runJavaScript(`${code}\nconsole.log(${t.input});`);
        const actual = result.error ? `Error: ${result.error}` : result.output.trim();
        results.push({
          input: t.input,
          expected: t.expected,
          actual,
          pass: !result.error && actual === t.expected.trim(),
        });
      } catch {
        results.push({ input: t.input, expected: t.expected, actual: "Error", pass: false });
      }
    }
    setTestResults(results);
    setRunning(false);
  };

  const resetCode = () => {
    setCode(starter);
    setOutput("");
    setRunError(false);
    setTestResults(null);
    setShowSolution(false);
  };

  const handleShowSolution = () => {
    setCode(solution);
    setShowSolution(true);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="h-[320px] rounded-lg overflow-hidden border border-border/40">
        <MonacoEditor value={code} onChange={setCode} height="320px" language={language} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" onClick={runCode} disabled={running}>
          {running ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
          {running ? "Running..." : "Run"}
        </Button>
        {tests.length > 0 && (
          <Button size="sm" variant="outline" onClick={runTests} disabled={running}>
            Run tests ({tests.length})
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={resetCode}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
        <Button size="sm" variant="outline" onClick={handleShowSolution}>
          <Eye className="w-4 h-4 mr-1" />
          Show Solution
        </Button>
      </div>

      {output && !testResults && (
        <div className="rounded-lg bg-[#1e1e1e] max-h-48 overflow-y-auto">
          <pre
            className={`text-sm font-mono whitespace-pre-wrap p-3 ${
              runError ? "text-red-400" : "text-[#d4d4d4]"
            }`}
          >
            {output}
          </pre>
        </div>
      )}

      {testResults && (
        <div className="space-y-1">
          {testResults.map((r, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-sm rounded-md border border-border/40 p-2"
            >
              {r.pass ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
              )}
              <div className="font-mono text-xs">
                <div>input: {r.input}</div>
                <div>expected: {r.expected}</div>
                <div>actual: {r.actual}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSolution && (
        <p className="text-xs text-muted-foreground">Solution loaded into the editor.</p>
      )}
    </div>
  );
}
