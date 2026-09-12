"use client";
import { BusinessSetupForm } from "./business-setup-form";
import type { Customer } from "@/lib/platform/model";
import Link from "next/link";
import Image from "next/image";
import { AccountShell } from "./account-shell";
import { RemoteAction } from "./remote-action";


import styles from "./purchase-welcome.module.css";

export function PurchaseWelcome({ name, state, test = false, preview = false, customer }: {
  name: string;
  state: "paid" | "pending" | "billing"; test?: boolean; preview?: boolean; customer?: Customer;
}) {
  const paid = state === "paid";
  const firstName = name.trim().split(/\s+/)[0]?.slice(0,40);
  return <AccountShell darkHero preview={preview} name={name} billingAvailable={state !== "pending" && !preview}>
    <div className={styles.hero}>
    <div className={styles.welcomeCopy}>
    <header className={styles.heading}>
      <span className={styles.badge}>{paid ? <><span aria-hidden="true">✓</span> Payment confirmed</> : state === "billing" ? "Billing needs attention" : "Your purchase"}</span>
      {test && <span className={styles.test}>Sandbox · No real charge</span>}
      <div className={styles.headingRow}><h1>{paid ? `Welcome${firstName ? `, ${firstName}` : ""}` : state === "billing" ? "Let’s check your billing." : "You’re almost there."}</h1></div>
      {!paid && <p>{state === "billing" ? "Review your billing to continue setting up your business." : "Complete payment to start setup. If you’ve just paid, your confirmation may take a moment."}</p>}
    </header>
    <section className={styles.setup} aria-labelledby="setup-title">
      <div className={styles.setupCopy}>
        <h2 id="setup-title">{paid ? "Let’s set up your business." : "Your next step"}</h2>
        <p>{paid ? "Add your business details, booking hours and call preferences. We’ll guide you through the rest." : "Your selected plan is saved. Business setup opens after payment is confirmed."}</p>
        {!paid && <div className={styles.pendingActions}><RemoteAction url={state === "billing" ? "/api/account/billing" : "/api/account/checkout"} label={state === "billing" ? "Review billing →" : "Continue to payment →"} className={styles.primary}/><Link href="/account" className={styles.receiptLink}>Refresh payment status</Link></div>}
      </div>
    </section>
    </div>
    <div className={styles.character} aria-hidden="true"><Image src="/marketing/happy-mascot-pointed.png" alt="" width={360} height={360} sizes="(max-width:600px) 180px, (max-width:850px) 240px, 360px" loading="eager"/></div>
    </div>
    {paid && <div className={styles.onboarding}><BusinessSetupForm customer={customer??null} plan={customer?.plan??"busy"} preview={preview} embedded /></div>}
  </AccountShell>;
}
