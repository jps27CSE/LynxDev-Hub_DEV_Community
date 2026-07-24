import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

export const db = drizzle(
  mysql.createPool({
    uri: process.env.DATABASE_URL!,
    ssl: {
      rejectUnauthorized: true,
    },
  })
);
