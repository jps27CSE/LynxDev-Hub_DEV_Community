import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryBySlug, getQuestionsByCategorySlug } from "@/lib/interview-data";
import { ChevronRight, Sparkles } from "lucide-react";

const difficultyColor: Record<string, string> = {
  easy: "bg-green-500/10 text-green-500 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const cat = await getCategoryBySlug(slug);

  if (!cat) {
    notFound();
  }

  const questions = await getQuestionsByCategorySlug(slug);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/interview"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
        >
          &larr; Back to Categories
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-3xl flex-shrink-0">
            {cat.icon || "📁"}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {cat.name}
            </h1>
            <p className="text-muted-foreground mt-1">{cat.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-muted-foreground">
                {questions.length} questions
              </span>
              <span className="text-sm text-muted-foreground">
                &middot; Top 50 curated
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Link href={`/interview/${slug}/practice`}>
            <Button className="gap-2">
              <Sparkles className="w-4 h-4" />
              Start Practice
            </Button>
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-border/50">
            <p className="text-muted-foreground">
              No questions available for this category yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-border/50 bg-card p-5 hover:border-border transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-relaxed">
                      {q.question}
                    </h3>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Badge
                        variant="outline"
                        className={
                          difficultyColor[q.difficulty] ||
                          "bg-muted text-muted-foreground"
                        }
                      >
                        {q.difficulty}
                      </Badge>
                      {(q.tags as string[]).slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
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
                  </div>
                  <Link
                    href={`/interview/${slug}/practice?id=${q.id}`}
                    className="flex-shrink-0"
                  >
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
