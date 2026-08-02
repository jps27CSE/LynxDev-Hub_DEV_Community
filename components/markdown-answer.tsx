import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export function AnswerMarkdown({ content }: { content: string }) {
  return (
    <div className="text-base text-foreground/90 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b border-border/40">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-[1.75] text-[15px]">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 space-y-1.5 pl-5 list-disc">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 space-y-1.5 pl-5 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-[15px] leading-relaxed pl-1">{children}</li>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-muted text-[13px] font-mono text-foreground">
                  {children}
                </code>
              );
            }
            return (
              <div className="relative group my-5">
                <div className="absolute top-0 right-0 px-3 py-1 text-[11px] text-muted-foreground bg-muted/80 rounded-bl-lg rounded-tr-lg border-l border-b border-border/30 font-mono">
                  {className?.replace("language-", "") || "code"}
                </div>
                <pre className="overflow-x-auto">
                  <code
                    className={`block text-[13.5px] leading-relaxed ${className}`}
                  >
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">{children}</strong>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-border/50">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 bg-muted/50 text-left font-semibold text-foreground border-b border-border/50">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 border-b border-border/30 text-muted-foreground">
              {children}
            </td>
          ),
          hr: () => <hr className="my-8 border-border/30" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
