import { getSortedPosts } from "@/config/blog";

const BASE_URL = "https://lynxdev.io";
const FEED_URL = `${BASE_URL}/blog/feed.xml`;

/**
 * RSS 2.0 feed for the engineering blog.
 *
 * Hand-rolled rather than pulled from a package: the payload is five posts and
 * the whole format is a dozen lines of XML. A dependency for this would cost
 * more than it saves, on a free tier where every byte of the lockfile is
 * something to justify.
 *
 * Every field is escaped. Values come from `config/blog.ts` (build-time
 * literals today), but this route is public and unauthenticated, so it should
 * be safe by construction rather than safe by assumption — an unescaped `&` in
 * a title would produce a malformed feed that feed readers silently drop.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 822 date, as RSS 2.0 requires. Parsed at UTC midnight to stay stable. */
function toRfc822(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toUTCString();
}

export const dynamic = "force-static";

export function GET() {
  const posts = getSortedPosts();
  const lastBuildDate = toRfc822(posts[0]?.date ?? new Date().toISOString());

  const items = posts
    .map((post) => {
      const url = `${BASE_URL}/blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${toRfc822(post.date)}</pubDate>
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LynxDEV Engineering Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Architecture, caching, security and performance decisions behind LynxDEV — written by the engineers building it.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // The feed changes only when a post is added, which happens at build time.
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
