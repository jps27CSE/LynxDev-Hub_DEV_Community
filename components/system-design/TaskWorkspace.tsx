"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  AlertTriangle,
  Check,
  CircleHelp,
  Grid2X2,
  LoaderCircle,
  Minus,
  Plus,
  RotateCcw,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { getModule } from "@/config/system-design/registry";
import type {
  SdEdge,
  SdFailure,
  SdGraph,
  SdModule,
  SdNode,
  SdNodeType,
  SdPassCriterion,
  SdTaskState,
  SimulationResult,
  StepResult,
} from "@/config/system-design/types";
import { SdGraphSchema, validateGraph } from "@/lib/system-design/validation";
import { simulate } from "@/lib/system-design/engine";
import { defaultNode, NODE_TYPES } from "@/lib/system-design/nodes";
import { useCanvasInteractions } from "@/components/system-design/canvas/useCanvasInteractions";
import { EdgePath } from "@/components/system-design/canvas/EdgePath";
import { NodeCard } from "@/components/system-design/canvas/NodeCard";
import { NodePalette } from "@/components/system-design/canvas/NodePalette";
import { SimulationPanel } from "@/components/system-design/SimulationPanel";
import { ResultsRail } from "@/components/system-design/ResultsRail";
import { FailurePanel } from "@/components/system-design/FailurePanel";
import { ModelDisclosure } from "@/components/system-design/ModelDisclosure";
import { NodeInspector } from "@/components/system-design/NodeInspector";
import { StepRail } from "@/components/system-design/StepRail";
import { CriteriaPanel } from "@/components/system-design/CriteriaPanel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const MIN_SCALE = 0.1;
const MAX_SCALE = 3;
const GRID_SIZE = 40;
const TASK_STATE_SCHEMA = SdGraphSchema;

type WorkspacePanel =
  | "results"
  | "inspector"
  | "failures"
  | "criteria"
  | "model";
type MobileTab = "design" | "run" | "steps";

const EMPTY_GRAPH: SdGraph = {
  nodes: [],
  edges: [],
  scenario: {
    arrivalRate: 100,
    writeShare: 0.05,
    mediaShare: 0,
    bytesPerMediaRequest: 2_000_000,
    abusiveShare: 0,
    latencyJitterMs: 0,
    cacheColdStart: false,
    replicaLagMs: 0,
  },
};

function cloneGraph(graph: SdGraph): SdGraph {
  return {
    nodes: graph.nodes.map((node) => ({ ...node })),
    edges: graph.edges.map((edge) => ({
      ...edge,
      retry: { ...edge.retry },
    })),
    scenario: { ...graph.scenario },
  };
}

function createTaskState(graph: SdGraph): SdTaskState {
  return {
    graph: cloneGraph(graph),
    steps: [],
    criteriaMet: [],
    attempts: 0,
    revealed: [],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Highest numeric suffix seen in any node or edge id of the form
 * `<kind>-<n>`. Used to seed the auto-increment counter so newly generated
 * ids never collide with ids that arrived from the server or seed data.
 */
function maxIdIndex(graph: SdGraph): number {
  const ids = [...graph.nodes.map((n) => n.id), ...graph.edges.map((e) => e.id)];
  let max = 0;
  for (const id of ids) {
    const match = /^([a-z]+)-(\d+)$/i.exec(id);
    if (match) {
      const n = Number.parseInt(match[2], 10);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  return max;
}

function parseTaskState(value: unknown): SdTaskState | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Record<string, unknown>;
  const graph = validateGraph(candidate.graph);
  if (
    !graph.success ||
    !Array.isArray(candidate.steps) ||
    !candidate.steps.every((item) => typeof item === "string") ||
    !Array.isArray(candidate.criteriaMet) ||
    !candidate.criteriaMet.every((item) => typeof item === "string") ||
    !Array.isArray(candidate.revealed) ||
    !candidate.revealed.every((item) => typeof item === "string") ||
    typeof candidate.attempts !== "number" ||
    !Number.isInteger(candidate.attempts) ||
    candidate.attempts < 0 ||
    candidate.attempts > 1_000_000 ||
    typeof candidate.updatedAt !== "string" ||
    !Number.isFinite(Date.parse(candidate.updatedAt))
  ) {
    return null;
  }
  return {
    graph: graph.data,
    steps: candidate.steps,
    criteriaMet: candidate.criteriaMet,
    attempts: candidate.attempts,
    revealed: candidate.revealed,
    updatedAt: candidate.updatedAt,
  };
}

function graphStepResults(module: SdModule, graph: SdGraph): StepResult[] {
  return module.task.steps.map((step) => step.check(graph));
}

function currentStepIds(module: SdModule, graph: SdGraph): string[] {
  return module.task.steps
    .filter((step) => step.check(graph).passed)
    .map((step) => step.id);
}

function mergeTaskStates(
  module: SdModule,
  localState: SdTaskState | null,
  serverState: SdTaskState | null,
): SdTaskState | null {
  const newestState =
    localState && serverState
      ? Date.parse(serverState.updatedAt) > Date.parse(localState.updatedAt)
        ? serverState
        : localState
      : (localState ?? serverState);
  if (!newestState) return null;

  return {
    ...newestState,
    criteriaMet: [
      ...new Set([
        ...(localState?.criteriaMet ?? []),
        ...(serverState?.criteriaMet ?? []),
      ]),
    ],
    attempts: Math.max(localState?.attempts ?? 0, serverState?.attempts ?? 0),
    revealed: [
      ...new Set([
        ...(localState?.revealed ?? []),
        ...(serverState?.revealed ?? []),
      ]),
    ],
    steps: currentStepIds(module, newestState.graph),
  };
}

function isPassCriterion(value: SdPassCriterion): boolean {
  return value.required;
}

function isSdNodeType(value: string): value is SdNodeType {
  return Object.hasOwn(NODE_TYPES, value);
}

export function TaskWorkspace({ moduleSlug }: { moduleSlug: string }) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const isMobile = useIsMobile();
  const [module, setModule] = useState<SdModule | null>(null);
  const [moduleLoadError, setModuleLoadError] = useState(false);
  const [moduleLoadAttempt, setModuleLoadAttempt] = useState(0);
  const [taskState, setTaskState] = useState<SdTaskState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSharedDesign, setIsSharedDesign] = useState(false);
  const [sharedDesignSaved, setSharedDesignSaved] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("design");
  const [rightPanel, setRightPanel] = useState<WorkspacePanel>("results");
  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(null);
  const [failures, setFailures] = useState<SdFailure[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [checkedGraph, setCheckedGraph] = useState(EMPTY_GRAPH);

  const canvasRef = useRef<HTMLDivElement>(null);
  const taskStateRef = useRef<SdTaskState | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const nextNodeIdRef = useRef(0);

  const nextId = useCallback((prefix: string) => {
      const graph = taskStateRef.current?.graph;
      const existing = new Set(
        graph
          ? [...graph.nodes.map((n) => n.id), ...graph.edges.map((e) => e.id)]
          : [],
      );
      let id = `${prefix}-${nextNodeIdRef.current++}`;
      while (existing.has(id)) {
        id = `${prefix}-${nextNodeIdRef.current++}`;
      }
      return id;
    }, []);

  const completionStorageKey = user ? `sd-task:${user.id}:${moduleSlug}` : null;
  const currentGraph = taskState?.graph ?? EMPTY_GRAPH;
  const nodeById = useMemo(
    () => new Map(currentGraph.nodes.map((node) => [node.id, node])),
    [currentGraph.nodes],
  );
  const perNodeResults = useMemo(
    () =>
      new Map(
        (simulationResult?.perNode ?? []).map((result) => [result.id, result]),
      ),
    [simulationResult],
  );
  const stepResults = useMemo(
    () => (module ? graphStepResults(module, checkedGraph) : []),
    [module, checkedGraph],
  );
  const requiredCriteria = module
    ? module.task.passCriteria.filter(isPassCriterion)
    : [];
  const taskUnlocked =
    requiredCriteria.length > 0 &&
    requiredCriteria.every((criterion) =>
      taskState?.criteriaMet.includes(criterion.id),
    );

  useEffect(() => {
    let cancelled = false;
    setModule(null);
    setTaskState(null);
    setIsReady(false);
    setIsSharedDesign(false);
    setSharedDesignSaved(false);
    setSimulationResult(null);
    setCheckedGraph(EMPTY_GRAPH);
    setModuleLoadError(false);

    void getModule(moduleSlug)
      .then((loadedModule) => {
        if (!loadedModule) {
          throw new Error(`Unknown system-design module "${moduleSlug}".`);
        }
        if (!cancelled) setModule(loadedModule);
      })
      .catch((error: unknown) => {
        console.error("Failed to load system-design task", error);
        if (!cancelled) {
          setModuleLoadError(true);
          toast.error("Could not load this build task.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [moduleLoadAttempt, moduleSlug]);

  useEffect(() => {
    if (!module || !isUserLoaded) return;
    const currentModule = module;
    let cancelled = false;

    async function hydrateTask() {
      let localState: SdTaskState | null = null;
      let serverState: SdTaskState | null = null;
      let sharedGraph: SdGraph | null = null;
      const query = new URLSearchParams(window.location.search);
      const sharedPayload = query.get("d");

      if (sharedPayload) {
        const decoded = (
          await import("@/lib/system-design/graph-codec")
        ).decodeGraph(sharedPayload);
        if (decoded.success) {
          sharedGraph = decoded.data;
          if (!cancelled) setIsSharedDesign(true);
        } else {
          toast.error(`This shared design is invalid: ${decoded.error}`);
        }
      }

      if (!sharedGraph && completionStorageKey) {
        try {
          const stored = window.localStorage.getItem(completionStorageKey);
          if (stored) {
            const parsed = parseTaskState(JSON.parse(stored));
            if (parsed) localState = parsed;
            else toast.error("Saved task data is invalid and was ignored.");
          }
        } catch (error) {
          console.error("Failed to read local system-design task state", error);
          toast.error("Could not read the local task backup.");
        }
      }

      if (!sharedGraph && user) {
        try {
          const response = await fetch("/api/system-design/state");
          if (!response.ok)
            throw new Error(`Task state request failed (${response.status})`);
          const responseData: unknown = await response.json();
          if (
            typeof responseData !== "object" ||
            responseData === null ||
            !("tasks" in responseData) ||
            typeof responseData.tasks !== "object" ||
            responseData.tasks === null ||
            Array.isArray(responseData.tasks)
          ) {
            throw new Error("Task state response has an invalid format.");
          }
          const tasks = responseData.tasks as Record<string, unknown>;
          const hasSavedTask = Object.hasOwn(tasks, moduleSlug);
          if (hasSavedTask) {
            serverState = parseTaskState(tasks[moduleSlug]);
            if (!serverState)
              console.error(
                "Server task data failed validation and was ignored.",
              );
          }
        } catch (error) {
          console.error("Failed to load server task state", error);
          toast.error(
            "Could not sync your saved task. Your local design will still work.",
          );
        }
      }

      if (cancelled) return;

      const mergedState = mergeTaskStates(
        currentModule,
        localState,
        serverState,
      );
      let hydrated: SdTaskState;
      if (sharedGraph) {
        hydrated = createTaskState(sharedGraph);
      } else if (mergedState) {
        hydrated = mergedState;
      } else {
        hydrated = createTaskState(currentModule.task.startGraph);
        hydrated.steps = currentStepIds(currentModule, hydrated.graph);
      }

      nextNodeIdRef.current = maxIdIndex(hydrated.graph);
      taskStateRef.current = hydrated;
      setTaskState(hydrated);
      setCheckedGraph(hydrated.graph);
      setIsReady(true);
    }

    void hydrateTask();
    return () => {
      cancelled = true;
    };
  }, [module, moduleSlug, user, isUserLoaded, completionStorageKey]);

  const commitTaskState = useCallback(
    (update: (current: SdTaskState) => SdTaskState, persistLocally = true) => {
      const current = taskStateRef.current;
      if (!current) return;
      const next = {
        ...update(current),
        updatedAt: new Date().toISOString(),
      };
      taskStateRef.current = next;
      setTaskState(next);

      if (
        persistLocally &&
        !isSharedDesign &&
        completionStorageKey &&
        isReady
      ) {
        try {
          window.localStorage.setItem(
            completionStorageKey,
            JSON.stringify(next),
          );
        } catch (error) {
          console.error(
            "Failed to persist local system-design task state",
            error,
          );
          toast.error("Your local backup could not be saved.", {
            id: "system-design-local-save",
          });
        }
      }
    },
    [completionStorageKey, isReady, isSharedDesign],
  );

  const queueTaskSave = useCallback(
    (
      snapshot: SdTaskState,
      taskSlug: string,
      run?: { criteriaMet: string[]; failures: SdFailure[] },
    ) => {
      saveQueueRef.current = saveQueueRef.current.then(async () => {
        try {
          const response = await fetch("/api/system-design/state", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kind: "task-save",
              taskSlug,
              graph: snapshot.graph,
              steps: snapshot.steps,
              attempts: snapshot.attempts,
              revealed: snapshot.revealed,
              ...(run
                ? { criteriaMet: run.criteriaMet, failures: run.failures }
                : {}),
            }),
          });
          if (!response.ok)
            throw new Error(`Task save failed (${response.status})`);
        } catch (error) {
          console.error("Failed to sync system-design task state", error);
          toast.error("Task sync failed. Your local backup is safe.", {
            id: "system-design-remote-save",
          });
        }
      });
    },
    [],
  );

  useEffect(() => {
    if (
      !isReady ||
      !taskState ||
      !module ||
      !user ||
      isSharedDesign ||
      !completionStorageKey
    ) {
      return;
    }

    const snapshot = taskState;
    const timeout = window.setTimeout(() => {
      queueTaskSave(snapshot, moduleSlug);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [
    completionStorageKey,
    isReady,
    isSharedDesign,
    module,
    moduleSlug,
    queueTaskSave,
    taskState,
    user,
  ]);

  const updateGraph = useCallback(
    (update: (graph: SdGraph) => SdGraph, persistLocally = true) => {
      const current = taskStateRef.current;
      if (!current) return;
      const graph = update(current.graph);
      setSimulationResult(null);
      commitTaskState(
        (latest) => ({
          ...latest,
          graph,
          steps:
            persistLocally && module
              ? currentStepIds(module, graph)
              : latest.steps,
        }),
        persistLocally,
      );
      if (persistLocally) setCheckedGraph(graph);
    },
    [commitTaskState, module],
  );

  const addNode = useCallback(
    (type: SdNodeType, x: number, y: number) => {
      const graph = taskStateRef.current?.graph;
      if (!graph) return;
      const id = nextId(type);
      const node = defaultNode(type, id, x, y);
      updateGraph((current) => ({
        ...current,
        nodes: [...current.nodes, node],
      }));
      setSelectedNodeId(id);
    },
    [nextId, updateGraph],
  );

  const onNodesChange = useCallback(
    (nodes: SdNode[], persistLocally = true) => {
      updateGraph((graph) => ({ ...graph, nodes }), persistLocally);
    },
    [updateGraph],
  );
  const onEdgesChange = useCallback(
    (edges: SdEdge[]) => {
      updateGraph((graph) => ({ ...graph, edges }));
    },
    [updateGraph],
  );
  const onConnect = useCallback(
    (from: string, to: string) => {
      const graph = taskStateRef.current?.graph;
      if (
        !graph ||
        graph.edges.some((edge) => edge.from === from && edge.to === to)
      ) {
        return;
      }
      const edge: SdEdge = {
        id: nextId("edge"),
        from,
        to,
        label: null,
        retry: { attempts: 0, backoffMs: 0, jitter: false },
        partitioned: false,
      };
      updateGraph((current) => ({
        ...current,
        edges: [...current.edges, edge],
      }));
    },
    [updateGraph],
  );
  const onDeleteNode = useCallback(
    (id: string) => {
      updateGraph((graph) => {
        const edges = graph.edges.filter(
          (edge) => edge.from !== id && edge.to !== id,
        );
        const edgeIds = new Set(edges.map((edge) => edge.id));
        setFailures((current) =>
          current.filter((failure) => {
            if (
              (failure.kind === "node_down" ||
                failure.kind === "degraded" ||
                failure.kind === "replica_lag") &&
              failure.nodeId === id
            ) {
              return false;
            }
            return (
              failure.kind !== "partition" ||
              failure.edgeIds.every((edgeId) => edgeIds.has(edgeId))
            );
          }),
        );
        return {
          ...graph,
          nodes: graph.nodes.filter((node) => node.id !== id),
          edges,
        };
      });
      setSelectedNodeId(null);
    },
    [updateGraph],
  );
  const onDeleteEdge = useCallback(
    (id: string) => {
      updateGraph((graph) => ({
        ...graph,
        edges: graph.edges.filter((edge) => edge.id !== id),
      }));
    },
    [updateGraph],
  );
  const onSelectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
    if (id) setSelectedEdgeId(null);
  }, []);
  const onSelectEdge = useCallback((id: string | null) => {
    setSelectedEdgeId(id);
    if (id) setSelectedNodeId(null);
  }, []);

  const {
    connectionState,
    handlePointerDown,
    handleWheel: getZoomFromWheel,
    startConnection,
  } = useCanvasInteractions({
    nodes: currentGraph.nodes,
    edges: currentGraph.edges,
    scale,
    pan,
    onNodesChange,
    onEdgesChange,
    onPanChange: setPan,
    onSelectNode,
    onSelectEdge,
    onConnect,
    onAddNode: addNode,
    onDeleteNode,
    onDeleteEdge,
    canvasRef,
  });

  const acceptSimulationResult = useCallback(
    (result: SimulationResult) => {
      const current = taskStateRef.current;
      if (!module || !current) return;
      setSimulationResult(result);

      const passedCriterionIds = result.valid
        ? module.task.passCriteria
            .filter((criterion) => criterion.assert(result))
            .map((criterion) => criterion.id)
        : [];
      const runSnapshot: SdTaskState = {
        ...current,
        criteriaMet: [
          ...new Set([...current.criteriaMet, ...passedCriterionIds]),
        ],
        attempts: current.attempts + 1,
      };
      commitTaskState((latest) => ({
        ...latest,
        steps: currentStepIds(module, latest.graph),
        criteriaMet: runSnapshot.criteriaMet,
        attempts: runSnapshot.attempts,
      }));
      if (user && completionStorageKey && !isSharedDesign) {
        queueTaskSave(runSnapshot, moduleSlug, {
          criteriaMet: passedCriterionIds,
          failures,
        });
      }
    },
    [
      commitTaskState,
      completionStorageKey,
      failures,
      isSharedDesign,
      module,
      moduleSlug,
      queueTaskSave,
      user,
    ],
  );

  const handleRun = useCallback(() => {
    const current = taskStateRef.current;
    if (!module || !current) return;
    acceptSimulationResult(simulate(current.graph, failures));
  }, [acceptSimulationResult, failures, module]);

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const next = getZoomFromWheel(event);
      if (next) {
        setScale(next.scale);
        setPan({ x: next.panX, y: next.panY });
      }
    },
    [getZoomFromWheel],
  );

  const handleCanvasDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const payload = event.dataTransfer.getData("application/json");
      if (!payload || !canvasRef.current) return;
      try {
        const parsed: unknown = JSON.parse(payload);
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          !("type" in parsed) ||
          typeof parsed.type !== "string" ||
          !isSdNodeType(parsed.type)
        ) {
          throw new Error("Dropped node type is invalid.");
        }
        const rect = canvasRef.current.getBoundingClientRect();
        addNode(
          parsed.type,
          (event.clientX - rect.left - pan.x) / scale,
          (event.clientY - rect.top - pan.y) / scale,
        );
      } catch (error) {
        console.error("Could not add the dropped node", error);
        toast.error("That node could not be added to the design.");
      }
    },
    [addNode, pan, scale],
  );

  const handleNodeUpdate = useCallback(
    (updates: Partial<SdNode>) => {
      if (!selectedNodeId) return;
      updateGraph((graph) => {
        const nodes = graph.nodes.map((node) => {
          if (node.id !== selectedNodeId) return node;
          const parsed = SdGraphSchema.shape.nodes.element.safeParse({
            ...node,
            ...updates,
          });
          if (!parsed.success) {
            toast.error("The node change is outside the allowed limits.", {
              id: "system-design-invalid-node",
            });
            return node;
          }
          return parsed.data;
        });
        return { ...graph, nodes };
      });
    },
    [selectedNodeId, updateGraph],
  );

  const revealSolution = useCallback(() => {
    if (!module) return;
    const criteriaIds = module.task.passCriteria.map(
      (criterion) => criterion.id,
    );
    commitTaskState((current) => ({
      ...current,
      graph: cloneGraph(module.task.solutionGraph),
      steps: currentStepIds(module, module.task.solutionGraph),
      revealed: [...new Set([...current.revealed, ...criteriaIds])],
    }));
    setCheckedGraph(module.task.solutionGraph);
    setSimulationResult(null);
    setRightPanel("criteria");
  }, [commitTaskState, module]);

  const saveSharedDesign = useCallback(() => {
    const current = taskStateRef.current;
    if (!current || !completionStorageKey) return;
    let previousState: SdTaskState | null = null;
    try {
      const previous = window.localStorage.getItem(completionStorageKey);
      if (previous) previousState = parseTaskState(JSON.parse(previous));
      const savedState = {
        ...current,
        criteriaMet: [
          ...new Set([
            ...current.criteriaMet,
            ...(previousState?.criteriaMet ?? []),
          ]),
        ],
        attempts: Math.max(current.attempts, previousState?.attempts ?? 0),
        revealed: [
          ...new Set([...current.revealed, ...(previousState?.revealed ?? [])]),
        ],
      };
      window.localStorage.setItem(
        completionStorageKey,
        JSON.stringify(savedState),
      );
      taskStateRef.current = savedState;
      setTaskState(savedState);
    } catch (error) {
      console.error("Failed to save shared design locally", error);
      toast.error("Could not save this design on the device.");
      return;
    }
    const savedState = parseTaskState(
      JSON.parse(window.localStorage.getItem(completionStorageKey) ?? "null"),
    );
    if (savedState) {
      taskStateRef.current = savedState;
      setTaskState(savedState);
    }
    setIsSharedDesign(false);
    setSharedDesignSaved(true);
    toast.success("Design saved as yours");
  }, [completionStorageKey]);

  const handleArrivalRateChange = useCallback(
    (arrivalRate: number) => {
      updateGraph((graph) => ({
        ...graph,
        scenario: { ...graph.scenario, arrivalRate },
      }));
    },
    [updateGraph],
  );

  const zoomBy = (factor: number) => {
    setScale((current) =>
      Math.max(MIN_SCALE, Math.min(MAX_SCALE, current * factor)),
    );
  };

  const fitView = () => {
    const canvas = canvasRef.current;
    if (!canvas || currentGraph.nodes.length === 0) return;
    const minX = Math.min(...currentGraph.nodes.map((node) => node.x));
    const minY = Math.min(...currentGraph.nodes.map((node) => node.y));
    const maxX = Math.max(...currentGraph.nodes.map((node) => node.x + 176));
    const maxY = Math.max(...currentGraph.nodes.map((node) => node.y + 82));
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const nextScale = Math.max(
      MIN_SCALE,
      Math.min(
        MAX_SCALE,
        (canvas.clientWidth - 64) / contentWidth,
        (canvas.clientHeight - 64) / contentHeight,
      ),
    );
    setScale(nextScale);
    setPan({
      x: (canvas.clientWidth - contentWidth * nextScale) / 2 - minX * nextScale,
      y:
        (canvas.clientHeight - contentHeight * nextScale) / 2 -
        minY * nextScale,
    });
  };

  if (moduleLoadError) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Could not load this build task.
        </p>
        <button
          type="button"
          onClick={() => setModuleLoadAttempt((attempt) => attempt + 1)}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Try again
        </button>
      </main>
    );
  }

  if (!isUserLoaded || !module || !isReady || !taskState) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-sm text-muted-foreground">
        <LoaderCircle className="animate-spin" size={18} />
        Loading your build task…
      </div>
    );
  }

  const stepsPanel = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1">
        <StepRail
          steps={module.task.steps}
          results={stepResults}
          attempts={taskState.attempts}
          onRun={handleRun}
        />
      </div>
      <div className="max-h-[42%] min-h-36 border-t border-border">
        <div className="border-b border-border px-4 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Add a component
          </p>
        </div>
        <NodePalette onDragStart={() => undefined} />
      </div>
    </div>
  );

  const designPanel = (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={canvasRef}
        className={cn(
          "relative min-h-0 flex-1 overflow-hidden bg-background",
          "touch-none",
          connectionState ? "cursor-crosshair" : "cursor-grab",
        )}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleCanvasDrop}
        aria-label="System design canvas"
      >
        <svg
          className="pointer-events-none absolute inset-0 size-full"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id={`task-grid-${moduleSlug}`}
              width={GRID_SIZE * scale}
              height={GRID_SIZE * scale}
              patternUnits="userSpaceOnUse"
              x={pan.x}
              y={pan.y}
            >
              <path
                d={`M ${GRID_SIZE * scale} 0 L 0 0 0 ${GRID_SIZE * scale}`}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="0.6"
              />
            </pattern>
            <marker
              id={`task-arrow-${moduleSlug}`}
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 z" fill="hsl(var(--muted-foreground))" />
            </marker>
          </defs>
          {showGrid && (
            <rect
              width="100%"
              height="100%"
              fill={`url(#task-grid-${moduleSlug})`}
            />
          )}
          {currentGraph.edges.map((edge) => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);
            if (!from || !to) return null;
            const fromX = pan.x + (from.x + 160) * scale;
            const fromY = pan.y + (from.y + 36) * scale;
            const toX = pan.x + to.x * scale;
            const toY = pan.y + (to.y + 36) * scale;
            const curve = Math.max(40, Math.abs(toX - fromX) / 2);
            return (
              <g key={edge.id}>
                <path
                  d={`M ${fromX} ${fromY} C ${fromX + curve} ${fromY}, ${toX - curve} ${toY}, ${toX} ${toY}`}
                  fill="none"
                  stroke={
                    selectedEdgeId === edge.id
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted-foreground) / 0.7)"
                  }
                  strokeWidth={selectedEdgeId === edge.id ? 2.5 : 1.6}
                  strokeDasharray={edge.partitioned ? "7 4" : undefined}
                  markerEnd={`url(#task-arrow-${moduleSlug})`}
                  className="pointer-events-auto cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectEdge(edge.id);
                  }}
                />
                {selectedEdgeId === edge.id && (
                  <foreignObject
                    x={(fromX + toX) / 2 - 19}
                    y={(fromY + toY) / 2 - 32}
                    width="38"
                    height="32"
                    className="pointer-events-auto"
                  >
                    <button
                      type="button"
                      onClick={() => onDeleteEdge(edge.id)}
                      className="rounded border border-destructive/30 bg-background px-2 py-1 text-xs text-destructive"
                      aria-label="Delete selected connection"
                    >
                      ×
                    </button>
                  </foreignObject>
                )}
              </g>
            );
          })}
          {connectionState?.currentPos && (
            <path
              d={`M ${connectionState.fromPortPos.x} ${connectionState.fromPortPos.y} L ${connectionState.currentPos.x} ${connectionState.currentPos.y}`}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
          )}
        </svg>

        {currentGraph.nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            scale={scale}
            pan={pan}
            selected={selectedNodeId === node.id}
            onSelect={onSelectNode}
            onConnectStart={startConnection}
            utilisation={perNodeResults.get(node.id)?.utilisation}
          />
        ))}

        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md border border-border bg-card/90 p-1 shadow-sm backdrop-blur">
          <button
            type="button"
            onClick={() => setShowGrid((shown) => !shown)}
            aria-pressed={showGrid}
            className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            title={showGrid ? "Hide grid" : "Show grid"}
          >
            <Grid2X2 size={15} />
          </button>
          <span className="px-1 font-mono text-[10px] text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md border border-border bg-card/90 p-1 shadow-sm backdrop-blur">
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.2)}
            className="rounded p-2 hover:bg-muted"
            aria-label="Zoom out"
          >
            <Minus size={15} />
          </button>
          <button
            type="button"
            onClick={() => {
              setScale(1);
              setPan({ x: 0, y: 0 });
            }}
            className="rounded p-2 hover:bg-muted"
            aria-label="Reset zoom"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1.2)}
            className="rounded p-2 hover:bg-muted"
            aria-label="Zoom in"
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            onClick={fitView}
            className="rounded px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            Fit
          </button>
        </div>

        {currentGraph.nodes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center">
            <div className="max-w-xs rounded-2xl border border-dashed border-sd-accent/40 bg-card/90 p-6 shadow-sm">
              <CircleHelp className="mx-auto text-sd-accent" size={24} />
              <p className="mt-3 text-sm font-semibold text-foreground">
                Start with the broken design
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Drag a component from the palette below, then connect the
                request path from client to data store.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="max-h-[42%] overflow-y-auto border-t border-border bg-card/70 p-3 sm:p-4">
        <SimulationPanel
          graph={currentGraph}
          failures={failures}
          passCriteria={module.task.passCriteria}
          onRun={acceptSimulationResult}
          onArrivalRateChange={handleArrivalRateChange}
          simulationResult={simulationResult}
        />
      </div>
    </div>
  );

  const detailsPanel = (
    <div className="flex h-full min-h-0 flex-col bg-card/40">
      <div className="flex gap-1 overflow-x-auto border-b border-border p-2">
        {(
          [
            ["results", "Results"],
            ["inspector", "Inspector"],
            ["failures", "Failures"],
            ["criteria", "Criteria"],
            ["model", "Model"],
          ] as const
        ).map(([panel, label]) => (
          <button
            key={panel}
            type="button"
            onClick={() => setRightPanel(panel)}
            aria-pressed={rightPanel === panel}
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              rightPanel === panel
                ? "bg-sd-accent text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {rightPanel === "results" && (
          <ResultsRail
            result={simulationResult}
            selectedNodeId={selectedNodeId}
          />
        )}
        {rightPanel === "inspector" && (
          <div className="h-full overflow-y-auto p-4">
            {selectedNodeId ? (
              <NodeInspector
                node={nodeById.get(selectedNodeId)}
                onUpdate={handleNodeUpdate}
              />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Select a node on the canvas to edit its properties.
              </p>
            )}
          </div>
        )}
        {rightPanel === "failures" && (
          <div className="h-full overflow-y-auto p-3">
            <FailurePanel
              graph={currentGraph}
              failures={failures}
              onFailuresChange={(next) => {
                setFailures(next);
                setSimulationResult(null);
              }}
            />
          </div>
        )}
        {rightPanel === "criteria" && (
          <CriteriaPanel
            criteria={module.task.passCriteria}
            result={simulationResult}
            criteriaMet={taskState.criteriaMet}
            revealed={taskState.revealed}
            onRevealSolution={revealSolution}
          />
        )}
        {rightPanel === "model" && (
          <div className="h-full overflow-y-auto p-3">
            <ModelDisclosure />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className="sd-scope flex h-[calc(100dvh-1rem)] min-h-[620px] flex-col overflow-hidden bg-background">
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-border px-3 py-2 sm:px-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sd-accent">
            System design / build task
          </p>
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-sm font-semibold sm:text-base">
              {module.title}
            </h1>
            {taskUnlocked && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                <Check size={12} /> Passed
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isSharedDesign && (
            <button
              type="button"
              onClick={saveSharedDesign}
              className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/15"
            >
              Save as mine
            </button>
          )}
          {sharedDesignSaved && (
            <span className="hidden text-xs text-emerald-700 dark:text-emerald-400 sm:inline">
              Shared design saved
            </span>
          )}
          <button
            type="button"
            onClick={() => setRightPanel("criteria")}
            className="hidden items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-muted sm:inline-flex"
          >
            <Share2 size={13} />
            Pass gate
          </button>
        </div>
      </header>

      {isSharedDesign && (
        <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/[0.06] px-4 py-2 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle size={14} />
          You’re viewing a shared design. It won’t overwrite your saved task
          unless you choose “Save as mine”.
        </div>
      )}

      {!isMobile && (
        <div className="min-h-0 flex-1 md:flex">
          <ResizablePanelGroup
            id={`task-workspace-${moduleSlug}`}
            orientation="horizontal"
            className="h-full"
          >
            <ResizablePanel
              id="steps"
              defaultSize="24%"
              minSize="19%"
              maxSize="34%"
              className="min-w-0"
            >
              {stepsPanel}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              id="design"
              defaultSize="51%"
              minSize="36%"
              className="min-w-0"
            >
              {designPanel}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              id="details"
              defaultSize="25%"
              minSize="19%"
              maxSize="38%"
              className="min-w-0"
            >
              {detailsPanel}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}

      {isMobile && (
        <div className="flex min-h-0 flex-1 flex-col">
          <nav
            aria-label="Build task views"
            className="grid grid-cols-3 border-b border-border bg-card/60"
          >
            {(
              [
                ["design", "Design"],
                ["run", "Run"],
                ["steps", "Steps"],
              ] as const
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMobileTab(tab)}
                aria-current={mobileTab === tab ? "page" : undefined}
                className={cn(
                  "min-h-11 border-b-2 px-3 text-sm font-medium",
                  mobileTab === tab
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="min-h-0 flex-1">
            {mobileTab === "design" && designPanel}
            {mobileTab === "run" && detailsPanel}
            {mobileTab === "steps" && stepsPanel}
          </div>
        </div>
      )}
    </main>
  );
}
