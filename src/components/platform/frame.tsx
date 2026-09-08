import Link from "next/link";
import { ProductLogo } from "@/components/marketing/product-chrome";
import "./platform.css";
export function Frame({
  children,
  eyebrow,
  title,
  description,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="platform">
      <header className="platform-header">
        <ProductLogo />
        <nav aria-label="Account">
          <Link href="/demos">Explore demos</Link>
          <Link href="/account">Your front desk ↗</Link>
        </nav>
      </header>
      <main id="main" className="platform-main">
        <div className="platform-heading">
          <p className="platform-kicker">{eyebrow}</p>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {children}
      </main>
      <footer className="platform-footer">
        <span>AI Receptionist · A little more room in your day.</span>
        <Link href="/">Back to the site</Link>
      </footer>
    </div>
  );
}
