import { assertBillingEnvironment } from "./billing-environment";
import { stripe } from "./billing";
import { purchaseReceipt } from "./purchase-receipt";
import type { Customer } from "./model";
export async function loadPurchaseReceipt(c: Customer) {
  if (!c.setup_paid_at || !c.checkout_session_id || !c.stripe_customer_id || !c.stripe_subscription_id || !c.setup_price_id || c.setup_fee_cents == null)
    throw Error("Your confirmed receipt is not available yet.");
  await assertBillingEnvironment();
  const session = await stripe(`checkout/sessions/${encodeURIComponent(c.checkout_session_id)}`);
  if (session.status !== "complete" || session.payment_status !== "paid" || session.customer !== c.stripe_customer_id || session.subscription !== c.stripe_subscription_id || session.client_reference_id !== c.id)
    throw Error("The receipt could not be verified.");
  const invoiceId = typeof session.invoice === "string" ? session.invoice : session.invoice?.id;
  if (!invoiceId) throw Error("Stripe is still preparing your receipt.");
  const invoice = await stripe(`invoices/${encodeURIComponent(invoiceId)}`);
  return purchaseReceipt(invoice, { customer:c.stripe_customer_id, subscription:c.stripe_subscription_id, price:c.setup_price_id, cents:c.setup_fee_cents });
}
