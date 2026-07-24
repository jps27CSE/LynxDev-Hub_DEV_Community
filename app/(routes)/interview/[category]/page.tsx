import { notFound } from "next/navigation";
import { getCategoryBySlug, getChaptersByCategorySlug, getQuestionsByCategorySlug } from "@/lib/interview-data";
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
  const questions = await getQuestionsByCategorySlug(slug);

  return <CategoryClient category={cat} chapters={chapters} questions={questions} />;
}
