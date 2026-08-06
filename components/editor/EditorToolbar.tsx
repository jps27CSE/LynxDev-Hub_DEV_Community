"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Play, RotateCcw, Upload } from "lucide-react";

type EditorToolbarProps = {
  running: boolean;
  onRun: () => void;
  onReset: () => void;
  onSave: () => void;
  onImport: (file: File | undefined) => void;
  importInputRef: React.RefObject<HTMLInputElement | null>;
};

export function EditorToolbar({
  running,
  onRun,
  onReset,
  onSave,
  onImport,
  importInputRef,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
      <span className="text-xs font-medium text-muted-foreground">
        JavaScript
      </span>
      <div className="flex items-center gap-2">
        <input
          ref={importInputRef}
          type="file"
          accept=".js,.txt,text/javascript"
          className="hidden"
          onChange={(e) => {
            onImport(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 text-xs gap-1"
          title="Restore starter code"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className="h-7 text-xs gap-1"
          title="Download code as solution.js"
        >
          <Download className="w-3 h-3" />
          Save
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => importInputRef.current?.click()}
          className="h-7 text-xs gap-1"
          title="Import code from a .js file"
        >
          <Upload className="w-3 h-3" />
          Import
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRun}
          disabled={running}
          className="h-7 text-xs gap-1"
        >
          <Play className="w-3 h-3" />
          {running ? "Running..." : "Run"}
        </Button>
      </div>
    </div>
  );
}
