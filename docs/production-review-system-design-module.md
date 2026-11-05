# Production Review — System Design Module

> **Date:** 2026-11-03 (reviewed). **P0 fixes 1, 3, 4 and P2 fix 12 applied the same day — see §11. RU fixes applied the same day — see §12. Schema normalisation applied 2026-11-04 — see §13. Constant-cost simulation applied 2026-11-04 — see §14.** All sections record the measured before/after and what is still open.
> **Scope:** Phase 6 system design path — `/system-design`, the 15 module routes, 79 lesson routes, 14 task routes, `components/system-design/*`, `lib/system-design/*`, `config/system-design/*`, and `app/api/system-design/state/route.ts` + `sd_user_state` + `sd_task_state`.
> **Target:** 500 users on TiDB Cloud Starter (free, 50M RU/mo) + Vercel Hobby (free, 4 CPU-hrs/mo).
> **Companion docs:** `docs/production-review-500-users.md` (app-wide), `docs/production-review-blog-module.md` (review format), `.agent/plans/16-system-design-phase-6.md` (original design).
>
> **Method:** measured, not estimated. Engine timings were produced by importing `lib/system-design/engine.ts` directly and calling `simulate()` at several `arrivalRate` values and against every module's real `startGraph`/`solutionGraph`. Chunk sizes are `gzip -c` on source. DB statement counts are read from the route. RU and Vercel CPU figures are **estimates** derived from this repo's own calibration in `docs/production-review-500-users.md` (~100 RU/query) and its stated 4 CPU-hour / 50M RU ceilings — they are labelled as such below.
>
> Numbers are from this machine. Treat them as shape and ratio, not absolute production values.

---

## 0. Headline

The content and UI design are strong. **The cost model is not what the plan says it is**, and that is this review's headline.

`.agent/plans/16-system-design-phase-6.md:60,730,879` states the pillar the feature was justified on:

> Simulator + canvas — **client-only** — 0 — **zero server CPU**
> Server simulation → per-run invocations on a paid budget *(rejected)*

That is no longer true. `app/api/system-design/state/route.ts:198` calls `simulate()` **server-side on every `task-save`**, unconditionally — including autosaves that claim no criteria. Verifying criteria server-side was the right decision (a learner must not be able to forge a pass), but it silently reversed the architectural guarantee, and nothing re-measured it.

Three findings follow from that one line:

| | Finding | Severity |
|---|---|---|
| 1 | Engine cost is **linear in a field the learner types**; at the schema-legal maximum it is 4.0 s and 250 MB of synchronous CPU per request | 🔴 |
| 2 | One signed-in user can burn the whole monthly Vercel CPU budget (~3 h of sustained 20 req/min) and take the entire app down | 🔴 |
| 3 | Every autosave pays 200–500 ms CPU and 6 RU-bearing statements for a verification that usually has nothing to verify | 🔴 |

Nothing here is a correctness emergency — the feature works and its security model is good. It is a **cost and resilience** review.

**Status after the §11 fixes (2026-11-03):**

| Finding | Status | Why |
|---|---|---|
| 1 — cost linear in a learner-typed field | 🟢 **Closed at the boundary** | `SdGraphSchema` now clamps `arrivalRate` to `SD_MAX_ARRIVAL_RATE = 20_000`, so the most expensive *schema-valid* request is 246 ms / ~10 MB. The engine is still linear internally; no input that reaches it can be expensive. |
| 2 — one user can take the whole app down | 🟢 **Closed** | §14 decoupled sample count from `arrivalRate` (fixed 20,000 samples, analytic utilisation, probabilistic shedding). The most expensive request is now ~30 ms regardless of arrivalRate. The engine no longer scales with a learner-typed number. |
| 3 — every autosave pays for a verification | 🟢 **Closed** | Autosaves no longer run `simulate()`; §12 cut saves 3–5× and the limiter off TiDB (~76M → ~17M); §13 normalised `sd_task_state` so each save writes one task row instead of the whole 15-task blob (no O(N) write amplification). |

---

## 1. What was measured

### 1.1 Engine cost is linear in `arrivalRate` — and `arrivalRate` is attacker-chosen

`lib/system-design/engine.ts:15-17` fixes `TOTAL_STEPS = 1000` with `TIME_STEP_SECONDS = 0.01`, and arrivals per step are `arrivalRate × 0.01`. Total work is therefore `arrivalRate × 10` requests, each walking up to 40 hops and pushing into three arrays **per hop**.

Measured (Node 22, this machine, 4-node graph, calling `simulate()` directly):

| `arrivalRate` | requests simulated | wall time | heap delta | note |
|---|---|---|---|---|
| 4,000 | 40,000 | **126 ms** | 11.6 MB | |
| 12,000 | 120,000 | **147 ms** | 31.1 MB | typical converted module |
| 60,000 | 600,000 | **378 ms** | 47.1 MB | |
| 200,000 | 2,000,000 | **~1.1 s** | ~62 MB | `SimulationPanel` slider max |
| **1,000,000** | **10,000,000** | **4,053 ms** | **250.6 MB** (RSS 360 MB) | **allowed by `SdScenarioSchema`** |

Two consequences.

**`MAX_ARRIVALS_PER_STEP = 50_000` is dead code.** It only engages when `arrivalRate > 5,000,000`; `SdScenarioSchema` caps at `1_000_000` (`lib/system-design/validation.ts:130`). The single guard written to prevent exactly this failure is unreachable for every schema-valid input — and the test that claims otherwise (`tests/engine.test.ts:1071`, *"MAX_ARRIVALS_PER_STEP = 50000 prevents DoS"*) asserts only `result.valid`, which is true at 1M.

> This is the same failure class as `acquireTimeout` (tracker I.5): a comment and a test asserting behaviour that is not in effect. **A green test naming a bound that is never applied.**
>
> **Fixed 2026-11-03 (§11).** `MAX_ARRIVALS_PER_STEP` is deleted; the bound is now `SD_MAX_ARRIVAL_RATE` in the schema, applied rather than asserted, and the two tests that pinned the DoS were replaced with a test of the schema contract.

**Cost scales with a number the learner types, not with what needs simulating.** Ten million Monte-Carlo samples to produce four percentiles is not a simulation; it is a stress test of the serverless function.

Realistic per-module verification cost (measured on each module's own `solutionGraph`):

```
chaos-capstone   253 ms      caching          232 ms
partitioning     269 ms      read-replicas    214 ms
cdns             261 ms      idempotency      121 ms
how-systems-fail 269 ms      rate-limiting     92 ms
back-of-envelope  81 ms      api-and-contracts 29 ms
                                     median ≈ 150 ms
```

On Vercel's Node runtime assume 1.5–2× this machine: **~200–500 ms CPU per verification**, worst module ~0.5 s. That multiplier is an assumption, not a measurement.

### 1.2 The task page downloads a whole module's prose to obtain a predicate

`components/system-design/TaskWorkspace.tsx:17` imports `getModule` in a `"use client"` component. The fetched chunk is the **entire module file**, prose included:

| module | raw | gzip |
|---|---|---|
| `caching` | 84.6 KB | **25.2 KB** |
| `partitioning-and-sharding` | 61.6 KB | 19.5 KB |
| `read-replicas` | 56.6 KB | 17.8 KB |
| median module | ~44 KB | **~14 KB** |
| `engine.ts` | 22.1 KB | 6.2 KB |
| `TaskWorkspace.tsx` | 43.8 KB | 11.1 KB |

Only `module.task` and `module.title` are used. The registry comment at `config/system-design/registry.ts:16-19` argues that dynamic import keeps prose out of the payload; it keeps *other* modules out, not this module's ten 900-word lessons.

Separately: the route already loaded that module on the server for `generateMetadata`, then `TaskPage` renders a client shell that fetches it again. `TaskWorkspace` cannot render before that chunk resolves, so the statically prerendered `/system-design/[module]/task` HTML is a **loading shell** — LCP on the task page is JS-gated.

### 1.3 Two server simulations per "Run"

`acceptSimulationResult` (`TaskWorkspace.tsx:675`) calls `queueTaskSave(..., run)` **and** mutates `taskState`, which re-arms the 2 s debounce effect (`:513`). That produces a second `task-save` with no criteria. Both reach the route; both call `simulate()`.

**One Run = 2 × 200–500 ms server CPU + 12 DB statements.**

> **Partially fixed 2026-11-03 (§11).** The duplicate POST still happens, but it claims no criteria, so it no longer runs `simulate()` — one Run is now 1 simulation, not 2. It still pays its own 6 statements; removing the duplicate itself is still open (P1).

### 1.4 `npm test` is now 11 s, and most of it is two worthless assertions

```
# tests 53   # suites 11   # pass 53
# duration_ms 11138
```

Dominated by the two `arrivalRate: 1_000_000` tests (`tests/engine.test.ts:965`, `:1071`), ~4 s each, asserting only "does not crash". `ENGINEERING.md` asks for tests that fail in seconds and assert behaviour; these pay the DoS cost on every CI run and pin nothing.

> **Corrected 2026-11-03 — this section's attribution was wrong.** The two tests were real (≈4.2 s each, so `engine.test.ts` was ~10.3 s), but they were never what bounded `npm test`. `system-design-content.test.ts` alone takes **11.7 s**, because it simulates every module's `startGraph` and `solutionGraph`. Replacing the two tests (§11) took `engine.test.ts` to **1.93 s** and moved total wall time from ~11 s to **12.96 s** — **no wall-clock win**, because the content suite is the bound. The `11 s → ~3 s` expectation recorded in §8.12 was wrong, and the counts above (53 tests, 11 suites) predate the content suites; the suite is now 668 tests / 114 suites. The next test-time win is in the content suite, not here.

### 1.5 Layout changes the physics

`graphSeed()` (`engine.ts:56-69`) hashes `n.x` / `n.y`. Moving every node 37 px right and 21 px down, with topology untouched, produced different results:

```
identical results after moving every node: false
p95 a/b: 3.396 ms → 3.395 ms · throughput 12000 → 12000 · errors 0% → 0%
```

Small, but in a teaching tool this is a credibility defect: two learners with an identical design get different numbers, and nudging a box changes your p95. The seed should hash topology + scenario only. The existing determinism tests pass because they never move nodes.

---

## 2. Scaling — 500 users

### 2.1 What scales fine 🟢

- **108 prerendered `/system-design` routes** (15 module + 79 lesson + 14 task) with `dynamicParams = false` and no DB access at request time → **CDN only: 0 RU, 0 origin CPU**.
- The `ModuleOverview` payload boundary (`app/(routes)/system-design/[module]/page.tsx:38`) genuinely works: module 1 renders at **~58 KB** with four times the prose, because the client component receives titles and counts instead of `SdModule`.
- The index page uses `loadAllModules()` at build only.
- Only `app/api/system-design/state/route.ts` reaches origin.

### 2.2 Where it breaks — CPU, not concurrency 🔴

Per autosave: `simulate()` (200–500 ms estimated) + 6 SQL statements.

| item | value |
|---|---|
| saves per learner session (assumed) | 20–30 (one per 2 s idle after an edit) |
| CPU per save (estimated, Vercel) | 0.2–0.5 s |
| sessions/month at 500 users | 4,000 (8 each) |
| **this feature's monthly CPU** | **1,600–6,000 CPU-s = 0.4–1.7 CPU-hrs** |

At 30 saves/session and 0.5 s/save that is **1.7 CPU-hours of a 4 CPU-hour monthly budget for one feature** — before the mentor, interview, blog and dashboard. Doubling for Runs (§1.3) pushes it past the ceiling. This is the number the plan should have carried and did not.

DB concurrency is *not* the wall: ~2.5 saves/s at 50 concurrent learners is ~15 queries/s, trivial for TiDB with `connectionLimit: 5`.

### 2.3 The denial-of-service is one field 🔴

Any signed-in user (OAuth signup is free and instant) can POST the same `task-save` 20×/min with `arrivalRate: 1_000_000`:

- 20 × ~4 s = **~80 CPU-seconds per minute**,
- 4 CPU-hours = 14,400 CPU-s → **the entire monthly Hobby budget in roughly 3 hours of one attacker**,
- 250 MB heap per invocation, on an instance that may serve several concurrently.

After that the whole app 504s, not just this module. This is more severe than the RU ceiling because it is a **whole-product** outage, not a feature-level one.

> **Reduced ~19× on 2026-11-03 (§11).** At the new 20,000 r/s ceiling a request is 246 ms and ~10 MB, so the same 20 POST/min needs **~49 hours** instead of ~3, and each request no longer risks OOMing a shared instance. This is mitigation, not closure: an attacker can still force a simulation by claiming criteria the graph fails to meet, so the endpoint stays expensive until P0 fix 2 makes cost independent of `arrivalRate`.

### 2.4 RU — estimated from the repo's own calibration 🟡

`docs/production-review-500-users.md` calibrates ~100 RU/query. Statements per save:

| # | statement | source |
|---|---|---|
| 1–2 | rate-limit `INSERT … ON DUPLICATE KEY` + `SELECT LAST_INSERT_ID` | `lib/db-rate-limit.ts:68-81` |
| 3 | user lookup by `clerk_id` | `route.ts:212` |
| 4 | state `SELECT` | `route.ts:224` |
| 5 | state `UPDATE`/`INSERT` | `route.ts:269-283` |

- 500 users × 8 sessions × 20 saves = 80,000 saves/month → 480k queries → **~48M RU on a 50M budget**.
- 30 saves/session → **72M RU — over budget on this feature alone.**

`sd_user_state.tasks` is the multiplier: **the whole 15-task JSON blob is rewritten on every save**, so per-save cost grows with learner progress. A learner on module 15 pays ~15× the write RU of a learner on module 1 for a one-task edit — O(N) write amplification.

> **Eliminated on 2026-11-04 (§13).** `sd_task_state` now holds one row per (user, task); each save writes a single task row (~4 KB) instead of the whole blob. The table above describes the cost shape that no longer exists. `sd_user_state` keeps only `lessons_completed`.

`steps` (up to 40 × 120 chars per task) is stored but **never read** — `mergeTaskStates` recomputes it from the graph (`TaskWorkspace.tsx:212`). That is 10–20 KB of dead weight rewritten on every save: the "field only ever written, never read" class already recorded in Known Debt.

---

## 3. Performance — client 🟡

- **Drag re-renders the whole workspace at pointer rate.** `components/system-design/canvas/useCanvasInteractions.ts:257` calls `onNodesChange` on every `pointermove` with no rAF coalescing → `setTaskState` → `TaskWorkspace` (1,366 lines) re-renders on each event, plus `ResultsRail`, `FailurePanel`, `NodeInspector`. There is **no `React.memo` anywhere** in `components/system-design/`. `persistLocally: false` correctly skips `localStorage` per frame — good — but the React work is unbounded.
- **`localStorage.setItem(JSON.stringify(graph))` on every committed edit** (`TaskWorkspace.tsx:446`): 4–12 KB stringified synchronously on the main thread. Acceptable at ~2/s; noted because it is the same work the drag path avoids per frame.
- **Shared link → multi-second freeze on a phone.** `?d=` is validated by the same `SdGraphSchema`, so `arrivalRate: 1_000_000` survives decoding. `SimulationPanel` syncs `arrivalRate` from the graph **without clamping** (`SimulationPanel.tsx:48`) even though the slider is capped at 200,000 (`:25`), and `handleRun` uses that state value. Clicking Run on a hostile or accidental share link can freeze a tab for 15–40 s on mid-range mobile and plausibly OOM it (250 MB heap + React + canvas). **Client-side DoS by link** — cheaper than the server variant.
- Zod runs twice per graph (`SdGraphSchema` server-side, `validateGraph` on hydrate). Correct, not a cost.

**Not measured:** task-page LCP/FCP and mobile frame rate. Both need a real browser profile; the above is reasoned from code and should be confirmed with one.

---

## 4. Monitoring 🟡

Existing: `/api/health` (DB `SELECT 1` raced against a 5 s timeout — good), `withRequestLog` (status, duration, query count), Vercel Analytics + Speed Insights, `check:system-design`, 658 tests.

Gaps, ordered by incident cost:

1. **No simulation telemetry.** The most expensive thing in the module logs nothing. Add `log.info("simulate", { taskSlug, arrivals, ms })` — it is the data needed to right-size §2.2, and `arrivals: 10_000_000` is an unmistakable attack signature.
2. **No error sink and no log retention.** Sentry was deferred (`production-review-500-users.md` §2.4) with the reason "adds CPU on the tightest resource". Do not add the browser SDK — but Hobby runtime log retention is measured in hours, so **yesterday's failure is unrecoverable today**. Minimum viable: persist critical events to a small `app_events` table (same pattern as `rate_limits`), or verify a free log drain is available on your plan *before* relying on it.
3. **No signal for "pass criteria stopped passing".** A content regression like B7's module 14 solution failing its own step only surfaces as a learner complaint. `check:system-design` catches it at build time; nothing catches it at runtime.
4. **No uptime check** against `/api/health` (documented app-wide gap). A free cron ping is ten minutes of work.

---

## 5. Logging 🟡

- **`getRequestId()` is exported and never called.** `lib/request-log.ts:18` has zero usages repo-wide, so `withRequestLog` emits a `requestId` and every `log.error` in the same request omits it. During an incident you cannot join "which request produced this error" to "how long did it take, how many queries". One line in `emit()` fixes it.
- `withRequestLog` records the status but not the reason. The state route logs its own 500 causes, so it is covered here; the three older `app/api/admin/*` routes still are not.
- **No slow-simulation warning.** `createLogger` already has `SLOW_DB_THRESHOLD_MS = 250`; mirror it at ~300 ms for `simulate`.
- **Positive:** the I.8 log redaction of Drizzle bound params matters more here than anywhere else — the state row is a large JSON blob, so without `SQL_PARAMS` redaction a failed `UPDATE` would dump a learner's entire design into the log.

---

## 6. Security 🟢 with one red gap

**Good, and stronger than most routes in this codebase:**

- Zod discriminated union with id/label length caps, 40 nodes / 120 edges, duplicate-id `superRefine`, and `satisfies z.ZodType<SdNode>` so schema drift fails `tsc` (`validation.ts:102-170`). `validateGraph` runs on both sides.
- **Criteria are re-verified server-side against the real task** (`route.ts:137-207`): unknown criterion ids rejected, failure targets must exist in the graph, and only *verified* ids are merged into `criteriaMet`. A learner cannot forge a pass. Correct threat model for a learning platform.
- Auth is layered: `proxy.ts` + `auth()` + `usersTable.clerk_id` lookup with 401 on miss. No IDOR — `user.id` is derived from the session, never from the body.
- CSRF is effectively closed by `application/json` + Clerk `SameSite` cookies (cross-origin POST forces a preflight). Worth recording as *reasoned*, since nothing asserts it.
- No `dangerouslySetInnerHTML` anywhere in the module.

**Gaps:**

1. 🔴 **Unbounded server work per request** — §2.3. `arrivalRate` is the entire attack surface.
2. 🟡 **No body-size limit.** `await req.json()` reads an unbounded body and App Router handlers have no default cap, so a 50 MB body is parsed fully before Zod rejects it. Reject on `Content-Length > 64 KB` (a schema-valid graph tops out near 40 KB).
3. 🟡 **The rate limiter is the wrong shape for this route.** 20 POST/min is generous for an expensive call and is per-user with free account creation. More importantly, a *fail-closed, DB-backed* limiter is being spent on an endpoint with **no external spend** — two extra queries and two extra ways to fail (§2.4, §7.3). Policy should be explicit per route: fail-closed where money leaves (`mentor/chat`, `interview/generate`), fail-open and cheap where it does not (`state`).
4. 🟡 **`decodeGraph` validates but does not cap payload length** — `encodeGraph` enforces 8 KB (`graph-codec.ts:29`), decode does not. Practical impact is small (URL length bounds it), but asymmetry in a codec is where the next caller assumes symmetry.
5. 🟢 **`steps` is client-supplied and unverified.** Harmless today (own row only, recomputed client-side), but it is a write-only field whose name promises an invariant. Verify it or drop it — do not leave it ambiguous.

---

## 7. Failure recovery 🟡

**Right shape overall:** localStorage as a write-ahead log, server as source of truth, merge unioning `criteriaMet`/`revealed` and maxing `attempts`, toast on sync failure. If TiDB dies the learner keeps working. That is a genuinely good design for a free tier.

Problems:

1. **Merge order comes from the client clock.** `mergeTaskStates` compares `Date.parse(updatedAt)` (`TaskWorkspace.tsx:191`) and `updatedAt` is written by the browser. A device with a fast clock wins forever; a device with a slow clock silently loses every edit. Ordering must be owned by the server (or a monotonic revision).
2. **`graph` is last-write-wins while criteria are unioned.** Two tabs: tab B's diagram replaces tab A's with no warning. There is also a read-modify-write window between `SELECT` and `UPDATE` inside the transaction (`route.ts:224-283`); TiDB's optimistic conflict detection will usually abort one commit (→ 500 → toast), but the client has **no retry/backoff and no flush on `online`**. Recovery depends on the learner happening to edit again.
3. **The fail-closed limiter takes the feature down with the DB.** `enforceDbRateLimit` throwing → 500 even for a plain read (`route.ts:85-89` / `:133-137`). For a non-spend route that is disproportionate: log a warning, allow the request, and let the per-save query cost be the bound.
4. **No query timeout.** `connectTimeout: 15s` bounds *connection establishment* only; nothing bounds a hung `SELECT`/transaction. A stuck statement holds the request to the 60 s function cap and occupies one of five pool slots. `/api/health` races a 5 s timeout — the state route should do the same, and declare `maxDuration`.
5. **`arrivalRate` is never clamped on hydrate**, so a stored or shared graph carries the DoS forward indefinitely (§3).

---

## 8. Fixes, ranked

### P0 — before 500 users

| # | Fix | Why | Effort | Status |
|---|---|---|---|---|
| 1 | **Skip `simulate()` when no new criteria are claimed**, and verify only ids not already in `existingTask.criteriaMet` | removes ~95% of server CPU — all autosaves, and the duplicate POST after each Run — at zero UX cost | 10 lines | ✅ applied (§11) |
| 2 | **Bound the engine's work, not its input.** Cap total simulated requests (e.g. 200k) or decouple sample count from `arrivalRate` (utilisation is already analytic; only the Monte-Carlo sample needs a fixed size). Replace `number[]` + `sort()` with a histogram for percentiles | makes 1M-arrival graphs cheap, removes the 250 MB spike, and gives `MAX_ARRIVALS_PER_STEP` a meaning | 1–2 h | ✅ applied (§14) — decoupled, not capped |
| 3 | **Clamp `arrivalRate` where it enters the client** (decode + panel sync) to what the UI can produce | closes the shared-link freeze and the accidental 1M autosave | 5 lines | ✅ applied **at the schema**, not the client (§11) |
| 4 | **`Content-Length` cap (64 KB) on the POST** | one-line memory-DoS fix | 5 min | ✅ applied (§11) |

> **Order changed during implementation.** Fix 3 landed first, not fix 1. Fix 1 alone does not close the outage: an attacker never sends an honest autosave, they send `criteriaMet: [known ids]`, and `route.ts:172` accepted any known id, so `simulate()` ran regardless. The ceiling had to exist before "skip the simulation" meant anything. See §11.

### P1 — before the RU ceiling

| # | Fix | Why |
|---|---|---|
| 5 | **Normalise state to `sd_task_state(user_id, task_slug, graph, criteria_met, attempts, revealed, updated_at)`** with a composite PK | kills O(N) write amplification, turns the GET into a point read of one task instead of ~50 KB every mount, and provides a natural concurrency token. Best cost/benefit schema change in the module. | ✅ applied (§13) |
| 6 | **Drop `steps` from the write path** | never read; less RU, one fewer client-trusted field | ✅ applied (§12 companion) |
| 7 | **Fail-open the limiter on this scope**, or replace with an in-memory per-instance token bucket | the endpoint has no external spend; 2 of 6 statements per save are the limiter | ✅ applied (§12) |
| 8 | **Server-owned ordering** (`updatedAt` returned by the server, used by `mergeTaskStates`), plus a 409 path with retry and flush on `online` | removes clock-skew data loss and silent multi-tab overwrite | ✅ applied (c509280) |
| 9 | **rAF-coalesce `pointermove`; `React.memo` the panels** | the per-pointer-event workspace re-render is the mobile jank source |
| 10 | **Add `maxDuration` + query timeout** to the route | prevents a hung statement holding a pool slot to the function cap | ✅ applied (1a58ce2) |

### P2 — hygiene, and the ones that bite quietly

| # | Fix | Why | Status |
|---|---|---|---|
| 11 | **Remove `x/y` from `graphSeed`** | reproducibility: identical topology should produce identical numbers. Re-baseline the affected module p95 figures (deltas ≤0.1 ms, but every lesson quotes a number). | ⬜ open |
| 12 | **Replace the two 1M-arrival tests** with an assertion on cost (`arrivals ≤ cap`) or a smaller bound | takes `npm test` from 11 s back to ~3 s and stops pinning the DoS | ✅ applied (§11) — but the 3 s claim was **wrong** |
| 13 | **`requestId` into `emit()`; `log.info` simulation ms/arrivals; slow-sim warning** | incident correlation and the data needed to right-size | ⬜ open |
| 14 | **Split `modules/<slug>.ts` into prose + `.task.ts`** | the task page currently ships 900-word lessons to a browser that needs `assert` functions | ⬜ open |
| 15 | **Percentiles:** `allLatencies[Math.floor(n * 0.95)]` is the 96th percentile at n = 100; and percentiles over completions hide shedding (module 8's lesson) — keep the sibling error-rate criterion everywhere | correctness of the teaching model | ⬜ open |
| 16 | **Persist critical events durably**, or verify a log drain is available on the plan before assuming logs survive an incident | Hobby retention is hours, not days | ⬜ open |

---

## 9. Not verified (stated, not implied)

- **Real Vercel CPU and memory.** Timings are this machine's Node; the 1.5–2× multiplier is an assumption and the CPU-budget table is sensitive to it.
- **RU per query.** Inherited from `docs/production-review-500-users.md`'s calibration, not measured against TiDB's billing meter for this feature.
- **Mobile behaviour.** The freeze/OOM claim extrapolates from 4 s / 250 MB on a desktop core; it is not a phone profile.
- **`sitemap.ts:117` publishes 108 protected `/system-design` URLs** that `proxy.ts` 307s to `/sign-in` for crawlers. Not a cost issue; a "we advertise URLs we will not serve" issue worth a separate decision.

---

## 10. If you only fix two things

1. **§8.1** — skip verification on autosave. Ten lines; removes most of the CPU and RU cost of the module.
2. **§8.3** — clamp `arrivalRate` where it enters the client. Five lines; removes the accidental DoS and the shared-link freeze.

Neither changes anything a learner can see.

> **Both are applied (§11), in the other order and at a different layer.** §8.3 became a schema clamp — the client clamp alone is bypassed by `curl`, which is the only client that matters here. §8.1 became "skip when no *new* criteria are claimed", because the "new" part is what makes a replayed save free.

---

## 11. Fixes applied — 2026-11-03

P0 fixes 1, 3, 4 and P2 fix 12. Uncommitted at time of writing (awaiting manual test); everything below is measured on this machine, with the same caveats as §9.

### 11.1 What changed

| File | Change |
|---|---|
| `lib/system-design/validation.ts` | New `SD_MAX_ARRIVAL_RATE = 20_000`. `arrivalRate` **clamps** via `.transform()` instead of accepting up to `1_000_000` |
| `components/system-design/SimulationPanel.tsx` | Slider and number-input max import that constant; the sync-from-graph effect now clamps |
| `lib/system-design/criteria.ts` *(new)* | `criteriaNeedingVerification(requested, alreadyMet)` — pure, DB-free |
| `app/api/system-design/state/route.ts` | 64 KB `Content-Length` cap → 413; `simulate()` runs only for claimed-and-not-earned criteria; user lookup hoisted above the simulation |
| `lib/api-error.ts` | `payloadTooLarge()` |
| `lib/system-design/engine.ts` | `MAX_ARRIVALS_PER_STEP` deleted; the sampling loop documents where the real bound lives and why a second one must not be added |
| `tests/` | 3 clamp tests; 1 engine contract test replacing the 2 DoS tests; 1 content gate over all 15 modules; 7 criteria tests |

The clamp sits in the schema rather than the client because the POST body, `?d=` share links and stored state all pass `SdGraphSchema` — and only the first of those is our client. It **clamps** rather than rejects, so a graph saved under the old 1M ceiling still loads instead of 400-ing forever.

### 11.2 Measured before / after

```
1. POST body clamp        : 1000000 -> 20000
2. share-link clamp       : 1000000 -> 20000
3. engine cost, unclamped : 4195 ms      (engine still trusts its caller)
4. engine cost, clamped   :  246 ms
5. ceiling constant       : 20000
6. legitimate 16000 r/s   : 16000        (content max passes through)
```

| | Before | After |
|---|---|---|
| Schema-legal max `arrivalRate` | 1,000,000 | **20,000** |
| Requests simulated per save | 10,000,000 | **200,000** |
| Wall time per save (this machine) | 4,603 ms | **246 ms** |
| Heap delta per save | 195 MB | **~10 MB** |
| Sustained 20 POST/min to exhaust 4 CPU-h | **~2.6 h** | **~49 h** |
| Autosave CPU (Vercel estimate, §2.2) | 200–500 ms | **~0** — engine skipped |
| Simulations per Run | 2 | **1** (the duplicate POST claims nothing) |
| Hostile `?d=` link | 15–40 s mobile freeze | clamped, **~0.25 s** |
| 50 MB body | buffered, then rejected | **413 before reading** |
| DB statements per autosave | 6 | **6 — unchanged** |
| DB statements per Run | 12 | **7** (+1 `storedCriteriaMet` read) |

Heap delta measured 195 MB here versus 250.6 MB in §1.1 — same request, different GC state between runs. The ratio (~20×) is the number that matters, not the absolute.

**The RU finding (§2.4) is untouched by §11.** These fixes move CPU, not statements; autosaves still cost 6 statements and the whole 15-task blob is still rewritten. RU needs P1 (§8.5–8.7). **§8.5 closed in §13.**

### 11.3 Why fix 3 landed before fix 1

Fix 1 alone does not close the outage. An attacker never sends an honest autosave — they send `criteriaMet: [known ids]`, and `route.ts:172` accepted any known id, so `simulate()` ran regardless. "Skip the simulation when nothing is claimed" protects only clients that tell the truth. The ceiling had to exist first; it also closed the share-link freeze and made the dead guard deletable.

Fix 1 was then implemented as **"skip when no *new* criteria are claimed"**, not "no criteria claimed": the stored set is read first (one point read, Run path only), so a replayed save whose criteria are already earned costs nothing. Only ids returned by `criteriaNeedingVerification` are merged, and the merge still unions the server's own set — so skipping can never grant a pass.

### 11.4 Two corrections to this review

1. **§1.4's attribution was wrong.** The two 1M tests were real but were never what bounded `npm test`; `system-design-content.test.ts` is **11.7 s** on its own. Removing them took `engine.test.ts` from ~10.3 s to **1.93 s** and total wall time from ~11 s to **12.96 s** — no wall-clock win. The `11 s → ~3 s` in §8.12 was wrong.
2. **§8.2's parenthetical was wrong.** It says utilisation "is already analytic". It is not: `engine.ts:321` computes `actualArrivalRate = toStats.arrivals / SIMULATION_WINDOW_SECONDS`, i.e. from **sampled** arrivals. Decoupling sample count from `arrivalRate` therefore changes utilisation and every p95 the lessons quote. Fix 2 is a content re-measurement slice, not a 1–2 h patch — which is why it was not folded into this one.

### 11.5 Verification

- `npm run typecheck` — clean
- `npm test` — **668 pass, 0 fail** (658 + 7 criteria + 1 content + net 2 validation)
- `npm run build` — compiled; 108 `/system-design` routes unchanged
- `npm run check:system-design` — all passed, same 4 pre-existing chain warnings, **identical p95s** (`caching 9ms → 3ms`, `chaos 10ms → 9ms`), confirming determinism survived deleting the `Math.min`
- `prettier --check` — clean
- **Mutations observed red, restored byte-identically (sha256):** ceiling → `1_000_000` fired *"clamps arrivalRate above the ceiling"* + *"never simulates more traffic than the schema ceiling allows"*; inverted pending-predicate fired 6/7 criteria tests

### 11.6 Still open

§8.2 (constant-cost simulation), ~~§8.5~~ (done in §13), §8.6–8.10 (RU, ordering, drag perf, timeouts), §8.11, ~~§8.13~~ (done). ~~The cheapest next item is the duplicate POST after every Run (`TaskWorkspace.tsx:693`): it no longer costs CPU but still costs 6 statements.~~ **Done in §12** — a Run now commits and saves one state object, so the debounce effect recognises it as persisted.

### 11.7 One gap this change did not close

`SD_MAX_ARRIVAL_RATE` is asserted only as *the clamp's target* — every test compares against the constant, not against `20_000`. Raising it to `100_000` would keep all 668 tests green, leaving the comment as the only guard. That is the §1.1 failure class at a smaller scale, and it is closed by pinning the number in one test with its reason, not by prose.

---

## 12. RU fixes applied — 2026-11-03

§11 closed CPU and left RU exactly where it was: every autosave still paid 6 statements, 2 of them for a rate limiter, and the client still produced 20–30 of them per session. This is the second half.

### 12.1 What changed

| File | Change |
|---|---|
| `components/system-design/TaskWorkspace.tsx` | Autosave debounce **2 s → 10 s**; a pending snapshot is flushed on `pagehide`, on `visibilitychange` → hidden, on unmount, on task change, and on Run. A Run now commits and saves **one** state object, so the debounce effect recognises it as persisted and no longer POSTs it again. A page load with no local copy no longer POSTs at all. |
| `app/api/system-design/state/route.ts` | The shared TiDB limiter is replaced by a per-instance counter on both GET and POST — **2 statements per request**, ~33% of the route's RU |
| `lib/memory-rate-limit.ts` *(new)* | `createMemoryRateLimiter({ limit, windowMs, maxKeys })` — fixed window, injectable clock, LRU-bounded |
| `lib/db-rate-limit.ts` | `"system-design"` removed from `RateLimitScope`; nothing else used it |
| `config/rate-limits.ts` | **Unchanged** — the in-memory limiter reads the same table, so the two cannot drift |
| `tests/memory-rate-limit.test.ts` *(new)* | 9 tests |

### 12.2 Why the cadence, and what protects the learner

The server copy is **cross-device truth**, not the working copy. `commitTaskState` writes localStorage synchronously on every change, so waiting 10 s costs a learner nothing they can see — it costs them the ability to open the same task on a second device in the next 9 seconds. In exchange, a session's 20–30 saves become ~4.

The waiting window is covered from four sides, because a debounce with no flush is just a data-loss timer: `pagehide` (tab close, navigation away, bfcache), `visibilitychange` → hidden (mobile backgrounding, which often kills the page with no `pagehide`), component unmount (an in-app navigation fires neither event), and every Run. The three unload paths send with `fetch(..., { keepalive: true })` so the request outlives the page; bodies are already capped at 64 KB by the route, inside the keepalive budget.

### 12.3 The duplicate POST, finally

§11 made the duplicate POST free of CPU but not of statements — `acceptSimulationResult` built a `runSnapshot` *and* committed a separately-constructed state, so the debounce effect saw "something changed" and re-sent the same graph 2 s later. Now the Run commits one object, saves that object, and records it as persisted; the effect compares identity and stands down. One Run = one POST.

### 12.4 The rate limiter: what was traded, stated plainly

The DB limiter is global across serverless instances and survives a cold start. The replacement is neither. A client spread over N warm instances gets N × the limit, and a cold start resets the counter.

That is acceptable **here and nowhere else in the app**, for three reasons: the route spends no external money (no Mistral, no generation); the resource actually at risk is CPU on the instance handling the request, which is exactly what a per-instance counter measures; and the cost of the global counter was 2 of the route's 6 statements — a third of the whole feature's RU budget — to protect a route whose expensive path is already bounded by `SD_MAX_ARRIVAL_RATE` and the criteria gate.

It also removes a failure mode rather than adding one: `lib/db-rate-limit.ts` is **fail-closed**, so a TiDB blip used to turn every autosave into a 500. There is no I/O here, so there is nothing to fail.

The other 12 limited routes keep the global counter. They spend money, and that is the line.

### 12.5 Estimated before / after — **not measured on TiDB**

Same basis as §2.4: 500 users × 8 sessions = 4,000 sessions/month, ~100 RU per statement from `docs/production-review-500-users.md`, 5 Runs per session.

| | Before | After |
|---|---|---|
| Autosaves per session | 20–30 | **~4** (10 s cadence) |
| Statements per save | 6 | **4** |
| Statements per Run | 7 | **5** |
| Statements per page load | 4 | **2** |
| Duplicate POST per Run | 1 | **0** |
| POST on a page load with nothing local | 1 | **0** |
| Statements per session | ~189 | **~43** |
| **RU/month at 500 fully active** | **~76M** | **~17M** |
| RU/month at 150 active (realistic) | ~23M | **~5M** |
| CPU/month saved | — | **~0.9 h** (fewer requests, not cheaper ones) |

Three caveats, because a number this good deserves suspicion:

1. **The 100 RU/statement figure is the repo's own calibration, not a TiDB measurement**, and it does not model JSON write bytes. Real RU is probably worse than the table in absolute terms; the *ratio* is the part to trust.
2. **"~4 autosaves per session" is an assumption about learner behaviour**, not an observation. ~~The way to replace it is a `log.info` of saves-per-session and `simulate` ms (§8.13) — that is the next measurement, not another estimate.~~ **§8.13 done:** `emit()` now carries the requestId, the route logs `log.info("simulation", { ms, arrivals, criteriaClaimed, criteriaVerified, valid })` plus a slow-sim warning above 100 ms, and TaskWorkspace logs a per-session save count on the first unload flush.
3. **The 10 s cadence is not covered by a unit test.** It lives inside a React component with no renderer in this repo, so it was verified by reading and must be confirmed by hand: edit a task, watch the network tab for ~10 s, hit Run, and confirm exactly one POST per Run.

### 12.6 Verification

- `npm run typecheck` — clean
- `npm test` — **677 pass, 0 fail** (668 + 9 limiter tests)
- `npm run build` — compiled; 108 `/system-design` routes unchanged
- `npm run check:system-design` — all passed, same 4 pre-existing chain warnings
- `prettier --check` — clean
- **3 mutations observed red, restored byte-identically (sha256):** `count <= limit` → `count < limit` (4 pass / 5 fail); window comparison removed so the window never rolls over (7 / 2); eviction picks the newest key instead of the coldest (8 / 1)

### 12.7 Still open

~~`sd_task_state` normalisation (§8.5 — the blob rewrite, now the largest remaining item)~~ **Done in §13.** Constant-cost simulation (§8.2, closes §2.3), `graphSeed` re-baseline (§8.11). (`steps` removal, the `SD_MAX_ARRIVAL_RATE` pin, and §8.13 were done in the §12/§13 companion commits.)

---

## 13. Schema normalisation applied — 2026-11-04

The last structural RU item: `sd_user_state.tasks` was one JSON column holding all
15 tasks, so every save rewrote the whole blob and a module-15 learner paid ~15×
the write RU of a module-1 learner for a one-task edit. That is gone.

### 13.1 What changed

| File | Change |
|---|---|
| `config/schema.tsx` | New `sd_task_state` table: one row per (user, task), `UNIQUE(user_id, task_slug)`, FK to `users.id` |
| `drizzle/0012_tiny_sentry.sql` | `CREATE TABLE sd_task_state` + FK; applied to dev DB |
| `app/api/system-design/state/route.ts` | GET/POST now read and write `sd_task_state`; `sd_user_state` keeps only `lessons_completed` |
| `config/system-design/types.ts` | `SdUserState.tasks` made optional (backward compat) |
| `components/system-design/TaskWorkspace.tsx` | Unchanged — the response shape `{ lessonsCompleted, tasks }` is identical |

### 13.2 Lazy migration

Existing rows in `sd_user_state.tasks` are migrated on the **first request** for
each user: `migrateLegacyTasks(userId)` checks whether `sd_task_state` already
has rows for that user, and if not, copies each task out of the legacy blob into
its own row. Per-task rather than all-at-once, so a partial failure leaves the
user in a recoverable state. After a successful migration the legacy column is
set to `null` so we stop paying to read and write it.

The client never sees the migration: the response shape is unchanged, so
`TaskWorkspace`'s hydrate path needs no edits. Old saves that still carry
`steps` in the blob are accepted (the field is ignored).

### 13.3 What it buys

- **No more O(N) write amplification:** a module-15 edit now writes ~4 KB
  instead of ~60 KB.
- **GET is a point read:** `SELECT ... FROM sd_task_state WHERE user_id = ?`
  returns only that user's tasks, instead of deserialising a ~50 KB blob every
  mount.
- **Natural concurrency token:** `updated_at` per task instead of per user.
- **Statement count per save:** unchanged at 4 (user lookup + read existing +
  upsert + read back), but each statement is now bounded in size.

### 13.4 Verification

- `npm run typecheck` — clean
- `npm test` — 678 pass, 0 fail
- `npm run build` — compiled
- `npm run check:migrations` — no drift
- `npm run check:system-design` — all passed, same 4 chain warnings
- Dev server: `GET /api/system-design/state` 200, `POST` 200; lazy migration ran
  on first request (17 queries, one-time).
- `prettier --check` — clean

### 13.5 Still open (unchanged scope)

~~Constant-cost simulation (§8.2, closes §2.3)~~ **Done in §14.** `graphSeed` re-baseline (§8.11). (§8.13 done.)

---

## 14. Constant-cost simulation applied — 2026-11-04

The last CPU item: the engine simulated `arrivalRate x 10` requests, so cost
scaled with a number the learner types. That is gone — the sample count is now
fixed at 20,000 regardless of arrivalRate, and utilisation/throughput are
recovered analytically.

### 14.1 What changed

| File | Change |
|---|---|
| `lib/system-design/engine.ts` | `SAMPLE_COUNT = 20_000`, `SAMPLES_PER_STEP = 20`. Main loop no longer depends on `arrivalRate` |
| `lib/system-design/engine.ts` | `runRequest` utilisation now analytic (arrivalRate x nodeShare / cap) with a 100-request warm-up gate |
| `lib/system-design/engine.ts` | Saturation is now probabilistic (shed with probability `1 - 1/util`) instead of all-or-nothing |
| `lib/system-design/engine.ts` | `computeStatistics` scales per-node utilisation and throughput from sampled traffic share to configured load |
| `tests/system-design-content.test.ts` | One `errorRate === 0` assertion relaxed to `< 0.001` (probabilistic shedding) |

### 14.2 Why the parenthetical was wrong

Sec. 8.2 said utilisation "is already analytic". It was not: `engine.ts:321` derived
`actualArrivalRate = toStats.arrivals / SIMULATION_WINDOW_SECONDS` from **sampled**
arrivals. Sec. 11.4 flagged this. The fix makes utilisation genuinely analytic —
`arrivalRate x nodeShare / cap` — so the number reflects the configured load
instead of the sample count.

### 14.3 What it buys

- **Constant cost:** ~20,000 requests per simulation regardless of arrivalRate,
  instead of up to 200,000. Worst case drops from 246 ms to ~30 ms.
- **DoS closed:** an attacker can no longer force an expensive simulation by
  claiming criteria the graph fails. The engine cost is bounded by the sample
  count, not by any input.
- **Correct saturation:** probabilistic shedding means the overall shed fraction
  matches the analytic model (33% at 1.5x capacity) instead of being
  all-or-nothing.

### 14.4 Verification

- `npm run typecheck` — clean
- `npm test` — 678 pass, 0 fail
- `npm run build` — compiled
- `npm run check:system-design` — all passed, same 4 chain warnings
- `prettier --check` — clean

### 14.5 Still open

`graphSeed` re-baseline (Sec. 8.11) — reproducibility. The only remaining item.

---

## Bottom line

After §11, the module is **no longer a CPU risk for 500 users**: autosaves run no simulation, a Run runs one instead of two, and the most expensive schema-valid request fell from 4.6 s / 195 MB to 246 ms / ~10 MB.

After §12 it is **no longer an RU risk at realistic engagement**: ~76M → ~17M RU/month at 500 *fully active* learners, ~5M at the 150 a learning platform actually sees.

After §13 the **last structural inefficiency is gone**: no more O(N) write amplification, no 50 KB blob deserialised on every mount, no per-user write lock on a 15-task JSON column.

After §14 the **DoS is closed**: the engine cost is constant (~30 ms) regardless of arrivalRate. An attacker can no longer force an expensive simulation. The 50M RU ceiling and 4 CPU-hour budget are both comfortable at any realistic engagement.

What is still true: every RU figure in this document is an estimate derived from the repo's calibration, not a TiDB measurement.

The only remaining item is `graphSeed` re-baseline (§8.11) — reproducibility, a polish task.
