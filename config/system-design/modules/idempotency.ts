import type { SdGraph, SdModule } from "../types";

const NO_RETRY = { attempts: 0, backoffMs: 0, jitter: false };

function diagramGraph(retryLimit: number, dlqEnabled: boolean): SdGraph {
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
        label: "Upload API",
        x: 360,
        y: 200,
        replicas: 2,
        maxConcurrency: null,
        breakerEnabled: false,
      },
      {
        id: "queue-1",
        type: "queue",
        label: "Upload Queue",
        x: 560,
        y: 200,
        maxDepth: 1000,
        retryLimit,
        dlqEnabled,
      },
      {
        id: "worker-1",
        type: "worker",
        label: "Resize Worker",
        x: 760,
        y: 200,
        replicas: 2,
      },
      {
        id: "db-1",
        type: "database",
        label: "Database",
        x: 960,
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
        to: "queue-1",
        label: "enqueue",
        retry: NO_RETRY,
        partitioned: false,
      },
      {
        id: "e4",
        from: "queue-1",
        to: "worker-1",
        label: "consume",
        retry: NO_RETRY,
        partitioned: false,
      },
      {
        id: "e5",
        from: "worker-1",
        to: "db-1",
        label: "insert",
        retry: NO_RETRY,
        partitioned: false,
      },
    ],
    scenario: {
      arrivalRate: 200,
      writeShare: 0.9,
      mediaShare: 0,
      bytesPerMediaRequest: 2_000_000,
      abusiveShare: 0,
      latencyJitterMs: 0,
      cacheColdStart: false,
      replicaLagMs: 0,
    },
  };
}

function taskGraph(retryLimit: number, dlqEnabled: boolean): SdGraph {
  const graph = diagramGraph(retryLimit, dlqEnabled);
  graph.nodes[4] = {
    id: "worker-1",
    type: "worker",
    label: "Resize Worker",
    x: 760,
    y: 200,
    replicas: dlqEnabled ? 2 : 1,
  };
  graph.scenario.arrivalRate = 1200;
  return graph;
}

const module: SdModule = {
  slug: "idempotency",
  order: 13,
  part: 3,
  partTitle: "Reliability",
  title: "Idempotency & Safe Retries",
  description:
    "At-least-once delivery means duplicates. Use idempotency keys and dead-letter queues so a flaky network never creates five uploads.",
  story:
    "The client retried five times on a flaky network. The upload API accepted all five, and now the database has five duplicate photos. Retries are necessary for reliability, but without idempotency they create duplicates. We need idempotency keys so a retry is safe, and a dead-letter queue so poison messages do not block the pipeline forever.",
  chapters: [
    {
      slug: "at-least-once",
      title: "At-least-once delivery",
      description: "Why retries create duplicates.",
      children: [
        {
          slug: "why-duplicates",
          title: "Why duplicates happen",
          description:
            "A retry after a timeout may arrive after the first request already succeeded.",
        },
        {
          slug: "idempotency-keys",
          title: "Idempotency keys",
          description: "Make a retry safe by keying on a client-generated id.",
        },
      ],
    },
    {
      slug: "dead-letter-queues",
      title: "Dead-letter queues",
      description: "Handle poison messages without blocking the pipeline.",
      children: [
        {
          slug: "retry-limits",
          title: "Retry limits",
          description: "Cap retries so a bad message does not loop forever.",
        },
        {
          slug: "dlq",
          title: "Dead-letter queue",
          description: "Park unprocessable messages for later inspection.",
        },
      ],
    },
  ],
  lessons: [
    {
      slug: "at-least-once-delivery",
      title: "At-least-once delivery",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "Five duplicate uploads",
          body: "The client sent an upload, the network timed out before the response arrived, and the client retried five times. The server processed all five because it could not tell they were the same request. Five photos, one intent.",
        },
        {
          kind: "concept",
          title: "Idempotency keys",
          body: "An idempotency key is a client-generated id for an operation. The server records the result under that key and returns the same result for any retry with the same key. A retry becomes safe: it either does the work once or returns the cached result. The key must be generated by the client, not the server, or retries get new keys.",
        },
        {
          kind: "diagram",
          caption: "Uploads flow through a queue to workers and the database",
          graph: diagramGraph(3, true),
        },
        {
          kind: "your_turn",
          prompt:
            "A payment charge is retried three times because of a timeout. How do you ensure the customer is charged once, not three times?",
        },
        {
          kind: "compare",
          body: "A beginner says 'make the operation idempotent by checking if it already happened'. A senior engineer adds a client-generated idempotency key, stores the result, and returns it on retry, so the check is explicit and auditable.",
        },
        {
          kind: "recap",
          points: [
            "At-least-once delivery produces duplicates",
            "Idempotency keys make retries safe",
            "The key must be client-generated",
            "Store and return the result for retries",
          ],
        },
      ],
    },
    {
      slug: "dead-letter-queues",
      title: "Dead-letter queues",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "The poison message",
          body: "A malformed upload message reaches the worker. The worker fails, the message is retried, fails again, retried again. The queue is now blocked by one bad message and good uploads pile up behind it.",
        },
        {
          kind: "concept",
          title: "Retry limits and DLQs",
          body: "Cap retries with a retry limit. After that many failures, move the message to a dead-letter queue for later inspection instead of retrying forever. The queue stays unblocked and the bad message is preserved for debugging. The simulator's queue carries retryLimit and dlqEnabled for exactly this.",
        },
        {
          kind: "your_turn",
          prompt:
            "A message has failed 5 times. Should you retry forever, drop it, or park it? What does each choice cost?",
        },
        {
          kind: "compare",
          body: "A beginner retries forever and blocks the queue. A senior engineer caps retries, parks the message in a DLQ, alerts, and keeps the pipeline moving.",
        },
        {
          kind: "recap",
          points: [
            "At-least-once means duplicates are possible",
            "Idempotency keys make retries safe",
            "Retry limits prevent infinite loops",
            "Dead-letter queues park poison messages",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "The client retried 5 times on a flaky network and you now have 5 duplicate uploads. How do you prevent this?",
    strongAnswer:
      "I would add a client-generated idempotency key to every upload. The server records the result under that key and returns the same result for any retry, so retries are safe. For the async pipeline, I would cap retries on the queue with a retry limit and route poison messages to a dead-letter queue so one bad message cannot block the whole pipeline. Idempotency is at the API boundary; the DLQ is at the worker boundary.",
    trap: "Saying 'check if the upload already exists' without an idempotency key — that check races and is not auditable. Also, retrying forever on a poison message and blocking the queue.",
  },
  task: {
    brief:
      "The client retried 5 times on a flaky network. Configure the queue so retries are capped and poison messages go to a dead-letter queue.",
    startGraph: taskGraph(10, false),
    solutionGraph: taskGraph(3, true),
    steps: [
      {
        id: "cap-retries",
        title: "Cap retries",
        brief:
          "Set the queue's retry limit to 3 or fewer so a failing message cannot retry forever.",
        hint: "Select the queue and lower its Retry Limit.",
        reveal:
          "Set retryLimit to 3. After 3 failures the message stops retrying.",
        check: (graph) => {
          const q = graph.nodes.find((node) => node.type === "queue");
          const limit = (q as any)?.retryLimit ?? 0;
          const passed = !!q && limit > 0 && limit <= 3;
          return {
            passed,
            progress: passed
              ? `✓ Retry limit ${limit}`
              : `Retry limit ${limit} — set to 3 or fewer`,
          };
        },
      },
      {
        id: "enable-dlq",
        title: "Enable the dead-letter queue",
        brief:
          "Turn on the dead-letter queue so poison messages are parked, not retried forever.",
        hint: "Select the queue and enable its DLQ.",
        reveal:
          "Set dlqEnabled to true. Failed messages beyond the retry limit go to the DLQ.",
        check: (graph) => {
          const q = graph.nodes.find((node) => node.type === "queue");
          const passed = !!q && (q as any)?.dlqEnabled === true;
          return {
            passed,
            progress: passed ? "✓ DLQ enabled" : "DLQ is off",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "queue-stable",
        label: "Worker utilisation < 70%",
        required: true,
        explain:
          "With capped retries and a DLQ, poison messages stop blocking the pipeline and worker utilisation stays healthy.",
        assert: (result) => {
          const w = result.perNode.find((node) => node.id === "worker-1");
          return result.valid && !!w && w.utilisation < 0.7;
        },
      },
    ],
  },
  recap: [
    "At-least-once delivery produces duplicates",
    "Idempotency keys make retries safe",
    "Retry limits prevent infinite loops",
    "Dead-letter queues park poison messages",
    "Idempotency at the API, DLQ at the worker",
  ],
  attribution:
    "Synthesised from donnemartin/system-design-primer (375k★), algomaster.io and KodeKloud System Design For Beginners",
};

export default module;
