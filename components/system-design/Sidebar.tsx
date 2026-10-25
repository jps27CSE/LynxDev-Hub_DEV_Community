"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SdModule, SdChapter } from "@/config/system-design/types";

interface SidebarProps {
  module: SdModule;
  onLessonSelect?: (lessonSlug: string) => void;
  onChapterSelect?: (chapterSlug: string) => void;
  onSimulationOpen?: () => void;
  onSimulationClose?: () => void;
}

export function Sidebar({
  module,
  onLessonSelect,
  onChapterSelect,
  onSimulationOpen,
  onSimulationClose,
}: SidebarProps) {
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);

  // Close sidebar when simulation state changes
  useEffect(() => {
    if (onSimulationOpen) setIsSimulationOpen(true);
    if (onSimulationClose) setIsSimulationOpen(false);
  }, [onSimulationOpen, onSimulationClose]);

  return (
    <aside
      className={cn(
        "hidden lg:block w-64 h-full border-r border-border bg-card flex flex-col",
        isSimulationOpen && "hidden",
      )}
    >
      <div className="p-6 pt-2">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
          {module.partTitle}
        </h2>
        <h3 className="font-semibold text-lg">{module.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {module.lessons.length} lessons
        </p>
      </div>

      <nav aria-label="Chapters navigation" className="flex-1 overflow-y-auto">
        {module.chapters?.map((chapter) =>
          renderChapter(chapter, onChapterSelect),
        ) || (
          <div className="p-4 text-muted-foreground">No chapters defined</div>
        )}
      </nav>
    </aside>
  );
}

function renderChapter(
  chapter: SdChapter,
  onChapterSelect: ((slug: string) => void) | undefined,
) {
  return (
    <div key={chapter.slug} className="border-b border-border pb-4">
      <button
        className="w-full text-left padding-2 text-sm font-medium transition-colors hover:text-primary"
        onClick={() => onChapterSelect?.(chapter.slug)}
      >
        <span className="font-mono text-xs text-muted-foreground">
          {chapter.slug}
        </span>
        <span className="ml-2">{chapter.title}</span>
      </button>

      {chapter.children && chapter.children.length > 0 && (
        <div className="ml-4 pt-2 text-xs text-muted-foreground">
          {chapter.children.map((subChapter) => (
            <Link
              key={subChapter.slug}
              href={`/system-design/${chapter.slug}/lesson/${subChapter.slug}`}
              className="block px-2 py-1 rounded-md text-sm hover:bg-primary/5 transition-colors"
            >
              {subChapter.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
