# LynxDev HUB — Architecture

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 (App Router) | Fullstack, $0 on Vercel |
| Auth | Clerk | Free tier, Google + GitHub + email, pre-integrated |
| Database | Neon (PostgreSQL) + Drizzle ORM | Free 0.5GB, serverless |
| UI | shadcn/ui + Tailwind v4 | Modern, accessible, free |
| AI | Gemini Flash (free) / Groq (free) | Coding help, career guidance |
| Deploy | Vercel Free | 100GB bandwidth, 6000 build minutes |
| Cron | Cloudflare Workers Free | 100k req/day, cleanup tasks |

## Cost Strategy ($0 forever)

- **Database**: Neon free tier (0.5GB). Optimize schema — fewer tables, lean columns, soft-deletes instead of archive tables. Use JSON columns for flexible data instead of joins.
- **Storage**: No file uploads. All images from GitHub URLs or public CDNs. Resume analyzer uses ephemeral in-memory parsing (no storage).
- **AI**: Gemini Flash (60 req/min free) + Groq (30 req/min free). Round-robin fallback. No WebLLM (saves client resources).
- **Auth**: Clerk free (10k MAU). More than enough.
- **Cron**: Cloudflare Workers for cleanup. Single worker, minimal invocations.
- **Server actions** over API routes where possible (fewer cold starts, direct DB access).

## App Structure

```
app/
├── (auth)/          # sign-in, sign-up (Clerk pages)
├── (routes)/        # authenticated pages
│   ├── dashboard/   # home after login
│   ├── courses/     # course catalog + chapters
│   ├── editor/      # code editor (chapter content)
│   ├── interview/   # interview prep section
│   ├── problems/    # problem solving
│   ├── community/   # posts + comments
│   ├── mentor/      # AI chat
│   ├── notes/       # developer notebook
│   └── resources/   # YouTube + blogs
├── api/             # API routes
└── _components/     # shared components
```

## Data Flow

- **CSR** for interactive pages (dashboard, courses, editor, community, notes)
- **SSR/ISR** only for public pages (homepage, landing)
- **Server Actions** for form submissions (comments, notes, enrollments)
- **API Routes** only when Server Actions aren't suitable (AI streaming, file parsing)
- **Zustand** for client state (editor state, UI state) — lighter than Context for frequent updates
- **React Query** for server state caching (optional, depends on complexity)

## Free Tier Safeguards

- Rate limit AI endpoints (max 10 req/min per user)
- Paginate all list views (max 20 items/page)
- Soft delete only — no hard deletes outside cron
- JSON columns for flexible metadata (avoids migration costs)
- Batch DB writes (don't write on every keystroke in editor — save on debounce)
- Keep schema under 20 tables total
