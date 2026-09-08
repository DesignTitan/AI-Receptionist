import { assertBillingEnvironment } from "@/lib/platform/billing-environment";
import { billingMode } from "@/lib/platform/billing-mode";
import { verifySetupInvoice } from "@/lib/platform/setup-payment";
import { runJobs } from "@/lib/platform/jobs";
import { after } from "next/server";
import { NextResponse } from "next/server";
import {
  verifyStripe,
  stripe,
  planFromPrice,
  usagePriceId,
} from "@/lib/platform/billing";
import { serviceClient } from "@/lib/supabase";
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret)
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const raw = await request.text();
  if (
    raw.length > 1000000 ||
    !verifyStripe(raw, request.headers.get("stripe-signature") ?? "", secret)
  )
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  try {
    const event = JSON.parse(raw);
    if (event.livemode !== (billingMode() === "live"))
      return NextResponse.json(
        { error: "Incorrect billing mode" },
        { status: 400 },
      );
    const object = event.data?.object;
    const accepted = [
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "invoice.paid",
      "invoice.payment_failed",
    ];
    if (!accepted.includes(event.type))
      return NextResponse.json({ received: true });
    const subscriptionId = event.type.startsWith("customer.subscription.")
      ? object.id
      : typeof object.subscription === "string"
        ? object.subscription
        : object.parent?.subscription_details?.subscription;
    if (!subscriptionId) return NextResponse.json({ received: true });
    // Fetch current state: late or reordered events cannot restore an old plan/status.
    const billing = await assertBillingEnvironment();
    const sub = await stripe(
      `subscriptions/${encodeURIComponent(subscriptionId)}`,
    );
    const customerId = sub.metadata?.customer_id;
    if (!customerId) return NextResponse.json({ received: true });
    const db = serviceClient();
    const { data: customer, error: customerError } = await db
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();
    if (customerError || !customer) throw Error("Unknown customer");
    const stripeCustomer =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    // Frozen attempt identity prevents a separately created subscription from claiming this offer.
    if (
      customer.setup_price_id &&
      sub.metadata?.checkout_attempt !== customer.checkout_attempt
    )
      throw Error("Checkout attempt does not match");
    let paidSetup = false;
    if (!customer.setup_paid_at && sub.status === "active") {
      if (!customer.checkout_session_id)
        throw Error("Checkout still being saved; retry required");
      const session = await stripe(
        `checkout/sessions/${encodeURIComponent(customer.checkout_session_id)}`,
      );
      if (
        session.status !== "complete" ||
        session.payment_status !== "paid" ||
        session.subscription !== sub.id ||
        session.customer !== stripeCustomer ||
        session.client_reference_id !== customerId
      )
        throw Error("Initial checkout needs review");
      const invoiceId =
        typeof session.invoice === "string"
          ? session.invoice
          : session.invoice?.id;
      if (!invoiceId) throw Error("Initial invoice not ready");
      const invoice = await stripe(`invoices/${encodeURIComponent(invoiceId)}`);
      verifySetupInvoice(invoice, {
        customer: stripeCustomer,
        subscription: sub.id,
        price: customer.setup_price_id ?? process.env.STRIPE_PRICE_SETUP,
        cents: customer.setup_fee_cents,
      });
      paidSetup = true;
    }
    const items = sub.items?.data ?? [];
    const fixed = items.filter(
      (i: { price: { recurring?: { usage_type: string } } }) =>
        i.price.recurring?.usage_type === "licensed",
    );
    const metered = items.filter(
      (i: { price: { recurring?: { usage_type: string } } }) =>
        i.price.recurring?.usage_type === "metered",
    );
    if (fixed.length !== 1 || metered.length !== 1 || fixed[0].quantity !== 1)
      throw Error("Unexpected subscription items");
    const plan = planFromPrice(fixed[0].price.id);
    if (metered[0].price.id !== usagePriceId(plan))
      throw Error("Incorrect usage price");
    const start = fixed[0].current_period_start ?? sub.current_period_start;
    const end = fixed[0].current_period_end ?? sub.current_period_end;
    if (!start || !end) throw Error("Billing period missing");
    const { error } = await db.rpc("apply_environment_subscription", {
      expected_mode: billing.mode,
      expected_account: billing.account,
      paid_setup: paidSetup,
      p_start: new Date(start * 1000).toISOString(),
      p_end: new Date(end * 1000).toISOString(),
      event_id: event.id,
      c_id: customerId,
      subscription: sub.id,
      stripe_customer:
        typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      new_plan: plan,
      subscription_status: sub.status,
    });
    if (error) throw error;
    after(async () => {
      await runJobs();
    });
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Event could not be applied; retry required." },
      { status: 500 },
    );
  }
}
