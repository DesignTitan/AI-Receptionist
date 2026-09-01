import { NextResponse } from "next/server";
import { getAppointment } from "@/lib/db";
import { sendBookingReceivedEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { dispatchConfirmationCall } from "@/lib/voice";

/**
 * New-booking webhook.
 *
 * The booking API calls this immediately after an appointment is written, and
 * any external system (Supabase database webhook, Zapier, n8n, a CRM) can call
 * it with the same body. It owns the two side effects of a new booking:
 * notifying the clinic owner and placing the outbound confirmation call.
 *
 *   POST /api/webhooks/new-booking
 *   headers: x-webhook-secret: <VOICE_WEBHOOK_SECRET>
 *   body:    { "appointmentId": "<uuid>" }
 *
 * Supabase database webhook payloads (`{ type: "INSERT", record: {...} }`) are
 * accepted as well, so you can wire this straight to the appointments table.
 */

export const dynamic = "force-dynamic";

type Payload = {
  event?: string;
  appointmentId?: string;
  appointment_id?: string;
  record?: { id?: string };
  forceNew?: boolean;
};

function authorize(request: Request) {
  const secret = env.voiceWebhookSecret;
  if (!secret) return true; // Demo mode: no secret configured.
  const header = request.headers.get("x-webhook-secret");
  const token = new URL(request.url).searchParams.get("token");
  return header === secret || token === secret;
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const appointmentId = body.appointmentId ?? body.appointment_id ?? body.record?.id;
  if (!appointmentId) {
    return NextResponse.json({ error: "appointmentId is required." }, { status: 400 });
  }

  const appointment = await getAppointment(appointmentId);
  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  // Notify the clinic first — it must land even if the telephony provider is down.
  try {
    await sendBookingReceivedEmail(appointmentId);
  } catch (error) {
    console.error("[webhook:new-booking] email failed", error);
  }

  const dispatch = await dispatchConfirmationCall(appointmentId, {
    forceNew: Boolean(body.forceNew),
  });

  return NextResponse.json(
    {
      received: true,
      appointmentId,
      reference: appointment.reference,
      call: dispatch,
    },
    { status: dispatch.ok ? 200 : 502 },
  );
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/webhooks/new-booking",
    method: "POST",
    provider: env.voiceProvider,
    secured: Boolean(env.voiceWebhookSecret),
    body: { appointmentId: "<uuid>" },
  });
}
