const WINDOW_1M = 60_000;

export type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

const routes: { pattern: string; method: string; config: RateLimitConfig }[] = [
  {
    pattern: "/api/interview/generate",
    method: "POST",
    config: { limit: 10, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/interview/questions",
    method: "GET",
    config: { limit: 30, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/interview/questions-by-tags",
    method: "POST",
    config: { limit: 20, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/interview/stack",
    method: "POST",
    config: { limit: 20, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/mentor/chat",
    method: "POST",
    config: { limit: 5, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/mentor/chat",
    method: "GET",
    config: { limit: 10, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/enroll",
    method: "POST",
    config: { limit: 5, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/enroll",
    method: "GET",
    config: { limit: 20, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/progress",
    method: "POST",
    config: { limit: 10, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/user",
    method: "POST",
    config: { limit: 10, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/user/profile",
    method: "GET",
    config: { limit: 20, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/user/profile",
    method: "PATCH",
    config: { limit: 10, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/feedback",
    method: "POST",
    config: { limit: 10, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/feedback",
    method: "GET",
    config: { limit: 30, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/admin/feedback",
    method: "GET",
    config: { limit: 30, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/admin/overview",
    method: "GET",
    config: { limit: 30, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/admin/users",
    method: "GET",
    config: { limit: 20, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/admin/users/[id]",
    method: "GET",
    config: { limit: 30, windowMs: WINDOW_1M },
  },
  {
    pattern: "/api/admin/users/[id]",
    method: "PATCH",
    config: { limit: 10, windowMs: WINDOW_1M },
  },
];

const defaultConfig: RateLimitConfig = { limit: 20, windowMs: WINDOW_1M };

export function getRateLimitConfig(
  pathname: string,
  method: string,
): RateLimitConfig {
  for (const route of routes) {
    if (route.pattern === pathname && route.method === method) {
      return route.config;
    }
  }
  return defaultConfig;
}
