"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { NODE_TYPES, NODE_TYPE_ORDER } from "@/lib/system-design/nodes";
import type { SdNodeType } from "@/config/system-design/types";
import { NodeCard } from "./NodeCard";
import { EdgePath } from "./EdgePath";
import { NodePalette } from "./NodePalette";
import { useCanvasInteractions } from "./useCanvasInteractions";
import type { SdNode, SdEdge, SdGraph, SdFailure } from "@/config/system-design/types";
import { defaultNode } from "@/lib/system-design/nodes";
import { simulate } from "@/lib/system-design/engine";

const MIN_SCALE = 0.1;
const MAX_SCALE = 3;
const GRID_SIZE = 40;

interface CanvasProps {
  graph: SdGraph;
  failures?: SdFailure[];
  onGraphChange: (graph: SdGraph) => void;
  selectedNodeId?: string | null;
  onSelectNode: (id: string | null) => void;
  selectedEdgeId?: string | null;
  onSelectEdge: (id: string | null) => void;
  onRunSimulation: (failures?: SdFailure[]) => void;
  onConnect: (from: string, to: string) => void;
  simulationResult?: ReturnType<typeof simulate>;
  className?: string;
}

export function Canvas({
  graph,
  failures = [],
  onGraphChange,
  selectedNodeId,
  onSelectNode,
  selectedEdgeId,
  onSelectEdge,
  onRunSimulation,
  onConnect,
  simulationResult,
  className,
}: CanvasProps) {
  const [nodes, setNodes] = useState<SdNode[]>(graph.nodes);
  const [edges, setEdges] = useState<SdEdge[]>(graph.edges);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<{ from: string; port: "input" | "output"; pos: { x: number; y: number } } | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  const canvasRef = useRef<HTMLDivElement>(null as HTMLDivElement | null);

  const {
    connectionState,
    isPanning,
    handleMouseDown,
    handleWheel: handleWheelFromHook,
    handleDragStart,
  } = useCanvasInteractions({
    nodes,
    edges,
    scale,
    pan,
    onNodesChange: setNodes,
    onEdgesChange: setEdges,
    onSelectNode,
    onSelectEdge,
    onConnect,
    onAddNode: (type, x, y) => {
      const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newNode = defaultNode(type, id, x, y);
      setNodes((prev) => [...prev, newNode]);
    },
    onDeleteNode: (id) => {
      setNodes((prev) => prev.filter((n) => n.id !== id));
      setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
    },
    onDeleteEdge: (id) => {
      setEdges((prev) => prev.filter((e) => e.id !== id));
    },
    canvasRef,
  });

  useEffect(() => {
    onGraphChange({ nodes, edges, scenario: graph.scenario });
  }, [nodes, edges, graph.scenario, onGraphChange]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const result = handleWheelFromHook?.(e);
    if (result) {
      setScale(result.scale);
      setPan({ x: result.panX, y: result.panY });
    }
  };

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(MAX_SCALE, s * 1.2));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(MIN_SCALE, s / 1.2));
  }, []);

  const resetView = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const fitView = useCallback(() => {
    if (nodes.length === 0) return;
    const minX = Math.min(...nodes.map((n) => n.x));
    const maxX = Math.max(...nodes.map((n) => n.x + 160));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxY = Math.max(...nodes.map((n) => n.y + 72));

    const width = maxX - minX;
    const height = maxY - minY;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const padding = 80;
    const scaleX = (canvas.clientWidth - padding) / width;
    const scaleY = (canvas.clientHeight - padding) / height;
    const newScale = Math.min(scaleX, scaleY, MAX_SCALE);

    setScale(newScale);
    setPan({
      x: (canvas.clientWidth - width * newScale) / 2 - minX * newScale,
      y: (canvas.clientHeight - height * newScale) / 2 - minY * newScale,
    });
  }, [nodes]);

  return (
    <div className={cn("relative flex-1 overflow-hidden bg-background", className)} ref={canvasRef} onWheel={handleWheel} onMouseDown={handleMouseDown}>
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          {showGrid && (
            <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
              <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="hsl(var(--border))" strokeWidth={0.5} />
            </pattern>
          )}
        </defs>
        {showGrid && <rect className="w-full h-full" fill="url(#grid)" />}
        <g style={{ transform: `translate(${pan.x}, ${pan.y}) scale(${scale})` }}>
          {edges.map((edge) => {
            const fromNode = nodes.find((n) => n.id === edge.from);
            const toNode = nodes.find((n) => n.id === edge.to);
            return (
              <EdgePath
                key={edge.id}
                edge={edge}
                fromNode={fromNode}
                toNode={toNode}
                scale={scale}
                pan={pan}
                selected={selectedEdgeId === edge.id}
                onSelect={onSelectEdge}
                onDelete={(id) => setEdges((prev) => prev.filter((e) => e.id !== id))}
              />
            );
          })}
          {connectionState && (
            <g>
              <path
                d={`M${connectionState.fromNodeId} C...`}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="6,4"
                fill="none"
                style={{ pointerEvents: "none" }}
              />
            </g>
          )}
          {nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              scale={scale}
              pan={pan}
              selected={selectedNodeId === node.id}
              onSelect={onSelectNode}
              onDragStart={() => {}}
              onDragEnd={() => {}}
              onPositionChange={(id, x, y) => {
                setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x: Math.round(x / GRID_SIZE) * GRID_SIZE, y: Math.round(y / GRID_SIZE) * GRID_SIZE } : n)));
              }}
              onConnectStart={(e, nodeId, port) => {
                e.stopPropagation();
                setConnecting({ from: nodeId, port, pos: { x: 0, y: 0 } });
              }}
              utilisation={simulationResult?.perNode.find((n) => n.id === node.id)?.utilisation}
            />
          ))}
        </g>
      </svg>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2" style={{ pointerEvents: "auto" }}>
        <button onClick={zoomIn} className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors" title="Zoom in (Ctrl + +)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button onClick={zoomOut} className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors" title="Zoom out (Ctrl + -)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button onClick={resetView} className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors" title="Reset view (Ctrl + 0)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button onClick={fitView} className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors" title="Fit to view (Ctrl + F)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
        </button>
      </div>

      <div className="absolute top-4 left-4 flex gap-2" style={{ pointerEvents: "auto" }}>
        <label className="flex items-center gap-2 p-2 rounded-lg bg-card/80 border border-border backdrop-blur-sm">
          <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} className="sr-only" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn("text-muted-foreground", showGrid && "text-foreground")}>
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <span className="text-sm">Grid</span>
        </label>
      </div>

      <NodePalette onDragStart={handleDragStart} />
    </div>
  );
}