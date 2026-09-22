import { cache } from "react";
import { db } from "@/config/db";
import { usersTable, enrollments, feedbackTickets } from "@/config/schema";
import { eq, and, or, desc, asc, count, like, inArray } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { createLogger } from "@/lib/logger";
import { withConnectRetry } from "@/lib/db-retry";

const log = createLogger("admin-users");

const ADMIN_USERS_PAGE_SIZE = 20;
const MAX_SEARCH_LENGTH = 100;
export const ADMIN_USERS_MAX_PAGE = 500;

export type AdminUsersSort = "newest" | "points" | "name";

type AdminUserBase = {
  id: number;
  clerk_id: string | null;
  name: string;
  email: string;
  bio: string | null;
  skills: unknown;
  points: number | null;
  subscription: string | null;
};

export type AdminUserRow = AdminUserBase & {
  enrollmentsCount: number;
  feedbackCount: number;
};

export type AdminUserDetail = AdminUserBase & {
  enrollmentsCount: number;
  feedbackCount: number;
};

export function clampAdminUsersPage(page: number): number {
  return Math.max(1, Math.min(ADMIN_USERS_MAX_PAGE, Math.floor(page) || 1));
}

function escapeLike(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

function truncateSearch(input: string): string {
  return input.slice(0, MAX_SEARCH_LENGTH);
}

/**
 * Admin: paginated users list with batched counts.
 * Free-tier safe: fixed LIMIT 20, escaped LIKE, whitelisted sorts,
 * batched count + inArray enrichment (no N+1).
 * Pending migration columns (created_at, is_banned) not referenced — zero migration cost.
 * Cost: 4 queries per page (count + rows in parallel, then 2 enrichments) — ~20-30 RU.
 */
export const getUsersPaginated = cache(
  async (opts: {
    q?: string;
    sort?: AdminUsersSort;
    subscription?: string;
    page?: number;
  }): Promise<{ data: AdminUserRow[]; total: number; hasMore: boolean }> => {
    try {
      return await withConnectRetry(async () => {
        const p = clampAdminUsersPage(opts.page ?? 1);
        const offset = (p - 1) * ADMIN_USERS_PAGE_SIZE;
        const sort: AdminUsersSort =
          opts.sort === "points" || opts.sort === "name" ? opts.sort : "newest";

        const conditions: SQL<unknown>[] = [];

        if (opts.q && opts.q.trim().length >= 2) {
          const safe = truncateSearch(escapeLike(opts.q.trim()));
          const orCondition = or(
            like(usersTable.name, `%${safe}%`),
            like(usersTable.email, `%${safe}%`),
          );
          if (orCondition) conditions.push(orCondition);
        }

        if (opts.subscription) {
          conditions.push(eq(usersTable.subscription, opts.subscription));
        }

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        const orderBy =
          sort === "points"
            ? [desc(usersTable.points), desc(usersTable.id)]
            : sort === "name"
              ? [asc(usersTable.name), desc(usersTable.id)]
              : [desc(usersTable.id)];

        const [countResult, rows] = await Promise.all([
          db.select({ value: count() }).from(usersTable).where(where),
          db
            .select({
              id: usersTable.id,
              clerk_id: usersTable.clerk_id,
              name: usersTable.name,
              email: usersTable.email,
              bio: usersTable.bio,
              skills: usersTable.skills,
              points: usersTable.points,
              subscription: usersTable.subscription,
            })
            .from(usersTable)
            .where(where)
            .orderBy(...orderBy)
            .limit(ADMIN_USERS_PAGE_SIZE)
            .offset(offset),
        ]);

        const total = Number(countResult[0]?.value ?? 0);

        if (rows.length === 0) {
          return { data: [], total, hasMore: false };
        }

        const ids = rows.map((r) => r.id);

        // Batched enrichment: counts per user (2 queries, not N)
        const [enrollCounts, feedbackCounts] = await Promise.all([
          db
            .select({ userId: enrollments.user_id, value: count() })
            .from(enrollments)
            .where(inArray(enrollments.user_id, ids))
            .groupBy(enrollments.user_id),
          db
            .select({ userId: feedbackTickets.user_id, value: count() })
            .from(feedbackTickets)
            .where(
              and(
                inArray(feedbackTickets.user_id, ids),
                eq(feedbackTickets.is_deleted, false),
              ),
            )
            .groupBy(feedbackTickets.user_id),
        ]);

        const enrollMap = new Map<number, number>(
          enrollCounts.map((r) => [r.userId, Number(r.value)]),
        );
        const feedbackMap = new Map<number, number>(
          feedbackCounts.map((r) => [r.userId, Number(r.value)]),
        );

        const data: AdminUserRow[] = rows.map((r) => ({
          id: r.id,
          clerk_id: r.clerk_id,
          name: r.name,
          email: r.email,
          bio: r.bio,
          skills: r.skills,
          points: r.points,
          subscription: r.subscription,
          enrollmentsCount: enrollMap.get(r.id) ?? 0,
          feedbackCount: feedbackMap.get(r.id) ?? 0,
        }));

        return { data, total, hasMore: offset + rows.length < total };
      });
    } catch (error) {
      log.error("getUsersPaginated failed", error, {
        sort: opts.sort,
        page: opts.page,
      });
      return { data: [], total: 0, hasMore: false };
    }
  },
);

/**
 * Admin: single user with counts. Returns null if not found.
 * Graceful degradation — returns null on DB failure after retry.
 */
export const getUserWithStats = cache(
  async (id: number): Promise<AdminUserDetail | null> => {
    if (!Number.isFinite(id) || id < 1) return null;

    try {
      return await withConnectRetry(async () => {
        const rows = await db
          .select({
            id: usersTable.id,
            clerk_id: usersTable.clerk_id,
            name: usersTable.name,
            email: usersTable.email,
            bio: usersTable.bio,
            skills: usersTable.skills,
            points: usersTable.points,
            subscription: usersTable.subscription,
          })
          .from(usersTable)
          .where(eq(usersTable.id, id))
          .limit(1);

        if (rows.length === 0) return null;
        const user = rows[0];

        const [enrollCount, feedbackCount] = await Promise.all([
          db
            .select({ value: count() })
            .from(enrollments)
            .where(eq(enrollments.user_id, id)),
          db
            .select({ value: count() })
            .from(feedbackTickets)
            .where(
              and(
                eq(feedbackTickets.user_id, id),
                eq(feedbackTickets.is_deleted, false),
              ),
            ),
        ]);

        return {
          id: user.id,
          clerk_id: user.clerk_id,
          name: user.name,
          email: user.email,
          bio: user.bio,
          skills: user.skills,
          points: user.points,
          subscription: user.subscription,
          enrollmentsCount: Number(enrollCount[0]?.value ?? 0),
          feedbackCount: Number(feedbackCount[0]?.value ?? 0),
        };
      });
    } catch (error) {
      log.error("getUserWithStats failed", error, { id });
      return null;
    }
  },
);


