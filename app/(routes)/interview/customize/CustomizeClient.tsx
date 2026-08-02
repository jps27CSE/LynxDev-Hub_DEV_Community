"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Save, RotateCcw } from "lucide-react";
import Link from "next/link";
import { formatTagLabel } from "@/lib/tags";
import { INTERVIEW_STACKS_STORAGE_KEY } from "@/lib/interview-constants";

type Props = {
  tags: string[];
};

export default function CustomizeClient({ tags }: Props) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [savedFlash, setSavedFlash] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(INTERVIEW_STACKS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;
        if (Array.isArray(parsed)) {
          const valid = (parsed as string[]).filter((t) => tags.includes(t));
          setSelectedTags(new Set(valid));
        }
      } catch {}
    }
  }, [tags]);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
    setSavedFlash(false);
  };

  const persistSelection = () => {
    try {
      localStorage.setItem(
        INTERVIEW_STACKS_STORAGE_KEY,
        JSON.stringify(Array.from(selectedTags)),
      );
    } catch {
      /* ignore storage errors */
    }
  };

  const saveSelection = () => {
    persistSelection();
    setSavedFlash(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSavedFlash(false), 2500);
  };

  const resetStack = () => {
    setSelectedTags(new Set());
    localStorage.removeItem(INTERVIEW_STACKS_STORAGE_KEY);
    setSavedFlash(false);
  };

  const selectAll = () => {
    setSelectedTags(new Set(tags));
    setSavedFlash(false);
  };

  const selectedCount = selectedTags.size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">
          Customize Your Interview Prep
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-lg">
          Companies use different stacks. Pick the technologies, packages, and
          concepts you are targeting — we will tailor your interview preparation
          accordingly.
        </p>
      </div>

      {tags.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-card/40 px-6 py-14 text-center space-y-2">
          <p className="text-sm text-foreground/80">No stacks available yet.</p>
          <p className="text-xs text-muted-foreground">
            Check back once interview questions are added.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">
              {tags.length} common stacks &amp; topics
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={selectAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Select all
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const active = selectedTags.has(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border/50 hover:border-border hover:text-foreground"
                  }`}
                >
                  {active && <Check className="w-3 h-3" />}
                  {formatTagLabel(tag)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4">
          <div className="text-sm text-muted-foreground">
            {selectedCount > 0 ? (
              <span>
                <strong className="text-foreground">{selectedCount}</strong>{" "}
                topic{selectedCount !== 1 ? "s" : ""} selected
              </span>
            ) : (
              <span>No topics selected yet</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedCount > 0 && (
              <button
                onClick={resetStack}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
            <Button
              onClick={saveSelection}
              disabled={selectedCount === 0}
              size="sm"
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {savedFlash ? "Saved!" : "Save My Stack"}
            </Button>
          </div>
        </div>
      )}

      {selectedCount > 0 && (
        <div className="text-center">
          <Link href="/interview/stack" onClick={persistSelection}>
            <Button variant="outline" className="gap-2">
              Start Prepping
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
