import { cache } from "react";
import { db } from "@/config/db";
import {
  interviewCategories,
  interviewCategoryChapters,
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
  title: string;
  content: {
    overview?: string;
    realLifeScenario?: string;
    explanation?: string;
    keyPoints: string[];
    tips: string[];
    [key: string]: unknown;
  };
};

export type InterviewQuestion = {
  id: number;
  question: string;
  answer: string;
  difficulty: string;
  tags: string[];
  is_top50: boolean | null;
};

export const getAllCategories = cache(
  async (): Promise<InterviewCategory[]> => {
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
          interviewCategoryChapters,
          eq(interviewCategories.id, interviewCategoryChapters.category_id),
        )
        .leftJoin(
          interviewChapters,
          eq(interviewCategoryChapters.chapter_id, interviewChapters.id),
        )
        .leftJoin(
          interviewQuestionChapters,
          eq(interviewChapters.id, interviewQuestionChapters.chapter_id),
        )
        .leftJoin(
          interviewQuestions,
          eq(interviewQuestionChapters.question_id, interviewQuestions.id),
        )
        .groupBy(interviewCategories.id)
        .orderBy(interviewCategories.order_index);

      return result.map((r) => ({
        ...r,
        questionCount: Number(r.questionCount),
      }));
    } catch (error) {
      console.error("[interview-data] getAllCategories:", error);
      return [];
    }
  },
);

export const getCategoryBySlug = cache(
  async (slug: string): Promise<InterviewCategory | null> => {
    try {
      const categories = await getAllCategories();
      return categories.find((c) => c.slug === slug) ?? null;
    } catch (error) {
      console.error("[interview-data] getCategoryBySlug:", error);
      return null;
    }
  },
);

export const getQuestionsByCategorySlug = cache(
  async (
    slug: string,
    opts?: { limit?: number; offset?: number },
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
          eq(interviewQuestions.id, interviewQuestionChapters.question_id),
        )
        .innerJoin(
          interviewChapters,
          eq(interviewQuestionChapters.chapter_id, interviewChapters.id),
        )
        .innerJoin(
          interviewCategoryChapters,
          eq(interviewChapters.id, interviewCategoryChapters.chapter_id),
        )
        .where(eq(interviewCategoryChapters.category_id, catResult[0].id))
        .orderBy(interviewQuestions.id)
        .$dynamic();

      const result = await (opts?.limit
        ? query.limit(opts.limit).offset(opts?.offset ?? 0)
        : query);

      return result.map((q) => ({
        ...q,
        tags: q.tags as string[],
      }));
    } catch (error) {
      console.error("[interview-data] getQuestionsByCategorySlug:", error);
      return [];
    }
  },
);

export const getQuestionCountByCategorySlug = cache(
  async (slug: string): Promise<number> => {
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
          eq(interviewQuestions.id, interviewQuestionChapters.question_id),
        )
        .innerJoin(
          interviewChapters,
          eq(interviewQuestionChapters.chapter_id, interviewChapters.id),
        )
        .innerJoin(
          interviewCategoryChapters,
          eq(interviewChapters.id, interviewCategoryChapters.chapter_id),
        )
        .where(eq(interviewCategoryChapters.category_id, catResult[0].id));

      return Number(result.value);
    } catch (error) {
      console.error("[interview-data] getQuestionCountByCategorySlug:", error);
      return 0;
    }
  },
);

export const getQuestionsByCategorySlugAndTags = cache(
  async (
    slug: string,
    tags: string[],
    opts?: { limit?: number },
  ): Promise<{ questions: InterviewQuestion[]; total: number }> => {
    try {
      const all = await getQuestionsByCategorySlug(slug);
      const filtered =
        tags.length === 0
          ? all
          : all.filter((q) => q.tags.some((t) => tags.includes(t)));
      return {
        questions: opts?.limit ? filtered.slice(0, opts.limit) : filtered,
        total: filtered.length,
      };
    } catch (error) {
      console.error(
        "[interview-data] getQuestionsByCategorySlugAndTags:",
        error,
      );
      return { questions: [], total: 0 };
    }
  },
);

export const getDistinctTagsByCategorySlug = cache(
  async (slug: string): Promise<string[]> => {
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
          eq(interviewQuestions.id, interviewQuestionChapters.question_id),
        )
        .innerJoin(
          interviewChapters,
          eq(interviewQuestionChapters.chapter_id, interviewChapters.id),
        )
        .innerJoin(
          interviewCategoryChapters,
          eq(interviewChapters.id, interviewCategoryChapters.chapter_id),
        )
        .where(eq(interviewCategoryChapters.category_id, catResult[0].id));

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
    } catch (error) {
      console.error("[interview-data] getDistinctTagsByCategorySlug:", error);
      return [];
    }
  },
);

export type TopTag = {
  tag: string;
  count: number;
};

export const getTopTags = cache(async (limit = 40): Promise<TopTag[]> => {
  try {
    const rows = await db
      .select({ tags: interviewQuestions.tags })
      .from(interviewQuestions);

    const counts = new Map<string, number>();
    for (const row of rows) {
      const tags = row.tags as string[];
      if (!Array.isArray(tags)) continue;
      for (const tag of tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  } catch (error) {
    console.error("[interview-data] getTopTags:", error);
    return [];
  }
});

export type QuestionTagRow = {
  id: number;
  tags: string[];
};

export const getQuestionTagRows = cache(async (): Promise<QuestionTagRow[]> => {
  try {
    const rows = await db
      .select({ id: interviewQuestions.id, tags: interviewQuestions.tags })
      .from(interviewQuestions);
    return rows.map((r) => ({
      id: r.id,
      tags: (r.tags ?? []) as string[],
    }));
  } catch (error) {
    console.error("[interview-data] getQuestionTagRows:", error);
    return [];
  }
});

export type QuestionsByStackResult = {
  questions: InterviewQuestion[];
  total: number;
  hasMore: boolean;
};

const EMPTY_STACK_RESULT: QuestionsByStackResult = {
  questions: [],
  total: 0,
  hasMore: false,
};

export const getQuestionsByStack = cache(
  async (
    tags: string[],
    opts?: { limit?: number; offset?: number },
  ): Promise<QuestionsByStackResult> => {
    if (!tags || tags.length === 0) return EMPTY_STACK_RESULT;

    const limit = opts?.limit ?? 20;
    const offset = Math.max(opts?.offset ?? 0, 0);

    try {
      const rows = await getQuestionTagRows();
      const matchingIds = rows
        .filter((r) => r.tags.some((t) => tags.includes(t)))
        .map((r) => r.id)
        .sort((a, b) => a - b);

      const total = matchingIds.length;
      const pageIds = matchingIds.slice(offset, offset + limit);

      if (pageIds.length === 0) {
        return { questions: [], total, hasMore: false };
      }

      const pageRows = await db
        .select({
          id: interviewQuestions.id,
          question: interviewQuestions.question,
          answer: interviewQuestions.answer,
          difficulty: interviewQuestions.difficulty,
          tags: interviewQuestions.tags,
          is_top50: interviewQuestions.is_top50,
        })
        .from(interviewQuestions)
        .where(inArray(interviewQuestions.id, pageIds));

      const byId = new Map(pageRows.map((r) => [r.id, r]));
      const questions = pageIds
        .map((id) => byId.get(id))
        .filter((r): r is NonNullable<typeof r> => r !== undefined)
        .map((r) => ({ ...r, tags: (r.tags ?? []) as string[] }));

      return {
        questions,
        total,
        hasMore: offset + pageIds.length < total,
      };
    } catch (error) {
      console.error("[interview-data] getQuestionsByStack:", error);
      return EMPTY_STACK_RESULT;
    }
  },
);

export const getChaptersByCategorySlug = cache(
  async (slug: string): Promise<InterviewChapter[]> => {
    try {
      const catResult = await db
        .select()
        .from(interviewCategories)
        .where(eq(interviewCategories.slug, slug))
        .limit(1);

      if (catResult.length === 0) return [];

      const result = await db
        .select({
          id: interviewChapters.id,
          title: interviewChapters.title,
          content: interviewChapters.content,
          order_index: interviewCategoryChapters.order_index,
        })
        .from(interviewCategoryChapters)
        .innerJoin(
          interviewChapters,
          eq(interviewCategoryChapters.chapter_id, interviewChapters.id),
        )
        .where(eq(interviewCategoryChapters.category_id, catResult[0].id))
        .orderBy(asc(interviewCategoryChapters.order_index));

      return result.map((ch) => ({
        id: ch.id,
        title: ch.title,
        content: ch.content as InterviewChapter["content"],
      }));
    } catch (error) {
      console.error("[interview-data] getChaptersByCategorySlug:", error);
      return [];
    }
  },
);

export const getQuestionsByChapterIds = cache(
  async (
    chapterIds: number[],
  ): Promise<Record<number, InterviewQuestion[]>> => {
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
          eq(interviewQuestions.id, interviewQuestionChapters.question_id),
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
    } catch (error) {
      console.error("[interview-data] getQuestionsByChapterIds:", error);
      return {};
    }
  },
);

export const getQuestionIdsByChapterIds = cache(
  async (chapterIds: number[]): Promise<Record<number, number[]>> => {
    if (chapterIds.length === 0) return {};

    try {
      const rows = await db
        .select({
          chapterId: interviewQuestionChapters.chapter_id,
          questionId: interviewQuestionChapters.question_id,
        })
        .from(interviewQuestionChapters)
        .where(inArray(interviewQuestionChapters.chapter_id, chapterIds))
        .orderBy(interviewQuestionChapters.question_id);

      const grouped: Record<number, number[]> = {};
      for (const row of rows) {
        if (!grouped[row.chapterId]) grouped[row.chapterId] = [];
        grouped[row.chapterId].push(row.questionId);
      }
      return grouped;
    } catch (error) {
      console.error("[interview-data] getQuestionIdsByChapterIds:", error);
      return {};
    }
  },
);
