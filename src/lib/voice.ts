import { env, isVoiceProviderConfigured } from "./env";
import {
  createCall,
  getAppointment,
  getLatestCallForAppointment,
  updateCall,
} from "./db";
import { formatDate, formatTime, timezoneLabel } from "./time";
import type { AppointmentDetail, CallLog } from "./types";

/**
 * Outbound voice dispatch.
 *
 * One shape in — an appointment id — and one of four back ends out: Vapi,
 * Bland.ai, OmniDimension, or the built-in simulator. Providers differ only in
 * their request body; everything else (call log rows, retries, webhook URL) is
 * shared.
 */

export type DispatchResult = {
  ok: boolean;
  provider: string;
  callId: string;
  providerCallId?: string | null;
  simulated: boolean;
  error?: string;
};

/** Where the provider posts call events back to. */
export function voiceWebhookUrl() {
  const url = new URL("/api/webhooks/voice", env.siteUrl);
  if (env.voiceWebhookSecret) url.searchParams.set("token", env.voiceWebhookSecret);
  return url.toString();
}

/** The instructions the voice agent follows on the call. */
export function buildAgentScript(detail: AppointmentDetail) {
  const tz = env.timezone;
  const patient = detail.patient?.full_name ?? "the patient";
  const first = patient.split(" ")[0];
  const doctor = detail.doctor ? `Dr. ${detail.doctor.name}` : "the doctor";

  return `You are Ava, the phone receptionist for ${env.clinicName}. You are making a short, warm outbound call to confirm an appointment that was just booked online. Keep it under sixty seconds.

Appointment details:
- Patient: ${patient}
- Doctor: ${doctor} (${detail.doctor?.specialty ?? "General practice"})
- Date and time: ${formatDate(detail.starts_at, tz)} at ${formatTime(detail.starts_at, tz)} ${timezoneLabel(tz)}
- Location: ${detail.doctor?.location ?? env.clinicName}
- Reference: ${detail.reference}
- Reason given: ${detail.reason || "not specified"}
- Patient type: ${detail.is_new_patient ? "new patient" : "returning patient"}

How to run the call:
1. Greet by name and confirm you are speaking with ${first}. If it is someone else, politely ask when ${first} is available and end the call.
2. State the doctor, day and time, and ask whether that still works.
3. If yes: confirm, then ask them to arrive ten minutes early with photo ID and insurance card.${detail.is_new_patient ? " Mention that a new-patient intake form will be texted to them." : ""}
4. If they want a different time: do not attempt to rebook on the call. Say the front desk will text options within the hour, and note the times that suit them.
5. If they want to cancel: acknowledge without pressure and confirm the cancellation.
6. Close politely and end the call.

Rules: never give medical advice, never discuss test results or diagnoses, never take payment or insurance numbers over the phone. If asked a clinical question, say a member of the care team will follow up. Speak plainly and do not rush.

At the end, classify the outcome as exactly one of: confirmed, rescheduled, cancelled, voicemail, no_answer.`;
}

const firstMessage = (detail: AppointmentDetail) =>
  `Hi, this is Ava calling from ${env.clinicName}. Am I speaking with ${detail.patient?.full_name ?? "the patient"}?`;

const cleanPhone = (phone: string) => {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : `+1${digits.replace(/^1/, "")}`;
};

/* ── Providers ───────────────────────────────────────────────────────── */

type ProviderResponse = { providerCallId: string | null };

async function postJson(url: string, apiKey: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${text.slice(0, 400)}`);
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
}

async function dispatchVapi(detail: AppointmentDetail, call: CallLog): Promise<ProviderResponse> {
  const { apiKey, assistantId, phoneNumberId } = env.vapi;
  const json = await postJson("https://api.vapi.ai/call", apiKey!, {
    assistantId,
    phoneNumberId,
    customer: {
      number: cleanPhone(detail.patient!.phone),
      name: detail.patient!.full_name,
    },
    assistantOverrides: {
      firstMessage: firstMessage(detail),
      model: {
        provider: "anthropic",
        model: "claude-sonnet-5",
        messages: [{ role: "system", content: buildAgentScript(detail) }],
      },
      variableValues: callMetadata(detail, call),
      metadata: callMetadata(detail, call),
      server: { url: voiceWebhookUrl() },
    },
  });
  return { providerCallId: (json.id as string) ?? null };
}

async function dispatchBland(detail: AppointmentDetail, call: CallLog): Promise<ProviderResponse> {
  const { apiKey, voiceId, pathwayId } = env.bland;
  const json = await postJson("https://api.bland.ai/v1/calls", apiKey!, {
    phone_number: cleanPhone(detail.patient!.phone),
    task: pathwayId ? undefined : buildAgentScript(detail),
    pathway_id: pathwayId,
    first_sentence: firstMessage(detail),
    voice: voiceId ?? "june",
    record: true,
    max_duration: 5,
    webhook: voiceWebhookUrl(),
    metadata: callMetadata(detail, call),
    request_data: callMetadata(detail, call),
  });
  return { providerCallId: (json.call_id as string) ?? null };
}

async function dispatchOmniDimension(
  detail: AppointmentDetail,
  call: CallLog,
): Promise<ProviderResponse> {
  const { apiKey, agentId } = env.omnidimension;
  const json = await postJson(
    "https://backend.omnidim.io/api/v1/calls/dispatch",
    apiKey!,
    {
      agent_id: agentId,
      to_number: cleanPhone(detail.patient!.phone),
      call_context: callMetadata(detail, call),
      webhook_url: voiceWebhookUrl(),
    },
  );
  const data = (json.data ?? json) as Record<string, unknown>;
  return { providerCallId: ((data.call_id ?? data.id) as string) ?? null };
}

function callMetadata(detail: AppointmentDetail, call: CallLog) {
  return {
    call_log_id: call.id,
    appointment_id: detail.id,
    reference: detail.reference,
    patient_name: detail.patient?.full_name ?? "",
    patient_first_name: (detail.patient?.full_name ?? "").split(" ")[0],
    doctor_name: detail.doctor ? `Dr. ${detail.doctor.name}` : "",
    specialty: detail.doctor?.specialty ?? "",
    appointment_date: formatDate(detail.starts_at, env.timezone),
    appointment_time: `${formatTime(detail.starts_at, env.timezone)} ${timezoneLabel(env.timezone)}`,
    location: detail.doctor?.location ?? "",
    is_new_patient: detail.is_new_patient,
    clinic_name: env.clinicName,
  };
}

/* ── Entry point ─────────────────────────────────────────────────────── */

/**
 * Places (or re-places) the confirmation call for an appointment.
 * Reuses a queued call row if one is already waiting, so a duplicate webhook
 * delivery does not dial the patient twice.
 */
export async function dispatchConfirmationCall(
  appointmentId: string,
  options: { forceNew?: boolean } = {},
): Promise<DispatchResult> {
  const detail = await getAppointment(appointmentId);
  if (!detail || !detail.patient) {
    return {
      ok: false,
      provider: env.voiceProvider,
      callId: "",
      simulated: false,
      error: "Appointment not found",
    };
  }

  const existing = await getLatestCallForAppointment(appointmentId);
  const reusable =
    !options.forceNew && existing && existing.status === "queued" && !existing.provider_call_id;
  const call = reusable ? existing : await createCall(appointmentId, detail.patient.id);

  if (!isVoiceProviderConfigured()) {
    // Demo mode: the simulator in db.ts walks this call through its lifecycle.
    await updateCall(call.id, { provider: "demo", status: "queued" });
    return {
      ok: true,
      provider: "demo",
      callId: call.id,
      providerCallId: null,
      simulated: true,
    };
  }

  try {
    let result: ProviderResponse;
    switch (env.voiceProvider) {
      case "vapi":
        result = await dispatchVapi(detail, call);
        break;
      case "bland":
        result = await dispatchBland(detail, call);
        break;
      case "omnidimension":
        result = await dispatchOmniDimension(detail, call);
        break;
      default:
        throw new Error(`Unknown VOICE_PROVIDER "${env.voiceProvider}"`);
    }
    await updateCall(call.id, {
      provider: env.voiceProvider,
      provider_call_id: result.providerCallId,
      status: "ringing",
      started_at: new Date().toISOString(),
      error: null,
    });
    return {
      ok: true,
      provider: env.voiceProvider,
      callId: call.id,
      providerCallId: result.providerCallId,
      simulated: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[voice] dispatch failed", message);
    await updateCall(call.id, {
      status: "failed",
      error: message.slice(0, 500),
      ended_at: new Date().toISOString(),
    });
    return {
      ok: false,
      provider: env.voiceProvider,
      callId: call.id,
      simulated: false,
      error: message,
    };
  }
}
