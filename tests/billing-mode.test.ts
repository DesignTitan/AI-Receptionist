import test from "node:test";
import assert from "node:assert/strict";
import {
  assertStripeObjectMode,
  billingMode,
  stripeConfiguration,
} from "../src/lib/platform/billing-mode.ts";

test("billing stays in test mode unless live mode is explicitly selected", () => {
  assert.equal(billingMode({}), "test");
  assert.equal(billingMode({ STRIPE_MODE: "test" }), "test");
  assert.equal(billingMode({ STRIPE_MODE: "live" }), "live");
  for (const mode of ["", "production", "sandbox", "LIVE", " live "]) {
    assert.throws(() => billingMode({ STRIPE_MODE: mode }), /STRIPE_MODE/);
  }
});

test("server keys must match the selected mode and include an account identity", () => {
  for (const mode of ["test", "live"] as const) {
    for (const prefix of ["sk", "rk"]) {
      const config = {
        STRIPE_MODE: mode,
        STRIPE_SECRET_KEY: `${prefix}_${mode}_fixture`,
        STRIPE_ACCOUNT_ID: "acct_Test123",
      };
      assert.deepEqual(stripeConfiguration(config), {
        mode,
        key: config.STRIPE_SECRET_KEY,
        account: config.STRIPE_ACCOUNT_ID,
      });
    }
    const opposite = mode === "live" ? "test" : "live";
    for (const key of [
      undefined,
      "",
      `sk_${opposite}_fixture`,
      `rk_${opposite}_fixture`,
      `pk_${mode}_fixture`,
      "whsec_fixture",
    ]) {
      assert.throws(
        () =>
          stripeConfiguration({
            STRIPE_MODE: mode,
            STRIPE_SECRET_KEY: key,
            STRIPE_ACCOUNT_ID: "acct_Test123",
          }),
        /credentials do not match/,
      );
    }
  }
  assert.throws(
    () =>
      stripeConfiguration({
        STRIPE_SECRET_KEY: "sk_live_fixture",
        STRIPE_ACCOUNT_ID: "acct_Test123",
      }),
    /credentials do not match/,
  );
  for (const account of [undefined, "", "acct_", "cus_Test123", "acct_Test/123"]) {
    assert.throws(
      () =>
        stripeConfiguration({
          STRIPE_SECRET_KEY: "sk_test_fixture",
          STRIPE_ACCOUNT_ID: account,
        }),
      /account is not configured/,
    );
  }
});

test("Stripe objects from the other billing mode are rejected", () => {
  assert.doesNotThrow(() => assertStripeObjectMode({ livemode: false }, "test"));
  assert.doesNotThrow(() => assertStripeObjectMode({ livemode: true }, "live"));
  assert.throws(
    () => assertStripeObjectMode({ livemode: true }, "test"),
    /different billing mode/,
  );
  assert.throws(
    () => assertStripeObjectMode({ livemode: false }, "live"),
    /different billing mode/,
  );
  // Some API responses have no livemode property; account/key validation covers them.
  assert.doesNotThrow(() => assertStripeObjectMode({}, "test"));
  assert.doesNotThrow(() => assertStripeObjectMode({}, "live"));
});
