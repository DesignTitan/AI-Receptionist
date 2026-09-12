import { NextResponse } from "next/server";
import { startTryCall } from "@/lib/try-call";

export const dynamic = "force-dynamic";

/** POST /api/try-call  { name, phone, business?, turnstileToken?, company_website? (honeypot) } */
export async function POST(request: Request) {
  let body: { name?: string; phone?: string; business?: string; turnstileToken?: string; company_website?: string; intent?: string; preferredTime?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || typeof body.phone !== "string" || typeof body.name !== "string" ||
      (body.business !== undefined && typeof body.business !== "string") ||
      (body.turnstileToken !== undefined && typeof body.turnstileToken !== "string")) {
    return NextResponse.json({ error: "Enter your name and phone number, then try again." }, { status: 422 });
  }
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  try {
    const result = await startTryCall({
      phone: body.phone ?? "",
      name: body.name,
      business: body.business,
      honeypot: body.company_website,
      turnstileToken: body.turnstileToken,
      intent: body.intent === "sales" ? "sales" : "demo",
      preferredTime: typeof body.preferredTime === "string" ? body.preferredTime : undefined,
      ip,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result, { status: 201 });
  } catch {
    console.error("[try-call] request could not be saved");
    return NextResponse.json({ error: "We couldn’t save your request. Please try again shortly." }, { status: 503 });
  }
}
