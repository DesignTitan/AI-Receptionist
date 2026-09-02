import { countDemoCallsToday, createDemoCall, updateCall } from "./db";
import { sendDemoCallEmail } from "./email";
import { env, isVoiceProviderConfigured } from "./env";
import { demoFirstMessage, dispatchDemoCall } from "./voice";

/**
 * "Have it call you": a public endpoint that dials a phone number is a
 * toll-fraud vector the moment a real voice line is connected, so the checks
 * here are not optional. NANP numbers only, no premium prefixes, a honeypot,
 * per-address and per-number limits, and a daily cap that stops dialling and
 * says so. The limiter is in-memory per instance: good enough for one
 * deployment, and the cap is what bounds the worst case.
 */

const HOUR = 3_600_000;
const PER_IP_PER_HOUR = 3;
const PER_PHONE_PER_DAY = 2;

type Bucket = { hits: number[]; };
const byIp = new Map<string, Bucket>();
const byPhone = new Map<string, Bucket>();

function allow(map: Map<string, Bucket>, key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = map.get(key) ?? { hits: [] };
  b.hits = b.hits.filter((t) => now - t < windowMs);
  if (b.hits.length >= limit) return false;
  b.hits.push(now);
  map.set(key, b);
  return true;
}

/** +1NXXNXXXXXX or null. Rejects premium-rate and clearly invalid numbers. */
export function normalizeNanp(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  if (d.length !== 10) return null;
  const area = d.slice(0, 3), exchange = d.slice(3, 6);
  if (!/^[2-9]\d\d$/.test(area) || !/^[2-9]\d\d$/.test(exchange)) return null;
  if (area === "900" || exchange === "976" || area[1] === "1" && area[2] === "1") return null; // premium, N11
  return `+1${d}`;
}

export type TryCallResult =
  | { ok: true; id: string; reference: string; simulated: boolean; name: string; opening: string }
  | { ok: false; status: number; error: string };

export async function startTryCall(input: {
  phone: string;
  name?: string;
  business?: string;
  honeypot?: string;
  ip: string;
}): Promise<TryCallResult> {
  if (input.honeypot) return { ok: true, id: "", reference: "", simulated: true, name: "", opening: "" }; // bots think it worked
  const name = (input.name ?? "").trim().slice(0, 60);
  if (!name) return { ok: false, status: 422, error: "Tell us your name, so Ava knows who she is calling." };
  const phone = normalizeNanp(input.phone ?? "");
  if (!phone) return { ok: false, status: 422, error: "Enter a US or Canadian number, ten digits." };
  const business = (input.business ?? "").trim().slice(0, 80) || null;

  if (!allow(byIp, input.ip, PER_IP_PER_HOUR, HOUR)) {
    return { ok: false, status: 429, error: "That's a few calls from this connection already. Try again in an hour." };
  }
  if (!allow(byPhone, phone, PER_PHONE_PER_DAY, 24 * HOUR)) {
    return { ok: false, status: 429, error: "That number has been called today. Try another, or come back tomorrow." };
  }
  const cap = Number(env.tryCallDailyCap);
  if ((await countDemoCallsToday()) >= cap) {
    return { ok: false, status: 503, error: "The receptionist has hit today's demo-call limit. The three demos still work; try the call tomorrow." };
  }

  const call = await createDemoCall({ phone, business, name });
  const opening = demoFirstMessage(name);
  if (!isVoiceProviderConfigured()) {
    // No voice line on this deployment: keep the lead, tell the owner to call back, and never pretend a call happened.
    await updateCall(call.id, { provider: "demo", status: "failed", error: "no_voice_line" });
    await sendDemoCallEmail(call.id);
    return { ok: true, id: call.id, reference: call.reference ?? "", simulated: true, name, opening };
  }
  const dispatch = await dispatchDemoCall(call.id);
  if (!dispatch.ok) {
    return { ok: false, status: 502, error: "The call couldn't be placed right now. Try again in a minute." };
  }
  return { ok: true, id: call.id, reference: call.reference ?? "", simulated: false, name, opening };
}
