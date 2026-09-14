export type AddressSuggestion = { primary: string; secondary: string; value: string };

type PhotonProperties = Partial<Record<"name" | "housenumber" | "street" | "city" | "town" | "village" | "state" | "postcode" | "country" | "osm_key" | "osm_value", string>>;

/** Transit stops and platforms carry street names but are never a business address. */
const transit = new Set(["bus_stop", "platform", "stop_position", "station", "halt", "tram_stop"]);

const homeCountries = new Set(["United States", "United States of America", "USA"]);

/** Turns one Photon feature into a display pair and the text that goes into the address field. */
export function formatAddressSuggestion(p: PhotonProperties): AddressSuggestion | undefined {
  if (p.osm_key === "public_transport" || transit.has(p.osm_value ?? "")) return undefined;
  const street = [p.housenumber, p.street].filter(Boolean).join(" ");
  const primary = street || p.name || "";
  if (!primary) return undefined;
  const locality = [p.city || p.town || p.village, p.state, p.postcode].filter(Boolean).join(", ");
  const abroad = p.country && !homeCountries.has(p.country) ? p.country : "";
  const secondary = [locality, abroad].filter(Boolean).join(" · ");
  const value = [primary, locality, abroad].filter(Boolean).join(", ");
  return { primary, secondary, value };
}

export function uniqueSuggestions(features: Array<{ properties: PhotonProperties }>): AddressSuggestion[] {
  const seen = new Set<string>();
  const out: AddressSuggestion[] = [];
  for (const f of features) {
    const s = formatAddressSuggestion(f.properties ?? {});
    if (!s || seen.has(s.value)) continue;
    seen.add(s.value);
    out.push(s);
  }
  return out;
}
