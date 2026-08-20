import { cache } from "react";
import { db } from "@/config/db";
import { courses, chapters } from "@/config/schema";
import { eq } from "drizzle-orm";
import { createLogger } from "@/lib/logger";
import { createContentCache } from "@/lib/content-cache";
import { withConnectRetry } from "@/lib/db-retry";

const log = createLogger("course-data");

/**
 * Cross-request cache for immutable course seed content.
 * Invalidation: bump COURSE_CACHE_VERSION after re-running a seed script —
 * seeds run outside the Next.js runtime, so revalidateTag() is unusable there.
 * `ttl: false` = cache indefinitely; a version bump is the ONLY invalidation.
 * Cached values are shared references across requests — treat as read-only.
 */
const COURSE_CACHE_VERSION = 1;

const withCourseCache = createContentCache({
  tag: "courses",
  version: COURSE_CACHE_VERSION,
  ttl: false,
});

export type CourseRow = typeof courses.$inferSelect;

export type Chapter = Omit<typeof chapters.$inferSelect, "content"> & {
  content: {
    instructions: string;
    initialCode: string;
    solution: string;
    type?: "console" | "browser";
  };
};

export type ChapterMeta = Pick<
  Chapter,
  "id" | "title" | "order_index" | "points_reward"
>;

export function getCourseLanguage(
  title: string,
  contentType?: "console" | "browser",
): string {
  const lower = title.toLowerCase();
  if (lower.includes("css")) return "css";
  if (lower.includes("typescript")) return "typescript";
  if (lower.includes("javascript")) return "javascript";
  if (lower.includes("html")) return "html";
  return contentType === "console" ? "javascript" : "html";
}

/**
 * Failures THROW (after logging) — never return empty data that looks like
 * "no courses". Pages distinguish via their segment `error.tsx` (error state)
 * vs `[]`/`null` (genuine empty / not-found). A transient connect error is
 * retried once first (TiDB Serverless cold start) so the error boundary only
 * fires for genuine outages.
 */
export const getAllCourses = cache(async (): Promise<CourseRow[]> => {
  try {
    return await withCourseCache("all-courses", async () => {
      return await withConnectRetry(() =>
        db
          .select()
          .from(courses)
          .where(eq(courses.is_published!, true))
          .orderBy(courses.order_index),
      );
    });
  } catch (error) {
    log.error("getAllCourses failed", error);
    throw error;
  }
});

export const getCourseById = cache(
  async (id: number): Promise<CourseRow | null> => {
    if (!Number.isInteger(id)) {
      log.warn("getCourseById called with non-integer id", { id });
      return null;
    }
    try {
      return await withCourseCache(`course-${id}`, async () => {
        const result = await withConnectRetry(() =>
          db.select().from(courses).where(eq(courses.id, id)).limit(1),
        );
        return result[0] ?? null;
      });
    } catch (error) {
      log.error("getCourseById failed", error);
      throw error;
    }
  },
);

export const getChaptersByCourseId = cache(
  async (courseId: number): Promise<Chapter[]> => {
    if (!Number.isInteger(courseId)) {
      log.warn("getChaptersByCourseId called with non-integer id", {
        courseId,
      });
      return [];
    }
    try {
      return await withCourseCache(`chapters-${courseId}`, async () => {
        const result = await withConnectRetry(() =>
          db
            .select()
            .from(chapters)
            .where(eq(chapters.course_id, courseId))
            .orderBy(chapters.order_index),
        );
        return result.map((ch) => ({
          ...ch,
          content: ch.content as Chapter["content"],
        }));
      });
    } catch (error) {
      log.error("getChaptersByCourseId failed", error);
      throw error;
    }
  },
);

/**
 * Lean chapter metadata (no content JSON) for callers that only need
 * ids, ordering, and points — avoids fetching full lesson payloads.
 */
export const getChaptersMetaByCourseId = cache(
  async (courseId: number): Promise<ChapterMeta[]> => {
    if (!Number.isInteger(courseId)) {
      log.warn("getChaptersMetaByCourseId called with non-integer id", {
        courseId,
      });
      return [];
    }
    try {
      return await withCourseCache(`chapters-meta-${courseId}`, async () => {
        return await withConnectRetry(() =>
          db
            .select({
              id: chapters.id,
              title: chapters.title,
              order_index: chapters.order_index,
              points_reward: chapters.points_reward,
            })
            .from(chapters)
            .where(eq(chapters.course_id, courseId))
            .orderBy(chapters.order_index),
        );
      });
    } catch (error) {
      log.error("getChaptersMetaByCourseId failed", error);
      throw error;
    }
  },
);
