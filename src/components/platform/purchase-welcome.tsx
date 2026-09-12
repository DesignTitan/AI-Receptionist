import Link from "next/link";
import { AccountShell } from "./account-shell";
import { RemoteAction } from "./remote-action";


import styles from "./purchase-welcome.module.css";

export function PurchaseWelcome({ name, state, test = false, preview = false }: {
  name: string;
  state: "paid" | "pending" | "billing"; test?: boolean; preview?: boolean;
}) {
  const paid = state === "paid";
  const firstName = name.trim().split(/\s+/)[0]?.slice(0,40);
  return <AccountShell preview={preview} name={name} billingAvailable={state !== "pending" && !preview}>
    <header className={styles.heading}>
      <span className={styles.badge}>{paid ? <><span aria-hidden="true">✓</span> Payment confirmed</> : state === "billing" ? "Billing needs attention" : "Your purchase"}</span>
      {test && <span className={styles.test}>Sandbox · No real charge</span>}
      <h1>{paid ? `Welcome${firstName ? `, ${firstName}` : ""}` : state === "billing" ? "Let’s check your billing." : "You’re almost there."}</h1>
      {!paid && <p>{state === "billing" ? "Review your billing to continue setting up your business." : "Complete payment to start setup. If you’ve just paid, your confirmation may take a moment."}</p>}
    </header>
    <section className={styles.setup} aria-labelledby="setup-title">
      <div className={styles.setupCopy}>
        <h2 id="setup-title">{paid ? "Let’s set up your business." : "Your next step"}</h2>
        <p>{paid ? "Add your business details, opening hours and team. We’ll guide you through the rest." : "Your selected plan is saved. Business setup opens after payment is confirmed."}</p>
        {paid && <ol className={styles.steps} aria-label="Business setup steps">
          <li><span>1</span>Business details</li><li><span>2</span>Hours & team</li><li><span>3</span>Review & setup</li>
        </ol>}
        {paid ? <Link className={styles.primary} href={preview?"/account/setup?preview=setup":"/account/setup"}>Set up your business <span aria-hidden="true">→</span></Link> : <div className={styles.pendingActions}><RemoteAction url={state === "billing" ? "/api/account/billing" : "/api/account/checkout"} label={state === "billing" ? "Review billing →" : "Continue to payment →"} className={styles.primary}/><Link href="/account" className={styles.receiptLink}>Refresh payment status</Link></div>}
      </div>
      <div className={styles.character} aria-hidden="true"><img src="/marketing/happy-mascot-pointed.png" alt="" width="280" height="280"/><span/></div>
    </section>
    <aside className={styles.support}><span className={styles.supportIcon} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11.5a8 8 0 0 1-8 8 9 9 0 0 1-3.4-.7L4 20l1.2-4.6a8 8 0 1 1 14.8-3.9Z"/></svg></span><div><h2>Need a hand getting started?</h2><p>We’re here to help you set things up.</p></div><Link href="/#hear">Get help</Link></aside>
  </AccountShell>;
}
