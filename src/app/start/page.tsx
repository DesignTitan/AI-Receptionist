import { Frame } from "@/components/platform/frame";
import { StartForm } from "@/components/platform/start-form";
import { ownedCustomer } from "@/lib/platform/server";
import { planOf } from "@/lib/platform/model";
import { SETUP_SCOPE } from "@/lib/platform/pricing";
import { billingMode } from "@/lib/platform/billing-mode";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Start({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const c = await ownedCustomer();
  if (c && (c.status !== "draft" || c.checkout_attempt)) redirect("/account");
  let plan: "front" | "busy" | "full" = "busy";
  try {
    plan = planOf((await searchParams).plan ?? "busy");
  } catch {}
  return (
    <Frame
      eyebrow="Let’s make room for your work"
      title="A front desk of your own."
      description="Tell us how your business works. We’ll take care of the booking page, the phone line, and the first hello."
    >
      {billingMode() === "test" && (
        <div className="platform-panel mb-6" role="note">
          <strong>Test checkout — no real payment will be taken.</strong>
        </div>
      )}
      <div className="platform-grid">
        <StartForm customer={c} plan={plan} />
        <aside className="platform-panel platform-aside">
          <span className="platform-kicker">From signup to first call</span>
          <h2 className="mt-4">We set it up with you.</h2>
          <ol>
            <li>Your business and team</li>
            <li>Secure payment</li>
            <li>We prepare your line</li>
            <li>A test call together</li>
            <li>You’re open for bookings</li>
          </ol>
          <hr />
          <h3>Included in your one-time setup</h3>
          <p>{SETUP_SCOPE}</p>
          <p>
            No calendar connection is included yet. Your booking page has its
            own appointment book.
          </p>
          <p className="platform-note">
            Have an existing booking system? Tell us before switching so we can
            help avoid scheduling conflicts.
          </p>
        </aside>
      </div>
    </Frame>
  );
}
