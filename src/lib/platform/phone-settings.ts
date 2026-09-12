import {weeklyHoursFor} from "./weekly-hours.ts";
import type { BusinessConfig } from "./model.ts";

export const PHONE_MODES = ["menu", "staff_first", "ai_first", "staff_only"] as const;
export type PhoneMode = (typeof PHONE_MODES)[number];
export type PhoneDay = { day: number; enabled: boolean; opens: string; closes: string };
export type PhoneHoliday = { id: string; label: string; startsOn: string; endsOn: string; mode: PhoneMode };
export type PhoneSettings = {
  confirmationCalls: boolean;
  inboundEnabled: boolean;
  businessHoursMode: PhoneMode;
  afterHoursMode: PhoneMode;
  weeklyHours: PhoneDay[];
  staffNumber: string | null;
  ringSeconds: number;
  noAnswerAction: "voicemail" | "ai";
  fallback: "staff" | "voicemail";
  holidays: PhoneHoliday[];
  override: { mode: PhoneMode; expiresAt: string } | null;
};
export type PhoneRoute = {
  mode: PhoneMode | "off";
  reason: "inbound_disabled" | "override" | "holiday" | "business_hours" | "after_hours";
  overrideExpiresAt: string | null;
  holidayLabel?: string;
};
export type PhoneConnection = {
  status: "not_connected" | "testing" | "ready";
  provider: string | null;
  inbound_number: string | null;
  verified_at: string | null;
};
export type PhoneSnapshot = {
  settings: PhoneSettings;
  connection: PhoneConnection;
  timezone: string;
  route: PhoneRoute;
  serviceActive: boolean;
  routingAvailable: boolean;
  aiAvailable?: boolean;
  usageKnown?: boolean;
  revision: string;
  checkedAt: string;
};
export const PHONE_MODE_LABELS: Record<PhoneMode | "off", string> = {
  menu: "Let the caller choose",
  staff_first: "Ring staff first",
  ai_first: "AI answers first",
  staff_only: "Staff only — no AI",
  off: "Incoming-call routing is off",
};
type ScheduleConfig = Pick<BusinessConfig, "timezone" | "days" | "opens" | "closes" | "weeklyHours">;

function timezoneValid(timezone: string) {
  if (typeof timezone !== "string" || !timezone.trim() || timezone !== timezone.trim()) throw Error("Choose a valid business timezone.");
  try { new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(); }
  catch { throw Error("Choose a valid business timezone."); }
}
function object(value: unknown, label: string, keys: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error(`Check ${label}.`);
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some(key => !keys.includes(key))) throw Error(`Unexpected field in ${label}.`);
  return result;
}
function boolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") throw Error(`Choose whether ${label}.`);
  return value;
}
function mode(value: unknown): PhoneMode {
  if (!PHONE_MODES.includes(value as PhoneMode)) throw Error("Choose a valid answering option.");
  return value as PhoneMode;
}
function minutes(value: unknown, closing = false): number {
  if (closing && value === "24:00") return 1440;
  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw Error("Use a valid time for each day, such as 09:00.");
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}
function calendarDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw Error("Choose a complete holiday or vacation date.");
  const parsed = new Date(`${value}T12:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value || value < "2000-01-01" || value > "2100-12-31") throw Error("Choose a real holiday or vacation date.");
  return value;
}
function instant(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) throw Error("Choose when the temporary change ends.");
  const parsed = new Date(value);
  const normalized = value.includes(".") ? value : value.replace("Z", ".000Z");
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== normalized) throw Error("Choose a valid end time for the temporary change.");
  return parsed.toISOString();
}

/** Safe defaults: outbound confirmation remains on; incoming calls require setup. */
export function defaultPhoneSettings(config: ScheduleConfig): PhoneSettings {
  timezoneValid(config.timezone);
  minutes(config.opens);
  minutes(config.closes, true);
  return {
    confirmationCalls: true, inboundEnabled: false,
    businessHoursMode: "menu", afterHoursMode: "ai_first",
    weeklyHours: weeklyHoursFor(config),
    staffNumber: null, ringSeconds: 20, noAnswerAction: "voicemail", fallback: "voicemail",
    holidays: [], override: null,
  };
}

/** Accepts defaults/partial persisted settings, but never silently accepts unknown fields. */
export function validatePhoneSettings(input: unknown, config: ScheduleConfig, protectedNumbers: readonly (string | null | undefined)[] = []): PhoneSettings {
  const defaults = defaultPhoneSettings(config);
  const value = { ...defaults, ...object(input, "phone settings", Object.keys(defaults)) };
  const confirmationCalls = boolean(value.confirmationCalls, "confirmation calls are enabled");
  const inboundEnabled = boolean(value.inboundEnabled, "incoming-call routing is enabled");
  const businessHoursMode = mode(value.businessHoursMode);
  const afterHoursMode = mode(value.afterHoursMode);
  if (!Array.isArray(value.weeklyHours) || value.weeklyHours.length !== 7) throw Error("Set phone hours for all seven days.");
  const seen = new Set<number>();
  const weeklyHours = value.weeklyHours.map(raw => {
    const item = object(raw, "weekly hours", ["day", "enabled", "opens", "closes"]);
    if (!Number.isInteger(item.day) || Number(item.day) < 0 || Number(item.day) > 6 || seen.has(Number(item.day))) throw Error("Each day must appear once in your phone hours.");
    const day = Number(item.day);
    seen.add(day);
    const enabled = boolean(item.enabled, "this day uses business hours");
    const opens = minutes(item.opens), closes = minutes(item.closes, true);
    if (opens === closes) throw Error("Opening and closing times must differ. Use 00:00–24:00 for a full day.");
    return { day, enabled, opens: item.opens as string, closes: item.closes as string };
  }).sort((a, b) => a.day - b.day);
  let staffNumber: string | null = null;
  if (value.staffNumber !== null && value.staffNumber !== "") {
    if (typeof value.staffNumber !== "string" || !/^\+[1-9]\d{7,14}$/.test(value.staffNumber)) throw Error("Enter the staff number with its country code, such as +12125550123.");
    staffNumber = value.staffNumber;
    const digits = staffNumber.replace(/\D/g, "");
    if (protectedNumbers.some(number => {
      if (!number) return false;
      let protectedDigits = number.replace(/\D/g, "");
      if (protectedDigits.length === 10) protectedDigits = `1${protectedDigits}`;
      return digits === protectedDigits;
    })) throw Error("Use a separate staff number. The public business number and connected AI lines would send calls in a loop.");
  }
  if (!Number.isInteger(value.ringSeconds) || value.ringSeconds < 10 || value.ringSeconds > 60) throw Error("Let staff ring for 10–60 seconds.");
  if (!["voicemail", "ai"].includes(value.noAnswerAction)) throw Error("Choose what happens when staff do not answer.");
  if (!["staff", "voicemail"].includes(value.fallback)) throw Error("Choose a fallback when AI cannot take a call.");
  if (!Array.isArray(value.holidays) || value.holidays.length > 30) throw Error("Add at most 30 holiday or vacation periods.");
  const ids = new Set<string>();
  const holidays = value.holidays.map(raw => {
    const item = object(raw, "holiday or vacation", ["id", "label", "startsOn", "endsOn", "mode"]);
    if (typeof item.id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(item.id) || ids.has(item.id)) throw Error("Each holiday or vacation needs a unique identifier.");
    ids.add(item.id);
    if (typeof item.label !== "string" || !item.label.trim() || item.label.trim().length > 80) throw Error("Name each holiday or vacation (up to 80 characters).");
    const startsOn = calendarDate(item.startsOn), endsOn = calendarDate(item.endsOn);
    if (startsOn > endsOn) throw Error("A holiday or vacation must end on or after its start date.");
    return { id: item.id, label: item.label.trim(), startsOn, endsOn, mode: mode(item.mode) };
  }).sort((a, b) => a.startsOn.localeCompare(b.startsOn));
  for (let i = 1; i < holidays.length; i++) if (holidays[i].startsOn <= holidays[i - 1].endsOn) throw Error("Holiday and vacation dates cannot overlap. Combine the periods or choose different dates.");
  let override: PhoneSettings["override"] = null;
  if (value.override !== null) {
    const item = object(value.override, "temporary change", ["mode", "expiresAt"]);
    override = { mode: mode(item.mode), expiresAt: instant(item.expiresAt) };
  }
  const modes = [businessHoursMode, afterHoursMode, ...holidays.map(holiday => holiday.mode), ...(override ? [override.mode] : [])];
  if (!staffNumber && (value.fallback === "staff" || modes.some(item => item === "staff_first" || item === "staff_only"))) throw Error("Add a separate staff number before choosing staff answering or a staff fallback.");
  return { confirmationCalls, inboundEnabled, businessHoursMode, afterHoursMode, weeklyHours, staffNumber, ringSeconds: value.ringSeconds, noAnswerAction: value.noAnswerAction, fallback: value.fallback, holidays, override };
}

/** Resolve in business-local calendar time. DST folds repeat hours; gaps contain no instants. */
export function resolvePhoneRoute(settings: PhoneSettings, timezone: string, now: Date): PhoneRoute {
  timezoneValid(timezone);
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw Error("Check the current time.");
  if (!settings.inboundEnabled) return { mode: "off", reason: "inbound_disabled", overrideExpiresAt: null };
  if (settings.override && Date.parse(settings.override.expiresAt) > now.getTime()) return { mode: settings.override.mode, reason: "override", overrideExpiresAt: settings.override.expiresAt };
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const part = (key: string) => parts.find(value => value.type === key)!.value;
  const date = `${part("year")}-${part("month")}-${part("day")}`;
  const holiday = settings.holidays.find(value => value.startsOn <= date && value.endsOn >= date);
  if (holiday) return { mode: holiday.mode, reason: "holiday", holidayLabel: holiday.label, overrideExpiresAt: null };
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const currentMinutes = Number(part("hour")) * 60 + Number(part("minute"));
  const today = settings.weeklyHours.find(value => value.day === weekday);
  const yesterday = settings.weeklyHours.find(value => value.day === (weekday + 6) % 7);
  const withinToday = today?.enabled && (minutes(today.closes, true) > minutes(today.opens)
    ? currentMinutes >= minutes(today.opens) && currentMinutes < minutes(today.closes, true)
    : currentMinutes >= minutes(today.opens));
  const overnight = yesterday?.enabled && minutes(yesterday.closes, true) < minutes(yesterday.opens) && currentMinutes < minutes(yesterday.closes, true);
  return withinToday || overnight
    ? { mode: settings.businessHoursMode, reason: "business_hours", overrideExpiresAt: null }
    : { mode: settings.afterHoursMode, reason: "after_hours", overrideExpiresAt: null };
}
