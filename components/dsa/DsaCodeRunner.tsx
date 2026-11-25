"use client";

import { useCallback, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Eye,
  Loader2,
  Play,
  RotateCcw,
  TriangleAlert,
  X,
} from "lucide-react";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { runJavaScript, runTypeScript } from "@/lib/editor";
import type { RunResult } from "@/lib/editor";
import { buildProbeSource, judge, type TestVerdict } from "@/lib/dsa/judge";
import PracticePanel from "./PracticePanel";

type Props = {
  starter: string;
  solution: string;
  language: "javascript" | "typescript";
  tests?: { input: string; expected: string }[];
};

/**
 * The practice surface: editor, run, verdicts.
 *
 * Two behaviours are deliberate and differ from the first version:
 *
 * 1. **Verdicts are per-test rows, not a text dump.** A learner needs to see
 *    *which* case failed before they can see *why*; three unlabelled lines of
 *    `input / expected / actual` make that a reading exercise.
 * 2. **A passing row collapses to one line.** Failure is expanded, success is
 *    quiet — so a green run stays a short list and a red run is the only thing
 *    that takes up space.
 *
 * The evaluation itself lives in `lib/dsa/judge.ts`, where it is unit tested.
 */
export default function DsaCodeRunner({
  starter,
  solution,
  language,
  tests = [],
}: Props) {
  const [code, setCode] = useState(starter);
  const [output, setOutput] = useState("");
  const [runError, setRunError] = useState<string | null>(null);
  const [running, setRunning] = useState<"run" | "tests" | null>(null);
  const [verdicts, setVerdicts] = useState<TestVerdict[] | null>(null);
  const [loadedSolution, setLoadedSolution] = useState(false);
  /** What the learner had before they asked to see the solution. */
  const savedCode = useRef<string | null>(null);

  const execute = useCallback(
    (source: string): Promise<RunResult> =>
      language === "typescript" ? runTypeScript(source) : runJavaScript(source),
    [language],
  );

  const runCode = async () => {
    setRunning("run");
    setVerdicts(null);
    try {
      const result = await execute(code);
      setOutput(result.error ? "" : result.output);
      setRunError(result.error);
    } finally {
      setRunning(null);
    }
  };

  const runTests = async () => {
    setRunning("tests");
    setOutput("");
    setRunError(null);
    const results: TestVerdict[] = [];
    for (const test of tests) {
      const result = await execute(`${code}\n${buildProbeSource(test.input)}`);
      results.push({
        input: test.input,
        ...judge(result.output, test.expected, result.error),
      });
    }
    setVerdicts(results);
    setRunning(null);
  };

  const reset = () => {
    setCode(starter);
    setOutput("");
    setRunError(null);
    setVerdicts(null);
    setLoadedSolution(false);
    savedCode.current = null;
  };

  const loadSolution = () => {
    if (!loadedSolution) savedCode.current = code;
    setCode(solution);
    setLoadedSolution(true);
  };

  const restoreMine = () => {
    if (savedCode.current !== null) setCode(savedCode.current);
    setLoadedSolution(false);
    savedCode.current = null;
  };

  const busy = running !== null;
  const passed = verdicts?.filter((v) => v.pass).length ?? 0;

  return (
    <PracticePanel
      label="Runner"
      meta={language === "typescript" ? "TypeScript" : "JavaScript"}
      headerActions={
        tests.length > 0 ? (
          <span className="cp-tabular font-mono text-[11px] text-cp-panel-ink/45">
            {tests.length} test{tests.length === 1 ? "" : "s"}
          </span>
        ) : null
      }
      footer={
        <div className="flex flex-wrap items-center gap-1.5">
          <PanelButton
            variant="primary"
            onClick={runCode}
            disabled={busy}
            icon={
              running === "run" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )
            }
          >
            {running === "run" ? "Running" : "Run"}
          </PanelButton>

          {tests.length > 0 ? (
            <PanelButton
              onClick={runTests}
              disabled={busy}
              icon={
                running === "tests" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )
              }
            >
              Run tests
            </PanelButton>
          ) : null}

          <PanelButton
            onClick={reset}
            disabled={busy}
            icon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Reset
          </PanelButton>

          {loadedSolution ? (
            <PanelButton
              onClick={restoreMine}
              icon={<RotateCcw className="h-3.5 w-3.5" />}
            >
              Restore my code
            </PanelButton>
          ) : (
            <PanelButton
              onClick={loadSolution}
              disabled={busy}
              icon={<Eye className="h-3.5 w-3.5" />}
            >
              Load solution
            </PanelButton>
          )}

          {loadedSolution ? (
            <span className="ml-auto text-[11px] text-cp-panel-ink/45">
              Solution loaded — Reset restores the starter
            </span>
          ) : null}
        </div>
      }
    >
      <div className="border-b border-cp-panel-edge">
        <MonacoEditor
          value={code}
          onChange={setCode}
          height="320px"
          language={language}
        />
      </div>

      {output || runError || verdicts ? (
        <div className="bg-cp-console">
          <div className="flex items-center justify-between gap-3 border-b border-cp-panel-edge px-3.5 py-1.5">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-cp-panel-ink/45">
              {verdicts ? "Verdicts" : "Output"}
            </span>
            {verdicts ? (
              <span
                className={`cp-tabular font-mono text-[11px] ${
                  passed === verdicts.length ? "text-cp-pass" : "text-cp-fail"
                }`}
              >
                {passed} / {verdicts.length} accepted
              </span>
            ) : null}
          </div>

          {runError ? (
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap px-3.5 py-2.5 font-mono text-[12.5px] leading-6 text-cp-fail">
              {runError}
            </pre>
          ) : null}

          {output && !runError ? (
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap px-3.5 py-2.5 font-mono text-[12.5px] leading-6 text-cp-panel-ink/85">
              {output}
            </pre>
          ) : null}

          {verdicts ? (
            <ul className="divide-y divide-cp-panel-edge">
              {verdicts.map((verdict, index) => (
                <li key={`${index}-${verdict.input}`} className="px-3.5 py-2">
                  <div className="flex items-baseline gap-2.5">
                    <span className="cp-tabular w-3 shrink-0 font-mono text-[11px] text-cp-panel-ink/35">
                      {index + 1}
                    </span>
                    <VerdictChip verdict={verdict} />
                    <code className="min-w-0 truncate font-mono text-[12px] text-cp-panel-ink/60">
                      {verdict.input}
                    </code>
                  </div>

                  {!verdict.pass ? (
                    <div className="mt-1.5 space-y-0.5 pl-[1.4rem] font-mono text-[12px] leading-5">
                      <p className="text-cp-panel-ink/40">
                        expected{" "}
                        <span className="text-cp-panel-ink/80">
                          {verdict.expected}
                        </span>
                      </p>
                      <p className="text-cp-panel-ink/40">
                        got{" "}
                        <span className="text-cp-fail">{verdict.actual}</span>
                      </p>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </PracticePanel>
  );
}

function VerdictChip({ verdict }: { verdict: TestVerdict }) {
  if (verdict.errored) {
    return (
      <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cp-fail">
        <TriangleAlert className="h-3 w-3" aria-hidden="true" />
        Error
      </span>
    );
  }
  if (verdict.pass) {
    return (
      <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cp-pass">
        <Check className="h-3 w-3" aria-hidden="true" />
        Accepted
      </span>
    );
  }
  return (
    <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cp-fail">
      <X className="h-3 w-3" aria-hidden="true" />
      Wrong answer
    </span>
  );
}

function PanelButton({
  children,
  onClick,
  disabled = false,
  variant = "ghost",
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  icon?: React.ReactNode;
}) {
  const base =
    "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cp-accent/60 disabled:pointer-events-none disabled:opacity-40";
  const styles =
    variant === "primary"
      ? "bg-cp-accent text-cp-on-accent hover:bg-cp-accent/90"
      : "border border-cp-panel-edge text-cp-panel-ink/75 hover:bg-cp-panel-ink/10 hover:text-cp-panel-ink";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles}`}
    >
      {icon}
      {children}
    </button>
  );
}
