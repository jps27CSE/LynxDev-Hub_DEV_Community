import { getAllProblems, getProblemCategories } from "@/lib/problem-data";
import ProblemsClient from "./ProblemsClient";

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{
    difficulty?: string;
    category?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const difficulty = sp.difficulty || "all";
  const category = sp.category || "all";
  const currentPage = Math.max(1, parseInt(sp.page || "1", 10));
  const offset = (currentPage - 1) * 20;

  const [categories, { problems, total }] = await Promise.all([
    getProblemCategories(),
    getAllProblems({ limit: 20, offset, difficulty, category }),
  ]);

  return (
    <ProblemsClient
      problems={problems}
      total={total}
      categories={categories}
      currentPage={currentPage}
      selectedDifficulty={difficulty}
      selectedCategory={category}
    />
  );
}
