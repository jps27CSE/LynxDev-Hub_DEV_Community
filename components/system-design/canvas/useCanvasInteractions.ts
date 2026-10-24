"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import type { SdNode, SdEdge, SdNodeType } from "@/config/system-design/types";
import { defaultNode, NODE_TYPES } from "@/lib/system-design/nodes";
import { getPortPosition } from "@/lib/system-design/geometry";

const NODE_WIDTH = 160;
const NODE_HEIGHT = 72;
const GRID_SIZE = 40;
const PORT_HIT_RADIUS = 6;
const EDGE_HIT_THRESHOLD = 8;

interface UseCanvasInteractionsProps {
  nodes: SdNode[];
  edges: SdEdge[];
  scale: number;
  pan: { x: number; y: number };
  onNodesChange: (nodes: SdNode[], persistLocally?: boolean) => void;
  onEdgesChange: (edges: SdEdge[]) => void;
  onPanChange: (pan: { x: number; y: number }) => void;
  onSelectNode: (id: string | null) => void;
  onSelectEdge: (id: string | null) => void;
  onConnect: (from: string, to: string) => void;
  onAddNode: (type: SdNodeType, x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

interface ConnectionState {
  fromNodeId: string;
  fromPort: "input" | "output";
  fromPortPos: { x: number; y: number };
  currentPos: { x: number; y: number } | null;
}

interface NodeDragState {
  nodeId: string;
  pointerX: number;
  pointerY: number;
  nodeX: number;
  nodeY: number;
}

export function useCanvasInteractions({
  nodes,
  edges,
  scale,
  pan,
  onNodesChange,
  onEdgesChange,
  onPanChange,
  onSelectNode,
  onSelectEdge,
  onConnect,
  onAddNode,
  onDeleteNode,
  onDeleteEdge,
  canvasRef,
}: UseCanvasInteractionsProps) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const selectedNodeIdRef = useRef<string | null>(null);
  const selectedEdgeIdRef = useRef<string | null>(null);
  const draggingNodeRef = useRef<NodeDragState | null>(null);

  const screenToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };

      return {
        x: (clientX - rect.left - pan.x) / scale,
        y: (clientY - rect.top - pan.y) / scale,
      };
    },
    [pan, scale, canvasRef],
  );

  const getNodeAtPosition = useCallback(
    (canvasX: number, canvasY: number) => {
      for (const node of nodes) {
        const nodeLeft = node.x;
        const nodeTop = node.y;
        const nodeRight = node.x + NODE_WIDTH;
        const nodeBottom = node.y + NODE_HEIGHT;

        if (
          canvasX >= nodeLeft &&
          canvasX <= nodeRight &&
          canvasY >= nodeTop &&
          canvasY <= nodeBottom
        ) {
          return node;
        }
      }
      return null;
    },
    [nodes],
  );

  const getPortAtPosition = useCallback(
    (
      node: SdNode,
      canvasX: number,
      canvasY: number,
    ): "input" | "output" | null => {
      const nodeCenterY = node.y + NODE_HEIGHT / 2;

      const outputPort = { x: node.x + NODE_WIDTH, y: nodeCenterY };
      const inputPort = { x: node.x, y: nodeCenterY };

      const distToOutput = Math.hypot(
        canvasX - outputPort.x,
        canvasY - outputPort.y,
      );
      const distToInput = Math.hypot(
        canvasX - inputPort.x,
        canvasY - inputPort.y,
      );

      if (distToOutput < PORT_HIT_RADIUS) return "output";
      if (distToInput < PORT_HIT_RADIUS) return "input";
      return null;
    },
    [],
  );

  const getEdgeAtPosition = useCallback(
    (canvasX: number, canvasY: number) => {
      const threshold = EDGE_HIT_THRESHOLD;
      for (const edge of edges) {
        const fromNode = nodes.find((n) => n.id === edge.from);
        const toNode = nodes.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) continue;

        const fromCenterX = fromNode.x + NODE_WIDTH;
        const fromCenterY = fromNode.y + NODE_HEIGHT / 2;
        const toCenterX = toNode.x;
        const toCenterY = toNode.y + NODE_HEIGHT / 2;

        const dx = toCenterX - fromCenterX;
        const dy = toCenterY - fromCenterY;
        const distance = Math.hypot(dx, dy);

        if (distance === 0) continue;

        const t =
          ((canvasX - fromCenterX) * dx + (canvasY - fromCenterY) * dy) /
          (distance * distance);

        if (t < 0 || t > 1) continue;

        const closestX = fromCenterX + t * dx;
        const closestY = fromCenterY + t * dy;
        const dist = Math.hypot(canvasX - closestX, canvasY - closestY);

        if (dist < threshold) return edge;
      }
      return null;
    },
    [edges, nodes],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      if (
        e.target instanceof Element &&
        e.target.closest(
          "button, input, textarea, select, [contenteditable='true']",
        )
      ) {
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);

      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const targetNode = getNodeAtPosition(canvasPos.x, canvasPos.y);

      if (targetNode) {
        const port = getPortAtPosition(targetNode, canvasPos.x, canvasPos.y);
        if (port) {
          setConnectionState({
            fromNodeId: targetNode.id,
            fromPort: port,
            fromPortPos: getPortPosition(
              targetNode,
              pan,
              scale,
              port === "output",
            ),
            currentPos: canvasPos,
          });
          onSelectNode(targetNode.id);
          selectedNodeIdRef.current = targetNode.id;
          return;
        }

        onSelectNode(targetNode.id);
        selectedNodeIdRef.current = targetNode.id;
        onSelectEdge(null);
        selectedEdgeIdRef.current = null;
        draggingNodeRef.current = {
          nodeId: targetNode.id,
          pointerX: e.clientX,
          pointerY: e.clientY,
          nodeX: targetNode.x,
          nodeY: targetNode.y,
        };
        return;
      }

      const targetEdge = getEdgeAtPosition(canvasPos.x, canvasPos.y);
      if (targetEdge) {
        onSelectEdge(targetEdge.id);
        selectedEdgeIdRef.current = targetEdge.id;
        onSelectNode(null);
        selectedNodeIdRef.current = null;
        return;
      }

      onSelectNode(null);
      onSelectEdge(null);
      selectedNodeIdRef.current = null;
      selectedEdgeIdRef.current = null;

      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [
      screenToCanvas,
      getNodeAtPosition,
      getPortAtPosition,
      getEdgeAtPosition,
      onSelectNode,
      onSelectEdge,
      pan,
    ],
  );

  const handlePointerMove = useCallback(
    (e: Event) => {
      const me = e as PointerEvent;
      const drag = draggingNodeRef.current;
      if (drag) {
        const deltaX = (me.clientX - drag.pointerX) / scale;
        const deltaY = (me.clientY - drag.pointerY) / scale;
        onNodesChange(
          nodes.map((node) =>
            node.id === drag.nodeId
              ? { ...node, x: drag.nodeX + deltaX, y: drag.nodeY + deltaY }
              : node,
          ),
          false,
        );
        return null;
      }

      if (isPanning) {
        const dx = me.clientX - panStartRef.current.x;
        const dy = me.clientY - panStartRef.current.y;
        onPanChange({
          x: panStartRef.current.panX + dx,
          y: panStartRef.current.panY + dy,
        });
      }

      if (connectionState) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          setConnectionState((prev) =>
            prev
              ? {
                  ...prev,
                  currentPos: {
                    x: me.clientX - rect.left,
                    y: me.clientY - rect.top,
                  },
                }
              : null,
          );
        }
      }

      return null;
    },
    [
      isPanning,
      connectionState,
      nodes,
      onNodesChange,
      onPanChange,
      scale,
      canvasRef,
    ],
  );

  const handlePointerUp = useCallback(
    (e: Event) => {
      const me = e as PointerEvent;
      if (e.type === "pointercancel") {
        const drag = draggingNodeRef.current;
        if (drag) onNodesChange(nodes, true);
        draggingNodeRef.current = null;
        setIsPanning(false);
        setConnectionState(null);
        return;
      }

      const drag = draggingNodeRef.current;
      if (drag) {
        draggingNodeRef.current = null;
        const movedNode = nodes.find((node) => node.id === drag.nodeId);
        if (movedNode) {
          const x = Math.round(movedNode.x / GRID_SIZE) * GRID_SIZE;
          const y = Math.round(movedNode.y / GRID_SIZE) * GRID_SIZE;
          onNodesChange(
            nodes.map((node) =>
              node.id === drag.nodeId ? { ...node, x, y } : node,
            ),
            true,
          );
        }
        return;
      }

      if (isPanning) {
        setIsPanning(false);
        return;
      }

      if (connectionState) {
        const canvasPos = screenToCanvas(me.clientX, me.clientY);
        const targetNode = getNodeAtPosition(canvasPos.x, canvasPos.y);

        if (targetNode && targetNode.id !== connectionState.fromNodeId) {
          const port = getPortAtPosition(targetNode, canvasPos.x, canvasPos.y);
          if (port && port !== connectionState.fromPort) {
            const from =
              connectionState.fromPort === "output"
                ? connectionState.fromNodeId
                : targetNode.id;
            const to =
              connectionState.fromPort === "output"
                ? targetNode.id
                : connectionState.fromNodeId;

            const existingEdge = edges.find(
              (e) => e.from === from && e.to === to,
            );
            if (!existingEdge) {
              onConnect(from, to);
            }
          }
        }
        // Don't clear immediately - allow clicking another port to connect
        // setConnectionState(null);
      }
    },
    [
      isPanning,
      connectionState,
      screenToCanvas,
      getNodeAtPosition,
      getPortAtPosition,
      edges,
      onConnect,
      nodes,
      onNodesChange,
    ],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(3, scale * zoomFactor));

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newPanX = mouseX - (mouseX - pan.x) * (newScale / scale);
      const newPanY = mouseY - (mouseY - pan.y) * (newScale / scale);

      return { scale: newScale, panX: newPanX, panY: newPanY };
    },
    [scale, pan, canvasRef],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && !e.shiftKey) {
        const target = e.target;
        if (
          target instanceof HTMLElement &&
          (target.isContentEditable ||
            target.closest(
              "button, input, textarea, select, [contenteditable='true']",
            ))
        ) {
          return;
        }
        if (selectedNodeIdRef.current) {
          onDeleteNode(selectedNodeIdRef.current);
          onSelectNode(null);
          selectedNodeIdRef.current = null;
        } else if (selectedEdgeIdRef.current) {
          onDeleteEdge(selectedEdgeIdRef.current);
          onSelectEdge(null);
          selectedEdgeIdRef.current = null;
        }
      }

      if (e.key === "Escape") {
        if (connectionState) {
          setConnectionState(null);
        } else {
          onSelectNode(null);
          onSelectEdge(null);
          selectedNodeIdRef.current = null;
          selectedEdgeIdRef.current = null;
        }
      }
    },
    [connectionState, onDeleteNode, onDeleteEdge, onSelectNode, onSelectEdge],
  );

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlePointerMove, handlePointerUp, handleKeyDown]);

  const startConnection = useCallback(
    (nodeId: string, port: "input" | "output") => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      // If already connecting from same node/port, cancel
      if (
        connectionState &&
        connectionState.fromNodeId === nodeId &&
        connectionState.fromPort === port
      ) {
        setConnectionState(null);
        return;
      }

      // If connecting and click opposite port on different node, connect
      if (connectionState && connectionState.fromNodeId !== nodeId) {
        if (port !== connectionState.fromPort) {
          const from =
            connectionState.fromPort === "output"
              ? connectionState.fromNodeId
              : nodeId;
          const to =
            connectionState.fromPort === "output"
              ? nodeId
              : connectionState.fromNodeId;

          const existingEdge = edges.find((e) => e.from === from && e.to === to);
          if (!existingEdge) {
            onConnect(from, to);
          }
          setConnectionState(null);
          return;
        }
      }

      const fromPortPos = getPortPosition(node, pan, scale, port === "output");
      setConnectionState({
        fromNodeId: nodeId,
        fromPort: port,
        fromPortPos,
        currentPos: fromPortPos,
      });
    },
    [nodes, pan, scale, connectionState, edges, onConnect],
  );

  const handleDragStart = useCallback(
    (type: SdNodeType, e: React.DragEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      onAddNode(type, canvasPos.x, canvasPos.y);
    },
    [canvasRef, screenToCanvas, onAddNode],
  );

  return {
    connectionState,
    isPanning,
    handlePointerDown,
    handleWheel,
    handleDragStart,
    startConnection,
  };
}
