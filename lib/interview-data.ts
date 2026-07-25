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

export async function getAllCategories(): Promise<InterviewCategory[]> {
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
}

export async function getCategoryBySlug(
  slug: string
): Promise<InterviewCategory | null> {
  try {
    const categories = await getAllCategories();
    return categories.find((c) => c.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export async function getQuestionsByCategorySlug(
  slug: string
): Promise<InterviewQuestion[]> {
  try {
    const catResult = await db
      .select()
      .from(interviewCategories)
      .where(eq(interviewCategories.slug, slug))
      .limit(1);

    if (catResult.length === 0) return [];

    const result = await db
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
      .orderBy(interviewQuestions.id);

    return result.map((q) => ({
      ...q,
      tags: q.tags as string[],
    }));
  } catch {
    return [];
  }
}

export async function getQuestionsByCategorySlugAndTags(
  slug: string,
  tags: string[]
): Promise<InterviewQuestion[]> {
  try {
    const all = await getQuestionsByCategorySlug(slug);
    if (tags.length === 0) return all;
    return all.filter((q) => q.tags.some((t) => tags.includes(t)));
  } catch {
    return [];
  }
}

export async function getDistinctTagsByCategorySlug(
  slug: string
): Promise<string[]> {
  try {
    const questions = await getQuestionsByCategorySlug(slug);
    const tagSet = new Set<string>();
    for (const q of questions) {
      for (const tag of q.tags) {
        tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  } catch {
    return [];
  }
}

export async function getChaptersByCategorySlug(
  slug: string
): Promise<InterviewChapter[]> {
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
}

export async function getQuestionsByChapterId(
  chapterId: number
): Promise<InterviewQuestion[]> {
  try {
    const result = await db
      .select({
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
      .where(eq(interviewQuestionChapters.chapter_id, chapterId));

    return result.map((q) => ({
      ...q,
      tags: q.tags as string[],
    }));
  } catch {
    return [];
  }
}
