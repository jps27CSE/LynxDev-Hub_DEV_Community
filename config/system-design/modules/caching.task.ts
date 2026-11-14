import type { SdModule, SdTaskDef } from "../types";
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
const task: SdTaskDef = {
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
};

export default task;

export const title = "Caching";
