import { getAppointment } from "@/lib/db";
import { providerLabel } from "@/lib/format";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "");

/** Escapes the characters iCalendar treats as structure. */
const escape = (value: string) =>
  value.replace(/([,;\\])/g, "\\$1").replace(/\r?\n/g, "\\n");

/** GET /api/appointments/<id>/ics?ref=NL-XXXXXX — calendar file for the patient. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const reference = new URL(request.url).searchParams.get("ref");
  const appointment = await getAppointment(id);

  if (!appointment || !reference || appointment.reference !== reference.toUpperCase()) {
    return new Response("Not found", { status: 404 });
  }

  const title = `Appointment with ${providerLabel(appointment.provider)} · ${env.clinicName}`;
  const description = [
    `Reference: ${appointment.reference}`,
    appointment.provider ? `${appointment.provider.specialty} · ${appointment.provider.credentials}` : "",
    appointment.reason ? `Reason: ${appointment.reason}` : "",
    "Please arrive ten minutes early with photo ID and your insurance card.",
  ]
    .filter(Boolean)
    .join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI Receptionist//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${appointment.id}@ai-receptionist`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(appointment.starts_at)}`,
    `DTEND:${stamp(appointment.ends_at)}`,
    `SUMMARY:${escape(title)}`,
    `DESCRIPTION:${escape(description)}`,
    `LOCATION:${escape(appointment.provider?.location ?? env.clinicName)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${appointment.reference}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
