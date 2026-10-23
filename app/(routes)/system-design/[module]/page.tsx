import { getAllModuleSlugs, getModule } from "@/config/system-design/registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ModuleLayout } from "@/components/system-design/ModuleLayout";

interface ModulePageProps {
  params: Promise<{ module: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllModuleSlugs().map((module) => ({ module }));
}

export async function generateMetadata({
  params,
}: ModulePageProps): Promise<Metadata> {
  const { module } = await params;
  const mod = await getModule(module);
  if (!mod) return { title: "Module Not Found" };
  return {
    title: `${mod.title} — System Design Learning`,
    description: mod.description,
  };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { module } = await params;
  const mod = await getModule(module);

  if (!mod) notFound();

  return <ModuleLayout module={mod} />;
}
