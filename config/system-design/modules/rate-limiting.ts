import type { SdEdge, SdGraph, SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";
import task from "./rate-limiting.task";

/**
 * Module 10 — rate limiting and backpressure, converted to the leaf model
 * (plan 17, slice B6).
 *
 * **Netflix anchor.** Netflix's answer to "how many requests may this client
 * send" is not a fixed number: it is `github.com/Netflix/concurrency-limits`,
 * an adaptive limit that rises and falls with measured latency. The
 * repository's own sentence is the module's thesis — *"The general idea is
 * that we maintain a limit on the number of concurrent in-flight requests and
 * adjust it based on latency."* A fixed number is the beginner's answer; an
 * adaptive one is what you build when you have measured what a fixed number
 * does to a system that is already on fire.
 *
 * **The task.** A bot is doing 400 uploads per second inside 1,000 requests
 * per second of traffic, and the load balancer has no per-client limit. The
 * start graph runs at 6,000 requests per second with the same 40% abusive
 * share, which is past what the two app instances can serve, so real uploads
 * are shed before the bot is ever noticed. Setting a per-client allowance on
 * the load balancer below the bot's rate rejects the bot's requests as 429s,
 * which removes them from the app tier's load, and real users complete with
 * zero errors. Measured: start → 33% shed, app tier at 150%; solution
 * (3,600 req/min limit) → 0% shed, app tier 90%, bot rejected as 429s.
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

/** Concept diagram: 1,000 r/s, 40% abusive, no limit. The bot is visible but nothing is on fire yet. */
const conceptScenario = {
  arrivalRate: 1_000,
  writeShare: 0.9,
  mediaShare: 0,
  bytesPerMediaRequest: 2_000_000,
  abusiveShare: 0.4,
  latencyJitterMs: 0,
  cacheColdStart: false,
  replicaLagMs: 0,
} as const;

const conceptGraph: SdGraph = {
  nodes: [
    { ...defaultNode("client", "client-1", 40, 200), label: "Members + bot" },
    {
      ...defaultNode("load_balancer", "lb-1", 240, 200),
      label: "Load Balancer",
      rateLimitPerMin: null,
    },
    {
      ...defaultNode("app_server", "app-1", 460, 200),
      label: "Upload API",
      replicas: 2,
    },
    { ...defaultNode("database", "db-1", 700, 200), label: "Asset metadata" },
  ],
  edges: [
    wire("e1", "client-1", "lb-1"),
    wire("e2", "lb-1", "app-1"),
    wire("e3", "app-1", "db-1", "insert upload"),
  ],
  scenario: { ...conceptScenario },
};

/** Task scenario: heavier load so the absence of a limit actually sheds. */
const taskScenario = {
  arrivalRate: 6_000,
  writeShare: 0.9,
  mediaShare: 0,
  bytesPerMediaRequest: 2_000_000,
  abusiveShare: 0.4,
  latencyJitterMs: 0,
  cacheColdStart: false,
  replicaLagMs: 0,
} as const;

function taskGraph(rateLimitPerMin: number | null): SdGraph {
  return {
    nodes: [
      { ...defaultNode("client", "client-1", 40, 200), label: "Members + bot" },
      {
        ...defaultNode("load_balancer", "lb-1", 240, 200),
        label: "Load Balancer",
        rateLimitPerMin,
      },
      {
        ...defaultNode("app_server", "app-1", 460, 200),
        label: "Upload API",
        replicas: 2,
      },
      { ...defaultNode("database", "db-1", 700, 200), label: "Asset metadata" },
    ],
    edges: [
      wire("e1", "client-1", "lb-1"),
      wire("e2", "lb-1", "app-1"),
      wire("e3", "app-1", "db-1", "insert upload"),
    ],
    scenario: { ...taskScenario },
  };
}

const module: SdModule = {
  slug: "rate-limiting",
  order: 10,
  part: 1,
  partTitle: "Scaling up",
  kind: "sim",
  title: "Rate Limiting & Backpressure",
  description:
    "Keep one abusive client from drowning out everyone else, and shed load before the whole stack falls over. Per-client allowances, token buckets and sliding windows, where the limit belongs, and what to do when the allowance is not enough.",
  story:
    "Netflix's adaptive limit library exists because a fixed number is the wrong answer to a question that changes by the minute. Its README states the idea plainly — “The general idea is that we maintain a limit on the number of concurrent in-flight requests and adjust it based on latency.” We are at 1,000 requests per second on the Upload API, of which 400 are a single bot's garbage uploads, and the load balancer has no opinion about any of it. The app tier and the database are healthy and busy, and the real uploads are timing out behind the bot's. A fixed per-client cap is where we start. An adaptive one is where Netflix ended up, and the last lesson says why.",
  chapters: [
    {
      slug: "why-rate-limit",
      title: "Why rate limit?",
      description: "Protect capacity from a single misbehaving client.",
      children: [
        {
          slug: "capacity-is-finite-chapter",
          title: "Capacity is finite",
          description:
            "Every instance can serve only so many requests per second, and a bot does not care.",
          lessonSlug: "the-bot-in-your-traffic",
        },
        {
          slug: "shapes-of-allowance-chapter",
          title: "Shapes of allowance",
          description:
            "Token bucket, leaky bucket, sliding window — three ways to spend a budget over time.",
          lessonSlug: "algorithms",
        },
      ],
    },
    {
      slug: "limits-in-a-real-system",
      title: "Limits in a real system",
      description:
        "One balancer becomes five, and one allowance becomes a table of tiers.",
      children: [
        {
          slug: "one-client-should-not-win-chapter",
          title: "One client should not win",
          description:
            "Why a fair system limits per-client, and why the counter has to be shared.",
          lessonSlug: "distributed-rate-limiting",
        },
        {
          slug: "tiers-and-quotas-chapter",
          title: "Tiers and quotas",
          description:
            "A rate limit is a budget over a second; a quota is a budget over a month.",
          lessonSlug: "quotas-and-tiers",
        },
      ],
    },
    {
      slug: "backpressure-and-shedding",
      title: "Backpressure and shedding",
      description: "Queue what you can, drop the rest, and tell the client.",
      children: [
        {
          slug: "queue-depth-chapter",
          title: "Queue depth",
          description:
            "A short queue smooths bursts; a deep queue just adds latency.",
          lessonSlug: "load-shedding",
        },
        {
          slug: "http-429-chapter",
          title: "429 and Retry-After",
          description:
            "When the queue is full, reject new work and tell the client when to come back.",
          lessonSlug: "429-and-retry-after",
        },
      ],
    },
  ],
  lessons: [
    {
      slug: "the-bot-in-your-traffic",
      title: "The bot in your traffic",
      attribution:
        "Synthesised from donnemartin/system-design-primer, Stripe's rate-limiting documentation, and Netflix's concurrency-limits repository. The capacity figures are this module's teaching model.",
      sources: [
        {
          label: "Stripe — rate limits",
          url: "https://docs.stripe.com/rate-limits",
        },
        {
          label: "Rate limiting (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Rate_limiting",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "400 uploads a second",
          body: "A single bot is issuing 400 asset uploads per second. That is 40% of the app's 1,000 requests per second, and every one of them is an expensive write. The database and app servers have spare capacity, but they are busy with the bot's garbage. Real users' uploads queue behind the bot's requests and time out, and the dashboard shows a healthy app tier because utilisation is measured over the requests that *completed*, which is exactly the bot's traffic.",
        },
        {
          kind: "concept",
          title: "Rate limiting is per-client, not aggregate",
          body: "An aggregate cap — “no more than 1,000 requests per second overall” — cannot tell the bot from a real user. It limits the total, which means it limits real users the moment the bot is active, which is precisely when you do not want to. Rate limiting assigns each client its own allowance and rejects requests from clients that exceed it.\n\nThe simulator models one abusive client inside normal traffic: `abusiveShare` marks those arrivals, and the load balancer's `rateLimitPerMin` rejects them as `rejected` errors before they reach the app tier. The engine's rule is strict — a load balancer with a `rateLimitPerMin` set rejects an abusive request only when `arrivalRate × abusiveShare` exceeds `rateLimitPerMin ÷ 60`. Set the allowance above the bot's per-second rate and nothing happens; set it below and every abusive request is refused at the door.",
        },
        {
          kind: "diagram",
          caption:
            "The load balancer has no per-client limit: the bot's 400 requests per second sail through to the app tier",
          graph: conceptGraph,
        },
        {
          kind: "concept",
          title: "Where the limit belongs",
          body: "The load balancer is the right place because it is the first thing every request touches. Put the limit behind the app server and the bot has already consumed an app process, a database connection, and a thread before it is rejected — you have paid for the request you are refusing. Put it at the edge and the bot pays for a 429.\n\nThis is the same argument as the previous module's “in the path, or out of it”, and the answer is the same: in the path. A limit that is not on the request's path is a limit that is applied after the damage is done.",
        },
        {
          kind: "concept",
          title: "What a 429 costs and what it saves",
          body: "A rejected request returns immediately — no app process, no database query, no thread held. The cost is one HTTP response and one log line. The saving is the capacity the request would have consumed, which is now available to real users.\n\nMeasured here: with no limit, the bot's 400 requests per second join 600 real ones and the app tier, at 2,000 requests per second of capacity, sits at 50% on the bot's traffic alone before a single real upload is served. With a limit of 60 requests per minute per client, the bot's 400 per second are refused and the app tier serves 600 real requests at 30% utilisation.",
        },
        {
          kind: "concept",
          title: "Two limits that look the same and are not",
          body: "A rate limit and a concurrency limit are both numbers on a box, and they answer different questions. A rate limit caps how many requests a client may *send* per second; a concurrency limit caps how many may be *in flight* at once. The first is about fairness between clients; the second is about protecting the server from its own queue.\n\nNetflix's library is the second kind. It does not ask who the client is — it asks how long requests are currently taking, and adjusts the ceiling so that latency stays flat. That is why it survives a deploy that changes capacity: the number is a measurement, not a policy. This module does the first kind, because the problem is one client taking more than its share, and the last lesson explains when the second kind is the better tool.",
        },
        {
          kind: "your_turn",
          prompt:
            "Your real users peak at 50 uploads per minute each. The bot sends 400 per second. What per-client limit do you set, and how do you know you are not throttling a real user during a burst?",
        },
        {
          kind: "compare",
          body: "A beginner applies one global cap — “no more than 1,000 requests per second overall” — and watches real users get throttled along with the bot the moment the bot is active. A senior engineer limits per client at the edge, so the bot alone pays for its traffic and real users never see a 429.\n\nThe trap is confusing aggregate throughput with fairness. A system can be under its aggregate cap and still be unfair, if one client holds most of it.",
        },
        {
          kind: "recap",
          points: [
            "Rate limiting is per-client; an aggregate cap cannot separate a bot from real users",
            "The load balancer is the right place because it sees every request first",
            "In the simulator, `abusiveShare` marks the bot and `rateLimitPerMin` rejects it",
            "Rejected requests appear as the `rejected` error class",
            "A 429 is cheap to produce and expensive for the client to ignore",
          ],
        },
      ],
    },
    {
      slug: "algorithms",
      title: "Token bucket, leaky bucket, sliding window",
      attribution:
        "Synthesised from donnemartin/system-design-primer, Wikipedia's token-bucket and leaky-bucket articles, and Cloudflare's rate-limiting documentation.",
      sources: [
        {
          label: "Token bucket (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Token_bucket",
        },
        {
          label: "Leaky bucket (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Leaky_bucket",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Bursts versus steady rate",
          body: "A client that posts ten assets in one second and then goes quiet for a minute should not be punished the same as a client posting ten every second for an hour. The first is a burst; the second is a rate. A limit that cannot tell them apart is either too strict for the burst or too loose for the rate, and usually both.",
        },
        {
          kind: "concept",
          title: "Three algorithms, three shapes of allowance",
          body: "**Token bucket.** A bucket holds tokens, refilled at a steady rate up to a capacity. A request costs one token; if the bucket is empty, the request is rejected. Bursts up to the bucket depth are free; the steady rate is the refill rate. This is what most real systems use, because it matches how users actually behave — short bursts, long pauses.\n\n**Leaky bucket.** Requests enter a queue and leak out at a fixed rate. The queue has a depth; once it is full, new requests are rejected. The output is perfectly smooth, which is good for downstream capacity and bad for latency during a burst, because the queue adds delay proportional to its depth.\n\n**Sliding window.** Count requests in a rolling time window. A fixed window resets at the boundary and lets a client double its rate by straddling it; a sliding window does not. The cost is memory — one counter per client per window — and the accuracy is exact.",
        },
        {
          kind: "concept",
          title: "Choose by the cost of a mistake",
          body: "Too strict, and real users see 429s during harmless bursts — an asset upload that takes three seconds looks like three requests in one second. Too loose, and the bot still wins. The simulator's `rateLimitPerMin` is a steady per-minute allowance: the bot's `abusiveShare × arrivalRate` is compared against it, and everything above is rejected.\n\nThe practical answer is a token bucket with a depth of a few seconds of allowance and a refill rate at the real-user peak, set low enough that a bot's sustained rate exhausts it in the first second and stays exhausted. Measure the real-user peak before you pick the refill rate: a number chosen from a dashboard average is a number that is wrong at exactly the moment the limit is tested.",
        },
        {
          kind: "concept",
          title: "The arithmetic of a burst",
          body: "Take a token bucket with a refill of 60 requests per minute — one per second — and a depth of ten. A client that posts ten assets in one second spends the whole bucket and is then limited to one per second until it refills, which takes ten seconds. A client that posts one per second never touches the depth at all, and a client that posts eleven in one second is rejected on the eleventh: the bucket is empty.\n\nThat is the whole design. The refill rate is the sustained allowance; the depth is how much burst you are willing to absorb. Choose the refill above the real-user peak and the depth at a few seconds of that peak, and a bot has to be both fast and patient to get through — fast enough to empty the bucket, patient enough to wait for it to refill, which is exactly what a bot will not do.\n\nSliding windows have no bucket, so they cannot be emptied and refilled; they simply look back N seconds and count. That is more precise and more expensive: one record per client per window.",
        },
        {
          kind: "diagram",
          caption:
            "No limit configured: the bot's traffic flows through to the app tier unchecked",
          graph: conceptGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "Your real users peak at 50 uploads per minute each. The bot sends 400 per second. What limit and bucket depth do you set, and how do you know you are not throttling a real user during a legitimate burst of ten uploads in two seconds?",
        },
        {
          kind: "compare",
          body: "A strong answer names the per-client real-user peak, sets the refill rate above it, and sets the bucket depth to a few seconds of allowance. It also notes that a per-client limit never touches real users at all, because real users never exceed the real-user peak.\n\nThe trap is setting the limit to the aggregate rate divided by the number of clients — that number is meaningless, because clients are not equal and the bot is one of them.",
        },
        {
          kind: "recap",
          points: [
            "Token buckets allow bursts up to a depth, then throttle to a steady rate",
            "Leaky buckets smooth output at the cost of latency during bursts",
            "Sliding windows count over rolling time and cannot be straddled",
            "Set the refill rate above the real-user peak and below the bot's rate",
            "The simulator rejects any client whose rate exceeds `rateLimitPerMin`",
          ],
        },
      ],
    },
    {
      slug: "distributed-rate-limiting",
      title: "Distributed rate limiting",
      attribution:
        "Synthesised from Stripe's rate-limiting documentation and the system-design-primer's rate-limiting section.",
      sources: [
        {
          label: "Stripe — rate limits",
          url: "https://docs.stripe.com/rate-limits",
        },
        {
          label: "system-design-primer — rate limiting",
          url: "https://github.com/donnemartin/system-design-primer",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "One balancer becomes five",
          body: "The single load balancer in the previous module is now five, spread across two regions, because one box at 20,000 requests per second was the ceiling. The bot is still sending 400 per second, but it is now spread across five balancers, and each one sees only 80 of them. A per-balancer limit of 60 per minute passes the bot through on every box.",
        },
        {
          kind: "concept",
          title: "The limit has to be shared",
          body: "A rate limit that lives in one process is correct only while that process is the only one. The moment there are two, the effective limit is the sum of the two, and the bot's traffic is split across them. The fix is a shared counter — Redis, memcached, or a purpose-built store — that every balancer checks before admitting a request.\n\nThe cost is a hop per request: the balancer asks the store, the store answers, and the request proceeds or is rejected. That hop is on the critical path of every request, including the 99.9% that are not abusive, so the store must be fast and close. Stripe's documentation describes the practical answer: a fast, in-memory store with a short TTL, checked before the request is admitted.",
        },
        {
          kind: "concept",
          title: "The consistency question",
          body: "A shared counter is a single point of contention. Two balancers checking it at the same instant both see the same count, both admit, and the limit is exceeded by two. The honest answer is that rate limiting is approximate: a limit of 60 per minute that admits 62 is fine, and a limit that admits 120 is not.\n\nThe trade is between accuracy and latency. A strongly consistent counter is correct and slow; an eventually consistent one is fast and slightly wrong. Most systems pick the fast one and accept the error, because a rate limit that is 5% loose is still a rate limit, and a rate limit that adds 10 ms to every request is a latency problem for everyone.",
        },
        {
          kind: "concept",
          title: "What happens when the store is down",
          body: "The shared counter is now on the critical path of every request, so its availability decides whether the system admits traffic at all. Two choices, and neither is free.\n\n**Fail open:** if the store is unreachable, admit the request. The system stays up, and for the duration of the outage nobody is rate limited — which is exactly the moment a bot will find out. **Fail closed:** reject the request. The bot cannot get through, and neither can anyone else.\n\nThe usual answer is to fail open with a local fallback: each balancer keeps a small in-process counter and enforces a conservative limit while the shared store is unreachable. It is less accurate, and it is the difference between “the limiter stopped working” and “the site went down because the limiter stopped working.”",
        },
        {
          kind: "concept",
          title: "What Netflix actually does",
          body: "Netflix's concurrency-limits library does not use a fixed number at all. It measures the latency of in-flight requests and adjusts the limit up and down: if latency is low, the limit rises; if latency is high, it falls. The repository's own sentence is the design — “The general idea is that we maintain a limit on the number of concurrent in-flight requests and adjust it based on latency.”\n\nThis is the end of the fixed-number story. A fixed limit is correct only if you know the system's capacity in advance, and you do not — capacity changes with deploys, with traffic mix, with the time of day. An adaptive limit measures capacity instead of assuming it, and reacts in seconds instead of the hours it takes a human to notice and change a config value.",
        },
        {
          kind: "your_turn",
          prompt:
            "You have five load balancers and a Redis counter with a 1 ms round trip. The bot sends 400 requests per second. Design the check: what key, what TTL, what happens when Redis is unreachable, and how loose the limit can be before it stops being useful.",
        },
        {
          kind: "compare",
          body: "A beginner puts a per-balancer limit on each of five balancers and calls it distributed. An engineer puts a shared counter on the critical path and accepts that it will be 5% loose, because 5% loose is still a limit and a per-balancer limit is not a limit at all.\n\nThe trap is making the counter strongly consistent. It is correct and it adds latency to every request, including the 99.9% that are not abusive, and the latency is the worse problem.",
        },
        {
          kind: "recap",
          points: [
            "A per-process limit is the sum of the processes' limits once there is more than one",
            "A shared counter fixes it at the cost of a hop on every request",
            "Strongly consistent is correct and slow; eventually consistent is fast and slightly wrong",
            "Netflix's concurrency-limits adapts the limit from measured latency instead of a fixed number",
            "A limit 5% loose is still a limit; a per-balancer limit is not",
          ],
        },
      ],
    },
    {
      slug: "quotas-and-tiers",
      title: "Quotas and tiers",
      attribution:
        "Synthesised from Stripe's rate-limiting documentation and the system-design-primer.",
      sources: [
        {
          label: "Stripe — rate limits",
          url: "https://docs.stripe.com/rate-limits",
        },
        {
          label: "MDN — 429 Too Many Requests",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Not all clients are equal",
          body: "The bot is one kind of client. A paying customer with a batch job is another, and a free-tier user is a third. A single limit for all three is either too strict for the paying customer or too loose for the free one, and the answer is not a number but a table: each tier gets its own allowance, and the table is the product.",
        },
        {
          kind: "concept",
          title: "Tiered allowances",
          body: "A quota is a budget over a longer window — requests per day, uploads per month — and a rate limit is a budget over a shorter one — requests per second. The two are independent: a client can be under its daily quota and over its per-second limit, or vice versa.\n\nStripe's documentation describes the practical shape: a per-second rate, a per-day quota, and a separate, higher limit for endpoints that are expected to be called in bursts. The tier is determined by the API key, and the limit is checked at the edge before the request is admitted.",
        },
        {
          kind: "concept",
          title: "Three tiers, in numbers",
          body: "A table is easier to argue about than a paragraph, so here is one. Free: 5 uploads per second, 500 per day. Pro: 50 per second, 50,000 per day. Enterprise: 500 per second, 5 million per day, with a written agreement about what happens when they exceed it.\n\nThe numbers are not the lesson — the ratio is. Each tier is roughly ten times the last, because that is how usage actually distributes, and because a linear tier structure makes the upgrade path obvious. The daily quota is the one that costs money, because storage is the thing an asset API actually consumes; the per-second rate is the one that protects the app tier, because that is what the bot attacks.\n\nWrite both down before you build anything. A limit discovered during an incident is a limit that will be wrong.",
        },
        {
          kind: "concept",
          title: "Quotas are a product decision",
          body: "The engineering question is where to check the number; the product question is what the number is, and the second one is harder. Too low and a paying customer hits a wall in their first week; too high and the free tier is a free ride for a scraper.\n\nThe practical answer is to set the free tier at roughly what a genuine hobbyist uses in a week, the paid tier at what a small business uses, and to publish both. Published limits are a feature: they tell a customer what they are buying, and they give support a number to point at instead of a surprise.",
        },
        {
          kind: "concept",
          title: "Where the limit lives",
          body: "The load balancer sits in front of everything, so it is the only place a per-client limit can see all traffic. Put it behind the app server and the bot has already consumed an app process before it is rejected. Put it at the edge and the bot pays for a 429.\n\nThis is the same argument as the previous module's “in the path, or out of it”, and the answer is the same: in the path. A limit that is not on the request's path is a limit that is applied after the damage is done. The daily quota is the exception, because it needs the client's history, and history lives where the data lives.",
        },
        {
          kind: "your_turn",
          prompt:
            "You are designing rate limits for an asset-upload API with three tiers: free, pro, and enterprise. Name the per-second rate and the daily quota for each, and say which one you would enforce at the edge and which you would enforce after the request is admitted.",
        },
        {
          kind: "compare",
          body: "A beginner sets one limit for everyone and calls it done. An engineer sets a table, enforces the per-second limit at the edge and the daily quota after admission, and monitors per-tier 429 rates to confirm the tiers are fair.\n\nThe trap is enforcing the daily quota at the edge. The edge sees every request but does not know the client's history; the quota check belongs where the history is, which is the application tier or a shared store.",
        },
        {
          kind: "recap",
          points: [
            "A quota is a budget over a long window; a rate limit is a budget over a short one",
            "Tiered allowances match the product, not the technology",
            "Per-second limits belong at the edge; daily quotas belong where the history is",
            "The tier is determined by the API key and checked before admission",
          ],
        },
      ],
    },
    {
      slug: "load-shedding",
      title: "Backpressure and load shedding",
      attribution:
        "Synthesised from Google's SRE book chapter on handling overload and the AWS builders' library article on load shedding.",
      sources: [
        {
          label: "SRE book — handling overload",
          url: "https://sre.google/sre-book/handling-overload/",
        },
        {
          label:
            "AWS builders' library — using load shedding to avoid overload",
          url: "https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "When the queue fills",
          body: "Rate limiting stops the bot, but a traffic spike can still exceed what the app can process. A queue smooths short bursts, but a queue that never empties just delays the outage — every request waits, and the wait is the new failure mode. Load shedding rejects new work early so the rest of the system stays alive.",
        },
        {
          kind: "concept",
          title: "Queue depth versus latency",
          body: "Little's Law says concurrency equals arrival rate times latency. A deep queue raises latency for everyone without adding capacity, because the capacity is fixed and the queue just holds the overflow. Better to shed load and return 429 immediately than to make every request wait ten seconds.\n\nThe choice is between two failures: a fast rejection that the client can retry, and a slow timeout that the client cannot. The first is recoverable; the second is not.",
        },
        {
          kind: "concept",
          title: "What to shed",
          body: "Not all requests are equal. A health check is more important than an asset upload; a paying customer is more important than a free one; a request that is about to time out anyway is worth nothing. Load shedding needs a priority, and the priority needs to be cheap to compute, because the decision happens on every request.\n\nGoogle's SRE book describes the practical shape: classify requests by importance, shed the least important first, and shed aggressively enough that the system recovers. Shedding 10% is usually enough; shedding 50% is a sign that the system was already broken.\n\nThe cheapest priority is the one the request already carries: its endpoint. A read of a public page and a write of an asset are different calls, and the balancer can tell them apart without parsing a body. A second dimension — the client's tier — is a header or an API key, and the same. Build the priority from what is already on the request, not from a lookup that has to succeed before the shedding decision can be made.",
        },
        {
          kind: "concept",
          title: "Backpressure as a signal",
          body: "A queue that is filling is a signal, and the signal should travel upstream. When the app tier is full, it should tell the balancer, and the balancer should tell the client, and the client should slow down. That chain is backpressure, and it is the difference between a system that degrades gracefully and one that collapses.\n\nThe simulator models the simplest version: when utilisation reaches 1, the request is shed and counted as a `shed` error. The client sees a 503, and a well-behaved client backs off. A badly behaved client retries immediately, which is why rate limiting and load shedding are not alternatives — they are layers.",
        },
        {
          kind: "concept",
          title: "Shedding is a decision, not a failure",
          body: "A shed request is often described as an error, and that wording hides the design. The server chose to refuse it, early and cheaply, because serving it would have made every other request slower and possibly failed some of them too. Shedding is the system spending its capacity on the requests it can finish instead of the ones it cannot.\n\nThat means a shed request is not evidence of a bug; a *rising* shed rate is. Zero shedding at peak is a sign you are over-provisioned, and constant shedding at normal load is a sign the queue is too short or the capacity is too low. The number to watch is the share, and the number to alert on is the trend.",
        },
        {
          kind: "your_turn",
          prompt:
            "If the Upload API queue is full, should you make new uploads wait or reject them? What does each choice do to real users during a spike, and how does the client's retry behaviour change the answer?",
        },
        {
          kind: "compare",
          body: "A beginner makes everyone wait and watches p99 latency explode, then wonders why the system fell over. A senior engineer sheds load at the edge: quick rejections for new work, fast responses for what the system can actually finish, and a Retry-After header so the client knows when to come back.\n\nThe trap is shedding without a Retry-After. A client that is rejected and not told when to retry retries immediately, which is worse than no shedding at all.",
        },
        {
          kind: "recap",
          points: [
            "A queue smooths bursts but adds latency proportional to depth",
            "Load shedding rejects early instead of cascading failure",
            "Little's Law connects queue depth, arrival rate, and latency",
            "Shed by priority: health checks first, uploads last",
            "Backpressure is the signal that travels upstream",
            "Shedding without Retry-After causes immediate retry storms",
          ],
        },
      ],
    },
    {
      slug: "429-and-retry-after",
      title: "429 and Retry-After",
      attribution:
        "Synthesised from MDN's documentation of HTTP 429 and the Retry-After header.",
      sources: [
        {
          label: "MDN — 429 Too Many Requests",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429",
        },
        {
          label: "MDN — Retry-After header",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The client's side of the contract",
          body: "Every 429 is a contract: the server is saying “I cannot serve this now, and here is when you should try again.” A 429 without a Retry-After is a door slammed in the client's face; a 429 with one is a polite refusal with a time. The difference determines whether the client backs off or hammers the server harder.",
        },
        {
          kind: "concept",
          title: "429 and its headers",
          body: "HTTP 429 Too Many Requests means the client has sent too many requests in a given amount of time. The response should include a `Retry-After` header — either a number of seconds or an HTTP date — telling the client when it may retry.\n\nMDN is explicit about the client's obligation: *“The Retry-After response HTTP header indicates how long the user agent should wait before making a follow-up request.”* A client that ignores it is a badly behaved client, and a server that does not send it is asking for a retry storm.\n\nThe header accepts two formats, and the choice matters. A number of seconds is relative and survives a clock that is slightly wrong; an HTTP date is absolute and survives a wait that is long enough for a client to restart. For a rate limit measured in seconds, the relative form is almost always the right one.",
        },
        {
          kind: "concept",
          title: "Retry-After versus exponential backoff",
          body: "Retry-After is server-driven: the server knows its own capacity and tells the client exactly when to come back. Exponential backoff is client-driven: the client guesses, doubles the wait on each failure, and adds jitter to avoid synchronising with other clients.\n\nThe two are not alternatives. Retry-After is the right answer when the server knows the answer; exponential backoff is the right answer when it does not, or when the client cannot trust the server's number. A robust client uses both: Retry-After when it is present, exponential backoff with jitter when it is not.",
        },
        {
          kind: "concept",
          title: "Jitter and the thundering herd",
          body: "When a server returns Retry-After: 60, every client that was rejected waits exactly 60 seconds and retries at the same instant. The server was just recovering, and now it is hit by a synchronised wave that is worse than the original traffic. Jitter — adding a random offset to the wait — desynchronises the retries and turns a spike into a gentle ramp.\n\nThis is the same problem as the autoscaler's stabilisation window, and the same answer: randomness in the client's timing is a feature, not a bug.",
        },
        {
          kind: "concept",
          title: "What a well-behaved client does",
          body: "A client that respects the contract has four rules, and each one exists because of a failure the server cannot prevent on its own.\n\n**Honour Retry-After when it is present.** The server knows its own capacity; a client guessing is a client making the problem worse.\n\n**Exponential backoff with full jitter when it is not.** Start at a short wait, double it on each failure, and randomise in [0, wait]. The randomness is what prevents a fleet of clients from retrying in lockstep.\n\n**Cap the number of attempts.** An infinite retry loop against a service that is down is a slow denial of service. Pick a ceiling, and surface the failure to the user after it.\n\n**Do not retry non-idempotent writes blindly.** An asset upload that times out may have succeeded; retrying it may create a duplicate. That is the next module's subject, and the reason a 429 is easier to handle than a 500: a 429 means the request was never started.",
        },
        {
          kind: "your_turn",
          prompt:
            "Your API returns 429 with Retry-After: 30. A client library retries immediately on any non-2xx response. What happens, and what is the smallest change to the client that fixes it?",
        },
        {
          kind: "compare",
          body: "A beginner sees 429 and retries immediately, because “it failed, try again”. An engineer sees 429 and reads the header, because the server just told them exactly when it will be ready.\n\nThe trap is treating 429 like 500. A 500 means “something broke, maybe try again”; a 429 means “I am fine, you are too fast, come back later.” Retrying a 429 immediately is not persistence; it is a denial-of-service attack on yourself, and it is the single most common cause of a small overload turning into a large one.",
        },
        {
          kind: "recap",
          points: [
            "429 means too many requests in a given window",
            "Retry-After tells the client when to come back",
            "Server-driven (Retry-After) and client-driven (backoff) are complementary",
            "Jitter desynchronises retries and prevents thundering herds",
            "Retrying a 429 immediately is a self-inflicted denial of service",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "A bot is sending 400 uploads per second and real users are timing out. How do you rate limit it without hurting real users?",
    strongAnswer:
      "I would put a per-client rate limit on the load balancer, which is the first thing every request touches. I would set the allowance above the real-user peak and below the bot's rate, so the bot alone gets 429s. I would monitor per-client error classes to confirm real users see zero errors, and add a short queue with load shedding so a spike sheds load instead of cascading. I would never apply one aggregate cap, because that punishes real users along with the bot. For a distributed system I would use a shared counter, accepting that it will be a few percent loose, because a per-balancer limit is not a limit at all. And I would return 429 with a Retry-After header, because a client that is not told when to come back retries immediately.",
    trap: "Applying a single global request cap and calling it rate limiting — that throttles real users too. Also, putting the limiter behind the app server means the bot already consumed capacity before it was rejected. And returning 429 without Retry-After causes retry storms.",
  },
  task,
  recap: [
    "Rate limiting is per-client; an aggregate cap cannot separate a bot from real users",
    "Put the limiter at the load balancer so it sees every request first",
    "Set the allowance above the real-user peak and below the bot's rate",
    "Token buckets allow bursts; sliding windows count over rolling time",
    "A shared counter fixes distributed limiting at the cost of a hop",
    "Netflix adapts the limit from measured latency instead of a fixed number",
    "Load shedding rejects early; backpressure tells the client to slow down",
    "429 without Retry-After causes retry storms",
  ],
  attribution:
    "Synthesised from Stripe's rate-limiting documentation, Netflix's concurrency-limits repository, donnemartin/system-design-primer, Google's SRE book chapter on handling overload, the AWS builders' library article on load shedding, and MDN's documentation of HTTP 429 and Retry-After. Sources are linked per lesson; the capacity figures and measured error rates come from this module's canvas.",
};

export default module;
