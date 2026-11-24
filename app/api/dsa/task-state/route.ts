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
  serverError,
} from "@/lib/api-error";
import { createLogger } from "@/lib/logger";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import { withRequestLog } from "@/lib/request-log";
import { getTaskState, saveTaskState } from "@/lib/dsa-data";
import type { DsaTaskState } from "@/config/dsa/types";

const log = createLogger("api/dsa/task-state");

const TaskStateSchema = z.object({
  taskSlug: z.string().min(1).max(120),
  data: z.unknown(),
  completedSteps: z.array(z.string().min(1).max(120)).max(200).default([]),
  criteriaMet: z.array(z.string().min(1).max(120)).max(200).default([]),
  attempts: z.number().int().min(0).max(1_000_000).default(0),
  revealed: z.array(z.string().min(1).max(120)).max(200).default([]),
  updatedAt: z.string().optional(),
});

const GetSchema = z.object({
  taskSlug: z.string().min(1).max(120),
});

export async function GET(req: NextRequest) {
  return withRequestLog("GET /api/dsa/task-state", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const limited = await enforceDbRateLimit(
      userId,
      "dsa-task-state",
      "/api/dsa/task-state",
      "GET",
    );
    if (limited) return limited;

    const taskSlug = req.nextUrl.searchParams.get("taskSlug");
    const parsed = GetSchema.safeParse({ taskSlug });
    if (!parsed.success) return validationError(parsed.error);

    try {
      const users = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.clerk_id, userId))
        .limit(1);
      if (users.length === 0) return unauthorized();

      const state = await getTaskState(users[0].id, parsed.data.taskSlug);
      return NextResponse.json({ state });
    } catch (error) {
      log.error("failed to load dsa task state", error);
      return serverError("Failed to load task state");
    }
  });
}

export async function POST(req: NextRequest) {
  return withRequestLog("POST /api/dsa/task-state", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const limited = await enforceDbRateLimit(
      userId,
      "dsa-task-state",
      "/api/dsa/task-state",
      "POST",
    );
    if (limited) return limited;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badJson();
    }

    const parsed = TaskStateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { taskSlug, data, completedSteps, criteriaMet, attempts, revealed } =
      parsed.data;

    const state: DsaTaskState = {
      data,
      completedSteps,
      criteriaMet,
      attempts,
      revealed,
      updatedAt: parsed.data.updatedAt ?? new Date().toISOString(),
    };

    try {
      const users = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.clerk_id, userId))
        .limit(1);
      if (users.length === 0) return unauthorized();

      await saveTaskState(users[0].id, taskSlug, state);
      return NextResponse.json({ saved: true });
    } catch (error) {
      log.error("failed to save dsa task state", error);
      return serverError("Failed to save task state");
    }
  });
}
