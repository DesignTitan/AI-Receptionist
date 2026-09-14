import type { PhoneProvider } from "./phone-provider.ts";
import type { InterviewAnswers } from "./setup-interview.ts";
import { DAY_NAMES, timeMinutes, type DayHours } from "./weekly-hours.ts";

/**
 * Derived views for the later setup steps: what callers will hear, what the
 * booking page will offer, and how to forward a line. All computed from the
 * interview answers so the screens are real, even where the capability behind
 * them (voice, provisioning) isn't switched on yet.
 */

/** "09:00" → "9", "18:30" → "6:30" (am/pm is added by the caller when it matters). */
export function spokenTime(t: string): string {
  if (t === "24:00" || t === "00:00") return "midnight";
  const [h, m] = t.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const suffix = h < 12 ? " am" : " pm";
  return `${hour12}${m ? `:${String(m).padStart(2, "0")}` : ""}${suffix}`;
}

/** "Tuesday to Saturday" for a contiguous run, otherwise "Monday, Wednesday and Friday". */
export function spokenDays(hours: DayHours[]): string {
  const open = hours.filter(d => d.enabled).map(d => d.day).sort((a, b) => a - b);
  if (!open.length) return "";
  if (open.length === 7) return "every day";
  const contiguous = open.every((d, i) => i === 0 || d === open[i - 1] + 1);
  if (contiguous && open.length > 2) return `${DAY_NAMES[open[0]]} to ${DAY_NAMES[open[open.length - 1]]}`;
  const names = open.map(d => DAY_NAMES[d]);
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** "Tuesday to Saturday, 9 am to 6 pm", or "24 hours, every day". */
export function spokenHours(hours: DayHours[]): string {
  const open = hours.find(d => d.enabled);
  if (!open) return "";
  const allDay = open.opens === "00:00" && open.closes === "24:00";
  return allDay ? `24 hours, ${spokenDays(hours)}` : `${spokenDays(hours)}, ${spokenTime(open.opens)} to ${spokenTime(open.closes)}`;
}

/** The first thing a caller hears. Plain text; the voice agent reads it. */
export function greetingScript(a: InterviewAnswers): string {
  const name = a.businessName?.trim() || "the front desk";
  const open = a.weeklyHours?.find(d => d.enabled);
  const hours = a.weeklyHours && open ? ` We’re open ${spokenHours(a.weeklyHours)}.` : "";
  return `Thanks for calling ${name}, this is Bubs.${hours} Would you like to book an appointment, or is there something else I can help with?`;
}

export function bookingSlug(name: string | undefined): string {
  const slug = (name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "your-business";
}

export type Opening = { date: Date; label: string; slots: number };

/** The next few open days and how many appointments fit, from hours and appointment length. */
export function openingsPreview(hours: DayHours[] | undefined, minutes: number | undefined, from = new Date(), count = 3): Opening[] {
  if (!hours || !minutes) return [];
  const out: Opening[] = [];
  for (let i = 1; i <= 14 && out.length < count; i++) {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const day = hours[date.getDay()];
    if (!day?.enabled) continue;
    const span = timeMinutes(day.closes) - timeMinutes(day.opens);
    const slots = Math.max(0, Math.floor(span / minutes));
    if (!slots) continue;
    out.push({ date, label: `${DAY_NAMES[date.getDay()].slice(0, 3)} ${date.getDate()} ${date.toLocaleString("en-US", { month: "short" })}`, slots });
  }
  return out;
}

export type Forwarding = { title: string; steps: string[]; off?: string; note?: string };

/** Forwarding steps by carrier. Codes vary by plan, which is why go-live ends with a test call. */
export function forwardingSteps(provider: PhoneProvider | undefined, bubsNumber = "your Bubs number"): Forwarding {
  switch (provider) {
    case "verizon":
      return { title: "Forward your Verizon line", steps: [`From your business phone, dial *72 then ${bubsNumber}.`, "Wait for the confirmation tone, then hang up."], off: "Dial *73 to turn forwarding off." };
    case "att":
      return { title: "Forward your AT&T line", steps: [`Landline: dial *72 then ${bubsNumber}, wait for the tone.`, `Mobile: dial *21*${bubsNumber}# and press call.`], off: "Dial *73 (landline) or #21# (mobile) to turn it off." };
    case "tmobile":
      return { title: "Forward your T-Mobile line", steps: [`Dial **21*${bubsNumber}# and press call.`, "You’ll see a confirmation on screen."], off: "Dial ##21# to turn it off." };
    case "comcast":
      return { title: "Forward your Comcast Business line", steps: [`Dial *72 then ${bubsNumber}, wait for the tone.`, "Or set it in Comcast Business → Voice → Call Forwarding."], off: "Dial *73 to turn it off." };
    case "ringcentral": case "nextiva": case "vonage": case "zoom": case "google":
      return { title: "Forward from your phone system", steps: ["Open your admin portal and find Call handling or Call forwarding.", `Add ${bubsNumber} as the forward-to number for the times Bubs should answer.`], note: "Bubs can also answer only when you don’t pick up; set that as the “unanswered” rule." };
    case "none":
      return { title: "No forwarding needed", steps: ["Your Bubs number is your business line.", "Put it on your website, Google listing and cards."] };
    default:
      return { title: "We’ll find your carrier", steps: ["When you go live, Bubs checks which carrier your number is on and shows the exact steps."], note: "You can also pick your carrier above to see the steps now." };
  }
}

/**
 * What Bubs says to someone coming back. One sentence that proves it
 * remembers, instead of replaying the old conversation at them.
 */
export function resumeMessage(a: InterviewAnswers, complete: boolean): string {
  const facts: string[] = [];
  if (a.address) facts.push(a.address);
  const open = a.weeklyHours?.find(d => d.enabled);
  if (a.weeklyHours && open) facts.push(spokenHours(a.weeklyHours));
  if (a.minutes) facts.push(`${a.minutes}-minute appointments`);
  const name = a.businessName ? ` for ${a.businessName}` : "";
  if (complete) return `Welcome back. I still have everything${name}${facts.length ? `: ${facts.join("; ")}` : ""}. Change anything under What Bubs knows, or carry on.`;
  const have = [a.phone && "your phone number", a.businessName && "your business name", a.trade && "what you do", a.address && "your address", a.weeklyHours && "your hours", a.minutes && "your appointment length"].filter(Boolean) as string[];
  return `Welcome back. So far I have ${have.length ? have.join(", ") : "nothing yet"}. Let’s carry on.`;
}
