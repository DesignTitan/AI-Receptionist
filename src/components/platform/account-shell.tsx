"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { NavMascot } from "@/components/marketing/nav-mascot";
import { RemoteAction } from "./remote-action";
import "../brand/brand.css";
import styles from "./account-shell.module.css";

export function AccountShell({ children, billingAvailable = true, name = "" }: {
  children: React.ReactNode; billingAvailable?: boolean; name?: string;
}) {
  const header = useRef<HTMLElement>(null);
  const initials = name.trim().split(/\s+/).filter(Boolean).map(part => part[0]).slice(0,2).join("").toUpperCase();
  useEffect(() => {
    const close = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      for (const menu of header.current?.querySelectorAll("details[open]") ?? []) {
        if (event instanceof KeyboardEvent || !menu.contains(event.target as Node)) {
          menu.removeAttribute("open");
          if (event instanceof KeyboardEvent) menu.querySelector("summary")?.focus();
        }
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", close); };
  }, []);
  return <div className={`brand-surface ${styles.shell}`}>
    <header ref={header} className={styles.header}>
      <div className={styles.mascot}><NavMascot /></div>
      <div className={styles.right}>
        <details className={styles.navigation}>
          <summary aria-label="Application menu"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></summary>
          <nav className={styles.menu} aria-label="Application navigation" onClick={event => { if ((event.target as HTMLElement).closest("a")) event.currentTarget.closest("details")?.removeAttribute("open"); }}>
            <Link href="/account">Overview</Link>
            {billingAvailable && <RemoteAction url="/api/account/billing" label="Billing" className={styles.navAction} />}
            <Link href="/#hear">Get help</Link>
            <div className={styles.legal}><Link href="/legal#privacy">Privacy</Link><Link href="/legal#terms">Terms</Link><Link href="/#hear">Contact</Link></div>
            <Link href="/">Back to the site</Link>
          </nav>
        </details>
        <details className={styles.profile}>
          <summary aria-label={name ? `Account menu for ${name}` : "Account menu"} title={name || "Your account"}>
            {initials ? <span className={styles.initials}>{initials}</span> : <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20v-1.5a6.5 6.5 0 0 1 13 0V20z"/></svg>}
          </summary>
          <div className={styles.menu}>{name && <span className={styles.person}>{name}</span>}<RemoteAction url="/api/account/session" method="DELETE" label="Sign out" className={styles.navAction} /></div>
        </details>
      </div>
    </header>
    <main id="main" className={styles.main}>{children}</main>
  </div>;
}
