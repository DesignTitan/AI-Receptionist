import Link from "next/link";
import "@/components/brand/brand.css";
import styles from "./auth.module.css";
export function AuthShell({
  children,
  wide = false,
  preview = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
  preview?: boolean;
}) {
  return (
    <div className={`brand-surface ${styles.page}`}>
      {preview && (
        <div className={styles.preview}>
          Design preview · Example account. No security changes are made.
        </div>
      )}
      <header className={styles.header}>
        <Link href="/">← Back to site</Link>
        <Link className={styles.brand} href="/">
          <img
            src="/marketing/happy-mascot-pointed.png"
            width="36"
            height="36"
            alt=""
          />
          AI Receptionist
        </Link>
        <Link href="/#hear">Get help</Link>
      </header>
      <main id="main" className={`${styles.main} ${wide ? styles.wide : ""}`}>
        <div className={styles.content}>{children}</div>
        <aside className={styles.aside}>
          <img
            src="/marketing/happy-mascot-pointed.png"
            width="320"
            height="320"
            alt="Our smiling green receptionist mascot"
          />
          <h2>A little more time for you.</h2>
          <p>
            Your business, your bookings, your front desk. All in one welcoming
            place.
          </p>
        </aside>
      </main>
      <footer className={styles.footer}>
        <span>A little more time for what matters.</span>
        <nav aria-label="Legal">
          <Link href="/legal#privacy">Privacy</Link>
          <Link href="/legal#terms">Terms</Link>
          <Link href="/#hear">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}
