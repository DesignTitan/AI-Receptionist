import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PHONE_SETUP, validatePhoneSetup, phoneSetupGuidance } from "../src/lib/platform/phone-provider.ts";
test("phone onboarding accepts unknown service without pretending to connect it", () => {
  assert.deepEqual(validatePhoneSetup(DEFAULT_PHONE_SETUP), DEFAULT_PHONE_SETUP);
  assert.match(phoneSetupGuidance(DEFAULT_PHONE_SETUP), /identify/);
  assert.match(phoneSetupGuidance({ ...DEFAULT_PHONE_SETUP, provider: "comcast" }), /VoiceEdge/);
  assert.match(phoneSetupGuidance({ ...DEFAULT_PHONE_SETUP, provider: "tmobile" }), /separate/);
});
test("phone onboarding validates provider keys and bounds notes", () => {
  assert.throws(() => validatePhoneSetup({ ...DEFAULT_PHONE_SETUP, provider: "__proto__" }));
  assert.throws(() => validatePhoneSetup({ ...DEFAULT_PHONE_SETUP, serviceType: "invented" }));
  assert.throws(() => validatePhoneSetup({ ...DEFAULT_PHONE_SETUP, bookingSystem: "x".repeat(161) }));
  const result = validatePhoneSetup({ ...DEFAULT_PHONE_SETUP, provider: "other", serviceName: " Local carrier ", ready: true });
  assert.equal(result.serviceName, "Local carrier");
  assert.equal("ready" in result, false);
});
