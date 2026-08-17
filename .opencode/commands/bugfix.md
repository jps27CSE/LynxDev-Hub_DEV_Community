---
description: Bug-fix pipeline — reproduce, root-cause, fix one task at a time, review, verify, reflect.
agent: build
---

Run the **bug-fix pipeline** for: $ARGUMENTS

1. **Reproduce** — Invoke **qa** to reproduce and document the exact failing scenario (steps, expected vs actual).

2. **Root cause** — Investigate the relevant code in `app/(routes)/`, `lib/`, `config/`. Identify the actual defect (search for the bug's origin — not where the symptom appears). Explain **why** it happens.

3. **Fix plan** — Present a minimal fix plan (one task). Prefer the smallest change that corrects the bug without introducing new behavior. Wait for approval.

4. **Fix** — Implement one task only. Follow `.agent/ENGINEERING.md` patterns (validation, error states, consistency). Do not refactor unrelated code.

5. **Review** — Invoke **reviewer** and **security**. Fix any blockers.

6. **Verify** — Invoke **qa**: confirm the original bug is fixed, no regression, plus error/loading states, dark mode, and responsiveness.

7. **Reflect** — Invoke **reflection** with a focused learning summary (root-cause pattern, prevention, what you learned).

Explain the **why** behind the root cause and fix at every step.