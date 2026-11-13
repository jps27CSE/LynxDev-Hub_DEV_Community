export type RunResult = {
  output: string;
  error: string | null;
};

export const RUN_TIMEOUT_MS = 5000;

/**
 * Executes user JavaScript inside a Web Worker:
 * - infinite loops can't freeze the tab (worker is terminated on timeout)
 * - no access to window/document (lighter sandbox than main-thread `new Function`)
 * - console.log/warn/error/info output is captured and returned
 */
export function runJavaScript(
  code: string,
  timeoutMs = RUN_TIMEOUT_MS,
): Promise<RunResult> {
  return new Promise((resolve) => {
    let workerUrl: string;
    let worker: Worker;
    try {
      const source = `
        self.onmessage = (e) => {
          const MAX_LOG_LINES = 10000;
          const MAX_LOG_CHARS = 500000;
          const logs = [];
          let dropped = 0;
          let chars = 0;
          const capture = (...args) => {
            if (logs.length >= MAX_LOG_LINES || chars >= MAX_LOG_CHARS) {
              dropped++;
              return;
            }
            const line = args.map(String).join(" ");
            if (chars + line.length > MAX_LOG_CHARS) {
              const remaining = MAX_LOG_CHARS - chars;
              logs.push(line.slice(0, remaining));
              dropped++;
              chars = MAX_LOG_CHARS;
              return;
            }
            chars += line.length;
            logs.push(line);
          };
          const mockConsole = { log: capture, info: capture, warn: capture, error: capture };
          const makeOutput = (fallback) => {
            const body =
              logs.join("\\n") +
              (dropped ? "\\n… " + dropped.toLocaleString() + " more lines truncated" : "");
            return body || fallback;
          };
          try {
            // Shadow dangerous same-origin globals so pasted "trick" snippets
            // can't hit cookie-bearing APIs or exfiltrate data. Each name in the
            // list is both a param of the user's function and an argument to it,
            // so the two lists can never drift apart.
            const BLOCKED_GLOBALS = [
              "fetch",
              "XMLHttpRequest",
              "WebSocket",
              "importScripts",
              "navigator",
              "self",
              "globalThis",
              "postMessage",
            ];
            new Function("console", ...BLOCKED_GLOBALS, e.data.code)(
              mockConsole,
              ...BLOCKED_GLOBALS.map(() => undefined),
            );
            self.postMessage({ output: makeOutput("No output"), error: null });
          } catch (err) {
            self.postMessage({
              output: makeOutput(""),
              error: err instanceof Error ? err.message : "Error executing code",
            });
          }
        };
      `;
      const blob = new Blob([source], { type: "text/javascript" });
      workerUrl = URL.createObjectURL(blob);
      worker = new Worker(workerUrl);
    } catch {
      resolve({
        output: "",
        error: "Code execution is not available in this browser",
      });
      return;
    }

    const done = (result: RunResult) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve(result);
    };

    const timer = setTimeout(
      () => done({ output: "", error: "Execution timed out — infinite loop?" }),
      timeoutMs,
    );
    worker.onmessage = (e) => done(e.data as RunResult);
    worker.onerror = () => done({ output: "", error: "Failed to run code" });
    worker.postMessage({ code });
  });
}

/**
 * Builds a standalone HTML document for a sandboxed preview iframe.
 * - Injects the preview scrollbar CSS into the lesson's own <head> when the
 *   lesson ships a full document, otherwise wraps the fragment.
 * - Used with `sandbox="allow-scripts"` + `srcDoc` so lesson code runs in an
 *   opaque origin: no parent access, no cookies, no credentialed fetches.
 */
export function buildSandboxedSrcDoc(html: string, css = ""): string {
  const styleBlock = `<style>${css}</style>`;
  if (/<html[\s>]/i.test(html)) {
    if (/<head[\s>]/i.test(html)) {
      return html.replace(/<head([^>]*)>/i, `<head$1>${styleBlock}`);
    }
    return html.replace(/<html([^>]*)>/i, `<html$1>${styleBlock}`);
  }
  return `<!DOCTYPE html><html><head>${styleBlock}</head><body>${html}</body></html>`;
}

export function saveCodeAsFile(code: string, filename: string) {
  const blob = new Blob([code], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export type SqlRunResult = {
  columns: string[];
  rows: (string | number | null | Uint8Array)[][];
  rowCount: number;
  affectedRows: number;
  error: string | null;
  statementType: "select" | "dml" | "ddl" | "empty";
};

const SQL_MAX_ROWS = 1000;

/**
 * Runs SQL in the browser via WebAssembly SQLite (sql.js).
 * - `seedSql` is executed first to build the chapter's schema + sample data.
 * - `code` is the learner's query; result sets are returned as columns + rows.
 * - DML/DDL statements report affected row counts instead of a result set.
 * - All execution is client-side: no server, no TiDB RU, no rate-limit surface.
 * - sql.js is dynamically imported so the ~673KB WASM stays out of the main bundle.
 */
export async function runSql(
  code: string,
  seedSql?: string,
): Promise<SqlRunResult> {
  const empty: SqlRunResult = {
    columns: [],
    rows: [],
    rowCount: 0,
    affectedRows: 0,
    error: null,
    statementType: "empty",
  };

  const trimmed = code.trim();
  if (!trimmed) {
    return { ...empty, error: "No query to run — write some SQL first." };
  }

  let SQL: any;
  try {
    const mod: any = await import("sql.js");
    const initSqlJs = mod.default ?? mod;
    SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
  } catch (err) {
    return {
      ...empty,
      error:
        err instanceof Error
          ? `Failed to load SQL engine: ${err.message}`
          : "Failed to load SQL engine",
    };
  }

  let db: any;
  try {
    db = new SQL.Database();
  } catch (err) {
    return {
      ...empty,
      error: err instanceof Error ? err.message : "Failed to create database",
    };
  }

  // Seed the chapter's schema + sample data.
  if (seedSql && seedSql.trim()) {
    try {
      db.run(seedSql);
    } catch (err) {
      try { db.close(); } catch { /* ignore */ }
      return {
        ...empty,
        error: `Seed failed: ${
          err instanceof Error ? err.message : "invalid seed SQL"
        }`,
      };
    }
  }

  // Try a result-set-producing execution first.
  try {
    const results = db.exec(trimmed) as Array<{
      columns: string[];
      values: (string | number | null | Uint8Array)[][];
    }>;
    if (Array.isArray(results) && results.length > 0) {
      // Use the last non-empty result set (handles "INSERT; SELECT ..." flows).
      let chosen = results[results.length - 1];
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i] && Array.isArray(results[i].values) && results[i].values.length > 0) {
          chosen = results[i];
          break;
        }
      }
      const columns = Array.isArray(chosen?.columns) ? chosen.columns : [];
      const allRows = Array.isArray(chosen?.values) ? chosen.values : [];
      const truncated = allRows.length > SQL_MAX_ROWS;
      const rows = truncated ? allRows.slice(0, SQL_MAX_ROWS) : allRows;
      try { db.close(); } catch { /* ignore */ }
      return {
        columns,
        rows,
        rowCount: allRows.length,
        affectedRows: 0,
        error: truncated
          ? `Result truncated to ${SQL_MAX_ROWS} rows (${allRows.length} total).`
          : null,
        statementType: "select",
      };
    }
  } catch (err) {
    // Fall through to DML/DDL handling below; if that also fails, surface this error.
    const execError = err instanceof Error ? err.message : "SQL error";
    // Attempt DML/DDL via run().
    try {
      db.run(trimmed);
      const affected = typeof db.getRowsModified === "function" ? db.getRowsModified() : 0;
      try { db.close(); } catch { /* ignore */ }
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        affectedRows: affected,
        error: null,
        statementType: affected > 0 ? "dml" : "ddl",
      };
    } catch {
      try { db.close(); } catch { /* ignore */ }
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        affectedRows: 0,
        error: execError,
        statementType: "empty",
      };
    }
  }

  // exec() returned [] (DML/DDL/empty) without throwing.
  try {
    db.run(trimmed);
    const affected = typeof db.getRowsModified === "function" ? db.getRowsModified() : 0;
    try { db.close(); } catch { /* ignore */ }
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      affectedRows: affected,
      error: null,
      statementType: affected > 0 ? "dml" : "ddl",
    };
  } catch (err) {
    try { db.close(); } catch { /* ignore */ }
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      affectedRows: 0,
      error: err instanceof Error ? err.message : "SQL error",
      statementType: "empty",
    };
  }
}

export function readCodeFile(file: File): Promise<string> {
  return file.text();
}

export function loadSavedCode(storageKey: string): string | null {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    // SSR (no localStorage) and private-mode/quota failures fall back to initial code
    return null;
  }
}

export function trySaveCodeToStorage(
  storageKey: string,
  code: string,
): boolean {
  try {
    localStorage.setItem(storageKey, code);
    return true;
  } catch {
    // Storage unavailable (private mode / quota) — code just won't persist
    return false;
  }
}
