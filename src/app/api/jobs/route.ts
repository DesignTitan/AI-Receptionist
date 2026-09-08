import { NextResponse } from "next/server";
import { constantTimeEquals } from "@/lib/auth";
import { runJobs } from "@/lib/platform/jobs";
export const maxDuration = 300;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (
    !secret ||
    !constantTimeEquals(
      request.headers.get("authorization") ?? "",
      `Bearer ${secret}`,
    )
  )
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ results: await runJobs() });
  } catch {
    return NextResponse.json({ error: "Queue unavailable" }, { status: 503 });
  }
}
