import { getProblemById } from "@/lib/problem-data";
import ProblemDetailClient from "./ProblemDetailClient";

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = await getProblemById(Number(id));

  if (!problem) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Problem not found.</p>
      </div>
    );
  }

  return <ProblemDetailClient problem={problem} />;
}
