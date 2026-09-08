import { notFound } from "next/navigation";
import { Frame } from "@/components/platform/frame";
import { serviceClient } from "@/lib/supabase";
import { formatDateTime } from "@/lib/time";
import type { Customer } from "@/lib/platform/model";
export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function Confirmation({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { slug, id } = await params;
  const { ref } = await searchParams;
  if (!ref || !/^[a-f0-9]{48}$/.test(ref)) notFound();
  const db = serviceClient();
  const { data: c } = await db
    .from("customers")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!c) notFound();
  const { data: b } = await db
    .from("customer_bookings")
    .select("*")
    .eq("id", id)
    .eq("customer_id", c.id)
    .eq("reference", ref)
    .single();
  if (!b) notFound();
  const customer = c as Customer;
  return (
    <Frame
      eyebrow={customer.business_name}
      title={
        b.status === "cancelled"
          ? "Your appointment is cancelled."
          : "Your appointment is reserved."
      }
      description="Keep this private page for your booking details."
    >
      <div className="platform-panel" style={{ maxWidth: 640 }}>
        <span className="platform-badge">{b.status}</span>
        <h2 className="mt-5">
          {formatDateTime(b.starts_at, customer.config.timezone)}
        </h2>
        <p>
          {customer.config.team.find((t) => t.id === b.provider_id)?.name} ·{" "}
          {customer.config.address}
        </p>
        <p className="mt-5">
          {b.call_status === "failed"
            ? "The confirmation call could not be completed. Your booking is still saved; please call the business."
            : b.call_status === "completed"
              ? "Your confirmation call has finished. Contact the business if you need to change anything."
              : "Your confirmation call is queued. You can safely close this page."}
        </p>
        <div className="platform-actions">
          <a className="platform-btn" href={`tel:${customer.config.phone}`}>
            Call the business
          </a>
          <a
            className="platform-btn secondary"
            href={`/b/${slug}/confirmation/${id}?ref=${ref}`}
          >
            Refresh status
          </a>
        </div>
      </div>
    </Frame>
  );
}
