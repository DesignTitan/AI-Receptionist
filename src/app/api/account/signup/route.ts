import { NextResponse } from "next/server";
import { checkOrigin, owner } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";
import { planOf, slugFor, text } from "@/lib/platform/model";

// Identity only. Operational settings are collected after confirmed payment.
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const user = await owner();
    if (!user?.email || !user.email_confirmed_at)
      return NextResponse.json({ error: "Verify your email before checkout." }, { status: 401 });
    const body = await request.json();
    const contactName = text(body.name, "name");
    const plan = planOf(body.plan);
    const db = serviceClient();
    const { data: existing, error } = await db.from("customers").select("id,status,checkout_attempt,config").eq("owner_id", user.id).maybeSingle();
    if (error) throw Error("Signup is unavailable. Please try again later.");
    if (existing && (existing.status !== "draft" || existing.checkout_attempt))
      throw Error("Your purchase is already underway. Continue from your dashboard.");
    const id = existing?.id ?? crypto.randomUUID();
    const config = existing ? { ...existing.config, contactName } : {
      setupPending: true, contactName, trade: "other", timezone: "", days: [],
      opens: "", closes: "", color: "#1c3e36", areaCode: "", address: "", phone: "", team: [],
    };
    const result = existing
      ? await db.from("customers").update({ plan, config }).eq("id", id).eq("owner_id", user.id).eq("status", "draft").is("checkout_attempt", null).select("id").single()
      : await db.from("customers").insert({ id, owner_id: user.id, owner_email: user.email, business_name: "Your business", slug: slugFor("business", id), plan, config }).select("id").single();
    if (result.error) throw Error("We could not save your details. Please reload and try again.");
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not save your details." }, { status: 400 });
  }
}
