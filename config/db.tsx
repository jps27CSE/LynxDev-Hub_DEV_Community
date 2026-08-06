import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Pool is tuned for TiDB free tier (5-connection limit).
// - connectTimeout bounds connection *establishment*.
// - acquireTimeout bounds the *queue wait* before a pooled connection becomes
//   available — queued requests fail fast instead of stacking into a timeout
//   spiral. (Not in mysql2's PoolOptions typings, but honored at runtime.)
// - queueLimit is the backstop: requests past 25 queued fail immediately.
// - keepAlive keeps long-lived connections warm across cold-ish periods.
const poolConfig = {
  uri: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: true },
  connectionLimit: 5,
  queueLimit: 25,
  connectTimeout: 5_000,
  acquireTimeout: 5_000,
  waitForConnections: true,
  idleTimeout: 30_000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10_000,
} satisfies mysql.PoolOptions & { acquireTimeout: number };

export const db = drizzle(mysql.createPool(poolConfig));
