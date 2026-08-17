import type { WorkspaceSummary } from "@/lib/problem-data";

const DIFFICULTIES = ["all", "basic", "easy", "medium", "hard"] as const;
const SOURCES = ["all", "in-house", "top"] as const;

const DOT: Record<string, string> = {
  basic: "bg-cyan-400",
  easy: "bg-emerald-400",
  medium: "bg-amber-400",
  hard: "bg-rose-500",
};

const LABEL: Record<string, string> = {
  basic: "text-cyan-400",
  easy: "text-emerald-400",
  medium: "text-amber-400",
  hard: "text-rose-500",
};

export type ProblemBrowserProps = {
  summaries: WorkspaceSummary[];
  filtered: WorkspaceSummary[];
  activeKey: string;
  solvedKeys: Set<string>;
  query: string;
  onQueryChange: (value: string) => void;
  difficulty: string;
  onDifficultyChange: (value: string) => void;
  source: string;
  onSourceChange: (value: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  onNavigate: (key: string) => void;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-4 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
      {children}
    </div>
  );
}

function ProblemRow({
  item,
  active,
  solved,
  onNavigate,
}: {
  item: WorkspaceSummary;
  active: boolean;
  solved: boolean;
  onNavigate: (key: string) => void;
}) {
  return (
    <button
      onClick={() => onNavigate(item.key)}
      className={`w-full flex items-center gap-2.5 px-4 py-[7px] text-left transition-colors ${
        active
          ? "bg-cyan-500/[0.08] border-r-2 border-r-cyan-400"
          : "border-r-2 border-r-transparent hover:bg-muted/40"
      }`}
    >
      {solved ? (
        <span className="w-1.5 shrink-0 font-mono text-[11px] text-emerald-400">
          ✓
        </span>
      ) : (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT[item.difficulty]}`}
        />
      )}
      <span
        className={`min-w-0 flex-1 text-[13px] truncate ${
          active ? "text-white" : "text-muted-foreground"
        }`}
      >
        {item.title}
      </span>
      <span
        className={`font-mono text-[10px] uppercase ${LABEL[item.difficulty]}`}
      >
        {item.difficulty}
      </span>
    </button>
  );
}

export function ProblemBrowser({
  summaries,
  filtered,
  activeKey,
  solvedKeys,
  query,
  onQueryChange,
  difficulty,
  onDifficultyChange,
  source,
  onSourceChange,
  searchRef,
  onNavigate,
}: ProblemBrowserProps) {
  const inHouse = filtered.filter((s) => s.source === "in-house");
  const top = filtered.filter((s) => s.source === "top");

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 border-b border-border/40 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Problem Browser
          </h2>
          <span className="font-mono text-[11px] text-muted-foreground/60">
            {summaries.length} · {solvedKeys.size}✓
          </span>
        </div>

        <div className="relative">
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search problems…"
            className="w-full rounded-lg border border-border/50 bg-background/60 pr-8 pl-3 py-1.5 text-[13px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 rounded border border-border/50 bg-muted/40 font-mono text-[10px] text-muted-foreground/70">
            /
          </kbd>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-muted/30 p-0.5">
          {SOURCES.map((s) => (
            <button
              key={s}
              onClick={() => onSourceChange(s)}
              className={`flex-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                source === s
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : s === "in-house" ? "In-House" : "LeetCode"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => onDifficultyChange(d)}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium transition-colors ${
                difficulty === d
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border/50 hover:border-border"
              }`}
            >
              {d !== "all" && (
                <span className={`w-1.5 h-1.5 rounded-full ${DOT[d]}`} />
              )}
              {d === "all" ? "All" : d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 px-4 text-center">
            <span className="text-2xl opacity-60">⌕</span>
            <p className="text-[13px] text-muted-foreground">
              No problems match your filters.
            </p>
          </div>
        ) : source === "all" ? (
          <>
            {inHouse.length > 0 && (
              <>
                <SectionLabel>In-House · {inHouse.length}</SectionLabel>
                {inHouse.map((s) => (
                  <ProblemRow
                    key={s.key}
                    item={s}
                    active={s.key === activeKey}
                    solved={solvedKeys.has(s.key)}
                    onNavigate={onNavigate}
                  />
                ))}
              </>
            )}
            {top.length > 0 && (
              <>
                <SectionLabel>Top LeetCode · {top.length}</SectionLabel>
                {top.map((s) => (
                  <ProblemRow
                    key={s.key}
                    item={s}
                    active={s.key === activeKey}
                    solved={solvedKeys.has(s.key)}
                    onNavigate={onNavigate}
                  />
                ))}
              </>
            )}
          </>
        ) : (
          filtered.map((s) => (
            <ProblemRow
              key={s.key}
              item={s}
              active={s.key === activeKey}
              solved={solvedKeys.has(s.key)}
              onNavigate={onNavigate}
            />
          ))
        )}
      </div>
    </div>
  );
}
