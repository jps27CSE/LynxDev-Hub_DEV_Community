# Engineering Standards

## Principles

Always follow:
- **SOLID** — Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion
- **DRY** — Reuse existing config, components, and utilities; extract duplication immediately
- **KISS** — Simple solutions over clever ones
- **YAGNI** — Don't build for future requirements that may never come

Prefer:
- Composition over inheritance
- Dependency injection over tight coupling
- Small functions with clear names
- Server Components over Client Components

Avoid:
- God objects and god functions
- Hardcoded strings, magic numbers, duplicate logic
- Deep nesting (early return, guard clauses)
- Unnecessary `"use client"` directives
- Direct DOM manipulation

---

## Next.js 16 / React 19

### Component Rules
- **Default to Server Components**. Only add `"use client"` when you need: event handlers, hooks (`useState`, `useEffect`, `useContext`), browser APIs, or custom hooks from `hooks/`
- Use React 19 features: Actions for form submissions, `use()` for promise consumption in components
- Keep Server Components as data-fetching boundaries; pass data down to Client Children via props
- Never fetch data in a Client Component unless you need real-time updates

### Routing
- Route groups for auth boundaries: `(auth)` for public auth pages, `(routes)` for authenticated pages
- Layouts for shared shells (`AppShell` in `(routes)/layout.tsx`)
- Parallel routes / intercepting routes for modals and side panels (Phase 3+ community features)

### API Routes
Standard pattern for every API route:

```typescript
1. Validate input with Zod
2. Authenticate with Clerk auth()
3. Authorize (check user role or enrollment if applicable)
4. Execute Drizzle query
5. Return consistent JSON response
```

- Streaming responses for AI routes (Mistral) — follow `app/api/mentor/chat/` pattern
- Consistently shaped error responses: `{ error: string, details?: unknown }`
- Catch async errors with a wrapper or try/catch at the route handler level

---

## TypeScript

- Strict mode is enabled — do not use `any`. Prefer `unknown` and type guards
- Strongly type all Drizzle query results — avoid `as` casts
- Prefer `interface` for public APIs, `type` for unions and computed types
- Use `satisfies` operator for type validation without widening
- Export types alongside their implementations (co-location)
- Follow patterns in `config/courses/types.ts` for domain type definitions

---

## Drizzle ORM + TiDB (MySQL)

### Schema Design
- Define relations in `config/schema.tsx`, not ad-hoc in query code
- Use `relations` from `drizzle-orm` for joins
- Index columns used in `WHERE`, `ORDER BY`, and `JOIN` clauses

### Query Patterns
- Batch queries to minimize round-trips (free TiDB connection pool is limited)
- Use prepared statements for repeated queries in the same request
- Avoid N+1: use `with` (eager loading) instead of looping queries
- Prefer Drizzle queries over raw SQL unless performance profiling proves otherwise

### Migrations
- Run `npx drizzle-kit generate` after schema changes
- Review generated SQL before applying
- Run `npx drizzle-kit migrate` in development
- Never edit migration files manually

---

## Styling (Tailwind v4 + shadcn/ui)

- Use shadcn/ui primitives from `components/ui/` — do not recreate them
- Follow existing component APIs: `className` forwarding via `cn()`, `asChild` prop from Radix, consistent prop naming
- Dark mode is default (`className="dark"` on `<html>`). Ensure all new components look correct in dark mode
- Use Tailwind v4 syntax (no `@apply` unless extracting a shared pattern)
- Custom styles go in `app/globals.css` only when Tailwind utilities are insufficient
- Icons: Lucide React (already in the project)

---

## Code Organization

```
app/          — Next.js pages and API routes (by route group)
components/   — Reusable UI (ui/ for shadcn, root for app-specific)
config/       — DB schema, seed data, course/interview/problem definitions
hooks/        — Custom React hooks
lib/          — Pure utilities and data access helpers
context/      — React context providers
```

- One concern per file. If a file exceeds 300 lines, consider splitting
- Config data (courses, interview categories, problems) belongs in `config/`, not in application code
- Keep seed data and runtime queries separate — seed scripts in `config/seed-*.ts`, queries in `lib/`

---

## Error Handling

- Every API route must handle: validation errors, auth errors, not-found, and internal errors
- Every Client Component that fetches data must handle: loading, empty, error, and success states
- Use React Error Boundaries for sections that could crash independently
- Log errors server-side; show user-friendly messages client-side
- Don't expose internal error details to the client

---

## Performance

- Minimize Client Component footprint — push interactivity as deep as possible
- Use React 19 `use()` for promise handling instead of `useEffect` + `setState`
- Lazy load heavy components with `next/dynamic`
- Optimize images with `next/image` (remote patterns configured in `next.config.ts`)
- Monitor TiDB query performance — use `EXPLAIN` for slow queries

---

## Testing

No test framework is set up yet (tracked in Phase 4/5 roadmap).

Until then:
- Manually verify all new features in `npm run dev`
- Test with both signed-in and signed-out states
- Test on mobile viewport and dark mode
- Document manual test steps for complex features

When tests are introduced, every new feature will require:
- Unit tests for logic in `lib/`
- Integration tests for API routes
- Component tests for interactive UI

---

## Final Checks Before Committing

- [ ] No `console.log` or debug code
- [ ] No unused imports or variables
- [ ] No hardcoded values that should be config
- [ ] API routes are authenticated and validated
- [ ] Error states handled for every data-dependent component
- [ ] Dark mode looks good
- [ ] Responsive layout works
- [ ] Follows existing code patterns
