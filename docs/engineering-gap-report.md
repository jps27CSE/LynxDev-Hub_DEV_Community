# Engineering Gap Report

> **Date:** 2026-10-18
> **Assessed:** `development-branch` @ `f74f799` · Next.js 16.1.1 · React 19.2.3 · Clerk 6.36.8 · TiDB + Drizzle
> **Method:** every finding below was measured by running a command against the working tree, not inferred from reading. Where a number could not be obtained, the gap says so rather than estimating.
> **Scope:** delivery pipeline, documentation, testing, security hardening, observability, repo hygiene. Not a code review of any individual feature.

---

## Verdict

**The gap is not in engineering judgement — it is in automated enforcement.**

This repo keeps one of the better self-documenting knowledge bases of any project I have assessed. `.agent/feature-tracker.md` records 20 infrastructure decisions, a Known Debt list of hard-won production failures, and production reviews with measured numbers attached. Most funded teams document less.

The problem is that nearly every lesson recorded in that file was found **by a human, manually** — because nothing verifies it automatically and nothing blocks a merge when it regresses.

Framing this correctly matters, because it changes the fix. This is not a knowledge gap. Adding more documentation will not close it. Only gates will.

---

## What is genuinely strong

Recorded first, and deliberately, because a gap report that only lists failures gives a false picture and invites regressing the things that already work.

| Area | Evidence |
|---|---|
| Commit discipline | 20/20 recent commits conventional, correct scopes, `!` breaking marker, detailed "why" bodies |
| Architectural memory | Decision tables, Known Debt, production reviews — all with measured numbers |
| Rate limiting | 14/18 API routes; DB-backed, atomic upsert, fail-closed |
| Auth coverage | 16/18 routes call `auth()`; the 2 exceptions are legitimately public (`/api/health`) or token-gated (`/api/cron/cleanup`) |
| Request logging | 18/18 routes wrapped in `withRequestLog` |
| Migrations | 11 SQL files, 11 journal entries, consistent — no drift |
| Log hardening | `lib/logger.ts` redacts bound SQL params and walks `cause` (tracker I.8). Most teams have neither |
| Type safety | `strict: true`; only 24 `console.*` in product code |
| Secrets hygiene | `.env.example` complete and all values empty; `.env` gitignored; no secrets tracked; admin auth is a fail-closed allowlist |

**The 888 `console.*` calls repo-wide are a red herring** — 836 of them are in seed-data files, 24 in `lib/`+`app/`, 2 in `components/`.

---

## 1. Delivery pipeline — the biggest problem

| # | Gap | Evidence | Severity |
|---|---|---|---|
| 1.1 | **CI never runs on your work** | `.github/workflows/ci.yml:3-7` triggers on `push`/`pull_request` against `master` only. Development happens on `development-branch`, so the admin module, the blog module and the system-design spec have had zero automated verification | 🔴 P0 |
| 1.2 | **CI's only style gate is permanently red** | `npm run format:check` fails **53 files** and is a step at `ci.yml:37-38`, so the workflow fails on every run | 🔴 P0 |
| 1.3 | No tests, no `test` script, no CI test step | — | 🔴 P0 |
| 1.4 | No linter at all | ESLint is not installed and no config exists. `next lint` was removed in Next 16, so there is no linting path at all | 🟠 P1 |
| 1.5 | CI is fragile | `ci.yml:17-20` requires a `CI/CD` environment plus `DATABASE_URL`. If the secret is unset, `next build` **fails** rather than skipping | 🟠 P1 |
| 1.6 | Schema drift is undetectable in CI | `drizzle-kit` is never run by the workflow; a missing migration surfaces at runtime, in production | 🟡 P2 |

> **A gate that always fails is worse than no gate.** It teaches the team to ignore CI, which is why the formatting failure sat in Known Debt for weeks instead of being a two-minute fix. The same logic applies to 1.1: a CI badge that never runs is indistinguishable from no CI, only more comfortable.

`.agent/feature-tracker.md` records the failing-file count as **45**. It is now **53**. That number is already stale, and any specific count will be obsolete the moment the next file is edited — see the remediation note in §7.

---

## 2. Documentation

| # | Gap | Evidence | Severity |
|---|---|---|---|
| 2.1 | **README is untouched `create-next-app` boilerplate** | 36 lines. It opens "This is a [Next.js](https://nextjs.org) project bootstrapped with create-next-app" and says "You can start editing the page by modifying `app/page.tsx`" | 🔴 P0 |

For a v1.1.0 application with 15–20 database tables, Clerk auth, a TiDB data layer, an admin panel, an AI mentor and a six-phase roadmap, the README provides:

- no setup instructions (it never mentions Clerk keys, `DATABASE_URL`, or migrations — all of which are required)
- no architecture map
- no "where does feature X live"
- no environment-variable reference (the info exists in `.env.example`, which is excellent, but nothing points a reader there)

This is the cheapest high-impact item in the entire report, and the only one whose cost is a few hours of writing rather than engineering.

**Note:** `.agent/` already solves the architectural-documentation problem far better than most companies. This gap is about the *entry point*, not the depth.

---

## 3. Testing

| # | Gap | Evidence | Severity |
|---|---|---|---|
| 3.1 | Zero tests anywhere in the repo | No framework, no script, no test files | 🔴 P0 |
| 3.2 | **Security boundaries are untested** | `lib/parse-id.ts:6` gates every dynamic route param; `lib/editor.ts:115` `buildSandboxedSrcDoc` builds the iframe sandbox that lesson code runs inside | 🔴 P0 |
| 3.3 | No coverage or mutation measurement | — | 🟡 P2 |
| 3.4 | No API-route integration tests | 18 routes, 0 tests | 🟡 P2 |

### 3.2 expanded — why `parse-id` deserves a test today

`parsePositiveInt` claims in its own doc comment to reject `"1.5"`, `"1abc"` and `""`. It does. Probing it further found behaviour that is **correct but undocumented and almost certainly accidental**:

| Input | Result | Note |
|---|---|---|
| `"0x10"` | `16` | hex notation accepted |
| `"1e3"` | `1000` | scientific notation accepted |
| `"+12"`, `" 12 "`, `"12.0"` | `12` | lenient whitespace/sign |
| `"٣"` (Arabic-Indic digit) | `null` | correctly rejected |

Harmless in practice — no route has an id of `0x10` — but it is unpinned behaviour discovered by reading, which is exactly the category of thing a test converts from accident to decision.

### 3.2 — the harness is free

`node:test` driven through `tsx` was verified working in this repo: `@/` path aliases resolve, no new dependency, no config. **"No test framework" is not a blocker** — it is a five-line `package.json` entry.

---

## 4. Security hardening

| # | Gap | Evidence | Severity |
|---|---|---|---|
| 4.1 | **CSP provides near-zero script protection** | `next.config.ts:25` — `script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https:`. The `https:` wildcard permits script execution from **any origin**, so an XSS has no containment. Combined with `unsafe-inline` and `unsafe-eval`, the directive is close to decorative for its main threat | 🟠 P1 |
| 4.2 | One security header out of six | No `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`, `object-src`, `base-uri` | 🟠 P1 |
| 4.3 | No Dependabot; dependency drift unmonitored | 55 outdated packages, **7 major versions behind**: Clerk 6→7, TypeScript 5→7, recharts 2→3, lucide-react 0.x→1.x, dotenv 17→18, react-day-picker 9→10, `@types/node` 20→26 | 🟠 P1 |
| 4.4 | No `npm audit` in CI | — | 🟡 P2 |

**Already correct and worth keeping:** `.env.example` is complete with every value empty; `.env` is gitignored; no secrets are tracked; `/api/cron/cleanup` is bearer-token gated (`app/api/cron/cleanup/route.ts:11-20`); admin auth is a fail-closed allowlist; Mermaid/XSS boundaries in the blog are covered by CSP.

The CSP finding is worth stating precisely, because "you have a CSP" and "your CSP does something" are different claims. It is present, and for `frame-src`/`img-src` it does real work. For `script-src`, the `https:` wildcard means it does not constrain the thing it exists to constrain.

---

## 5. Observability

| # | Gap | Evidence | Severity |
|---|---|---|---|
| 5.1 | **No error tracking** | Only `@vercel/analytics` and `@vercel/speed-insights` are installed. Both report traffic and speed — **not errors**. A production 500 is currently invisible until a user reports it | 🟠 P1 |
| 5.2 | Two parallel logging systems | 6 API routes use `console.error`; only 2 use the hardened `log`. The `console.error` sites bypass the I.8 redaction fix entirely | 🟠 P1 |

An initial read of this suggested *15 of 18 routes had silent, unlogged 500s*. That was wrong — they do log. The real finding is more interesting: the repo invested in a hardened structured logger with production redaction, and a third of the routes route around it, so the redaction guarantee does not hold where it matters.

---

## 6. Repo & process hygiene

| # | Gap | Evidence | Severity |
|---|---|---|---|
| 6.1 | 10 stale remote branches | 5 untouched for ~9 months (`feature/Authentication`, `Dark-Mode`, `Dashboard_layout`, `Landing_Page`, `adding_database`), 5 for ~3 months | 🟡 P2 |
| 6.2 | Commits auto-push to `development-branch` | `refs/remotes/origin/development-branch` reflog shows `update by push` for commits made locally, with **no hook installed** in `.git/hooks` and no matching `git config`. Cause unknown — worth understanding before it ships something unintended | 🟡 P2 |
| 6.3 | No PR template, issue templates, CODEOWNERS, or branch protection | `.github/` contains only `ci.yml` | 🟡 P2 |
| 6.4 | Seed data is unvalidated | 23 `any` across 5 seed files; one `@ts-expect-error` at `config/interview/seed-data.ts:25496`. The 130-orphan interview-question bug was exactly this class of defect | 🟡 P2 |

6.4 deserves a note: Zod exists in the project and is applied to API inputs. It is **not** applied to seed data, which is 25,000+ lines of hand-written content feeding the database directly.

---

## 7. Company practice vs. this repo

| Practice | Typical funded company | Here | Verdict |
|---|---|---|---|
| Tests gate merges | ✅ | ❌ none | **Gap** |
| Lint gate merges | ✅ | ❌ not installed | **Gap** |
| CI runs on every branch | ✅ | ❌ master only | **Gap** |
| Green gate required to merge | ✅ | ❌ never green | **Gap** |
| Automated dependency updates | ✅ Dependabot | ❌ | **Gap** |
| Error tracking in production | ✅ | ❌ | **Gap** |
| Security headers reviewed | ✅ | ⚠️ 1 of 6 | **Gap** |
| Onboarding documentation | ✅ | ❌ boilerplate | **Gap** |
| Automated schema-drift check | ✅ | ❌ | **Gap** |
| Architectural decision records | ✅ | ✅ plans + decision tables | **Ahead** |
| Written post-mortems of failures | ✅ | ✅ Known Debt | **Ahead** |
| Conventional commits | ✅ | ✅ | **Match** |
| Rate limiting / auth hygiene | ✅ | ✅ | **Ahead** |
| Free-tier cost discipline | rare | ✅ documented per feature | **Ahead** |

Four rows ahead is not nothing — the documentation culture here is genuinely better than most teams' — and it is the reason the *content* of this repo is trustworthy. It is also why the remaining gaps are all mechanical.

---

## 8. What deliberately not to copy

Listed because "add a test framework" is a reflex, and at this scale several standard practices are pure ceremony with nobody to enforce them:

- **Jest / Vitest / Playwright** — `node:test` covers the need at zero dependency cost
- **Sentry / PagerDuty / on-call rotation** — one developer does not page
- **Coverage % as a hard merge gate** — incentivises assertion-free tests
- **CONTRIBUTING.md** — no contributors to contribute
- **Feature-flag infrastructure, blue/green deploys, service decomposition** — the free-tier budget and single-operator scale do not justify them

This follows the repo's own KISS/YAGNI rule in `.agent/ENGINEERING.md`. Violating it to look professional would be the same mistake as shipping a gate that always fails.

---

## 9. Remediation order

Ordered by ratio of risk-removed to effort. Each row is independently shippable.

| Phase | Work | Files | Why here |
|---|---|---|---|
| **1** | README rewrite | `README.md` | Cheapest high-impact item. Front door for every future reader, including you |
| **1** | Un-break the format gate | repo-wide, 53 files | Own commit, exactly as Known Debt prescribes. Restores an honest CI signal |
| **1** | CI triggers on `development-branch` | `.github/workflows/ci.yml:3-7` | Until this exists, no later CI work is observable |
| **2** | `npm test` + tests for `parse-id`, `editor`, `config/system-design` | `package.json`, 3 test files | Closes the untested security boundaries |
| **2** | Add CI `test` step | `.github/workflows/ci.yml` | Only after `npm test` exists, or the gate just moves |
| **3** | Dependabot | `.github/dependabot.yml` | 7 majors behind is a ticking clock, and auto-PRs cost no attention |
| **3** | Harden CSP, add missing headers | `next.config.ts` | Closes 4.1/4.2 |
| **3** | Unify logging onto `log` | 6 route files | Makes the I.8 redaction guarantee actually hold |
| **4** | ESLint + CI lint step | `eslint.config.mjs`, `package.json`, workflow | Needs 2 devDependencies; useful, not urgent |
| **5** | Stale branch cleanup, PR template, migration-drift check | remote, `.github/` | Process polish |

**On the stale `45` in Known Debt:** replace it with a statement that the gate is *enforced* (CI runs `format:check` and must pass), not with the number `53`. A number goes stale the next time a file is edited; that is the exact failure mode the tracker already records for hand-maintained anchors and interview-question counts.

---

## 10. Caveats in this assessment

Stated so the report is not trusted beyond its evidence:

- **`npm audit` timed out** against the registry. The outdated-package data is solid, but whether any of the 55 carry a known CVE is **unconfirmed**.
- **No end-to-end run was performed.** Findings come from static inspection plus the CI commands themselves, not from exercising flows in a browser.
- **No performance measurement** was taken — bundle size, Core Web Vitals, and route-level timings are all unassessed. Vercel Speed Insights is installed but its data was not read.
- **Accessibility was not assessed** beyond confirming no tooling exists (no axe, no testing-library). This is likely a real gap given dark-mode-only UI, but it is unquantified.
- **Log-shipping and alerting configuration** on Vercel was not inspected.

---

→ See `feature-tracker.md` for delivery status and `WORKFLOW.md` for the build process this report assumes