import { getModule } from "@/config/system-design/registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LessonFlow } from "@/components/system-design/LessonFlow";

interface LessonPageProps {
  params: Promise<{ module: string; lesson: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams({
  params,
}: {
  params?: { module?: string };
}): Promise<Array<{ lesson: string }>> {
  if (!params?.module) return [];

  const module = await getModule(params.module);
  if (!module)
    throw new Error(
      `Registered module "${params.module}" could not be loaded.`,
    );
  return module.lessons.map((lesson) => ({ lesson: lesson.slug }));
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const module = await getModule(moduleSlug);
  const lesson = module?.lessons.find((item) => item.slug === lessonSlug);
  if (!module || !lesson) return { title: "Lesson Not Found" };
  const descriptionSection = lesson.sections.find(
    (section) => "body" in section,
  );

  return {
    title: `${lesson.title} — ${module.title} — System Design Learning`,
    description: descriptionSection?.body.slice(0, 160),
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const module = await getModule(moduleSlug);
  const lesson = module?.lessons.find((item) => item.slug === lessonSlug);
  if (!module || !lesson) notFound();

  return (
    <LessonFlow
      moduleSlug={module.slug}
      moduleTitle={module.title}
      lessons={module.lessons}
      lesson={lesson}
    />
  );
}
