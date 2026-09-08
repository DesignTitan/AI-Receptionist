import { NextResponse } from "next/server";
import {
  checkOrigin,
  ownedCustomer,
  requireOwner,
} from "@/lib/platform/server";
import { stripe, priceId, verifyCheckoutPrices, verifyUsagePrice, usagePriceId } from "@/lib/platform/billing";
import { serviceClient } from "@/lib/supabase";
import type { Customer } from "@/lib/platform/model";
import { env } from "@/lib/env";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const user = await requireOwner();
    const original = await ownedCustomer();
    if (!original) throw Error("Save your business first.");
    const setup = process.env.STRIPE_PRICE_SETUP;
    if (!setup || !process.env.STRIPE_SECRET_KEY)
      throw Error(
        "Payments are not open yet. Your business details are saved.",
      );
    await verifyCheckoutPrices(original.plan,priceId(original.plan),setup);
    await verifyUsagePrice(original.plan);
    const db = serviceClient();
    const claimed = await db.rpc("claim_customer_checkout", {
      c_id: original.id,
      user_id: user.id,
    });
    if (claimed.error)
      throw Error(
        "Checkout is already complete or unavailable. Refresh your dashboard.",
      );
    const c = claimed.data as Customer;
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
    await verifyCheckoutPrices(c.plan, recurringPrice, setup);
    await verifyUsagePrice(c.plan);
    const body = new URLSearchParams({
      mode: "subscription",
      customer_email: c.owner_email,
      client_reference_id: c.id,
      "metadata[customer_id]": c.id,
      "subscription_data[metadata][customer_id]": c.id,
      "line_items[0][price]": recurringPrice,
      "line_items[0][quantity]": "1",
      "line_items[1][price]": setup,
      "line_items[1][quantity]": "1",
      "line_items[2][price]": usagePriceId(c.plan),
      "subscription_data[metadata][pricing_version]": "minutes-v2",
      "custom_text[submit][message]": "Extra minutes cost $0.49 per started minute after your included allowance. Extra spending starts disabled; choose a monthly limit in your dashboard. One location. Unused minutes expire at renewal.",
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
      .eq("checkout_attempt", c.checkout_attempt);
    if (saved.error)
      throw Error(
        "Checkout prepared but not saved. Try again to recover the same session.",
      );
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
