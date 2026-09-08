import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/platform/server";
import { assertBillingEnvironment } from "@/lib/platform/billing-environment";
import { stripe, priceId, usagePriceId } from "@/lib/platform/billing";
import {
  PLANS,
  PILOT_SETUP_CENTS,
  SETUP_CENTS,
  type Plan,
} from "@/lib/platform/pricing";
import {
  validateFixedPrice,
  validateUsagePrice,
  validateMeter,
  validateWebhook,
  validatePortal,
} from "@/lib/platform/stripe-catalogue";
import { env } from "@/lib/env";
export async function GET() {
  try {
    await requireStaff();
  } catch {
    return NextResponse.json(
      { error: "Staff sign-in required." },
      { status: 401 },
    );
  }
  const checks: { label: string; ok: boolean; detail: string }[] = [];
  let mode = "unknown",
    account = "unknown";
  try {
    const config = await assertBillingEnvironment(true);
    mode = config.mode;
    account = config.account;
    checks.push({
      label: "Account and database",
      ok: true,
      detail: `${mode} mode; the Stripe key and database are bound to ${account}.`,
    });
    const catalogue = await Promise.all(
      (Object.keys(PLANS) as Plan[]).map(async (plan) => {
        const [fixed, usage] = await Promise.all([
          stripe(`prices/${priceId(plan)}`),
          stripe(`prices/${usagePriceId(plan)}?expand[]=tiers`),
        ]);
        validateFixedPrice(fixed, PLANS[plan].monthly * 100, true, config.mode);
        validateUsagePrice(
          usage,
          plan,
          process.env.STRIPE_METER_ID!,
          config.mode,
        );
      }),
    );
    void catalogue;
    for (const [kind, cents] of [
      ["PILOT", PILOT_SETUP_CENTS],
      ["STANDARD", SETUP_CENTS],
    ] as const) {
      const id = process.env[`STRIPE_PRICE_SETUP_${kind}`];
      if (!id) throw Error("Setup price missing");
      validateFixedPrice(
        await stripe(`prices/${id}`),
        cents,
        false,
        config.mode,
      );
    }
    checks.push({
      label: "Customer pricing",
      ok: true,
      detail:
        "All three monthly plans, both setup fees, included minutes and extra-minute prices match the site.",
    });
    const meter = await stripe(`billing/meters/${process.env.STRIPE_METER_ID}`);
    validateMeter(meter);
    if (process.env.STRIPE_METER_EVENT !== meter.event_name)
      throw Error("Configured usage event does not match the Stripe meter.");
    const url = `${env.siteUrl}/api/webhooks/stripe`;
    const hooks = await stripe("webhook_endpoints?limit=100");
    const matching = hooks.data.filter((h: { url: string }) => h.url === url);
    if (matching.length !== 1)
      throw Error("Expected one webhook endpoint for this site.");
    validateWebhook(matching[0], url);
    if (
      process.env.STRIPE_WEBHOOK_ENDPOINT &&
      matching[0].id !== process.env.STRIPE_WEBHOOK_ENDPOINT
    )
      throw Error("Webhook identity does not match configuration.");
    if (!process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_"))
      throw Error("Webhook signing secret is missing.");
    checks.push({
      label: "Usage and payment updates",
      ok: true,
      detail:
        "Meter and webhook settings are correct; the signing secret is configured. A completed checkout still needs a delivery test.",
    });
    const portalId = process.env.STRIPE_PORTAL_CONFIGURATION;
    if (!portalId) throw Error("Billing portal missing");
    validatePortal(
      await stripe(`billing_portal/configurations/${portalId}`),
      env.siteUrl,
    );
    checks.push({
      label: "Customer billing portal",
      ok: true,
      detail:
        "Payment details, invoices and cancellation at renewal are enabled. Automatic plan changes are disabled.",
    });
    return NextResponse.json({ ok: true, mode, account, checks });
  } catch (e) {
    checks.push({
      label: "Billing connection",
      ok: false,
      detail: (e as Error).message,
    });
    return NextResponse.json(
      { ok: false, mode, account, checks },
      { status: 503 },
    );
  }
}
