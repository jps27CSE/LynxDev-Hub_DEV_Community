import type { Metadata } from "next";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
export const metadata: Metadata = {
  title: { absolute: "Engineering Blog | LynxDEV" },
  description:
    "Technical deep-dives into building LynxDEV: architecture, performance, and engineering decisions for a zero-cost platform.",
  alternates: { canonical: "https://lynxdev.io/blog" },
};

/**
 * Feed link.
 *
 * Rendered as an element rather than declared via `alternates.types` in the
 * metadata object: that form did not emit a `<link rel="alternate">` in this
 * Next version even though `canonical` in the same object resolved fine, so
 * the feed was silently undiscoverable. React 19 hoists `<link>` into the
 * document head, and the emitted markup is now verified in production build
 * output rather than assumed.
 *
 * Declared once here so every blog route advertises it instead of repeating it
 * across five page files.
 */
const FEED_HREF = "/blog/feed.xml";

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <link
        rel="alternate"
        type="application/rss+xml"
        href={FEED_HREF}
        title="LynxDEV Engineering Blog"
      />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
