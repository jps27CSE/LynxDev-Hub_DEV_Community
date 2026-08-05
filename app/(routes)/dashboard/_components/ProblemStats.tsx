import { getProblemStats } from "@/lib/dashboard-stats";
import { Code2 } from "lucide-react";
import Link from "next/link";

export default async function ProblemStats() {
  const stats = await getProblemStats();

  return (
    <Link href="/problems">
      <div className="rounded-xl border border-border/50 bg-card p-5 hover:border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none transition-all group">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
              Problem Solving
            </h3>
            <p className="text-xs text-muted-foreground">
              {stats
                ? `${stats.total} challenges to solve — pick one to get started`
                : "DSA challenges to sharpen your skills"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
          <div>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
              {stats ? stats.total : "—"}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Total</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-green-600 dark:text-green-500">
              {stats ? stats.easy : "—"}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Easy</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
              {stats ? stats.medium : "—"}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Medium</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-red-600 dark:text-red-500">
              {stats ? stats.hard : "—"}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Hard</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
