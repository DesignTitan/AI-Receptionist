import type { InterviewAnswers } from "./setup-interview.ts";
import { spokenHours } from "./setup-journey.ts";
import { weeklyHoursForPreset } from "./setup-interview.ts";
import { formatTime, parseTimeText } from "./time-text.ts";
import { DAY_NAMES, minuteTime, type DayHours } from "./weekly-hours.ts";

/**
 * Bubs as a guide beside the card: what's filled in, what's missing, and plain
 * answers about each field. Works with no model behind it; the API route adds
 * a model on top when a key is configured.
 */

const FIELDS: Array<{ key: keyof InterviewAnswers; label: string; match: RegExp; help: string }> = [
  { key: "phone", label: "business phone", match: /phone|number|area code/, help: "Your business phone is the number customers already call. Bubs™ uses it to look up your listing and, at go-live, to set up forwarding. It stays your number; Bubs™ gets its own." },
  { key: "businessName", label: "business name", match: /\bname\b|called/, help: "Use the name customers know you by. It’s how Bubs™ answers the phone and it’s on your booking page." },
  { key: "trade", label: "business type", match: /type|kind|trade|category|industry/, help: "Business type sets what Bubs™ knows how to book. Pick the closest; if none fits, choose “Something else” and say what you do in a few words." },
  { key: "address", label: "address", match: /address|location|where|street/, help: "Your address goes on the booking page and in directions when a caller asks. A street address is best; city and state are fine to start." },
  { key: "weeklyHours", label: "business hours", match: /hours|open|close|days|weekend|schedule|24/, help: "Business hours are when customers can book. Tap the days you’re open and set opens and closes; you can type times like “9” or “5:30 pm”. If you’re open round the clock, set every day to midnight-to-midnight. When Bubs™ picks up the phone is a separate setting below." },
  { key: "minutes", label: "appointment length", match: /appointment|length|minutes|long|duration|slot/, help: "Appointment length is how far apart Bubs™ spaces bookings. Pick your typical visit; if you offer several, choose the most common and we’ll add the rest later." },
  { key: "answering", label: "when Bubs™ answers", match: /answer|pick up|ring|after hours|team|voicemail|forward/, help: "“When Bubs™ answers the phone” decides who picks up. Every call: Bubs™ always answers. Only after hours: your team by day, Bubs™ when you’re closed. When your team can’t: your phone rings first, Bubs™ picks up if nobody does. Callers choose: they press 1 for Bubs™ or 2 for you." },
];

export function missingFields(a: InterviewAnswers): string[] {
  return FIELDS.filter(f => {
    const v = a[f.key];
    if (f.key === "trade") return !a.trade || (a.trade === "other" && !a.customTrade);
    return v === undefined || v === "" || v === null;
  }).map(f => f.label);
}

/** Looks like a question or a request for help rather than an answer to Bubs's question. */
export function isQuestion(text: string): boolean {
  const t = text.trim();
  if (t.endsWith("?")) return true;
  return /^(what|why|how|when|where|which|who|do|does|did|can|could|should|would|is|are|will|help|explain|tell me|i(’|')?m not sure|i don(’|')?t (know|understand)|not sure)\b/i.test(t);
}

/** What Bubs says when someone opens the card with answers already in it. */
export function guideMessage(a: InterviewAnswers): string {
  const missing = missingFields(a);
  const facts: string[] = [];
  if (a.businessName) facts.push(a.businessName);
  if (a.address) facts.push(a.address);
  if (a.weeklyHours?.some(d => d.enabled)) facts.push(spokenHours(a.weeklyHours));
  if (a.minutes) facts.push(`${a.minutes}-minute appointments`);
  const have = facts.length ? `Here’s what I have so far: ${facts.join("; ")}.` : "I don’t have much yet.";
  if (!missing.length) return `${have} Look it over; if anything’s wrong, change it on the card or tell me here. Questions about any of these? Just ask.`;
  const list = missing.length === 1 ? missing[0] : `${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}`;
  return `${have} Still missing: ${list}. Fill those in on the card, or ask me if you’re not sure what to put.`;
}

/** A plain answer to a question about the card, no model needed. */
export function localHelp(question: string, a: InterviewAnswers, stage: "talk" | "hear" = "talk"): string {
  const q = question.toLowerCase();
  if (stage === "hear") {
    if (/greet|first thing|callers? hear|incoming|when (a )?customer(s)? call/.test(q)) return "The greeting is the first thing a caller hears when Bubs™ picks up. Edit the words in the box, or press “Suggest other versions” for three rewrites. Keep it short enough to say in one breath.";
    if (/confirm|outgoing|call(s)? (a |the )?customer|reminder|\{customer\}|placeholder/.test(q)) return "The confirmation call is Bubs™ ringing a customer the day before their appointment. Keep {customer}, {day} and {time} in the script; Bubs™ fills them in on each call.";
    if (/booking page|openings|slots|link|url/.test(q)) return "Your booking page is where customers pick a time online, and where phone bookings show up too. The openings come from your business hours and appointment length.";
    if (/play|hear it|audio|voice|listen|call me/.test(q)) return "Voice is switched off in this build, so there’s no audio yet. When it’s on, the greeting plays in Bubs™’s voice and you can have Bubs™ call you.";
  }
  if (/missing|left|else|what.*need|done|finished|complete/.test(q)) {
    const missing = missingFields(a);
    return missing.length ? `Still to fill in: ${missing.join(", ")}.` : "Nothing’s missing. Everything on the card is filled in; you can carry on to the preview.";
  }
  const hit = FIELDS.find(f => f.match.test(q));
  if (hit) return hit.help;
  if (/save|saved|lose|later|come back/.test(q)) return "Everything you enter is saved on this device as you go, so you can leave and come back.";
  if (/change|edit|wrong|fix|update/.test(q)) return "Change anything straight on the card. I’ll notice and keep up.";
  return "I can help with any field on the card: phone, name, business type, address, hours, appointment length, or when I answer the phone. Which one?";
}


const DAY_WORDS: Array<[RegExp, number[]]> = [
  [/\bweekends?\b/, [0, 6]], [/\bweekdays?\b/, [1, 2, 3, 4, 5]], [/\bevery ?day\b|\ball (the )?days\b|\bdaily\b/, [0, 1, 2, 3, 4, 5, 6]],
  [/\bsun(day)?s?\b/, [0]], [/\bmon(day)?s?\b/, [1]], [/\btue(s|sday)?s?\b/, [2]], [/\bwed(nesday)?s?\b/, [3]], [/\bthu(r|rs|rsday)?s?\b/, [4]], [/\bfri(day)?s?\b/, [5]], [/\bsat(urday)?s?\b/, [6]],
];
const daysIn = (t: string) => [...new Set(DAY_WORDS.flatMap(([re, days]) => re.test(t) ? days : []))].sort((a, b) => a - b);
const dayList = (days: number[]) => { const n = days.map(d => DAY_NAMES[d]); return n.length <= 1 ? n[0] ?? "" : `${n.slice(0, -1).join(", ")} and ${n[n.length - 1]}`; };

export type Command = { answers: InterviewAnswers; reply: string };

/**
 * Plain requests that change the card: "close Sundays", "open at 10", "make
 * appointments an hour", "call it Willow Studio". Returns null when the text
 * isn't one, so it falls through to a question.
 */
export function applyCommand(text: string, a: InterviewAnswers): Command | null {
  const t = text.trim().toLowerCase();
  const hours: DayHours[] = a.weeklyHours ?? weeklyHoursForPreset("weekdays");
  const days = daysIn(t);
  const closing = /\b(close|closed|uncheck|remove|turn off|switch off|not open|no|disable|take off|off on)\b/.test(t);
  const opening = /\b(open|check|add|turn on|switch on|enable|on)\b/.test(t) && !/\bopen(s)? at\b/.test(t);
  if (days.length && (closing || opening) && !/\bat\b|\d/.test(t)) {
    const enabled = !closing;
    const next = hours.map(d => days.includes(d.day) ? { ...d, enabled } : d);
    if (!next.some(d => d.enabled)) return { answers: a, reply: "That would leave no open days. Which days are you open?" };
    return { answers: { ...a, weeklyHours: next, hoursPreset: "custom" }, reply: `Done. ${dayList(days)} ${days.length === 1 ? "is" : "are"} now ${enabled ? "open" : "closed"}. Anything else?` };
  }
  const time = t.match(/\b(open|opens|opening|start|close|closes|closing|finish|end)s?\s*(?:at|from|to|by)?\s*(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm|a|p)?)\b/);
  if (time) {
    const isClose = /^(close|closes|closing|finish|end)/.test(time[1]);
    const n = parseTimeText(time[2], isClose);
    if (n === null) return { answers: a, reply: "I didn’t catch the time. Try something like “open at 9” or “close at 5:30 pm”." };
    const key = isClose ? "closes" : "opens";
    const next = hours.map(d => d.enabled ? { ...d, [key]: minuteTime(Math.round(n / 15) * 15) } : d);
    return { answers: { ...a, weeklyHours: next, hoursPreset: "custom" }, reply: `Done. You now ${isClose ? "close" : "open"} at ${formatTime(Math.round(n / 15) * 15)} on the days you’re open.` };
  }
  const mins = t.match(/\b(\d{1,3})\s*(min|mins|minute|minutes)\b/) ?? (/(an|one|1) hour\b/.test(t) ? ["", "60"] : /\b(1\.5|one and a half|90) ?(hours?|min)/.test(t) ? ["", "90"] : /\b(two|2) hours\b/.test(t) ? ["", "120"] : /\bhalf an hour\b|\b30\b/.test(t) && /appointment|slot|booking|length|long/.test(t) ? ["", "30"] : null);
  if (mins && /appointment|slot|booking|length|long|visit|session/.test(t)) {
    const n = Number(mins[1]);
    const allowed = [15, 30, 45, 60, 90, 120, 180, 240];
    const pick = allowed.reduce((best, x) => Math.abs(x - n) < Math.abs(best - n) ? x : best, allowed[0]);
    return { answers: { ...a, minutes: pick }, reply: `Done. Appointments are ${pick} minutes${pick !== n ? ` (the nearest I can do to ${n})` : ""}.` };
  }
  const name = text.trim().match(/\b(?:call (?:it|us|the business)|(?:change|set|update)(?: the)?(?: business)? name to|(?:the )?name is|we(?:'|’)?re called)\s+["“]?([^"”]{2,120}?)["”]?\.?$/i);
  if (name) return { answers: { ...a, businessName: name[1].trim() }, reply: `Done. I’ll call you ${name[1].trim()}.` };
  const addr = text.trim().match(/\b(?:(?:change|set|update)(?: the)? address to|(?:the )?address is|we(?:'|’)?re at)\s+(.{5,300}?)\.?$/i);
  if (addr) return { answers: { ...a, address: addr[1].trim() }, reply: `Done. Address is now ${addr[1].trim()}.` };
  return null;
}

/** Merge an extractor patch (voice) into the answers; nulls mean "not said". */
export function applyExtractedPatch(a: InterviewAnswers, p: { phone?: string | null; businessName?: string | null; trade?: "salon" | "studio" | "other" | null; customTrade?: string | null; address?: string | null; days?: number[] | null; opens?: string | null; closes?: string | null; minutes?: number | null; answering?: "always" | "after_hours" | "backup" | "choice" | null }): InterviewAnswers {
  const next: InterviewAnswers = { ...a };
  if (p.phone) next.phone = p.phone;
  if (p.businessName) next.businessName = p.businessName;
  if (p.trade) { next.trade = p.trade; if (p.trade !== "other") next.customTrade = undefined; }
  if (p.customTrade) { next.customTrade = p.customTrade; next.trade = next.trade ?? "other"; }
  if (p.address) next.address = p.address;
  if (p.days || p.opens || p.closes) {
    const base = next.weeklyHours ?? weeklyHoursForPreset("weekdays");
    next.weeklyHours = base.map(d => ({
      ...d,
      enabled: p.days ? p.days.includes(d.day) : d.enabled,
      opens: p.opens ?? d.opens,
      closes: p.closes ?? d.closes,
    }));
    next.hoursPreset = "custom";
  }
  if (p.minutes) next.minutes = p.minutes;
  if (p.answering) next.answering = p.answering;
  return next;
}

/** Without a model: the interview parser for the current question, then the command parser. */
export function heuristicExtract(said: string, a: InterviewAnswers, stepId: string): InterviewAnswers {
  const cmd = applyCommand(said, a);
  if (cmd && cmd.answers !== a) return cmd.answers;
  const t = said.toLowerCase();
  if (stepId === "trade" || !a.trade) {
    if (/salon|spa|barber|nail|lash|brow|massage|wellness|hair|beauty/.test(t)) return { ...a, trade: "salon" };
    if (/studio|photograph|record|dance|tattoo|art\b/.test(t)) return { ...a, trade: "studio" };
  }
  if (stepId === "answering" || !a.answering) {
    if (/every call|any ?time|all calls|always/.test(t)) return { ...a, answering: "always" };
    if (/after hours|when (we|i)'?re? closed|only after/.test(t)) return { ...a, answering: "after_hours" };
    if (/can'?t (pick up|answer)|nobody picks|no one picks|few rings|backup|if (we|i) miss/.test(t)) return { ...a, answering: "backup" };
    if (/press (one|1)|callers? choose|let them choose|choice/.test(t)) return { ...a, answering: "choice" };
  }
  return a;
}
