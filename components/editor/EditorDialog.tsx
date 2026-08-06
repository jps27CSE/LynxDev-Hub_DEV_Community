"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { OutputPane } from "@/components/editor/OutputPane";
import { useCodeEditor } from "@/hooks/useCodeEditor";

type EditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCode: string;
};

export function EditorDialog({
  open,
  onOpenChange,
  initialCode,
}: EditorDialogProps) {
  const editor = useCodeEditor({
    initialCode,
    storageKey: null,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-2xl bg-card border-border gap-0 p-0 rounded-2xl overflow-hidden"
      >
        <DialogHeader className="px-4 py-3 border-b border-border/50 bg-muted/30">
          <DialogTitle className="text-sm font-medium text-foreground">
            JavaScript Editor
          </DialogTitle>
        </DialogHeader>

        <EditorToolbar
          running={editor.running}
          onRun={editor.run}
          onReset={editor.reset}
          onSave={editor.downloadCode}
          onImport={editor.importFile}
          importInputRef={editor.importInputRef}
        />

        <div className="bg-[#1e1e1e]">
          <MonacoEditor
            value={editor.code}
            onChange={editor.setCode}
            height="280px"
          />
        </div>

        <div className="p-4 bg-background">
          <OutputPane output={editor.output} error={editor.error} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
