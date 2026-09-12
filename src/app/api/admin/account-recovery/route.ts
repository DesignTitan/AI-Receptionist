import { NextResponse } from "next/server";
import { checkOrigin, requireStaff } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";
import { audit } from "@/lib/account-auth/server";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await requireStaff();
    const { id, status } = await request.json();
    if (
      typeof id !== "string" ||
      !["reviewing", "resolved", "declined"].includes(status)
    )
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const result = await serviceClient()
      .from("account_recovery_requests")
      .update({ status })
      .eq("id", id)
      .in("status", ["pending", "reviewing"])
      .select("user_id")
      .maybeSingle();
    if (result.error || !result.data)
      return NextResponse.json(
        { error: "Request is unavailable or already closed." },
        { status: 409 },
      );
    await audit(result.data.user_id, `recovery_request_${status}`);
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Staff sign-in required." },
      { status: 403 },
    );
  }
}
