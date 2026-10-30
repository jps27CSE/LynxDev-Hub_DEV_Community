# System Design — Video & Free-Reading Map

> **Date:** 2026-10-27
> **Companion to:** `.agent/plans/17-system-design-content-2.0.md`
> **Playlist:** [System Design in Bangla](https://www.youtube.com/playlist?list=PLiGGopVZ-5D0lSZmDPBSlg9bT4kncg9aX) — 31 videos, read with `yt-dlp --flat-playlist`
> **Every external link below was HTTP-checked on 2026-10-27** (status cargo in §5). No invented URLs.
> **Status:** plan only. Nothing here is wired into the content files yet.

**Correction, 2026-10-30 — the line above is no longer true.** Modules **1–9** have shipped and their rows now describe what is actually in `config/system-design/modules/*.ts`, not what was planned: 50 lessons, every one carrying its `sources` and its video block as listed. The rows for modules **10–15** are still the plan (B6 and B7). Two of the planned rows were wrong and are corrected in place — module 8's lesson order (§M8) and module 9's dropped `toptal.com` link (§M9). The link sweep in §5 was re-run on 2026-10-30, which is how the Toptal 403 was found.

---

## 0. Rules for this map

1. **`video` section** — max **one** per lesson. The field already exists (`SdLessonSection` `{ kind: "video"; videoId; title; caption? }`). Video is Bangla, prose is English; the video is a supplement, never the explanation. A lesson must read correctly with the video removed.
2. **`sources` (Go deeper)** — 1–3 per lesson, rendered as a **"Go deeper (free reads)"** block under the recap. New field `SdLesson.sources: { label, url }[]` (plan 17 §4.1).
3. **Link out, never paste.** No sentences, no code, no diagrams from these sources.
4. **Every link is checkable.** `tests/system-design-content.test.ts` asserts `https`, non-empty label. A quarterly manual sweep (§5 procedure) replaces dead links — a dead "go deeper" link is worse than none.
5. **Videos with no Phase B home stay in §3** until the module that owns them exists. They are not forced into an unrelated lesson.
6. **Anti-pattern being replaced:** module 1 today carries ad-hoc link lists *inside* `concept` bodies (`what-is-system-design.ts:200`, `:258`) — dev.to / Medium links, unverified, unrenderable as a distinct block, and invisible to any gate. That is the thing `sources` formalises.

---

## 1. Playlist inventory — all 31 videos

Status: ✅ already embedded · 🆕 to embed in Phase B · 🔜 belongs to a Phase C/D module · ⏸ placed by the map, then dropped by the one-video-per-lesson rule.

| # | Clean label | ID | Target | Status |
|---|---|---|---|---|
| 1 | Client–server model, database, scaling | `DzAt0wd3oWM` | M1 `choices-not-boxes` | ✅ |
| 2 | Vertical vs horizontal scaling, LB, DNS | `nFbOxUJJeFo` | M1 `scalability-patterns` + M6 `vertical-vs-horizontal` | ✅ |
| 3 | Monolithic architecture | `KLlyEgB-Now` | Phase C `monolith-to-services` | 🔜 |
| 4 | Microservices + project demo | `Y227d9kvzZ4` | Phase C `monolith-to-services` | 🔜 |
| 5 | LB + sharding + replication + caching | `Q4BUDplOWRE` | M9 `why-partition-data` (overview) + M8 `scaling-reads-vs-writes` | ✅ (2 embeds — the only sharding-adjacent video; each caption says so) |
| 6 | CDN + message queue + API gateway | `vz6ShBpxt2U` | M11 `latency-numbers` + M5 `the-gateway-as-one-door` | ✅ |
| 7 | Scalability, availability, consistency, fault tolerance | `Pfr_6h3Rqew` | M12 `trace-your-own-design` | ✅ (3 embeds) |
| 8 | How browsers find websites (IP + DNS) | `J_I2E1BmCZg` | **no Phase B home** — see §3 | ⏸ |
| 9 | HTTP, TCP, UDP, WebSocket | `SAeOWMysy1U` | M5 `the-contract-before-the-code` | ✅ |
| 10 | Forward proxy vs reverse proxy | `WxNLwivRCR0` | M6 `load-balancing` (the trap: proxy ≠ LB) | 🆕 |
| 11 | API + REST + GraphQL + gRPC | `YNvtSkHb3co` | M5 `the-contract-before-the-code` | 🆕 |
| 12 | SQL vs NoSQL | `abtGU_U652k` | Phase C `choosing-a-datastore` | 🔜 |
| 13 | Caching strategies (read & write) | `mzZ62duH20o` | M7 `cache-aside` | ✅ |
| 14 | Cloud computing | `UQ67LJJkhg8` | M6 `autoscaling` (optional, weak fit) | 🆕 |
| 15 | Logging & monitoring | `8itMutVwl_c` | M12 `logging-monitoring-and-traces` (**new lesson**) | 🆕 |
| 16 | Database indexes (B-tree, hash) | `APyvatiS3LY` | Phase C `how-databases-store-data` — see gap G1 | 🔜 |
| 17 | Throughput and latency | `7qWsnq2ecNE` | M1 `latency-vs-throughput-vs-bandwidth` | 🆕 |
| 18 | Capacity estimation | `WLYgEASg3Io` | M4 `qps-storage-bandwidth` | 🆕 |
| 19 | YouTube-like: functional & non-functional requirements | `5WVl9F_7f7k` | M2 `functional-vs-nonfunctional` | 🆕 |
| 20 | YouTube-like: capacity estimation | `lf3J10_Lnfc` | M4 `estimation-under-uncertainty` | 🆕 |
| 21 | Video upload & streaming API design | `_c_wDV_3ktI` | M5 `the-contract-before-the-code` (worked example) | 🆕 |
| 22 | High-level architecture of a video platform | `EDOK1DWYy4I` | M3 `saying-it-out-loud` (narrated walkthrough) | 🆕 |
| 23 | Choosing the right database | `__51PvJA1Y4` | Phase C `choosing-a-datastore` | 🔜 |
| 24 | Database relationships | `aEvHuCyHhv8` | Phase C `choosing-a-datastore` | 🔜 |
| 25 | Database design step-by-step | `GqX0lhBNHkU` | Phase C `choosing-a-datastore` | 🔜 |
| 26 | "Logout from all devices" | `tOm35rmGrfg` | M6 `sessions-without-sticky` | 🆕 |
| 27 | Forgot password flow | `GOgp2lzTo0s` | M5 `who-are-you-vs-what-may-you-do` | 🆕 |
| 28 | Real-time chat apps | `es_wPdEYgVA` | Phase C `events-and-streaming` | 🔜 |
| 29 | Google OAuth 2.0 | `sP5pzApI72E` | M5 `who-are-you-vs-what-may-you-do` | 🆕 |
| 30 | YouTube timeline preview | `OKs2670F3V0` | M7 `refresh-ahead` (precompute + edge) | 🆕 |
| 31 | 5 ms on localhost, 5 s in production | `osfhB8rd55A` | M12 `cascades` | 🆕 |

**Today:** 10 embeds, 7 unique IDs, spread over 8 modules. **After Phase B:** 18 videos placed, 13 unplaced — 8 Phase C, 1 with no home at all (video 8), 4 already-embedded duplicates (2, 6, 7, 13).

---

## 2. Phase B — lesson by lesson

Legend: **Go deeper** = the free read that actually goes deeper than the lesson, not a generic homepage.

### M1 · what-is-system-design (4 lessons)

Videos: `DzAt0wd3oWM` ✅ · `7qWsnq2ecNE` 🆕 · `nFbOxUJJeFo` ✅ (shared with M6)

| Lesson | Video | Go deeper (free) |
|---|---|---|
| `choices-not-boxes` | `DzAt0wd3oWM` | [Netflix — completing the cloud migration](https://about.netflix.com/news/completing-the-netflix-cloud-migration) · [Wikipedia — Netflix](https://en.wikipedia.org/wiki/Netflix) |
| `performance-vs-scalability` | — | [Wikipedia — scalability](https://en.wikipedia.org/wiki/Scalability) · [AWS Builders' Library](https://aws.amazon.com/builders-library/) |
| `latency-vs-throughput-vs-bandwidth` | `7qWsnq2ecNE` | [Open Connect](https://openconnect.netflix.com/en/) · [Interactive latency numbers](https://colin-scott.github.io/personal_website/research/interactive_latency.html) · [MDN — understanding latency](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Understanding_latency) |
| `scalability-patterns` | `nFbOxUJJeFo` ✅ | [12factor](https://12factor.net/) · [Wikipedia — Netflix Open Connect](https://en.wikipedia.org/wiki/Netflix_Open_Connect) |

**Shipped in B1 as built, not as planned.** The map above is now the shipped set — every URL
`curl`-verified 200 on 2026-10-27. Four deviations, recorded rather than silently absorbed:

1. `performance-vs-scalability` cites **Wikipedia — scalability** first and the **AWS
   Builders' Library** index second, not *CAP twelve years later*. CAP is about consistency
   under partition, which the lesson does not teach; a source that goes somewhere else than
   the page is decoration.
2. `latency-vs-throughput-vs-bandwidth`'s second read is **MDN — understanding latency**, not
   *Erlang (unit)*. Erlang measures offered load, and the lesson's bandwidth section is about
   bytes per second — adjacent, not deeper.
3. `J_I2E1BmCZg` (video 8, IP + DNS) lost its slot to `7qWsnq2ecNE`, which covers three of the
   lesson's five concepts instead of one table row. Under the one-video-per-lesson rule that
   leaves video 8 with no Phase B home; §3 records it as unplaced rather than pretending the
   map is complete.
4. **The case study moved from LynxDEV to Netflix (plan 17 §0 D1, revised), and that
   replaced three of the four original reads.** *system-design-primer* and *Hello Interview*
   went from `choices-not-boxes` because they are generic checklists — the one thing a lesson
   with a named case study does not need. `choices-not-boxes` now opens on Netflix's own
   sentence about the 2008 corruption, which is the only source in the path that makes the
   lesson's central claim checkable in four minutes. The AWS Builders' Library **moved** from
   `scalability-patterns` to `performance-vs-scalability` (it is a general library, and the
   scaling lesson found a sharper read), which let `scalability-patterns` take **Wikipedia —
   Netflix Open Connect** instead: the lesson's fourth pattern is *move the work out of the
   request path*, and Open Connect is that pattern with a real bill attached. The Chaos Monkey read was **removed from this module** when the
   reliability section moved to M15: a source cited for a claim the lesson no longer makes is
   decoration too.

### M2 · requirements (4 lessons)

Videos: `5WVl9F_7f7k` ✅

| Lesson | Video | Go deeper |
|---|---|---|
| `functional-vs-nonfunctional` | `5WVl9F_7f7k` | [Netflix — completing the cloud migration](https://about.netflix.com/news/completing-the-netflix-cloud-migration) · [Hello Interview — in a hurry](https://www.hellointerview.com/learn/system-design/in-a-hurry) |
| `eliciting-requirements` | — | [Primer — step 1: use cases, constraints, assumptions](https://github.com/donnemartin/system-design-primer) · [Hello Interview](https://www.hellointerview.com/learn/system-design/in-a-hurry) |
| `turning-fast-into-a-number` | — | [SRE — service level objectives](https://sre.google/sre-book/service-level-objectives/) · [SRE Workbook — implementing SLOs](https://sre.google/workbook/implementing-slos/) |
| `what-youre-not-building` | — | [Netflix — completing the cloud migration](https://about.netflix.com/news/completing-the-netflix-cloud-migration) · [Primer — scope the problem](https://github.com/donnemartin/system-design-primer) |

**Shipped in B2.** Two source deviations, and one process note:

1. `functional-vs-nonfunctional` opens on **Netflix's migration post**, not the Primer. The lesson's
   whole claim is "two systems, one company, two requirement sets", and the post is the only source
   in the path that evidences it with a date. A generic checklist cannot support a case study; it
   can only follow one, which is the slot Hello Interview keeps.
2. `what-youre-not-building`'s second read is the **Netflix post** rather than *Wikipedia — high
   availability*. The lesson is about drawing a not-list and giving each out-item a trigger; the
   migration's "billing came a year later, for a stated reason" is that idea with a real cost
   attached. An HA page describes a quality, not a scoping decision.
3. **All four B2 video ids were checked against YouTube's oEmbed endpoint** (2026-10-28), not
   trusted from the map: three shipped titles were paraphrases that had drifted from the real ones
   (`WLYgEASg3Io` had lost "Basics … Explained", `lf3J10_Lnfc` had been rewritten, `EDOK1DWYy4I`
   had lost "Streaming"). The map's titles are translations; the lesson shows the video's own
   title, because a learner searching for it must find the same string. `5WVl9F_7f7k` was
   assigned here by the map and is now embedded — the first draft of the lesson omitted it.

### M3 · constraints-and-design-process (4 lessons)

Videos: `EDOK1DWYy4I` ✅

| Lesson | Video | Go deeper |
|---|---|---|
| `the-45-min-structure` | — | [Hello Interview — in a hurry](https://www.hellointerview.com/learn/system-design/in-a-hurry) · [Primer](https://github.com/donnemartin/system-design-primer) |
| `tradeoffs` | — | [Primer](https://github.com/donnemartin/system-design-primer) · [CAP twelve years later](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/) |
| `anti-patterns` | — | [Fowler — the microservice premium](https://martinfowler.com/bliki/MicroservicePremium.html) · [SRE — addressing cascading failures](https://sre.google/sre-book/addressing-cascading-failures/) |
| `saying-it-out-loud` | `EDOK1DWYy4I` | [Hello Interview — in a hurry](https://www.hellointerview.com/learn/system-design/in-a-hurry) · [SRE — postmortem culture](https://sre.google/sre-book/postmortem-culture/) |

**Shipped in B2.** One deviation: `anti-patterns` cites **Fowler's microservice premium** where the
map had *AWS — avoiding fallback in distributed systems*. The lesson's first anti-pattern is
distributing before the problem demands it, and Fowler names that trade in one page; the map's AWS
piece is about a *different* mistake (fallback paths that hide failure), which the lesson does not
make. The SRE cascading-failures read is unchanged and carries the second half.

### M4 · back-of-the-envelope (4 lessons)

Videos: `WLYgEASg3Io` ✅ · `lf3J10_Lnfc` ✅

| Lesson | Video | Go deeper |
|---|---|---|
| `powers-of-two-and-latency-numbers` | — | [Interactive latency numbers](https://colin-scott.github.io/personal_website/research/interactive_latency.html) · [Primer — latency numbers](https://github.com/donnemartin/system-design-primer) |
| `qps-storage-bandwidth` | `WLYgEASg3Io` | [Primer — back-of-the-envelope](https://github.com/donnemartin/system-design-primer) · [Hello Interview](https://www.hellointerview.com/learn/system-design/in-a-hurry) |
| `littles-law` | — | [Little's law](https://en.wikipedia.org/wiki/Little%27s_law) · [Erlang (unit)](https://en.wikipedia.org/wiki/Erlang_%28unit%29) |
| `estimation-under-uncertainty` | `lf3J10_Lnfc` | [Wikipedia — Fermi problem](https://en.wikipedia.org/wiki/Fermi_problem) · [Primer — back-of-the-envelope](https://github.com/donnemartin/system-design-primer) |

**Shipped in B2.** Two deviations:

1. `estimation-under-uncertainty` cites the **Fermi problem** instead of SRE *service level
   objectives*. SLOs are already `turning-fast-into-a-number`'s whole subject one module earlier,
   and this lesson is about bracketing an unknown input, not about promising an output.
2. `littles-law` keeps **Erlang (unit)** — the one place it belongs, and the note in M1 §2 above is
   not contradicted: there the lesson was about bytes per second, here the lesson computes offered
   load, which is what the Erlang is a unit *of*. Same source, correctly placed in one lesson and
   decorative in the other.

### M5 · api-and-contracts (new, prose)

Videos used: `YNvtSkHb3co` ✅ (contract) · `sP5pzApI72E` ✅ (OAuth, who-are-you) · `vz6ShBpxt2U` ✅ (gateway).
Unplaced (recorded in §3): `_c_wDV_3ktI` (upload API — not about pagination), `GOgp2lzTo0s` (forgot password — not authn/authz), `SAeOWMysy1U` (HTTP/TCP/UDP — no slot).

| Lesson | Video | Go deeper |
|---|---|---|
| `the-contract-before-the-code` | `YNvtSkHb3co` | [RFC 9110 — HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html) · [Google API design guide](https://cloud.google.com/apis/design) |
| `pagination-that-doesnt-lie` | — | [AIP-158 — pagination](https://google.aip.dev/158) · [Stripe — pagination](https://docs.stripe.com/api/pagination) |
| `who-are-you-vs-what-may-you-do` | `sP5pzApI72E` | [Auth0 — JWT](https://auth0.com/docs/secure/tokens/json-web-tokens) · [MDN — HTTP methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) |
| `idempotent-writes` | — | [Stripe — idempotent requests](https://docs.stripe.com/api/idempotent_requests) · [AWS — retries with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) |
| `errors-and-status-codes` | — | [RFC 9457 — problem details](https://www.rfc-editor.org/rfc/rfc9457.html) · [MDN — 429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) · [MDN — Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After) |
| `the-gateway-as-one-door` | `vz6ShBpxt2U` | [microservices.io — API gateway](https://microservices.io/patterns/apigateway.html) · [API gateway](https://en.wikipedia.org/wiki/API_gateway) |

### M6 · load-balancers-and-stateless-services (5 lessons)

Videos: `WxNLwivRCR0` · `tOm35rmGrfg` · `UQ67LJJkhg8` (optional) — **`nFbOxUJJeFo` deliberately not
repeated**, it is already embedded in M1 `scalability-patterns` (B5, plan 17 §7.4).

| Lesson | Video | Go deeper |
|---|---|---|
| `vertical-vs-horizontal` | — (see M1) | [Primer — scalability](https://github.com/donnemartin/system-design-primer) · [12factor — processes](https://12factor.net/processes) |
| `load-balancing` | `WxNLwivRCR0` | [AWS — Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) · [Netflix Zuul](https://github.com/Netflix/zuul) |
| `autoscaling` | `UQ67LJJkhg8` (optional) | [Kubernetes HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) · [AWS — Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) |
| `sessions-without-sticky` | `tOm35rmGrfg` | [12factor — processes](https://12factor.net/processes) · [AWS — sticky sessions](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html) |
| `stateless-services` | — | [12factor — processes](https://12factor.net/processes) · [Netflix Eureka](https://github.com/Netflix/eureka) |

### M7 · caching (10 lessons)

Videos: `mzZ62duH20o` ✅ · `OKs2670F3V0` 🆕 (refresh-ahead)

| Lesson | Video | Go deeper |
|---|---|---|
| `why-cache` | — | [AWS — caching challenges and strategies](https://aws.amazon.com/builders-library/caching-challenges-and-strategies/) · [Primer](https://github.com/donnemartin/system-design-primer) |
| `where-to-cache` | — | [MDN — HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) · [Cloudflare cache docs](https://developers.cloudflare.com/cache/) |
| `cache-aside` | `mzZ62duH20o` ✅ | [Hello Interview — caching](https://www.hellointerview.com/learn/system-design/core-concepts/caching) · [AWS — caching challenges](https://aws.amazon.com/builders-library/caching-challenges-and-strategies/) |
| `write-through-and-behind` | — | [Hello Interview — caching](https://www.hellointerview.com/learn/system-design/core-concepts/caching) · [AWS — caching challenges](https://aws.amazon.com/builders-library/caching-challenges-and-strategies/) |
| `refresh-ahead` | `OKs2670F3V0` | [Hello Interview — caching](https://www.hellointerview.com/learn/system-design/core-concepts/caching) · [Cloudflare — cache-control](https://developers.cloudflare.com/cache/concepts/cache-control/) |
| `cache-keys-and-cardinality` | — | [Cloudflare — cache-control](https://developers.cloudflare.com/cache/concepts/cache-control/) · [MDN — Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) |
| `ttl-and-eviction` | — | [Redis — eviction](https://redis.io/docs/latest/develop/reference/eviction/) · [Cache replacement policies](https://en.wikipedia.org/wiki/Cache_replacement_policies) |
| `invalidation` | — | [Fowler — two hard things](https://martinfowler.com/bliki/TwoHardThings.html) · [MDN — HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) |
| `cache-stampede` | — | [Cache stampede](https://en.wikipedia.org/wiki/Cache_stampede) · [Thundering herd problem](https://en.wikipedia.org/wiki/Thundering_herd_problem) |
| `cold-start-and-failure-modes` | — | [AWS — caching challenges](https://aws.amazon.com/builders-library/caching-challenges-and-strategies/) · [Redis — eviction](https://redis.io/docs/latest/develop/reference/eviction/) |

### M8 · read-replicas (6 lessons) — converted in B5 part 2

Videos: `Q4BUDplOWRE` ✅

| Lesson | Video | Go deeper |
|---|---|---|
| `scaling-reads-vs-writes` | `Q4BUDplOWRE` ✅ | [Primer](https://github.com/donnemartin/system-design-primer) · [Postgres — WAL](https://www.postgresql.org/docs/current/wal-intro.html) |
| `replication-lag` | — | [Postgres — replication solutions](https://www.postgresql.org/docs/current/different-replication-solutions.html) · [Hot standby](https://www.postgresql.org/docs/current/hot-standby.html) |
| `read-your-own-writes` | — | [Eventual consistency](https://en.wikipedia.org/wiki/Eventual_consistency) · [Postgres — hot standby](https://www.postgresql.org/docs/current/hot-standby.html) |
| `promoting-a-replica` | — | [Postgres — warm standby](https://www.postgresql.org/docs/current/warm-standby.html) · [AWS — leader election](https://aws.amazon.com/builders-library/leader-election-in-distributed-systems/) |
| `cqrs-and-read-models` | — | [Fowler — CQRS](https://martinfowler.com/bliki/CQRS.html) · [microservices.io — CQRS](https://microservices.io/patterns/data/cqrs.html) |
| `when-replicas-dont-help` | — | [Postgres — replication solutions](https://www.postgresql.org/docs/current/different-replication-solutions.html) · [Netflix — completing the cloud migration](https://about.netflix.com/news/completing-the-netflix-cloud-migration) |

As shipped: 6 lessons, 3 chapter groups, 2 sources each. `promoting-a-replica` sits **before**
`cqrs-and-read-models` but **after** `read-your-own-writes`, which is a deliberate swap against plan §3
(the data-loss number in promotion *is* the lag, so the guarantee lesson has to come first).

### M9 · partitioning-and-sharding (7 lessons) — converted in B5 part 2

Videos: `Q4BUDplOWRE` ✅ (overview — the **same** video module 8 opens with; the caption says so and
names what to watch for this time. The playlist has no sharding-specific video, so this is the honest
choice rather than a silent duplicate.)

| Lesson | Video | Go deeper |
|---|---|---|
| `why-partition-data` | `Q4BUDplOWRE` ✅ | [Netflix — completing the cloud migration](https://about.netflix.com/news/completing-the-netflix-cloud-migration) · [MongoDB — sharding](https://www.mongodb.com/docs/manual/sharding/) · [Shard](https://en.wikipedia.org/wiki/Shard_%28database_architecture%29) |
| `hash-and-range-sharding` | — | [MongoDB — sharding](https://www.mongodb.com/docs/manual/sharding/) · [Consistent hashing](https://en.wikipedia.org/wiki/Consistent_hashing) · [Vitess](https://vitess.io/) |
| `hot-keys-and-skew` | — | [MongoDB — choose a shard key](https://www.mongodb.com/docs/manual/core/sharding-choose-a-shard-key/) · [Primer](https://github.com/donnemartin/system-design-primer) |
| `rebalancing-shards` | — | [MongoDB — sharding](https://www.mongodb.com/docs/manual/sharding/) · [Consistent hashing](https://en.wikipedia.org/wiki/Consistent_hashing) |
| `consistent-hashing` | — | [Consistent hashing](https://en.wikipedia.org/wiki/Consistent_hashing) · [Primer](https://github.com/donnemartin/system-design-primer) |
| `cross-shard-queries` | — | [Shard](https://en.wikipedia.org/wiki/Shard_%28database_architecture%29) · [Database per service](https://microservices.io/patterns/data/database-per-service.html) |
| `when-not-to-shard` | — | [Use The Index, Luke](https://use-the-index-luke.com/) · [MongoDB — sharding](https://www.mongodb.com/docs/manual/sharding/) |

**Correction to this map's first draft:** `toptal.com/big-data/consistent-hashing` returns **403** to
non-browser clients (measured), so `consistent-hashing` cites Wikipedia and the primer instead. Every
URL above was `curl`-verified 200 before the lesson was written.

### M10 · rate-limiting (6 lessons)

Videos: none specific — the module relies on the simulator (that is the point of the module)

| Lesson | Go deeper |
|---|---|
| `the-bot-in-your-traffic` | [Stripe — rate limits](https://docs.stripe.com/rate-limits) · [Rate limiting](https://en.wikipedia.org/wiki/Rate_limiting) |
| `algorithms` | [Token bucket](https://en.wikipedia.org/wiki/Token_bucket) · [Leaky bucket](https://en.wikipedia.org/wiki/Leaky_bucket) |
| `distributed-rate-limiting` | [Stripe — rate limits](https://docs.stripe.com/rate-limits) · [Rate limiting](https://en.wikipedia.org/wiki/Rate_limiting) |
| `quotas-and-tiers` | [Stripe — rate limits](https://docs.stripe.com/rate-limits) · [MDN — 429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) |
| `load-shedding` | [SRE — handling overload](https://sre.google/sre-book/handling-overload/) · [AWS — load shedding](https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/) |
| `429-and-retry-after` | [MDN — 429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) · [MDN — Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After) |

### M11 · cdns-and-static-content (6 lessons)

Videos: `vz6ShBpxt2U` ✅

| Lesson | Video | Go deeper |
|---|---|---|
| `latency-numbers` | `vz6ShBpxt2U` ✅ | [web.dev — content delivery networks](https://web.dev/articles/content-delivery-networks) · [CDN (MDN glossary)](https://developer.mozilla.org/en-US/docs/Glossary/CDN) |
| `cache-keys-and-ttl` | — | [Cloudflare — cache-control](https://developers.cloudflare.com/cache/concepts/cache-control/) · [MDN — Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) |
| `what-a-cdn-cannot-cache` | — | [MDN — CDN](https://developer.mozilla.org/en-US/docs/Glossary/CDN) · [Content delivery network](https://en.wikipedia.org/wiki/Content_delivery_network) |
| `edge-compute` | — | [Edge computing](https://en.wikipedia.org/wiki/Edge_computing) · [web.dev — CDNs](https://web.dev/articles/content-delivery-networks) |
| `image-and-video-delivery` | — | [web.dev — CDNs](https://web.dev/articles/content-delivery-networks) · [S3 overview](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html) |
| `purging-and-versioning` | — | [Cloudflare cache docs](https://developers.cloudflare.com/cache/) · [MDN — HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) |

### M12 · how-systems-fail (5 lessons — one added)

Videos: `Pfr_6h3Rqew` ✅ · `osfhB8rd55A` 🆕 · `8itMutVwl_c` 🆕

| Lesson | Video | Go deeper |
|---|---|---|
| `trace-your-own-design` | `Pfr_6h3Rqew` ✅ | [AWS — static stability](https://aws.amazon.com/builders-library/static-stability-using-availability-zones/) · [SRE — cascading failures](https://sre.google/sre-book/addressing-cascading-failures/) |
| `retry-storms` | — | [AWS — timeouts, retries, backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) · [SRE — cascading failures](https://sre.google/sre-book/addressing-cascading-failures/) |
| `cascades` | `osfhB8rd55A` | [SRE — addressing cascading failures](https://sre.google/sre-book/addressing-cascading-failures/) · [AWS — avoiding fallback](https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/) |
| `blast-radius-and-bulkheads` | — | [AWS — static stability](https://aws.amazon.com/builders-library/static-stability-using-availability-zones/) · [AWS — leader election](https://aws.amazon.com/builders-library/leader-election-in-distributed-systems/) |
| **`logging-monitoring-and-traces`** (new) | `8itMutVwl_c` | [OpenTelemetry — observability primer](https://opentelemetry.io/docs/concepts/observability-primer/) · [Brendan Gregg — USE method](https://www.brendangregg.com/usemethod.html) · [SRE — postmortem culture](https://sre.google/sre-book/postmortem-culture/) |

### M13 · timeouts-retries-circuit-breakers (5 lessons)

Videos: none specific — the failure simulator is the teaching device

| Lesson | Go deeper |
|---|---|
| `no-timeout-is-worse` | [AWS — timeouts, retries, backoff](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) · [SRE — cascading failures](https://sre.google/sre-book/addressing-cascading-failures/) |
| `retries-and-jitter` | [AWS — timeouts, retries, backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) · [AWS — idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) |
| `breakers-and-bulkheads` | [Fowler — circuit breaker](https://martinfowler.com/bliki/CircuitBreaker.html) · [Circuit breaker pattern](https://en.wikipedia.org/wiki/Circuit_breaker_design_pattern) |
| `timeout-budgets` | [AWS — timeouts, retries, backoff](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) · [SRE — handling overload](https://sre.google/sre-book/handling-overload/) |
| `fallbacks-and-degradation` | [AWS — avoiding fallback](https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/) · [SRE — handling overload](https://sre.google/sre-book/handling-overload/) |

### M14 · idempotency (4 lessons)

Videos: none specific

| Lesson | Go deeper |
|---|---|
| `at-least-once-delivery` | [Kafka documentation](https://kafka.apache.org/documentation/) · [SQS — dead-letter queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html) |
| `idempotency-keys` | [Stripe — idempotent requests](https://docs.stripe.com/api/idempotent_requests) · [AWS — idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) |
| `exactly-once-is-a-lie` | [Kafka documentation](https://kafka.apache.org/documentation/) · [Idempotence](https://en.wikipedia.org/wiki/Idempotence) |
| `dead-letter-queues` | [SQS — DLQ](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html) · [AWS — insurmountable queue backlogs](https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/) |

### M15 · chaos-capstone (3 lessons)

Videos: `Pfr_6h3Rqew` ✅

| Lesson | Video | Go deeper |
|---|---|---|
| `chaos-as-practice` | `Pfr_6h3Rqew` ✅ | [AWS — static stability](https://aws.amazon.com/builders-library/static-stability-using-availability-zones/) · [PagerDuty postmortems](https://postmortems.pagerduty.com/) |
| `surviving-everything` | — | [SRE — cascading failures](https://sre.google/sre-book/addressing-cascading-failures/) · [SRE — handling overload](https://sre.google/sre-book/handling-overload/) |
| `postmortems-without-blame` | — | [SRE — postmortem culture](https://sre.google/sre-book/postmortem-culture/) · [PagerDuty postmortems](https://postmortems.pagerduty.com/) |

---

## 3. Videos with no Phase B home

### 3.1 Reserved for Phase C / D

| # | Video | ID | Phase C module |
|---|---|---|---|
| 3 | Monolithic architecture | `KLlyEgB-Now` | `monolith-to-services` |
| 4 | Microservices | `Y227d9kvzZ4` | `monolith-to-services` |
| 12 | SQL vs NoSQL | `abtGU_U652k` | `choosing-a-datastore` |
| 16 | Database indexes (B-tree, hash) | `APyvatiS3LY` | `how-databases-store-data` |
| 23 | Choosing the right database | `__51PvJA1Y4` | `choosing-a-datastore` |
| 24 | Database relationships | `aEvHuCyHhv8` | `choosing-a-datastore` |
| 25 | Database design step-by-step | `GqX0lhBNHkU` | `choosing-a-datastore` |
| 28 | Real-time chat | `es_wPdEYgVA` | `events-and-streaming` |

### 3.2 Unplaced — video 8, IP + DNS

| # | Video | ID | Why it has no home | Candidate |
|---|---|---|---|---|
| 8 | How browsers find websites (IP + DNS) | `J_I2E1BmCZg` | Its only natural Phase B slot was M1 `latency-vs-throughput-vs-bandwidth`, where the per-hop table already contains a DNS row. `7qWsnq2ecNE` covers three of that lesson's five concepts; the DNS video covers one row. One video per lesson, so it loses. M11 `latency-numbers` is the other fit and is already taken by `vz6ShBpxt2U`. | A Phase C lesson on the first hop (`dns-and-the-request-path`), or M11 `what-a-cdn-cannot-cache` if that lesson ever covers DNS-based steering. Do not force it into a lesson it only decorates. |

**Why this is written down instead of quietly dropped.** The playlist was adopted as a
completeness check on the path; a map that silently loses one of 31 videos is no longer a
completeness check, and the loss is invisible on a page that looks fully covered. The
honest count is 18 placed, not 19.


Phase C free reads (one each): [SQL vs NoSQL — MongoDB](https://www.mongodb.com/docs/manual/) · [Use The Index, Luke](https://use-the-index-luke.com/) · [MVCC intro](https://www.postgresql.org/docs/current/mvcc-intro.html) · [Transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html) · [Database index](https://en.wikipedia.org/wiki/Database_index) · [Kafka](https://kafka.apache.org/documentation/) · [SQS DLQ](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html) · [Saga](https://microservices.io/patterns/data/saga.html) · [Outbox](https://microservices.io/patterns/data/transactional-outbox.html) · [CQRS](https://microservices.io/patterns/data/cqrs.html) · [Raft](https://raft.github.io/) · [PACELC](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf) · [Azure/AWS reliability pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html) · [Canary](https://martinfowler.com/bliki/CanaryRelease.html) · [Blue/green](https://martinfowler.com/bliki/BlueGreenDeployment.html) · [Distributed patterns (Fowler)](https://martinfowler.com/articles/patterns-of-distributed-systems/) · [Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)

---


### 3.3 Unplaced — B3 (api-and-contracts) candidates

Verified via YouTube oEmbed on 2026-10-28. Titles drifted from the draft in three cases,
so the videos were dropped rather than mislabelled.

| # | Video | ID | Why it has no home |
|---|---|---|---|
| — | Video Upload & Streaming API Design (Step-by-Step) | `_c_wDV_3ktI` | Title is about upload/streaming APIs, not pagination. The plan originally slotted it into `pagination-that-doesnt-lie`; that lesson now carries no video. |
| — | How Forgot Password Actually Works | `GOgp2lzTo0s` | Title is about password reset, not authentication/authorisation. The plan originally slotted it into `who-are-you-vs-what-may-you-do`; that lesson uses `sP5pzApI72E` (OAuth 2.0) instead. |
| — | Internet Protocols: HTTP, TCP, UDP & WebSocket | `SAeOWMysy1U` | No natural slot in Part 0 — the contract lesson already carries `YNvtSkHb3co`, and HTTP semantics are covered by RFC 9110. Reserved for a Phase C lesson on the request path. |

The honest count is now 21 placed (was 18): M5 adds `YNvtSkHb3co`, `sP5pzApI72E`, `vz6ShBpxt2U`.

## 4. Gaps the playlist exposes

| # | Gap | Evidence | Recommendation |
|---|---|---|---|
| **G1** | **No index lesson in Phase B.** "Add an index" is the most common real fix at junior level, and we skip straight from replicas to sharding | Video 16 exists but has no home; `use-the-index-luke` sits unused in Phase C | Pull one lesson forward: module 9 or 8 gets `indexes-are-not-free` (5-minute read on B-tree vs hash, when an index hurts). Decision needed — it changes Phase B to 80 lessons |
| **G2** | **Observability had no lesson at all** until this map | Video 15; loggability is in every postmortem story | Added as M12 lesson 5. Confirmed rather than assumed |
| **G3** | **API protocols (HTTP/TCP/UDP/WebSocket) have no lesson**, yet M5 assumes them | Videos 9 and 11; `SAeOWMysy1U` is embedded but the prose does not name the protocols | M5 `the-contract-before-the-code` must cover the request lifecycle, or split the lesson |
| **G4** | **Auto-scaling has a video but a weak prose home** | Video 14 | Keep as optional embed in M6 `autoscaling`; no new lesson |
| **G5** | **Phase C/D videos are 8 of 31** — a third of the playlist teaches modules that do not exist yet | §3 | That is the strongest argument for Phase C, not against Phase B |

---

## 5. Link check — evidence

Procedure (repeat quarterly, and before any slice ships):

```bash
curl -L -o /dev/null -s -w "%{http_code} %{url_effective}\n" --max-time 20 <url>
```

Run 2026-10-27. **66 URLs tested across four batches; all 200 except the four below, which were replaced:**

| Removed | Reason | Replacement |
|---|---|---|
| `https://www.nginx.com/resources/glossary/reverse-proxy-vs-load-balancer/` | 403 to automated check (bot wall) | Wikipedia *Reverse proxy* + AWS ELB intro |
| `https://www.nginx.com/blog/choosing-the-right-load-balancing-algorithm/` | 403 | AWS ELB intro |
| `https://www.cloudflare.com/learning/cdn/what-is-a-cdn/` | 403 (bot wall; the page exists) | MDN CDN + web.dev CDN |
| `https://www.cs.princeton.edu/courses/archive/fall09/cos521/Handouts/consistent.pdf` | 404 | Wikipedia *Consistent hashing* + Toptal explainer |

Note: Cloudflare and Nginx serve 403 to non-browser clients. They are good pages; they are simply **not verifiable by the gate**, so they are not in the map. A link the gate cannot check will rot unnoticed.

**Re-run 2026-10-30, before B5 part 2 shipped — all 65 shipped links pass; the one replacement that had itself gone bad was caught here.** Every URL that appears as a `sources` entry in the nine converted modules (**65 distinct URLs**) returned **200** under the plain-`curl` procedure above. The failure was in a URL that had *not* yet been wired in: `https://www.toptal.com/big-data/consistent-hashing`, the replacement chosen for the Princeton 404 earlier in this section, now returns **403** to a non-browser client. The `consistent-hashing` lesson cites Wikipedia's *Consistent hashing* and the system-design primer instead, and the map row no longer carries Toptal. The 2026-10-27 batch had recorded it as 200, so one of the two measurements is wrong and there is no way from here to know which — either the first check followed a redirect to something cached, or Toptal changed policy in three days. That ambiguity is the argument for re-running the sweep per slice rather than once per plan: the first run is a snapshot of a moving target, and a stale 200 reads exactly like a live link until a learner clicks it. Note also that the 65 that pass were checked with the *same* command that failed Toptal, so this is a comparison and not a softer test.

**Added 2026-10-27 — the Netflix tech blog is in the same class, and it costs us the best sources in the path.** `netflixtechblog.com` and the legacy `techblog.netflix.com` both answer **403** to a non-browser client (Medium's bot wall — and the legacy host now 301s into it). Measured: *A Closer Look at the Christmas Eve Outage*, *Per-Title Encode Optimization* and *The Netflix Simian Army* all returned 403, while `about.netflix.com`, `openconnect.netflix.com` and every `github.com/Netflix/*` repository returned 200. Consequence: the case study is anchored on **those** sources, and the tech-blog posts are cited by title in lesson prose only — never as a `sources` entry. This is a real constraint, not an inconvenience: the Christmas Eve 2012 postmortem is the natural anchor for M12 and it cannot be linked, so M12's anchor is the Simian Army repository instead. If a browser-rendered check is ever added to the gate, these posts come back first.

---

## 6. What this changes in plan 17

1. **M12 gains a fifth lesson** — `logging-monitoring-and-traces`. Phase B becomes **15 modules / 79 lessons**.
2. **M5 is video-rich** — 6 of the 31 videos land there, which makes the prose module the best-covered part of the path. It also confirms M5 must come before M6.
3. **`sources` is now a content requirement**, not an optional field: every Phase B lesson in §2 has at least one verified free read. The gate in §4.4 of plan 17 checks them.
4. **18 of 31 videos** are placed in Phase B; 8 wait for Phase C; 1 has no home (video 8, §3.2); 4 are optional/duplicates (2, 6, 7, 13 already embedded elsewhere). 18 + 8 + 1 + 4 = 31 — the map accounts for every video, which is the only way to tell a complete map from a plausible one.
5. **G1 is an open decision** for you: pull `indexes-are-not-free` into Phase B (recommended — it is the highest-value missing junior topic and the video already exists), or leave indexing to Phase C.
