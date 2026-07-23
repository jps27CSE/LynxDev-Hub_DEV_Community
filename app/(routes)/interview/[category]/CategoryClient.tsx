"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles, X } from "lucide-react";

const difficultyColor: Record<string, string> = {
  easy: "bg-green-500/10 text-green-500 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

const difficulties = ["all", "easy", "medium", "hard"] as const;

type Question = {
  id: number;
  category_id: number;
  question: string;
  answer: string;
  difficulty: string;
  tags: string[];
  is_top50: boolean | null;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  color: string | null;
  questionCount: number;
};

export default function CategoryClient({
  category,
  questions,
}: {
  category: Category;
  questions: Question[];
}) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [top50Only, setTop50Only] = useState(false);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    questions.forEach((q) => q.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedTags.size > 0 && !q.tags.some((t) => selectedTags.has(t))) return false;
      if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty) return false;
      if (top50Only && !q.is_top50) return false;
      return true;
    });
  }, [questions, selectedTags, selectedDifficulty, top50Only]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedTags(new Set());
    setSelectedDifficulty("all");
    setTop50Only(false);
  };

  const hasActiveFilters = selectedTags.size > 0 || selectedDifficulty !== "all" || top50Only;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/interview"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
        >
          &larr; Back to Categories
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-3xl flex-shrink-0">
            {category.icon || "📁"}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {category.name}
            </h1>
            <p className="text-muted-foreground mt-1">{category.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-muted-foreground">
                {questions.length} questions
              </span>
              <span className="text-sm text-muted-foreground">&middot;</span>
              <span className="text-sm text-muted-foreground">
                {filteredQuestions.length} shown
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Link href={`/interview/${category.slug}/practice`}>
            <Button className="gap-2">
              <Sparkles className="w-4 h-4" />
              Start Practice
            </Button>
          </Link>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground mr-1">
              Difficulty:
            </span>
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
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
              Tags:
            </span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedTags.has(tag)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border/50 hover:border-border"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={top50Only}
                onChange={(e) => setTop50Only(e.target.checked)}
                className="rounded border-border/50"
              />
              <span className="text-sm text-muted-foreground">Top 50 only</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-border/50">
            <p className="text-muted-foreground">
              No questions match your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-border/50 bg-card p-5 hover:border-border transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-relaxed">
                      {q.question}
                    </h3>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Badge
                        variant="outline"
                        className={
                          difficultyColor[q.difficulty] ||
                          "bg-muted text-muted-foreground"
                        }
                      >
                        {q.difficulty}
                      </Badge>
                      {q.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {q.is_top50 && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                        >
                          Top 50
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/interview/${category.slug}/practice?id=${q.id}`}
                    className="flex-shrink-0"
                  >
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
