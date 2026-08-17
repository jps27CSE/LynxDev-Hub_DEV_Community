import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { validationError, badJson, unauthorized } from "@/lib/api-error";
import { getQuestionsByCategorySlugAndTags } from "@/lib/interview-data";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";

const MAX_CUSTOM_PRACTICE_QUESTIONS = 100;

const QuestionsByTagsSchema = z.object({
  categorySlug: z.string().min(1),
  tags: z.array(z.string().trim().max(64)).max(50).default([]),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const limited = await enforceDbRateLimit(
    userId,
    "interview-questions-by-tags",
    "/api/interview/questions-by-tags",
    "POST",
  );
  if (limited) return limited;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badJson();
    }

    const parsed = QuestionsByTagsSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const started = performance.now();

    const { questions, total } = await getQuestionsByCategorySlugAndTags(
      parsed.data.categorySlug,
      parsed.data.tags,
      { limit: MAX_CUSTOM_PRACTICE_QUESTIONS },
    );

    const truncated = questions.length < total;
    console.info(
      `[interview/questions-by-tags] POST: ${questions.length} rows (${total} total${truncated ? ", truncated" : ""}) in ${Math.round(
        performance.now() - started,
      )}ms`,
    );

    return NextResponse.json({ questions, total, truncated });
  } catch (error) {
    console.error("[interview/questions-by-tags] POST:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}
