"use client";
import { useEffect, useRef, useState } from "react";
import { AuthShell } from "@/components/account-auth/auth-shell";
import Link from "next/link";
import styles from "@/components/account-auth/auth.module.css";
export default function Callback() {
  const started = useRef(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const code = new URLSearchParams(location.search).get("code");
    history.replaceState(null, "", "/account/callback");
    if (!code) {
      setError(
        "This sign-in link is missing or expired. Request a fresh link and open it in this browser.",
      );
      return;
    }
    fetch("/api/account/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw Error(data.error);
        location.replace("/account/security");
      })
      .catch((e) => setError(e.message));
  }, []);
  return (
    <AuthShell>
      <h1>{error ? "Let’s try a fresh link." : "Finishing sign-in…"}</h1>
      <p role={error ? "alert" : "status"}>
        {error || "Checking your email link securely."}
      </p>
      {error && (
        <Link className={styles.primary} href="/account/login">
          Request a new sign-in link
        </Link>
      )}
    </AuthShell>
  );
}
