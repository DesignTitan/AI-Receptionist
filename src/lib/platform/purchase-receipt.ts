import { verifySetupInvoice, type SetupInvoice } from "./setup-payment.ts";
export type PurchaseReceipt = {
  number: string;
  paidAt: string;
  currency: string;
  rows: { label: string; cents: number }[];
  amountPaid: number;
  url: string | null;
};
type Invoice = SetupInvoice & {
  id: string; number?: string | null; amount_paid: number; total: number;
  status_transitions?: { paid_at?: number | null };
  hosted_invoice_url?: string | null;
};
export function money(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);
}
export function stripeReceiptUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && ["invoice.stripe.com", "pay.stripe.com"].includes(url.hostname) ? url.href : null;
  } catch { return null; }
}
/** Preserve the original paid invoice; never reconstruct a receipt from today's prices. */
export function purchaseReceipt(invoice: Invoice, expected: Parameters<typeof verifySetupInvoice>[1]): PurchaseReceipt {
  verifySetupInvoice(invoice, expected);
  const paidAt = invoice.status_transitions?.paid_at;
  if (!Number.isSafeInteger(invoice.amount_paid) || invoice.amount_paid < 0 ||
      !Number.isSafeInteger(invoice.total) || invoice.total < 0 || !paidAt || !Number.isFinite(paidAt))
    throw Error("Receipt totals are unavailable.");
  const rows = (invoice.lines?.data ?? []).filter(line => line.amount !== 0).map(line => {
    if (!Number.isSafeInteger(line.amount)) throw Error("Receipt line is incomplete.");
    const price = line.pricing?.price_details?.price ?? line.price;
    const id = typeof price === "string" ? price : price?.id;
    return { label: id === expected.price ? "One-time setup" : "Monthly plan", cents: line.amount! };
  });
  const adjustment = invoice.total - rows.reduce((sum, row) => sum + row.cents, 0);
  if (adjustment) rows.push({ label: "Tax & adjustments", cents: adjustment });
  if (invoice.amount_paid !== invoice.total) rows.push({ label: "Account balance adjustment", cents: invoice.amount_paid - invoice.total });
  return { number: invoice.number ?? invoice.id, paidAt: new Date(paidAt * 1000).toISOString(), currency: invoice.currency!, rows, amountPaid: invoice.amount_paid, url: stripeReceiptUrl(invoice.hosted_invoice_url) };
}
