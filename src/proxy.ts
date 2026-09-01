import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Gate for everything under /admin.
 *
 * Runs before the request reaches a page or route handler: unauthenticated
 * browsers are redirected to the sign-in screen, and unauthenticated API calls
 * get a 401 rather than an HTML redirect.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
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
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
