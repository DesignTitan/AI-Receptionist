import Link from "next/link";
import { AccountShell } from "./account-shell";
import { RemoteAction } from "./remote-action";
import { PLANS, type Plan } from "@/lib/platform/pricing";
import { money, type PurchaseReceipt } from "@/lib/platform/purchase-receipt";
import styles from "./purchase-welcome.module.css";

export function PurchaseWelcome({ name, plan, receipt, state, test = false, preview = false }: {
  name: string; plan: Plan; receipt: PurchaseReceipt | null;
  state: "paid" | "pending" | "billing"; test?: boolean; preview?: boolean;
}) {
  const paid = state === "paid";
  const firstName = name.trim().split(/\s+/)[0]?.slice(0,40);
  return <AccountShell billingAvailable={state !== "pending" && !preview}>
    {preview && <p className={styles.preview}>Design preview · Example payment details. <Link href="/account/login">Sign in to your account</Link> or <Link href="/__dev/pages">return to Page Index</Link>.</p>}
    <header className={styles.heading}>
      <span className={styles.badge}>{paid ? <><span aria-hidden="true">✓</span> Payment confirmed</> : state === "billing" ? "Billing needs attention" : "Your purchase"}</span>
      {test && <span className={styles.test}>Sandbox · No real charge</span>}
      <h1>{paid ? `Welcome aboard${firstName ? `, ${firstName}` : ""}.` : state === "billing" ? "Let’s check your billing." : "You’re almost there."}</h1>
      <p>{paid ? `Your ${PLANS[plan].name} plan is ready. Let’s make it yours.` : state === "billing" ? "Review your billing to continue setting up your business." : "Complete payment to start setup. If you’ve just paid, your confirmation may take a moment."}</p>
    </header>
    <section className={styles.setup} aria-labelledby="setup-title">
      <div className={styles.setupCopy}>
        <h2 id="setup-title">{paid ? "Let’s set up your business." : "Your next step"}</h2>
        <p>{paid ? "Add your business details, opening hours and team. We’ll guide you through the rest." : "Your selected plan is saved. Business setup opens after payment is confirmed."}</p>
        {paid && <ol className={styles.steps} aria-label="Business setup steps">
          <li><span>1</span>Business details</li><li><span>2</span>Hours & team</li><li><span>3</span>Review & setup</li>
        </ol>}
        {paid ? <Link className={styles.primary} href="/account/setup">Set up your business <span aria-hidden="true">→</span></Link> : <div className={styles.pendingActions}><RemoteAction url={state === "billing" ? "/api/account/billing" : "/api/account/checkout"} label={state === "billing" ? "Review billing →" : "Continue to payment →"} className={styles.primary}/><Link href="/account" className={styles.receiptLink}>Refresh payment status</Link></div>}
      </div>
      <div className={styles.character} aria-hidden="true"><img src="/marketing/happy-pillow-mascot.png" alt="" width="280" height="280"/><span/></div>
    </section>
    {paid && <section className={styles.receipt} aria-labelledby="receipt-title">
      <div><h2 id="receipt-title">Your purchase</h2><p>{PLANS[plan].name} · Monthly</p>{receipt && <small>{new Date(receipt.paidAt).toLocaleDateString("en-US", {year:"numeric", month:"short", day:"numeric",timeZone:"UTC"})} · {receipt.number}</small>}</div>
      {receipt ? <dl className={styles.breakdown}>{receipt.rows.map((row,i)=><div key={i}><dt>{row.label}</dt><dd>{money(row.cents,receipt.currency)}</dd></div>)}<div className={styles.total}><dt>Total paid</dt><dd>{money(receipt.amountPaid,receipt.currency)}</dd></div></dl> : <p className={styles.receiptNote}>Your payment is confirmed. Your receipt details are temporarily unavailable. <Link className={styles.receiptLink} href="/account">Try again</Link>.</p>}
      <div className={styles.receiptActions}>{receipt?.url && <a className={styles.receiptLink} href={receipt.url} target="_blank" rel="noopener noreferrer">View receipt <span aria-hidden="true">↗</span></a>}<p>Then {money(PLANS[plan].monthly*100)} / month.<br/>Setup is paid once.</p><small>Plus applicable tax and any extra minutes you enable.</small></div>
    </section>}
    <aside className={styles.support}><span className={styles.supportIcon} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11.5a8 8 0 0 1-8 8 9 9 0 0 1-3.4-.7L4 20l1.2-4.6a8 8 0 1 1 14.8-3.9Z"/></svg></span><div><h2>Need a hand getting started?</h2><p>We’re here to help you set things up.</p></div><Link href="/#hear">Get help</Link></aside>
  </AccountShell>;
}
