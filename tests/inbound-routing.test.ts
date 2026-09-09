import test from "node:test";
import assert from "node:assert/strict";
import { routeInboundCall, unavailableRoute } from "../src/lib/platform/inbound-routing.ts";
import type { PhoneSettings } from "../src/lib/platform/phone-settings.ts";
const settings = { staffNumber: "+12125550101", ringSeconds: 20, noAnswerAction: "ai", fallback: "staff" } as PhoneSettings;
test("menu bookings and human choices stay distinct", () => {
  assert.equal(routeInboundCall(settings, "menu", "arrival").action, "menu");
  assert.equal(routeInboundCall(settings, "menu", "selection", "1").action, "ai");
  assert.equal(routeInboundCall(settings, "menu", "selection", "2").action, "staff");
  assert.equal(routeInboundCall(settings, "menu", "selection", "9").action, "voicemail");
  assert.equal(routeInboundCall(settings, "ai_first", "selection", "2").action, "staff");
});
test("staff-first can overflow but explicit human requests, off and staff-only cannot loop back to AI", () => {
  assert.equal(routeInboundCall(settings, "staff_first", "staff_unavailable").action, "ai");
  assert.equal(routeInboundCall(settings, "menu", "staff_unavailable", undefined, true).action, "voicemail");
  for (const mode of ["off", "staff_only"] as const) {
    assert.equal(routeInboundCall(settings, mode, "selection", "1").action, "staff");
    assert.equal(routeInboundCall(settings, mode, "staff_unavailable").action, "voicemail");
  }
  assert.equal(unavailableRoute(settings, "staff_unavailable", "budget").action, "voicemail");
  assert.equal(unavailableRoute(settings, "arrival", "budget").action, "staff");
  assert.equal(routeInboundCall({ ...settings, staffNumber: null }, "staff_first", "arrival").action, "voicemail");
});
