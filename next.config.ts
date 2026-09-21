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
        ],
      },
    ];
  },
};

export default nextConfig;
