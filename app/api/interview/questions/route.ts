import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { validationError, unauthorized } from "@/lib/api-error";
import { getQuestionsByCategorySlug, getQuestionCountByCategorySlug } from "@/lib/interview-data";

const QuestionsQuerySchema = z.object({
  category: z.string().min(1),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  try {
    const { searchParams } = request.nextUrl;
    const parsed = QuestionsQuerySchema.safeParse({
      category: searchParams.get("category"),
      offset: searchParams.get("offset"),
    });

    if (!parsed.success) return validationError(parsed.error);

    const { category, offset } = parsed.data;
    const limit = 20;

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
      { status: 500 }
    );
  }
}
