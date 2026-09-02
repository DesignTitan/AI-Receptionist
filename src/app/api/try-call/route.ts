import { NextResponse } from "next/server";
import { startTryCall } from "@/lib/try-call";

export const dynamic = "force-dynamic";

/** POST /api/try-call  { name, phone, business?, company_website? (honeypot) } */
export async function POST(request: Request) {
  let body: { name?: string; phone?: string; business?: string; company_website?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  const result = await startTryCall({
    phone: body.phone ?? "",
    name: body.name,
    business: body.business,
    honeypot: body.company_website,
    ip,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result, { status: 201 });
}
