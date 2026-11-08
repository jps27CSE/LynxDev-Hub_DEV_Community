import type { SdEdge, SdGraph, SdTaskDef } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";
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

const task: SdTaskDef =   {
    brief:
      "A bot is doing 400 uploads per second inside 6,000 requests per second of traffic, and the load balancer has no per-client limit. Set a per-client allowance below the bot's rate so the bot receives 429s and real users complete with zero errors.",
    startGraph: taskGraph(null),
    solutionGraph: taskGraph(3600),
    steps: [
      {
        id: "set-rate-limit",
        title: "Rate-limit the abusive client",
        brief:
          "Give the load balancer a per-minute allowance below the bot's 24,000 req/min so its requests are rejected as 429s.",
        hint: "Select the load balancer node and set its Rate Limit (per min) in the inspector.",
        reveal:
          "Set `rateLimitPerMin` to 3,600 (60 req/s). The bot's 400 req/s exceeds it and is rejected; real users are never rate-limited because the limiter only applies to the abusive client.",
        check: (graph) => {
          const lb = graph.nodes.find((node) => node.type === "load_balancer");
          const limit = (lb as any)?.rateLimitPerMin ?? null;
          const passed = limit !== null && limit < 24_000 && limit > 0;
          return {
            passed,
            progress: passed
              ? `✓ Rate limit set to ${limit} req/min, below the bot's 24,000 req/min`
              : limit === null
                ? "No rate limit configured yet"
                : limit <= 0
                  ? "Rate limit must be greater than zero"
                  : `${limit} req/min — set it below 24,000`,
          };
        },
      },
      {
        id: "keep-the-load",
        title: "Do not shrink the problem",
        brief:
          "The traffic is 6,000 requests a second, 40% of it abusive. Lowering the arrival rate changes the question, not the answer.",
        hint: "Check the scenario's arrival rate in the inspector.",
        reveal:
          "A capacity problem is only solved by refusing the wrong traffic, not by removing it. At 1,000 requests a second the app tier would sit at 25% and every criterion would pass while the production incident continues.",
        check: (graph) => {
          const arrivals = graph.scenario.arrivalRate;
          return {
            passed: arrivals >= 6_000,
            progress:
              arrivals >= 6_000
                ? `✓ ${arrivals.toLocaleString()} r/s — the load is unchanged`
                : `${arrivals.toLocaleString()} r/s is below the 6,000 r/s the system is expected to serve`,
          };
        },
      },
      {
        id: "leave-room-for-real-clients",
        title: "Leave room for real clients",
        brief:
          "The allowance must sit above what a real client needs and below what the bot sends: at least 600 req/min, and under 24,000.",
        hint: "A limit of one request per minute rejects the bot and every real uploader with it. The engine cannot tell you that; this step can.",
        reveal:
          "The bot sends 400 req/s, which is 24,000 req/min. A real uploader needs a handful per minute. 3,600 req/min — 60 per second — is comfortably above a real client's peak and far below the bot's, and it is the number the lesson argues for.",
        check: (graph) => {
          const lb = graph.nodes.find((node) => node.type === "load_balancer");
          const limit = (lb as { rateLimitPerMin?: number | null } | undefined)
            ?.rateLimitPerMin;
          const passed =
            typeof limit === "number" && limit >= 600 && limit < 24_000;
          return {
            passed,
            progress:
              limit === null || limit === undefined
                ? "No rate limit configured yet"
                : passed
                  ? `✓ ${limit.toLocaleString()} req/min — above a real client's peak, below the bot's 24,000`
                  : limit < 600
                    ? `${limit} req/min would reject real uploaders along with the bot`
                    : `${limit} req/min is at or above the bot's 24,000 req/min, so it rejects nothing`,
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
          "The bot's 400 req/s must exceed the load balancer's per-client allowance so its uploads are rejected as 429s.",
        assert: (result) =>
          result.valid && (result.errorClasses.rejected ?? 0) > 0,
      },
      {
        id: "real-users-complete",
        label: "Real users complete with zero errors",
        required: true,
        explain:
          "Rate limiting only touches the abusive client. Once the bot is rejected at the door, the app tier has capacity for real users and shed, unreachable, and stale errors must all stay at zero.",
        assert: (result) =>
          result.valid &&
          (result.errorClasses.shed ?? 0) === 0 &&
          (result.errorClasses.unreachable ?? 0) === 0 &&
          (result.errorClasses.stale ?? 0) === 0,
      },
      {
        id: "app-headroom",
        label: "App tier utilisation under 95%",
        required: true,
        explain:
          "Without the limit the bot's traffic fills the app tier past capacity and real uploads are shed. Rejecting the bot at the door must leave the app tier with headroom.",
        assert: (result) => {
          const app = result.perNode.find((n) => n.id === "app-1");
          return !!app && app.utilisation < 0.95;
        },
      },
    ]
  }

export default task;

export const title = "Rate Limiting & Backpressure";
