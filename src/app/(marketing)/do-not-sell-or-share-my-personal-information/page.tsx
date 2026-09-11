import type { Metadata } from "next";
import styles from "../legal/page.module.css";

export const metadata: Metadata = {
  title: "Do not sell or share my personal information — draft",
  robots: { index: false, follow: false },
};

export default function PrivacyOptOutPage() {
  return <main className={styles.page}>
    <a className={styles.back} href="/#colophon">← Back to the website</a>
    <header>
      <span className={styles.badge}>Temporary · pending legal review</span>
      <h1>Do not sell or share my personal information.</h1>
      <p>This page is reserved for sale/sharing opt-outs and cookie preferences. The wording and controls are being prepared for legal and operational review.</p>
    </header>
    <section aria-labelledby="preferences-title">
      <h2 id="preferences-title">Your privacy preferences</h2>
      <p>The preference controls are not active yet. Visiting this page does not submit an opt-out request, change cookies or save a privacy choice.</p>
      <button className={styles.pendingControl} type="button" disabled aria-describedby="preferences-pending">Manage privacy &amp; cookie preferences</button>
      <p id="preferences-pending"><small>Coming soon. A working request process and applicable browser privacy-signal handling must be connected before launch.</small></p>
    </section>
    <nav className={styles.index} aria-label="Related privacy information">
      <a href="/legal#privacy">Privacy notice · draft</a>
      <a href="/legal#cookies">Cookie notice · draft</a>
      <a href="/legal#privacy-choices">Other privacy choices · draft</a>
    </nav>
    <p className={styles.note}>This placeholder does not assert whether personal information is sold or shared. That determination and the final opt-out process require review of the service’s actual data practices.</p>
  </main>;
}
