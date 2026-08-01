import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

export const db = drizzle(
  mysql.createPool({
    uri: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: true },
    connectionLimit: 5,
    queueLimit: 25,
    waitForConnections: true,
    idleTimeout: 30_000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10_000,
  }),
);
