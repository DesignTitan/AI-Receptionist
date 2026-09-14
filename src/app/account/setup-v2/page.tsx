import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountShell } from "@/components/platform/account-shell";
import { SetupConversation } from "@/components/platform/setup-v2/setup-conversation";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

/**
 * Version 2 of business setup, built for side-by-side comparison with the
 * current form. Dev-only until a decision is made; it saves to this browser
 * and never to a customer record.
 */
export default function SetupV2() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <AccountShell preview name="Bubs" billingAvailable={false}>
    <main id="main" className={styles.page}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>Version 2 · experiment</p>
        <h1>Set up by talking to Bubs.</h1>
        <p>Answer a few questions and your front desk fills itself in. Same fields as the current setup, different way in. <Link href="/account?preview=confirmation">Open the current version</Link> to compare.</p>
      </header>
      <SetupConversation />
    </main>
  </AccountShell>;
}
