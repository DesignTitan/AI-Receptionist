import { NextResponse } from "next/server";

/**
 * The coming-soon waitlist. Subscribes a person to the Klaviyo list named by
 * KLAVIYO_LIST_ID using KLAVIYO_PRIVATE_API_KEY, marking them as a founding-rate
 * signup. Email or mobile is required; SMS marketing consent is recorded only
 * when the box was ticked. Nothing is stored anywhere else.
 */
export const runtime = "nodejs";

const KLAVIYO = "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs";
const KLAVIYO_IMPORT = "https://a.klaviyo.com/api/profile-import";
const REVISION = "2024-10-15";
const attempts = new Map<string, number[]>();

function e164(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const host = request.headers.get("host") ?? "";
  if (!origin.endsWith(`//${host}`)) return NextResponse.json({ error: "Please sign up from the website." }, { status: 403 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter(t => now - t < 3_600_000);
  if (recent.length >= 5) return NextResponse.json({ error: "Too many tries from this connection. Try again in an hour." }, { status: 429 });
  attempts.set(ip, [...recent, now]);

  let body: Record<string, string> = {};
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }
  if (body.company_website) return NextResponse.json({ ok: true }); // honeypot: pretend it worked

  const email = (body.email ?? "").trim().toLowerCase();
  const phone = (body.phone ?? "").trim() ? e164(body.phone) : null;
  const business = (body.business ?? "").trim().slice(0, 80);
  const smsConsent = body.sms_consent === "yes";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ error: "That email doesn't look right." }, { status: 422 });
  if ((body.phone ?? "").trim() && !phone) return NextResponse.json({ error: "Use a US or Canadian mobile number." }, { status: 422 });
  if (!email && !phone) return NextResponse.json({ error: "Leave an email or a mobile number so we can reach you." }, { status: 422 });

  const key = process.env.KLAVIYO_PRIVATE_API_KEY;
  const list = process.env.KLAVIYO_LIST_ID;
  if (!key || !list) {
    console.error("waitlist: KLAVIYO_PRIVATE_API_KEY or KLAVIYO_LIST_ID is not set; signup not saved", { email: !!email, phone: !!phone });
    return NextResponse.json({ error: "Sign-ups aren't switched on yet. Try again a little later." }, { status: 503 });
  }

  const subscriptions: Record<string, unknown> = {};
  if (email) subscriptions.email = { marketing: { consent: "SUBSCRIBED" } };
  if (phone && smsConsent) subscriptions.sms = { marketing: { consent: "SUBSCRIBED" } };
  const identity = { ...(email ? { email } : {}), ...(phone ? { phone_number: phone } : {}) };
  const headers = { Authorization: `Klaviyo-API-Key ${key}`, revision: REVISION, "Content-Type": "application/vnd.api+json", Accept: "application/vnd.api+json" };

  // 1. Upsert the profile with the founding-rate properties (the subscribe job below rejects `properties`).
  const imported = await fetch(KLAVIYO_IMPORT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: {
        type: "profile",
        attributes: {
          ...identity,
          properties: { founding_rate: true, source: "coming-soon", ...(business ? { business } : {}), signed_up_at: new Date().toISOString() },
        },
      },
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  if (!imported || !imported.ok) {
    const detail = imported ? await imported.text().catch(() => "") : "no response";
    console.error("waitlist: Klaviyo profile import failed (continuing to subscribe)", imported?.status, detail.slice(0, 300));
  }

  // 2. Subscribe the profile to the founding-rate list with explicit consent.
  const r = await fetch(KLAVIYO, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: { custom_source: "bubs.ai coming soon", historical_import: false, profiles: { data: [{ type: "profile", attributes: { ...identity, subscriptions } }] } },
        relationships: { list: { data: { type: "list", id: list } } },
      },
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (!r || !r.ok) {
    const detail = r ? await r.text().catch(() => "") : "no response";
    console.error("waitlist: Klaviyo rejected the signup", r?.status, detail.slice(0, 300));
    return NextResponse.json({ error: "That didn't go through. Try again in a moment." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
