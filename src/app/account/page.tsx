import { UsageControls } from "@/components/platform/usage-panel";
import { PhoneControls } from "@/components/platform/phone-controls";
import { InboundCallHistory } from "@/components/platform/inbound-call-history";
import { usageFor } from "@/lib/platform/usage";
import {
  recommendPlan,
  OVERAGE_CENTS,
  PILOT_SETUP_CENTS,
  SETUP_CENTS,
  SETUP_OFFER,
  SETUP_SCOPE,
} from "@/lib/platform/pricing";
import Link from "next/link";
import { Frame } from "@/components/platform/frame";
import { RemoteAction } from "@/components/platform/remote-action";
import { ownedCustomer, bookingsFor } from "@/lib/platform/server";
import { PLANS } from "@/lib/platform/model";
import { serviceClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { formatDateTime } from "@/lib/time";
import { billingMode } from "@/lib/platform/billing-mode";
export const dynamic = "force-dynamic";
export default async function Account() {
  const c = await ownedCustomer();
  if (!c) redirect("/start");
  if (c.config.setupPending) {
    const paid = c.status === "paid" && c.billing_status === "active";
    return <Frame eyebrow="Your dashboard" title={paid ? "Welcome to your front desk." : "Your purchase"} description={paid ? "Payment confirmed. Let’s get your business ready." : "Complete checkout to continue. If you have just paid, your payment confirmation may take a moment."}>
      <section className="platform-panel">
        <h2>{PLANS[c.plan].name}</h2>
        <p>{paid ? "Add your business details, hours and team. We’ll then prepare your booking page and phone line and arrange a test with you." : "Your selected plan is saved. Business setup opens after Stripe confirms payment."}</p>
        <div className="platform-actions">
          {paid ? <Link className="platform-btn" href="/account/setup">Set up your business →</Link> : c.status === "draft" ? <RemoteAction url="/api/account/checkout" label="Continue Stripe Checkout →" /> : null}
          {c.status !== "draft" && <RemoteAction url="/api/account/billing" label="Manage billing" secondary />}
          <Link href="/account">Refresh payment status</Link>
          <RemoteAction url="/api/account/session" method="DELETE" label="Sign out" secondary />
        </div>
      </section>
    </Frame>;
  }
  const bookings = await bookingsFor(c.id);
  const { period, notices } = await usageFor(c);
  const used = period?.used_minutes ?? 0;
  const included = period?.included_minutes ?? PLANS[c.plan].minutes;
  const extra = Math.max(0, used - included) * OVERAGE_CENTS;
  const elapsed = period
    ? Math.max(1, (Date.now() - Date.parse(period.starts_at)) / 86400000)
    : 1;
  const days = period
    ? (Date.parse(period.ends_at) - Date.parse(period.starts_at)) / 86400000
    : 30;
  const projected = Math.ceil((used / elapsed) * days);
  const recommended = recommendPlan(projected, c.config.team.length);
  const plan = PLANS[c.plan];
  const next: Record<string, string> = {
    draft:
      "Your business details are saved. Complete checkout to join the setup queue.",
    paid: "Payment received. We’ll prepare your booking page and phone line next.",
    provisioning:
      "Your front desk is being prepared. We’ll contact you to arrange a test call.",
    live: "Your front desk is open. Share your booking page with your clients.",
    paused: "Your front desk is paused. Check billing or contact us to resume.",
  };
  return (
    <Frame
      eyebrow="Your front desk"
      title={c.business_name}
      description={next[c.status]}
    >
      {billingMode() === "test" && (
        <div className="platform-panel mb-6" role="note">
          <strong>Test checkout — no real payment will be taken.</strong>
        </div>
      )}
      <div className="platform-actions">
        <span className="platform-badge">{c.status}</span>
        {c.status === "draft" ? (
          c.checkout_attempt ? (
            <RemoteAction
              url="/api/account/checkout"
              label="Continue checkout →"
            />
          ) : (
            <Link className="platform-btn" href="/start">
              Continue setup →
            </Link>
          )
        ) : (
          <RemoteAction
            url="/api/account/billing"
            label="Manage billing"
            secondary
          />
        )}
        {c.status === "live" && (
          <Link className="platform-btn" href={`/b/${c.slug}`}>
            Open booking page ↗
          </Link>
        )}
        <RemoteAction
          url="/api/account/session"
          method="DELETE"
          label="Sign out"
          secondary
        />
      </div>
      <div className="platform-metrics">
        <div className="platform-panel">
          Your plan<strong>{plan.name}</strong>
          <p>
            ${plan.monthly}/month · {included.toLocaleString()} minutes · up to{" "}
            {plan.teamLimit} team members
          </p>
        </div>
        <div className="platform-panel">
          Minutes used
          <strong>
            {used.toLocaleString()} / {included.toLocaleString()}
          </strong>
          <progress
            aria-label="Included minutes used"
            max={included}
            value={Math.min(used, included)}
            style={{ width: "100%" }}
          />
          <p>
            {period
              ? `Resets ${formatDateTime(period.ends_at, c.config.timezone)}`
              : "Your billing period starts after payment."}
          </p>
          <p>
            {period?.reserved_minutes ?? 0} minutes reserved for calls in
            progress or awaiting their report.
          </p>
        </div>
        <div className="platform-panel">
          Extra usage so far<strong>${(extra / 100).toFixed(2)}</strong>
          <p>
            49¢ per started minute beyond your allowance. Your recurring monthly
            spending limit: ${(c.overage_budget_cents / 100).toFixed(2)}.
          </p>
        </div>
      </div>
      <PhoneControls config={c.config} />
      <section className="platform-panel mb-6">
        <h2>Your bill, without surprises</h2>
        {c.status === "draft" && !c.setup_paid_at ? (
          <>
            {c.setup_fee_cents != null ? (
              <p>
                Your first payment:{" "}
                <strong>
                  ${(plan.monthly + c.setup_fee_cents / 100).toFixed(2)}
                </strong>{" "}
                before tax. This includes your first month (${plan.monthly}) and
                one-time setup (${(c.setup_fee_cents / 100).toFixed(2)}).
              </p>
            ) : (
              <p>
                First month + setup:{" "}
                <strong>
                  ${(plan.monthly + PILOT_SETUP_CENTS / 100).toFixed(2)}
                </strong>{" "}
                if pilot pricing is available, or{" "}
                <strong>
                  ${(plan.monthly + SETUP_CENTS / 100).toFixed(2)}
                </strong>{" "}
                with standard setup, before tax. Your exact setup price is
                confirmed before payment.
              </p>
            )}
            <p>
              Then <strong>${plan.monthly}/month</strong>, plus any extra
              minutes you authorize and applicable tax. Setup does not repeat.
            </p>
          </>
        ) : (
          <p>
            Next recurring charge estimate:{" "}
            <strong>${(plan.monthly + extra / 100).toFixed(2)}</strong> before
            tax or credits. It combines the next month’s plan with this month’s
            extra usage. Setup is charged once and does not repeat on renewal.
          </p>
        )}
        <p>
          {c.setup_fee_cents != null ? (
            <>
              Your {c.setup_fee_cents === PILOT_SETUP_CENTS ? "pilot " : ""}
              setup fee:{" "}
              <strong>${(c.setup_fee_cents / 100).toFixed(2)}</strong>
              {c.setup_paid_at ? " · paid." : " · payable at checkout."}
            </>
          ) : (
            SETUP_OFFER
          )}{" "}
          {SETUP_SCOPE}
        </p>
        {period && used > 0 && elapsed >= 3 && (
          <p>
            At your recent pace: about {projected.toLocaleString()} minutes this
            period.{" "}
            {recommended !== c.plan
              ? `${PLANS[recommended].name} may cost less at this usage. Contact support to schedule a change at renewal; we never switch your plan automatically.`
              : "Your current plan is cost-effective at this pace."}{" "}
            This is a forecast, not a charge.
          </p>
        )}
        <p>
          Each call is rounded up to the next minute, including connected
          voicemail and short attempts reported with duration. Calls with zero
          duration use zero minutes. Maximum call length: five minutes. We
          reserve five minutes before starting a call, so new calls can pause
          with up to four minutes still available. Unused minutes do not roll
          over.
        </p>
        <p>
          Warnings appear here and are queued to your email at 80% and 100% of
          your allowance, near your extra-spend limit, and when calls pause.
          Keep checking this page if an email is delayed. Bookings stay open
          when your call budget runs out; your team can confirm them manually.
        </p>
        <UsageControls budget={c.overage_budget_cents} />
      </section>
      <section className="platform-panel mb-6">
        <h2>Usage notifications</h2>
        {notices.length ? (
          notices.map((n) => (
            <p key={n.id}>
              <small>{formatDateTime(n.created_at, c.config.timezone)}</small>
              <br />
              {n.message}
            </p>
          ))
        ) : (
          <p>No usage alerts yet.</p>
        )}
      </section>
      <InboundCallHistory customerId={c.id} timezone={c.config.timezone} />
      <section className="platform-panel">
        <h2>Appointments</h2>
        <p>
          Your bookings, calls and follow-ups. Times shown in{" "}
          {c.config.timezone}.
        </p>
        {bookings.length ? (
          <div className="platform-table">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Appointment</th>
                  <th>Status</th>
                  <th>Call</th>
                  <th>Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      {b.full_name}
                      <small>{b.phone}</small>
                    </td>
                    <td>
                      {formatDateTime(b.starts_at, c.config.timezone)}
                      <small>
                        {
                          c.config.team.find((t) => t.id === b.provider_id)
                            ?.name
                        }
                      </small>
                    </td>
                    <td>{b.status}</td>
                    <td>
                      {b.call_status}
                      {b.summary && (
                        <details>
                          <summary>Call summary</summary>
                          <p>{b.summary}</p>
                          {b.transcript && <pre>{b.transcript}</pre>}
                          {b.recording_url?.startsWith("https://") && (
                            <a
                              href={b.recording_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Listen to recording
                            </a>
                          )}
                        </details>
                      )}
                    </td>
                    <td>
                      {b.status !== "cancelled" && (
                        <RemoteAction
                          url="/api/account/bookings"
                          label="Cancel"
                          body={{ id: b.id, status: "cancelled" }}
                          secondary
                        />
                      )}
                      {b.status === "pending" && (
                        <RemoteAction
                          url="/api/account/bookings"
                          label="Confirm"
                          body={{ id: b.id, status: "confirmed" }}
                          secondary
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="platform-empty">
            Your first booking will appear here.
          </div>
        )}
      </section>
    </Frame>
  );
}
