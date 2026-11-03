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
  payloadTooLarge,
  rateLimited,
} from "@/lib/api-error";
import { createMemoryRateLimiter } from "@/lib/memory-rate-limit";
import type { MemoryRateLimiter } from "@/lib/memory-rate-limit";
import { getRateLimitConfig } from "@/config/rate-limits";
import { withRequestLog } from "@/lib/request-log";
import { SdGraphSchema, validateGraph } from "@/lib/system-design/validation";
import { criteriaNeedingVerification } from "@/lib/system-design/criteria";
import { getModule } from "@/config/system-design/registry";
import { simulate } from "@/lib/system-design/engine";
import type { SdUserState, SdTaskState } from "@/config/system-design/types";

/**
 * Largest body this route will read. A schema-valid task-save (40 nodes,
 * 120 edges, 40 steps) tops out near 40 KB, so 64 KB is headroom, not a
 * tuning knob. `req.json()` buffers the entire body before Zod can reject it
 * and App Router handlers have no default cap of their own.
 *
 * Caveat: a chunked request can omit `Content-Length`, in which case this
 * check does not fire and the platform's own request-body limit is the bound.
 */
const MAX_BODY_BYTES = 64 * 1024;

const ROUTE_PATH = "/api/system-design/state";

/**
 * Per-instance limits, not the shared TiDB counter every other route uses —
 * see `lib/memory-rate-limit.ts` for the trade-off. The numbers still come from
 * `config/rate-limits.ts`, so the two limiters cannot drift apart.
 */
const taskSaveLimiter = createMemoryRateLimiter(
  getRateLimitConfig(ROUTE_PATH, "POST"),
);
const taskLoadLimiter = createMemoryRateLimiter(
  getRateLimitConfig(ROUTE_PATH, "GET"),
);

function enforceInstanceRateLimit(
  limiter: MemoryRateLimiter,
  userId: string,
): Response | null {
  const decision = limiter(userId);
  if (decision.allowed) return null;
  return rateLimited(
    Math.ceil((decision.resetMs - Date.now()) / 1000),
    decision.limit,
    decision.remaining,
    decision.resetMs,
  );
}

/**
 * Criteria this learner has already earned for a task.
 *
 * Read before the simulation so a save that claims nothing new never runs the
 * engine. This is one extra point read on the Run path only — autosaves claim
 * no criteria and skip it entirely. It reads the whole `tasks` blob because
 * `sd_user_state` stores all 15 tasks in one JSON column (see the production
 * review's P1 §8.5 for the normalisation that removes that).
 */
async function storedCriteriaMet(
  userId: number,
  taskSlug: string,
): Promise<string[]> {
  const rows = await db
    .select({ tasks: sdUserState.tasks })
    .from(sdUserState)
    .where(eq(sdUserState.user_id, userId))
    .limit(1);

  const tasks = (rows[0]?.tasks as Record<string, SdTaskState>) ?? {};
  return tasks[taskSlug]?.criteriaMet ?? [];
}

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

    const rateLimitedResponse = enforceInstanceRateLimit(
      taskLoadLimiter,
      userId,
    );
    if (rateLimitedResponse) return rateLimitedResponse;

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

    const rateLimitedResponse = enforceInstanceRateLimit(
      taskSaveLimiter,
      userId,
    );
    if (rateLimitedResponse) return rateLimitedResponse;

    // Before parsing: `req.json()` buffers the whole body, so a 50 MB payload
    // is read into memory before Zod can reject it.
    const declaredLength = Number(req.headers.get("content-length") ?? "");
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
      return payloadTooLarge(MAX_BODY_BYTES);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badJson();
    }

    const parsed = StateMutationSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    // Resolved before the simulation: deciding whether to simulate needs the
    // learner's stored criteria, and the engine must not run while holding a
    // transaction or one of the five pool slots.
    const userResult = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerk_id, userId))
      .limit(1);

    if (userResult.length === 0) return unauthorized();

    const user = userResult[0];

    let verifiedCriteriaMet: string[] = [];
    if (parsed.data.kind === "task-save") {
      const taskModule = await getModule(parsed.data.taskSlug);
      if (!taskModule || taskModule.kind !== "sim" || !taskModule.task) {
        return NextResponse.json(
          { error: "Unknown system-design task" },
          { status: 400 },
        );
      }
      const task = taskModule.task;

      const graphValidation = validateGraph(parsed.data.graph);
      if (!graphValidation.success) {
        return NextResponse.json(
          { error: "Invalid graph", details: graphValidation.errors },
          { status: 400 },
        );
      }

      const requestedCriteria = new Set(parsed.data.criteriaMet ?? []);
      const knownCriteria = new Set(
        task.passCriteria.map((criterion) => criterion.id),
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

      // `simulate()` is the expensive part of this route (~200–500 ms CPU),
      // and the client saves every 2 s of idle time. Only claimed criteria
      // that are not already earned need verifying, so autosaves and replayed
      // saves cost nothing. Criteria are still verified server-side — a
      // learner cannot forge a pass — and only ids verified here are merged.
      const pendingCriteria =
        requestedCriteria.size === 0
          ? []
          : criteriaNeedingVerification(
              requestedCriteria,
              await storedCriteriaMet(user.id, parsed.data.taskSlug),
            );

      if (pendingCriteria.length > 0) {
        const simulation = simulate(graphValidation.data, failures);
        verifiedCriteriaMet = simulation.valid
          ? task.passCriteria
              .filter(
                (criterion) =>
                  pendingCriteria.includes(criterion.id) &&
                  criterion.assert(simulation),
              )
              .map((criterion) => criterion.id)
          : [];
      }
    }

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
