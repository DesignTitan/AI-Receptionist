import test from "node:test";
import assert from "node:assert/strict";
import { planReturnUrl } from "../src/lib/platform/plan-navigation.ts";
test("returns to the original pricing surface and selected plan", () => {
  assert.equal(planReturnUrl("/?preview=untinted-industries#industries", "front"), "/?preview=untinted-industries#plan-card-front");
  assert.equal(planReturnUrl("/pricing?billing=monthly", "full"), "/pricing?billing=monthly#plan-card-full");
});
test("direct checkout and untrusted destinations use a local plan fallback", () => {
  for (const source of [undefined, "https://foreign.test", "//foreign.test", "/\\foreign.test", "/start", "/account"])
    assert.equal(planReturnUrl(source, "busy"), "/#plan-card-busy");
});
