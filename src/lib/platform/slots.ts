import {weeklyHoursFor} from "./weekly-hours.ts";
import {
  addDaysToKey,
  dayOfWeek,
  formatTime,
  parseDateKey,
  toDateKey,
  zonedTimeToUtc,
} from "../time.ts";
import type { BusinessConfig, TeamMember } from "./model.ts";
export function slotsFor(
  config: BusinessConfig,
  member: TeamMember,
  date: string,
  occupied: { starts_at: string; ends_at: string }[],
  now = new Date(),
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const calendarDate = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(+calendarDate) || calendarDate.toISOString().slice(0, 10) !== date) return [];
  const today = toDateKey(now, config.timezone);
  const hours=weeklyHoursFor(config).find(d=>d.day===dayOfWeek(date));
  if (
    date < today ||
    date > addDaysToKey(today, 30) ||
    !hours?.enabled
  )
    return [];
  const { year, month, day } = parseDateKey(date);
  const minutes = (s: string) =>
    Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  const results = [];
  for (
    let m = minutes(hours.opens);
    m + member.minutes <= minutes(hours.closes);
    m += member.minutes
  ) {
    const start = zonedTimeToUtc(
      year,
      month,
      day,
      Math.floor(m / 60),
      m % 60,
      config.timezone,
    );
    const end = new Date(start.getTime() + member.minutes * 60000);
    if (start.getTime() < now.getTime() + 90 * 60000) continue;
    if (
      occupied.some(
        (b) => start < new Date(b.ends_at) && end > new Date(b.starts_at),
      )
    )
      continue;
    results.push({
      start: start.toISOString(),
      end: end.toISOString(),
      label: formatTime(start, config.timezone),
    });
  }
  return results;
}
