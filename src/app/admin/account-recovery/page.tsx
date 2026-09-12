import { requireStaff } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";
import { Frame } from "@/components/platform/frame";
import { RemoteAction } from "@/components/platform/remote-action";
export const dynamic = "force-dynamic";
export default async function RecoveryQueue() {
  await requireStaff();
  const { data, error } = await serviceClient()
    .from("account_recovery_requests")
    .select("id,user_id,status,created_at")
    .in("status", ["pending", "reviewing"])
    .order("created_at")
    .limit(100);
  return (
    <Frame
      eyebrow="Customer support"
      title="Account recovery"
      description="Review requests without bypassing account security. Email access alone is not proof of ownership."
    >
      {error ? (
        <p role="alert">
          Recovery requests are unavailable. Check that the security migration
          is installed.
        </p>
      ) : !data?.length ? (
        <p>No pending recovery requests.</p>
      ) : (
        data.map((r) => (
          <section className="platform-panel" key={r.id}>
            <h2>Request {r.id}</h2>
            <p>Owner: {r.user_id}</p>
            <p>
              {r.status} · {new Date(r.created_at).toLocaleString()}
            </p>
            <p>
              Contact the customer through an established, independently
              verified channel. Never request authenticator secrets or recovery
              codes. Closing a request does not change credentials or unlock the
              account.
            </p>
            {r.status === "pending" && (
              <RemoteAction
                url="/api/admin/account-recovery"
                body={{ id: r.id, status: "reviewing" }}
                label="Start review"
              />
            )}
            <RemoteAction
              url="/api/admin/account-recovery"
              body={{ id: r.id, status: "resolved" }}
              label="Close after customer regains access"
              secondary
            />
            <RemoteAction
              url="/api/admin/account-recovery"
              body={{ id: r.id, status: "declined" }}
              label="Decline request"
              secondary
            />
          </section>
        ))
      )}
    </Frame>
  );
}
