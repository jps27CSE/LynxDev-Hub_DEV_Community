import Image from "next/image";
import Link from "next/link";

const videos = [
  {
    title: "LangChain Runnables Explained: Build AI Pipelines the Easy Way (Bangla)",
    videoId: "JGsTM8UerAM",
  },
  {
    title: "How 'Logout from All Devices' Actually Works | Backend System Design",
    videoId: "tOm35rmGrfg",
  },
  {
    title: "OpenCode Tutorial: Build a Project with AI Agents (Complete Beginner Guide)",
    videoId: "4wVmDzdCH0M",
  },
  {
    title: "Build a PDF RAG Chatbot with LangChain in Bangla (Complete Beginner Project)",
    videoId: "4HFYZWXctak",
  },
  {
    title: "LangChain Retrievers Explained: Similarity, MMR & MultiQuery Search",
    videoId: "lgymF9qoVGE",
  },
  {
    title: "LangChain Vector Store Explained: Store & Search Embeddings for RAG",
    videoId: "vMV85pHr464",
  },
  {
    title: "LangChain Text Splitting Explained: Chunking for Better RAG",
    videoId: "eZED4LOUvr8",
  },
  {
    title: "LangChain Document Loaders Explained: Load PDFs, TXT & More for RAG",
    videoId: "TY6wAx2L3jA",
  },
  {
    title: "RAG Explained: How Retrieval-Augmented Generation Actually Works",
    videoId: "8_cuad916us",
  },
  {
    title: "LangChain Prompt Templates & Structured Output Explained",
    videoId: "S6F-jekTkO0",
  },
  {
    title: "Generative AI vs Agentic AI vs AI Agents Explained Simply",
    videoId: "sCN-DIcZegE",
  },
  {
    title: "Build Your First AI Chatbot with LangChain in Python",
    videoId: "QndKWRg0LhU",
  },
  {
    title: "What Are Embeddings? The Foundation of RAG & AI Search",
    videoId: "N2BJwtSFP7s",
  },
  {
    title: "Generative AI Explained for Developers: LLMs, LangChain & AI Apps",
    videoId: "5yWYv2WjcDU",
  },
  {
    title: "Docker Compose Explained: Run Multiple Containers with One Command",
    videoId: "ciDV6_vC9-o",
  },
];

function YoutubeCarousel() {
  return (
    <section className="py-20 sm:py-28 border-b border-border/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            Watch & Learn
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Curated video tutorials from Code Insights by Jack
          </p>
        </div>
      </div>
      <div className="relative">
        <div className="flex gap-4 animate-scroll w-max">
          {[...videos, ...videos].map((video, index) => (
            <Link
              key={index}
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-[280px] group"
            >
              <div className="rounded-xl overflow-hidden border border-border/50 group-hover:border-border transition-colors bg-card">
                <div className="aspect-video relative bg-muted">
                  <Image
                    src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                    alt={video.title}
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2">
                    {video.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default YoutubeCarousel;
