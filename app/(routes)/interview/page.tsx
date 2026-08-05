import type { Metadata } from "next";
import Link from "next/link";
import { count, eq } from "drizzle-orm";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Dumbbell,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAllCategories,
  getReachableQuestionStats,
} from "@/lib/interview-data";
import { INTERVIEW_PUBLISHED_SLUGS } from "@/lib/interview-constants";
import { difficultyDotClass, difficultyTextClass } from "@/lib/interview-ui";
import { db } from "@/config/db";
import {
  interviewCategories,
  interviewCategoryChapters,
  interviewChapters,
  interviewQuestionChapters,
  interviewQuestions,
} from "@/config/schema";

export const metadata: Metadata = {
  title: "Interview Preparation | LynxDev HUB",
  description:
    "Master your next technical interview with curated chapters, real-world scenarios, and hands-on practice across every engineering discipline.",
};

const categoryThemes: Record<
  string,
  { light: string; border: string; glow: string }
> = {
  "Software Engineer": {
    light: "bg-blue-500/10",
    border: "border-blue-500/30",
    glow: "group-hover:shadow-blue-500/10",
  },
  "Frontend Engineer": {
    light: "bg-sky-500/10",
    border: "border-sky-500/30",
    glow: "group-hover:shadow-sky-500/10",
  },
  "Backend Engineer": {
    light: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    glow: "group-hover:shadow-emerald-500/10",
  },
};

const PUBLISHED_SLUGS = INTERVIEW_PUBLISHED_SLUGS as readonly string[];

const howItWorks = [
  {
    icon: BookOpen,
    title: "Study chapters",
    description:
      "Each track is broken into chapters with overviews, real-world scenarios, and deep dives written for junior-level engineers.",
    accent: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Dumbbell,
    title: "Practice questions",
    description:
      "Work through curated questions with sample answers, difficulty levels, and Top 50 must-knows for interviews.",
    accent: "bg-green-500/10 text-green-500",
  },
  {
    icon: CheckCircle2,
    title: "Review your progress",
    description:
      "Mark questions as reviewed, track your completion, and revisit weak spots before the real interview.",
    accent: "bg-yellow-500/10 text-yellow-500",
  },
];

export default async function InterviewPage() {
  const [categories, reachableStats, allChapters, diffRows] = await Promise.all(
    [
      getAllCategories().then((cs) =>
        cs.filter((c) => PUBLISHED_SLUGS.includes(c.slug)),
      ),
      getReachableQuestionStats(),
      db
        .select({ category_id: interviewCategoryChapters.category_id })
        .from(interviewCategoryChapters),
      db
        .select({
          category_id: interviewCategories.id,
          difficulty: interviewQuestions.difficulty,
          value: count(interviewQuestions.id),
        })
        .from(interviewCategories)
        .leftJoin(
          interviewCategoryChapters,
          eq(interviewCategories.id, interviewCategoryChapters.category_id),
        )
        .leftJoin(
          interviewChapters,
          eq(interviewCategoryChapters.chapter_id, interviewChapters.id),
        )
        .leftJoin(
          interviewQuestionChapters,
          eq(interviewChapters.id, interviewQuestionChapters.chapter_id),
        )
        .leftJoin(
          interviewQuestions,
          eq(interviewQuestionChapters.question_id, interviewQuestions.id),
        )
        .groupBy(interviewCategories.id, interviewQuestions.difficulty),
    ],
  );
  const chapterCountByCategory = new Map<number, number>();
  for (const ch of allChapters) {
    chapterCountByCategory.set(
      ch.category_id,
      (chapterCountByCategory.get(ch.category_id) || 0) + 1,
    );
  }
  const chTotal = allChapters.length;

  const difficultyByCategory = new Map<
    number,
    { easy: number; medium: number; hard: number }
  >();
  for (const row of diffRows) {
    const entry = difficultyByCategory.get(row.category_id) || {
      easy: 0,
      medium: 0,
      hard: 0,
    };
    if (
      row.difficulty === "easy" ||
      row.difficulty === "medium" ||
      row.difficulty === "hard"
    ) {
      entry[row.difficulty] = Number(row.value);
    }
    difficultyByCategory.set(row.category_id, entry);
  }

  return (
    <>
      <div className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-card/50 text-xs text-muted-foreground mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {categories.length} tracks &middot;{" "}
              {reachableStats?.questionCount ?? 0} questions &middot; {chTotal}{" "}
              chapters
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.1]">
              Interview{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Preparation
              </span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Master your next technical interview with curated chapters,
              real-world scenarios, and hands-on practice across every
              engineering discipline.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="#tracks">Browse Tracks</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/interview/customize">
                  <SlidersHorizontal className="w-4 h-4" />
                  Customize My Stack
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <SlidersHorizontal className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold">Customize Your Stack</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Select the technologies you are targeting — React, Angular,
                Node.js, Spring Boot, and more — and get a personalized
                interview plan.
              </p>
            </div>
            <Link href="/interview/customize">
              <Button className="gap-2 whitespace-nowrap">
                <SlidersHorizontal className="w-4 h-4" />
                Choose My Stack
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div id="tracks" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-xl font-semibold">Choose your track</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a discipline to start preparing
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500/70" />
            {categories.length} tracks available
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const theme = categoryThemes[cat.name] || {
              light: "bg-muted",
              border: "border-border/50",
              glow: "group-hover:shadow-primary/5",
            };
            const diffs = difficultyByCategory.get(cat.id);
            const diffTotal = diffs
              ? diffs.easy + diffs.medium + diffs.hard
              : 0;

            return (
              <Link
                key={cat.id}
                href={`/interview/${cat.slug}`}
                className="group relative rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-lg overflow-hidden"
              >
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${theme.glow}`}
                  style={{
                    boxShadow: "inset 0 1px 0 0 rgb(255 255 255 / 0.05)",
                  }}
                />

                <div className="flex items-start gap-4 relative">
                  <div
                    className={`w-14 h-14 rounded-2xl ${theme.light} flex items-center justify-center text-3xl flex-shrink-0 ring-1 ring-white/5`}
                  >
                    {cat.icon || "📁"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {cat.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/30 relative">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">
                        {cat.questionCount}
                      </span>
                      questions
                    </div>
                    <span className="text-muted-foreground/30">&middot;</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">
                        {chapterCountByCategory.get(cat.id) || 0}
                      </span>
                      chapters
                    </div>
                  </div>

                  {diffTotal > 0 && diffs && (
                    <div
                      className="flex items-center gap-2.5"
                      title={`${diffs.easy} easy · ${diffs.medium} medium · ${diffs.hard} hard`}
                    >
                      {(["easy", "medium", "hard"] as const).map((d) => (
                        <span
                          key={d}
                          className={`inline-flex items-center gap-1 text-[11px] ${difficultyTextClass(d)}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${difficultyDotClass(d)}`}
                          />
                          {diffs[d]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              No interview categories available yet. Check back soon!
            </p>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-semibold">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          {howItWorks.map((step, i) => (
            <div
              key={step.title}
              className="rounded-xl border border-border/50 bg-card p-6"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${step.accent} flex items-center justify-center flex-shrink-0`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-3xl font-display font-bold text-muted-foreground/20">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-semibold mt-4">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
