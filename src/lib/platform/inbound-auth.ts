import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const MAX_INBOUND_SECONDS = 300;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validId(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}
export function gatewaySecretMatches(supplied: string, expectedHash: string) {
  if (!/^[0-9a-f]{64}$/i.test(expectedHash) || supplied.length < 32 || supplied.length > 512) return false;
  const actual = createHash("sha256").update(supplied).digest();
  return timingSafeEqual(actual, Buffer.from(expectedHash, "hex"));
}
export function bearer(request: Request) {
  const match = /^Bearer ([^\s]+)$/i.exec(request.headers.get("authorization") ?? "");
  return match?.[1] ?? "";
}
export type InboundSession = { customerId: string; callId: string; expires: number };
function signingKey(secret: string) {
  if (secret.length < 32) throw Error("Incoming-call sessions are not configured.");
  return secret;
}
/** Only the trusted phone adapter receives this token. Never let the model choose a customer or call ID. */
export function signInboundSession(session: InboundSession, secret: string) {
  if (!validId(session.customerId) || !validId(session.callId) || !Number.isSafeInteger(session.expires)) throw Error("Invalid call session.");
  const body = Buffer.from(JSON.stringify({ ...session, audience: "inbound-booking-v1" })).toString("base64url");
  return `${body}.${createHmac("sha256", signingKey(secret)).update(body).digest("base64url")}`;
}
export function verifyInboundSession(token: string, secret: string, now = Date.now()): InboundSession | null {
  if (secret.length < 32 || token.length > 1500) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts.every(p => /^[A-Za-z0-9_-]+$/.test(p))) return null;
  const [body, signature] = parts;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const session = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (session.audience !== "inbound-booking-v1" || !validId(session.customerId) || !validId(session.callId) || !Number.isSafeInteger(session.expires) || session.expires <= now || session.expires > now + (MAX_INBOUND_SECONDS + 60) * 1000) return null;
    return { customerId: session.customerId, callId: session.callId, expires: session.expires };
  } catch { return null; }
}

/** Stream-limited parsing prevents untrusted callers allocating a large JSON body. */
export async function inboundJson(request: Request, limit = 100_000): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw Error("Send JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw Error("Missing request body.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); throw Error("Request is too large."); }
    chunks.push(value);
  }
  const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("Send a JSON object.");
  return value;
}
