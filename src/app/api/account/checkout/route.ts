import { assertBillingEnvironment } from "@/lib/platform/billing-environment";
import { NextResponse } from "next/server";
import {
  checkOrigin,
  ownedCustomer,
  requireOwner,
} from "@/lib/platform/server";
import {
  stripe,
  priceId,
  verifyCheckoutPrices,
  verifyUsagePrice,
} from "@/lib/platform/billing";
import { serviceClient } from "@/lib/supabase";
import type { Customer } from "@/lib/platform/model";
import { releaseExpiredPilotCheckouts } from "@/lib/platform/setup-offer";
import { checkoutSetupPrice } from "@/lib/platform/checkout-offer";
import { env } from "@/lib/env";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const user = await requireOwner();
    const billing = await assertBillingEnvironment(true);
    const original = await ownedCustomer();
    if (!original) throw Error("Save your business first.");
    // A card-authentication attempt can link an incomplete subscription while its
    // original Checkout session is still open. Resume that session, never replace it.
    if (original.checkout_session_id) {
      const existing = await stripe(
        `checkout/sessions/${encodeURIComponent(original.checkout_session_id)}`,
      );
      if (existing.status === "open" && existing.url)
        return NextResponse.json({ url: existing.url });
      if (existing.status === "complete")
        throw Error(
          "Payment is being confirmed. Refresh your dashboard shortly.",
        );
    }
    const setupPrice = await checkoutSetupPrice(original.plan);
    await verifyUsagePrice(original.plan);
    await releaseExpiredPilotCheckouts();
    const db = serviceClient();
    const claimed = await db.rpc("claim_flat_checkout", {
      expected_mode: billing.mode,
      expected_account: billing.account,
      c_id: original.id,
      user_id: user.id,
      setup_price: setupPrice,
    });
    if (claimed.error)
      throw Error(
        "Checkout is already complete or unavailable. Refresh your dashboard.",
      );
    const c = claimed.data as Customer;
    const setup = c.setup_price_id ?? process.env.STRIPE_PRICE_SETUP;
    if (!setup || c.setup_fee_cents == null)
      throw Error("Setup price needs review.");
    const recurringPrice = priceId(c.plan);
    // A completed or expired attempt is never silently replaced: prevents a second subscription charge.
    if (c.checkout_session_id) {
      const session = await stripe(
        `checkout/sessions/${encodeURIComponent(c.checkout_session_id)}`,
      );
      if (session.status === "open" && session.url)
        return NextResponse.json({ url: session.url });
      if (session.status === "complete")
        throw Error(
          "Payment is being confirmed. Refresh your dashboard shortly.",
        );
      throw Error("This checkout expired. Contact us to restart it safely.");
    }
    if (
      !c.checkout_expires ||
      c.checkout_expires * 1000 < Date.now() + 30 * 60000
    )
      throw Error(
        "This checkout attempt expired. Contact us to restart it safely.",
      );
    await verifyCheckoutPrices(
      c.plan,
      recurringPrice,
      setup,
      c.setup_fee_cents,
    );
    await verifyUsagePrice(c.plan);
    const body = new URLSearchParams({
      mode: "subscription",
      customer_email: c.owner_email,
      client_reference_id: c.id,
      "metadata[customer_id]": c.id,
      "metadata[checkout_attempt]": c.checkout_attempt!,
      "subscription_data[metadata][customer_id]": c.id,
      "subscription_data[metadata][checkout_attempt]": c.checkout_attempt!,
      "subscription_data[metadata][setup_fee_cents]": String(c.setup_fee_cents),
      "line_items[0][price]": recurringPrice,
      "line_items[0][quantity]": "1",
      "line_items[1][price]": setup,
      "line_items[1][quantity]": "1",
      "subscription_data[metadata][pricing_version]": "minutes-v2",
      "subscription_data[metadata][checkout_version]": "flat-v4",
      "custom_text[submit][message]":
        "Your monthly plan includes call minutes. Extra spending is off. You can enable extra minutes at $0.49 each with a spending limit in your dashboard. Setup is paid once.",
      success_url: `${env.siteUrl}/account?checkout=complete`,
      cancel_url: `${env.siteUrl}/account?checkout=cancelled`,
      expires_at: String(c.checkout_expires),
    });
    const session = await stripe(
      "checkout/sessions",
      body,
      `signup-${c.checkout_attempt}`,
    );
    const saved = await db
      .from("customers")
      .update({ checkout_session_id: session.id })
      .eq("id", c.id)
      .eq("checkout_attempt", c.checkout_attempt)
      .select("id")
      .maybeSingle();
    if (saved.error || !saved.data)
      throw Error(
        "Checkout prepared but not saved. Try again to recover the same session.",
      );
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
