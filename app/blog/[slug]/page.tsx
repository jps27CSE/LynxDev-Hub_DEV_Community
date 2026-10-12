import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found — LynxDEV",
    };
  }

  return {
    title: `${post.title} — LynxDEV Engineering Blog`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-paper" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="pt-8">
          <Link href="/blog">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </Link>
        </div>

        <article className="py-10 sm:py-14">
          <header className="mb-12 border-b border-border/20 pb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold tracking-tight leading-[1.12] text-balance">
              {post.title}
            </h1>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </div>
            </div>
            {post.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-border/50 bg-muted/40 text-xs font-medium text-muted-foreground"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="mt-8">
            <div className="prose prose-invert prose-base sm:prose-lg lg:prose-xl max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:scroll-mt-24 prose-headings:mt-12 prose-headings:mb-6 prose-h1:mt-0 prose-p:leading-loose prose-p:text-foreground/95 prose-p:my-6 prose-li:leading-loose prose-li:text-foreground/95 prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-cyan-300 prose-code:bg-muted/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-[#0a0c14]/98 prose-pre:border prose-pre:border-border/60 prose-pre:shadow-2xl prose-pre:rounded-xl prose-pre:my-8 prose-img:rounded-xl prose-img:border prose-img:border-border/50 prose-img:my-10 prose-hr:my-10 prose-hr:border-border/40 prose-table:text-sm prose-th:bg-muted/50 prose-th:border-border/60 prose-td:border-border/50 prose-blockquote:border-l-cyan-400/70 prose-blockquote:bg-cyan-400/5 prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:not-italic prose-blockquote:text-foreground/95 prose-blockquote:my-8">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  img: ({ node, ...props }) => (
                    <img {...props} className="w-full h-auto rounded-xl border border-border/50 my-8" loading="lazy" />
                  ),
                  p: ({ node, children, ...props }) => {
                    // Check if children contain only an img
                    if (children && Array.isArray(children) && children.length === 1) {
                      const child = children[0] as any;
                      if (child && child.type === "img") {
                        return <>{children}</>;
                      }
                    }
                    return <p {...props}>{children}</p>;
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
