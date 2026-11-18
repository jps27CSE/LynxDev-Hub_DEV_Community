import type { Roadmap } from "./types";

export const backendRoadmap: Roadmap = {
  slug: "backend",
  title: "Backend Developer",
  description:
    "Step-by-step guide to becoming a modern backend developer in 2026 — from HTTP and a first API to databases, auth, caching, queues, and production deployment.",
  category: "backend",
  level: "beginner",
  updatedAt: "2026-10-15",
  estimatedHours: 160,
  tags: ["http", "api", "node", "database", "auth", "caching", "devops"],
  root: {
    id: "be-root",
    title: "Backend Fundamentals",
    description: "The foundations of server-side development.",
    level: "beginner",
    resources: [
      {
        type: "article",
        title: "roadmap.sh: Backend",
        url: "https://roadmap.sh/backend",
      },
      {
        type: "article",
        title: "MDN: An overview of HTTP",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
      },
      {
        type: "article",
        title: "The Twelve-Factor App",
        url: "https://12factor.net/",
      },
    ],
    children: [
      {
        id: "internet",
        title: "Internet & HTTP",
        description:
          "How the web works: DNS, TCP, HTTP/1.1 vs HTTP/2, status codes, headers.",
        level: "beginner",
        resources: [
          {
            type: "article",
            title: "MDN: HTTP",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
          },
          {
            type: "article",
            title: "MDN: An overview of HTTP",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
          },
          {
            type: "docs",
            title: "MDN: HTTP response status codes",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
          },
          {
            type: "docs",
            title: "MDN: HTTP headers",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers",
          },
          {
            type: "article",
            title: "MDN: DNS",
            url: "https://developer.mozilla.org/en-US/docs/Glossary/DNS",
          },
        ],
      },
      {
        id: "language",
        title: "Pick a Language",
        description:
          "Node.js/TypeScript, Python, Go, Java, or C#. Pick one and go deep.",
        level: "beginner",
        resources: [
          {
            type: "docs",
            title: "Node.js Docs",
            url: "https://nodejs.org/en/docs",
          },
          {
            type: "docs",
            title: "Node.js: Learn",
            url: "https://nodejs.org/en/learn",
          },
          {
            type: "docs",
            title: "Python: Tutorial",
            url: "https://docs.python.org/3/tutorial/",
          },
        ],
        children: [
          {
            id: "nodejs",
            title: "Node.js & npm",
            description: "Event loop, modules, npm, package.json.",
            level: "beginner",
            platformCourseTitle: "Node.js",
            resources: [
              {
                type: "docs",
                title: "Node.js Guide",
                url: "https://nodejs.org/en/learn",
              },
              {
                type: "docs",
                title: "Node.js: The event loop",
                url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick",
              },
              {
                type: "docs",
                title: "npm: package.json reference",
                url: "https://docs.npmjs.com/cli/v10/configuring-npm/package-json",
              },
              {
                type: "docs",
                title: "Node.js: ECMAScript modules",
                url: "https://nodejs.org/api/esm.html",
              },
            ],
          },
          {
            id: "typescript-be",
            title: "TypeScript on the Server",
            description: "Types for safer backend code.",
            level: "intermediate",
            optional: true,
            platformCourseTitle: "TypeScript",
            resources: [
              {
                type: "docs",
                title: "TypeScript Handbook",
                url: "https://www.typescriptlang.org/docs/handbook/intro.html",
              },
              {
                type: "docs",
                title: "TS: Everyday Types",
                url: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
              },
              {
                type: "docs",
                title: "TS: Narrowing",
                url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
              },
              {
                type: "practice",
                title: "TypeScript Playground",
                url: "https://www.typescriptlang.org/play",
              },
            ],
          },
        ],
      },
      {
        id: "apis",
        title: "APIs & Web Frameworks",
        description: "REST, routing, middleware, request/response lifecycle.",
        level: "beginner",
        resources: [
          {
            type: "article",
            title: "Microsoft: REST API design best practices",
            url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design",
          },
          {
            type: "docs",
            title: "OpenAPI Specification",
            url: "https://spec.openapis.org/oas/latest.html",
          },
        ],
        children: [
          {
            id: "rest",
            title: "RESTful APIs",
            description:
              "Resources, HTTP verbs, status codes, pagination, versioning.",
            level: "beginner",
            resources: [
              {
                type: "article",
                title: "REST API Tutorial",
                url: "https://restfulapi.net/",
              },
              {
                type: "article",
                title: "Microsoft: Web API design",
                url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design",
              },
              {
                type: "docs",
                title: "MDN: HTTP methods",
                url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods",
              },
              {
                type: "article",
                title: "Google: API design guide",
                url: "https://cloud.google.com/apis/design",
              },
            ],
          },
          {
            id: "express-fastify",
            title: "Express / Fastify / Hono",
            description:
              "Pick a framework and learn middleware, routing, error handling.",
            level: "beginner",
            resources: [
              {
                type: "docs",
                title: "Express Guide",
                url: "https://expressjs.com/en/guide/routing.html",
              },
              {
                type: "docs",
                title: "Fastify: Getting started",
                url: "https://fastify.dev/docs/latest/Guides/Getting-Started/",
              },
              {
                type: "docs",
                title: "Hono: Getting started",
                url: "https://hono.dev/docs/getting-started/basic",
              },
            ],
          },
          {
            id: "validation",
            title: "Input Validation",
            description:
              "Zod / Joi / class-validator — validate at the boundary.",
            level: "intermediate",
            resources: [
              { type: "docs", title: "Zod", url: "https://zod.dev/" },
              {
                type: "docs",
                title: "OWASP: Input validation cheat sheet",
                url: "https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html",
              },
              {
                type: "docs",
                title: "Joi: Documentation",
                url: "https://joi.dev/",
              },
            ],
          },
        ],
      },
      {
        id: "databases",
        title: "Databases",
        description: "Relational vs NoSQL, modeling, queries, migrations.",
        level: "intermediate",
        platformCourseTitle: "SQL & Databases",
        resources: [
          {
            type: "article",
            title: "PostgreSQL: Documentation",
            url: "https://www.postgresql.org/docs/current/",
          },
          {
            type: "article",
            title: "Use The Index, Luke: SQL indexing",
            url: "https://use-the-index-luke.com/",
          },
        ],
        children: [
          {
            id: "sql",
            title: "SQL & Relational DBs",
            description: "SELECT, JOINs, indexes, transactions, normalization.",
            level: "intermediate",
            resources: [
              {
                type: "article",
                title: "SQLBolt",
                url: "https://sqlbolt.com/",
              },
              {
                type: "docs",
                title: "PostgreSQL Docs",
                url: "https://www.postgresql.org/docs/",
              },
              {
                type: "docs",
                title: "PostgreSQL: Tutorial",
                url: "https://www.postgresql.org/docs/current/tutorial.html",
              },
              {
                type: "article",
                title: "Use The Index, Luke",
                url: "https://use-the-index-luke.com/",
              },
              {
                type: "practice",
                title: "PostgreSQL Exercises",
                url: "https://pgexercises.com/",
              },
            ],
          },
          {
            id: "orm",
            title: "ORMs (Drizzle / Prisma)",
            description: "Schema-as-code, migrations, query builders.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "Drizzle ORM",
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
                type: "article",
                title: "Prisma: Why Prisma?",
                url: "https://www.prisma.io/docs/orm/overview/introduction/why-prisma",
              },
            ],
          },
          {
            id: "nosql",
            title: "NoSQL (MongoDB, Redis)",
            description: "Document stores and key-value caches.",
            level: "intermediate",
            optional: true,
            resources: [
              {
                type: "docs",
                title: "Redis Docs",
                url: "https://redis.io/docs/",
              },
              {
                type: "docs",
                title: "MongoDB: Manual introduction",
                url: "https://www.mongodb.com/docs/manual/introduction/",
              },
              {
                type: "docs",
                title: "Redis: Documentation",
                url: "https://redis.io/docs/latest/",
              },
              {
                type: "article",
                title: "Martin Fowler: NoSQL databases",
                url: "https://martinfowler.com/nosql.html",
              },
            ],
          },
        ],
      },
      {
        id: "auth",
        title: "Authentication & Authorization",
        description: "Sessions, JWT, OAuth, RBAC.",
        level: "intermediate",
        resources: [
          {
            type: "article",
            title: "OWASP: Authentication cheat sheet",
            url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
          },
          {
            type: "docs",
            title: "OWASP: Authorization cheat sheet",
            url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",
          },
        ],
        children: [
          {
            id: "auth-basics",
            title: "Sessions vs JWT",
            description: "Trade-offs, storage, expiry, refresh tokens.",
            level: "intermediate",
            resources: [
              {
                type: "article",
                title: "JWT.io",
                url: "https://www.jwt.io/introduction",
              },
              {
                type: "docs",
                title: "OWASP: Session management cheat sheet",
                url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html",
              },
              {
                type: "docs",
                title: "Auth0: Refresh token rotation",
                url: "https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation",
              },
            ],
          },
          {
            id: "oauth",
            title: "OAuth 2.0 & OpenID Connect",
            description: "Third-party login flows.",
            level: "intermediate",
            resources: [
              {
                type: "article",
                title: "OAuth 2.0 Simplified",
                url: "https://aaronparecki.com/oauth-2-simplified/",
              },
              {
                type: "docs",
                title: "OAuth 2.0: RFC 6749",
                url: "https://datatracker.ietf.org/doc/html/rfc6749",
              },
              {
                type: "docs",
                title: "OpenID Connect Core",
                url: "https://openid.net/specs/openid-connect-core-1_0.html",
              },
              {
                type: "article",
                title: "Auth0: OAuth 2.0 overview",
                url: "https://auth0.com/docs/authenticate/protocols/oauth",
              },
            ],
          },
          {
            id: "rbac",
            title: "RBAC & Permissions",
            description: "Roles, scopes, policy enforcement.",
            level: "advanced",
            optional: true,
            resources: [
              {
                type: "article",
                title: "RBAC",
                url: "https://auth0.com/docs/manage-users/access-control/rbac",
              },
              {
                type: "docs",
                title: "OWASP: Access control cheat sheet",
                url: "https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html",
              },
              {
                type: "article",
                title: "NIST: Role-based access control",
                url: "https://csrc.nist.gov/projects/role-based-access-control",
              },
            ],
          },
        ],
      },
      {
        id: "caching",
        title: "Caching",
        description: "In-memory, Redis, HTTP caching, cache invalidation.",
        level: "intermediate",
        resources: [
          {
            type: "article",
            title: "Caching strategies",
            url: "https://aws.amazon.com/caching/",
          },
          {
            type: "docs",
            title: "MDN: HTTP caching",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching",
          },
          {
            type: "docs",
            title: "Redis: Client-side caching",
            url: "https://redis.io/docs/latest/develop/reference/client-side-caching/",
          },
          {
            type: "article",
            title: "web.dev: HTTP cache",
            url: "https://web.dev/articles/http-cache",
          },
        ],
      },
      {
        id: "messaging",
        title: "Messaging & Queues",
        description: "Async work, event-driven architecture.",
        level: "advanced",
        optional: true,
        resources: [
          {
            type: "article",
            title: "microservices.io: Messaging patterns",
            url: "https://microservices.io/patterns/communication-style/messaging.html",
          },
          {
            type: "docs",
            title: "RabbitMQ: Tutorials",
            url: "https://www.rabbitmq.com/tutorials",
          },
        ],
        children: [
          {
            id: "queues",
            title: "Message Queues (RabbitMQ, SQS, BullMQ)",
            description: "Producers, consumers, retries, DLQs.",
            level: "advanced",
            resources: [
              { type: "docs", title: "BullMQ", url: "https://docs.bullmq.io/" },
              {
                type: "docs",
                title: "RabbitMQ: AMQP 0-9-1 concepts",
                url: "https://www.rabbitmq.com/tutorials/amqp-concepts",
              },
              {
                type: "docs",
                title: "AWS: SQS developer guide",
                url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html",
              },
            ],
          },
          {
            id: "events",
            title: "Event-Driven Architecture",
            description: "Pub/sub, event sourcing basics.",
            level: "advanced",
            optional: true,
            resources: [
              {
                type: "article",
                title: "EDA",
                url: "https://martinfowler.com/articles/201701-event-driven.html",
              },
              {
                type: "article",
                title: "microservices.io: Event-driven architecture",
                url: "https://microservices.io/patterns/data/event-driven-architecture.html",
              },
              {
                type: "article",
                title: "Martin Fowler: Event sourcing",
                url: "https://martinfowler.com/eaaDev/EventSourcing.html",
              },
            ],
          },
        ],
      },
      {
        id: "security",
        title: "Security",
        description: "OWASP Top 10, secrets, input validation, rate limiting.",
        level: "intermediate",
        resources: [
          {
            type: "article",
            title: "OWASP Top 10",
            url: "https://owasp.org/www-project-top-ten/",
          },
          {
            type: "docs",
            title: "OWASP: SQL injection prevention",
            url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
          },
          {
            type: "docs",
            title: "OWASP: Secrets management cheat sheet",
            url: "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html",
          },
        ],
      },
      {
        id: "testing-be",
        title: "Testing",
        description: "Unit, integration, and API tests.",
        level: "intermediate",
        resources: [
          {
            type: "docs",
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
            title: "Playwright: API testing",
            url: "https://playwright.dev/docs/api-testing",
          },
        ],
        children: [
          {
            id: "unit-be",
            title: "Unit Tests",
            description: "Jest / Vitest for business logic.",
            level: "intermediate",
            resources: [
              { type: "docs", title: "Vitest", url: "https://vitest.dev/" },
              {
                type: "docs",
                title: "Node.js: Test runner",
                url: "https://nodejs.org/api/test.html",
              },
              {
                type: "docs",
                title: "Vitest: Getting started",
                url: "https://vitest.dev/guide/",
              },
              {
                type: "article",
                title: "Kent C. Dodds: Testing implementation details",
                url: "https://kentcdodds.com/blog/testing-implementation-details",
              },
            ],
          },
          {
            id: "api-tests",
            title: "API / Integration Tests",
            description: "Supertest against a real server.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "Supertest",
                url: "https://github.com/ladjs/supertest",
              },
              {
                type: "docs",
                title: "Playwright: API testing",
                url: "https://playwright.dev/docs/api-testing",
              },
              {
                type: "article",
                title: "martinfowler.com: Integration tests",
                url: "https://martinfowler.com/bliki/IntegrationTest.html",
              },
            ],
          },
        ],
      },
      {
        id: "deployment-be",
        title: "Deployment & DevOps",
        description: "Containers, CI/CD, observability.",
        level: "advanced",
        resources: [
          {
            type: "article",
            title: "The Twelve-Factor App",
            url: "https://12factor.net/",
          },
          {
            type: "docs",
            title: "Docker: Get started",
            url: "https://docs.docker.com/get-started/",
          },
          {
            type: "docs",
            title: "OpenTelemetry: Documentation",
            url: "https://opentelemetry.io/docs/",
          },
        ],
        children: [
          {
            id: "docker",
            title: "Docker & Containers",
            description: "Images, containers, compose, registries.",
            level: "advanced",
            resources: [
              {
                type: "docs",
                title: "Docker Docs",
                url: "https://docs.docker.com/",
              },
              {
                type: "docs",
                title: "Docker: Get started",
                url: "https://docs.docker.com/get-started/",
              },
              {
                type: "docs",
                title: "Dockerfile reference",
                url: "https://docs.docker.com/reference/dockerfile/",
              },
              {
                type: "article",
                title: "Docker: Best practices for Node.js",
                url: "https://docs.docker.com/guides/nodejs/containerize/",
              },
            ],
          },
          {
            id: "cicd-be",
            title: "CI/CD Pipelines",
            description: "GitHub Actions, tests on PR, auto-deploy.",
            level: "advanced",
            resources: [
              {
                type: "docs",
                title: "GitHub Actions",
                url: "https://docs.github.com/en/actions",
              },
              {
                type: "docs",
                title: "GitHub Actions: Quickstart",
                url: "https://docs.github.com/en/actions/quickstart",
              },
              {
                type: "docs",
                title: "GitHub Actions: Workflow syntax",
                url: "https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax",
              },
            ],
          },
          {
            id: "observability",
            title: "Logging & Observability",
            description: "Structured logs, metrics, tracing, alerting.",
            level: "advanced",
            optional: true,
            resources: [
              {
                type: "article",
                title: "OpenTelemetry",
                url: "https://opentelemetry.io/docs/",
              },
              {
                type: "article",
                title: "Google SRE: Monitoring distributed systems",
                url: "https://sre.google/sre-book/monitoring-distributed-systems/",
              },
              {
                type: "docs",
                title: "Pino: Documentation",
                url: "https://getpino.io/#/",
              },
            ],
          },
        ],
      },
    ],
  },
};
