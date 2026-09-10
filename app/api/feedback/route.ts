import { z } from "zod";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  validationError,
  badJson,
  unauthorized,
  notFound,
  serverError,
} from "@/lib/api-error";
import { createFeedback } from "@/lib/feedback-data";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import { withRequestLog } from "@/lib/request-log";

const FeedbackSchema = z.object({
  category: z.enum(["bug", "feature", "feedback", "other"]).default("other"),
  title: z.string().min(5, "Title must be at least 5 characters").max(120),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
});

export async function POST(req: NextRequest) {
  return withRequestLog("POST /api/feedback", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const limited = await enforceDbRateLimit(
      userId,
      "feedback-create",
      "/api/feedback",
      "POST",
    );
    if (limited) return limited;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badJson();
    }

    const parsed = FeedbackSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const users = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerk_id, userId))
      .limit(1);

    if (users.length === 0) return notFound("User");

    const created = await createFeedback(users[0].id, parsed.data);
    if (!created) return serverError("Failed to create feedback");

    return NextResponse.json(created, { status: 201 });
  });
}
