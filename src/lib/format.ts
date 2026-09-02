import type { Doctor } from "./types";

/**
 * Display helpers that every surface shares, so a provider is written the
 * same way in the directory, the booking review, the email, the .ics file
 * and the voice script. Today that means "Dr. Name"; once the vertical
 * config lands this is where a stylist stops getting a title.
 */
export function providerLabel(provider: Pick<Doctor, "name"> | null | undefined): string {
  if (!provider) return "";
  return `Dr. ${provider.name}`;
}
