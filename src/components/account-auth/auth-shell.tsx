import Link from "next/link";
import "@/components/brand/brand.css";
import styles from "./auth.module.css";
export function AuthShell({
  children,
  wide = false,
  preview = false,
  landing = false,
  signup = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
  preview?: boolean;
  landing?: boolean;
  signup?: boolean;
}) {
  if (landing) return (
    <div className={`brand-surface ${styles.page} ${styles.landing}`}>
      {preview && <div className={styles.preview}>Design preview · Example account. No security changes are made.</div>}
      <main id="main" className={`${styles.landingMain} ${signup ? styles.signupLayout : ""}`}>
        <section className={styles.landingLeft} aria-label={signup ? "Sign up" : "Log in"}>
          <nav className={styles.landingBack} aria-label="Return to website"><Link href="/">← Back to the site</Link></nav>
          <div key={signup ? "signup" : "login"} className={`${styles.content} ${styles.landingForm}`}>
            <Link href="/" className={`${styles.brand} ${styles.landingBrand}`}><img src="/marketing/happy-mascot-pointed.png" width="36" height="36" alt=""/>bubs</Link>
            {children}
          </div>
            <nav className={styles.landingFooter} aria-label="Account support and legal"><Link href="/legal#privacy">Privacy</Link><Link href="/legal#terms">Terms</Link><Link href="/#hear">Get help</Link></nav>
        </section>
        <aside className={styles.landingPhoto} aria-label="More time for your business">
          <img className={styles.loginPortrait} aria-hidden={signup} src="/marketing/owner-review.webp" width="2048" height="2048" fetchPriority="high" alt="A salon owner checking her bookings at the front desk"/>
          <img className={styles.signupPortrait} aria-hidden={!signup} src="/marketing/full-attention.webp" width="2048" height="2048" alt="A stylist giving a client her full attention"/>
        </aside>
      </main>
    </div>
  );
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
          bubs
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
