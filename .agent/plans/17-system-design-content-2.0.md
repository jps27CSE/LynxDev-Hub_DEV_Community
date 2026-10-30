# System Design 2.0 — Depth, Breadth and Differentiation

> **Date:** 2026-10-27
> **Status:** In progress. Slices B1–B5 shipped (uncommitted) on 2026-10-27/28/29/30; B6–B7 pending. **9 of 15 modules converted** (`what-is-system-design`, `requirements`, `constraints-and-design-process`, `back-of-the-envelope`, `api-and-contracts`, `load-balancers-and-stateless-services`, `caching`, `read-replicas`, `partitioning-and-sharding`); the six remaining unconverted outlines are `rate-limiting`, `cdns-and-static-content`, `how-systems-fail`, `timeouts-retries-circuit-breakers`, `idempotency`, `chaos-capstone`. One slice ships at a time, each ending in a manual review by me before the next one starts. No commits by the agent.
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

**Baseline above was measured 2026-10-27, before B1. Current, after B5 part 2** (re-measured from the build output and the content gates, not estimated):

| Measurement | Value |
|---|---|
| Modules | **15** (`api-and-contracts` added in B3) |
| Lessons | **66** — 50 across the 9 converted modules, all at the 700–900 word bar, plus 16 still in the six unconverted outlines (phase target is 79) |
| Modules on the leaf model, all leaves bound | **9 / 15** |
| Static system-design pages | **95** (15 module + 66 lesson + 14 task) |
| `check:system-design` warnings | **10** = 6 unconverted outlines + 4 chain (each chain warning answered in its module header) |
| Tests | **618** passing, 0 failing (588 after B1) |

The 4 modules listed above as having **no** chapter outline all now have one; the defect was fixed in B1–B3, not by editing the row.

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
| **B (this plan)** | 0 Mindset, 1 Scaling, 3 Reliability | 15 | 79 | **9 converted as of 2026-10-30** (50 lessons at the depth bar); 6 outlines remain. The original plan said "11 rewritten, 4 story-renamed then deepened" — the conversion turned out to be a full rewrite in every case, so that split no longer describes the work |
| C (later) | 2 Async, 4 Storage, 5 Internals, 6 Distributed, 7 Patterns | 10 | ~57 | new |
| D (later) | 8 Global, 9 Practice problems | 1 + 7 problems | ~11 | new |

**Total if all phases ship: ~26 modules, ~146 lessons** — deliberately not a target. C is re-scoped after B is read end to end. If B feels complete on its own, C shrinks to storage + async + internals + patterns (~36 lessons).

**Numbering:** Phase B renumbers `order` contiguously 1–15, because the API module is inserted at position 5. Phase C will renumber once more. So that this cannot drift silently, `check:system-design` gains an assertion that `order` is exactly `1..N` with no gaps and no duplicates.

---

## 3. Phase B — module specification

Every module: story rewritten onto the **Netflix** case study (D1), lessons split to match the chapter outline, D3 depth bar applied. `S` = simulator module (keeps its Build Task). `P` = prose module.

**Rows 1–9 are now the *shipped* outlines, not the plan** — slugs re-read from `config/system-design/modules/*.ts` on 2026-10-30 and matched one-for-one against the bound leaves by `npm test`. Two rows changed from the original spec: module 6 swaps `load-balancing` and `autoscaling` (the balancer has to exist before taking more than one of it means anything), and module 8 puts `read-your-own-writes` before `promoting-a-replica`. Rows 10–15 are still the plan; they are the B6 and B7 deliverables.

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
| 6 | `load-balancers-and-stateless-services` | vertical-vs-horizontal · load-balancing · autoscaling · sessions-without-sticky · stateless-services | S | Eureka (discovery) + Zuul (edge routing) — `github.com/Netflix/eureka`, `github.com/Netflix/zuul` |
| 7 | `caching` | **why-cache** · where-to-cache · **cache-aside** · **write-through-and-behind** · **refresh-ahead** · **cache-keys-and-cardinality** · ttl-and-eviction · invalidation · cache-stampede · **cold-start-and-failure-modes** | S | EVCache, their memcached layer — `github.com/Netflix/EVCache` |
| 8 | `read-replicas` | scaling-reads-vs-writes · replication-lag · **read-your-own-writes** · promoting-a-replica · **cqrs-and-read-models** · **when-replicas-dont-help** | S | Same post: the data model was denormalised and moved to NoSQL rather than replicated as-is. *(Shipped order puts `read-your-own-writes` before `promoting-a-replica`: you have to know what a stale read costs you before deciding when to promote — §7.5)* |
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
| `config/system-design/types.ts` | Add `SdModule.kind: "sim" \| "prose"`; make `task?: SdTaskDef` (B3); add `SdSourceRef { label, url }` and `SdLesson.sources?: SdSourceRef[]`; **delete `storyIllustration`** (unused, typed `any[]`, violates the no-`any` rule); make `SdChapter.lessonSlug` required on leaves — **done in B1 except this last item, which is still optional**: making it required now would fail `tsc` on 13 modules at once, so it lands in B7 when the last outline converts (§7.2) | Medium — touches every module file, but mechanical |
| `config/system-design/modules/*.ts` (15) | Story → the **Netflix** case study (D1) and its §3 anchor; lessons split to the outline; depth bar; `sources`; chapter leaves bound. **9 of 15 converted as of 2026-10-30** | The bulk of the work |
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
| **B4** ✅ shipped 2026-10-29 (uncommitted) | Module 7 `caching` 4 → 10 lessons, on Netflix's **EVCache** tier; task re-measured after the old one was found to pass while shedding 96% of traffic | Verified: `npm test` 602/602, `tsc` clean, build 137/137, `check:system-design` all checks passed (6/15 converted, 13 warnings), caching page 72,989 bytes, 10 lesson pages 62–74 KB. Pending: your read + commit. |
| **B5** ✅ shipped 2026-10-29 / 10-30 (uncommitted), in two parts | **Part 1** — module 6 `load-balancers-and-stateless-services` 3 → 5 lessons, anchored on Zuul + Eureka; its task re-measured at 4,000 r/s after the old one was found to be *impossible* (20,000 r/s offered to a 20,000 r/s balancer, graded only on topological validity — measured 90% errors, green). **Part 2** — module 8 `read-replicas` 3 → 6 lessons and module 9 `partitioning-and-sharding` 4 → 7 lessons; both tasks rebuilt after measuring that the old ones passed while shedding 96% of their traffic | Verified: `npm test` **618/618** (606 after part 1), `tsc` clean, build **145** static pages, `check:system-design` all checks passed (**9/15 converted, 10 warnings**), 95 `/system-design` routes, module pages 64,470 (m6) / 66,185 (m8) / 70,768 (m9) bytes, all 13 new lessons inside 700–900 words, **12 new assertions mutation-tested red and restored**. Pending: your read + commit. |
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

### 7.3 B4 — shipped 2026-10-29, measured

Module 7 `caching`: 4 → 10 lessons, 3 → 4 chapter groups, every leaf bound, story moved onto
**EVCache** (Netflix's memcached tier) and its README, which defines the acronym the module is
built on: *Ephemeral* (TTL), *Volatile* (evictable), *Cache*.

**Measured, not estimated:**

- **Word counts** — 885 / 861 / 857 / 885 / 721 / 830 / 898 / 856 / 826 / 863 (bar 700–900).
  `ttl-and-eviction` sits two words under the ceiling; the next edit to it fails the gate.
- **Binding** — `6/15 module(s) converted`. Gate: `All checks passed for 15 module(s), 13 warning(s)`
  (B3 left 14; caching leaving the `unbound` class accounts for the drop).
- **Tests** — 602 passing / 0 failing (598 after B3, plus three assertions for module 7 and one
  new general invariant).
- **Routes** — 137 static pages, **87 under `/system-design`** (82 after B3; +6 lessons −1 retired…).
- **Payload** — module page **55,570 → 72,989 bytes** for 4 → 10 lessons, i.e. ~2.3 KB per added
  lesson, which is titles and chapter descriptions rather than prose (each lesson body is ~5 KB).
  The `ModuleOverview` boundary from B1 still holds; nothing here approaches the 150 kB line in P3.
  For scale: `api-and-contracts` (prose, 6 lessons) is 61,643 bytes, `read-replicas` (3 lessons,
  unconverted) 51,835.
- **Build** — exit 0, 137/137 static pages in 3.8 s, `tsc` clean.

**Mutation-tested (every new assertion):**

| Assertion | Mutation | What went red |
|---|---|---|
| offered load fits the balancer | caching startGraph `12,000` → `25,000` | `caching (start graph): 25000 r/s offered against 20000 r/s of balancer capacity` |
| the task measures shedding | `zero-errors` `required: true` → `false` | `caching: no required error-rate criterion` |
| leaf ↔ lesson equality | deleted the `refresh-ahead` `lessonSlug` | `outline-half-converted`, 2 failures |
| depth bar | truncated one concept body | `caching/refresh-ahead: 610 words, outside 700–900` |

All restored; suite back to 602 passing.

**The old task was broken, and passing.** The module ran at 50,000 r/s against three app instances
behind one load balancer whose capacity in `NODE_TYPES` is 20,000. Measured: **start graph 96%
errors, "solution" 96% errors**, and every pass criterion green — `p95` is computed over the
requests that *completed*, and only 4% did. A learner could finish the module without ever fixing
the tier. Re-measured at 12,000 r/s with eight app instances (75% utilisation, so the tier is not
the lesson): **no cache → store 240%, 58.3% errors, p95 9.4 ms; cache at 0.9 → store 24%, 0%
errors, p95 3.4 ms**. The task now carries a required `zero-errors` criterion, and a new general
test asserts that **no converted module may offer more traffic than its own balancer can route**.

**Three defects found outside this slice's content, recorded rather than fixed:**

1. **Modules 6 and 8 have the same broken shape.** Measured: `load-balancers-and-stateless-services`
   solution **90% errors** at 20,000 r/s, `read-replicas` solution **96%** at 50,000. Both are at or
   above a single balancer's 20,000 ceiling. The new invariant is deliberately scoped to converted
   modules, so it does not go red for planned work — but **B5 cannot convert module 6 or 8 without
   fixing their numbers**, which is the intended forcing function.
2. **`ttlMs` and `stampedeGuard` are inert.** The engine never reads either (`lib/system-design/engine.ts`
   models only `hitRate` and `cacheColdStart`), yet the Inspector exposes both and the old lesson
   claimed toggling `stampedeGuard` would drop DB utilisation. The claim was removed from the lesson
   rather than kept, and no prose in B4 attributes a simulator result to either knob.
3. **`cacheColdStart` never warms.** `runRequest` tests `toStats.processed === 0`, and `processed`
   counts **hits** — which cannot happen while `hitRate` is forced to 0. Measured: cold start =
   permanently cold (58.3% errors at `hitRate: 0.9`). Not used by this module's task; the
   cold-start lesson describes real behaviour and points at deleting the cache node instead.

All three want a **small engine slice** (`hitRate` and cold start are the module's core interaction)
before B5 turns two more modules into content that references them. That is a behavioural engine
change and is therefore explicitly *not* done here.

**Other deviations, each measured:**

1. **`the-five-strategies` and `ttl-eviction-invalidation` were retired as slugs** rather than kept
   as anchors (P1 says keep old slugs as split anchors). P1 was answered on 2026-10-29:
   `SELECT COUNT(*) FROM sd_user_state` → **1 row, one completed key**,
   `what-is-system-design/choices-not-boxes` — not in this module. This was the last moment the
   rename was free, so the target slugs from §3 were used exactly.
2. **`OKs2670F3V0` was not attached to `refresh-ahead`.** The resource map assigns it there, but
   YouTube's oEmbed endpoint returns the title *“How YouTube's Timeline Preview Actually Works |
   Backend System Design (Bangla)”*, which does not evidence refresh-ahead. P8 says a module ships
   without a video rather than with a mismatched one, so the lesson has none. **The resource map
   needs correcting**, not the lesson.
3. **P1 is closed** (see above) and **open decision §10.5 (indexing)** is still unanswered; it
   changes module 8 or 9, which is B5.

### 7.4 B5, part 1 — module 6, shipped 2026-10-29 (uncommitted)

Module 6 `load-balancers-and-stateless-services`: **3 → 5 lessons**, 3 chapter groups, every leaf
bound, anchored on the two halves of Netflix's answer to "how does a request find a server":

- **Zuul**, in the path — its README calls it *"an L7 application gateway that provides capabilities
  for dynamic routing, monitoring, resiliency, security"*;
- **Eureka**, out of it — *"a RESTful service … for the purpose of discovery, load balancing and
  failover of middle-tier servers"*.

| Group | Lesson | Words |
|---|---|---|
| The wall | `vertical-vs-horizontal` | 860 |
| Getting traffic to instances | `load-balancing` | 876 |
| | `autoscaling` *(new)* | 856 |
| Replaceable instances | `sessions-without-sticky` *(new)* | 884 |
| | `stateless-services` | 893 |

Two https sources per lesson; three embedded videos (`WxNLwivRCR0` reverse proxy ≠ LB,
`UQ67LJJkhg8` cloud computing, `tOm35rmGrfg` "log out of all devices").

**Measured, not estimated:**

- **Binding** — `7/15 module(s) converted`. Gate: `All checks passed for 15 module(s), 12 warning(s)`
  (B4 left 13; module 6 leaving the `unbound` class accounts for the drop).
- **Tests** — **606 passing / 0 failing** (602 after B4, plus four assertions for module 6). One of
  them is the first assertion in this file that **runs the engine** rather than reading config:
  the start graph must fail every criterion and the solution must pass all of them.
- **Routes** — 139 static pages, **89 under `/system-design`** (87 after B4; +2 lessons).
- **Payload** — module page **64,470 bytes** for 5 lessons. For scale: `caching` (10 lessons)
  72,989, `read-replicas` (3, unconverted) 51,835, `partitioning-and-sharding` 52,826. The
  `ModuleOverview` boundary from B1 still holds; ~2 KB per added lesson is titles, not prose.
- **Build** — exit 0, 139/139 static pages in 14.2 s, `tsc` clean, `check:migrations` clean.
- **Chain** — `caching` starts from module 6's finished design, which is what makes the store's 80%
  in module 6 a hand-off rather than an unfinished answer.

**Mutation-tested (every new assertion, observed red then restored):**

| Assertion | Mutation | What went red |
|---|---|---|
| start fails / solution passes, on the engine | `arrivalRate` `4_000` → `15_000` | `module 6: solution fails "zero-errors"` — at 15,000 r/s the store (5,000 r/s) is the bottleneck, so no finish exists |
| | `replicas` 4 → 2 | same criterion: 4,000 of capacity for 4,000 of load is 100% utilisation, and the engine sheds at `≥ 1` (0.0025% of requests, which is non-zero) |
| grades shedding, not validity | deleted the `zero-errors` criterion | `module 6: too few criteria to grade a task` |
| leaf ↔ lesson equality | deleted the `autoscaling` `lessonSlug` | `outline-half-converted`, 2 failures |
| rail order = lesson order | swapped two chapters of one group | `outline order and lesson order disagree` |
| case-study anchor | renamed Zuul/Eureka | `module 6: no Zuul reference` |
| depth bar | emptied one lesson's six bodies | `load-balancers-and-stateless-services/load-balancing: 125 words, outside 700–900` |

**The old task was impossible, and passing.** It offered **20,000 r/s to a single load balancer whose
capacity in `NODE_TYPES` is exactly 20,000**, so every request that mattered was shed at the door
before reaching the tier the module is about — and its only criterion was
`assert: (r) => r.valid`, which is *topological* validity (a client node and a terminal datastore
exist). Measured on the old "solution": **90% errors, 2,000 of 20,000 served, criterion green.**

Re-measured at **4,000 r/s, 5% writes**:

| | errors | app | store | LB | p95 |
|---|---|---|---|---|---|
| start (monolith) | **50.0%** | 200% | 40% | — | 13.2 ms |
| solution (LB + 4 replicas) | **0%** | 50% | 80% | 20% | 4.0 ms |
| 3 replicas | 0% | 67% | 80% | 20% | 4.2 ms |
| 2 replicas | 0.0025% | 100% | 80% | 20% | 10.1 ms |

So the gate is reached by three instances and the reference design uses four; the reveal says
exactly that rather than pretending three fails. Store at 80% is deliberate — see below.

**Two model defects this slice had to work around, recorded not fixed:**

1. **The engine cannot spread load across parallel app nodes.** Path selection is per *terminal
   datastore* (`pathsToTerminals`), so `app-1..app-3` sharing one database gives **app-1 200%,
   app-2 and app-3 0%** (measured on the old three-node solution). The only way to model N instances
   is `replicas` on one node, which is also the honest abstraction — behind a balancer, eight
   identical processes *are* one service. Both the module header and lesson 1 state it, because a
   learner who drags four app nodes onto the canvas would otherwise conclude the simulator is broken.
2. **`algorithm` (`rr` / `least_conn`) is inert** — present in `validation.ts`'s zod enum, never read
   by the engine. Same class as `ttlMs` / `stampedeGuard` (§7.3). The prose teaches the algorithms
   from AWS's documentation and never attributes a canvas result to the setting.

The second is why this slice contains **no engine change**: `hitRate`, `cacheColdStart`, `ttlMs`,
`stampedeGuard` and `algorithm` are one behavioural slice, and it blocks module 6's and 7's core
interactions equally. It is queued, not forgotten.

**One deviation from the resource map:** `nFbOxUJJeFo` (vertical vs horizontal) is **not** repeated in
module 6. Module 1 already embeds it in `scalability-patterns`, and the same video appearing twice in
one path is a worse outcome than a lesson with none. The map's M6 row needs that correction.

**Decisions taken while writing it (answering §10):**

- **§10.5 indexing → Phase C, not B5.** Module 8 (6 lessons) and 9 (7 lessons) are already at their
  planned length, and "why an index is not free" does not teach without B-tree/LSM page layout, which
  is Phase C's `how-databases-store-data`. Grafting it onto a replica module would produce a lesson
  that asserts rather than explains.
- **Module 6 goes first in B5, at 4,000 r/s.** Module 7 inherited this module's shape in B4 (12,000
  r/s, store at 240%, then 24% with a cache), so module 6's numbers decide module 7's premise; and a
  finished module 6 that leaves the store at 80% is what makes module 7's opening problem real
  instead of staged.

**Still open in B5:** modules 8 (`read-replicas`) and 9 (`partitioning-and-sharding`). Module 8 still
carries the 50,000 r/s task measured at 96% errors in §7.3, and the general balancer invariant skips
it only because it is not converted yet — converting it is the forcing function.

---

### 7.5 B5, part 2 — modules 8 and 9, shipped 2026-10-30 (uncommitted)

Two modules, both `kind: "sim"`, both anchored on the same published post as modules 1 and 8's
predecessors — but on **different sentences** of it, because the two modules answer different
questions and one quote for both would have flattened the distinction:

| | Module 8 `read-replicas` | Module 9 `partitioning-and-sharding` |
|---|---|---|
| Lessons | 3 → **6** | 4 → **7** |
| Chapter groups | 3 | 5 |
| Anchor sentence | *"denormalized … our data model, using NoSQL databases"* | *"move away from vertically scaled single points of failure"* / *"could not have racked the servers fast enough"* |
| Question | can a copy fix this? | can a bigger machine hold this? |

**Module 8 — lessons and depth**

| Group | Lesson | Words |
|---|---|---|
| The asymmetry | `scaling-reads-vs-writes` | 900 |
| What lag does | `replication-lag` | 822 |
| | `read-your-own-writes` | 891 |
| Failover, and the bill | `promoting-a-replica` | 897 |
| | `cqrs-and-read-models` | 890 |
| | `when-replicas-dont-help` | 857 |

**Lesson order deviates from plan §3.** §3 lists `promoting-a-replica` before `read-your-own-writes`.
The swap is deliberate: lag (§lag) → the three session guarantees → promotion. Promotion's data-loss
number *is* the lag at the instant of failure, so putting failover between the two makes the reader
hold a number for a page before it is used. Recorded here rather than silently reordered.

**Module 8's old task was broken and passing.** It offered **50,000 r/s** to a 20,000 r/s balancer and
a **single** 2,000 r/s app replica. Measured on both shipped graphs: **96% of traffic shed, balancer at
250%, app tier at 1,000%** — and every criterion green, because the only two were `p95 < 200 ms` and a
store bound, and **p95 is computed over the requests that completed**. Eight thousand requests a second
died at the door and the gate reported success.

Rebuilt so the cache cannot be the cheat: **two stores**, the title store behind EVCache (0.9 hit
rate, at 12%) and a member store the cache cannot help. Re-measured at **12,000 r/s, 95% reads, 8 app
instances (75%)**:

| | errors | member store | title store | p95 |
|---|---|---|---|---|
| start (0 replicas) | **8.5%** | **120%** | 12% | 6.6 ms |
| 1 replica | 0% | 60% | 12% | 3.5 ms |
| **solution (2 replicas)** | **0%** | **40%** | 12% | 3.4 ms |
| 2 replicas on the *title* store | **8.5%** | 120% | 4% | 6.6 ms |

The last row is the control and it is measured, not asserted: a replica on the tier the failing
traffic never reaches changes nothing. `fast-reads` was tightened from **p95 < 10 ms to < 5 ms** for a
reason worth recording — at 10 ms it *passed on the broken start* (6.6 ms over the 91% that finished),
which would have let the module ship the exact defect it documents. Criteria now: `zero-errors`,
`member-headroom` (< 50%), `fast-reads` (p95 < 5 ms); all three fail at the start.

**Module 9 — lessons and depth**

| Group | Lesson | Words |
|---|---|---|
| Why split at all | `why-partition-data` | 899 |
| Choosing the key | `hash-and-range-sharding` | 703 |
| What skew does | `hot-keys-and-skew` | 759 |
| Moving data | `rebalancing-shards` | 796 |
| | `consistent-hashing` | 889 |
| The bill | `cross-shard-queries` | 766 |
| | `when-not-to-shard` | 812 |

**Module 9's numbers are the slice's finding.** Measured at 16,000 r/s (10 app instances, 80%;
balancer 80%; member store at 2 replicas, inherited from module 8's solution):

| partitions | hot key | member store | errors |
|---|---|---|---|
| 1 | 0.8 | **107%** | 6.3% (start) |
| 16 | 0.8 | **83%** | 0% |
| 16 | 0.2 | **26%** (solution) | 0% |
| 1,000 | 0.8 | 81.1% | 0% |
| 1,000 | 0.2 | 20.4% | 0% |
| 8 / 4 / 2 | 0.2 | 31% / 42% / 63% | 0% |

So partitioning alone bought **1.29×**, not 16×, and four orders of magnitude of partitions bought
1.32×. The busiest partition's share is `readShare × (h + (1−h)/P) + writeShare/P`, whose `h` term
never shrinks — the hot key is a **floor**, and the lesson states that floor as the module's central
number instead of implying that partition count is the lever.

**A limitation of the model, disclosed rather than hidden.** Ten read replicas and **no** partitions
reach **29%** and satisfy every required criterion. `assert` receives a `SimulationResult` and never the
graph, so no capacity threshold can distinguish a shard from a copy — the engine has no dimension for
bytes, write amplification or per-shard cost, which is precisely what sharding is for. Three responses,
all shipped:

1. The task's **steps** grade the decision (`partitions >= 16`, `hotKeyShare <= 0.2`); the criteria
   grade only capacity.
2. Lesson 7 (`when-not-to-shard`) states the shortcut in the module's own voice — the learner is told
   the number the gate cannot see.
3. `tests/system-design-content.test.ts` **asserts that the shortcut still works** — a tripwire, so
   that adding a storage dimension to the engine fails that test and forces the lesson and the test to
   be rewritten together.

The third criterion is therefore **advisory** (`fast-queries`, p95 < 15 ms) — it passes on the broken
start because it measures the 93.7% that completed, and its `explain` says so. This is the first
advisory criterion in Phase B; module 6's suite asserts *every* criterion is required, so module 9's
suite asserts the single exception and its reason instead.

**Chain warning, answered in the module header.** Module 9's start graph drops the `cache` node that
module 8's solution had, because the canvas is the member store — the tier no shared cache can help —
and drawing EVCache would point the learner at the wrong box. `check:system-design` warns by design; the
module header carries the answer, and a test asserts the cache stays dropped.

**File paths and the two compressed-slice decisions.** No new dependencies, no engine change:

- `config/system-design/modules/read-replicas.ts` — rewritten (6 lessons, 3 groups, new task + criteria)
- `config/system-design/modules/partitioning-and-sharding.ts` — rewritten (7 lessons, 5 groups, new task)
- `tests/system-design-content.test.ts` — fixture `read-replicas` → `rate-limiting` for the
  `unbound` case (B4's lesson, applied again), plus **12 assertions** for modules 8 and 9

**Measured, not estimated:**

- **Binding** — `9/15 module(s) converted`. Gate: `All checks passed for 15 module(s), 10 warning(s)`.
  Composition: **6 unconverted outlines** (was 8) + **4 chain**; module 8 no longer warns because its
  start graph keeps the cache, module 9 now does and answers it in its header. Net 12 → 10 — the two
  modules leaving the `unbound` class and one chain warning arriving from the *other* direction cancel
  out to a smaller number than the conversion alone would suggest, which is why the count alone is not
  a progress metric.
- **Tests** — **618 passing / 0 failing** (606 after B5 part 1). All **12** new assertions were
  mutation-tested and observed red, one at a time, then restored byte-identically (`diff -q` against a
  backup):

| Mutation | Observed red |
|---|---|
| m8 solution `memberGraph(2)` → `memberGraph(1)` | `module 8: solution fails "member-headroom"` |
| m8 cache `hitRate 0.9` → `0.0` (title store becomes the bottleneck) | `fails the store a cache cannot help…` + the all-fail assertion |
| m8 `member-headroom` criterion renamed | `grades shedding and headroom…` |
| m8 "follower" inserted into a lesson body | `is anchored on Netflix's denormalisation…` |
| m8 every "Netflix" in lessons/story replaced | same assertion (the anchor check fires) |
| m8 two chapter bindings swapped | `outline order and lesson order disagree` |
| m9 two chapter bindings swapped | same, module 9 |
| m9 `startGraph` → `memberGraph(16, 0.2)` | `fails every required criterion at the start…` |
| m9 start hot key 0.8 → 0.5 | `makes the hot key, not the partition count, the reason…` |
| m9 headroom `< 0.4` → `< 0.25` | `pins the limitation: replicas pass the gate…` (the tripwire works) |
| m9 `fast-queries` `required: false` → `true` | `keeps exactly one advisory criterion…` |
| m9 cache node added back to `memberGraph` | `drops the cache node deliberately…` |
| m9 "photo" inserted into a lesson body | `is anchored on Netflix's vertical ceiling…` |

- **Routes** — **95** prerendered pages under `/system-design` (89 after B5 part 1; +6, because the two
  modules went 3 → 6 and 4 → 7 lessons). Measured from `.next/server/app/system-design`: **15 module
  pages + 66 lesson pages + 14 task pages**.
- **Payload** — module pages **66,185 bytes** (`read-replicas`, 6 lessons) and **70,768 bytes**
  (`partitioning-and-sharding`, 7 lessons); for scale, `caching` with 10 lessons was 72,989. Representative
  lesson pages: 70,513 (`scaling-reads-vs-writes`), 64,859 (`hot-keys-and-skew`).
- **Build** — `Compiled successfully`, 145 static pages generated, `tsc --noEmit` clean.
- **Sources** — every URL `curl`-verified 200 before use. **`toptal.com/big-data/consistent-hashing`
  returns 403 to non-browser clients** and was dropped from the map's `consistent-hashing` row; the
  lesson cites Wikipedia's consistent-hashing article and the primer instead.

**Two deviations from the resource map:** the dropped Toptal link above, and `Q4BUDplOWRE` being
embedded in **both** module 8's first lesson and module 9's first lesson. The map planned that
duplication (it is the playlist's only sharding-adjacent video), but two consecutive modules opening
with the same 20-minute overview is a worse outcome than one lesson with none — the module 9 caption
says it is the same video and names what to watch for this time. The map row needs that note.

**Proofreading pass, after all twelve mutations were restored.** Five sentences were re-read against the
engine's actual arithmetic rather than against how they sounded, and three were wrong enough to change
the meaning:

- `read-replicas` lesson 1 claimed *"the other half goes to the title store"*. Only **600** of the
  remaining 6,000 requests reach it — EVCache answers nine in ten. Reworded to say so; a reader who
  trusted the old sentence would have expected the title store to be at 120% too, and the lesson's whole
  point (the cache is a tier, the member store is not cacheable) depended on the wrong number. Lesson
  sat at 895 words against the 900 cap, so the replacement had to be word-neutral enough: it lands at
  **900**, exactly on the bar, which is worth knowing before anything else is added to it.
- Two `partitioning-and-sharding` fixes: `Nine nodes Each owning a ninth` → `, each owning` (just a
  typo), and the `your_turn` on lesson 5 asked *"what fraction of the ring's keys a single node failure
  takes offline"* — **with three replicas per key, the answer is zero**, so the question taught the
  wrong instinct about what replication buys. Now asks how many keys need re-reading from a second
  position, which is the quantity that actually changes.
- Words re-measured after the edits: 900 / 822 / 891 / 897 / 890 / 857 (m8) and
  899 / 703 / 759 / 796 / 889 / 766 / 812 (m9) — all inside 700–900, `npm test` **618 passing**, build
  145 pages, `check:system-design` unchanged at 10 warnings.

**Next:** B5 is complete. B6 is modules 10 (`rate-limiting`) and 11 (`cdns-and-static-content`), and
module 11's chain warning ("drops `database`") already exists and will need the same header treatment
module 9 just got.

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

1. ~~**P1** — run `SELECT COUNT(*) FROM sd_user_state;`.~~ **Answered 2026-10-29:** 1 row, with a
   single completed key, `what-is-system-design/choices-not-boxes` — not in module 7. The two
   retired caching slugs were therefore free to rename (§7.3), and this was the last moment that
   was true. The rule still stands for every future split: a lesson with live progress keys may not
   be renamed, only split around an anchor.
2. **P2/P3** — run `npm run build` once now to record the baseline (no file changes).
3. **P5/P6** — the chapter-tree and prose-module sketches: ASCII in this plan, or build B1's UI first so the shape is visible?
4. ~~**Naming in prose** — "LynxDEV" directly, or a neutral in-world name?~~ **Resolved 2026-10-27:** neither. The case study is a named public system (D1), so the question of what to call *ourselves* in a lesson no longer arises — the prose addresses the learner as "you" and the system as "Netflix".
5. **Indexing (resource map G1)** — the playlist has a database-index video and the free reading list has `use-the-index-luke`, but Phase B has no indexing lesson; "add an index" is the most common real fix at junior level. Pull `indexes-are-not-free` forward into module 8 or 9 (Phase B → 80 lessons), or leave indexing to Phase C? **Answered 2026-10-29: Phase C.** Module 8 (6 lessons) and 9 (7 lessons) are already at their planned length, and "an index is not free" does not teach without B-tree/LSM page layout — which is exactly Phase C's `how-databases-store-data` (6 lessons). A lesson grafted onto a replica module would assert instead of explain, which is the failure mode §1 diagnoses. The video stays available in the playlist meanwhile.
