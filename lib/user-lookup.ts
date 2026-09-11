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
