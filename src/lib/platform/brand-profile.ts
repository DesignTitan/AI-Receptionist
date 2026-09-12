import { phone as normalizePhone, text } from "./model";
import { validateWeeklyHours, type DayHours } from "./weekly-hours.ts";

export type BookVsMessageRule =
  | "book_when_possible"
  | "take_message_only"
  | "ask_then_decide";

export type BrandFaqs = {
  price: string; // guidance on quoting or not quoting prices
  serviceArea: string; // neighborhoods/coverage or "in-studio only"
};

export type EscalationContact = {
  name: string;
  phone: string; // E.164 normalized
};

export type BrandProfile = {
  businessName: string;
  whatYouDo: string;
  timezone: string;
  weeklyHours?: DayHours[]; // optional: if omitted, use existing business config hours
  phoneToAnswer: string; // main line the AI rings/answers
  escalateTo: EscalationContact;
  topCallTypes: string[]; // 1–3 short strings
  bookVsMessage: BookVsMessageRule;
  greetingName: string; // name used in the greeting
  faqs: BrandFaqs;
  // Optional enrich
  websiteUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  updatedAtIso?: string;
};

export function validateBrandProfile(input: unknown): BrandProfile {
  if (!input || typeof input !== "object") throw Error("Fill in your brand details.");
  const i = input as Partial<BrandProfile>;

  const businessName = text(i.businessName, "business name", 120);
  const whatYouDo = text(i.whatYouDo, "what you do", 140);
  const timezone = text(i.timezone, "timezone");
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone });
  } catch {
    throw Error("Choose a valid timezone.");
  }
  const greetingName = text(i.greetingName, "greeting name", 80);
  const phoneToAnswer = normalizePhone(i.phoneToAnswer);

  if (!i.escalateTo || typeof i.escalateTo !== "object") {
    throw Error("Add an escalation contact.");
  }
  const escalateTo = {
    name: text((i.escalateTo as EscalationContact).name, "escalation contact name", 120),
    phone: normalizePhone((i.escalateTo as EscalationContact).phone),
  };

  const callTypes = Array.isArray(i.topCallTypes)
    ? i.topCallTypes.map((s) => text(s, "call type", 60)).filter(Boolean)
    : [];
  if (callTypes.length < 1 || callTypes.length > 3) {
    throw Error("Enter 1–3 top call types.");
  }

  const bookVsMessage: BookVsMessageRule =
    i.bookVsMessage === "book_when_possible" ||
    i.bookVsMessage === "take_message_only" ||
    i.bookVsMessage === "ask_then_decide"
      ? i.bookVsMessage
      : "book_when_possible";

  const faqs: BrandFaqs = {
    price: text(i.faqs?.price ?? "", "price note", 300),
    serviceArea: text(i.faqs?.serviceArea ?? "", "service area", 300),
  };

  const weeklyHours = i.weeklyHours ? validateWeeklyHours(i.weeklyHours) : undefined;

  return {
    businessName,
    whatYouDo,
    timezone,
    weeklyHours,
    phoneToAnswer,
    escalateTo,
    topCallTypes: callTypes,
    bookVsMessage,
    greetingName,
    faqs,
    websiteUrl: i.websiteUrl?.trim() || undefined,
    instagramUrl: i.instagramUrl?.trim() || undefined,
    facebookUrl: i.facebookUrl?.trim() || undefined,
    tiktokUrl: i.tiktokUrl?.trim() || undefined,
    updatedAtIso: new Date().toISOString(),
  };
}

