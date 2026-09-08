import { createHmac, timingSafeEqual } from "node:crypto";
import { PLANS, planOf, type Plan } from "./model.ts";

export function verifyStripe(
  raw: string,
  signature: string,
  secret: string,
  now = Date.now(),
) {
  const pairs = signature.split(",").map((s) => s.split("="));
  const timestamp = pairs.find(([k]) => k === "t")?.[1];
  if (
    !timestamp ||
    !/^\d+$/.test(timestamp) ||
    Math.abs(now / 1000 - Number(timestamp)) > 300
  )
    return false;
  const digest = createHmac("sha256", secret)
    .update(`${timestamp}.${raw}`)
    .digest();
  return pairs.some(
    ([k, v]) =>
      k === "v1" &&
      /^[a-f0-9]{64}$/i.test(v ?? "") &&
      timingSafeEqual(digest, Buffer.from(v, "hex")),
  );
}
export async function stripe(
  path: string,
  body?: URLSearchParams,
  idempotencyKey?: string,
) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key)
    throw Error("Payments are not open yet. Your business details are saved.");
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${key}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body,
  });
  const result = await response.json();
  if (!response.ok)
    throw Error(
      "The payment provider could not complete this request. Please try again.",
    );
  return result;
}
export function priceId(plan: Plan) {
  const id = process.env[`STRIPE_PRICE_${plan.toUpperCase()}`];
  if (!id)
    throw Error(
      "This plan is not available for purchase yet. Your details are saved.",
    );
  return id;
}
export function planFromPrice(id: string): Plan {
  const plan = Object.keys(PLANS).find(
    (p) => process.env[`STRIPE_PRICE_${p.toUpperCase()}`] === id,
  );
  return planOf(plan);
}

export async function verifyCheckoutPrices(
  plan: Plan,
  recurringId: string,
  setupId: string,
) {
  const [recurring, setup] = await Promise.all([
    stripe(`prices/${encodeURIComponent(recurringId)}`),
    stripe(`prices/${encodeURIComponent(setupId)}`),
  ]);
  if (
    !recurring.active ||
    recurring.currency !== "usd" ||
    recurring.unit_amount !== PLANS[plan].monthly * 100 ||
    recurring.recurring?.interval !== "month" ||
    recurring.recurring?.interval_count !== 1 ||
    recurring.recurring?.usage_type !== "licensed" ||
    !setup.active ||
    setup.currency !== "usd" ||
    setup.unit_amount !== 100000 ||
    setup.recurring
  )
    throw Error(
      "Plan pricing is being checked. Your business details are saved; no payment was started.",
    );
}
