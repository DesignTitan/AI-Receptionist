import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";
import { listRoadmapSuggestions, reviewRoadmapSuggestion, RoadmapStoreError } from "@/lib/roadmap/store";
import { roadmapBody, RoadmapRequestError } from "@/lib/roadmap/request";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };

async function authorized() {
  return verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Sign in to review suggestions." }, { status: 401, headers });
  try { return NextResponse.json({ suggestions: await listRoadmapSuggestions() }, { headers }); }
  catch { return NextResponse.json({ error: "Suggestions could not be loaded. Check the roadmap storage connection." }, { status: 503, headers }); }
}

export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Sign in to review suggestions." }, { status: 401, headers });
  try {
    const body = await roadmapBody(request);
    if (typeof body.id !== "string" || body.id.length > 100 || !["approved", "declined"].includes(String(body.status)))
      throw new RoadmapRequestError("Choose a suggestion and its review decision.");
    await reviewRoadmapSuggestion(body.id, body.status as "approved" | "declined");
    return NextResponse.json({ suggestions: await listRoadmapSuggestions() }, { headers });
  } catch (error) {
    const known = error instanceof RoadmapRequestError || error instanceof RoadmapStoreError;
    return NextResponse.json({ error: known ? error.message : "That decision could not be saved. Please try again." }, { status: known ? error.status : 503, headers });
  }
}
