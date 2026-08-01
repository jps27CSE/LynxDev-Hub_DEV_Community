import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getChaptersByCategorySlug,
  getQuestionsByChapterIds,
} from "@/lib/interview-data";
import CategoryClient from "./CategoryClient";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const cat = await getCategoryBySlug(slug);

  if (!cat) {
    notFound();
  }

  const chapters = await getChaptersByCategorySlug(slug);
  const chapterIds = chapters.map((ch) => ch.id);
  const questionsByChapter =
    chapterIds.length > 0 ? await getQuestionsByChapterIds(chapterIds) : {};

  const chaptersWithQuestions = chapters.map((ch) => ({
    ...ch,
    questions: questionsByChapter[ch.id] ?? [],
  }));

  return (
    <CategoryClient
      category={cat}
      chaptersWithQuestions={chaptersWithQuestions}
    />
  );
}
