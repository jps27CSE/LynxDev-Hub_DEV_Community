import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { AnswerMarkdown } from "@/components/markdown-answer";
import { formatTagLabel } from "@/lib/tags";
import { difficultyBadgeClass } from "@/lib/interview-ui";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import type { InterviewQuestion } from "@/lib/interview-data";

type QuestionCardProps = {
  question: InterviewQuestion;
  index: number;
  isCollapsed: boolean;
  isActive: boolean;
  isReviewed: boolean;
  onSelect: (id: number) => void;
  onToggleCollapsed: (id: number) => void;
  onToggleReviewed: (id: number) => void;
};

const QuestionCard = memo(function QuestionCard({
  question: q,
  index: i,
  isCollapsed,
  isActive,
  isReviewed,
  onSelect,
  onToggleCollapsed,
  onToggleReviewed,
}: QuestionCardProps) {
  return (
    <div
      id={`q-${q.id}`}
      onClick={() => onSelect(q.id)}
      className={`scroll-mt-24 rounded-xl border bg-[#10141b] overflow-hidden transition-all duration-200 ${
        isActive
          ? "border-primary/40 shadow-md ring-1 ring-primary/10"
          : "border-border/50 hover:border-border"
      } ${isReviewed ? "border-l-2 border-l-green-500/70" : ""}`}
    >
      <div className="p-6 pb-4">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-xs font-mono text-muted-foreground mt-1 flex-shrink-0">
            Q{i + 1}.
          </span>
          <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug flex-1">
            {q.question}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapsed(q.id);
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
              onToggleReviewed(q.id);
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
      </div>

      {!isCollapsed && (
        <div className="border-t border-border/40 bg-white/[0.03] px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="text-xs font-semibold text-foreground/60 mt-1 flex-shrink-0">
              A.
            </span>
            <div className="min-w-0 flex-1">
              <AnswerMarkdown content={q.answer} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default QuestionCard;
