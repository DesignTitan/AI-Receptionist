import test from "node:test";
import assert from "node:assert/strict";
import { bookingSlug, forwardingSteps, greetingScript, openingsPreview, spokenDays, spokenHours, spokenTime } from "../src/lib/platform/setup-journey.ts";
import { weeklyHoursForPreset } from "../src/lib/platform/setup-interview.ts";

test("speaks times and day ranges the way a receptionist would", () => {
  assert.equal(spokenTime("09:00"), "9 am");
  assert.equal(spokenTime("18:30"), "6:30 pm");
  assert.equal(spokenTime("12:00"), "12 pm");
  assert.equal(spokenTime("24:00"), "midnight");
  assert.equal(spokenHours(weeklyHoursForPreset("always")), "24 hours, every day");
  assert.match(greetingScript({ businessName: "Night Owl", weeklyHours: weeklyHoursForPreset("always") }), /open 24 hours, every day\./);
  assert.equal(spokenDays(weeklyHoursForPreset("tue_sat")), "Tuesday to Saturday");
  assert.equal(spokenDays(weeklyHoursForPreset("everyday")), "every day");
  const mwf = weeklyHoursForPreset("weekdays").map(d => ({ ...d, enabled: [1, 3, 5].includes(d.day) }));
  assert.equal(spokenDays(mwf), "Monday, Wednesday and Friday");
});

test("greeting uses the business name and hours, and copes with nothing answered", () => {
  const full = greetingScript({ businessName: "Willow Studio", weeklyHours: weeklyHoursForPreset("tue_sat") });
  assert.equal(full, "Thanks for calling Willow Studio, this is Bubs. We’re open Tuesday to Saturday, 9 am to 6 pm. Would you like to book an appointment, or is there something else I can help with?");
  assert.match(greetingScript({}), /^Thanks for calling the front desk, this is Bubs\. Would you like/);
});

test("booking slug is URL-safe with a fallback", () => {
  assert.equal(bookingSlug("Willow Studio & Spa!"), "willow-studio-spa");
  assert.equal(bookingSlug(undefined), "your-business");
});

test("openings preview lists the next open days with slot counts", () => {
  const from = new Date(2026, 8, 14); // Monday 14 Sep 2026
  const list = openingsPreview(weeklyHoursForPreset("tue_sat"), 45, from);
  assert.deepEqual(list.map(o => o.label), ["Tue 15 Sep", "Wed 16 Sep", "Thu 17 Sep"]);
  assert.equal(list[0].slots, 12);
  assert.deepEqual(openingsPreview(undefined, 45, from), []);
});

test("forwarding steps are carrier specific and honest about the unknown case", () => {
  assert.match(forwardingSteps("verizon", "(313) 555-0100").steps[0], /\*72 then \(313\) 555-0100/);
  assert.match(forwardingSteps("tmobile").steps[0], /\*\*21\*/);
  assert.equal(forwardingSteps("none").title, "No forwarding needed");
  assert.match(forwardingSteps("ringcentral").steps[0], /admin portal/);
  assert.match(forwardingSteps(undefined).title, /find your carrier/);
});

test("resume message proves Bubs remembers instead of replaying the chat", async () => {
  const { resumeMessage } = await import("../src/lib/platform/setup-journey.ts");
  const full = resumeMessage({ businessName: "Willow Studio", address: "123 Example Street, Detroit, MI", weeklyHours: weeklyHoursForPreset("tue_sat"), minutes: 45 }, true);
  assert.equal(full, "Welcome back. I still have everything for Willow Studio: 123 Example Street, Detroit, MI; Tuesday to Saturday, 9 am to 6 pm; 45-minute appointments. Change anything under What Bubs™ knows, or carry on.");
  assert.equal(resumeMessage({ phone: "(313) 555-0142", businessName: "Willow Studio" }, false), "Welcome back. So far I have your phone number, your business name. Let’s carry on.");
});

test("confirmation script keeps its placeholders and custom wording wins over generated", async () => {
  const { confirmationScript, effectiveGreeting, effectiveConfirmation } = await import("../src/lib/platform/setup-journey.ts");
  const c = confirmationScript({ businessName: "Willow Studio" });
  assert.match(c, /Willow Studio/);
  for (const ph of ["{customer}", "{day}", "{time}"]) assert.ok(c.includes(ph), ph);
  assert.equal(effectiveGreeting({ businessName: "Willow Studio", greeting: "Hey, Willow here!" }), "Hey, Willow here!");
  assert.match(effectiveGreeting({ businessName: "Willow Studio", greeting: "   " }), /^Thanks for calling Willow Studio/);
  assert.equal(effectiveConfirmation({ confirmation: "Custom" }), "Custom");
});
