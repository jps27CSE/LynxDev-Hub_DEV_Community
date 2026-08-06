import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/",
  "/api/health(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // OAuth-only signup: first Google/GitHub tap creates the account, so the
  // sign-up page is redundant. Any lingering /sign-up links land here.
  if (pathname.startsWith("/sign-up")) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const isPublic = isPublicRoute(req);

  if (isPublic) {
    await auth();
  } else {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
