import { NextResponse } from "next/server";
import { checkOrigin, owner } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";
import { PLANS, planOf, slugFor, text, validateConfig } from "@/lib/platform/model";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const user = await owner();
    if (!user?.email)
      return NextResponse.json(
        { error: "Please sign in again." },
        { status: 401 },
      );
    const body = await request.json();
    const business_name = text(body.business_name, "business name");
    const config = validateConfig(body.config);
    const plan = planOf(body.plan);
    if(config.team.length > PLANS[plan].teamLimit) throw Error(`This plan supports up to ${PLANS[plan].teamLimit} team members.`);
    const db = serviceClient();
    const { data: existing, error: readError } = await db
      .from("customers")
      .select("id,status,checkout_attempt")
      .eq("owner_id", user.id)
      .maybeSingle();
    if (readError)
      throw Error("Onboarding is not available yet. Please try again later.");
    if (existing && existing.status !== "draft")
      throw Error(
        "Your setup is underway. Contact support for business changes.",
      );
    if (existing?.checkout_attempt)
      throw Error(
        "A checkout is already reserved. Finish it from your dashboard, or contact us to change your setup.",
      );
    const id = existing?.id ?? crypto.randomUUID();
    const values = { business_name, config, plan };
    const result = existing
      ? await db
          .from("customers")
          .update(values)
          .eq("id", id)
          .eq("owner_id", user.id)
          .eq("status", "draft")
          .is("checkout_attempt", null)
          .select("id")
          .single()
      : await db
          .from("customers")
          .insert({
            ...values,
            id,
            owner_id: user.id,
            owner_email: user.email,
            slug: slugFor(business_name, id),
          })
          .select("id")
          .single();
    if (result.error)
      throw Error(
        "We could not save your business. Please reload and try again.",
      );
    return NextResponse.json({ id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save." },
      { status: 400 },
    );
  }
}
