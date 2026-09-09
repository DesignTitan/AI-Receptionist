import { NextResponse, after } from "next/server";
import { publicCustomer, checkOrigin } from "@/lib/platform/server";
import { available, bookOnline } from "@/lib/platform/booking";
import { verifyHuman } from "@/lib/turnstile";
import { runJobs } from "@/lib/platform/jobs";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const business = await publicCustomer(slug);
    if (!business) throw Error("This business is not taking bookings right now.");
    const q = new URL(request.url).searchParams;
    const { slots } = await available(
      business,
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
    if (b.consent !== true)
      throw Error("Please agree to the recorded confirmation call.");
    const human = await verifyHuman(
      b.token,
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local",
    );
    if (!human.ok) throw Error("Complete the human check again.");
    const business = await publicCustomer(slug);
    if (!business) throw Error("Booking unavailable.");
    const data = await bookOnline(business, {
      member: b.member, fullName: b.full_name, phone: b.phone, email: b.email, startsAt: b.starts_at,
    });
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
