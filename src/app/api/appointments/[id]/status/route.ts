import { NextResponse } from "next/server";
import { getAppointment } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Public status poll for the confirmation screen.
 *
 * The booking reference is required alongside the id, so knowing a URL alone is
 * not enough to read someone else's appointment. Only the fields the person who
 * made the booking already knows are returned.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const reference = new URL(request.url).searchParams.get("ref");
  const appointment = await getAppointment(id);

  if (!appointment || !reference || appointment.reference !== reference.toUpperCase()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: appointment.status,
    call: appointment.call
      ? {
          status: appointment.call.status,
          outcome: appointment.call.outcome,
          durationSeconds: appointment.call.duration_seconds,
          summary: appointment.call.summary,
        }
      : null,
  });
}
