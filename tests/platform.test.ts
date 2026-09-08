import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyStripe } from "../src/lib/platform/billing.ts";
import {
  validateConfig,
  planOf,
  phone,
  slugFor,
} from "../src/lib/platform/model.ts";
import { slotsFor } from "../src/lib/platform/slots.ts";
const config = () => ({
  trade: "salon" as const,
  timezone: "America/New_York",
  days: [1, 2, 3, 4, 5],
  opens: "09:00",
  closes: "17:00",
  color: "#234d59",
  areaCode: "212",
  address: "Test address",
  phone: "2125550100",
  team: [
    { id: "member-1", name: "Taylor", service: "Consultation", minutes: 30 },
  ],
});
test("signup validates hours, team durations, timezone and billing plan", () => {
  assert.equal(validateConfig(config()).phone, "+12125550100");
  assert.throws(() => validateConfig({ ...config(), closes: "08:00" }));
  assert.throws(() => validateConfig({ ...config(), timezone: "made-up" }));
  assert.throws(() =>
    validateConfig({
      ...config(),
      team: [{ ...config().team[0], minutes: 0 }],
    }),
  );
  assert.throws(() => planOf("__proto__"));
  assert.throws(() => phone("911"));
});
test("customer slugs cannot become paths or inject markup", () => {
  assert.equal(
    slugFor("../../Example <script>", "12345678-abc"),
    "example-script-12345678",
  );
});
test("slots use business timezone and refuse any overlapping booking", () => {
  const c = config();
  const slots = slotsFor(
    c,
    c.team[0],
    "2026-09-08",
    [{ starts_at: "2026-09-08T13:15:00Z", ends_at: "2026-09-08T13:45:00Z" }],
    new Date("2026-09-07T12:00:00Z"),
  );
  assert.equal(slots[0].start, "2026-09-08T14:00:00.000Z");
  assert.equal(slots.length, 14);
});
test("closed days, expired dates, excessive horizon and insufficient notice are excluded", () => {
  const c = config();
  const now = new Date("2026-09-08T13:00:00Z");
  assert.equal(slotsFor(c, c.team[0], "2026-09-06", [], now).length, 0);
  assert.equal(slotsFor(c, c.team[0], "2027-09-08", [], now).length, 0);
  assert.equal(
    slotsFor(c, c.team[0], "2026-09-08", [], now)[0].start,
    "2026-09-08T14:30:00.000Z",
  );
});

test("Stripe rejects expired, malformed and tampered callbacks but accepts signed retries", () => {
  const raw = '{"id":"evt_test"}';
  const now = 1700000000000;
  const timestamp = String(now / 1000);
  const digest = createHmac("sha256", "secret")
    .update(`${timestamp}.${raw}`)
    .digest("hex");
  const signature = `t=${timestamp},v1=${digest}`;
  assert.equal(verifyStripe(raw, signature, "secret", now), true);
  assert.equal(verifyStripe(raw + " ", signature, "secret", now), false);
  assert.equal(verifyStripe(raw, signature, "secret", now + 301000), false);
  assert.equal(verifyStripe(raw, "t=no,v1=00", "secret", now), false);
  assert.equal(
    verifyStripe(raw, `t=${timestamp},v1=00,v1=${digest}`, "secret", now),
    true,
  );
});
