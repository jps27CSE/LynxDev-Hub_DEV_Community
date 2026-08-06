"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Search, SearchX, Trophy } from "lucide-react";
import { difficultyBadgeClass } from "@/lib/interview-ui";
import type { TopProblem } from "@/config/problems/top-problems";

const difficulties = ["all", "easy", "medium", "hard"] as const;

type TopProblemsClientProps = {
  problems: TopProblem[];
  groups: string[];
};

export default function TopProblemsClient({
  problems,
  groups,
}: TopProblemsClientProps) {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] =
    useState<(typeof difficulties)[number]>("all");
  const [group, setGroup] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((p) => {
      if (difficulty !== "all" && p.difficulty !== difficulty) return false;
      if (group !== "all" && p.group !== group) return false;
      if (q && !p.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [problems, query, difficulty, group]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <Trophy className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
              Top LeetCode Problems
            </h1>
            <p className="text-muted-foreground mt-1">
              The most-asked interview problems — Top Interview 150 + Top 100
              Liked
            </p>
            <div className="text-sm text-muted-foreground mt-2">
              {problems.length} curated problems
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search problems…"
              className="w-full rounded-lg border border-border/50 bg-card pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  difficulty === d
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border/50 hover:border-border"
                }`}
              >
                {d === "all"
                  ? "All Difficulties"
                  : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="ml-auto rounded-lg border border-border/50 bg-card px-3 py-1 text-xs font-medium text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Topics</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-border">
            <SearchX className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              No problems match your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              {filtered.length} problem{filtered.length !== 1 ? "s" : ""}
            </div>
            <div className="space-y-3 mb-8">
              {filtered.map((p, idx) => (
                <div
                  key={p.slug}
                  className="rounded-2xl border border-border bg-card p-5 hover:border-border transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground font-mono">
                          #{idx + 1}
                        </span>
                        <h3 className="font-medium text-sm leading-relaxed">
                          {p.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Badge
                          variant="outline"
                          className={difficultyBadgeClass(p.difficulty)}
                        >
                          {p.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {p.group}
                        </Badge>
                        {p.topics.slice(0, 3).map((tag) => (
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
                    <Link
                      href={`https://leetcode.com/problems/${p.slug}/`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex-shrink-0"
                    >
                      <Badge
                        variant="outline"
                        className="gap-1.5 bg-muted/50 hover:bg-muted transition-colors text-muted-foreground"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Solve on LeetCode
                      </Badge>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
