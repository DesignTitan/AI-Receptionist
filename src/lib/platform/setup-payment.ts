/** Small pure check kept separate so payment acceptance can be tested without provider calls. */
type Ref = string | { id: string } | null | undefined;
const idOf = (x: Ref) => (typeof x === "string" ? x : x?.id);
export type SetupInvoice = {
  status?: string;
  currency?: string;
  billing_reason?: string;
  customer?: Ref;
  subscription?: Ref;
  parent?: { subscription_details?: { subscription?: Ref } };
  lines?: {
    has_more?: boolean;
    data?: Array<{
      amount?: number;
      quantity?: number;
      price?: { id: string };
      pricing?: { price_details?: { price?: Ref } };
      discount_amounts?: Array<{ amount: number }>;
      pretax_credit_amounts?: Array<{ amount: number }>;
    }>;
  };
};
export function verifySetupInvoice(
  invoice: SetupInvoice,
  expected: {
    customer: string;
    subscription: string;
    price: string;
    cents: number;
  },
) {
  if (
    invoice.status !== "paid" ||
    invoice.currency !== "usd" ||
    invoice.billing_reason !== "subscription_create" ||
    idOf(invoice.customer) !== expected.customer ||
    idOf(
      invoice.parent?.subscription_details?.subscription ??
        invoice.subscription,
    ) !== expected.subscription ||
    invoice.lines?.has_more
  )
    throw Error("Initial setup invoice needs review.");
  const lines = invoice.lines?.data ?? [];
  const setup = lines.filter(
    (l) => idOf(l.pricing?.price_details?.price ?? l.price) === expected.price,
  );
  if (
    setup.length !== 1 ||
    setup[0].quantity !== 1 ||
    setup[0].amount !== expected.cents ||
    setup[0].discount_amounts?.some((x) => x.amount !== 0) ||
    setup[0].pretax_credit_amounts?.some((x) => x.amount !== 0)
  )
    throw Error("Setup payment does not match the reserved offer.");
}
