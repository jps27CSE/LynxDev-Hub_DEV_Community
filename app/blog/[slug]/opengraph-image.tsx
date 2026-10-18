import { ImageResponse } from "next/og";
import { getPost, getSortedPosts } from "@/config/blog";

export const alt = "LynxDEV Engineering Blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The five post slugs are known at build time, so prerender them. Without this
 * the route stays `ƒ` and satori re-renders on every origin hit — measured at
 * 560-870ms of pure CPU per request, which is ~24,000 renders to exhaust the
 * whole 4 CPU-hour Vercel Hobby budget. Unauthenticated, un-rate-limited.
 */
export function generateStaticParams() {
  return getSortedPosts().map((post) => ({ slug: post.slug }));
}

/**
 * Per-post Open Graph card.
 *
 * A static site-wide OG image would have been far less code, but a shared image
 * for every post gives a reader no way to tell two links apart in a feed —
 * which is most of the value of an OG card. This renders the actual title, so
 * the card is useful pre-click.
 *
 * Satori (the renderer behind `next/og`) supports a subset of flexbox with no
 * default gap and no `text-overflow`. Every child below therefore sets its own
 * gap via margins or `gap`, and any potentially long string is line-clamped
 * explicitly rather than relying on overflow behaviour Satori does not have.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05060a",
          color: "#f4f4f5",
          fontSize: 48,
        }}
      >
        LynxDEV Engineering
      </div>,
      size,
    );
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#05060a",
        padding: "72px 80px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -180,
          left: -140,
          width: 620,
          height: 620,
          borderRadius: 9999,
          background: "rgba(34,211,238,0.16)",
          filter: "blur(90px)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -160,
          width: 620,
          height: 620,
          borderRadius: 9999,
          background: "rgba(232,121,249,0.14)",
          filter: "blur(90px)",
          display: "flex",
        }}
      />

      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            padding: "10px 22px",
            borderRadius: 9999,
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#a5f3fc",
            fontSize: 24,
            letterSpacing: "0.04em",
          }}
        >
          lynxdev.io/blog
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: post.title.length > 62 ? 54 : 64,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            color: "#fafafa",
            maxHeight: 210,
            overflow: "hidden",
          }}
        >
          {post.title}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 25,
            color: "#a1a1aa",
            maxHeight: 70,
            overflow: "hidden",
            lineHeight: 1.4,
          }}
        >
          {post.description}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.14)",
          paddingTop: 26,
        }}
      >
        <div style={{ display: "flex", fontSize: 23, color: "#71717a" }}>
          {post.author}
        </div>
        <div style={{ display: "flex", fontSize: 23, color: "#71717a" }}>
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          })}
        </div>
      </div>
    </div>,
    size,
  );
}
