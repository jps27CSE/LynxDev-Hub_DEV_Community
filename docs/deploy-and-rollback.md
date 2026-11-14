# Deploy, Rollback & CI/CD Notes — LynxDEV

## Deploy strategy (Option B — indirect gating)

- **CI:** GitHub Actions (`.github/workflows/ci.yml`) runs on `push`/`pull_request` to `master` and `development-branch`. Gates: audit → migration drift → typecheck → format → tests → build → blog TOC → system-design check.
- **CD:** Vercel auto-deploys on push to `main` only. All other branches are skipped via the **Ignored Build Step** (dashboard setting, see below).
- **Gating:** Branch protection on `main` requires the `quality` CI job to pass before merge. So Vercel only ever deploys code that passed CI — even though Vercel itself does not wait for CI.

### Why not "deploy only after CI green" (Option A)?

Option A (disable Vercel auto-deploy, trigger via GitHub Actions deploy job) gives stricter control but needs a `VERCEL_TOKEN` secret and a deploy job. For a free-tier solo-dev project, the indirect gating of Option B is sufficient and far simpler. Reconsider if the team grows or if a deploy ever ships broken code despite green CI.

## Vercel settings that are NOT in the repo (documented here so they're not lost)

### Ignored Build Step (Project → Settings → Git → Ignored Build Step)

- Behavior: **Custom**
- Command:
  ```
  if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then exit 0; else exit 1; fi
  ```
- Effect: only `main` branch deploys; every other branch (including `development-branch`, `feature/*`) is skipped → no preview deployments → no Functions Storage growth.

### Deployment Retention Policy (Project → Settings → …)

If available on the plan:
- Canceled Deployments: 1 day
- Errored Deployments: 1–3 days
- Pre-Production Deployments: 7–14 days
- Production Deployments: Never (keep history for rollback)

If locked on Hobby plan: manual cleanup via Dashboard → Deployments, monthly.

### Deploy failure notification

Project → Settings → Notifications → enable email on deploy failure (so a failed deploy is not silent).

### Branch protection (GitHub → Settings → Branches → `main`)

- Require a pull request before merging (1 approval)
- Require status checks to pass → `quality`
- Require branches to be up to date before merging
- Require conversation resolution before merging
- Do not allow bypassing the above settings

## Rollback procedure

### Bad code deployed to production

1. Vercel Dashboard → **Deployments** → find the last known-good production deployment.
2. Click **"…"** → **"Promote to Production"** (instant, no rebuild).
3. Verify the live site.
4. Fix forward on a branch → PR → merge → CI green → auto-deploy.

### Bad database migration

Drizzle has no automatic rollback. Manual steps:
1. Write a reverse migration SQL by hand (or `drizzle-kit generate` from a reverted schema).
2. Apply via `npx drizzle-kit migrate` against production (or run SQL directly in TiDB console).
3. If data was lost: restore from TiDB backup (free tier has limited point-in-time recovery — verify before relying on it).

### Bad environment variable / secret

1. Vercel → Project → Settings → Environment Variables → fix value.
2. Redeploy (Deployments → Redeploy) so the new value takes effect.

## Verification checklist after any CI/CD change

- [ ] `npm run build` passes locally
- [ ] `npm run check:system-design` passes (post-build)
- [ ] `npm test` passes (678 tests)
- [ ] `npm run typecheck` clean
- [ ] GitHub Actions CI green on `development-branch` (trigger via `workflow_dispatch`)
- [ ] Vercel deploy succeeds on `main` push
- [ ] No new preview deployments created for non-`main` branches
