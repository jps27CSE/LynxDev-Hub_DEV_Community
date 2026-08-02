"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Loader2, Sparkles, X } from "lucide-react";
import axios from "axios";
import { AnswerMarkdown } from "@/components/markdown-answer";
import { formatTagLabel } from "@/lib/tags";

type Question = {
  id: number;
  question: string;
  answer: string;
  difficulty: string;
  tags: string[];
  is_top50: boolean | null;
};

const difficultyColor: Record<string, string> = {
  easy: "bg-green-500/10 text-green-500 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

type Props = {
  categorySlug: string;
  allTags: string[];
};

export default function CustomPracticeClient({ categorySlug, allTags }: Props) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Set<number>>(new Set());

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/interview/questions-by-tags", {
        categorySlug,
        tags: Array.from(selectedTags),
      });
      setQuestions(res.data.questions);
      setShowAnswers(new Set());
      setHasSearched(true);
    } catch {
      setQuestions([]);
      setHasSearched(true);
      setError("Failed to load questions. Please try again.");
    }
    setLoading(false);
  };

  const toggleAnswer = (id: number) => {
    setShowAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearAll = () => {
    setSelectedTags(new Set());
    setQuestions([]);
    setShowAnswers(new Set());
    setError(null);
    setHasSearched(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">
          Custom Practice
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select stacks or topics you want to practice — get all matching
          questions at once.
        </p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Pick your stacks</h2>
          {selectedTags.size > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const active = selectedTags.has(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border/50 hover:border-border hover:text-foreground"
                }`}
              >
                {formatTagLabel(tag)}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={fetchQuestions}
            disabled={loading || selectedTags.size === 0}
            className="gap-2"
            size="sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? "Loading..." : "Get Questions"}
          </Button>
          {selectedTags.size === 0 && (
            <span className="text-xs text-muted-foreground">
              Select at least one stack to begin
            </span>
          )}
        </div>
        {error && <p className="text-sm text-destructive pt-2">{error}</p>}
      </div>

      {hasSearched && !loading && questions.length === 0 && !error && (
        <div className="rounded-xl border border-dashed border-border/60 bg-card/50 p-8 text-center">
          <p className="text-sm text-foreground">No questions found.</p>
          <p className="text-xs text-muted-foreground mt-1">
            No questions match your stacks — try fewer tags.
          </p>
        </div>
      )}

      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {questions.length} question{questions.length !== 1 ? "s" : ""}{" "}
              found
            </h2>
          </div>

          {questions.map((q) => (
            <div
              key={q.id}
              className="rounded-xl border border-border/50 bg-card p-5 space-y-3"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={
                    difficultyColor[q.difficulty] ||
                    "bg-muted text-muted-foreground"
                  }
                >
                  {q.difficulty}
                </Badge>
                {q.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {formatTagLabel(tag)}
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

              <p className="text-sm font-medium leading-relaxed">
                {q.question}
              </p>

              <div>
                <button
                  onClick={() => toggleAnswer(q.id)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {showAnswers.has(q.id) ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      Hide answer
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      Show answer
                    </>
                  )}
                </button>
                {showAnswers.has(q.id) && (
                  <div className="mt-2 p-4 rounded-lg bg-muted/50 border border-border/50">
                    <AnswerMarkdown content={q.answer} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
