"use client";
import { useState } from "react";
import type { Customer } from "@/lib/platform/model";
export function CustomerControls({ customer: c }: { customer: Customer }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const f = new FormData(e.currentTarget);
        try {
          const r = await fetch("/api/admin/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: c.id,
              status: f.get("status"),
              agent_id: f.get("agent_id"),
              number_id: f.get("number_id"),
              phone_number: f.get("phone_number"),
              tested: f.get("tested") === "on",
            }),
          });
          const j = await r.json();
          if (!r.ok) throw Error(j.error);
          location.reload();
        } catch (e) {
          setError((e as Error).message);
          setBusy(false);
        }
      }}
    >
      <div className="platform-fields">
        <label>
          Setup status
          <select
            name="status"
            defaultValue={c.status}
            disabled={c.status === "draft"}
          >
            {["draft", "paid", "provisioning", "live", "paused"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          OmniDimension agent ID
          <input name="agent_id" defaultValue={c.agent_id ?? ""} />
        </label>
        <label>
          Dedicated number ID
          <input name="number_id" defaultValue={c.number_id ?? ""} />
        </label>
        <label>
          Dedicated phone number
          <input name="phone_number" defaultValue={c.phone_number ?? ""} />
        </label>
      </div>
      <label className="my-5">
        <input name="tested" type="checkbox" />I tested this customer’s line,
        booking, recording notice, and owner email successfully.
      </label>
      {error && <p className="platform-error">{error}</p>}
      <button disabled={busy || c.status === "draft"}>
        {busy ? "Saving…" : "Save setup"}
      </button>
    </form>
  );
}
