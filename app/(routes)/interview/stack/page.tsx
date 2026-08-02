import StackClient from "./StackClient";
import { PageHeader } from "@/components/PageHeader";

export const metadata = {
  title: "My Stack Practice",
};

export default function StackPage() {
  return (
    <div className="flex flex-col">
      <PageHeader>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <a
              href="/interview"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Interview
            </a>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">My Stack</span>
          </div>
        </div>
      </PageHeader>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <StackClient />
      </div>
    </div>
  );
}
