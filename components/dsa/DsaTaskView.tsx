"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import PracticePanel from "./PracticePanel";
import type { DsaTaskState } from "@/config/dsa/types";

type TaskStep = {
  id: string;
  title: string;
  brief: string;
  hint: string;
  reveal: string;
};

type TaskCriterion = {
  id: string;
  label: string;
  required: boolean;
  explain: string;
};

type Props = {
  moduleSlug: string;
  moduleTitle: string;
  task: {
    brief: string;
    steps: TaskStep[];
    passCriteria: TaskCriterion[];
    startState: DsaTaskState;
    solutionState: DsaTaskState;
  };
};

/**
 * The build task, as a briefing.
 *
 * This page cannot grade anybody. `DsaStep.check` and `DsaPassCriterion.assert`
 * are functions on the authored task, and functions cannot cross into a Client
 * Component — the build fails if they try ("Functions cannot be passed directly
 * to Client Components"). So every check shown here is labelled as an
 * explanation of what "done" means, never as a tick that was measured. What the
 * page can honestly offer is the three things a learner needs before touching
 * the code: the break, the procedure, and the shape of the data.
 *
 * That last one is why the state inspector exists. `startState` and
 * `solutionState` are authored, serialisable, and otherwise invisible — the
 * difference between them *is* the task.
 */
export default function DsaTaskView({ moduleSlug, moduleTitle, task }: Props) {
  const [view, setView] = useState<"start" | "reference">("start");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const state = view === "start" ? task.startState : task.solutionState;
  const requiredChecks = task.passCriteria.filter((c) => c.required).length;
  const advisoryChecks = task.passCriteria.length - requiredChecks;

  const markDone = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      const solution = task.solutionState;
      const res = await fetch("/api/dsa/task-state", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          taskSlug: `${moduleSlug}/task`,
          data: solution.data,
          completedSteps: solution.completedSteps,
          criteriaMet: solution.criteriaMet,
          attempts: solution.attempts,
          revealed: solution.revealed,
          updatedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`save failed (${res.status})`);
      setSaved(true);
      toast("Task recorded");
    } catch {
      toast.error("Could not save the task. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cp-scope">
      {/* `pt-16` clears the fixed mobile sidebar toggle (36px at top-3). */}
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-10">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link href="/dsa" className="transition-colors hover:text-foreground">
            DSA
          </Link>
          <span aria-hidden="true" className="mx-1.5">
            /
          </span>
          <Link
            href={`/dsa/${moduleSlug}`}
            className="transition-colors hover:text-foreground"
          >
            {moduleTitle}
          </Link>
          <span aria-hidden="true" className="mx-1.5">
            /
          </span>
          <span aria-current="page" className="text-foreground/80">
            Build task
          </span>
        </nav>

        <header className="mt-6">
          <div className="cp-tabular flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span>Build task</span>
            <span aria-hidden="true">·</span>
            <span>
              {task.steps.length} step{task.steps.length === 1 ? "" : "s"}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {task.passCriteria.length} check
              {task.passCriteria.length === 1 ? "" : "s"}
            </span>
          </div>
          <h1 className="mt-3 font-display text-[2rem] font-semibold leading-[1.12] tracking-tight sm:text-[2.6rem]">
            {moduleTitle}
          </h1>
        </header>

        {/* The break — the one paragraph that has to be read before anything else. */}
        <p className="mt-6 max-w-3xl text-[1.0625rem] leading-8 text-foreground/85">
          {task.brief}
        </p>

        <div className="mt-12 grid gap-x-10 gap-y-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            <section>
              <div className="flex items-baseline justify-between gap-4 border-b border-border/70 pb-2">
                <h2 className="font-display text-lg font-medium tracking-tight">
                  Steps
                </h2>
                <span className="cp-tabular font-mono text-[10px] text-muted-foreground">
                  {String(task.steps.length).padStart(2, "0")}
                </span>
              </div>

              <ol>
                {task.steps.map((step, index) => (
                  <li key={step.id} className="border-b border-border/50 py-5">
                    <div className="flex gap-4">
                      <span className="cp-tabular mt-0.5 shrink-0 font-mono text-[11px] text-cp-accent">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-[0.95rem] font-medium">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-foreground/75">
                          {step.brief}
                        </p>

                        <div className="mt-3 space-y-1.5">
                          <StepDisclosure summary="Hint">
                            {step.hint}
                          </StepDisclosure>
                          <StepDisclosure summary="Reasoning">
                            {step.reveal}
                          </StepDisclosure>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-12">
              <div className="flex items-baseline justify-between gap-4 border-b border-border/70 pb-2">
                <h2 className="font-display text-lg font-medium tracking-tight">
                  What done looks like
                </h2>
                <span className="cp-tabular font-mono text-[10px] text-muted-foreground">
                  {requiredChecks} required
                  {advisoryChecks > 0 ? ` · ${advisoryChecks} advisory` : ""}
                </span>
              </div>

              <dl className="divide-y divide-border/50">
                {task.passCriteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className="grid gap-1 py-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6"
                  >
                    <dt className="flex items-start gap-2 text-sm font-medium">
                      {criterion.required ? (
                        <Check
                          className="mt-1 h-3.5 w-3.5 shrink-0 text-cp-accent"
                          aria-hidden="true"
                        />
                      ) : (
                        <TriangleAlert
                          className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/70"
                          aria-hidden="true"
                        />
                      )}
                      <span>
                        {criterion.label}
                        {!criterion.required ? (
                          <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                            Advisory — shown, never blocking
                          </span>
                        ) : null}
                      </span>
                    </dt>
                    <dd className="pl-5 text-sm leading-6 text-foreground/70 sm:pl-0">
                      {criterion.explain}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          {/* Not sticky: `main` in AppShell is `overflow-hidden`, so it becomes
              the nearest scrolling ancestor and it never scrolls. The panel
              simply starts at the top of its column. */}
          <aside className="lg:self-start" aria-label="Task state">
            <PracticePanel
              label="State"
              headerActions={
                <div className="flex items-center gap-0.5">
                  <ViewTab
                    active={view === "start"}
                    onClick={() => setView("start")}
                  >
                    Start
                  </ViewTab>
                  <ViewTab
                    active={view === "reference"}
                    onClick={() => setView("reference")}
                  >
                    Reference
                  </ViewTab>
                </div>
              }
              footer={
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    {state.completedSteps.length === 0 ? (
                      <span className="font-mono text-[10px] text-cp-panel-ink/40">
                        no steps recorded
                      </span>
                    ) : (
                      state.completedSteps.map((id) => (
                        <span
                          key={id}
                          className="rounded border border-cp-panel-edge px-1.5 py-0.5 font-mono text-[10px] text-cp-panel-ink/60"
                        >
                          {id}
                        </span>
                      ))
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-cp-panel-ink/35">
                    read-only · authored task data
                  </p>
                </div>
              }
            >
              <pre className="max-h-[22rem] overflow-auto px-4 py-3 font-mono text-[12px] leading-6 text-cp-panel-ink/85">
                {JSON.stringify(state.data, null, 2)}
              </pre>
            </PracticePanel>

            <div className="mt-5">
              <button
                type="button"
                onClick={markDone}
                disabled={saved || saving}
                className={`inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold sm:w-auto sm:px-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cp-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  saved
                    ? "border border-cp-pass/40 text-cp-pass"
                    : "bg-cp-accent text-cp-on-accent hover:bg-cp-accent/90 disabled:opacity-60"
                }`}
              >
                {saving ? (
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {saved ? "Task done" : saving ? "Saving" : "Mark task done"}
              </button>
              <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                {saved
                  ? "Recorded on your account."
                  : "Saves this task as done on your account."}
              </p>

              <Link
                href={`/dsa/${moduleSlug}`}
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-cp-accent"
              >
                <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                Back to {moduleTitle}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StepDisclosure({
  summary,
  children,
}: {
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-cp-accent">
        <ChevronDown
          className="h-3 w-3 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
        {summary}
      </summary>
      <p className="mt-1.5 border-l border-border/60 pl-3 text-[13px] leading-6 text-foreground/70">
        {children}
      </p>
    </details>
  );
}

function ViewTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
        active
          ? "bg-cp-accent/15 text-cp-accent"
          : "text-cp-panel-ink/45 hover:text-cp-panel-ink/80"
      }`}
    >
      {children}
    </button>
  );
}
