"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronRight,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { formatTagLabel } from "@/lib/tags";
import { INTERVIEW_STACKS_STORAGE_KEY } from "@/lib/interview-constants";

type Props = {
  tags: string[];
};

export default function CustomizeClient({ tags }: Props) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [savedFlash, setSavedFlash] = useState(false);
  const [query, setQuery] = useState("");
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

  const filteredTags = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => formatTagLabel(t).toLowerCase().includes(q));
  }, [tags, query]);

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
  const progress =
    tags.length > 0 ? Math.round((selectedCount / tags.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/[0.06] via-background to-primary/[0.04] p-6 sm:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-card/50 text-xs text-muted-foreground mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {tags.length} stacks &amp; topics available
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
            Customize Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Interview Prep
            </span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
            Companies use different stacks. Pick the technologies, packages, and
            concepts you are targeting — we will tailor your interview
            preparation accordingly.
          </p>
        </div>
      </div>

      {tags.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-card/40 px-6 py-14 text-center space-y-2">
          <p className="text-sm text-foreground/80">No stacks available yet.</p>
          <p className="text-xs text-muted-foreground">
            Check back once interview questions are added.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
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

          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stacks and topics..."
              className="w-full bg-background border border-border/50 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {filteredTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filteredTags.map((tag) => {
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
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground">
                No stacks match "{query.trim()}".
              </p>
            </div>
          )}
        </div>
      )}

      {tags.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm">
                {selectedCount > 0 ? (
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{selectedCount}</strong>{" "}
                    of {tags.length} topic
                    {tags.length !== 1 ? "s" : ""} selected
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    No topics selected yet
                  </span>
                )}
              </div>
              <div className="w-40 h-1 rounded-full bg-muted mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
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
              {selectedCount > 0 ? (
                <Button
                  asChild
                  size="sm"
                  className="gap-2"
                  onClick={persistSelection}
                >
                  <Link href="/interview/stack">
                    Start Prepping
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="sm" disabled className="gap-2">
                  Start Prepping
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {selectedCount > 0 && (
            <div className="mt-5 pt-5 border-t border-border/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Your stack practice set is ready whenever you are.
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Adjust anytime
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
