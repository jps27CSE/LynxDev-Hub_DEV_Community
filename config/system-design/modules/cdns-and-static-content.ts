import type { SdEdge, SdGraph, SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

/**
 * Module 11 — CDNs and static content, converted to the leaf model (plan 17,
 * slice B6).
 *
 * **Netflix anchor.** Open Connect, Netflix's own CDN, is the case study
 * because the company that pays for the bytes publishes the scheme:
 *
 *   *"We partner with over a thousand ISPs to localize substantial amounts of
 *   traffic with Open Connect Appliance embedded deployments."*
 *
 *   — `openconnect.netflix.com`
 *
 * Three sentences from that page do this module's work. The appliances are
 * *"provided to qualifying ISP partners at no charge"* — the economics: Netflix
 * pays for the box, the ISP pays for rack space, power and connectivity, and
 * nobody pays transit for bytes that never cross a transit link. *"Each
 * embedded OCA deployment will offload a substantial amount of Netflix content
 * traffic from peering or transport circuits"* — the metric: origin egress
 * avoided, not requests served. And the programme exists to *"deliver our
 * content more efficiently"* — a CDN is the same bytes from a nearer place, not
 * fewer bytes.
 *
 * **The task.** 12,000 requests a second, every one a 2 MB video segment,
 * served by one origin store. Measured on the shipped graphs:
 *
 *   - hit rate 0 → origin at **120%**, **20,001 segments shed** (16.7%),
 *     throughput 10,000 r/s, p95 5.24 ms
 *   - hit rate 0.9 → origin at **12.1%**, zero errors, 12,000 r/s
 *   - hit rate 0.95 (the solution) → origin at **6.1%**, zero errors,
 *     12,000 r/s, p95 3.20 ms
 *
 * **The chain warning is deliberate, and answered here.** `check:system-design` warns that this
 * module's `startGraph` drops the `database` node that module 10's solution had. This canvas is the
 * media path, and terminals are chosen at random: wire a metadata store in as a second terminal and
 * half of every arrival stops being a segment request, so the edge hit rate stops being readable and
 * the lesson's arithmetic no longer describes the graph. The database is not gone from the platform
 * — it is off this canvas, for the same reason module 9 dropped the cache. Module 12 inherits the
 * media path and brings its own failure subject.
 *
 * **One model limitation, stated in the module rather than discovered by the
 * learner.** `effectiveCapacity` has no dimension for bytes: a 12,000-request
 * stream of 2 MB segments costs the origin exactly as much as 12,000 tiny JSON
 * responses. And `SimulationResult.bandwidthMbps` counts bytes delivered to
 * viewers per completed request, so it reads **192,000 Mbit/s at both the 50%
 * and the 95% hit rate** (measured) — a CDN does not reduce what the viewer
 * receives. What falls is the origin's arrival rate, which is the only thing the
 * canvas can grade. Lesson 5 says both out loud, and a test asserts the
 * bandwidth figure is unchanged so an engine change cannot quietly falsify the
 * lesson.
 */

/** Every edge in this module is plain: no retries, no partitions. */
const plain = { attempts: 0, backoffMs: 0, jitter: false } as const;

function wire(
  id: string,
  from: string,
  to: string,
  label: string | null = null,
): SdEdge {
  return { id, from, to, label, retry: { ...plain }, partitioned: false };
}

/**
 * The scenario every graph in this module runs on: 12,000 segment requests a
 * second, 2 MB each. 5% are writes (play events) and every request carries a
 * payload, so the byte arithmetic in lesson 1 is the arithmetic the graph is
 * actually doing.
 */
const scenario = {
  arrivalRate: 12_000,
  writeShare: 0.05,
  mediaShare: 1,
  bytesPerMediaRequest: 2_000_000,
  abusiveShare: 0,
  latencyJitterMs: 0,
  cacheColdStart: false,
  replicaLagMs: 0,
} as const;

/**
 * One door, eight playback instances at 75%, and one origin store that is the
 * only place a segment can come from. The hit rate is the whole exercise.
 */
function graph(hitRate: number): SdGraph {
  return {
    nodes: [
      { ...defaultNode("client", "client-1", 40, 200), label: "Viewers" },
      { ...defaultNode("load_balancer", "lb-1", 220, 200), label: "Edge" },
      {
        ...defaultNode("app_server", "app-1", 400, 200),
        label: "Playback API",
        replicas: 8,
      },
      {
        ...defaultNode("cdn", "cdn-1", 600, 200),
        label: "Open Connect",
        hitRate,
      },
      {
        ...defaultNode("object_store", "origin-1", 820, 200),
        label: "Origin storage",
      },
    ],
    edges: [
      wire("e1", "client-1", "lb-1"),
      wire("e2", "lb-1", "app-1"),
      wire("e3", "app-1", "cdn-1", "segments"),
      wire("e4", "cdn-1", "origin-1", "misses"),
    ],
    scenario: { ...scenario },
  };
}

const module: SdModule = {
  slug: "cdns-and-static-content",
  order: 11,
  part: 1,
  partTitle: "Scaling up",
  kind: "sim",
  title: "CDNs & Static Content",
  description:
    "Serve 24 GB/s of media without serving it from the origin. Cache keys and TTLs, the responses an edge can never answer, code that runs at the edge and code that must not, and why versioned URLs beat purging.",
  story:
    "Netflix's answer to “the bytes have too far to travel” was not a bigger origin: it was an appliance inside more than a thousand ISP networks, given away free, filled overnight, steered by BGP. Its own framing is that the programme exists to “deliver our content more efficiently” — localise the traffic, keep it off transit. We have 12,000 requests a second, every one a 2 MB video segment, and a single origin store behind an edge that currently answers nothing. The app tier is healthy at 75% and the load balancer at 60%; the origin is at 120% and shedding one segment in six. Six lessons on what to put between the viewer and the origin, what it can answer, what it must not, and how to change a cached byte without breaking 300 cities at once.",
  chapters: [
    {
      slug: "distance-and-bytes",
      title: "Distance and bytes",
      description:
        "Why a request that is answered 5,000 km away costs more than one answered in the next room.",
      children: [
        {
          slug: "latency-table-chapter",
          title: "The latency table",
          description:
            "Caches are nanoseconds, the same datacentre is a millisecond, another continent is a tenth of a second.",
          lessonSlug: "latency-numbers",
        },
        {
          slug: "cache-key-chapter",
          title: "Cache keys and TTL",
          description:
            "The edge decides what to keep from the key you give it, and how long from the TTL.",
          lessonSlug: "cache-keys-and-ttl",
        },
      ],
    },
    {
      slug: "what-the-edge-cannot-do",
      title: "What the edge cannot do",
      description:
        "Personalised responses and writes are not cacheable, and `no-cache` does not mean what it sounds like.",
      children: [
        {
          slug: "uncacheable-chapter",
          title: "The uncacheable set",
          description:
            "Anything that varies by viewer, changes on write, or carries a side effect.",
          lessonSlug: "what-a-cdn-cannot-cache",
        },
        {
          slug: "versioning-chapter",
          title: "Purging and versioning",
          description:
            "Changing a cached byte without a purge, and what a purge can actually promise.",
          lessonSlug: "purging-and-versioning",
        },
      ],
    },
    {
      slug: "the-edge-as-a-platform",
      title: "The edge as a platform",
      description:
        "Code at the edge, media at the edge, and the difference between a cache and a computer.",
      children: [
        {
          slug: "edge-compute-chapter",
          title: "Edge compute",
          description:
            "What belongs in a 50 ms function in 300 cities, and what must stay at the origin.",
          lessonSlug: "edge-compute",
        },
        {
          slug: "media-chapter",
          title: "Image and video delivery",
          description:
            "A master file is not a deliverable: renditions, segments, and filling a cache before prime time.",
          lessonSlug: "image-and-video-delivery",
        },
      ],
    },
  ],
  lessons: [
    {
      slug: "latency-numbers",
      title: "Latency numbers every programmer should know",
      attribution:
        "Synthesised from web.dev's guide to content delivery networks and MDN's CDN glossary, with the latency figures from the widely circulated “latency numbers every programmer should know” table. The capacity figures are this module's teaching model.",
      sources: [
        {
          label: "web.dev — content delivery networks",
          url: "https://web.dev/articles/content-delivery-networks",
        },
        {
          label: "MDN — CDN (glossary)",
          url: "https://developer.mozilla.org/en-US/docs/Glossary/CDN",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Twelve thousand segments a second",
          body: "Twelve thousand requests a second arrive at the playback API, and every one of them is a 2 MB video segment. That is 24 GB/s leaving a single origin store, and every byte travels the whole distance from the origin to the viewer. The app tier is healthy — eight instances at 75% — and the load balancer sits at 60%. Neither of them is the problem: the origin is at 120% and already refusing one segment in six.",
        },
        {
          kind: "concept",
          title: "The numbers that decide the design",
          body: "A cache hit is measured in nanoseconds, main memory in about 100 ns, and a round trip inside one datacentre in about half a millisecond. A disk seek is roughly 10 ms. A round trip between California and the Netherlands is around 150 ms. Five orders of magnitude separate the first number from the last, and the slowest one is the only one you cannot fix with a better machine.\n\nThe useful habit is to keep two columns in your head: things you own (memory, disk, CPU, your own network) and things you rent from physics (the speed of light in fibre, the number of networks between you and a viewer, the peering arrangements of those networks). The first column is microseconds. The second is milliseconds, and it is where a media request spends almost all of its life.\n\nLatency also multiplies before it adds. A cold request pays a DNS lookup, a TCP handshake, and a TLS handshake before the first byte of media exists — three round trips, minimum. At 5 ms each that is 15 ms, and nobody notices. At 150 ms each it is 450 ms before the player has a segment to draw, which is why distance is measured in round trips rather than kilometres.",
        },
        {
          kind: "concept",
          title: "Bandwidth is requests times payload",
          body: "12,000 requests per second × 2 MB = 24,000 MB/s = 24 GB/s. Multiply by eight to get bits: 192 Gbit/s. A 10 Gbps port carries 1.25 GB/s, so 24 GB/s needs about twenty of them, and that is before a single viewer's request has been served twice.\n\nThis arithmetic is the whole reason the module exists. The number that matters is not requests per second — the load balancer can do 20,000 — it is bytes per second leaving one place. A system can be healthy on every request metric it reports and still be selling more egress than it can buy.",
        },
        {
          kind: "concept",
          title: "Distance is a floor, not a cost",
          body: "Light in fibre travels at roughly 200,000 km/s, so every 1,000 km of cable costs about 5 ms in each direction. London to New York is 5,570 km: call it 28 ms one way, 56 ms round trip, before a single router queues a single packet. No amount of engineering removes it, because it is not a software property.\n\nWhat you can do is change where the bytes start. That is all a CDN is. Netflix's Open Connect page states the goal without ornament — the programme exists so the company can *“deliver our content more efficiently”* — and the mechanism is *“over a thousand ISPs”* with an appliance inside each. The distance from the appliance to the viewer is metres; the distance from a datacentre to the viewer is a continent.",
        },
        {
          kind: "diagram",
          caption:
            "Every segment comes from one origin store: 12,000 a second against a store that can serve 10,000, so one in six is shed",
          graph: graph(0),
        },
        {
          kind: "your_turn",
          prompt:
            "8,000 requests per second, 70% of them video segments of 1.5 MB. How many Gbit/s must leave the origin, and how many 10 Gbps ports is that? Then: what changes if the edge answers 90% of them?",
        },
        {
          kind: "compare",
          body: "A beginner sizes the origin for peak media bandwidth and buys a bigger one when it fills. A senior engineer asks what share of those bytes ever needed to leave the origin at all, and finds that the answer is the miss rate.\n\nThe trap is measuring the wrong thing. Every dashboard in this story is green except the origin's, because the app tier counts requests and the origin pays for bytes. Pick the metric that the money is spent on, and put it on the wall: egress from the origin, in Gbit/s, is the number a CDN is supposed to move.",
        },
        {
          kind: "recap",
          points: [
            "Memory is nanoseconds, a datacentre round trip is a millisecond, another continent is 150 ms",
            "Bandwidth is requests × payload: 12,000 × 2 MB = 24 GB/s = 192 Gbit/s",
            "Distance is a floor set by the speed of light, not a cost you can optimise away",
            "A CDN shortens the distance; it does not reduce the bytes a viewer receives",
            "Size the thing that pays for egress, not the thing that counts requests",
          ],
        },
      ],
    },
    {
      slug: "cache-keys-and-ttl",
      title: "Cache keys and TTL",
      attribution:
        "Synthesised from Cloudflare's cache-control documentation and MDN's `Cache-Control` reference.",
      sources: [
        {
          label: "Cloudflare — cache-control",
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
          title: "A few hundred gigabytes against a catalogue of petabytes",
          body: "The edge node nearest a viewer has a few hundred gigabytes of disk and the catalogue is petabytes, so it cannot hold everything. It holds what is asked for, keyed by a string, until the entry expires or the disk needs the space back. Every design decision in this lesson is a decision about that string and that expiry.",
        },
        {
          kind: "concept",
          title: "The cache key is the question you ask",
          body: "A cache is a dictionary, and the hit rate is decided by how often two viewers ask the same question. By default the key is the URL, query string included, which is why `/segments/00042.m4s` is shared by everyone watching that title and `/segments/00042.m4s?session=abc123` is shared by nobody.\n\nThe `Vary` header adds request headers to the key. `Vary: Accept-Encoding` is sensible — a gzip and a brotli response really are different bytes. `Vary: User-Agent` looks sensible and is catastrophic: there are thousands of distinct user-agent strings, so the key space explodes and the hit rate collapses. The same is true of any cookie you allow into the key. A CDN that is “not working” is very often a CDN being asked a different question every time.",
        },
        {
          kind: "concept",
          title: "TTL is a trade, not a setting",
          body: "`max-age` is how long a copy stays fresh, in seconds. `s-maxage` does the same job for shared caches, which is what a CDN is, and takes precedence there. When the copy goes stale the cache does not have to throw it away: it can revalidate with `If-None-Match` and the origin can answer `304 Not Modified`, which costs a round trip and no bytes. `stale-while-revalidate` goes further and serves the stale copy while fetching a fresh one in the background.\n\nA long TTL maximises hits and tolerates staleness; a short one keeps content fresh and sends more traffic to the origin. The honest way to choose is to ask what happens if a viewer sees the previous version for another hour. For a video segment the answer is nothing. For a price, the answer is a refund.\n\nEvery cached response also carries an `Age` header — how many seconds this copy has already existed — and it is the fastest way to answer “is this object actually being served from the edge?”. An `Age` of zero on the tenth request means the cache is not caching, and no amount of TTL tuning will fix a key that never repeats.",
        },
        {
          kind: "concept",
          title: "Hit rate is a property of your URLs",
          body: "Viewing is not uniform: a small share of the catalogue absorbs most of the requests, which is exactly the shape a cache wants. The long tail is where the misses live, and the tail is why a 95% hit rate is a good result rather than a mediocre one — the remaining 5% is the part nobody watches twice.\n\nWhat kills a hit rate is not the tail, it is uniqueness. A cache key that embeds a session, a timestamp, a user id, or a random query parameter turns every request into a miss, and no CDN configuration recovers it. This is why the query string is the first thing to audit: analytics parameters (`utm_source`, `fbclid`) should be stripped at the edge, because `?utm_source=twitter` and `?utm_source=email` are the same segment.",
        },
        {
          kind: "your_turn",
          prompt:
            "A segment URL is `/watch/9f2c/00042.m4s?session=8a1f&utm_source=email`. Name every reason its hit rate is zero, and rewrite the URL so that the same segment is asked for identically by every viewer.",
        },
        {
          kind: "compare",
          body: "A beginner treats the CDN as a switch: turn it on, expect 95%. An engineer treats the hit rate as an output of URL design and audits the key before blaming the vendor.\n\nThe trap is adding `Vary: User-Agent` to “be correct”. Correctness that produces a unique key per browser is indistinguishable from a cache that is turned off, and it is harder to notice because the header looks careful.\n\nThe audit itself takes an hour. Take the top hundred URLs by request count, list the distinct cache keys they produce, and count how many keys each URL maps to. A well-designed object has exactly one key; an object with forty keys is serving forty copies of the same bytes and calling it a cache.",
        },
        {
          kind: "recap",
          points: [
            "The cache key is usually the URL; the hit rate is decided by how shareable it is",
            "`Vary` adds headers to the key — `Accept-Encoding` yes, `User-Agent` no",
            "`s-maxage` overrides `max-age` for shared caches such as a CDN",
            "Revalidation costs a round trip and no bytes when the origin answers 304",
            "Strip tracking parameters at the edge or every viewer gets their own cache entry",
          ],
        },
      ],
    },
    {
      slug: "what-a-cdn-cannot-cache",
      title: "What a CDN cannot cache",
      attribution:
        "Synthesised from MDN's CDN glossary entry and Wikipedia's article on content delivery networks, with the cache-control semantics from MDN's HTTP caching guide.",
      sources: [
        {
          label: "MDN — CDN (glossary)",
          url: "https://developer.mozilla.org/en-US/docs/Glossary/CDN",
        },
        {
          label: "Content delivery network (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Content_delivery_network",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The three responses that cannot be shared",
          body: "Three responses on the playback API look cacheable and are not. “Continue watching” is per member and changes the moment they press play. The playback manifest is per session, because it carries the licence and the chosen rendition. And the play event itself is a write, which must reach the origin whether or not an edge is nearby. Put any of them behind a shared cache and the bug is not slow — it is wrong.",
        },
        {
          kind: "concept",
          title: "The uncacheable set",
          body: "A shared cache is safe only for responses that are identical for every viewer. That excludes four categories: responses that vary by viewer (a feed, a profile, a “continue watching” row); responses that are authenticated as somebody in particular; writes and anything with a side effect, because a cache cannot re-perform a POST; and responses that set cookies, because `Set-Cookie` in a shared cache hands one viewer's session to another.\n\nThe subtle one is the authenticated page. If a response varies only because the request carried a session cookie, and the cache key does not include that cookie, then the first logged-in viewer's HTML is stored under a shared key and served to the next viewer — who is now looking at somebody else's account. Adding `Vary: Cookie` fixes the correctness and destroys the hit rate, because every session is a different key. The right answer is not to cache the response at all, and to split it into a cacheable shell plus a personalised fragment fetched separately.\n\nMDN's definition is worth reading literally — a CDN is *“a geographically distributed network of proxy servers and their data centers”* whose purpose is availability and performance. Nothing in that definition knows who is asking. Every privacy bug blamed on “the CDN” is a response that was cacheable by configuration and should not have been.",
        },
        {
          kind: "concept",
          title: "`no-cache` is not `no-store`",
          body: "This is the most misread pair of words in HTTP. `Cache-Control: no-store` means do not write this response to any cache. `Cache-Control: no-cache` means you may store it, but you must revalidate before every reuse — so it is cached and always confirmed. `private` means the browser may keep it and a shared cache may not. `public` means anyone may, which is a promise you should only make about responses that are true for everyone.\n\nThe practical consequence: marking a personalised response `no-cache` still writes it to disk at 300 locations. `no-store` on the truly sensitive ones, `private` on the ones that are per-user but worth the browser keeping, and `public, s-maxage` only where you mean it. The header is a security boundary, not a performance hint.",
        },
        {
          kind: "concept",
          title: "Split the paths",
          body: "The fix is architectural rather than a header: put media behind one hostname that is cacheable by construction and state behind another that is not. `cdn.example.com/segments/…` carries no cookies, no session, and a one-year TTL. `api.example.com/me/continue-watching` carries `private, no-store` and never touches a shared cache.\n\nIn the simulator the same split is visible as two paths: segments go app → CDN → origin, and state goes to the database. A single CDN in front of both is not a caching problem, it is a routing problem, and the answer is to stop routing them to the same place. Netflix's scheme does this at the widest possible scale — the Open Connect appliance serves catalogue bytes and has no idea who is watching.",
        },
        {
          kind: "your_turn",
          prompt:
            "Classify these four and give each a `Cache-Control`: the segment `/segments/00042.m4s`, an avatar at `/avatars/9f2c.png`, the endpoint `/me/continue-watching`, and the write `/api/play-events`. Which one would you refuse to put behind the shared cache even if asked?",
        },
        {
          kind: "compare",
          body: "A beginner puts every route behind the CDN and fixes the resulting stale feeds by lowering the TTL to five seconds — which is a cache that mostly misses and still serves the wrong row occasionally. An engineer splits the hostnames so that “cacheable” is a property of the route, not of a header somebody remembered to set.\n\nThe trap is believing `no-cache` is a safety switch. It is a revalidation instruction, and it does not stop the response from being written to a disk you do not control. If a response must never be shared, say `no-store`, and check the route that produces it rather than trusting every caller to remember.",
        },
        {
          kind: "recap",
          points: [
            "A shared cache is safe only for responses that are identical for everyone",
            "Per-viewer, authenticated, write, and cookie-setting responses are not shareable",
            "`no-store` forbids storing; `no-cache` stores but revalidates every time",
            "`private` allows the browser and forbids the shared cache",
            "Split cacheable media and uncacheable state onto different hostnames",
          ],
        },
      ],
    },
    {
      slug: "purging-and-versioning",
      title: "Purging and versioning",
      attribution:
        "Synthesised from Cloudflare's cache documentation and MDN's guide to HTTP caching.",
      sources: [
        {
          label: "Cloudflare — cache documentation",
          url: "https://developers.cloudflare.com/cache/",
        },
        {
          label: "MDN — HTTP caching",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "A bad encode, live in three hundred cities",
          body: "A segment was encoded with the wrong audio track. It is on disk at every edge that has been asked for it, with a one-year TTL and a URL that has not changed. Every viewer in those cities gets the wrong audio until the entry expires, and the deploy that fixes the encoder does not touch a single cached copy. This is the failure mode that decides whether your caching strategy is a design or a gamble.",
        },
        {
          kind: "concept",
          title: "A purge is a propagation, not a switch",
          body: "Every CDN offers purge: by exact URL, by tag or surrogate key, sometimes by wildcard. What none of them can offer is atomicity. A purge is a message that has to reach hundreds of points of presence, each of which has to act on it, and during that window the old copy is still being served somewhere. The window is usually seconds, and it is not zero, and it is not uniform.\n\nThat window is a correctness problem, not a performance one. Two viewers in two cities can receive two different versions of the same asset from the same unchanged URL, and a bug report that says “it is fixed for me” is describing the propagation delay rather than the fix.\n\nThere are quotas, too, because a purge is work for the provider: per-second and per-month limits, and a purge of a wildcard can be expensive enough to be rate-limited. A team that purges on every deploy has built a cache that is continuously cold, which is the worst of both worlds — all the cost, none of the hit rate.",
        },
        {
          kind: "concept",
          title: "Version the key and stop needing to purge",
          body: "The industry answer is to make invalidation unnecessary. Put a content hash in the path — `/segments/8f3c1a/00042.m4s`, `/static/app.4f3a9c.js` — and serve it with `Cache-Control: public, max-age=31536000, immutable`. New content means a new URL, which is a cache miss by definition, and the old URL is simply never requested again; it ages out on its own schedule without a purge.\n\nThis is why build tools emit hashed filenames and why it is worth insisting on. The rule that makes it work is that a versioned URL must never change its bytes. The moment somebody “updates” `app.4f3a9c.js` in place, the guarantee is gone and you are back to purging. Immutable is a promise about the future, and the edge believes you.",
        },
        {
          kind: "concept",
          title: "When you have to purge anyway",
          body: "Three cases remain. Legal takedown, where the content must be gone everywhere and a TTL is not an answer. A misconfigured header already shipped, where the only fix for `max-age=31536000` on a mutable URL is a purge. And a URL that cannot carry a version — a manifest, a feed, a `/latest` endpoint — where by definition the key stays the same while the content changes.\n\nFor those, purge by tag rather than by URL: tag every object that was produced from a release or an entity, then invalidate the tag. That is one call instead of ten thousand, and it is the only shape that survives a release with a hundred thousand objects. Then verify it, because a purge you have never exercised is a purge that does not work: request the object from two regions and check the hit header, not the dashboard.",
        },
        {
          kind: "your_turn",
          prompt:
            "A pricing rule changed and the JSON at `/api/pricing` is cached at the edge for an hour. You cannot version the URL because clients call it by name. What do you do at deploy time, and what do you do to stop this from being a scramble next time?",
        },
        {
          kind: "compare",
          body: "A beginner purges everything after every deploy, watches the hit rate fall to zero, and concludes that caching is unreliable. An engineer versions the URLs so there is nothing to purge, and keeps purge for the three cases where no versioned URL is possible.\n\nThe trap is trusting a purge you have not tested. “It should be gone” is a claim about 300 independent caches, and the only evidence is a response from a city that is not yours.",
        },
        {
          kind: "recap",
          points: [
            "A purge propagates to hundreds of locations; it is never atomic or instant",
            "Purge quotas exist, and purging on every deploy leaves the cache permanently cold",
            "A content hash in the URL plus `immutable` makes invalidation unnecessary",
            "A versioned URL must never change its bytes, or the guarantee is void",
            "Purge by tag for the cases that cannot be versioned, and verify from another region",
          ],
        },
      ],
    },
    {
      slug: "edge-compute",
      title: "Edge compute",
      attribution:
        "Synthesised from Wikipedia's article on edge computing and web.dev's guide to content delivery networks, with the Open Connect programme details from `openconnect.netflix.com`.",
      sources: [
        {
          label: "Edge computing (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Edge_computing",
        },
        {
          label: "web.dev — content delivery networks",
          url: "https://web.dev/articles/content-delivery-networks",
        },
        {
          label: "Netflix Open Connect",
          url: "https://openconnect.netflix.com/en/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "12,000 token checks a second",
          body: "Every one of the 12,000 requests needs a licence token checked and a country lookup before it may be served. Done at the origin that is 12,000 extra calls a second into an app tier already at 75%, and the check is the same arithmetic in every region. It is also the kind of work that does not need the database, the catalogue, or a disk.",
        },
        {
          kind: "concept",
          title: "What belongs in a function at the edge",
          body: "Edge platforms run a short function per request in hundreds of locations: Cloudflare Workers, Vercel's edge runtime, Lambda@Edge, and their equivalents. The shape of the work they suit is narrow and consistent — read the request, decide something, rewrite it. Redirects, canonical-host rewrites, header normalisation, signature verification with a public key, geo lookups, A/B bucketing, bot filtering, stripping tracking parameters before they poison a cache key.\n\nThe constraints are what make it narrow: a CPU-time budget measured in tens of milliseconds, a small memory ceiling, no local filesystem, no long-lived connection to a database, and a cold start when a location has not been used recently. Anything that needs to read your own state belongs at the origin. The edge is for decisions that can be made from the request alone.\n\nThe cold start is the constraint beginners miss. A function that has not run in a location recently pays an initialisation cost before it can answer, and at 300 locations most of them are cold most of the time. Keeping the bundle small is therefore a latency decision, not a code-style preference: every import at the top of an edge function is code that has to be loaded before the first request in that city can be served.",
        },
        {
          kind: "concept",
          title: "A cache is not a computer",
          body: "Netflix runs the largest edge deployment most engineers will ever touch, and it deliberately does not run arbitrary code there. An Open Connect Appliance is a cache: it holds catalogue bytes and serves them. Routing is done by BGP sessions that the ISP configures to steer traffic towards it — the network decides, not a function. The page is explicit that embedded appliances *“have the same capabilities as the OCAs that we use in our 60+ global data centers”*, which is a statement about uniformity, not about extensibility.\n\nThat restraint is a design decision worth copying. Every location where code can execute is a location you must deploy to, roll back, secure, and observe. A cache is a small, dumb, highly available surface; a compute platform at 300 points of presence is a distributed system with 300 failure modes. Add compute to the edge when the work is genuinely request-shaped, not because the platform offers it.",
        },
        {
          kind: "concept",
          title: "The deploy problem moves to geography",
          body: "Code that runs in 300 places has a rollout problem that code in one datacentre does not: during a deploy, some locations run version 41 and others run version 42, and the request that hits both — a redirect that adds a query parameter, a header that a cache key includes — behaves differently depending on which city answered. Version skew used to be a canary concern; at the edge it is the normal state during every deploy.\n\nThe mitigations are the same ones that work everywhere, applied more strictly: keep the function small enough to reason about in one screen, make it stateless so any version can serve any request, version the behaviour rather than mutating it, and never let the edge write to a store the origin also writes. If a rule must be consistent across locations, it belongs at the origin.",
        },
        {
          kind: "your_turn",
          prompt:
            "Five candidates: (a) redirect `www` to the apex host, (b) check a licence token's signature, (c) fetch the viewer's “continue watching” row, (d) choose a thumbnail variant for an experiment, (e) write a play event. Which belong at the edge, and what disqualifies the others?",
        },
        {
          kind: "compare",
          body: "A beginner reads “edge compute” and moves the application there, then discovers that every request now makes three calls back to the origin to fetch the state it needs. An engineer moves the ten lines that only need the request, and leaves everything else where the data is.\n\nThe trap is measuring only latency. A check that runs in 3 ms at the edge and then waits 80 ms for the origin has not been moved to the edge; it has been moved and given a longer journey.",
        },
        {
          kind: "recap",
          points: [
            "Edge functions suit short, stateless, request-shaped decisions",
            "CPU-ms budgets, small memory, no disk, and no long-lived database connections",
            "Netflix's edge is a cache steered by BGP, deliberately not a compute platform",
            "Every location that can run code is a location to deploy, secure, and observe",
            "Version skew is normal at the edge; anything needing global consistency stays at the origin",
          ],
        },
      ],
    },
    {
      slug: "image-and-video-delivery",
      title: "Image and video delivery",
      attribution:
        "Synthesised from web.dev's guide to content delivery networks and the Amazon S3 user guide, with the fill behaviour from Netflix's Open Connect documentation.",
      sources: [
        {
          label: "web.dev — content delivery networks",
          url: "https://web.dev/articles/content-delivery-networks",
        },
        {
          label: "Amazon S3 — user guide",
          url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "One master file, thousands of viewers",
          body: "The master of a feature film is tens of gigabytes and nobody watches it. What a viewer's player requests is a two-second segment encoded for their device and their bandwidth — which is exactly the 2 MB object this module's graph serves 12,000 times a second. The distance between the master and the segment is the whole of media engineering.",
        },
        {
          kind: "concept",
          title: "The master is not a deliverable",
          body: "Media is transcoded once into a ladder of renditions — 240p through 4K, several bitrates each — and every rendition is stored as its own object with its own URL, so every rendition caches independently. The player picks a rung and switches as bandwidth changes. Images follow the same logic at a smaller scale: one original, several widths, and the browser chooses via `srcset`, with format negotiation (AVIF, WebP, JPEG) as a second axis.\n\nThe saving is not marginal. Serving a 4,000-pixel image to a 390-pixel phone wastes most of the bytes, and those bytes are the ones the origin pays for. The reason object storage is the right origin is that these are immutable blobs with no query behind them: a file server with a CDN in front is the entire architecture.",
        },
        {
          kind: "concept",
          title: "Video is a sequence of small files",
          body: "Streaming protocols — HLS and DASH — split a title into segments of a few seconds and describe them in a manifest. The player fetches the manifest, then fetches segments in order, switching rendition as conditions change. Seeking is a range request or a jump to another segment. This is why a CDN works so well for video: the unit of caching is a small immutable file that thousands of viewers request at nearly the same time, which is the best possible access pattern for a cache.\n\nIt also changes what “cache invalidation” means. A re-encode produces new segment files; the manifest points at them by name. Nothing is overwritten, so nothing needs purging — which is the next lesson's subject, arriving early because media forced the answer a decade ago.",
        },
        {
          kind: "concept",
          title: "Fill before the demand",
          body: "Pull-through caching is reactive: the first viewer in a region pays the miss and everyone after them is served from the edge. That is fine for a long tail and wrong for a premiere, where the first minute is 12,000 simultaneous cold misses. The answer is to fill the cache before anybody asks.\n\nNetflix's Open Connect page describes the mechanism as *“nightly content fills and updates”*, and the initial fill is not instant — the page says Netflix pre-fills a new appliance with *“the appropriate content for your geographical location”* and that this *“typically takes 1-2 weeks, depending on catalog size”*. Pre-positioning costs you a prediction: you must decide what a region will watch before it watches it. That is a schedule, a capacity plan, and a forecasting problem, and it is worth it because prime-time demand cannot wait for a cold disk.",
        },
        {
          kind: "concept",
          title: "What this simulator cannot show",
          body: "Two honest limits, so they are not mistaken for bugs. Capacity here is requests per second with no dimension for bytes: 12,000 requests for 2 MB segments cost the origin exactly as much as 12,000 requests for tiny JSON. And `bandwidthMbps` counts the bytes delivered to viewers, so it reads 192,000 Mbit/s at a 50% hit rate and 192,000 at a 95% hit rate — measured, identical — because a CDN does not reduce what the viewer receives.\n\nWhat the hit rate changes is where those bytes came from, which the canvas measures as the origin's arrival rate: 120% at no caching, 6% at 95%. Read the origin's utilisation, not the bandwidth line. The bandwidth figure is there to keep the arithmetic honest, not to reward you for caching.",
        },
        {
          kind: "your_turn",
          prompt:
            "A title is available in 12 renditions and is expected to be popular in three countries. What do you pre-position, what do you leave to pull-through, and what does getting the prediction wrong cost in each direction?",
        },
        {
          kind: "compare",
          body: "A beginner uploads the master and links to it, then adds a CDN and wonders why the first viewer of every title is slow. An engineer produces the ladder once, stores immutable renditions, pre-positions what is predictable, and lets the long tail pull through.\n\nThe trap is treating image resizing as free. On-the-fly resizing at the edge is convenient and it converts a cache hit into a CPU-intensive miss the first time every size is requested; the sizes people actually use should be generated once and cached like any other object.",
        },
        {
          kind: "recap",
          points: [
            "A master is not a deliverable: encode a ladder of renditions, each with its own URL",
            "`srcset` and format negotiation let the browser pick the smallest correct file",
            "Video is segments plus a manifest, which is the ideal shape for a cache",
            "Pull-through caching is reactive; a premiere needs the content pre-positioned",
            "The canvas grades origin arrivals, not bytes — `bandwidthMbps` is unchanged by the hit rate",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "You serve 12,000 video segments a second from one origin and it is shedding traffic. How do you fix it without buying more origin capacity?",
    strongAnswer:
      "I would measure what share of those bytes ever needed to leave the origin. A CDN in front of an immutable object store, with a cache key that is just the URL and a long `s-maxage`, turns the origin's arrival rate into the miss rate — at a 95% hit rate that is 12,000 down to 600 requests a second. I would keep personalised responses and writes off the shared cache entirely, on a separate hostname with `private` and `no-store`, because a cache that cannot tell viewers apart is a correctness bug waiting to happen. I would version the URLs with a content hash and serve them `immutable`, so deploys need no purge, and reserve purging for takedowns and the few endpoints that cannot carry a version. Edge functions would handle the request-shaped work — token signature checks, geo, header rewrites — and nothing that needs the database. And I would watch origin egress and hit rate, not total requests, because that is where the money is.",
    trap: "Buying more origin bandwidth instead of reducing origin traffic. Also, putting the whole API behind the CDN and calling the resulting stale responses a caching problem; marking a response `no-cache` and believing it is not stored; and purging every deploy, which makes the cache cold and expensive at the same time.",
  },
  task: {
    brief:
      "12,000 segment requests a second, each 2 MB, and one origin store answers every one of them: it is at 120% and shedding one request in six. Raise the edge hit rate so the origin is reached only by misses — under 10% — while all 12,000 requests complete.",
    startGraph: graph(0),
    solutionGraph: graph(0.95),
    steps: [
      {
        id: "keep-the-media-path",
        title: "Keep the CDN on the media path",
        brief:
          "Segments must go from the playback API through the CDN to origin storage, so a miss is the only reason the origin is touched.",
        hint: "The graph already has a CDN; check it sits between the playback API and origin storage, not beside them.",
        reveal:
          "The path is client → edge → playback API → CDN → origin storage. Without the CDN in that path the edge has nothing to answer from, and every segment reaches the origin.",
        check: (graph) => {
          const cdn = graph.nodes.find((node) => node.type === "cdn");
          const appIds = new Set(
            graph.nodes
              .filter((node) => node.type === "app_server")
              .map((node) => node.id),
          );
          const storeIds = new Set(
            graph.nodes
              .filter((node) => node.type === "object_store")
              .map((node) => node.id),
          );
          const fedByApp =
            !!cdn &&
            graph.edges.some(
              (edge) => edge.to === cdn.id && appIds.has(edge.from),
            );
          const feedsOrigin =
            !!cdn &&
            graph.edges.some(
              (edge) => edge.from === cdn.id && storeIds.has(edge.to),
            );
          return {
            passed: !!cdn && fedByApp && feedsOrigin,
            progress: !cdn
              ? "No CDN node in the graph"
              : !fedByApp
                ? "The CDN is not fed by the playback API"
                : !feedsOrigin
                  ? "The CDN does not reach origin storage, so a miss has nowhere to go"
                  : "✓ Segments flow app → CDN → origin storage",
          };
        },
      },
      {
        id: "keep-the-load",
        title: "Do not shrink the problem",
        brief:
          "The traffic is 12,000 requests a second. Lowering the arrival rate changes the question, not the answer.",
        hint: "Check the scenario's arrival rate in the inspector.",
        reveal:
          "A capacity problem is only solved by moving traffic, not by removing it. At 1,000 requests a second the origin would pass every criterion while the production incident continues.",
        check: (graph) => {
          const arrivals = graph.scenario.arrivalRate;
          return {
            passed: arrivals >= 12_000,
            progress:
              arrivals >= 12_000
                ? `✓ ${arrivals.toLocaleString()} r/s — the load is unchanged`
                : `${arrivals.toLocaleString()} r/s is below the 12,000 r/s the system is expected to serve`,
          };
        },
      },
      {
        id: "raise-the-hit-rate",
        title: "Raise the edge hit rate",
        brief:
          "At least 90% of segment requests should be answered at the edge, so at most 10% reach origin storage.",
        hint: "Select the CDN node and raise its hit rate in the inspector.",
        reveal:
          "Set the CDN hit rate to 0.95. At 95%, 600 of the 12,000 requests per second reach the origin — 6% of its capacity — and the other 11,400 are answered where the viewer is.",
        check: (graph) => {
          const cdn = graph.nodes.find((node) => node.type === "cdn");
          const hitRate =
            (cdn as { hitRate?: number } | undefined)?.hitRate ?? 0;
          const passed = !!cdn && hitRate >= 0.9;
          return {
            passed,
            progress: passed
              ? `✓ Edge answers ${(hitRate * 100).toFixed(0)}% of requests`
              : cdn
                ? `${(hitRate * 100).toFixed(0)}% — raise it to 90% or higher`
                : "Add a CDN node",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "origin-headroom",
        label: "Origin storage under 10% utilisation",
        required: true,
        explain:
          "The origin should be reached only by cache misses. At a 95% hit rate it sees 600 of the 12,000 requests per second, which is 6% of its 10,000 r/s capacity. A second origin store passes the other criteria while leaving the origin at 60% — adding capacity at the origin is not the same as moving bytes to the edge.",
        assert: (result) => {
          const origin = result.perNode.find((node) => node.id === "origin-1");
          return result.valid && !!origin && origin.utilisation < 0.1;
        },
      },
      {
        id: "zero-errors",
        label: "No request is shed",
        required: true,
        explain:
          "The origin can serve 10,000 requests a second and is offered 12,000, so without caching it refuses the difference. Serving every request is the evidence that the load was moved rather than reduced.",
        assert: (result) =>
          result.valid &&
          (result.errorClasses.shed ?? 0) === 0 &&
          (result.errorClasses.unreachable ?? 0) === 0 &&
          (result.errorClasses.rejected ?? 0) === 0 &&
          (result.errorClasses.stale ?? 0) === 0,
      },
      {
        id: "capacity-served",
        label: "Serves all 12,000 requests per second",
        required: true,
        explain:
          "Throughput is the check that the system kept its load: 10,000 r/s completed at the start because the origin refused the rest. It is not sufficient on its own — two origin stores reach 12,000 while leaving the origin busy — which is why the headroom criterion is the one that names the goal.",
        assert: (result) => result.valid && result.throughput >= 11_500,
      },
    ],
  },
  recap: [
    "Bandwidth is requests × payload; 12,000 × 2 MB is 24 GB/s, and that is the number the origin pays for",
    "A CDN shortens the distance to the viewer; it does not reduce the bytes the viewer receives",
    "The cache key decides the hit rate before the TTL does — strip tracking parameters and never key on user-agent",
    "`no-store` forbids storing, `no-cache` stores and revalidates, `private` allows only the browser",
    "Personalised reads and writes belong on a different hostname from cacheable media",
    "Edge functions are for short, stateless, request-shaped decisions; a cache is not a computer",
    "A master is not a deliverable: renditions and segments are, and a premiere needs them pre-positioned",
    "Versioned URLs make purging unnecessary, and a purge is a propagation, not a switch",
  ],
  attribution:
    "Synthesised from Netflix's Open Connect programme documentation, web.dev's guide to content delivery networks, MDN's CDN glossary and HTTP caching guide, Cloudflare's cache and cache-control documentation, Wikipedia's articles on content delivery networks and edge computing, and the Amazon S3 user guide. Sources are linked per lesson; the capacity figures and measured error rates come from this module's canvas.",
};

export default module;
