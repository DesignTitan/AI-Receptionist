import { serviceClient } from "@/lib/supabase";
import { stripe } from "./billing";
/** Time alone never releases a place: Stripe must confirm the stored session is expired and unpaid. */
export async function releaseExpiredPilotCheckouts() {
  const db = serviceClient();
  const { data, error } = await db
    .from("customers")
    .select("id,checkout_attempt,checkout_session_id")
    .eq("status", "draft")
    .is("stripe_subscription_id", null)
    .is("setup_paid_at", null)
    .not("checkout_session_id", "is", null)
    .lt("checkout_expires", Math.floor(Date.now() / 1000))
    .limit(10);
  if (error) throw Error("Could not check expired setup reservations.");
  for (const c of data ?? []) {
    try {
      const s = await stripe(
        `checkout/sessions/${encodeURIComponent(c.checkout_session_id)}`,
      );
      if (
        s.status === "expired" &&
        s.payment_status === "unpaid" &&
        !s.subscription
      ) {
        const r = await db.rpc("release_pilot_checkout", {
          c_id: c.id,
          attempt: c.checkout_attempt,
        });
        if (r.error) throw r.error;
      }
    } catch {
      /* Preserve uncertain reservations for operator review. */
    }
  }
}
