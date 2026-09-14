import { ANSWERING_PREFERENCES, type AnsweringPreference } from "./answering-preference.ts";
import { validateSetupDraft, type SetupDraft } from "./setup-draft.ts";
import type { DayHours } from "./weekly-hours.ts";

/**
 * The setup interview: Bubs asks, the customer answers, the front-desk card
 * fills itself. This module is the pure script (what to ask next, how to read
 * an answer); the conversation component owns rendering, lookups and storage.
 * Every answer is also editable on the card, so nothing here is a gate.
 */

export type Trade = "salon" | "studio" | "other";
export type HoursPreset = "weekdays" | "tue_sat" | "everyday" | "custom";

export type BusinessLookup = {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  trade?: Trade;
  customTrade?: string;
  weeklyHours?: DayHours[];
};

export type InterviewAnswers = {
  phone?: string;
  lookup?: BusinessLookup | null;
  lookupConfirmed?: boolean;
  businessName?: string;
  trade?: Trade;
  customTrade?: string;
  address?: string;
  hoursPreset?: HoursPreset;
  weeklyHours?: DayHours[];
  minutes?: number;
  answering?: AnsweringPreference;
};

export type StepId = "phone" | "confirm" | "name" | "trade" | "customTrade" | "address" | "hours" | "minutes" | "answering" | "done";

export type Chip = { label: string; value: string };
export type Prompt = { id: StepId; text: string; input: "phone" | "text" | "chips" | "none"; chips?: Chip[]; placeholder?: string; allowText?: boolean };

export const HOURS_PRESETS: Record<Exclude<HoursPreset, "custom">, { label: string; days: number[]; opens: string; closes: string }> = {
  weekdays: { label: "Mon–Fri, 9 to 5", days: [1, 2, 3, 4, 5], opens: "09:00", closes: "17:00" },
  tue_sat: { label: "Tue–Sat, 9 to 6", days: [2, 3, 4, 5, 6], opens: "09:00", closes: "18:00" },
  everyday: { label: "Every day, 9 to 5", days: [0, 1, 2, 3, 4, 5, 6], opens: "09:00", closes: "17:00" },
};

export const TRADE_LABELS: Record<Trade, string> = { salon: "Salon, spa or wellness", studio: "Creative studio", other: "Something else" };

/** The answering options worth offering in conversation; the rest stay in settings. */
export const ANSWERING_CHIPS: Chip[] = [
  { label: "Every call, any time", value: "always" },
  { label: "Only after hours", value: "after_hours" },
  { label: "When my team can't pick up", value: "backup" },
  { label: "Let callers choose", value: "choice" },
];

export function weeklyHoursForPreset(preset: Exclude<HoursPreset, "custom">): DayHours[] {
  const p = HOURS_PRESETS[preset];
  return Array.from({ length: 7 }, (_, day) => ({ day, enabled: p.days.includes(day), opens: p.opens, closes: p.closes }));
}

/** +1NXXNXXXXXX → "(313) 555-0142"; null when it isn't a plausible NANP number. */
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  if (d.length !== 10 || !/^[2-9]\d\d[2-9]\d{6}$/.test(d)) return null;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function needsConfirm(a: InterviewAnswers) { return Boolean(a.lookup) && a.lookupConfirmed === undefined; }

/** The next thing Bubs should ask, given what it already knows. */
export function nextStep(a: InterviewAnswers): StepId {
  if (!a.phone) return "phone";
  if (needsConfirm(a)) return "confirm";
  if (!a.businessName) return "name";
  if (!a.trade) return "trade";
  if (a.trade === "other" && !a.customTrade) return "customTrade";
  if (!a.address) return "address";
  if (!a.weeklyHours) return "hours";
  if (!a.minutes) return "minutes";
  if (!a.answering) return "answering";
  return "done";
}

export function promptFor(step: StepId, a: InterviewAnswers): Prompt {
  const name = a.businessName ? ` at ${a.businessName}` : "";
  switch (step) {
    case "phone":
      return { id: step, text: "Hi, I’m Bubs. I’ll have your front desk set up in a couple of minutes. What’s your business phone number?", input: "phone", placeholder: "(313) 555-0142" };
    case "confirm": {
      const l = a.lookup!;
      return { id: step, text: `I found a listing for that number: ${l.name}, ${l.address}. Is that you?`, input: "chips", chips: [{ label: "Yes, that’s us", value: "yes" }, { label: "Not quite", value: "no" }] };
    }
    case "name":
      return { id: step, text: a.lookup === null ? "No listing came up for that number, no problem. What’s your business called?" : "What’s your business called?", input: "text", placeholder: "Willow Studio" };
    case "trade":
      return { id: step, text: `What kind of business is ${a.businessName}?`, input: "chips", chips: (Object.keys(TRADE_LABELS) as Trade[]).map(v => ({ label: TRADE_LABELS[v], value: v })) };
    case "customTrade":
      return { id: step, text: "Tell me in a few words what you do.", input: "text", placeholder: "Dog grooming" };
    case "address":
      return { id: step, text: "Where are you located? Street address is best; it goes on your booking page.", input: "text", placeholder: "123 Example Street, Detroit, MI" };
    case "hours":
      return { id: step, text: `When are you open${name}?`, input: "chips", chips: [...(Object.keys(HOURS_PRESETS) as Array<keyof typeof HOURS_PRESETS>).map(v => ({ label: HOURS_PRESETS[v].label, value: v })), { label: "Something else", value: "custom" }] };
    case "minutes":
      return { id: step, text: "How long is a typical appointment?", input: "chips", chips: [30, 45, 60, 90].map(n => ({ label: `${n} minutes`, value: String(n) })) };
    case "answering":
      return { id: step, text: "Last one. When a customer calls, when should I pick up?", input: "chips", chips: ANSWERING_CHIPS };
    case "done":
      return { id: step, text: `That’s everything I need${name}. Your front desk card is on the right; change anything there and I’ll keep up.`, input: "none" };
  }
}

export type Applied = { answers: InterviewAnswers; reply?: string; error?: string };

/** Read one answer. Returns an error (and unchanged answers) when Bubs should ask again. */
export function applyAnswer(step: StepId, raw: string, a: InterviewAnswers): Applied {
  const text = raw.trim();
  switch (step) {
    case "phone": {
      const phone = normalizePhone(text);
      if (!phone) return { answers: a, error: "That doesn’t look like a US phone number. Try the full ten digits." };
      return { answers: { ...a, phone } };
    }
    case "confirm": {
      if (text === "yes") return { answers: acceptLookup(a), reply: "Great, I’ve filled in what the listing knows." };
      return { answers: { ...a, lookupConfirmed: false }, reply: "No problem, let’s do it by hand." };
    }
    case "name":
      if (text.length < 2 || text.length > 120) return { answers: a, error: "Give me the name customers know you by." };
      return { answers: { ...a, businessName: text } };
    case "trade":
      if (!(text in TRADE_LABELS)) return { answers: a, error: "Pick one of the options, or tell me what you do." };
      return { answers: { ...a, trade: text as Trade, ...(text !== "other" ? { customTrade: undefined } : {}) } };
    case "customTrade":
      if (text.length < 2 || text.length > 120) return { answers: a, error: "A few words is plenty." };
      return { answers: { ...a, customTrade: text } };
    case "address":
      if (text.length < 5 || text.length > 300) return { answers: a, error: "I need at least a street and city." };
      return { answers: { ...a, address: text } };
    case "hours": {
      if (text === "custom") return { answers: { ...a, hoursPreset: "custom", weeklyHours: weeklyHoursForPreset("weekdays") }, reply: "I’ve started you on weekdays 9 to 5. Adjust the days and times on the card." };
      if (!(text in HOURS_PRESETS)) return { answers: a, error: "Pick the closest option; you can fine-tune on the card." };
      const preset = text as Exclude<HoursPreset, "custom">;
      return { answers: { ...a, hoursPreset: preset, weeklyHours: weeklyHoursForPreset(preset) } };
    }
    case "minutes": {
      const n = Number(text);
      if (![15, 30, 45, 60, 90, 120, 180, 240].includes(n)) return { answers: a, error: "Pick one of the lengths." };
      return { answers: { ...a, minutes: n } };
    }
    case "answering":
      if (!(text in ANSWERING_PREFERENCES) || text === "undecided") return { answers: a, error: "Pick one; you can change it any time." };
      return { answers: { ...a, answering: text as AnsweringPreference } };
    case "done":
      return { answers: a };
  }
}

/** Fill everything the listing knows; the customer keeps every field editable. */
export function acceptLookup(a: InterviewAnswers): InterviewAnswers {
  const l = a.lookup;
  if (!l) return a;
  return {
    ...a,
    lookupConfirmed: true,
    businessName: a.businessName ?? l.name,
    address: a.address ?? l.address,
    trade: a.trade ?? l.trade,
    customTrade: a.customTrade ?? l.customTrade,
    weeklyHours: a.weeklyHours ?? l.weeklyHours,
    hoursPreset: a.hoursPreset ?? (l.weeklyHours ? "custom" : undefined),
  };
}

/** How much of the interview is answered, 0–1, for the progress indicator. */
export function interviewProgress(a: InterviewAnswers): number {
  const checks = [Boolean(a.phone), Boolean(a.businessName), Boolean(a.trade) && (a.trade !== "other" || Boolean(a.customTrade)), Boolean(a.address), Boolean(a.weeklyHours), Boolean(a.minutes), Boolean(a.answering)];
  return checks.filter(Boolean).length / checks.length;
}

/** The same draft shape the existing setup form saves, so v2 can hand off to the same backend. */
export function toSetupDraft(a: InterviewAnswers, timezone = "America/New_York"): SetupDraft {
  const weeklyHours = a.weeklyHours ?? weeklyHoursForPreset("weekdays");
  const open = weeklyHours.filter(d => d.enabled);
  const areaCode = a.phone?.replace(/\D/g, "").slice(0, 3) ?? "";
  return validateSetupDraft({
    weeklyHours,
    details: {
      business_name: a.businessName ?? "",
      trade: a.trade ?? "",
      customTrade: a.customTrade ?? "",
      address: a.address ?? "",
      phone: a.phone ?? "",
      areaCode,
      color: "#1e3a34",
      phoneProvider: "unknown",
      phoneServiceType: "unknown",
      phoneServiceName: "",
      bookingSystem: "Not sure yet",
      answeringPreference: a.answering ?? "",
    },
    days: open.map(d => d.day),
    opens: open[0]?.opens ?? "09:00",
    closes: open[0]?.closes ?? "17:00",
    timezone,
    team: [{ id: "member-1", name: a.businessName ?? "", service: "Appointment", minutes: a.minutes ?? 30 }],
  });
}
