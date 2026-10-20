/**
 * @file
 *
 * Pins `validateGraph` and all Zod schemas in `lib/system-design/validation.ts`.
 *
 * This is the **validation boundary** for the system-design feature. Every graph
 * that enters the system — whether from a share link (`decodeGraph`), the
 * canvas save API, or a module's `startGraph`/`solutionGraph` — passes through
 * `SdGraphSchema.safeParse`.
 *
 * Attack surface:
 *   - User-supplied JSON from share links (decoded base64url)
 *   - User-supplied JSON from canvas save (POST body)
 *   - Hand-authored module content (startGraph/solutionGraph in modules/)
 *
 * The schemas enforce:
 *   - Discriminated union on node `type` (9 variants)
 *   - String length bounds (id: 1-64, label: 1-128)
 *   - Numeric bounds (replicas: 1-100, hitRate: 0-1, etc.)
 *   - Array bounds (nodes: 1-40, edges: max 120)
 *   - Scenario bounds (arrivalRate: 0-1M, writeShare: 0-1, etc.)
 *
 * A regression here means either:
 *   - A malicious payload bypasses validation (security)
 *   - A valid graph is rejected (usability)
 *   - An invalid graph is accepted (engine crashes / wrong results)
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validateGraph,
  SdNodeSchema,
  SdEdgeSchema,
  SdScenarioSchema,
  SdGraphSchema,
} from "../lib/system-design/validation";
import type { SdGraph, SdNode, SdEdge, SdScenario } from "../config/system-design/types";

/** Minimal valid graph for testing. */
function minimalGraph(): SdGraph {
  return {
    nodes: [
      { id: "c1", type: "client", label: "Client", x: 100, y: 100 },
      {
        id: "s1",
        type: "app_server",
        label: "App",
        x: 300,
        y: 100,
        replicas: 1,
        maxConcurrency: null,
        breakerEnabled: false,
      },
    ],
    edges: [
      {
        id: "e1",
        from: "c1",
        to: "s1",
        label: null,
        retry: { attempts: 0, backoffMs: 0, jitter: false },
        partitioned: false,
      },
    ],
    scenario: {
      arrivalRate: 100,
      writeShare: 0.1,
      mediaShare: 0,
      bytesPerMediaRequest: 1024,
      abusiveShare: 0,
      latencyJitterMs: 0,
      cacheColdStart: true,
      replicaLagMs: 0,
    },
  };
}

describe("SdNodeSchema — discriminated union of 9 node types", () => {
  const validClient = { id: "c1", type: "client", label: "Client", x: 0, y: 0 };
  const validAppServer = {
    id: "s1",
    type: "app_server",
    label: "App",
    x: 100,
    y: 0,
    replicas: 2,
    maxConcurrency: 100,
    breakerEnabled: true,
  };
  const validCache = {
    id: "cache1",
    type: "cache",
    label: "Cache",
    x: 200,
    y: 0,
    hitRate: 0.9,
    ttlMs: 60000,
    stampedeGuard: false,
  };
  const validDatabase = {
    id: "db1",
    type: "database",
    label: "DB",
    x: 300,
    y: 0,
    readReplicas: 2,
    partitions: 10,
    hotKeyShare: 0.1,
  };
  const validLoadBalancer = {
    id: "lb1",
    type: "load_balancer",
    label: "LB",
    x: 400,
    y: 0,
    algorithm: "rr" as const,
    rateLimitPerMin: 1000,
  };
  const validQueue = {
    id: "q1",
    type: "queue",
    label: "Queue",
    x: 500,
    y: 0,
    maxDepth: 1000,
    retryLimit: 3,
    dlqEnabled: true,
  };
  const validWorker = {
    id: "w1",
    type: "worker",
    label: "Worker",
    x: 600,
    y: 0,
    replicas: 3,
  };
  const validCdn = {
    id: "cdn1",
    type: "cdn",
    label: "CDN",
    x: 700,
    y: 0,
    hitRate: 0.95,
  };
  const validObjectStore = {
    id: "obj1",
    type: "object_store",
    label: "Objects",
    x: 800,
    y: 0,
  };

  const allValidNodes = [
    validClient,
    validAppServer,
    validCache,
    validDatabase,
    validLoadBalancer,
    validQueue,
    validWorker,
    validCdn,
    validObjectStore,
  ];

  it("accepts all 9 valid node types", () => {
    for (const node of allValidNodes) {
      const result = SdNodeSchema.safeParse(node);
      assert.equal(result.success, true, `Failed for ${node.type}: ${JSON.stringify(result.error?.issues)}`);
    }
  });

  it("rejects unknown type", () => {
    const result = SdNodeSchema.safeParse({ ...validClient, type: "unknown" });
    assert.equal(result.success, false);
  });

  it("rejects missing type", () => {
    const { type, ...rest } = validClient;
    const result = SdNodeSchema.safeParse(rest);
    assert.equal(result.success, false);
  });

  describe("string length bounds", () => {
    it("rejects id > 64 chars", () => {
      const result = SdNodeSchema.safeParse({ ...validClient, id: "x".repeat(65) });
      assert.equal(result.success, false);
    });

    it("accepts id = 64 chars", () => {
      const result = SdNodeSchema.safeParse({ ...validClient, id: "x".repeat(64) });
      assert.equal(result.success, true);
    });

    it("rejects empty id", () => {
      const result = SdNodeSchema.safeParse({ ...validClient, id: "" });
      assert.equal(result.success, false);
    });

    it("rejects label > 128 chars", () => {
      const result = SdNodeSchema.safeParse({ ...validClient, label: "x".repeat(129) });
      assert.equal(result.success, false);
    });

    it("accepts label = 128 chars", () => {
      const result = SdNodeSchema.safeParse({ ...validClient, label: "x".repeat(128) });
      assert.equal(result.success, true);
    });

    it("rejects empty label", () => {
      const result = SdNodeSchema.safeParse({ ...validClient, label: "" });
      assert.equal(result.success, false);
    });
  });

  describe("app_server specific bounds", () => {
    it("rejects replicas > 100", () => {
      const result = SdNodeSchema.safeParse({ ...validAppServer, replicas: 101 });
      assert.equal(result.success, false);
    });

    it("rejects replicas < 1", () => {
      const result = SdNodeSchema.safeParse({ ...validAppServer, replicas: 0 });
      assert.equal(result.success, false);
    });

    it("accepts maxConcurrency = null", () => {
      const result = SdNodeSchema.safeParse({ ...validAppServer, maxConcurrency: null });
      assert.equal(result.success, true);
    });

    it("rejects negative maxConcurrency", () => {
      const result = SdNodeSchema.safeParse({ ...validAppServer, maxConcurrency: -1 });
      assert.equal(result.success, false);
    });
  });

  describe("cache specific bounds", () => {
    it("rejects hitRate > 1", () => {
      const result = SdNodeSchema.safeParse({ ...validCache, hitRate: 1.1 });
      assert.equal(result.success, false);
    });

    it("rejects hitRate < 0", () => {
      const result = SdNodeSchema.safeParse({ ...validCache, hitRate: -0.1 });
      assert.equal(result.success, false);
    });

    it("rejects ttlMs <= 0", () => {
      const result = SdNodeSchema.safeParse({ ...validCache, ttlMs: 0 });
      assert.equal(result.success, false);
    });
  });

  describe("database specific bounds", () => {
    it("rejects readReplicas > 10", () => {
      const result = SdNodeSchema.safeParse({ ...validDatabase, readReplicas: 11 });
      assert.equal(result.success, false);
    });

    it("rejects readReplicas < 0", () => {
      const result = SdNodeSchema.safeParse({ ...validDatabase, readReplicas: -1 });
      assert.equal(result.success, false);
    });

    it("rejects partitions > 1000", () => {
      const result = SdNodeSchema.safeParse({ ...validDatabase, partitions: 1001 });
      assert.equal(result.success, false);
    });

    it("rejects partitions < 1", () => {
      const result = SdNodeSchema.safeParse({ ...validDatabase, partitions: 0 });
      assert.equal(result.success, false);
    });

    it("rejects hotKeyShare > 1", () => {
      const result = SdNodeSchema.safeParse({ ...validDatabase, hotKeyShare: 1.1 });
      assert.equal(result.success, false);
    });

    it("rejects hotKeyShare < 0", () => {
      const result = SdNodeSchema.safeParse({ ...validDatabase, hotKeyShare: -0.1 });
      assert.equal(result.success, false);
    });
  });

  describe("load_balancer specific bounds", () => {
    it("accepts rateLimitPerMin = null", () => {
      const result = SdNodeSchema.safeParse({ ...validLoadBalancer, rateLimitPerMin: null });
      assert.equal(result.success, true);
    });

    it("rejects rateLimitPerMin <= 0", () => {
      const result = SdNodeSchema.safeParse({ ...validLoadBalancer, rateLimitPerMin: 0 });
      assert.equal(result.success, false);
    });

    it("rejects invalid algorithm", () => {
      const result = SdNodeSchema.safeParse({ ...validLoadBalancer, algorithm: "invalid" });
      assert.equal(result.success, false);
    });
  });

  describe("queue specific bounds", () => {
    it("rejects maxDepth > 1_000_000", () => {
      const result = SdNodeSchema.safeParse({ ...validQueue, maxDepth: 1_000_001 });
      assert.equal(result.success, false);
    });

    it("rejects retryLimit > 100", () => {
      const result = SdNodeSchema.safeParse({ ...validQueue, retryLimit: 101 });
      assert.equal(result.success, false);
    });

    it("rejects retryLimit < 0", () => {
      const result = SdNodeSchema.safeParse({ ...validQueue, retryLimit: -1 });
      assert.equal(result.success, false);
    });
  });

  describe("worker specific bounds", () => {
    it("rejects replicas > 100", () => {
      const result = SdNodeSchema.safeParse({ ...validWorker, replicas: 101 });
      assert.equal(result.success, false);
    });

    it("rejects replicas < 1", () => {
      const result = SdNodeSchema.safeParse({ ...validWorker, replicas: 0 });
      assert.equal(result.success, false);
    });
  });

  describe("cdn specific bounds", () => {
    it("rejects hitRate > 1", () => {
      const result = SdNodeSchema.safeParse({ ...validCdn, hitRate: 1.1 });
      assert.equal(result.success, false);
    });

    it("rejects hitRate < 0", () => {
      const result = SdNodeSchema.safeParse({ ...validCdn, hitRate: -0.1 });
      assert.equal(result.success, false);
    });
  });

  it("coordinates (x, y) accept any number", () => {
    const result = SdNodeSchema.safeParse({ ...validClient, x: -1000, y: 1.5e3 });
    assert.equal(result.success, true);
  });
});

describe("SdEdgeSchema", () => {
  const validEdge = {
    id: "e1",
    from: "n1",
    to: "n2",
    label: null,
    retry: { attempts: 0, backoffMs: 0, jitter: false },
    partitioned: false,
  };

  it("accepts valid edge", () => {
    const result = SdEdgeSchema.safeParse(validEdge);
    assert.equal(result.success, true);
  });

  it("rejects empty id", () => {
    const result = SdEdgeSchema.safeParse({ ...validEdge, id: "" });
    assert.equal(result.success, false);
  });

  it("rejects id > 64 chars", () => {
    const result = SdEdgeSchema.safeParse({ ...validEdge, id: "x".repeat(65) });
    assert.equal(result.success, false);
  });

  it("rejects empty from", () => {
    const result = SdEdgeSchema.safeParse({ ...validEdge, from: "" });
    assert.equal(result.success, false);
  });

  it("rejects empty to", () => {
    const result = SdEdgeSchema.safeParse({ ...validEdge, to: "" });
    assert.equal(result.success, false);
  });

  it("accepts label = null", () => {
    const result = SdEdgeSchema.safeParse({ ...validEdge, label: null });
    assert.equal(result.success, true);
  });

  it("accepts label up to 128 chars", () => {
    const result = SdEdgeSchema.safeParse({ ...validEdge, label: "x".repeat(128) });
    assert.equal(result.success, true);
  });

  it("rejects label > 128 chars", () => {
    const result = SdEdgeSchema.safeParse({ ...validEdge, label: "x".repeat(129) });
    assert.equal(result.success, false);
  });

  describe("retry policy bounds", () => {
    it("rejects attempts > 10", () => {
      const result = SdEdgeSchema.safeParse({
        ...validEdge,
        retry: { attempts: 11, backoffMs: 0, jitter: false },
      });
      assert.equal(result.success, false);
    });

    it("rejects attempts < 0", () => {
      const result = SdEdgeSchema.safeParse({
        ...validEdge,
        retry: { attempts: -1, backoffMs: 0, jitter: false },
      });
      assert.equal(result.success, false);
    });

    it("rejects backoffMs > 60_000", () => {
      const result = SdEdgeSchema.safeParse({
        ...validEdge,
        retry: { attempts: 0, backoffMs: 60_001, jitter: false },
      });
      assert.equal(result.success, false);
    });

    it("rejects backoffMs < 0", () => {
      const result = SdEdgeSchema.safeParse({
        ...validEdge,
        retry: { attempts: 0, backoffMs: -1, jitter: false },
      });
      assert.equal(result.success, false);
    });

    it("accepts jitter boolean", () => {
      const result = SdEdgeSchema.safeParse({
        ...validEdge,
        retry: { attempts: 3, backoffMs: 100, jitter: true },
      });
      assert.equal(result.success, true);
    });
  });

  it("accepts partitioned boolean", () => {
    const result = SdEdgeSchema.safeParse({ ...validEdge, partitioned: true });
    assert.equal(result.success, true);
  });
});

describe("SdScenarioSchema", () => {
  const validScenario = {
    arrivalRate: 1000,
    writeShare: 0.3,
    mediaShare: 0.1,
    bytesPerMediaRequest: 2_000_000,
    abusiveShare: 0.05,
    latencyJitterMs: 50,
    cacheColdStart: true,
    replicaLagMs: 100,
  };

  it("accepts valid scenario", () => {
    const result = SdScenarioSchema.safeParse(validScenario);
    assert.equal(result.success, true);
  });

  it("rejects arrivalRate <= 0", () => {
    const result = SdScenarioSchema.safeParse({ ...validScenario, arrivalRate: 0 });
    assert.equal(result.success, false);
  });

  it("rejects arrivalRate > 1_000_000", () => {
    const result = SdScenarioSchema.safeParse({ ...validScenario, arrivalRate: 1_000_001 });
    assert.equal(result.success, false);
  });

  it("rejects writeShare < 0", () => {
    const result = SdScenarioSchema.safeParse({ ...validScenario, writeShare: -0.1 });
    assert.equal(result.success, false);
  });

  it("rejects writeShare > 1", () => {
    const result = SdScenarioSchema.safeParse({ ...validScenario, writeShare: 1.1 });
    assert.equal(result.success, false);
  });

  it("rejects mediaShare < 0", () => {
    const result = SdScenarioSchema.safeParse({ ...validScenario, mediaShare: -0.1 });
    assert.equal(result.success, false);
  });

  it("rejects mediaShare > 1", () => {
    const result = SdScenarioSchema.safeParse({ ...validScenario, mediaShare: 1.1 });
    assert.equal(result.success, false);
  });

  it("rejects bytesPerMediaRequest <= 0", () => {
    const result = SdScenarioSchema.safeParse({ ...validScenario, bytesPerMediaRequest: 0 });
    assert.equal(result.success, false);
  });

  it("rejects bytesPerMediaRequest > 100_000_000", () => {
    const result = SdScenarioSchema.safeParse({ ...validScenario, bytesPerMediaRequest: 100_000_001 });
    assert.equal(result.success, false);
  });

  it("rejects abusiveShare < 0", () => {
    const result = SdScenarioSchema.safeParse({ ...validScenario, abusiveShare: -0.1 });
    assert.equal(result.success, false);
  });

  it("rejects abusiveShare > 1", () => {
    const result = SdScenarioSchema.safeParse({ ...validScenario, abusiveShare: 1.1 });
    assert.equal(result.success, false);
  });

  it("rejects latencyJitterMs < 0", () => {
    const result = SdScenarioSchema.safeParse({ ...validScenario, latencyJitterMs: -1 });
    assert.equal(result.success, false);
  });

  it("rejects latencyJitterMs > 1000", () => {
    const result = SdScenarioSchema.safeParse({ ...validScenario, latencyJitterMs: 1001 });
    assert.equal(result.success, false);
  });

  it("rejects replicaLagMs < 0", () => {
    const result = SdScenarioSchema.safeParse({ ...validScenario, replicaLagMs: -1 });
    assert.equal(result.success, false);
  });

  it("rejects replicaLagMs > 60_000", () => {
    const result = SdScenarioSchema.safeParse({ ...validScenario, replicaLagMs: 60_001 });
    assert.equal(result.success, false);
  });

  it("accepts boolean cacheColdStart", () => {
    const result = SdScenarioSchema.safeParse({ ...validScenario, cacheColdStart: false });
    assert.equal(result.success, true);
  });
});

describe("SdGraphSchema", () => {
  it("accepts minimal valid graph", () => {
    const graph = minimalGraph();
    const result = SdGraphSchema.safeParse(graph);
    assert.equal(result.success, true);
  });

  it("rejects empty nodes array", () => {
    const graph = minimalGraph();
    const result = SdGraphSchema.safeParse({ ...graph, nodes: [] });
    assert.equal(result.success, false);
  });

  it("rejects nodes > 40", () => {
    const graph = minimalGraph();
    const nodes = Array.from({ length: 41 }, (_, i) => ({
      id: `n${i}`,
      type: "client" as const,
      label: `Client ${i}`,
      x: i * 10,
      y: 0,
    }));
    const result = SdGraphSchema.safeParse({ ...graph, nodes });
    assert.equal(result.success, false);
  });

  it("rejects edges > 120", () => {
    const graph = minimalGraph();
    const edges = Array.from({ length: 121 }, (_, i) => ({
      id: `e${i}`,
      from: "c1",
      to: "s1",
      label: null,
      retry: { attempts: 0, backoffMs: 0, jitter: false },
      partitioned: false,
    }));
    const result = SdGraphSchema.safeParse({ ...graph, edges });
    assert.equal(result.success, false);
  });

  it("accepts 40 nodes exactly", () => {
    const graph = minimalGraph();
    const nodes = Array.from({ length: 40 }, (_, i) => ({
      id: `n${i}`,
      type: "client" as const,
      label: `Client ${i}`,
      x: i * 10,
      y: 0,
    }));
    const result = SdGraphSchema.safeParse({ ...graph, nodes });
    assert.equal(result.success, true);
  });

  it("accepts 120 edges exactly", () => {
    const graph = minimalGraph();
    const edges = Array.from({ length: 120 }, (_, i) => ({
      id: `e${i}`,
      from: "c1",
      to: "s1",
      label: null,
      retry: { attempts: 0, backoffMs: 0, jitter: false },
      partitioned: false,
    }));
    const result = SdGraphSchema.safeParse({ ...graph, edges });
    assert.equal(result.success, true);
  });
});

describe("validateGraph helper", () => {
  it("returns {success: true, data} for valid graph", () => {
    const graph = minimalGraph();
    const result = validateGraph(graph);
    assert.equal(result.success, true);
    if (result.success) {
      assert.deepEqual(result.data, graph);
    }
  });

  it("returns {success: false, errors: ZodIssue[]} for invalid graph", () => {
    const result = validateGraph({ nodes: [], edges: [], scenario: {} });
    assert.equal(result.success, false);
    if (!result.success) {
      assert.ok(Array.isArray(result.errors));
      assert.ok(result.errors.length > 0);
    }
  });

  it("errors contain path and message", () => {
    const result = validateGraph({ nodes: [], edges: [], scenario: {} });
    assert.equal(result.success, false);
    if (!result.success) {
      for (const issue of result.errors) {
        assert.ok(typeof issue.path === "string" || Array.isArray(issue.path));
        assert.ok(typeof issue.message === "string");
      }
    }
  });
});

describe("Type inference helpers", () => {
  it("SdNodeIn matches SdNode", () => {
    // This is a compile-time test - if it compiles, the types match
    const node: import("../lib/system-design/validation").SdNodeIn = {
      id: "n1",
      type: "client",
      label: "Client",
      x: 0,
      y: 0,
    };
    assert.ok(node);
  });

  it("SdEdgeIn matches SdEdge", () => {
    const edge: import("../lib/system-design/validation").SdEdgeIn = {
      id: "e1",
      from: "n1",
      to: "n2",
      label: null,
      retry: { attempts: 0, backoffMs: 0, jitter: false },
      partitioned: false,
    };
    assert.ok(edge);
  });

  it("SdScenarioIn matches SdScenario", () => {
    const scenario: import("../lib/system-design/validation").SdScenarioIn = {
      arrivalRate: 100,
      writeShare: 0.1,
      mediaShare: 0,
      bytesPerMediaRequest: 1024,
      abusiveShare: 0,
      latencyJitterMs: 0,
      cacheColdStart: true,
      replicaLagMs: 0,
    };
    assert.ok(scenario);
  });

  it("SdGraphIn matches SdGraph", () => {
    const graph: import("../lib/system-design/validation").SdGraphIn = minimalGraph();
    assert.ok(graph);
  });
});