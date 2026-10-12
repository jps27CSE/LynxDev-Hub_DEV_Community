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
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link href="/blog">
          <Button variant="ghost" className="gap-2 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Button>
        </Link>

        <article>
          <header className="mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight leading-[1.15] text-balance">
              {post.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-border/40 bg-muted/30 text-xs text-muted-foreground"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="prose prose-invert prose-base sm:prose-lg max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:mt-10 prose-headings:mb-4 prose-h1:mt-0 prose-h1:mb-6 prose-h2:text-2xl sm:prose-h2:text-3xl prose-h3:text-xl sm:prose-h3:text-2xl prose-p:leading-relaxed prose-p:text-foreground/90 prose-p:my-6 prose-li:leading-relaxed prose-li:text-foreground/90 prose-a:text-cyan-400 prose-a:underline-offset-2 hover:prose-a:text-cyan-300 prose-strong:text-foreground prose-code:text-cyan-300 prose-code:bg-muted/60 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-[#0a0c14]/98 prose-pre:border prose-pre:border-border/60 prose-pre:rounded-lg prose-pre:my-8 prose-pre:p-4 prose-img:rounded-lg prose-img:my-8 prose-hr:my-12 prose-hr:border-border/40 prose-table:text-sm prose-th:bg-muted/50 prose-th:border-border/50 prose-td:border-border/50 prose-blockquote:border-l-cyan-400/60 prose-blockquote:bg-cyan-400/5 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-foreground/90 prose-blockquote:my-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                img: ({ node, ...props }) => (
                  <img {...props} className="w-full h-auto rounded-lg my-8" loading="lazy" />
                ),
                p: ({ node, children, ...props }: any) => {
                  if (children && Array.isArray(children) && children.length === 1) {
                    const child = children[0] as any;
                    if (child && child.type === 'img') {
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
        </article>
      </div>
    </div>
  );
}
