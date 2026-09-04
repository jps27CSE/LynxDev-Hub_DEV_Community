import { createLogger } from "@/lib/logger";

const logger = createLogger("youtube");

// Playlist from user: https://www.youtube.com/playlist?list=PLiGGopVZ-5D3M-sZgSgpAmaJdNKctKnlt
// Channel: UChJ8SYKe-ARmuskwz3-4nPg — CodeInsightsByJack
export const YOUTUBE_PLAYLIST_ID =
  process.env.YOUTUBE_PLAYLIST_ID ||
  process.env.YOUTUBE_CHANNEL_ID || // backward compat
  "PLiGGopVZ-5D3M-sZgSgpAmaJdNKctKnlt";

export const YOUTUBE_RSS_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${YOUTUBE_PLAYLIST_ID}`;

export type YoutubeVideo = {
  title: string;
  videoId: string;
};

// Fallback: last known good list when RSS is unavailable (build time / offline / quota)
export const FALLBACK_VIDEOS: YoutubeVideo[] = [
  { title: "MCP Server Explained: Build Your First Model Context Protocol Server (Bangla)", videoId: "OhrNp2CsSBI" },
  { title: "My AI Agent Workflow: How I Manage Multiple AI Agents as a Developer (Bangla)", videoId: "Go_76y1Q-HU" },
  { title: "How AI Agents Actually Work: Build One from Scratch with LangChain (Bangla)", videoId: "8mpa-4iRrvc" },
  { title: "5ms on Localhost, 5 Seconds in Production? Here's What Went Wrong (Bangla)", videoId: "osfhB8rd55A" },
  { title: "How YouTube's Timeline Preview Actually Works | Backend System Design (Bangla)", videoId: "OKs2670F3V0" },
  { title: "Google OAuth 2.0 Explained | Backend Authentication Flow Step-by-Step (Bangla)", videoId: "sP5pzApI72E" },
  { title: "Why Software Engineering Still Matters in the Age of AI Coding Agents (Bangla)", videoId: "YV3IuiCpHUg" },
  { title: "LangChain Tools Explained: How LLMs Use APIs, Search & Functions (Bangla)", videoId: "h4E2MsQCuu4" },
  { title: "How Real-Time Chat Apps Actually Work | Backend System Design (Bangla)", videoId: "es_wPdEYgVA" },
  { title: "How EA Sports Predicted the FIFA World Cup Winner 5 Times in a Row (Bangla)", videoId: "SWWPIZyGaVw" },
  { title: "LangChain Runnables Explained: Build AI Pipelines the Easy Way (Bangla)", videoId: "JGsTM8UerAM" },
  { title: "How 'Logout from All Devices' Actually Works | Backend System Design", videoId: "tOm35rmGrfg" },
  { title: "OpenCode Tutorial: Build a Project with AI Agents (Complete Beginner Guide)", videoId: "4wVmDzdCH0M" },
  { title: "Build a PDF RAG Chatbot with LangChain in Bangla (Complete Beginner Project)", videoId: "4HFYZWXctak" },
  { title: "LangChain Retrievers Explained: Similarity, MMR & MultiQuery Search", videoId: "lgymF9qoVGE" },
];

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function parseYoutubeRss(xml: string): YoutubeVideo[] {
  const idMatches = [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)];
  const titleMatches = [...xml.matchAll(/<media:title>([^<]+)<\/media:title>/g)];

  const videos: YoutubeVideo[] = [];
  const count = Math.min(idMatches.length, titleMatches.length);

  for (let i = 0; i < count; i++) {
    const videoId = idMatches[i][1]?.trim();
    const rawTitle = titleMatches[i][1]?.trim();
    if (!videoId || !rawTitle) continue;
    videos.push({
      videoId,
      title: decodeHtmlEntities(rawTitle),
    });
  }

  return videos;
}

/**
 * Fetches latest videos from YouTube Playlist RSS (no API key, zero cost).
 * Uses https://www.youtube.com/feeds/videos.xml?playlist_id=PL...
 * Cached via Next.js fetch with ISR — 1 hour revalidation.
 * Falls back to FALLBACK_VIDEOS on any error so homepage never breaks.
 */
export async function getLatestYoutubeVideos(): Promise<YoutubeVideo[]> {
  try {
    const res = await fetch(YOUTUBE_RSS_URL, {
      // ISR: revalidate every hour — ~24 fetches/day, trivial for free tier
      next: { revalidate: 3600 },
      headers: {
        // YouTube RSS sometimes returns 429 without a UA
        "User-Agent": "LynxDEV/1.0 (+https://lynxdev.io)",
      },
    });

    if (!res.ok) {
      logger.warn(
        `youtube playlist RSS fetch failed: ${res.status} ${res.statusText} (playlist ${YOUTUBE_PLAYLIST_ID})`
      );
      return FALLBACK_VIDEOS;
    }

    const xml = await res.text();
    const videos = parseYoutubeRss(xml);

    if (videos.length === 0) {
      logger.warn("youtube playlist RSS parsed 0 videos, using fallback");
      return FALLBACK_VIDEOS;
    }

    return videos;
  } catch (error) {
    logger.error("youtube playlist RSS fetch error, using fallback", error);
    return FALLBACK_VIDEOS;
  }
}
