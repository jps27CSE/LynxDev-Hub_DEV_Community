import { getInterviewStats } from "@/lib/dashboard-stats";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default async function InterviewStats() {
  const stats = await getInterviewStats();

  const items = [
    { label: "Categories", value: stats?.categoryCount, color: "text-purple-600 dark:text-purple-500" },
    { label: "Questions", value: stats?.questionCount, color: "text-purple-600 dark:text-purple-500" },
    { label: "Top 50", value: stats?.top50Count, color: "text-yellow-600 dark:text-yellow-500" },
  ];

  return (
    <Link href="/interview">
      <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none transition-all group">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
              Interview Prep
            </h3>
            <p className="text-xs text-muted-foreground">
              {stats
                ? `${stats.questionCount} questions to practice`
                : "Questions, chapters & practice"}
            </p>
          </div>
        </div>
        <div className="flex items-end justify-between gap-2">
          {items.map((item) => (
            <div key={item.label} className="text-center min-w-0 flex-1">
              <p className={`text-xl sm:text-2xl font-bold leading-none ${item.color}`}>
                {item.value ?? "\u2014"}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
