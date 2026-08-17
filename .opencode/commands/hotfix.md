---
description: Hotfix pipeline — minimal-scope fix for a critical production issue. Fast path; still reviews security and verifies no regression.
agent: build
---

Run the **hotfix** pipeline for the critical issue: $ARGUMENTS

1. **Confirm criticality** — is this a live blocker (data loss, broken auth, a feature unusable for all users)? If not, use `/bugfix` or `/feature` instead.

2. **Root cause + minimal fix** — Investigate, state the root cause with file:line, and propose the smallest possible fix. Explain **why** this is the correct minimal change. Wait for approval.

3. **Implement** — one task only. Follow existing conventions. **No refactoring**, no scope creep.

4. **Focused review** — Invoke **reviewer** and **security** on just the hotfix diff, not the whole codebase.

5. **Verify the fix** — Invoke **qa**: reproduce the original failure, confirm fixed, and test the directly adjacent flows (2-3 around the fix) for regression. Skip broader regression — restore the app quickly.

6. **Log** — record the incident: root cause, fix, why it was critical, and what should be hardened later (follow-up in feature-tracker).

Priority is correctness and speed — but never ship an unreviewed hotfix.