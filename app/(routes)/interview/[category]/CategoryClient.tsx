"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { AnswerMarkdown } from "@/components/markdown-answer";
import { formatTagLabel } from "@/lib/tags";
import { difficultyBadgeClass } from "@/lib/interview-ui";
import { INTERVIEW_STACKS_STORAGE_KEY } from "@/lib/interview-constants";
import {
  Sparkles,
  BookOpen,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type {
  InterviewCategory,
  InterviewChapter,
  InterviewQuestion,
} from "@/lib/interview-data";

type ChapterWithQuestions = InterviewChapter & {
  questions: InterviewQuestion[];
};

type Props = {
  category: InterviewCategory;
  chaptersWithQuestions: ChapterWithQuestions[];
};

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
  const [mobileChaptersOpen, setMobileChaptersOpen] = useState(true);
  const [chapterSearch, setChapterSearch] = useState("");
  const [savedTags, setSavedTags] = useState<string[]>([]);
  const [tailored, setTailored] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INTERVIEW_STACKS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const tags = (parsed as string[]).filter(
            (t) => typeof t === "string" && t.trim(),
          );
          setSavedTags(tags);
          setTailored(tags.length > 0);
        }
      }
    } catch {
      /* ignore storage errors */
    }
  }, []);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    if (tailored && savedTags.length > 0) {
      const matchCount = (q: InterviewQuestion) =>
        (q.tags as string[]).filter((t) => savedTags.includes(t)).length;
      return qs
        .filter((q) => matchCount(q) > 0)
        .sort((a, b) => matchCount(b) - matchCount(a));
    }
    return qs;
  }, [currentChapter, sortOrder, tailored, savedTags]);

  const filteredChapters = useMemo(() => {
    const q = chapterSearch.trim().toLowerCase();
    if (!q) return chaptersWithQuestions;
    return chaptersWithQuestions.filter((ch) =>
      ch.title.toLowerCase().includes(q),
    );
  }, [chaptersWithQuestions, chapterSearch]);

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
    <div className="bg-background flex flex-col">
      <PageHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
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
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden md:inline">Custom Practice</span>
              </Button>
            </Link>
            <Link
              href={`/interview/${category.slug}/practice`}
              aria-label="Practice Mode"
            >
              <Button size="sm">
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

      <div className="flex w-full">
        {sidebarOpen && (
          <aside className="w-72 flex-shrink-0 border-r border-border/40 bg-card/50 hidden lg:block sticky top-0 h-dvh overflow-y-auto">
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

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
          {currentChapter && (
            <div>
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setMobileChaptersOpen(!mobileChaptersOpen)}
                  aria-expanded={mobileChaptersOpen}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border/50 bg-card transition-colors hover:border-border"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    Chapters
                  </span>
                  <span className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    {currentIndex + 1}/{chaptersWithQuestions.length}
                    {mobileChaptersOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {mobileChaptersOpen && (
                  <div className="mt-2 rounded-xl border border-border/50 bg-card overflow-hidden">
                    <div className="p-3 pb-2">
                      <div className="relative">
                        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          value={chapterSearch}
                          onChange={(e) => setChapterSearch(e.target.value)}
                          placeholder="Search chapters..."
                          className="w-full bg-background border border-border/50 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>
                    </div>

                    <nav className="max-h-72 overflow-y-auto px-2 pb-2 space-y-0.5">
                      {filteredChapters.map((ch, idx) => {
                        const active = activeChapter === ch.id;
                        const chapterNumber = chaptersWithQuestions.findIndex(
                          (c) => c.id === ch.id,
                        );
                        return (
                          <button
                            key={ch.id}
                            onClick={() => {
                              handleSetChapter(ch.id);
                              setMobileChaptersOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                              active
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                          >
                            <span className="text-xs text-muted-foreground font-mono w-5 flex-shrink-0">
                              {String(chapterNumber + 1).padStart(2, "0")}
                            </span>
                            <span className="leading-snug truncate">
                              {ch.title}
                            </span>
                          </button>
                        );
                      })}
                      {filteredChapters.length === 0 && (
                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                          No chapters match your search
                        </p>
                      )}
                    </nav>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <span className="text-xs text-muted-foreground font-mono">
                  Chapter {currentIndex + 1} of {chaptersWithQuestions.length}
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight mt-1">
                  {currentChapter.title}
                </h1>
              </div>

              {savedTags.length > 0 && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  {tailored ? (
                    <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary">
                      <Sparkles className="w-3.5 h-3.5" />
                      Tailored to:{" "}
                      {savedTags.slice(0, 3).map(formatTagLabel).join(", ")}
                      {savedTags.length > 3
                        ? ` +${savedTags.length - 3} more`
                        : ""}
                      <button
                        onClick={() => setTailored(false)}
                        aria-label="Show all questions"
                        className="rounded-full hover:bg-primary/20 p-0.5 text-primary/70 hover:text-primary transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setTailored(true)}
                      className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Personalize by saved stack
                    </button>
                  )}
                </div>
              )}

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
                        {sortedQuestions.length} questions
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
                      {sortedQuestions.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border/60 bg-card/40 px-6 py-10 text-center space-y-3">
                          <p className="text-sm text-foreground/80">
                            No questions in this chapter match your saved stack.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTailored(false)}
                          >
                            Show all questions
                          </Button>
                        </div>
                      ) : (
                        sortedQuestions.map((q, i) => (
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
                                  className={`text-[11px] px-2 py-0.5 border ${difficultyBadgeClass(q.difficulty)}`}
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
                        ))
                      )}
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
