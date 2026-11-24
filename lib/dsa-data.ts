import { db } from "@/config/db";
import { dsaUserState, usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import type { DsaTaskState, DsaUserState } from "@/config/dsa/types";

/**
 * Data access for DSA user progress. Mirrors `lib/system-design` data access
 * but keeps the simpler blob shape (`dsa_user_state` holds `lessons_completed`
 * + `tasks` JSON) chosen for the MVP. No per-task table yet.
 *
 * All functions take the DB user id (int), not the Clerk id. Route handlers
 * resolve Clerk → DB user before calling.
 */

export async function getDsaUserState(userId: number): Promise<DsaUserState> {
  const rows = await db
    .select({
      lessons_completed: dsaUserState.lessons_completed,
      tasks: dsaUserState.tasks,
    })
    .from(dsaUserState)
    .where(eq(dsaUserState.user_id, userId))
    .limit(1);

  return {
    lessonsCompleted: (rows[0]?.lessons_completed as string[]) ?? [],
    tasks: (rows[0]?.tasks as Record<string, DsaTaskState>) ?? {},
  };
}

export async function markLessonComplete(
  userId: number,
  lessonKey: string,
): Promise<{ alreadyCompleted: boolean; lessonsCompleted: string[] }> {
  const existing = await db
    .select({ lessons_completed: dsaUserState.lessons_completed })
    .from(dsaUserState)
    .where(eq(dsaUserState.user_id, userId))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(dsaUserState).values({
      user_id: userId,
      lessons_completed: [lessonKey],
      tasks: {},
      updated_at: new Date(),
    });
    return { alreadyCompleted: false, lessonsCompleted: [lessonKey] };
  }

  const completed = (existing[0].lessons_completed as string[]) ?? [];
  if (completed.includes(lessonKey)) {
    return { alreadyCompleted: true, lessonsCompleted: completed };
  }

  const next = [...completed, lessonKey];
  await db
    .update(dsaUserState)
    .set({ lessons_completed: next, updated_at: new Date() })
    .where(eq(dsaUserState.user_id, userId));

  return { alreadyCompleted: false, lessonsCompleted: next };
}

export async function getTaskState(
  userId: number,
  taskSlug: string,
): Promise<DsaTaskState | null> {
  const state = await getDsaUserState(userId);
  return state.tasks?.[taskSlug] ?? null;
}

export async function saveTaskState(
  userId: number,
  taskSlug: string,
  state: DsaTaskState,
): Promise<void> {
  const existing = await getDsaUserState(userId);
  const tasks = { ...(existing.tasks ?? {}), [taskSlug]: state };

  const row = await db
    .select({ user_id: dsaUserState.user_id })
    .from(dsaUserState)
    .where(eq(dsaUserState.user_id, userId))
    .limit(1);

  if (row.length === 0) {
    await db.insert(dsaUserState).values({
      user_id: userId,
      lessons_completed: [],
      tasks,
      updated_at: new Date(),
    });
  } else {
    await db
      .update(dsaUserState)
      .set({ tasks, updated_at: new Date() })
      .where(eq(dsaUserState.user_id, userId));
  }
}

// Re-export usersTable helper for route handlers that need the Clerk → DB lookup.
export { usersTable };
