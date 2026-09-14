import test from "node:test";
import assert from "node:assert/strict";
import { acceptLookup, applyAnswer, interviewProgress, nextStep, normalizePhone, promptFor, toSetupDraft, weeklyHoursForPreset, type InterviewAnswers } from "../src/lib/platform/setup-interview.ts";
import { hoursFromPeriods, lookupFromPlace, tradeFromTypes } from "../src/lib/platform/business-lookup.ts";

test("asks for the phone first and walks the manual path in order", () => {
  let a: InterviewAnswers = {};
  assert.equal(nextStep(a), "phone");
  a = applyAnswer("phone", "313-555-0142", a).answers;
  assert.equal(a.phone, "(313) 555-0142");
  a = { ...a, lookup: null };
  assert.equal(nextStep(a), "name");
  a = applyAnswer("name", "Willow Studio", a).answers;
  assert.equal(nextStep(a), "trade");
  a = applyAnswer("trade", "other", a).answers;
  assert.equal(nextStep(a), "customTrade");
  a = applyAnswer("customTrade", "Dog grooming", a).answers;
  assert.equal(nextStep(a), "address");
  a = applyAnswer("address", "123 Example Street, Detroit, MI", a).answers;
  assert.equal(nextStep(a), "hours");
  a = applyAnswer("hours", "tue_sat", a).answers;
  assert.equal(nextStep(a), "minutes");
  a = applyAnswer("minutes", "45", a).answers;
  assert.equal(nextStep(a), "answering");
  a = applyAnswer("answering", "backup", a).answers;
  assert.equal(nextStep(a), "done");
  assert.equal(interviewProgress(a), 1);
});

test("rejects bad answers without changing state", () => {
  const a: InterviewAnswers = {};
  const bad = applyAnswer("phone", "555-0142", a);
  assert.ok(bad.error);
  assert.deepEqual(bad.answers, a);
  assert.equal(normalizePhone("+1 (313) 555-0142"), "(313) 555-0142");
  assert.equal(normalizePhone("(113) 555-0142"), null);
  assert.ok(applyAnswer("answering", "undecided", a).error);
});

test("a confirmed listing fills the fields and skips their questions", () => {
  const a: InterviewAnswers = { phone: "(313) 555-0142", lookup: { name: "Willow Studio", address: "1450 Woodward Ave, Detroit, MI 48226", trade: "salon", weeklyHours: weeklyHoursForPreset("tue_sat") } };
  assert.equal(nextStep(a), "confirm");
  assert.match(promptFor("confirm", a).text, /Willow Studio/);
  const yes = applyAnswer("confirm", "yes", a).answers;
  assert.equal(yes.businessName, "Willow Studio");
  assert.equal(yes.trade, "salon");
  assert.equal(nextStep(yes), "minutes");
  const no = applyAnswer("confirm", "no", a).answers;
  assert.equal(no.lookupConfirmed, false);
  assert.equal(nextStep(no), "name");
  assert.equal(acceptLookup({ phone: "x" }).businessName, undefined);
});

test("hours presets produce a valid week and custom starts from weekdays", () => {
  const week = weeklyHoursForPreset("weekdays");
  assert.deepEqual(week.filter(d => d.enabled).map(d => d.day), [1, 2, 3, 4, 5]);
  const custom = applyAnswer("hours", "custom", { phone: "x" });
  assert.equal(custom.answers.hoursPreset, "custom");
  assert.ok(custom.reply);
});

test("produces the same draft shape the current form saves", () => {
  const a: InterviewAnswers = { phone: "(313) 555-0142", businessName: "Willow Studio", trade: "salon", address: "123 Example Street, Detroit, MI", weeklyHours: weeklyHoursForPreset("tue_sat"), minutes: 45, answering: "always" };
  const draft = toSetupDraft(a);
  assert.equal(draft.details.areaCode, "313");
  assert.equal(draft.details.answeringPreference, "always");
  assert.deepEqual(draft.days, [2, 3, 4, 5, 6]);
  assert.equal(draft.closes, "18:00");
  assert.equal(draft.team[0].minutes, 45);
});

test("maps a Google place into a lookup, dropping the country and classifying the trade", () => {
  const lookup = lookupFromPlace({
    displayName: { text: "Willow Studio" },
    formattedAddress: "1450 Woodward Ave, Detroit, MI 48226, USA",
    nationalPhoneNumber: "(313) 555-0142",
    websiteUri: "https://willow.example",
    primaryType: "hair_salon",
    types: ["hair_salon", "point_of_interest"],
    regularOpeningHours: { periods: [{ open: { day: 2, hour: 9, minute: 0 }, close: { day: 2, hour: 18, minute: 30 } }, { open: { day: 6, hour: 10, minute: 0 }, close: { day: 0, hour: 1, minute: 0 } }] },
  });
  assert.ok(lookup);
  assert.equal(lookup.address, "1450 Woodward Ave, Detroit, MI 48226");
  assert.equal(lookup.trade, "salon");
  assert.equal(lookup.customTrade, undefined);
  const tue = lookup.weeklyHours!.find(d => d.day === 2)!;
  assert.deepEqual([tue.enabled, tue.opens, tue.closes], [true, "09:00", "18:30"]);
  assert.equal(lookup.weeklyHours!.find(d => d.day === 6)!.closes, "23:45");
  assert.equal(lookup.weeklyHours!.find(d => d.day === 1)!.enabled, false);
});

test("unknown business types fall back to 'other' with a readable label", () => {
  assert.deepEqual(tradeFromTypes(["veterinary_care"], "veterinary_care"), { trade: "other", customTrade: "veterinary care" });
  assert.equal(hoursFromPeriods([]), undefined);
  assert.equal(lookupFromPlace({ displayName: { text: "" } }), undefined);
});
