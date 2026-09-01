import { env } from "./env";

/**
 * Minimal signed-cookie session for the admin dashboard.
 *
 * A single shared password gates /admin; the resulting cookie is an
 * HMAC-SHA256 over its own expiry, so it cannot be forged without the secret
 * and expires on its own. Built on Web Crypto so the same code runs in
 * middleware (edge) and in route handlers (node).
 */

export const ADMIN_COOKIE = "ai_receptionist_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

const encoder = new TextEncoder();

async function key() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(env.adminSessionSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(payload: string) {
  const signature = await crypto.subtle.sign("HMAC", await key(), encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(): Promise<string> {
  const expires = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = String(expires);
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;

  const expected = await sign(payload);
  if (expected.length !== signature.length) return false;
  // Constant-time comparison.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export function checkPassword(candidate: string): boolean {
  const expected = env.adminPassword;
  if (candidate.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ candidate.charCodeAt(i);
  }
  return diff === 0;
}

/** True when the admin password is still the built-in demo default. */
export const usingDefaultPassword = () => !process.env.ADMIN_PASSWORD;
