import Link from "next/link";
import { Frame } from "@/components/platform/frame";
import { RemoteAction } from "@/components/platform/remote-action";
import { ownedCustomer, bookingsFor } from "@/lib/platform/server";
import { PLANS } from "@/lib/platform/model";
import { serviceClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { formatDateTime } from "@/lib/time";
export const dynamic = "force-dynamic";
export default async function Account() {
  const c = await ownedCustomer();
  if (!c) redirect("/start");
  const bookings = await bookingsFor(c.id);
  const beginning = new Date();
  beginning.setUTCDate(1);
  beginning.setUTCHours(0, 0, 0, 0);
  const { count, error } = await serviceClient()
    .from("customer_bookings")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", c.id)
    .eq("call_status", "completed")
    .gte("created_at", beginning.toISOString());
  if (error) throw Error("Usage is temporarily unavailable.");
  const used = count ?? 0;
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
            ${plan.monthly}/month · {plan.calls} calls
          </p>
        </div>
        <div className="platform-panel">
          Completed calls this calendar month
          <strong>{used.toLocaleString()}</strong>
          <p>Usage resets on the 1st, UTC</p>
        </div>
        <div className="platform-panel">
          Estimated additional call cost
          <strong>${(Math.max(0, used - plan.calls) * 0.3).toFixed(2)}</strong>
          <p>
            30¢ per call above your allowance. Final billing is reviewed
            separately.
          </p>
        </div>
      </div>
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
