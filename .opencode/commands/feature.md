---
description: Runs the full ELOS feature pipeline — mentor teaches, then requirements, architect, planner, implement, review, and reflection.
agent: build
---

$ARGUMENTS

Run the **full ELOS feature pipeline** on the current session. Do not skip any phase. Walk the feature through the ELOS chain in order.

## Phase 1 — Teach

Invoke the **mentor** agent. It must teach before any code:
- Problem + real-world scenario + senior thinking
- System design thinking mapped to LynxDEV's stack
- Which files change and why
- Before vs after, common beginner mistakes, industry practice
- What you'll learn

## Phase 2 — Understand Requirements

Prompt contract: *"I want to build a new feature. Do not write code. Analyze requirements. Explain: requirements, edge cases, risks, assumptions. Then create an implementation plan."*

Invoke the **requirements** agent:
- Check `.agent/feature-tracker.md` phase + plan doc in `.agent/plans/`
- Clarify scope, assumptions, missing requirements, acceptance criteria, free-tier risks
- Resolve open questions before proceeding

## Phase 3 — Architecture

Prompt contract: *"Show me: affected files, new files, API flow, folder structure, data flow. No implementation."*

Invoke the **architect** agent. Produce affected files, new files, API flow, folder structure, data flow, DB changes, external services, trade-offs. Follow `.agent/architecture.md` and `.agent/ENGINEERING.md` conventions.

## Phase 4 — Plan Tasks

Prompt contract: *"Break this feature into small independent tasks. Each task should take less than 30 minutes. Do not implement."*

Invoke the **planner** agent. Break into independent, sequential, testable tasks (each under 30 minutes) with dependencies and verification steps.

**STOP here and show the developer the teaching summary, requirements, architecture, and task list. Wait for approval before implementing.**

## Phase 5 — Implement

Prompt contract: *"Implement Task 1 only. Explain: Why, Alternatives, Trade-offs. Stop afterwards."*

Once approved, implement **one task at a time** (do not batch):
- Route tasks via **backends**/**frontend**/**database**/**api** agents per the work type
- After each task, run the matching review before moving on

## Phase 6 — Parallel Review

Run independent reviews in parallel:
- **reviewer** (code review: strengths, weaknesses, trade-offs, scores)
- **security** (auth, validation, secrets, rate limits)
- **performance** (TiDB round-trips, N+1, client footprint, free-tier budget)
- **qa** (happy path, error states, auth states, dark mode, mobile)

Consolidate into a report of blockers, then send fixes back to the implementers.

## Phase 7 — Production Review

Invoke **production** (free-tier sustainability at 500 users, pre-commit checklist) and **devops** (build/typecheck/format). Fix any blockers.

## Phase 8 — Reflect

Invoke **reflection**: reinforcement questions + learning summary + engineering journal entry.

Always explain the **why** at every step, reference existing patterns in `app/(routes)/`, `lib/`, `config/`, and keep the free-tier constraints (`.agent/AGENT.md`) in mind.