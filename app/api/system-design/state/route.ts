import { z } from "zod/v4";
import { db } from "@/config/db";
import { sdUserState, usersTable } from "@/config/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  validationError,
  badJson,
  unauthorized,
  serverError,
} from "@/lib/api-error";
import { createLogger } from "@/lib/logger";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import { withRequestLog } from "@/lib/request-log";
import { SdGraphSchema, validateGraph } from "@/lib/system-design/validation";
import type { SdGraph, SdUserState, SdTaskState } from "@/config/system-design/types";

const log = createLogger("system-design-state");

const StateMutationSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("lesson-complete"),
    slug: z.string().min(1).max(120),
  }),
  z.object({
    kind: z.literal("task-save"),
    taskSlug: z.string().min(1).max(120),
    graph: SdGraphSchema,
    steps: z.array(z.string()).max(40),
  }),
]);

export async function GET(req: NextRequest) {
  return withRequestLog("GET /api/system-design/state", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    try {
      const rateLimitedResponse = await enforceDbRateLimit(
        userId,
        "system-design",
        "/api/system-design/state",
        "GET",
      );
      if (rateLimitedResponse) return rateLimitedResponse;
    } catch (error) {
      log.error("rate limit check failed", error, { userId });
      return serverError("Failed to check rate limit");
    }

    const userResult = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerk_id, userId))
      .limit(1);

    if (userResult.length === 0) return unauthorized();

    const user = userResult[0];

    const stateResult = await db
      .select()
      .from(sdUserState)
      .where(eq(sdUserState.user_id, user.id))
      .limit(1);

    if (stateResult.length === 0) {
      return NextResponse.json({
        lessonsCompleted: [],
        tasks: {},
      } satisfies SdUserState);
    }

    const record = stateResult[0];
    const lessonsCompleted = (record.lessons_completed as string[]) ?? [];
    const tasks = (record.tasks as Record<string, SdTaskState>) ?? {};

    return NextResponse.json({ lessonsCompleted, tasks });
  });
}

export async function POST(req: NextRequest) {
  return withRequestLog("POST /api/system-design/state", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    try {
      const rateLimitedResponse = await enforceDbRateLimit(
        userId,
        "system-design",
        "/api/system-design/state",
        "POST",
      );
      if (rateLimitedResponse) return rateLimitedResponse;
    } catch (error) {
      log.error("rate limit check failed", error, { userId });
      return serverError("Failed to check rate limit");
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badJson();
    }

    const parsed = StateMutationSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const userResult = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerk_id, userId))
      .limit(1);

    if (userResult.length === 0) return unauthorized();

    const user = userResult[0];

    const now = new Date().toISOString();

    const result = await db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(sdUserState)
        .where(eq(sdUserState.user_id, user.id))
        .limit(1);

      let lessonsCompleted: string[] = [];
      let tasks: Record<string, SdTaskState> = {};

      if (existing.length > 0) {
        lessonsCompleted = (existing[0].lessons_completed as string[]) ?? [];
        tasks = (existing[0].tasks as Record<string, SdTaskState>) ?? {};
      }

      if (parsed.data.kind === "lesson-complete") {
        const { slug } = parsed.data;
        if (!lessonsCompleted.includes(slug)) {
          lessonsCompleted.push(slug);
        }
      } else if (parsed.data.kind === "task-save") {
        const { taskSlug, graph, steps } = parsed.data;
        const validation = validateGraph(graph);
        if (!validation.success) {
          return { error: "Invalid graph", details: validation.errors } as const;
        }

        const existingTask = tasks[taskSlug];
        const nextAttempts = (existingTask?.attempts ?? 0) + 1;

        tasks[taskSlug] = {
          graph,
          steps,
          criteriaMet: existingTask?.criteriaMet ?? [],
          attempts: nextAttempts,
          revealed: existingTask?.revealed ?? [],
          updatedAt: now,
        };
      }

      if (existing.length > 0) {
        await tx
          .update(sdUserState)
          .set({
            lessons_completed: lessonsCompleted,
            tasks,
            updated_at: new Date(),
          })
          .where(eq(sdUserState.user_id, user.id));
      } else {
        await tx.insert(sdUserState).values({
          user_id: user.id,
          lessons_completed: lessonsCompleted,
          tasks,
          updated_at: new Date(),
        });
      }

      return { lessonsCompleted, tasks };
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  });
}