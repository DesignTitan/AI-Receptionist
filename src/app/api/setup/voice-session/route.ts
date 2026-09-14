import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/setup/voice-session — a browser voice conversation with the
 * setup-interview agent. Local development only, same guards as the marketing
 * practice demo: loopback host, same-origin, an attempt limit, and never a
 * fake session. Known answers travel as custom_variables so Bubs doesn't ask
 * for them again.
 */
const headers = { "Cache-Control": "no-store" };
const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
let attempts: number[] = [];

const Body = z.object({ known: z.string().max(600).default("nothing yet"), missing: z.string().max(400).default("") });

function host(request: Request) { return (request.headers.get("host") ?? new URL(request.url).host).split(":")[0]?.toLowerCase() ?? ""; }
function ready(request: Request) {
  return process.env.NODE_ENV === "development" && localHosts.has(host(request))
    && Boolean(process.env.OMNIDIMENSION_API_KEY) && /^[1-9]\d*$/.test(process.env.OMNIDIMENSION_SETUP_AGENT_ID ?? "");
}

export async function GET(request: Request) { return NextResponse.json({ available: ready(request) }, { headers }); }

export async function POST(request: Request) {
  const url = new URL(request.url);
  const expectedOrigin = `${url.protocol}//${request.headers.get("host") ?? url.host}`;
  if (request.headers.get("origin") !== expectedOrigin) return NextResponse.json({ error: "Start the conversation from this page." }, { status: 403, headers });
  if (!ready(request)) return NextResponse.json({ error: "Voice setup isn’t connected in this build." }, { status: 503, headers });
  let body: z.infer<typeof Body>;
  try { body = Body.parse(await request.json().catch(() => ({}))); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400, headers }); }
  const now = Date.now();
  attempts = attempts.filter(t => now - t < 3_600_000);
  if (attempts.length >= 10) return NextResponse.json({ error: "Voice setup has hit its hourly limit. Try again later, or type." }, { status: 429, headers });
  attempts.push(now);
  try {
    const r = await fetch("https://backend.omnidim.io/api/v1/sessions/create", {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(12_000),
      headers: { Authorization: `Bearer ${process.env.OMNIDIMENSION_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: Number(process.env.OMNIDIMENSION_SETUP_AGENT_ID), type: "voice", custom_variables: { known: body.known || "nothing yet", missing: body.missing || "nothing" }, metadata: { source: "setup_v2_local" } }),
    });
    const data = await r.json().catch(() => ({})) as { ws_url?: string; error?: string };
    if (!r.ok) {
      if (r.status === 402 || data.error === "insufficient_balance") { attempts.pop(); return NextResponse.json({ error: "The OmniDimension account is out of credits. Top up Billing, then try again." }, { status: 503, headers }); }
      if (r.status === 401 || r.status === 403) return NextResponse.json({ error: "The voice connection couldn’t be authorized." }, { status: 502, headers });
      return NextResponse.json({ error: "Voice couldn’t connect. Try again, or type." }, { status: 502, headers });
    }
    const ws = new URL(data.ws_url ?? "");
    if (ws.protocol !== "wss:" || ws.hostname !== "live.omnidim.io") return NextResponse.json({ error: "Voice couldn’t connect. Try again, or type." }, { status: 502, headers });
    return NextResponse.json({ wsUrl: data.ws_url }, { headers });
  } catch {
    return NextResponse.json({ error: "Voice couldn’t connect. Try again, or type." }, { status: 502, headers });
  }
}
