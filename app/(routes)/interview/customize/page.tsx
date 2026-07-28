import { getAllCategories, getDistinctTagsByCategorySlug } from "@/lib/interview-data";
import CustomizeClient from "./CustomizeClient";

export default async function CustomizePage() {
  const categories = await getAllCategories();
  const slugFilter = ["software-engineer", "frontend-engineer", "backend-engineer"];
  const allowed = categories.filter((c) => slugFilter.includes(c.slug));

  const stacksByCategory: { name: string; slug: string; icon: string | null; tags: string[] }[] = [];

  for (const cat of allowed) {
    const tags = await getDistinctTagsByCategorySlug(cat.slug);
    if (tags.length > 0) {
      stacksByCategory.push({ name: cat.name, slug: cat.slug, icon: cat.icon, tags });
    }
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-border/40 bg-card px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <a
              href="/interview"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Interview
            </a>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Customize Your Stack</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <CustomizeClient stacksByCategory={stacksByCategory} />
      </div>
    </div>
  );
}
