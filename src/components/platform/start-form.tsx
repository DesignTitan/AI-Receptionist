"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PLANS, type Plan } from "@/lib/platform/model";
import { setupCents } from "@/lib/platform/pricing";
import { HumanCheck } from "./human-check";
import styles from "./signup.module.css";

export function StartForm({ plan, returnTo, signedIn, initialEmail, initialName, review, siteKey }: {
  plan: Plan; returnTo: string; signedIn: boolean; initialEmail: string; initialName: string; review: boolean; siteKey: string;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [step, setStep] = useState<"details" | "review" | "sent">(signedIn && review && initialName ? "review" : "details");
  const verified = signedIn;
  const [resendAfter, setResendAfter] = useState(0);
  const [token, setToken] = useState("");
  const [reset, setReset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  const p = PLANS[plan];
  useEffect(() => {
    if (previousStep.current !== step) {
      heading.current?.focus();
    }
    previousStep.current = step;
  }, [step]);
  useEffect(() => {
    if (!signedIn || !review) return;
    try {
      const draft = JSON.parse(sessionStorage.getItem("signup-details") ?? "null");
      if (draft?.email?.toLowerCase() === initialEmail.toLowerCase() && typeof draft.name === "string" && draft.name.trim()) {
        setName(draft.name); setStep("review");
      }
    } catch { /* Storage is optional; verified account details remain available. */ }
  }, [signedIn, review, initialEmail]);
  useEffect(() => {
    if (resendAfter <= 0) return;
    const timer = setTimeout(() => setResendAfter(v => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendAfter]);
  async function checkout() {
    setBusy(true); setError("");
    try {
      const saved = await fetch("/api/account/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, plan }) });
      const result = await saved.json();
      if (!saved.ok) throw Error(result.error);
      const payment = await fetch("/api/account/checkout", { method: "POST" });
      const data = await payment.json();
      if (!payment.ok) throw Error(data.error);
      try { sessionStorage.removeItem("signup-details"); } catch {}
      location.assign(data.url);
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); setBusy(false); }
  }
  async function verifyEmail() {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/account/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, plan, token, returnTo }) });
      const data = await r.json();
      if (!r.ok) throw Error(data.error);
      setResendAfter(60); setStep("sent");
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); setToken(""); setReset(v => v + 1); }
  }
  return <>
    <ol className={styles.steps} aria-label="Purchase progress">
      <li aria-current={step !== "review" ? "step" : undefined}><span>1</span>Your details</li>
      <li aria-current={step === "review" ? "step" : undefined}><span>2</span>Review purchase</li>
      <li><span>3</span>Stripe Checkout</li>
    </ol>
    <div className={styles.layout}>
      <section className={styles.form}>
        <p className={styles.eyebrow}>{step === "details" ? "A little more time for you" : "Your next step"}</p>
        <h1 ref={heading} tabIndex={-1}>{step === "details" ? "Make room for your day." : step === "sent" ? "Check your email." : "Everything look good?"}</h1>
        <p className={styles.intro}>{step === "details" ? "Just your name and email to get started. You’ll set up your business after your purchase." : step === "sent" ? `We sent a secure sign-in link to ${email}. Click the link to verify your email and return to purchase review.` : "Review your plan, then complete your payment securely with Stripe."}</p>
        {step === "details" && <form onSubmit={e => { e.preventDefault(); setError(""); try { sessionStorage.setItem("signup-details", JSON.stringify({ name, email })); } catch {} if (verified) setStep("review"); else void verifyEmail(); }}>
          <label className={styles.label}>Your name<input autoComplete="name" name="name" required maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder="Full name" pattern=".*\S.*" /></label>
          <label className={styles.label}>Email address<input autoComplete="email" name="email" type="email" required maxLength={254} value={email} readOnly={verified} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>
          <p className={styles.note}>{verified ? "Your verified account email. Your receipt will go here." : "No password needed. We’ll email you a secure sign-in link."}</p>
          {!verified && <div className={styles.verification}>{siteKey ? <HumanCheck siteKey={siteKey} onToken={setToken} reset={reset} /> : <p role="status">Email verification is not available in this preview yet.</p>}</div>}
          <button className={styles.primary} type="submit" disabled={busy || (!verified && (!token || resendAfter > 0))}>{busy ? "Sending your link…" : verified ? "Review purchase →" : resendAfter > 0 ? `Send another link in ${resendAfter}s` : "Email me a sign-in link →"}</button>
        </form>}
        {step === "review" && <>
          <div className={styles.identity}><div><strong>{name}</strong><span>{email}</span></div><button type="button" className={styles.textButton} disabled={busy} onClick={() => { setError(""); setStep("details"); }}>Edit details</button></div>
          <div className={styles.next}><span aria-hidden="true">↗</span><div><strong>Your business setup comes next.</strong><p>After payment, your dashboard will guide you through business details, opening hours, and your team.</p></div></div>
          <button className={styles.primary} disabled={busy || !verified} onClick={checkout}>{busy ? "Opening Stripe…" : "Continue to payment →"}</button>
          <p className={styles.note}>You’ll complete payment securely with Stripe. Review the final total there before paying. Nothing is charged on this page.</p>
        </>}
        {step === "sent" && <div className={styles.next}>
          <span aria-hidden="true">✉</span>
          <div><strong>Your {p.name} plan is saved.</strong>
            <p>Open the email and click the sign-in link in the same browser. You’ll review your purchase before continuing to Stripe. No payment has been taken.</p>
            <p>Check your spam folder if the email hasn’t arrived.</p>
            <button type="button" className={styles.textButton} onClick={() => { setError(""); setStep("details"); }}>Change email or request another link</button>
          </div>
        </div>}
        {error && <p className={styles.error} role="alert">{error} <Link href="/account">Open dashboard</Link></p>}
      </section>
      <aside className={styles.summary} aria-label="Purchase summary">
        <div className={styles.summaryTop}><span className={styles.eyebrow}>Your selected plan</span><Link href={returnTo}>Change</Link></div>
        <h2>{p.name}</h2><p className={styles.price}>${p.monthly}<span>/ month</span></p>
        <ul className={styles.features}><li>{p.minutes.toLocaleString()} call minutes each month</li><li>Up to {p.teamLimit} bookable team members</li><li>Branded online booking page</li><li>AI confirmation calls and call summaries</li></ul>
        <div className={styles.breakdown}>
          <div><span>First month</span><strong>${p.monthly}</strong></div>
          <div><span>One-time setup</span><strong>${setupCents(plan) / 100}</strong></div>
          <div className={styles.total}><span>First payment · before tax</span><strong>${(p.monthly + setupCents(plan) / 100).toLocaleString()}</strong></div>
        </div>
        <p className={styles.note}>Then ${p.monthly}/month. Setup does not repeat. USD. Extra minutes are $0.49 each, only within a spending limit you choose. Unused minutes expire at renewal. One business location.</p>
        <div className={styles.secure}>Payment handled by Stripe</div>
      </aside>
    </div>
  </>;
}
