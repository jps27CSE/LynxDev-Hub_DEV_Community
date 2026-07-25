import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getChaptersByCategorySlug,
  getQuestionsByChapterId,
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

  const chaptersWithQuestions = await Promise.all(
    chapters.map(async (ch) => ({
      ...ch,
      questions: await getQuestionsByChapterId(ch.id),
    }))
  );

  return (
    <CategoryClient category={cat} chaptersWithQuestions={chaptersWithQuestions} />
  );
}
