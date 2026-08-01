"use client";

import { useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Code2,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { Problem } from "@/lib/problem-data";

const difficultyColor: Record<string, string> = {
  easy: "bg-green-500/10 text-green-500 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

const difficulties = ["all", "easy", "medium", "hard"] as const;
const PER_PAGE = 20;

type Props = {
  problems: Problem[];
  total: number;
  categories: string[];
  currentPage: number;
  selectedDifficulty: string;
  selectedCategory: string;
};

function ProblemsClientInner({
  problems,
  total,
  categories,
  currentPage,
  selectedDifficulty,
  selectedCategory,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const navigate = useCallback(
    (params: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams?.toString() ?? "");
      for (const [key, value] of Object.entries(params)) {
        if (value === "all" || value === "") {
          sp.delete(key);
        } else {
          sp.set(key, value);
        }
      }
      const qs = sp.toString();
      router.push(`/problems${qs ? `?${qs}` : ""}`);
    },
    [router, searchParams],
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-3xl flex-shrink-0">
            <Code2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
              Problem Solving
            </h1>
            <p className="text-muted-foreground mt-1">
              Data structures, algorithms, and coding challenges to sharpen your
              skills
            </p>
            <div className="text-sm text-muted-foreground mt-2">
              {total} problem{total !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground mr-1">
              Difficulty:
            </span>
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => navigate({ difficulty: d, page: "1" })}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedDifficulty === d
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border/50 hover:border-border"
                }`}
              >
                {d === "all" ? "All" : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground mr-1">
              Category:
            </span>
            {["all", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => navigate({ category: cat, page: "1" })}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border/50 hover:border-border"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        </div>

        {problems.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-border/50">
            <p className="text-muted-foreground">
              No problems match your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-8">
              {problems.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-border/50 bg-card p-5 hover:border-border transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground font-mono">
                          #{p.id}
                        </span>
                        <h3 className="font-medium text-sm leading-relaxed">
                          {p.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Badge
                          variant="outline"
                          className={
                            difficultyColor[p.difficulty] ||
                            "bg-muted text-muted-foreground"
                          }
                        >
                          {p.difficulty}
                        </Badge>
                        {p.category && (
                          <Badge variant="secondary" className="text-xs">
                            {p.category}
                          </Badge>
                        )}
                        {p.tags.slice(0, 3).map((tag) => (
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
                    <Link href={`/problems/${p.id}`} className="flex-shrink-0">
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => navigate({ page: "1" })}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => navigate({ page: String(currentPage - 1) })}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => navigate({ page: String(currentPage + 1) })}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => navigate({ page: String(totalPages) })}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProblemsClient(props: Props) {
  return (
    <Suspense fallback={null}>
      <ProblemsClientInner {...props} />
    </Suspense>
  );
}
