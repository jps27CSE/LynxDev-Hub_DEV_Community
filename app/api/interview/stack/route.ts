import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { validationError, badJson, unauthorized } from "@/lib/api-error";
import { getQuestionsByStack } from "@/lib/interview-data";

const StackSchema = z.object({
  tags: z.array(z.string()).min(1).max(50),
  offset: z.coerce.number().int().min(0).default(0),
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

    const parsed = StackSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { tags, offset } = parsed.data;
    const limit = 20;

    const { questions, total, hasMore } = await getQuestionsByStack(tags, {
      limit,
      offset,
    });

    return NextResponse.json({ questions, total, hasMore });
  } catch (error) {
    console.error("[interview/stack] POST:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}
