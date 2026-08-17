import Image from "next/image";
import Link from "next/link";

const videos = [
  {
    title:
      "LangChain Runnables Explained: Build AI Pipelines the Easy Way (Bangla)",
    videoId: "JGsTM8UerAM",
  },
  {
    title:
      "How 'Logout from All Devices' Actually Works | Backend System Design",
    videoId: "tOm35rmGrfg",
  },
  {
    title:
      "OpenCode Tutorial: Build a Project with AI Agents (Complete Beginner Guide)",
    videoId: "4wVmDzdCH0M",
  },
  {
    title:
      "Build a PDF RAG Chatbot with LangChain in Bangla (Complete Beginner Project)",
    videoId: "4HFYZWXctak",
  },
  {
    title:
      "LangChain Retrievers Explained: Similarity, MMR & MultiQuery Search",
    videoId: "lgymF9qoVGE",
  },
  {
    title:
      "LangChain Vector Store Explained: Store & Search Embeddings for RAG",
    videoId: "vMV85pHr464",
  },
  {
    title: "LangChain Text Splitting Explained: Chunking for Better RAG",
    videoId: "eZED4LOUvr8",
  },
  {
    title:
      "LangChain Document Loaders Explained: Load PDFs, TXT & More for RAG",
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
    <section className="py-20 sm:py-28 border-b border-border/40 overflow-hidden bg-[#07090e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-xs text-muted-foreground mb-5">
            <span className="text-fuchsia-400">//</span> watch &amp; learn
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-balance">
            Video tutorials,{" "}
            <span className="neon-text-gradient">zero fluff</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Curated tutorials from Code Insights by Jack
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
              <div className="rounded-xl overflow-hidden border border-white/10 bg-card transition-all duration-300 group-hover:border-fuchsia-400/40 group-hover:shadow-[0_0_24px_rgba(232,121,249,0.15)]">
                <div className="aspect-video relative bg-muted">
                  <Image
                    src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                    alt={video.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2 group-hover:text-fuchsia-200 transition-colors">
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
