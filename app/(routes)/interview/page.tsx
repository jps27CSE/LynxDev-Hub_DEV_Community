import Link from "next/link";
import { getAllCategories } from "@/lib/interview-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function InterviewPage() {
  const categories = await getAllCategories();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Interview Preparation
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Practice with curated questions across categories. Filter by tags,
            difficulty, and track your progress.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/interview/${cat.slug}`}
              className="group rounded-xl border border-border/50 bg-card p-6 hover:border-border transition-all hover:shadow-sm block"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                  {cat.icon || "📁"}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="secondary" className="text-xs">
                  {cat.questionCount} questions
                </Badge>
                {cat.questionCount > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                  >
                    Top 50
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              No interview categories available yet. Check back soon!
            </p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
