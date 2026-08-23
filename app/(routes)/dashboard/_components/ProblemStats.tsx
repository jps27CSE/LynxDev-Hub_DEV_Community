import { getProblemStats } from "@/lib/dashboard-stats";
import { Code2 } from "lucide-react";
import Link from "next/link";

export default async function ProblemStats() {
  const stats = await getProblemStats();

  const items = [
    { label: "Total", value: stats?.total, color: "text-emerald-600 dark:text-emerald-500" },
    { label: "Easy", value: stats?.easy, color: "text-green-600 dark:text-green-500" },
    { label: "Medium", value: stats?.medium, color: "text-yellow-600 dark:text-yellow-500" },
    { label: "Hard", value: stats?.hard, color: "text-red-600 dark:text-red-500" },
  ];

  return (
    <Link href="/problems">
      <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none transition-all group">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Code2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
              Problem Solving
            </h3>
            <p className="text-xs text-muted-foreground">
              {stats
                ? `${stats.total} challenges to solve`
                : "DSA challenges to sharpen your skills"}
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
