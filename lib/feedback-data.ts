import { cache } from "react";
import { db } from "@/config/db";
import {
  feedbackTickets,
  usersTable,
  enrollments,
  courses,
  chapters,
  problems,
} from "@/config/schema";
import { eq, and, desc, count, like, sql, type InferSelectModel } from "drizzle-orm";
import { createLogger } from "@/lib/logger";
import { withConnectRetry } from "@/lib/db-retry";

const log = createLogger("feedback-data");

const PAGE_SIZE = 20;
const MAX_SEARCH_LENGTH = 100;

export type FeedbackTicket = InferSelectModel<typeof feedbackTickets>;

export type FeedbackTicketWithUser = FeedbackTicket & {
  authorName: string;
  authorEmail: string;
};

export type AdminOverview = {
  users: number;
  enrollments: number;
  courses: number;
  chapters: number;
  problems: number;
  openTickets: number;
};

export const FEEDBACK_MAX_PAGE = 500;

export function clampPage(page: number): number {
  return Math.max(1, Math.min(FEEDBACK_MAX_PAGE, Math.floor(page) || 1));
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
 * Create a feedback ticket. Returns the created row.
 * TiDB MySQL: no .returning(), so we insert + LAST_INSERT_ID() + re-select.
 */
export async function createFeedback(
  userId: number,
  data: { title: string; message: string; category?: string },
): Promise<FeedbackTicket | null> {
  try {
    return await withConnectRetry(async () => {
      return await db.transaction(async (tx) => {
        await tx.insert(feedbackTickets).values({
          user_id: userId,
          title: data.title,
          message: data.message,
          category: data.category ?? "other",
        });

        const rows = await tx.execute(
          sql`SELECT LAST_INSERT_ID() AS id`,
        );
        const result = rows as unknown as Array<Array<{ id: number }>>;
        const insertedId = result[0]?.[0]?.id;
        if (!insertedId) return null;

        const [created] = await tx
          .select()
          .from(feedbackTickets)
          .where(eq(feedbackTickets.id, insertedId))
          .limit(1);

        if (created) {
          log.info("created", { id: created.id, userId, category: created.category });
        }
        return created ?? null;
      });
    });
  } catch (error) {
    log.error("createFeedback failed", error);
    return null;
  }
}

/**
 * Get current user's own tickets, paginated.
 * Uses composite index: feedback_user_idx(user_id, is_deleted, created_at)
 * — covers WHERE user_id = ? and ORDER BY created_at DESC.
 */
export const getMyFeedback = cache(
  async (
    userId: number,
    page: number,
  ): Promise<{ data: FeedbackTicket[]; total: number; hasMore: boolean }> => {
    try {
      return await withConnectRetry(async () => {
        const p = clampPage(page);
        const offset = (p - 1) * PAGE_SIZE;

        const where = and(eq(feedbackTickets.user_id, userId), eq(feedbackTickets.is_deleted, false));

        const [countResult, rows] = await Promise.all([
          db
            .select({ value: count() })
            .from(feedbackTickets)
            .where(where),
          db
            .select()
            .from(feedbackTickets)
            .where(where)
            .orderBy(desc(feedbackTickets.created_at))
            .limit(PAGE_SIZE)
            .offset(offset),
        ]);

        const total = Number(countResult[0]?.value ?? 0);
        return { data: rows, total, hasMore: offset + rows.length < total };
      });
    } catch (error) {
      log.error("getMyFeedback failed", error);
      return { data: [], total: 0, hasMore: false };
    }
  },
);

/**
 * Admin: get all tickets with user info, filtered, paginated.
 * Uses composite index: feedback_admin_list_idx(status, created_at).
 */
export const getAllFeedback = cache(
  async (opts: {
    status?: string;
    category?: string;
    q?: string;
    page?: number;
  }): Promise<{
    data: FeedbackTicketWithUser[];
    total: number;
    hasMore: boolean;
  }> => {
    try {
      return await withConnectRetry(async () => {
        const p = clampPage(opts.page ?? 1);
        const offset = (p - 1) * PAGE_SIZE;

        const conditions = [eq(feedbackTickets.is_deleted, false)];

        if (opts.status) {
          conditions.push(eq(feedbackTickets.status, opts.status));
        }
        if (opts.category) {
          conditions.push(eq(feedbackTickets.category, opts.category));
        }
        if (opts.q) {
          const safe = truncateSearch(escapeLike(opts.q));
          conditions.push(like(feedbackTickets.title, `%${safe}%`));
        }

        const where = and(...conditions);

        const [countResult, rows] = await Promise.all([
          db
            .select({ value: count() })
            .from(feedbackTickets)
            .where(where),
          db
            .select({
              ticket: feedbackTickets,
              authorName: usersTable.name,
              authorEmail: usersTable.email,
            })
            .from(feedbackTickets)
            .innerJoin(
              usersTable,
              eq(feedbackTickets.user_id, usersTable.id),
            )
            .where(where)
            .orderBy(desc(feedbackTickets.created_at))
            .limit(PAGE_SIZE)
            .offset(offset),
        ]);

        const total = Number(countResult[0]?.value ?? 0);
        const data = rows.map((r) => ({
          ...r.ticket,
          authorName: r.authorName,
          authorEmail: r.authorEmail,
        }));
        return { data, total, hasMore: offset + rows.length < total };
      });
    } catch (error) {
      log.error("getAllFeedback failed", error);
      return { data: [], total: 0, hasMore: false };
    }
  },
);

/**
 * Get a single ticket with user info. Returns null if not found.
 */
export const getFeedbackById = cache(
  async (id: number): Promise<FeedbackTicketWithUser | null> => {
    try {
      return await withConnectRetry(async () => {
        const rows = await db
          .select({
            ticket: feedbackTickets,
            authorName: usersTable.name,
            authorEmail: usersTable.email,
          })
          .from(feedbackTickets)
          .innerJoin(
            usersTable,
            eq(feedbackTickets.user_id, usersTable.id),
          )
            .where(and(eq(feedbackTickets.id, id), eq(feedbackTickets.is_deleted, false)))
            .limit(1);

        if (rows.length === 0) return null;
        const r = rows[0];
        return {
          ...r.ticket,
          authorName: r.authorName,
          authorEmail: r.authorEmail,
        };
      });
    } catch (error) {
      log.error("getFeedbackById failed", error);
      return null;
    }
  },
);

/**
 * Admin: update ticket status and optional admin notes.
 * Only sets resolved_at on transition TO resolved/closed (preserves audit trail).
 */
export async function updateFeedbackStatus(
  id: number,
  status: string,
  adminNotes?: string,
  adminId?: string,
): Promise<FeedbackTicket | null> {
  try {
    return await withConnectRetry(async () => {
      return await db.transaction(async (tx) => {
        const [current] = await tx
          .select({ status: feedbackTickets.status })
          .from(feedbackTickets)
          .where(and(eq(feedbackTickets.id, id), eq(feedbackTickets.is_deleted, false)))
          .limit(1);

        if (!current) return null;

        const isResolving =
          status === "resolved" || status === "closed";
        const wasNotResolved =
          current?.status !== "resolved" && current?.status !== "closed";
        const setResolvedAt = isResolving && wasNotResolved;

        await tx
          .update(feedbackTickets)
          .set({
            status,
            // Drizzle skips undefined — only set notes if provided
            ...(adminNotes !== undefined && { admin_notes: adminNotes }),
            ...(setResolvedAt && { resolved_at: new Date() }),
          })
          .where(and(eq(feedbackTickets.id, id), eq(feedbackTickets.is_deleted, false)));

        const [updated] = await tx
          .select()
          .from(feedbackTickets)
          .where(and(eq(feedbackTickets.id, id), eq(feedbackTickets.is_deleted, false)))
          .limit(1);

        if (updated) {
          log.info("status_changed", { id, from: current.status, to: status, adminId });
        }
        return updated ?? null;
      });
    });
  } catch (error) {
    log.error("updateFeedbackStatus failed", error);
    return null;
  }
}

/**
 * Admin: permanently delete a resolved/closed ticket.
 * Only tickets with status "resolved" or "closed" can be hard-deleted.
 * Unsolved tickets must not be removed from the database.
 */
export async function deleteFeedback(id: number, adminId?: string): Promise<boolean> {
  try {
    return await withConnectRetry(async () => {
      const [current] = await db
        .select({ status: feedbackTickets.status })
        .from(feedbackTickets)
        .where(eq(feedbackTickets.id, id))
        .limit(1);

      if (!current) return false;
      if (current.status !== "resolved" && current.status !== "closed") return false;

      await db
        .delete(feedbackTickets)
        .where(eq(feedbackTickets.id, id));
      log.warn("deleted", { id, status: current.status, adminId });
      return true;
    });
  } catch (error) {
    log.error("deleteFeedback failed", error);
    return false;
  }
}

/**
 * Admin: overview stats — 6 batched count queries.
 * Uses Promise.all for parallel execution (pool queue handles concurrency).
 */
export const getAdminOverview = cache(
  async (): Promise<AdminOverview> => {
    try {
      return await withConnectRetry(async () => {
        const results = await Promise.all([
          db.select({ value: count() }).from(usersTable),
          db.select({ value: count() }).from(enrollments),
          db.select({ value: count() }).from(courses),
          db.select({ value: count() }).from(chapters),
          db.select({ value: count() }).from(problems),
          db
            .select({ value: count() })
            .from(feedbackTickets)
            .where(and(eq(feedbackTickets.status, "open"), eq(feedbackTickets.is_deleted, false))),
        ]);

        return {
          users: Number(results[0][0]?.value ?? 0),
          enrollments: Number(results[1][0]?.value ?? 0),
          courses: Number(results[2][0]?.value ?? 0),
          chapters: Number(results[3][0]?.value ?? 0),
          problems: Number(results[4][0]?.value ?? 0),
          openTickets: Number(results[5][0]?.value ?? 0),
        };
      });
    } catch (error) {
      log.error("getAdminOverview failed", error);
      return {
        users: 0,
        enrollments: 0,
        courses: 0,
        chapters: 0,
        problems: 0,
        openTickets: 0,
      };
    }
  },
);
