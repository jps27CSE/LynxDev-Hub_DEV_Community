import type { Roadmap } from "./types";

export const fullStackRoadmap: Roadmap = {
  slug: "full-stack",
  title: "Full Stack Developer",
  description:
    "Step-by-step guide to becoming a modern full stack developer in 2026 — frontend, backend, databases, auth, and shipping end-to-end apps.",
  category: "fullstack",
  level: "beginner",
  updatedAt: "2026-10-15",
  estimatedHours: 200,
  tags: ["fullstack", "react", "node", "database", "auth", "deployment"],
  root: {
    id: "fs-root",
    title: "Full Stack Foundations",
    description: "Everything you need to build and ship a complete web app.",
    level: "beginner",
    resources: [{ type: "article", title: "roadmap.sh: Full Stack", url: "https://roadmap.sh/full-stack" }],
    children: [
      {
        id: "fs-frontend",
        title: "Frontend (React + TS)",
        description: "Build the UI. See the Frontend roadmap for depth.",
        level: "beginner",
        platformCourseTitle: "React",
        resources: [{ type: "article", title: "Frontend roadmap", url: "/roadmaps/frontend" }],
        children: [
          { id: "fs-html-css", title: "HTML & CSS", description: "Structure and styling.", level: "beginner", resources: [{ type: "docs", title: "MDN", url: "https://developer.mozilla.org/" }] },
          { id: "fs-js-ts", title: "JavaScript & TypeScript", description: "Language + types.", level: "beginner", platformCourseTitle: "TypeScript", resources: [{ type: "docs", title: "TypeScript", url: "https://www.typescriptlang.org/docs/" }] },
          { id: "fs-react", title: "React", description: "Components, state, routing.", level: "intermediate", platformCourseTitle: "React", resources: [{ type: "docs", title: "React", url: "https://react.dev/" }] },
        ],
      },
      {
        id: "fs-backend",
        title: "Backend (Node + API)",
        description: "Server, routes, business logic.",
        level: "beginner",
        platformCourseTitle: "Node.js",
        resources: [{ type: "article", title: "Backend roadmap", url: "/roadmaps/backend" }],
        children: [
          { id: "fs-http", title: "HTTP & REST", description: "Verbs, status codes, JSON.", level: "beginner", resources: [{ type: "article", title: "MDN HTTP", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" }] },
          { id: "fs-framework", title: "Web Framework (Express/Hono)", description: "Routing, middleware.", level: "beginner", resources: [{ type: "docs", title: "Express", url: "https://expressjs.com/" }] },
          { id: "fs-validation", title: "Validation (Zod)", description: "Validate at the boundary.", level: "intermediate", resources: [{ type: "docs", title: "Zod", url: "https://zod.dev/" }] },
        ],
      },
      {
        id: "fs-database",
        title: "Database & ORM",
        description: "Persist data; query efficiently.",
        level: "intermediate",
        platformCourseTitle: "SQL & Databases",
        resources: [],
        children: [
          { id: "fs-sql", title: "SQL", description: "Queries, joins, indexes.", level: "intermediate", resources: [{ type: "article", title: "SQLBolt", url: "https://sqlbolt.com/" }] },
          { id: "fs-orm", title: "ORM (Drizzle/Prisma)", description: "Schema + migrations.", level: "intermediate", resources: [{ type: "docs", title: "Drizzle", url: "https://orm.drizzle.team/" }] },
        ],
      },
      {
        id: "fs-auth",
        title: "Auth",
        description: "Sign-in, sessions, protected routes.",
        level: "intermediate",
        resources: [],
        children: [
          { id: "fs-auth-clerk", title: "Auth Provider (Clerk/Auth.js)", description: "Managed auth.", level: "intermediate", resources: [{ type: "docs", title: "Clerk", url: "https://clerk.com/docs" }] },
          { id: "fs-auth-jwt", title: "JWT & Sessions", description: "Tokens, cookies, CSRF.", level: "intermediate", optional: true, resources: [{ type: "article", title: "JWT intro", url: "https://jwt.io/introduction" }] },
        ],
      },
      {
        id: "fs-fullstack-fw",
        title: "Full-Stack Framework (Next.js)",
        description: "One framework for both sides.",
        level: "intermediate",
        resources: [{ type: "docs", title: "Next.js Docs", url: "https://nextjs.org/docs" }],
        children: [
          { id: "fs-ssr", title: "SSR / SSG / ISR", description: "Rendering strategies.", level: "intermediate", resources: [{ type: "docs", title: "Next.js Rendering", url: "https://nextjs.org/docs/app/building-your-application/rendering" }] },
          { id: "fs-server-actions", title: "Server Actions / Route Handlers", description: "Server-side mutations.", level: "intermediate", resources: [{ type: "docs", title: "Route Handlers", url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers" }] },
        ],
      },
      {
        id: "fs-testing",
        title: "Testing",
        description: "Unit + E2E across the stack.",
        level: "intermediate",
        resources: [],
        children: [
          { id: "fs-unit", title: "Unit Tests", description: "Vitest/Jest.", level: "intermediate", resources: [{ type: "docs", title: "Vitest", url: "https://vitest.dev/" }] },
          { id: "fs-e2e", title: "E2E (Playwright)", description: "Full user flows.", level: "advanced", optional: true, resources: [{ type: "docs", title: "Playwright", url: "https://playwright.dev/" }] },
        ],
      },
      {
        id: "fs-deploy",
        title: "Deployment",
        description: "Ship it.",
        level: "intermediate",
        resources: [],
        children: [
          { id: "fs-vercel", title: "Vercel / Hosting", description: "Deploy frontend + serverless.", level: "intermediate", resources: [{ type: "docs", title: "Vercel", url: "https://vercel.com/docs" }] },
          { id: "fs-env", title: "Env Vars & Secrets", description: "Config per environment.", level: "intermediate", resources: [{ type: "article", title: "12-factor config", url: "https://12factor.net/config" }] },
          { id: "fs-monitoring", title: "Monitoring & Logs", description: "Errors, metrics, alerts.", level: "advanced", optional: true, resources: [{ type: "article", title: "OpenTelemetry", url: "https://opentelemetry.io/docs/" }] },
        ],
      },
    ],
  },
};