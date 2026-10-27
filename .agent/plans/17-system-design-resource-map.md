# System Design — Video & Free-Reading Map

> **Date:** 2026-10-27
> **Companion to:** `.agent/plans/17-system-design-content-2.0.md`
> **Playlist:** [System Design in Bangla](https://www.youtube.com/playlist?list=PLiGGopVZ-5D0lSZmDPBSlg9bT4kncg9aX) — 31 videos, read with `yt-dlp --flat-playlist`
> **Every external link below was HTTP-checked on 2026-10-27** (status cargo in §5). No invented URLs.
> **Status:** plan only. Nothing here is wired into the content files yet.

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

Status: ✅ already embedded · 🆕 to embed in Phase B · 🔜 belongs to a Phase C/D module.

| # | Clean label | ID | Target | Status |
|---|---|---|---|---|
| 1 | Client–server model, database, scaling | `DzAt0wd3oWM` | M1 `choices-not-boxes` | ✅ |
| 2 | Vertical vs horizontal scaling, LB, DNS | `nFbOxUJJeFo` | M1 `scalability-patterns` + M6 `vertical-vs-horizontal` | ✅ |
| 3 | Monolithic architecture | `KLlyEgB-Now` | Phase C `monolith-to-services` | 🔜 |
| 4 | Microservices + project demo | `Y227d9kvzZ4` | Phase C `monolith-to-services` | 🔜 |
| 5 | LB + sharding + replication + caching | `Q4BUDplOWRE` | M9 `why-partition-data` (overview) + M8 `scaling-reads-vs-writes` | ✅ |
| 6 | CDN + message queue + API gateway | `vz6ShBpxt2U` | M11 `latency-numbers` + M5 `the-gateway-as-one-door` | ✅ |
| 7 | Scalability, availability, consistency, fault tolerance | `Pfr_6h3Rqew` | M12 `trace-your-own-design` | ✅ (3 embeds) |
| 8 | How browsers find websites (IP + DNS) | `J_I2E1BmCZg` | M1 `latency-vs-throughput-vs-bandwidth` (request path) | 🆕 |
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

**Today:** 10 embeds, 7 unique IDs, spread over 8 modules. **After Phase B:** 19 videos placed, 12 reserved for Phase C/D.

---

## 2. Phase B — lesson by lesson

Legend: **Go deeper** = the free read that actually goes deeper than the lesson, not a generic homepage.

### M1 · what-is-system-design (4 lessons)

Videos: `DzAt0wd3oWM` ✅ · `7qWsnq2ecNE` 🆕 · `J_I2E1BmCZg` 🆕

| Lesson | Video | Go deeper (free) |
|---|---|---|
| `choices-not-boxes` | `DzAt0wd3oWM` | [system-design-primer](https://github.com/donnemartin/system-design-primer) · [Hello Interview — in a hurry](https://www.hellointerview.com/learn/system-design/in-a-hurry) |
| `performance-vs-scalability` | — | [Primer — performance vs scalability](https://github.com/donnemartin/system-design-primer) · [CAP twelve years later](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/) |
| `latency-vs-throughput-vs-bandwidth` | `7qWsnq2ecNE` + `J_I2E1BmCZg` | [Interactive latency numbers](https://colin-scott.github.io/personal_website/research/interactive_latency.html) · [Erlang (unit)](https://en.wikipedia.org/wiki/Erlang_%28unit%29) |
| `scalability-patterns` | `nFbOxUJJeFo` ✅ | [12factor](https://12factor.net/) · [AWS Builders' Library](https://aws.amazon.com/builders-library/) |

### M2 · requirements (4 lessons)

Videos: `5WVl9F_7f7k` 🆕

| Lesson | Video | Go deeper |
|---|---|---|
| `functional-vs-nonfunctional` | `5WVl9F_7f7k` | [Hello Interview — in a hurry](https://www.hellointerview.com/learn/system-design/in-a-hurry) · [Primer](https://github.com/donnemartin/system-design-primer) |
| `eliciting-requirements` | — | [Primer — step 1: use cases, constraints, assumptions](https://github.com/donnemartin/system-design-primer) · [Hello Interview](https://www.hellointerview.com/learn/system-design/in-a-hurry) |
| `turning-fast-into-a-number` | — | [SRE — service level objectives](https://sre.google/sre-book/service-level-objectives/) · [SRE Workbook — implementing SLOs](https://sre.google/workbook/implementing-slos/) |
| `what-youre-not-building` | — | [Primer](https://github.com/donnemartin/system-design-primer) · [High availability](https://en.wikipedia.org/wiki/High_availability) |

### M3 · constraints-and-design-process (4 lessons)

Videos: `EDOK1DWYy4I` 🆕

| Lesson | Video | Go deeper |
|---|---|---|
| `the-45-min-structure` | — | [Hello Interview — in a hurry](https://www.hellointerview.com/learn/system-design/in-a-hurry) · [Primer](https://github.com/donnemartin/system-design-primer) |
| `tradeoffs` | — | [Primer](https://github.com/donnemartin/system-design-primer) · [CAP twelve years later](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/) |
| `anti-patterns` | — | [AWS — avoiding fallback in distributed systems](https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/) · [SRE — addressing cascading failures](https://sre.google/sre-book/addressing-cascading-failures/) |
| `saying-it-out-loud` | `EDOK1DWYy4I` | [Hello Interview — in a hurry](https://www.hellointerview.com/learn/system-design/in-a-hurry) · [SRE — postmortem culture](https://sre.google/sre-book/postmortem-culture/) |

### M4 · back-of-the-envelope (4 lessons)

Videos: `WLYgEASg3Io` 🆕 · `lf3J10_Lnfc` 🆕

| Lesson | Video | Go deeper |
|---|---|---|
| `powers-of-two-and-latency-numbers` | — | [Interactive latency numbers](https://colin-scott.github.io/personal_website/research/interactive_latency.html) · [Primer — latency numbers](https://github.com/donnemartin/system-design-primer) |
| `qps-storage-bandwidth` | `WLYgEASg3Io` | [Primer](https://github.com/donnemartin/system-design-primer) · [Hello Interview](https://www.hellointerview.com/learn/system-design/in-a-hurry) |
| `littles-law` | — | [Little's law](https://en.wikipedia.org/wiki/Little%27s_law) · [Erlang (unit)](https://en.wikipedia.org/wiki/Erlang_%28unit%29) |
| `estimation-under-uncertainty` | `lf3J10_Lnfc` | [Primer](https://github.com/donnemartin/system-design-primer) · [SRE — service level objectives](https://sre.google/sre-book/service-level-objectives/) |

### M5 · api-and-contracts (new, prose)

Videos: `YNvtSkHb3co` 🆕 · `_c_wDV_3ktI` 🆕 · `SAeOWMysy1U` ✅ · `GOgp2lzTo0s` 🆕 · `sP5pzApI72E` 🆕 · `vz6ShBpxt2U` ✅ (gateway)

| Lesson | Video | Go deeper |
|---|---|---|
| `the-contract-before-the-code` | `YNvtSkHb3co` | [RFC 9110 — HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html) · [Google API design guide](https://cloud.google.com/apis/design) |
| `pagination-that-doesnt-lie` | `_c_wDV_3ktI` | [AIP-158 — pagination](https://google.aip.dev/158) · [Stripe — pagination](https://docs.stripe.com/api/pagination) |
| `who-are-you-vs-what-may-you-do` | `GOgp2lzTo0s` + `sP5pzApI72E` | [Auth0 — JWT](https://auth0.com/docs/secure/tokens/json-web-tokens) · [MDN — HTTP methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) |
| `idempotent-writes` | — | [Stripe — idempotent requests](https://docs.stripe.com/api/idempotent_requests) · [AWS — retries with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) |
| `errors-and-status-codes` | — | [RFC 9457 — problem details](https://www.rfc-editor.org/rfc/rfc9457.html) · [MDN — 429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) · [MDN — Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After) |
| `the-gateway-as-one-door` | `vz6ShBpxt2U` ✅ | [microservices.io — API gateway](https://microservices.io/patterns/apigateway.html) · [API gateway](https://en.wikipedia.org/wiki/API_gateway) |

### M6 · load-balancers-and-stateless-services (5 lessons)

Videos: `nFbOxUJJeFo` ✅ · `WxNLwivRCR0` 🆕 · `tOm35rmGrfg` 🆕 · `UQ67LJJkhg8` 🆕 (optional)

| Lesson | Video | Go deeper |
|---|---|---|
| `vertical-vs-horizontal` | `nFbOxUJJeFo` ✅ | [Primer](https://github.com/donnemartin/system-design-primer) · [12factor](https://12factor.net/) |
| `autoscaling` | `UQ67LJJkhg8` (optional) | [Kubernetes HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) · [AWS ELB intro](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) |
| `load-balancing` | `WxNLwivRCR0` | [AWS ELB intro](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) · [Reverse proxy](https://en.wikipedia.org/wiki/Reverse_proxy) |
| `sessions-without-sticky` | `tOm35rmGrfg` | [12factor — processes](https://12factor.net/) · [AWS — sticky sessions](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html) |
| `stateless-services` | — | [12factor](https://12factor.net/) · [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) |

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

### M8 · read-replicas (6 lessons)

Videos: `Q4BUDplOWRE` ✅

| Lesson | Video | Go deeper |
|---|---|---|
| `scaling-reads-vs-writes` | `Q4BUDplOWRE` ✅ | [Primer](https://github.com/donnemartin/system-design-primer) · [Postgres — WAL](https://www.postgresql.org/docs/current/wal-intro.html) |
| `replication-lag` | — | [Postgres — replication solutions](https://www.postgresql.org/docs/current/different-replication-solutions.html) · [Hot standby](https://www.postgresql.org/docs/current/hot-standby.html) |
| `promoting-a-replica` | — | [Postgres — warm standby](https://www.postgresql.org/docs/current/warm-standby.html) · [AWS — leader election](https://aws.amazon.com/builders-library/leader-election-in-distributed-systems/) |
| `read-your-own-writes` | — | [Eventual consistency](https://en.wikipedia.org/wiki/Eventual_consistency) · [Replication](https://en.wikipedia.org/wiki/Replication_%28computing%29) |
| `cqrs-and-read-models` | — | [microservices.io — CQRS](https://microservices.io/patterns/data/cqrs.html) · [Primer](https://github.com/donnemartin/system-design-primer) |
| `when-replicas-dont-help` | — | [Postgres — replication solutions](https://www.postgresql.org/docs/current/different-replication-solutions.html) · [Primer](https://github.com/donnemartin/system-design-primer) |

### M9 · partitioning-and-sharding (7 lessons)

Videos: `Q4BUDplOWRE` ✅ (overview)

| Lesson | Video | Go deeper |
|---|---|---|
| `why-partition-data` | `Q4BUDplOWRE` ✅ | [MongoDB — sharding](https://www.mongodb.com/docs/manual/sharding/) · [Shard](https://en.wikipedia.org/wiki/Shard_%28database_architecture%29) |
| `hash-and-range-sharding` | — | [MongoDB — sharding](https://www.mongodb.com/docs/manual/sharding/) · [Consistent hashing](https://en.wikipedia.org/wiki/Consistent_hashing) |
| `hot-keys-and-skew` | — | [MongoDB — sharding](https://www.mongodb.com/docs/manual/sharding/) · [Primer](https://github.com/donnemartin/system-design-primer) |
| `rebalancing-shards` | — | [MongoDB — sharding](https://www.mongodb.com/docs/manual/sharding/) · [Consistent hashing](https://en.wikipedia.org/wiki/Consistent_hashing) |
| `consistent-hashing` | — | [Consistent hashing](https://en.wikipedia.org/wiki/Consistent_hashing) · [Toptal — consistent hashing](https://www.toptal.com/big-data/consistent-hashing) |
| `cross-shard-queries` | — | [Shard](https://en.wikipedia.org/wiki/Shard_%28database_architecture%29) · [Database per service](https://microservices.io/patterns/data/database-per-service.html) |
| `when-not-to-shard` | — | [Use The Index, Luke](https://use-the-index-luke.com/) · [MongoDB — sharding](https://www.mongodb.com/docs/manual/sharding/) |

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

## 3. Videos reserved for Phase C / D

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

Phase C free reads (one each): [SQL vs NoSQL — MongoDB](https://www.mongodb.com/docs/manual/) · [Use The Index, Luke](https://use-the-index-luke.com/) · [MVCC intro](https://www.postgresql.org/docs/current/mvcc-intro.html) · [Transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html) · [Database index](https://en.wikipedia.org/wiki/Database_index) · [Kafka](https://kafka.apache.org/documentation/) · [SQS DLQ](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html) · [Saga](https://microservices.io/patterns/data/saga.html) · [Outbox](https://microservices.io/patterns/data/transactional-outbox.html) · [CQRS](https://microservices.io/patterns/data/cqrs.html) · [Raft](https://raft.github.io/) · [PACELC](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf) · [Azure/AWS reliability pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html) · [Canary](https://martinfowler.com/bliki/CanaryRelease.html) · [Blue/green](https://martinfowler.com/bliki/BlueGreenDeployment.html) · [Distributed patterns (Fowler)](https://martinfowler.com/articles/patterns-of-distributed-systems/) · [Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)

---

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

---

## 6. What this changes in plan 17

1. **M12 gains a fifth lesson** — `logging-monitoring-and-traces`. Phase B becomes **15 modules / 79 lessons**.
2. **M5 is video-rich** — 6 of the 31 videos land there, which makes the prose module the best-covered part of the path. It also confirms M5 must come before M6.
3. **`sources` is now a content requirement**, not an optional field: every Phase B lesson in §2 has at least one verified free read. The gate in §4.4 of plan 17 checks them.
4. **19 of 31 videos** are placed in Phase B; 8 wait for Phase C; 4 are optional/duplicates (2, 6, 7, 13 already embedded elsewhere).
5. **G1 is an open decision** for you: pull `indexes-are-not-free` into Phase B (recommended — it is the highest-value missing junior topic and the video already exists), or leave indexing to Phase C.
