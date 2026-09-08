// Sandbox only. Reruns reuse stable product IDs, price lookup keys, meter names and endpoint URL.
import { readFile, writeFile } from "node:fs/promises";
import {
  PLANS,
  PRICING_VERSION,
  SETUP_CENTS,
  OVERAGE_CENTS,
  planFeatures,
  type Plan,
} from "../src/lib/platform/pricing.ts";
const key = (
  await readFile("/private/tmp/ai-receptionist-stripe-test-key", "utf8")
).trim();
if (!key.startsWith("sk_test_")) throw Error("Sandbox key required");
async function api(
  path: string,
  data?: Record<string, string>,
  idempotency?: string,
) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: data ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      ...(data ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(idempotency ? { "Idempotency-Key": idempotency } : {}),
    },
    body: data ? new URLSearchParams(data) : undefined,
  });
  const j = await r.json();
  if (!r.ok)
    throw Error(`${path.split("?")[0]}: ${j.error?.message ?? r.status}`);
  return j;
}
const account = await api("account");
if (account.id !== "acct_1UDNPDPicyLxgU34")
  throw Error("Wrong Stripe sandbox account");
const env: Record<string, string> = {
  STRIPE_SECRET_KEY: key,
  STRIPE_METER_EVENT: "receptionist_minutes_v2",
};
const meters = await api("billing/meters?limit=100");
let meter = meters.data.find(
  (m: { event_name: string }) => m.event_name === env.STRIPE_METER_EVENT,
);
if (!meter)
  meter = await api(
    "billing/meters",
    {
      display_name: "AI Receptionist started call minutes",
      event_name: env.STRIPE_METER_EVENT,
      "default_aggregation[formula]": "sum",
      "customer_mapping[type]": "by_id",
      "customer_mapping[event_payload_key]": "stripe_customer_id",
      "value_settings[event_payload_key]": "value",
    },
    "receptionist-meter-v2",
  );
env.STRIPE_METER_ID = meter.id;
async function product(
  id: string,
  name: string,
  description: string,
  features: string[] = [],
) {
  const list = await api(`products?ids[]=${id}`);
  if (list.data.length) return list.data[0];
  const data: Record<string, string> = {
    id,
    name,
    description,
    "metadata[pricing_version]": PRICING_VERSION,
  };
  features
    .slice(0, 15)
    .forEach((f, i) => (data[`marketing_features[${i}][name]`] = f));
  return api("products", data, id);
}
async function price(lookup: string, data: Record<string, string>) {
  const list = await api(`prices?lookup_keys[]=${lookup}`);
  return (
    list.data[0] ??
    api(
      "prices",
      {
        ...data,
        lookup_key: lookup,
        "metadata[pricing_version]": PRICING_VERSION,
      },
      lookup,
    )
  );
}
for (const [id, p] of Object.entries(PLANS) as [Plan, (typeof PLANS)[Plan]][]) {
  const prod = await product(
    `receptionist_${id}_v2`,
    `${p.name} — AI Receptionist`,
    `${p.minutes} minutes per billing month; up to ${p.teamLimit} bookable team members, one location. About ${p.estimatedCalls} calls at two minutes each; call count is an estimate. $1,000 setup once. Extra minutes $0.49 each with your chosen spending limit.`,
    planFeatures(id),
  );
  const fixed = await price(`receptionist_${id}_monthly_v2`, {
    product: prod.id,
    currency: "usd",
    unit_amount: String(p.monthly * 100),
    "recurring[interval]": "month",
  });
  env[`STRIPE_PRICE_${id.toUpperCase()}`] = fixed.id;
  const up = await product(
    `receptionist_${id}_minutes_v2`,
    `${p.name} call minutes`,
    `${p.minutes} included minutes each billing month, then $0.49 per started minute. Calls rounded up individually. Five-minute maximum per call. Extra spending disabled by default; opt in and set a limit in your dashboard. Unused minutes expire.`,
  );
  const usage = await price(`receptionist_${id}_usage_v2`, {
    product: up.id,
    currency: "usd",
    billing_scheme: "tiered",
    tiers_mode: "graduated",
    "recurring[interval]": "month",
    "recurring[usage_type]": "metered",
    "recurring[meter]": meter.id,
    "tiers[0][up_to]": String(p.minutes),
    "tiers[0][unit_amount]": "0",
    "tiers[1][up_to]": "inf",
    "tiers[1][unit_amount]": String(OVERAGE_CENTS),
  });
  env[`STRIPE_USAGE_${id.toUpperCase()}`] = usage.id;
  console.log(
    `${p.name}: $${p.monthly}/month, ${p.minutes} minutes, $0.49 overage; catalogue created/verified.`,
  );
}
const setup = await product(
  "receptionist_setup_v2",
  "AI Receptionist setup",
  "One-time business intake, booking-page configuration, dedicated phone/agent setup and a test call before launch. One location.",
);
env.STRIPE_PRICE_SETUP = (
  await price("receptionist_setup_once_v2", {
    product: setup.id,
    currency: "usd",
    unit_amount: String(SETUP_CENTS),
  })
).id;
const url = "https://ai-receptionist-two-azure.vercel.app/api/webhooks/stripe";
const hooks = await api("webhook_endpoints?limit=100");
let hook = hooks.data.find((h: { url: string }) => h.url === url);
if (!hook) {
  const d: Record<string, string> = {
    url,
    description: "AI Receptionist sandbox subscriptions and metered minutes",
  };
  [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.paid",
    "invoice.payment_failed",
  ].forEach((s, i) => (d[`enabled_events[${i}]`] = s));
  hook = await api("webhook_endpoints", d, "receptionist-webhook-v2");
}
if (hook.secret) env.STRIPE_WEBHOOK_SECRET = hook.secret;
else {
  try {
    const saved = JSON.parse(
      await readFile("/private/tmp/ai-receptionist-stripe-env.json", "utf8"),
    );
    if (saved.STRIPE_SECRET_KEY === key)
      env.STRIPE_WEBHOOK_SECRET = saved.STRIPE_WEBHOOK_SECRET;
  } catch {}
}
const configs = await api("billing_portal/configurations?limit=100");
let portal = configs.data.find(
  (x: { metadata?: { app?: string } }) => x.metadata?.app === "receptionist-v2",
);
if (!portal)
  portal = await api(
    "billing_portal/configurations",
    {
      "business_profile[headline]": "Manage your AI Receptionist subscription",
      "features[payment_method_update][enabled]": "true",
      "features[invoice_history][enabled]": "true",
      "features[subscription_cancel][enabled]": "true",
      "features[subscription_cancel][mode]": "at_period_end",
      "features[subscription_update][enabled]": "false",
      "metadata[app]": "receptionist-v2",
      default_return_url:
        "https://ai-receptionist-two-azure.vercel.app/account",
    },
    "receptionist-portal-v2",
  );
env.STRIPE_PORTAL_CONFIGURATION = portal.id;
await writeFile(
  "/private/tmp/ai-receptionist-stripe-env.json",
  JSON.stringify(env),
  { mode: 0o600 },
);
console.log(
  "Catalogue, meter, billing portal and webhook prepared. Credentials saved to protected temporary file.",
);
