import { runJobs } from "@/lib/platform/jobs";
import { after } from "next/server";
import { NextResponse } from "next/server";
import { verifyStripe, stripe, planFromPrice } from "@/lib/platform/billing";
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
    const sub = await stripe(
      `subscriptions/${encodeURIComponent(subscriptionId)}`,
    );
    const customerId = sub.metadata?.customer_id;
    if (!customerId) return NextResponse.json({ received: true });
    const recurring = sub.items?.data?.filter(
      (i: { price: { recurring: unknown } }) => i.price.recurring,
    );
    if (recurring?.length !== 1) throw Error("Unexpected subscription items");
    const plan = planFromPrice(recurring[0].price.id);
    const { error } = await serviceClient().rpc("apply_customer_subscription", {
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
