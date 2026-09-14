/** Typed times: "9", "9am", "9:30", "17:00", "5 pm" → minutes since midnight. Displayed as "9:00 AM". */

export function formatTime(minutes: number): string {
  if (minutes === 1440) return "Midnight";
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/**
 * Reads what someone typed. Without am/pm, hours 1–12 lean on `assumePm`
 * (true for a closing time, so "5" means 5 PM); 13–24 are taken as 24-hour.
 * Returns null when it isn't a time.
 */
export function parseTimeText(text: string, assumePm = false): number | null {
  const m = text.trim().toLowerCase().match(/^(\d{1,2})(?:[:.]?(\d{2}))?\s*(am|pm|a|p)?$/);
  if (!m) return null;
  let h = Number(m[1]);
  const minutes = Number(m[2] ?? 0);
  const period = m[3]?.[0];
  if (minutes > 59 || h > 24) return null;
  if (period) {
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (period === "p" ? 12 : 0);
  } else if (h <= 12 && h !== 0) {
    h = (h % 12) + (assumePm ? 12 : 0);
  }
  if (h === 24) return minutes === 0 ? 1440 : null;
  return h * 60 + minutes;
}

/** Every 15-minute mark between min and max inclusive, for the suggestion list. */
export function timeOptions(min = 0, max = 1440, step = 15): number[] {
  const out: number[] = [];
  for (let n = Math.ceil(min / step) * step; n <= max; n += step) out.push(n);
  return out;
}
