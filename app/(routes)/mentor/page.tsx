import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MentorChat from "./_components/MentorChat";

export default async function MentorPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return <MentorChat />;
}
