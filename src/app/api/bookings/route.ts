import { after, NextResponse } from "next/server";
import { BookingError, createBooking } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

type Payload = {
  doctorId?: string;
  startsAt?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  reason?: string;
  isNewPatient?: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(body: Payload) {
  const errors: Record<string, string> = {};
  const fullName = (body.fullName ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const email = (body.email ?? "").trim();
  const reason = (body.reason ?? "").trim();

  if (fullName.length < 2) errors.fullName = "Please enter your full name.";
  if (fullName.length > 120) errors.fullName = "That name is too long.";
  if (phone.replace(/\D/g, "").length < 7) {
    errors.phone = "Enter a phone number we can reach you on.";
  }
  if (email && !EMAIL_RE.test(email)) errors.email = "That email doesn't look right.";
  if (reason.length > 600) errors.reason = "Please keep this under 600 characters.";
  if (!body.doctorId) errors.doctorId = "Choose a doctor.";
  if (!body.startsAt || Number.isNaN(Date.parse(body.startsAt))) {
    errors.startsAt = "Choose an appointment time.";
  }
  return {
    errors,
    values: { fullName, phone, email: email || null, reason: reason || null },
  };
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { errors, values } = validate(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Please check the form.", errors }, { status: 422 });
  }

  try {
    const result = await createBooking({
      doctorId: body.doctorId!,
      startsAt: new Date(body.startsAt!).toISOString(),
      fullName: values.fullName,
      phone: values.phone,
      email: values.email,
      reason: values.reason,
      isNewPatient: Boolean(body.isNewPatient),
    });

    // Hand off to the new-booking webhook once the patient has their response.
    // Going over HTTP (rather than calling the function directly) keeps this
    // the same code path an external system would trigger.
    after(async () => {
      try {
        const response = await fetch(`${env.siteUrl}/api/webhooks/new-booking`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(env.voiceWebhookSecret
              ? { "x-webhook-secret": env.voiceWebhookSecret }
              : {}),
          },
          body: JSON.stringify({
            event: "appointment.created",
            appointmentId: result.appointment.id,
          }),
        });
        if (!response.ok) {
          console.error("[bookings] webhook responded", response.status, await response.text());
        }
      } catch (error) {
        console.error("[bookings] webhook dispatch failed", error);
      }
    });

    return NextResponse.json(
      {
        appointmentId: result.appointment.id,
        reference: result.appointment.reference,
        startsAt: result.appointment.starts_at,
        doctor: { name: result.doctor.name, specialty: result.doctor.specialty },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("[bookings] failed", error);
    return NextResponse.json(
      { error: "We couldn't complete that booking. Please try again." },
      { status: 500 },
    );
  }
}
