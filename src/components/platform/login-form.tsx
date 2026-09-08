"use client";
import { useState } from "react";
import { HumanCheck } from "./human-check";
export function LoginForm({ siteKey }: { siteKey: string }) {
  const [email, setEmail] = useState(""),
    [token, setToken] = useState(""),
    [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false),
    [error, setError] = useState(""),
    [reset, setReset] = useState(0);
  return (
    <form
      className="platform-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          const r = await fetch("/api/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, token }),
          });
          const j = await r.json();
          if (!r.ok) throw Error(j.error);
          setSent(true);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
          setToken("");
          setReset((n) => n + 1);
        }
      }}
    >
      {sent ? (
        <div className="platform-success" role="status">
          Check your inbox. Open the sign-in link on this device to continue.
        </div>
      ) : (
        <>
          <label>
            Your email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <p className="platform-note">
            One secure link. No password to remember. New here? Your account is
            created when you confirm your email.
          </p>
        </>
      )}
      {siteKey ? (
        <HumanCheck siteKey={siteKey} onToken={setToken} reset={reset} />
      ) : (
        <p className="platform-note">
          Owner sign-in is being prepared. Please check back shortly.
        </p>
      )}
      {error && (
        <p role="alert" className="platform-error">
          {error}
        </p>
      )}
      <div className="platform-actions">
        <button disabled={busy || !token}>
          {busy
            ? "Sending…"
            : sent
              ? "Send another link"
              : "Email me a sign-in link"}
        </button>
      </div>
    </form>
  );
}
