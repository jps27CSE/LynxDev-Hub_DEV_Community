---
description: Independent code review — run reviewer, security, performance, and qa on the given files.
agent: reviewer
---

Independently review the following with a strict senior eye: $ARGUMENTS

Run the **independent reviews** in parallel and consolidate into one report:

1. **reviewer** — Strengths, weaknesses, trade-offs, potential bugs, production risks, SOLID/DRY/KISS/YAGNI, consistency with existing patterns (`app/(routes)/`, `lib/`, `config/`, `components/ui/`), dead code, error handling, hydration risks. Maintainability/architecture/readability scores.

2. **security** — Clerk `auth()` on all protected routes/actions, Zod validation on inputs, secret exposure, rate-limit compliance, XSS (user-generated content / markdown), CSRF.

3. **performance** — Server Component footprint, N+1 and TiDB round-trips, index usage, caching, client bundle, free-tier discipline (max 20 pagination, rate limits).

4. **qa** — verify the affected user flows in `npm run dev`: happy path, error states, auth (signed in/out), dark mode, responsive.

Merge into a **consolidated report** of: blocker / non-blocker / recommendation with file:line references. Do not fix — report only. Review independently and do not defer to the author's judgment.