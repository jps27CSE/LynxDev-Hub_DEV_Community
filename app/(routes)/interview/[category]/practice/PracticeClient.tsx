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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

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

const PER_PAGE = 20;
const PREFETCH_THRESHOLD = 5;

function AnswerMarkdown({ content }: { content: string }) {
  return (
    <div className="text-base text-foreground/90 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b border-border/40">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-[1.75] text-[15px]">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 space-y-1.5 pl-5 list-disc">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 space-y-1.5 pl-5 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-[15px] leading-relaxed pl-1">{children}</li>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-muted text-[13px] font-mono text-foreground">
                  {children}
                </code>
              );
            }
            return (
              <div className="relative group my-5">
                <div className="absolute top-0 right-0 px-3 py-1 text-[11px] text-muted-foreground bg-muted/80 rounded-bl-lg rounded-tr-lg border-l border-b border-border/30 font-mono">
                  {className?.replace("language-", "") || "code"}
                </div>
                <code
                  className={`block text-[13.5px] leading-relaxed ${className}`}
                >
                  {children}
                </code>
              </div>
            );
          },
          pre: ({ children }) => (
            <pre className="!bg-transparent !p-0 !m-0 !border-0">
              {children}
            </pre>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">{children}</strong>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-border/50">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 bg-muted/50 text-left font-semibold text-foreground border-b border-border/50">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 border-b border-border/30 text-muted-foreground">
              {children}
            </td>
          ),
          hr: () => <hr className="my-8 border-border/30" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function PracticeClient({
  initialQuestions,
  totalCount,
  categorySlug,
}: {
  initialQuestions: Question[];
  totalCount: number;
  categorySlug: string;
}) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const loadedOffsets = useRef<Set<number>>(new Set([0]));

  const current = questions[currentIndex];

  useEffect(() => {
    const remaining = questions.length - currentIndex;
    if (
      remaining <= PREFETCH_THRESHOLD &&
      questions.length < totalCount &&
      !loading
    ) {
      const nextOffset =
        questions.length - (questions.length % PER_PAGE) + PER_PAGE;
      if (!loadedOffsets.current.has(nextOffset)) {
        loadedOffsets.current.add(nextOffset);
        setLoading(true);
        fetch(
          `/api/interview/questions?category=${categorySlug}&offset=${nextOffset}`,
        )
          .then((res) => res.json())
          .then((data) => {
            setQuestions((prev) => [...prev, ...data.questions]);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      }
    }
  }, [currentIndex, questions.length, totalCount, loading, categorySlug]);

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

      <div className="rounded-xl border border-border/50 bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant="outline"
            className={
              difficultyColor[current.difficulty] ||
              "bg-muted text-muted-foreground"
            }
          >
            {current.difficulty}
          </Badge>
          {(current.tags as string[]).slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
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

      <div className="flex items-center justify-between">
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
          variant={reviewed.has(current.id) ? "default" : "outline"}
          size="sm"
          onClick={toggleReview}
          className="gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          {reviewed.has(current.id) ? "Reviewed" : "Mark as Reviewed"}
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
    </div>
  );
}
