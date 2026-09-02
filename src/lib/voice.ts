import { env, isVoiceProviderConfigured } from "./env";
import { providerLabel } from "@/lib/format";
import { getVertical } from "@/verticals";
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
  const { brand, terms: t, voice } = getVertical(detail.vertical);
  const client = detail.client?.full_name ?? `the ${t.client.one}`;
  const first = client.split(" ")[0];
  const provider = detail.provider ? providerLabel(detail.provider) : `the ${t.provider.one}`;

  return `You are ${voice.agentName}, the phone receptionist for ${brand}. You are making a short, warm outbound call to confirm ${article(t.booking.one)} ${t.booking.one} that was just booked online. Keep it under sixty seconds.

${t.booking.One} details:
- ${t.client.One}: ${client}
- ${t.provider.One}: ${provider} (${detail.provider?.specialty ?? voice.categoryFallback})
- Date and time: ${formatDate(detail.starts_at, tz)} at ${formatTime(detail.starts_at, tz)} ${timezoneLabel(tz)}
- Location: ${detail.provider?.location ?? brand}
- Reference: ${detail.reference}
- Reason given: ${detail.reason || "not specified"}
- ${t.client.One} type: ${detail.is_new_client ? `new ${t.client.one}` : `returning ${t.client.one}`}

How to run the call:
1. Greet by name and confirm you are speaking with ${first}. If it is someone else, politely ask when ${first} is available and end the call.
2. State the ${t.provider.one}, day and time, and ask whether that still works.
3. If yes: confirm, then ask them to ${voice.arrivalAdvice}.${detail.is_new_client ? voice.newClientNote : ""}
4. If they want a different time: do not attempt to rebook on the call. Say the front desk will text options within the hour, and note the times that suit them.
5. If they want to cancel: acknowledge without pressure and confirm the cancellation.
6. Close politely and end the call.

Rules: ${voice.rules}

At the end, classify the outcome as exactly one of: confirmed, rescheduled, cancelled, voicemail, no_answer.`;
}

const article = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");

const firstMessage = (detail: AppointmentDetail) => {
  const { brand, terms: t, voice } = getVertical(detail.vertical);
  return `Hi, this is ${voice.agentName} calling from ${brand}. Am I speaking with ${detail.client?.full_name ?? `the ${t.client.one}`}?`;
};

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
      number: cleanPhone(detail.client!.phone),
      name: detail.client!.full_name,
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
    phone_number: cleanPhone(detail.client!.phone),
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
      to_number: cleanPhone(detail.client!.phone),
      call_context: callMetadata(detail, call),
      webhook_url: voiceWebhookUrl(),
    },
  );
  const data = (json.data ?? json) as Record<string, unknown>;
  return { providerCallId: ((data.call_id ?? data.id) as string) ?? null };
}

/**
 * Variables the external assistant config binds to. The KEY NAMES are a wire
 * contract with the Vapi/Bland assistant setup and stay frozen even though
 * the app no longer calls anyone a patient — only add keys, never rename.
 */
function callMetadata(detail: AppointmentDetail, call: CallLog) {
  const vertical = getVertical(detail.vertical);
  return {
    call_log_id: call.id,
    appointment_id: detail.id,
    reference: detail.reference,
    patient_name: detail.client?.full_name ?? "",
    patient_first_name: (detail.client?.full_name ?? "").split(" ")[0],
    doctor_name: detail.provider ? `${providerLabel(detail.provider)}` : "",
    specialty: detail.provider?.specialty ?? "",
    appointment_date: formatDate(detail.starts_at, env.timezone),
    appointment_time: `${formatTime(detail.starts_at, env.timezone)} ${timezoneLabel(env.timezone)}`,
    location: detail.provider?.location ?? "",
    is_new_patient: detail.is_new_client,
    clinic_name: vertical.brand,
    // Additive, so a future assistant config can key off them.
    business_name: vertical.brand,
    vertical: vertical.slug,
  };
}

/* ── Entry point ─────────────────────────────────────────────────────── */

/**
 * Places (or re-places) the confirmation call for an appointment.
 * Reuses a queued call row if one is already waiting, so a duplicate webhook
 * delivery does not dial the client twice.
 */
export async function dispatchConfirmationCall(
  appointmentId: string,
  options: { forceNew?: boolean } = {},
): Promise<DispatchResult> {
  const detail = await getAppointment(appointmentId);
  if (!detail || !detail.client) {
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
  const call = reusable ? existing : await createCall(appointmentId, detail.client.id);

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
