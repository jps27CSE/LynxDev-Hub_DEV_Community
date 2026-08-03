"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { AnswerMarkdown } from "@/components/markdown-answer";
import { formatTagLabel } from "@/lib/tags";
import {
  difficultyAccentClass,
  difficultyBadgeClass,
} from "@/lib/interview-ui";
import type { InterviewQuestion } from "@/lib/interview-data";
import { INTERVIEW_REVIEWED_KEY_PREFIX } from "@/lib/interview-constants";

const PER_PAGE = 20;
const PREFETCH_THRESHOLD = 5;

export default function PracticeClient({
  initialQuestions,
  totalCount,
  categorySlug,
}: {
  initialQuestions: InterviewQuestion[];
  totalCount: number;
  categorySlug: string;
}) {
  const [questions, setQuestions] =
    useState<InterviewQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [prefetchFailed, setPrefetchFailed] = useState(false);
  const [hydratedReviews, setHydratedReviews] = useState(false);
  const loadedOffsets = useRef<Set<number>>(new Set([0]));

  const current = questions[currentIndex];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(
        `${INTERVIEW_REVIEWED_KEY_PREFIX}${categorySlug}`,
      );
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
  }, [categorySlug]);

  useEffect(() => {
    if (!hydratedReviews) return;
    try {
      localStorage.setItem(
        `${INTERVIEW_REVIEWED_KEY_PREFIX}${categorySlug}`,
        JSON.stringify(Array.from(reviewed)),
      );
    } catch {
      /* ignore storage errors */
    }
  }, [reviewed, categorySlug, hydratedReviews]);

  useEffect(() => {
    const remaining = questions.length - currentIndex;
    if (
      remaining <= PREFETCH_THRESHOLD &&
      questions.length < totalCount &&
      !loading &&
      !prefetchFailed
    ) {
      const nextOffset =
        questions.length - (questions.length % PER_PAGE) + PER_PAGE;
      if (!loadedOffsets.current.has(nextOffset)) {
        loadedOffsets.current.add(nextOffset);
        setLoading(true);
        fetch(
          `/api/interview/questions?category=${categorySlug}&offset=${nextOffset}`,
        )
          .then(async (res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return (await res.json()) as { questions?: unknown };
          })
          .then((data) => {
            if (!Array.isArray(data.questions)) {
              throw new Error("malformed response");
            }
            setQuestions((prev) => [
              ...prev,
              ...(data.questions as InterviewQuestion[]),
            ]);
          })
          .catch(() => {
            loadedOffsets.current.delete(nextOffset);
            setPrefetchFailed(true);
          })
          .finally(() => setLoading(false));
      }
    }
  }, [
    currentIndex,
    questions.length,
    totalCount,
    loading,
    categorySlug,
    prefetchFailed,
  ]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  }, [currentIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  }, [currentIndex]);

  const toggleReview = useCallback(() => {
    setReviewed((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) {
        next.delete(current.id);
      } else {
        next.add(current.id);
      }
      return next;
    });
  }, [current]);

  const toggleAnswer = useCallback(() => {
    setShowAnswer((prev) => !prev);
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
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key.toLowerCase() === "a") {
        e.preventDefault();
        toggleAnswer();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlePrev, handleNext, toggleAnswer]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex]);

  const progress =
    totalCount > 0 ? Math.round((reviewed.size / totalCount) * 100) : 0;
  const isLoadingNext = loading && currentIndex >= questions.length - 1;

  if (!current) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {totalCount}
        </div>
        <div className="flex items-center gap-2">
          {isLoadingNext && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
          )}
          <Badge variant="secondary" className="text-xs">
            {progress}% reviewed
          </Badge>
        </div>
      </div>

      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
        />
      </div>

      <div
        className={`rounded-xl border border-border/50 border-l-4 bg-card p-6 sm:p-8 ${difficultyAccentClass(current.difficulty)}`}
      >
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge
            variant="outline"
            className={difficultyBadgeClass(current.difficulty)}
          >
            {current.difficulty}
          </Badge>
          {current.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {formatTagLabel(tag)}
            </Badge>
          ))}
          {current.is_top50 && (
            <Badge
              variant="outline"
              className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
            >
              Top 50
            </Badge>
          )}
        </div>

        <h2 className="text-lg sm:text-xl font-semibold leading-relaxed">
          {current.question}
        </h2>

        <div className="mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnswer(!showAnswer)}
            className="gap-2"
          >
            {showAnswer ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Answer
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Answer
              </>
            )}
          </Button>
        </div>

        {showAnswer && (
          <div className="mt-4 p-5 rounded-lg bg-muted/50 border border-border/50">
            <AnswerMarkdown content={current.answer} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-2 sm:justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex >= questions.length - 1}
          >
            {isLoadingNext ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <ChevronRight className="w-4 h-4 ml-1" />
            )}
            Next
          </Button>
        </div>

        <Button
          variant={reviewed.has(current.id) ? "default" : "outline"}
          size="sm"
          onClick={toggleReview}
          className="gap-2 w-full sm:w-auto"
        >
          <CheckCircle className="w-4 h-4" />
          {reviewed.has(current.id) ? "Reviewed" : "Mark as Reviewed"}
        </Button>
      </div>
      <div className="text-xs text-muted-foreground text-center">
        Shortcuts:{" "}
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">
          ←
        </kbd>{" "}
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">
          →
        </kbd>{" "}
        previous / next question ·{" "}
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">
          A
        </kbd>{" "}
        show / hide answer
      </div>
      {prefetchFailed && (
        <div className="flex items-center justify-center gap-2 text-xs text-destructive">
          <span>Couldn't load more questions.</span>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setPrefetchFailed(false)}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
