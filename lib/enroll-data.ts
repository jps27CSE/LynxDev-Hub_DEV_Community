import { cache } from "react";
import { db } from "@/config/db";
import { usersTable, enrollments, courses } from "@/config/schema";
import { eq } from "drizzle-orm";

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

      return result.map((r) => ({
        id: r.enrollment.id,
        user_id: r.enrollment.user_id,
        course_id: r.enrollment.course_id,
        progress: r.enrollment.progress as EnrolledCourse["progress"],
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
