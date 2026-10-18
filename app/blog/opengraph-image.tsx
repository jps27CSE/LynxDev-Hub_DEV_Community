import { ImageResponse } from "next/og";
import { getSortedPosts } from "@/config/blog";

export const alt = "LynxDEV Engineering Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Site-level OG card for the blog index. */
export default async function OpengraphImage() {
  const count = getSortedPosts().length;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#05060a",
        padding: "80px 88px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -160,
          width: 660,
          height: 660,
          borderRadius: 9999,
          background: "rgba(34,211,238,0.16)",
          filter: "blur(100px)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -220,
          right: -160,
          width: 660,
          height: 660,
          borderRadius: 9999,
          background: "rgba(232,121,249,0.14)",
          filter: "blur(100px)",
          display: "flex",
        }}
      />

      <div
        style={{
          display: "flex",
          padding: "10px 22px",
          borderRadius: 9999,
          border: "1px solid rgba(255,255,255,0.18)",
          color: "#a5f3fc",
          fontSize: 24,
          marginBottom: 40,
        }}
      >
        lynxdev.io/blog
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 82,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          color: "#fafafa",
        }}
      >
        Engineering Blog
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 26,
          fontSize: 29,
          color: "#a1a1aa",
          lineHeight: 1.45,
          maxHeight: 130,
          overflow: "hidden",
        }}
      >
        Architecture, caching, security and performance — the decisions and the
        bugs behind LynxDEV.
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 44,
          paddingTop: 26,
          borderTop: "1px solid rgba(255,255,255,0.14)",
          fontSize: 24,
          color: "#71717a",
        }}
      >
        {count} posts · LynxDEV Engineering
      </div>
    </div>,
    size,
  );
}
