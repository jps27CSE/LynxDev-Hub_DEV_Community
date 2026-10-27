# System Design 2.0 — Depth, Breadth and Differentiation

> **Date:** 2026-10-27
> **Status:** Plan. Nothing here is implemented yet. One slice ships at a time, each ending in a manual review by me before the next one starts. No commits by the agent.
> **Scope:** the system-design learning path only — `config/system-design/**`, `app/(routes)/system-design/**`, `components/system-design/**`, `scripts/check-system-design.ts`, `tests/`. No DB schema change, no new dependency, no server cost.
> **Supersedes:** the content sections of `.agent/plans/16-system-design-phase-6.md` §10.0–§10.1 (roadmap and module table). §10.5 visualizers, §11 free-tier check and §12 task list there remain valid.
> **Companion:** `.agent/plans/17-system-design-resource-map.md` — the 31-video Bangla playlist mapped to modules, plus a verified free read for every lesson. Every link there was HTTP-checked on 2026-10-27.
> **Trigger:** the system-design path was reviewed against a full external curriculum (`systemdesignschool.io`, 121 lessons across 10 topic groups). Measured result: 41 lessons at 259 words average, 4 of 10 topic groups at 0% coverage, and 75 authored chapter entries that no page renders.

---

## 0. Decisions locked

| # | Decision | Why |
|---|---|---|
| **D1** | The running case study becomes **LynxDEV itself**, not the photo-sharing app | 109 `photo` refs, 13 `follower`, 68 `feed` across 14 modules currently make our project the closest match to the reference site's "Design Instagram" practice problem. Our own app is in no other course, and lessons become checkable against real code (`lib/content-cache.ts`, `lib/db-rate-limit.ts`, `next/image`, `config/db.tsx`). |
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

Every module: story rewritten onto **LynxDEV**, lessons split to match the chapter outline, D3 depth bar applied. `S` = simulator module (keeps its Build Task). `P` = prose module.

### Part 0 — Mindset (5 modules, 22 lessons)

| # | Module | Lessons (one leaf chapter each) | Kind |
|---|---|---|---|
| 1 | `what-is-system-design` | choices-not-boxes · performance-vs-scalability · latency-vs-throughput-vs-bandwidth · **scalability-patterns** *(new — promised today, absent)* | S |
| 2 | `requirements` | functional-vs-nonfunctional · eliciting-requirements · **turning-fast-into-a-number** · **what-youre-not-building** | S |
| 3 | `constraints-and-design-process` | the-45-min-structure · tradeoffs · anti-patterns · **saying-it-out-loud** | S |
| 4 | `back-of-the-envelope` | powers-of-two-and-latency-numbers · qps-storage-bandwidth · littles-law · **estimation-under-uncertainty** | S |
| 5 | **`api-and-contracts`** (new) | the-contract-before-the-code · pagination-that-doesnt-lie · who-are-you-vs-what-may-you-do · idempotent-writes · errors-and-status-codes · the-gateway-as-one-door | **P** |

### Part 1 — Scaling up (6 modules, 40 lessons)

| # | Module | Lessons | Kind |
|---|---|---|---|
| 6 | `load-balancers-and-stateless-services` | vertical-vs-horizontal · **autoscaling** · load-balancing · **sessions-without-sticky** · stateless-services | S |
| 7 | `caching` | **why-cache** · where-to-cache · **cache-aside** · **write-through-and-behind** · **refresh-ahead** · **cache-keys-and-cardinality** · ttl-and-eviction · invalidation · cache-stampede · **cold-start-and-failure-modes** | S |
| 8 | `read-replicas` | scaling-reads-vs-writes · replication-lag · promoting-a-replica · **read-your-own-writes** · **cqrs-and-read-models** · **when-replicas-dont-help** | S |
| 9 | `partitioning-and-sharding` | why-partition-data · hash-and-range-sharding · hot-keys-and-skew · rebalancing-shards · **consistent-hashing** · **cross-shard-queries** · **when-not-to-shard** | S |
| 10 | `rate-limiting` | the-bot-in-your-traffic · algorithms · **distributed-rate-limiting** · **quotas-and-tiers** · **load-shedding** · **429-and-retry-after** | S |
| 11 | `cdns-and-static-content` | latency-numbers · cache-keys-and-ttl · what-a-cdn-cannot-cache · **edge-compute** · **image-and-video-delivery** · **purging-and-versioning** | S |

### Part 3 — Reliability (4 modules, 17 lessons)

| # | Module | Lessons | Kind |
|---|---|---|---|
| 12 | `how-systems-fail` | trace-your-own-design · retry-storms · cascades · **blast-radius-and-bulkheads** · **logging-monitoring-and-traces** *(new — the observability gap)* | S |
| 13 | `timeouts-retries-circuit-breakers` | no-timeout-is-worse · retries-and-jitter · breakers-and-bulkheads · **timeout-budgets** · **fallbacks-and-degradation** | S |
| 14 | `idempotency` | at-least-once-delivery · idempotency-keys · **exactly-once-is-a-lie** · dead-letter-queues | S |
| 15 | `chaos-capstone` | chaos-as-practice · surviving-everything · **postmortems-without-blame** | S |

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
| `config/system-design/modules/*.ts` (14) | Story → LynxDEV; lessons split to the outline; depth bar; `sources`; chapter leaves bound | The bulk of the work |
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
| **B1** | `types.ts` model change + `ModuleLayout` tree + `Sidebar.tsx` deletion + new gates/tests + **module 1 rebuilt** (4 lessons, LynxDEV story, depth bar) | `npm test` green; `check:system-design` green post-build; the tree is visible on `/system-design/what-is-system-design`; `Scalability Patterns` exists; each new assertion mutation-tested; I read module 1 and approve the shape |
| **B2** | Modules 2, 3, 4 — outlines written, lessons at the depth bar, LynxDEV story | Same gates; four previously outline-less modules now have one; no `photo`/`follower` refs left in these files |
| **B3** | Module 5 `api-and-contracts` (new, prose) + `task?` optional + prose-module UX + sitemap/task-route guards | `/system-design/api-and-contracts` renders with no Build Task; `/task` 404s; sitemap has no dead `/task`; the state API rejects `task-save` for it |
| **B4** | Module 7 `caching` 4 → 10 lessons | Depth bar met; chapter ↔ lesson set equality; client payload compared against P2/P3 |
| **B5** | Modules 6, 8, 9 | Same |
| **B6** | Modules 10, 11 | Same |
| **B7** | Modules 12–15: story rename first, then the depth pass; renumber contiguously; update the tracker and plan 16 | The whole path reads with one app, one voice, no broken link |

**Why this order:** B1 proves the model on the smallest module. B2 fixes the first-run experience, because every learner passes through modules 1–4. B3 proves the prose module without touching the simulator. B4 is the flagship stress test. B5–B7 are repetition at increasing volume.

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
4. **Naming in prose** — "LynxDEV" directly, or a neutral in-world name ("our learning platform") that still reads correctly at 100k users? Preference: **LynxDEV directly**, because the learner is using it.
5. **Indexing (resource map G1)** — the playlist has a database-index video and the free reading list has `use-the-index-luke`, but Phase B has no indexing lesson; "add an index" is the most common real fix at junior level. Pull `indexes-are-not-free` forward into module 8 or 9 (Phase B → 80 lessons), or leave indexing to Phase C? My preference: **pull it forward**.
