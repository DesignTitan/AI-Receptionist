import test from "node:test";
import assert from "node:assert/strict";
import {
  PLANS,
  billableMinutes,
  estimateOverage,
  economics,
  recommendPlan,
  type Plan,
} from "../src/lib/platform/pricing.ts";
test("round only started call minutes, reject unknown durations", () => {
  assert.equal(billableMinutes(0), 0);
  assert.equal(billableMinutes(1), 1);
  assert.equal(billableMinutes(60), 1);
  assert.equal(billableMinutes(61), 2);
  assert.throws(() => billableMinutes(NaN));
  assert.throws(() => billableMinutes(-1));
});
test("allowances and overage match each tier exactly", () => {
  for (const p of Object.keys(PLANS) as Plan[]) {
    assert.equal(estimateOverage(PLANS[p].minutes, p), 0);
    assert.equal(estimateOverage(PLANS[p].minutes + 1, p), 49);
    assert.equal(estimateOverage(PLANS[p].minutes + 100, p), 4900);
  }
});
test("each tier clears 50% contribution with conservative costs and support reserve", () => {
  for (const p of Object.keys(PLANS) as Plan[])
    assert.ok(economics(p).margin >= 0.5, `${p}: ${economics(p).margin}`);
});
test("recommendation compares total monthly cost without changing subscription", () => {
  assert.equal(recommendPlan(200), "front");
  assert.equal(recommendPlan(750), "busy");
  assert.equal(recommendPlan(1600), "full");
});

import { durationSeconds } from "../src/lib/platform/call-report.ts";
test("provider durations retain units and unknown remains unknown", () => {
  assert.equal(durationSeconds({ call_duration_in_seconds: 81 }, {}), 81);
  assert.equal(durationSeconds({ call_duration: "1:21" }, {}), 81);
  assert.equal(durationSeconds({ duration: false }, {}), null);
  assert.equal(durationSeconds({ duration: null }, {}), null);
  assert.equal(durationSeconds({ duration: 0 }, {}), 0);
});
