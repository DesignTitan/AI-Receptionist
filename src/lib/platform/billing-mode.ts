export type StripeMode = "test" | "live";
export function billingMode(
  config: Record<string, string | undefined> = process.env,
): StripeMode {
  const mode = config.STRIPE_MODE ?? "test";
  if (mode !== "test" && mode !== "live")
    throw Error("STRIPE_MODE must be test or live.");
  return mode;
}
export function stripeConfiguration(config: Record<string, string | undefined> = process.env) {
  const mode = billingMode(config),
    key = config.STRIPE_SECRET_KEY,
    account = config.STRIPE_ACCOUNT_ID;
  if (!key || !new RegExp(`^(sk|rk)_${mode}_`).test(key))
    throw Error("Stripe credentials do not match the selected billing mode.");
  if (!account || !/^acct_[A-Za-z0-9]+$/.test(account))
    throw Error("Stripe account is not configured.");
  return { mode, key, account };
}
export function assertStripeObjectMode(
  object: { livemode?: boolean },
  mode: StripeMode,
) {
  if (
    typeof object.livemode === "boolean" &&
    object.livemode !== (mode === "live")
  )
    throw Error("Stripe object belongs to a different billing mode.");
}
