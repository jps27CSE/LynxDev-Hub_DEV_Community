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
import { getModule } from "@/config/system-design/registry";
import { simulate } from "@/lib/system-design/engine";
import type {
  SdGraph,
  SdUserState,
  SdTaskState,
} from "@/config/system-design/types";

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
    steps: z.array(z.string().min(1).max(120)).max(40),
    criteriaMet: z.array(z.string().min(1).max(120)).max(40).optional(),
    failures: z
      .array(
        z.discriminatedUnion("kind", [
          z.object({
            kind: z.literal("node_down"),
            nodeId: z.string().min(1).max(64),
            id: z.string().min(1).max(64),
          }),
          z.object({
            kind: z.literal("degraded"),
            nodeId: z.string().min(1).max(64),
            factor: z.number().min(0).max(1),
            id: z.string().min(1).max(64),
          }),
          z.object({
            kind: z.literal("partition"),
            edgeIds: z.array(z.string().min(1).max(64)).min(1).max(120),
            id: z.string().min(1).max(64),
          }),
          z.object({
            kind: z.literal("replica_lag"),
            nodeId: z.string().min(1).max(64),
            lagMs: z.number().min(0).max(60_000),
            id: z.string().min(1).max(64),
          }),
        ]),
      )
      .max(20)
      .optional(),
    attempts: z.number().int().min(0).max(1_000_000).optional(),
    revealed: z.array(z.string().min(1).max(120)).max(40).optional(),
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

    let verifiedCriteriaMet: string[] = [];
    if (parsed.data.kind === "task-save") {
      const taskModule = await getModule(parsed.data.taskSlug);
      if (!taskModule) {
        return NextResponse.json(
          { error: "Unknown system-design task" },
          { status: 400 },
        );
      }

      const graphValidation = validateGraph(parsed.data.graph);
      if (!graphValidation.success) {
        return NextResponse.json(
          { error: "Invalid graph", details: graphValidation.errors },
          { status: 400 },
        );
      }

      const requestedCriteria = new Set(parsed.data.criteriaMet ?? []);
      const knownCriteria = new Set(
        taskModule.task.passCriteria.map((criterion) => criterion.id),
      );
      if ([...requestedCriteria].some((id) => !knownCriteria.has(id))) {
        return NextResponse.json(
          { error: "Unknown pass criterion" },
          { status: 400 },
        );
      }

      const failures = parsed.data.failures ?? [];
      const nodeIds = new Set(
        graphValidation.data.nodes.map((node) => node.id),
      );
      const edgeIds = new Set(
        graphValidation.data.edges.map((edge) => edge.id),
      );
      const hasInvalidFailureTarget = failures.some((failure) =>
        "nodeId" in failure
          ? !nodeIds.has(failure.nodeId)
          : failure.edgeIds.some((id) => !edgeIds.has(id)),
      );
      if (hasInvalidFailureTarget) {
        return NextResponse.json(
          { error: "A failure references a missing graph component" },
          { status: 400 },
        );
      }

      const result = simulate(graphValidation.data, failures);
      verifiedCriteriaMet = result.valid
        ? taskModule.task.passCriteria
            .filter(
              (criterion) =>
                requestedCriteria.has(criterion.id) && criterion.assert(result),
            )
            .map((criterion) => criterion.id)
        : [];
    }

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
        const existingTask = tasks[taskSlug];
        tasks[taskSlug] = {
          graph,
          steps,
          criteriaMet: [
            ...new Set([
              ...(existingTask?.criteriaMet ?? []),
              ...verifiedCriteriaMet,
            ]),
          ],
          attempts: Math.max(
            existingTask?.attempts ?? 0,
            parsed.data.attempts ?? 0,
          ),
          revealed: [
            ...new Set([
              ...(existingTask?.revealed ?? []),
              ...(parsed.data.revealed ?? []),
            ]),
          ],
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

    return NextResponse.json(result);
  });
}
