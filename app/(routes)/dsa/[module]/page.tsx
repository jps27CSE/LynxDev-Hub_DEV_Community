import { getAllModuleSlugs, getModule } from "@/config/dsa/registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DsaModuleView from "@/components/dsa/DsaModuleView";
import { toModuleOverview } from "@/lib/dsa/view-model";

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
  const mod = getModule(module);
  if (!mod) return { title: "Module Not Found" };
  return { title: `${mod.title} — DSA`, description: mod.description };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { module } = await params;
  const mod = getModule(module);
  if (!mod) notFound();

  // Trimmed before the client boundary: `DsaModule` carries the task's check
  // functions, which cannot be serialised into a Client Component.
  return <DsaModuleView module={toModuleOverview(mod)} />;
}
