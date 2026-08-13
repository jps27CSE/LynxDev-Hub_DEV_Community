import { cache } from "react";
import { db } from "@/config/db";
import { usersTable, enrollments, courses, chapters } from "@/config/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { createLogger } from "@/lib/logger";

const log = createLogger("enroll-data");

export type UserDetail = {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  skills: unknown;
  points: number | null;
  subscription: string | null;
};

export const getUserByEmail = cache(
  async (email: string): Promise<UserDetail | null> => {
    try {
      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);
      return users[0] ?? null;
    } catch (error) {
      log.error("getUserByEmail failed", error, { email });
      throw error;
    }
  },
);

export type EnrolledCourse = {
  id: number;
  user_id: number;
  course_id: number;
  progress: { completedChapters: number[]; currentChapter: number };
  completedCount: number;
  nextChapterId: number | null;
  nextChapterNumber: number;
  nextChapterTitle: string | null;
  totalChapters: number;
  started_at: string;
  completed_at: string | null;
  course: {
    id: number;
    title: string;
    description: string;
    icon: string | null;
    difficulty: string;
    category: string | null;
  };
};

export const getEnrollmentsByEmail = cache(
  async (email: string): Promise<EnrolledCourse[]> => {
    try {
      const user = await getUserByEmail(email);

      if (!user) return [];

      const rows = await db
        .select({
          enrollment: enrollments,
          course: courses,
        })
        .from(enrollments)
        .where(eq(enrollments.user_id, user.id))
        .innerJoin(courses, eq(enrollments.course_id, courses.id))
        .orderBy(desc(enrollments.updated_at), desc(enrollments.id));

      if (rows.length === 0) return [];

      const chaptersByCourse = new Map<number, { id: number; title: string }[]>();
      const chapterRows = await db
        .select({
          courseId: chapters.course_id,
          chapterId: chapters.id,
          title: chapters.title,
          orderIndex: chapters.order_index,
        })
        .from(chapters)
        .where(
          inArray(
            chapters.course_id,
            rows.map((r) => r.course.id),
          ),
        )
        .orderBy(chapters.course_id, chapters.order_index, chapters.id);

      for (const ch of chapterRows) {
        const list = chaptersByCourse.get(ch.courseId) ?? [];
        list.push({ id: ch.chapterId, title: ch.title });
        chaptersByCourse.set(ch.courseId, list);
      }

      return rows.map((r) => {
        const rawProgress = r.enrollment.progress as
          | Partial<EnrolledCourse["progress"]>
          | null;

        const completedChapters = Array.isArray(rawProgress?.completedChapters)
          ? rawProgress.completedChapters
          : [];
        const chapterList = chaptersByCourse.get(r.course.id) ?? [];
        const chapterIds = chapterList.map((c) => c.id);
        const completedSet = new Set(completedChapters);

        const completedCount = chapterIds.filter((id) => completedSet.has(id))
          .length;
        const nextChapterIndex = chapterIds.findIndex(
          (id) => !completedSet.has(id),
        );
        const nextChapter =
          nextChapterIndex >= 0 ? chapterList[nextChapterIndex] : null;

        return {
          id: r.enrollment.id,
          user_id: r.enrollment.user_id,
          course_id: r.enrollment.course_id,
          progress: {
            completedChapters,
            currentChapter:
              typeof rawProgress?.currentChapter === "number"
                ? rawProgress.currentChapter
                : nextChapter?.id ?? 1,
          },
          completedCount,
          nextChapterId: nextChapter?.id ?? null,
          nextChapterNumber: nextChapterIndex + 1,
          nextChapterTitle: nextChapter?.title ?? null,
          started_at: r.enrollment.started_at?.toISOString() ?? "",
          completed_at: r.enrollment.completed_at?.toISOString() ?? null,
          totalChapters: r.course.chapter_count,
          course: {
            id: r.course.id,
            title: r.course.title,
            description: r.course.description,
            icon: r.course.icon,
            difficulty: r.course.difficulty,
            category: r.course.category,
          },
        };
      });
    } catch (error) {
      log.error("getEnrollmentsByEmail failed", error, { email });
      throw error;
    }
  },
);
