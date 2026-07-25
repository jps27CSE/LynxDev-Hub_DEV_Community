import Link from "next/link";
import { getAllCategories, getDistinctTagsByCategorySlug } from "@/lib/interview-data";
import { db } from "@/config/db";
import { interviewChapters, interviewQuestions } from "@/config/schema";
import { count } from "drizzle-orm";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const categoryThemes: Record<string, { light: string; medium: string; border: string; glow: string }> = {
  "Software Engineer": {
    light: "bg-blue-500/10",
    medium: "bg-blue-500/20",
    border: "border-blue-500/30",
    glow: "group-hover:shadow-blue-500/10",
  },
  "Frontend Engineer": {
    light: "bg-sky-500/10",
    medium: "bg-sky-500/20",
    border: "border-sky-500/30",
    glow: "group-hover:shadow-sky-500/10",
  },
  "Backend Engineer": {
    light: "bg-emerald-500/10",
    medium: "bg-emerald-500/20",
    border: "border-emerald-500/30",
    glow: "group-hover:shadow-emerald-500/10",
  },
  "Fullstack Engineer": {
    light: "bg-purple-500/10",
    medium: "bg-purple-500/20",
    border: "border-purple-500/30",
    glow: "group-hover:shadow-purple-500/10",
  },
  "DevOps Engineer": {
    light: "bg-orange-500/10",
    medium: "bg-orange-500/20",
    border: "border-orange-500/30",
    glow: "group-hover:shadow-orange-500/10",
  },
  "QA Engineer": {
    light: "bg-red-500/10",
    medium: "bg-red-500/20",
    border: "border-red-500/30",
    glow: "group-hover:shadow-red-500/10",
  },
};

const ALLOWED_SLUGS = ["software-engineer", "frontend-engineer", "backend-engineer"];

export default async function InterviewPage() {
  const categories = (await getAllCategories()).filter((c) =>
    ALLOWED_SLUGS.includes(c.slug)
  );
  const [qTotal] = await db.select({ value: count() }).from(interviewQuestions);
  const [chTotal] = await db.select({ value: count() }).from(interviewChapters);
  const allChapters = await db
    .select({ category_id: interviewChapters.category_id })
    .from(interviewChapters);
  const chapterCountByCategory = new Map<number, number>();
  for (const ch of allChapters) {
    chapterCountByCategory.set(ch.category_id, (chapterCountByCategory.get(ch.category_id) || 0) + 1);
  }

  return (<>
    <div className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-card/50 text-xs text-muted-foreground mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {categories.length} tracks &middot; {Number(qTotal.value)} questions &middot; {Number(chTotal.value)} chapters
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Interview{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Preparation
              </span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Master your next technical interview with curated chapters, real-world scenarios, and hands-on practice across every engineering discipline.
            </p>
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
                Select the technologies you are targeting — React, Angular, Node.js, Spring Boot, and more — and get a personalized interview plan.
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
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
          {categories.map((cat, idx) => {
            const theme = categoryThemes[cat.name] || {
              light: "bg-muted",
              medium: "bg-muted/80",
              border: "border-border/50",
              glow: "group-hover:shadow-primary/5",
            };

            return (
              <Link
                key={cat.id}
                href={`/interview/${cat.slug}`}
                className="group relative rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-lg overflow-hidden"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${theme.glow}`}
                  style={{ boxShadow: "inset 0 1px 0 0 rgb(255 255 255 / 0.05)" }}
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

                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border/30 relative">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{cat.questionCount}</span>
                    questions
                  </div>
                  <span className="text-muted-foreground/30">&middot;</span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{chapterCountByCategory.get(cat.id) || 0}</span>
                    chapters
                  </div>
                  <div className="ml-auto">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${theme.light} ${theme.border} border`}
                    >
                      {cat.questionCount > 0 ? `${Math.min(cat.questionCount, 50)}+` : "0"} topics
                    </span>
                  </div>
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
  </>);
}
