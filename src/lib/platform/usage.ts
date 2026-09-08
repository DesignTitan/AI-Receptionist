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
/** Stable per-booking identifiers + Stripe idempotency. Old uncertain events require review, not a blind resend. */
export async function reportUsage() {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_METER_EVENT) return;
  const db = serviceClient();
  const { data, error } = await db
    .from("call_usage")
    .select("*,usage_periods!inner(customer_id,starts_at,ends_at)")
    .eq("stripe_state", "pending")
    .not("settled_at", "is", null)
    .order("started_at")
    .limit(50);
  if (error) throw Error("Could not load metered usage.");
  for (const u of data ?? []) {
    if (Date.now() - Date.parse(u.started_at) > 23 * 3600000) {
      await db
        .from("call_usage")
        .update({
          stripe_state: "review",
          stripe_error:
            "Meter event is older than the automatic retry window. Reconcile with Stripe before resending.",
        })
        .eq("booking_id", u.booking_id);
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
            identifier: `call-${u.booking_id}`,
            timestamp: String(Math.floor(Date.parse(u.started_at) / 1000)),
            "payload[stripe_customer_id]": c.stripe_customer_id,
            "payload[value]": String(u.minutes),
          }),
          `meter-${u.booking_id}`,
        );
      const saved = await db
        .from("call_usage")
        .update({ stripe_state: "sent", stripe_error: null })
        .eq("booking_id", u.booking_id);
      if (saved.error)
        throw Error("Usage accepted but delivery state was not saved");
    } catch (e) {
      await db
        .from("call_usage")
        .update({ stripe_error: (e as Error).message.slice(0, 300) })
        .eq("booking_id", u.booking_id);
    }
  }
}
