/**
 * @file
 *
 * Pins `lib/system-design/nodes.ts` — the node type specifications and defaults.
 *
 * This is the SINGLE SOURCE OF TRUTH for the system-design node palette.
 * The engine, validation schemas, canvas UI, and share-link codec all depend on it.
 *
 * Key properties tested:
 *   - NODE_TYPES: 9 node types with capacity, serviceMs, category, iconKey, label, blurb
 *   - NODE_TYPE_ORDER: derived from declaration order (insertion order of Record)
 *   - NODE_CATEGORY_LABELS: 4 categories
 *   - getNodeTypeSpec: lookup by type
 *   - defaultNode: builds a complete node with type-specific defaults
 *
 * A regression here means:
 *   - Palette shows wrong node or wrong order
 *   - Engine uses wrong capacity/service times (wrong simulation results)
 *   - Canvas creates nodes with missing/wrong defaults
 *   - Node type missing from palette (the derivation hole this file fixed)
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  NODE_TYPES,
  NODE_TYPE_ORDER,
  NODE_CATEGORY_LABELS,
  getNodeTypeSpec,
  defaultNode,
  type SdNodeCategory,
} from "../lib/system-design/nodes";
import type { SdNode, SdNodeType } from "../config/system-design/types";

describe("NODE_TYPES — the 9 node type specifications", () => {
  it("has exactly 9 node types", () => {
    const keys = Object.keys(NODE_TYPES);
    assert.equal(keys.length, 9);
  });

  it("contains all expected types", () => {
    const expectedTypes: SdNodeType[] = [
      "client",
      "cdn",
      "load_balancer",
      "app_server",
      "worker",
      "cache",
      "database",
      "object_store",
      "queue",
    ];
    for (const type of expectedTypes) {
      assert.ok(type in NODE_TYPES, `Missing node type: ${type}`);
    }
  });

  it("each spec has required fields", () => {
    for (const [type, spec] of Object.entries(NODE_TYPES)) {
      assert.ok(typeof spec.capacity === "number", `${type}: capacity missing`);
      assert.ok(typeof spec.serviceMs === "object", `${type}: serviceMs missing`);
      assert.ok(typeof spec.serviceMs.read === "number", `${type}: serviceMs.read missing`);
      assert.ok(typeof spec.serviceMs.write === "number", `${type}: serviceMs.write missing`);
      assert.ok(["traffic", "compute", "data", "async"].includes(spec.category), `${type}: invalid category`);
      assert.ok(typeof spec.iconKey === "string" && spec.iconKey.length > 0, `${type}: iconKey missing`);
      assert.ok(typeof spec.label === "string" && spec.label.length > 0, `${type}: label missing`);
      assert.ok(typeof spec.blurb === "string" && spec.blurb.length > 0, `${type}: blurb missing`);
    }
  });

  describe("capacity values (teaching model)", () => {
    it("client has Infinity capacity", () => {
      assert.equal(NODE_TYPES.client.capacity, Infinity);
    });

    it("cdn has highest finite capacity", () => {
      assert.equal(NODE_TYPES.cdn.capacity, 100_000);
    });

    it("load_balancer capacity", () => {
      assert.equal(NODE_TYPES.load_balancer.capacity, 20_000);
    });

    it("queue capacity", () => {
      assert.equal(NODE_TYPES.queue.capacity, 20_000);
    });

    it("cache capacity", () => {
      assert.equal(NODE_TYPES.cache.capacity, 50_000);
    });

    it("object_store capacity", () => {
      assert.equal(NODE_TYPES.object_store.capacity, 10_000);
    });

    it("database capacity", () => {
      assert.equal(NODE_TYPES.database.capacity, 5_000);
    });

    it("app_server capacity", () => {
      assert.equal(NODE_TYPES.app_server.capacity, 2_000);
    });

    it("worker capacity", () => {
      assert.equal(NODE_TYPES.worker.capacity, 1_000);
    });

    it("capacities follow teaching model order: cdn > cache > lb/queue > object_store > db > app > worker", () => {
      const caps = {
        cdn: NODE_TYPES.cdn.capacity,
        load_balancer: NODE_TYPES.load_balancer.capacity,
        queue: NODE_TYPES.queue.capacity,
        cache: NODE_TYPES.cache.capacity,
        object_store: NODE_TYPES.object_store.capacity,
        database: NODE_TYPES.database.capacity,
        app_server: NODE_TYPES.app_server.capacity,
        worker: NODE_TYPES.worker.capacity,
      };
      assert.ok(caps.cdn > caps.cache);
      assert.ok(caps.cache > caps.load_balancer);
      assert.ok(caps.load_balancer === caps.queue);
      assert.ok(caps.load_balancer > caps.object_store);
      assert.ok(caps.object_store > caps.database);
      assert.ok(caps.database > caps.app_server);
      assert.ok(caps.app_server > caps.worker);
    });
  });

  describe("serviceMs — split read/write", () => {
    it("client has zero service time", () => {
      assert.equal(NODE_TYPES.client.serviceMs.read, 0);
      assert.equal(NODE_TYPES.client.serviceMs.write, 0);
    });

    it("cdn has equal fast read/write", () => {
      assert.equal(NODE_TYPES.cdn.serviceMs.read, 0.1);
      assert.equal(NODE_TYPES.cdn.serviceMs.write, 0.1);
    });

    it("load_balancer has equal fast read/write", () => {
      assert.equal(NODE_TYPES.load_balancer.serviceMs.read, 0.1);
      assert.equal(NODE_TYPES.load_balancer.serviceMs.write, 0.1);
    });

    it("queue has equal very fast read/write", () => {
      assert.equal(NODE_TYPES.queue.serviceMs.read, 0.05);
      assert.equal(NODE_TYPES.queue.serviceMs.write, 0.05);
    });

    it("cache has equal fast read/write", () => {
      assert.equal(NODE_TYPES.cache.serviceMs.read, 0.2);
      assert.equal(NODE_TYPES.cache.serviceMs.write, 0.2);
    });

    it("object_store has equal read/write", () => {
      assert.equal(NODE_TYPES.object_store.serviceMs.read, 2);
      assert.equal(NODE_TYPES.object_store.serviceMs.write, 2);
    });

    it("app_server has equal read/write", () => {
      assert.equal(NODE_TYPES.app_server.serviceMs.read, 1);
      assert.equal(NODE_TYPES.app_server.serviceMs.write, 1);
    });

    it("worker has equal slow read/write", () => {
      assert.equal(NODE_TYPES.worker.serviceMs.read, 50);
      assert.equal(NODE_TYPES.worker.serviceMs.write, 50);
    });

    it("database has write 4x read (the teaching point)", () => {
      assert.equal(NODE_TYPES.database.serviceMs.read, 2);
      assert.equal(NODE_TYPES.database.serviceMs.write, 8);
      assert.equal(NODE_TYPES.database.serviceMs.write / NODE_TYPES.database.serviceMs.read, 4);
    });
  });

  describe("categories", () => {
    it("traffic: client, cdn, load_balancer", () => {
      assert.equal(NODE_TYPES.client.category, "traffic");
      assert.equal(NODE_TYPES.cdn.category, "traffic");
      assert.equal(NODE_TYPES.load_balancer.category, "traffic");
    });

    it("compute: app_server, worker", () => {
      assert.equal(NODE_TYPES.app_server.category, "compute");
      assert.equal(NODE_TYPES.worker.category, "compute");
    });

    it("data: cache, database, object_store", () => {
      assert.equal(NODE_TYPES.cache.category, "data");
      assert.equal(NODE_TYPES.database.category, "data");
      assert.equal(NODE_TYPES.object_store.category, "data");
    });

    it("async: queue", () => {
      assert.equal(NODE_TYPES.queue.category, "async");
    });
  });

  describe("iconKey — maps to Lucide icons", () => {
    const expectedIcons: Record<SdNodeType, string> = {
      client: "monitor",
      cdn: "globe",
      load_balancer: "scale",
      app_server: "server",
      worker: "cpu",
      cache: "zap",
      database: "database",
      object_store: "hard-drive",
      queue: "list-ordered",
    };
    for (const [type, icon] of Object.entries(expectedIcons)) {
      it(`${type} has iconKey "${icon}"`, () => {
        assert.equal(NODE_TYPES[type as SdNodeType].iconKey, icon);
      });
    }
  });

  describe("labels and blurbs", () => {
    it("all labels are non-empty strings", () => {
      for (const spec of Object.values(NODE_TYPES)) {
        assert.ok(typeof spec.label === "string" && spec.label.length > 0);
      }
    });

    it("all blurbs are non-empty strings", () => {
      for (const spec of Object.values(NODE_TYPES)) {
        assert.ok(typeof spec.blurb === "string" && spec.blurb.length > 0);
      }
    });

    it("database blurb mentions 4x write cost", () => {
      assert.match(NODE_TYPES.database.blurb, /four times dearer/i);
    });
  });
});

describe("NODE_TYPE_ORDER — derived from NODE_TYPES declaration order", () => {
  it("has 9 entries", () => {
    assert.equal(NODE_TYPE_ORDER.length, 9);
  });

  it("matches NODE_TYPES keys in declaration order", () => {
    const expectedOrder: SdNodeType[] = [
      "client",
      "cdn",
      "load_balancer",
      "app_server",
      "worker",
      "cache",
      "database",
      "object_store",
      "queue",
    ];
    assert.deepEqual(NODE_TYPE_ORDER, expectedOrder);
  });

  it("contains each type exactly once", () => {
    const unique = new Set(NODE_TYPE_ORDER);
    assert.equal(unique.size, NODE_TYPE_ORDER.length);
  });

  it("is SdNodeType[] (compile-time check via inference)", () => {
    const _check: SdNodeType[] = NODE_TYPE_ORDER;
    assert.ok(_check);
  });
});

describe("NODE_CATEGORY_LABELS", () => {
  it("has 4 categories", () => {
    assert.equal(Object.keys(NODE_CATEGORY_LABELS).length, 4);
  });

  it("maps each category to display label", () => {
    assert.equal(NODE_CATEGORY_LABELS.traffic, "Traffic");
    assert.equal(NODE_CATEGORY_LABELS.compute, "Compute");
    assert.equal(NODE_CATEGORY_LABELS.data, "Data");
    assert.equal(NODE_CATEGORY_LABELS.async, "Async");
  });

  it("covers all categories used in NODE_TYPES", () => {
    const usedCategories = new Set(Object.values(NODE_TYPES).map((s) => s.category));
    for (const cat of usedCategories) {
      assert.ok(cat in NODE_CATEGORY_LABELS, `Missing label for category: ${cat}`);
    }
  });
});

describe("getNodeTypeSpec", () => {
  it("returns correct spec for each type", () => {
    for (const type of NODE_TYPE_ORDER) {
      const spec = getNodeTypeSpec(type);
      assert.deepEqual(spec, NODE_TYPES[type]);
    }
  });

  it("returns spec with correct structure", () => {
    const spec = getNodeTypeSpec("app_server");
    assert.ok("capacity" in spec);
    assert.ok("serviceMs" in spec);
    assert.ok("category" in spec);
    assert.ok("iconKey" in spec);
    assert.ok("label" in spec);
    assert.ok("blurb" in spec);
  });
});

describe("defaultNode — builds complete node with type-specific defaults", () => {
  const testCases: Array<{
    type: SdNodeType;
    id: string;
    expected: Partial<SdNode>;
  }> = [
    {
      type: "client",
      id: "c1",
      expected: { type: "client", id: "c1", label: "Client" },
    },
    {
      type: "cdn",
      id: "cdn1",
      expected: { type: "cdn", id: "cdn1", label: "CDN", hitRate: 0.95 },
    },
    {
      type: "load_balancer",
      id: "lb1",
      expected: { type: "load_balancer", id: "lb1", label: "Load balancer", algorithm: "rr", rateLimitPerMin: null },
    },
    {
      type: "app_server",
      id: "app1",
      expected: { type: "app_server", id: "app1", label: "App server", replicas: 1, maxConcurrency: null, breakerEnabled: false },
    },
    {
      type: "worker",
      id: "w1",
      expected: { type: "worker", id: "w1", label: "Worker", replicas: 1 },
    },
    {
      type: "cache",
      id: "cache1",
      expected: { type: "cache", id: "cache1", label: "Cache", hitRate: 0.9, ttlMs: 60_000, stampedeGuard: false },
    },
    {
      type: "database",
      id: "db1",
      expected: { type: "database", id: "db1", label: "Database", readReplicas: 0, partitions: 1, hotKeyShare: 0 },
    },
    {
      type: "object_store",
      id: "obj1",
      expected: { type: "object_store", id: "obj1", label: "Object store" },
    },
    {
      type: "queue",
      id: "q1",
      expected: { type: "queue", id: "q1", label: "Queue", maxDepth: 1_000, retryLimit: 3, dlqEnabled: false },
    },
  ];

  for (const tc of testCases) {
    it(`creates ${tc.type} with correct defaults`, () => {
      const node = defaultNode(tc.type, tc.id, 100, 200);
      for (const [key, value] of Object.entries(tc.expected)) {
        assert.deepEqual((node as any)[key], value, `${tc.type}.${key}`);
      }
      // Position should be set
      assert.equal(node.x, 100);
      assert.equal(node.y, 200);
    });
  }

  it("uses provided id (deterministic for PRNG seed)", () => {
    const node = defaultNode("app_server", "my-custom-id", 0, 0);
    assert.equal(node.id, "my-custom-id");
  });

  it("uses provided x, y coordinates", () => {
    const node = defaultNode("client", "c1", 42, 84);
    assert.equal(node.x, 42);
    assert.equal(node.y, 84);
  });

  it("label defaults to NODE_TYPES[type].label", () => {
    for (const type of NODE_TYPE_ORDER) {
      const node = defaultNode(type, "test", 0, 0);
      assert.equal(node.label, NODE_TYPES[type].label);
    }
  });

  it("returns SdNode (discriminated union) — compile-time check", () => {
    const node: SdNode = defaultNode("app_server", "test", 0, 0);
    assert.ok(node);
  });

  it("database defaults: readReplicas=0, partitions=1, hotKeyShare=0", () => {
    const node = defaultNode("database", "db1", 0, 0);
    assert.equal((node as any).readReplicas, 0);
    assert.equal((node as any).partitions, 1);
    assert.equal((node as any).hotKeyShare, 0);
  });

  it("cache defaults: hitRate=0.9, ttlMs=60000, stampedeGuard=false", () => {
    const node = defaultNode("cache", "cache1", 0, 0);
    assert.equal((node as any).hitRate, 0.9);
    assert.equal((node as any).ttlMs, 60_000);
    assert.equal((node as any).stampedeGuard, false);
  });

  it("load_balancer defaults: algorithm=rr, rateLimitPerMin=null", () => {
    const node = defaultNode("load_balancer", "lb1", 0, 0);
    assert.equal((node as any).algorithm, "rr");
    assert.equal((node as any).rateLimitPerMin, null);
  });

  it("app_server defaults: replicas=1, maxConcurrency=null, breakerEnabled=false", () => {
    const node = defaultNode("app_server", "app1", 0, 0);
    assert.equal((node as any).replicas, 1);
    assert.equal((node as any).maxConcurrency, null);
    assert.equal((node as any).breakerEnabled, false);
  });

  it("worker defaults: replicas=1", () => {
    const node = defaultNode("worker", "w1", 0, 0);
    assert.equal((node as any).replicas, 1);
  });

  it("queue defaults: maxDepth=1000, retryLimit=3, dlqEnabled=false", () => {
    const node = defaultNode("queue", "q1", 0, 0);
    assert.equal((node as any).maxDepth, 1_000);
    assert.equal((node as any).retryLimit, 3);
    assert.equal((node as any).dlqEnabled, false);
  });

  it("cdn defaults: hitRate=0.95", () => {
    const node = defaultNode("cdn", "cdn1", 0, 0);
    assert.equal((node as any).hitRate, 0.95);
  });

  it("object_store has no extra fields beyond base", () => {
    const node = defaultNode("object_store", "obj1", 0, 0);
    // Should only have base fields + type
    const keys = Object.keys(node).sort();
    assert.deepEqual(keys, ["id", "label", "type", "x", "y"]);
  });
});

describe("Immutability / no side effects", () => {
  it("defaultNode does not mutate NODE_TYPES", () => {
    const original = JSON.stringify(NODE_TYPES);
    defaultNode("app_server", "test", 0, 0);
    assert.equal(JSON.stringify(NODE_TYPES), original);
  });

  it("getNodeTypeSpec does not mutate NODE_TYPES", () => {
    const original = JSON.stringify(NODE_TYPES);
    getNodeTypeSpec("app_server");
    assert.equal(JSON.stringify(NODE_TYPES), original);
  });
});

describe("Completeness — every SdNodeType is covered", () => {
  it("NODE_TYPE_ORDER includes all SdNodeType values", () => {
    const allTypes: SdNodeType[] = [
      "client",
      "cdn",
      "load_balancer",
      "app_server",
      "worker",
      "cache",
      "database",
      "object_store",
      "queue",
    ];
    for (const type of allTypes) {
      assert.ok(NODE_TYPE_ORDER.includes(type), `${type} missing from NODE_TYPE_ORDER`);
    }
  });

  it("defaultNode handles all types without throwing", () => {
    for (const type of NODE_TYPE_ORDER) {
      assert.doesNotThrow(() => defaultNode(type, "test", 0, 0));
    }
  });

  it("getNodeTypeSpec handles all types", () => {
    for (const type of NODE_TYPE_ORDER) {
      const spec = getNodeTypeSpec(type);
      assert.ok(spec);
    }
  });
});