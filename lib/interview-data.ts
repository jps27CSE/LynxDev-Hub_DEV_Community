import { db } from "@/config/db";
import { interviewCategories, interviewQuestions } from "@/config/schema";
import { eq, count } from "drizzle-orm";

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

export type InterviewQuestion = {
  id: number;
  category_id: number;
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
        interviewQuestions,
        eq(interviewCategories.id, interviewQuestions.category_id)
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
      .select()
      .from(interviewQuestions)
      .where(eq(interviewQuestions.category_id, catResult[0].id))
      .orderBy(interviewQuestions.id);

    return result.map((q) => ({
      ...q,
      tags: q.tags as string[],
    }));
  } catch {
    return [];
  }
}
