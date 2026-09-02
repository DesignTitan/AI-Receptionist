import { NextResponse } from "next/server";
import { advanceSimulatedCalls, getDemoCall } from "@/lib/db";
import { isVoiceProviderConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

/** GET /api/try-call/<id>?ref=TRY-XXXXXX — the visitor's own call, by capability token. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ref = new URL(request.url).searchParams.get("ref") ?? "";
  await advanceSimulatedCalls();
  const call = await getDemoCall(id, ref);
  if (!call) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    status: call.status,
    outcome: call.outcome,
    transcript: call.transcript,
    summary: call.summary,
    durationSeconds: call.duration_seconds,
    simulated: !isVoiceProviderConfigured(),
  });
}
