import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

/**
 * Routes reachable without a session.
 *
 * `/blog(.*)` is public: an engineering blog is content meant to be indexed and
 * shared, so gating it behind auth would defeat the point — and the pages call
 * no `auth()` of their own, so there is no per-user data to protect. The layout
 * still renders `Header`, which reads Clerk client state and shows either the
 * sign-in prompt or the dashboard link depending on the visitor.
 *
 * `/robots.txt` and `/sitemap.xml` were previously *not* listed here, so
 * `auth.protect()` 307'd crawlers to the sign-in page instead of serving them
 * the file. An unreadable sitemap removes the whole site from the discovery
 * path this blog depends on, so both are public by necessity.
 */
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/",
  "/whats-new",
  "/blog(.*)",
  "/robots.txt",
  "/sitemap.xml",
  "/api/health(.*)",
]);

export default async function middleware(
  req: NextRequest,
  event: NextFetchEvent,
) {
  const start = performance.now();
  let userId: string | null = null;

  const res = await clerkMiddleware(async (auth, r) => {
    const authObject = await auth();
    userId = authObject.userId ?? null;

    const { pathname } = r.nextUrl;

    // OAuth-only signup: first Google/GitHub tap creates the account, so the
    // sign-up page is redundant. Any lingering /sign-up links land here.
    if (pathname.startsWith("/sign-up")) {
      return NextResponse.redirect(new URL("/sign-in", r.url));
    }

    const isPublic = isPublicRoute(r);

    if (isPublic) {
      return;
    }

    await auth.protect();
  })(req, event);

  const ms = performance.now() - start;
  const status = res?.status ?? 200;
  console.info(
    `[http] ${req.method} ${req.nextUrl.pathname} ${status} ${ms.toFixed(0)}ms${userId ? ` user=${userId}` : ""}`,
  );

  return res ?? NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
