"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Sparkles, X } from "lucide-react";
import axios from "axios";
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
            <p className="mb-4 leading-[1.75] text-[15px]">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 space-y-1.5 pl-5 list-disc">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 space-y-1.5 pl-5 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-[15px] leading-relaxed pl-1">
              {children}
            </li>
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
                <code className={`block text-[13.5px] leading-relaxed ${className}`}>
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
            <strong className="font-bold text-foreground">
              {children}
            </strong>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-border/50">
              <table className="w-full text-sm">
                {children}
              </table>
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
          hr: () => (
            <hr className="my-8 border-border/30" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

type Props = {
  categorySlug: string;
  allTags: string[];
};

export default function CustomPracticeClient({ categorySlug, allTags }: Props) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
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
    try {
      const res = await axios.post("/api/interview/questions-by-tags", {
        categorySlug,
        tags: Array.from(selectedTags),
      });
      setQuestions(res.data.questions);
      setShowAnswers(new Set());
    } catch {
      setQuestions([]);
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
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Custom Practice</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select stacks or topics you want to practice — get all matching questions at once.
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
                {tag}
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
            <Sparkles className="w-4 h-4" />
            {loading ? "Loading..." : "Get Questions"}
          </Button>
          {selectedTags.size === 0 && (
            <span className="text-xs text-muted-foreground">
              Select at least one stack to begin
            </span>
          )}
        </div>
      </div>

      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {questions.length} question{questions.length !== 1 ? "s" : ""} found
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
