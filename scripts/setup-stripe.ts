// Verify by default. --apply creates/repairs the catalogue in the explicitly selected account.
import { readFile, writeFile, rename, chmod } from "node:fs/promises";
import { parseArgs } from "node:util";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, randomUUID } from "node:crypto";
import {
  PLANS,
  PRICING_VERSION,
  SETUP_CENTS,
  PILOT_SETUP_CENTS,
  SETUP_SCOPE,
  SETUP_OFFER,
  OVERAGE_CENTS,
  planFeatures,
  type Plan,
} from "../src/lib/platform/pricing.ts";
import { stripeConfiguration } from "../src/lib/platform/billing-mode.ts";
import {
  validateFixedPrice,
  validateUsagePrice,
  validateMeter,
  validateWebhook,
  validatePortal,
  STRIPE_EVENTS,
} from "../src/lib/platform/stripe-catalogue.ts";
const { values: v } = parseArgs({
  options: {
    mode: { type: "string" },
    account: { type: "string" },
    site: { type: "string" },
    "key-file": { type: "string" },
    out: { type: "string" },
    apply: { type: "boolean", default: false },
    help: { type: "boolean" },
  },
});
if (v.help) {
  console.log(
    "npm run stripe:setup -- --mode test|live --account acct_... --site https://your-site [--key-file /secure/key] [--out /secure/stripe.json] [--apply]\nDefault: verify existing Stripe configuration without changes. --apply: create missing products/prices/meter and repair webhook/portal settings. Credentials are never printed.",
  );
  process.exit(0);
}
if (!v.mode || !v.account || !v.site)
  throw Error("--mode, --account and --site are required. Use --help.");
const siteURL = new URL(v.site);
if (
  siteURL.protocol !== "https:" ||
  siteURL.username ||
  siteURL.password ||
  siteURL.pathname !== "/" ||
  siteURL.search ||
  siteURL.hash
)
  throw Error(
    "--site must be an HTTPS origin with no path, credentials, query or fragment.",
  );
const site = siteURL.origin;
const rawKey = v["key-file"]
  ? (await readFile(v["key-file"], "utf8")).trim()
  : process.env.STRIPE_SECRET_KEY;
const {
  mode,
  key,
  account: accountId,
} = stripeConfiguration({
  ...process.env,
  STRIPE_MODE: v.mode,
  STRIPE_ACCOUNT_ID: v.account,
  STRIPE_SECRET_KEY: rawKey,
});
const out = resolve(
  v.out ?? `/private/tmp/ai-receptionist-stripe-${mode}-${accountId}.json`,
);
const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (!relative(repo, out).startsWith(".."))
  throw Error("Write the credential manifest outside the repository.");
const siteKey = createHash("sha256").update(site).digest("hex").slice(0, 12);
async function api(
  path: string,
  data?: Record<string, string>,
  idempotency?: string,
) {
  if (data && !v.apply) throw Error("Read-only check cannot modify Stripe.");
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: data ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      ...(data ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(idempotency
        ? { "Idempotency-Key": `${mode}-${accountId}-${idempotency}` }
        : {}),
    },
    body: data ? new URLSearchParams(data) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  const j = await r.json();
  if (!r.ok)
    throw Error(`${path.split("?")[0]}: ${j.error?.message ?? r.status}`);
  return j;
}
const account = await api("account");
if (account.id !== accountId)
  throw Error("Key belongs to a different Stripe account.");
console.log(`Checking ${mode} mode, account ${accountId}, site ${site}.`);
const env: Record<string, string> = {
  STRIPE_MODE: mode,
  STRIPE_ACCOUNT_ID: accountId,
  STRIPE_SECRET_KEY: key,
  STRIPE_METER_EVENT: "receptionist_minutes_v2",
};
const meters = await api("billing/meters?limit=100");
let meter = meters.data.find(
  (m: { event_name: string }) => m.event_name === env.STRIPE_METER_EVENT,
);
if (!meter) {
  if (!v.apply)
    throw Error(
      "Meter missing. Run the same command with --apply to configure it.",
    );
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
    "meter-v2",
  );
}
validateMeter(meter);
env.STRIPE_METER_ID = meter.id;
async function product(
  id: string,
  name: string,
  description: string,
  features: string[] = [],
) {
  const list = await api(`products?ids[]=${id}`);
  const old = list.data[0];
  if (!v.apply) {
    if (
      !old ||
      !old.active ||
      old.name !== name ||
      old.description !== description ||
      features.some(
        (f) =>
          !old.marketing_features?.some((x: { name: string }) => x.name === f),
      )
    )
      throw Error(
        `Product ${name} is missing or needs its customer copy updated; use --apply.`,
      );
    return old;
  }
  const data: Record<string, string> = {
    name,
    description,
    active: "true",
    "metadata[pricing_version]": PRICING_VERSION,
  };
  features.forEach((f, i) => (data[`marketing_features[${i}][name]`] = f));
  return old
    ? api(`products/${old.id}`, data)
    : api("products", { id, ...data }, `product-${id}`);
}
async function price(lookup: string, data: Record<string, string>) {
  const list = await api(`prices?lookup_keys[]=${lookup}`);
  let p = list.data[0];
  if (!p) {
    if (!v.apply) throw Error(`Price ${lookup} missing; use --apply.`);
    p = await api(
      "prices",
      {
        ...data,
        lookup_key: lookup,
        "metadata[pricing_version]": PRICING_VERSION,
      },
      `price-${lookup}`,
    );
  }
  if (p.product !== data.product)
    throw Error("Price product mismatch; create a reviewed new version.");
  return p;
}
for (const [id, p] of Object.entries(PLANS) as [Plan, (typeof PLANS)[Plan]][]) {
  const prod = await product(
    `receptionist_${id}_v2`,
    `${p.name} — AI Receptionist`,
    `${p.minutes} minutes per billing month; up to ${p.teamLimit} bookable team members, one location. About ${p.estimatedCalls} calls at two minutes each; call count is an estimate. ${SETUP_OFFER} Extra minutes $0.49 each with your chosen spending limit.`,
    planFeatures(id),
  );
  const fixed = await price(`receptionist_${id}_monthly_v2`, {
    product: prod.id,
    currency: "usd",
    unit_amount: String(p.monthly * 100),
    "recurring[interval]": "month",
  });
  validateFixedPrice(fixed, p.monthly * 100, true, mode);
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
  validateUsagePrice(
    await api(`prices/${usage.id}?expand[]=tiers`),
    id,
    meter.id,
    mode,
  );
  env[`STRIPE_USAGE_${id.toUpperCase()}`] = usage.id;
  console.log(
    `${p.name}: monthly price, included minutes and overage verified.`,
  );
}
for (const [kind, amount, label] of [
  ["pilot", PILOT_SETUP_CENTS, "Pilot setup — first 10 customers"],
  ["standard", SETUP_CENTS, "Standard setup"],
] as const) {
  const prod = await product(
    `receptionist_setup_${kind}_v3`,
    label,
    SETUP_SCOPE,
  );
  const p = await price(`receptionist_setup_${kind}_v3`, {
    product: prod.id,
    currency: "usd",
    unit_amount: String(amount),
  });
  validateFixedPrice(p, amount, false, mode);
  env[`STRIPE_PRICE_SETUP_${kind.toUpperCase()}`] = p.id;
}
// Legacy $1,000 is never created in a fresh account; retain only when already present.
const legacy = await api("prices?lookup_keys[]=receptionist_setup_once_v2");
if (legacy.data[0]) {
  validateFixedPrice(legacy.data[0], 100000, false, mode);
  env.STRIPE_PRICE_SETUP = legacy.data[0].id;
}
const url = `${site}/api/webhooks/stripe`;
const hooks = await api("webhook_endpoints?limit=100");
const matches = hooks.data.filter((h: { url: string }) => h.url === url);
if (matches.length > 1)
  throw Error(
    "Multiple webhook endpoints for this site; reconcile duplicate deliveries first.",
  );
let hook = matches[0];
const hookData: Record<string, string> = {
  url,
  description: `AI Receptionist ${mode} subscriptions and metered minutes`,
};
STRIPE_EVENTS.forEach((s, i) => (hookData[`enabled_events[${i}]`] = s));
if (!hook) {
  if (!v.apply) throw Error("Webhook missing; use --apply.");
  hook = await api("webhook_endpoints", hookData, `webhook-v2-${siteKey}`);
} else if (v.apply)
  hook = await api(`webhook_endpoints/${hook.id}`, {
    ...hookData,
    disabled: "false",
  });
validateWebhook(hook, url);
env.STRIPE_WEBHOOK_ENDPOINT = hook.id;
let saved: any = null;
try {
  saved = JSON.parse(await readFile(out, "utf8"));
} catch {}
const same =
  saved?.STRIPE_MODE === mode &&
  saved?.STRIPE_ACCOUNT_ID === accountId &&
  saved?.STRIPE_WEBHOOK_ENDPOINT === hook.id;
const envMatches =
  process.env.STRIPE_MODE === mode &&
  process.env.STRIPE_ACCOUNT_ID === accountId &&
  process.env.STRIPE_WEBHOOK_ENDPOINT === hook.id;
const secret =
  hook.secret ??
  (envMatches ? process.env.STRIPE_WEBHOOK_SECRET : undefined) ??
  (same ? saved.STRIPE_WEBHOOK_SECRET : undefined);
if (secret?.startsWith("whsec_")) env.STRIPE_WEBHOOK_SECRET = secret;
const configs = await api("billing_portal/configurations?limit=100");
let portal = configs.data.find(
  (p: { metadata?: { app?: string }; default_return_url?: string }) =>
    p.metadata?.app === "receptionist-v2" &&
    p.default_return_url === `${site}/account`,
);
const portalData = {
  "business_profile[headline]": "Manage your AI Receptionist subscription",
  "features[payment_method_update][enabled]": "true",
  "features[invoice_history][enabled]": "true",
  "features[subscription_cancel][enabled]": "true",
  "features[subscription_cancel][mode]": "at_period_end",
  "features[subscription_update][enabled]": "false",
  "metadata[app]": "receptionist-v2",
  default_return_url: `${site}/account`,
};
if (!portal) {
  if (!v.apply) throw Error("Billing portal missing; use --apply.");
  portal = await api(
    "billing_portal/configurations",
    portalData,
    `portal-v2-${siteKey}`,
  );
} else if (v.apply)
  portal = await api(`billing_portal/configurations/${portal.id}`, {
    ...portalData,
    active: "true",
  });
validatePortal(portal, site);
env.STRIPE_PORTAL_CONFIGURATION = portal.id;
if (v.apply) {
  const tmp = `${out}.${randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(env, null, 2), {
    mode: 0o600,
    flag: "wx",
  });
  await rename(tmp, out);
  await chmod(out, 0o600);
  console.log(
    `Protected configuration written to ${out}. No Vercel settings were changed.`,
  );
}
console.log("Catalogue, meter, webhook events and billing portal verified.");
if (!env.STRIPE_WEBHOOK_SECRET)
  console.log(
    "Action needed: get the signing secret for this exact webhook endpoint from Stripe. It cannot be retrieved by API after creation. Keep the existing Vercel secret during a same-account check.",
  );
if (
  mode === "live" &&
  (!account.charges_enabled ||
    !account.payouts_enabled ||
    !account.details_submitted)
) {
  console.log(
    "Action needed: finish Stripe live account activation before accepting payment.",
  );
  process.exitCode = 2;
}
if (!env.STRIPE_WEBHOOK_SECRET) process.exitCode = 2;
