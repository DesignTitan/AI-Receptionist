import type { BusinessLookup, Trade } from "./setup-interview.ts";
import type { DayHours } from "./weekly-hours.ts";

/** Google Places (New) → the shape the setup interview understands. Pure, so it's unit-tested without a key. */

const salonTypes = new Set(["hair_salon", "beauty_salon", "nail_salon", "spa", "barber_shop", "hair_care", "massage", "skin_care_clinic", "tanning_studio", "wellness_center", "sauna", "yoga_studio"]);
const studioTypes = new Set(["photography_studio", "art_studio", "recording_studio", "dance_school", "art_gallery", "design_agency", "tattoo_parlor"]);

export type PlacePeriod = { open?: { day: number; hour: number; minute: number }; close?: { day: number; hour: number; minute: number } };
export type Place = { displayName?: { text?: string }; formattedAddress?: string; nationalPhoneNumber?: string; websiteUri?: string; primaryType?: string; primaryTypeDisplayName?: { text?: string }; types?: string[]; regularOpeningHours?: { periods?: PlacePeriod[] } };

const pad = (n: number) => String(n).padStart(2, "0");

/** Google's periods are per-day open/close pairs; the app keeps one range per weekday. The first period of each day wins. */
export function hoursFromPeriods(periods: PlacePeriod[] | undefined): DayHours[] | undefined {
  if (!periods?.length) return undefined;
  const days: DayHours[] = Array.from({ length: 7 }, (_, day) => ({ day, enabled: false, opens: "09:00", closes: "17:00" }));
  for (const p of periods) {
    if (!p.open || !p.close || p.open.day < 0 || p.open.day > 6) continue;
    const d = days[p.open.day];
    if (d.enabled) continue;
    d.enabled = true;
    d.opens = `${pad(p.open.hour)}:${pad(p.open.minute)}`;
    d.closes = p.close.day === p.open.day ? `${pad(p.close.hour)}:${pad(p.close.minute)}` : "23:45";
  }
  return days.some(d => d.enabled) ? days : undefined;
}

export function tradeFromTypes(types: string[] | undefined, primary?: string): { trade: Trade; customTrade?: string } {
  const all = [primary, ...(types ?? [])].filter(Boolean) as string[];
  if (all.some(t => salonTypes.has(t))) return { trade: "salon" };
  if (all.some(t => studioTypes.has(t))) return { trade: "studio" };
  return { trade: "other", customTrade: primary ? primary.replace(/_/g, " ") : undefined };
}

export function lookupFromPlace(place: Place): BusinessLookup | undefined {
  const name = place.displayName?.text?.trim();
  const address = place.formattedAddress?.trim();
  if (!name || !address) return undefined;
  const kind = tradeFromTypes(place.types, place.primaryType);
  return {
    name,
    address: address.replace(/, (USA|United States)$/, ""),
    phone: place.nationalPhoneNumber,
    website: place.websiteUri,
    trade: kind.trade,
    customTrade: kind.trade === "other" ? (place.primaryTypeDisplayName?.text ?? kind.customTrade) : undefined,
    weeklyHours: hoursFromPeriods(place.regularOpeningHours?.periods),
  };
}
