import { getAllRoadmaps } from "@/lib/roadmaps";
import RoadmapList from "./_components/RoadmapList";

export const metadata = {
  title: "Roadmaps",
  description:
    "Step-by-step developer roadmaps with curated learning resources.",
};

export default async function RoadmapsPage() {
  const roadmaps = await getAllRoadmaps();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Developer Roadmaps
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Step-by-step paths for the roles and skills that matter in 2026. Track
          your progress — it&apos;s saved in your browser.
        </p>
      </div>

      <RoadmapList roadmaps={roadmaps} />
    </div>
  );
}
