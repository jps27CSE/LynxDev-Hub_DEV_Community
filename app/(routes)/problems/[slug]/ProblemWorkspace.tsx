"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { WorkspaceProblem, WorkspaceSummary } from "@/lib/problem-data";
import { ProblemBrowser } from "./_components/ProblemBrowser";
import { ProblemPane } from "./_components/ProblemPane";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SOLVED_PREFIX = "ws-solved:";

function keyToUrl(key: string): string {
  return key.startsWith("db:")
    ? `/problems/${key.slice(3)}`
    : `/problems/${key}`;
}

function loadSolvedKeys(keys: string[]): Set<string> {
  const solved = new Set<string>();
  for (const key of keys) {
    try {
      if (localStorage.getItem(SOLVED_PREFIX + key) === "1") solved.add(key);
    } catch {
      // storage unavailable — solved markers just won't persist
    }
  }
  return solved;
}

type ProblemWorkspaceProps = {
  problem: WorkspaceProblem;
  summaries: WorkspaceSummary[];
};

export default function ProblemWorkspace({
  problem,
  summaries,
}: ProblemWorkspaceProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [source, setSource] = useState("all");
  const [solvedKeys, setSolvedKeys] = useState<Set<string>>(() => new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  const runRef = useRef<(() => void) | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return summaries.filter((s) => {
      if (source !== "all" && s.source !== source) return false;
      if (difficulty !== "all" && s.difficulty !== difficulty) return false;
      if (q && !s.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [summaries, query, difficulty, source]);

  useEffect(() => {
    setSolvedKeys(loadSolvedKeys(summaries.map((s) => s.key)));
  }, [summaries]);

  const toggleSolved = useCallback(() => {
    const next = new Set(solvedKeys);
    if (next.has(problem.key)) {
      next.delete(problem.key);
      try {
        localStorage.removeItem(SOLVED_PREFIX + problem.key);
      } catch {
        // storage unavailable
      }
    } else {
      next.add(problem.key);
      try {
        localStorage.setItem(SOLVED_PREFIX + problem.key, "1");
      } catch {
        // storage unavailable
      }
    }
    setSolvedKeys(next);
  }, [solvedKeys, problem.key]);

  const navigate = useCallback(
    (key: string) => {
      if (key !== problem.key) router.push(keyToUrl(key), { scroll: false });
    },
    [router, problem.key],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target !== null &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest(".monaco-editor") !== null);
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runRef.current?.();
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const index = summaries.findIndex((s) => s.key === problem.key);
  const prevKey = index > 0 ? summaries[index - 1].key : null;
  const nextKey =
    index >= 0 && index < summaries.length - 1
      ? summaries[index + 1].key
      : null;

  const isSolved = solvedKeys.has(problem.key);

  return (
    <div className="flex flex-col lg:h-screen lg:overflow-hidden">
      <div className="lg:hidden p-3 space-y-2 border-b border-border/40 bg-[#07090e]">
        <div className="flex items-center gap-2">
          <Select value={problem.key} onValueChange={navigate}>
            <SelectTrigger className="flex-1 min-w-0 h-9 text-[13px]" aria-label="Select problem">
              <SelectValue placeholder="Select problem" />
            </SelectTrigger>
            <SelectContent>
              {filtered.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  {s.title} ({s.difficulty})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isSolved && (
            <span className="shrink-0 font-mono text-emerald-400 text-sm">
              ✓
            </span>
          )}
        </div>
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search problems…"
          className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-[13px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex-1 flex lg:overflow-hidden">
        <aside className="hidden lg:flex w-[300px] shrink-0 flex-col border-r border-border/50 bg-[#07090e]">
          <ProblemBrowser
            summaries={summaries}
            filtered={filtered}
            activeKey={problem.key}
            solvedKeys={solvedKeys}
            query={query}
            onQueryChange={setQuery}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            source={source}
            onSourceChange={setSource}
            searchRef={searchRef}
            onNavigate={navigate}
          />
        </aside>

        <main className="flex-1 min-w-0 lg:overflow-hidden">
          <ProblemPane
            key={problem.key}
            problem={problem}
            isSolved={isSolved}
            onToggleSolved={toggleSolved}
            runRef={runRef}
            prevKey={prevKey}
            nextKey={nextKey}
            onNavigate={navigate}
          />
        </main>
      </div>
    </div>
  );
}
