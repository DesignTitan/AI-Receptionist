import "../(marketing)/brand-fonts.css";
import "./holding.css";
import { NavMascot } from "@/components/marketing/nav-mascot";

/**
 * The holding site: the homepage hero and nothing else. No navigation, no
 * actions, one logo. Served at /coming-soon, and at / when COMING_SOON=true.
 */
export default function HoldingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rc hold">
      <header className="hold-nav">
        <NavMascot />
      </header>
      {children}
    </div>
  );
}
