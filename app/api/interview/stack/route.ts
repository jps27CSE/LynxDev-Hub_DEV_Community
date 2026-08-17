import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { validationError, badJson, unauthorized } from "@/lib/api-error";
import { getQuestionsByStack } from "@/lib/interview-data";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";

const StackSchema = z.object({
  tags: z.array(z.string().trim().max(64)).min(1).max(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const limited = await enforceDbRateLimit(
    userId,
    "interview-stack",
    "/api/interview/stack",
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

    const parsed = StackSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { tags, offset } = parsed.data;
    const limit = 20;
    const started = performance.now();

    const { questions, total, hasMore } = await getQuestionsByStack(tags, {
      limit,
      offset,
    });

    console.info(
      `[interview/stack] POST: ${questions.length} rows (${total} total, offset ${offset}) in ${Math.round(
        performance.now() - started,
      )}ms`,
    );

    return NextResponse.json({ questions, total, hasMore });
  } catch (error) {
    console.error("[interview/stack] POST:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}
