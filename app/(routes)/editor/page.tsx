import { getProblemById } from "@/lib/problem-data";
import EditorClient from "./EditorClient";

type EditorPageProps = {
  searchParams: Promise<{ problemId?: string }>;
};

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const { problemId } = await searchParams;
  const problem = problemId ? await getProblemById(Number(problemId)) : null;

  return <EditorClient problem={problem} />;
}
