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
    resources: [
      {
        type: "article",
        title: "roadmap.sh: Full Stack",
        url: "https://roadmap.sh/full-stack",
      },
      {
        type: "docs",
        title: "Next.js: App Router",
        url: "https://nextjs.org/docs/app",
      },
      {
        type: "course",
        title: "React: Learn React",
        url: "https://react.dev/learn",
      },
    ],
    children: [
      {
        id: "fs-frontend",
        title: "Frontend (React + TS)",
        description: "Build the UI. See the Frontend roadmap for depth.",
        level: "beginner",
        platform: [
          { kind: "course", courseKey: "html" },
          { kind: "course", courseKey: "react" },
        ],
        resources: [
          {
            type: "article",
            title: "Frontend roadmap",
            url: "/roadmaps/frontend",
          },
          {
            type: "course",
            title: "web.dev: Learn CSS",
            url: "https://web.dev/learn/css",
          },
          {
            type: "article",
            title: "MDN: HTML basics",
            url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Creating_the_content",
          },
        ],
        children: [
          {
            id: "fs-html-css",
            title: "HTML & CSS",
            description: "Structure and styling.",
            level: "beginner",
            platform: [
              { kind: "course", courseKey: "html" },
              { kind: "course", courseKey: "css" },
            ],
            resources: [
              {
                type: "docs",
                title: "MDN",
                url: "https://developer.mozilla.org/",
              },
              {
                type: "course",
                title: "web.dev: Learn HTML",
                url: "https://web.dev/learn/html",
              },
              {
                type: "course",
                title: "web.dev: Learn CSS",
                url: "https://web.dev/learn/css",
              },
              {
                type: "docs",
                title: "MDN: CSS reference",
                url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
              },
              {
                type: "practice",
                title: "Flexbox Froggy",
                url: "https://flexboxfroggy.com/",
              },
            ],
          },
          {
            id: "fs-js-ts",
            title: "JavaScript & TypeScript",
            description: "Language + types.",
            level: "beginner",
            platform: [
              { kind: "course", courseKey: "javascript" },
              { kind: "course", courseKey: "typescript" },
            ],
            resources: [
              {
                type: "docs",
                title: "TypeScript",
                url: "https://www.typescriptlang.org/docs/",
              },
              {
                type: "course",
                title: "The Modern JavaScript Tutorial",
                url: "https://javascript.info/",
              },
              {
                type: "docs",
                title: "TypeScript Handbook",
                url: "https://www.typescriptlang.org/docs/handbook/intro.html",
              },
              {
                type: "docs",
                title: "MDN: JavaScript Guide",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
              },
            ],
          },
          {
            id: "fs-react",
            title: "React",
            description: "Components, state, routing.",
            level: "intermediate",
            platform: [{ kind: "course", courseKey: "react" }],
            resources: [
              { type: "docs", title: "React", url: "https://react.dev/" },
              {
                type: "course",
                title: "React: Learn React",
                url: "https://react.dev/learn",
              },
              {
                type: "docs",
                title: "React: API reference",
                url: "https://react.dev/reference/react",
              },
              {
                type: "article",
                title: "React: Thinking in React",
                url: "https://react.dev/learn/thinking-in-react",
              },
            ],
          },
        ],
      },
      {
        id: "fs-backend",
        title: "Backend (Node + API)",
        description: "Server, routes, business logic.",
        level: "beginner",
        platform: [{ kind: "course", courseKey: "node" }],
        resources: [
          {
            type: "article",
            title: "Backend roadmap",
            url: "/roadmaps/backend",
          },
          {
            type: "article",
            title: "MDN: An overview of HTTP",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
          },
          {
            type: "docs",
            title: "Node.js: Learn",
            url: "https://nodejs.org/en/learn",
          },
        ],
        children: [
          {
            id: "fs-http",
            title: "HTTP & REST",
            description: "Verbs, status codes, JSON.",
            level: "beginner",
            platform: [
              {
                kind: "lesson",
                title: "The contract before the code",
                href: "/system-design/api-and-contracts/lesson/the-contract-before-the-code",
              },
            ],
            resources: [
              {
                type: "article",
                title: "MDN HTTP",
                url: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
              },
              {
                type: "docs",
                title: "MDN: HTTP methods",
                url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods",
              },
              {
                type: "docs",
                title: "MDN: HTTP status codes",
                url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
              },
              {
                type: "article",
                title: "Microsoft: Web API design",
                url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design",
              },
            ],
          },
          {
            id: "fs-framework",
            title: "Web Framework (Express/Hono)",
            description: "Routing, middleware.",
            level: "beginner",
            platform: [{ kind: "course", courseKey: "node" }],
            resources: [
              { type: "docs", title: "Express", url: "https://expressjs.com/" },
              {
                type: "docs",
                title: "Express: Routing",
                url: "https://expressjs.com/en/guide/routing.html",
              },
              {
                type: "docs",
                title: "Hono: Getting started",
                url: "https://hono.dev/docs/getting-started/basic",
              },
              {
                type: "docs",
                title: "Fastify: Getting started",
                url: "https://fastify.dev/docs/latest/Guides/Getting-Started/",
              },
            ],
          },
          {
            id: "fs-validation",
            title: "Validation (Zod)",
            description: "Validate at the boundary.",
            level: "intermediate",
            resources: [
              { type: "docs", title: "Zod", url: "https://zod.dev/" },
              {
                type: "docs",
                title: "Zod: Basic usage",
                url: "https://zod.dev/basics",
              },
              {
                type: "docs",
                title: "OWASP: Input validation cheat sheet",
                url: "https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html",
              },
            ],
          },
        ],
      },
      {
        id: "fs-database",
        title: "Database & ORM",
        description: "Persist data; query efficiently.",
        level: "intermediate",
        platform: [{ kind: "course", courseKey: "sql" }],
        resources: [
          {
            type: "practice",
            title: "SQLBolt: Interactive SQL lessons",
            url: "https://sqlbolt.com/",
          },
          {
            type: "article",
            title: "Use The Index, Luke",
            url: "https://use-the-index-luke.com/",
          },
        ],
        children: [
          {
            id: "fs-sql",
            title: "SQL",
            description: "Queries, joins, indexes.",
            level: "intermediate",
            platform: [{ kind: "course", courseKey: "sql" }],
            resources: [
              {
                type: "article",
                title: "SQLBolt",
                url: "https://sqlbolt.com/",
              },
              {
                type: "docs",
                title: "PostgreSQL: Tutorial",
                url: "https://www.postgresql.org/docs/current/tutorial.html",
              },
              {
                type: "practice",
                title: "PostgreSQL Exercises",
                url: "https://pgexercises.com/",
              },
            ],
          },
          {
            id: "fs-orm",
            title: "ORM (Drizzle/Prisma)",
            description: "Schema + migrations.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "Drizzle",
                url: "https://orm.drizzle.team/",
              },
              {
                type: "docs",
                title: "Drizzle ORM: Overview",
                url: "https://orm.drizzle.team/docs/overview",
              },
              {
                type: "docs",
                title: "Prisma: Introduction",
                url: "https://www.prisma.io/docs/orm/overview/introduction",
              },
              {
                type: "docs",
                title: "Drizzle: Queries",
                url: "https://orm.drizzle.team/docs/data-querying",
              },
            ],
          },
        ],
      },
      {
        id: "fs-auth",
        title: "Auth",
        description: "Sign-in, sessions, protected routes.",
        level: "intermediate",
        platform: [
          {
            kind: "lesson",
            title: "Who you are vs what you may do",
            href: "/system-design/api-and-contracts/lesson/who-are-you-vs-what-may-you-do",
          },
        ],
        resources: [
          {
            type: "docs",
            title: "OWASP: Authentication cheat sheet",
            url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
          },
          {
            type: "docs",
            title: "Auth.js: Getting started",
            url: "https://authjs.dev/getting-started",
          },
          {
            type: "docs",
            title: "Clerk: Quickstart",
            url: "https://clerk.com/docs/quickstarts",
          },
        ],
        children: [
          {
            id: "fs-auth-clerk",
            title: "Auth Provider (Clerk/Auth.js)",
            description: "Managed auth.",
            level: "intermediate",
            resources: [
              { type: "docs", title: "Clerk", url: "https://clerk.com/docs" },
              {
                type: "docs",
                title: "Clerk: Quickstart",
                url: "https://clerk.com/docs/quickstarts",
              },
              {
                type: "docs",
                title: "Auth.js: Getting started",
                url: "https://authjs.dev/getting-started",
              },
              {
                type: "docs",
                title: "Clerk: Next.js App Router",
                url: "https://clerk.com/docs/quickstarts/nextjs",
              },
            ],
          },
          {
            id: "fs-auth-jwt",
            title: "JWT & Sessions",
            description: "Tokens, cookies, CSRF.",
            level: "intermediate",
            optional: true,
            resources: [
              {
                type: "article",
                title: "JWT intro",
                url: "https://www.jwt.io/introduction",
              },
              {
                type: "docs",
                title: "OWASP: Session management cheat sheet",
                url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html",
              },
              {
                type: "docs",
                title: "OAuth 2.0: RFC 6749",
                url: "https://datatracker.ietf.org/doc/html/rfc6749",
              },
            ],
          },
        ],
      },
      {
        id: "fs-fullstack-fw",
        title: "Full-Stack Framework (Next.js)",
        description: "One framework for both sides.",
        level: "intermediate",
        resources: [
          {
            type: "docs",
            title: "Next.js Docs",
            url: "https://nextjs.org/docs",
          },
          {
            type: "docs",
            title: "Next.js: App Router",
            url: "https://nextjs.org/docs/app",
          },
          {
            type: "article",
            title: "Next.js: Server and client components",
            url: "https://nextjs.org/docs/app/getting-started/server-and-client-components",
          },
        ],
        children: [
          {
            id: "fs-ssr",
            title: "SSR / SSG / ISR",
            description: "Rendering strategies.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "Next.js Rendering",
                url: "https://nextjs.org/docs/app/building-your-application/rendering",
              },
              {
                type: "article",
                title: "web.dev: Rendering on the web",
                url: "https://web.dev/articles/rendering-on-the-web",
              },
              {
                type: "docs",
                title: "Next.js: Caching",
                url: "https://nextjs.org/docs/app/getting-started/caching",
              },
            ],
          },
          {
            id: "fs-server-actions",
            title: "Server Actions / Route Handlers",
            description: "Server-side mutations.",
            level: "intermediate",
            platform: [
              {
                kind: "lesson",
                title: "Idempotent writes",
                href: "/system-design/api-and-contracts/lesson/idempotent-writes",
              },
            ],
            resources: [
              {
                type: "docs",
                title: "Route Handlers",
                url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers",
              },
              {
                type: "docs",
                title: "Next.js: Server Actions",
                url: "https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations",
              },
              {
                type: "docs",
                title: "Next.js: Route Handlers",
                url: "https://nextjs.org/docs/app/api-reference/file-conventions/route",
              },
              {
                type: "article",
                title: "React: Server Functions",
                url: "https://react.dev/reference/rsc/server-functions",
              },
            ],
          },
        ],
      },
      {
        id: "fs-testing",
        title: "Testing",
        description: "Unit + E2E across the stack.",
        level: "intermediate",
        resources: [
          {
            type: "article",
            title: "Martin Fowler: The practical test pyramid",
            url: "https://martinfowler.com/articles/practical-test-pyramid.html",
          },
          {
            type: "docs",
            title: "Vitest: Getting started",
            url: "https://vitest.dev/guide/",
          },
          {
            type: "docs",
            title: "Playwright: Introduction",
            url: "https://playwright.dev/docs/intro",
          },
        ],
        children: [
          {
            id: "fs-unit",
            title: "Unit Tests",
            description: "Vitest/Jest.",
            level: "intermediate",
            resources: [
              { type: "docs", title: "Vitest", url: "https://vitest.dev/" },
              {
                type: "docs",
                title: "Vitest: Getting started",
                url: "https://vitest.dev/guide/",
              },
              {
                type: "docs",
                title: "React Testing Library: Intro",
                url: "https://testing-library.com/docs/react-testing-library/intro/",
              },
              {
                type: "docs",
                title: "Node.js: Test runner",
                url: "https://nodejs.org/api/test.html",
              },
            ],
          },
          {
            id: "fs-e2e",
            title: "E2E (Playwright)",
            description: "Full user flows.",
            level: "advanced",
            optional: true,
            resources: [
              {
                type: "docs",
                title: "Playwright",
                url: "https://playwright.dev/",
              },
              {
                type: "docs",
                title: "Playwright: Introduction",
                url: "https://playwright.dev/docs/intro",
              },
              {
                type: "docs",
                title: "Playwright: Best practices",
                url: "https://playwright.dev/docs/best-practices",
              },
              {
                type: "docs",
                title: "Cypress: Getting started",
                url: "https://docs.cypress.io/app/get-started/why-cypress",
              },
            ],
          },
        ],
      },
      {
        id: "fs-deploy",
        title: "Deployment",
        description: "Ship it.",
        level: "intermediate",
        resources: [
          {
            type: "docs",
            title: "Vercel: Documentation",
            url: "https://vercel.com/docs",
          },
          {
            type: "article",
            title: "The Twelve-Factor App",
            url: "https://12factor.net/",
          },
        ],
        children: [
          {
            id: "fs-vercel",
            title: "Vercel / Hosting",
            description: "Deploy frontend + serverless.",
            level: "intermediate",
            resources: [
              { type: "docs", title: "Vercel", url: "https://vercel.com/docs" },
              {
                type: "docs",
                title: "Vercel: Deployments overview",
                url: "https://vercel.com/docs/deployments/overview",
              },
              {
                type: "docs",
                title: "Vercel: Next.js on Vercel",
                url: "https://vercel.com/docs/frameworks/nextjs",
              },
              {
                type: "docs",
                title: "Netlify: Documentation",
                url: "https://docs.netlify.com/",
              },
            ],
          },
          {
            id: "fs-env",
            title: "Env Vars & Secrets",
            description: "Config per environment.",
            level: "intermediate",
            resources: [
              {
                type: "article",
                title: "12-factor config",
                url: "https://12factor.net/config",
              },
              {
                type: "docs",
                title: "Vercel: Environment variables",
                url: "https://vercel.com/docs/environment-variables",
              },
              {
                type: "docs",
                title: "OWASP: Secrets management cheat sheet",
                url: "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html",
              },
            ],
          },
          {
            id: "fs-monitoring",
            title: "Monitoring & Logs",
            description: "Errors, metrics, alerts.",
            level: "advanced",
            optional: true,
            platform: [
              {
                kind: "lesson",
                title: "The dashboard that said everything was fine",
                href: "/system-design/how-systems-fail/lesson/logging-monitoring-and-traces",
              },
            ],
            resources: [
              {
                type: "article",
                title: "OpenTelemetry",
                url: "https://opentelemetry.io/docs/",
              },
              {
                type: "docs",
                title: "Vercel: Observability",
                url: "https://vercel.com/docs/observability",
              },
              {
                type: "article",
                title: "Google SRE: Monitoring distributed systems",
                url: "https://sre.google/sre-book/monitoring-distributed-systems/",
              },
            ],
          },
        ],
      },
    ],
  },
};
