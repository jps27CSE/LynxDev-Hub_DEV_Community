import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { getRateLimitConfig } from "@/config/rate-limits";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { rateLimited } from "@/lib/api-error";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (pathname.startsWith("/api/")) {
    const { userId } = await auth();
    const config = getRateLimitConfig(pathname, req.method);
    const key = getRateLimitKey(req, userId);
    const result = checkRateLimit(key, config.limit, config.windowMs);

    if (!result.success) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
      return rateLimited(retryAfter, config.limit, result.remaining, result.reset);
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
