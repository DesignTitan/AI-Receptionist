import { NextResponse } from "next/server";
import { lookupFromPlace, type Place } from "@/lib/platform/business-lookup";

export const dynamic = "force-dynamic";

/**
 * POST /api/setup/lookup { phone } → the business behind a phone number.
 * Uses Google Places (New) Text Search when GOOGLE_PLACES_API_KEY is set.
 * Without a key it answers { configured:false, found:false } so the interview
 * simply asks the questions instead; it never invents a listing.
 */
export async function POST(request: Request) {
  let body: { phone?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const digits = typeof body.phone === "string" ? body.phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "") : "";
  if (!/^[2-9]\d\d[2-9]\d{6}$/.test(digits)) return NextResponse.json({ error: "Enter a ten-digit US phone number." }, { status: 422 });
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return NextResponse.json({ configured: false, found: false });
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.primaryType,places.primaryTypeDisplayName,places.types,places.regularOpeningHours.periods",
      },
      body: JSON.stringify({ textQuery: `+1${digits}`, maxResultCount: 1, regionCode: "US" }),
    });
    clearTimeout(timer);
    if (!r.ok) return NextResponse.json({ configured: true, found: false, error: `Lookup failed (${r.status}).` });
    const data = (await r.json()) as { places?: Place[] };
    const lookup = data.places?.[0] ? lookupFromPlace(data.places[0]) : undefined;
    return NextResponse.json({ configured: true, found: Boolean(lookup), lookup: lookup ?? null });
  } catch {
    return NextResponse.json({ configured: true, found: false, error: "Lookup timed out." });
  }
}
