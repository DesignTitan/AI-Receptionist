/**
 * Timezone-aware date helpers.
 *
 * Everything is stored as a UTC instant (ISO string). The clinic operates in a
 * single IANA timezone (`CLINIC_TIMEZONE`), so slot generation and all display
 * formatting are anchored there — not to the server's locale, which on Vercel
 * is UTC and would otherwise shift every appointment time.
 */

const partsOf = (date: Date, timeZone: string) => {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const out: Record<string, number> = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") out[part.type] = Number(part.value);
  }
  // Some engines render midnight as hour 24.
  if (out.hour === 24) out.hour = 0;
  return out;
};

/** Offset of `timeZone` from UTC, in milliseconds, at the given instant. */
const offsetMs = (date: Date, timeZone: string) => {
  const p = partsOf(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - date.getTime();
};

/** Convert a wall-clock time in `timeZone` into the matching UTC instant. */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const first = offsetMs(new Date(guess), timeZone);
  let ts = guess - first;
  const second = offsetMs(new Date(ts), timeZone);
  // Re-check once: fixes instants that land on a DST boundary.
  if (second !== first) ts = guess - second;
  return new Date(ts);
}

/** "2026-09-14" for the given instant, as seen in `timeZone`. */
export function toDateKey(date: Date, timeZone: string): string {
  const p = partsOf(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function parseDateKey(key: string): { year: number; month: number; day: number } {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month, day };
}

/** Day of week (0 = Sunday) for a date key — calendar math, no timezone needed. */
export function dayOfWeek(key: string): number {
  const { year, month, day } = parseDateKey(key);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** Date key `days` after `key`. */
export function addDaysToKey(key: string, days: number): string {
  const { year, month, day } = parseDateKey(key);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
}

export function parseTimeOfDay(value: string): { hour: number; minute: number } {
  const [hour, minute] = value.split(":").map(Number);
  return { hour, minute: minute || 0 };
}

const cache = new Map<string, Intl.DateTimeFormat>();
const formatter = (timeZone: string, options: Intl.DateTimeFormatOptions) => {
  const key = timeZone + JSON.stringify(options);
  let fmt = cache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-US", { ...options, timeZone });
    cache.set(key, fmt);
  }
  return fmt;
};

export const formatTime = (iso: string | Date, timeZone: string) =>
  formatter(timeZone, { hour: "numeric", minute: "2-digit" }).format(new Date(iso));

export const formatDate = (iso: string | Date, timeZone: string) =>
  formatter(timeZone, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));

export const formatShortDate = (iso: string | Date, timeZone: string) =>
  formatter(timeZone, { weekday: "short", month: "short", day: "numeric" }).format(
    new Date(iso),
  );

export const formatDateTime = (iso: string | Date, timeZone: string) =>
  `${formatShortDate(iso, timeZone)} · ${formatTime(iso, timeZone)}`;

/** Short timezone label, e.g. "EDT". */
export const timezoneLabel = (timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short",
  }).formatToParts(new Date());
  return parts.find((p) => p.type === "timeZoneName")?.value ?? timeZone;
};

/** "2 minutes ago" / "in 3 days" */
export function relativeTime(iso: string | Date): string {
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["second", 1000],
    ["minute", 60_000],
    ["hour", 3_600_000],
    ["day", 86_400_000],
    ["week", 604_800_000],
    ["month", 2_629_800_000],
    ["year", 31_557_600_000],
  ];
  let chosen: [Intl.RelativeTimeFormatUnit, number] = units[0];
  for (const unit of units) if (abs >= unit[1]) chosen = unit;
  return rtf.format(Math.round(diff / chosen[1]), chosen[0]);
}

export const formatDuration = (seconds: number | null) => {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};
