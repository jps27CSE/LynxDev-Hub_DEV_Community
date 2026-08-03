"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  Suspense,
} from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { AnswerMarkdown } from "@/components/markdown-answer";
import { formatTagLabel } from "@/lib/tags";
import {
  DIFFICULTY_ORDER,
  difficultyBadgeClass,
  difficultyDotClass,
} from "@/lib/interview-ui";
import { INTERVIEW_REVIEWED_KEY_PREFIX } from "@/lib/interview-constants";
import {
  Sparkles,
  BookOpen,
  BookMarked,
  Briefcase,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  List,
  Loader2,
} from "lucide-react";
import type {
  InterviewCategory,
  InterviewChapter,
  InterviewQuestion,
} from "@/lib/interview-data";

type ChapterSummary = InterviewChapter & {
  questionCount: number;
  questionIds: number[];
};

type Props = {
  category: InterviewCategory;
  chapters: InterviewChapter[];
  questionIdsByChapter: Record<number, number[]>;
  initialChapterId: number;
  initialQuestions: InterviewQuestion[];
};

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
      <Icon className="w-5 h-5 text-primary" />
      {title}
    </h2>
  );
}

function ChaptersRail({
  chaptersWithQuestions,
  activeId,
  search,
  onSearchChange,
  onSelect,
  reviewed,
  onCollapse,
}: {
  chaptersWithQuestions: ChapterSummary[];
  activeId: number;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (id: number) => void;
  reviewed: Set<number>;
  onCollapse?: () => void;
}) {
  const q = search.trim().toLowerCase();
  const filtered = q
    ? chaptersWithQuestions.filter((ch) => ch.title.toLowerCase().includes(q))
    : chaptersWithQuestions;
  const indexById = new Map(chaptersWithQuestions.map((ch, i) => [ch.id, i]));

  return (
    <div className="flex flex-col h-full w-full min-w-0">
      <div className="p-4 pb-2 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate min-w-0">
            Chapters
          </span>
          <span className="ml-auto text-xs font-mono text-muted-foreground/60 whitespace-nowrap shrink-0">
            {chaptersWithQuestions.length}
          </span>
          {onCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 p-0 text-muted-foreground hover:text-foreground shrink-0"
              onClick={onCollapse}
              aria-label="Hide chapters sidebar"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="relative min-w-0">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search chapters..."
            className="w-full bg-background border border-border/50 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 scrollbar-thin">
        {filtered.map((ch) => {
          const active = ch.id === activeId;
          const total = ch.questionCount;
          const done = ch.questionIds.filter((id) => reviewed.has(id)).length;
          const chapterNumber = (indexById.get(ch.id) ?? 0) + 1;
          return (
            <button
              key={ch.id}
              onClick={() => onSelect(ch.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono w-5 flex-shrink-0">
                  {String(chapterNumber).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="leading-snug truncate block">
                    {ch.title}
                  </span>
                  {total > 0 && (
                    <span className="text-[11px] text-muted-foreground/60">
                      {done}/{total} reviewed
                    </span>
                  )}
                </div>
                {active && (
                  <span className="w-1 h-6 rounded-full bg-primary flex-shrink-0" />
                )}
              </div>
              {total > 0 && (
                <div className="mt-1.5 h-0.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/60 transition-all duration-300"
                    style={{ width: `${Math.round((done / total) * 100)}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No chapters match your search
          </p>
        )}
      </nav>
    </div>
  );
}

function TocRail({
  items,
  activeSection,
  questions,
  activeQuestionId,
  onJumpSection,
  onJumpQuestion,
}: {
  items: { id: string; label: string }[];
  activeSection: string;
  questions: InterviewQuestion[];
  activeQuestionId: number | null;
  onJumpSection: (id: string) => void;
  onJumpQuestion: (id: number) => void;
}) {
  return (
    <div className="p-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        In this chapter
      </p>
      <nav className="space-y-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onJumpSection(item.id)}
            className={`w-full text-left px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
              activeSection === item.id
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {questions.length > 0 && (
        <>
          <div className="mt-4 pt-4 border-t border-border/40">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">
              Questions
            </p>
            <div className="flex flex-wrap gap-1">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => onJumpQuestion(q.id)}
                  title={q.question}
                  aria-label={`Jump to question ${i + 1}`}
                  className={`h-7 w-7 rounded-md text-[11px] font-mono transition-colors ${
                    activeQuestionId === q.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground/60 leading-relaxed">
            <kbd className="px-1 py-0.5 rounded border border-border/60 bg-muted font-mono">
              j
            </kbd>{" "}
            <kbd className="px-1 py-0.5 rounded border border-border/60 bg-muted font-mono">
              k
            </kbd>{" "}
            navigate ·{" "}
            <kbd className="px-1 py-0.5 rounded border border-border/60 bg-muted font-mono">
              a
            </kbd>{" "}
            toggle answer
          </p>
        </>
      )}
    </div>
  );
}

function ChapterHubInner({
  category,
  chapters,
  questionIdsByChapter,
  initialChapterId,
  initialQuestions,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const chaptersWithQuestions: ChapterSummary[] = useMemo(
    () =>
      chapters.map((ch) => {
        const questionIds = questionIdsByChapter[ch.id] ?? [];
        return { ...ch, questionCount: questionIds.length, questionIds };
      }),
    [chapters, questionIdsByChapter],
  );

  const [activeChapter, setActiveChapter] = useState<number>(() => {
    if (chaptersWithQuestions.some((ch) => ch.id === initialChapterId)) {
      return initialChapterId;
    }
    return chaptersWithQuestions.length > 0 ? chaptersWithQuestions[0].id : 0;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileChaptersOpen, setMobileChaptersOpen] = useState(false);
  const [chapterSearch, setChapterSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<
    "default" | "easy-hard" | "hard-easy"
  >("default");
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());
  const [collapsedQuestions, setCollapsedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [keyPointsOpen, setKeyPointsOpen] = useState(true);
  const [hydratedReviews, setHydratedReviews] = useState(false);
  const [currentQuestions, setCurrentQuestions] =
    useState<InterviewQuestion[]>(initialQuestions);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState(false);
  const questionsCache = useRef<Map<number, InterviewQuestion[]>>(
    new Map([[initialChapterId, initialQuestions]]),
  );
  const inFlightChapters = useRef<Set<number>>(new Set());
  const lastRequestedChapter = useRef<number | null>(initialChapterId);

  useEffect(() => {
    try {
      if (localStorage.getItem("lynxdev_chapters_rail") === "0") {
        setSidebarOpen(false);
      }
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("lynxdev_chapters_rail", next ? "1" : "0");
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(
        `${INTERVIEW_REVIEWED_KEY_PREFIX}${category.slug}`,
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
  }, [category.slug]);

  useEffect(() => {
    if (!hydratedReviews) return;
    try {
      localStorage.setItem(
        `${INTERVIEW_REVIEWED_KEY_PREFIX}${category.slug}`,
        JSON.stringify(Array.from(reviewed)),
      );
    } catch {
      /* ignore storage errors */
    }
  }, [reviewed, category.slug, hydratedReviews]);

  const loadChapterQuestions = useCallback(
    async (id: number, silent = false) => {
      const cached = questionsCache.current.get(id);
      if (cached) {
        if (!silent) setCurrentQuestions(cached);
        return;
      }
      if (inFlightChapters.current.has(id)) {
        if (!silent) {
          lastRequestedChapter.current = id;
          setQuestionsLoading(true);
          setQuestionsError(false);
        }
        return;
      }
      inFlightChapters.current.add(id);
      if (!silent) {
        lastRequestedChapter.current = id;
        setQuestionsLoading(true);
        setQuestionsError(false);
      }
      try {
        const res = await fetch(
          `/api/interview/questions?category=${category.slug}&chapter=${id}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { questions?: unknown };
        if (!Array.isArray(data.questions))
          throw new Error("malformed response");
        const loaded = data.questions as InterviewQuestion[];
        questionsCache.current.set(id, loaded);
        if (lastRequestedChapter.current === id) {
          setCurrentQuestions(loaded);
          setQuestionsLoading(false);
        }
      } catch {
        if (lastRequestedChapter.current === id) {
          setQuestionsError(true);
          setQuestionsLoading(false);
        }
      } finally {
        inFlightChapters.current.delete(id);
      }
    },
    [category.slug],
  );

  useEffect(() => {
    const idx = chaptersWithQuestions.findIndex(
      (ch) => ch.id === activeChapter,
    );
    const next = chaptersWithQuestions[idx + 1];
    if (next && !questionsCache.current.has(next.id)) {
      void loadChapterQuestions(next.id, true);
    }
  }, [activeChapter, chaptersWithQuestions, loadChapterQuestions]);

  const currentChapter = chaptersWithQuestions.find(
    (ch) => ch.id === activeChapter,
  );
  const currentIndex = chaptersWithQuestions.findIndex(
    (ch) => ch.id === activeChapter,
  );

  const handleSetChapter = useCallback(
    (id: number) => {
      setActiveChapter(id);
      const chapter = chaptersWithQuestions.find((ch) => ch.id === id);
      setActiveQuestionId(chapter?.questionIds[0] ?? null);
      setActiveSection("overview");
      setKeyPointsOpen(true);
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("chapter", String(id));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      setMobileChaptersOpen(false);
      const cached = questionsCache.current.get(id);
      if (cached) {
        setCurrentQuestions(cached);
      } else {
        setCurrentQuestions([]);
        void loadChapterQuestions(id);
      }
    },
    [
      router,
      pathname,
      searchParams,
      chaptersWithQuestions,
      loadChapterQuestions,
    ],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeChapter]);

  const sortedQuestions = useMemo(() => {
    if (currentQuestions.length === 0) return [];
    const qs = [...currentQuestions];
    if (sortOrder === "easy-hard") {
      qs.sort(
        (a, b) =>
          DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty],
      );
    } else if (sortOrder === "hard-easy") {
      qs.sort(
        (a, b) =>
          DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[a.difficulty],
      );
    }
    return qs;
  }, [currentQuestions, sortOrder]);

  const diffCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const q of currentQuestions) {
      counts[q.difficulty] = (counts[q.difficulty] || 0) + 1;
    }
    return counts;
  }, [currentQuestions]);

  const toggleReviewed = useCallback((id: number) => {
    setReviewed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleCollapsed = useCallback((id: number) => {
    setCollapsedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allCollapsed =
    sortedQuestions.length > 0 &&
    sortedQuestions.every((q) => collapsedQuestions.has(q.id));

  const collapseAll = () =>
    setCollapsedQuestions(new Set(sortedQuestions.map((q) => q.id)));
  const expandAll = () => setCollapsedQuestions(new Set());

  const jumpToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
  }, []);

  const jumpToQuestion = useCallback((id: number) => {
    setActiveQuestionId(id);
    document
      .getElementById(`q-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  useEffect(() => {
    const ids = [
      "overview",
      "scenario",
      "deep-dive",
      "key-points",
      "questions",
      "tips",
    ];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeChapter]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (sortedQuestions.length === 0) return;

      const index = sortedQuestions.findIndex((q) => q.id === activeQuestionId);

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = sortedQuestions[(index + 1) % sortedQuestions.length];
        jumpToQuestion(next.id);
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev =
          sortedQuestions[
            (index - 1 + sortedQuestions.length) % sortedQuestions.length
          ];
        jumpToQuestion(prev.id);
      } else if (e.key === "a") {
        e.preventDefault();
        const active = index >= 0 ? sortedQuestions[index] : sortedQuestions[0];
        toggleCollapsed(active.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sortedQuestions, activeQuestionId, jumpToQuestion, toggleCollapsed]);

  const tocItems = useMemo(() => {
    if (!currentChapter) return [];
    return [
      currentChapter.content.overview && { id: "overview", label: "Overview" },
      currentChapter.content.realLifeScenario && {
        id: "scenario",
        label: "Scenario",
      },
      currentChapter.content.explanation && {
        id: "deep-dive",
        label: "Deep Dive",
      },
      currentChapter.content.keyPoints.length > 0 && {
        id: "key-points",
        label: "Key Points",
      },
      currentChapter.questionCount > 0 && {
        id: "questions",
        label: `Questions (${currentChapter.questionCount})`,
      },
      currentChapter.content.tips.length > 0 && {
        id: "tips",
        label: "Tips",
      },
    ].filter((x): x is { id: string; label: string } => Boolean(x));
  }, [currentChapter]);

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
    <div className="bg-background flex flex-col min-h-dvh">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileChaptersOpen(true)}
              className="lg:hidden"
            >
              <List className="w-4 h-4" />
              Chapters
            </Button>
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
          </div>
        </div>
      </PageHeader>

      <div className="flex flex-1 items-start">
        {sidebarOpen ? (
          <aside className="hidden lg:flex w-72 flex-shrink-0 border-r border-border/40 bg-card/50 sticky top-0 h-dvh overflow-hidden">
            <ChaptersRail
              chaptersWithQuestions={chaptersWithQuestions}
              activeId={activeChapter}
              search={chapterSearch}
              onSearchChange={setChapterSearch}
              onSelect={handleSetChapter}
              reviewed={reviewed}
              onCollapse={toggleSidebar}
            />
          </aside>
        ) : (
          <div className="hidden lg:flex w-10 flex-shrink-0 border-r border-border/40 bg-card/50 sticky top-0 h-dvh items-start justify-center pt-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Show chapters sidebar"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        )}

        <main className="flex-1 min-w-0">
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
            {currentChapter && (
              <div>
                <div className="mb-8">
                  <span className="text-xs text-muted-foreground font-mono">
                    Chapter {currentIndex + 1} of {chaptersWithQuestions.length}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight mt-1">
                    {currentChapter.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3">
                    <span className="text-xs text-muted-foreground">
                      {currentChapter.questionCount} question
                      {currentChapter.questionCount !== 1 ? "s" : ""}
                    </span>
                    {Object.entries(diffCounts).map(([d, n]) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${difficultyDotClass(d)}`}
                        />
                        {n} {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-12">
                  {currentChapter.content.overview && (
                    <section id="overview" className="scroll-mt-24 space-y-4">
                      <SectionTitle icon={BookOpen} title="Overview" />
                      <AnswerMarkdown
                        content={currentChapter.content.overview}
                      />
                    </section>
                  )}

                  {currentChapter.content.realLifeScenario && (
                    <section
                      id="scenario"
                      className="scroll-mt-24 rounded-xl border border-primary/20 bg-primary/[0.03] p-6 space-y-4"
                    >
                      <SectionTitle
                        icon={Briefcase}
                        title="Real-world scenario"
                      />
                      <AnswerMarkdown
                        content={currentChapter.content.realLifeScenario}
                      />
                    </section>
                  )}

                  {currentChapter.content.explanation && (
                    <section id="deep-dive" className="scroll-mt-24 space-y-4">
                      <SectionTitle icon={BookMarked} title="Deep Dive" />
                      <AnswerMarkdown
                        content={currentChapter.content.explanation}
                      />
                    </section>
                  )}

                  {currentChapter.content.keyPoints.length > 0 && (
                    <section
                      id="key-points"
                      className="scroll-mt-24 rounded-xl border border-green-500/20 bg-green-500/[0.03] overflow-hidden"
                    >
                      <button
                        onClick={() => setKeyPointsOpen(!keyPointsOpen)}
                        className="w-full flex items-center justify-between gap-3 px-6 py-5 text-left"
                        aria-expanded={keyPointsOpen}
                      >
                        <SectionTitle icon={CheckCircle2} title="Key Points" />
                        {keyPointsOpen ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>
                      {keyPointsOpen && (
                        <div className="px-6 pb-6 space-y-3">
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
                      )}
                    </section>
                  )}

                  {currentChapter.questionCount > 0 && (
                    <section id="questions" className="scroll-mt-24 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <SectionTitle icon={MessageSquare} title="Questions" />
                        <Badge variant="outline" className="text-xs font-mono">
                          {currentChapter.questionCount}
                        </Badge>
                        <div className="ml-auto flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={allCollapsed ? expandAll : collapseAll}
                            className="text-xs"
                          >
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

                      {questionsLoading ? (
                        <div className="flex items-center justify-center py-16">
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : questionsError ? (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-4">
                          <p className="text-sm text-destructive">
                            Couldn't load questions for this chapter.
                          </p>
                          <Button
                            size="sm"
                            onClick={() =>
                              void loadChapterQuestions(activeChapter)
                            }
                          >
                            Retry
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-5">
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
                                        toggleCollapsed(q.id);
                                      }}
                                      aria-label={
                                        isCollapsed
                                          ? "Show answer"
                                          : "Hide answer"
                                      }
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
                                        {isReviewed
                                          ? "Reviewed"
                                          : "Mark reviewed"}
                                      </span>
                                    </button>
                                  </div>
                                </div>

                                {!isCollapsed && (
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
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  )}

                  {currentChapter.content.tips.length > 0 && (
                    <section
                      id="tips"
                      className="scroll-mt-24 rounded-xl border border-blue-500/20 bg-blue-500/[0.03] p-6 space-y-4"
                    >
                      <SectionTitle icon={Lightbulb} title="Interview Tips" />
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

                <div className="flex items-center gap-4 mt-12 pt-8 border-t border-border/40">
                  {currentIndex > 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleSetChapter(
                          chaptersWithQuestions[currentIndex - 1].id,
                        )
                      }
                      className="flex-1 flex-col items-start h-auto py-2.5 leading-tight gap-y-[4px]"
                    >
                      <span className="text-[11px] text-muted-foreground">
                        &larr; Previous
                      </span>
                      <span className="text-xs font-medium truncate w-full max-w-full">
                        {chaptersWithQuestions[currentIndex - 1].title}
                      </span>
                    </Button>
                  ) : (
                    <div className="flex-1" />
                  )}
                  {currentIndex < chaptersWithQuestions.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleSetChapter(
                          chaptersWithQuestions[currentIndex + 1].id,
                        )
                      }
                      className="flex-1 flex-col items-end h-auto py-2.5 leading-tight gap-y-[4px]"
                    >
                      <span className="text-[11px] text-primary/70">
                        Next &rarr;
                      </span>
                      <span className="text-xs font-medium truncate w-full max-w-full">
                        {chaptersWithQuestions[currentIndex + 1].title}
                      </span>
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
          </div>
        </main>

        {currentChapter && (
          <aside className="hidden xl:flex w-56 flex-shrink-0 border-l border-border/40 bg-card/50 sticky top-0 h-dvh overflow-y-auto scrollbar-thin">
            <TocRail
              items={tocItems}
              activeSection={activeSection}
              questions={sortedQuestions}
              activeQuestionId={activeQuestionId}
              onJumpSection={jumpToSection}
              onJumpQuestion={jumpToQuestion}
            />
          </aside>
        )}
      </div>

      <Sheet open={mobileChaptersOpen} onOpenChange={setMobileChaptersOpen}>
        <SheetContent side="left" className="w-80 sm:max-w-sm p-0 gap-0">
          <SheetTitle className="sr-only">Chapters</SheetTitle>
          <ChaptersRail
            chaptersWithQuestions={chaptersWithQuestions}
            activeId={activeChapter}
            search={chapterSearch}
            onSearchChange={setChapterSearch}
            onSelect={handleSetChapter}
            reviewed={reviewed}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function ChapterHubClient(props: Props) {
  return (
    <Suspense fallback={null}>
      <ChapterHubInner {...props} />
    </Suspense>
  );
}
