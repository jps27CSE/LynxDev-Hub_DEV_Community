"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { encodeGraph } from "@/lib/system-design/graph-codec";
import type { SdGraph } from "@/config/system-design/types";

interface ShareButtonProps {
  graph: SdGraph;
  className?: string;
}

export function ShareButton({ graph, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  const generateUrl = useCallback(() => {
    const encoded = encodeGraph(graph);
    const shareUrl = `${window.location.origin}${window.location.pathname}?d=${encoded}`;
    setUrl(shareUrl);
    return shareUrl;
  }, [graph]);

  const handleCopy = async () => {
    const shareUrl = generateUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = generateUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareUrl = generateUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "System Design Task",
          text: "Check out my system design!",
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-muted hover:bg-muted/80 border border-border transition-colors"
        title="Copy link to clipboard"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span>Copy Link</span>
      </button>

      <button
        onClick={handleShare}
        className="p-2 rounded-lg bg-muted hover:bg-muted/80 border border-border transition-colors"
        title="Share via system dialog"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>

      {copied && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-card border border-border rounded-lg shadow-lg p-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="text-sm font-medium">Copied to clipboard!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}