"use client";

import { isValidElement, useState } from "react";
import { Check, Copy } from "lucide-react";

function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return extractText(props.children);
  }
  return "";
}

export function CodeBlock({
  children,
  className,
  language,
}: {
  children: React.ReactNode;
  className?: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);
  const raw = extractText(children).replace(/\n$/, "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="code-window group relative my-5 overflow-hidden rounded-xl border border-border/50 bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.03]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          {language && (
            <span className="ml-2.5 text-[11px] font-mono text-white/40 uppercase tracking-wider">
              {language}
            </span>
          )}
        </div>
        <button
          onClick={() => void copy()}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre
        className={
          language ? "overflow-x-auto" : "whitespace-pre-wrap break-words"
        }
      >
        <code
          className={`block text-[13.5px] leading-relaxed font-mono ${className ?? ""}`}
        >
          {children}
        </code>
      </pre>
    </div>
  );
}
