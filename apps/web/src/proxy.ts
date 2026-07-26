import { clerkMiddleware } from "@clerk/nextjs/server";

// Next.js 16 renamed `middleware` → `proxy`. Clerk's clerkMiddleware runs here
// to attach auth context to every request. The matcher skips static assets,
// always runs for API/tRPC, and includes Clerk's auto-proxy path.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
