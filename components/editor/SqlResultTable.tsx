"use client";

import { Loader2 } from "lucide-react";
import type { SqlRunResult } from "@/lib/editor";

type Props = {
  result: SqlRunResult | null;
  running?: boolean;
};

function formatCell(value: string | number | null | Uint8Array): string {
  if (value === null) return "NULL";
  if (value instanceof Uint8Array) return `<blob ${value.length} bytes>`;
  return String(value);
}

export default function SqlResultTable({ result, running }: Props) {
  if (running) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        Running query…
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Run a query to see results here.
      </div>
    );
  }

  // Hard error (no result set at all).
  if (result.error && result.columns.length === 0 && result.rows.length === 0 && result.affectedRows === 0) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <span className="font-semibold">SQL error: </span>
        {result.error}
      </div>
    );
  }

  // DML / DDL — no result set, but rows were affected (or statement ran).
  if (result.columns.length === 0) {
    return (
      <div className="space-y-2 py-2">
        <div className="text-sm text-emerald-500 font-medium">
          ✓ Statement executed
          {result.affectedRows > 0 ? ` — ${result.affectedRows} row${result.affectedRows === 1 ? "" : "s"} affected` : ""}
        </div>
        {result.error && (
          <div className="text-xs text-amber-500">{result.error}</div>
        )}
      </div>
    );
  }

  // SELECT result set.
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-muted/60">
            <tr>
              {result.columns.map((col, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-left font-semibold text-foreground border-b border-border whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={result.columns.length}
                  className="px-3 py-4 text-center text-muted-foreground italic"
                >
                  (0 rows)
                </td>
              </tr>
            ) : (
              result.rows.map((row, r) => (
                <tr
                  key={r}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className={`px-3 py-2 whitespace-nowrap ${
                        cell === null
                          ? "text-muted-foreground/60 italic"
                          : "text-foreground"
                      }`}
                    >
                      {formatCell(cell)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {result.rowCount} row{result.rowCount === 1 ? "" : "s"}
          {result.rows.length < result.rowCount
            ? ` (showing first ${result.rows.length})`
            : ""}
        </span>
        {result.error && (
          <span className="text-amber-500">{result.error}</span>
        )}
      </div>
    </div>
  );
}