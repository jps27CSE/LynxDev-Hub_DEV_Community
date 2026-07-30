export type RateLimitConfig = {
  limit: number;
  windowMs: number;
  keyBy: "user" | "ip";
};

const routes: { pattern: string; method: string; config: RateLimitConfig }[] = [
  { pattern: "/api/interview/generate", method: "POST", config: { limit: 10, windowMs: 60_000, keyBy: "ip" } },
  { pattern: "/api/interview/questions", method: "GET", config: { limit: 30, windowMs: 60_000, keyBy: "ip" } },
  { pattern: "/api/interview/questions-by-tags", method: "POST", config: { limit: 20, windowMs: 60_000, keyBy: "ip" } },
  { pattern: "/api/mentor/chat", method: "POST", config: { limit: 5, windowMs: 60_000, keyBy: "user" } },
  { pattern: "/api/mentor/chat", method: "GET", config: { limit: 10, windowMs: 60_000, keyBy: "user" } },
  { pattern: "/api/enroll", method: "POST", config: { limit: 5, windowMs: 60_000, keyBy: "user" } },
  { pattern: "/api/enroll", method: "GET", config: { limit: 20, windowMs: 60_000, keyBy: "user" } },
  { pattern: "/api/progress", method: "POST", config: { limit: 10, windowMs: 60_000, keyBy: "user" } },
  { pattern: "/api/user", method: "POST", config: { limit: 3, windowMs: 60_000, keyBy: "user" } },
  { pattern: "/api/user/profile", method: "GET", config: { limit: 20, windowMs: 60_000, keyBy: "user" } },
  { pattern: "/api/user/profile", method: "PATCH", config: { limit: 10, windowMs: 60_000, keyBy: "user" } },
];

const defaultConfig: RateLimitConfig = { limit: 20, windowMs: 60_000, keyBy: "ip" };

export function getRateLimitConfig(pathname: string, method: string): RateLimitConfig {
  for (const route of routes) {
    if (route.pattern === pathname && route.method === method) {
      return route.config;
    }
  }
  return defaultConfig;
}
