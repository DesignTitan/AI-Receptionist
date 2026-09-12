import { validateWeeklyHours, type DayHours } from "./weekly-hours.ts";
import { ANSWERING_PREFERENCES, type AnsweringPreference } from "./answering-preference.ts";
import { PLANS, type Plan } from "./pricing.ts";
import type { PhoneSettings } from "./phone-settings.ts";
import { validatePhoneSetup, type PhoneSetup } from "./phone-provider.ts";
export { PLANS, type Plan } from "./pricing.ts";
export type CustomerStatus =
  | "draft"
  | "paid"
  | "provisioning"
  | "live"
  | "paused";
export type TeamMember = {
  id: string;
  name: string;
  service: string;
  minutes: number;
};
export type BusinessConfig = {
  setupPending?: boolean;
  answeringPreference?: AnsweringPreference;
  setupDraft?: import("./setup-draft").SetupDraft;
  contactName?: string;
  phoneSetup?: PhoneSetup;
  trade: "salon" | "studio" | "other";
  timezone: string;
  weeklyHours?: DayHours[];
  days: number[];
  opens: string;
  closes: string;
  color: string;
  areaCode: string;
  address: string;
  phone: string;
  team: TeamMember[];
};
export type Customer = {
  id: string;
  owner_id: string;
  owner_email: string;
  business_name: string;
  slug: string;
  plan: Plan;
  status: CustomerStatus;
  config: BusinessConfig;
  phone_settings?: Partial<PhoneSettings>;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  setup_fee_cents: number | null;
  setup_price_id: string | null;
  setup_paid_at: string | null;
  checkout_attempt: string | null;
  checkout_expires: number | null;
  checkout_session_id: string | null;
  billing_status: string | null;
  agent_id: string | null;
  number_id: string | null;
  phone_number: string | null;
  provision_error: string | null;
  period_start: string | null;
  period_end: string | null;
  overage_budget_cents: number;
  pricing_version: string;
  created_at: string;
};
export type CustomerBooking = {
  id: string;
  customer_id: string;
  provider_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  starts_at: string;
  ends_at: string;
  reference: string;
  status: "pending" | "confirmed" | "cancelled" | "rescheduled";
  call_status: "queued" | "dispatching" | "ringing" | "completed" | "failed" | "not_required";
  source?: "web" | "phone";
  inbound_call_id?: string | null;
  provider_call_id: string | null;
  outcome: string | null;
  summary: string | null;
  transcript: string | null;
  recording_url: string | null;
  duration_seconds: number | null;
  created_at: string;
};
export function planOf(value: unknown): Plan {
  if (value !== "front" && value !== "busy" && value !== "full")
    throw Error("Choose a valid plan.");
  return value;
}
export function text(value: unknown, label: string, max = 120) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    throw Error(`Check ${label}.`);
  return value.trim();
}
export function email(value: unknown) {
  const result = text(value, "email address", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result))
    throw Error("Enter a valid email address.");
  return result;
}
export function phone(value: unknown) {
  const digits = text(value, "phone number", 30).replace(/\D/g, "");
  const normalized = digits.length === 10 ? `1${digits}` : digits;
  if (!/^1[2-9]\d{2}[2-9]\d{6}$/.test(normalized))
    throw Error("Enter a US or Canadian phone number.");
  return `+${normalized}`;
}
export function validateConfig(input: unknown): BusinessConfig {
  if (!input || typeof input !== "object")
    throw Error("Complete your business details.");
  const c = input as BusinessConfig;
  if (!["salon", "studio", "other"].includes(c.trade))
    throw Error("Choose your business type.");
  const timezone = text(c.timezone, "timezone");
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone });
  } catch {
    throw Error("Choose a valid timezone.");
  }
  if (
    !Array.isArray(c.days) ||
    !c.days.length ||
    c.days.some((d) => !Number.isInteger(d) || d < 0 || d > 6)
  )
    throw Error("Choose working days.");
  if (
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(c.opens) ||
    !/^(([01]\d|2[0-3]):[0-5]\d|24:00)$/.test(c.closes) ||
    c.opens >= c.closes
  )
    throw Error("Closing time must be after opening time.");
  if (!/^#[0-9a-f]{6}$/i.test(c.color)) throw Error("Choose a brand colour.");
  if (!/^[2-9]\d{2}$/.test(c.areaCode))
    throw Error("Enter a three-digit US area code.");
  if (!Array.isArray(c.team) || !c.team.length || c.team.length > 20)
    throw Error("Add between 1 and 20 team members.");
  const team = c.team.map((p, i) => {
    if (
      !Number.isInteger(p.minutes) ||
      p.minutes < 15 ||
      p.minutes > 240 ||
      p.minutes % 15
    )
      throw Error(
        "Appointments must last 15–240 minutes in 15-minute increments.",
      );
    return {
      id: `member-${i + 1}`,
      name: text(p.name, "team member name"),
      service: text(p.service, "service"),
      minutes: p.minutes,
    };
  });
  return {
    answeringPreference: c.answeringPreference && Object.hasOwn(ANSWERING_PREFERENCES,c.answeringPreference) ? c.answeringPreference : "undecided",
    trade: c.trade,
    ...(c.phoneSetup ? { phoneSetup: validatePhoneSetup(c.phoneSetup) } : {}),
    timezone,
    ...(c.weeklyHours ? {weeklyHours:validateWeeklyHours(c.weeklyHours)} : {}),
    days: [...new Set(c.days)],
    opens: c.opens,
    closes: c.closes,
    color: c.color,
    areaCode: c.areaCode,
    address: text(c.address, "business address", 300),
    phone: phone(c.phone),
    team,
  };
}
export function slugFor(name: string, suffix: string) {
  return `${
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "business"
  }-${suffix.slice(0, 8)}`;
}
