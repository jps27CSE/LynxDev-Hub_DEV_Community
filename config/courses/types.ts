export type ChapterContent = {
  instructions: string;
  initialCode: string;
  solution: string;
  type?: "console" | "browser";
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
