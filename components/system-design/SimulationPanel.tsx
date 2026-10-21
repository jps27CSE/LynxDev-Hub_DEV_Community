"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { simulate } from "@/lib/system-design/engine";
import type { SimulationResult, SdGraph, SdFailure, SdNode } from "@/config/system-design/types";

interface SimulationPanelProps {
  graph: SdGraph;
  failures: SdFailure[];
  onRun: (result: SimulationResult) => void;
  onFailuresChange: (failures: SdFailure[]) => void;
  simulationResult?: SimulationResult;
  isRunning?: boolean;
}

const MIN_ARRIVAL_RATE = 10;
const MAX_ARRIVAL_RATE = 200_000;
const SPARKLINE_POINTS = 60;

export function SimulationPanel({
  graph,
  failures,
  onRun,
  onFailuresChange,
  simulationResult,
  isRunning = false,
}: SimulationPanelProps) {
  const [arrivalRate, setArrivalRate] = useState(graph.scenario.arrivalRate);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
  const [lastResult, setLastResult] = useState<SimulationResult | null>(simulationResult ?? null);
  const [verdict, setVerdict] = useState<"idle" | "pass" | "fail" | "running">("idle");
  const animationFrameRef = useRef<number | null>(null);

  // Sync arrival rate with graph scenario
  useEffect(() => {
    setArrivalRate(graph.scenario.arrivalRate);
  }, [graph.scenario.arrivalRate]);

  // Update lastResult when simulationResult changes
  useEffect(() => {
    if (simulationResult) {
      setLastResult(simulationResult);
      setVerdict("pass");
      // Track latency for sparkline
      setLatencyHistory((prev) => [...prev.slice(-SPARKLINE_POINTS + 1), simulationResult.latency.p95]);
    }
  }, [simulationResult]);

  // Sparkline data
  const sparklinePoints = useMemo(() => {
    if (latencyHistory.length < 2) return "";
    const maxLatency = Math.max(...latencyHistory, 1);
    const width = 200;
    const height = 40;
    const stepX = width / Math.max(latencyHistory.length - 1, 1);
    return latencyHistory
      .map((latency, i) => {
        const x = i * stepX;
        const y = height - (latency / maxLatency) * height * 0.9;
        return `${x},${y}`;
      })
      .join(" ");
  }, [latencyHistory]);

  const handleRun = useCallback(() => {
    setVerdict("running");
    // Trigger simulation via parent
    const result = simulate(graph, failures);
    onRun(result);
  }, [graph, failures, onRun]);

  const handleArrivalRateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(MIN_ARRIVAL_RATE, Math.min(MAX_ARRIVAL_RATE, parseInt(e.target.value) || MIN_ARRIVAL_RATE));
      setArrivalRate(value);
      // Update graph scenario
      // Note: Parent will handle graph update
    },
    []
  );

  // Format number for display
  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return n.toFixed(n < 10 ? 1 : 0);
  };

  const fmtMs = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Traffic Control */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground w-20">Traffic</span>
          <input
            type="range"
            min={MIN_ARRIVAL_RATE}
            max={MAX_ARRIVAL_RATE}
            value={arrivalRate}
            onChange={handleArrivalRateChange}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none accent-primary"
            aria-label="Arrival rate (req/s)"
          />
          <input
            type="number"
            min={MIN_ARRIVAL_RATE}
            max={MAX_ARRIVAL_RATE}
            value={arrivalRate}
            onChange={handleArrivalRateChange}
            className="w-24 text-right font-mono text-sm bg-muted border border-border rounded px-2 py-1"
            aria-label="Arrival rate (req/s)"
          />
          <span className="text-muted-foreground text-xs">req/s</span>
        </label>
      </div>

      {/* Run Button */}
      <button
        onClick={handleRun}
        disabled={isRunning}
        className={cn(
          "w-full py-3 rounded-lg font-medium text-sm transition-colors",
          isRunning
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {isRunning ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Running...
          </>
        ) : (
          "Run Simulation"
        )}
      </button>

      {/* Latency Sparkline */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Latency (p95)</span>
          <span className="font-mono text-primary">
            {lastResult ? fmtMs(lastResult.latency.p95) : "—"}
          </span>
        </div>
        <div className="h-16 bg-muted/50 rounded relative overflow-hidden">
          {latencyHistory.length > 1 && (
            <svg viewBox="0 0 200 40" className="w-full h-full">
              <polyline
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                points={sparklinePoints}
              />
            </svg>
          )}
        </div>
      </div>

      {/* Verdict */}
      <div
        className={cn(
          "p-3 rounded-lg text-center font-medium text-sm",
          verdict === "pass" && "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
          verdict === "fail" && "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
          verdict === "running" && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse",
          verdict === "idle" && "bg-muted text-muted-foreground"
        )}
      >
        {verdict === "pass" && "✓ All checks passing"}
        {verdict === "fail" && "✗ Some checks failing"}
        {verdict === "running" && "⟳ Running simulation..."}
        {verdict === "idle" && "Ready to run"}
      </div>

      {/* Quick Stats */}
      {lastResult && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <div className="text-center">
            <div className="font-mono text-lg text-primary">{fmt(lastResult.throughput)}</div>
            <div className="text-xs text-muted-foreground">Throughput</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-lg text-primary">{(lastResult.errorRate * 100).toFixed(2)}%</div>
            <div className="text-xs text-muted-foreground">Error Rate</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-lg text-primary">{fmtMs(lastResult.latency.p95)}</div>
            <div className="text-xs text-muted-foreground">p95 Latency</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-lg text-primary">{lastResult.bandwidthMbps.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Bandwidth (Mbps)</div>
          </div>
        </div>
      )}
    </div>
  );
}