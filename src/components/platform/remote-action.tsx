"use client";
import { useState } from "react";
export function RemoteAction({
  url,
  label,
  body,
  method = "POST",
  secondary = false,
  className,
}: {
  url: string;
  label: string;
  body?: unknown;
  method?: string;
  secondary?: boolean;
  className?: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <>
      <button
        className={className ?? (secondary ? "secondary" : "")}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const r = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: body ? JSON.stringify(body) : undefined,
            });
            const j = await r.json();
            if (!r.ok) throw Error(j.error);
            if (j.url) location.assign(j.url);
            else location.reload();
          } catch (e) {
            setError((e as Error).message);
            setBusy(false);
          }
        }}
      >
        {busy ? "Working…" : label}
      </button>
      {error && (
        <p className="platform-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
