import type {
  SdAppServerNode,
  SdCacheNode,
  SdCdnNode,
  SdClientNode,
  SdDatabaseNode,
  SdLoadBalancerNode,
  SdNode,
  SdNodeType,
  SdObjectStoreNode,
  SdQueueNode,
  SdWorkerNode,
} from "@/config/system-design/types";

export type { SdNodeType };

/**
 * The nine node types, as data.
 *
 * Zero React imports, by design: `iconKey` is a string that `NodeCard` maps to a
 * Lucide component at render time. Importing the icons here would put the whole
 * icon set into the chunk of any module that only wanted a capacity number.
 *
 * This table is the single source of truth for the palette (see
 * `NODE_TYPE_ORDER`), for `defaultNode`'s defaults, and for the engine's
 * capacity model. It is never serialised — see the `Infinity` note below.
 */

/**
 * Groups in the palette, in the order they are rendered.
 */
export type SdNodeCategory = "traffic" | "compute" | "data" | "async";

/**
 * The teaching model for one node type. Not a benchmark — see the note on
 * `NODE_TYPES`.
 */
export type SdNodeTypeSpec = {
  /** Requests per second one instance can serve. `Infinity` for the arrival source. */
  capacity: number;
  serviceMs: {
    read: number;
    write: number;
  };
  category: SdNodeCategory;
  iconKey: string;
  label: string;
  /** One plain-English line, because "what do I do with this" is the top hesitation. */
  blurb: string;
};

/**
 * Capacity and service times are a deliberate teaching model, not benchmarks.
 * They approximate a small tier-1 instance and are chosen to be round enough to
 * do arithmetic against during a lesson — which is the entire point of the
 * module. `ModelDisclosure` renders this caveat beside every result set.
 *
 * `serviceMs` is split read/write everywhere, even where the two are equal, so
 * the engine never has to ask which kind of node it is holding.
 *
 * `client.capacity` is `Infinity`, which is the point — the arrival source must
 * never saturate — but it is **not JSON round-trippable**:
 * `JSON.stringify` turns it into `null`, silently. That is harmless today
 * because nothing here is serialised (graphs carry their own node instances,
 * never these specs). If that ever changes, the share-link codec is the place it
 * will bite, so re-check before adding a `JSON.stringify` anywhere near it.
 *
 * Declared in palette order, not grouped by category. `NODE_TYPE_ORDER` derives
 * from this and relies on insertion order.
 */
export const NODE_TYPES: Record<SdNodeType, SdNodeTypeSpec> = {
  client: {
    capacity: Infinity,
    serviceMs: { read: 0, write: 0 },
    category: "traffic",
    iconKey: "monitor",
    label: "Client",
    blurb: "Where requests come from. The client never runs out of capacity.",
  },
  cdn: {
    capacity: 100_000,
    serviceMs: { read: 0.1, write: 0.1 },
    category: "traffic",
    iconKey: "globe",
    label: "CDN",
    blurb:
      "Serves files from a city near the user, so your origin stops being a bottleneck.",
  },
  load_balancer: {
    capacity: 20_000,
    serviceMs: { read: 0.1, write: 0.1 },
    category: "traffic",
    iconKey: "scale",
    label: "Load balancer",
    blurb:
      "Spreads connections across many servers so you can add one without downtime.",
  },
  app_server: {
    capacity: 2_000,
    serviceMs: { read: 1, write: 1 },
    category: "compute",
    iconKey: "server",
    label: "App server",
    blurb: "Runs your business logic. Add replicas to handle more traffic.",
  },
  worker: {
    capacity: 1_000,
    serviceMs: { read: 50, write: 50 },
    category: "compute",
    iconKey: "cpu",
    label: "Worker",
    blurb:
      "Does slow work off the request path, so users are not left waiting.",
  },
  cache: {
    capacity: 50_000,
    serviceMs: { read: 0.2, write: 0.2 },
    category: "data",
    iconKey: "zap",
    label: "Cache",
    blurb:
      "Keeps a copy of an answer so you do not have to ask the database again.",
  },
  database: {
    capacity: 5_000,
    serviceMs: { read: 2, write: 8 },
    category: "data",
    iconKey: "database",
    label: "Database",
    blurb:
      "The system of record. Reads are cheap, writes are four times dearer.",
  },
  object_store: {
    capacity: 10_000,
    serviceMs: { read: 2, write: 2 },
    category: "data",
    iconKey: "hard-drive",
    label: "Object store",
    blurb: "Holds the photos themselves. A row in a database should not.",
  },
  queue: {
    capacity: 20_000,
    serviceMs: { read: 0.05, write: 0.05 },
    category: "async",
    iconKey: "list-ordered",
    label: "Queue",
    blurb:
      "Holds work until something is free to do it, so a burst cannot knock you over.",
  },
};

/**
 * Palette order, derived from the declaration order of `NODE_TYPES` above —
 * which is why the literal is written client → cdn → load balancer → app
 * server → … rather than grouped by category.
 *
 * This was a hand-maintained second list, and it was a hole: `SdNodeType[]`
 * accepts a list that is merely *valid*, not *complete*, so deleting one entry
 * silently removed that node from the palette and left `tsc` clean. Deriving it
 * from a `Record<SdNodeType, …>` makes an omission unrepresentable, the same
 * reason there is no separate list of node specs.
 *
 * The cast is safe because `NODE_TYPES` is typed `Record<SdNodeType, …>`, so
 * its keys are exactly `SdNodeType` by construction. Insertion order is
 * guaranteed for the non-numeric string keys used here.
 */
export const NODE_TYPE_ORDER = Object.keys(NODE_TYPES) as SdNodeType[];

export const NODE_CATEGORY_LABELS: Record<SdNodeCategory, string> = {
  traffic: "Traffic",
  compute: "Compute",
  data: "Data",
  async: "Async",
};

export function getNodeTypeSpec(type: SdNodeType): SdNodeTypeSpec {
  return NODE_TYPES[type];
}

/**
 * A node with every field its type actually has, defaulted the way a beginner
 * would leave it. Callers pass the id rather than getting one generated: node
 * ids end up in the PRNG seed, and the engine's determinism guarantee (§5.1)
 * only holds if identical designs produce identical ids.
 *
 * Overloaded rather than returning `SdNode`, because the return type is what
 * makes the factory usable for a *preset*: `{ ...defaultNode("app_server", …),
 * replicas: 2 }` is otherwise a union spread, and TypeScript rejects it —
 * `replicas` is not a field of `SdClientNode`, which is one arm of that union.
 * The literal is a valid `SdAppServerNode`; only the annotation said otherwise.
 */
export function defaultNode(
  type: "client",
  id: string,
  x: number,
  y: number,
): SdClientNode;
export function defaultNode(
  type: "load_balancer",
  id: string,
  x: number,
  y: number,
): SdLoadBalancerNode;
export function defaultNode(
  type: "app_server",
  id: string,
  x: number,
  y: number,
): SdAppServerNode;
export function defaultNode(
  type: "worker",
  id: string,
  x: number,
  y: number,
): SdWorkerNode;
export function defaultNode(
  type: "cache",
  id: string,
  x: number,
  y: number,
): SdCacheNode;
export function defaultNode(
  type: "database",
  id: string,
  x: number,
  y: number,
): SdDatabaseNode;
export function defaultNode(
  type: "object_store",
  id: string,
  x: number,
  y: number,
): SdObjectStoreNode;
export function defaultNode(
  type: "queue",
  id: string,
  x: number,
  y: number,
): SdQueueNode;
export function defaultNode(
  type: "cdn",
  id: string,
  x: number,
  y: number,
): SdCdnNode;
/**
 * The general case, for callers that iterate `NODE_TYPE_ORDER` and only know
 * the type at runtime. It has to be a real overload rather than the
 * implementation signature: the implementation signature is invisible to
 * callers, so leaving it out makes `defaultNode(someType, …)` a type error.
 */
export function defaultNode(
  type: SdNodeType,
  id: string,
  x: number,
  y: number,
): SdNode;
export function defaultNode(
  type: SdNodeType,
  id: string,
  x: number,
  y: number,
): SdNode {
  const base = { id, label: NODE_TYPES[type].label, x, y };

  switch (type) {
    case "client":
      return { ...base, type };
    case "load_balancer":
      return { ...base, type, algorithm: "rr", rateLimitPerMin: null };
    case "app_server":
      return {
        ...base,
        type,
        replicas: 1,
        maxConcurrency: null,
        breakerEnabled: false,
      };
    case "worker":
      return { ...base, type, replicas: 1 };
    case "cache":
      return {
        ...base,
        type,
        hitRate: 0.9,
        ttlMs: 60_000,
        stampedeGuard: false,
      };
    case "database":
      return { ...base, type, readReplicas: 0, partitions: 1, hotKeyShare: 0 };
    case "object_store":
      return { ...base, type };
    case "queue":
      return {
        ...base,
        type,
        maxDepth: 1_000,
        retryLimit: 3,
        dlqEnabled: false,
      };
    case "cdn":
      return { ...base, type, hitRate: 0.95 };
  }
}
