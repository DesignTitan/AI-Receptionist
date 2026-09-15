import type { Metadata } from "next";
import { FoundingRate } from "@/components/holding/founding-rate";

export const metadata: Metadata = {
  title: { absolute: "bubs · Your AI receptionist. Your day back." },
  description: "Online booking, AI confirmation calls and one place to follow up, for businesses that run on appointments. Coming soon. Join the list to keep the founding rate.",
  robots: { index: true, follow: false },
};

export default function ComingSoonPage() {
  // The offer only shows once Klaviyo is connected; a button that cannot save a signup is worse than no button.
  const waitlistReady = Boolean(process.env.KLAVIYO_PRIVATE_API_KEY && process.env.KLAVIYO_LIST_ID);
  return (
    <main id="main" className="hold-hero" aria-labelledby="hero-title">
      <img className="hold-hero__image" src="/marketing/coastal-owner.png" width={1254} height={1254} fetchPriority="high" alt="A business owner enjoying a quiet coffee by the sea, with her phone set aside." />
      <div className="hold-hero__copy">
        <p className="hold-pill"><span aria-hidden="true" />Coming soon</p>
        <p className="hold-kicker">For businesses that run on appointments</p>
        <h1 id="hero-title">Your AI receptionist.<br />Your day back.</h1>
        <p className="hold-lede">Let customers book online. Let AI make the confirmation calls. See what needs your attention, so you can get back to the people and work that matter.</p>
        {waitlistReady && <FoundingRate turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null} />}
      </div>
    </main>
  );
}
