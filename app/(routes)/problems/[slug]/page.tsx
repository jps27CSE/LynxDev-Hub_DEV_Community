import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllWorkspaceSummaries,
  resolveWorkspaceProblem,
} from "@/lib/problem-data";
import ProblemWorkspace from "./ProblemWorkspace";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const problem = await resolveWorkspaceProblem(slug);
  if (!problem) return { title: "Problem Not Found" };
  return {
    title: problem.title,
    description: `Solve "${problem.title}" — ${problem.difficulty} DSA problem on LynxDEV.`,
  };
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [problem, summaries] = await Promise.all([
    resolveWorkspaceProblem(slug),
    getAllWorkspaceSummaries(),
  ]);

  if (!problem) notFound();

  return <ProblemWorkspace problem={problem} summaries={summaries} />;
}
