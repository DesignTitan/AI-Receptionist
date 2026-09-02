import { NextResponse } from "next/server";
import { getAvailability, getAvailabilityCalendar, getProviderBySlug } from "@/lib/db";
import { env } from "@/lib/env";
import { timezoneLabel } from "@/lib/time";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability?provider=<slug>&date=YYYY-MM-DD  → slots for that day
 * GET /api/availability?provider=<slug>&calendar=1       → open-slot counts for 21 days
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("provider");
  if (!slug) {
    return NextResponse.json({ error: "provider is required" }, { status: 400 });
  }

  const provider = await getProviderBySlug(slug);
  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  if (searchParams.get("calendar")) {
    return NextResponse.json({
      timezone: env.timezone,
      days: await getAvailabilityCalendar(provider),
    });
  }

  const date = searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date must be provided as YYYY-MM-DD" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    date,
    timezone: env.timezone,
    timezoneLabel: timezoneLabel(env.timezone),
    slotMinutes: provider.slot_minutes,
    slots: await getAvailability(provider, date),
  });
}
