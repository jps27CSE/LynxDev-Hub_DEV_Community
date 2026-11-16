/**
 * Dependency-free types for the Roadmaps module.
 *
 * Kept free of React, `config/db`, and any imports so it can be read by both
 * Server Components and Client Components without dragging mysql2 into the
 * browser bundle (see I.9 / Known Debt).
 */

export type RoadmapResourceType = "course" | "docs" | "article" | "video" | "practice";

export type RoadmapResource = {
  type: RoadmapResourceType;
  title: string;
  url: string;
  /** Links to `/courses/{id}` when a platform course exists for this topic. */
  platformCourseId?: number;
  note?: string;
};

export type RoadmapNodeLevel = "beginner" | "intermediate" | "advanced";

export type RoadmapNode = {
  id: string;
  title: string;
  description: string;
  level?: RoadmapNodeLevel;
  /** Optional branch — not required to "complete" the roadmap. */
  optional?: boolean;
  resources: RoadmapResource[];
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
