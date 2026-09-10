// Local acceptance only. Public activation requires durable abuse/budget controls.
const headers = { "Cache-Control": "no-store" };
const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
let attempts: number[] = [];
function ready(request: Request) {
  return process.env.NODE_ENV === "development" && localHosts.has(new URL(request.url).hostname)
    && Boolean(process.env.OMNIDIMENSION_API_KEY)
    && /^[1-9]\d*$/.test(process.env.OMNIDIMENSION_DEMO_AGENT_ID ?? "")
    && process.env.OMNIDIMENSION_DEMO_AGENT_ID !== process.env.OMNIDIMENSION_AGENT_ID;
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
  const now = Date.now();
  attempts = attempts.filter(t => now - t < 3_600_000);
  if (attempts.length >= 5) return Response.json({ error: "The practice limit has been reached. Please try again in an hour." }, { status: 429, headers });
  attempts.push(now);
  try {
    const response = await fetch("https://backend.omnidim.io/api/v1/sessions/create", {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(12_000),
      headers: { Authorization: `Bearer ${process.env.OMNIDIMENSION_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: Number(process.env.OMNIDIMENSION_DEMO_AGENT_ID), type: "voice", metadata: { source: "local_marketing_practice" } }),
    });
    if (!response.ok) throw new Error("Provider unavailable");
    const data = await response.json();
    const url = new URL(data.ws_url);
    if (url.protocol !== "wss:" || url.hostname !== "live.omnidim.io") throw new Error("Unexpected session URL");
    return Response.json({ wsUrl: data.ws_url }, { headers });
  } catch {
    return Response.json({ error: "The live demo couldn’t connect. Please try again." }, { status: 502, headers });
  }
}
