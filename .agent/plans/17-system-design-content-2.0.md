# System Design 2.0 — Depth, Breadth and Differentiation

> **Date:** 2026-10-27
> **Status:** In progress. Slices B1–B3 shipped (uncommitted) on 2026-10-27/28; B4–B7 pending. One slice ships at a time, each ending in a manual review by me before the next one starts. No commits by the agent.
> **Scope:** the system-design learning path only — `config/system-design/**`, `app/(routes)/system-design/**`, `components/system-design/**`, `scripts/check-system-design.ts`, `tests/`. No DB schema change, no new dependency, no server cost.
> **Supersedes:** the content sections of `.agent/plans/16-system-design-phase-6.md` §10.0–§10.1 (roadmap and module table). §10.5 visualizers, §11 free-tier check and §12 task list there remain valid.
> **Companion:** `.agent/plans/17-system-design-resource-map.md` — the 31-video Bangla playlist mapped to modules, plus a verified free read for every lesson. Every link there was HTTP-checked on 2026-10-27.
> **Trigger:** the system-design path was reviewed against a full external curriculum (`systemdesignschool.io`, 121 lessons across 10 topic groups). Measured result: 41 lessons at 259 words average, 4 of 10 topic groups at 0% coverage, and 75 authored chapter entries that no page renders.

---

## 0. Decisions locked

| # | Decision | Why |
|---|---|---|
| **D1** | The running case study is **Netflix** — not this app, and not a photo-sharing app | *(Revised 2026-10-27 after the first draft shipped on LynxDEV.)* Three tests, in order: **checkable**, **on-topic**, **not the reference site's example**. Netflix passes all three. `about.netflix.com` is the company's own account of the August 2008 database corruption, the phrase *"vertically scaled single points of failure"*, the forklift-vs-rebuild choice, the seven-year timeline and the January 2016 completion — one URL the learner can read in four minutes, and every number here traces to it or to `openconnect.netflix.com` and `github.com/Netflix/chaosmonkey`. It is **on-topic for our playlist**, which is video-platform-heavy: CDN (Open Connect), deliberate failure injection (Chaos Monkey), circuit breakers (Hystrix) and adaptive limits are all Netflix artefacts, i.e. the exact subjects of Parts 1 and 3. **LynxDEV failed the first test**: no learner can verify our write volume or our p95, so every "our rate limiter does X" sentence is an assertion of trust, and a reviewer cannot diff it against anything published. **Instagram was rejected** because it is the reference site's own practice problem, and the depth of primary-source numbers is thin outside engineering blogs. |
| **D2** | **1 leaf chapter = 1 lesson.** `chapters` is the navigation tree; every leaf binds to a lesson by `lessonSlug`; the set of leaves must equal the set of lessons | Today `chapters` and `lessons` are two competing tables of contents that never reference each other. Module 1 promises a `Scalability Patterns` lesson that does not exist. Enforced in both directions, like `check:blog-toc`. |
| **D3** | Depth bar per lesson: **700–900 words**, 1 scenario, 3–5 concept sections, 1 worked numeric example or table, 1 diagram where the topic is scaling-related, `your_turn` + `compare` + `recap` | Today: 41 lessons, 10,630 words, **259 words/lesson**. The bar is ~3×. The bar is checkable, not aspirational. |
| **D4** | Breadth order: **API → storage → async → replication internals → distributed → patterns.** Big Data deep dive and domain knowledge (geospatial / media / probabilistic) are out of scope | Junior-first audience. The reference site's Big Data block is 19 lessons of senior/staff material — lowest value per authored hour for a learner at this level. |
| **D5** | `SdModule.task` becomes optional **only when the first prose-only module lands** (Slice B3) | YAGNI. Every current module is simulator-teachable. Change the type at the point of need, with its four consumers in one slice. |
| **D6** | Differentiation is **structural**, not cosmetic. The reference site is a *topic checklist only* — no prose, no titles, no diagrams, no codelabs, no problem statements | Topic lists are public knowledge; expression is not. Our differentiators are: one growing app, the canvas simulator, Bangla video, everything free. |

---

## 1. Diagnosis (measured, not estimated)

| Measurement | Value |
|---|---|
| Modules | 14 |
| Lessons | 41 |
| Prose words | 10,630 |
| Average per lesson | **259 words** |
| Chapter entries authored | **75** (across 10 modules) |
| Modules with **no** chapter outline | 4 — `requirements`, `constraints-and-design-process`, `back-of-the-envelope`, `load-balancers-and-stateless-services` |
| Diagrams / Bangla videos | 17 / 10 |
| Static system-design pages | 69 (14 module + 41 lesson + 14 task) |

### 1.1 Four defects, in order of severity

1. **`chapters` is never rendered.** It is passed through `app/(routes)/system-design/[module]/page.tsx:47` and then dropped. `components/system-design/Sidebar.tsx` was written to render it, is imported by nothing, and its hrefs are wrong — `${chapter.slug}` is used as the *module* segment, so every link would 404 if it were mounted.
2. **The outline promises content that does not exist.** Caching: 10 entries / 4 lessons. Rate limiting: 10 / 3. How systems fail: 9 / 3. Module 1: a `Scalability Patterns` leaf with no lesson behind it.
3. **Depth.** Rate limiting 613 words, idempotency 366, chaos capstone 390, requirements 570. A concept-per-page resource cannot be built out of 250-word pages.
4. **`SdModule.task` is required** (`config/system-design/types.ts:385`), so the ~55 prose topics already designed in plan 16 §10.0 (Parts 2, 4, 5, 6, 7, 8, 9) are structurally unshippable without faking a Build Task — which plan 16 itself forbids ("a fake Raft teaches worse than prose").

### 1.2 Coverage against the 10 topic groups (121 lessons)

| Group | Theirs | Ours today | Coverage |
|---|---|---|---|
| Basics | 5 | modules 1–4 | ~70% |
| **API Design** | 6 | none | **0%** |
| Non-functional requirements | 7 | 1 lesson + scattered | ~25% |
| Resource estimation | 3 | module 4 | ~90% |
| **Microservices** | 1 | none | **0%** |
| Sync + async communication | 17 | 4 topics; no queues, no Kafka | ~30% |
| Scaling services | 29 | modules 6–11 | ~60% |
| **Data storage** | 22 | none | ~0% |
| **Big Data** | 19 | none | **0%** |
| **Patterns & templates** | 12 | none | **0%** |

The honest summary: the gap is not 121 vs 41 topics — it is **granularity**. Their "lesson" is one concept; ours is a chapter wearing a lesson's name. Splitting is the fix, and the authored outline already says where the cuts go.

---

## 2. Target map

**Phase B is the committed scope. C and D are sequenced, not promised.**

| Phase | Parts | Modules | Lessons | State |
|---|---|---|---|---|
| **B (this plan)** | 0 Mindset, 1 Scaling, 3 Reliability | 15 | 79 | 11 rewritten, 4 story-renamed then deepened |
| C (later) | 2 Async, 4 Storage, 5 Internals, 6 Distributed, 7 Patterns | 10 | ~57 | new |
| D (later) | 8 Global, 9 Practice problems | 1 + 7 problems | ~11 | new |

**Total if all phases ship: ~26 modules, ~146 lessons** — deliberately not a target. C is re-scoped after B is read end to end. If B feels complete on its own, C shrinks to storage + async + internals + patterns (~36 lessons).

**Numbering:** Phase B renumbers `order` contiguously 1–15, because the API module is inserted at position 5. Phase C will renumber once more. So that this cannot drift silently, `check:system-design` gains an assertion that `order` is exactly `1..N` with no gaps and no duplicates.

---

## 3. Phase B — module specification

Every module: story rewritten onto the **Netflix** case study (D1), lessons split to match the chapter outline, D3 depth bar applied. `S` = simulator module (keeps its Build Task). `P` = prose module.

**The anchor column is the part that stops this being a generic textbook.** Each module must be built around one Netflix artefact or one sentence from a Netflix primary source — not around "a video platform" in the abstract. If a lesson cannot be tied back to its anchor, the lesson is filler and should be cut. Every URL in this column was `curl`-verified **200** on 2026-10-27; the one class excluded is `netflixtechblog.com`, which answers **403** to non-browser clients (Medium bot wall, same class as Cloudflare/Nginx — see resource map §5), so its posts are referenced here by title, never linked as a `sources` entry.

### Part 0 — Mindset (5 modules, 22 lessons)

| # | Module | Lessons (one leaf chapter each) | Kind | Netflix anchor |
|---|---|---|---|---|
| 1 | `what-is-system-design` | choices-not-boxes · performance-vs-scalability · latency-vs-throughput-vs-bandwidth · **scalability-patterns** *(new — promised today, absent)* | S | 2008 corruption, forklift-vs-rebuild — `about.netflix.com/news/completing-the-netflix-cloud-migration` |
| 2 | `requirements` | functional-vs-nonfunctional · eliciting-requirements · **turning-fast-into-a-number** · **what-youre-not-building** | S | Same post: streaming launched broadly while billing stayed in the data centre on purpose — two requirement sets, one company |
| 3 | `constraints-and-design-process` | the-45-min-structure · tradeoffs · anti-patterns · **saying-it-out-loud** | S | Same post: seven years, phased, and *"we simply could not have racked the servers fast enough"* |
| 4 | `back-of-the-envelope` | powers-of-two-and-latency-numbers · qps-storage-bandwidth · littles-law · **estimation-under-uncertainty** | S | Same post: 130+ countries in one day (Jan 2016) and *"hundreds of micro-services"* — estimate before you promise |
| 5 | **`api-and-contracts`** (new) | the-contract-before-the-code · pagination-that-doesnt-lie · who-are-you-vs-what-may-you-do · idempotent-writes · errors-and-status-codes · the-gateway-as-one-door | **P** | Zuul as the single edge — `github.com/Netflix/zuul`; Eureka for who-exists — `github.com/Netflix/eureka` |

### Part 1 — Scaling up (6 modules, 40 lessons)

| # | Module | Lessons | Kind | Netflix anchor |
|---|---|---|---|---|
| 6 | `load-balancers-and-stateless-services` | vertical-vs-horizontal · **autoscaling** · load-balancing · **sessions-without-sticky** · stateless-services | S | Eureka (discovery) + Zuul (edge routing) — `github.com/Netflix/eureka`, `github.com/Netflix/zuul` |
| 7 | `caching` | **why-cache** · where-to-cache · **cache-aside** · **write-through-and-behind** · **refresh-ahead** · **cache-keys-and-cardinality** · ttl-and-eviction · invalidation · cache-stampede · **cold-start-and-failure-modes** | S | EVCache, their memcached layer — `github.com/Netflix/EVCache` |
| 8 | `read-replicas` | scaling-reads-vs-writes · replication-lag · promoting-a-replica · **read-your-own-writes** · **cqrs-and-read-models** · **when-replicas-dont-help** | S | Same post: the data model was denormalised and moved to NoSQL rather than replicated as-is |
| 9 | `partitioning-and-sharding` | why-partition-data · hash-and-range-sharding · hot-keys-and-skew · rebalancing-shards · **consistent-hashing** · **cross-shard-queries** · **when-not-to-shard** | S | Same post: one relational database became many partitioned services; member data had to be split before it could scale |
| 10 | `rate-limiting` | the-bot-in-your-traffic · algorithms · **distributed-rate-limiting** · **quotas-and-tiers** · **load-shedding** · **429-and-retry-after** | S | Adaptive concurrency limits instead of a fixed number — `github.com/Netflix/concurrency-limits` |
| 11 | `cdns-and-static-content` | latency-numbers · cache-keys-and-ttl · what-a-cdn-cannot-cache · **edge-compute** · **image-and-video-delivery** · **purging-and-versioning** | S | Open Connect, the CDN they built and put inside ISPs — `openconnect.netflix.com` |

### Part 3 — Reliability (4 modules, 17 lessons)

| # | Module | Lessons | Kind | Netflix anchor |
|---|---|---|---|---|
| 12 | `how-systems-fail` | trace-your-own-design · retry-storms · cascades · **blast-radius-and-bulkheads** · **logging-monitoring-and-traces** *(new — the observability gap)* | S | Simian Army, the tool that finds failure on purpose — `github.com/Netflix/SimianArmy` |
| 13 | `timeouts-retries-circuit-breakers` | no-timeout-is-worse · retries-and-jitter · breakers-and-bulkheads · **timeout-budgets** · **fallbacks-and-degradation** | S | Hystrix, the breaker they open-sourced — `github.com/Netflix/Hystrix` |
| 14 | `idempotency` | at-least-once-delivery · idempotency-keys · **exactly-once-is-a-lie** · dead-letter-queues | S | Same post: billing was the **last** system to leave the data centre, because money movement cannot be retried carelessly |
| 15 | `chaos-capstone` | chaos-as-practice · surviving-everything · **postmortems-without-blame** | S | Chaos Monkey terminating production instances — `github.com/Netflix/chaosmonkey` |

### 3.1 Phase C sketch (not committed)

| Part | Modules (lessons) | Notes |
|---|---|---|
| 2 Async | `queues-and-background-jobs` (6) · `events-and-streaming` (6) | Kafka / outbox / DLQ as prose; the queue and worker nodes already exist in the engine |
| 4 Storage | `choosing-a-datastore` (7) · `how-databases-store-data` (6) | SQL vs NoSQL, KV / document / search / blob, OLTP vs OLAP, B-tree vs LSM, WAL, MVCC |
| 5 Internals | `replication-internals` (5) | algorithms, quorum, failover, lag, CDC |
| 6 Distributed | `consistency-and-consensus` (6) · `observability-and-slo` (5) | CAP/PACELC without the math, consistency spectrum, consensus as prose, SLO/error budget |
| 7 Services | `monolith-to-services` (5) · `patterns-that-pay-rent` (6) | boundaries, service discovery, saga, outbox, fan-out/fan-in, unique IDs |
| 8 Global | `multi-region-and-geo` (4) | |

**Explicitly excluded:** Big Data (MapReduce, Spark, Flink, windowing, watermarks, lambda/kappa), geospatial search, media systems, probabilistic data structures (HLL, Count-Min). Senior/staff topics; several need dedicated visualizers we do not have; plan 16 §10.5 already says a fake version teaches worse than prose.

---

## 4. Change list — file by file

### 4.1 Content (data only)

| File | Change | Risk |
|---|---|---|
| `config/system-design/types.ts` | Add `SdModule.kind: "sim" \| "prose"`; make `task?: SdTaskDef` (B3); make `SdChapter.lessonSlug` required on leaves; add `SdSourceRef { label, url }` and `SdLesson.sources?: SdSourceRef[]`; **delete `storyIllustration`** (unused, typed `any[]`, violates the no-`any` rule) | Medium — touches every module file, but mechanical |
| `config/system-design/modules/*.ts` (14) | Story → the **Netflix** case study (D1) and its §3 anchor; lessons split to the outline; depth bar; `sources`; chapter leaves bound | The bulk of the work |
| `config/system-design/modules/api-and-contracts.ts` | **New module** (6 lessons) | First prose module |
| `config/system-design/registry.ts` | Register the new module; update the header comment (it still says "empty until Task 13" and "14 modules") | Low |

### 4.2 UI

| File | Change | Why |
|---|---|---|
| `components/system-design/ModuleLayout.tsx` | Render the three-level chapter tree in the left rail (collapsible groups, active leaf, mobile drawer); Part · Module header; Build Task section conditional on `task`; "sources" block | The outline must be visible — the single highest-impact fix in this plan |
| `components/system-design/LessonFlow.tsx` | Prev/next derived from chapter leaves; sources block; reading time already computed at 200 wpm — keep it honest with the new bar | Navigation must agree with the tree |
| `components/system-design/Sidebar.tsx` | **Delete** | Dead code, wrong hrefs |
| `components/system-design/ModuleCard.tsx` | Show lesson count + `kind` affordance (Simulated / Reading) | Honest expectations on the index |
| `app/(routes)/system-design/page.tsx` | Group modules by Part instead of one flat four-column grid | With 15 modules the flat grid reads as a list |
| `app/(routes)/system-design/[module]/page.tsx` | Pass `kind`; omit `task` when absent; remove the `as any[]` cast used for stripping `steps` | Correctness |
| `app/(routes)/system-design/[module]/task/page.tsx` | `notFound()` when `!module.task`; `generateStaticParams` filters to `kind === "sim"` | A prose module must not expose a dead route |
| `app/sitemap.ts` | Emit `/task` only for modules that have one | It currently emits it unconditionally (`app/sitemap.ts:122`) — a guaranteed 404 in the sitemap |

### 4.3 Engine / API

| File | Change | Risk |
|---|---|---|
| `app/api/system-design/state/route.ts` | `lesson-complete` unchanged; `task-save` must reject modules with no task (it reads `taskModule.task.passCriteria` today) | Low |
| `lib/system-design/*` | **No change.** The engine is content-agnostic. If a slice needs an engine change, that is a signal the slice is wrong | — |

**One exception, recorded in §7.2 (B2):** `lib/system-design/nodes.ts` gained **type overloads** for
`defaultNode`. A preset written as `{ ...defaultNode("app_server", …), replicas: 2 }` is a union
spread, so `tsc` rejected a literal that was always valid. The overloads are annotation only — the
body, the defaults and the capacity model are untouched, and the engine does not read a type.
The rule survives: needing a *behavioural* engine change in a content slice is still a signal the
slice is wrong.

### 4.4 Gates — where this plan is won or lost

| File | Change |
|---|---|
| `scripts/check-system-design.ts` | Four new assertions: (1) chapter-leaf set === lesson set, both directions; (2) `order` is contiguous `1..N`; (3) `kind` matches task presence; (4) every `sources[].url` is https and non-empty. The existing graph / rubric / chain checks stay |
| `tests/system-design-content.test.ts` (new) | The same pure invariants as `node:test` — they need no build, so they run **before** `Build` in CI. The prerender assertions stay in the post-build script |
| `package.json` | No new scripts. `test` and `check:system-design` already exist |

**Gate discipline (project rule):** each new assertion is mutation-tested once — break the target, confirm red, restore. A gate that has never been observed failing is not a gate.

### 4.5 Docs (after the code, not with it)

- `.agent/feature-tracker.md` 6.1 and `.agent/plans/16-system-design-phase-6.md` §10.0/§10.1 — record D1 (app switch), D2 (leaf = lesson) and the new numbering; point at this file as the source of truth.

---

## 5. Sources — what each topic draws from

**Rule: link out, never paste.** Every module's `attribution` names its sources; each lesson may carry one to three `sources` links. `systemdesignschool.io` is **never** a content source — it was the checklist that exposed the gaps.

**The per-lesson assignment lives in `.agent/plans/17-system-design-resource-map.md`:** which of the 31 Bangla videos belongs to which lesson, and one verified free read per lesson (66 URLs HTTP-checked, four replaced because they failed the check). This table is the *policy*; that document is the *assignment*.

| Topic | Primary source (free unless noted) | Usage |
|---|---|---|
| Latency numbers, powers of two, availability math, LB/CDN/sharding basics | `github.com/donnemartin/system-design-primer` | Synthesise + attribute (read the licence before quoting) |
| Requirements, trade-off framing, interview structure | `hellointerview.com/learn/system-design/in-a-hurry` | Framing only |
| 30-concept scaffold, top trade-offs, roadmap | `algomaster.io` system-design path | Coverage cross-check |
| HTTP semantics, idempotent methods, status codes | RFC 9110 (+ RFC 9457 problem details) | Normative reference |
| Pagination, idempotency keys, error design | Stripe API docs; Google API design guide (AIP) | Real-world practice |
| HTTP / CDN caching semantics | MDN HTTP caching; Cloudflare Learning Center | Reference |
| Cache eviction, patterns, cache failure modes | Redis docs (eviction, client-side caching) | Reference |
| Stampede / thundering herd | Cloudflare and Meta engineering posts | Case study |
| Autoscaling, timeouts, retries, backoff + jitter, load shedding | **AWS Builders' Library** | Best free source in the set |
| Cascading failure, error budgets, SLO | Google SRE Book + Workbook (free HTML) | Reference |
| Circuit breaker, bulkhead, fallback | Netflix Hystrix wiki (archived); Azure Architecture Center | Reference |
| Postgres replication, WAL, MVCC | PostgreSQL docs | Reference |
| Sharding, hot keys, chunk migration | MongoDB sharding docs | Reference |
| Consistent hashing | Karger et al. paper + primer explainer | Concept |
| B-tree vs LSM, storage engines | *Designing Data-Intensive Applications* (book, **not** free) + Postgres/ClickHouse docs | Cite the book; never reproduce it |
| Indexing | `use-the-index-luke.com` | Reference |
| OLTP vs OLAP, analytics, materialised views | ClickHouse docs; Postgres materialised views | Reference |
| Queues, visibility timeout, DLQ | AWS SQS docs | Reference |
| Kafka log model, delivery semantics | Kafka docs (design section) | Reference |
| Saga, outbox, CQRS, API composition | `microservices.io` (Chris Richardson) + Azure patterns | Canonical free |
| Observability, USE/RED, tracing | Brendan Gregg's USE method; OpenTelemetry docs | Reference |
| Multi-region, anycast, geo-DNS | Cloudflare / AWS global infrastructure docs | Reference |
| Bangla video | `CodeInsightsByJack` channel + the 10 existing embeds | Optional per module |

**Licence pre-flight:** before Slice B1 ships, confirm the licence of `system-design-primer` and record it in `attribution`. Anything with unclear terms (Hello Interview, AlgoMaster, systemdesignschool) is consulted for *coverage only* — no sentences, no ordering, no titles.

---

## 6. Pre-implementation checklist (blocking)

Answer all of these **before** Slice B1 touches `types.ts`. Ordered by the cost of getting them wrong.

| # | Item | How to resolve | Why it blocks |
|---|---|---|---|
| **P1** | **Existing progress.** `lessons_completed` stores `"<module>/<lesson>"` keys (`LessonFlow.tsx:41`). Splitting a lesson orphans a completed key | Run `SELECT COUNT(*) FROM sd_user_state;`. If 0 → nothing to migrate. If > 0 → keep each old slug as the **anchor** lesson of its split and record the mapping | Silent progress loss for real users, and it cannot be undone after content ships |
| **P2** | **Build baseline.** Build time, prerendered route count, per-module client JS | Run `npm run build` and record: total time, `/system-design/*` route count (today 69), First Load JS for `/system-design/caching` | 41 → 78 lessons nearly doubles prerender work; the Vercel Hobby build-minute budget must be measured, not assumed |
| **P3** | **Client payload.** `ModuleLayout` and `LessonFlow` receive **all** lessons (prose included) as props, so a 10-lesson module ships ~10× the prose of a 4-lesson one | Use P2's First Load JS. If a module page exceeds ~150 kB, trim the nav props to `{ slug, title }[]` and keep only the current lesson's sections | A real, measurable regression risk of the split — decide before authoring, not after |
| **P4** | **Outlines for the four modules that have none** | Write the leaf titles first as a content spec (the table in §3 is the draft); review before prose | Without it, "one leaf = one lesson" is unimplementable for those modules |
| **P5** | **Chapter-tree UX.** Three levels on desktop, drawer on mobile | One wireframe: collapsible group → leaves, active state, progress ticks. Keep the existing 256 px rail | Reworking after 15 modules are authored is expensive |
| **P6** | **Prose-module UX.** What replaces the Build Task block | Decide: Interview Byte + "try it yourself" prompt + sources + next module. No fake task | Needed before D5 |
| **P7** | **Slug freeze.** Slugs are permanent because they are progress keys; a rename silently resets a learner | Rule in `types.ts` + an optional committed `slug-manifest.json` that the checker compares against | The only content bug that damages users retroactively |
| **P8** | **Video plan.** Which modules get a Bangla video | The 10 existing videos cover ~8 modules; new modules ship without a video rather than with a mismatched one | Prevents "every module needs a video" scope creep |
| **P9** | **Attribution text** | Standard footer: "Synthesised from …; sources linked per lesson. No source text reproduced." | Ships with B1, not later |
| **P10** | **`TaskWorkspace` module loading** | Confirm whether it imports the module client-side by slug or receives it as a prop | Decides whether `task?` needs a null guard in one place or four |

---

## 7. Slices and acceptance criteria

One slice = one review cycle. I read every lesson before the next slice starts. No commits by the agent.

| Slice | Deliverable | Acceptance |
|---|---|---|
| **B1** ✅ shipped 2026-10-27 (uncommitted) | `types.ts` model change + `ModuleLayout` tree + `Sidebar.tsx` deletion + new gates/tests + **module 1 rebuilt** (4 lessons, Netflix case study, 898/898/897/893 words, `sources` on each) | Verified: `npm test` 588/588, `tsc` clean, build 120/120, `check:system-design` all checks passed (19 warnings, all pre-existing class), module-1 page 58,299 bytes, 4 lesson pages render `Go deeper` + `4 min read`. Pending: your read + commit. |
| **B2** ✅ shipped 2026-10-28 (uncommitted) | Modules 2, 3, 4 — outlines written, lessons at the depth bar, each built on its §3 Netflix anchor | Verified: `npm test` 594/594, `tsc` clean, build 124/124, `check:system-design` all checks passed (14 warnings), 4/14 modules bound, 75 `/system-design` routes, module pages 58,368 / 57,786 / 58,147 bytes. Pending: your read + commit. |
| **B3** ✅ shipped 2026-10-28 (uncommitted) | Module 5 `api-and-contracts` (new, prose, 6 lessons) + `task?` optional + prose-module UX + sitemap/task-route/API guards + tests | Verified: `npm test` 598/598, `tsc` clean, build 131/131, `check:system-design` all checks passed (15 modules, 14 warnings). 5/15 modules bound. 82 routes under `/system-design`. Module page bytes TBD. Pending: your read + commit. |
| **B4** | Module 7 `caching` 4 → 10 lessons | Depth bar met; chapter ↔ lesson set equality; client payload compared against P2/P3 |
| **B5** | Modules 6, 8, 9 | Same |
| **B6** | Modules 10, 11 | Same |
| **B7** | Modules 12–15: story rename first, then the depth pass; renumber contiguously; update the tracker and plan 16 | The whole path reads with one app, one voice, no broken link |

**Why this order:** B1 proves the model on the smallest module. B2 fixes the first-run experience, because every learner passes through modules 1–4. B3 proves the prose module without touching the simulator. B4 is the flagship stress test. B5–B7 are repetition at increasing volume.

### 7.1 B1 — shipped 2026-10-27, measured

Recorded here because `tests/system-design-content.test.ts` cites this section as the place the
mutation tests are written down. A citation to a section that does not exist reads exactly like
a section that does.

| What was asserted | How it was mutated | What went red |
|---|---|---|
| Leaf ↔ lesson set equality | deleted one `lessonSlug` from a bound tree | `outline-half-converted`, 2 failures |
| No duplicate binding | pointed two leaves at `choices-not-boxes` | `outline-duplicate-binding` + `lesson-not-in-outline` |
| Depth bar 700–900 | replaced all four lesson bodies with one sentence | `lesson-depth: 231 words, outside 700–900` |

All three restored, suite back to 588 passing / 0 failing.

**Measured, not estimated:**

- **Word counts** — 898 / 898 / 897 / 893 for the four lessons (target 700–900). Gate-enforced,
  so these numbers cannot drift without CI failing. (First draft was 852/894/871/883 on the LynxDEV case study; the Netflix rewrite landed 898/898/897/893.)
- **Routes** — 119 static pages, 71 under `/system-design` (14 modules + 42 lessons + 14 tasks +
  index). Baseline before B1 was 70 routes / 41 lessons.
- **Build** — exit 0, `Finished TypeScript in 6.2s`, 5.1s static generation.
- **Payload** — module 1 page **65,625 → 58,299 bytes** despite carrying 4× the prose of the
  module it replaced (57,791 was the intermediate LynxDEV draft). Achieved by passing `ModuleOverview` (titles and counts only) instead of
  `SdModule`; the old shape shipped every lesson body *and* both task graphs to a component that
  reads neither. Caching and rate-limiting pages unchanged at 55,570 / 54,602, which is the
  control that says the trim did not come from somewhere else.
- **Gate output** — `OK 1/14 module(s) converted to the leaf model (what-is-system-design)` plus
  19 warnings naming the other 13. Warnings are deliberate: a gate that is red for planned work
  stops being information.

**Two deviations from §4.1, both intentional:**

1. `SdChapter.lessonSlug` stayed **optional**. Making it required fails `tsc` for the 13
   unconverted modules at once, which would mean deleting their authored outlines to satisfy a
   type. The gate enforces the same rule instead, and `types.ts` carries a TODO to close it at B7.
2. Both module-1 sources changed for better ones — *CAP twelve years later* and *Erlang (unit)*
   were replaced because neither goes deeper than the lesson that cited it. Details in the
   resource map, §2.

### 7.2 B2 — shipped 2026-10-28, measured

Modules 2–4 converted: 12 lessons, four per module, each bound to a leaf chapter and each anchored
to a Netflix primary source except where the map records a deliberate swap (§2, M2–M4).

**Measured, not estimated:**

- **Word counts** — M2 867 / 856 / 847 / 839 · M3 893 / 900 / 900 / 822 · M4 874 / 893 / 872 / 899.
  Two lessons sit *on* the 900 ceiling. That is allowed, and it is also the useful state: the next
  edit to either one fails the gate instead of quietly growing.
- **Binding** — the three modules move `no-outline` → `bound`. Gate summary: `4/14 module(s)
  converted to the leaf model`.
- **Tests** — 594 passing / 0 failing (588 after B1, plus two assertions × three modules).
- **Routes** — 124 static pages, **75 under `/system-design`** (71 after B1). The three modules went
  2→4, 3→4, 3→4 lessons: +4 routes, nothing removed.
- **Payload** — module pages **58,368 / 57,786 / 58,147 bytes**, i.e. flat against module 1's
  58,299 despite comparable prose. The `ModuleOverview` boundary from B1 is what keeps it flat;
  this slice added 12 lessons without moving it.
- **Build** — exit 0, 4.7s static generation, `tsc` clean.
- **Gate output** — `All checks passed for 14 module(s), 14 warning(s)`. B1 left 19 warnings;
  three modules leaving the `unbound` class accounts for the drop.

**Mutation-tested (the new assertions only):**

| Assertion | Mutation | What went red |
|---|---|---|
| rail order = lesson order | swapped two entries of the `requirements` `nav` table | `requirements: outline order and lesson order disagree` |
| no private-system pronoun | renamed a heading to "Our app requirements" | the `\bour app\b` regex — while the substring checks stayed green, which is why the pronoun is matched separately |

Both restored; suite back to 594 passing.

**Four deviations, each found by running something rather than by reading:**

1. **`defaultNode` gained type overloads** (`lib/system-design/nodes.ts`). A preset written as
   `{ ...defaultNode("app_server", …), replicas: 2 }` is a union spread, so `tsc` rejected it:
   `replicas` is not a field of `SdClientNode`, one arm of that union. The literal was always a
   valid `SdAppServerNode`; only the annotation said otherwise. Nine literal overloads plus the
   general `SdNodeType → SdNode` case — the general one has to be a real overload, because the
   implementation signature is invisible to callers and `tests/nodes.test.ts` iterates
   `NODE_TYPE_ORDER`. No runtime change.
2. **Module 4's start graph is module 3's solution, unchanged.** The first draft started from
   client → app → db, and the chain check flagged it as dropping the load balancer module 3 had
   just taught. Deleting that node unteaches the previous lesson, so the start now inherits it:
   6,000 r/s against two app replicas (utilisation 1.50) and one store. Re-measured: 33.3% errors,
   max 1.50 → solution 0% / 0.75.
3. **Module 2's start graph drops the database on purpose**, and the chain check warns about it on
   every run. That is the exercise — the canvas is the *membership* service, the second system from
   "Two systems, one company", so there is no store to inherit — and the brief says so in its first
   sentence. Written into the module header so the warning has an answer next to it.
4. **Video titles were fetched, not paraphrased.** YouTube's oEmbed endpoint returned all four on
   2026-10-28; three draft titles had drifted from the real ones and `5WVl9F_7f7k` was missing from
   its lesson altogether. Fixed rather than recorded, because a learner searching the title has to
   find the same string.

---

## 8. Verification per slice

1. `npm test` — pure content invariants (fast, DB-free, runs before Build).
2. `npm run build` — route table shows every module and lesson as `●`; new prose routes must not become `ƒ`.
3. `npm run check:system-design` — post-build, both directions.
4. **Mutation test** every new gate once (break → red → restore).
5. Manual: 375 px, dark mode, tree collapse/expand, prev/next across a lesson boundary, `/task` absent on a prose module.
6. Measure and record: words per lesson (gate), First Load JS per module page, total build time. D3 is only a decision if it is checkable.
7. I read the prose. No AI filler. No script replaces this gate.

---

## 9. Not doing, and why

| Not doing | Reason |
|---|---|
| Copying the reference 121-lesson outline verbatim | Their expression is not ours to take; and their Big Data block is the wrong audience |
| Their practice-problem set (YouTube, News Feed, Uber, Instagram, Typeahead, Rate Limiter) | D6. Our set, later: cricket-ticket booking (flash sale, hot key, double-booking), live-class platform (thundering herd), Bangla typeahead, campus marketplace, URL shortener, AI chat at scale |
| Docker codelabs | The canvas simulator is the better vehicle and costs no server. It is the one thing we cannot match and do not need |
| Big Data, geospatial, media systems, probabilistic data structures | Senior/staff scope; several need visualizers we do not have |
| A lesson count as a target | Vanity metric. The gate is "did it teach", not "how many" |
| Engine changes | If a slice needs one, the slice is wrong |
| New dependencies | None needed — static content only |

---

## 10. Open decisions

1. **P1** — run `SELECT COUNT(*) FROM sd_user_state;`. 0 or not decides reset vs anchor-slug, and it must be answered before content ships.
2. **P2/P3** — run `npm run build` once now to record the baseline (no file changes).
3. **P5/P6** — the chapter-tree and prose-module sketches: ASCII in this plan, or build B1's UI first so the shape is visible?
4. ~~**Naming in prose** — "LynxDEV" directly, or a neutral in-world name?~~ **Resolved 2026-10-27:** neither. The case study is a named public system (D1), so the question of what to call *ourselves* in a lesson no longer arises — the prose addresses the learner as "you" and the system as "Netflix".
5. **Indexing (resource map G1)** — the playlist has a database-index video and the free reading list has `use-the-index-luke`, but Phase B has no indexing lesson; "add an index" is the most common real fix at junior level. Pull `indexes-are-not-free` forward into module 8 or 9 (Phase B → 80 lessons), or leave indexing to Phase C? My preference: **pull it forward**.
