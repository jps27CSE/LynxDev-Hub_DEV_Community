import type { SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

/**
 * Module 7 — caching, converted to the leaf model (plan 17, slice B4).
 *
 * **Netflix anchor.** EVCache, the tier Netflix built in front of its stores,
 * and its own README, which defines the three words of the name:
 *
 *   - *Ephemeral* — "the data stored is for a short duration as specified by
 *     its TTL (Time To Live)";
 *   - *Volatile* — "the data can disappear any time (Evicted)";
 *   - *Cache* — "an in-memory key-value store".
 *
 * That definition is the module in three lines, and it is why every lesson here
 * can be checked against the thing it is teaching: a copy with an expiry, a
 * copy you must be able to lose, a copy that exists to avoid a round trip.
 *
 * **The task's numbers were measured, and the previous ones were broken.** The
 * module used to run at 50,000 requests per second against three app instances
 * and one load balancer. The load balancer's capacity in `NODE_TYPES` is
 * 20,000, so 2.5× the load was shed at the door: the start graph showed **96%**
 * errors and so did the "solution" — while every pass criterion was green,
 * because p95 is computed over the requests that completed and only 4% did.
 * A learner could finish this module without ever fixing the tier.
 *
 * Re-measured for this slice at 12,000 r/s with eight app instances (75%
 * utilisation, so the tier is not the lesson): **no cache → store at 240%,
 * 58.3% errors, p95 9.4 ms; cache at 0.9 → store at 24%, 0% errors, p95
 * 3.4 ms**. The task now carries an error-rate criterion, so "shed nearly
 * everything" can never again read as success.
 *
 * The same defect exists in modules 6 and 8 (90% and 96% errors at 20,000 and
 * 50,000) and is recorded in plan 17 §7.3 — it is not fixable inside a content
 * slice without changing those modules' intended numbers.
 */
const module: SdModule = {
  slug: "caching",
  order: 7,
  part: 1,
  partTitle: "Scaling up",
  kind: "sim",
  title: "Caching",
  description:
    "Why a cache exists, the five places one can live, the three patterns that keep it honest, and what happens when it is cold, full or gone — built on Netflix's EVCache tier.",
  story:
    "One door and eight identical app servers, and the page still ends at the title store. Ninety-five of every hundred requests are reads of the same rows, so the store is asked the same questions 11,400 times a second and answers them 11,400 times. Netflix's migration post has a phrase for what that arrangement becomes: “vertically scaled single points of failure”. Their answer was not a bigger store — it was EVCache, a memcached-based tier whose own README describes it as “caching frequently used data” and whose name is a design brief: ephemeral, volatile, cache. This module is that tier: where it sits, how it stays honest, and why “volatile” is a promise rather than a disclaimer.",
  chapters: [
    {
      slug: "why-and-where",
      title: "Why, and where",
      description:
        "What a cache is allowed to promise, and the five places it can live.",
      children: [
        {
          slug: "why-cache-chapter",
          title: "Why cache at all",
          description:
            "A copy with an expiry. Hit rate is the only number that decides, and half a cache buys you nothing.",
          lessonSlug: "why-cache",
        },
        {
          slug: "where-to-cache-chapter",
          title: "Where a cache can live",
          description:
            "Browser, edge, process memory, shared tier, the store's own buffers — and the rule that picks between them.",
          lessonSlug: "where-to-cache",
        },
      ],
    },
    {
      slug: "patterns",
      title: "Keeping it honest",
      description:
        "Three patterns for a second copy of the truth: read on demand, write through, refresh ahead.",
      children: [
        {
          slug: "cache-aside-chapter",
          title: "Cache-aside",
          description:
            "Read, miss, load, set. Writes delete the key — and why deleting beats updating.",
          lessonSlug: "cache-aside",
        },
        {
          slug: "write-through-and-behind-chapter",
          title: "Write-through and write-behind",
          description:
            "Paying for freshness on the write path, or borrowing from the log and hoping it flushes.",
          lessonSlug: "write-through-and-behind",
        },
        {
          slug: "refresh-ahead-chapter",
          title: "Refresh ahead",
          description:
            "Spend work on the keys you can predict, before the miss happens.",
          lessonSlug: "refresh-ahead",
        },
      ],
    },
    {
      slug: "keeping-it-true",
      title: "Keeping it true",
      description:
        "Keys, expiry, invalidation — the three mechanisms that decide whether the copy is still true.",
      children: [
        {
          slug: "cache-keys-and-cardinality-chapter",
          title: "Keys and cardinality",
          description:
            "The key is the address. Add anything that changes the answer, and nothing that does not.",
          lessonSlug: "cache-keys-and-cardinality",
        },
        {
          slug: "ttl-and-eviction-chapter",
          title: "TTL and eviction",
          description:
            "Expiry is a promise about staleness; eviction is what happens when memory runs out.",
          lessonSlug: "ttl-and-eviction",
        },
        {
          slug: "invalidation-chapter",
          title: "Invalidation",
          description:
            "Delete on write, version the key, or accept the TTL — and what each one costs per second.",
          lessonSlug: "invalidation",
        },
      ],
    },
    {
      slug: "when-it-breaks",
      title: "When it breaks",
      description:
        "The two ways a cache stops protecting you: all at once, and all at once.",
      children: [
        {
          slug: "cache-stampede-chapter",
          title: "The stampede",
          description:
            "One hot key expires and ten thousand requests arrive at the store together.",
          lessonSlug: "cache-stampede",
        },
        {
          slug: "cold-start-and-failure-modes-chapter",
          title: "Cold starts and failure modes",
          description:
            "A cache that is empty, or gone, hands the store everything it was shielded from.",
          lessonSlug: "cold-start-and-failure-modes",
        },
      ],
    },
  ],
  lessons: [
    // ---------------------------------------------------------------------
    {
      slug: "why-cache",
      title: "Why cache at all",
      attribution:
        "Synthesised from the EVCache README (Netflix's own definition of the name), the AWS Builders' Library on caching, and Netflix's account of completing its cloud migration. The traffic model is stated as an assumption throughout.",
      sources: [
        {
          label:
            "Netflix EVCache — the README that defines Ephemeral, Volatile, Cache",
          url: "https://github.com/Netflix/EVCache",
        },
        {
          label: "AWS Builders' Library — caching challenges and strategies",
          url: "https://aws.amazon.com/builders-library/caching-challenges-and-strategies/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The acronym is the design brief",
          body: "Netflix's cache tier is called EVCache, and its README spells the name out: *Ephemeral* — “the data stored is for a short duration as specified by its TTL”; *Volatile* — “the data can disappear any time (Evicted)”; *Cache* — “an in-memory key-value store”.\n\nThree words, and the whole discipline is inside them. A copy with an expiry. A copy you must be able to lose. A copy that exists only to avoid a round trip.\n\nThey did not build it because caching is clever. They built it because the alternative is what their own migration post calls “vertically scaled single points of failure” — one database being asked the same question at full traffic, forever.",
        },
        {
          kind: "concept",
          title: "A cache is a stored answer, not a faster database",
          body: "A cache holds the **result** of work, keyed by what the request asked for. It does not make the store faster; it makes the store asked less often.\n\nThat only pays because traffic is repetitive. In consumer workloads a small share of keys serves most of the reads: the same title page, the same top-ten row, the same profile. The cache never computes anything — it remembers.\n\nThe number that describes how well it remembers is the **hit rate**: the share of requests answered without going further. Everything else about a cache — memory, consistency, failure behaviour — is a consequence of trying to raise that one number without lying.",
        },
        {
          kind: "concept",
          title: "Do the arithmetic before you pick a product",
          body: "Take the load this module's canvas is built on: **12,000 requests per second, 95% of them reads**. That is 11,400 reads and 600 writes every second, against a store our model gives 5,000 requests per second of capacity.\n\n```\nreads reaching the store = 11,400 × (1 − hit rate)\n```\n\n| Hit rate | Reads reaching the store | As % of a 5,000 r/s store |\n| --- | --- | --- |\n| 0% | 11,400 | 228% |\n| 50% | 5,700 | 114% |\n| 80% | 2,280 | 46% |\n| 90% | 1,140 | 23% |\n| 99% | 114 | 2% |\n\nThe canvas adds the write traffic on top, so its store figure runs slightly higher than the read column — but the shape is the point, and the shape is not linear.",
        },
        {
          kind: "concept",
          title: "Half a cache is not half the benefit",
          body: "Look at the 50% row: you built a cache, you are paying for a cache, and the store is still at 114%. The system still fails. A cache is a **threshold** technology — it starts paying when it keeps the store under its ceiling, and until then it is pure added complexity.\n\nThe same table read the other way is why hit rate is argued about so fiercely. Going from 80% to 90% removes 1,140 reads per second from a store that can do 5,000. Going from 90% to 99% removes another 1,026.",
        },
        {
          kind: "concept",
          title: "What the copy costs you",
          body: "Four bills arrive with the first cache.\n\n**Memory.** Entries × size. Five million keys at 2 KB is about 10 GB of RAM, and RAM is the most expensive storage you own per gigabyte.\n\n**Coherence.** Two copies now disagree sometimes. How long they may disagree is a product decision that somebody has to make explicitly — “a title's artwork may be five minutes stale” is a sentence a PM can sign; “we'll see” is not.\n\n**A new failure mode.** A cache can be wrong, full, or absent — and an absent cache is the subject of this module's last lesson, because it is the failure that takes the store down.\n\n**One more hop.** Two tenths of a millisecond in our model. Cheap, and still a network call that can time out.",
        },
        {
          kind: "concept",
          title: "The number to watch is not the hit rate",
          body: "Hit rate is diagnostic; **store utilisation** is the outcome. A 95% hit rate during the quiet hour and 60% during the peak minute averages to a healthy-looking graph and a store that fails every evening.\n\nMeasured in this module's canvas, the same design and the same traffic: with no cache the store sits at **240%** and 58% of requests fail; with a 90% hit rate it sits at **24%** and nothing fails. Three numbers, one decision — and only the third one is a criterion.",
        },
        {
          kind: "your_turn",
          prompt:
            "At 12,000 requests per second with 95% reads, what hit rate do you need to keep a 5,000 r/s store under 70%? Show the arithmetic, then say what you would have to give up to get from 80% to 90%.",
        },
        {
          kind: "compare",
          body: "A beginner adds a cache because the database is slow, then measures nothing. An engineer states the target first: *“the store must stay under 3,500 reads per second, so the hit rate has to be at least 70%, and here is the memory that costs.”*\n\nThe trap is the second-order version of the same mistake: treating a high hit rate as success. A cache at 95% can still fail every evening if the remaining 5% arrives in the same minute, and a cache at 99% has still done nothing for your writes. Hit rate is a cause; store utilisation is the effect.",
        },
        {
          kind: "recap",
          points: [
            "A cache stores answers; it makes the store asked less often, not faster",
            "Hit rate decides everything, and it does not pay linearly — 50% still fails",
            "11,400 reads/s at 90% is 1,140 reaching a 5,000 r/s store",
            "The bills are memory, coherence, a new failure mode and one more hop",
            "Watch store utilisation, not the average hit rate",
            "EVCache's name is the contract: ephemeral, volatile, cache",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "where-to-cache",
      title: "Where a cache can live",
      attribution:
        "Synthesised from MDN's HTTP caching guide, Cloudflare's cache documentation and the EVCache README. The latency figures are the standard teaching ladder, not benchmarks.",
      sources: [
        {
          label: "MDN — HTTP caching",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching",
        },
        {
          label: "Cloudflare — cache documentation",
          url: "https://developers.cloudflare.com/cache/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Five places, five different promises",
          body: "The same read — a title's artwork — can be answered in five places: the member's browser, a CDN edge in their city, the memory of the app process that took the request, a shared cache tier behind the app, or the store's own page cache. They differ by two orders of magnitude in latency, and by much more than that in who is allowed to invalidate them.\n\nSo “add a cache” is not a decision. “Add a cache **here**, because the correctness cost is acceptable and the latency saved is 150 ms” is.",
        },
        {
          kind: "concept",
          title: "The ladder, with who owns each rung",
          body: "| Where | Hits cost | Reach | Invalidated by |\n| --- | --- | --- | --- |\n| Browser | ~0 ms | one member, one device | the member, or a versioned URL |\n| CDN edge | 5–30 ms | everyone in a region | TTL, purge API, versioned path |\n| App process memory | ~0.1 ms | one instance | that instance restarting |\n| Shared tier (EVCache, Redis) | 0.2–1 ms | every instance | your code, on write |\n| Store's buffer pool | µs | the store itself | the store's own policy |\n\nThe two rungs people forget are the ends. Browser caching is free and you do not control it — so it must be driven by headers, not hope. The store's own page cache is real and substantial, which is why “the database is at 100% CPU” and “the database is doing redundant work” are different diagnoses.",
        },
        {
          kind: "concept",
          title: "The rule: as close to the user as correctness allows",
          body: "Distance and control trade against each other. The closer the copy is to the member, the cheaper the hit and the harder the invalidation — a browser you cannot purge, an edge cache you can purge in thirty seconds, a shared tier you can purge in one write.\n\nSo the decision is not “where is fastest”. It is **what is the shortest staleness I can afford, and where can I enforce it?** Artwork with a content hash in the path can live at the edge for a year, because changing the image changes the URL — the cache never needs purging. A member's watch position cannot leave the app tier at all: it changes every few seconds and is wrong for everyone else.",
        },
        {
          kind: "concept",
          title: "Local memory versus a shared tier",
          body: "In-process memory is the fastest cache you can build and the one that hurts most later. Each instance has its own copy, so eight instances hold eight copies, eight times the memory, and eight different answers for the seconds after a write. On a restart, that instance's cache is empty while its neighbours are warm — so a deploy makes a third of your traffic slow at once.\n\nA shared tier fixes all three: one copy, one invalidation, one warm-up. That is why EVCache is a *shared* layer built on memcached rather than a library that keeps answers in the app's heap. The cost is a hop — 0.2 ms in our model, real network time in yours — and one more thing that can be down.\n\nThe honest middle: local memory for immutable reference data (a country list, a feature-flag snapshot), shared tier for anything a member can change.",
        },
        {
          kind: "concept",
          title: "Where the cache sits changes what it can save",
          body: "A cache in front of the store removes **store work**. A cache in front of the app removes **app work, store work and the network** — but only for content it is allowed to hold without knowing who is asking.\n\nThat is the dividing line in a video catalogue: the artwork and the manifest are the same for everyone and belong at the edge; the row “what this member watched, and where they stopped” is personal, changes constantly, and belongs in a shared tier keyed by member. Two kinds of data, two rungs of the ladder, one page.",
        },
        {
          kind: "diagram",
          caption:
            "A shared cache tier between eight stateless app instances and the title store — the shape this module's Build Task asks you to wire",
          graph: {
            nodes: [
              {
                ...defaultNode("client", "client-1", 40, 200),
                label: "Members",
              },
              {
                ...defaultNode("load_balancer", "lb-1", 220, 200),
                label: "Edge",
              },
              {
                ...defaultNode("app_server", "app-1", 400, 120),
                label: "Playback API",
                replicas: 8,
              },
              {
                ...defaultNode("cache", "cache-1", 620, 200),
                label: "EVCache",
              },
              {
                ...defaultNode("database", "db-1", 840, 200),
                label: "Title store",
              },
            ],
            edges: [
              {
                id: "e1",
                from: "client-1",
                to: "lb-1",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e2",
                from: "lb-1",
                to: "app-1",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e3",
                from: "app-1",
                to: "cache-1",
                label: "reads",
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e4",
                from: "cache-1",
                to: "db-1",
                label: "misses",
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
            ],
            scenario: {
              arrivalRate: 12_000,
              writeShare: 0.05,
              mediaShare: 0,
              bytesPerMediaRequest: 2_000_000,
              abusiveShare: 0,
              latencyJitterMs: 0,
              cacheColdStart: false,
              replicaLagMs: 0,
            },
          },
        },
        {
          kind: "your_turn",
          prompt:
            "Name three things this platform serves that belong at the CDN edge and three that belong in a shared tier. For each, say which field of the response would have to be in the cache key, and what would make the entry wrong.",
        },
        {
          kind: "compare",
          body: "A beginner answers “Redis” to the question “where should the cache live”, because that is the tool they have seen. An engineer answers with the staleness budget first: *“artwork can be an hour old, so it goes to the edge with a hashed path; watch position must be right within a second, so it goes in a shared tier with a key per member.”*\n\nThe trap is caching at the edge what only exists per member. A CDN that ignores `Authorization` and caches a personalised response serves one member's watch history to another — the most expensive cache bug there is, and it is a configuration mistake rather than a code one.",
        },
        {
          kind: "recap",
          points: [
            "Five rungs: browser, edge, process memory, shared tier, the store's own cache",
            "Latency and purgability trade against each other — pick by staleness budget",
            "Local memory is fastest and multiplies copies by instance count",
            "A shared tier buys one copy and one invalidation for one hop of latency",
            "A cache before the store saves the store; a cache before the app saves the network too",
            "Never cache a personalised response at a shared rung without a key that includes the member",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "cache-aside",
      title: "Cache-aside",
      attribution:
        "Synthesised from the AWS Builders' Library on caching and the system-design-primer's caching section. The two-writer race is the textbook sequence; the arithmetic reuses this module's 12,000 r/s model.",
      sources: [
        {
          label: "AWS Builders' Library — caching challenges and strategies",
          url: "https://aws.amazon.com/builders-library/caching-challenges-and-strategies/",
        },
        {
          label: "system-design-primer — caching",
          url: "https://github.com/donnemartin/system-design-primer",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The default has no name in most codebases",
          body: "Ask a team what caching strategy they use and the honest answer is often “the one where we check the cache first”. That is cache-aside, and it is the default for a reason: the application owns the logic, the cache stays a dumb key-value store, and a cache outage degrades you to a slow system rather than a broken one.\n\nIt is also the pattern that hides two races, both of which need a decision rather than a library.",
        },
        {
          kind: "concept",
          title: "The read path, in four lines",
          body: "```\nvalue = cache.get(key)\nif value is None:                      # miss\n    value = db.query(...)              # 2 ms in our model\n    cache.set(key, value, ttl=60s)     # 0.2 ms\nreturn value\n```\n\nThe cache is filled **on demand**: only keys somebody actually asked for are stored, which is why cache-aside is often called lazy loading. Memory goes to the working set rather than to everything that exists.\n\nThe arithmetic is the module's first lesson: at 12,000 requests per second with 90% of reads served from the cache, the store answers 1,140 reads instead of 11,400. The 10% of reads that miss cost a store round trip *and* a cache write, so misses are the expensive path on both sides — which is why the next lessons are about reducing them.",
        },
        {
          kind: "concept",
          title: "The write path: delete, do not update",
          body: "```\ndb.update(...)          # source of truth first\ncache.delete(key)       # then drop the copy\n```\n\nUpdating the cache instead of deleting it looks more efficient and is a classic bug. Two writers, one key:\n\n| Step | Writer A | Writer B | Cache |\n| --- | --- | --- | --- |\n| 1 | writes `v1` to db | | |\n| 2 | | writes `v2` to db | |\n| 3 | | sets cache = `v2` | `v2` |\n| 4 | sets cache = `v1` | | **`v1` — wrong, and it persists** |\n\nDeleting avoids it: whichever order the deletes happen, the next read repopulates from the store and gets `v2`. A delete is idempotent and order-independent; an update is neither.\n\nThe second reason is simpler: a delete cannot write a value that is already stale by the time the write completes.",
        },
        {
          kind: "concept",
          title: "The race delete does not fix",
          body: "There is still a window. A reader misses, reads `v1` from the store, and — before it sets the cache — a writer commits `v2` and deletes the key. The reader then sets `v1`, and the cache now holds a value that is wrong until the TTL expires.\n\n| Step | Reader | Writer | Cache |\n| --- | --- | --- | --- |\n| 1 | miss, reads `v1` | | empty |\n| 2 | | writes `v2`, deletes key | empty |\n| 3 | sets `v1` | | **`v1`** |\n\nThree honest responses:\n\n- **Accept it.** With a 60-second TTL the error is bounded, and most products cannot tell. Say so out loud rather than discovering it later.\n- **Shorten the window.** Delay the delete by a few hundred milliseconds after the write, so a slow reader's set lands before the delete.\n- **Version the key.** Include the row's version or `updated_at` in the key, so a stale value is written under an address nobody will read again.\n\nThe versioned key is the only one that is actually correct, and it costs you a read of the version before you can build the key. That trade is the lesson.",
        },
        {
          kind: "concept",
          title: "What cache-aside cannot do",
          body: "It cannot help writes. Every write goes to the store at full rate — 600 per second in our model, and 8 ms each rather than 2 ms for a read. A read cache in front of a write-bound system is decoration.\n\nIt also cannot protect you from a cold cache: when the tier is empty, every concurrent request misses at once and they all go to the store together. That single sentence is the stampede lesson, and cache-aside is the pattern that produces it most reliably.",
        },
        {
          kind: "video",
          videoId: "mzZ62duH20o",
          title:
            "System Design Basics in Bangla | Caching Strategies Explained (Read & Write Strategies)",
          caption:
            "A Bangla walkthrough of the read and write strategies in this group — useful as a second pass after you have done the arithmetic yourself.",
        },
        {
          kind: "your_turn",
          prompt:
            "A read misses, loads from the store, and is about to write the cache when a writer commits a new value. Draw the sequence and name the value the cache ends up with. Then pick the mitigation you would ship for a title's artwork, and justify it with a staleness budget.",
        },
        {
          kind: "compare",
          body: "A beginner implements get-set and calls it done. An engineer implements get-set, then writes down what may be stale and for how long — because the unavoidable requirements of this pattern are a TTL and an answer to the two-writer race.\n\nThe trap is updating the cache on write because it feels efficient. It is the one variant that can permanently corrupt a key: a lost update written into the cache outlives the request that caused it, and no TTL shorter than your patience will save you.",
        },
        {
          kind: "recap",
          points: [
            "Cache-aside: read the cache, on miss load from the store and set",
            "The app owns the logic, so a cache outage degrades rather than breaks you",
            "Delete the key on write — never update it, because updates can arrive out of order",
            "The reader's late `set` is the race that survives deletion; version the key or bound it with TTL",
            "It does nothing for writes, and it is the pattern that creates stampedes",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "write-through-and-behind",
      title: "Write-through and write-behind",
      attribution:
        "Synthesised from the EVCache README (volatility as a stated property), the AWS Builders' Library and the system-design-primer's write strategies. The latency comparison uses this module's node model: 2 ms read, 8 ms write, 0.2 ms cache.",
      sources: [
        {
          label: "Netflix EVCache — Ephemeral, Volatile, Cache",
          url: "https://github.com/Netflix/EVCache",
        },
        {
          label: "AWS Builders' Library — caching challenges and strategies",
          url: "https://aws.amazon.com/builders-library/caching-challenges-and-strategies/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The write that waits for two systems",
          body: "Our store charges 8 ms for a write and the cache charges 0.2 ms. Cache-aside sends every write to the store and then deletes the copy, so the member waits for 8 ms and the cache is empty afterwards.\n\nThe two write-side patterns trade that wait against something else. Write-through makes the cache part of the write path: both systems are updated before the response. Write-behind makes the cache the write path: the member is acknowledged by the cache, and the store catches up later.\n\nOne of those is a cache. The other is a queue wearing a cache's interface, and the difference matters when something dies.",
        },
        {
          kind: "concept",
          title: "Write-through: pay now, read fresh",
          body: "```\nwrite-through:  cache.set(key, v)  +  db.write(v)   → ack\n                2 systems, 0 empty windows\n```\n\nThe property you buy is that the cache is never empty for a value that exists: the next read is a hit, not a miss against a store that has just been written. For hot keys that change constantly — a live score, a like counter — that removes a burst of misses after every write.\n\nThe bills are concrete. Every write now costs cache time plus store time, so write latency rises by the cache's share (small: 0.2 ms against 8 ms) and, more importantly, **write availability becomes the intersection of both systems**. If the cache is down, do you fail the write? If you fall back to store-only, you have cache-aside with extra steps. Teams usually choose the fallback and call it write-through, which is honest as long as the doc says so.",
        },
        {
          kind: "concept",
          title: "Write-behind: acknowledge first, persist later",
          body: "```\nwrite-behind:   cache.set(key, v)  → ack (0.2 ms)\n                …later…             db.write(v) (8 ms)\n```\n\nNow the member waits for 0.2 ms instead of 8 ms, and the store sees writes in batches instead of one at a time. At 600 writes per second that is the difference between a store doing 600 single-row writes and one doing a handful of batched ones — a real and large win.\n\nThe price is stated in EVCache's own name. If the cache is *volatile* — “the data can disappear any time” — then a queue that lives inside it can disappear too. Everything acknowledged and not yet flushed is data you promised a member you had, and no longer do.\n\nSo the rule is not “write-behind is faster”. It is: **write-behind is safe exactly when losing the last N seconds of writes is a fact you can say to a customer.** View counts, “last seen”, playback telemetry: yes. A payment, a subscription change, a password: never. Netflix's migration post says the last system to leave the data centre was billing, for exactly this reason — money moves only where durability is guaranteed.",
        },
        {
          kind: "concept",
          title: "The comparison, in one table",
          body: "| Pattern | Write latency | Read after write | Data loss window | Good for |\n| --- | --- | --- | --- | --- |\n| Cache-aside | store only (8 ms) | a miss | none | most reads; the default |\n| Write-through | cache + store | a hit | none | hot keys that change often |\n| Write-behind | cache only (0.2 ms) | a hit | until flush | counters, telemetry, activity |\n| Read-through | n/a | a hit or a load | none | hiding the load path from app code |\n\nRead-through is the odd entry: the cache itself loads on a miss instead of the app. It simplifies the caller and couples the cache to your schema, which is why teams with many services tend to avoid it — the cache becomes another place that knows how to query the database.",
        },
        {
          kind: "concept",
          title: "Choosing by what breaks",
          body: "Ask three questions in order. **Can a member see a stale value?** If no, write-through. **Can we lose the last few seconds?** If no, cache-aside or write-through. **Is the store the bottleneck on writes?** If no, write-behind buys you nothing you need.\n\nThat order matters because it starts from failure rather than speed. Write-behind is the pattern people reach for first, because it has the best number in the table, and it is the only one in the table that can lose data.",
        },
        {
          kind: "your_turn",
          prompt:
            "Classify these four writes and pick a pattern for each: a title's artwork URL, a playback position, a “liked” count, and a plan change. For one of them, write the sentence you would put in the design doc explaining the data you are willing to lose.",
        },
        {
          kind: "compare",
          body: "A beginner picks write-behind because 0.2 ms beats 8 ms. An engineer picks it for the counters and refuses it for anything a support ticket could be written about.\n\nThe trap is the mixed system nobody documented: write-through for some keys, write-behind for others, cache-aside for the rest, with no record of which key has which guarantee. Six months later an incident review asks “could we have lost this?” and the answer takes a day to establish. Write the guarantee next to the key, in the same file.",
        },
        {
          kind: "recap",
          points: [
            "Write-through updates cache and store before acknowledging: fresh reads, coupled availability",
            "Write-behind acknowledges the cache and flushes later: 0.2 ms instead of 8 ms",
            "Write-behind is a queue — and EVCache's “volatile” is the warning label",
            "Safe for counters and telemetry, never for money, credentials or entitlements",
            "Read-through moves the load path into the cache; that couples it to your schema",
            "Choose by what you may lose, then by latency",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "refresh-ahead",
      title: "Refresh ahead",
      attribution:
        "Synthesised from the AWS Builders' Library and the system-design-primer's caching section. The refresh arithmetic is this module's teaching model; the working-set argument is standard.",
      sources: [
        {
          label: "AWS Builders' Library — caching challenges and strategies",
          url: "https://aws.amazon.com/builders-library/caching-challenges-and-strategies/",
        },
        {
          label: "system-design-primer — caching",
          url: "https://github.com/donnemartin/system-design-primer",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The key that is read ten thousand times a second",
          body: "Most keys can expire quietly. A few cannot: the top-ten row, the manifest for the title everybody is watching tonight, the front page of the catalogue. At 12,000 requests per second, a key that serves 30% of traffic is read 3,600 times a second — and when it expires, every one of those readers becomes a miss at the same instant.\n\nRefresh-ahead is the answer to that specific shape: instead of waiting for expiry, refresh the entry **before** it expires, in the background, so a hot key never misses.",
        },
        {
          kind: "concept",
          title:
            "The rule: refresh when the remaining TTL is shorter than the reload",
          body: "A refresh-ahead policy needs one comparison:\n\n```\nif remaining_ttl < expected_reload_time × safety_factor:\n    trigger background reload\n    keep serving the current value\n```\n\nWith a 60-second TTL, a 20 ms reload and a safety factor of 5, you refresh at 100 ms before expiry. The safety factor exists because the reload is not the only cost: you need the refresh to finish before the entry dies, and the entry can be read hundreds of times in that window.\n\nThe first reader near the threshold triggers the reload; every other reader keeps getting the current value until the new one lands. That is the whole mechanism — one background job per key per window, not one per request.",
        },
        {
          kind: "concept",
          title: "What it costs: work on keys nobody reads",
          body: "Refresh-ahead is a prediction, and predictions are wrong in a specific direction: it refreshes things that are about to become cold.\n\nAt 12,000 requests per second and a 60-second TTL, a cache holding 100,000 keys will refresh 100,000 ÷ 60 ≈ **1,667 keys per second** if every key is refreshed once per TTL. If only 10% of those keys are read again before expiring, you have bought 1,500 pointless store reads per second — 30% of a 5,000 r/s store — to protect the 10% that mattered.\n\nSo refresh-ahead is only defensible when you can identify the hot set: top-N lists, a featured catalogue, a manifest referenced by a live event. Applied to all keys it is a machine for converting cache misses into scheduled load.",
        },
        {
          kind: "concept",
          title: "The hot set is not a guess — measure it",
          body: "Every shared cache can tell you its access distribution: keys per second, and how often each key is read. The shape is almost always skewed — a small share of keys serving most reads — which is what makes both caching and refresh-ahead work.\n\nThe practical version: keep a per-key read counter for one hour, and enable refresh-ahead for keys above a threshold (say, more than one read per second). Everything else keeps a plain TTL. This is a policy in your cache client, not a rewrite — and it is auditable in a way that “we refresh the popular stuff” is not.",
        },
        {
          kind: "concept",
          title: "How it differs from stale-while-revalidate",
          body: "They are cousins with different failure behaviour. Refresh-ahead refreshes **before** expiry, so a reader never sees stale data that the system knew was stale. Stale-while-revalidate refreshes **after** expiry, serving the old value while it loads — so a reader can receive data the system already considered expired.\n\nRefresh-ahead fails by doing useless work. Stale-while-revalidate fails by serving provably stale data. For a catalogue page the second is fine; for a member's entitlement it is not. The HTTP `stale-while-revalidate` directive is the same trade expressed to a CDN, and it is the reason the two names show up together in caching discussions.",
        },
        {
          kind: "your_turn",
          prompt:
            "A key serves 30% of 12,000 requests per second with a 60-second TTL and a 20 ms reload. Compute how many store reads per second you save by refreshing it ahead, and how much extra work you add if 20% of the refreshed keys are never read again.",
        },
        {
          kind: "compare",
          body: "A beginner sets a TTL and accepts the miss. An engineer separates the two populations — the handful of keys that carry most of the traffic, and everything else — and spends refresh work only on the first.\n\nThe trap is applying it globally because it is a config flag. A blanket refresh-ahead policy on 100,000 keys is a scheduled load generator that fires whether or not anybody is watching, and it looks like diligence in a design review.",
        },
        {
          kind: "recap",
          points: [
            "Refresh before expiry, in the background, so a hot key never misses",
            "Trigger when remaining TTL is shorter than the reload times a safety factor",
            "One reload per key per window — every other reader keeps the current value",
            "Blanket refresh-ahead is scheduled load; apply it to a measured hot set",
            "Refresh-ahead wastes work; stale-while-revalidate serves provably stale data",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "cache-keys-and-cardinality",
      title: "Keys and cardinality",
      attribution:
        "Synthesised from the Cloudflare cache documentation and MDN's Cache-Control reference. The memory arithmetic is this module's teaching model.",
      sources: [
        {
          label: "Cloudflare — Cache-Control and cache keys",
          url: "https://developers.cloudflare.com/cache/concepts/cache-control/",
        },
        {
          label: "MDN — Cache-Control header",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "One field in the key, half the hit rate",
          body: "The catalogue page was caching beautifully at 92%. Then someone added “recommended for you” to the response. The cache key did not change, so every member started seeing the first member's recommendations — and the fix, keying by member id, took the same page from 92% to almost nothing: 80 million members cannot share a cache entry.\n\nThat is cardinality: the number of distinct keys your key function produces. It is the least glamorous and most decisive part of caching, because it sets the memory bill and the hit rate before any TTL or eviction policy is considered.",
        },
        {
          kind: "concept",
          title:
            "The key must contain everything that changes the answer — and nothing else",
          body: "A cache key is a claim: *these two requests would have received the same bytes*. Get it wrong in one direction and you serve wrong data. Wrong in the other direction and you never hit.\n\nFor an HTTP response that means: path, the query parameters that change the representation, the `Accept-Encoding` you actually vary on, and any personalisation. Not the member's session cookie if the response is public; not a tracking parameter (`utm_source`) that changes nothing.\n\nTwo rules that catch most bugs:\n\n- **Normalise before hashing.** Sort query parameters, drop tracking ones, lowercase the host. `?b=2&a=1` and `?a=1&b=2` are the same resource and must be the same key.\n- **Never build a key from a raw request.** `Authorization` headers, cookies and user agents leak into keys and produce cardinality explosions that look like cache misses.",
        },
        {
          kind: "concept",
          title: "Cardinality sets the memory bill",
          body: "```\nmemory = distinct keys × bytes per entry × overhead\noverhead ≈ 1.3× for key bytes, pointers and allocator slack\n```\n\n| Key function | Distinct keys | At 2 KB | Fits a 64 GB tier? |\n| --- | --- | --- | --- |\n| per title | 20,000 | 40 MB | easily |\n| per title × locale (30) | 600,000 | 1.2 GB | yes |\n| per title × locale × device | 1,800,000 | 3.6 GB | yes |\n| per member | 80,000,000 | 160 GB | **no** |\n| per member × title | 1.6 × 10¹² | 3.2 PB | no, and not close |\n\nThe last two rows are the whole argument. Personalisation is not a caching problem you can buy memory for; it is a problem you solve by caching the *pieces* (the title metadata, shared by everyone) and assembling the personalised page from them.",
        },
        {
          kind: "concept",
          title: "What happens when the working set does not fit",
          body: "If 160 GB of keys compete for 64 GB, the cache does not degrade gracefully — it thrashes. Entries are evicted before they are read again, so the hit rate falls toward zero while the store absorbs the full load, and the cache has become a very expensive network hop.\n\nThis is why “the cache is full” is not a capacity incident in the usual sense. At 90% memory you are one traffic shift away from a policy that evicts the hot keys to make room for cold ones. The signal to watch is not memory — it is **hit rate falling while request volume is flat**.",
        },
        {
          kind: "concept",
          title: "The two-way fix: shrink the key or shrink the value",
          body: "Shrink the key space: cache the shared object (title metadata), not the composed page. Cache by *segment* (`title:1234:artwork`) rather than by member. Let the app assemble.\n\nShrink the value: store the ids and render the chrome, compress, or split a large object into the fields that are read together. A 40 KB page cached 80 million times is a different product from a 2 KB record cached 20,000 times.\n\nBoth are design changes, and both are cheaper than the third option, which is buying enough RAM to cache one copy per member — the option that also makes every write invalidate a key nobody else was going to read.",
        },
        {
          kind: "your_turn",
          prompt:
            "Take a page you have built recently. List every input that changes its bytes, then mark each one as “belongs in the key”, “belongs in a Vary header”, or “should not change the response at all”. Compute the cardinality, and say whether it fits a 64 GB tier.",
        },
        {
          kind: "compare",
          body: "A beginner thinks of the key as an implementation detail — a string with a colon in it. An engineer treats it as the cache's schema: it decides correctness, memory and hit rate at once, and changing it later invalidates every entry silently.\n\nThe trap is the cache key that omits a variant. It does not fail loudly: it serves one member's locale, currency or entitlement to another, and the bug is reported as “the site showed me the wrong price” — a sentence that takes a week to trace back to a string concatenation.",
        },
        {
          kind: "recap",
          points: [
            "The key claims two requests are the same response — it must be exactly right",
            "Include every field that changes the answer; normalise and drop tracking parameters",
            "Cardinality sets both the memory bill and the ceiling on hit rate",
            "Per-member keys do not fit in memory, and buying more RAM is not the fix",
            "Cache the shared pieces and assemble personalised pages in the app",
            "The warning sign is hit rate falling at flat traffic, not memory at 90%",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "ttl-and-eviction",
      title: "TTL and eviction",
      attribution:
        "Synthesised from the Redis eviction documentation and the standard treatment of cache replacement policies. The memory arithmetic reuses this module's model.",
      sources: [
        {
          label: "Redis — eviction policies and maxmemory",
          url: "https://redis.io/docs/latest/develop/reference/eviction/",
        },
        {
          label: "Wikipedia — cache replacement policies",
          url: "https://en.wikipedia.org/wiki/Cache_replacement_policies",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Two mechanisms, two different jobs",
          body: "TTL and eviction are constantly confused, and the confusion produces real incidents. TTL answers *“how wrong may this entry be?”* — a correctness budget. Eviction answers *“what do I throw away when memory is full?”* — a capacity policy.\n\nA cache with a TTL and no eviction policy runs out of memory. A cache with an eviction policy and no TTL serves the same stale entry for a month. You need both, and each one needs a number chosen by a person.",
        },
        {
          kind: "concept",
          title: "TTL is a staleness ceiling, not a freshness guarantee",
          body: "A 60-second TTL does not mean the entry is 60 seconds old at worst. It means the entry **dies** 60 seconds after it was written — so a value written at T and read at T+59 is 59 seconds old, and a value read at T+61 is a miss.\n\nThe distinction matters because people write “cache for 60s” and believe they have promised freshness. They have promised an upper bound on staleness, which is the useful thing, and only if the clock starts when the value was read from the source. Cache a value that was already 40 seconds stale in the store and your ceiling is 100 seconds.\n\nTTL also lowers coverage: 1,667 of 100,000 entries expire every second at 60 seconds, so a meaningful share of your cache is always being refilled, whether or not that is when the traffic arrives.",
        },
        {
          kind: "concept",
          title: "Eviction policies, and what each one assumes",
          body: "| Policy | Evicts | Assumes | Weakness |\n| --- | --- | --- | --- |\n| LRU | least recently used | recency predicts reuse | a scan through cold keys flushes the hot set |\n| LFU | least frequently used | frequency predicts reuse | old popularity never decays |\n| FIFO | oldest written | age is the only signal | ignores how often it was read |\n| Random | a random entry | no pattern | wastes the information you have |\n\nLRU is the default for good reasons, and it has one spectacular failure: a batch job that reads a million distinct keys once will evict everything the members were using. LFU would resist that, because those keys are read once — but LFU needs a decay rule, or a key that was hot during a launch stays hot forever.\n\nRedis exposes the choice directly (`allkeys-lru`, `allkeys-lfu`, `volatile-ttl`). The honest default is approximate LRU: exact LRU mutates a list on every read, which is a lot of work at 12,000 requests per second.",
        },
        {
          kind: "concept",
          title: "The memory arithmetic that decides everything",
          body: "```\nentries that fit = memory ÷ (entry size × overhead)\n```\n\nA 64 GB tier with 2 KB entries and 30% overhead holds roughly **23 million** entries. Our catalogue needs 20,000 for titles and 600,000 with locales — both trivial. A per-member key space of 80 million does not fit at all, which is the previous lesson's conclusion arriving as a number.\n\nThe useful habit is to compute this **before** choosing a TTL, because the TTL and the entry count multiply into the refresh rate: 23 million entries at 60 seconds is 380,000 store reads per second of refresh traffic if the whole set is live. No store survives that. Real caches run at a fraction of their theoretical fill because the working set is smaller than the key space — and knowing which of the two you have is the difference between a design and a hope.",
        },
        {
          kind: "concept",
          title: "Choosing a TTL in public",
          body: "The defensible sentence is: *“artwork may be five minutes stale, because the ingest pipeline publishes a new URL with a new content hash and the old URL keeps working; watch position may be one second stale, because the member can see the difference when they resume.”*\n\nThat sentence names the data, the bound, and why the bound is safe. It is the only form of TTL choice that survives a review, because a reviewer can disagree with the reason instead of the number.\n\nA TTL with no stated reason gets shortened by whoever was paged last, and shortened TTLs are how a cache quietly stops being one: at 5 seconds, 1,667 expiries per second becomes 20,000.",
        },
        {
          kind: "your_turn",
          prompt:
            "Your tier holds 64 GB, entries are 2 KB with 30% overhead, and the key space is 5 million. Compute how many entries fit, what fraction of the key space that is, and what TTL you would pick for a value that may be five minutes stale — with the sentence you would put in the design doc.",
        },
        {
          kind: "compare",
          body: "A beginner sets `ttl=3600` to be safe and lets the cache fill. An engineer computes entries-that-fit against keys-that-exist, states a staleness budget per data type, and picks a policy knowing which workload will break it.\n\nThe trap is treating eviction as the safety net for a TTL mistake. Eviction protects memory; it says nothing about truth. A cache that evicts correctly still serves a six-hour-old entitlement if the TTL was six hours, and the incident will be filed as a caching bug when it was a policy bug.",
        },
        {
          kind: "recap",
          points: [
            "TTL bounds staleness; eviction bounds memory — they are not substitutes",
            "A TTL starts when the value was written, so an already-stale value sets a worse ceiling",
            "LRU's failure mode is a scan; LFU's is popularity that never decays",
            "entries that fit = memory ÷ (entry size × overhead) — compute it before picking a TTL",
            "Entry count × refresh rate is the load your TTL imposes on the store",
            "Every TTL needs a sentence a reviewer can disagree with",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "invalidation",
      title: "Invalidation",
      attribution:
        "Synthesised from Martin Fowler's note on the two hard things, MDN's HTTP caching guide, and the EVCache README's definition of ephemeral storage. The per-second costs use this module's 12,000 r/s model.",
      sources: [
        {
          label: "Martin Fowler — TwoHardThings",
          url: "https://martinfowler.com/bliki/TwoHardThings.html",
        },
        {
          label: "MDN — HTTP caching",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The joke is about this lesson",
          body: "“There are only two hard things in computer science: cache invalidation and naming things.” The joke survives because invalidation is not a mechanism you add — it is a **contract** between two systems that do not share a clock.\n\nThe store commits a change at time T. The cache holds a copy written at T−30. Nothing in either system knows the other exists unless you build the link. Every strategy below is a different answer to “who tells whom, and what happens if the message is late?”",
        },
        {
          kind: "concept",
          title: "1. Delete on write",
          body: "The cheapest mechanism, and the default: after committing, delete the key.\n\n```\n600 writes/s × 1 key each → 600 deletes/s\n```\n\nAt 0.2 ms per delete that is trivial work. The real cost is what happens **next**: each deleted key will be re-read from the store by the next request that wants it. If the deleted keys are hot, you have converted cache hits into store reads at exactly the moment the store is busy.\n\n```\n600 deletes/s × 3 reads per key before the next write\n  → 1,800 extra store reads/s = 36% of a 5,000 r/s store\n```\n\nSo “cheap to invalidate” and “cheap to invalidate often” are different claims. Invalidate the composed page and you pay for every component; invalidate the component and the page assembles itself from hits.",
        },
        {
          kind: "concept",
          title: "2. Version the key",
          body: "Put the row's version in the address: `title:1234:v42`. A write bumps the version, and the old entry becomes unreachable — no delete needed, and no race, because a slow reader writing `v41` writes to an address nobody will read again.\n\nThe costs: you need the version before you can build the key (often a second read, cheap if it is itself cached), old versions occupy memory until evicted, and anything holding a key string must be able to re-derive it. In exchange you get the only invalidation strategy that is correct without timing assumptions.\n\nThis is also what content-hashed asset URLs do at the CDN: a new build changes the filename, so nothing needs purging and the old file expires on its own.",
        },
        {
          kind: "concept",
          title: "3. Publish an invalidation event",
          body: "The writing service publishes `title.updated:1234` to a bus; every cache instance subscribes and deletes locally. This is what a shared tier gives you for free — one delete covers every instance — and what local caches need a broadcast for.\n\nThe failure modes are the interesting part. A lost event means a stale entry that lives until TTL. An out-of-order pair of events means the older one wins. A subscriber that starts after the event exists knows nothing. That is why every event-driven invalidation scheme still carries a TTL: the TTL is not a strategy, it is the **backstop that makes a missed message survivable**.",
        },
        {
          kind: "concept",
          title: "4. Accept the TTL",
          body: "Some data does not need invalidation at all: the daily top-ten, a country list, a release manifest. The value is derived, the derivation runs on a schedule, and a few minutes of lag is not a defect but the product.\n\nThe test is a sentence: *“if a member sees yesterday's top ten for three more minutes, nothing bad happens.”* If you can say that sentence about a field, use a TTL and delete no code. If you cannot, use one of the three mechanisms above and write down the backstop.\n\nThe failure here is not technical. Teams that cannot make the distinction end up invalidating everything on every write, at which point the cache is a store-shaped network hop — the most expensive possible way to have no cache.",
        },
        {
          kind: "concept",
          title: "The question that settles it",
          body: "*What is the worst thing that happens if this is 60 seconds out of date, and who finds out?* A price someone is charged: unacceptable. A like count: invisible. A member's entitlement: contract-breaking. A recommendation: forgettable.\n\nAnswer that per field, not per service. One API response usually mixes all four, which is why invalidation is a data-modelling problem wearing a caching costume — and why the cache key design and the invalidation plan are always the same conversation.",
        },
        {
          kind: "your_turn",
          prompt:
            "For a title page that includes artwork, a like count, an entitlement flag and a recommendation list: assign each field an invalidation mechanism and a TTL. Then compute the extra store reads per second if 600 writes per second each invalidate three composed pages.",
        },
        {
          kind: "compare",
          body: "A beginner deletes the whole page key on every write and calls invalidation solved. An engineer invalidates the smallest thing that changed, keeps a TTL as the backstop, and can name the worst-case staleness for each field.\n\nThe trap is believing the cache is consistent because you invalidate. Every mechanism here has a window — a lost event, a late delete, a reader that set a stale value — and the only honest design question is how long the window is and who is exposed to it.",
        },
        {
          kind: "recap",
          points: [
            "Invalidation is a contract between two systems with no shared clock",
            "Delete-on-write is cheap; the re-read it causes is not",
            "Versioned keys are the only strategy that needs no timing assumption",
            "Event-driven invalidation still needs a TTL, because events get lost",
            "Some data is derived — for it a TTL is the whole strategy, not a fallback",
            "Ask what happens if this is 60 seconds old, per field, in writing",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "cache-stampede",
      title: "The stampede",
      attribution:
        "Synthesised from the Wikipedia entries on cache stampede and the thundering herd problem, and the AWS Builders' Library. The numbers are this module's teaching model.",
      sources: [
        {
          label: "Wikipedia — cache stampede",
          url: "https://en.wikipedia.org/wiki/Cache_stampede",
        },
        {
          label: "Wikipedia — thundering herd problem",
          url: "https://en.wikipedia.org/wiki/Thundering_herd_problem",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "One expiry, one second, a dead store",
          body: "A key serves 30% of 12,000 requests per second — 3,600 reads a second — with a 60-second TTL. At the expiry instant, every in-flight reader misses at once.\n\nThat is not 3,600 misses spread over a second in an orderly line. They are concurrent requests that all found the same empty key, so they all start the same store query at once. The store's ceiling is 5,000 requests per second, and 3,600 of them are asking the identical question.\n\nThis is the stampede, sometimes called the thundering herd: the cache stops distributing load for exactly one instant, and the store receives the traffic the cache was built to absorb.",
        },
        {
          kind: "concept",
          title: "Why it is a cliff and not a slope",
          body: "A miss rate of 10% is survivable. A miss **event** of 100% for 50 milliseconds is not, because the store does not have a queue sized for it and its latency rises as it saturates — which lengthens the window during which the key is still missing, which brings more misses. The feedback loop is the danger, not the peak.\n\nThe same shape appears without a TTL: a cache node restarts, a deploy empties an in-process cache, a new key becomes hot because a trailer dropped. TTL is just the scheduled version.",
        },
        {
          kind: "concept",
          title: "Fix 1: single-flight (one loader per key)",
          body: "Only one request per key is allowed to touch the store; the others wait for its result, or are served a stale value.\n\n```\nmiss → acquire lock(key)\n         ├─ won:  load from store, set, release, return\n         └─ lost: wait for the winner's value (≤ reload time)\n```\n\nThe result is that a stampede of 3,600 becomes **one** store query and 3,599 waiters. The cost is a lock per key and a bound on how long a waiter waits — because if the loader dies, the waiters must not die with it. That bound is why single-flight is usually implemented with a short lock TTL, not a held mutex.\n\nEvery cache client worth using has this primitive, under names like `singleflight`, `request coalescing`, or `cache locking`. Using it is a flag; forgetting it is an outage.",
        },
        {
          kind: "concept",
          title: "Fix 2: jittered expiry",
          body: "Keys written together expire together. A batch job that warms 100,000 entries at 09:00 creates 100,000 simultaneous expiries at 09:01, and no lock saves you from 100,000 keys each needing one load.\n\nAdd a random offset to every TTL — 60 seconds ± 10% — and the same 100,000 expiries spread over 12 seconds, which is 8,333 per second spread across many keys. That is a load increase, not an event.\n\nThe offset must be random per write, not per key: a deterministic jitter (hash of the key) spreads keys relative to each other but still fires in lockstep when the same batch is written again.",
        },
        {
          kind: "concept",
          title: "Fix 3: serve stale while one process refreshes",
          body: "Keep the value slightly past its expiry and mark it stale. Readers get the stale value immediately; one reader refreshes. The member sees data that is one reload older than promised, and the store sees one query.\n\nThis is `stale-while-revalidate` in HTTP, and it is the best default for catalogue-style data because it removes the wait entirely rather than queueing it. It is the wrong default for anything where the stale value is actively dangerous — an entitlement check that says “still subscribed” for an extra reload window is a decision, not a technique.",
        },
        {
          kind: "concept",
          title: "The one thing not to do",
          body: "Retrying the miss makes it worse. A client that retries a failed store read three times during a stampede triples the load at the exact moment the store is saturated, and it is the mechanism that turns a one-second expiry into a ten-minute incident.\n\nIf you cannot implement single-flight today, the cheapest correct mitigation is to **not expire hot keys automatically**: refresh them on a schedule, or hold them until an explicit invalidation arrives. A hot key with no TTL is a policy with a defined failure mode (staleness until invalidated) instead of an undefined one (a synchronized cliff).",
        },
        {
          kind: "your_turn",
          prompt:
            "A key carries 40% of 12,000 requests per second with a 30-second TTL. Work out what the store sees at the expiry instant, then choose two mitigations and state the worst case each one leaves behind.",
        },
        {
          kind: "compare",
          body: "A beginner reads “TTL prevents stale data” and sets one TTL for everything. An engineer reads “TTL schedules a miss”, adds jitter so misses are not simultaneous, and uses single-flight so a shared miss costs one query.\n\nThe trap is sizing the cache for the average and the store for the average too. The stampede is a one-second event; a design that only survives the average has no answer for it, and the incident will look like a database problem when it is a cache-expiry problem.",
        },
        {
          kind: "recap",
          points: [
            "A hot key's expiry sends the traffic the cache was absorbing straight to the store",
            "The danger is the feedback loop: saturation lengthens the miss window",
            "Single-flight turns 3,600 misses into one query and 3,599 waiters",
            "Jittered TTL spreads batch-written entries instead of firing them together",
            "Stale-while-revalidate removes the wait; use it where stale is survivable",
            "Never add retries on the miss path — that is the amplifier",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "cold-start-and-failure-modes",
      title: "Cold starts and failure modes",
      attribution:
        "Synthesised from the AWS Builders' Library, the Redis eviction documentation and the EVCache README's definition of volatile storage. The utilisation figures were measured in this module's canvas.",
      sources: [
        {
          label: "AWS Builders' Library — caching challenges and strategies",
          url: "https://aws.amazon.com/builders-library/caching-challenges-and-strategies/",
        },
        {
          label: "Redis — eviction policies and maxmemory",
          url: "https://redis.io/docs/latest/develop/reference/eviction/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The cache is gone, and it was load-bearing",
          body: "A cache is a copy, so losing it should be harmless. In practice, losing it is the largest load event your store will ever see — every request that was being answered from memory arrives at once, at full rate, with no ramp.\n\nMeasured in this module's canvas: the same design and traffic sits at **24%** store utilisation with the cache and **240%** without it. The cache was absorbing 90% of the reads, which means the store's headroom was never real — it was borrowed.",
        },
        {
          kind: "concept",
          title: "Cold, not down",
          body: "The gentle version: the tier is healthy but empty. A deploy, an eviction storm, a new region. Every request misses until the working set is rebuilt, and the store carries full read load for the minutes that takes.\n\nThe arithmetic is unforgiving because the rebuild rate *is* the arrival rate at first: 11,400 reads per second, every one a miss, until enough keys are warm that the hit rate climbs. If 90% of the traffic touches 5% of the keys, the curve falls steeply — but the first ten seconds are a store at 228%.\n\nMitigations, cheapest first: **cap the fill rate** (serve a degraded response rather than 11,400 store reads), **warm from a snapshot** before taking traffic, **stagger the deploy** so a fraction of instances are cold at a time, and keep hot keys in a smaller persistent tier that survives restarts.",
        },
        {
          kind: "concept",
          title: "The failure modes, in one list",
          body: "| Mode | What the store sees | Why it happens |\n| --- | --- | --- |\n| Cold | full read load while warming | deploy, eviction, new node |\n| Down | full read load immediately | node loss, network partition, deploy |\n| Full | hot keys evicted, hit rate collapses | working set larger than memory |\n| Wrong | no extra load, wrong answers | key too coarse, missed invalidation |\n| Slow | rising concurrency, queueing | saturated cache, network, big values |\n\nFour of those five are load problems on the store; one is a correctness problem that no amount of capacity fixes. The wrong-data mode is the one to design against first, because it is the only one a member experiences as a lie rather than as slowness.",
        },
        {
          kind: "concept",
          title: "Every cache needs a bypass and a ceiling",
          body: "**A bypass** is a switch that stops sending traffic to the cache — used during an incident, or when the cache is returning errors faster than the store would. Without one, a broken cache is a hard dependency you cannot remove at 3 a.m.\n\n**A ceiling** is a limit on how much traffic the store will accept from the cache layer, so that a cache outage degrades latency instead of taking the system down. In practice that is a concurrency limit on the store client, or a queue with a maximum depth: the store sheds excess load in a controlled way rather than falling over and taking every other service with it.\n\nBoth are cheap. Both are usually absent, because in normal operation the cache works and nobody notices they are missing until the night they matter.",
        },
        {
          kind: "concept",
          title: "Design the system that survives its cache",
          body: "The test is a drill, not an opinion: **delete the cache during peak and see what the store does.** In this module's canvas you can do exactly that — remove the cache node from the finished design and watch the store go from 24% to 240% with 58% of requests failing. That number is your real dependency on the copy, and it is the number to put in the design doc.\n\nIf the answer is “the store fails”, then the cache is not an optimisation — it is a tier you have promoted to a hard dependency, and it now needs the operational care of one: redundancy, a warm-up plan, monitoring on hit rate and memory, and a runbook for losing it.\n\nThere is no third option. Either the system works without the cache, at worse latency, or the cache is part of the critical path and must be treated like it.",
        },
        {
          kind: "your_turn",
          prompt:
            "Delete the cache from your finished task design and record the store's utilisation and error rate. Then write the two-line runbook entry for “cache tier unavailable”: what the bypass does, and what the store's ceiling is set to.",
        },
        {
          kind: "compare",
          body: "A beginner treats the cache as an optimisation that cannot hurt. An engineer measures the store without it, gives the cache a bypass, and knows the number at which the store sheds.\n\nThe trap is the cache that silently became the database. It passes every review while it works — latency is good, utilisation is low, the graphs are calm — and the day it restarts, the copy turns out to have been the system of record in everything but name. EVCache's own README calls it volatile; the sentence is a warning about exactly this.",
        },
        {
          kind: "recap",
          points: [
            "A cache outage is the largest load event the store will ever see",
            "Measured here: 24% utilisation with the cache, 240% without it",
            "Cold is slower than down — down is instant, cold is a ramp",
            "Topology and key mistakes return wrong answers, which capacity cannot fix",
            "Every cache needs a bypass and a ceiling on the traffic it can release",
            "If the store cannot survive losing the cache, the cache is a critical dependency",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "How would you add a cache in front of a read-heavy store, and how do you keep it honest?",
    strongAnswer:
      "I would start with the numbers rather than the product: 12,000 requests per second, 95% reads, so 11,400 reads reach a store that does 5,000 — it is at 228% before anything else matters. A shared tier between the app and the store, cache-aside, because it degrades to a slow system rather than a broken one. On write I delete the key instead of updating it, and I accept a bounded staleness window rather than pretending it is zero — if I need correctness without timing assumptions I version the key instead. TTL per data type with a stated reason, jitter so batch-written entries do not expire together, single-flight so one hot key misses once rather than three thousand times. Then I measure the store without the cache, because that number is the real dependency: here it is 240%, which means the cache is a critical tier and needs a bypass and a concurrency ceiling on the store client.",
    trap: "Saying “add Redis” without computing the hit rate needed, and never testing what happens when the cache is empty. The second half of the trap is updating the cache on write instead of deleting the key — it looks more efficient, and it can leave a permanently stale value that no request will ever correct.",
  },
  task: {
    brief:
      "The tier is sized and the store is not: 12,000 requests per second, 95% reads, and the title store is at 240% with 58% of requests failing. Put a cache between the API and the store, wire the read path through it, and get errors to zero without serving a stale title.",
    startGraph: {
      nodes: [
        { ...defaultNode("client", "client-1", 40, 200), label: "Members" },
        { ...defaultNode("load_balancer", "lb-1", 220, 200), label: "Edge" },
        {
          ...defaultNode("app_server", "app-1", 400, 120),
          label: "Playback API",
          replicas: 8,
        },
        { ...defaultNode("database", "db-1", 620, 120), label: "Title store" },
      ],
      edges: [
        {
          id: "e1",
          from: "client-1",
          to: "lb-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e2",
          from: "lb-1",
          to: "app-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e3",
          from: "app-1",
          to: "db-1",
          label: "reads",
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
      scenario: {
        arrivalRate: 12_000,
        writeShare: 0.05,
        mediaShare: 0,
        bytesPerMediaRequest: 2_000_000,
        abusiveShare: 0,
        latencyJitterMs: 0,
        cacheColdStart: false,
        replicaLagMs: 0,
      },
    },
    solutionGraph: {
      nodes: [
        { ...defaultNode("client", "client-1", 40, 200), label: "Members" },
        { ...defaultNode("load_balancer", "lb-1", 220, 200), label: "Edge" },
        {
          ...defaultNode("app_server", "app-1", 400, 120),
          label: "Playback API",
          replicas: 8,
        },
        {
          ...defaultNode("cache", "cache-1", 620, 200),
          label: "EVCache",
          hitRate: 0.9,
          ttlMs: 60_000,
        },
        { ...defaultNode("database", "db-1", 840, 200), label: "Title store" },
      ],
      edges: [
        {
          id: "e1",
          from: "client-1",
          to: "lb-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e2",
          from: "lb-1",
          to: "app-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e3",
          from: "app-1",
          to: "cache-1",
          label: "reads",
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e4",
          from: "cache-1",
          to: "db-1",
          label: "misses",
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
      scenario: {
        arrivalRate: 12_000,
        writeShare: 0.05,
        mediaShare: 0,
        bytesPerMediaRequest: 2_000_000,
        abusiveShare: 0,
        latencyJitterMs: 0,
        cacheColdStart: false,
        replicaLagMs: 0,
      },
    },
    steps: [
      {
        id: "add-cache",
        title: "Add a cache",
        brief:
          "Put a shared cache between the API and the store. A per-instance heap cache would multiply the copy by eight and give you eight different answers.",
        hint: "Look in the Data category of the palette.",
        reveal:
          "Add a Cache node in series: app → cache → store. One copy for every instance, one place to invalidate.",
        check: (g) => {
          const hasCache = g.nodes.some((n) => n.type === "cache");
          return {
            passed: hasCache,
            progress: hasCache ? "✓ Cache added" : "Add a cache node",
          };
        },
      },
      {
        id: "wire-cache",
        title: "Wire the read path through it",
        brief:
          "Every app instance must reach the store through the cache. An app that still connects directly to the store is an app whose reads bypass the cache.",
        hint: "Connect app → cache and cache → store, and remove the direct app → store edge.",
        reveal:
          "The graph should be app → cache → store, with no direct app → database edge left behind. The store's load is then the miss traffic only.",
        check: (g) => {
          const apps = g.nodes.filter((n) => n.type === "app_server");
          const caches = g.nodes.filter((n) => n.type === "cache");
          const dbs = g.nodes.filter((n) => n.type === "database");
          if (apps.length === 0 || caches.length === 0 || dbs.length === 0) {
            return {
              passed: false,
              progress: "Need app servers, a cache, and a database",
            };
          }
          const cacheIds = new Set(caches.map((c) => c.id));
          const dbIds = new Set(dbs.map((d) => d.id));

          const direct = apps.filter((app) =>
            g.edges.some((e) => e.from === app.id && dbIds.has(e.to)),
          );
          if (direct.length > 0) {
            return {
              passed: false,
              progress: `${direct.length} app server(s) still reach the store directly`,
            };
          }

          const wired = apps.filter((app) =>
            g.edges.some((e) => e.from === app.id && cacheIds.has(e.to)),
          );
          if (wired.length < apps.length) {
            return {
              passed: false,
              progress: `${wired.length} of ${apps.length} app servers connected to the cache`,
            };
          }

          const cacheToDb = [...cacheIds].some((id) =>
            g.edges.some((e) => e.from === id && dbIds.has(e.to)),
          );
          if (!cacheToDb) {
            return {
              passed: false,
              progress:
                "Connect the cache to the store — misses have nowhere to go",
            };
          }

          return {
            passed: true,
            progress: `✓ All ${apps.length} app servers read through the cache`,
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "zero-errors",
        label: "Error rate = 0% at 12,000 requests per second",
        required: true,
        explain:
          "The store's ceiling is 5,000 requests per second and 11,400 reads arrive. Without a cache it sheds 58% of the traffic — the previous version of this task could be “passed” while shedding 96%, because it never checked errors at all.",
        assert: (r) => r.valid && r.errorRate === 0,
      },
      {
        id: "fast-reads",
        label: "p95 < 150 ms at 12,000 reads/s",
        required: true,
        explain:
          "With a 90% hit rate most reads are answered in a fraction of a millisecond, so p95 should be a few milliseconds. If it is not, the read path is still going through the store.",
        assert: (r) => r.valid && r.latency.p95 < 150,
      },
      {
        id: "db-headroom",
        label: "Store utilisation < 40%",
        required: true,
        explain:
          "Measured with a 90% hit rate: the store drops from 240% to 24%. The threshold leaves room for a cold cache or a busy minute rather than a design at its ceiling.",
        assert: (r) => {
          const db = r.perNode.find((n) => n.id === "db-1");
          return !!db && db.utilisation < 0.4;
        },
      },
      {
        id: "no-stale-reads",
        label: "0 stale reads",
        required: true,
        explain:
          "A cache must not serve a stale title. Stale reads come from a lagging replica, and a cache does not excuse one — the copy must be of the truth.",
        assert: (r) => (r.errorClasses?.stale ?? 0) === 0,
      },
    ],
  },
  recap: [
    "A cache stores answers: hit rate decides everything and it does not pay linearly",
    "Five rungs from browser to store buffers — choose by staleness budget, not speed",
    "Cache-aside is the default; delete the key on write and never update it",
    "Write-through buys fresh reads, write-behind buys speed at the price of durability",
    "Keys are schema: cardinality sets memory and hit rate before TTLs are considered",
    "TTL bounds staleness, eviction bounds memory — and neither is invalidation",
    "A stampede is a one-second event; single-flight and jitter are the cheap fixes",
    "Measured: 24% store utilisation with the cache, 240% without it",
  ],
  attribution:
    "Synthesised from Netflix's EVCache README, Netflix's account of completing its cloud migration, the AWS Builders' Library on caching, MDN's HTTP caching guide, Cloudflare's cache documentation, Redis's eviction documentation, Martin Fowler's note on the two hard things, the system-design-primer's caching section and the Wikipedia entries on cache stampede, thundering herd and cache replacement policies. Sources are linked per lesson; no source text is reproduced beyond the short quoted definitions of EVCache's own name.",
};

export default module;
