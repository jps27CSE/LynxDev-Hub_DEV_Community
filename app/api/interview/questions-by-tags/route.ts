import { NextResponse } from "next/server";
import { z } from "zod";
import { validationError, badJson } from "@/lib/api-error";
import { getQuestionsByCategorySlugAndTags } from "@/lib/interview-data";

const QuestionsByTagsSchema = z.object({
  categorySlug: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

export async function POST(request: Request) {
  try {
    let body: unknown;
    try { body = await request.json(); }
    catch { return badJson(); }

    const parsed = QuestionsByTagsSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const questions = await getQuestionsByCategorySlugAndTags(parsed.data.categorySlug, parsed.data.tags);

    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
