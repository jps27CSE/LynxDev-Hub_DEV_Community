import { cache } from "react";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { createLogger } from "@/lib/logger";
import { withConnectRetry } from "@/lib/db-retry";

const log = createLogger("user-lookup");

/**
 * Resolve a Clerk user id to the integer DB user id.
 * Returns null when no DB row exists. Throws on DB failure (after one
 * connect-error retry) so API routes can return a JSON 500 instead of
 * degrading a missing user into a misleading 404.
 */
export async function getDbUserIdByClerkId(
  clerkId: string,
): Promise<number | null> {
  try {
    return await withConnectRetry(async () => {
      const rows = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.clerk_id, clerkId))
        .limit(1);
      return rows[0]?.id ?? null;
    });
  } catch (error) {
    log.error("getDbUserIdByClerkId failed", error);
    throw error;
  }
}

/**
 * Resolve a Clerk user id to a human-readable label for display.
 *
 * `site_notices.updated_by` stores the Clerk id because that is the stable,
 * immutable audit fact — a display name can change, an id cannot. But handing
 * an admin a raw `user_38cB23Lu...` answers "who published this?" with a
 * string they cannot use. So the id stays in the column and is resolved here,
 * at read time.
 *
 * Degrades to null on DB failure rather than throwing: this feeds an audit
 * caption, and a missing name must never take down the page that is about to
 * let someone overwrite the notice.
 */
export const getUserLabelByClerkId = cache(
  async (clerkId: string): Promise<string | null> => {
    try {
      const rows = await withConnectRetry(async () => {
        return await db
          .select({ name: usersTable.name, email: usersTable.email })
          .from(usersTable)
          .where(eq(usersTable.clerk_id, clerkId))
          .limit(1);
      });
      const user = rows[0];
      if (!user) return null;
      // name and email are notNull, but notNull is not non-empty — Clerk
      // accounts can exist with a blank name. `||` alone would return "" and
      // the caller renders `label ?? id`, which does not catch an empty
      // string. Trim, then treat blank as absent.
      const name = user.name?.trim();
      const email = user.email?.trim();
      return name || email || null;
    } catch (error) {
      // Opaque id, not PII — a prefix is enough to correlate, and the same
      // value is already returned to the admin in the response body.
      log.error("getUserLabelByClerkId failed", error, {
        clerkId: clerkId.slice(0, 12),
      });
      return null;
    }
  },
);
