import { cache } from "react";
import { db } from "@/config/db";
import { courses, chapters } from "@/config/schema";
import { eq } from "drizzle-orm";

export type Course = {
  id: number;
  title: string;
  description: string;
  icon: string | null;
  difficulty: string;
  category: string | null;
  order_index: number | null;
  is_published: boolean | null;
};

export type Chapter = {
  id: number;
  course_id: number;
  title: string;
  content: {
    instructions: string;
    initialCode: string;
    solution: string;
  };
  order_index: number | null;
  points_reward: number | null;
};

export const getAllCourses = cache(async (): Promise<Course[]> => {
  try {
    return await db
      .select()
      .from(courses)
      .where(eq(courses.is_published!, true))
      .orderBy(courses.order_index);
  } catch {
    return [];
  }
});

export const getCourseById = cache(async (id: number): Promise<Course | null> => {
  try {
    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);
    return result[0] ?? null;
  } catch {
    return null;
  }
});

export const getChaptersByCourseId = cache(async (courseId: number): Promise<Chapter[]> => {
  try {
    const result = await db
      .select()
      .from(chapters)
      .where(eq(chapters.course_id, courseId))
      .orderBy(chapters.order_index);
    return result.map((ch) => ({
      ...ch,
      content: ch.content as Chapter["content"],
    }));
  } catch {
    return [];
  }
});
