import { HappyPawsFilm } from "@/components/marketing/happy-paws-film";
import { IndustryGallery } from "@/components/marketing/industry-gallery";
import { VoiceDemoTrigger } from "@/components/marketing/voice-example";
import { BusySection } from "@/components/marketing/busy-section";
import { OverviewBenefits } from "@/components/marketing/overview-benefits";
import { PricingComparison } from "@/components/marketing/pricing-comparison";
import type { Metadata } from "next";
import { PRODUCT_NAME } from "@/components/marketing/product-chrome";
import { ScrollCraftMount } from "@/components/marketing/scrollcraft-mount";
import { ScrollingFeatures } from "@/components/marketing/scrolling-features";
import { SiteNav } from "@/components/marketing/site-nav";
import { TryCallPlate } from "@/components/marketing/try-call-plate";
import { env, isLiveCallReady } from "@/lib/env";
import "./receptionist.css";

/** Rendered per request: the call plate's mode follows the environment, not the last build. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${PRODUCT_NAME} · Your AI receptionist. Your day back.` },
  description:
    "Online booking, AI confirmation calls and a clear view of what needs your attention. An AI receptionist for businesses that run on appointments.",
};

export default function HomePage() {
  // Live only with a voice line AND the human check; otherwise the plate takes a callback request.
  const simulated = !isLiveCallReady();
  return (
    <ScrollCraftMount>

      <main id="main" className="rc-v1">
        <SiteNav cta={simulated ? "Ask for a call" : "Have it call you"} simulated={simulated} turnstileSiteKey={env.turnstile.siteKey ?? null} />
        <section id="desk" className="rc-home rc-home-hero" data-sc-act="flow" aria-labelledby="hero-title">
          <img className="rc-home-hero__image" src="/marketing/coastal-owner.png" width={1254} height={1254} fetchPriority="high" alt="A business owner enjoying a quiet coffee by the sea, with her phone set aside." />
          <div className="sc-wrap rc-home-hero__copy" data-sc-in data-sc-stagger="70">
            <p className="rc-kicker">For businesses that run on appointments</p>
            <h1 id="hero-title">Your AI receptionist.<br />Your day back.</h1>
            <p>Let customers book online. Let AI make the confirmation calls. See what needs your attention, so you can get back to the people and work that matter.</p>
            <div className="rc-home-actions">
              <VoiceDemoTrigger className="rc-home-button" />
              <a className="rc-home-link" href="/features">Explore all features <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <p className="rc-home-hero__caption">Online booking. AI confirmation calls. One place to follow up.</p>
        </section>
        <section id="benefits" className="rc-chapter rc-overview" data-sc-act="flow" aria-labelledby="overview-title">
          <div className="sc-wrap">
            <p className="rc-overview__label" data-sc-in>Overview</p>
            <h2 id="overview-title" className="rc-overview__statement" data-sc-in>
              <strong>AI Receptionist</strong> brings customer bookings,{' '}
              <img className="rc-overview__mascot" src="/marketing/happy-pillow-mascot.png" width={1024} height={1024} alt="" />{' '}
              phone conversations, and appointment management together—so you can{' '}
              <strong>focus on your business</strong>{' '}
              <span className="rc-overview__booked" aria-hidden="true">Booked <span>✓</span><svg className="rc-booked-rays" viewBox="0 0 28 44" focusable="false"><path d="M5 10 13 3M9 22l12-2M7 34l10 6" /></svg></span>{' '}
              and get more of your day back.
            </h2>
            <OverviewBenefits />
            <div className="rc-overview__footer" data-sc-in>
              <a href="/features">Explore all features <span aria-hidden="true">↗</span></a>
              <p>Incoming calls and answering schedules require a tested pilot connection.</p>
            </div>
          </div>
        </section>

        <BusySection />

        <div id="how-it-works" aria-hidden="true" />
        <HappyPawsFilm />

        {/* 04 · Proof. An iris into the real dashboard, then the record. */}
        <div className="rc-textured textured-section">
          <section id="features" className="rc-features" data-sc-act="flow">
            <div className="sc-wrap">
              <ScrollingFeatures />
            </div>
          </section>

          <section id="proof" data-sc-act="pin" data-sc-span="2.6" className="rc-deckact">
            <div data-sc-stage className="rc-deckstage">
              <div className="rc-deck__head" data-sc-cue="0 1 0 0">
                <div>
                  <p className="rc-kicker">What the desk shows you</p>
                  <h2 className="sc-display sc-display--md">One desk. Every business.</h2>
                </div>
                <p className="rc-deck__lede">
                  The desk is built so you spend your time on clients, not on the phone. From the first
                  booking to the hundredth, it stays out of your way.
                </p>
              </div>
              <div className="rc-deck" aria-label="Three things the desk does">
                <article className="rc-card" style={{ "--i": 0, "--in": -1, "--next": 0.2 , "--shot": "url(/scrollcraft/04-call.jpg)"} as React.CSSProperties}>
                  <div className="rc-card__copy">
                    <p className="rc-card__eyebrow"><span aria-hidden />It calls, so nobody has to</p>
                    <h3>The confirmation call, taken care of.</h3>
                    <p>Turn on confirmation calls after online bookings. Customers confirm their appointment or ask for a change, and the outcome appears in your dashboard.</p>
                    <p className="rc-card__foot">Calling requires completed setup and available minutes.</p>
                  </div>
                  <figure className="rc-card__media">
                    <picture className="rc-card__bg" aria-hidden="true">
                      <source media="(max-width: 1024px)" srcSet="/scrollcraft/04-bg-w.jpg" width={1200} height={760} />
                      <img src="/scrollcraft/04-bg.jpg" width={820} height={964} alt="" />
                    </picture>
                    <picture className="rc-card__panel">
                      <source media="(max-width: 1024px)" srcSet="/scrollcraft/04-call-p-w.webp" width={1200} height={760} />
                      <img src="/scrollcraft/04-call-p.webp" width={820} height={964} alt="A confirmation call in progress: the client, the stages, and the first lines of what the assistant said." />
                    </picture>
                  </figure>
                </article>
                <article className="rc-card" style={{ "--i": 1, "--in": 0.2, "--next": 0.55 , "--shot": "url(/scrollcraft/04-record.jpg)"} as React.CSSProperties}>
                  <div className="rc-card__copy">
                    <p className="rc-card__eyebrow"><span aria-hidden />Every call, on the record</p>
                    <h3>Recording, transcript, summary.</h3>
                    <p>See the call outcome with available summaries and transcripts. Play recordings when the voice provider supplies them, and follow up with the details in one place.</p>
                    <p className="rc-card__foot">Email delivery requires a connected email service.</p>
                  </div>
                  <figure className="rc-card__media">
                    <picture className="rc-card__bg" aria-hidden="true">
                      <source media="(max-width: 1024px)" srcSet="/scrollcraft/04-bg-w.jpg" width={1200} height={760} />
                      <img src="/scrollcraft/04-bg.jpg" width={820} height={964} alt="" />
                    </picture>
                    <picture className="rc-card__panel">
                      <source media="(max-width: 1024px)" srcSet="/scrollcraft/04-record-p-w.webp" width={1200} height={760} />
                      <img src="/scrollcraft/04-record-p.webp" width={820} height={964} alt="A finished call record: the recording, a one-line summary, and the transcript." />
                    </picture>
                  </figure>
                </article>
                <article className="rc-card" style={{ "--i": 2, "--in": 0.55, "--next": 9 , "--shot": "url(/scrollcraft/04-flag.jpg)"} as React.CSSProperties}>
                  <div className="rc-card__copy">
                    <p className="rc-card__eyebrow"><span aria-hidden />Know what needs a person</p>
                    <h3>Every no-answer is flagged.</h3>
                    <p>A no-answer is flagged for a person. Your team arranges reschedules; a confirmed cancellation frees the slot. Open each booking to see the outcome.</p>
                    <p className="rc-card__foot">The exceptions, not the routine.</p>
                  </div>
                  <figure className="rc-card__media">
                    <picture className="rc-card__bg" aria-hidden="true">
                      <source media="(max-width: 1024px)" srcSet="/scrollcraft/04-bg-w.jpg" width={1200} height={760} />
                      <img src="/scrollcraft/04-bg.jpg" width={820} height={964} alt="" />
                    </picture>
                    <picture className="rc-card__panel">
                      <source media="(max-width: 1024px)" srcSet="/scrollcraft/04-flag-p-w.webp" width={1200} height={760} />
                      <img src="/scrollcraft/04-flag-p.webp" width={820} height={964} alt="The needs-attention list: four bookings flagged as no answer or reschedule, each with its business." />
                    </picture>
                  </figure>
                </article>
              </div>
            </div>
          </section>

          {/* 05 · Their industry. Lateral: breadth. */}
        </div>

        <IndustryGallery />


        {/* 06 · Hear it yourself. The peak, and the signature move. */}
        <section id="hear" data-sc-act="flow" className="rc-callback">
          <div className="rc-callback__layout">
            <div className="rc-callback__visual">
              <img src="/marketing/receptionist-call-pointed.webp" alt="Our mint chat-bubble receptionist floating above a modern smartphone on a sunlit desk" width={1024} height={1280} loading="lazy" />
              <div className="rc-callback__intro"><p className="rc-callback__eyebrow">A little more time for you</p><h2>Your next chapter<br />starts with a hello.</h2></div>
            </div>
            <div className="rc-callback__form">
              <div className="rc-plate__head sc-stack">
                <h2 className="sc-display sc-display--lg">{simulated ? "Let’s talk." : "Hear it for yourself."}</h2>
                <p className="sc-lede">{simulated ? "Request a real phone conversation with our sales team. Tell us when works for you, and we’ll confirm a time." : "Try a real phone call with our AI receptionist, or request a time to speak with our sales team."}</p>
              </div>
              <TryCallPlate simulated={simulated} turnstileSiteKey={env.turnstile.siteKey ?? null} />
              <p className="rc-callback__signup">Prefer to get started on your own? <a href="/start">Sign up online ↗</a></p>
            </div>
          </div>
        </section>

        {/* 07 · Terms. Compressed: information, not experience. */}
        <PricingComparison />

        {/* 08 · Colophon. The last act holds. */}
        <footer id="colophon" data-sc-act="flow" className="rc-footer">
          <div className="rc-footer__top">
            <div><p className="rc-footer__eyebrow">A little less busy. A little more you.</p><h2>Good things start<br />with a conversation.</h2></div>
            <a className="rc-footer__hello" href="#hear">Let’s talk <span aria-hidden="true">↗</span></a>
          </div>
          <div className="rc-footer__middle">
            <div className="rc-footer__brand"><img src="/marketing/happy-pillow-mascot.png" width={72} height={72} alt="" /><p>{PRODUCT_NAME}</p><span>A booking page and an AI front desk.<br />More time for the work you love.</span></div>
            <nav aria-label="Footer explore"><h3>Explore</h3><a href="/features">Features</a><a href="#industries">Industries</a><a href="#terms">Pricing</a><a href="/demos">Try a demo</a></nav>
            <nav aria-label="Footer account"><h3>Your next step</h3><a href="#hear">Ask for a call</a><a href="/start">Get started</a><a href="/account/login">Log in</a><a href="/features#coming-soon">What’s coming</a></nav>
          </div>
          <div className="rc-footer__bottom"><span>© {new Date().getFullYear()} {PRODUCT_NAME}</span><span>The three demo businesses are fictional.</span><a href="#desk">Back to top ↑</a></div>
        </footer>
      </main>
    </ScrollCraftMount>
  );
}
