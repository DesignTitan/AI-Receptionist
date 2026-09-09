import { assertBillingEnvironment } from "./billing-environment";
import { serviceClient } from "@/lib/supabase";
import { stripe } from "./billing";
import type { Customer } from "./model";
export async function usageFor(c: Customer) {
  const db = serviceClient();
  const [period, notices] = await Promise.all([
    db
      .from("usage_periods")
      .select("*")
      .eq("customer_id", c.id)
      .eq("starts_at", c.period_start ?? "1970-01-01")
      .maybeSingle(),
    db
      .from("usage_notices")
      .select("id,kind,message,created_at")
      .eq("customer_id", c.id)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);
  if (period.error || notices.error)
    throw Error("Usage information is temporarily unavailable.");
  return { period: period.data, notices: notices.data ?? [] };
}
/** Preserve outgoing identifiers; incoming calls have a separate namespace.
 * Old uncertain events require review, not a blind resend. */
export async function reportUsage() {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_METER_EVENT) return;
  await assertBillingEnvironment();
  const db = serviceClient();
  for (const ledger of [
    { table: "call_usage", key: "booking_id", eventPrefix: "call-", retryPrefix: "meter-" },
    { table: "inbound_call_usage", key: "call_id", eventPrefix: "inbound-call-", retryPrefix: "inbound-meter-" },
  ]) {
    const { data, error } = await db
      .from(ledger.table)
      .select("*,usage_periods!inner(customer_id,starts_at,ends_at)")
      .eq("stripe_state", "pending")
      .not("settled_at", "is", null)
      .order("started_at")
      .limit(50);
    if (error) throw Error("Could not load metered usage.");
    for (const u of data ?? []) {
      if (Date.now() - Date.parse(u.started_at) > 23 * 3600000) {
        await db
          .from(ledger.table)
          .update({
            stripe_state: "review",
            stripe_error:
              "Meter event is older than the automatic retry window. Reconcile with Stripe before resending.",
          })
          .eq(ledger.key, u[ledger.key]);
        continue;
      }
      try {
        const { data: c, error: ce } = await db
          .from("customers")
          .select("stripe_customer_id")
          .eq("id", u.usage_periods.customer_id)
          .single();
        if (ce || !c?.stripe_customer_id) throw Error("Stripe customer missing");
        if (u.minutes > 0)
          await stripe(
            "billing/meter_events",
            new URLSearchParams({
              event_name: process.env.STRIPE_METER_EVENT,
              identifier: `${ledger.eventPrefix}${u[ledger.key]}`,
              timestamp: String(Math.floor(Date.parse(u.started_at) / 1000)),
              "payload[stripe_customer_id]": c.stripe_customer_id,
              "payload[value]": String(u.minutes),
            }),
            `${ledger.retryPrefix}${u[ledger.key]}`,
          );
        const saved = await db
          .from(ledger.table)
          .update({ stripe_state: "sent", stripe_error: null })
          .eq(ledger.key, u[ledger.key]);
        if (saved.error)
          throw Error("Usage accepted but delivery state was not saved");
      } catch (e) {
        await db
          .from(ledger.table)
          .update({ stripe_error: (e as Error).message.slice(0, 300) })
          .eq(ledger.key, u[ledger.key]);
      }
    }
  }
}
