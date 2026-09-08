import {
  economics,
  PILOT_CUSTOMERS,
  PILOT_SETUP_CENTS,
  SETUP_OFFER,
  SETUP_SCOPE,
} from "@/lib/platform/pricing";
import { RemoteAction } from "@/components/platform/remote-action";
import { Frame } from "@/components/platform/frame";
import { requireStaff } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";
import { CustomerControls } from "@/components/platform/customer-controls";
import type { Customer } from "@/lib/platform/model";
import { PLANS } from "@/lib/platform/model";
import { billingMode } from "@/lib/platform/billing-mode";
import { BillingReadiness } from "@/components/platform/billing-readiness";
export const dynamic = "force-dynamic";
export default async function Customers() {
  await requireStaff();
  let mode: ReturnType<typeof billingMode> | null = null;
  try {
    mode = billingMode();
  } catch {
    /* Keep diagnostics available for a bad setting. */
  }
  const configuredAccount = process.env.STRIPE_ACCOUNT_ID;
  const accountLabel =
    configuredAccount && /^acct_[A-Za-z0-9]+$/.test(configuredAccount)
      ? configuredAccount
      : "Not configured correctly";
  const db = serviceClient();
  const { data, error } = await db
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const jobs = await db
    .from("customer_jobs")
    .select("id,kind,state,error,created_at")
    .in("state", ["failed", "working"])
    .order("created_at", { ascending: false })
    .limit(30);
  const periods = await db
    .from("usage_periods")
    .select("*,customers(business_name)")
    .lte("starts_at", new Date().toISOString())
    .gt("ends_at", new Date().toISOString());
  const metering = await db
    .from("call_usage")
    .select("booking_id,stripe_state,stripe_error,settled_at,started_at")
    .or("stripe_state.eq.review,stripe_error.not.is.null,settled_at.is.null")
    .limit(50);
  const pilot = await db
    .from("pilot_setup_slots")
    .select("slot,customer_id,redeemed");
  const pilotRedeemed = pilot.data?.filter((slot) => slot.redeemed).length ?? 0;
  const pilotReserved =
    pilot.data?.filter((slot) => !slot.redeemed && slot.customer_id).length ??
    0;
  return (
    <Frame
      eyebrow="Operator workspace"
      title="From first hello to open for business."
      description="Your customer setup queue. Payment, phone setup, and a successful test call all come before a business goes live."
    >
      <section className="platform-panel mb-6">
        <h2>{mode ? `Stripe ${mode} mode` : "Stripe mode needs review"}</h2>
        <p>Account: {accountLabel}</p>
        <p>
          API key: {process.env.STRIPE_SECRET_KEY ? "configured" : "missing"}.
        </p>
        <BillingReadiness />
      </section>
      <section className="platform-panel mb-6">
        <h2>Pilot setup places</h2>
        <p>{SETUP_OFFER}</p>
        {pilot.error ? (
          <p>
            Pilot availability is unavailable. Check the setup migration before
            opening checkout.
          </p>
        ) : (
          <p>
            {pilotRedeemed} of {PILOT_CUSTOMERS} redeemed · {pilotReserved}{" "}
            reserved at checkout ·{" "}
            {pilot.data?.filter((slot) => !slot.redeemed && !slot.customer_id)
              .length ?? 0}{" "}
            available. Paid places stay used after cancellation or refund.
          </p>
        )}
        <p>{SETUP_SCOPE}</p>
        <p>
          Keep direct onboarding costs within $150. A $299 pilot setup leaves
          about $137.94 after that allowance and assumed 3.6% + 30¢ fees, before
          shared overhead. Track actual setup time and expenses. Custom work
          starting at $1,000 is separately scoped and quoted.
        </p>
      </section>
      <section className="platform-panel mb-6">
        <h2>Pricing and margin guardrails</h2>
        <p>
          Planning uses $0.20 per started minute, $5 phone rental, $25 support
          reserve, and 3.6% + 30¢ payment/Billing fees. Contribution is before
          shared overhead, acquisition, tax and extraordinary support; it is not
          net profit.
        </p>
        <div className="platform-metrics">
          {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map((p) => (
            <div key={p}>
              {PLANS[p].name}
              <strong>
                {Math.round(economics(p).margin * 100)}% planned contribution
              </strong>
              <p>${economics(p).contribution.toFixed(2)} at full allowance</p>
            </div>
          ))}
        </div>
      </section>
      <section className="platform-panel mb-6">
        <h2>Current customer usage</h2>
        {periods.error ? (
          <p>Usage monitor unavailable.</p>
        ) : periods.data?.length ? (
          periods.data.map((p) => {
            const revenue =
              p.monthly_cents / 100 +
              (Math.max(0, p.used_minutes - p.included_minutes) *
                p.overage_cents) /
                100;
            const contribution =
              revenue - revenue * 0.036 - 0.3 - 30 - p.used_minutes * 0.2;
            return (
              <p key={p.id}>
                <strong>{p.customers?.business_name}</strong> · {p.used_minutes}
                /{p.included_minutes} minutes · {p.reserved_minutes} reserved ·
                ${contribution.toFixed(2)} estimated contribution at usage so
                far.{" "}
                {contribution / revenue < 0.5
                  ? "Margin below target: review provider costs and support time."
                  : ""}
              </p>
            );
          })
        ) : (
          <p>No active billing periods yet.</p>
        )}
      </section>
      <section className="platform-panel mb-6">
        <h2>Metering and unresolved calls</h2>
        {metering.error ? (
          <p>Metering monitor unavailable.</p>
        ) : metering.data?.length ? (
          metering.data.map((m) => (
            <p key={m.booking_id}>
              {m.booking_id}:{" "}
              {m.settled_at
                ? (m.stripe_error ?? m.stripe_state)
                : "Awaiting duration; allowance remains reserved. Check provider report if older than 10 minutes."}
            </p>
          ))
        ) : (
          <p>No metering issues.</p>
        )}
      </section>
      {error ? (
        <div className="platform-error">
          The customer database migration has not been applied yet.
        </div>
      ) : (
        <>
          <div className="platform-metrics">
            {["paid", "provisioning", "live"].map((s) => (
              <div className="platform-panel" key={s}>
                {s}
                <strong>{data.filter((c) => c.status === s).length}</strong>
              </div>
            ))}
          </div>
          {data.length === 0 ? (
            <div className="platform-empty">
              No customers yet. New signups will appear here.
            </div>
          ) : (
            (data as Customer[]).map((c) => (
              <section className="platform-panel mb-6" key={c.id}>
                <span className="platform-badge">
                  {c.status} · {c.billing_status ?? "unpaid"}
                </span>
                <h2 className="mt-4">{c.business_name}</h2>
                <p>
                  {c.owner_email} · {PLANS[c.plan].name} · {c.config.areaCode}
                </p>
                <p>
                  {c.setup_fee_cents != null
                    ? `${c.setup_fee_cents === PILOT_SETUP_CENTS ? "Pilot setup" : "Setup"}: $${(c.setup_fee_cents / 100).toFixed(2)} · ${c.setup_paid_at ? "paid" : "reserved; payment pending"}`
                    : "Setup fee will be confirmed when checkout starts."}
                </p>
                <details className="my-4">
                  <summary>Business setup details</summary>
                  <p>
                    {c.config.address} · {c.config.phone} · {c.config.timezone}
                    <br />
                    {c.config.opens}–{c.config.closes}, days{" "}
                    {c.config.days.join(", ")}
                  </p>
                  <ul>
                    {c.config.team.map((t) => (
                      <li key={t.id}>
                        {t.name} · {t.service} · {t.minutes} min
                      </li>
                    ))}
                  </ul>
                </details>
                {c.provision_error && (
                  <p className="platform-error">{c.provision_error}</p>
                )}
                <CustomerControls customer={c} />
                {c.status === "draft" && c.checkout_session_id && (
                  <div className="platform-actions">
                    <RemoteAction
                      url="/api/admin/checkout-reset"
                      label="Close unpaid checkout and allow edits"
                      body={{ id: c.id }}
                      secondary
                    />
                  </div>
                )}
              </section>
            ))
          )}
        </>
      )}
      <section className="platform-panel mt-8">
        <h2>Operations: jobs needing attention</h2>
        <p>
          Check a provider’s call log before retrying an interrupted call. Email
          retries reuse the same delivery key.
        </p>
        {jobs.error ? (
          <p>Apply the customer migration to enable job monitoring.</p>
        ) : jobs.data?.length ? (
          <div className="platform-table">
            <table>
              <thead>
                <tr>
                  <th>Job</th>
                  <th>State</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {jobs.data.map((j) => (
                  <tr key={j.id}>
                    <td>{j.kind}</td>
                    <td>
                      {j.state}
                      {j.state === "failed" && j.kind !== "call" && (
                        <RemoteAction
                          url="/api/admin/job-retry"
                          label="Retry email"
                          body={{ id: j.id }}
                          secondary
                        />
                      )}
                    </td>
                    <td>
                      {j.error ??
                        "In progress; inspect if older than ten minutes."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No jobs need attention.</p>
        )}
      </section>
    </Frame>
  );
}
