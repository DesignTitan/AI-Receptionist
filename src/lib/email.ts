import { env, isEmailConfigured } from "./env";
import { providerLabel } from "@/lib/format";
import { getAppointment, getCall, logNotification } from "./db";
import { formatDate, formatDuration, formatTime, timezoneLabel } from "./time";
import type { AppointmentDetail, CallLog } from "./types";

/**
 * Transactional email via the Resend REST API.
 *
 * With no RESEND_API_KEY the message is rendered and logged instead of sent, so
 * the notification path is still exercised end to end in development.
 */

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  appointmentId?: string | null;
};

async function send({ to, subject, html, appointmentId }: SendArgs) {
  if (!isEmailConfigured()) {
    console.info(
      `[email:logged] to=${to} subject="${subject}" (set RESEND_API_KEY + CLINIC_OWNER_EMAIL to deliver)`,
    );
    await logNotification({
      appointment_id: appointmentId ?? null,
      channel: "email",
      recipient: to,
      subject,
      status: "logged",
      error: null,
    });
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: env.emailFrom, to: [to], subject, html }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Resend responded ${response.status}: ${detail.slice(0, 300)}`);
    }
    await logNotification({
      appointment_id: appointmentId ?? null,
      channel: "email",
      recipient: to,
      subject,
      status: "sent",
      error: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[email:failed]", message);
    await logNotification({
      appointment_id: appointmentId ?? null,
      channel: "email",
      recipient: to,
      subject,
      status: "failed",
      error: message,
    });
  }
}

/* ── Templates ───────────────────────────────────────────────────────── */

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const absolute = (path: string | null) => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${env.siteUrl}${path}`;
};

function shell(title: string, accentLabel: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
      <tr><td style="background:#0f766e;padding:22px 28px">
        <div style="color:#99f6e4;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:600">${escape(accentLabel)}</div>
        <div style="color:#ffffff;font-size:20px;font-weight:700;margin-top:4px">${escape(title)}</div>
        <div style="color:#5eead4;font-size:13px;margin-top:2px">${escape(env.clinicName)}</div>
      </td></tr>
      <tr><td style="padding:28px">${body}</td></tr>
      <tr><td style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px">
        Sent automatically by your AI receptionist. <a href="${env.siteUrl}/admin" style="color:#0f766e">Open the dashboard</a>.
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

const row = (label: string, value: string) =>
  `<tr>
    <td style="padding:8px 0;color:#64748b;font-size:13px;width:150px;vertical-align:top">${escape(label)}</td>
    <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:500">${value}</td>
  </tr>`;

function appointmentTable(detail: AppointmentDetail) {
  const tz = env.timezone;
  return `<table role="presentation" width="100%" style="border-collapse:collapse">
    ${row("Reference", escape(detail.reference))}
    ${row("Client", escape(detail.client?.full_name ?? "—"))}
    ${row("Phone", `<a href="tel:${escape(detail.client?.phone ?? "")}" style="color:#0f766e">${escape(detail.client?.phone ?? "—")}</a>`)}
    ${row("Email", detail.client?.email ? `<a href="mailto:${escape(detail.client.email)}" style="color:#0f766e">${escape(detail.client.email)}</a>` : "—")}
    ${row("Provider", escape(`${providerLabel(detail.provider)} · ${detail.provider?.specialty ?? ""}`))}
    ${row("When", escape(`${formatDate(detail.starts_at, tz)} at ${formatTime(detail.starts_at, tz)} ${timezoneLabel(tz)}`))}
    ${row("Client type", detail.is_new_client ? "New patient" : "Returning patient")}
    ${row("Reason", escape(detail.reason || "Not provided"))}
  </table>`;
}

/* ── Public senders ──────────────────────────────────────────────────── */

/** Fired the moment a booking lands, before the confirmation call is placed. */
export async function sendBookingReceivedEmail(appointmentId: string) {
  const detail = await getAppointment(appointmentId);
  if (!detail) return;

  if (env.ownerEmail || !isEmailConfigured()) {
    const body = `
      <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155">
        A new appointment was booked online. The AI receptionist is placing a confirmation call now — you'll get a second email with the recording and outcome.
      </p>
      ${appointmentTable(detail)}
      <p style="margin:24px 0 0">
        <a href="${env.siteUrl}/admin/appointments/${detail.id}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14px;font-weight:600">View in dashboard</a>
      </p>`;
    await send({
      to: env.ownerEmail ?? "owner@example.com",
      subject: `New booking · ${detail.client?.full_name ?? "Client"} with ${providerLabel(detail.provider)} (${detail.reference})`,
      html: shell("New appointment booked", "Booking received", body),
      appointmentId: detail.id,
    });
  }

  if (detail.client?.email) {
    const tz = env.timezone;
    const body = `
      <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155">
        Hi ${escape(detail.client.full_name.split(" ")[0])}, we've reserved your appointment. Our automated assistant will ring you in the next minute to confirm the details — it only takes about thirty seconds.
      </p>
      ${appointmentTable(detail)}
      <p style="margin:22px 0 0;font-size:13px;color:#64748b">
        Keep reference <strong>${escape(detail.reference)}</strong> handy. Need to change something? Just tell the assistant when it calls, or reply to this email.
      </p>`;
    await send({
      to: detail.client.email,
      subject: `Your appointment with ${providerLabel(detail.provider)} · ${formatDate(detail.starts_at, tz)}`,
      html: shell("We've got you booked", "Appointment reserved", body),
      appointmentId: detail.id,
    });
  }
}

const OUTCOME_COPY: Record<string, string> = {
  confirmed: "The patient confirmed the appointment.",
  rescheduled: "The patient asked to reschedule — front desk follow-up needed.",
  cancelled: "The patient cancelled the appointment.",
  voicemail: "The call reached voicemail; a message was left.",
  no_answer: "Nobody answered. A retry is recommended.",
  failed: "The call could not be completed.",
};

/** Fired when a confirmation call finishes, with the recording and transcript. */
export async function sendCallCompletedEmail(callId: string) {
  const call = await getCall(callId);
  if (!call) return;
  const detail = await getAppointment(call.appointment_id);
  if (!detail) return;

  const recording = absolute(call.recording_url);
  const outcome = call.outcome ?? (call.status === "failed" ? "failed" : "no_answer");
  const attention = outcome !== "confirmed";

  const body = `
    <div style="border-left:3px solid ${attention ? "#f59e0b" : "#0f766e"};background:${attention ? "#fffbeb" : "#f0fdfa"};padding:14px 16px;border-radius:0 8px 8px 0;margin:0 0 22px">
      <div style="font-size:15px;font-weight:600;color:#0f172a">${escape(OUTCOME_COPY[outcome] ?? "Call finished.")}</div>
      <div style="font-size:13px;color:#475569;margin-top:4px">
        Duration ${escape(formatDuration(call.duration_seconds))}${call.cost ? ` · $${call.cost.toFixed(2)}` : ""} · via ${escape(call.provider)}
      </div>
    </div>
    ${appointmentTable(detail)}
    ${
      recording
        ? `<p style="margin:22px 0 0">
             <a href="${recording}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14px;font-weight:600">▶ Listen to the recording</a>
           </p>`
        : `<p style="margin:22px 0 0;font-size:13px;color:#64748b">No recording is available for this call.</p>`
    }
    ${
      call.summary
        ? `<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin:28px 0 8px">Summary</h3>
           <p style="margin:0;font-size:14px;line-height:1.6;color:#334155">${escape(call.summary)}</p>`
        : ""
    }
    ${
      call.transcript
        ? `<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin:24px 0 8px">Transcript</h3>
           <pre style="margin:0;white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;line-height:1.65;color:#334155;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px">${escape(call.transcript)}</pre>`
        : ""
    }
    <p style="margin:24px 0 0">
      <a href="${env.siteUrl}/admin/appointments/${detail.id}" style="color:#0f766e;font-size:14px;font-weight:600">Open the full record in the dashboard →</a>
    </p>`;

  await send({
    to: env.ownerEmail ?? "owner@example.com",
    subject: `${attention ? "⚠ Action needed" : "✓ Confirmed"} · ${detail.client?.full_name ?? "Client"} (${detail.reference})`,
    html: shell(
      attention ? "Confirmation call needs follow-up" : "Appointment confirmed by phone",
      "Call completed",
      body,
    ),
    appointmentId: detail.id,
  });
}

export function emailStatus() {
  return {
    configured: isEmailConfigured(),
    owner: env.ownerEmail ?? null,
  };
}

export type { CallLog };
