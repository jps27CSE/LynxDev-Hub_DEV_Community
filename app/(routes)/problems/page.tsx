import { redirect } from "next/navigation";
import { TOP_PROBLEMS } from "@/config/problems/top-problems";

export default function ProblemsIndex() {
  redirect(`/problems/${TOP_PROBLEMS[0].slug}`);
}
