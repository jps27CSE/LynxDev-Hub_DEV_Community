# Engineering Checklists — LynxDEV

Source of truth: `.agent/ENGINEERING.md` (Final Checks) and `.agent/feature-tracker.md` (Free Tier Checklist). These checklists operationalize them.

## Final Checks Before Committing

- [ ] No `console.log` or debug code
- [ ] No unused imports or variables
- [ ] No hardcoded values that should be config
- [ ] API routes are authenticated (Clerk `auth()`) and validated (Zod)
- [ ] Error states handled for every data-dependent component
- [ ] Dark mode looks good
- [ ] Responsive layout works (mobile, tablet, desktop)
- [ ] Follows existing code patterns (reference actual files, not invented ones)

## API Route Pattern (every route)

```
1. Validate input with Zod
2. Authenticate with Clerk auth()
3. Authorize (role/enrollment if applicable)
4. Execute Drizzle query (batch, eager-load, index-aware)
5. Return consistent JSON response
```

Errors: `{ error: string, details?: unknown }` — never leak internals.

## Free Tier Checklist

- [ ] All DB queries paginated (max 20 per page)
- [ ] API rate-limited (per-route limits from `config/rate-limits.ts`: 5–30 req/min, in-memory middleware)
- [ ] No file uploads stored permanently
- [ ] Soft deletes everywhere (`is_deleted` flag) — no hard deletes outside cron
- [ ] JSON columns used for flexible metadata
- [ ] Schema under 20 tables (currently 17 — see `.agent/database-schema.md`)
- [ ] Images served from GitHub URLs / CDN
- [ ] TiDB connection pool respected (`connectionLimit: 5` in `config/db.tsx`)

## Drizzle Migrations

1. `npx drizzle-kit generate` after schema changes
2. Review generated SQL before applying
3. `npx drizzle-kit migrate` in development
4. Never edit migration files manually

## Component Rules

- Server Components by default; `"use client"` only for hooks/events/browser APIs
- Server Components are the data-fetching boundary; pass data down via props
- React 19: Actions for forms, `use()` for promises
- Reuse `components/ui/` primitives, `lib/utils.ts` (`cn`), Lucide icons
- `UserDetailContext` is the only user state context — no duplicates

## TypeScript

- Strict mode: no `any`, prefer `unknown` + type guards
- No `as` casts on Drizzle results; `satisfies` for type validation
- `interface` for public APIs, `type` for unions/computed types
- Types co-located with implementations (see `config/courses/types.ts`)
