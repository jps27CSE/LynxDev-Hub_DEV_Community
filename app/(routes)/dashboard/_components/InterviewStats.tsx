import { getInterviewStats } from "@/lib/dashboard-stats";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default async function InterviewStats() {
  const stats = await getInterviewStats();

  return (
    <Link href="/interview">
      <div className="rounded-xl border border-border/50 bg-card p-5 hover:border-border transition-all group">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
              Interview Prep
            </h3>
            <p className="text-xs text-muted-foreground">
              {stats
                ? `${stats.questionCount} curated questions to practice`
                : "Curated questions & AI-powered practice"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
          <div>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-500">
              {stats ? stats.categoryCount : "—"}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">
              Categories
            </span>
          </div>
          <div>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-500">
              {stats ? stats.questionCount : "—"}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">
              Questions
            </span>
          </div>
          <div>
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
              {stats ? stats.top50Count : "—"}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Top 50</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
