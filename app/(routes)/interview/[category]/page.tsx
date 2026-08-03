import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getChaptersByCategorySlug,
  getQuestionsByChapterIds,
  getQuestionIdsByChapterIds,
} from "@/lib/interview-data";
import type { InterviewQuestion } from "@/lib/interview-data";
import ChapterHubClient from "./ChapterHubClient";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ chapter?: string }>;
}) {
  const { category: slug } = await params;
  const { chapter: chapterParam } = await searchParams;
  const cat = await getCategoryBySlug(slug);

  if (!cat) {
    notFound();
  }

  const chapters = await getChaptersByCategorySlug(slug);
  const chapterIds = chapters.map((ch) => ch.id);

  const requestedId = chapterParam ? parseInt(chapterParam, 10) : NaN;
  const activeId = chapterIds.includes(requestedId)
    ? requestedId
    : chapterIds[0];

  const [questionIdsByChapter, activeQuestions] = await Promise.all([
    getQuestionIdsByChapterIds(chapterIds),
    activeId
      ? getQuestionsByChapterIds([activeId])
      : Promise.resolve<Record<number, InterviewQuestion[]>>({}),
  ]);

  return (
    <ChapterHubClient
      category={cat}
      chapters={chapters}
      questionIdsByChapter={questionIdsByChapter}
      initialChapterId={activeId ?? 0}
      initialQuestions={activeQuestions[activeId] ?? []}
    />
  );
}
