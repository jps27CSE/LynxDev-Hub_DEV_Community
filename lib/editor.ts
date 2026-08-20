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

export function saveCodeAsFile(code: string, filename: string) {
  const blob = new Blob([code], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
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

export function trySaveCodeToStorage(storageKey: string, code: string): boolean {
  try {
    localStorage.setItem(storageKey, code);
    return true;
  } catch {
    // Storage unavailable (private mode / quota) — code just won't persist
    return false;
  }
}
