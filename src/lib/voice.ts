import { env, isVoiceProviderConfigured } from "./env";
import { providerLabel } from "@/lib/format";
import { RECORDING_NOTICE } from "./consent";
import { getVertical } from "@/verticals";
import { getCall } from "./db";

/** The first thing Ava says on a demonstration call: their name, then the recording notice, before anything else. */
export function demoFirstMessage(name: string | null) {
  return `Hi${name ? ` ${name}` : ""}, this is Ava, the AI receptionist. ${RECORDING_NOTICE} You asked me to call you from the website. Have I got the right person?`;
}

/** The script for a call a visitor requested from the product site. Product voice, no business attached yet. */
export function buildDemoScript(call: CallLog) {
  const business = call.demo_business?.trim() || null;
  return `You are Ava, the AI receptionist for a product called AI Receptionist: a booking page and an AI front desk for businesses that run on appointments. Someone visiting the product's website typed their phone number and asked to be called so they could hear what you sound like. This is a short, warm demonstration call. Keep it under ninety seconds.

What you know:
- Their name: ${call.demo_name ?? "not given"}
- Their business, if they gave one: ${business ?? "not given"}
- Reference: ${call.reference ?? ""}

How to run the call:
1. Open with exactly: "${demoFirstMessage(call.demo_name)}"
2. In two sentences, say what you do: when one of their clients books online, you phone the client inside a minute to confirm; you take reschedules and cancellations on the call; the recording, the transcript and a one-line summary land in their dashboard and their inbox.
3. ${business ? `Say one concrete thing you would do for ${business}.` : "Ask what kind of business they run, then say one concrete thing you would do for it."}
4. Ask if they have a question and answer it plainly. If it is about price: plans start at $149 a month for 200 calls, $299 for 600, and $599 for 1,500, plus $1,000 to set up once. Month to month, and calls beyond the plan are 30 cents each.
5. Close: the site they are on has pricing and three live demos. Thank them and end the call.

Rules: never take payment details. Never promise an integration that does not exist; there is no calendar sync yet, say it is on the roadmap. Never claim to be human; if asked, say you are an AI. Speak plainly and do not oversell.

At the end, classify the outcome as exactly one of: confirmed, rescheduled, cancelled, voicemail, no_answer.`;
}
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
1. Greet by name, say "${RECORDING_NOTICE}", and confirm you are speaking with ${first}. If it is someone else, politely ask when ${first} is available and end the call.
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
  return `Hi, this is ${voice.agentName} calling from ${brand}. ${RECORDING_NOTICE} Am I speaking with ${detail.client?.full_name ?? `the ${t.client.one}`}?`;
};

const cleanPhone = (phone: string) => {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : `+1${digits.replace(/^1/, "")}`;
};

/* ── Providers ───────────────────────────────────────────────────────── */

type ProviderResponse = { providerCallId: string | null };

/** Everything a provider needs to place one call. Built from an appointment, or from a demo request. */
type CallTarget = {
  phone: string;
  name: string;
  firstMessage: string;
  script: string;
  metadata: Record<string, unknown>;
};

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

async function dispatchVapi(t: CallTarget): Promise<ProviderResponse> {
  const { apiKey, assistantId, phoneNumberId } = env.vapi;
  const json = await postJson("https://api.vapi.ai/call", apiKey!, {
    assistantId,
    phoneNumberId,
    customer: {
      number: cleanPhone(t.phone),
      name: t.name,
    },
    assistantOverrides: {
      firstMessage: t.firstMessage,
      model: {
        provider: "anthropic",
        model: "claude-sonnet-5",
        messages: [{ role: "system", content: t.script }],
      },
      variableValues: t.metadata,
      metadata: t.metadata,
      server: { url: voiceWebhookUrl() },
    },
  });
  return { providerCallId: (json.id as string) ?? null };
}

async function dispatchBland(t: CallTarget): Promise<ProviderResponse> {
  const { apiKey, voiceId, pathwayId } = env.bland;
  const json = await postJson("https://api.bland.ai/v1/calls", apiKey!, {
    phone_number: cleanPhone(t.phone),
    task: pathwayId ? undefined : t.script,
    pathway_id: pathwayId,
    first_sentence: t.firstMessage,
    voice: voiceId ?? "june",
    record: true,
    max_duration: 5,
    webhook: voiceWebhookUrl(),
    metadata: t.metadata,
    request_data: t.metadata,
  });
  return { providerCallId: (json.call_id as string) ?? null };
}

/**
 * OmniDimension (docs.omnidim.io/docs/api-reference/calls/dispatchCall). The
 * agent's prompt lives in their dashboard, so everything that changes per call
 * travels as `call_context`, which the prompt reads as variables: the script,
 * the first line, the name. `metadata` is kept by the platform for tracking and
 * never shown to the agent. The post-call webhook is configured on the agent
 * (Post-Call tab), not per call; its payload nests under `call_report` and is
 * parsed in the webhook route. Numbers must be E.164 with a leading plus.
 */
async function dispatchOmniDimension(t: CallTarget): Promise<ProviderResponse> {
  const { apiKey, agentId, fromNumberId } = env.omnidimension;
  const asId = (v: string | undefined) => (v && /^\d+$/.test(v) ? Number(v) : v);
  const json = await postJson("https://backend.omnidim.io/api/v1/calls/dispatch", apiKey!, {
    agent_id: asId(agentId),
    to_number: `+${t.phone.replace(/\D/g, "")}`,
    ...(fromNumberId ? { from_number_id: asId(fromNumberId) } : {}),
    call_context: { ...t.metadata, contact_name: t.name, first_message: t.firstMessage, script: t.script },
    metadata: { call_log_id: t.metadata.call_log_id, reference: t.metadata.reference, kind: t.metadata.kind },
  });
  const data = (json.data ?? json) as Record<string, unknown>;
  const id = data.requestId ?? data.request_id ?? data.call_id ?? data.id;
  return { providerCallId: id === undefined || id === null ? null : String(id) };
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
    // Names the OmniDimension agent prompt reads (additive; the keys above stay frozen).
    kind: "confirmation",
    customer_name: detail.client?.full_name ?? "",
    callback_number: env.contactPhone ?? "the number on your confirmation",
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

  return placeCall(call, {
    phone: detail.client.phone,
    name: detail.client.full_name,
    firstMessage: firstMessage(detail),
    script: buildAgentScript(detail),
    metadata: callMetadata(detail, call),
  });
}

/** The demonstration call a visitor asks for from the product site. */
export async function dispatchDemoCall(callId: string): Promise<DispatchResult> {
  const call = await getCall(callId);
  if (!call || call.kind !== "demo" || !call.demo_phone) {
    return { ok: false, provider: env.voiceProvider, callId, simulated: false, error: "Demo call not found" };
  }
  return placeCall(call, {
    phone: call.demo_phone,
    name: call.demo_name ?? "Website visitor",
    firstMessage: demoFirstMessage(call.demo_name),
    script: buildDemoScript(call),
    metadata: {
      call_log_id: call.id,
      kind: "demo",
      reference: call.reference,
      business: call.demo_business ?? "",
      name: call.demo_name ?? "",
      customer_name: call.demo_name ?? "",
    },
  });
}

async function placeCall(call: CallLog, target: CallTarget): Promise<DispatchResult> {
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
        result = await dispatchVapi(target);
        break;
      case "bland":
        result = await dispatchBland(target);
        break;
      case "omnidimension":
        result = await dispatchOmniDimension(target);
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
