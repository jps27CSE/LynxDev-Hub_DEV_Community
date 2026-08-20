export const PRE_STYLE =
  "background:#1e1e1e;color:#e6e6e6;padding:12px 16px;border-radius:8px;overflow-x:auto;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.6;margin:12px 0;white-space:pre-wrap;word-break:break-word;";

export const BOX_STYLE =
  "border:1px solid rgba(128,128,128,0.35);border-radius:8px;padding:12px 16px;margin:12px 0;font-size:13px;";

export const externalLink = (text: string, url: string) =>
  `<a href="${url}" target="_blank" rel="noopener noreferrer">${text} &#8599;</a>`;

export function codeBlock(code: string): string {
  return `<pre style="${PRE_STYLE}"><code>${code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")}</code></pre>`;
}
