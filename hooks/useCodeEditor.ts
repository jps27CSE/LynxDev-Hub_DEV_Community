import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadSavedCode,
  readCodeFile,
  runJavaScript,
  saveCodeAsFile,
  saveCodeToStorage,
} from "@/lib/editor";

type UseCodeEditorOptions = {
  initialCode: string;
  storageKey: string | null;
};

/**
 * Shared editor state used by both the problem page and the /editor page.
 * One implementation: run, reset, save-as-file, import-file, localStorage
 * autosave (debounced, client-side only).
 */
export function useCodeEditor({
  initialCode,
  storageKey,
}: UseCodeEditorOptions) {
  const [code, setCode] = useState<string>(() => {
    if (!storageKey) return initialCode;
    return loadSavedCode(storageKey) ?? initialCode;
  });
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!storageKey) return;
    const timer = setTimeout(() => saveCodeToStorage(storageKey, code), 500);
    return () => clearTimeout(timer);
  }, [code, storageKey]);

  const run = useCallback(() => {
    setRunning(true);
    setOutput(null);
    setError(null);

    const result = runJavaScript(code);
    setOutput(result.output);
    setError(result.error);
    setRunning(false);
  }, [code]);

  const reset = useCallback(() => {
    setCode(initialCode);
    setOutput(null);
    setError(null);
  }, [initialCode]);

  const saveFile = useCallback(() => {
    saveCodeAsFile(code, "solution.js");
  }, [code]);

  const importFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    const text = await readCodeFile(file);
    setCode(text);
    setOutput(null);
    setError(null);
  }, []);

  return {
    code,
    setCode,
    output,
    error,
    running,
    run,
    reset,
    saveFile,
    importFile,
    importInputRef,
  };
}
