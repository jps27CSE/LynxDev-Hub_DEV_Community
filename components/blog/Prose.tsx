import type { ReactNode } from "react";

/**
 * Reading primitives for the engineering blog.
 *
 * Tailwind's `prose` utility is not installed (no `@tailwindcss/typography`),
 * so these small components encode the typography decisions explicitly instead
 * of via a plugin.
 *
 * Measure is controlled by the layout (`BlogLayout` caps the reading column at
 * 70ch), not here. These sizes are tuned for that column: body at 17-18px with
 * loose leading, because long-form technical prose at 16px/1.5 on a dark
 * background reads noticeably denser than the same text in print.
 */

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="text-[1.0625rem] leading-[1.75] text-foreground/85 my-5">
      {children}
    </p>
  );
}

export function H2({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="text-[1.5rem] sm:text-[1.85rem] font-semibold tracking-tight text-foreground mt-14 mb-4 scroll-mt-24"
    >
      {children}
    </h2>
  );
}

export function H3({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h3
      id={id}
      className="text-[1.2rem] sm:text-[1.35rem] font-semibold tracking-tight text-foreground mt-10 mb-3.5 scroll-mt-24"
    >
      {children}
    </h3>
  );
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc space-y-2.5 my-5 pl-6 marker:text-muted-foreground/60">
      {children}
    </ul>
  );
}

export function OL({ children }: { children: ReactNode }) {
  return (
    <ol className="list-decimal space-y-2.5 my-5 pl-6 marker:text-muted-foreground/60 marker:font-mono marker:text-sm">
      {children}
    </ol>
  );
}

export function LI({ children }: { children: ReactNode }) {
  return (
    <li className="text-[1.0625rem] leading-[1.7] text-foreground/85 pl-1">
      {children}
    </li>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="text-lg sm:text-xl leading-relaxed text-muted-foreground my-6">
      {children}
    </p>
  );
}

export function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-l-2 border-cyan-400/50 pl-5 my-7 text-foreground/75 italic">
      {children}
    </blockquote>
  );
}

export function HR() {
  return <hr className="border-border/30 my-14" />;
}

export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="font-mono text-[0.875em] bg-muted/70 text-cyan-200/90 px-1.5 py-0.5 rounded border border-border/40">
      {children}
    </code>
  );
}

/**
 * Definition row — label + value. The label column widens on larger screens so
 * the value gets the remaining space instead of wrapping under a narrow key.
 */
export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-5 py-3 border-b border-border/25 last:border-b-0">
      <div className="sm:w-44 shrink-0 text-sm font-mono text-muted-foreground">
        {label}
      </div>
      <div className="text-[0.95rem] leading-relaxed text-foreground/80">
        {children}
      </div>
    </div>
  );
}