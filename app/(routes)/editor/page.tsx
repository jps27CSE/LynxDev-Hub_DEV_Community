import type { Metadata } from "next";
import { getProblemById } from "@/lib/problem-data";
import EditorClient from "./EditorClient";

export const metadata: Metadata = {
  title: "Code Editor",
  description:
    "Practice coding in the browser — solve DSA problems with a built-in editor, test runner, and AI hints.",
};

type EditorPageProps = {
  searchParams: Promise<{ problemId?: string }>;
};

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const { problemId } = await searchParams;
  const problem = problemId ? await getProblemById(Number(problemId)) : null;

  // keyed by problem so client-side ?problemId changes remount with fresh state
  return <EditorClient key={problem?.id ?? "playground"} problem={problem} />;
}
