import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Pool is tuned for TiDB free tier (5-connection limit).
// - connectTimeout bounds connection *establishment*; queue wait is bounded
//   by queueLimit — requests past 25 queued fail immediately instead of
//   queueing the site into a timeout spiral.
// - keepAlive keeps long-lived connections warm across cold-ish periods.
export const db = drizzle(
  mysql.createPool({
    uri: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: true },
    connectionLimit: 5,
    queueLimit: 25,
    connectTimeout: 5_000,
    waitForConnections: true,
    idleTimeout: 30_000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10_000,
  }),
);
