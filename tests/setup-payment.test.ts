import test from "node:test";
import assert from "node:assert/strict";
import {
  verifySetupInvoice,
  type SetupInvoice,
} from "../src/lib/platform/setup-payment.ts";
const expected = {
  customer: "cus_test",
  subscription: "sub_test",
  price: "price_pilot",
  cents: 29900,
};
const invoice = (): SetupInvoice => ({
  status: "paid",
  currency: "usd",
  billing_reason: "subscription_create",
  customer: "cus_test",
  parent: { subscription_details: { subscription: "sub_test" } },
  lines: {
    has_more: false,
    data: [
      {
        amount: 29900,
        quantity: 1,
        pricing: { price_details: { price: "price_pilot" } },
        discount_amounts: [],
      },
    ],
  },
});
test("accept only the paid initial setup invoice for the frozen offer", () => {
  assert.doesNotThrow(() => verifySetupInvoice(invoice(), expected));
  for (const patch of [
    { status: "open" },
    { currency: "eur" },
    { billing_reason: "subscription_cycle" },
    { customer: "cus_foreign" },
  ])
    assert.throws(() =>
      verifySetupInvoice({ ...invoice(), ...patch }, expected),
    );
  for (const patch of [
    { amount: 100000 },
    { quantity: 2 },
    { discount_amounts: [{ amount: 5000 }] },
    { pricing: { price_details: { price: "price_standard" } } },
  ]) {
    const i = invoice();
    Object.assign(i.lines!.data![0], patch);
    assert.throws(() => verifySetupInvoice(i, expected));
  }
  const duplicate = invoice();
  duplicate.lines!.data!.push({ ...duplicate.lines!.data![0] });
  assert.throws(() => verifySetupInvoice(duplicate, expected));
  const more = invoice();
  more.lines!.has_more = true;
  assert.throws(() => verifySetupInvoice(more, expected));
});
