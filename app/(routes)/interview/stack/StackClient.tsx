"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axios from "axios";
import { AnswerMarkdown } from "@/components/markdown-answer";
import { formatTagLabel } from "@/lib/tags";
import { difficultyBadgeClass } from "@/lib/interview-ui";
import { INTERVIEW_STACKS_STORAGE_KEY } from "@/lib/interview-constants";
import type { InterviewQuestion } from "@/lib/interview-data";

type StackResponse = {
  questions: InterviewQuestion[];
  total: number;
  hasMore: boolean;
};

export default function StackClient() {
  const [stack, setStack] = useState<string[] | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const bootstrapped = useRef(false);
  const fetchInFlight = useRef(false);

  const fetchStackPage = useCallback(
    async (tags: string[], offset: number, append: boolean) => {
      if (tags.length === 0 || fetchInFlight.current) return;
      fetchInFlight.current = true;
      if (append) setLoadingMore(true);
      else setLoadingInitial(true);
      setError(null);
      try {
        const res = await axios.post<StackResponse>("/api/interview/stack", {
          tags,
          offset,
        });
        setQuestions((prev) =>
          append ? [...prev, ...res.data.questions] : res.data.questions,
        );
        setTotal(res.data.total);
        setHasMore(res.data.hasMore);
      } catch {
        setError("Failed to load questions. Please try again.");
      } finally {
        fetchInFlight.current = false;
        if (append) setLoadingMore(false);
        else setLoadingInitial(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    let tags: string[] = [];
    try {
      const raw = localStorage.getItem(INTERVIEW_STACKS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          tags = (parsed as string[]).filter(
            (t) => typeof t === "string" && t.trim(),
          );
        }
      }
    } catch {
      /* ignore storage errors */
    }
    setStack(tags);
  }, []);

  useEffect(() => {
    if (stack && stack.length > 0) void fetchStackPage(stack, 0, false);
  }, [stack, fetchStackPage]);

  const toggleAnswer = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const collapseAll = () => {
    setCollapsed(new Set(questions.map((q) => q.id)));
  };

  const expandAll = () => {
    setCollapsed(new Set());
  };

  const loadMore = () => {
    if (stack && !loadingMore && hasMore)
      void fetchStackPage(stack, questions.length, true);
  };

  if (stack === null) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (stack.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-card/40 px-6 py-16 text-center space-y-4">
        <p className="text-foreground/80 font-medium">No stack selected yet</p>
        <p className="text-sm text-muted-foreground">
          Pick the technologies you are targeting to see tailored questions.
        </p>
        <Button asChild>
          <a href="/interview/customize">Choose My Stack</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">
          My Stack Practice
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-lg">
          Questions matching your saved stack — answers shown, ready to review.
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs font-medium text-muted-foreground">
            Stack:
          </span>
          {stack.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {formatTagLabel(tag)}
            </Badge>
          ))}
        </div>
      </div>

      {loadingInitial && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Loading your questions...</span>
          </div>
        </div>
      )}

      {!loadingInitial && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            size="sm"
            onClick={() => void fetchStackPage(stack, 0, false)}
          >
            Retry
          </Button>
        </div>
      )}

      {!loadingInitial && !error && total === 0 && (
        <div className="rounded-xl border border-dashed border-border/60 bg-card/40 px-6 py-16 text-center space-y-3">
          <p className="text-sm text-foreground/80">
            No questions match your topics.
          </p>
          <p className="text-xs text-muted-foreground">
            Try fewer topics or adjust your stack.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="/interview/customize">Adjust My Stack</a>
          </Button>
        </div>
      )}

      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {total} question{total !== 1 ? "s" : ""} found
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={collapsed.size > 0 ? expandAll : collapseAll}
              className="gap-1.5"
            >
              {collapsed.size > 0 ? (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show all answers
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide all answers
                </>
              )}
            </Button>
          </div>

          {questions.map((q) => {
            const isCollapsed = collapsed.has(q.id);
            return (
              <div
                key={q.id}
                className="rounded-xl border border-border/50 bg-card p-5 space-y-3"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={difficultyBadgeClass(q.difficulty)}
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
                  {isCollapsed ? (
                    <button
                      onClick={() => toggleAnswer(q.id)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Show answer
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleAnswer(q.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        Hide answer
                      </button>
                      <div className="mt-2 p-4 rounded-lg bg-muted/50 border border-border/50">
                        <AnswerMarkdown content={q.answer} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          <div className="text-center pt-2">
            {hasMore ? (
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
                disabled={loadingMore}
                className="gap-2"
              >
                {loadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">
                Showing all {total} question{total !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
