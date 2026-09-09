import test from "node:test";
import assert from "node:assert/strict";
import { phoneSettingsRevision } from "../src/lib/platform/phone-settings-revision.ts";
import { defaultPhoneSettings } from "../src/lib/platform/phone-settings.ts";

const config = { timezone: "America/New_York", days: [1, 2, 3, 4, 5], opens: "09:00", closes: "17:00" };

test("a save response keeps the same revision after JSONB reorders nested keys", () => {
  const submitted = {
    ...defaultPhoneSettings(config),
    inboundEnabled: true,
    override: { mode: "ai_first", expiresAt: "2026-09-10T16:00:00.000Z" },
    holidays: [{ id: "vacation", label: "Time away", startsOn: "2026-09-20", endsOn: "2026-09-21", mode: "menu" }],
  };
  // A stored/read response can have a different key order at every object level.
  const persisted = {
    override: { expiresAt: submitted.override.expiresAt, mode: submitted.override.mode },
    holidays: [{ mode: "menu", endsOn: "2026-09-21", startsOn: "2026-09-20", label: "Time away", id: "vacation" }],
    fallback: submitted.fallback,
    noAnswerAction: submitted.noAnswerAction,
    ringSeconds: submitted.ringSeconds,
    staffNumber: submitted.staffNumber,
    weeklyHours: submitted.weeklyHours.map(day => ({ closes: day.closes, opens: day.opens, enabled: day.enabled, day: day.day })),
    afterHoursMode: submitted.afterHoursMode,
    businessHoursMode: submitted.businessHoursMode,
    inboundEnabled: submitted.inboundEnabled,
    confirmationCalls: submitted.confirmationCalls,
  };
  assert.notEqual(JSON.stringify(submitted), JSON.stringify(persisted));
  assert.equal(phoneSettingsRevision(submitted), phoneSettingsRevision(persisted));
  assert.match(phoneSettingsRevision(submitted), /^[a-f0-9]{64}$/);
});

test("real edits still invalidate a revision, including values nested inside arrays", () => {
  const original = defaultPhoneSettings(config);
  const revision = phoneSettingsRevision(original);
  assert.notEqual(revision, phoneSettingsRevision({ ...original, confirmationCalls: false }));
  assert.notEqual(revision, phoneSettingsRevision({ ...original, weeklyHours: original.weeklyHours.map(day => day.day === 1 ? { ...day, opens: "10:00" } : day) }));
  assert.notEqual(revision, phoneSettingsRevision({ ...original, weeklyHours: [...original.weeklyHours].reverse() }));
});

test("legacy missing settings and the migration's empty object share a revision", () => {
  assert.equal(phoneSettingsRevision(undefined), phoneSettingsRevision({}));
  assert.equal(phoneSettingsRevision(null), phoneSettingsRevision({}));
  assert.notEqual(phoneSettingsRevision({}), phoneSettingsRevision(defaultPhoneSettings(config)));
});
