---
description: Refactor pipeline — understand current design, justify the new structure, plan, migrate incrementally, review.
agent: build
---

Run the **refactor** pipeline on: $ARGUMENTS

1. **Understand current state** — Invoke **architect** to map the existing structure (files, responsibilities, data flow) and its weaknesses.

2. **Justify the refactor** — Why? Trade-offs of keeping vs changing (compare, recommend). Confirm the refactor does **not** change observable behavior.

3. **Plan the migration** — Invoke **planner**. Break into **small incremental steps** — each refactor step must leave the app working (no atomic big-bang changes). Note dependencies.

4. **Implement incrementally** — One step at a time, ensuring each is *behavior-preserving*. Follow existing conventions and DRY; extract duplication immediately.

5. **Verify no behavior change** — Invoke **qa**: run the affected user flows (happy path, error states, auth states) after each migration step.

6. **Review + performance** — Invoke **reviewer** and **performance** (especially for any query/component changes).

7. **Reflect** — Learning summary focused on the refactoring technique used.

Preserve behavior; never combine refactor with feature changes in the same step. Explain why each step is safe.