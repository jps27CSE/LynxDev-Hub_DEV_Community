import { getAllProblems } from "@/lib/problem-data";
import ProblemsClient from "./ProblemsClient";

export default async function ProblemsPage() {
  const problems = await getAllProblems();
  return <ProblemsClient problems={problems} />;
}
