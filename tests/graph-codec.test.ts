/**
 * @file
 *
 * Pins `encodeGraph` and `decodeGraph` (`lib/system-design/graph-codec.ts`).
 *
 * These are the share-link codec: a user-supplied `?d=<base64url>` payload is
 * decoded and validated before the simulation engine ever sees it. The encoder
 * bounds the payload size (8 KB) and node/edge counts (40/120) to prevent DoS.
 *
 * Attack surface:
 *   - Hand-edited URLs with malformed base64url
 *   - Valid base64url that decodes to invalid UTF-8
 *   - Valid JSON that fails the Zod schema (wrong types, missing fields, etc.)
 *   - Oversized payloads that would exceed URL limits
 *
 * The decoder returns a discriminated union ({success, data} | {success, error})
 * so the caller never throws — the UI renders a friendly "invalid link" message.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encodeGraph, decodeGraph } from "../lib/system-design/graph-codec";
import type { SdGraph } from "../config/system-design/types";

/** Minimal valid graph — one client, one app server, one edge. */
function minimalGraph(overrides: Partial<SdGraph> = {}): SdGraph {
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
    ...overrides,
  };
}

describe("encodeGraph", () => {
  it("encodes a minimal valid graph to base64url", () => {
    const graph = minimalGraph();
    const encoded = encodeGraph(graph);

    // base64url: no + / = padding, uses - _ instead
    assert.ok(/^[A-Za-z0-9_-]+$/.test(encoded));
    assert.equal(encoded.includes("+"), false);
    assert.equal(encoded.includes("/"), false);
    assert.equal(encoded.includes("="), false);
  });

  it("round-trips: encode -> decode yields identical graph", () => {
    const original = minimalGraph();
    const encoded = encodeGraph(original);
    const result = decodeGraph(encoded);

    assert.equal(result.success, true);
    if (result.success) {
      assert.deepEqual(result.data, original);
    }
  });

  it("throws when nodes exceed 40", () => {
    const nodes = Array.from({ length: 41 }, (_, i) => ({
      id: `n${i}`,
      type: "client" as const,
      label: `Client ${i}`,
      x: i * 10,
      y: 0,
    }));
    const graph = minimalGraph({ nodes });

    assert.throws(
      () => encodeGraph(graph),
      /Graph exceeds maximum size for share link/,
    );
  });

  it("throws when edges exceed 120", () => {
    const nodes = [
      { id: "c1", type: "client" as const, label: "Client", x: 0, y: 0 },
      {
        id: "s1",
        type: "app_server" as const,
        label: "App",
        x: 100,
        y: 0,
        replicas: 1,
        maxConcurrency: null,
        breakerEnabled: false,
      },
    ];
    const edges = Array.from({ length: 121 }, (_, i) => ({
      id: `e${i}`,
      from: "c1",
      to: "s1",
      label: null,
      retry: { attempts: 0, backoffMs: 0, jitter: false },
      partitioned: false,
    }));
    const graph = minimalGraph({ nodes, edges });

    assert.throws(
      () => encodeGraph(graph),
      /Graph exceeds maximum size for share link/,
    );
  });

  it("throws when encoded payload exceeds 8 KB", () => {
    // Create a graph with very long labels to push payload over 8 KB
    const nodes = Array.from({ length: 40 }, (_, i) => ({
      id: `n${i}`,
      type: "client" as const,
      label: "x".repeat(200), // 200 chars * 40 = 8000, plus JSON overhead
      x: i * 10,
      y: 0,
    }));
    const graph = minimalGraph({
      nodes,
      edges: [],
    });

    assert.throws(
      () => encodeGraph(graph),
      /Encoded graph exceeds maximum payload size/,
    );
  });
});

describe("decodeGraph", () => {
  it("decodes a valid base64url payload", () => {
    const graph = minimalGraph();
    const encoded = encodeGraph(graph);
    const result = decodeGraph(encoded);

    assert.equal(result.success, true);
    if (result.success) {
      assert.deepEqual(result.data, graph);
    }
  });

  it("rejects invalid base64url (wrong alphabet)", () => {
    const result = decodeGraph("not_valid_base64url!@#");

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error, "Invalid base64url payload");
    }
  });

  it("rejects valid base64url that decodes to invalid JSON after UTF-8 decode", () => {
    // Create a Uint8Array that decodes to something that isn't valid JSON
    // TextDecoder with default options replaces invalid UTF-8 with �
    // So we need bytes that produce non-JSON output
    const bytes = new Uint8Array([0xff, 0xfe, 0xfd]); // Invalid UTF-8 sequences
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    const payload = b64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const result = decodeGraph(payload);

    // TextDecoder replaces invalid sequences with �, then JSON.parse fails
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error, "Payload is not valid JSON");
    }
  });

  it("rejects valid base64url+UTF-8 that is not valid JSON", () => {
    const notJson = "not-json"; // valid base64url, valid UTF-8, not JSON
    const result = decodeGraph(notJson);

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error, "Payload is not valid JSON");
    }
  });

  it("rejects valid JSON that fails Zod schema (missing required field)", () => {
    const badGraph = { nodes: [], edges: [], scenario: {} };
    const json = JSON.stringify(badGraph);
    const encoded = btoa(json)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const result = decodeGraph(encoded);

    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error, /Invalid graph:/);
    }
  });

  it("rejects graph with zero nodes (schema requires min 1)", () => {
    const graph = minimalGraph({ nodes: [] });
    const encoded = encodeGraph(graph);
    // Manually construct a payload that has zero nodes to test schema validation
    const badJson = JSON.stringify({ ...graph, nodes: [] });
    const encodedBad = btoa(badJson)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const result = decodeGraph(encodedBad);

    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error, /Invalid graph:/);
    }
  });

  it("rejects graph with invalid node type", () => {
    // Need to bypass encodeGraph's validation to test decodeGraph's schema validation
    const badJson = JSON.stringify({
      nodes: [{ id: "n1", type: "not_a_type", label: "X", x: 0, y: 0 }],
      edges: [],
      scenario: minimalGraph().scenario,
    });
    const encodedBad = btoa(badJson)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const result = decodeGraph(encodedBad);

    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error, /Invalid graph:/);
    }
  });

  it("rejects edge with invalid retry attempts (>10)", () => {
    const graph = minimalGraph();
    const badJson = JSON.stringify({
      ...graph,
      edges: [
        {
          id: "e1",
          from: "c1",
          to: "s1",
          label: null,
          retry: { attempts: 11, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
    });
    const encodedBad = btoa(badJson)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const result = decodeGraph(encodedBad);

    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error, /Invalid graph:/);
    }
  });

  it("rejects scenario with arrivalRate <= 0", () => {
    const graph = minimalGraph();
    const badJson = JSON.stringify({
      ...graph,
      scenario: { ...graph.scenario, arrivalRate: 0 },
    });
    const encodedBad = btoa(badJson)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const result = decodeGraph(encodedBad);

    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error, /Invalid graph:/);
    }
  });

  it("rejects scenario with writeShare > 1", () => {
    const graph = minimalGraph();
    const badJson = JSON.stringify({
      ...graph,
      scenario: { ...graph.scenario, writeShare: 1.5 },
    });
    const encodedBad = btoa(badJson)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const result = decodeGraph(encodedBad);

    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error, /Invalid graph:/);
    }
  });

  it("handles all 9 node types in round-trip", () => {
    const graph: SdGraph = {
      nodes: [
        { id: "c1", type: "client", label: "Client", x: 0, y: 0 },
        { id: "cdn1", type: "cdn", label: "CDN", x: 100, y: 0, hitRate: 0.95 },
        {
          id: "lb1",
          type: "load_balancer",
          label: "LB",
          x: 200,
          y: 0,
          algorithm: "rr",
          rateLimitPerMin: null,
        },
        {
          id: "app1",
          type: "app_server",
          label: "App",
          x: 300,
          y: 0,
          replicas: 2,
          maxConcurrency: null,
          breakerEnabled: true,
        },
        {
          id: "cache1",
          type: "cache",
          label: "Cache",
          x: 400,
          y: 0,
          hitRate: 0.9,
          ttlMs: 60000,
          stampedeGuard: false,
        },
        {
          id: "db1",
          type: "database",
          label: "DB",
          x: 500,
          y: 0,
          readReplicas: 2,
          partitions: 10,
          hotKeyShare: 0.1,
        },
        {
          id: "queue1",
          type: "queue",
          label: "Queue",
          x: 600,
          y: 0,
          maxDepth: 1000,
          retryLimit: 3,
          dlqEnabled: true,
        },
        {
          id: "worker1",
          type: "worker",
          label: "Worker",
          x: 700,
          y: 0,
          replicas: 3,
        },
        { id: "obj1", type: "object_store", label: "Objects", x: 800, y: 0 },
      ],
      edges: [
        {
          id: "e1",
          from: "c1",
          to: "cdn1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e2",
          from: "cdn1",
          to: "lb1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e3",
          from: "lb1",
          to: "app1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e4",
          from: "app1",
          to: "cache1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e5",
          from: "cache1",
          to: "db1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e6",
          from: "app1",
          to: "queue1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e7",
          from: "queue1",
          to: "worker1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e8",
          from: "app1",
          to: "obj1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
      scenario: minimalGraph().scenario,
    };

    const encoded = encodeGraph(graph);
    const result = decodeGraph(encoded);

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.nodes.length, 9);
      assert.equal(result.data.edges.length, 8);
      // Verify each node type survived
      const types = result.data.nodes.map((n) => n.type).sort();
      assert.deepEqual(types, [
        "app_server",
        "cache",
        "cdn",
        "client",
        "database",
        "load_balancer",
        "object_store",
        "queue",
        "worker",
      ]);
    }
  });

  it("preserves null edge labels and nullable fields", () => {
    const graph = minimalGraph({
      edges: [
        {
          id: "e1",
          from: "c1",
          to: "s1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e2",
          from: "c1",
          to: "s1",
          label: "explicit",
          retry: { attempts: 3, backoffMs: 100, jitter: true },
          partitioned: true,
        },
      ],
    });

    const encoded = encodeGraph(graph);
    const result = decodeGraph(encoded);

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.edges[0].label, null);
      assert.equal(result.data.edges[1].label, "explicit");
      assert.equal(result.data.edges[0].partitioned, false);
      assert.equal(result.data.edges[1].partitioned, true);
    }
  });

  it("empty string payload is rejected", () => {
    const result = decodeGraph("");

    assert.equal(result.success, false);
    if (!result.success) {
      // Empty string decodes to empty bytes -> empty string -> JSON.parse fails
      assert.equal(result.error, "Payload is not valid JSON");
    }
  });
});
