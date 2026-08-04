import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MENTOR_ENABLED } from "@/config/mentor";
import MentorChat from "./_components/MentorChat";

export default async function MentorPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  if (!MENTOR_ENABLED) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Mentor</h1>
        <p className="text-muted-foreground">AI mentorship is coming soon.</p>
      </div>
    );
  }

  return <MentorChat />;
}
