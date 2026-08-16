import { cache } from "react";
import { db } from "@/config/db";
import { interviewCategories, problems } from "@/config/schema";
import { INTERVIEW_PUBLISHED_SLUGS } from "@/lib/interview-constants";
import { getReachableQuestionStats } from "@/lib/interview-data";
import { createLogger } from "@/lib/logger";
import { createContentCache, DEFAULT_CONTENT_CACHE_TTL } from "@/lib/content-cache";
import { count, inArray } from "drizzle-orm";

const log = createLogger("dashboard-stats");

/**
 * Cross-request cache for static seed-content counts shown on the dashboard.
 * Invalidation: bump DASHBOARD_STATS_CACHE_VERSION after re-running a seed —
 * seeds run outside the Next runtime, so revalidateTag() is unusable there.
 * Cached values are shared references across requests — treat as read-only.
 */
const DASHBOARD_STATS_CACHE_VERSION = 2;

const withDashboardStatsCache = createContentCache({
  tag: "dashboard-stats",
  version: DASHBOARD_STATS_CACHE_VERSION,
  ttl: DEFAULT_CONTENT_CACHE_TTL,
});

export type InterviewStatsData = {
  categoryCount: number;
  questionCount: number;
  top50Count: number;
};

export const getInterviewStats = cache(
  async (): Promise<InterviewStatsData | null> => {
    try {
      return withDashboardStatsCache("interview-stats", async () => {
        const [catCount, reachable] = await Promise.all([
          db
            .select({ value: count() })
            .from(interviewCategories)
            .where(
              inArray(interviewCategories.slug, INTERVIEW_PUBLISHED_SLUGS),
            ),
          getReachableQuestionStats(),
        ]);

        return {
          categoryCount: Number(catCount[0].value),
          questionCount: reachable?.questionCount ?? 0,
          top50Count: reachable?.top50Count ?? 0,
        };
      });
    } catch (error) {
      log.error("getInterviewStats failed", error);
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
      log.error("getProblemStats failed", error);
      return null;
    }
  },
);
