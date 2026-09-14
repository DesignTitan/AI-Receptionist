import test from "node:test";
import assert from "node:assert/strict";
import { guideMessage, isQuestion, localHelp, missingFields } from "../src/lib/platform/setup-help.ts";
import { weeklyHoursForPreset } from "../src/lib/platform/setup-interview.ts";

test("tells the owner what is filled in and what is missing", () => {
  const partial = { phone: "(313) 555-0142", businessName: "Willow Studio", trade: "salon" as const };
  assert.deepEqual(missingFields(partial), ["address", "business hours", "appointment length", "when Bubs™ answers"]);
  assert.match(guideMessage(partial), /Here’s what I have so far: Willow Studio\. Still missing: address, business hours, appointment length and when Bubs™ answers\./);
  const full = { ...partial, address: "123 Example Street, Detroit, MI", weeklyHours: weeklyHoursForPreset("tue_sat"), minutes: 45, answering: "always" as const };
  assert.deepEqual(missingFields(full), []);
  assert.match(guideMessage(full), /Tuesday to Saturday, 9 am to 6 pm; 45-minute appointments\. Look it over/);
  assert.deepEqual(missingFields({ trade: "other" }).includes("business type"), true);
});

test("tells questions apart from answers", () => {
  assert.equal(isQuestion("What should I put for hours?"), true);
  assert.equal(isQuestion("how long is an appointment"), true);
  assert.equal(isQuestion("I'm not sure what this means"), true);
  assert.equal(isQuestion("Willow Studio"), false);
  assert.equal(isQuestion("123 Example Street, Detroit, MI"), false);
});

test("answers field questions without a model", () => {
  assert.match(localHelp("what are business hours for?", {}), /when customers can book/i);
  assert.match(localHelp("which area code should I use", {}), /business phone/i);
  assert.match(localHelp("what's still missing?", { phone: "x" }), /Still to fill in: business name/);
  assert.match(localHelp("banana", {}), /Which one\?/);
});

test("plain requests change the card: days, times, appointment length, name", async () => {
  const { applyCommand } = await import("../src/lib/platform/setup-help.ts");
  const base = { businessName: "Willow Studio", weeklyHours: weeklyHoursForPreset("everyday"), minutes: 45 };
  const closed = applyCommand("You update that for me. Uncheck Sundays and Saturdays.", base)!;
  assert.deepEqual(closed.answers.weeklyHours!.filter(d => d.enabled).map(d => d.day), [1, 2, 3, 4, 5]);
  assert.match(closed.reply, /Sunday and Saturday are now closed/);
  const reopened = applyCommand("open on saturdays", closed.answers)!;
  assert.equal(reopened.answers.weeklyHours![6].enabled, true);
  const later = applyCommand("we open at 10", base)!;
  assert.equal(later.answers.weeklyHours![1].opens, "10:00");
  const earlier = applyCommand("close at 5:30", base)!;
  assert.equal(earlier.answers.weeklyHours![1].closes, "17:30");
  const hour = applyCommand("make appointments an hour", base)!;
  assert.equal(hour.answers.minutes, 60);
  const odd = applyCommand("appointments are 50 minutes", base)!;
  assert.equal(odd.answers.minutes, 45);
  assert.match(odd.reply, /nearest/);
  const renamed = applyCommand("Change the name to Willow Hair Studio", base)!;
  assert.equal(renamed.answers.businessName, "Willow Hair Studio");
  assert.equal(applyCommand("What are business hours for?", base), null);
  assert.equal(applyCommand("close every day", base)!.answers, base, "refuses to leave no open days");
});
