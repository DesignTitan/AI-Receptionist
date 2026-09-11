import Link from "next/link";
import { NavMascot } from "@/components/marketing/nav-mascot";
import { RemoteAction } from "./remote-action";
import "../brand/brand.css";
import styles from "./account-shell.module.css";

export function AccountShell({ children, billingAvailable = true }: {
  children: React.ReactNode; billingAvailable?: boolean;
}) {
  return <div className={`brand-surface ${styles.shell}`}>
    <header className={styles.header}>
      <nav className={styles.left} aria-label="Your account">
        <Link href="/account">Overview</Link>
        {billingAvailable && <RemoteAction url="/api/account/billing" label="Billing" className={styles.navAction} />}
      </nav>
      <div className={styles.mascot}><NavMascot /></div>
      <div className={styles.right}>
        <Link href="/#hear" className={styles.help}>Get help</Link>
        <details className={styles.profile}>
          <summary aria-label="Account menu"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20v-1.5a6.5 6.5 0 0 1 13 0V20z"/></svg></summary>
          <div className={styles.menu}><Link href="/">Back to the site</Link><RemoteAction url="/api/account/session" method="DELETE" label="Sign out" className={styles.navAction} /></div>
        </details>
      </div>
    </header>
    <main id="main" className={styles.main}>{children}</main>
    <footer className={styles.footer}><Link className={styles.wordmark} href="/">AI Receptionist</Link><nav aria-label="Legal and support"><Link href="/legal#privacy">Privacy</Link><Link href="/legal#terms">Terms</Link><Link href="/#hear">Contact</Link></nav></footer>
  </div>;
}
