import "./brand-fonts.css";
import "./receptionist.css";
import "./marketing-shell.css";
import { AnimateOnScroll } from "@/components/marketing/animate-on-scroll";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { env, isLiveCallReady } from "@/lib/env";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const simulated = !isLiveCallReady();
  return (
    <div className="rc marketing-shell" id="marketing-top">
      <AnimateOnScroll />
      <SiteNav cta={simulated ? "Ask for a call" : "Have it call you"} simulated={simulated} turnstileSiteKey={env.turnstile.siteKey ?? null} />
      <div className="marketing-content">{children}</div>
      <SiteFooter />
    </div>
  );
}
