import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";
import { safeNext, SITE_COOKIE, verifySiteToken } from "@/lib/site-gate";

/**
 * Two gates, outermost first.
 *
 * 1. A site-wide password (`SITE_PASSWORD`) in front of every page and browser
 *    API route, so the preview can be shared by link without being public.
 * 2. The pre-existing staff gate on /admin, which still needs its own password
 *    once you are through the first one.
 *
 * Next.js 16 renamed `middleware.ts` to `proxy.ts` and allows exactly one such
 * file per project, so both gates live here.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Provider callbacks carry no cookie; they authenticate with their own
  // shared secret (see VOICE_WEBHOOK_SECRET) and must stay reachable.
  if (pathname.startsWith("/api/webhooks/")) {
    return NextResponse.next();
  }

  const unlocked = await verifySiteToken(request.cookies.get(SITE_COOKIE)?.value);

  if (pathname === "/login") {
    if (!unlocked) return NextResponse.next();
    const back = safeNext(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(new URL(back, request.url));
  }

  if (!unlocked) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const gate = new URL("/login", request.url);
    if (pathname !== "/") gate.searchParams.set("next", pathname + search);
    return NextResponse.redirect(gate);
  }

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  const authorized = await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value);

  if (pathname === "/admin/login") {
    if (authorized) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!authorized) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/admin/login", request.url);
    if (pathname !== "/admin") login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next's own build output and static files in /public.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
