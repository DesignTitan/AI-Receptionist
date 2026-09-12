import { NextResponse } from "next/server";
import { checkOrigin, owner, ownedCustomer } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";
import { validateBrandProfile } from "@/lib/platform/brand-profile";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const user = await owner();
    if (!user?.email) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    const body = await request.json();
    const brand = validateBrandProfile(body.brand);

    const existing = await ownedCustomer();
    if (!existing) {
      return NextResponse.json({ error: "Create your account first." }, { status: 400 });
    }

    const db = serviceClient();
    const nextConfig = {
      ...existing.config,
      // optional weeklyHours/timezone updates from the intake
      ...(brand.weeklyHours ? { weeklyHours: brand.weeklyHours } : {}),
      ...(brand.timezone ? { timezone: brand.timezone } : {}),
      // store brand profile under its own key
      brand,
    };

    const { error } = await db
      .from("customers")
      .update({ config: nextConfig })
      .eq("id", existing.id)
      .eq("owner_id", user.id);
    if (error) throw Error("We couldn't save your brand profile. Please try again.");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save." },
      { status: 400 },
    );
  }
}

