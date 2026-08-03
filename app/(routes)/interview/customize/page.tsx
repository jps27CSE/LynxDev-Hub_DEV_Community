import Link from "next/link";
import { getTopTags } from "@/lib/interview-data";
import CustomizeClient from "./CustomizeClient";
import { PageHeader } from "@/components/PageHeader";

export default async function CustomizePage() {
  const topTags = await getTopTags(40);
  const tags = topTags.map((t) => t.tag);

  return (
    <div className="flex flex-col">
      <PageHeader>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/interview"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Interview
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Customize Your Stack</span>
          </div>
        </div>
      </PageHeader>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <CustomizeClient tags={tags} />
      </div>
    </div>
  );
}
