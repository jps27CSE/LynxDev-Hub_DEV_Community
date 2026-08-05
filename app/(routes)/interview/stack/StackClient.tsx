"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { AnswerMarkdown } from "@/components/markdown-answer";
import { formatTagLabel } from "@/lib/tags";
import { difficultyBadgeClass, DIFFICULTY_ORDER } from "@/lib/interview-ui";
import {
  INTERVIEW_STACKS_STORAGE_KEY,
  INTERVIEW_REVIEWED_STACK_KEY,
} from "@/lib/interview-constants";
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
  const [collapsedQuestions, setCollapsedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [hydratedReviews, setHydratedReviews] = useState(false);
  const [sortOrder, setSortOrder] = useState<
    "default" | "easy-hard" | "hard-easy"
  >("default");
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INTERVIEW_REVIEWED_STACK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setReviewed(new Set(parsed as number[]));
        }
      }
    } catch {
      /* ignore storage errors */
    }
    setHydratedReviews(true);
  }, []);

  useEffect(() => {
    if (!hydratedReviews) return;
    try {
      localStorage.setItem(
        INTERVIEW_REVIEWED_STACK_KEY,
        JSON.stringify(Array.from(reviewed)),
      );
    } catch {
      /* ignore storage errors */
    }
  }, [reviewed, hydratedReviews]);

  const toggleCollapsed = useCallback((id: number) => {
    setCollapsedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleReviewed = useCallback((id: number) => {
    setReviewed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const collapseAll = () => {
    setCollapsedQuestions(new Set(questions.map((q) => q.id)));
  };

  const expandAll = () => {
    setCollapsedQuestions(new Set());
  };

  const loadMore = () => {
    if (stack && !loadingMore && hasMore)
      void fetchStackPage(stack, questions.length, true);
  };

  const sortedQuestions = useMemo(() => {
    if (sortOrder === "default") return questions;
    const multiplier = sortOrder === "easy-hard" ? 1 : -1;
    return [...questions].sort(
      (a, b) =>
        ((DIFFICULTY_ORDER[a.difficulty] ?? 2) -
          (DIFFICULTY_ORDER[b.difficulty] ?? 2)) *
        multiplier,
    );
  }, [questions, sortOrder]);

  const jumpToQuestion = useCallback((id: number) => {
    setActiveQuestionId(id);
    document
      .getElementById(`q-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }
      const index = sortedQuestions.findIndex((q) => q.id === activeQuestionId);
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "j") {
        e.preventDefault();
        const next = sortedQuestions[index + 1] ?? sortedQuestions[0];
        if (next) jumpToQuestion(next.id);
      } else if (e.key === "ArrowUp" || e.key.toLowerCase() === "k") {
        e.preventDefault();
        const prev =
          sortedQuestions[
            (index - 1 + sortedQuestions.length) % sortedQuestions.length
          ];
        if (prev) jumpToQuestion(prev.id);
      } else if (e.key.toLowerCase() === "a") {
        e.preventDefault();
        const active = index >= 0 ? sortedQuestions[index] : sortedQuestions[0];
        if (active) toggleCollapsed(active.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sortedQuestions, activeQuestionId, jumpToQuestion, toggleCollapsed]);

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

  const allCollapsed =
    sortedQuestions.length > 0 &&
    sortedQuestions.every((q) => collapsedQuestions.has(q.id));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">
            {total > 0
              ? `${total} question${total !== 1 ? "s" : ""} matched your stack`
              : "Your personalized practice set"}
          </span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
              My Stack Practice
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">
              Questions matching your saved stack — study them, mark your
              progress, and revisit the weak spots.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href="/interview/customize">
              <SlidersHorizontal className="w-4 h-4" />
              Adjust Stack
            </a>
          </Button>
        </div>
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

      {sortedQuestions.length > 0 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold">
                {total} question{total !== 1 ? "s" : ""}
              </h2>
              <span className="text-xs text-muted-foreground">
                {reviewed.size} reviewed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={allCollapsed ? expandAll : collapseAll}
                className="text-xs gap-1.5"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                {allCollapsed ? "Expand all" : "Collapse all"}
              </Button>
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as typeof sortOrder)
                  }
                  aria-label="Sort questions by difficulty"
                  className="text-xs bg-background border border-border/40 rounded-md px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="default">Default</option>
                  <option value="easy-hard">Easy → Hard</option>
                  <option value="hard-easy">Hard → Easy</option>
                </select>
              </div>
            </div>
          </div>

          {sortedQuestions.map((q, i) => {
            const isCollapsed = collapsedQuestions.has(q.id);
            const isActive = activeQuestionId === q.id;
            const isReviewed = reviewed.has(q.id);
            return (
              <div
                key={q.id}
                id={`q-${q.id}`}
                onClick={() => setActiveQuestionId(q.id)}
                className={`scroll-mt-24 rounded-xl border bg-card overflow-hidden transition-all duration-200 ${
                  isActive
                    ? "border-primary/40 shadow-md ring-1 ring-primary/10"
                    : "border-border/50 hover:border-border"
                }`}
              >
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-xs font-mono text-muted-foreground mt-1 flex-shrink-0">
                      Q{i + 1}.
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug flex-1 min-w-0 break-words">
                      {q.question}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCollapsed(q.id);
                      }}
                      aria-label={isCollapsed ? "Show answer" : "Hide answer"}
                      className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex-shrink-0"
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 ml-8">
                    <Badge
                      className={`text-[11px] px-2 py-0.5 border ${difficultyBadgeClass(q.difficulty)}`}
                    >
                      {q.difficulty}
                    </Badge>
                    {q.is_top50 && (
                      <Badge
                        variant="outline"
                        className="text-[11px] px-2 py-0.5 bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                      >
                        Top 50
                      </Badge>
                    )}
                    {q.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[11px] px-2 py-0.5 font-normal"
                      >
                        {formatTagLabel(tag)}
                      </Badge>
                    ))}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReviewed(q.id);
                      }}
                      aria-pressed={isReviewed}
                      className={`ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                        isReviewed
                          ? "text-green-500"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {isReviewed ? "Reviewed" : "Mark reviewed"}
                      </span>
                    </button>
                  </div>

                  {!isCollapsed && (
                    <div className="mt-4 p-5 rounded-lg bg-muted/50 border border-border/50 ml-8">
                      <AnswerMarkdown content={q.answer} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-center pt-4">
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

      {sortedQuestions.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          Shortcuts:{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">
            j
          </kbd>{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">
            k
          </kbd>{" "}
          previous / next question ·{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">
            A
          </kbd>{" "}
          show / hide answer
        </div>
      )}
    </div>
  );
}
