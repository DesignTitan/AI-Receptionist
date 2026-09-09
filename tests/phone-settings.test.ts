import test from "node:test";
import assert from "node:assert/strict";
import { defaultPhoneSettings, validatePhoneSettings, resolvePhoneRoute, type PhoneSettings } from "../src/lib/platform/phone-settings.ts";

const config = { timezone: "America/New_York", days: [1,2,3,4,5], opens: "09:00", closes: "17:00" };
const settings = (patch: Partial<PhoneSettings> = {}) => validatePhoneSettings({ ...defaultPhoneSettings(config), inboundEnabled: true, ...patch }, config);
const route = (value: PhoneSettings, date: string, timezone = config.timezone) => resolvePhoneRoute(value, timezone, new Date(date));

test("phone defaults preserve confirmation calls and require opt-in for incoming calls", () => {
  const value = validatePhoneSettings({}, config);
  assert.equal(value.confirmationCalls, true);
  assert.equal(value.inboundEnabled, false);
  assert.equal(value.weeklyHours.length, 7);
  assert.equal(value.weeklyHours[0].enabled, false);
  assert.equal(route(value, "2026-09-14T14:00:00Z").mode, "off");
  assert.equal(settings({ confirmationCalls: false }).confirmationCalls, false);
});
test("phone settings reject spoofed connection fields, coercion and invalid timezone/time", () => {
  for (const input of [null, [], { inboundEnabled: "true" }, { status: "ready" }, { secret_hash: "x" }, { ringSeconds: 0 }, { ringSeconds: 20.5 }, { businessHoursMode: "off" }]) assert.throws(() => validatePhoneSettings(input, config));
  for (const timezone of ["", " ", "America/Nowhere"]) assert.throws(() => defaultPhoneSettings({ ...config, timezone }));
  for (const opens of ["", "9:00", "24:00", "12:60"]) assert.throws(() => settings({ weeklyHours: defaultPhoneSettings(config).weeklyHours.map(day => ({ ...day, opens })) }));
  assert.throws(() => resolvePhoneRoute(settings(), config.timezone, new Date("invalid")));
});
test("staff targets require E164 and cannot loop into a protected public or AI number", () => {
  for (const staffNumber of ["2125550123", "+02125550123", "+1212", " +12125550123", "+1212 5550123"]) assert.throws(() => settings({ staffNumber }));
  assert.throws(() => validatePhoneSettings({ staffNumber: "+12125550123" }, config, ["(212) 555-0123"]), /loop/);
  assert.throws(() => validatePhoneSettings({ staffNumber: "+442079460123" }, config, [null, "+442079460123"]), /loop/);
  assert.throws(() => settings({ fallback: "staff" }), /staff number/);
  assert.throws(() => settings({ afterHoursMode: "staff_only" }), /staff number/);
  assert.equal(settings({ staffNumber: "+12125550124", businessHoursMode: "staff_first", fallback: "staff" }).staffNumber, "+12125550124");
});
test("all seven unique days are required and a full day uses 00:00–24:00", () => {
  const value = settings();
  assert.throws(() => settings({ weeklyHours: value.weeklyHours.slice(1) }));
  assert.throws(() => settings({ weeklyHours: value.weeklyHours.map(day => ({ ...day, day: 1 })) }));
  assert.throws(() => settings({ weeklyHours: value.weeklyHours.map(day => ({ ...day, closes: day.opens })) }));
  const full = settings({ weeklyHours: value.weeklyHours.map(day => ({ ...day, enabled: day.day === 0, opens: "00:00", closes: "24:00" })) });
  assert.equal(route(full, "2026-09-14T03:59:59Z").reason, "business_hours");
  assert.equal(route(full, "2026-09-14T04:00:00Z").reason, "after_hours");
});
test("weekly windows include opening and exclude closing in the business timezone", () => {
  const value = settings();
  assert.equal(route(value, "2026-09-14T12:59:59Z").reason, "after_hours");
  assert.equal(route(value, "2026-09-14T13:00:00Z").reason, "business_hours");
  assert.equal(route(value, "2026-09-14T21:00:00Z").reason, "after_hours");
  assert.equal(route(value, "2026-09-13T16:00:00Z").reason, "after_hours");
});
test("overnight hours belong to their opening day and stop at next-day closing", () => {
  const value = settings({ weeklyHours: defaultPhoneSettings(config).weeklyHours.map(day => ({ ...day, enabled: day.day === 5, opens: "22:00", closes: "02:00" })) });
  assert.equal(route(value, "2026-09-12T01:59:00Z").reason, "after_hours");
  assert.equal(route(value, "2026-09-12T02:00:00Z").reason, "business_hours");
  assert.equal(route(value, "2026-09-12T05:59:00Z").reason, "business_hours");
  assert.equal(route(value, "2026-09-12T06:00:00Z").reason, "after_hours");
});
test("DST gaps and repeated hours resolve from actual instants without guessing offsets", () => {
  const value = settings({ weeklyHours: defaultPhoneSettings(config).weeklyHours.map(day => ({ ...day, enabled: day.day === 0, opens: "01:00", closes: "02:00" })) });
  assert.equal(route(value, "2026-03-08T06:59:00Z").reason, "business_hours");
  assert.equal(route(value, "2026-03-08T07:00:00Z").reason, "after_hours");
  assert.equal(route(value, "2026-11-01T05:30:00Z").reason, "business_hours");
  assert.equal(route(value, "2026-11-01T06:30:00Z").reason, "business_hours");
  assert.equal(route(value, "2026-11-01T07:00:00Z").reason, "after_hours");
});
test("holidays use inclusive local dates and reject invalid, reversed or overlapping ranges", () => {
  const holiday = { id: "vacation", label: "Time away", startsOn: "2026-09-14", endsOn: "2026-09-15", mode: "ai_first" as const };
  const value = settings({ holidays: [holiday] });
  assert.equal(route(value, "2026-09-14T03:59:00Z").reason, "after_hours");
  assert.equal(route(value, "2026-09-14T04:00:00Z").holidayLabel, "Time away");
  assert.equal(route(value, "2026-09-16T03:59:00Z").reason, "holiday");
  assert.equal(route(value, "2026-09-16T04:00:00Z").reason, "after_hours");
  for (const startsOn of ["", "2026-02-29", "2026-04-31", "2026-09-16"]) assert.throws(() => settings({ holidays: [{ ...holiday, startsOn }] }));
  assert.throws(() => settings({ holidays: [holiday, { ...holiday, id: "overlap", startsOn: "2026-09-15", endsOn: "2026-09-20" }] }));
  assert.throws(() => settings({ holidays: [{ ...holiday, label: " " }] }));
});
test("temporary changes expire exactly on time and disabled routing always takes priority", () => {
  const value = settings({ override: { mode: "ai_first", expiresAt: "2026-09-14T14:00:00Z" } });
  assert.equal(route(value, "2026-09-14T13:59:59Z").reason, "override");
  assert.equal(route(value, "2026-09-14T14:00:00Z").reason, "business_hours");
  assert.equal(route({ ...value, inboundEnabled: false }, "2026-09-14T13:59:59Z").mode, "off");
  const holiday = { id: "away", label: "Away", startsOn: "2026-09-14", endsOn: "2026-09-14", mode: "menu" as const };
  const onHoliday = settings({ ...value, holidays: [holiday] });
  assert.equal(route(onHoliday, "2026-09-14T13:59:59Z").reason, "override");
  assert.equal(route(onHoliday, "2026-09-14T14:00:00Z").reason, "holiday");
  for (const expiresAt of ["", "2026-02-30T12:00:00Z", "2026-09-14T14:00:00", "2026-09-14T14:00:00-04:00"]) assert.throws(() => settings({ override: { mode: "menu", expiresAt } }));
});
