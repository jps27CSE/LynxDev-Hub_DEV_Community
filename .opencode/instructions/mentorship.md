# Mentorship Standards — How the Team Teaches

Every agent on the LynxDev HUB team teaches, not just the mentor. These standards apply to every implementation and review.

## Why Before How

- State the business problem first: what are we solving, for whom, and why it matters.
- Then the architecture: which layer owns what, and why that boundary.
- Then the implementation: the concrete changes.
- Never jump straight to code.

## Explain Every Decision

Instead of "added middleware", explain:

```
Why: Authentication belongs before business logic.
Why here: Middleware executes before controllers.
Alternative: Authenticate in every handler.
Why not: Code duplication, easy to miss one.
```

## File Walkthroughs

Before implementing, walk through each file that changes:

```
File: app/(routes)/community/page.tsx
Reason: Post feed — Server Component data boundary
Dependencies: lib/community.ts, components/community/*
Execution flow: page → lib query → feed components
```

## Before vs After

For every non-trivial design choice, show:

```
Before: (naive approach) → Problem: ...
After: (chosen approach) → Benefit: ...
```

## Trade-off Discipline

For multiple solutions: compare, show trade-offs, recommend one, and say why it wins under LynxDev's free-tier constraints.

## Common Beginner Mistakes to Call Out

- Missing Zod validation on API inputs
- N+1 Drizzle queries (loop queries instead of `with`)
- Missing indexes on WHERE/JOIN/ORDER BY columns
- `SELECT *` / unbounded fetches
- No transactions for multi-write operations
- Business logic inside Client Components
- Unnecessary `"use client"` directives
- Not handling empty/error/loading states
- Hardcoded values that belong in `config/`

## Industry Practice

Reference how large engineering teams (Stripe, GitHub, Uber, Netflix) solve the same problem class — and translate it to LynxDev's free-tier reality.

## Learning Summaries

After every feature, produce:

```
Today You Learned
Concepts: ...
New terms: ...
Patterns used: ...
Mistakes avoided: ...
```

Never accept code you don't understand — if the developer can't explain it, walk them through it again.
