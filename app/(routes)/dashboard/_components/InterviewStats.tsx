import { db } from "@/config/db";
import { interviewCategories, interviewQuestions } from "@/config/schema";
import { count } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default async function InterviewStats() {
  const [catCount] = await db
    .select({ value: count() })
    .from(interviewCategories);

  const [qCount] = await db
    .select({ value: count() })
    .from(interviewQuestions);

  const [top50Count] = await db
    .select({ value: count() })
    .from(interviewQuestions)
    .where(eq(interviewQuestions.is_top50, true));

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
              Curated questions & AI-powered practice
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div>
            <span className="text-2xl font-bold text-purple-500">{Number(catCount.value)}</span>
            <span className="text-xs text-muted-foreground ml-1.5">Categories</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-purple-500">{Number(qCount.value)}</span>
            <span className="text-xs text-muted-foreground ml-1.5">Questions</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-yellow-500">{Number(top50Count.value)}</span>
            <span className="text-xs text-muted-foreground ml-1.5">Top 50</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
