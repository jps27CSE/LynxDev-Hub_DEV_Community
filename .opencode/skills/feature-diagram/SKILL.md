---
name: feature-diagram
description: Generate a polished, detailed sequence/flowchart documentation file for a feature after implementation. Use this skill after any feature is implemented (or when the user asks to visualize a flow). Produces docs/feature-flows.md (or per-feature file) with dark-themed Mermaid diagrams plus step-by-step action lists, following the LynxDEV visual style (dark charcoal bg, numbered steps, phase boundaries, callouts). Also invoke automatically at the end of the feature pipeline.
license: Internal — LynxDEV project
---

# Feature Diagram Skill

You are a Senior Software Architect and Technical Diagram Designer. After a feature is implemented, you produce a **self-contained, detailed sequence/flowchart documentation file** so the feature can be understood without reading code.

## When to invoke

- At the end of the feature pipeline (after Phase 7 production review passes).
- Whenever the user asks to "visualize", "diagram", or "document the flow" of a feature.
- When a new API route, data flow, or multi-step interaction is added.

## Output location

- Default: one file per feature in the `diagrams/` folder, prefixed with a two-digit serial number so a newcomer can revise in order: `diagrams/NN-<feature-slug>.md` (e.g. `diagrams/01-homepage-redesign.md`, `diagrams/02-course-catalog-chapters.md`). Determine NN by scanning existing files in `diagrams/` and using the next available number (01, 02, ...). If a feature replaces an existing one, reuse its number.
- If the user prefers a single consolidated file, use `diagrams/feature-flows.md` and append a section.
- If the user prefers a subfolder, use `diagrams/flows/<feature-slug>.md`.
- Never delete existing diagram files; create a new file per feature (or append to the chosen file if it already exists).

## Visual style (LynxDEV standard)

Follow these characteristics in the Mermaid source:

- Dark theme: start every diagram with `%%{init: {'theme':'dark'}}%%`.
- Numbered interactions: use `autonumber` in sequence diagrams; number flowchart nodes/edges in labels (1., 2., 3.).
- Solid arrows (`->>`, `-->`) for requests/responses; dashed for responses where applicable.
- Participant boxes: labeled rectangles across the top; only relevant components.
- Logical left-to-right ordering to minimize arrow crossings.
- Short, render-safe labels (no braces `{}`, angle brackets, or raw `->` inside labels) — put deep detail in the step list, not the label.
- Group parallel operations in a `par` block; conditionals in `alt`/`opt`/`loop`.

## Required content per feature

For each feature produce:

1. **A Mermaid diagram** (sequenceDiagram for request/data flows; flowchart for branching; stateDiagram for status flows).
2. **Key files** — actual paths that own the logic.
3. **Step-by-step actions** — a numbered list where every step states: sender/receiver, operation + endpoint/method, payload fields, validation/auth checks, DB queries (table + columns), response/status, side effects/state transitions. Be exhaustive; this is the audit trail.
4. **Data flow** — 3–5 bullets summarizing the flow.

## Interaction-level detail checklist

For each important interaction include:
- Sequential step number
- Sender and receiver
- Operation/message + endpoint/method/event/command
- Important request parameters or payload fields
- Validation or authorization checks
- Response, status code, or resulting state
- Side effects or state transitions

Include production details when applicable: auth, input validation, DB reads/writes, transaction boundaries, cache interactions, queue publishing, retries/timeouts, idempotency, error propagation, state changes, security checks, logging/metrics/tracing.

## Workflow phases

Divide complex flows into labeled phases (Request Initiation, Authentication & Validation, Main Processing, Persistence, Async Processing, Response & State Update, Error Handling). Use `Note over` or section comments in Mermaid, or phase headers in the step list.

## Parallel & conditional

- Explicitly mark parallel operations with `par`.
- Mark branches with `alt`/`opt` and labels like `[Authenticated]/[Unauthenticated]`, `[Cache hit]/[Cache miss]`, `[Validation succeeds]/[Validation fails]`.

## Assumptions & unresolved questions

End each feature section with a short "Assumptions" line if any behavior was inferred rather than confirmed from code. Never invent API contracts, response codes, or DB operations — confirm from code or mark as assumption.

## Quality checklist before delivering

- [ ] Every important interaction represented
- [ ] Chronological order correct
- [ ] Request/response directions correct
- [ ] Sequential vs parallel distinguished
- [ ] Conditional branches logically valid
- [ ] Validation and security checks represented
- [ ] Labels accurate and readable (render-safe)
- [ ] No arrows/text overlap (use phase splits if crowded)
- [ ] Dark theme + autonumber present

## Template

```markdown
### <Feature name>

```mermaid
%%{init: {'theme':'dark'}}%%
sequenceDiagram
  autonumber
  actor U as User
  participant ... 
  U->>...: 1. <short label>
  ...
```

**Key files**: `path1`, `path2`.

**Step-by-step actions**:
1. ...
2. ...

**Data flow**: 3-5 bullets.

**Assumptions**: (if any)
```

## Integration with the feature pipeline

When invoked at the end of a feature, create (or append to) `diagrams/NN-<feature-slug>.md` named after the feature, with a two-digit serial prefix (next available number in `diagrams/`). Do not regenerate existing files unless asked.
