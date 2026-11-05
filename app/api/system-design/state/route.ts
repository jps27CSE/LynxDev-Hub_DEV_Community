import { z } from "zod/v4";
import { db } from "@/config/db";
import { sdUserState, sdTaskState, usersTable } from "@/config/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
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
import { createLogger, SLOW_SIM_THRESHOLD_MS } from "@/lib/logger";
import { getRateLimitConfig } from "@/config/rate-limits";
import { withRequestLog } from "@/lib/request-log";
import { withQueryTimeout } from "@/lib/db-retry";
import { SdGraphSchema, validateGraph } from "@/lib/system-design/validation";
import { criteriaNeedingVerification } from "@/lib/system-design/criteria";
import { getModule } from "@/config/system-design/registry";
import { simulate } from "@/lib/system-design/engine";
import type { SdTaskState } from "@/config/system-design/types";

const log = createLogger("system-design-state");

/**
 * Cap the function at 10 s so a hung DB statement fails fast instead of
 * holding a pool slot (connectionLimit: 5) to the Vercel function cap.
 * Matches the Hobby-tier default; set explicitly so the intent is documented.
 */
export const maxDuration = 10;

/**
 * Largest body this route will read. A schema-valid task-save (40 nodes,
 * 120 edges) tops out near 40 KB, so 64 KB is headroom, not a
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
 * One row per (user, task) in `sd_task_state`. Replaces the single JSON blob
 * `sd_user_state.tasks`, which rewrote all 15 tasks on every save.
 */
function buildTasksObject(
  rows: Array<{
    task_slug: string;
    graph: unknown;
    criteria_met: unknown;
    attempts: number | null;
    revealed: unknown;
    updated_at: Date | null;
  }>,
): Record<string, SdTaskState> {
  const tasks: Record<string, SdTaskState> = {};
  for (const row of rows) {
    tasks[row.task_slug] = {
      graph: row.graph as SdTaskState["graph"],
      criteriaMet: (row.criteria_met as string[]) ?? [],
      attempts: row.attempts ?? 0,
      revealed: (row.revealed as string[]) ?? [],
      updatedAt: row.updated_at?.toISOString() ?? new Date().toISOString(),
    };
  }
  return tasks;
}

/**
 * One-time, idempotent migration from the legacy `sd_user_state.tasks` JSON
 * blob into per-task rows. Runs on the first request after deploy for each
 * user; after that `sd_task_state` is the source of truth and this is a no-op.
 *
 * Per-task rather than all-at-once so a partial failure (e.g. a duplicate key
 * from a race) leaves the user in a recoverable state instead of half-migrated.
 */
async function migrateLegacyTasks(userId: number): Promise<void> {
  const legacy = await db
    .select({ tasks: sdUserState.tasks })
    .from(sdUserState)
    .where(eq(sdUserState.user_id, userId))
    .limit(1);
  const tasks = (legacy[0]?.tasks as Record<string, SdTaskState>) ?? {};
  if (Object.keys(tasks).length === 0) return;

  for (const [slug, state] of Object.entries(tasks)) {
    const existing = await db
      .select({ id: sdTaskState.id })
      .from(sdTaskState)
      .where(
        and(eq(sdTaskState.user_id, userId), eq(sdTaskState.task_slug, slug)),
      )
      .limit(1);
    if (existing.length > 0) continue;
    try {
      await db.insert(sdTaskState).values({
        user_id: userId,
        task_slug: slug,
        graph: state.graph,
        criteria_met: state.criteriaMet ?? [],
        attempts: state.attempts ?? 0,
        revealed: state.revealed ?? [],
        updated_at: state.updatedAt ? new Date(state.updatedAt) : new Date(),
      });
    } catch {
      // Duplicate-key race or a malformed legacy row: skip, the next request
      // retries. Never throw out of a migration helper into the request path.
    }
  }

  // Clear the legacy blob so we stop paying to read/write it. Safe because
  // every task that could be migrated has been (or skipped as a duplicate).
  try {
    await db
      .update(sdUserState)
      .set({ tasks: null, updated_at: new Date() })
      .where(eq(sdUserState.user_id, userId));
  } catch {
    // Non-fatal: the legacy column is deprecated; leaving it populated just
    // wastes a read on the next migration check.
  }
}

/**
 * Criteria this learner has already earned for a task.
 *
 * Read before the simulation so a save that claims nothing new never runs the
 * engine. Now a single-row point read on `sd_task_state` instead of reading
 * the whole 15-task blob.
 */
async function storedCriteriaMet(
  userId: number,
  taskSlug: string,
): Promise<string[]> {
  const rows = await withQueryTimeout(() =>
    db
      .select({ criteria_met: sdTaskState.criteria_met })
      .from(sdTaskState)
      .where(
        and(
          eq(sdTaskState.user_id, userId),
          eq(sdTaskState.task_slug, taskSlug),
        ),
      )
      .limit(1),
  );

  return (rows[0]?.criteria_met as string[]) ?? [];
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
    // Client's last-known server timestamp for this task. Used for conflict
    // detection: if the server's copy is newer, return 409 with the server
    // state so the client can merge instead of overwriting.
    updatedAt: z.string().datetime().optional(),
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

    const userResult = await withQueryTimeout(() =>
      db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.clerk_id, userId))
        .limit(1),
    );

    if (userResult.length === 0) return unauthorized();

    const user = userResult[0];

    // Lazy, idempotent migration from the legacy JSON blob.
    await migrateLegacyTasks(user.id);

    const lessonsResult = await withQueryTimeout(() =>
      db
        .select({ lessons_completed: sdUserState.lessons_completed })
        .from(sdUserState)
        .where(eq(sdUserState.user_id, user.id))
        .limit(1),
    );

    const lessonsCompleted =
      (lessonsResult[0]?.lessons_completed as string[]) ?? [];

    const taskRows = await withQueryTimeout(() =>
      db.select().from(sdTaskState).where(eq(sdTaskState.user_id, user.id)),
    );

    const tasks = buildTasksObject(taskRows);

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
    const userResult = await withQueryTimeout(() =>
      db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.clerk_id, userId))
        .limit(1),
    );

    if (userResult.length === 0) return unauthorized();

    const user = userResult[0];

    // Lazy migration so a brand-new deploy never reads stale legacy data.
    await migrateLegacyTasks(user.id);

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

      // Conflict detection: if the server's copy is newer than what the client
      // last saw, return 409 with the server state so the client can merge
      // instead of overwriting. Only triggers when the client sends an
      // updatedAt (i.e. after the first successful save).
      const clientUpdatedAt = parsed.data.updatedAt;
      if (clientUpdatedAt && parsed.data.kind === "task-save") {
        const conflictTaskSlug = parsed.data.taskSlug;
        const conflictRows = await withQueryTimeout(() =>
          db
            .select()
            .from(sdTaskState)
            .where(
              and(
                eq(sdTaskState.user_id, user.id),
                eq(sdTaskState.task_slug, conflictTaskSlug),
              ),
            )
            .limit(1),
        );
        const serverTask = conflictRows[0];
        if (
          serverTask?.updated_at &&
          new Date(serverTask.updated_at).getTime() >
            new Date(clientUpdatedAt).getTime()
        ) {
          const lessonsResult = await withQueryTimeout(() =>
            db
              .select({ lessons_completed: sdUserState.lessons_completed })
              .from(sdUserState)
              .where(eq(sdUserState.user_id, user.id))
              .limit(1),
          );
          const lessonsCompleted =
            (lessonsResult[0]?.lessons_completed as string[]) ?? [];
          const taskRows = await withQueryTimeout(() =>
            db
              .select()
              .from(sdTaskState)
              .where(eq(sdTaskState.user_id, user.id)),
          );
          const tasks = buildTasksObject(taskRows);
          return NextResponse.json(
            { lessonsCompleted, tasks, conflict: true },
            { status: 409 },
          );
        }
      }

      const pendingCriteria =
        requestedCriteria.size === 0
          ? []
          : criteriaNeedingVerification(
              requestedCriteria,
              await storedCriteriaMet(user.id, parsed.data.taskSlug),
            );

      if (pendingCriteria.length > 0) {
        const simStart = performance.now();
        const simulation = simulate(graphValidation.data, failures);
        const simMs = performance.now() - simStart;
        const arrivals = graphValidation.data.scenario.arrivalRate * 10;
        log.info("simulation", {
          taskSlug: parsed.data.taskSlug,
          ms: Math.round(simMs),
          arrivals,
          criteriaClaimed: pendingCriteria.length,
          criteriaVerified: simulation.valid
            ? task.passCriteria.filter(
                (criterion) =>
                  pendingCriteria.includes(criterion.id) &&
                  criterion.assert(simulation),
              ).length
            : 0,
          valid: simulation.valid,
        });
        if (simMs > SLOW_SIM_THRESHOLD_MS) {
          log.warn("slow simulation", {
            taskSlug: parsed.data.taskSlug,
            ms: Math.round(simMs),
            arrivals,
          });
        }
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

    const now = new Date();

    const result = await withQueryTimeout(() =>
      db.transaction(async (tx) => {
        if (parsed.data.kind === "lesson-complete") {
          const { slug } = parsed.data;
          const existing = await tx
            .select({ lessons_completed: sdUserState.lessons_completed })
            .from(sdUserState)
            .where(eq(sdUserState.user_id, user.id))
            .limit(1);

          let lessonsCompleted: string[] = [];
          if (existing.length > 0) {
            lessonsCompleted =
              (existing[0].lessons_completed as string[]) ?? [];
            if (!lessonsCompleted.includes(slug)) lessonsCompleted.push(slug);
            await tx
              .update(sdUserState)
              .set({ lessons_completed: lessonsCompleted, updated_at: now })
              .where(eq(sdUserState.user_id, user.id));
          } else {
            lessonsCompleted = [slug];
            await tx.insert(sdUserState).values({
              user_id: user.id,
              lessons_completed: lessonsCompleted,
              updated_at: now,
            });
          }

          const taskRows = await tx
            .select()
            .from(sdTaskState)
            .where(eq(sdTaskState.user_id, user.id));
          const tasks = buildTasksObject(taskRows);

          return { lessonsCompleted, tasks };
        }

        // task-save
        const { taskSlug, graph } = parsed.data;
        const existingTaskRows = await tx
          .select()
          .from(sdTaskState)
          .where(
            and(
              eq(sdTaskState.user_id, user.id),
              eq(sdTaskState.task_slug, taskSlug),
            ),
          )
          .limit(1);
        const existingTask = existingTaskRows[0];

        const existingCriteriaMet =
          (existingTask?.criteria_met as string[]) ?? [];
        const criteriaMet = [
          ...new Set([...existingCriteriaMet, ...verifiedCriteriaMet]),
        ];
        const attempts = Math.max(
          existingTask?.attempts ?? 0,
          parsed.data.attempts ?? 0,
        );
        const revealed = [
          ...new Set([
            ...((existingTask?.revealed as string[]) ?? []),
            ...(parsed.data.revealed ?? []),
          ]),
        ];

        if (existingTask) {
          await tx
            .update(sdTaskState)
            .set({
              graph,
              criteria_met: criteriaMet,
              attempts,
              revealed,
              updated_at: now,
            })
            .where(eq(sdTaskState.id, existingTask.id));
        } else {
          await tx.insert(sdTaskState).values({
            user_id: user.id,
            task_slug: taskSlug,
            graph,
            criteria_met: criteriaMet,
            attempts,
            revealed,
            updated_at: now,
          });
        }

        const lessonsResult = await tx
          .select({ lessons_completed: sdUserState.lessons_completed })
          .from(sdUserState)
          .where(eq(sdUserState.user_id, user.id))
          .limit(1);
        const lessonsCompleted =
          (lessonsResult[0]?.lessons_completed as string[]) ?? [];

        const taskRows = await tx
          .select()
          .from(sdTaskState)
          .where(eq(sdTaskState.user_id, user.id));
        const tasks = buildTasksObject(taskRows);

        return { lessonsCompleted, tasks };
      }),
    );

    return NextResponse.json(result);
  });
}
