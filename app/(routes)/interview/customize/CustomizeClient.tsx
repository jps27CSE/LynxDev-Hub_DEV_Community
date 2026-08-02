"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Save, RotateCcw } from "lucide-react";
import Link from "next/link";
import { formatTagLabel } from "@/lib/tags";

const STORAGE_KEY = "lynxdev_interview_stacks";

type StackGroup = {
  name: string;
  slug: string;
  icon: string | null;
  tags: string[];
};

type Props = {
  stacksByCategory: StackGroup[];
};

export default function CustomizeClient({ stacksByCategory }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        setSelected(new Set(parsed));
      } catch {}
    }
  }, []);

  const toggleTag = (tag: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
    setSaved(false);
  };

  const saveSelection = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selected)));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const clearSelection = () => {
    setSelected(new Set());
    localStorage.removeItem(STORAGE_KEY);
    setSaved(false);
  };

  const selectAllInGroup = (tags: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const tag of tags) next.add(tag);
      return next;
    });
    setSaved(false);
  };

  const clearGroup = (tags: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const tag of tags) next.delete(tag);
      return next;
    });
    setSaved(false);
  };

  const allTags = stacksByCategory.flatMap((g) => g.tags);
  const selectedCount = selected.size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">
          Customize Your Interview Prep
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-lg">
          Different companies use different stacks. Select the technologies you
          are targeting, and we will tailor your interview preparation
          accordingly.
        </p>
      </div>

      {stacksByCategory.map((group) => {
        const groupSelected = group.tags.filter((t) => selected.has(t)).length;
        return (
          <div
            key={group.slug}
            className="rounded-xl border border-border/50 bg-card p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{group.icon || "📁"}</span>
                <div>
                  <h2 className="font-semibold text-base">{group.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {group.tags.length} topics available
                    {groupSelected > 0 && (
                      <span className="text-primary">
                        {" "}
                        · {groupSelected} selected
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => selectAllInGroup(group.tags)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Select all
                </button>
                {groupSelected > 0 && (
                  <button
                    onClick={() => clearGroup(group.tags)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag) => {
                const active = selected.has(tag);
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
        );
      })}

      <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4">
        <div className="text-sm text-muted-foreground">
          {selectedCount > 0 ? (
            <span>
              <strong className="text-foreground">{selectedCount}</strong> stack
              {selectedCount !== 1 ? "s" : ""} selected
            </span>
          ) : (
            <span>No stacks selected yet</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <button
              onClick={clearSelection}
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
            {saved ? "Saved!" : "Save My Stack"}
          </Button>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="text-center">
          <Link href="/interview">
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
