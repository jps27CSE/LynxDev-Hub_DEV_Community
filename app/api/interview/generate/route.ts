import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { validationError, badJson, unauthorized } from "@/lib/api-error";
import { db } from "@/config/db";
import { interviewCategories } from "@/config/schema";
import { eq } from "drizzle-orm";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import {
  questionTemplates,
  type InterviewTemplate,
} from "@/config/interview/generate-templates";

const difficultyWeights: Record<string, number> = {
  easy: 0.4,
  medium: 0.4,
  hard: 0.2,
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateQuestions(
  templates: InterviewTemplate[],
  count: number,
  selectedTags: string[],
) {
  let pool = templates;
  if (selectedTags.length > 0) {
    pool = templates.filter((t) =>
      t.tags.some((tag) => selectedTags.includes(tag)),
    );
  }
  if (pool.length === 0) pool = templates;

  const result: typeof pool = [];
  const difficultyOrder = ["easy", "medium", "hard"];

  while (result.length < count) {
    for (const diff of difficultyOrder) {
      const diffPool = pool.filter((t) => t.difficulty === diff);
      if (diffPool.length === 0) continue;
      const target = Math.ceil(count * (difficultyWeights[diff] ?? 0.33));
      while (
        result.length < count &&
        result.filter((r) => r.difficulty === diff).length < target &&
        diffPool.length > 0
      ) {
        const pick = diffPool.splice(
          Math.floor(Math.random() * diffPool.length),
          1,
        )[0];
        result.push(pick);
      }
    }
    if (result.length < count) {
      const remaining = pool.filter((t) => !result.includes(t));
      if (remaining.length === 0) break;
      result.push(pickRandom(remaining));
    }
  }

  return result.slice(0, count);
}

const GenerateSchema = z.object({
  categorySlug: z.string().min(1),
  tags: z.array(z.string()).default([]),
  count: z.number().int().min(1).max(50).default(5),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const limited = await enforceDbRateLimit(
    userId,
    "interview-generate",
    "/api/interview/generate",
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

    const parsed = GenerateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { categorySlug, tags, count } = parsed.data;

    const catResult = await db
      .select()
      .from(interviewCategories)
      .where(eq(interviewCategories.slug, categorySlug))
      .limit(1);

    if (catResult.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const templates = questionTemplates[categorySlug];
    if (!templates || templates.length === 0) {
      return NextResponse.json(
        { error: "No templates available for this category" },
        { status: 400 },
      );
    }

    const generated = generateQuestions(templates, Math.min(count, 50), tags);

    const enriched = generated.map((g) => ({
      question: g.question,
      answer: g.answer,
      difficulty: g.difficulty,
      tags: g.tags,
    }));

    return NextResponse.json({ questions: enriched });
  } catch (error) {
    console.error("[interview/generate] POST:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
