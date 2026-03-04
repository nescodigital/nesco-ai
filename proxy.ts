import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApi = pathname.startsWith("/api");
  const isStatic = /\.(svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$/.test(pathname);
  const isNext = pathname.startsWith("/_next");

  if (!isApi && !isStatic && !isNext) {
    const intlResponse = intlMiddleware(request);
    // For redirects (3xx), return immediately — intl is changing the URL
    if (intlResponse && intlResponse.status >= 300 && intlResponse.status < 400) {
      return intlResponse;
    }
    // For rewrites (200 with x-middleware-rewrite header), we need to run
    // updateSession too so auth cookies are refreshed, but start from intlResponse
    if (intlResponse && intlResponse.headers.get("x-middleware-rewrite")) {
      await updateSession(request);
      return intlResponse;
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
