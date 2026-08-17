"use client";

import { useEffect, useRef } from "react";

const PREVIEW_SCROLLBAR_CSS = [
  "html{scrollbar-width:thin;scrollbar-color:rgba(100,116,139,0.35) transparent}",
  "::-webkit-scrollbar{width:8px;height:8px}",
  "::-webkit-scrollbar-track{background:transparent}",
  "::-webkit-scrollbar-thumb{background:rgba(100,116,139,0.35);border-radius:9999px}",
  "::-webkit-scrollbar-thumb:hover{background:rgba(100,116,139,0.55)}",
].join("");

type BrowserPreviewProps = {
  html: string;
  nonce?: number;
  title?: string;
};

export function BrowserPreview({
  html,
  nonce = 0,
  title = "Browser Preview",
}: BrowserPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      doc.open();
      doc.write(html);
      doc.close();
      const style = doc.createElement("style");
      style.textContent = PREVIEW_SCROLLBAR_CSS;
      doc.head?.appendChild(style);
    } catch {
      // Cross-origin frame access can be blocked — preview simply won't update
    }
  }, [html, nonce]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e]">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] border-b border-white/5 flex-none">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-lime-400/80" />
        <span className="text-[11px] font-mono text-slate-400 ml-2">
          {title}
        </span>
      </div>
      <iframe
        ref={iframeRef}
        className="w-full flex-1 min-h-0 bg-white"
        title={title}
      />
    </div>
  );
}
