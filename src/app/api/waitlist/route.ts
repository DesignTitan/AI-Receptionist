import { NextResponse } from "next/server";
import { promises as dns } from "node:dns";
import { checkBotId } from "botid/server";
import { verifyHuman } from "@/lib/turnstile";

/**
 * The coming-soon waitlist. Subscribes a person to the Klaviyo list named by
 * KLAVIYO_LIST_ID using KLAVIYO_PRIVATE_API_KEY, marking them as a founding-rate
 * signup. Email or mobile is required; SMS marketing consent is recorded only
 * when the box was ticked. Nothing is stored anywhere else.
 */
export const runtime = "nodejs";

const KLAVIYO = "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs";
const KLAVIYO_IMPORT = "https://a.klaviyo.com/api/profile-import";
const REVISION = "2026-07-15";
const KLAVIYO_LISTS = "https://a.klaviyo.com/api/lists";
const attempts = new Map<string, number[]>();

/** Throwaway inbox providers. Not exhaustive; the MX check and Turnstile carry the rest. */
const DISPOSABLE = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "sharklasers.com", "10minutemail.com", "10minutemail.net",
  "tempmail.com", "temp-mail.org", "temp-mail.io", "yopmail.com", "yopmail.fr", "dispostable.com", "trashmail.com",
  "getnada.com", "throwawaymail.com", "maildrop.cc", "fakeinbox.com", "mohmal.com", "emailondeck.com", "mailnesia.com",
  "tempr.email", "discard.email", "spamgourmet.com", "mytemp.email", "burnermail.io", "inboxkitten.com", "example.com",
  "example.org", "example.net", "test.com", "email.com",
]);

/** A real North American mobile: NXX NXX XXXX, not a fictional 555 number, not a keyboard mash. */
function e164(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  const area = digits.slice(0, 3), exchange = digits.slice(3, 6);
  if (/^[01]/.test(area) || /^[01]/.test(exchange)) return null; // NANP: area code and exchange start 2-9
  if (area[1] === "1" && area[2] === "1") return null; // N11 service codes are not subscriber numbers
  if (exchange === "555" && digits.slice(6, 8) === "01") return null; // 555-01XX is reserved for fiction
  if (/^(\d)\1{9}$/.test(digits)) return null; // 2222222222
  if (digits.slice(3) === "1234567" || digits.slice(3) === "0000000") return null;
  return `+1${digits}`;
}

/**
 * The domain must accept mail: an MX record, or an A/AAAA record as the RFC fallback. Only a
 * definite "no such domain / no records" answer rejects; a slow or failing resolver lets the
 * signup through rather than turning a DNS hiccup into a lost lead.
 */
async function acceptsMail(domain: string): Promise<boolean> {
  const definiteNo = (e: unknown) => ["ENOTFOUND", "ENODATA", "NXDOMAIN"].includes((e as { code?: string })?.code ?? "");
  const lookup = async (fn: () => Promise<unknown[]>) => {
    try { return (await fn()).length > 0 ? "yes" : "no"; } catch (e) { return definiteNo(e) ? "no" : "unknown"; }
  };
  const mx = await lookup(() => dns.resolveMx(domain));
  if (mx !== "no") return true;
  const a = await lookup(() => dns.resolve4(domain));
  if (a !== "no") return true;
  const aaaa = await lookup(() => dns.resolve6(domain));
  return aaaa !== "no";
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const host = request.headers.get("host") ?? "";
  if (!origin.endsWith(`//${host}`)) return NextResponse.json({ error: "Please sign up from the website." }, { status: 403 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter(t => now - t < 3_600_000);
  if (recent.length >= 20) return NextResponse.json({ error: "Too many tries from this connection. Try again in an hour." }, { status: 429 });
  attempts.set(ip, [...recent, now]);

  let body: Record<string, string> = {};
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }
  const honeypot = Boolean(body.company_website); // hidden field: a person never fills it, but a browser autofill might

  const email = (body.email ?? "").trim().toLowerCase();
  const phone = (body.phone ?? "").trim() ? e164(body.phone) : null;
  const business = (body.business ?? "").trim().slice(0, 80);
  const smsConsent = body.sms_consent === "yes";
  if (email && !/^[a-z0-9._%+'-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) return NextResponse.json({ error: "That email doesn't look right." }, { status: 422 });
  if ((body.phone ?? "").trim() && !phone) return NextResponse.json({ error: "Use a real US or Canadian mobile number." }, { status: 422 });
  if (!email && !phone) return NextResponse.json({ error: "Leave an email or a mobile number so we can reach you." }, { status: 422 });
  if (email) {
    const domain = email.slice(email.indexOf("@") + 1);
    if (DISPOSABLE.has(domain)) return NextResponse.json({ error: "Use the email you actually check; we'll only write once." }, { status: 422 });
    if (!(await acceptsMail(domain))) return NextResponse.json({ error: "That email domain doesn't receive mail. Check the spelling." }, { status: 422 });
  }

  // Bot checks never turn a person away. Vercel BotID reads signals its script collected in the
  // page; Cloudflare Turnstile is verified whenever its widget produced a token; the honeypot is
  // a field no person sees. Any of them doubting the request tags the signup bot_check: "flagged"
  // so it can be reviewed in Klaviyo, and the obvious fakes were already refused above (throwaway
  // domains, domains with no mail, made-up numbers). A real person always reaches the thank-you.
  const bot = await checkBotId();
  let botCheck: "passed" | "flagged" = bot.isBot && !bot.isVerifiedBot ? "flagged" : "passed";
  if (body.turnstileToken) {
    const human = await verifyHuman(body.turnstileToken, ip);
    if (human.ok) botCheck = "passed";
    else { botCheck = "flagged"; console.warn("waitlist: Turnstile rejected the token", human.reason); }
  }
  if (honeypot) botCheck = "flagged";
  if (botCheck === "flagged") console.warn("waitlist: saving a flagged signup", { email: !!email, phone: !!phone, honeypot });

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
  const fail = async (what: string, res: Response | null) => {
    const detail = res ? await res.text().catch(() => "") : "no response";
    console.error(`waitlist: Klaviyo ${what}`, res?.status, detail.slice(0, 300));
  };

  // 1. Upsert the profile with the founding-rate properties (the subscribe job below rejects `properties`).
  //    One retry after a short pause covers a Klaviyo blip.
  const importBody = JSON.stringify({
    data: {
      type: "profile",
      attributes: {
        ...identity,
        properties: {
          founding_rate: true,
          source: "coming-soon",
          ...(business ? { business } : {}),
          ...(phone ? { sms_consent: smsConsent } : {}),
          bot_check: botCheck,
          signed_up_at: new Date().toISOString(),
        },
      },
    },
  });
  const importOnce = () => fetch(KLAVIYO_IMPORT, { method: "POST", headers, body: importBody, signal: AbortSignal.timeout(10_000) }).catch(() => null);
  let imported = await importOnce();
  if (!imported || imported.status >= 500) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    imported = await importOnce();
  }
  let profileId: string | undefined;
  if (!imported || !imported.ok) {
    await fail("profile import failed", imported);
  } else {
    const created = (await imported.json().catch(() => null)) as { data?: { id?: string } } | null;
    profileId = created?.data?.id;
  }

  // 2. Put the profile on the founding-rate list right away (synchronous, so the list is never silently empty).
  let onList = false;
  if (profileId) {
    const added = await fetch(`${KLAVIYO_LISTS}/${list}/relationships/profiles`, {
      method: "POST",
      headers,
      body: JSON.stringify({ data: [{ type: "profile", id: profileId }] }),
      signal: AbortSignal.timeout(10_000),
    }).catch(() => null);
    if (added && added.ok) onList = true;
    else await fail("add-to-list failed", added);
  }

  // 3. Record marketing consent for the list (Klaviyo processes this in the background). Skipped when
  //    there is nothing to consent to (mobile number without the SMS box); retried without SMS when
  //    Klaviyo cannot take SMS consent yet (no sending number for the region).
  const subscribe = (subs: Record<string, unknown>) =>
    fetch(KLAVIYO, {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: { custom_source: "bubs.ai coming soon", historical_import: false, profiles: { data: [{ type: "profile", attributes: { ...identity, subscriptions: subs } }] } },
          relationships: { list: { data: { type: "list", id: list } } },
        },
      }),
      signal: AbortSignal.timeout(10_000),
    }).catch(() => null);

  let consented = Object.keys(subscriptions).length === 0;
  if (!consented) {
    let r = await subscribe(subscriptions);
    if ((!r || !r.ok) && subscriptions.sms && subscriptions.email) {
      await fail("SMS consent rejected, retrying with email only", r);
      r = await subscribe({ email: subscriptions.email });
    }
    if (r && r.ok) consented = true;
    else await fail("consent job rejected", r);
  }

  if (!onList && !consented) {
    // Nothing reached Klaviyo. The person still sees the thank-you: a failure screen would read as
    // a broken product. The lead is written to the log in full so it can be added by hand.
    console.error("waitlist: LEAD NOT SAVED, add by hand", JSON.stringify({ email, phone, business, smsConsent, botCheck, at: new Date().toISOString() }));
  }
  return NextResponse.json({ ok: true });
}
