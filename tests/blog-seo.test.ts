/**
 * @file
 *
 * Pins `lib/blog-seo.ts` — SEO metadata and JSON-LD builders.
 *
 * This is the **single source of truth** for blog SEO. It fixes systemic defects:
 *   - Root layout's openGraph/twitter objects don't deep-merge from page metadata
 *   - Missing canonical URLs
 *   - Wrong og:type (website vs article)
 *   - twitter:card mismatch (summary_large_image with no image)
 *   - Title template double-appending (plain string vs { absolute })
 *
 * All functions are pure string/object construction — no I/O, fully testable.
 *
 * A regression here means:
 *   - Social shares show wrong title/description/image
 *   - Search engines get wrong structured data
 *   - Canonical URLs missing → duplicate content penalties
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPostMetadata,
  buildBlogIndexMetadata,
  buildPostJsonLd,
  buildBlogIndexJsonLd,
} from "../lib/blog-seo";
import type { PostMeta } from "../config/blog";
import type { Metadata } from "next";

const SITE_NAME = "LynxDEV";
const BASE_URL = "https://lynxdev.io";

function samplePost(overrides: Partial<PostMeta> = {}): PostMeta {
  return {
    slug: "test-post",
    title: "Test Post Title",
    date: "2026-10-20",
    readTime: "10 min read",
    author: "Test Author",
    description: "A test post description for SEO testing.",
    tags: ["testing", "seo", "blog"],
    toc: [
      { id: "intro", title: "Introduction", depth: 2 },
      { id: "conclusion", title: "Conclusion", depth: 2 },
    ],
    ...overrides,
  };
}

describe("buildPostMetadata", () => {
  it("returns Metadata with all required fields", () => {
    const post = samplePost();
    const meta = buildPostMetadata(post);

    assert.ok(meta.title);
    assert.ok(meta.description);
    assert.ok(meta.keywords);
    assert.ok(meta.authors);
    assert.ok(meta.alternates?.canonical);
    assert.ok(meta.openGraph);
    assert.ok(meta.twitter);
  });

  it("title uses { absolute } to opt out of root layout template", () => {
    const post = samplePost({ title: "My Post" });
    const meta = buildPostMetadata(post);

    // Should be an object with absolute, not a plain string
    assert.ok(typeof meta.title === "object" && "absolute" in (meta.title as any));
    assert.equal((meta.title as any).absolute, `My Post | ${SITE_NAME}`);
  });

  it("canonical URL is correct", () => {
    const post = samplePost({ slug: "my-post" });
    const meta = buildPostMetadata(post);
    assert.equal(meta.alternates?.canonical, `${BASE_URL}/blog/my-post`);
  });

  describe("openGraph", () => {
    it("type is 'article' (not 'website')", () => {
      const post = samplePost();
      const meta = buildPostMetadata(post);
      assert.equal((meta.openGraph as any)?.type, "article");
    });

    it("url matches canonical", () => {
      const post = samplePost({ slug: "my-post" });
      const meta = buildPostMetadata(post);
      assert.equal((meta.openGraph as any)?.url, `${BASE_URL}/blog/my-post`);
    });

    it("siteName is SITE_NAME", () => {
      const post = samplePost();
      const meta = buildPostMetadata(post);
      assert.equal((meta.openGraph as any)?.siteName, SITE_NAME);
    });

    it("title is post title (not templated)", () => {
      const post = samplePost({ title: "Specific Title" });
      const meta = buildPostMetadata(post);
      assert.equal((meta.openGraph as any)?.title, "Specific Title");
    });

    it("description is post description", () => {
      const post = samplePost({ description: "Custom description" });
      const meta = buildPostMetadata(post);
      assert.equal((meta.openGraph as any)?.description, "Custom description");
    });

    it("publishedTime is post date", () => {
      const post = samplePost({ date: "2026-10-15" });
      const meta = buildPostMetadata(post);
      assert.equal((meta.openGraph as any)?.publishedTime, "2026-10-15");
    });

    it("authors array contains post author", () => {
      const post = samplePost({ author: "Jane Doe" });
      const meta = buildPostMetadata(post);
      assert.deepEqual((meta.openGraph as any)?.authors, ["Jane Doe"]);
    });

    it("tags are spread from post tags", () => {
      const post = samplePost({ tags: ["a", "b", "c"] });
      const meta = buildPostMetadata(post);
      assert.deepEqual((meta.openGraph as any)?.tags, ["a", "b", "c"]);
    });

    it("images array has correct structure", () => {
      const post = samplePost({ slug: "my-post", title: "Test Title" });
      const meta = buildPostMetadata(post);
      const images = (meta.openGraph as any)?.images;
      assert.ok(Array.isArray(images));
      assert.equal(images?.length, 1);
      assert.equal(images?.[0].url, `${BASE_URL}/blog/my-post/opengraph-image`);
      assert.equal(images?.[0].width, 1200);
      assert.equal(images?.[0].height, 630);
      assert.equal(images?.[0].alt, "Test Title");
    });
  });

  describe("twitter", () => {
    it("card is summary_large_image", () => {
      const post = samplePost();
      const meta = buildPostMetadata(post);
      assert.equal((meta.twitter as any)?.card, "summary_large_image");
    });

    it("title is post title", () => {
      const post = samplePost({ title: "Twitter Title" });
      const meta = buildPostMetadata(post);
      assert.equal((meta.twitter as any)?.title, "Twitter Title");
    });

    it("description is post description", () => {
      const post = samplePost({ description: "Twitter desc" });
      const meta = buildPostMetadata(post);
      assert.equal((meta.twitter as any)?.description, "Twitter desc");
    });

    it("images array contains post opengraph image URL", () => {
      const post = samplePost({ slug: "my-post" });
      const meta = buildPostMetadata(post);
      const images = (meta.twitter as any)?.images;
      assert.ok(Array.isArray(images));
      assert.equal(images?.[0], `${BASE_URL}/blog/my-post/opengraph-image`);
    });
  });

  describe("keywords and authors", () => {
    it("keywords are post tags array", () => {
      const post = samplePost({ tags: ["tag1", "tag2"] });
      const meta = buildPostMetadata(post);
      assert.deepEqual(meta.keywords, ["tag1", "tag2"]);
    });

    it("authors is array with name object", () => {
      const post = samplePost({ author: "John Smith" });
      const meta = buildPostMetadata(post);
      assert.deepEqual(meta.authors, [{ name: "John Smith" }]);
    });
  });

  it("different posts produce different metadata", () => {
    const post1 = samplePost({ slug: "post-1", title: "Post 1" });
    const post2 = samplePost({ slug: "post-2", title: "Post 2" });
    const meta1 = buildPostMetadata(post1);
    const meta2 = buildPostMetadata(post2);
    assert.notDeepEqual(meta1, meta2);
  });
});

describe("buildBlogIndexMetadata", () => {
  it("returns Metadata with all required fields", () => {
    const meta = buildBlogIndexMetadata();

    assert.ok(meta.title);
    assert.ok(meta.description);
    assert.ok(meta.alternates?.canonical);
    assert.ok(meta.openGraph);
    assert.ok(meta.twitter);
  });

  it("title uses { absolute } to opt out of root layout template", () => {
    const meta = buildBlogIndexMetadata();
    assert.ok(typeof meta.title === "object" && "absolute" in (meta.title as any));
    assert.equal((meta.title as any).absolute, `Engineering Blog | ${SITE_NAME}`);
  });

  it("canonical URL is blog index", () => {
    const meta = buildBlogIndexMetadata();
    assert.equal(meta.alternates?.canonical, `${BASE_URL}/blog`);
  });

  describe("openGraph", () => {
    it("type is 'website' (index page)", () => {
      const meta = buildBlogIndexMetadata();
      assert.equal((meta.openGraph as any)?.type, "website");
    });

    it("url is blog index", () => {
      const meta = buildBlogIndexMetadata();
      assert.equal((meta.openGraph as any)?.url, `${BASE_URL}/blog`);
    });

    it("siteName is SITE_NAME", () => {
      const meta = buildBlogIndexMetadata();
      assert.equal((meta.openGraph as any)?.siteName, SITE_NAME);
    });

    it("title is 'LynxDEV Engineering Blog'", () => {
      const meta = buildBlogIndexMetadata();
      assert.equal((meta.openGraph as any)?.title, "LynxDEV Engineering Blog");
    });

    it("description is the long-form blurb", () => {
      const meta = buildBlogIndexMetadata();
      assert.ok(((meta.openGraph as any)?.description as string).length > 50);
      assert.match((meta.openGraph as any)?.description as string, /architecture|engineering/i);
    });

    it("images array has blog-level opengraph image", () => {
      const meta = buildBlogIndexMetadata();
      const images = (meta.openGraph as any)?.images;
      assert.ok(Array.isArray(images));
      assert.equal(images?.length, 1);
      assert.equal(images?.[0].url, `${BASE_URL}/blog/opengraph-image`);
      assert.equal(images?.[0].width, 1200);
      assert.equal(images?.[0].height, 630);
      assert.equal(images?.[0].alt, "LynxDEV Engineering Blog");
    });
  });

  describe("twitter", () => {
    it("card is summary_large_image", () => {
      const meta = buildBlogIndexMetadata();
      assert.equal((meta.twitter as any)?.card, "summary_large_image");
    });

    it("title matches openGraph title", () => {
      const meta = buildBlogIndexMetadata();
      assert.equal((meta.twitter as any)?.title, (meta.openGraph as any)?.title);
    });

    it("description matches openGraph description", () => {
      const meta = buildBlogIndexMetadata();
      assert.equal((meta.twitter as any)?.description, (meta.openGraph as any)?.description);
    });

    it("images array contains blog-level opengraph image", () => {
      const meta = buildBlogIndexMetadata();
      const images = (meta.twitter as any)?.images;
      assert.ok(Array.isArray(images));
      assert.equal(images?.[0], `${BASE_URL}/blog/opengraph-image`);
    });
  });
});

describe("buildPostJsonLd", () => {
  it("returns valid JSON string", () => {
    const post = samplePost();
    const jsonLd = buildPostJsonLd(post);
    assert.doesNotThrow(() => JSON.parse(jsonLd));
  });

  it("parsed JSON has correct @context", () => {
    const post = samplePost();
    const data = JSON.parse(buildPostJsonLd(post));
    assert.equal(data["@context"], "https://schema.org");
  });

  it("@type is TechArticle (not BlogPosting)", () => {
    const post = samplePost();
    const data = JSON.parse(buildPostJsonLd(post));
    assert.equal(data["@type"], "TechArticle");
  });

  it("headline is post title", () => {
    const post = samplePost({ title: "JSON-LD Title" });
    const data = JSON.parse(buildPostJsonLd(post));
    assert.equal(data.headline, "JSON-LD Title");
  });

  it("description is post description", () => {
    const post = samplePost({ description: "JSON-LD description" });
    const data = JSON.parse(buildPostJsonLd(post));
    assert.equal(data.description, "JSON-LD description");
  });

  it("url matches canonical", () => {
    const post = samplePost({ slug: "my-post" });
    const data = JSON.parse(buildPostJsonLd(post));
    assert.equal(data.url, `${BASE_URL}/blog/my-post`);
  });

  it("mainEntityOfPage references same URL", () => {
    const post = samplePost({ slug: "my-post" });
    const data = JSON.parse(buildPostJsonLd(post));
    assert.equal(data.mainEntityOfPage["@id"], `${BASE_URL}/blog/my-post`);
    assert.equal(data.mainEntityOfPage["@type"], "WebPage");
  });

  it("datePublished is post date", () => {
    const post = samplePost({ date: "2026-10-15" });
    const data = JSON.parse(buildPostJsonLd(post));
    assert.equal(data.datePublished, "2026-10-15");
  });

  it("author is Organization with post author name", () => {
    const post = samplePost({ author: "Author Name" });
    const data = JSON.parse(buildPostJsonLd(post));
    assert.equal(data.author["@type"], "Organization");
    assert.equal(data.author.name, "Author Name");
  });

  it("publisher is Organization with SITE_NAME and BASE_URL", () => {
    const post = samplePost();
    const data = JSON.parse(buildPostJsonLd(post));
    assert.equal(data.publisher["@type"], "Organization");
    assert.equal(data.publisher.name, SITE_NAME);
    assert.equal(data.publisher.url, BASE_URL);
  });

  it("image is post opengraph image URL", () => {
    const post = samplePost({ slug: "my-post" });
    const data = JSON.parse(buildPostJsonLd(post));
    assert.equal(data.image, `${BASE_URL}/blog/my-post/opengraph-image`);
  });

  it("keywords are tags joined by comma-space", () => {
    const post = samplePost({ tags: ["a", "b", "c"] });
    const data = JSON.parse(buildPostJsonLd(post));
    assert.equal(data.keywords, "a, b, c");
  });

  it("inLanguage is en-US", () => {
    const post = samplePost();
    const data = JSON.parse(buildPostJsonLd(post));
    assert.equal(data.inLanguage, "en-US");
  });

  it("isPartOf references Blog with correct name and URL", () => {
    const post = samplePost();
    const data = JSON.parse(buildPostJsonLd(post));
    assert.equal(data.isPartOf["@type"], "Blog");
    assert.equal(data.isPartOf.name, `${SITE_NAME} Engineering Blog`);
    assert.equal(data.isPartOf.url, `${BASE_URL}/blog`);
  });

  it("dateModified is intentionally omitted", () => {
    const post = samplePost();
    const data = JSON.parse(buildPostJsonLd(post));
    assert.equal("dateModified" in data, false);
  });
});

describe("buildBlogIndexJsonLd", () => {
  it("returns valid JSON string", () => {
    const jsonLd = buildBlogIndexJsonLd();
    assert.doesNotThrow(() => JSON.parse(jsonLd));
  });

  it("parsed JSON has correct @context", () => {
    const data = JSON.parse(buildBlogIndexJsonLd());
    assert.equal(data["@context"], "https://schema.org");
  });

  it("@type is Blog", () => {
    const data = JSON.parse(buildBlogIndexJsonLd());
    assert.equal(data["@type"], "Blog");
  });

  it("name is 'LynxDEV Engineering Blog'", () => {
    const data = JSON.parse(buildBlogIndexJsonLd());
    assert.equal(data.name, `${SITE_NAME} Engineering Blog`);
  });

  it("description matches blog index metadata", () => {
    const data = JSON.parse(buildBlogIndexJsonLd());
    assert.ok(data.description.length > 50);
    assert.match(data.description, /architecture|engineering/i);
  });

  it("url is blog index", () => {
    const data = JSON.parse(buildBlogIndexJsonLd());
    assert.equal(data.url, `${BASE_URL}/blog`);
  });

  it("publisher is Organization with SITE_NAME and BASE_URL", () => {
    const data = JSON.parse(buildBlogIndexJsonLd());
    assert.equal(data.publisher["@type"], "Organization");
    assert.equal(data.publisher.name, SITE_NAME);
    assert.equal(data.publisher.url, BASE_URL);
  });

  it("blogPost array includes all sorted posts", () => {
    const data = JSON.parse(buildBlogIndexJsonLd());
    assert.ok(Array.isArray(data.blogPost));
    assert.equal(data.blogPost.length, 5); // 5 posts in config/blog.ts
  });

  it("each blogPost entry is TechArticle with headline, url, datePublished", () => {
    const data = JSON.parse(buildBlogIndexJsonLd());
    for (const entry of data.blogPost) {
      assert.equal(entry["@type"], "TechArticle");
      assert.ok(typeof entry.headline === "string" && entry.headline.length > 0);
      assert.ok(typeof entry.url === "string" && entry.url.startsWith(BASE_URL));
      assert.ok(typeof entry.datePublished === "string" && entry.datePublished.match(/^\d{4}-\d{2}-\d{2}$/));
    }
  });

  it("blogPost entries are sorted by date descending (newest first)", () => {
    const data = JSON.parse(buildBlogIndexJsonLd());
    const dates = data.blogPost.map((e: any) => e.datePublished);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    assert.deepEqual(dates, sorted);
  });
});

describe("Constants", () => {
  it("SITE_NAME is 'LynxDEV'", () => {
    // Verified via metadata functions
    const meta = buildPostMetadata(samplePost());
    assert.match((meta.title as any).absolute, /LynxDEV$/);
  });

  it("BASE_URL is 'https://lynxdev.io'", () => {
    const post = samplePost({ slug: "test" });
    const meta = buildPostMetadata(post);
    assert.ok((meta.alternates?.canonical as string).startsWith("https://lynxdev.io/"));
  });
});

describe("Immutability / no side effects", () => {
  it("buildPostMetadata does not mutate input post", () => {
    const post = samplePost({ tags: ["original"] });
    const originalTags = [...post.tags];
    buildPostMetadata(post);
    assert.deepEqual(post.tags, originalTags);
  });

  it("buildPostJsonLd does not mutate input post", () => {
    const post = samplePost({ tags: ["original"] });
    const originalTags = [...post.tags];
    buildPostJsonLd(post);
    assert.deepEqual(post.tags, originalTags);
  });
});

describe("Edge cases", () => {
  it("handles empty tags array", () => {
    const post = samplePost({ tags: [] });
    const meta = buildPostMetadata(post);
    const jsonLd = JSON.parse(buildPostJsonLd(post));
    assert.deepEqual(meta.keywords, []);
    assert.equal(jsonLd.keywords, "");
  });

  it("handles special characters in title/description", () => {
    const post = samplePost({
      title: 'Title with "quotes" & <brackets>',
      description: "Desc with 'apostrophes' & ampersands",
    });
    const meta = buildPostMetadata(post);
    const jsonLd = JSON.parse(buildPostJsonLd(post));
    assert.equal(meta.openGraph?.title, 'Title with "quotes" & <brackets>');
    assert.equal(jsonLd.headline, 'Title with "quotes" & <brackets>');
  });

  it("handles unicode in title/description", () => {
    const post = samplePost({
      title: "Testing Unicode: 日本語 中文 🚀",
      description: "Description with émojis 🎉 and accents",
    });
    const meta = buildPostMetadata(post);
    const jsonLd = JSON.parse(buildPostJsonLd(post));
    assert.equal(meta.openGraph?.title, "Testing Unicode: 日本語 中文 🚀");
    assert.equal(jsonLd.headline, "Testing Unicode: 日本語 中文 🚀");
  });
});