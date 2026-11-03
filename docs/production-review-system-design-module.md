# Production Review — System Design Module

> **Date:** 2026-11-03 (reviewed; no fixes applied yet)
> **Scope:** Phase 6 system design path — `/system-design`, the 15 module routes, 79 lesson routes, 14 task routes, `components/system-design/*`, `lib/system-design/*`, `config/system-design/*`, and `app/api/system-design/state/route.ts` + `sd_user_state`.
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

### 1.4 `npm test` is now 11 s, and most of it is two worthless assertions

```
# tests 53   # suites 11   # pass 53
# duration_ms 11138
```

Dominated by the two `arrivalRate: 1_000_000` tests (`tests/engine.test.ts:965`, `:1071`), ~4 s each, asserting only "does not crash". `ENGINEERING.md` asks for tests that fail in seconds and assert behaviour; these pay the DoS cost on every CI run and pin nothing.

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

| # | Fix | Why | Effort |
|---|---|---|---|
| 1 | **Skip `simulate()` when no new criteria are claimed**, and verify only ids not already in `existingTask.criteriaMet` | removes ~95% of server CPU — all autosaves, and the duplicate POST after each Run — at zero UX cost | 10 lines |
| 2 | **Bound the engine's work, not its input.** Cap total simulated requests (e.g. 200k) or decouple sample count from `arrivalRate` (utilisation is already analytic; only the Monte-Carlo sample needs a fixed size). Replace `number[]` + `sort()` with a histogram for percentiles | makes 1M-arrival graphs cheap, removes the 250 MB spike, and gives `MAX_ARRIVALS_PER_STEP` a meaning | 1–2 h |
| 3 | **Clamp `arrivalRate` where it enters the client** (decode + panel sync) to what the UI can produce | closes the shared-link freeze and the accidental 1M autosave | 5 lines |
| 4 | **`Content-Length` cap (64 KB) on the POST** | one-line memory-DoS fix | 5 min |

### P1 — before the RU ceiling

| # | Fix | Why |
|---|---|---|
| 5 | **Normalise state to `sd_task_state(user_id, task_slug, graph, criteria_met, attempts, revealed, updated_at)`** with a composite PK | kills O(N) write amplification, turns the GET into a point read of one task instead of ~50 KB every mount, and provides a natural concurrency token. Best cost/benefit schema change in the module. |
| 6 | **Drop `steps` from the write path** | never read; less RU, one fewer client-trusted field |
| 7 | **Fail-open the limiter on this scope**, or replace with an in-memory per-instance token bucket | the endpoint has no external spend; 2 of 6 statements per save are the limiter |
| 8 | **Server-owned ordering** (`updatedAt` returned by the server, used by `mergeTaskStates`), plus a 409 path with retry and flush on `online` | removes clock-skew data loss and silent multi-tab overwrite |
| 9 | **rAF-coalesce `pointermove`; `React.memo` the panels** | the per-pointer-event workspace re-render is the mobile jank source |
| 10 | **Add `maxDuration` + query timeout** to the route | prevents a hung statement holding a pool slot to the function cap |

### P2 — hygiene, and the ones that bite quietly

| # | Fix | Why |
|---|---|---|
| 11 | **Remove `x/y` from `graphSeed`** | reproducibility: identical topology should produce identical numbers. Re-baseline the affected module p95 figures (deltas ≤0.1 ms, but every lesson quotes a number). |
| 12 | **Replace the two 1M-arrival tests** with an assertion on cost (`arrivals ≤ cap`) or a smaller bound | takes `npm test` from 11 s back to ~3 s and stops pinning the DoS |
| 13 | **`requestId` into `emit()`; `log.info` simulation ms/arrivals; slow-sim warning** | incident correlation and the data needed to right-size |
| 14 | **Split `modules/<slug>.ts` into prose + `.task.ts`** | the task page currently ships 900-word lessons to a browser that needs `assert` functions |
| 15 | **Percentiles:** `allLatencies[Math.floor(n * 0.95)]` is the 96th percentile at n = 100; and percentiles over completions hide shedding (module 8's lesson) — keep the sibling error-rate criterion everywhere | correctness of the teaching model |
| 16 | **Persist critical events durably**, or verify a log drain is available on the plan before assuming logs survive an incident | Hobby retention is hours, not days |

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
