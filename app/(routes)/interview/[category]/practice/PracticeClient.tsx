"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

type Question = {
  id: number;
  category_id: number;
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

export default function PracticeClient({
  questions,
}: {
  questions: Question[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());

  const current = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const toggleReview = () => {
    setReviewed((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) {
        next.delete(current.id);
      } else {
        next.add(current.id);
      }
      return next;
    });
  };

  const progress = questions.length > 0 ? Math.round((reviewed.size / questions.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {progress}% reviewed
          </Badge>
        </div>
      </div>

      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
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
          <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {current.answer}
            </p>
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
          disabled={currentIndex === questions.length - 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
