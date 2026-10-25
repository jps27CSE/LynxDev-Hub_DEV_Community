import type { SdGraph, SdModule } from "../types";

const NO_RETRY = { attempts: 0, backoffMs: 0, jitter: false };

function diagramGraph(rateLimitPerMin: number | null): SdGraph {
  return {
    nodes: [
      { id: "client-1", type: "client", label: "Users", x: 40, y: 200 },
      {
        id: "lb-1",
        type: "load_balancer",
        label: "Load Balancer",
        x: 200,
        y: 200,
        algorithm: "rr",
        rateLimitPerMin,
      },
      {
        id: "app-1",
        type: "app_server",
        label: "Upload API",
        x: 390,
        y: 200,
        replicas: 2,
        maxConcurrency: null,
        breakerEnabled: false,
      },
      {
        id: "db-1",
        type: "database",
        label: "Photo metadata",
        x: 620,
        y: 200,
        readReplicas: 2,
        partitions: 1,
        hotKeyShare: 0,
      },
    ],
    edges: [
      {
        id: "e1",
        from: "client-1",
        to: "lb-1",
        label: null,
        retry: NO_RETRY,
        partitioned: false,
      },
      {
        id: "e2",
        from: "lb-1",
        to: "app-1",
        label: null,
        retry: NO_RETRY,
        partitioned: false,
      },
      {
        id: "e3",
        from: "app-1",
        to: "db-1",
        label: "insert upload",
        retry: NO_RETRY,
        partitioned: false,
      },
    ],
    scenario: {
      arrivalRate: 1_000,
      writeShare: 0.9,
      mediaShare: 0,
      bytesPerMediaRequest: 2_000_000,
      abusiveShare: 0.4,
      latencyJitterMs: 0,
      cacheColdStart: false,
      replicaLagMs: 0,
    },
  };
}

function taskGraph(rateLimitPerMin: number | null): SdGraph {
  const graph = diagramGraph(rateLimitPerMin);
  graph.nodes[2] = {
    id: "app-1",
    type: "app_server",
    label: "Upload API",
    x: 390,
    y: 200,
    replicas: 4,
    maxConcurrency: null,
    breakerEnabled: false,
  };
  graph.scenario.arrivalRate = 1_000;
  return graph;
}

const module: SdModule = {
  slug: "rate-limiting",
  order: 9,
  part: 1,
  partTitle: "Scaling up",
  title: "Rate Limiting & Backpressure",
  description:
    "Keep one abusive client from drowning out everyone else, and shed load before the whole stack falls over.",
  story:
    "The photo-sharing app is handling 1,000 requests a second when a bot starts doing 400 uploads per second — 40% of all traffic, all writes. The Upload API and database are still healthy, but they are spending their capacity on the bot's garbage. Real users begin to time out because the bot is first in line. We need to throttle the bot without slowing a single real upload.",
  chapters: [
    {
      slug: "why-rate-limit",
      title: "Why rate limit?",
      description: "Protect capacity from a single misbehaving client.",
      children: [
        {
          slug: "capacity-is-finite",
          title: "Capacity is finite",
          description:
            "Every instance can serve only so many requests per second.",
        },
        {
          slug: "one-client-should-not-win",
          title: "One client should not win",
          description:
            "Why a fair system limits per-client, not just aggregate, traffic.",
        },
      ],
    },
    {
      slug: "algorithms-and-placement",
      title: "Algorithms and placement",
      description:
        "Token bucket, leaky bucket, sliding window — and why the limit belongs at the edge.",
      children: [
        {
          slug: "token-bucket",
          title: "Token bucket",
          description:
            "Allow bursts up to a bucket depth, then throttle to a steady rate.",
        },
        {
          slug: "sliding-window",
          title: "Sliding window",
          description:
            "Count requests in a rolling time window instead of fixed buckets.",
        },
        {
          slug: "where-to-limit",
          title: "Where to limit",
          description:
            "The load balancer sits in front of everything, so it is the only place a per-client limit can see all traffic.",
        },
      ],
    },
    {
      slug: "backpressure-and-shedding",
      title: "Backpressure and shedding",
      description: "Queue what you can, drop the rest, and tell the client.",
      children: [
        {
          slug: "queue-depth",
          title: "Queue depth",
          description:
            "A short queue smooths bursts; a deep queue just adds latency.",
        },
        {
          slug: "load-shedding",
          title: "Load shedding",
          description:
            "When the queue is full, reject new work instead of cascading failure.",
        },
      ],
    },
  ],
  lessons: [
    {
      slug: "the-bot-in-your-traffic",
      title: "The bot in your traffic",
      attribution:
        "Synthesised from donnemartin/system-design-primer and algomaster.io",
      sections: [
        {
          kind: "scenario",
          title: "400 uploads a second",
          body: "A single bot is issuing 400 photo uploads per second. That is 40% of the app's 1,000 req/s, and every one is an expensive write. The database and app servers have spare capacity, but they are busy with the bot. Real users' uploads queue behind the bot's requests and time out.",
        },
        {
          kind: "concept",
          title: "Rate limiting is per-client, not aggregate",
          body: 'An aggregate cap ("no more than 1,000 req/s overall") cannot tell the bot from a real user. Rate limiting assigns each client its own allowance and rejects requests from clients that exceed it. The simulator models one abusive client inside normal traffic: `abusiveShare` marks those arrivals, and the load balancer\'s `rateLimitPerMin` rejects them as `rejected` errors.',
        },
        {
          kind: "diagram",
          caption:
            "The load balancer rejects the abusive client before it reaches the app",
          graph: diagramGraph(null),
        },
        {
          kind: "your_turn",
          prompt:
            "The bot is 400 of your 1,000 req/s. If you set a per-client limit of 60 req/s, what happens to the bot and to real users? Why does per-client matter here?",
        },
        {
          kind: "compare",
          body: "A beginner applies one global cap and watches real users get throttled along with the bot. A senior engineer limits per client at the edge so the bot alone pays for its traffic.",
        },
        {
          kind: "recap",
          points: [
            "Rate limiting is per-client; an aggregate cap cannot separate a bot from real users",
            "The load balancer is the right place because it sees every request first",
            "In the simulator, `abusiveShare` marks the bot and `rateLimitPerMin` rejects it",
            "Rejected requests show up as the `rejected` error class",
          ],
        },
      ],
    },
    {
      slug: "algorithms",
      title: "Token bucket, leaky bucket, sliding window",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "Bursts versus steady rate",
          body: "A client that posts ten photos in one second then goes quiet should not be punished the same as a client posting ten every second for an hour. Token buckets allow bursts up to a depth; sliding windows count within a rolling period; leaky buckets smooth to a fixed rate.",
        },
        {
          kind: "concept",
          title: "Choose by cost of a mistake",
          body: "Too strict, and real users see 429s during harmless bursts. Too loose, and the bot still wins. The simulator's `rateLimitPerMin` is a steady per-minute allowance: the bot's `abusiveShare × arrivalRate` is compared against it, and everything above is rejected.",
        },
        {
          kind: "your_turn",
          prompt:
            "Your real users peak at 50 uploads per minute each. The bot sends 400 per second. What limit do you set, and how do you know you are not throttling real users?",
        },
        {
          kind: "compare",
          body: "A strong answer names the per-client real-user peak, sets the limit above it, and confirms the bot's rate exceeds the limit. It also notes that a per-client limit never touches real users at all.",
        },
        {
          kind: "recap",
          points: [
            "Token buckets allow bursts; sliding windows count over rolling time",
            "Set the limit above the real-user peak, below the bot's rate",
            "The simulator rejects any client whose rate exceeds `rateLimitPerMin`",
          ],
        },
      ],
    },
    {
      slug: "backpressure",
      title: "Backpressure and load shedding",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "When the queue fills",
          body: "Rate limiting stops the bot, but a traffic spike can still exceed what the app can process. A queue smooths short bursts, but a queue that never empties just delays the outage. Load shedding rejects new work early so the rest of the system stays alive.",
        },
        {
          kind: "concept",
          title: "Queue depth versus latency",
          body: "Little's Law says concurrency equals arrival rate times latency. A deep queue raises latency for everyone without adding capacity. Better to shed load and return 429 immediately than to make every request wait ten seconds.",
        },
        {
          kind: "your_turn",
          prompt:
            "If the Upload API queue is full, should you make new uploads wait or reject them? What does each choice do to real users during a spike?",
        },
        {
          kind: "compare",
          body: "A beginner makes everyone wait and watches p99 latency explode. A senior engineer sheds load at the edge: quick rejections for new work, fast responses for what the system can actually finish.",
        },
        {
          kind: "recap",
          points: [
            "A queue smooths bursts but adds latency proportional to depth",
            "Load shedding rejects early instead of cascading failure",
            "Little's Law connects queue depth, arrival rate, and latency",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "A bot is sending 400 uploads per second and real users are timing out. How do you rate limit it without hurting real users?",
    strongAnswer:
      "I would put a per-client rate limit on the load balancer, which is the first thing every request touches. I would set the allowance above the real-user peak and below the bot's rate, so the bot alone gets 429s. I would monitor per-client error classes to confirm real users see zero errors, and add a short queue with load shedding so a spike sheds load instead of cascading. I would never apply one aggregate cap, because that punishes real users along with the bot.",
    trap: "Applying a single global request cap and calling it rate limiting — that throttles real users too. Also, putting the limiter behind the app server means the bot already consumed capacity before it was rejected.",
  },
  task: {
    brief:
      "A bot is doing 400 uploads per second inside 1,000 req/s of traffic. Set a per-client rate limit on the load balancer so the bot receives 429s while real users see zero errors.",
    startGraph: taskGraph(null),
    solutionGraph: taskGraph(3600),
    steps: [
      {
        id: "set-rate-limit",
        title: "Rate-limit the abusive client",
        brief:
          "Give the load balancer a per-minute allowance below the bot's 400 req/s (24,000/min) so its requests are rejected as 429s.",
        hint: "Select the load balancer node and set its Rate Limit (per min) in the inspector.",
        reveal:
          "Set `rateLimitPerMin` to 3,600 (60 req/s). The bot's 400 req/s exceeds it and is rejected; real users are never rate-limited because the limiter only applies to the abusive client.",
        check: (graph) => {
          const lb = graph.nodes.find((node) => node.type === "load_balancer");
          const limit = (lb as any)?.rateLimitPerMin ?? null;
          const passed = limit !== null && limit < 24_000;
          return {
            passed,
            progress: passed
              ? `✓ Rate limit set to ${limit} req/min, below the bot's 24,000 req/min`
              : limit === null
                ? "No rate limit configured yet"
                : `${limit} req/min — raise it above 24,000 or lower it below`,
          };
        },
      },
      {
        id: "keep-real-users-safe",
        title: "Verify real users are untouched",
        brief:
          "Confirm the limit rejects the bot and only the bot: real users complete their uploads with no errors.",
        hint: "Run the simulation and check the error classes: rejected should be greater than zero, and unreachable/stale/shed should be zero.",
        reveal:
          "The engine flags only abusive clients as `rejected`. If `errorClasses.rejected > 0` and the other classes are zero, real users passed through cleanly.",
        check: (graph) => {
          // Graph-level proxy: the limit must exist and be below the bot rate.
          // The error-class assertion lives in the pass criteria instead.
          const lb = graph.nodes.find((node) => node.type === "load_balancer");
          const limit = (lb as any)?.rateLimitPerMin ?? null;
          return {
            passed: limit !== null && limit < 24_000 && limit > 0,
            progress:
              limit !== null && limit < 24_000
                ? "Rate limit is active below the bot rate"
                : "Configure a rate limit below 24,000 req/min",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "bot-gets-429s",
        label: "Bot receives 429s (rejected > 0)",
        required: true,
        explain:
          "The bot's 400 req/s must exceed the load balancer's per-client allowance so its uploads are rejected.",
        assert: (result) =>
          result.valid && (result.errorClasses.rejected ?? 0) > 0,
      },
      {
        id: "real-users-safe",
        label: "Real users see zero errors",
        required: true,
        explain:
          "The rate limiter only touches the abusive client, so unreachable, stale, and shed errors must all stay at zero.",
        assert: (result) =>
          result.valid &&
          (result.errorClasses.unreachable ?? 0) === 0 &&
          (result.errorClasses.stale ?? 0) === 0 &&
          (result.errorClasses.shed ?? 0) === 0,
      },
    ],
  },
  recap: [
    "Rate limiting is per-client; an aggregate cap cannot separate a bot from real users",
    "Put the limiter at the load balancer so it sees every request first",
    "Set the allowance above the real-user peak and below the bot's rate",
    "Rejected requests appear as the `rejected` error class; real users keep zero errors",
  ],
  attribution:
    "Synthesised from donnemartin/system-design-primer (375k★), algomaster.io and KodeKloud System Design For Beginners",
};

export default module;
