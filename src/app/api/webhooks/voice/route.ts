import { NextResponse } from "next/server";
import {
  findCallByProviderId,
  getCall,
  updateAppointmentStatus,
  updateCall,
} from "@/lib/db";
import { sendCallCompletedEmail, sendDemoCallEmail } from "@/lib/email";
import { env } from "@/lib/env";
import type { AppointmentStatus, CallOutcome, CallStatus } from "@/lib/types";

/**
 * Inbound webhook for voice-provider call events.
 *
 * Vapi, Bland.ai and OmniDimension each post a different envelope, so the body
 * is flattened and read leniently rather than parsed against one schema. Point
 * every provider at:
 *
 *   POST /api/webhooks/voice?token=<VOICE_WEBHOOK_SECRET>
 *
 * (or send the same value as an `x-webhook-secret` header).
 */

export const dynamic = "force-dynamic";

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Depth-first lookup of the first non-empty value for any of `keys`. */
function pick(body: Json, keys: string[], depth = 4): unknown {
  for (const key of keys) {
    const value = body[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  if (depth <= 0) return undefined;
  for (const value of Object.values(body)) {
    if (isObject(value)) {
      const found = pick(value, keys, depth - 1);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

const asString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const asNumber = (value: unknown) => {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};

/** Bland reports transcripts as an array of turns; Vapi as a string. */
function asTranscript(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (Array.isArray(value)) {
    const lines = value
      .map((turn) => {
        if (typeof turn === "string") return turn;
        if (!isObject(turn)) return null;
        const who = asString(turn.role ?? turn.user ?? turn.speaker) ?? "Speaker";
        const text = asString(turn.text ?? turn.message ?? turn.content);
        return text ? `${who}: ${text}` : null;
      })
      .filter(Boolean);
    return lines.length ? lines.join("\n") : null;
  }
  return null;
}

const STATUS_MAP: Record<string, CallStatus> = {
  queued: "queued",
  scheduled: "queued",
  ringing: "ringing",
  "ringing-outbound": "ringing",
  started: "in_progress",
  "in-progress": "in_progress",
  in_progress: "in_progress",
  forwarding: "in_progress",
  ended: "completed",
  completed: "completed",
  complete: "completed",
  "end-of-call-report": "completed",
  failed: "failed",
  error: "failed",
  busy: "failed",
};

const OUTCOMES: CallOutcome[] = [
  "confirmed",
  "rescheduled",
  "cancelled",
  "voicemail",
  "no_answer",
  "failed",
];

function normalizeOutcome(body: Json, transcript: string | null): CallOutcome {
  const raw = asString(
    pick(body, ["outcome", "call_outcome", "disposition", "result", "classification"]),
  );
  if (raw) {
    const cleaned = raw.toLowerCase().replace(/[\s-]+/g, "_");
    const match = OUTCOMES.find((o) => o && cleaned.includes(o));
    if (match) return match;
    if (cleaned.includes("reschedul")) return "rescheduled";
    if (cleaned.includes("cancel")) return "cancelled";
  }

  const reason = (
    asString(pick(body, ["endedReason", "ended_reason", "error_message", "status"])) ?? ""
  ).toLowerCase();
  if (reason.includes("voicemail")) return "voicemail";
  if (reason.includes("no-answer") || reason.includes("no_answer") || reason.includes("noanswer")) {
    return "no_answer";
  }
  if (reason.includes("busy") || reason.includes("failed") || reason.includes("error")) {
    return "failed";
  }

  const haystack = `${transcript ?? ""} ${asString(pick(body, ["summary"])) ?? ""}`.toLowerCase();
  if (!haystack.trim()) return null;
  if (haystack.includes("cancel")) return "cancelled";
  if (haystack.includes("reschedul") || haystack.includes("different time")) return "rescheduled";
  return "confirmed";
}

const OUTCOME_TO_APPOINTMENT: Record<string, AppointmentStatus> = {
  confirmed: "confirmed",
  rescheduled: "rescheduled",
  cancelled: "cancelled",
  voicemail: "no_answer",
  no_answer: "no_answer",
};

function authorize(request: Request) {
  const secret = env.voiceWebhookSecret;
  if (!secret) return true;
  const header =
    request.headers.get("x-webhook-secret") ?? request.headers.get("x-vapi-secret");
  const token = new URL(request.url).searchParams.get("token");
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === secret || token === secret || bearer === secret;
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Json;
  try {
    const parsed = await request.json();
    body = isObject(parsed) ? parsed : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Locate the call log: our own id travels in metadata, and the provider's id
  // is stored on dispatch as a fallback.
  const callLogId = asString(pick(body, ["call_log_id", "callLogId"]));
  const providerCallId = asString(
    pick(body, ["call_id", "callId", "provider_call_id", "id"]),
  );

  let call = callLogId ? await getCall(callLogId) : null;
  if (!call && providerCallId) call = await findCallByProviderId(providerCallId);
  if (!call) {
    // Nothing to attach the event to — acknowledge so the provider stops retrying.
    console.warn("[webhook:voice] no matching call log", { callLogId, providerCallId });
    return NextResponse.json({ received: true, matched: false }, { status: 202 });
  }

  const rawStatus = (
    asString(pick(body, ["status", "type", "event", "message_type", "call_status"])) ?? ""
  )
    .toLowerCase()
    .replace(/\s+/g, "-");
  const completedFlag = pick(body, ["completed"]) === true;
  const status: CallStatus =
    STATUS_MAP[rawStatus] ?? (completedFlag ? "completed" : call.status);

  const transcript =
    asTranscript(
      pick(body, ["transcript", "concatenated_transcript", "transcripts", "messages"]),
    ) ?? call.transcript;
  const recordingUrl =
    asString(pick(body, ["recordingUrl", "recording_url", "stereoRecordingUrl", "audio_url"])) ??
    call.recording_url;
  const summary = asString(pick(body, ["summary", "call_summary", "analysis_summary"])) ?? call.summary;

  const durationSeconds =
    asNumber(pick(body, ["durationSeconds", "duration_seconds", "duration"])) ??
    (asNumber(pick(body, ["call_length"])) !== null
      ? Math.round(asNumber(pick(body, ["call_length"]))! * 60)
      : null) ??
    call.duration_seconds;
  const cost = asNumber(pick(body, ["cost", "price", "call_cost"])) ?? call.cost;

  const terminal = status === "completed" || status === "failed";
  const outcome = terminal ? normalizeOutcome(body, transcript) : call.outcome;

  const alreadyFinished = call.status === "completed" || call.status === "failed";

  await updateCall(call.id, {
    provider_call_id: call.provider_call_id ?? providerCallId,
    status,
    outcome,
    transcript,
    recording_url: recordingUrl,
    summary,
    duration_seconds: durationSeconds,
    cost,
    error: status === "failed" ? asString(pick(body, ["error", "error_message"])) : call.error,
    started_at: call.started_at ?? (status !== "queued" ? new Date().toISOString() : null),
    ended_at: terminal ? new Date().toISOString() : call.ended_at,
  });

  if (terminal && outcome && OUTCOME_TO_APPOINTMENT[outcome] && call.appointment_id) {
    await updateAppointmentStatus(call.appointment_id, OUTCOME_TO_APPOINTMENT[outcome]);
  }

  // Providers retry webhooks; only notify the owner on the first terminal event.
  // A demo call has no appointment; it is a lead and gets its own email.
  if (terminal && !alreadyFinished) {
    try {
      if (call.kind === "demo") await sendDemoCallEmail(call.id);
      else await sendCallCompletedEmail(call.id);
    } catch (error) {
      console.error("[webhook:voice] notification failed", error);
    }
  }

  return NextResponse.json({ received: true, matched: true, status, outcome });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/webhooks/voice",
    method: "POST",
    provider: env.voiceProvider,
    secured: Boolean(env.voiceWebhookSecret),
    accepts: ["vapi", "bland", "omnidimension"],
  });
}
