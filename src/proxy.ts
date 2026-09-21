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
const BOTID_PREFIX = "/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/";
const PUBLIC_ASSETS = new Set(["/marketing/coastal-owner.png", "/favicon.ico", "/icon.svg"]);
function publicAsset(path: string) {
  return PUBLIC_ASSETS.has(path) || /^\/fonts\/(open-runde|apfel-grotezk)\/[A-Za-z-]+\.woff2$/.test(path) || path.startsWith(BOTID_PREFIX);
}
const STAFF_ONLY = ["/admin", "/api/admin"];

export async function proxy(request: NextRequest) {
  const response = await routeRequest(request);
  const path = request.nextUrl.pathname;
  if (process.env.COMING_SOON === "true" || env.siteGate === "locked") {
    response.headers.set("Cache-Control", "private, no-store");
    if (path !== "/" && path !== "/coming-soon") {
      response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    }
  }
  return response;
}

async function routeRequest(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Only static developer tools use this namespace. Actual app routes still
  // pass through the site, customer and staff gates below.
  if (process.env.NODE_ENV === "development" && pathname.startsWith("/__dev/")) {
    return NextResponse.next();
  }

  if (pathname === "/api/jobs" || pathname === "/api/waitlist" || ALWAYS_OPEN.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const comingSoon = process.env.COMING_SOON === "true";
  const unlocked = (comingSoon || env.siteGate === "locked") ? await verifySiteToken(request.cookies.get(SITE_COOKIE)?.value) : true;

  // The holding site. With COMING_SOON=true "/" is the hero alone for everyone, unlocked or
  // not, and other pages require the private preview password. The
  // owner, once through the password gate, can still open the other pages, and the full
  // homepage is at /home, so work on the real site can carry on.
  // /home is a real route; never rewrite it back through the public splash.
  if (comingSoon) {
    if (pathname === "/" || pathname === "/coming-soon") {
      return pathname === "/" ? NextResponse.rewrite(new URL("/coming-soon", request.url)) : NextResponse.next();
    }
    if (!unlocked) {
      if (pathname === "/login") return NextResponse.next();
      if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      // the hero's own photo, fonts, icons and other files must still load
      if (publicAsset(pathname)) return NextResponse.next();
      if (pathname === "/_next/image") {
        const source = request.nextUrl.searchParams.get("url") ?? "";
        if (PUBLIC_ASSETS.has(source)) return NextResponse.next();
        return new NextResponse(null, { status: 401 });
      }
      const gate = new URL("/login", request.url);
      gate.searchParams.set("next", pathname + search);
      return NextResponse.redirect(gate);
    }
  }

  if (env.siteGate === "locked") {

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

  const rootDomain = process.env.CUSTOMER_ROOT_DOMAIN?.toLowerCase();
  const host = request.nextUrl.hostname.toLowerCase();
  if (rootDomain && host !== rootDomain && host.endsWith(`.${rootDomain}`)) {
    const slug = host.slice(0, -(rootDomain.length + 1));
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.rewrite(new URL("/__not-found", request.url));
    if (pathname === "/" || pathname.startsWith("/confirmation/")) {
      return NextResponse.rewrite(new URL(`/b/${slug}${pathname === "/" ? "" : pathname}${search}`, request.url));
    }
    if (pathname === `/b/${slug}` || pathname.startsWith(`/b/${slug}/`)) {
      return NextResponse.redirect(new URL((pathname.slice(`/b/${slug}`.length) || "/") + search, request.url));
    }
    if (!pathname.startsWith(`/api/bookings/${slug}`) && !pathname.startsWith("/_next/") && !pathname.startsWith("/icon")) {
      return NextResponse.rewrite(new URL("/__not-found", request.url));
    }
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
  matcher: ["/((?!_next/static|favicon.ico|robots.txt).*)"],
};
