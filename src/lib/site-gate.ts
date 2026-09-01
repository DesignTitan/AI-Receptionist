import { constantTimeEquals, createToken, verifyToken } from "./auth";
import { env } from "./env";

/**
 * Site-wide password gate.
 *
 * Everything the browser can reach sits behind a single shared password
 * (`SITE_PASSWORD`) so the demo can be shared with a link without being open
 * to the world. It is deliberately separate from the staff session in
 * `./auth`: unlocking the site does not grant access to `/admin`.
 *
 * The password doubles as the signing secret, so rotating it invalidates every
 * outstanding cookie.
 */

export const SITE_COOKIE = "ai_receptionist_site";
export const SITE_TTL_SECONDS = 60 * 60 * 24 * 7;

export const checkSitePassword = (candidate: string) =>
  constantTimeEquals(candidate, env.sitePassword);

export const createSiteToken = () => createToken(env.sitePassword, SITE_TTL_SECONDS);

export const verifySiteToken = (token: string | undefined) =>
  verifyToken(token, env.sitePassword);

/**
 * Keeps `?next=` pointed at this site: a single leading slash, never a
 * protocol-relative `//evil.com` or a path back into the gate itself.
 */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  if (next === "/login" || next.startsWith("/login?")) return "/";
  return next;
}
