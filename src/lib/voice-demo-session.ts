import { createHmac, timingSafeEqual } from "node:crypto";

// Private tester sessions; never enable anonymous production voice.
const headers = { "Cache-Control": "no-store" };
const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
let attempts: number[] = [];

/** Test-only reset for module-level rate-limit state. */
export function __resetVoiceDemoStateForTests() {
  attempts = [];
}

function requestHost(request: Request) {
  const host = request.headers.get("host") ?? new URL(request.url).host;
  return host.split(":")[0]?.toLowerCase() ?? "";
}

function envReady() {
  return Boolean(process.env.OMNIDIMENSION_DEMO_API_KEY || process.env.OMNIDIMENSION_API_KEY)
    && /^[1-9]\d*$/.test(process.env.OMNIDIMENSION_DEMO_AGENT_ID ?? "")
    && process.env.OMNIDIMENSION_DEMO_AGENT_ID !== process.env.OMNIDIMENSION_AGENT_ID;
}

function testerAccess(request: Request) {
  if (process.env.VOICE_DEMO_ENABLED !== "true" || process.env.SITE_GATE !== "locked" || !process.env.SITE_PASSWORD) return false;
  const token = request.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith("ai_receptionist_site="))?.slice("ai_receptionist_site=".length);
  const [expiry, signature, extra] = (token ?? "").split(".");
  if (extra || !expiry || !signature || !/^[a-f0-9]{64}$/.test(signature) || !Number.isFinite(Number(expiry)) || Number(expiry) < Date.now()) return false;
  const expected = createHmac("sha256", process.env.SITE_PASSWORD).update(expiry).digest("hex");
  return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
function ready(request: Request) {
  const local = process.env.NODE_ENV === "development" && localHosts.has(requestHost(request));
  return envReady() && (local || (testerAccess(request) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)));
}

async function reserveTesterSession(request: Request): Promise<boolean> {
  const token = request.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith("ai_receptionist_site=")) ?? "";
  const visitor = createHmac("sha256", process.env.SITE_PASSWORD!).update(token).digest("hex");
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/reserve_voice_demo`, {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(5000),
    headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_visitor: visitor }),
  });
  if (!response.ok) throw new Error("Voice limit storage unavailable");
  return await response.json() === true;
}

function providerFailureMessage(status: number, body: { error?: string }) {
  if (status === 402 || body.error === "insufficient_balance") {
    return "The OmniDimension account is out of credits. Add a plan or top up Billing, then try again.";
  }
  if (status === 401 || status === 403) {
    return "Live practice is temporarily unavailable. The voice connection could not be authorized.";
  }
  return "The live demo couldn’t connect. Please try again.";
}

export async function GET(request: Request) {
  return Response.json({ available: ready(request) }, { headers });
}
export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  // Next may normalize request.url to localhost; Host retains the browser address.
  const expectedOrigin = `${requestUrl.protocol}//${request.headers.get("host") ?? requestUrl.host}`;
  if (request.headers.get("origin") !== expectedOrigin) {
    return Response.json({ error: "Please start the demo from this website." }, { status: 403, headers });
  }
  if (!ready(request)) return Response.json({ error: "Live conversation is being connected. Please try again once the live connection is available." }, { status: 503, headers });
  if (process.env.NODE_ENV !== "development") {
    try {
      if (!await reserveTesterSession(request)) return Response.json({ error: "The testing limit has been reached. Please try later: each tester gets 5 starts per hour, with 100 starts shared per day." }, { status: 429, headers });
    } catch {
      return Response.json({ error: "The voice connection is temporarily unavailable. Please try again shortly." }, { status: 503, headers });
    }
  }
  const now = Date.now();
  attempts = attempts.filter(t => now - t < 3_600_000);
  if (process.env.NODE_ENV === "development" && attempts.length >= 5) return Response.json({ error: "The practice limit has been reached. Please try again in an hour." }, { status: 429, headers });
  attempts.push(now);
  try {
    const response = await fetch("https://backend.omnidim.io/api/v1/sessions/create", {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(12_000),
      headers: { Authorization: `Bearer ${process.env.OMNIDIMENSION_DEMO_API_KEY || process.env.OMNIDIMENSION_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: Number(process.env.OMNIDIMENSION_DEMO_AGENT_ID), type: "voice", metadata: { source: process.env.NODE_ENV === "development" ? "local_marketing_practice" : "private_tester_practice" } }),
    });
    const body = await response.json().catch(() => ({})) as { ws_url?: string; error?: string };
    if (!response.ok) {
      if (response.status === 402 || body.error === "insufficient_balance") attempts.pop();
      const message = providerFailureMessage(response.status, body);
      const status = response.status === 402 || body.error === "insufficient_balance" ? 503 : 502;
      return Response.json({ error: message }, { status, headers });
    }
    const url = new URL(body.ws_url!);
    if (url.protocol !== "wss:" || url.hostname !== "live.omnidim.io") {
      return Response.json({ error: "The live demo couldn’t connect. Please try again." }, { status: 502, headers });
    }
    return Response.json({ wsUrl: body.ws_url }, { headers });
  } catch {
    return Response.json({ error: "The live demo couldn’t connect. Please try again." }, { status: 502, headers });
  }
}
