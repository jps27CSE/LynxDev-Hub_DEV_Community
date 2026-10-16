import type { Metadata } from "next";
import { getSortedPosts, type PostMeta } from "@/config/blog";

const SITE_NAME = "LynxDEV";
const BASE_URL = "https://lynxdev.io";

/**
 * SEO metadata for the engineering blog.
 *
 * Centralised because every post has the same metadata shape and the defects
 * this fixes were systemic rather than per-post:
 *
 *  - The root layout defines `openGraph` and `twitter` objects. A page-level
 *    `metadata.title` does NOT deep-merge into them — so every post was
 *    rendering `og:title`/`twitter:title` as the generic site name, and shares
 *    showed "LynxDEV" with the homepage blurb. Each post now declares its own
 *    OG/Twitter block explicitly.
 *  - There was no canonical URL, so the same post was reachable via several
 *    paths with no canonical signal.
 *  - `og:type` was inherited as `website`; article posts should be `article`.
 *  - `twitter:card` was `summary_large_image` with no image at all, which is a
 *    mismatch — a large card with nothing to show degrades to a bare text chip.
 *
 * `title` uses `{ absolute }` rather than a plain string. A string title is a
 * *template input* — the root layout's `template: "%s | LynxDEV"` still gets
 * appended to it, which produced a visibly doubled
 * `Engineering Blog | LynxDEV | LynxDEV` on the index. `absolute` opts out of
 * every ancestor template, so the browser title and `og:title` cannot drift
 * apart via template composition either.
 */
export function buildPostMetadata(post: PostMeta): Metadata {
  const url = `${BASE_URL}/blog/${post.slug}`;
  const image = `${BASE_URL}/blog/${post.slug}/opengraph-image`;

  return {
    title: { absolute: `${post.title} | ${SITE_NAME}` },
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: SITE_NAME,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: [post.author],
      tags: [...post.tags],
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [image],
    },
  };
}

export function buildBlogIndexMetadata(): Metadata {
  const url = `${BASE_URL}/blog`;

  return {
    title: { absolute: `Engineering Blog | ${SITE_NAME}` },
    description:
      "Deep dives on the architecture, caching, security and performance decisions behind LynxDEV — written by the engineers building it.",
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: "LynxDEV Engineering Blog",
      description:
        "Deep dives on the architecture, caching, security and performance decisions behind LynxDEV.",
      images: [
        {
          url: `${BASE_URL}/blog/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "LynxDEV Engineering Blog",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "LynxDEV Engineering Blog",
      description:
        "Deep dives on the architecture, caching, security and performance decisions behind LynxDEV.",
      images: [`${BASE_URL}/blog/opengraph-image`],
    },
  };
}

/**
 * JSON-LD for a post.
 *
 * `TechArticle` rather than `BlogPosting`: it is the schema.org type Google
 * documents for technical/engineering content, and it inherits Article's
 * supported properties (`headline`, `datePublished`, `author`, `image`).
 *
 * `dateModified` is intentionally omitted. Posts are authored as static
 * components, so we do not track edits per post — emitting it would require
 * inventing a value, and a wrong `dateModified` is worse than none.
 */
export function buildPostJsonLd(post: PostMeta): string {
  const url = `${BASE_URL}/blog/${post.slug}`;

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
    },
    image: `${BASE_URL}/blog/${post.slug}/opengraph-image`,
    keywords: post.tags.join(", "),
    inLanguage: "en-US",
    isPartOf: {
      "@type": "Blog",
      name: `${SITE_NAME} Engineering Blog`,
      url: `${BASE_URL}/blog`,
    },
  });
}

export function buildBlogIndexJsonLd(): string {
  const url = `${BASE_URL}/blog`;

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Engineering Blog`,
    description:
      "Deep dives on the architecture, caching, security and performance decisions behind LynxDEV.",
    url,
    publisher: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
    blogPost: getSortedPosts().map((post) => ({
      "@type": "TechArticle",
      headline: post.title,
      url: `${BASE_URL}/blog/${post.slug}`,
      datePublished: post.date,
    })),
  });
}
