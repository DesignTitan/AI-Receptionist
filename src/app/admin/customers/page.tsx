import { RemoteAction } from "@/components/platform/remote-action";
import { Frame } from "@/components/platform/frame";
import { requireStaff } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";
import { CustomerControls } from "@/components/platform/customer-controls";
import type { Customer } from "@/lib/platform/model";
import { PLANS } from "@/lib/platform/model";
export const dynamic = "force-dynamic";
export default async function Customers() {
  await requireStaff();
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
  return (
    <Frame
      eyebrow="Operator workspace"
      title="From first hello to open for business."
      description="Your customer setup queue. Payment, phone setup, and a successful test call all come before a business goes live."
    >
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
                {c.status === 'draft' && c.checkout_session_id && <div className="platform-actions"><RemoteAction url="/api/admin/checkout-reset" label="Close unpaid checkout and allow edits" body={{id:c.id}} secondary /></div>}
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
                    <td>{j.state}{j.state==='failed' && j.kind!=='call' && <RemoteAction url="/api/admin/job-retry" label="Retry email" body={{id:j.id}} secondary/>}</td>
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
