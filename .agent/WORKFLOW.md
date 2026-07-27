# Feature Development Workflow

For every feature, follow these steps **in order**. Never skip a step.

---

## Step 1 — Understand Requirements

**Do not write code.**

- Read the relevant `.agent/plans/` document for the feature
- Check `.agent/feature-tracker.md` for status and dependencies
- Identify which phase (3, 4, or 5) this feature belongs to
- Ask clarifying questions about scope, user flow, and acceptance criteria

---

## Step 2 — Analyze

**Do not write code.**

List:
- **Assumptions** — what am I taking for granted?
- **Missing requirements** — what isn't specified but will be needed?
- **Edge cases** — empty states, error states, loading states, auth failures, rate limits
- **Risks** — free-tier limits (TiDB connections, Mistral API calls, Vercel function timeout), Clerk rate limits
- **Existing patterns to follow** — which existing route, component, or query can I mirror?

Check:
- Does a similar feature already exist? (e.g., a new editor feature → look at `learn/[courseId]/[chapterId]`)
- Does the Drizzle schema already have relevant tables?
- Are there existing components in `components/ui/` that cover the UI needs?

---

## Step 3 — Architecture

**Do not write code.**

Explain:
- **File tree** — which new files go where (route, components, lib, config)
- **Route design** — route group, layout nesting, parallel routes if needed
- **Component tree** — Server vs Client boundaries, data fetching strategy
- **Data flow** — API endpoints, Drizzle queries, caching strategy
- **Database changes** — new tables, columns, relations, migrations
- **External services** — new Mistral prompts, new Clerk webhooks, new API integrations

Every new file must justify its existence. Prefer adding to existing files where coherent.

---

## Step 4 — Break into Tasks

Create a list of **independent, sequential tasks**.

- One task per logical change (e.g., "Create DB migration" ≠ "Build the UI")
- Tasks must be implementable and testable individually
- Note which tasks depend on others

**Wait for approval before proceeding.**

---

## Step 5 — Implement

Implement **one task only**, then stop.

- Follow existing code conventions (server components first, Drizzle patterns, API route structure)
- Reuse `lib/utils.ts`, `components/ui/`, and `config/` where possible
- Add `"use client"` only when required
- Handle loading, empty, and error states for every component
- Use Zod for API route validation
- Use Clerk `auth()` on all protected API routes
- Keep Drizzle queries efficient — batch where possible, avoid N+1

---

## Step 6 — Self-Review

Review your own code before signaling completion. Check:

- **Security** — Are API routes authenticated? Are user inputs validated? Is there any exposure of secrets?
- **Performance** — Are there unnecessary client components? N+1 queries? Missing `React.memo` or `useCallback` where rendering is expensive?
- **SOLID** — Single responsibility? Open for extension? Dependency inversion?
- **Consistency** — Does this match existing patterns in the codebase?
- **Dead code** — Unused imports, variables, console.logs, commented-out code?
- **Error handling** — Are API errors caught? Are UI error boundaries in place?
- **Hydration** — Any server/client mismatch risks with `"use client"` components?

---

## Step 7 — Verify

- Run `npm run dev` and manually test the feature
- Test the happy path, error states, and edge cases
- Check responsive layout and dark mode (default)
- Verify API routes with different auth states (signed in, signed out)

When tests are added to the project, this step will include running them.

---

→ See ENGINEERING.md
