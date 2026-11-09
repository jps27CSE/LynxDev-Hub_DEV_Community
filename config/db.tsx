import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { countQuery } from "@/lib/request-log";

// Pool is tuned for TiDB free tier (5-connection limit).
// - connectTimeout bounds connection *establishment*. 15s covers TiDB
//   Serverless scale-to-zero cold starts (~10-15s wake); stays well under the
//   Vercel Hobby 60s function cap when combined with the retry in lib/db-retry.
// - queueLimit is the backstop: requests past 25 queued fail immediately.
// - idleTimeout 5 min + keepAlive keeps connections warm across dev gaps, so
//   cold starts happen rarely; idle connections cost 0 RU.
//
// `acquireTimeout` was removed. It was here to bound the *queue wait* before a
// pooled connection frees up, and the comment claimed it was "honored at
// runtime" despite not being in mysql2's PoolOptions typings. That claim was
// never verified and is false. mysql2 logs:
//
//   Ignoring invalid configuration option passed to Connection:
//   acquireTimeout. This is currently a warning, but in future versions
//   of MySQL2, an error will be thrown...
//
// So the 15s queue bound tracker I.5 credited for surviving TiDB cold starts
// was NOT being applied, and leaving the option in place would eventually
// turn into a hard error rather than a warning. Removing it is behaviourally
// a no-op today; what it removes is a false claim. Queued requests are still
// bounded by `queueLimit: 25`, and cold-start patience by the `connectTimeout`
// above plus `lib/db-retry`'s single retry.
//
// The `satisfies ... & { acquireTimeout: number }` widening existed only to
// appease the missing typing. With the option gone, it is not needed.
const poolConfig = {
  uri: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: true },
  connectionLimit: 5,
  queueLimit: 25,
  connectTimeout: 15_000,
  waitForConnections: true,
  idleTimeout: 300_000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10_000,
} satisfies mysql.PoolOptions;

export const db = drizzle(mysql.createPool(poolConfig), {
  logger: {
    logQuery() {
      countQuery();
    },
  },
});
