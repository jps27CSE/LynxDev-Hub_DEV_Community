import type { Metadata } from "next";
import { loadAllDsaModules } from "@/config/dsa/registry";
import DsaIndexView from "@/components/dsa/DsaIndexView";
import { dsaTotals, toModuleOverview } from "@/lib/dsa/view-model";

export const metadata: Metadata = {
  title: "DSA Learning Path",
  description:
    "Data structures and algorithms in interview order: eighteen modules, step-through animations, runnable code and build tasks.",
};

export default function DsaIndex() {
  const modules = loadAllDsaModules();
  const overviews = modules
    .map(toModuleOverview)
    .sort((a, b) => a.order - b.order);

  return <DsaIndexView modules={overviews} totals={dsaTotals(modules)} />;
}
