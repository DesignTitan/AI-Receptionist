/** Validate the fixed plan and optional usage item without trusting webhook payload order. */
export type SubscriptionItem = {
  quantity?: number;
  price: { id: string; recurring?: { usage_type?: string } };
  current_period_start?: number;
  current_period_end?: number;
};
export function subscriptionItems(items: SubscriptionItem[], optionalUsage: boolean) {
  const fixed = items.filter(i => i.price.recurring?.usage_type === "licensed");
  const metered = items.filter(i => i.price.recurring?.usage_type === "metered");
  if (fixed.length !== 1 || fixed[0].quantity !== 1 || metered.length > 1 ||
      (!optionalUsage && metered.length !== 1) || items.length !== fixed.length + metered.length)
    throw Error("Unexpected subscription items");
  return { fixed: fixed[0], metered: metered[0] };
}
