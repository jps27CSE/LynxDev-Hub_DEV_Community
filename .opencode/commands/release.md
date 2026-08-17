---
description: Release pipeline — final gate around a feature/module for production on Vercel free tier. Includes production + devops + qa sign-off.
agent: build
---

Run the **release pipeline** for: $ARGUMENTS

1. **Scope** — Invoke **planner** to enumerate the full set of changes in this release (features, fixes, migrations) against `.agent/feature-tracker.md`.

2. **Production review** — Invoke **production**: free-tier sustainability at 500 users (`docs/production-review-500-users.md` + module reviews), phase alignment, engineering standards final checks, free-tier checklist (pagination, rate limits, soft deletes, schema < 20 tables, images from CDN).

3. **DevOps gate** — Invoke **devops**: `npm run build` passes, `npm run typecheck` passes, `npm run format:check` passes, env vars in place, Drizzle migrations reviewed (never edited manually).

4. **QA sign-off** — Invoke **qa**: full regression of affected user flows, both auth states, dark mode, responsive, rate limits.

5. **Lock-in audit** — zero vendor lock-in (thin wrappers around Mistral/TiDB services). No secrets committed.

6. **Release notes** — summarize behavioral changes, DB migrations, env requirements, and known limitations.

7. **Reflect** — engineering journal entry for the module.

Produce a **RELEASE READY / NOT READY** verdict. Do not publish, deploy, or commit unless explicitly asked.