import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // Minimal CSP: allow YouTube thumbnails/embeds, keep Clerk + Vercel Analytics functional.
            // Review asked: frame-src https://www.youtube.com; img-src https://img.youtube.com
            value: [
              "default-src 'self'",
              "img-src 'self' data: blob: https://img.youtube.com https:",
              "frame-src https://www.youtube.com",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https:",
              "worker-src 'self' blob:",
              "connect-src 'self' https: https://vitals.vercel-insights.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https:",
              "font-src 'self' data: https:",
            ].join("; "),
          },
          // ---- Gap report §4.2: five of six security headers were absent ----
          //
          // Unrelated to dependency versions, and verified served rather than
          // assumed: `next start` + curl against / and /blog/feed.xml returns
          // all five.
          //
          // None of these can break the app, which is why they were safe to add
          // without the browser verification that §4.1 (script-src hardening)
          // still requires. Two were checked rather than assumed:
          //
          //   frame-ancestors 'none' — the only <iframe>s this app renders are
          //   its own sandboxed lesson previews (BrowserPreview.tsx:34,
          //   LessonClient.tsx:305), which frame `srcDoc` content rather than
          //   this origin. frame-ancestors restricts who may frame *us*, so it
          //   does not touch them. Nothing external embeds lynxdev.io.
          //
          //   Strict-Transport-Security — ignored by browsers over http, so
          //   `npm run dev` is unaffected. 2 years + includeSubDomains, but no
          //   `preload`: submitting to the browser preload list is a one-way
          //   door and is not this commit's business.

          // Clickjacking. Paired with frame-ancestors for browsers that
          // predate it.
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Stops a browser guessing a response's type and executing it.
          // Matters because /blog/feed.xml and /sitemap.xml are served from
          // the same origin as HTML.
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Do not leak full URLs — which contain slugs and ids — to YouTube,
          // Clerk, Mistral or Vercel. The default, strict-origin-when-cross-
          // origin, still sends the origin.
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          // pluginTypes is required for the directive to be valid. An empty
          // list means no <embed>/<object>/<applet>, none of which are used.
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
