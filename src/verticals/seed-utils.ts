import { env } from "@/lib/env";
import { addDaysToKey, dayOfWeek, parseDateKey, toDateKey, zonedTimeToUtc } from "@/lib/time";
import type { Provider } from "@/lib/types";

export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;
export const iso = (ms: number) => new Date(ms).toISOString();

/**
 * Places a seeded appointment on the next day the provider actually works, at a
 * time inside their hours — so the demo dashboard never shows a cardiologist
 * booked for 7pm on a Saturday.
 */
export function slotFor(provider: Provider, minDaysAhead: number, hour: number, minute = 0) {
  let key = addDaysToKey(toDateKey(new Date(), env.timezone), minDaysAhead);
  for (let i = 0; i < 7 && !provider.working_days.includes(dayOfWeek(key)); i++) {
    key = addDaysToKey(key, 1);
  }
  const { year, month, day } = parseDateKey(key);
  const start = zonedTimeToUtc(year, month, day, hour, minute, env.timezone);
  const end = new Date(start.getTime() + provider.slot_minutes * 60_000);
  return { starts_at: start.toISOString(), ends_at: end.toISOString() };
}
