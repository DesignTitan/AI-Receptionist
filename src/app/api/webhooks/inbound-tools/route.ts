import { NextResponse, after } from "next/server";
import { serviceClient } from "@/lib/supabase";
import { bearer, inboundJson, verifyInboundSession } from "@/lib/platform/inbound-auth";
import { available, bookPhone, getCustomerCall } from "@/lib/platform/booking";
import type { Customer } from "@/lib/platform/model";
import { runJobs } from "@/lib/platform/jobs";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** A session-scoped token supplies customer and call identity; those fields are never accepted from AI arguments. */
export async function POST(request: Request) {
  const session = verifyInboundSession(bearer(request), process.env.INBOUND_SESSION_SECRET ?? "");
  if (!session) return json({ error: "Call session unavailable. Ask the front desk to follow up." }, 401);
  try {
    const body = await inboundJson(request, 10000);
    if (["customerId", "customer_id", "callId", "call_id"].some(key => key in body)) return json({ error: "Call identity cannot be supplied by the assistant." }, 400);
    const db = serviceClient();
    const [customerResult, connectionResult, call] = await Promise.all([
      db.from("customers").select("*").eq("id", session.customerId).single(),
      db.from("customer_phone_connections").select("status").eq("customer_id", session.customerId).single(),
      getCustomerCall(session.customerId, session.callId),
    ]);
    const c = customerResult.data as Customer | null;
    if (customerResult.error || connectionResult.error || connectionResult.data?.status !== "ready" || !c || c.status !== "live" || c.billing_status !== "active" || !call || call.status !== "active" || call.completed_at) return json({ error: "This call is no longer available for booking. Arrange staff follow-up." }, 409);
    if (body.action === "services") return json({ businessName: c.business_name, timezone: c.config.timezone, team: c.config.team, bookingWindowDays: 30, minimumNoticeMinutes: 90 });
    if (body.action === "availability") {
      if (typeof body.member !== "string" || typeof body.date !== "string") return json({ error: "Choose a team member and a date." }, 400);
      const result = await available(c, body.member, body.date);
      return json({ timezone: c.config.timezone, slots: result.slots });
    }
    if (body.action === "book") {
      if (body.confirmedByCaller !== true) return json({ error: "Read the details back and obtain the caller's agreement before booking." }, 400);
      if (["requestKey", "member", "fullName", "phone", "startsAt"].some(key => typeof body[key] !== "string")) return json({ error: "Complete the booking details." }, 400);
      if (body.email != null && typeof body.email !== "string") return json({ error: "Check the email address." }, 400);
      const booked = await bookPhone(c, session.callId, { requestKey: body.requestKey as string, member: body.member as string, fullName: body.fullName as string, phone: body.phone as string, email: body.email as string | null | undefined, startsAt: body.startsAt as string });
      if (booked.status !== "confirmed") return json({ booked: false, status: booked.status, error: "This appointment was updated by the business. Arrange staff follow-up; do not confirm or recreate it." }, 409);
      after(async () => { await runJobs(); });
      return json({ booked: true, reference: booked.reference, startsAt: booked.starts_at, endsAt: booked.ends_at, timezone: c.config.timezone, message: "The appointment is saved and confirmed. No immediate outbound confirmation call is needed." });
    }
    return json({ error: "Choose services, availability or book. Changes to existing appointments require staff follow-up." }, 400);
  } catch (error) {
    return json({ booked: false, error: error instanceof Error && /Choose|Check|Enter|available|already|details|Call booking/i.test(error.message) ? error.message : "We could not confirm the booking. Check availability again or arrange staff follow-up." }, 409);
  }
}
