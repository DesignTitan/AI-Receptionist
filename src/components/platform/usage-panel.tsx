"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function UsageControls({ budget }: { budget: number }) {
  const [value, setValue] = useState(String(budget / 100)),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          const r = await fetch("/api/account/usage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              budgetCents: Math.round(Number(value) * 100),
            }),
          });
          const j = await r.json();
          if (!r.ok) throw Error(j.error);
          router.refresh();
          setError("Your monthly spending limit is saved.");
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        Monthly extra-minute spending limit (USD)
        <input
          type="number"
          min="0"
          max="500"
          step="1"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <p className="platform-note">
        $0 means no extra charges. Extra minutes cost 49¢ each. Raising this
        limit authorizes usage charges up to that amount each billing month,
        until changed. Charges already used or reserved by active calls cannot
        be removed.
      </p>
      <div className="platform-actions">
        <button disabled={busy}>
          {busy ? "Saving…" : "Save spending limit"}
        </button>
      </div>
      {error && <p role="status">{error}</p>}
    </form>
  );
}
