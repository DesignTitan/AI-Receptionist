import { NextResponse } from "next/server";
import { checkOrigin, requireStaff } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";
import { stripe } from "@/lib/platform/billing";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await requireStaff();
    const { id } = await request.json();
    const db = serviceClient();
    const { data: c, error } = await db
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !c || c.status !== "draft" || c.stripe_subscription_id)
      throw Error("Only unpaid draft checkouts can be reset.");
    if (!c.checkout_session_id)
      throw Error(
        "No tracked session. Reconcile the existing attempt in Stripe before changing it.",
      );
    let session = await stripe(
      `checkout/sessions/${encodeURIComponent(c.checkout_session_id)}`,
    );
    if (
      session.status === "complete" ||
      session.subscription ||
      session.payment_status === "paid"
    )
      throw Error(
        "A payment exists. Wait for the Stripe webhook; do not charge again.",
      );
    if (session.status === "open")
      session = await stripe(
        `checkout/sessions/${encodeURIComponent(c.checkout_session_id)}/expire`,
        new URLSearchParams(),
      );
    if (session.status !== "expired")
      throw Error("The old checkout is not closed yet.");
    const r = await db.rpc("release_pilot_checkout", {
      c_id: id,
      attempt: c.checkout_attempt,
    });
    if (r.error || !r.data)
      throw Error("Customer changed; refresh and check billing.");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
