import { cache } from "react";
import { db } from "@/config/db";
import { usersTable, enrollments, courses, chapters } from "@/config/schema";
import { eq, count, inArray } from "drizzle-orm";

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
      console.error("[enroll-data] getUserByEmail failed", { email, error });
      throw error;
    }
  },
);

export type EnrolledCourse = {
  id: number;
  user_id: number;
  course_id: number;
  progress: { completedChapters: number[]; currentChapter: number };
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

      const userId = user.id;

      const result = await db
        .select({
          enrollment: enrollments,
          course: courses,
        })
        .from(enrollments)
        .where(eq(enrollments.user_id, userId))
        .innerJoin(courses, eq(enrollments.course_id, courses.id));

      const enrolledCourseIds = result.map((r) => r.course.id);

      const countMap = new Map<number, number>();
      if (enrolledCourseIds.length > 0) {
        const chapterCounts = await db
          .select({
            course_id: chapters.course_id,
            value: count(),
          })
          .from(chapters)
          .where(inArray(chapters.course_id, enrolledCourseIds))
          .groupBy(chapters.course_id);

        for (const row of chapterCounts) {
          countMap.set(row.course_id, Number(row.value));
        }
      }

      return result.map((r) => ({
        id: r.enrollment.id,
        user_id: r.enrollment.user_id,
        course_id: r.enrollment.course_id,
        progress: r.enrollment.progress as EnrolledCourse["progress"],
        started_at: r.enrollment.started_at?.toISOString() ?? "",
        completed_at: r.enrollment.completed_at?.toISOString() ?? null,
        totalChapters: countMap.get(r.course.id) || 0,
        course: {
          id: r.course.id,
          title: r.course.title,
          description: r.course.description,
          icon: r.course.icon,
          difficulty: r.course.difficulty,
          category: r.course.category,
        },
      }));
    } catch (error) {
      console.error("[enroll-data] getEnrollmentsByEmail failed", {
        email,
        error,
      });
      throw error;
    }
  },
);
