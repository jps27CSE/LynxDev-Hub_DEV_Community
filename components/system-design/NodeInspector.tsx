"use client";

import { cn } from "@/lib/utils";
import type {
  SdNode,
  SdLoadBalancerNode,
  SdAppServerNode,
  SdCacheNode,
  SdDatabaseNode,
  SdQueueNode,
  SdWorkerNode,
  SdCdnNode,
  SdObjectStoreNode,
  SdClientNode,
} from "@/config/system-design/types";

type NodeUpdates =
  | Partial<SdClientNode>
  | Partial<SdLoadBalancerNode>
  | Partial<SdAppServerNode>
  | Partial<SdCacheNode>
  | Partial<SdDatabaseNode>
  | Partial<SdQueueNode>
  | Partial<SdWorkerNode>
  | Partial<SdCdnNode>
  | Partial<SdObjectStoreNode>;

interface NodeInspectorProps {
  node: SdNode | undefined;
  onUpdate: (updates: NodeUpdates) => void;
}

export function NodeInspector({ node, onUpdate }: NodeInspectorProps) {
  if (!node) return null;

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground block mb-1">
          Label
        </label>
        <input
          type="text"
          value={node.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full px-2 py-1 bg-background border border-border rounded text-sm"
        />
      </div>

      {node.type === "load_balancer" && (
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Algorithm
          </label>
          <select
            value={node.algorithm}
            onChange={(e) =>
              onUpdate({ algorithm: e.target.value as "rr" | "least_conn" })
            }
            className="w-full px-2 py-1 bg-background border border-border rounded text-sm"
          >
            <option value="rr">Round Robin</option>
            <option value="least_conn">Least Connections</option>
          </select>
        </div>
      )}

      {node.type === "app_server" && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Replicas</span>
            <input
              type="number"
              min="1"
              max="100"
              value={node.replicas}
              onChange={(e) => onUpdate({ replicas: parseInt(e.target.value) })}
              className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Max Concurrency</span>
            <input
              type="number"
              min="1"
              value={node.maxConcurrency || 100}
              onChange={(e) =>
                onUpdate({ maxConcurrency: parseInt(e.target.value) || null })
              }
              className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Circuit Breaker</span>
            <input
              type="checkbox"
              checked={node.breakerEnabled}
              onChange={(e) => onUpdate({ breakerEnabled: e.target.checked })}
            />
          </label>
        </div>
      )}

      {node.type === "cache" && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Hit Rate</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={node.hitRate}
              onChange={(e) =>
                onUpdate({ hitRate: parseFloat(e.target.value) })
              }
              className="flex-1 h-2 bg-muted rounded-lg appearance-none accent-primary"
            />
            <span className="w-10 text-right font-mono text-sm">
              {(node.hitRate * 100).toFixed(0)}%
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">TTL (ms)</span>
            <input
              type="number"
              min="1000"
              max="3600000"
              value={node.ttlMs}
              onChange={(e) => onUpdate({ ttlMs: parseInt(e.target.value) })}
              className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Stampede Guard</span>
            <input
              type="checkbox"
              checked={node.stampedeGuard}
              onChange={(e) => onUpdate({ stampedeGuard: e.target.checked })}
            />
          </label>
        </div>
      )}

      {node.type === "database" && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Read Replicas</span>
            <input
              type="number"
              min="0"
              max="10"
              value={node.readReplicas}
              onChange={(e) =>
                onUpdate({ readReplicas: parseInt(e.target.value) })
              }
              className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
            />
          </label>
          <label className="flex items_center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Partitions</span>
            <input
              type="number"
              min="1"
              max="1000"
              value={node.partitions}
              onChange={(e) =>
                onUpdate({ partitions: parseInt(e.target.value) })
              }
              className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Hot Key Share</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={node.hotKeyShare}
              onChange={(e) =>
                onUpdate({ hotKeyShare: parseFloat(e.target.value) })
              }
              className="flex-1 h-2 bg-muted rounded-lg appearance-none accent-primary"
            />
            <span className="w-10 text-right font-mono text-sm">
              {(node.hotKeyShare * 100).toFixed(0)}%
            </span>
          </label>
        </div>
      )}

      {node.type === "queue" && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Max Depth</span>
            <input
              type="number"
              min="1"
              max="1000000"
              value={node.maxDepth}
              onChange={(e) => onUpdate({ maxDepth: parseInt(e.target.value) })}
              className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Retry Limit</span>
            <input
              type="number"
              min="0"
              max="100"
              value={node.retryLimit}
              onChange={(e) =>
                onUpdate({ retryLimit: parseInt(e.target.value) })
              }
              className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">DLQ</span>
            <input
              type="checkbox"
              checked={node.dlqEnabled}
              onChange={(e) => onUpdate({ dlqEnabled: e.target.checked })}
            />
          </label>
        </div>
      )}

      {node.type === "worker" && (
        <div>
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Replicas</span>
            <input
              type="number"
              min="1"
              max="100"
              value={node.replicas}
              onChange={(e) => onUpdate({ replicas: parseInt(e.target.value) })}
              className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
            />
          </label>
        </div>
      )}

      {node.type === "cdn" && (
        <div>
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Hit Rate</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={node.hitRate}
              onChange={(e) =>
                onUpdate({ hitRate: parseFloat(e.target.value) })
              }
              className="flex-1 h-2 bg-muted rounded-lg appearance-none accent-primary"
            />
            <span className="w-10 text-right font-mono text-sm">
              {(node.hitRate * 100).toFixed(0)}%
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
