import { NextResponse } from "next/server";
import { getAvailability, getAvailabilityCalendar, getDoctorBySlug } from "@/lib/db";
import { env } from "@/lib/env";
import { timezoneLabel } from "@/lib/time";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability?doctor=<slug>&date=YYYY-MM-DD  → slots for that day
 * GET /api/availability?doctor=<slug>&calendar=1       → open-slot counts for 21 days
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("doctor");
  if (!slug) {
    return NextResponse.json({ error: "doctor is required" }, { status: 400 });
  }

  const doctor = await getDoctorBySlug(slug);
  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  if (searchParams.get("calendar")) {
    return NextResponse.json({
      timezone: env.timezone,
      days: await getAvailabilityCalendar(doctor),
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
    slotMinutes: doctor.slot_minutes,
    slots: await getAvailability(doctor, date),
  });
}
