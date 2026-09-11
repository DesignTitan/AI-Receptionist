import { NextResponse } from "next/server";
import { checkOrigin, owner } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";
import { PLANS, type Plan, slugFor, text, validateConfig } from "@/lib/platform/model";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const user = await owner();
    if (!user?.email) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    const body = await request.json();
    const business_name = text(body.business_name, "business name");
    const config = validateConfig(body.config);
    const db = serviceClient();
    const { data: existing, error } = await db.from("customers").select("id,status,plan,billing_status,config").eq("owner_id", user.id).maybeSingle();
    if (error || !existing) throw Error("Complete your purchase before setting up your business.");
    if (existing.status !== "paid" || existing.billing_status !== "active")
      throw Error("Business setup requires confirmed payment and an active subscription. If setup is already underway, contact support for changes.");
    const plan = existing.plan as Plan;
    if (config.team.length > PLANS[plan].teamLimit) throw Error(`Your purchased plan supports up to ${PLANS[plan].teamLimit} team members.`);
    const result = await db.from("customers").update({ business_name,
      slug: slugFor(business_name, existing.id),
      config: { ...config, contactName: existing.config.contactName, setupPending: false },
    }).eq("id", existing.id).eq("owner_id", user.id).eq("status", "paid").eq("billing_status", "active").select("id").single();
    if (result.error) throw Error("We could not save your business. Please reload and try again.");
    return NextResponse.json({ id: existing.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save." }, { status: 400 });
  }
}
