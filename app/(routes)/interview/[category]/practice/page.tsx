import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  getCategoryBySlug,
  getQuestionsByCategorySlug,
  getQuestionCountByCategorySlug,
} from "@/lib/interview-data";
import PracticeClient from "./PracticeClient";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const cat = await getCategoryBySlug(slug);

  if (!cat) {
    notFound();
  }

  const [totalCount, questions] = await Promise.all([
    getQuestionCountByCategorySlug(slug),
    getQuestionsByCategorySlug(slug, { limit: 20, offset: 0 }),
  ]);

  if (totalCount === 0) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-border/40 bg-card px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/interview/${slug}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; {cat.name}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Practice</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <PracticeClient
          initialQuestions={questions}
          totalCount={totalCount}
          categorySlug={slug}
        />
      </div>
    </div>
  );
}
