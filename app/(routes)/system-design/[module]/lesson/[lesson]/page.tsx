import { getModule } from "@/config/system-design/registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LessonFlow } from "@/components/system-design/LessonFlow";

interface LessonPageProps {
  params: Promise<{ module: string; lesson: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams(): Promise<
  Array<{ module: string; lesson: string }>
> {
  const { getAllModuleSlugs } = await import("@/config/system-design/registry");
  const slugs = getAllModuleSlugs();
  const params: Array<{ module: string; lesson: string }> = [];

  for (const moduleSlug of slugs) {
    const module = await getModule(moduleSlug);
    if (!module) {
      throw new Error(
        `Registered module "${moduleSlug}" could not be loaded for static params.`,
      );
    }
    for (const lesson of module.lessons) {
      params.push({ module: moduleSlug, lesson: lesson.slug });
    }
  }

  return params;
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
