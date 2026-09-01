import { NextResponse } from "next/server";
import { getAppointment, updateAppointmentStatus } from "@/lib/db";
import { dispatchConfirmationCall } from "@/lib/voice";
import type { AppointmentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "rescheduled",
  "cancelled",
  "completed",
  "no_answer",
];

/**
 * PATCH /api/admin/appointments/<id>
 *   { "status": "confirmed" }   → set the status by hand
 *   { "action": "recall" }      → place the confirmation call again
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: { status?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const existing = await getAppointment(id);
  if (!existing) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  if (body.action === "recall") {
    const result = await dispatchConfirmationCall(id, { forceNew: true });
    if (result.ok) await updateAppointmentStatus(id, "pending");
    return NextResponse.json(
      { appointment: await getAppointment(id), call: result },
      { status: result.ok ? 200 : 502 },
    );
  }

  if (body.status) {
    if (!VALID.includes(body.status as AppointmentStatus)) {
      return NextResponse.json({ error: "Unknown status." }, { status: 422 });
    }
    await updateAppointmentStatus(id, body.status as AppointmentStatus);
    return NextResponse.json({ appointment: await getAppointment(id) });
  }

  return NextResponse.json({ error: "Nothing to do." }, { status: 400 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const appointment = await getAppointment(id);
  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }
  return NextResponse.json({ appointment });
}
