import { env } from "./env";

/**
 * Minimal signed-cookie sessions.
 *
 * A shared password gates a surface; the resulting cookie is an HMAC-SHA256
 * over its own expiry, so it cannot be forged without the secret and expires
 * on its own. Built on Web Crypto so the same code runs in the proxy (edge)
 * and in route handlers (node).
 *
 * Two surfaces use this: the staff dashboard (`/admin`, below) and the
 * site-wide password gate (see `./site-gate`).
 */

export const ADMIN_COOKIE = "ai_receptionist_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

const encoder = new TextEncoder();

async function key(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(payload: string, secret: string) {
  const signature = await crypto.subtle.sign("HMAC", await key(secret), encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Compares two strings without leaking their contents through timing. */
export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Mints an `<expiry>.<hmac>` token that stands on its own. */
export async function createToken(secret: string, ttlSeconds: number): Promise<string> {
  const payload = String(Date.now() + ttlSeconds * 1000);
  return `${payload}.${await sign(payload, secret)}`;
}

/** True when the token is well-formed, unexpired and signed with `secret`. */
export async function verifyToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  return constantTimeEquals(await sign(payload, secret), signature);
}

export const createSessionToken = () =>
  createToken(env.adminSessionSecret, SESSION_TTL_SECONDS);

export const verifySessionToken = (token: string | undefined) =>
  verifyToken(token, env.adminSessionSecret);

export function checkPassword(candidate: string): boolean {
  return constantTimeEquals(candidate, env.adminPassword);
}

/** True when the admin password is still the built-in demo default. */
export const usingDefaultPassword = () => !process.env.ADMIN_PASSWORD;
