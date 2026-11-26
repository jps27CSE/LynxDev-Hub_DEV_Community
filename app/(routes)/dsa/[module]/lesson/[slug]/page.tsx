import { getAllModuleSlugs, getModule, getLesson } from "@/config/dsa/registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DsaLessonView from "@/components/dsa/DsaLessonView";
import {
  lessonNeighbours,
  lessonOrder,
  readingMinutes,
} from "@/lib/dsa/view-model";
import { lessonWordCount } from "@/lib/dsa/content-rules";

interface LessonPageProps {
  params: Promise<{ module: string; slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams(): Promise<
  Array<{ module: string; slug: string }>
> {
  const slugs = getAllModuleSlugs();
  const params: Array<{ module: string; slug: string }> = [];
  for (const moduleSlug of slugs) {
    const module = getModule(moduleSlug);
    if (!module) continue;
    for (const lesson of module.lessons) {
      params.push({ module: moduleSlug, slug: lesson.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { module: moduleSlug, slug } = await params;
  const module = getModule(moduleSlug);
  const lesson = module ? getLesson(moduleSlug, slug) : undefined;
  if (!module || !lesson) return { title: "Lesson Not Found" };
  return {
    title: `${lesson.title} — ${module.title} — DSA`,
    description: `${lesson.title}: part of the ${module.title} module.`,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { module: moduleSlug, slug } = await params;
  const module = getModule(moduleSlug);
  const lesson = module ? getLesson(moduleSlug, slug) : undefined;
  if (!module || !lesson) notFound();

  // Only slugs and titles cross the boundary for navigation. The prose of every
  // other lesson in the module stays on the server.
  const neighbours = lessonNeighbours(module, lesson.slug);

  return (
    <DsaLessonView
      moduleSlug={module.slug}
      moduleTitle={module.title}
      lesson={lesson}
      nav={lessonOrder(module)}
      position={neighbours.position}
      readMinutes={readingMinutes(lessonWordCount(lesson))}
      hasTask={module.kind === "lesson+task" && Boolean(module.task)}
    />
  );
}
