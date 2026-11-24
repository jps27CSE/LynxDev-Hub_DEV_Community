"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import type { DsaTaskState } from "@/config/dsa/types";

type TaskStep = { id: string; title: string; brief: string; hint: string; reveal: string };
type TaskCriterion = { id: string; label: string; required: boolean; explain: string };

type Props = {
  moduleSlug: string;
  task: {
    brief: string;
    steps: TaskStep[];
    passCriteria: TaskCriterion[];
    solutionState: DsaTaskState;
  };
};

export default function DsaTaskView({ moduleSlug, task }: Props) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) =>
    setRevealed((r) => ({ ...r, [id]: !r[id] }));

  const handleComplete = async () => {
    setSaving(true);
    try {
      const state: DsaTaskState = task.solutionState;
      await axios.post("/api/dsa/task-state", {
        taskSlug: `${moduleSlug}/task`,
        data: state.data,
        completedSteps: state.completedSteps,
        criteriaMet: state.criteriaMet,
        attempts: state.attempts,
        revealed: state.revealed,
        updatedAt: new Date().toISOString(),
      });
      setCompleted(true);
      toast("Task saved", { icon: "✅" });
    } catch {
      toast.error("Failed to save task state.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Build Task</h1>
        <p className="text-muted-foreground mt-2">{task.brief}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Steps</h2>
        <div className="space-y-3">
          {task.steps.map((step) => (
            <div key={step.id} className="rounded-lg border border-border/40 bg-card p-4">
              <button
                onClick={() => toggle(step.id)}
                className="flex items-center gap-2 w-full text-left"
              >
                {revealed[step.id] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span className="font-medium">{step.title}</span>
              </button>
              <p className="text-sm text-muted-foreground mt-1 ml-6">{step.brief}</p>
              {revealed[step.id] && (
                <div className="ml-6 mt-2 space-y-2 text-sm">
                  <div className="rounded bg-muted/40 p-2">
                    <span className="font-medium">Hint: </span>
                    {step.hint}
                  </div>
                  <div className="rounded bg-muted/40 p-2">
                    <span className="font-medium">Reveal: </span>
                    {step.reveal}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Pass criteria</h2>
        <ul className="space-y-1 text-sm">
          {task.passCriteria.map((c) => (
            <li key={c.id} className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${c.required ? "bg-primary" : "bg-muted-foreground"}`}
              />
              {c.label}
              {!c.required && (
                <span className="text-xs text-muted-foreground">(advisory)</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <Button onClick={handleComplete} disabled={completed || saving} className="w-full">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
        {completed ? "Completed" : "Mark Task Complete"}
      </Button>
    </div>
  );
}
