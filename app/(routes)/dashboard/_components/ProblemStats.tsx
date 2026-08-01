import { db } from "@/config/db";
import { problems } from "@/config/schema";
import { count, eq } from "drizzle-orm";
import { Code2 } from "lucide-react";
import Link from "next/link";

export default async function ProblemStats() {
  const [total] = await db.select({ value: count() }).from(problems);

  const [easy] = await db
    .select({ value: count() })
    .from(problems)
    .where(eq(problems.difficulty, "easy"));

  const [medium] = await db
    .select({ value: count() })
    .from(problems)
    .where(eq(problems.difficulty, "medium"));

  const [hard] = await db
    .select({ value: count() })
    .from(problems)
    .where(eq(problems.difficulty, "hard"));

  return (
    <Link href="/problems">
      <div className="rounded-xl border border-border/50 bg-card p-5 hover:border-border transition-all group">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
              Problem Solving
            </h3>
            <p className="text-xs text-muted-foreground">
              DSA challenges to sharpen your skills
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div>
            <span className="text-2xl font-bold text-emerald-500">
              {Number(total.value)}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Total</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-green-500">
              {Number(easy.value)}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Easy</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-yellow-500">
              {Number(medium.value)}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Medium</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-red-500">
              {Number(hard.value)}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Hard</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
