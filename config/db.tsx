import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { countQuery } from "@/lib/request-log";

// Pool is tuned for TiDB free tier (5-connection limit).
// - connectTimeout bounds connection *establishment*. 15s covers TiDB
//   Serverless scale-to-zero cold starts (~10-15s wake); stays well under the
//   Vercel Hobby 60s function cap when combined with the retry in lib/db-retry.
// - acquireTimeout bounds the *queue wait* before a pooled connection becomes
//   available — queued requests wait through the cold start instead of failing
//   early. (Not in mysql2's PoolOptions typings, but honored at runtime.)
// - queueLimit is the backstop: requests past 25 queued fail immediately.
// - idleTimeout 5 min + keepAlive keeps connections warm across dev gaps, so
//   cold starts happen rarely; idle connections cost 0 RU.
const poolConfig = {
  uri: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: true },
  connectionLimit: 5,
  queueLimit: 25,
  connectTimeout: 15_000,
  acquireTimeout: 15_000,
  waitForConnections: true,
  idleTimeout: 300_000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10_000,
} satisfies mysql.PoolOptions & { acquireTimeout: number };

export const db = drizzle(mysql.createPool(poolConfig), {
  logger: {
    logQuery() {
      countQuery();
    },
  },
});
