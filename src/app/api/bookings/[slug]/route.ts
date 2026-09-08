import { NextResponse, after } from "next/server";
import { publicCustomer, checkOrigin } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";
import { slotsFor } from "@/lib/platform/slots";
import { text, phone, email } from "@/lib/platform/model";
import { verifyHuman } from "@/lib/turnstile";
import { toDateKey } from "@/lib/time";
import { runJobs } from "@/lib/platform/jobs";
export const dynamic = "force-dynamic";
async function available(slug: string, memberId: string, date: string) {
  const c = await publicCustomer(slug);
  if (!c) throw Error("This business is not taking bookings right now.");
  const member = c.config.team.find((p) => p.id === memberId);
  if (!member) throw Error("Choose a team member.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw Error("Choose a valid date.");
  const db = serviceClient();
  const start = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(+start)) throw Error("Choose a valid date.");
  const { data, error } = await db
    .from("customer_bookings")
    .select("starts_at,ends_at")
    .eq("customer_id", c.id)
    .eq("provider_id", memberId)
    .neq("status", "cancelled")
    .gte("starts_at", new Date(+start - 86400000).toISOString())
    .lt("starts_at", new Date(+start + 2 * 86400000).toISOString());
  if (error) throw Error("Availability is temporarily unavailable.");
  return { c, member, slots: slotsFor(c.config, member, date, data) };
}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const q = new URL(request.url).searchParams;
    const { slots } = await available(
      slug,
      q.get("member") ?? "",
      q.get("date") ?? "",
    );
    return NextResponse.json({ slots });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    checkOrigin(request);
    const { slug } = await params;
    const b = await request.json();
    const name = text(b.full_name, "full name");
    const telephone = phone(b.phone);
    const address = b.email ? email(b.email) : null;
    if (b.consent !== true)
      throw Error("Please agree to the recorded confirmation call.");
    const human = await verifyHuman(
      b.token,
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local",
    );
    if (!human.ok) throw Error("Complete the human check again.");
    const business = await publicCustomer(slug);
    if (!business) throw Error("Booking unavailable.");
    const instant = new Date(b.starts_at);
    if (Number.isNaN(+instant)) throw Error("Choose an appointment time.");
    const { c, slots } = await available(
      slug,
      b.member,
      toDateKey(instant, business.config.timezone),
    );
    const slot = slots.find((s) => s.start === instant.toISOString());
    if (!slot)
      throw Error("That time is no longer available. Please pick another.");
    const { data, error } = await serviceClient().rpc(
      "reserve_customer_booking",
      {
        c_id: c.id,
        member: b.member,
        guest: name,
        telephone,
        guest_email: address,
        begins: slot.start,
        finishes: slot.end,
      },
    );
    if (error)
      throw Error(
        "We could not reserve that time. It may be taken or your daily booking limit has been reached.",
      );
    after(async () => {
      await runJobs();
    });
    return NextResponse.json(
      { url: `/b/${slug}/confirmation/${data.id}?ref=${data.reference}` },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
