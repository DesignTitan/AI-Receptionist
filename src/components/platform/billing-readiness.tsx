"use client";

import { useId, useState } from "react";

type BillingCheck = { label: string; ok: boolean; detail: string };
type BillingResult = {
  ok: boolean;
  mode: "test" | "live";
  account: string | null;
  checks: BillingCheck[];
};

export function BillingReadiness() {
  const resultsId = useId();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BillingResult | null>(null);
  const [error, setError] = useState("");

  async function checkConnection() {
    setBusy(true);
    setResult(null);
    setError("");
    try {
      const response = await fetch("/api/admin/billing-readiness", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });
      const data = await response.json();
      if (!Array.isArray(data.checks)) {
        throw Error(
          response.status === 401 || response.status === 403
            ? "Sign in to the operator workspace again to check billing."
            : "The billing check could not finish. Please try again.",
        );
      }
      setResult(data as BillingResult);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The billing check could not finish.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="secondary"
        disabled={busy}
        aria-controls={resultsId}
        onClick={checkConnection}
      >
        {busy ? "Checking billing connection…" : "Check billing connection"}
      </button>
      <p role="status" aria-live="polite">
        {busy
          ? "Checking your Stripe connection and prices."
          : result
            ? result.ok
              ? "Billing connection checks passed."
              : "Some billing checks need attention. Review the results below."
            : ""}
      </p>
      {error && (
        <p className="platform-error" role="alert">
          {error}
        </p>
      )}
      <div id={resultsId} aria-busy={busy}>
        {result && (
          <ul>
            {result.checks.map((check, index) => (
              <li key={`${check.label}-${index}`}>
                <strong>
                  {check.ok ? "Passed" : "Needs attention"}: {check.label}
                </strong>
                <p>{check.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
