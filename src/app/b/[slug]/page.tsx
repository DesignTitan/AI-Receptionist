import {weeklyHoursFor,DAY_NAMES} from "@/lib/platform/weekly-hours";
import { notFound } from "next/navigation";
import { Frame } from "@/components/platform/frame";
import { CustomerBookingForm } from "@/components/platform/booking-form";
import { publicCustomer } from "@/lib/platform/server";
import { toDateKey } from "@/lib/time";
import { env } from "@/lib/env";
export const dynamic = "force-dynamic";
export default async function Business({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await publicCustomer(slug);
  if (!c) notFound();
  return (
    <Frame
      eyebrow="Book directly with us"
      title={c.business_name}
      description={c.phone_settings?.confirmationCalls === false
        ? "Choose your person and a time. Your appointment details will be saved for the team."
        : "Choose your person and a time. Our AI receptionist will call to confirm the details."}
    >
      <div className="platform-grid">
        <CustomerBookingForm
          slug={slug}
          team={c.config.team}
          today={toDateKey(new Date(), c.config.timezone)}
          timezone={c.config.timezone}
          siteKey={env.turnstile.siteKey ?? ""}
        />
        <aside
          className="platform-panel platform-aside"
          style={{ borderTop: `4px solid ${c.config.color}` }}
        >
          <h2>We’ll see you soon.</h2>
          <p>{c.config.address}</p>
          <dl className="mt-4">{[1,2,3,4,5,6,0].map(day=>{const hours=weeklyHoursFor(c.config).find(d=>d.day===day)!;return <div key={day} className="flex justify-between gap-4"><dt>{DAY_NAMES[day]}</dt><dd>{!hours.enabled?"Closed":hours.opens==="00:00"&&hours.closes==="24:00"?"All day":`${hours.opens}–${hours.closes==="24:00"?"Midnight":hours.closes}`}</dd></div>})}</dl>
          <hr />
          <p>Have a question?</p>
          <a href={`tel:${c.config.phone}`}>{c.config.phone}</a>
          <p className="platform-note">
            {c.phone_settings?.confirmationCalls === false
              ? "Automated confirmation calls are currently off. Contact the business if you need to change your appointment."
              : "Confirmation calls are made by an AI assistant and are recorded. Tell the assistant if you need to cancel or ask the team to reschedule."}
          </p>
        </aside>
      </div>
    </Frame>
  );
}
