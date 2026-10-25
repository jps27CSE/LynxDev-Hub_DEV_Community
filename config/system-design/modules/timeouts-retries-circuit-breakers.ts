import type { SdGraph, SdModule } from "../types";

const NO_RETRY = { attempts: 0, backoffMs: 0, jitter: false };

function diagramGraph(
  breakerEnabled: boolean,
  maxConcurrency: number | null,
): SdGraph {
  return {
    nodes: [
      { id: "client-1", type: "client", label: "Users", x: 40, y: 200 },
      {
        id: "lb-1",
        type: "load_balancer",
        label: "Load Balancer",
        x: 180,
        y: 200,
        algorithm: "rr",
        rateLimitPerMin: null,
      },
      {
        id: "app-1",
        type: "app_server",
        label: "API",
        x: 360,
        y: 200,
        replicas: 2,
        maxConcurrency,
        breakerEnabled,
      },
      {
        id: "resize-1",
        type: "app_server",
        label: "Image Resize",
        x: 560,
        y: 200,
        replicas: 1,
        maxConcurrency: null,
        breakerEnabled: false,
      },
      {
        id: "db-1",
        type: "database",
        label: "Database",
        x: 760,
        y: 200,
        readReplicas: 1,
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
        to: "resize-1",
        label: "resize",
        retry: { attempts: 3, backoffMs: 50, jitter: false },
        partitioned: false,
      },
      {
        id: "e4",
        from: "app-1",
        to: "db-1",
        label: "metadata",
        retry: NO_RETRY,
        partitioned: false,
      },
    ],
    scenario: {
      arrivalRate: 500,
      writeShare: 0.2,
      mediaShare: 0,
      bytesPerMediaRequest: 2_000_000,
      abusiveShare: 0,
      latencyJitterMs: 0,
      cacheColdStart: false,
      replicaLagMs: 0,
    },
  };
}

function taskGraph(
  breakerEnabled: boolean,
  maxConcurrency: number | null,
): SdGraph {
  const graph = diagramGraph(breakerEnabled, maxConcurrency);
  graph.nodes[2] = {
    id: "app-1",
    type: "app_server",
    label: "API",
    x: 360,
    y: 200,
    replicas: breakerEnabled ? 2 : 1,
    maxConcurrency,
    breakerEnabled,
  };
  graph.scenario.arrivalRate = 1500;
  return graph;
}

const module: SdModule = {
  slug: "timeouts-retries-circuit-breakers",
  order: 12,
  part: 3,
  partTitle: "Reliability",
  title: "Timeouts, Retries & Circuit Breakers",
  description:
    "No timeout is worse than a bad one. Add backoff, jitter, bulkheads, and circuit breakers so a dead dependency cannot take the API down.",
  story:
    "The image-resize service is down. The API waits for it with no timeout, so API threads fill up waiting, new requests queue, and a resize-service outage becomes a full outage. We need timeouts to convert slow into failed, retries with backoff and jitter to avoid storms, a bulkhead to cap concurrency, and a circuit breaker to stop calling a dead dependency.",
  chapters: [
    {
      slug: "timeouts",
      title: "Timeouts",
      description: "No timeout is worse than a bad one.",
      children: [
        {
          slug: "why-timeouts",
          title: "Why timeouts",
          description: "Convert slow into failed and free the thread.",
        },
        {
          slug: "choosing-a-timeout",
          title: "Choosing a timeout",
          description:
            "Too short drops healthy requests; too long holds resources.",
        },
      ],
    },
    {
      slug: "retries",
      title: "Retries, backoff and jitter",
      description: "Retry safely without causing a storm.",
      children: [
        {
          slug: "retry-policy",
          title: "Retry policy",
          description: "Attempts, backoff, and jitter on an edge.",
        },
      ],
    },
    {
      slug: "breakers-and-bulkheads",
      title: "Circuit breakers & bulkheads",
      description: "Stop cascades and cap concurrency.",
      children: [
        {
          slug: "circuit-breaker",
          title: "Circuit breaker",
          description: "Stop calling a failing dependency.",
        },
        {
          slug: "bulkhead",
          title: "Bulkhead",
          description: "Cap concurrent calls to a dependency.",
        },
      ],
    },
  ],
  lessons: [
    {
      slug: "no-timeout-is-worse",
      title: "No timeout is worse than a bad one",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "The resize service is slow",
          body: "The image-resize service is down but not dead: it accepts connections and never responds. The API has no timeout, so every API thread blocks waiting for a resize that will never finish. New requests queue, the API stops responding, and a resize outage becomes a full outage.",
        },
        {
          kind: "concept",
          title: "Timeouts convert slow into failed",
          body: "A timeout turns 'slow' into 'failed', freeing the thread so the caller can return a degraded response or fail fast. No timeout is worse than a bad timeout because it turns a partial failure into a total one. The edge retry policy in the simulator carries attempts, backoffMs, and jitter for the retry half of this.",
        },
        {
          kind: "diagram",
          caption:
            "The API calls the resize service over an edge with a retry policy",
          graph: diagramGraph(false, null),
        },
        {
          kind: "your_turn",
          prompt:
            "The resize service is slow but not dead. Should the API wait, fail fast, or serve unresized images? What does each choice cost?",
        },
        {
          kind: "compare",
          body: "A beginner waits indefinitely hoping it recovers. A senior engineer fails fast with a timeout, serves a degraded response, and lets the circuit breaker reopen traffic when the dependency recovers.",
        },
        {
          kind: "recap",
          points: [
            "A slow dependency can take down its callers",
            "Timeouts convert slow into failed",
            "Degraded responses beat total outages",
            "No timeout is worse than a bad timeout",
          ],
        },
      ],
    },
    {
      slug: "retries-and-jitter",
      title: "Retries, backoff and jitter",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "The retry storm",
          body: "A service returns 503. A thousand clients retry immediately, tripling load on an already struggling service. The service slows further, more retries fire, and the system collapses.",
        },
        {
          kind: "concept",
          title: "Backoff and jitter",
          body: "Retries need a delay that grows with each attempt (backoff) and a random component (jitter) so retries do not synchronise into waves. The simulator's edge retry policy carries attempts, backoffMs, and jitter. Jitter desynchronises retry waves so a thousand clients do not all retry at the same instant.",
        },
        {
          kind: "your_turn",
          prompt:
            "A service returns 503. You retry 3 times with 100 ms backoff and no jitter. What happens if 1,000 clients do the same? How does jitter change it?",
        },
        {
          kind: "compare",
          body: "A beginner retries immediately and aggressively. A senior engineer retries with exponential backoff and jitter, and caps the total retry budget so a failing dependency cannot consume all client resources.",
        },
        {
          kind: "recap",
          points: [
            "Immediate retries amplify load on a struggling service",
            "Backoff spreads retries over time",
            "Jitter desynchronises retry waves",
            "Cap the total retry budget",
          ],
        },
      ],
    },
    {
      slug: "breakers-and-bulkheads",
      title: "Circuit breakers and bulkheads",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "Stop the cascade",
          body: "The resize service is dead. Instead of waiting for it on every request, the API should stop calling it for a while and return a degraded response. That is what a circuit breaker does.",
        },
        {
          kind: "concept",
          title: "Circuit breaker",
          body: "A circuit breaker stops calling a failing dependency for a while, returning an error immediately instead of waiting. It prevents a slow dependency from consuming all caller resources. The app server's `breakerEnabled` flag turns this on in the simulator.",
        },
        {
          kind: "concept",
          title: "Bulkhead",
          body: "A bulkhead caps how many concurrent calls a caller will make to a dependency, so one slow dependency cannot exhaust all threads. The app server's `maxConcurrency` is the bulkhead knob.",
        },
        {
          kind: "your_turn",
          prompt:
            "The resize service is dead. With the breaker off, the API waits and threads fill up. With the breaker on, what happens to API latency and error rate? What is the trade-off?",
        },
        {
          kind: "compare",
          body: "A beginner enables the breaker but leaves no fallback, so users see errors. A senior engineer enables the breaker and serves a degraded response (unresized images) so the API stays fast and available.",
        },
        {
          kind: "recap",
          points: [
            "Circuit breakers stop calling failing dependencies",
            "Bulkheads cap concurrency to a dependency",
            "Breakers need a fallback to avoid user-facing errors",
            "Together they keep a partial failure partial",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "The image-resize service is down. Your API must stay up. Walk me through your design.",
    strongAnswer:
      "I would add a timeout on the resize call so a slow dependency cannot hold threads forever, retries with exponential backoff and jitter so a flaky dependency is retried safely, a bulkhead capping concurrent resize calls so they cannot exhaust the API's thread pool, and a circuit breaker that stops calling the resize service when it is clearly dead and serves a degraded response (unresized images) instead. The API stays fast and available; users get slightly lower quality images until the resize service recovers.",
    trap: "Enabling retries without backoff or jitter, which causes a retry storm. Also, enabling a circuit breaker with no fallback, so users see errors instead of degraded service.",
  },
  task: {
    brief:
      "The image-resize service is down. Keep the API under 300 ms p95 with zero errors.",
    startGraph: taskGraph(false, null),
    solutionGraph: taskGraph(true, 10),
    steps: [
      {
        id: "enable-breaker",
        title: "Enable the circuit breaker",
        brief:
          "Turn on the circuit breaker on the API so it stops calling the dead resize service.",
        hint: "Select the API (app) node and enable its Circuit Breaker.",
        reveal:
          "Set breakerEnabled to true on the app server. It stops waiting on the dead resize service.",
        check: (graph) => {
          const app = graph.nodes.find(
            (node) => node.type === "app_server" && node.id === "app-1",
          );
          const passed = !!app && (app as any).breakerEnabled === true;
          return {
            passed,
            progress: passed
              ? "✓ Circuit breaker enabled"
              : "Circuit breaker is off",
          };
        },
      },
      {
        id: "add-bulkhead",
        title: "Add a bulkhead",
        brief:
          "Cap concurrent resize calls so they cannot exhaust the API's threads.",
        hint: "Select the API node and set its Max Concurrency.",
        reveal:
          "Set maxConcurrency to 10 or lower. Only that many resize calls run at once.",
        check: (graph) => {
          const app = graph.nodes.find(
            (node) => node.type === "app_server" && node.id === "app-1",
          );
          const cap = (app as any)?.maxConcurrency;
          const passed = !!app && cap !== null && cap > 0 && cap <= 10;
          return {
            passed,
            progress: passed
              ? `✓ Bulkhead at ${cap} concurrent`
              : cap === null
                ? "No bulkhead configured"
                : `${cap} — set to 10 or lower`,
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "api-p95",
        label: "API utilisation < 50% (breaker + bulkhead in place)",
        required: true,
        explain:
          "With the breaker on, the API stops waiting on the dead resize service and stays fast.",
        assert: (result) => {
          const app = result.perNode.find((node) => node.id === "app-1");
          return result.valid && !!app && app.utilisation < 0.5;
        },
      },
      {
        id: "zero-errors",
        label: "Zero errors",
        required: true,
        explain:
          "The API serves degraded responses instead of failing, so no requests error out.",
        assert: (result) => result.valid && result.errorRate === 0,
      },
    ],
  },
  recap: [
    "No timeout is worse than a bad timeout",
    "Retries need backoff and jitter",
    "Circuit breakers stop calling dead dependencies",
    "Bulkheads cap concurrency to a dependency",
    "Degraded responses beat total outages",
  ],
  attribution:
    "Synthesised from donnemartin/system-design-primer (375k★), algomaster.io and KodeKloud System Design For Beginners",
};

export default module;
