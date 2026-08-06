export type RunResult = {
  output: string;
  error: string | null;
};

export type EditorOptions = {
  initialCode: string;
  storageKey: string | null;
};

/**
 * Executes user JavaScript in the browser. Compile/runtime errors are caught
 * and returned as `error` — no test cases, no judge, just the result.
 */
export function runJavaScript(code: string): RunResult {
  const logs: string[] = [];
  const mockConsole = {
    log: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
  };

  try {
    const fn = new Function("console", code);
    fn(mockConsole);
    return { output: logs.join("\n") || "No output", error: null };
  } catch (err: unknown) {
    return {
      output: logs.join("\n"),
      error: err instanceof Error ? err.message : "Error executing code",
    };
  }
}

export function saveCodeAsFile(code: string, filename: string) {
  const blob = new Blob([code], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function readCodeFile(file: File): Promise<string> {
  return file.text();
}

export function loadSavedCode(storageKey: string): string | null {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

export function saveCodeToStorage(storageKey: string, code: string) {
  try {
    localStorage.setItem(storageKey, code);
  } catch {
    // Storage unavailable (private mode / quota) — code just won't persist
  }
}
