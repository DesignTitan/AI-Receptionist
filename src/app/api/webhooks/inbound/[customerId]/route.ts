import { NextResponse, after } from "next/server";
import { serviceClient } from "@/lib/supabase";
import { bearer, gatewaySecretMatches, inboundJson, MAX_INBOUND_SECONDS, signInboundSession, validId } from "@/lib/platform/inbound-auth";
import { defaultPhoneSettings, resolvePhoneRoute, validatePhoneSettings } from "@/lib/platform/phone-settings";
import { routeInboundCall, unavailableRoute, type CallStage } from "@/lib/platform/inbound-routing";
import type { Customer } from "@/lib/platform/model";
import { runJobs } from "@/lib/platform/jobs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
const clean = (value: unknown, max: number) => typeof value === "string" ? value.slice(0, max) : null;

/** Adapter contract, not a direct Comcast/T-Mobile webhook. The adapter must authenticate carrier events before calling us. */
export async function POST(request: Request, context: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await context.params;
  if (!validId(customerId) || !bearer(request)) return json({ error: "Unauthorized" }, 401);
  const db = serviceClient();
  const connectionResult = await db.from("customer_phone_connections").select("*").eq("customer_id", customerId).maybeSingle();
  if (connectionResult.error) return json({ error: "Phone routing is unavailable. Use the adapter's configured fallback." }, 503);
  const connection = connectionResult.data;
  if (!connection || !gatewaySecretMatches(bearer(request), connection.secret_hash ?? "")) return json({ error: "Unauthorized" }, 401);
  try {
    const body = await inboundJson(request);
    const suppliedId = body.externalCallId;
    if (typeof suppliedId !== "string" || !/^[A-Za-z0-9:_-]{1,160}$/.test(suppliedId)) return json({ error: "A trusted external call ID is required." }, 400);
    // Provider IDs can be local to an account. Tenant-prefix them before the unique ledger lookup.
    const externalId = `${customerId}:${suppliedId}`;
    if (body.action === "complete") {
      const result = await db.from("customer_calls").select("id").eq("customer_id", customerId).eq("external_call_id", externalId).maybeSingle();
      if (result.error) throw Error("Call lookup unavailable.");
      if (!result.data) return json({ error: "Unknown call." }, 404);
      const outcomes = ["confirmed", "booked", "completed", "transferred", "voicemail", "no_answer", "failed", "abandoned", "needs_review", "blocked", "requested_staff", "cancelled"];
      if (typeof body.result !== "string" || !outcomes.includes(body.result) || typeof body.aiSeconds !== "number" || !Number.isSafeInteger(body.aiSeconds) || body.aiSeconds < 0 || body.aiSeconds > 86400) return json({ error: "A valid outcome and measured AI duration are required. Do not estimate missing duration." }, 400);
      if (body.costCents != null && (typeof body.costCents !== "number" || !Number.isFinite(body.costCents) || body.costCents < 0 || body.costCents > 100000)) return json({ error: "Invalid call cost." }, 400);
      const recording = clean(body.recordingUrl, 3000);
      const saved = await db.rpc("record_customer_inbound_call", { c_id: customerId, call_id: result.data.id, result: body.result, call_summary: clean(body.summary, 3000), call_transcript: clean(body.transcript, 30000), recording: recording?.startsWith("https://") ? recording : null, seconds: body.aiSeconds, cost_cents: body.costCents ?? null });
      if (saved.error || !saved.data) throw Error("Call report could not be saved.");
      after(async () => { await runJobs(); });
      return json({ recorded: true });
    }
    if (body.action !== "route") return json({ error: "Choose route or complete." }, 400);
    if (body.destinationNumber !== connection.inbound_number) return json({ error: "Call destination does not match this connection." }, 403);
    const stage = body.stage ?? "arrival";
    if (!["arrival", "selection", "staff_unavailable"].includes(String(stage))) return json({ error: "Invalid routing stage." }, 400);
    const caller = body.callerPhone == null ? null : body.callerPhone;
    if (caller !== null && (typeof caller !== "string" || !/^\+[1-9]\d{6,14}$/.test(caller))) return json({ error: "Invalid caller number." }, 400);
    const customerResult = await db.from("customers").select("*").eq("id", customerId).single();
    if (customerResult.error) throw Error("Business unavailable.");
    const c = customerResult.data as Customer;
    const defaults = defaultPhoneSettings(c.config);
    const settings = validatePhoneSettings({ ...defaults, ...(c.phone_settings ?? {}) }, c.config, [c.config.phone, connection.inbound_number, connection.ai_number, c.phone_number].filter(Boolean));
    const registered = await db.rpc("register_customer_inbound_call", { c_id: customerId, external_id: externalId, caller });
    if (registered.error || !registered.data) throw Error("Call registration failed.");
    const call = registered.data;
    if (call.completed_at) return json({ callId: call.id, action: "end", reason: "call_already_completed" });
    const resolved = resolvePhoneRoute(settings, c.config.timezone, new Date());
    let instruction = routeInboundCall(settings, resolved.mode, stage as CallStage, typeof body.choice === "string" ? body.choice : undefined, body.requestedStaff === true);
    if (instruction.action !== "ai") return json({ callId: call.id, ...instruction, scheduleReason: resolved.reason });
    const sessionSecret = process.env.INBOUND_SESSION_SECRET ?? "";
    if (connection.status !== "ready" || !connection.verified_at || c.status !== "live" || c.billing_status !== "active" || sessionSecret.length < 32) {
      instruction = unavailableRoute(settings, stage as CallStage, "connection_not_ready");
      return json({ callId: call.id, ...instruction });
    }
    const admission = await db.rpc("reserve_inbound_call_usage", { c_id: customerId, call_id: call.id });
    if (admission.error) throw Error("Could not check call allowance.");
    if (!admission.data) return json({ callId: call.id, ...unavailableRoute(settings, stage as CallStage, "ai_not_available_within_usage_limit") });
    const usage = await db.from("inbound_call_usage").select("started_at,settled_at").eq("call_id", call.id).single();
    if (usage.error || usage.data.settled_at) throw Error("Call admission unavailable.");
    const expires = Date.parse(usage.data.started_at) + MAX_INBOUND_SECONDS * 1000;
    const remainingSeconds = Math.floor((expires - Date.now()) / 1000);
    if (remainingSeconds <= 0) return json({ callId: call.id, ...unavailableRoute(settings, stage as CallStage, "call_time_limit") });
    const sessionToken = signInboundSession({ customerId, callId: call.id, expires }, sessionSecret);
    return json({ callId: call.id, ...instruction, number: connection.ai_number, agentId: connection.agent_id, maxSeconds: remainingSeconds, sessionToken, toolsPath: "/api/webhooks/inbound-tools", instruction: "Keep the session token in trusted call context. End the AI leg at maxSeconds, send the measured completion report, and use staff or voicemail when the caller needs help." });
  } catch {
    // No database/provider internals or credentials are sent to the caller.
    return json({ error: "Incoming-call handling failed. Retry the same event or use the adapter's configured staff/voicemail fallback." }, 503);
  }
}
