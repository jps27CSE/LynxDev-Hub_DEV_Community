import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/",
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
