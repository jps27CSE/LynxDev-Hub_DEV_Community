export type ChapterContent = {
  instructions: string;
  initialCode: string;
  solution: string;
  type?: "console" | "browser" | "sql";
  /** SQL run into a fresh in-memory DB before the learner's query (interactive SQL chapters only). */
  seedSql?: string;
};

/**
 * Stable identifier for a course, used by config that must not depend on a
 * database row or on the display title. Roadmaps link to courses by this key;
 * titles drift, keys do not.
 */
export type CourseKey =
  | "html"
  | "css"
  | "javascript"
  | "typescript"
  | "react"
  | "node"
  | "sql"
  | "git"
  | "linux";

export type CourseData = {
  /** Config-only identity — never inserted into the `courses` table. */
  key: CourseKey;
  title: string;
  description: string;
  icon: string;
  difficulty: string;
  category: string;
  order_index: number;
  chapters: {
    title: string;
    content: ChapterContent;
    points_reward: number;
  }[];
};
