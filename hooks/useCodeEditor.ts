import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  loadSavedCode,
  readCodeFile,
  runJavaScript,
  saveCodeAsFile,
  trySaveCodeToStorage,
} from "@/lib/editor";

type UseCodeEditorOptions = {
  initialCode: string;
  storageKey: string | null;
};

/**
 * Shared editor state used by the problem page, the /editor page, and the
 * popup dialog. One implementation: run, reset, download-as-file, import-file,
 * localStorage autosave (debounced, client-side only).
 */
export function useCodeEditor({
  initialCode,
  storageKey,
}: UseCodeEditorOptions) {
  const [code, setCode] = useState<string>(() => {
    if (!storageKey) return initialCode;
    // loadSavedCode is SSR-safe: it returns null without localStorage, so the
    // server and client first render both use `initialCode` (no hydration mismatch)
    return loadSavedCode(storageKey) ?? initialCode;
  });
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  // Ref, not state: the warning never needs to re-render the tree
  const storageWarningShown = useRef(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!storageKey) return;
    const timer = setTimeout(() => {
      const saved = trySaveCodeToStorage(storageKey, code);
      if (!saved && !storageWarningShown.current) {
        storageWarningShown.current = true;
        toast("Code won't be saved on this device", {
          description: "Private browsing or storage limits prevent autosave.",
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [code, storageKey]);

  const run = useCallback(() => {
    setRunning(true);
    setOutput(null);
    setError(null);
    // Runs in a worker with a timeout — always settles, never freezes the tab
    void runJavaScript(code).then((result) => {
      if (result.error) {
        console.warn("[editor] run failed:", result.error);
      }
      setOutput(result.output);
      setError(result.error);
      setRunning(false);
    });
  }, [code]);

  const reset = useCallback(() => {
    if (
      code !== initialCode &&
      !window.confirm("Reset to starter code? Your changes will be lost.")
    ) {
      return;
    }
    setCode(initialCode);
    setOutput(null);
    setError(null);
  }, [code, initialCode]);

  const downloadCode = useCallback(() => {
    saveCodeAsFile(code, "solution.js");
  }, [code]);

  const importFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await readCodeFile(file);
      setCode(text);
      setOutput(null);
      setError(null);
    } catch {
      setError("Failed to read file");
    }
  }, []);

  return {
    code,
    setCode,
    output,
    error,
    running,
    run,
    reset,
    downloadCode,
    importFile,
    importInputRef,
  };
}
