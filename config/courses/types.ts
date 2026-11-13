export type ChapterContent = {
  instructions: string;
  initialCode: string;
  solution: string;
  type?: "console" | "browser" | "sql";
  /** SQL run into a fresh in-memory DB before the learner's query (interactive SQL chapters only). */
  seedSql?: string;
};

export type CourseData = {
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
