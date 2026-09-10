import { createHash, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { ROADMAP } from "@/lib/roadmap/catalogue";
import { getRoadmap, setRoadmapVote, suggestRoadmapFeature, RoadmapStoreError } from "@/lib/roadmap/store";
import { roadmapBody, RoadmapRequestError, suggestionText } from "@/lib/roadmap/request";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const COOKIE = "receptionist_roadmap_voter";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const headers = { "Cache-Control": "private, no-store" };
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

function failure(error: unknown) {
  if (error instanceof RoadmapRequestError || error instanceof RoadmapStoreError)
    return NextResponse.json({ error: error.message }, { status: error.status, headers });
  // Do not expose database details through a public endpoint.
  console.error("Roadmap request failed", error instanceof Error ? error.name : "Unknown error");
  return NextResponse.json({ error: "We couldn’t save or load the feedback. Please try again shortly." }, { status: 503, headers });
}

export async function GET(request: NextRequest) {
  try {
    const previous = request.cookies.get(COOKIE)?.value;
    const voter = previous && UUID.test(previous) ? previous : randomUUID();
    const features = await getRoadmap(ROADMAP, hash(voter));
    const storage = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test" ? "local" : "supabase";
    const response = NextResponse.json({ features, storage }, { headers });
    if (voter !== previous) response.cookies.set(COOKIE, voter, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
      path: "/", maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  } catch (error) { return failure(error); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await roadmapBody(request);
    const voter = request.cookies.get(COOKIE)?.value;
    if (!voter || !UUID.test(voter)) throw new RoadmapRequestError("Refresh the roadmap before sending feedback.", 409);
    if (body.action === "vote") {
      if (typeof body.featureId !== "string" || body.featureId.length > 100 || typeof body.voted !== "boolean")
        throw new RoadmapRequestError("Choose a feature to vote for.");
      const features = await setRoadmapVote(ROADMAP, hash(voter), body.featureId, body.voted);
      return NextResponse.json({ features }, { headers });
    }
    if (body.action === "suggest") {
      if (body.website) throw new RoadmapRequestError("Please leave the website field empty.");
      const title = suggestionText(body.title, "Feature name", 5, 100);
      const description = suggestionText(body.description, "Description", 20, 600);
      const suggestion = await suggestRoadmapFeature(hash(voter), title, description);
      return NextResponse.json({ suggestion, message: "Thanks. Your idea is saved for review. Approved ideas appear here for everyone to vote on." }, { status: 201, headers });
    }
    throw new RoadmapRequestError("Choose a vote or a feature suggestion.");
  } catch (error) { return failure(error); }
}
