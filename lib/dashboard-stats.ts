import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/config/db";
import {
  interviewCategories,
  interviewQuestions,
  problems,
} from "@/config/schema";
import { count, sql } from "drizzle-orm";

/**
 * Cross-request cache for static seed-content counts shown on the dashboard.
 * Invalidation: bump DASHBOARD_STATS_CACHE_VERSION after re-running a seed —
 * seeds run outside the Next runtime, so revalidateTag() is unusable there.
 * Cached values are shared references across requests — treat as read-only.
 */
const DASHBOARD_STATS_CACHE_VERSION = 1;
const DASHBOARD_STATS_CACHE_TTL = 3600;
const DASHBOARD_STATS_CACHE_TAG = "dashboard-stats";

async function withDashboardStatsCache<T>(
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  return unstable_cache(fn, [key, String(DASHBOARD_STATS_CACHE_VERSION)], {
    tags: [DASHBOARD_STATS_CACHE_TAG],
    revalidate: DASHBOARD_STATS_CACHE_TTL,
  })();
}

export type InterviewStatsData = {
  categoryCount: number;
  questionCount: number;
  top50Count: number;
};

export const getInterviewStats = cache(
  async (): Promise<InterviewStatsData | null> => {
    try {
      return withDashboardStatsCache("interview-stats", async () => {
        const [[catCount], [qCount]] = await Promise.all([
          db.select({ value: count() }).from(interviewCategories),
          db
            .select({
              value: count(),
              top50: sql<number>`COALESCE(SUM(CASE WHEN ${interviewQuestions.is_top50} THEN 1 ELSE 0 END), 0)`,
            })
            .from(interviewQuestions),
        ]);

        return {
          categoryCount: Number(catCount.value),
          questionCount: Number(qCount.value),
          top50Count: Number(qCount.top50),
        };
      });
    } catch (error) {
      console.error("[dashboard-stats] getInterviewStats failed:", error);
      return null;
    }
  },
);

export type ProblemStatsData = {
  total: number;
  easy: number;
  medium: number;
  hard: number;
};

export const getProblemStats = cache(
  async (): Promise<ProblemStatsData | null> => {
    try {
      return withDashboardStatsCache("problem-stats", async () => {
        const rows = await db
          .select({ difficulty: problems.difficulty, value: count() })
          .from(problems)
          .groupBy(problems.difficulty);

        let total = 0;
        const byDifficulty: Record<string, number> = {};
        for (const row of rows) {
          const n = Number(row.value);
          byDifficulty[row.difficulty] = n;
          total += n;
        }

        return {
          total,
          easy: byDifficulty["easy"] ?? 0,
          medium: byDifficulty["medium"] ?? 0,
          hard: byDifficulty["hard"] ?? 0,
        };
      });
    } catch (error) {
      console.error("[dashboard-stats] getProblemStats failed:", error);
      return null;
    }
  },
);
