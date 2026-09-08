import { durationSeconds, reportedCostCents } from "@/lib/platform/call-report";
import { NextResponse } from "next/server";
import { constantTimeEquals } from "@/lib/auth";
import { serviceClient } from "@/lib/supabase";
import { env } from "@/lib/env";
import { after } from "next/server";
import { runJobs } from "@/lib/platform/jobs";
// Dedicated callback for customer agents; existing demo callbacks are unchanged.
export async function POST(request: Request) {
  const secret = env.voiceWebhookSecret;
  const supplied =
    request.headers.get("x-webhook-secret") ??
    new URL(request.url).searchParams.get("token") ??
    "";
  if (!secret || !constantTimeEquals(supplied, secret))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const raw = await request.text();
    if (raw.length > 1000000)
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    const body = JSON.parse(raw);
    const report = body.call_report ?? body.data?.call_report ?? {};
    const metadata = body.metadata ?? body.data?.metadata ?? report.metadata;
    const id = metadata?.customer_booking_id;
    const customer = metadata?.customer_id;
    if (!id || !customer) return NextResponse.json({ matched: false });
    const db = serviceClient();
    const outcomes = [
      "confirmed",
      "rescheduled",
      "cancelled",
      "voicemail",
      "no_answer",
      "failed",
    ];
    const value = String(
      report.extracted_variables?.outcome ?? body.outcome ?? "",
    )
      .toLowerCase()
      .replace(/[ -]/g, "_");
    const outcome = outcomes.includes(value) ? value : "needs_review";
    const clean = (x: unknown, max = 30000) =>
      typeof x === "string" ? x.slice(0, max) : null;
    const seconds = durationSeconds(report, body);
    const recording = clean(report.recording_url ?? body.recording_url, 3000);
    const { data: matched, error: updateError } = await db.rpc(
      "record_customer_call",
      {
        c_id: customer,
        b_id: id,
        result: outcome,
        call_summary: clean(report.summary ?? body.summary),
        call_transcript: clean(report.full_conversation ?? body.transcript),
        recording: recording?.startsWith("https://") ? recording : null,
        seconds: seconds,
      },
    );
    if (updateError) throw updateError;
    if (matched) {
      const usage = await db.rpc("settle_call_usage", {
        c_id: customer,
        b_id: id,
        duration: seconds,
        cost_cents: reportedCostCents(report),
      });
      if (usage.error) throw usage.error;
    }

    after(async () => {
      await runJobs();
    });
    return NextResponse.json({ matched: Boolean(matched) });
  } catch {
    return NextResponse.json(
      { error: "Could not store report; retry required." },
      { status: 500 },
    );
  }
}
