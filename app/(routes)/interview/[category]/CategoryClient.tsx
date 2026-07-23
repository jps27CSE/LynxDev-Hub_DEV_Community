"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Sparkles,
  BookOpen,
  Lightbulb,
  Target,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { InterviewCategory, InterviewChapter, InterviewQuestion } from "@/lib/interview-data";

const difficultyColor: Record<string, string> = {
  easy: "bg-green-500/10 text-green-500 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

type Props = {
  category: InterviewCategory;
  chapters: InterviewChapter[];
  questions: InterviewQuestion[];
};

export default function CategoryClient({ category, chapters, questions }: Props) {
  const [activeChapter, setActiveChapter] = useState<number>(
    chapters.length > 0 ? chapters[0].id : 0
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAnswers, setShowAnswers] = useState<Set<number>>(new Set());

  const currentChapter = chapters.find((ch) => ch.id === activeChapter);
  const currentIndex = chapters.findIndex((ch) => ch.id === activeChapter);

  const chapterQuestions = useMemo(() => {
    if (!currentChapter) return [];
    return questions.filter((q) =>
      currentChapter.content.sampleQuestions?.some((sq) =>
        q.question.toLowerCase().includes(sq.toLowerCase().slice(0, 20))
      )
    );
  }, [currentChapter, questions]);

  const toggleAnswer = (id: number) => {
    setShowAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (chapters.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No chapters available for this category yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border/40 bg-card px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/interview"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Interview
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">{category.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/interview/${category.slug}/practice`}>
              <Button size="sm" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Practice Mode
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex"
            >
              {sidebarOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex w-full">
        {sidebarOpen && (
          <aside className="w-72 flex-shrink-0 border-r border-border/40 bg-card/50 hidden lg:block overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Chapters
                </span>
              </div>
              <nav className="space-y-1">
                {chapters.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChapter(ch.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      activeChapter === ch.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-mono w-5 flex-shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-snug">{ch.title}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
          {currentChapter && (
            <div>
              <div className="mb-8">
                <span className="text-xs text-muted-foreground font-mono">
                  Chapter {currentIndex + 1} of {chapters.length}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                  {currentChapter.title}
                </h1>
              </div>

              <div className="space-y-10">
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="text-base font-bold text-foreground">
                      Overview
                    </h2>
                  </div>
                  <p className="text-[15px] text-foreground/80 leading-[1.75] pl-11">
                    {currentChapter.content.overview}
                  </p>
                </section>

                <section className="rounded-xl border border-blue-500/20 bg-blue-500/[0.03] p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-foreground mb-3">
                        Real-World Scenario
                      </h2>
                      <p className="text-[15px] text-foreground/80 leading-[1.75]">
                        {currentChapter.content.realLifeScenario}
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                    </div>
                    <h2 className="text-base font-bold text-foreground">
                      Deep Dive
                    </h2>
                  </div>
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
                          <ul className="mb-4 space-y-1.5 pl-5">
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
                      {currentChapter.content.explanation}
                    </ReactMarkdown>
                  </div>
                </section>

                <section className="rounded-xl border border-green-500/20 bg-green-500/[0.03] p-6">
                  <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Key Points
                  </h2>
                  <div className="space-y-3">
                    {currentChapter.content.keyPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        </div>
                        <span className="text-[15px] text-foreground/80 leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {currentChapter.content.tips.length > 0 && (
                  <section className="rounded-xl border border-blue-500/20 bg-blue-500/[0.03] p-6">
                    <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-500" />
                      Interview Tips
                    </h2>
                    <ul className="space-y-3">
                      {currentChapter.content.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                          <span className="text-[15px] text-foreground/80 leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {currentChapter.content.sampleQuestions && currentChapter.content.sampleQuestions.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <h2 className="text-base font-bold text-foreground">
                        Sample Questions
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {currentChapter.content.sampleQuestions.map((sq, i) => {
                        const matchedQ = questions.find((q) =>
                          q.question.toLowerCase().includes(sq.toLowerCase().slice(0, 30))
                        );
                        return (
                          <div
                            key={i}
                            className="rounded-lg border border-border/50 bg-card p-5"
                          >
                            <p className="text-[15px] font-medium text-foreground mb-2">{sq}</p>
                            {matchedQ && (
                              <div>
                                <button
                                  onClick={() => toggleAnswer(i)}
                                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {showAnswers.has(i) ? "Hide" : "Show"} answer
                                </button>
                                {showAnswers.has(i) && (
                                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                    {matchedQ.answer}
                                  </p>
                                )}
                              </div>
                            )}
                            <Link
                              href={`/interview/${category.slug}/practice?id=${matchedQ?.id}`}
                              className="text-xs text-primary hover:underline mt-2 inline-block"
                            >
                              Practice this question &rarr;
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              <div className="flex items-center justify-between mt-12 pt-8 border-t border-border/40">
                {currentIndex > 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveChapter(chapters[currentIndex - 1].id)}
                  >
                    &larr; Previous
                  </Button>
                ) : (
                  <div />
                )}
                {currentIndex < chapters.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={() => setActiveChapter(chapters[currentIndex + 1].id)}
                  >
                    Next &rarr;
                  </Button>
                ) : (
                  <Link href={`/interview/${category.slug}/practice`}>
                    <Button size="sm" className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      Start Practice
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
