import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { validationError, unauthorized } from "@/lib/api-error";
import { db } from "@/config/db";
import {
  interviewCategories,
  interviewCategoryChapters,
} from "@/config/schema";
import {
  getQuestionsByCategorySlug,
  getQuestionCountByCategorySlug,
  getQuestionsByChapterIds,
} from "@/lib/interview-data";
import { withRequestLog } from "@/lib/request-log";

const QuestionsQuerySchema = z.object({
  category: z.string().min(1),
  chapter: z.coerce.number().int().min(1).optional(),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  return withRequestLog("GET /api/interview/questions", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    try {
      const { searchParams } = request.nextUrl;
      const parsed = QuestionsQuerySchema.safeParse({
        category: searchParams.get("category"),
        chapter: searchParams.get("chapter"),
        offset: searchParams.get("offset"),
      });

      if (!parsed.success) return validationError(parsed.error);

      const { category, chapter, offset } = parsed.data;
      const limit = 20;

      if (chapter !== undefined) {
        const [owned] = await db
          .select({ id: interviewCategoryChapters.id })
          .from(interviewCategoryChapters)
          .innerJoin(
            interviewCategories,
            eq(interviewCategoryChapters.category_id, interviewCategories.id),
          )
          .where(
            and(
              eq(interviewCategoryChapters.chapter_id, chapter),
              eq(interviewCategories.slug, category),
            ),
          )
          .limit(1);

        if (!owned) {
          return NextResponse.json(
            { error: "Chapter not found" },
            { status: 404 },
          );
        }

        const questionsByChapter = await getQuestionsByChapterIds([chapter]);
        const questions = questionsByChapter[chapter] ?? [];

        return NextResponse.json({
          questions,
          total: questions.length,
          hasMore: false,
        });
      }

      const [questions, total] = await Promise.all([
        getQuestionsByCategorySlug(category, { limit, offset }),
        getQuestionCountByCategorySlug(category),
      ]);

      return NextResponse.json({
        questions,
        total,
        hasMore: offset + limit < total,
      });
    } catch (error) {
      console.error("[interview/questions] GET:", error);
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 },
      );
    }
  });
}
