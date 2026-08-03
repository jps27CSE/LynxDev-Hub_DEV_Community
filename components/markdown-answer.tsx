import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { CodeBlock } from "@/components/code-block";

export function AnswerMarkdown({ content }: { content: string }) {
  return (
    <div className="text-[15px] text-foreground/90 leading-[1.75]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b border-border/40 scroll-mt-24">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-foreground mt-8 mb-3 scroll-mt-24">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-foreground mt-6 mb-2 scroll-mt-24">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-[1.75] text-[15px]">{children}</p>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 space-y-1.5 pl-5 list-disc marker:text-muted-foreground/50">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 space-y-1.5 pl-5 list-decimal marker:text-muted-foreground/50">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1 [&>ul]:mt-1.5 [&>ol]:mt-1.5 [&>p]:mb-0">
              {children}
            </li>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-muted text-[13px] font-mono text-foreground border border-border/40">
                  {children}
                </code>
              );
            }
            const lang =
              className
                ?.split(/\s+/)
                .find((c) => c.startsWith("language-"))
                ?.replace("language-", "") || "";
            return (
              <CodeBlock className={className} language={lang}>
                {children}
              </CodeBlock>
            );
          },
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-4 px-4 py-3 rounded-r-lg border-l-2 border-primary/60 bg-muted/40 text-muted-foreground italic [&>p]:mb-0">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-border/50">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 bg-muted/50 text-left font-semibold text-foreground border-b border-border/50 whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 border-b border-border/30 text-muted-foreground align-top [&>code]:whitespace-nowrap odd:bg-transparent even:bg-transparent">
              {children}
            </td>
          ),
          tr: ({ children }) => <tr className="odd:bg-muted/30">{children}</tr>,
          hr: () => <hr className="my-8 border-border/30" />,
          kbd: ({ children }) => (
            <kbd className="inline-flex h-5 items-center rounded-sm border border-border/60 bg-muted px-1.5 font-mono text-xs font-medium text-foreground/80 shadow-[0_1px_0_rgb(0_0_0/0.08)]">
              {children}
            </kbd>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
