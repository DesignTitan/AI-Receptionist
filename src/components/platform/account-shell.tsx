"use client";

import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { RemoteAction } from "./remote-action";
import "@/app/(marketing)/brand-fonts.css";
import "@/app/(marketing)/receptionist.css";
import "@/app/(marketing)/marketing-shell.css";
import "../brand/brand.css";
import styles from "./account-shell.module.css";

export function AccountShell({ children, billingAvailable = true, name = "", preview = false, darkHero = false }: {
  children: React.ReactNode; billingAvailable?: boolean; name?: string; preview?: boolean; darkHero?: boolean;
}) {
  return <div className={`brand-surface ${styles.shell}`} data-dark-hero={darkHero}>
    <div className={`rc marketing-shell ${styles.navigation}`}>
      <SiteNav cta="Let’s talk" simulated turnstileSiteKey={null} showCall={false} helpHref="/#hear"
        applicationLinks={<><p>Your account</p>
            <Link href={preview ? "/account?preview=confirmation" : "/account"}>Overview</Link>
            <Link href={preview ? "/account/settings?preview=settings" : "/account/settings"}>Account settings</Link>
            <Link href={`${preview ? "/account/settings?preview=settings" : "/account/settings"}#business-details`}>Business details</Link>
            <Link href={`${preview ? "/account/settings?preview=settings" : "/account/settings"}#hours-availability`}>Hours & availability</Link>
            {billingAvailable && <RemoteAction url="/api/account/billing" label="Billing" className={styles.navAction} />}
            <Link href={preview?"/account/login?preview=settings":"/account/security"}>Sign-in &amp; security</Link>
            <Link href="/#hear">Get help</Link>
            <div className={styles.legal}><Link href="/legal#privacy">Privacy</Link><Link href="/legal#terms">Terms</Link><Link href="/#hear">Contact</Link></div>
            <Link href="/">Back to the site</Link>
        </>}
        accountOptions={<>
          {name && <span className={styles.person}>{name}</span>}
          <Link href={preview ? "/account/settings?preview=settings" : "/account/settings"}>Account settings</Link>
          <RemoteAction url="/api/account/session" method="DELETE" label="Sign out" className={styles.navAction} />
        </>}
      />
    </div>
    <main id="main" className={styles.main}>{children}</main>
  </div>;
}
