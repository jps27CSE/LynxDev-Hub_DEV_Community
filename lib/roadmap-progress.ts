/**
 * Client-side progress helpers for roadmaps.
 *
 * Progress is stored in localStorage (zero DB cost for v1). All functions are
 * SSR-safe: they no-op / return empty on the server.
 *
 * Storage shape: `{ statuses: { [nodeId]: "learning" | "done" | "skipped" } }`.
 * The previous release stored a plain `string[]` of completed ids; `loadProgress`
 * migrates that on read so existing learners keep their progress.
 */

export type RoadmapNodeStatus = "learning" | "done" | "skipped";

export type RoadmapProgress = Record<string, RoadmapNodeStatus>;

const STORAGE_PREFIX = "lynxdev:roadmap:";

const STATUSES: readonly RoadmapNodeStatus[] = ["learning", "done", "skipped"];

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function keyFor(slug: string): string {
  return `${STORAGE_PREFIX}${slug}`;
}

function isStatus(value: unknown): value is RoadmapNodeStatus {
  return (
    typeof value === "string" && (STATUSES as readonly string[]).includes(value)
  );
}

export function loadProgress(slug: string): RoadmapProgress {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(keyFor(slug));
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;

    // v1: array of completed node ids → treat every entry as "done".
    if (Array.isArray(parsed)) {
      const migrated: RoadmapProgress = {};
      for (const id of parsed) {
        if (typeof id === "string") migrated[id] = "done";
      }
      return migrated;
    }

    // v2: { statuses: { id: status } }
    if (parsed && typeof parsed === "object" && "statuses" in parsed) {
      const { statuses } = parsed as { statuses?: unknown };
      if (!statuses || typeof statuses !== "object") return {};
      const result: RoadmapProgress = {};
      for (const [id, status] of Object.entries(statuses)) {
        if (isStatus(status)) result[id] = status;
      }
      return result;
    }

    return {};
  } catch {
    return {};
  }
}

export function saveProgress(slug: string, progress: RoadmapProgress): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(
      keyFor(slug),
      JSON.stringify({ statuses: progress }),
    );
  } catch {
    // Quota / privacy mode — fail silently; in-memory state still works.
  }
}

export function clearProgress(slug: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(keyFor(slug));
  } catch {
    // ignore
  }
}
