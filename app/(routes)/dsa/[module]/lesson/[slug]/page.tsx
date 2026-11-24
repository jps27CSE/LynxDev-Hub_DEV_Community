import { getAllModuleSlugs, getModule, getLesson } from "@/config/dsa/registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DsaLessonView from "@/components/dsa/DsaLessonView";
import Link from "next/link";

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

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { module: moduleSlug, slug } = await params;
  const module = getModule(moduleSlug);
  const lesson = module ? getLesson(moduleSlug, slug) : undefined;
  if (!module || !lesson) return { title: "Lesson Not Found" };
  return { title: `${lesson.title} — ${module.title} — DSA` };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { module: moduleSlug, slug } = await params;
  const module = getModule(moduleSlug);
  const lesson = module ? getLesson(moduleSlug, slug) : undefined;
  if (!module || !lesson) notFound();

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 pt-4">
        <Link href={`/dsa/${module.slug}`} className="text-sm text-muted-foreground hover:text-primary">
          &larr; {module.title}
        </Link>
      </div>
      <DsaLessonView moduleSlug={module.slug} lesson={lesson} />
    </div>
  );
}
