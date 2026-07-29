import { cache } from "react";
import { db } from "@/config/db";
import {
  interviewCategories,
  interviewChapters,
  interviewQuestions,
  interviewQuestionChapters,
} from "@/config/schema";
import { eq, asc, count, inArray } from "drizzle-orm";

export type InterviewCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  color: string | null;
  order_index: number | null;
  questionCount: number;
};

export type InterviewChapter = {
  id: number;
  category_id: number;
  title: string;
  content: {
    keyPoints: string[];
    tips: string[];
    [key: string]: unknown;
  };
  order_index: number | null;
};

export type InterviewQuestion = {
  id: number;
  question: string;
  answer: string;
  difficulty: string;
  tags: string[];
  is_top50: boolean | null;
};

export const getAllCategories = cache(async (): Promise<InterviewCategory[]> => {
  try {
    const result = await db
      .select({
        id: interviewCategories.id,
        name: interviewCategories.name,
        slug: interviewCategories.slug,
        description: interviewCategories.description,
        icon: interviewCategories.icon,
        color: interviewCategories.color,
        order_index: interviewCategories.order_index,
        questionCount: count(interviewQuestions.id),
      })
      .from(interviewCategories)
      .leftJoin(
        interviewChapters,
        eq(interviewCategories.id, interviewChapters.category_id)
      )
      .leftJoin(
        interviewQuestionChapters,
        eq(interviewChapters.id, interviewQuestionChapters.chapter_id)
      )
      .leftJoin(
        interviewQuestions,
        eq(interviewQuestionChapters.question_id, interviewQuestions.id)
      )
      .groupBy(interviewCategories.id)
      .orderBy(interviewCategories.order_index);

    return result.map((r) => ({
      ...r,
      questionCount: Number(r.questionCount),
    }));
  } catch {
    return [];
  }
});

export const getCategoryBySlug = cache(async (slug: string): Promise<InterviewCategory | null> => {
  try {
    const categories = await getAllCategories();
    return categories.find((c) => c.slug === slug) ?? null;
  } catch {
    return null;
  }
});

export const getQuestionsByCategorySlug = cache(async (
  slug: string,
  opts?: { limit?: number; offset?: number }
): Promise<InterviewQuestion[]> => {
  try {
    const catResult = await db
      .select()
      .from(interviewCategories)
      .where(eq(interviewCategories.slug, slug))
      .limit(1);

    if (catResult.length === 0) return [];

    const query = db
      .selectDistinct({
        id: interviewQuestions.id,
        question: interviewQuestions.question,
        answer: interviewQuestions.answer,
        difficulty: interviewQuestions.difficulty,
        tags: interviewQuestions.tags,
        is_top50: interviewQuestions.is_top50,
      })
      .from(interviewQuestions)
      .innerJoin(
        interviewQuestionChapters,
        eq(interviewQuestions.id, interviewQuestionChapters.question_id)
      )
      .innerJoin(
        interviewChapters,
        eq(interviewQuestionChapters.chapter_id, interviewChapters.id)
      )
      .where(eq(interviewChapters.category_id, catResult[0].id))
      .orderBy(interviewQuestions.id)
      .$dynamic();

    const result = await (opts?.limit
      ? query.limit(opts.limit).offset(opts?.offset ?? 0)
      : query);

    return result.map((q) => ({
      ...q,
      tags: q.tags as string[],
    }));
  } catch {
    return [];
  }
});

export const getQuestionCountByCategorySlug = cache(async (slug: string): Promise<number> => {
  try {
    const catResult = await db
      .select({ id: interviewCategories.id })
      .from(interviewCategories)
      .where(eq(interviewCategories.slug, slug))
      .limit(1);

    if (catResult.length === 0) return 0;

    const [result] = await db
      .select({ value: count() })
      .from(interviewQuestions)
      .innerJoin(
        interviewQuestionChapters,
        eq(interviewQuestions.id, interviewQuestionChapters.question_id)
      )
      .innerJoin(
        interviewChapters,
        eq(interviewQuestionChapters.chapter_id, interviewChapters.id)
      )
      .where(eq(interviewChapters.category_id, catResult[0].id));

    return Number(result.value);
  } catch {
    return 0;
  }
});

export const getQuestionsByCategorySlugAndTags = cache(async (slug: string, tags: string[]): Promise<InterviewQuestion[]> => {
  try {
    const all = await getQuestionsByCategorySlug(slug);
    if (tags.length === 0) return all;
    return all.filter((q) => q.tags.some((t) => tags.includes(t)));
  } catch {
    return [];
  }
});

export const getDistinctTagsByCategorySlug = cache(async (slug: string): Promise<string[]> => {
  try {
    const catResult = await db
      .select({ id: interviewCategories.id })
      .from(interviewCategories)
      .where(eq(interviewCategories.slug, slug))
      .limit(1);

    if (catResult.length === 0) return [];

    const rows = await db
      .select({ tags: interviewQuestions.tags })
      .from(interviewQuestions)
      .innerJoin(
        interviewQuestionChapters,
        eq(interviewQuestions.id, interviewQuestionChapters.question_id)
      )
      .innerJoin(
        interviewChapters,
        eq(interviewQuestionChapters.chapter_id, interviewChapters.id)
      )
      .where(eq(interviewChapters.category_id, catResult[0].id));

    const tagSet = new Set<string>();
    for (const row of rows) {
      const tags = row.tags as string[];
      if (Array.isArray(tags)) {
        for (const tag of tags) {
          tagSet.add(tag);
        }
      }
    }
    return Array.from(tagSet).sort();
  } catch {
    return [];
  }
});

export const getChaptersByCategorySlug = cache(async (slug: string): Promise<InterviewChapter[]> => {
  try {
    const catResult = await db
      .select()
      .from(interviewCategories)
      .where(eq(interviewCategories.slug, slug))
      .limit(1);

    if (catResult.length === 0) return [];

    const result = await db
      .select()
      .from(interviewChapters)
      .where(eq(interviewChapters.category_id, catResult[0].id))
      .orderBy(asc(interviewChapters.order_index));

    return result.map((ch) => ({
      ...ch,
      content: ch.content as InterviewChapter["content"],
    }));
  } catch {
    return [];
  }
});

export const getQuestionsByChapterIds = cache(async (chapterIds: number[]): Promise<Record<number, InterviewQuestion[]>> => {
  if (chapterIds.length === 0) return {};

  try {
    const rows = await db
      .select({
        id: interviewQuestions.id,
        question: interviewQuestions.question,
        answer: interviewQuestions.answer,
        difficulty: interviewQuestions.difficulty,
        tags: interviewQuestions.tags,
        is_top50: interviewQuestions.is_top50,
        chapterId: interviewQuestionChapters.chapter_id,
      })
      .from(interviewQuestions)
      .innerJoin(
        interviewQuestionChapters,
        eq(interviewQuestions.id, interviewQuestionChapters.question_id)
      )
      .where(inArray(interviewQuestionChapters.chapter_id, chapterIds))
      .orderBy(interviewQuestions.id);

    const grouped: Record<number, InterviewQuestion[]> = {};
    for (const row of rows) {
      const { chapterId, ...question } = row;
      if (!grouped[chapterId]) grouped[chapterId] = [];
      grouped[chapterId].push({
        ...question,
        tags: question.tags as string[],
      });
    }
    return grouped;
  } catch {
    return {};
  }
});
