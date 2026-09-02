import { env } from "./env";

/**
 * Server-side verification of a Cloudflare Turnstile token. The widget on the
 * page only produces a token; nothing counts until this endpoint says so.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export async function verifyHuman(token: string | undefined, ip: string): Promise<{ ok: boolean; reason: string | null }> {
  const secret = env.turnstile.secretKey;
  if (!secret) return { ok: false, reason: "human check not configured" };
  if (!token || token.length > 2048) return { ok: false, reason: "missing token" };
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip === "local" ? undefined : ip }),
    });
    const json = (await response.json()) as { success?: boolean; "error-codes"?: string[] };
    return json.success ? { ok: true, reason: null } : { ok: false, reason: (json["error-codes"] ?? []).join(",") || "rejected" };
  } catch (error) {
    return { ok: false, reason: `verify failed: ${(error as Error).message}` };
  }
}
