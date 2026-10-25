# System Design Learning — Phase 6 Feature Spec (Free-Tier Safe)

> **Date:** 2026-10-17 (revised 2026-10-25 — Module 8 authored and sharding model verified)
> **Status:** Tasks 1–9 are implemented. Task 8 is commit `67177e8`. Thirteen modules are registered (Part 0 all 4 + Modules 5–13), with static lesson and task routes; the system-design checker passes. Task 9's interactive workspace is verified by typecheck, tests, and production build; run the A1 manual acceptance checks in §13 before continuing A2 authoring.
> **Scope:** An interactive system-design learning path: read a concept with scenarios and diagrams, then **build that app yourself and run it under traffic and failure**. Full beginner→advanced curriculum designed in §10.0 (~90 topics, Parts 0–9); **Phase A implements Part 0 + Part 1 + Part 3** = 14 modules, each ending in a 🔨 Build Task with hard pass criteria, grown across **one** photo-sharing app (100 users → chaos). Sliced into three independently shippable stages **A1 / A2 / A3** (§10.1).
> **Phase A engine:** 9 node types, **no new node types needed** — 14 modules reduce to 7 property additions + scenario knobs (§5.2.1).
> **Stack:** Next.js 16 App Router (Server Components default), React 19, Clerk `auth()`, Drizzle + TiDB MySQL (`connectionLimit:5`), Tailwind v4 + shadcn/ui, `react-resizable-panels` (already installed, currently **unused**), Vercel Hobby Free, TiDB Cloud Starter Free
> **Constraint:** Zero cost forever. The traffic simulator must run **100% in the browser** — it is a client-only deterministic model, not a server call. Static content ships in the bundle; TiDB stores **one** mutable row per user.
> **New dependencies:** **none.** Canvas is hand-rolled SVG. No React Flow, no framer-motion, no d3.
> **Hard rule:** lessons are **not** AI-generated filler. Every lesson is human-read before it ships.

---

## 1. Business Problem

Most system-design content is a static picture plus a paragraph of prose. A learner reads a diagram of "client → load balancer → app server → cache → database", nods, and still cannot answer *"what happens when traffic goes up 100×?"* in an interview. The gap is not comprehension, it is **consequence** — nobody ever shows them the consequence.

The state of the art in this category is already **an executable design, not a decorative one**: you drag nodes, connect them, and the platform runs load against your own topology. That insight is correct and we are not going to reinvent it worse.

We improve on it in three specific places:

| # | Common approach | Gap | Our move |
|---|---|---|---|
| 1 | Designs are tested *"under load"* | Load is not failure. Real designs die when a node dies, a replica lags, or a network partitions. Nobody tests that. | **Failure injection** panel — kill the leader, partition the replica, degrade a region, then re-run. |
| 2 | Labs start *"from a blank page"* | Blank-page paralysis is the #1 beginner killer in a visual editor. | **Start from broken.** Every Build Task loads a pre-wired, deliberately naive design already at 100 users. You watch it hurt before you touch it. |
| 3 | Numbers exist but the arithmetic is invisible | Learners memorise "10k req/s" without knowing *why*. | **Little's Law as a first-class output.** `concurrency = throughput × latency`, computed per node and displayed live. Almost nobody teaches it this way. |

**Explicitly not the goal:** win on content volume. Published paths in this space run 19 modules / 137 lessons with a large fraction still unreleased. We ship 3 modules first and prove the *mechanic* is fun. Content is a treadmill, and AI-generated filler lessons are exactly what makes learning platforms worthless.

---

## 2. The Central Design Decision — Read It Before Writing Any Code

There are three ways to store the lesson and lab content, and the choice determines the entire cost profile.

| | ❌ A: `sd_modules` + `sd_lessons` + `sd_labs` tables | ❌ B: all content in the `sd_user_state` JSON | ✅ C: content in `config/`, one state table |
|---|---|---|---|
| Tables added | 3 (14 → **17/20**) | 1 | 1 (14 → **15/20**) |
| Content read cost | 1 TiDB query per lesson page load, forever | same as A | **0 queries** — shipped in the JS bundle, CDN-cached |
| Route rendering | forced dynamic (`●`) because it awaits a DB read | same as A | **`generateStaticParams` → `●` static, ~0 function invocations** |
| Admin content editing | possible | possible | **impossible** (git is the CMS) |
| Orphan-content risk | **real** — see below | low | **impossible by construction** |

**Chosen: C.**

**Why the orphan risk decides it.** `.agent/feature-tracker.md` records the worst data defect this repo has: `interview_questions` has no `category_id` and reaches a category *only* through a join table — **130 of 1,078 questions (12%) are linked to no chapter** and are therefore invisible in every UI while still occupying a row. A content table is a place where rows can silently become unreachable. A registry file is not: a lesson exists if and only if it is exported from `config/system-design/`, and `npm run check:system-design` verifies it in **both directions**.

**Why losing the admin UI is acceptable.** The blog already runs this way — `config/blog.ts` is the single source of truth for 5 long-form posts, edited in git, rendered as static Server Components, with `npm run check:blog-toc` (`package.json:10`) as the guard rail. System-design content has the same profile: static, long-form, authored once, revised rarely. Building a content CMS for it would be a Phase-4-sized feature serving a Phase-6-sized need.

### 2.1 Cost model

| Surface | Rendering | Vercel function invocations |
|---|---|---|
| `/system-design` (path index) | `●` static | 0 |
| `/system-design/[module]` | `●` static | 0 |
| `/system-design/[module]/[lesson]` | `●` static | 0 |
| `/system-design/[module]/task` (shell) | `●` static | 0 |
| **Simulator + canvas** | **client-only** | **0 — zero server CPU** |
| `GET /api/system-design/state` | dynamic | 1 per lab visit |
| `POST /api/system-design/state` | dynamic, debounced 2 s | ~20 per editing session |

**Target: ~2 invocations per active user per day.** Against the traffic model in `docs/production-review-500-users.md` (~4,500 page loads/day at 500 users) this is <0.1% of the invocation surface.

> ⚠️ **`generateStaticParams` is mandatory, not a nicety.** `.agent/feature-tracker.md` item **I.11** records that `app/blog/[slug]/opengraph-image.tsx` with only known params was **dynamic by default** and re-ran the renderer on every origin hit at **560–870 ms of CPU per request** — ~24,000 requests to burn the entire 4 CPU-hour Vercel Hobby budget, unauthenticated. Adding `generateStaticParams()` moved it from 560 ms → 14 ms with `x-nextjs-cache: HIT`. Every dynamic segment in this feature must enumerate its params, and **Task 12 verifies it by diffing the `npm run build` route table for `●`**, not by assumption.

### 2.2 Canvas: hand-rolled SVG over React Flow

| | ❌ `@xyflow/react` | ✅ Hand-rolled SVG + pointer events |
|---|---|---|
| Bundle | +40–50 kB gzip, new dep | **0** |
| Build risk | React Flow v12 + React 19 peer matrix | none — uses only installed `react` |
| Edge flow animation | fights the library's edge renderer; you overlay anyway | total control — this **is** the visual that makes load visible |
| Fit | general-purpose graph editor | our needs are narrow: 9 fixed node types, drag, connect, delete, no minimap, no grouping, no custom edge shapes |
| Cost | low | ~500–600 lines of pointer-capture, port hit-testing, zoom-at-cursor |

**Chosen: hand-rolled.** The deciding factor is edge particle animation. React Flow actively resists overlaying custom animated content on its edges, and that overlay *is* the product — watching 1,200 packets/sec stream from client to app server to cache is what turns "load" from a number into a feeling.

**This is isolated and reversible.** `lib/system-design/engine.ts` and `rubric.ts` operate on a plain `SdGraph` object and know nothing about rendering. If the canvas feels bad in Task 5, swapping to React Flow touches `components/system-design/canvas/*` only. Engine, rubric, content, schema and API are unaffected. **Checkpoint at Task 5** (see §12).

---

## 3. Database Schema

**One new table.** `config/schema.tsx` is 189 lines and ends at `siteNotices` (`:177-189`). Append after it.

```ts
// config/schema.tsx — append after siteNotices (:189)
export const sdUserState = mysqlTable("sd_user_state", {
  user_id: int("user_id")
    .references(() => usersTable.id)
    .primaryKey(),
  lessons_completed: json(), // string[] of lesson slugs
  tasks: json(), // see §3.2 — the Build Task collection
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});
```

**Style notes, matched to the existing file:**
- snake_case column names with explicit name strings, matching `chapters`/`feedbackTickets`
- native MySQL `json()` — this repo does **not** use `.mode("json")` and does **not** stringify (see `chapters.content:44`, `enrollments.progress:59`, `problems.test_cases:149`)
- no `relations()` anywhere in this repo — verified zero hits; joins are hand-written `leftJoin`/`innerJoin`. Do not introduce one.

**Table count: 14 → 15 / 20.** Leaves 5 slots.

### 3.2 The `tasks` shape — every module has a Build Task

Because **every** module ends in a Build Task (§10.3), the task collection is now the primary progress artefact, not a side feature. It was renamed from `labs` to `tasks` to stop the code implying "labs are separate from modules" — they are not.

```ts
type SdTaskState = {
  graph: SdGraph;                 // the learner's design, autosaved
  steps: string[];                // SdStep ids currently passing
  criteriaMet: string[];          // SdPassCriterion ids currently passing  ← §6.1
  attempts: number;               // incremented on each Run that was submitted
  revealed: string[];             // criteria the learner opened the escape hatch on
  updatedAt: string;
};
type SdTasks = Record<string /* moduleSlug */, SdTaskState>;
```

Why `criteriaMet` is stored rather than recomputed: **hard gates must not be re-evaluated on page load.** Recomputing means a threshold tweak in a later deploy silently un-passes a completed module and re-blocks the user. Storing it makes a passed gate permanent.

Why `attempts`: with hard gates and infinite retries (§6.2), a module can be attempted 50 times. That number is the honest measure of difficulty, and it is the only place the product can tell whether a threshold is mis-tuned (§6.2 safety valve).

Why `revealed`: if a learner used the escape hatch, the platform must never later claim they passed unaided — and must not silently let them.

### 3.1 Why one row per user

`enrollments.progress` (`config/schema.tsx:59`) already establishes the house pattern: a per-user JSON blob holding arbitrary progression, read-modify-written inside a `db.transaction` (`app/api/progress/route.ts:64,103-121`). We mirror it exactly rather than inventing a second pattern.

- One `PRIMARY KEY` lookup per read — the FK column is the PK, so the clustered index serves it directly.
- **No contention.** A single user's own writes cannot race each other in practice, and no other user touches the row.
- Writes are debounced (2 s) and are a single upsert.

**Known risk, accepted and bounded:** `tasks` is an unbounded JSON column in principle. Add a hard cap in the Zod schema — **max 50 task entries per user** — so it can never be used as unbounded storage. Realistic worst case is 14 tasks × small graphs ≈ 160 KB, far inside TiDB's 0.5 GB and a single-row `TEXT`-equivalent payload.

---

## 4. Content Layer — `config/system-design/`

```
config/system-design/
├── types.ts                    # SdNode, SdEdge, SdGraph, SdScenario, SdFailure,
│                               # SdLesson, SdModule, SdStep, SdPassCriterion,
│                               # SdInterviewByte, SdResult, SdTaskState
├── registry.ts                 # getModule / getLesson / getAllModuleSlugs
│                               #   via dynamic import() → code-split per module
└── modules/
    ├── what-is-system-design.ts        # 1  — Story · lessons · Interview Byte · Build Task
    ├── requirements.ts                 # 2
    ├── constraints-and-design-process.ts # 3
    ├── back-of-the-envelope.ts         # 4
    ├── load-balancers-and-stateless.ts  # 5
    ├── caching.ts                      # 6
    ├── read-replicas.ts                # 7
    ├── partitioning-and-sharding.ts    # 8
    ├── rate-limiting.ts                # 9
    ├── cdns-and-static-content.ts      # 10
    ├── how-systems-fail.ts             # 11
    ├── timeouts-retries-breakers.ts     # 12
    ├── idempotency.ts                  # 13
    └── chaos-capstone.ts               # 14
```

**One file per module, and it owns everything** — lessons, the Interview Byte, the Build Task's steps, pass criteria and `solutionGraph`. Splitting a module's task into a separate `labs/` file would make the coupling between "what was taught" and "what must be built" invisible, which is precisely the coupling the module template depends on.

`solutionGraph` is **cumulative**: module 14's solution is module 13's solution plus the chaos hardening, because each Build Task starts from the previous module's finished design (§10.1). Authoring that chain is the real cost of the one-app decision, and it is why the slice gates in §12 are non-negotiable.

**A module's slug is always its filename.** No mapping table. That is what lets
`check:system-design` (Task 11) be a bidirectional check with no second source
of truth to drift — the same reason `config/blog.ts` keeps `slug` next to its
`app/blog/<slug>/page.tsx` and asserts the two match (`check:blog-toc`).

### 4.1 `registry.ts` — why dynamic `import()`

`app/(routes)/system-design/[module]/page.tsx` is a dynamic segment. If it statically imports a barrel of all three modules, **every lesson page ships all three modules' prose in its JS bundle**. Dynamic `import()` keyed on slug splits each module into its own chunk:

```ts
const LOADERS: Record<string, () => Promise<{ default: SdModule }>> = {
  "what-is-system-design": () => import("./modules/what-is-system-design"),
  "requirements-and-tradeoffs": () => import("./modules/requirements-and-tradeoffs"),
  "your-first-scalable-system": () => import("./modules/your-first-scalable-system"),
};

export async function getModule(slug: string): Promise<SdModule | null> { ... }
export function getAllModuleSlugs(): string[] { return Object.keys(LOADERS); }
```

`getAllModuleSlugs()` is synchronous and needs no `await` — it is what `generateStaticParams` consumes in all three dynamic routes.

### 4.2 Client-bundle boundary — the I.9 trap

`.agent/feature-tracker.md` item **I.9**: a `"use client"` component importing a **value** from a module that reaches `config/db` drags `mysql2` + Node `net`/`tls`/`timers` into the browser bundle and fails the build with `Can't resolve 'net'` — while **`tsc` passes**, because the violation is a bundler concern, not a type error. The repo's own precedent is `config/site-notice.ts`, a **zero-import** constants file created specifically because `lib/site-notice.ts` re-exported from it.

**Enforced rule for this feature:**

| Module | Reaches `config/db`? | Client may import |
|---|---|---|
| `config/system-design/**` | **no** | values ✅ |
| `lib/system-design/{nodes,engine,rubric,graph-codec}.ts` | **no** | values ✅ |
| `lib/system-design/validation.ts` | no (zod only) | values ✅ |
| `app/api/system-design/state/route.ts` | yes | **`import type` only** |

**`npm run typecheck` will not catch a violation here. `npm run build` will.** Every task that adds a client component must end in a build, not a typecheck.

---

## 5. The Engine — `lib/system-design/engine.ts`

**This file is the feature.** The canvas is a view; the engine is the teacher.

### 5.1 Determinism is non-negotiable

**No `Date.now()`. No `Math.random()`.** Seeded `mulberry32` PRNG, seeded from the graph hash. The same graph + scenario + failures must produce **byte-identical** `SimulationResult` across runs and across machines.

Why: a beginner who re-runs the same design and sees different latency will conclude the tool is broken, and will stop trusting the teaching. Determinism is a correctness requirement, not a convenience.

> Related precedent: the tracker's hydration lesson — *"Reading the current time during render (`Date.now()`) is a hydration mismatch waiting to happen."* Same root cause: time and randomness leaking into render.

### 5.2 Node types

Defined once in `lib/system-design/nodes.ts` as data: capacity, service time, category, icon key, label. **Zero React imports** — the icon *key* is a string, `NodeCard.tsx` maps it to a Lucide component.

| type | capacity (req/s per instance) | service | notes |
|---|---|---|---|
| `client` | ∞ | — | arrival source |
| `load_balancer` | 20 000 | 0.1 ms | passthrough |
| `app_server` | 2 000 | 1 ms | × `replicas` |
| `cache` | 50 000 | 0.2 ms | `hitRate` config, `ttlMs` |
| `database` | 5 000 | read 2 ms / write 8 ms | `readReplicas` config |
| `queue` | 20 000 | enqueue | decouples producer/consumer |
| `worker` | 1 000 | 50 ms/job | async |
| `cdn` | 100 000 | 0.1 ms | static only |
| `object_store` | 10 000 | 2 ms | blobs |

Numbers are **deliberately round and pedagogically defensible** — they approximate a small tier-1 instance. They are documented as a model, not as benchmarks (§5.6).

### 5.2.1 Properties — Phase A needs **no new node types**

Every Phase A module (Part 0, Part 1, Reliability — §10.1) was checked against these 9 types. **All of it is properties on existing nodes plus scenario knobs**, not a tenth node type. This is the single biggest scope reduction in the plan and it was not obvious up front.

| Carrier | New properties | Serves |
|---|---|---|
| `app_server` | `maxConcurrency` (bulkhead), `breakerEnabled` | 12 — circuit breakers, bulkheads |
| `load_balancer` | `algorithm` (`"rr"` \| `"least_conn"`), `rateLimitPerMin` | 5 — LB algorithms; 9 — rate limiting |
| `database` | `partitions`, `hotKeyShare` | 8 — sharding, hot keys |
| `cache` | `stampedeGuard` | 6 — cache stampede |
| `queue` | `maxDepth`, `retryLimit`, `dlqEnabled` | 13 — backpressure, DLQ |
| `cdn` | `hitRate` | 10 — the share of media answered at the edge |
| `worker` | `replicas` | 12 — "the resize service is down" implies more than one |
| **edge** | `retry: { attempts, backoffMs, jitter }`, `partitioned` | 11, 12 — retries, partitioning |
| **scenario** | `writeShare`, `mediaShare`, `bytesPerMediaRequest`, `abusiveShare` | 6, 7, 9, 10 — the traffic mix (below) |
| **scenario** | `latencyJitterMs`, `cacheColdStart`, `replicaLagMs` | 7, 14 — lag, cold start |

**The traffic-mix additions (Task 1).** The original table gave `scenario` only
three knobs, and `arrivalRate` alone is a homogeneous stream. That is not enough
to state **5 of the 6** sim-based pass criteria in §10.1, each of which was
unprovable against the §5.5 result shape:

| Criterion | Needs | Added |
|---|---|---|
| M6 "0 stale reads" | per-class error counts | `SimulationResult.errorClasses` |
| M7 "writes still succeed" | a write costs 8 ms vs a 2 ms read | `scenario.writeShare` |
| M9 "bot gets 429s, real users 0 errors" | one abusive client inside normal traffic | `scenario.abusiveShare` + `errorClasses.rejected` |
| M10 "origin bandwidth < 10%" | 2 MB payloads, only some requests carry one | `scenario.mediaShare` + `bytesPerMediaRequest` + `cdn.hitRate` + `result.bandwidthMbps` |
| M8 "that query p95 < 300 ms" | a latency per node, not just utilisation | `perNode[].serviceMs` + `queueWaitMs` |

`abusiveShare` is the one that looks odd in isolation and is the one that
matters: without it, "the bot" and "real users" are indistinguishable inside a
single arrival rate, and M9 reduces to a global cap that cannot distinguish a
successful block from collateral damage.

**Why rate limiting is an `load_balancer` property and not a 10th node type.** A `rate_limiter` node type invites a beginner to place it somewhere harmless — behind the app server, or on one branch of the graph — and the lesson silently teaches the wrong placement. Attaching it to the load balancer makes *"the thing in front of everything"* the only place it can go, which is the actual lesson.

`SdGraph` therefore carries `{ nodes: SdNode[], edges: SdEdge[], scenario: SdScenario }` — properties live on the instances, so one graph can mix two differently-sized app servers.

**`SdNode` is a discriminated union on `type`, not one flat shape.** Nine
variants, each carrying only its own fields. The reason is the authoring site:
14 modules produce roughly 84 step checks and pass criteria, and on a flat shape
with nullable fields every one of them needs a null guard — and a missed guard is
a runtime crash rather than a compile error. With the union,
`graph.nodes.find(n => n.type === "cache")` narrows to `SdCacheNode` and
`n.hitRate` is a plain `number`. `lib/system-design/validation.ts` mirrors it as
`z.discriminatedUnion("type", ...)`, the same zod v4 API §7.2 already relies on.
The cost is symmetry: a new property means touching the type *and* the schema.

### 5.3 The loop

Open model, fixed arrival rate:

1. **Precompute** the adjacency map and, per node, the request path (first outgoing edge). Validate on entry: a reachable `client`, no unresolvable dangling edge, at least one terminal datastore. Return a structured `invalid` result rather than throwing — the canvas must render *why* a graph is unsimulatable.
2. **Step** over a fixed 10 s window at `dt = 0.01 s`.
3. **Inject** `arrivalRate × dt` requests per step, PRNG-jittered so arrivals are bursty rather than uniform. Each arrival is classified by `SdScenario`: `writeShare` decides read vs write (and therefore which `serviceMs` applies), `mediaShare` decides whether it carries `bytesPerMediaRequest`, and `abusiveShare` marks it as the abusive client so the rate limiter can treat it differently from everyone else.
4. **Walk** each request along its path. Per hop: `latency += queueWait + serviceTime`.
5. **Queueing** is M/M/1: `W = 1/(μ − λ)`. **When `λ ≥ μ` the node is saturated** — flag it, shed the excess, and count it in `errorRate`. Saturation must be *visible*, not silently absorbed, or the learner learns nothing.
6. **Cache nodes** serve locally with probability `hitRate`; otherwise forward.
7. **Accumulate** latency samples; sort **once** at the end → p50/p95/p99.
8. **Little's Law** per node: `concurrency = throughput × avgLatency`. This is computed and returned, not derived on the client.
9. **Bottleneck** = `argmax(utilisation)` across non-client nodes, with a named explanation.

### 5.4 Failure injection

`SdFailure[]`, four kinds:

| kind | effect |
|---|---|
| `node_down` | node skipped → requests routed through it fail; error class `unreachable` |
| `degraded` | `capacity × factor` (e.g. 0.4 for "the region is struggling") |
| `partition` | named edges dropped — "services can no longer talk" |
| `replica_lag` | reads through a replica return stale data; error class `stale` |

Each lab ships its own failure scenario set. `replica_lag` is the one worth teaching hardest — it is the failure that produces **silently wrong data**, not an outage, which is why it is so much harder to detect in production.

### 5.5 Output

```ts
export type SimulationResult = {
  valid: boolean;
  invalidReason?: string;
  throughput: number;              // req/s sustained
  latency: { p50: number; p95: number; p99: number };  // ms
  errorRate: number;               // 0..1
  errorClasses: Partial<Record<SdErrorClass, number>>;  // ← Task 1, see §5.2.1
  bandwidthMbps: number;                                  // ← Task 1, module 10
  perNode: Array<{
    id: string;
    utilisation: number;           // 0..1, >1 means saturated
    concurrency: number;           // from Little's Law
    serviceMs: number;             // ← Task 1, module 8
    queueWaitMs: number;
    saturated: boolean;
    down: boolean;
  }>;
  bottleneck: { nodeId: string; reason: string } | null;
  teaching: string[];              // ← plain-language "why"
};
```

`errorClasses` is why there is no `staleReadRate`. §6.1's worked example asserts
`r.staleReadRate === 0`, but a scalar `errorRate` cannot distinguish *"the node
was unreachable"* from *"the node answered, with data from ten seconds ago"* —
and that difference **is** module 6's lesson and module 14's payoff. Splitting
the scalar into `unreachable | stale | rejected | shed` keeps the distinction the
failure mode is built to teach.

`bottleneck.nodeId` lost its inner `| null`: §5.5 originally had both
`bottleneck: {...} | null` and `nodeId: string | null`, which is two ways of
saying "nothing to point at". One is enough.

`teaching[]` is **not garnish**. A simulator that emits numbers without explaining them is a toy. Example strings:

> *"Your single database is at 98% utilisation. At 1,200 req/s it needs 1,200 concurrent connections (L = λW = 1200 × 0.008s), but a tier-1 instance holds ~300. That is why requests queue here."*

> *"Reads are 95% of your traffic and you are hitting the database for all of them. A cache in front would absorb most of this."*

### 5.6 Model integrity — non-optional

A "How this model works — and what it ignores" disclosure renders beside the results at all times. It must state plainly that this is a **queueing model, not a benchmark**, and list what is ignored: network partition granularity, disk IOPS, GC pauses, tail latency amplification across tiers, cache eviction policy, cold starts.

**Rationale:** a learner who concludes *"my design passes 100k req/s!"* has been taught something false, and this feature exists to not do that. Advertising the model's limits is a pedagogical feature, not a disclaimer. This is the same instinct as the tracker's *"always verify a log change in production"* rule — do not let the tool's happy path stand in for truth.

---

## 6. `lib/system-design/rubric.ts` — steps **and** pass criteria

### 6.1 Steps check *intent*, criteria check *consequence*

This is the substantive addition to the plan. A step alone is a matching game — drop a cache node on the canvas, tick. Existing lab-style products are step-gated for exactly that reason.

```ts
export type SdStep = {
  id: string;
  title: string;
  brief: string;                       // the ask, in beginner language
  hint: string;                        // tier 2
  reveal: string;                      // tier 3 — the reasoning, not the answer
  check: (g: SdGraph) => StepResult;   // { passed, progress: "3 of 4 nodes placed" }
};

export type SdPassCriterion = {
  id: string;
  label: string;                       // "p95 < 150 ms at 50,000 reads/s"
  required: boolean;                   // false → advisory, displayed but never blocking
  assert: (r: SimulationResult) => boolean;
  /** Shown when this is the criterion blocking them. Why the number, not just what. */
  explain: string;
};
```

`check` returns **partial progress**, not just a boolean. "Your cache isn't wired to anything yet" is a far better message than "incorrect". The 3-tier hint ladder (nudge → hint → reveal) exists for the same reason — **a beginner must never hit a dead end**.

**Example — Module 6, Caching:**
- step 3 *check*: `exists(cache) && count(app→cache) ≥ 1` → *"you've added a cache but nothing routes to it"*
- criterion 1 *assert*: `r.latency.p95 < 150 && r.throughput > 50_000`
- criterion 2 *assert*: `r.staleReadRate === 0` → *"a cache in front of writes serves stale photos"*

A learner can pass both steps and still fail both criteria by putting the cache on the wrong side of a hop. That gap **is** the lesson.

### 6.2 Hard gates — and the safety valve they require

Decision: **pass criteria are a hard gate; retry is unlimited and unpunished.** A module does not unlock until every `required: true` criterion passes.

This is the right call because it makes numbers matter, but a hard gate with no escape is a **dead end**, and §6.1 already established that a beginner must never hit one. So:

| Rule | Behaviour |
|---|---|
| **Primary vs secondary** | The 1–2 criteria that define the task are `required: true`. Anything else is `required: false` and displayed but never blocking. |
| **"Show me the senior engineer's design"** | Always available, always works. It loads the module's `solutionGraph` and marks those criteria `revealed` — **not** passed. The module stays locked. |
| **Retry** | Unlimited, no timer, no streak, no penalty. `attempts` is recorded for the platform's own use, never shown as a score. |
| **Gates never re-evaluate** | `criteriaMet` is **persisted**, not recomputed on load (§3.2). A later threshold tweak cannot retroactively un-pass a completed module. |
| **Mis-tuned threshold** | `attempts > 20` on a completed step set is the signal that a threshold is wrong. Surfaced in the task notes for the author, not to the user. |

That last row is why `attempts` is stored at all: it is the product's only honest detector for "I set a bar a human cannot clear", and without it a mis-tuned criterion is invisible until someone opens a support ticket.

---

## 7. API Route — `app/api/system-design/state`

One file, `GET` + `POST`, modelled on **`app/api/admin/site-notice/route.ts`** — the best current write reference in the repo (Zod with full-replacement semantics and a comment explaining why nothing is `.optional()`, `revalidateTag` deliberately outside the write try/catch).

### 7.1 Order of operations

```
withRequestLog("... /api/system-design/state", async () => {
  1. auth()                       → 401 unauthorized()
  2. enforceDbRateLimit(...)      → 429   BEFORE body parsing
  3. req.json()                   → 400 badJson()
  4. Zod safeParse                → 400 validationError(flattenError)
  5. db.transaction               → read-modify-write on sd_user_state
  6. NextResponse.json
  7. catch → log.error(...) then serverError()     ← never a bare catch
})
```

> ⚠️ **Step 7 is not optional.** `.agent/feature-tracker.md` §19.1: *"A `catch` that returns `serverError()` without logging the error leaves a 500 with no diagnosable cause. `withRequestLog` records the status but not the reason."* Every `log.error` in this route gets verified in `NODE_ENV=production`, because that is where `lib/logger.ts` serializes differently than dev does (item **I.8**).

### 7.2 Payload — Zod discriminated union (zod v4)

```ts
const stateMutation = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("lesson-complete"), slug: z.string().min(1).max(120) }),
  z.object({
    kind: z.literal("task-save"),
    taskSlug: z.string().min(1).max(120),
    graph: SdGraphSchema,          // node/edge arrays, cap 40 nodes / 120 edges
    steps: z.array(z.string()).max(40),
  }),
]);
```

`SdGraphSchema` lives in `lib/system-design/validation.ts` and is **shared with the client** — the same schema validates on save and on share-link decode, so a hand-edited URL cannot inject a malformed graph.

### 7.3 Rate limits

Two coordinated edits — miss either and the feature silently gets the 20/min default with no warning:

```ts
// lib/db-rate-limit.ts:9-24 — add to the RateLimitScope union
| "system-design"

// config/rate-limits.ts — add to the routes array
{ pattern: "/api/system-design/state", method: "POST", config: { limit: 20, windowMs: WINDOW_1M } },
{ pattern: "/api/system-design/state", method: "GET",  config: { limit: 30, windowMs: WINDOW_1M } },
```

`POST` at 20/min is generous **on purpose** — autosave is debounced to 2 s, and a learner dragging nodes constantly should never see a 429. `GET` at 30/min covers a learner opening several lab tabs.

---

## 8. Routes & Rendering

```
app/(routes)/system-design/
├── page.tsx                        ● static   path index: 14 modules, one card each
├── [module]/page.tsx               ● SSG     generateStaticParams → getAllModuleSlugs()
│                                            Server Component → <LessonFlow> client child
├── [module]/lesson/[lesson]/page.tsx ● SSG   generateStaticParams → all {module, lesson} pairs
└── [module]/task/page.tsx          ● SSG     generateStaticParams → one per module
                                            static shell → <TaskWorkspace> client child
app/api/system-design/state/route.ts         GET + POST (dynamic)
```

**There is no separate `labs/` route.** Each module owns exactly one Build Task, so the task lives *inside* the module at `/[module]/task`. Building a standalone lab route now would be YAGNI — it exists only to host interview labs in Phase 7+, which are not specced and must not shape Phase A's architecture.

**Route count is constant regardless of content volume.** 14 modules and 14 tasks still mean **four** route files. Adding a module is a `config/` file plus one entry in the `LOADERS` map — no new route, no new query, no new function invocation. This is the direct payoff of the §2 decision to ship content from the bundle instead of the database.

**Task state hydration:** because the task shell is static, the saved graph **cannot** come from the page render. `TaskWorkspace` fetches it on mount via `GET /api/system-design/state` — one invocation per visit, which is the number we accepted in §2.1.

**Param validation:** use `parsePositiveInt` from `@/lib/parse-id` where a numeric id is involved (pattern: `app/(routes)/learn/[courseId]/[chapterId]/page.tsx:39-41`). Slugs here are strings, so validate against the registry and `notFound()` on a miss — a `getModule("nonexistent")` must never render an empty shell.

**Auth:** the page lives in the `(routes)` group, so `proxy.ts` `auth.protect()` gates it by default (`.agent/feature-tracker.md` §18.2 — anything not in `isPublicRoute` is protected). Handler-level `auth()` in the API route is defense-in-depth. **No `proxy.ts` edit required.**

---

## 9. Components

```
components/system-design/
├── canvas/
│   ├── Canvas.tsx                     viewport, pan/zoom, owns node+edge state
│   ├── NodeCard.tsx                   draggable; utilisation heat state (ok→amber→red)
│   ├── EdgePath.tsx                   bezier + animated flow particles
│   ├── NodePalette.tsx                drag-to-add source list
│   └── useCanvasInteractions.ts       pointer handlers, port hit-testing
├── Inspector.tsx                      selected node: replicas, capacity, cache TTL, hit rate
├── SimulationPanel.tsx                traffic slider, Run/Stop, latency sparkline, verdict
├── FailurePanel.tsx                   chaos toggles
├── HintLayer.tsx                      3-tier: nudge → hint → reveal
├── ResultsRail.tsx                    metrics readout (desktop right pane)
├── ShareButton.tsx                    copy design link
├── CriteriaPanel.tsx                  ★ pass criteria: pass/fail per criterion,
│                                     why the number matters, "show me the
│                                     senior engineer's design" escape hatch (§6.2)
├── StepRail.tsx                       ★ the Build Task checklist with partial
│                                     progress + 3-tier hints, per module
├── InterviewByte.tsx                  ★ shape · strong answer · the trap
└── ModelDisclosure.tsx                §5.6 integrity panel
```

★ = added by the content-first restructure. All three are the UI half of §6 — without them the Build Task is a matching game.

### 9.1 Desktop layout — 3 panes, zero new deps

```
┌──────────────┬─────────────────────────────┬──────────────┐
│ Steps + Hints│        Canvas              │  Results     │
│ + Palette    │   (pan/zoom/drag/connect)  │  Rail  OR    │
│      280px   │        flex-1              │  Inspector   │
│              │                             │     340px    │
│              │  ┌───────────────────────┐  │              │
│              │  │ SimulationPanel       │  │              │
│              │  │ traffic ──●────  Run  │  │              │
│              │  └───────────────────────┘  │              │
└──────────────┴─────────────────────────────┴──────────────┘
```

Built with `ResizablePanelGroup` / `ResizablePanel` / `ResizableHandle` from **`components/ui/resizable.tsx`** — the shadcn wrapper that is already written, already installed (`package.json:66`), and has **zero usages** in the repo. The pan/zoom SDK is the one place we consume a dependency we already paid for.

### 9.2 Mobile

Tab switch — **Design / Run / Steps** — following the pattern at `LessonClient.tsx:194-219` and the full-height shell at `ProblemWorkspace.tsx:125` (`flex flex-col lg:h-screen lg:overflow-hidden`).

> The tracker's duplicate-observer lesson applies here: **one** responsive layout driven by state or CSS, **not** two variants each with their own observer. Two observers means one permanently running inside `display:none`.

### 9.3 Save path — debounced, mirrored, failure-tolerant

1. `localStorage` write **synchronously on every edit** — with `try/catch` on every access, namespaced key `sd-task:<slug>`, matching `ProblemWorkspace.tsx:16,24-34`. This is why a refresh mid-drag loses nothing.
2. `POST` debounced **2 s** after the last change.
3. Failure → one `sonner` toast, local mirror retained, **never block the UI**. Saving a diagram must not interrupt drawing.

### 9.4 Share links

graph → `JSON.stringify` → `TextEncoder` → base64url → `?d=<payload>`. On load, if `?d=` is present, load **that** graph instead of the user's saved one, with a **"Save as mine"** button so sharing is non-destructive.

This is a free viral loop. Login-walled, share-less design tools have no equivalent — and it also gives learners a way to bring a design to a study group without needing an account.

> Length caution: a 40-node graph base64url'd will exceed a comfortable URL. The node cap in `SdGraphSchema` (§7.2) bounds it; if a real lab exceeds ~1800 chars we degrade to storing the graph in the DB and sharing an id. Verify in Task 7 and record the measurement here.

---

## 10. Content

### 10.0 Full curriculum roadmap — beginner → advanced

**Design artifact. Nothing here is implemented in Phase A.** It exists so Phase A can be checked as a *foundation* rather than three arbitrary lessons, and so out-of-scope reads as **sequenced** rather than undecided (§14).

Roughly **35 of ~90 topics are simulator-teachable.** The other ~55 are prose, and a meaningful slice of those need dedicated visualizers rather than a general graph canvas (§10.5). A simulator that *pretended* to model consensus, CRDTs or LSM internals would teach **worse** than prose, so it does not.

| Part | Topics | Engine support |
|---|---|---|
| **0. Mindset** | what SD actually is · functional vs non-functional reqs · constraints & trade-offs · the 45-min design process · anti-patterns · capacity estimation & **Little's Law** | ⚠️ Little's Law only |
| **1. Scale up** | load balancing (RR / least-conn / consistent hash) · stateless services & sessions · **caching** + invalidation & stampede · read replicas · partitioning & hot spots · connection pooling · **rate limiting** · CDNs | ✅ **sim-native** |
| **2. Async** | queues & why async · background jobs, idempotency, DLQs · pub/sub & events · WebSockets / SSE / long-poll · CQRS & read-write split | 🟡 partial |
| **3. Reliability** | failure modes & blast radius · timeouts, retries, backoff + jitter, circuit breakers, bulkheads · idempotency keys · Saga / outbox · consistency models in practice · distributed locks · chaos engineering · backpressure & shedding | ✅ **sim-native** |
| **4. Data at scale** | OLTP vs OLAP, LSM vs B-tree · replication modes, leader election, failover · conflict resolution (LWW) · streams & stream processing · pipelines / CDC · retention & time partitioning | 🟡 partial |
| **5. Distributed internals** | clocks, ordering, causality · counters at scale (HLL, Count-Min) · consistent hashing · consensus (Raft/Paxos) · service discovery · **observability & tracing** | ❌ prose + §10.5 visualizers |
| **6. Services & org** | monolith vs microservices · when *not* to split · service boundaries · inter-service comms · API design & versioning, gRPC · blue/green, canary, feature flags · multi-tenancy | ❌ prose |
| **7. Global** | multi-region & data residency · global LB / geo-DNS · multi-master & conflict resolution · edge PoPs / Anycast · SLO, SLI, error budgets & the nines · cost engineering | ✅ **sim-native** |
| **8. Security** | AuthN/AuthZ at scale, OAuth, JWT · abuse & DDoS · secrets management · encryption at rest & in transit · design docs | ❌ prose |
| **9. Practice** | the 45-min interview format · narrating trade-offs aloud · mock interviews | ❌ prose |

**Ordering principle.** The path follows the order a *growing app* needs each idea, not the order a textbook lists it. This ordering is correct and worth keeping. A learner should never meet "read replica" before "why one database stops being enough".

---

### 10.1 Phase A — 14 modules across 3 independently shippable slices

**One app is grown across all 14 modules.** A photo-sharing app (Instagram-like), started at 100 users and taken to chaos. Every Build Task says "make **this** app handle X" — never an abstract problem.

Phase A covers **Part 0 + Part 1 + Part 3**. Authoring load is real and now ~2× a plain lesson module, because each one carries lessons **plus** an Interview Byte **plus** a rubric, pass criteria and a solution graph. The standing rule is unchanged: **no AI-generated filler.** That is the failure mode that makes learning platforms worthless.

| Slice | Ships | Gate before continuing |
|---|---|---|
| **A1** | Part 0 — 4 modules + the whole canvas/engine/app surface | *Does the mechanic feel good?* If not, stop — the engine is sound either way, only the presentation is wrong. |
| **A2** | Part 1 — 6 modules | *Does the simulator earn its keep* on caching, replicas, sharding, rate limiting and CDNs? |
| **A3** | Part 3 — 4 modules, ending in the chaos capstone | *Does failure injection actually deliver the thing load testing cannot?* This is the pay-off slice. |

#### Part 0 — Foundations (A1)

| # | Module | Lessons | 🔨 Build Task | Pass criteria |
|---|---|---|---|---|
| 1 | **What system design means** | the choices, not the boxes · performance vs scalability · latency vs throughput vs bandwidth | Design the smallest thing that could serve our app's first 100 users | runs at 100 users, p95 < 50 ms |
| 2 | **Requirements** | functional vs non-functional · eliciting them · nobody hands you a list | Fill in the constraints panel for our app | written answer, self-graded |
| 3 | **Constraints & the design process** | the 45-min structure · every choice gives something up · anti-patterns | Narrate our current design in 5 boxes, as if in an interview | self-graded |
| 4 | **Back-of-the-envelope** | powers of two · **latency numbers table** · Little's Law | Our app has 100k DAU — compute req/s, storage, bandwidth | sim matches your number ±10% |

Part 0's tasks are estimation and narration, not graph-building. That is honest — there is nothing to simulate about "name your constraints", and inventing a fake task would be worse than none.

#### Part 1 — Scaling up (A2)

| # | Module | Lessons | 🔨 Build Task | Pass criteria | Engine properties |
|---|---|---|---|---|---|
| 5 | **Load balancers & stateless services** | vertical's ceiling · horizontal · RR vs least-conn · health checks · sessions | *The app dies at 500 users. Make it survive 20,000.* | 20k concurrent, p95 < 200 ms | `load_balancer.algorithm` |
| 6 | **Caching** | where to put it · 5 strategies · eviction · TTL · **invalidation + stampede** | *Reads are 95% of traffic. Make them fast without serving stale photos.* | p95 < 150 ms @ 50k r/s **and** 0 stale reads | `cache.hitRate`, `cache.ttlMs`, `cache.stampedeGuard` |
| 7 | **Read replicas** | scaling reads ≠ scaling writes · replication lag · promoting a replica | *Survive losing the primary database.* | writes still succeed, p95 < 200 ms | `database.readReplicas`, `scenario.replicaLagMs` |
| 8 | **Partitioning & sharding** | vertical vs horizontal · hash vs range · **hot keys** · rebalancing | *One user has 40M followers. Their feed query takes 9 seconds.* | that query p95 < 300 ms | `database.partitions`, `database.hotKeyShare` |
| 9 | **Rate limiting & backpressure** | why limit · token vs leaky bucket · sliding window · 429 · load shedding | *A bot is doing 400 uploads/sec. Kill it without hurting real users.* | bot gets 429s, real users 0 errors | `load_balancer.rateLimitPerMin`, `queue.maxDepth` |
| 10 | **CDNs & static content** | latency numbers · cache keys · TTL · **what a CDN cannot cache** | *Photos are 2MB each. 1M users/day. Get media off our origin.* | origin bandwidth < 10% | `cdn` node |

#### Part 3 — Reliability (A3)

| # | Module | Lessons | 🔨 Build Task | Pass criteria | Engine properties |
|---|---|---|---|---|---|
| 11 | **How systems fail & blast radius** | SPOP — trace your own design · retry storms · cascades | *Find every single point of failure in your current design.* | inspection task | `edge.retry`, `edge.partitioned` |
| 12 | **Timeouts, retries, circuit breakers** | no timeout is worse than a bad one · backoff + **why jitter** · breaker states · bulkheads | *The image-resize service is down. Your API must stay up.* | API p95 < 300 ms, 0 errors | `edge.retry`, `app_server.breakerEnabled`, `app_server.maxConcurrency` |
| 13 | **Idempotency & safe retries** | at-least-once delivery · idempotency keys · DLQ | *The client retried 5× on a flaky network. You now have 5 duplicate uploads.* | exactly 1 upload | `queue.retryLimit`, `queue.dlqEnabled` |
| 14 | **Chaos — CAPSTONE** | injection as a practice · **what silently returns wrong data** | *Every chaos toggle at once. Survive all of them.* | full pass, all scenarios | §5.4 all four kinds |

**The arc, as the learner experiences it:**

```
100 users → 20,000 concurrent → 50,000 reads/s → lose the primary
→ a 40M-follower hot key → a bot at 400 uploads/s → 2MB photos at 1M/day
→ resize service dead → 5 duplicate uploads → every chaos toggle at once
```

Same app, monotonically harder, and **each task is caused by the previous fix's new problem** — the validated break → fix → new-problem rhythm from KodeKloud's beginner course (§10.6).

#### Why one app, not fifteen

Some published paths use 15 separate apps, each a 13-step lab restarting from zero. That is right for *interview* practice and wrong for *learning*:

| | One growing app | Fifteen separate apps |
|---|---|---|
| Continuity | their work accumulates | every lab restarts at zero |
| Motivation | "make **my** app better" | "another app, again" |
| Capstone | falls out naturally | must be authored separately |
| Authoring cost | 14 tasks, each a small delta | 15 × 13 steps, no shared setup |
| Interview realism | weak | strong |

**Resolution:** one app for the learning path (A1–A3), many apps for interview labs in a later phase. Both, sequenced — not either/or.

### 10.2 Lesson shape — the retrieval-first pattern

Kept deliberately, because it is the strongest idea in this category:

> **story → concept → "Your turn" (pick an app, write the 3 questions you'd need answered) → "Compare with a senior engineer" reveal → recap → mark complete**

The "Your turn" box forces retrieval practice before the answer is shown. Prose over markdown (`react-markdown` + `rehype-highlight`, already installed) — same treatment as `components/blog/`, and a wall of text is what makes learning platforms feel like documentation.

### 10.3 The module template

Every module is the same shape. Consistency is a feature — a beginner who knows the rhythm can start a new module without being told what to do.

```
MODULE N ─────────────────────────────────────────────────
  STORY        where our app is now, and what just broke

  Lessons 1..k scenario → concept → ONE diagram
               → "your turn" (write 3 questions) → compare with senior → recap

  🎯 INTERVIEW BYTE   question shape · strong answer · THE TRAP

  🔨 BUILD TASK   grow the same app
       start state    pre-wired broken graph (§5.6 start-from-broken)
       steps          predicates over the graph   → intent
       PASS CRITERIA  the sim must hit these      → consequence
       hints          nudge → hint → reveal
       escape hatch   "show me the senior engineer's design" (§6.2)

  Recap
```

**"The trap" is the load-bearing third of the Interview Byte.** Every concept is paired with the answer that *sounds* right and gets a candidate rejected — reverse proxy mistaken for a load balancer, a cache in front of writes, a retry with no jitter. That is what an interview actually tests, and almost no free resource teaches it.

### 10.4 Content sources & attribution

Chapter content is **synthesised** from these, with a per-lesson attribution footer. Nothing is copied — that is both a copyright answer and a quality one, since the synthesis is where the beginner-level ordering happens.

| Topic | Primary source |
|---|---|
| Perf vs scalability · LB · CDN · sharding · federation · failover · consistency patterns | `donnemartin/system-design-primer` (375k★) |
| **Latency numbers every programmer should know** · powers of two | primer appendix (Peter Norvig's table) |
| Availability nines math · sequence-vs-parallel multiplication | primer |
| Back-pressure · message queues · task queues | primer, *Asynchronism* |
| The 5 cache strategies (cache-aside, write-through, write-behind, refresh-ahead) | primer, *When to update the cache* |
| 30-concept scaffold · **top 15 trade-offs** | `algomaster.io` |
| **break → fix → new-problem** rhythm · **Interview Byte** · one-app continuity | KodeKloud *System Design For Beginners* |
| CAP without the math | KodeKloud + primer |
| Real architectures · company case studies | highscalability.com + Netflix / Airbnb / Uber / Yelp engineering blogs |
| Scenario voice · "the design is the choices" framing | interview-prep sites, lesson 1 of a typical foundations path |

**The `latency numbers` table is the highest-value single asset in that list.** It gives a beginner real, memorable numbers ("reading 1 MB from memory is ~250× faster than from disk") instead of the word "fast" — and it costs one static table in the repo, no dependency.

### 10.5 Visualizers — specified, **Phase 7, not Phase A**

Roughly 15 topics in Part 4–5 are *shapeable into a one-hypothesis interactive* but do not belong in a general graph canvas. These are the highest-value-per-line items in the entire roadmap — ~570 lines for four mechanics — and **the clearest differentiator we have**, since design-canvas-plus-load-test products ship **no visualizers at all**.

| Visualizer | What it teaches that a diagram cannot | Route | ~lines |
|---|---|---|---|
| **Consistent hash ring** | Drag nodes onto a ring, kill one, watch only **1/N** of keys remap — versus **N/N** under modulo hashing. The single best interactive proof of *why* sharding works. | `/system-design/visualizers/hash-ring` | ~150 |
| **Replication lag timeline** | Writes land on the primary → replicas catch up at different rates → kill the primary → election → **the data-loss window is a visible gap**, not a sentence. | `/system-design/visualizers/replication-lag` | ~150 |
| **Rate limiter live view** | Requests drain a token bucket, it refills at a fixed rate, 429s appear. Turns "token bucket" from jargon into something the learner has watched fail. | `/system-design/visualizers/token-bucket` | ~120 |
| **Consistency spectrum** | Two-node timeline; slide strong → eventual and see **exactly what a reader observes** at each level. | `/system-design/visualizers/consistency` | ~150 |

**Design constraints, inherited from Phase A:** each is its own route with `generateStaticParams`, runs 100% client-side, adds **zero** dependencies, and **shares no code with `lib/system-design/engine.ts`** — the general canvas must not become a dependency of a single-hypothesis mechanic.

---

## 11. Free-Tier Compliance Check

| Guardrail | Status |
|---|---|
| Tables under 20 | **15 / 20** ✅ (+1) |
| Static routes use `generateStaticParams` | verified by `npm run build` route table in Task 8 (§12) ✅ |
| No per-request DB query for content | content is in the bundle ✅ — scales to 14 modules and 14 Build Tasks with no extra query cost |
| API rate-limited, DB-backed, handler-level | 2 scopes added to `lib/db-rate-limit.ts` + `config/rate-limits.ts` ✅ |
| Simulator cost | **100% client — 0 server CPU**, regardless of module or lab count ✅ |
| No AI calls | Phase A is **zero** Mistral calls ✅ |
| No new npm dependencies | 0 added ✅ |
| JSON for flexible metadata | `lessons_completed`, `tasks` ✅ |
| Soft deletes | n/a — no user-generated public content in Phase A ✅ |
| No file uploads | n/a ✅ |
| Unbounded-growth guard | max 50 tasks/user + 40 nodes/graph, enforced in Zod ✅ |

---

## 12. Task Breakdown

**Hard stop after every task. No commits, no chained agents** — `.agent/AGENT.md` human verification gate + `WORKFLOW.md` §5. I implement one task, you test, you commit.

| # | Task | Files | Verify |
|---|---|---|---|
| 1 | Types + node registry + `registry.ts` with dynamic imports | `config/system-design/{types.ts,registry.ts,nodes.ts→lib/system-design/nodes.ts}` | `npm run typecheck` |
| 2 | **Engine + rubric as a headless script** | `lib/system-design/{engine.ts,rubric.ts,validation.ts,graph-codec.ts}` | **`npx tsx` scratch script** — assert a 1-server design saturates, a replica raises throughput, 2 runs are byte-identical. Also assert `SdPassCriterion.assert()` fires on the broken graph and not on the solution graph | ✅ Done |
| 3 | Schema table + migration | `config/schema.tsx`, `drizzle/` | `npm run typecheck`, `npx drizzle-kit generate` + migrate, confirm 15/20 tables | ✅ Done |
| 4 | API route + rate-limit scope + config entry | `app/api/system-design/state/route.ts`, `lib/db-rate-limit.ts:9-24`, `config/rate-limits.ts` | curl with a signed session; 21st POST/min → 429; force an error and confirm `log.error` output **under `NODE_ENV=production`** | ✅ Done |
| 5 | Canvas — pan/zoom/drag/connect/delete | `components/system-design/canvas/*` | Manual: drag, connect, reconnect, delete, zoom-at-cursor. **`npm run build`** (I.9). ⚠️ **Checkpoint: canvas feels bad → stop and evaluate React Flow now** | ✅ Done |
| 6 | SimulationPanel + ResultsRail + FailurePanel wired to the engine | + `ModelDisclosure.tsx` | Manual: crank to 10×, node turns red, bottleneck pin appears, kill a node and re-run | ✅ Done |
| 7 | Inspector + HintLayer + ShareButton | 3 components | Manual: tune replicas, all 3 hint tiers, copy link reopens the design. **Record the URL length** (§9.4) | ✅ Done |
| 8 | Routes + `generateStaticParams` + path index + module + lesson reader | `app/(routes)/system-design/**`, `components/system-design/LessonFlow.tsx` | `npm run typecheck`; `npm run build` route table shows `●` for all system-design dynamic routes | ✅ Committed as `1142031`; typecheck and build pass. Registry is empty, so route patterns are SSG but no concrete module/lesson pages are emitted yet |
| 9 | Build-Task workspace — 3-pane `ResizablePanelGroup`, step rail, **criteria panel**, hard gate, escape hatch, autosave | `TaskWorkspace.tsx`, `components/system-design/CriteriaPanel.tsx` | Manual: refresh mid-edit, nothing lost; criteria gate blocks; escape hatch reveals without passing; 375px and 1920px | 🟡 Initial local scaffold is uncommitted; implementation and verification incomplete |
| 10 | *(moved — see Task 13)* | — | Content authoring deferred so every lesson is written against a running engine |
| 11 | `check:system-design` script + package.json entry | `scripts/check-system-design.ts`, `package.json` | Flip a slug in `registry.ts` → script exits 1 |
| 12 | Nav + dashboard + sitemap + tracker | `Sidebar.tsx:21-28`, `Header.tsx:7-12`, `sitemap.ts:10-20`, `QuickActions.tsx`, `.agent/feature-tracker.md` | Manual: link works, sitemap lists it, build route table still `●` |
| 13 | **A1 content** — Part 0, 4 modules × (lessons + Interview Byte + Build Task) | `config/system-design/modules/` | **You read every lesson.** No AI filler |
| 14 | **A2 content** — Part 1, 6 modules | `config/system-design/modules/` | Same gate. Re-run `check:system-design` |
| 15 | **A3 content** — Part 3, 4 modules, ending in the chaos capstone | `config/system-design/modules/` | Same gate |

**Gate between slices.** Tasks 1–13 are slice **A1** and must pass the §13 script on their own before Task 14 starts. Do not author A2 content until you have personally used A1 — that is the only way the ordering stays honest.

**Ordering note on engine vs content.** Tasks 1–12 build a *working, empty* system; Task 13–15 fill it. That ordering is deliberate — every lesson is written against an engine that demonstrably runs, rather than prose that promises behaviour the engine does not yet have. **It also does not need to be serial:** the *contract* in §5.2.1 is fixed before any prose is written, so lessons may be authored as soon as the contract is agreed. The contract, not the implementation, is what must come first.

**Per-module authoring cost.** Each module is 4 lessons + an Interview Byte + a step rubric + 1–2 pass criteria + a `solutionGraph`. **That is roughly double a plain prose module.** This is the long pole of Phase A, not the engine — which is why the slice gates above are non-negotiable.

### 12.1 Verification order per task

> `npm run typecheck` **passing is not sufficient verification.** `.agent/feature-tracker.md` records two real site-notice defects that passed `tsc` and were caught only by `npm run build` (mysql2 in the client bundle, §21.3) and by actually running the code (an unparsable expiry silently serialised to `null`, §21.5). **Type errors and bundler errors are different error classes. Always build, and prefer a scratch script that exercises real behaviour over reasoning about it.**

### 12.2 `check-system-design` — both directions

Mirrors `scripts/check-blog-toc.ts` (`package.json:10`), which the tracker praises for checking **both** directions:

1. **config → page**: every module and lesson in `registry.ts` appears in the built HTML, and every module's Build Task page exists.
2. **page → config**: every slug in the built HTML resolves in `registry.ts`.
3. **graph integrity**: every module's `solutionGraph` passes `SdGraphSchema`, and every `SdStep` / `SdPassCriterion` id is unique within its module.
4. **orphan check**: every `SdStep.check` and `SdPassCriterion.assert` is reachable — the direct lesson the 130-orphan interview-question bug taught (`SELECT COUNT(DISTINCT question_id)` analogue).
5. **criteria sanity — the one that catches a mis-tuned threshold:** for every module, run the `solutionGraph` through the engine and assert **all required criteria pass**, and run the module's `startGraph` and assert **at least one required criterion fails**. A module whose own solution does not pass its own gate is unpassable by anyone; a module whose broken start state already passes is not a task.
6. **cumulative chain**: module *N*'s `startGraph` must be reachable from module *N−1*'s `solutionGraph` (the one-app continuity from §10.1).

---

## 13. Manual Test Script

> **Availability:** The Task 9 workspace code is in place, but these end-to-end checks are blocked until Task 13 adds module content to the registry. Until then, the System Design area has no explorable modules.

After Tasks 8–12, `npm run dev`:

**Lessons**
1. `/system-design` → 14 module cards render; locked ones visible but greyed
2. Open a module → lesson list; open a lesson → mark complete → revisit → still ticked
3. "Your turn" accepts text and is skippable; "Compare with a senior engineer" reveals either way
4. Every module has an **Interview Byte** with the third part being *the trap*
5. Reload a lesson — confirm `●` in the build output and `x-nextjs-cache: HIT`
6. Module 4's Little's Law lesson comes **before** any simulator output is shown for the first time

**Build Task — the core loop** (run against Module 6, Caching)
7. Task loads with the **pre-wired broken design**, not a blank canvas
8. Drag a node, connect it, delete an edge — everything snaps back cleanly
9. Run at 100 users → green; crank to 1,000 → DB turns red, bottleneck pin appears, verdict explains it
10. Results rail shows p50/p95/p99 + **Little's Law concurrency** per node
11. Toggle **failure injection**: kill the DB → errors climb; degrade the tier → throughput halves; lag the replica → `stale` appears
12. Open "How this model works" — present and honest about limits

**Steps vs pass criteria — the thing to actually verify**
13. Pass every step check, then deliberately place the cache on the **wrong hop** → steps pass, criteria fail
14. Fix the wiring → criteria pass, module unlocks
15. Fail a criterion → gate holds, retry is unlimited, **no timer, no penalty shown**
16. "Show me the senior engineer's design" → solution graph loads, module **stays locked**, criterion marked `revealed`
17. Pass a module, then **deploy a stricter threshold** → reload → module is **still** passed (`criteriaMet` is persisted, §6.2)

**Step ladder + persistence**
18. **Every step of every Build Task** shows partial progress before passing
19. All 3 hint tiers work on every step
20. Drag nodes, **reload within 2 s** → design survives (localStorage mirror)
21. Wait for autosave, hard-reload → design survives (DB round-trip)
22. Copy design link → new tab opens **that** design, saved state untouched

**Arc check — one app across all 14**
23. Each module's task starts from the **previous module's finished design**, not from scratch
24. Module 14 (chaos capstone) exercises every failure toggle from Modules 7, 9, 12 and 13

**Auth / free tier**
25. Signed out on `/system-design` → redirected to `/sign-in` by `proxy.ts`
26. Signed out POST to the API → 401
27. Signed in, non-admin — **no** admin surface exists to probe (confirm nothing leaked into `/admin`)
28. 21 POSTs in a minute → 429, UI stays usable (autosave fails soft)

**Responsive / dark**
29. 375px: Design / Run / Steps tabs work, canvas still draggable
30. 1920px: 3-pane layout, panels resizable
31. Dark mode (the default) correct everywhere — node heat states legible

**Build**
32. `npm run build` → route table shows `●` for all four system-design routes
33. `npm run typecheck` clean, `npm run check:system-design` exits 0

---

## 14. Out of Scope — Sequenced, Not Undecided

Everything below is **designed** — it is mapped in the §10.0 roadmap and will be implemented in a later phase. Nothing here is an open question or an oversight; it is queueing.

| Excluded from Phase A | Roadmap part | Why deferred | When |
|---|---|---|---|
| **AI design review** | — | User decision. The deterministic engine is the teacher; AI review is polish and would add Mistral cost plus a rate-limit scope. | Phase 7 |
| Async: queues-as-service, pub/sub, WebSockets/SSE, CQRS | **Part 2** | Partially sim-native. Modules 12–13 already use queues, workers and DLQs, so Part 2 is a *deepening*, not a new mechanic. | Phase 7 |
| Data at scale: LSM/B-tree, replication internals, streams, CDC, retention | **Part 4** | Needs engine work beyond property additions — real sharding simulation. | Phase 8 |
| Distributed internals: clocks, HLL, consensus, service discovery | **Part 5** | ❌ **Never simulatable honestly.** A fake Raft teaches worse than prose. | Phase 8, prose + §10.5 visualizers |
| Services & org: monolith vs microservices, boundaries, API versioning, canary | **Part 6** | ❌ **Not a graph problem** — an org-design and communication problem. Prose only. | Phase 8 |
| Multi-region, geo-DNS, multi-master, SLO/error-budget math | **Part 7** | Sim-native, but requires multi-region node geometry the canvas does not have yet. | Phase 8 |
| Security: AuthN/AuthZ at scale, OAuth, DDoS, secrets | **Part 8** | ❌ **Deliberately absent.** Security content needs a security review before it ships, and "add auth" is the most dangerous wrong answer a design tool can teach. | Phase 9, post security review |
| **4 visualizers** (§10.5) | Parts 4–5 | Highest value-per-line in the plan, but they are *presentation*, not foundation — they need a working engine to hang off first. | Phase 7 |
| Interview labs: YouTube, WhatsApp, Razorpay as separate apps | — | Right for *interview* practice, wrong for learning. Needs its own `labs/[slug]` route, which Phase A deliberately does not build. | Phase 7 |
| React Flow, framer-motion, d3 | — | Zero new dependencies is a feature, not a constraint. | only if Task 5 fails |
| Content admin UI | — | Git is the CMS, same as the blog (§2). | never |
| Video, comments, leaderboards, certificates | — | YAGNI. | not planned |
| Free-for-all design mode, no rubric | — | Removes the teaching signal. Free mode unlocks *after* the steps pass. | Phase 7 |

---

## 15. Open Questions

1. **Beginner labelling** — should every node card carry a one-line plain-English role ("a cache stores a copy of a page so you don't ask the database")? Costs ~1 line per node type and removes a lot of "what do I do with this" hesitation. **Recommend yes.**
2. **Free mode** — a blank canvas with no steps, unlocked after the lab passes? Good retention hook, mild scope. **Recommend Phase 7.**
3. **URL length ceiling** — measured in Task 7; if a 40-node graph overflows, switch share links to an id.

---

## 16. Decision Log

| # | Decision | Rationale | Rejected alternative |
|---|---|---|---|
| 1 | Content in `config/`, **not** DB tables | 0 queries, `●` static routes, orphan-content risk impossible by construction | 3 content tables → 17/20, forced dynamic, recreates the 130-orphan failure class |
| 2 | **1** state table, `sd_user_state` | Mirrors the house pattern (`enrollments.progress`); PK lookup; no contention | Separate `sd_tasks` / `sd_lessons` progress tables — 4 tables for one feature |
| 3 | Hand-rolled SVG canvas | Edge particle animation **is** the product; 0 new deps; narrow use case fits | `@xyflow/react` +45 kB, fights edge overlay |
| 4 | Simulator **client-side** | 0 server CPU forever; no API to abuse; works offline | Server simulation → per-run invocations on a paid budget |
| 5 | Deterministic seeded PRNG | A learner re-running must see the same answer, or they stop trusting it | `Math.random()` — non-reproducible, and a hydration hazard |
| 6 | Little's Law as a first-class output | The mental model that makes capacity estimation click; nobody teaches it this way | Opaque "req/s: 12,400" |
| 7 | Start-from-broken, not blank | Blank-page paralysis is the #1 beginner killer in a visual editor | Blank-canvas labs |
| 8 | Failure injection alongside load | Load ≠ failure; the lagging replica is what actually kills systems | Load-only |
| 9 | Zero AI in Phase A | Deterministic output can't hallucinate a wrong bottleneck; zero Mistral cost | AI design review |
| 10 | 8 steps, not 13 | Prove the mechanic before authoring volume | 13-step parity |
| 11 | Modelled-limits disclosure | A sim that oversells teaches falsehood; it's a pedagogical feature | Hide the model's limits |
| 12 | Phase 6, not Phase 5 | Full learning path, not an interview feature | Fold into mock interviews |
| 13 | Curriculum design separated from implementation scope | A feature spec needs the full path designed and the build sliced. Conflating them is how features become 90 AI-written lessons nobody reads | One number for both |
| 14 | Phase A = **Part 0 + Part 1 + Part 3**, sliced **A1/A2/A3** | Covers mindset → scaling → reliability, which is a coherent milestone ("you can now scale a monolith and reason about its failure modes"). Slicing preserves incremental delivery | Phase A = 3 modules (too shallow — a learner would finish without ever seeing a cache); one 14-module drop (unreviewable) |
| 15 | **No AI-generated lessons** | Filler is the exact failure mode that makes learning platforms worthless. Every lesson gets read by a human before it ships | Bulk-authoring 14 modules with a model |
| 16 | **Phase A needs no new node types** | All 14 modules reduce to properties on the existing 9 types + scenario knobs (§5.2.1). Far cheaper than the module count suggested | Adding a `rate_limiter` / `shard` / `breaker` node type per topic |
| 17 | Rate limiting as an `load_balancer` property | A limiter node invites wrong placement; attaching it to the LB makes "in front of everything" the only option | A 10th `rate_limiter` node type |
| 18 | ~55 of ~90 topics will **never** be simulatable | A fake Raft or a fake CRDT teaches worse than prose. Classifying honestly (✅/🟡/❌ in §10.0) prevents scope drift later | Simulate everything, hope it's fine |
| 19 | Security content deferred to Phase 9 **post-review** | "Add auth to your design" is the most dangerous wrong answer a design tool can teach | Shipping Part 8 alongside Phase A |
| 20 | ~~Lab 2 added (A3)~~ **superseded by #23** | Lab 2's content folded into Modules 9, 12 and 13 rather than existing as a separate lab | — |
| 21 | ~~Engine before content~~ **reversed — see #23** | Originally held that lessons must follow a running engine | — |
| 22 | 4 visualizers specified, built Phase 7 | ~570 lines, highest value-per-line in the roadmap; design-canvas products ship none. Needs a working engine first | Build them in Phase A (delays validating the core) |
| 23 | **REVERSAL of #21: contract first, then content ∥ engine** | #21 assumed lessons could promise behaviour the engine lacks. Locking the §5.2.1 **capability contract** removes that risk without requiring the engine to be finished first. Every module must end in something they build — a module that teaches caching and hands you nothing to do with caching is a lecture. | Engine fully built before any prose (slow, and #21's premise was wrong) |
| 24 | **Every module ends in a 🔨 Build Task** | Gives each module a payoff and a reason to exist. Tasks are small deltas on one growing app, so they are cheap to author *and* cheap to understand | Lessons only, with labs as a separate collection |
| 25 | **Pass criteria assert on the `SimulationResult`, not the graph** | Steps check *intent* (did you add a cache?). Criteria check *consequence* (does it actually hit 50k r/s at p95 < 150 ms?). Without this the task is a matching game — step-gated labs have exactly that weakness | Steps only |
| 26 | **Hard gate, unlimited retry, plus a reveal escape hatch** | Makes the numbers matter. But a hard gate with no escape is the dead end §6.1 forbids, so the escape hatch reveals the solution and marks criteria `revealed` — the module stays locked, and the platform never claims an unaided pass | Soft "pass with warning" (nobody internalises a wrong number); hard gate with no exit (blocks beginners permanently) |
| 27 | `criteriaMet` **persisted, never recomputed** | Recomputing means a later threshold tweak silently re-blocks a user who already passed. A passed gate is permanent | Recompute from the graph on load |
| 28 | **One photo-sharing app across all 14 modules** | Continuity beats variety for *learning*: work accumulates, motivation compounds, the capstone falls out, and our 9 node types fit it almost exactly (uploads = `object_store`→`queue`→`worker`→`cdn`, feed = `cache`→`database`). KodeKloud's beginner course validates the approach. 15 separate apps is right for *interview* practice, wrong for learning — so that becomes Phase 7 | 15 separate apps, each restarting from zero (15 × 13 steps, no shared setup) |
| 29 | No standalone `labs/[slug]` route; task lives at `/[module]/task` | One task per module, so it belongs inside the module. A standalone lab route would exist only to serve Phase 7 interview labs — YAGNI, and it would shape Phase A's architecture for an unspecced future | `/system-design/labs/[slug]` |
| 30 | Module template includes an **Interview Byte** (shape · strong answer · **the trap**) | The trap — the answer that sounds right and gets a candidate rejected — is what an interview actually tests, and almost no free resource teaches it | Concept + diagram only |
| 31 | Content **synthesised** from primer / AlgoMaster / KodeKloud / Norvig / company blogs, with per-lesson attribution | The synthesis is where the beginner-level ordering happens; attribution is the copyright answer and the quality argument | Copying prose from any one source |
| 32 | **`SdNode` is a discriminated union on `type`** | ~84 checks and criteria across 14 modules; a flat shape makes every one of them a null guard, and a missed guard is a runtime crash instead of a compile error. `find(n => n.type === "cache")` narrows, and the Zod mirror uses `z.discriminatedUnion` | One flat `SdNode` with ~15 nullable fields, simpler JSON at the cost of ~84 unchecked accesses |
| 33 | **Contract extended in Task 1, not deferred to Task 2** | §12's ordering is "contract first, content ∥ engine". Shipping §5.2.1 verbatim meant 5 of 6 sim criteria were unprovable, so Task 13 authoring would have blocked on a Task-2 rediscovery | Extend during Task 2 — the "locked" contract was never actually locked |
| 34 | `registry.ts` ships with an **empty** `LOADERS` map | `import()` on files that do not exist until Task 13 fails `tsc` at Task 1 and keeps it red for 12 tasks. Entries land one per module at Task 13 | Scaffold a placeholder module, or move Task 1 after Task 13 — both break the empty-system-first ordering |
| 35 | `labSlug` → `taskSlug`, `lab-save` → `task-save`, `sd-lab:` → `sd-task:` | The `labs` → `tasks` rename in §3.2 was incomplete and left three sites implying labs are a separate collection. Settled now, while these files are open | Leave it for Task 11 — the API route and localStorage key would ship with `lab` vocabulary over a `tasks` column |
| 36 | `getModule` guards with `Object.hasOwn`, not truthiness | `LOADERS` is an object literal, so `LOADERS["constructor"]` resolves through `Object.prototype`. `if (!loader)` caught none of the inherited keys: `constructor` returned `undefined` and `valueOf` / `hasOwnProperty` / `__proto__` **threw**. A slug is attacker-supplied on a dynamic route, and a throw means 500 where the caller wanted 404 | `if (!loader) return null` — looks equivalent, silently accepts prototype keys |
| 37 | `NODE_TYPE_ORDER` is **derived** from `NODE_TYPES`, not a second list | `SdNodeType[]` accepts a list that is *valid*, not *complete*. Deleting one entry removed that node from the palette and left `tsc` clean — a silent hole in the only thing a learner touches first. Deriving from `Record<SdNodeType, …>` makes omission unrepresentable | Keep the hand-maintained array and let `check:system-design` catch it in Task 11 — a month of a node missing from the palette |
| 38 | `SdNodeResult.serviceMs`, not `latencyMs`; `SdScenario.writeShare`, not `readWriteShare` | `SimulationResult.latency.p95` already means *total* latency including queue, so `latencyMs` next to `queueWaitMs` was one word with two meanings across two types read together. `readWriteShare` reads as "reads and writes combined", which is always 1.0 | Ship the original names and rely on the comments |

---

## 17. Status Log

| Item | State | Notes |
|---|---|---|
| **Tasks 1–12 (slice A1)** | 🔄 **Tasks 1–9 implemented; end-to-end acceptance pending** | Task 1 (contract + node registry) shipped 2026-10-18. Task 2 (engine + rubric + verification) completed 2026-10-20. Task 3 (schema + migration) completed 2026-10-20. Task 4 (API route + rate limits) completed 2026-10-20. Task 5 (canvas) completed 2026-10-20. Task 6 (simulation panels) completed 2026-10-20. Task 7 (HintLayer + ShareButton) completed 2026-10-20. Task 8 routes and lesson reader committed as `67177e8` on 2026-10-23. Task 9 workspace is implemented and verified by typecheck, tests, and production build; interactive acceptance remains blocked until Task 13 registers modules. |
| Task 13 (A1 content) | ✅ Done (extended) | Part 0 all 4 modules authored + registered: `what-is-system-design`, `requirements`, `constraints-and-design-process`, `back-of-the-envelope`. Plus Module 5 (`load-balancers-and-stateless-services`) and **Module 6 (`caching`)** authored ahead of the A2 slice. 6 modules registered; guardrail green. |
| Tasks 14 (A2 content) | 🔄 In progress | Module 7 (`read-replicas`) authored and registered (2026-10-24). Module 8 (`partitioning-and-sharding`) authored and registered (2026-10-25); database partition count and hot-key skew now affect modeled capacity. Remaining A2 modules: 9 rate limiting, 10 CDNs. Run the A1 manual acceptance gate before continuing. A3 modules (11–14) gated. |
| Tasks 15 (A3 content) | ⬜ Gated behind A2 | Do not author before A2 is personally used |
| Task 1 — `config/system-design/types.ts` | ✅ Done | All types in one dependency-free file. That is what avoids a runtime cycle: `SdPassCriterion.assert` is content but consumes the engine's `SimulationResult` |
| Task 1 — `lib/system-design/nodes.ts` | ✅ Done | 9 types as data, `defaultNode()`, palette order, §15 Q1 blurb line per type. All 9 `iconKey`s verified against `lucide-react` |
| Task 1 — `config/system-design/registry.ts` | ✅ Done | 8 modules registered: what-is-system-design, requirements, constraints-and-design-process, back-of-the-envelope, load-balancers-and-stateless-services, caching, read-replicas, partitioning-and-sharding |
| Task 1 — contract gaps closed | ✅ Done | `errorClasses`, `bandwidthMbps`, `perNode[].serviceMs`, `writeShare`, `mediaShare`, `bytesPerMediaRequest`, `abusiveShare`, `cdn.hitRate`, `worker.replicas` — see §5.2.1 |
| Task 1 — self-review pass | ✅ Done | Found and fixed 3 defects: prototype-key lookup in `getModule` (threw on 3 of 5 inherited keys → 500 not 404, decision 36), `NODE_TYPE_ORDER` able to silently omit a type with `tsc` clean (decision 37), and two names that meant something other than they said (decision 38). Also documented the `Infinity` JSON trap on `client.capacity` |
| Task 2 — `lib/system-design/validation.ts` | ✅ Done | Zod v4 discriminated unions for SdGraph, SdNode, SdEdge, SdScenario with `.max()` bounds on all strings |
| Task 2 — `lib/system-design/graph-codec.ts` | ✅ Done | Base64url encode/decode with size limits (8KB), schema validation on decode |
| Task 2 — `lib/system-design/engine.ts` | ✅ Done | Deterministic engine: mulberry32 PRNG, M/M/1 queueing, 4 failure kinds, Little's Law per node, database partition capacity adjusted for hot-key skew (aggregate estimate; no per-shard key routing) |
| Task 2 — `lib/system-design/rubric.ts` | ✅ Done | Step builders (addNode, connect, placeBetween, setProperty), criterion builders (latencyPct, throughput, errorRate, errorClass, bandwidthMbps, nodeAvgLatency, zeroStaleReads, writesSucceed) |
| Task 2 — `scripts/verify-engine.ts` | ✅ Done | 26 headless tests: determinism, capacity, cache, failures, share links, steps, criteria, Little's Law, teaching, topology, rate limiting, bandwidth, validation, M/M/1 formula |
| Task 2 — self-review pass | ✅ Done | Fixed 11 issues: DoS cap, string bounds, payload size limit, M/M/1 verification, broken criterion builders, magic constants, function decomposition, duplicate removal, dynamic teaching strings, edge map precompute, all 26 tests passing |
| Task 3 — `config/schema.tsx` | ✅ Done | Added `sd_user_state` table with `user_id` PK/FK, `lessons_completed` JSON, `tasks` JSON, `updated_at` |
| Task 3 — `drizzle/0011_quiet_slipstream.sql` | ✅ Done | Migration generated and applied; 15/20 tables confirmed; no schema drift |
| Task 4 — `app/api/system-design/state/route.ts` | ✅ Done | GET/POST with Clerk auth, DB rate limit, Zod discriminated union for lesson-complete + task-save, Drizzle transaction |
| Task 4 — `lib/db-rate-limit.ts` | ✅ Done | Added `system-design` scope to `RateLimitScope` union |
| Task 4 — `config/rate-limits.ts` | ✅ Done | Added POST 20/min and GET 30/min entries for `/api/system-design/state` |
| Task 5 — `components/system-design/canvas/Canvas.tsx` | ✅ Done | Main canvas with pan/zoom, grid, node/edge rendering, zoom controls, fit view |
| Task 5 — `components/system-design/canvas/NodeCard.tsx` | ✅ Done | Draggable nodes with ports, utilisation indicator, property display |
| Task 5 — `components/system-design/canvas/EdgePath.tsx` | ✅ Done | Bezier curves with arrowheads, animated flow particles, delete button |
| Task 5 — `components/system-design/canvas/NodePalette.tsx` | ✅ Done | Categorized drag-to-add palette with Lucide icons |
| Task 5 — `components/system-design/canvas/useCanvasInteractions.ts` | ✅ Done | Pan/zoom, drag-to-add, click-to-connect, port hit-testing, keyboard shortcuts |
| Task 5 — `components/system-design/canvas/index.ts` | ✅ Done | Barrel export for all canvas components |
| Task 5 — `components/ui/lucide-icons.tsx` | ✅ Done | Icon map for Lucide icons used in node palette |
| Task 5 — `lib/system-design/nodes.ts` | ✅ Updated | Re-exported `SdNodeType` for canvas components |
| Task 5 — self-review pass | ✅ Done | Typecheck clean, build passes, hand-rolled SVG canvas works without React Flow |
| Task 6 — `components/system-design/SimulationPanel.tsx` | ✅ Done | Traffic slider, Run/Stop, latency sparkline, verdict |
| Task 6 — `components/system-design/ResultsRail.tsx` | ✅ Done | Metrics readout (p50/p95/p99, throughput, error rate, bandwidth, error classes, bottleneck, teaching) |
| Task 6 — `components/system-design/FailurePanel.tsx` | ✅ Done | Chaos toggles for node_down, degraded, partition, replica_lag with forms |
| Task 6 — `components/system-design/ModelDisclosure.tsx` | ✅ Done | Integrity panel with model limitations and assumptions |
| Task 6 — `components/system-design/canvas/Canvas.tsx` | ✅ Updated | 3-pane layout with right panel tabs (Results/Inspector/Failures/Model) |
| Task 6 — self-review pass | ✅ Done | Typecheck clean, build passes, all 26 engine tests pass |
| Task 7 — `components/system-design/HintLayer.tsx` | ✅ Done | 3-tier hint system (nudge → hint → reveal) with progress tracking |
| Task 7 — `components/system-design/ShareButton.tsx` | ✅ Done | Copy link + native share + copied toast |
| Task 7 — `components/system-design/SimulationPanel.tsx` | ✅ Updated | Integrated ShareButton |
| Task 7 — `components/system-design/index.ts` | ✅ Updated | Exported HintLayer, ShareButton |
| Task 7 — `components/system-design/FailurePanel.tsx` | ✅ Fixed | FailureItem index bug fixed, getEdgeLabel fixed, SdFailure id field added |
| Task 7 — `components/system-design/SimulationPanel.tsx` | ✅ Fixed | ShareButton receives full graph, verdict computed from passCriteria |
| Task 7 — `components/system-design/HintLayer.tsx` | ✅ Fixed | Early return bug fixed, Reveal button disabled after click |
| Task 7 — `config/system-design/types.ts` | ✅ Updated | Added `id` field to SdFailure |
| Task 7 — `tests/engine.test.ts` | ✅ Fixed | Added `id` to all SdFailure test fixtures |
| Task 7 — self-review pass | ✅ Done | Typecheck clean, build passes, all 26 engine tests pass |
| Task 8 — system-design routes and lesson reader | ✅ Committed (`67177e8`) | Registry-backed static params for module/task routes and parent-derived lesson params; functional module and lesson readers with progress persistence. `npm run typecheck` and `npm run build` pass; concrete lesson and task pages are emitted as SSG for all registered modules. |
| Task 9 — Build-Task workspace | ✅ Implemented; manual acceptance pending | Interactive pointer-based canvas with node palette, move/connect/delete, simulation and failure controls, step progress and hints, sticky criteria gate, solution reveal without passing, local persistence and server autosave, and desktop/mobile layouts. `npm run typecheck`, `npm test`, and `npm run build` pass. Run the listed manual acceptance checks for the registered modules before continuing A2. |
| §10.0 curriculum roadmap | ✅ Written | Part 0–9, ~90 topics, engine support tagged |
| §10.1 14-module table | ✅ Written | each with lessons · Build Task · pass criteria · engine properties |
| §10.3 module template | ✅ Written | Story → Lessons → Interview Byte → Build Task → Recap |
| §10.4 source map | ✅ Written | primer, AlgoMaster, KodeKloud, Norvig, highscalability, company blogs |
| §10.5 visualizer specs | ✅ Spec'd, not built | 4 visualizers, ~570 lines, Phase 7 |
| §5.2.1 engine properties | ✅ Spec'd + **extended** | 9 property additions, 0 new node types. Extended at Task 1 — the traffic mix was missing (§5.2.1) |
| §6.1 pass criteria | ✅ Spec'd | `SdPassCriterion` — asserts on `SimulationResult` |
| §6.2 hard-gate safety valve | ✅ Spec'd | primary/secondary split + reveal escape hatch + `attempts > 20` mis-tune detector |
| §3.2 `tasks` shape | ✅ Spec'd | `graph`, `steps`, `criteriaMet`, `attempts`, `revealed` |
| §9.4 URL length | ⬜ Unmeasured | Measure in Task 7, record the number here |
| §15 Q1 node labelling | ⬜ Open | Recommend yes |
| §15 Q2 free mode | ⬜ Open | Recommend Phase 7 |
| Authoring load | ⬜ Unstarted | **~2× a plain prose module each** (lessons + Interview Byte + rubric + criteria + solution graph). The long pole — not the engine. |
---

## 18. UI/UX Redesign — System Design Module (2026-10-24)

A readability-first redesign of the entire System Design module surface. Goal: calm, legible, opinionated reading experience for lessons (where users spend the most time) and a focused, guided workspace for the build task. No new dependencies; all changes scoped to the module via a `.sd-scope` accent palette.

### 18.1 Scoped accent palette (`app/globals.css`)
- Added `--sd-accent` (indigo), `--sd-accent-soft`, `--sd-success`, `--sd-warn`, `--sd-danger`, `--sd-info` tokens under a `.sd-scope` class, with light/dark variants.
- Registered as Tailwind v4 `--color-sd-*` tokens so `bg-sd-accent`, `text-sd-success`, etc. are usable.
- Added a `prefers-reduced-motion` guard scoped to `.sd-scope`.
- Applied `sd-scope` to the root containers of the index, module, lesson, and task pages.

### 18.2 Index page (`app/(routes)/system-design/page.tsx`)
- Gradient hero with accent blurs, part/module chips, refined spacing.

### 18.3 Module card (`components/system-design/ModuleCard.tsx`)
- Part chip, hover lift (`-translate-y-1` + shadow), focus ring, lessons count with accent dot.

### 18.4 Module layout (`components/system-design/ModuleLayout.tsx`)
- Removed the dead sidebar slot; added a sticky left lesson rail (collapsible) and a right "On this page" rail (anchor links + progress card + build-task CTA).
- Full-height (`100dvh`) flex layout with independent scroll columns (left / middle / right), each with its own scrollbar.
- Removed the "Open build task" button from the left rail (kept in right rail + build-task section).
- Capped the reading column at `max-w-6xl`; rails narrowed to `w-44`/`w-64`.

### 18.5 Lesson reader (`components/system-design/LessonFlow.tsx`)
- Top progress bar (lesson N of M), reading-time estimate, keyboard ←/→ navigation.
- Left rail: module/lesson list + progress (md breakpoint, `w-36`–`w-56`).
- Right rail: section TOC (anchor links), progress, prev/next lesson links.
- Per-section visual treatments: scenario (info), concept (plain), your-turn (warn), compare (accent), recap (success), diagram (card).
- Full-width middle content option; inner wrappers aligned so title and prose share one column.
- Full-height independent scroll columns.

### 18.6 Task workspace (`components/system-design/TaskWorkspace.tsx`)
- Accent tabs/header/empty-state; improved empty-canvas copy; larger tap targets.

### 18.7 Step rail, criteria, simulation, failure, results
- `StepRail`: semantic status colors, accent progress bar and run button, rounded cards.
- `CriteriaPanel`: success/warn status colors, rounded cards.
- `SimulationPanel`: accent run button.
- `FailurePanel`: accent ring, danger clear-all button.
- `ResultsRail`: semantic utilization colors, accent bottleneck card.

### 18.8 Verification
- `npm run typecheck` clean; `npm run build` succeeds; all system-design routes remain `●` SSG.
- Manual checks: dark/light, 375px mobile, keyboard nav, independent scroll.

### 18.9 Files touched
`app/globals.css`, `app/(routes)/system-design/page.tsx`, `app/(routes)/system-design/[module]/page.tsx`,
`components/system-design/{ModuleLayout,LessonFlow,ModuleCard,TaskWorkspace,StepRail,CriteriaPanel,SimulationPanel,FailurePanel,ResultsRail}.tsx`.
