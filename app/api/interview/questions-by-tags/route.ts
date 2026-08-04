import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { validationError, badJson, unauthorized } from "@/lib/api-error";
import { getQuestionsByCategorySlugAndTags } from "@/lib/interview-data";

const QuestionsByTagsSchema = z.object({
  categorySlug: z.string().min(1),
  tags: z.array(z.string()).max(50).default([]),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badJson();
    }

    const parsed = QuestionsByTagsSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const limit = 100;

    const { questions, total } = await getQuestionsByCategorySlugAndTags(
      parsed.data.categorySlug,
      parsed.data.tags,
      { limit },
    );

    return NextResponse.json({
      questions,
      total,
      truncated: questions.length < total,
    });
  } catch (error) {
    console.error("[interview/questions-by-tags] POST:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}
