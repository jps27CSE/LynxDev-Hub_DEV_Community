"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import RoadmapCard from "./RoadmapCard";
import type { Roadmap } from "@/config/roadmaps/types";

const CATEGORIES: { value: Roadmap["category"] | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full Stack" },
  { value: "ai", label: "AI" },
  { value: "system-design", label: "System Design" },
  { value: "devops", label: "DevOps" },
  { value: "data", label: "Data" },
];

const LEVELS: { value: Roadmap["level"] | "all"; label: string }[] = [
  { value: "all", label: "Any level" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function RoadmapList({ roadmaps }: { roadmaps: Roadmap[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Roadmap["category"] | "all">("all");
  const [level, setLevel] = useState<Roadmap["level"] | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roadmaps.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (level !== "all" && r.level !== level) return false;
      if (!q) return true;
      const haystack = [r.title, r.description, ...r.tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [roadmaps, query, category, level]);

  const hasFilters = query.trim() !== "" || category !== "all" || level !== "all";

  const availableCategories = useMemo(
    () =>
      CATEGORIES.filter(
        (c) => c.value === "all" || roadmaps.some((r) => r.category === c.value),
      ),
    [roadmaps],
  );

  return (
    <div>
      {/* Search + filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roadmaps by title, topic, or tag…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-card/60 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
            aria-label="Search roadmaps"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {availableCategories.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                category === c.value
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-card/40 text-muted-foreground border-border/50 hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLevel(l.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                level === l.value
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-card/40 text-muted-foreground border-border/50 hover:text-foreground"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/50 rounded-2xl">
          <p className="text-muted-foreground text-sm">No roadmaps match your filters.</p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
                setLevel("all");
              }}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <RoadmapCard key={r.slug} roadmap={r} />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground/60 mt-6">
        Showing {filtered.length} of {roadmaps.length} roadmaps
      </p>
    </div>
  );
}