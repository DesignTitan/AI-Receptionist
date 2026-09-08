"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
export default function Callback() {
  const [message, setMessage] = useState("Finishing sign-in…");
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const hash = new URLSearchParams(location.hash.slice(1));
    const token = hash.get("access_token");
    history.replaceState(null, "", "/account/callback");
    if (!token) {
      setMessage(
        "This link is missing or expired. Please request a new sign-in link.",
      );
      return;
    }
    fetch("/api/account/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token }),
    })
      .then(async (r) => {
        if (!r.ok) throw Error();
        location.replace("/account");
      })
      .catch(() =>
        setMessage("This link has expired. Please request a new sign-in link."),
      );
  }, []);
  return (
    <main id="main" className="mx-auto max-w-xl px-6 py-24">
      <h1 className="text-3xl">{message}</h1>
      <Link className="mt-6 inline-block underline" href="/account/login">
        Back to sign in
      </Link>
    </main>
  );
}
