"use client";

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  Suspense,
} from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import {
  Sparkles,
  BookOpen,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowUpDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type {
  InterviewCategory,
  InterviewChapter,
  InterviewQuestion,
} from "@/lib/interview-data";

const difficultyColor: Record<string, string> = {
  easy: "bg-green-500/10 text-green-500 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

type ChapterWithQuestions = InterviewChapter & {
  questions: InterviewQuestion[];
};

type Props = {
  category: InterviewCategory;
  chaptersWithQuestions: ChapterWithQuestions[];
};

const STORAGE_KEY = "lynxdev_interview_stacks";

const tagLabels: Record<string, string> = {
  "data-structures": "Data Structures",
  algorithms: "Algorithms",
  networking: "Networking",
  "operating-systems": "Operating Systems",
  "distributed-systems": "Distributed Systems",
  "api-design": "API Design",
  "design-patterns": "Design Patterns",
  "system-design": "System Design",
  javascript: "JavaScript",
  typescript: "TypeScript",
  react: "React",
  angular: "Angular",
  css: "CSS",
  dom: "DOM",
  performance: "Performance",
  testing: "Testing",
  databases: "Databases",
  security: "Security",
  authentication: "Authentication",
  caching: "Caching",
  docker: "Docker",
  kubernetes: "Kubernetes",
  devops: "DevOps",
  architecture: "Architecture",
};

function formatTagLabel(tag: string): string {
  return (
    tagLabels[tag] ||
    tag.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

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

function CategoryClientInner({ category, chaptersWithQuestions }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeChapter, setActiveChapter] = useState<number>(() => {
    const chapterParam = searchParams?.get("chapter");
    if (chapterParam) {
      const id = parseInt(chapterParam, 10);
      if (id && chaptersWithQuestions.some((ch) => ch.id === id)) return id;
    }
    return chaptersWithQuestions.length > 0 ? chaptersWithQuestions[0].id : 0;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sortOrder, setSortOrder] = useState<
    "default" | "easy-hard" | "hard-easy"
  >("default");

  const mainRef = useRef<HTMLElement>(null);

  const handleSetChapter = useCallback(
    (id: number) => {
      setActiveChapter(id);
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("chapter", String(id));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeChapter]);

  const currentChapter = chaptersWithQuestions.find(
    (ch) => ch.id === activeChapter,
  );
  const currentIndex = chaptersWithQuestions.findIndex(
    (ch) => ch.id === activeChapter,
  );

  const sortedQuestions = useMemo(() => {
    if (!currentChapter) return [];
    const qs = [...currentChapter.questions];
    const order: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
    if (sortOrder === "easy-hard") {
      qs.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
    } else if (sortOrder === "hard-easy") {
      qs.sort((a, b) => order[b.difficulty] - order[a.difficulty]);
    }
    return qs;
  }, [currentChapter, sortOrder]);

  if (chaptersWithQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">
          No chapters available for this category yet.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <PageHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/interview"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              &larr; Interview
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium truncate min-w-0">
              {category.name}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/interview/${category.slug}/custom-practice`}
              aria-label="Custom Practice"
            >
              <Button variant="outline" size="sm" className="px-2.5">
                <Sparkles className="w-4 h-4" />
                <span className="hidden md:inline">Custom Practice</span>
              </Button>
            </Link>
            <Link
              href={`/interview/${category.slug}/practice`}
              aria-label="Practice Mode"
            >
              <Button size="sm" className="px-2.5">
                <Sparkles className="w-4 h-4" />
                <span className="hidden md:inline">Practice Mode</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex"
            >
              {sidebarOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </PageHeader>

      <div className="flex-1 flex w-full min-h-0">
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
                {chaptersWithQuestions.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => handleSetChapter(ch.id)}
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

        <main
          ref={mainRef}
          className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {currentChapter && (
            <div>
              <div className="mb-8">
                <span className="text-xs text-muted-foreground font-mono">
                  Chapter {currentIndex + 1} of {chaptersWithQuestions.length}
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight mt-1">
                  {currentChapter.title}
                </h1>
              </div>

              <div className="space-y-10">
                {/* Questions Section - first */}
                {currentChapter.questions.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <h2 className="text-base font-bold text-foreground">
                        Questions
                      </h2>
                      <Badge variant="outline" className="text-xs font-mono">
                        {currentChapter.questions.length} questions
                      </Badge>
                      <div className="ml-auto flex items-center gap-2">
                        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                        <select
                          value={sortOrder}
                          onChange={(e) =>
                            setSortOrder(e.target.value as typeof sortOrder)
                          }
                          className="text-xs bg-background border border-border/40 rounded-md px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                        >
                          <option value="default">Default</option>
                          <option value="easy-hard">Easy → Hard</option>
                          <option value="hard-easy">Hard → Easy</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {sortedQuestions.map((q, i) => (
                        <div
                          key={q.id}
                          className="rounded-xl border border-border/50 bg-card overflow-hidden"
                        >
                          <div className="p-6 pb-4">
                            <div className="flex items-start gap-3 mb-3">
                              <span className="text-xs font-mono text-muted-foreground mt-1 flex-shrink-0">
                                Q{i + 1}.
                              </span>
                              <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                                {q.question}
                              </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 ml-8 mb-4">
                              <Badge
                                className={`text-[11px] px-2 py-0.5 border ${difficultyColor[q.difficulty] || ""}`}
                              >
                                {q.difficulty}
                              </Badge>
                              {(q.tags as string[]).slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-[11px] px-2 py-0.5 font-normal"
                                >
                                  {formatTagLabel(tag)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="border-t border-border/40 bg-muted/30 px-6 py-5">
                            <div className="flex items-start gap-3">
                              <span className="text-xs font-semibold text-foreground/60 mt-1 flex-shrink-0">
                                A.
                              </span>
                              <div className="min-w-0 flex-1">
                                <AnswerMarkdown content={q.answer} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Key Points Section */}
                {currentChapter.content.keyPoints.length > 0 && (
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
                          <span className="text-[15px] text-foreground/80 leading-relaxed">
                            {point}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Interview Tips Section */}
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
                          <span className="text-[15px] text-foreground/80 leading-relaxed">
                            {tip}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              <div className="flex items-center justify-between mt-12 pt-8 border-t border-border/40">
                {currentIndex > 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleSetChapter(
                        chaptersWithQuestions[currentIndex - 1].id,
                      )
                    }
                  >
                    &larr; Previous
                  </Button>
                ) : (
                  <div />
                )}
                {currentIndex < chaptersWithQuestions.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      handleSetChapter(
                        chaptersWithQuestions[currentIndex + 1].id,
                      )
                    }
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

export default function CategoryClient(props: Props) {
  return (
    <Suspense fallback={null}>
      <CategoryClientInner {...props} />
    </Suspense>
  );
}
