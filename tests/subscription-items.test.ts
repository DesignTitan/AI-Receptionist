import test from "node:test";
import assert from "node:assert/strict";
import { subscriptionItems } from "../src/lib/platform/subscription-items.ts";
import { setupCents, PLANS } from "../src/lib/platform/pricing.ts";
const fixed = { quantity: 1, price: { id: "price_busy", recurring: { usage_type: "licensed" } } };
const usage = { price: { id: "price_usage", recurring: { usage_type: "metered" } } };
test("new purchases need only the fixed plan; existing subscriptions keep strict metering", () => {
 assert.equal(subscriptionItems([fixed], true).metered, undefined);
 assert.throws(() => subscriptionItems([fixed], false));
 assert.equal(subscriptionItems([usage, fixed], false).fixed, fixed);
 assert.equal(subscriptionItems([fixed, usage], true).metered, usage);
 for (const items of [[], [usage], [fixed, fixed], [fixed, usage, usage], [{...fixed, quantity:2}]])
   assert.throws(() => subscriptionItems(items, true));
});
test("new setup charges and first payments are exact", () => {
 assert.equal(setupCents("front"), 8900);
 assert.equal(setupCents("busy"), 8900);
 assert.equal(setupCents("full"), 49900);
 assert.equal(PLANS.busy.monthly * 100 + setupCents("busy"), 48800);
});
