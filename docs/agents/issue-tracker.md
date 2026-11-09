# Issue tracker: `.agent/` plan documents

Issues and specs for this repo live as numbered markdown files in `.agent/plans/`,
indexed by `.agent/feature-tracker.md`. There is no GitHub Issues or GitLab queue
for this repo.

## Conventions

- One feature per plan file: `.agent/plans/<NN>-<feature-slug>.md`. The prefix is a
  two-digit serial; it groups related files (`12-admin-module.md` and
  `12-admin-module-implementation.md` share `12`).
- The plan file *is* the spec and the ticket: business problem, design decisions,
  schema, task breakdown, and the record of what shipped.
- Status lives in two places, deliberately: a `> **Status:** …` line near the top of
  the plan, and a row in `.agent/feature-tracker.md`. Update both or the index lies.
- Tasks are numbered subsections of the plan's task-breakdown section. A task is the
  unit of work; there is no per-ticket file.
- Findings append to the plan as new numbered sections (existing plans use
  `## 15. Self-Review Log`, `## 16. Measurement Log`, `## 17. Review Log`). There is
  no separate comments file.

## When a skill says "publish to the issue tracker"

Write or extend `.agent/plans/<NN>-<feature-slug>.md`, then add or update the matching
row in `.agent/feature-tracker.md`. Do not create `spec.md`, `.scratch/`, or an
`issues/` directory.

## When a skill says "fetch the relevant ticket"

Read the plan file. The user will normally pass the path or its `NN` prefix.

## Wayfinding operations

- **Map**: the plan file itself — goal, phases, decisions.
- **Child ticket**: a numbered task in the task-breakdown section.
- **Blocking**: stated inline in the task, or in the tracker's Notes column.
- **Frontier**: the first unblocked task whose tracker row is not `Done`.
- **Claim**: set `In Progress` in the tracker.
- **Resolve**: append the outcome to the plan's record section and set the row to `Done`.
