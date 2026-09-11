import { stripe, priceId, usagePriceId, verifyUsagePrice } from "./billing";
import { assertBillingEnvironment } from "./billing-environment";
import { subscriptionItems } from "./subscription-items";
import type { Customer } from "./model";

/** Install usage billing only after the owner opts into a positive spending limit.
 * Never remove the item on disabling spending: already-incurred usage still settles. */
export async function enableUsageBilling(c: Customer) {
  if (!c.stripe_subscription_id || !c.setup_paid_at || c.billing_status !== "active")
    throw Error("Complete payment before enabling extra minutes.");
  await assertBillingEnvironment();
  const sub = await stripe(`subscriptions/${encodeURIComponent(c.stripe_subscription_id)}`);
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (sub.status !== "active" || sub.metadata?.customer_id !== c.id || customerId !== c.stripe_customer_id)
    throw Error("Subscription needs review before extra spending can be enabled.");
  const { fixed, metered } = subscriptionItems(sub.items?.data ?? [], sub.metadata?.checkout_version === "flat-v4");
  if (fixed.price.id !== priceId(c.plan)) throw Error("Subscription plan does not match.");
  const usage = usagePriceId(c.plan);
  if (metered) {
    if (metered.price.id !== usage) throw Error("Usage price does not match.");
    return;
  }
  await verifyUsagePrice(c.plan);
  await stripe("subscription_items", new URLSearchParams({
    subscription: sub.id,
    price: usage,
    proration_behavior: "none",
  }), `enable-usage-${sub.id}-${usage}`);
}
