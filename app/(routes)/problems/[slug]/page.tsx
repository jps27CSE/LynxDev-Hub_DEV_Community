import { notFound } from "next/navigation";
import {
  getAllWorkspaceSummaries,
  resolveWorkspaceProblem,
} from "@/lib/problem-data";
import ProblemWorkspace from "./ProblemWorkspace";

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
