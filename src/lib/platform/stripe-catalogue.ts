import { PLANS, OVERAGE_CENTS, type Plan } from "./pricing.ts";
import { assertStripeObjectMode, type StripeMode } from "./billing-mode.ts";
export type StripePrice = {
  livemode?: boolean;
  active?: boolean;
  currency?: string;
  unit_amount?: number | null;
  recurring?: {
    interval?: string;
    interval_count?: number;
    usage_type?: string;
    meter?: string;
  } | null;
  billing_scheme?: string;
  tiers_mode?: string;
  tiers?: {
    up_to: number | null;
    unit_amount: number | null;
    flat_amount?: number | null;
  }[];
};
export function validateFixedPrice(
  p: StripePrice,
  cents: number,
  monthly: boolean,
  mode: StripeMode,
) {
  assertStripeObjectMode(p, mode);
  if (
    !p.active ||
    p.currency !== "usd" ||
    p.unit_amount !== cents ||
    (monthly
      ? p.recurring?.interval !== "month" ||
        p.recurring?.interval_count !== 1 ||
        p.recurring?.usage_type !== "licensed"
      : Boolean(p.recurring))
  )
    throw Error("Fixed Stripe price does not match the published offer.");
}
export function validateUsagePrice(
  p: StripePrice,
  plan: Plan,
  meter: string,
  mode: StripeMode,
) {
  assertStripeObjectMode(p, mode);
  if (
    !p.active ||
    p.currency !== "usd" ||
    p.billing_scheme !== "tiered" ||
    p.tiers_mode !== "graduated" ||
    p.recurring?.interval !== "month" ||
    p.recurring?.interval_count !== 1 ||
    p.recurring?.usage_type !== "metered" ||
    p.recurring?.meter !== meter ||
    p.tiers?.length !== 2 ||
    p.tiers[0].up_to !== PLANS[plan].minutes ||
    p.tiers[0].unit_amount !== 0 ||
    p.tiers[1].up_to !== null ||
    p.tiers[1].unit_amount !== OVERAGE_CENTS ||
    p.tiers.some((t) => t.flat_amount)
  )
    throw Error(
      "Metered Stripe price does not match the published allowance and overage.",
    );
}
export const STRIPE_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
];
export function validateMeter(m: {
  status?: string;
  event_name?: string;
  default_aggregation?: { formula?: string };
  customer_mapping?: { type?: string; event_payload_key?: string };
  value_settings?: { event_payload_key?: string };
}) {
  if (
    m.status !== "active" ||
    m.event_name !== "receptionist_minutes_v2" ||
    m.default_aggregation?.formula !== "sum" ||
    m.customer_mapping?.type !== "by_id" ||
    m.customer_mapping?.event_payload_key !== "stripe_customer_id" ||
    m.value_settings?.event_payload_key !== "value"
  )
    throw Error("Stripe meter configuration does not match the application.");
}
export function validateWebhook(
  h: { status?: string; url?: string; enabled_events?: string[] },
  url: string,
) {
  if (
    h.status !== "enabled" ||
    h.url !== url ||
    !STRIPE_EVENTS.every(
      (x) => h.enabled_events?.includes(x) || h.enabled_events?.includes("*"),
    )
  )
    throw Error("Stripe webhook URL or events need configuration.");
}
export function validatePortal(
  p: {
    active?: boolean;
    default_return_url?: string;
    features?: {
      payment_method_update?: { enabled?: boolean };
      invoice_history?: { enabled?: boolean };
      subscription_cancel?: { enabled?: boolean; mode?: string };
      subscription_update?: { enabled?: boolean };
    };
  },
  site: string,
) {
  if (
    !p.active ||
    p.default_return_url !== `${site}/account` ||
    !p.features?.payment_method_update?.enabled ||
    !p.features?.invoice_history?.enabled ||
    !p.features?.subscription_cancel?.enabled ||
    p.features.subscription_cancel.mode !== "at_period_end" ||
    p.features.subscription_update?.enabled
  )
    throw Error(
      "Stripe billing portal must keep agreed plan changes at renewal.",
    );
}
