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
| 1.1 | ~~**CI never runs on your work**~~ | **Resolved** — `ci.yml` triggers on `master` **and** `development-branch` for both `push` and `pull_request`, plus `workflow_dispatch`. **Closed by observation, not by edit**: CI #31 ran green on `development-branch` at `3462517`, which also proves the `CI/CD` environment has no required reviewers (a gated one would queue instead of completing). Verification in §11 | ✅ Fixed |
| 1.2 | ~~**CI's only style gate is permanently red**~~ | **Resolved** — `npx prettier --write .` applied to 53 files; `format:check` now exits 0. Verification in §11 | ✅ Fixed |
| 1.3 | ~~No tests, no `test` script, no CI test step~~ | **Addressed in the tree, awaiting first observed run** — `npm test` on `node:test` + `tsx`, **zero new dependencies**; 45 tests across 3 files, gated in CI between `Format check` and `Build`. Not marked resolved: CI has not yet run this step on `development-branch`. Verification in §11 | 🟡 P1 |
| 1.4 | No linter at all | ESLint is not installed and no config exists. `next lint` was removed in Next 16, so there is no linting path at all | 🟠 P1 |
| 1.5 | CI is fragile | `ci.yml:21-24` requires a `CI/CD` environment plus `DATABASE_URL`. **Now confirmed by measurement** (§11): with `DATABASE_URL` unset the build exits 1 — `/interview` is statically prerendered and its chapter query throws rather than degrading. The DB secret is load-bearing, not a convenience | 🟠 P1 |
| 1.6 | ~~Schema drift is undetectable in CI~~ | **Resolved** — `npm run check:migrations` runs `drizzle-kit generate` and fails if it writes anything. Converts "a missing migration surfaces at runtime, in production" into a red build. Precondition was verified before adoption: the repo was **not** drifted. Verification in §11 | ✅ Fixed |

> **A gate that always fails is worse than no gate.** It teaches the team to ignore CI, which is why the formatting failure sat in Known Debt for weeks instead of being a two-minute fix. The same logic applies to 1.1: a CI badge that never runs is indistinguishable from no CI, only more comfortable.

> **Update:** 1.2 and 1.1 are both closed (§11) — 1.1 by CI #31 going green on `development-branch`, which is the observation the format-gate Known Debt entry was waiting on. **That entry's enforcement claim is now true** and has been written. 1.3 is addressed in the tree and unverified in automation, so the honest summary of this section is: the pipeline observes the branch and runs two gates; a third is staged.

`.agent/feature-tracker.md` records the failing-file count as **45**. It is now **53**. That number is already stale, and any specific count will be obsolete the moment the next file is edited — see the remediation note in §7. §11 removed the stale entry entirely rather than replacing `45` with `53`.

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
| 3.1 | ~~Zero tests anywhere in the repo~~ | **Addressed in the tree** — 45 tests, 14 suites, across 3 files in `tests/`. `npm test` runs `node:test` through `tsx`. Verification in §11 | 🟡 P1 |
| 3.2 | ~~**Security boundaries are untested**~~ | **Addressed in the tree** — all three named targets covered: `lib/parse-id.ts`, `lib/editor.ts:115`, and `config/system-design/registry.ts` (the last was not in the original list; see §11). One boundary is **not** covered and cannot be from a unit test — see the caveat below. Verification in §11 | 🟠 P1 |
| 3.3 | No coverage or mutation measurement | — | 🟡 P2 |
| 3.4 | No API-route integration tests | 18 routes, 0 tests | 🟡 P2 |

> **3.2 is narrower than it looks, and the narrowing is not closable by adding more tests.** The assertion that actually protects the learner is the `sandbox="allow-scripts"` attribute on the consuming `<iframe>` (`components/editor/BrowserPreview.tsx:37`, `app/(routes)/learn/[courseId]/[chapterId]/LessonClient.tsx:307`). That lives in `.tsx` and cannot be asserted from a unit test. `tests/editor.test.ts` documents this in-file rather than leaving it to look like coverage: **passing the editor suite does not mean lesson code is contained.** Closing this properly needs a component or E2E layer — deliberately out of scope per §8.

### 3.2 expanded — why `parse-id` deserved a test

`parsePositiveInt` claims in its own doc comment to reject `"1.5"`, `"1abc"` and `""`. It does. Probing it further found behaviour that is **correct but undocumented and almost certainly accidental**:

| Input | Result | Note |
|---|---|---|
| `"0x10"` | `16` | hex notation accepted |
| `"1e3"` | `1000` | scientific notation accepted |
| `"+12"`, `" 12 "`, `"12.0"` | `12` | lenient whitespace/sign |
| `"٣"` (Arabic-Indic digit) | `null` | correctly rejected |

Harmless in practice — no route has an id of `0x10` — but it was unpinned behaviour discovered by reading, which is exactly the category of thing a test converts from accident to decision. **Now pinned** in `tests/parse-id.test.ts`, labelled *"accepted by `Number()`, never chosen"*, so that tightening the parser fails the suite loudly instead of arriving as a refactor side effect. Tightening to `/^\d+$/` is the correct rule and remains unapplied: it changes behaviour across every route at once and deserves its own commit.

### 3.1 — the harness was free

`node:test` driven through `tsx` was verified working in this repo: `@/` path aliases resolve, no new dependency, no config. **"No test framework" was not a blocker** — it was a one-line `package.json` entry. **The finding was correct and is now acted on**; the suite runs 45 tests in ~0.4s.

### 3.3 — mutation testing, which §8 did not anticipate

§8 recommends *against* Jest/Vitest/Playwright as ceremony. That judgement is right about *dependencies*. But a suite that has never been observed failing is an untested gate — the same defect §11 records for `check:blog-toc`. Each target was therefore deliberately broken and re-run: `Number()`→`parseInt()` failed 6 tests, dropping the `<head>` stylesheet injection failed 2, and reverting `Object.hasOwn` to a truthiness guard failed 9. The gate bites; that is now evidence rather than assumption. Coverage *percentage* is still not measured, and per §8 still should not gate a merge.

---

## 4. Security hardening

| # | Gap | Evidence | Severity |
|---|---|---|---|
| 4.1 | **CSP provides near-zero script protection** | `next.config.ts:25` — `script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https:`. The `https:` wildcard permits script execution from **any origin**, so an XSS has no containment. Combined with `unsafe-inline` and `unsafe-eval`, the directive is close to decorative for its main threat | 🟠 P1 |
| 4.2 | ~~One security header out of six~~ | **Resolved** — `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Permitted-Cross-Domain-Policies` added in `next.config.ts`. Verified **served**, not assumed: `next start` + `curl` against `/` and `/blog/feed.xml`. Verification in §11 | ✅ Fixed |
| 4.3 | No Dependabot; dependency drift unmonitored | **Deliberately not adopted.** The original evidence was 55 outdated / 7 majors behind, which is hygiene, not risk. The actual risk turned out to be different and is now closed — see 4.3a | 🟡 P2 |
| 4.3a | ~~(new) Critical CVEs in the auth boundary~~ | **Resolved** — `npm audit` succeeded where it had previously timed out, and reported **22 vulnerabilities: 3 critical, 11 high, 8 moderate**. Two criticals bypassed `proxy.ts`, which *is* this app's auth boundary. Patched to **0 critical / 0 high / 6 low-moderate**, all remaining in dev-only tooling. Verification in §11 | ✅ Fixed |
| 4.4 | ~~No `npm audit` in CI~~ | **Resolved** — `npm audit --audit-level=high` runs in CI, after `npm ci`. Gated at `high` deliberately: plain `npm audit` exits 1 on 6 moderate/low dev-tooling advisories, and a permanently red gate is worse than none. Verification in §11 | ✅ Fixed |

**Already correct and worth keeping:** `.env.example` is complete with every value empty; `.env` is gitignored; no secrets are tracked; `/api/cron/cleanup` is bearer-token gated (`app/api/cron/cleanup/route.ts:11-20`); admin auth is a fail-closed allowlist; Mermaid/XSS boundaries in the blog are covered by CSP.

**4.1 is now unblocked and is the largest remaining security gap.** Two things changed. The patched Next (16.4) fixes the *"cross-site scripting in App Router applications using CSP nonces"* advisory, and ships **SRI** (Subresource Integrity, experimental) as the path to dropping `'unsafe-inline'`.

**SRI, not nonces.** The documented way to add nonces is `proxy.ts`, and it would be a serious regression here:

> *"Using nonces in your CSP, **all pages must be dynamically rendered**... Static optimization and Incremental Static Regeneration (ISR) are disabled... No CDN caching... **PPR is incompatible with nonce-based CSP.**"*

This app has 17 static routes and 14 at a deliberately measured `1h` window — worth ~0.4% of the Vercel function budget instead of the ~26% recorded in §16.1. Nonce CSP would hand all of that back. SRI generates build-time hashes instead, preserving static generation and CDN caching. React 19.3's **Trusted Types** is a third path and needs no nonce at all — but `react` is pinned at `19.2.3`, so that is a second framework change.

**Ruled out by reading the code, not assumed:** no Server Actions exist (so the null-origin CSRF advisory does not apply); AVIF is not enabled in `images.formats` (so the Image Optimization RCE does not apply); there are no org or billing tables (so Clerk's second critical does not apply); Vercel is Linux (so the Windows-hosted RCE does not apply).

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
| CI runs on every branch | ✅ | ✅ `master` + `development-branch`, observed green | **Match** |
| Tests gate merges | ✅ | ⚠️ 45 tests exist and run in CI; unverified in automation, and no branch protection makes green *required* | **Closing** |
| Green gate required to merge | ✅ | ⚠️ gate now runs on the right branch, but no branch protection — green is still not *required* | **Gap** |
| Automated dependency updates | ✅ Dependabot | ❌ *deliberate* — a `npm audit` CI gate catches advisories; routine version PRs on an untested app are churn, not safety | **Gap (chosen)** |
| Error tracking in production | ✅ | ❌ | **Gap** |
| Security headers reviewed | ✅ | ✅ all six present and verified served | **Match** |
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
| **1** | ~~Un-break the format gate~~ | repo-wide, 53 files | **Done** (§11). Own commit, exactly as Known Debt prescribes. Restores an honest CI signal |
| **1** | ~~CI triggers on `development-branch`~~ | `.github/workflows/ci.yml:4-11` | **Done** (§11). Closed by CI #31 going green, not by the edit |
| **1** | ~~`check:blog-toc` wired into CI~~ | `.github/workflows/ci.yml` | **Done** (§11). A free gate for a drift class Known Debt already records, never wired up. Must run *after* `Build` |
| **2** | ~~`npm test` + tests for `parse-id`, `editor`, `config/system-design`~~ | `package.json`, 3 test files | **Done** (§11). Zero new dependencies; 45 tests |
| **2** | ~~Add CI `test` step~~ | `.github/workflows/ci.yml` | **In tree** (§11). Runs before `Build` so a regression fails in seconds, not minutes. Unverified in automation |
| **3** | Dependabot | `.github/dependabot.yml` | 7 majors behind is a ticking clock, and auto-PRs cost no attention |
| **3** | Harden CSP, add missing headers | `next.config.ts` | Closes 4.1/4.2 |
| **3** | Unify logging onto `log` | 6 route files | Makes the I.8 redaction guarantee actually hold |
| **4** | ESLint + CI lint step | `eslint.config.mjs`, `package.json`, workflow | Needs 2 devDependencies; useful, not urgent |
| **5** | ~~Stale branch cleanup, PR template~~ | remote, `.github/` | Process polish |
| ~~5~~ | ~~migration-drift check~~ | `scripts/check-migration-drift.ts`, `ci.yml` | **Done** (§11). Was Phase 5 "process polish" because no gate existed to receive it — one now does |

**On the stale `45` in Known Debt:** replace it with a statement that the gate is *enforced* (CI runs `format:check` and must pass), not with the number `53`. A number goes stale the next time a file is edited; that is the exact failure mode the tracker already records for hand-maintained anchors and interview-question counts. **Written** — CI #31 ran `format:check` and passed on `development-branch`.

---

## 10. Caveats in this assessment

Stated so the report is not trusted beyond its evidence:

- ~~**`npm audit` timed out** against the registry.~~ **Obsolete, and it was the most consequential caveat in this report.** The audit now runs: **22 vulnerabilities, 3 critical, 11 high**, all now patched to 0/0. The lesson is recorded in §11 — an unmeasured risk stated as *unconfirmed* is still unmeasured, and it stayed that way for longer than the packages it described.
- **Auth behaviour after the Clerk/Next upgrade was checked by status code, not by signing in.** `proxy.ts` responses were verified with `curl` (`/dashboard` → 307 to sign-in, `/admin` → 307, public routes → 200), but no session was created. The Clerk advisory was a *route protection bypass*, so the status codes are the right instrument — but a signed-in `/admin` → `/` redirect and a real sign-in round trip remain **manually unverified**.
- **No performance measurement** was taken — bundle size, Core Web Vitals, and route-level timings are all unassessed. Vercel Speed Insights is installed but its data was not read. The upgrade was reported subjectively as "feels fast" after bumping `next` 16.1.1 → 16.4.2; parts of that (Turbopack memory eviction, persistent build cache, lazy compilation) are **dev-server only** and are not evidence of a production improvement.
- **Accessibility was not assessed** beyond confirming no tooling exists (no axe, no testing-library). This is likely a real gap given dark-mode-only UI, but it is unquantified.
- **Log-shipping and alerting configuration** on Vercel was not inspected.
- **No CI run has yet exercised the new `test` step.** §11 records local, command-level verification for 1.3 only. CI #31 predates it. The same rule that kept 1.1 open until #31 went green keeps 1.3 open now.
- **CI #31 was observed via its aggregate check status, not its step log.** GitHub fails the job if any step fails, so step-level green follows — but `gh` is not installed on this machine, so the log itself was not read.

---

## 11. Remediation log

Appended as work lands, so this report does not repeat the staleness it criticises in §9.

### 1.2 — Format gate re-established

**Change:** `npx prettier --write .` across 53 files, committed on its own as the Known Debt entry required. No dependency, no config change, no behavioural change.

**Verified by running, not reasoning:**

| Check | Result |
|---|---|
| `npm run format:check` | exit 0 — "All matched files use Prettier code style" |
| `npm run check:blog-toc` | 51/51 anchors resolve, 5/5 posts registered |
| `npm run typecheck` | exit 0 |
| `npm run build` | exit 0, route table unchanged |
| Rendered HTML vs `ec0cb14` | all 5 blog posts render **byte-identical** |

**Why the last row is the one that matters.** The diff removed 13 `{" "}` repo-wide. Those are React's explicit-space markers, and "Prettier only removes them when a literal space is equivalent" is an argument, not evidence — this report criticises exactly that kind of reasoning elsewhere. So `HEAD` and the formatted tree were built separately and their prerendered HTML diffed:

- Extracted text content was identical on all five posts immediately.
- The DOM differed only in `<!-- -->` comments, which is how React serialises a `{" "}` that became a literal space.
- Normalising those, plus the per-build nonce and asset hashes, made all five posts byte-identical.

Prettier converts `{" "}` to a literal space only when surrounding reflow makes one redundant. Confirmed, not assumed.

**Ordering note.** This was done *before* 1.1 deliberately. Flipping the CI trigger first would have turned every push on `development-branch` red for a reason already fixed in the working tree — which re-teaches the "ignore CI" habit 1.2 exists to kill. Green first, then visible.

**Known Debt.** The tracker's `format:check fails on 45 files` entry is removed — it was false twice over (45 was already stale, then became 0). It is **not** replaced with a claim that the gate is *enforced*, because it is not yet: `ci.yml` still triggers on `master` only. That claim becomes true in 1.1, and should be written then.

**Still open in this section:** 1.1 as of this entry — see the 1.1 entry below for the current state.

---

### 1.1 — CI now observes the branch work happens on

**Change:** `.github/workflows/ci.yml` only. Three edits: `push` and `pull_request` now list `master` **and** `development-branch`; `workflow_dispatch` added; `check:blog-toc` wired in as a post-`Build` step. No dependency, no config change, no application code.

**Status: addressed in the tree, not closed.** A workflow edit is a claim; this gap closes when a green run is *observed* on `development-branch`. That has not happened. `workflow_dispatch` exists so the question is answerable before the gate is trusted, not after.

**Verified by running, in workflow order:**

| Step | Result |
|---|---|
| `npm run build` | exit 0 — 17 static routes: 14 at the `1h` window, 3 with none (`/blog/feed.xml`, `/blog/opengraph-image`, `/robots.txt`). The `1h` TTL recorded in tracker §16.1 holds on `/interview`, `/interview/customize`, `/interview/stack`, `/problems`, `/profile`, `/whats-new` and `/_not-found` — i.e. no route regressed to a shorter window |
| `npm run check:blog-toc` | exit 0 — 9/9, 21/21, 6/6, 8/8, 7/7 anchors; 5/5 posts registered |
| `npm run typecheck` | exit 0 |
| `npm run format:check` | exit 0 |
| `yaml.safe_load(ci.yml)` | valid; step order as listed above |

**`check:blog-toc` must run after `Build` — and that ordering is measured, not assumed.** The script reads prerendered HTML from `.next/server/app/blog` (`scripts/check-blog-toc.ts:19,26`). Run against a tree that has not been built, it reports `FAIL <slug>: no prerendered HTML. Did the post render?` on all five posts. It is a post-build gate, not a standalone one. Placing it before `Build` would have produced a permanently red CI on an otherwise passing repo — the §1 failure mode this report opens with, introduced by the fix for it.

**1.5 corrected upward, because I got it wrong first.** Scoping this work, I claimed 1.5's premise was unsubstantiated. The reasoning: the root layout's notice fetch catches and returns `null`, therefore the build should not need a database. Measured, it does:

```
Error occurred prerendering page "/interview".
Error: Failed query: select `category_id` from `interview_category_chapters`
    [cause]: connect ECONNREFUSED 127.0.0.1:3306
Export encountered an error on /(routes)/interview/page: /interview, exiting the build.
```

`/interview` is statically prerendered — it carries the `1h` ISR window §16.1 measured — and its chapter query throws rather than degrading. **The `DATABASE_URL` secret is load-bearing.** The original 1.5 evidence stands; only the specific failure is now pinned.

The generalisable lesson is the sibling of one already in Known Debt (*`npm run typecheck` passing is not sufficient verification*): **asserting a conclusion from a partial sample of the surface is the same error as asserting it from reading.** My sample was one call site out of roughly a dozen prerendered routes — and the one I checked was the one I already knew was guarded.

**`environment: CI/CD` left unchanged, deliberately.** Removing it was considered, on the reasoning that a build needing neither database nor secret would be more robust. Measurement killed that: the build does need the database, and dropping the line would have silently broken env-scoped secret resolution. Altering secret-access semantics is not in scope for "flip the trigger", and should not be bundled into a change whose point is making a gate visible.

**Open in this section:** confirm the `CI/CD` environment has no **required reviewers**. If it does, runs queue indefinitely instead of failing fast, and 1.1 would present as permanently "in progress" rather than broken — a failure mode that looks like progress. `gh` is not installed locally, so this was not checkable from the working tree.

---

### 1.1 — closed by observation

The entry above withheld the closure deliberately. It is now closed, and not by the edit — by a run.

**CI #31** executed on `development-branch` at `3462517` and passed. That single observation discharges three separate open questions at once:

| Question it answers | How |
|---|---|
| Does CI actually run on the working branch? | The run exists |
| Does `CI/CD` have required reviewers? | **No** — a gated environment would queue the job indefinitely instead of completing it |
| Is the format gate now *enforced*, not merely green locally? | `format:check` ran as a step and the job passed |

The third row is what the Known Debt format-gate entry had been waiting on since it was written. That entry's wording was conditional — *"record the enforcement claim when a green CI run is observed on `development-branch`, not when the workflow file changes"* — and the condition has now occurred. The claim is written.

**What this still does not give.** No branch protection exists, so a red PR can still be merged. The gate produces a signal; nothing compels anyone to read it. That is gap 6.3, unchanged.

**Evidence grade:** the aggregate check status, not the step log — `gh` is not installed here. GitHub fails the job if any step fails, so step-level green follows, but the log was not read.

---

### 1.3 + 3.1 + 3.2 — a test harness, zero dependencies

**Change:** one line in `package.json`, three new files under `tests/`, one CI step. No new dependency, no config file, no framework.

```json
"test": "node --import tsx --test \"tests/**/*.test.ts\""
```

**Verified by running, in workflow order:**

| Step | Result |
|---|---|
| `npm test` | exit 0 — **45 tests, 14 suites, ~0.4s** |
| `npm test` with `DATABASE_URL` unset | exit 0, 45/45 — no test file reaches `config/db` |
| `npm run typecheck` | exit 0 |
| `npm run format:check` | exit 0 (caught 2 unformatted test files first; fixed with `prettier --write tests/`) |
| `npm run build` | exit 0 |
| `npm run check:blog-toc` | exit 0 |

**The database check is here because I got the equivalent question wrong last time.** During 1.1 I asserted the build did not need a database, on the strength of one call site I had already checked, and measurement contradicted it. So this suite was run with `DATABASE_URL` deliberately blanked rather than reasoned about. It passes, and `grep` confirms no transitive path from any test to `config/db`. That is why the step can sit *before* `Build`: it needs neither a database nor a network, and a regression fails in seconds instead of after a two-minute build.

#### The gate was mutation-tested before being trusted

A suite that has never been observed failing is an untested gate — the defect §11 already records for `check:blog-toc`. Each target was deliberately broken and re-run:

| Mutation | Result |
|---|---|
| `parse-id`: `Number()` → `parseInt(raw, 10)` | **6 failures** |
| `editor`: drop the `<head>` stylesheet injection | **2 failures** |
| `registry`: `Object.hasOwn` → truthiness guard | **9 failures** |

The third is the one that matters most: it re-introduces the exact prototype-chain bug that `registry.ts:51-57` documents at length, and nine tests catch it.

#### A fourth target the report never listed

`config/system-design/registry.ts:10` states that `npm run check:system-design` verifies the registry in both directions. **That script does not exist** — not in `package.json`, not in `scripts/`, and there is no `config/system-design/modules/` and no system-design route in `app/`.

So `getModule`'s prototype-chain guard — the one security invariant in that module — was protected by nothing at all. `LOADERS` is an empty map until Task 13 authors the content, which means `next build` never calls the function, no route renders it, and `tsc` cannot see it because the code is correct right now. A refactor that "simplified" `Object.hasOwn(LOADERS, slug)` back to `if (!loader) return null` would have passed every layer this repo owns.

This is the same failure class as the unwired `check:blog-toc`, one step worse: not a gate that is written but unrun, but a gate that is *named* and never written. Documented in `tests/system-design-registry.test.ts` rather than deleted from the source, so the next reader inherits the fact instead of the false promise.

#### What the tests deliberately pin as *accidents*

`tests/parse-id.test.ts` asserts that `"0x10"` → `16`, `"1e3"` → `1000`, `"+12"` → `12`. None of that was chosen. The suite names the block *"accepted by `Number()`, never chosen"* so that tightening the parser fails loudly in review instead of arriving as a refactor side effect. `/^\d+$/` is the correct rule; applying it changes behaviour across every route at once and belongs in its own commit, not as a quiet edit inside a test-harness change.

#### One coverage claim deliberately not made

`tests/editor.test.ts` asserts that markup passes through `buildSandboxedSrcDoc` **unescaped, in all three branches**, with the reasoning inline: the input is authored lesson content, escaping it would show learners literal `&lt;div&gt;`, and containment comes from `sandbox="allow-scripts"` — not from this string helper.

The file also says, in terms, that **passing these tests does not mean lesson code is contained.** The assertion that would is the `sandbox` attribute on a `.tsx` `<iframe>`, unreachable from a unit test. 3.2 is downgraded to 🟠 P1, not closed, because of that gap — and per §8 the component/E2E layer that would close it is explicitly not being built.

#### Honest status

1.3 is **not** marked resolved. CI #31 predates this change, so the `test` step has never run on `development-branch`. The rule that held 1.1 open until an observation arrived holds 1.3 open now.

---

### 4.2 + 4.3a + 4.4 — the CVEs behind the "unconfirmed" caveat

**Change:** `package.json` + lockfile, one CI step, five headers in `next.config.ts`.

**The finding.** §10 recorded that `npm audit` had timed out against the registry, so whether any of the 55 outdated packages carried a known CVE was *"unconfirmed"*. That was the single most consequential unmeasured claim in this report, and it was also the cheapest thing on this list to close. The audit ran in seconds once attempted:

| | Before | After |
|---|---|---|
| Critical | 3 | **0** |
| High | 11 | **0** |
| Moderate | 8 | 4 |
| Low | 0 | 2 |
| **Total** | **22** | **6** |

**Why the three criticals mattered here specifically.** Two were not hygiene findings:

- `@clerk/nextjs` ≤ 6.39.2 — *"Middleware-based route protection bypass"*
- `next` ≤ 16.3.7 — several *"Middleware/Proxy bypass in App Router"*

`proxy.ts` runs `auth.protect()` on every route outside `isPublicRoute`, and §5.2 of this report already records that **the proxy, not the per-handler `auth()`, is the real auth boundary**. Both advisories bypass exactly that file, on a site where people sign in.

**Ruled out by reading the code, not by assuming:** no Server Actions exist (null-origin CSRF advisory N/A); AVIF is not in `images.formats` (Image Optimization RCE N/A); no org or billing tables (Clerk's second critical N/A); Vercel is Linux (Windows RCE N/A).

**Verified by running, in exact `ci.yml` order:**

| Step | Result |
|---|---|
| `npm audit --audit-level=high` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm run format:check` | exit 0 |
| `npm test` | exit 0 — 45/45 |
| `npm run build` | exit 0 |
| `npm run check:blog-toc` | exit 0 |
| route table | 52 / 17 static / 14 at `1h` / 3 no-window — identical to every build measured before it |

**The pin nearly got undone.** `npm install next@16.4.2` silently rewrote `"next": "16.4.2"` to `"^16.4.2"`. The exact pin exists so framework drift cannot arrive unannounced, and a security patch is not a reason to remove it. Restored to exact, and `npm install` re-run to confirm the lockfile still agreed.

**Why the audit gate is `high` and not plain.** The 6 remaining advisories are all moderate/low and all in dev-only tooling (`drizzle-kit` → `@esbuild-kit` → `esbuild`) plus low-severity `dompurify` and `monaco-editor`. Plain `npm audit` **exits 1** on those. Gating on them would be red CI on a commit that changed no code — the §1 failure mode this report opens with. `high` still catches the class that actually bit here, and the advisories were cleared **in the same commit that added the step**, because a gate and the patch that makes it pass are not separable.

**Deliberately not done:** Dependabot version updates, Cache Components, React 19.3, SRI. All worth doing; all are separate changes.

**4.2** — five headers added and **verified served**, not assumed: `next start` + `curl` against `/` and `/blog/feed.xml`. Two were checked rather than assumed: `frame-ancestors` does not affect this app's own `srcdoc` lesson iframes (`BrowserPreview.tsx:34`, `LessonClient.tsx:305`), and HSTS is ignored over `http` so `npm run dev` is unaffected.

---

### Two bugs found while verifying the above

Neither caused by the upgrade. Both were found *because* of it.

**`/api/cron/cleanup` was unreachable.** The proxy intercepted before the handler: Vercel Cron sends no session cookie, the path is not in `isPublicRoute`, so `auth.protect()` 307'd the job to `/sign-in` and the handler's bearer-token check never ran. The nightly rate-limit cleanup was silently not executing — while §4 of this report describes that route as legitimately public. The two files simply disagreed.

Fixed by adding `/api/cron(.*)` to `isPublicRoute`. **Verified end-to-end with `curl`:**

| Request | Before | After |
|---|---|---|
| `/api/cron/cleanup`, no token | 307 → `/sign-in` | **reaches handler** (fail-closed 500 locally: `CRON_SECRET` unset) |
| `/api/cron/cleanup`, wrong token | 307 → `/sign-in` | **reaches handler** → 401 in prod |

Controls re-checked in the same run, all unchanged: `/dashboard` → 307 to sign-in, `/admin` → 307, `/robots.txt` → 200, `/sitemap.xml` → 200, `/` → 200, `/api/health` → 200. The auth boundary is intact.

**`acquireTimeout` was never applied.** `config/db.tsx` passed it with a comment claiming it was *"honored at runtime"* despite not being in `mysql2`'s `PoolOptions` typings. mysql2 says otherwise, six times per build:

```
Ignoring invalid configuration option passed to Connection: acquireTimeout.
This is currently a warning, but in future versions of MySQL2, an error
will be thrown...
```

So the 15s queue-wait bound that tracker **I.5** credited for surviving TiDB cold starts **was not in effect**, and the option would eventually become a hard error rather than a warning. Removed, along with the `& { acquireTimeout: number }` widening that existed only to appease the missing typing. Verified: build exit 0 and **zero** `acquireTimeout` occurrences in the log. Behaviourally a no-op today — it removes a false claim and a future breakage. Queued requests remain bounded by `queueLimit: 25`; cold-start patience by `connectTimeout` plus `lib/db-retry`.

---

→ See `feature-tracker.md` for delivery status and `WORKFLOW.md` for the build process this report assumes### 1.6 — schema drift, caught before production

**Change:** `scripts/check-migration-drift.ts`, one `package.json` entry, one CI step. No new dependency — `drizzle-kit` and `dotenv` were already present.

**The precondition was measured before the gate was written, not after.** Every other gate added in this report would have gone red on arrival if its target was already broken, so the first thing to establish was whether the repo is drifted:

```
$ npx drizzle-kit generate
No schema changes, nothing to migrate
```

Clean. The gate was safe to adopt.

**What it catches.** Nothing else in this workflow notices a schema change committed without its migration. `tsc` passes — the schema compiles. The 45 tests pass — none of them reach `config/db` by design. The build succeeds. The route table is unchanged. The app then fails at runtime, in production, on the first query that touches the new column.

**Verified by running, in exact `ci.yml` order:**

| Step | Result |
|---|---|
| `npm audit --audit-level=high` | exit 0 |
| `npm run check:migrations` | exit 0 — *new* |
| `npm run typecheck` | exit 0 |
| `npm run format:check` | exit 0 |
| `npm test` | exit 0 — 45/45 |
| `npm run build` | exit 0 |
| `npm run check:blog-toc` | exit 0 |

**Mutation-tested before being trusted.** A column (`drift_probe`) was added to `usersTable` in `config/schema.tsx` with no migration:

```
FAIL schema drift: config/schema.tsx has changes with no migration.

   M drizzle/meta/_journal.json
  ?? drizzle/0011_wealthy_liz_osborn.sql
  ?? drizzle/meta/0011_snapshot.json
```

exit 1, naming all three files and telling the developer the fix is to commit the migration. Schema restored, generated files deleted, journal reverted — gate returns to exit 0. A gate that has never been observed failing is an untested gate, which is now a Known Debt entry.

**Two design decisions that a simpler version would have got wrong.**

*It compares before-and-after, it does not ask "is `drizzle/` dirty".* A developer who has **already** generated the migration but has not committed it has a dirty `drizzle/` directory. A dirty-check would report drift for a migration that already exists and tell them to generate one they already have — failing the correct action. This was not reasoned about in the abstract; the case was run:

| Tree state | Result |
|---|---|
| Clean, schema matches | `OK`, exit 0 |
| Schema changed, no migration | `FAIL`, exit 1, names the files |
| Migration generated but **uncommitted** | `OK`, exit 0 — nothing is missing |

`git diff --exit-code` is also deliberately **not** used. A newly generated migration is *untracked*, and `git diff` only compares tracked files — it would miss the exact condition the check exists to catch. It would incidentally notice the `_journal.json` edit, but that is a side effect, not the mechanism.

**Cost:** one `generate` run, ~2 seconds, no network, no database connection. It needs `DATABASE_URL` only because `drizzle.config.ts` does `new URL(...)` at module load.

---

→ See `feature-tracker.md` for delivery status and `WORKFLOW.md` for the build process this report assumes
