import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = new URL(process.env.DATABASE_URL!);

export default defineConfig({
  schema: "./config/schema.tsx",
  dialect: "mysql",
  dbCredentials: {
    host: url.hostname,
    port: Number(url.port),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1).split("?")[0],
    ssl: { rejectUnauthorized: true },
  },
});
