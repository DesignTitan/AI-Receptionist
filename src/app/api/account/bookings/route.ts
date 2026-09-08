import { NextResponse } from "next/server";
import { checkOrigin, ownedCustomer } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const c = await ownedCustomer();
    if (!c) throw Error("Business not found.");
    const { id, status } = await request.json();
    if (!["cancelled", "confirmed"].includes(status))
      throw Error("Invalid status.");
    const { data, error } = await serviceClient()
      .from("customer_bookings")
      .update({ status })
      .eq("id", id)
      .eq("customer_id", c.id)
      .select("id")
      .single();
    if (error || !data) throw Error("Booking could not be updated.");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
