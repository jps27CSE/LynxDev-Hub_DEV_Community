import { z } from "zod/v4";
import type {
  SdGraph,
  SdNode,
  SdEdge,
  SdScenario,
  SdNodeType,
  SdLbAlgorithm,
  SdErrorClass,
} from "@/config/system-design/types";

/** Error class for Zod discriminated unions on SdNode. */
const SdClientNode = z.object({
  type: z.literal("client"),
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(128),
  x: z.number(),
  y: z.number(),
});

const SdLoadBalancerNode = z.object({
  type: z.literal("load_balancer"),
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(128),
  x: z.number(),
  y: z.number(),
  algorithm: z.enum(["rr", "least_conn"]),
  rateLimitPerMin: z.number().int().positive().nullable(),
});

const SdAppServerNode = z.object({
  type: z.literal("app_server"),
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(128),
  x: z.number(),
  y: z.number(),
  replicas: z.number().int().positive().max(100),
  maxConcurrency: z.number().int().positive().nullable(),
  breakerEnabled: z.boolean(),
});

const SdCacheNode = z.object({
  type: z.literal("cache"),
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(128),
  x: z.number(),
  y: z.number(),
  hitRate: z.number().min(0).max(1),
  ttlMs: z.number().int().positive(),
  stampedeGuard: z.boolean(),
});

const SdDatabaseNode = z.object({
  type: z.literal("database"),
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(128),
  x: z.number(),
  y: z.number(),
  readReplicas: z.number().int().min(0).max(10),
  partitions: z.number().int().positive().max(1000),
  hotKeyShare: z.number().min(0).max(1),
});

const SdQueueNode = z.object({
  type: z.literal("queue"),
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(128),
  x: z.number(),
  y: z.number(),
  maxDepth: z.number().int().positive().max(1_000_000),
  retryLimit: z.number().int().min(0).max(100),
  dlqEnabled: z.boolean(),
});

const SdWorkerNode = z.object({
  type: z.literal("worker"),
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(128),
  x: z.number(),
  y: z.number(),
  replicas: z.number().int().positive().max(100),
});

const SdCdnNode = z.object({
  type: z.literal("cdn"),
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(128),
  x: z.number(),
  y: z.number(),
  hitRate: z.number().min(0).max(1),
});

const SdObjectStoreNode = z.object({
  type: z.literal("object_store"),
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(128),
  x: z.number(),
  y: z.number(),
});

/** The full node discriminated union. Used by the API route and share-link codec. */
export const SdNodeSchema = z.discriminatedUnion("type", [
  SdClientNode,
  SdLoadBalancerNode,
  SdAppServerNode,
  SdCacheNode,
  SdDatabaseNode,
  SdQueueNode,
  SdWorkerNode,
  SdCdnNode,
  SdObjectStoreNode,
]) satisfies z.ZodType<SdNode>;

/** Edge schema — id, from/to node ids, optional label, retry policy, partitioned flag. */
export const SdEdgeSchema = z.object({
  id: z.string().min(1).max(64),
  from: z.string().min(1).max(64),
  to: z.string().min(1).max(64),
  label: z.string().max(128).nullable(),
  retry: z.object({
    attempts: z.number().int().min(0).max(10),
    backoffMs: z.number().int().min(0).max(60_000),
    jitter: z.boolean(),
  }),
  partitioned: z.boolean(),
}) satisfies z.ZodType<SdEdge>;

/** Scenario knobs the learner turns. */
export const SdScenarioSchema = z.object({
  arrivalRate: z.number().positive().max(1_000_000),
  writeShare: z.number().min(0).max(1),
  mediaShare: z.number().min(0).max(1),
  bytesPerMediaRequest: z.number().int().positive().max(100_000_000),
  abusiveShare: z.number().min(0).max(1),
  latencyJitterMs: z.number().min(0).max(1000),
  cacheColdStart: z.boolean(),
  replicaLagMs: z.number().min(0).max(60_000),
}) satisfies z.ZodType<SdScenario>;

/** Full graph schema — shared between client (share links) and server (save). */
export const SdGraphSchema = z.object({
  nodes: z.array(SdNodeSchema).min(1).max(40),
  edges: z.array(SdEdgeSchema).max(120),
  scenario: SdScenarioSchema,
}) satisfies z.ZodType<SdGraph>;

/** Inference helpers for TypeScript. */
export type SdNodeIn = z.infer<typeof SdNodeSchema>;
export type SdEdgeIn = z.infer<typeof SdEdgeSchema>;
export type SdScenarioIn = z.infer<typeof SdScenarioSchema>;
export type SdGraphIn = z.infer<typeof SdGraphSchema>;

/** Validation result with detailed errors for the UI. */
export function validateGraph(
  data: unknown,
): { success: true; data: SdGraph } | { success: false; errors: z.ZodIssue[] } {
  const result = SdGraphSchema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  return { success: false, errors: result.error.issues };
}
