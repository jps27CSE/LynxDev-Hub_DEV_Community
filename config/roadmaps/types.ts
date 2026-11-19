/**
 * Dependency-free types for the Roadmaps module.
 *
 * Kept free of React, `config/db`, and any runtime imports so it can be read by
 * both Server Components and Client Components without dragging mysql2 into the
 * browser bundle (see I.9 / Known Debt). The single import below is type-only
 * and erased at compile time.
 */

import type { CourseKey } from "../courses/types";

export type RoadmapResourceType =
  | "course"
  | "docs"
  | "article"
  | "video"
  | "practice";

export type RoadmapResource = {
  type: RoadmapResourceType;
  title: string;
  url: string;
  note?: string;
};

export type RoadmapNodeLevel = "beginner" | "intermediate" | "advanced";

/**
 * A course the platform hosts, keyed by `CourseData.key`. Resolved to an id at
 * render time so config never stores database ids.
 */
export type RoadmapPlatformCourseLink = {
  kind: "course";
  courseKey: CourseKey;
  note?: string;
};

/** A lesson or task that already lives at a stable internal route. */
export type RoadmapPlatformRouteLink = {
  kind: "lesson" | "task";
  title: string;
  /** Internal path, e.g. `/system-design/caching/lesson/cache-aside`. */
  href: string;
  note?: string;
};

export type RoadmapPlatformLink =
  | RoadmapPlatformCourseLink
  | RoadmapPlatformRouteLink;

/** Resolved course data passed to the client for one `courseKey`. */
export type PlatformCourseRef = {
  id: number;
  title: string;
  chapterCount: number;
};

export type RoadmapNode = {
  id: string;
  title: string;
  description: string;
  level?: RoadmapNodeLevel;
  /** Optional branch — not required to "complete" the roadmap. */
  optional?: boolean;
  resources: RoadmapResource[];
  /** LynxDEV's own lessons and courses for this topic. */
  platform?: RoadmapPlatformLink[];
  /** Branching children. Empty/undefined = leaf. */
  children?: RoadmapNode[];
};

export type RoadmapCategory =
  | "frontend"
  | "backend"
  | "fullstack"
  | "ai"
  | "system-design"
  | "devops"
  | "data";

export type RoadmapLevel = "beginner" | "intermediate" | "advanced";

export type Roadmap = {
  slug: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  level: RoadmapLevel;
  /** ISO date — drives the "updated" badge. */
  updatedAt: string;
  estimatedHours?: number;
  root: RoadmapNode;
  tags: string[];
};
