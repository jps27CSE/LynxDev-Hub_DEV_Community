# LynxDev

<p align="center">
  <img src="public/logo.png" alt="LynxDev Logo" width="120" height="120">
</p>

<p align="center">
  <strong>A free developer community & learning platform</strong><br>
  Courses • Interview Prep • DSA Problems • AI Mentor • Engineering Blog
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript 5"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss" alt="Tailwind v4"></a>
  <a href="https://github.com/clerk/clerk"><img src="https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk" alt="Clerk Auth"></a>
  <a href="https://www.tidbcloud.com/"><img src="https://img.shields.io/badge/Database-TiDB-FF6B35?logo=tiktok" alt="TiDB"></a>
  <a href="https://drizzle.team/"><img src="https://img.shields.io/badge/ORM-Drizzle-C5F74F?logo=drizzle" alt="Drizzle ORM"></a>
  <br>
  <a href="https://github.com/vercel/next.js/actions"><img src="https://github.com/jps27CSE/LynxDev-Hub_DEV_Community/actions/workflows/ci.yml/badge.svg" alt="CI Status"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License"></a>
  <a href="https://github.com/jps27CSE/LynxDev-Hub_DEV_Community"><img src="https://img.shields.io/badge/Version-1.1.0-blue" alt="Version 1.1.0"></a>
</p>

---

## What is LynxDev?

**LynxDev** is a free, open-source developer community and learning platform built for web developers at every stage — from learning the basics to preparing for senior interviews.

We believe high-quality developer education shouldn't cost a fortune. Every feature runs on **free-tier infrastructure** (Vercel, TiDB Cloud, Clerk, Mistral AI) with **zero vendor lock-in**. We ship incrementally, measure everything, and document our architecture decisions so you can learn from our mistakes.

**Target audience:** Junior to mid-level web developers, bootcamp graduates, self-taught developers, and anyone preparing for technical interviews.

**Core philosophy:**

- 🆓 **Zero cost** — everything runs on generous free tiers
- 🔓 **Zero vendor lock-in** — abstract external services behind thin wrappers
- 🚀 **Incremental delivery** — ship working features in phases, don't over-engineer
- 🔒 **Security by default** — CSP, rate limiting, proxy auth, schema drift gates
- 📚 **Documentation as code** — architecture decisions, gap reports, and lessons learned live in the repo

---

## Features Overview

| Feature                 | Route                               | Description                                              |
| ----------------------- | ----------------------------------- | -------------------------------------------------------- |
| 🔐 **Authentication**   | `/sign-in`                          | Clerk (Email, Google, GitHub) with middleware protection |
| 📊 **Dashboard**        | `/dashboard`                        | Stats, enrolled courses, progress, daily tips            |
| 📚 **Courses**          | `/courses`, `/learn/[id]/[chapter]` | Structured curriculum with Monaco code editor            |
| 🎯 **Interview Prep**   | `/interview/*`                      | 6 categories, 1000+ questions, custom practice           |
| 🧩 **DSA Problems**     | `/problems/*`                       | 220+ problems, Monaco editor, run-only execution         |
| 🤖 **AI Mentor**        | `/mentor`                           | Mistral AI streaming chat with user context              |
| 📝 **Engineering Blog** | `/blog/*`                           | 5 deep technical posts, SEO, OG images, TOC              |
| ⚙️ **Admin Panel**      | `/admin/*`                          | Users, feedback, site notices, site-wide banners         |

---

## Tech Stack

| Layer             | Choice                                | Why                                          |
| ----------------- | ------------------------------------- | -------------------------------------------- |
| **Framework**     | Next.js 16 (App Router)               | Server Components, Server Actions, Turbopack |
| **UI**            | React 19, Tailwind v4, shadcn/ui (NY) | Modern, accessible, composable               |
| **Auth**          | Clerk                                 | Free tier, middleware, org support           |
| **Database**      | TiDB Cloud (MySQL) + Drizzle ORM      | Serverless, free tier, type-safe             |
| **AI**            | Mistral AI                            | Streaming chat, free tier                    |
| **Editor**        | Monaco Editor                         | VS Code engine, sandboxed iframe             |
| **UI Primitives** | Radix UI + shadcn/ui (NY)             | Accessible, composable, themeable            |
| **Testing**       | `node:test` + `tsx`                   | Zero deps, `@/` aliases, 45 tests            |
| **CI/CD**         | GitHub Actions                        | 7-step pipeline, audit + drift gates         |

---

## Architecture

```mermaid
graph TD
    A[User Browser] --> B[Next.js 16 App Router]
    B --> C[Clerk Middleware\nproxy.ts]
    C --> D{isPublicRoute?}
    D -->|Yes| E[Public Routes\n/, /blog, /whats-new]
    D -->|No| F[auth.protect()\nClerk Session]
    F --> G[Server Components\n(routes)]
    G --> H[Turbopack + Turbopack Cache]
    G --> I[Drizzle ORM\nTiDB Cloud]
    G --> J[Mistral AI\nStreaming Chat]
    G --> K[Monaco Editor\nSandboxed iframe]
    G --> L[Vercel Analytics\nSpeed Insights]

    M[Cron Job] --> N[/api/cron/cleanup\nRate-limit cleanup]
    N --> I

    O[Admin] --> P[Site Notices\nUsers\nFeedback]
    P --> I

    style C fill:#f9f,stroke:#333
    style I fill:#bbf,stroke:#333
    style J fill:#bfb,stroke:#333
    style K fill:#fbb,stroke:#333
```

**Key boundaries:**

- **Server Components by default** — only add `"use client"` for hooks/events/browser APIs
- **Proxy (`proxy.ts`) is the auth boundary** — runs `auth.protect()` before any handler
- **Server Actions for mutations** — forms, enrollments, progress updates
- **Server Components = data fetching boundary** — pass data down via props

---

## Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- pnpm (recommended) or npm
- Git
- TiDB Cloud account (free tier)
- Clerk account (free tier)
- Mistral AI account (free tier)

### Installation

```bash
# Clone the repo
git clone https://github.com/jps27CSE/LynxDev-Hub_DEV_Community.git
cd LynxDev-Hub_DEV_Community

# Install dependencies
pnpm install  # or npm install

# Copy environment template
cp .env.example .env

# Fill in your .env values (see below)

# Run database migrations
pnpm exec drizzle-kit migrate

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
# Clerk (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# TiDB Cloud (https://tidbcloud.com)
# Format: mysql://user:password@host:4000/dbname
DATABASE_URL=

# Admin access (fail-closed allowlist)
ADMIN_EMAILS=
ADMIN_CLERK_IDS=

# AI Mentor (https://console.mistral.ai)
MISTRAL_API_KEY=

# Cron (generate with: openssl rand -hex 32)
CRON_SECRET=

# Feature flags
MENTOR_ENABLED=true
SITE_NOTICE_DISABLED=false

# YouTube (optional, for homepage carousel)
# YOUTUBE_PLAYLIST_ID=
```

### Database Setup

```bash
# Generate migrations from schema
pnpm exec drizzle-kit generate

# Apply migrations
pnpm exec drizzle-kit migrate

# Verify
pnpm exec drizzle-kit studio
```

---

## Project Structure

```
.
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Public auth routes (Clerk)
│   │   └── sign-in/
│   ├── (routes)/                 # Protected routes (auth required)
│   │   ├── _components/          # Shared route components
│   │   ├── courses/              # Course catalog & learning
│   │   ├── dashboard/            # User dashboard
│   │   ├── editor/               # Code editor
│   │   ├── interview/            # Interview prep
│   │   ├── learn/                # Course chapters
│   │   ├── mentor/               # AI mentor chat
│   │   ├── problems/             # DSA problems
│   │   ├── profile/              # User profile
│   │   └── layout.tsx            # Protected layout
│   ├── admin/                    # Admin panel (allowlist only)
│   ├── api/                      # API routes
│   ├── blog/                     # Engineering blog
│   ├── _components/              # Shared app components
│   ├── layout.tsx                # Root layout (ClerkProvider)
│   └── page.tsx                  # Homepage
├── components/                   # Shared components
│   ├── ui/                       # shadcn/ui primitives
│   ├── blog/                     # Blog components
│   ├── editor/                   # Monaco editor + sandbox
│   └── ...
├── components/ui/                # shadcn/ui primitives (NY style)
├── config/                       # Configuration & schema
│   ├── schema.tsx                # Drizzle schema (single source)
│   ├── db.tsx                    # DB connection (tuned for TiDB)
│   ├── schema.tsx                # Drizzle schema
│   ├── interview/                # Interview seed data
│   ├── courses/                  # Course config
│   └── ...
├── lib/                          # Pure utilities & data access
│   ├── editor.ts                 # Monaco + sandboxed iframe
│   ├── course-data.ts            # Course queries
│   ├── interview-data.ts         # Interview queries
│   ├── logger.ts                 # Structured logging (redacts SQL)
│   └── ...
├── scripts/                      # CI scripts
│   ├── check-blog-toc.ts         # Blog TOC validation
│   └── check-migration-drift.ts  # Schema drift detection
├── tests/                        # Unit tests (node:test + tsx)
├── docs/                         # Architecture docs & gap reports
└── public/                       # Static assets
```

### Route Groups

- **`(auth)`** — Public auth pages (Clerk sign-in/up)
- **`(routes)`** — Auth-protected app (dashboard, courses, etc.)
- **`(admin)`** — Admin panel (allowlist via `ADMIN_EMAILS`/`ADMIN_CLERK_IDS`)

---

## Key Features Deep Dive

### 🎮 Code Editor (`/learn/[id]/[chapter]`, `/problems/[slug]`)

- **Monaco Editor** (VS Code engine) with IntelliSense
- **Sandboxed iframe** (`srcDoc` + `sandbox="allow-scripts"`) — lesson code runs in opaque origin
- **Run / Reset / Solution** buttons
- **Browser preview** for HTML/CSS/JS; console for others
- Split-pane layout for problems (statement + editor)

### 🎯 Interview Prep (`/interview/*`)

- **6 categories**: Frontend, Backend, Fullstack, DevOps, QA, System Design
- **1000+ questions** with tags (React, Spring Boot, Angular, etc.)
- **Top 50** toggle per category
- **Custom practice** by selected tags
- **Generate** button → Mistral AI creates tailored questions

### 🧩 DSA Problems (`/problems/*`)

- **220+ problems**: 36 Basic (Codewars 8kyu) + 183 LeetCode-style
- **Split-pane**: statement (left) + Monaco editor (right)
- **Run only** — no submit, no hidden tests
- Categories: Arrays, Strings, DP, Trees, Graphs, etc.

### 🤖 AI Mentor (`/mentor`)

- **Mistral AI** streaming chat
- **User context aware** — knows enrolled courses, solved problems, skills
- **Skill-aware** responses — adapts to your level
- Streaming responses with `ReadableStream`

### 📝 Engineering Blog (`/blog/*`)

- 5 deep technical posts (architecture, caching, server/client boundary, rate limiting, sandboxed execution)
- **Static generation** with `generateStaticParams`
- **SEO**: canonical, OG/Twitter cards, JSON-LD (`TechArticle`)
- **Per-post OG images** via `next/og`
- **Table of Contents** with sticky rail + mobile disclosure
- **TOC validation** (`npm run check:blog-toc`)

### ⚙️ Admin Panel (`/admin/*`)

- **Site Notices** — global banner/modal with severity, expiry, TTL
- **Users** — list, search, admin toggle
- **Feedback** — tickets with status, resolution
- **Fail-closed allowlist** (`ADMIN_EMAILS`, `ADMIN_CLERK_IDS`)

---

## Development Workflow

### Commands

| Command                          | Description                        |
| -------------------------------- | ---------------------------------- |
| `pnpm dev`                       | Start dev server (Turbopack)       |
| `pnpm build`                     | Production build                   |
| `pnpm start`                     | Run production server              |
| `pnpm typecheck`                 | `tsc --noEmit`                     |
| `pnpm test`                      | Run 45 tests (`node:test` + `tsx`) |
| `pnpm format`                    | `prettier --write .`               |
| `pnpm format:check`              | `prettier --check .`               |
| `pnpm check:blog-toc`            | Validate blog TOC anchors          |
| `pnpm check:migrations`          | Detect schema drift                |
| `pnpm exec drizzle-kit generate` | Generate migrations                |
| `pnpm exec drizzle-kit migrate`  | Apply migrations                   |
| `pnpm exec drizzle-kit studio`   | DB GUI                             |

### CI Pipeline (`.github/workflows/ci.yml`)

```mermaid
graph LR
    A[Checkout] --> B[Setup Node 22]
    B --> C[npm ci]
    C --> D[Audit deps<br/>high severity]
    D --> E[Migration drift check]
    E --> F[Typecheck]
    F --> G[Format check]
    G --> H[Test (45)]
    H --> I[Build]
    I --> J[Blog TOC check]
```

**All 7 steps must pass.** Runs on `master` and `development-branch`.

### Git Workflow

- `main` → protected, only via PR
- `development-branch` → active development
- Feature branches → PR to `development-branch`
- Conventional commits (`feat:`, `fix:`, `docs:`, `ci:`, etc.)

### Database (Drizzle + TiDB)

```bash
# Schema changes
# 1. Edit config/schema.tsx
# 2. Generate migration
pnpm exec drizzle-kit generate

# 3. Review generated SQL
# 4. Apply
pnpm exec drizzle-kit migrate

# 3. CI has drift gate:
#    npx drizzle-kit generate
#    git status --porcelain drizzle/  # fails if drift
```

---

## Deployment

### Vercel (Recommended)

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy — automatic on push to `main`/`development-branch`

**Required Vercel env vars:** All from `.env.example` plus:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`
- `MISTRAL_API_KEY`
- `CRON_SECRET`

### Cron Jobs (`vercel.json`)

```json
{
  "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 3 * * *" }]
}
```

Runs nightly at 3 AM UTC — cleans expired rate-limit windows.

### Database (TiDB Cloud)

1. Create free cluster at [tidbcloud.com](https://tidbcloud.com)
2. Get connection string → `DATABASE_URL`
3. Run migrations: `pnpm exec drizzle-kit migrate`

---

## Security

| Layer             | Implementation                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| **CSP**           | `script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https:` + SRI experimental                                |
| **Headers**       | HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, X-Permitted-Cross-Domain-Policies |
| **Rate Limiting** | DB-backed, handler-level, atomic upsert (5–30 req/min per route)                                                 |
| **Auth Boundary** | `proxy.ts` middleware → `auth.protect()` before any handler                                                      |
| **Schema Drift**  | CI gate: `npm run check:migrations` before build                                                                 |
| **Audit Gate**    | CI: `npm audit --audit-level=high` (blocks critical/high only)                                                   |
| **Admin Auth**    | Fail-closed allowlist (`ADMIN_EMAILS`, `ADMIN_CLERK_IDS`)                                                        |
| **Logging**       | Structured, redacts SQL params, walks error `cause`                                                              |

**CSP Note:** We use **SRI (experimental)**, not nonces. Nonces force dynamic rendering and would destroy our 17 static routes / 14 ISR windows (§16.1 gap report).

---

## Contributing

### Branch Strategy

- `main` — protected, release only
- `development-branch` — active development
- Feature branches → PR to `development-branch`

### Commit Convention

```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `ci`, `refactor`, `test`, `chore`, `style`, `perf`

### Testing Requirements

- New security boundary → add test in `tests/`
- Mutation test: break the code, confirm red, restore
- All CI steps must pass locally before push

### Code Style

- `pnpm format` before commit
- `pnpm typecheck` must pass
- No `console.log` in production code
- No `any` — use `unknown` + type guards

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Links

| Resource             | Link                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| **Repository**       | [github.com/jps27CSE/LynxDev-Hub_DEV_Community](https://github.com/jps27CSE/LynxDev-Hub_DEV_Community) |
| **Live Demo**        | [lynxdev.io](https://lynxdev.io)                                                                       |
| **Engineering Blog** | [/blog](/blog)                                                                                         |
| **Gap Report**       | [docs/engineering-gap-report.md](docs/engineering-gap-report.md)                                       |
| **Feature Tracker**  | [.agent/feature-tracker.md](.agent/feature-tracker.md)                                                 |
| **Architecture**     | [.agent/architecture.md](.agent/architecture.md)                                                       |
| **Discord**          | [Join Community](https://discord.gg/lynxdev)                                                           |

---

## Acknowledgments

Built with ❤️ using:

- [Next.js](https://nextjs.org/) • [React](https://react.dev/) • [Tailwind CSS](https://tailwindcss.com/)
- [Clerk](https://clerk.com/) • [TiDB Cloud](https://tidbcloud.com/) • [Drizzle ORM](https://orm.drizzle.team/)
- [Mistral AI](https://mistral.ai/) • [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Radix UI](https://www.radix-ui.com/) • [shadcn/ui](https://ui.shadcn.com/) • [Lucide Icons](https://lucide.dev/)
- [Vercel](https://vercel.com/) • [Mistral](https://mistral.ai/) • [Drizzle](https://orm.drizzle.team/)

---

<p align="center">
  <strong>Built by developers, for developers.</strong><br>
  <a href="https://github.com/jps27CSE/LynxDev-Hub_DEV_Community/issues">Report a bug</a> •
  <a href="https://github.com/jps27CSE/LynxDev-Hub_DEV_Community/discussions">Request a feature</a> •
  <a href="https://github.com/jps27CSE/LynxDev-Hub_DEV_Community/blob/main/.github/CONTRIBUTING.md">Contribute</a>
</p>
