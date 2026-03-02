import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — do not remove this line
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Dev bypass: http://localhost:3000/dev-login sets cookie and redirects to dashboard
  if (request.nextUrl.pathname === "/dev-login" && process.env.NODE_ENV === "development") {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.set("dev_bypass", "1", { httpOnly: true, path: "/" });
    return response;
  }

  const devBypass = process.env.NODE_ENV === "development" && request.cookies.get("dev_bypass")?.value === "1";

  // Protect /dashboard/* and /onboarding — redirect to login if not authenticated
  const protectedPaths = ["/dashboard", "/onboarding"];
  if (!user && !devBypass && protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from /login
  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
