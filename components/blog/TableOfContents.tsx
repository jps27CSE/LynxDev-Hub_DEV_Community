"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";

export type TocItem = {
  id: string;
  title: string;
  depth: 2 | 3;
};

/**
 * Tracks which heading the reader is currently in.
 *
 * Scroll-spy uses IntersectionObserver rather than a scroll listener: the
 * browser already computes intersection during its own paint, so we get the
 * active-section signal without forcing layout reads on every scroll event.
 *
 * The observer watches a band below the sticky header. A heading is "active"
 * when it crosses that line, which matches how a reader perceives "the section
 * I am in" — not "the section nearest the viewport top", which differs once a
 * heading is taller than the band.
 */
function useActiveHeading(items: TocItem[], headerOffset: number) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (items.length === 0) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }

        // Pick the topmost visible heading in document order — set membership
        // alone has no ordering, and "last callback to fire" flickers on fast
        // scrolls because entries arrive out of order.
        const firstVisible = items.find((item) => visible.has(item.id));
        if (firstVisible) {
          setActiveId(firstVisible.id);
          return;
        }

        // Nothing intersecting: the reader is between sections, so keep the
        // last heading scrolled past as active rather than snapping backwards.
        const scrolledPast = headings.filter(
          (el) => el.getBoundingClientRect().top < headerOffset,
        );
        const lastPassed = scrolledPast[scrolledPast.length - 1];
        if (lastPassed) setActiveId(lastPassed.id);
      },
      { rootMargin: `-${headerOffset}px 0px -65% 0px`, threshold: 0 },
    );

    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [items, headerOffset]);

  return activeId;
}

function TocLinks({
  items,
  activeId,
  onNavigate,
}: {
  items: TocItem[];
  activeId: string | null;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-0.5 border-l border-border/30">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={onNavigate}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "block border-l-2 py-1.5 text-sm leading-snug transition-colors",
                item.depth === 3 ? "pl-7 pr-2" : "pl-4 pr-2",
                isActive
                  ? "-ml-px border-cyan-400 text-foreground font-medium"
                  : "-ml-px border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.title}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Renders both the mobile disclosure and the desktop rail from one component.
 *
 * They are deliberately NOT two components each calling `useActiveHeading`:
 * that created two IntersectionObservers per page doing identical work, one of
 * them permanently inside `display:none`. A single hook call here means a single
 * observer regardless of which variant the reader actually sees.
 *
 * The two variants are split by ONE breakpoint (`lg`) rather than two different
 * ones. Using `lg:hidden` for the disclosure alongside `xl:block` for the rail
 * left a dead band between 1024px and 1279px where neither rendered — no
 * navigation at all, on a very common laptop width.
 */
export function TableOfContents({
  items,
  headerOffset = 96,
}: {
  items: TocItem[];
  headerOffset?: number;
}) {
  const activeId = useActiveHeading(items, headerOffset);

  if (items.length === 0) return null;

  return (
    <>
      {/* Below `lg`: collapsed, in flow, so it does not eat vertical space. */}
      <details className="lg:hidden mb-10 rounded-xl border border-border/40 bg-card/30">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-foreground/85 [&::-webkit-details-marker]:hidden">
          <List className="size-4 text-muted-foreground" />
          On this page
          <span className="ml-auto text-xs text-muted-foreground/60">
            {items.length} sections
          </span>
        </summary>
        <nav
          aria-label="Table of contents"
          className="border-t border-border/30 px-2 py-3"
        >
          <TocLinks
            items={items}
            activeId={activeId}
            onNavigate={() => {
              const details = document.activeElement?.closest("details");
              if (details instanceof HTMLDetailsElement) details.open = false;
            }}
          />
        </nav>
      </details>

      {/* `lg` and up: sticky rail beside the article. */}
      <nav aria-label="Table of contents" className="w-full">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">
          On this page
        </p>
        <TocLinks items={items} activeId={activeId} />
      </nav>
    </>
  );
}
