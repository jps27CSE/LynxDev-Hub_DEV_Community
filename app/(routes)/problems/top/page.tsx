import { TOP_PROBLEMS } from "@/config/problems/top-problems";
import TopProblemsClient from "./TopProblemsClient";

export default function TopProblemsPage() {
  const groups = Array.from(new Set(TOP_PROBLEMS.map((p) => p.group))).sort();

  return <TopProblemsClient problems={TOP_PROBLEMS} groups={groups} />;
}
