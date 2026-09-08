import { serviceClient } from "@/lib/supabase";
import { stripeConfiguration } from "./billing-mode";
import { stripe } from "./billing";
/** DB binding keeps test customer/usage records out of a live Stripe account. */
export async function assertBillingEnvironment(requireActivation = false) {
  const config = stripeConfiguration();
  const { data, error } = await serviceClient()
    .from("billing_environment")
    .select("mode,account_id")
    .eq("singleton", true)
    .single();
  if (
    error ||
    data?.mode !== config.mode ||
    data?.account_id !== config.account
  )
    throw Error(
      "Billing environment needs configuration. No new payment was started.",
    );
  const account = await stripe("account");
  if (account.id !== config.account)
    throw Error("Stripe key belongs to a different account.");
  if (
    requireActivation &&
    config.mode === "live" &&
    (!account.charges_enabled ||
      !account.payouts_enabled ||
      !account.details_submitted)
  )
    throw Error("Stripe live account activation is not complete.");
  return config;
}
