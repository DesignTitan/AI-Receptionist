import { TERMS, type Terms } from "@/verticals/terms";
import type { Provider } from "./types";

/**
 * Display helpers every surface shares, so a provider is written the same way
 * in the directory, the booking review, the email, the .ics file and the voice
 * script. The honorific comes from the provider's vertical: a doctor gets
 * "Dr. ", a stylist gets nothing.
 */
export function providerLabel(
  provider: Pick<Provider, "name" | "vertical"> | null | undefined,
): string {
  if (!provider) return "";
  return `${TERMS[provider.vertical].providerPrefix}${provider.name}`;
}

export const clientTypeLabel = (isNew: boolean, t: Terms) =>
  isNew ? `New ${t.client.one}` : `Returning ${t.client.one}`;
