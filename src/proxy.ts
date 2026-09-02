import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";
import { env } from "@/lib/env";
import { safeNext, SITE_COOKIE, verifySiteToken } from "@/lib/site-gate";
import { TENANT_SLUG } from "@/verticals/slugs";

/**
 * Two gates, outermost first.
 *
 * 1. The site gate, only when SITE_GATE=locked: SITE_PASSWORD in front of
 *    every page and browser-facing API route, so the whole site can be taken
 *    private again with one variable. In the default "public" mode the
 *    product site and the demos are open and /login is dead.
 * 2. The staff gate on /admin and /api/admin, always.
 *
 * Between them, single-tenant routing when NEXT_PUBLIC_TENANT is set: the
 * customer's business answers at `/`, `/book/*` and `/confirmation/*`; the
 * product site, the other demos and their APIs 404; the `/demo/<tenant>`
 * form redirects to its root equivalent so there is one canonical URL.
 *
 * Provider callbacks under /api/webhooks carry no cookie and authenticate with
 * their own shared secret, so they bypass both gates.
 *
 * Next.js 16 renamed `middleware.ts` to `proxy.ts` and allows exactly one such
 * file per project, so both gates live here.
 */
const ALWAYS_OPEN = ["/api/webhooks/"];
const STAFF_ONLY = ["/admin", "/api/admin"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (ALWAYS_OPEN.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (env.siteGate === "locked") {
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
  } else if (pathname === "/login") {
    // Gate is off: nothing to unlock.
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (TENANT_SLUG) {
    const routed = tenantRoute(TENANT_SLUG, pathname, search, request.url);
    if (routed) return routed;
  }

  if (!STAFF_ONLY.some((prefix) => pathname.startsWith(prefix))) {
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

function tenantRoute(tenant: string, pathname: string, search: string, base: string) {
  const prefix = `/demo/${tenant}`;
  const at = (path: string) => new URL(path + search, base);

  if (pathname === "/") return NextResponse.rewrite(at(prefix));
  if (pathname.startsWith("/book/") || pathname.startsWith("/confirmation/")) {
    return NextResponse.rewrite(at(prefix + pathname));
  }
  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
    return NextResponse.redirect(at(pathname.slice(prefix.length) || "/"));
  }
  const foreign =
    pathname === "/demos" ||
    pathname.startsWith("/demo/") ||
    (pathname.startsWith("/api/demo/") && !pathname.startsWith(`/api/demo/${tenant}/`));
  // A route that doesn't exist renders the app's own 404 page with a 404 status.
  if (foreign) return NextResponse.rewrite(new URL("/__not-found", base));
  return null;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
