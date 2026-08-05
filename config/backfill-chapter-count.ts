import "dotenv/config";
import type { ResultSetHeader } from "mysql2";
import { db } from "./db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    const result = await db.execute(sql`
      UPDATE courses c
      SET chapter_count = (
        SELECT COUNT(*)
        FROM chapters ch
        WHERE ch.course_id = c.id
      )
    `);

    const header = Array.isArray(result)
      ? (result[0] as ResultSetHeader | undefined)
      : (result as ResultSetHeader);
    console.log(
      `Backfill complete — ${header?.affectedRows ?? 0} course(s) updated.`,
    );
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
