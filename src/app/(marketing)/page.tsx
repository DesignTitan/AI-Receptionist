import { HappyPawsFilm } from "@/components/marketing/happy-paws-film";
import { IndustryGallery } from "@/components/marketing/industry-gallery";
import { VoiceDemoTrigger } from "@/components/marketing/voice-example";
import { BusySection } from "@/components/marketing/busy-section";
import { OverviewBenefits } from "@/components/marketing/overview-benefits";
import { PLANS as PRICING, planFeatures, PILOT_SETUP_CENTS, SETUP_CENTS, SETUP_OFFER, SETUP_SCOPE, type Plan } from "@/lib/platform/pricing";
import type { Metadata } from "next";
import { Folio } from "@/components/marketing/folio";
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

const CHAPTERS = [
  { id: "desk", n: "01", title: "The front desk" },
  { id: "cost", n: "02", title: "When you’re busy" },
  { id: "turn", n: "03", title: "Your day back" },
  { id: "features", n: "04", title: "Core features" },
  { id: "proof", n: "05", title: "Proof" },
  { id: "industries", n: "06", title: "Your industry" },
  { id: "hear", n: "07", title: "Hear it yourself" },
  { id: "terms", n: "08", title: "Terms" },
  { id: "colophon", n: "09", title: "Colophon" },
];

const PLANS = (Object.entries(PRICING) as [Plan,typeof PRICING[Plan]][]).map(([id,p])=>({
 name:p.name,price:`$${p.monthly}`,calls:`${p.minutes.toLocaleString()} minutes a month · estimated ${p.estimatedCalls} two-minute calls`,firstPilot:p.monthly+PILOT_SETUP_CENTS/100,firstStandard:p.monthly+SETUP_CENTS/100,who:p.who,cta:'Start here',featured:id==='busy',has:planFeatures(id)
}));

export default function HomePage() {
  // Live only with a voice line AND the human check; otherwise the plate takes a callback request.
  const simulated = !isLiveCallReady();
  return (
    <ScrollCraftMount>
      <Folio chapters={simulated ? CHAPTERS.map((c) => (c.id === "hear" ? { ...c, title: "Ask for a call" } : c)) : CHAPTERS} />

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
              <img className="rc-overview__mascot" src="/marketing/receptionist-mascot.png" width={1024} height={1024} alt="" />{' '}
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
        <section id="hear" data-sc-act="pin" data-sc-span="3">
          <div data-sc-stage className="rc-plate">
            <div data-sc-cue="0 0.97 0" style={{ width: "min(44rem, 100%)" }}>
              <div className="rc-plate__head sc-stack">
                <h2 className="sc-display sc-display--lg">{simulated ? "Ask for a call." : "Hear it yourself."}</h2>
                <p className="sc-lede">{simulated ? "Leave your name and number. A person calls you back." : "Type your name and number. It calls you, now."}</p>
              </div>
              <TryCallPlate simulated={simulated} turnstileSiteKey={env.turnstile.siteKey ?? null} />
            </div>
          </div>
        </section>

        {/* 07 · Terms. Compressed: information, not experience. */}
        <section id="terms" className="rc-chapter" data-sc-act="flow">
          <div className="sc-wrap">
            <div className="sc-stack" data-sc-in data-sc-stagger="60">
              <h2 className="sc-display sc-display--lg">How it works, and what it costs.</h2>
              <ol className="rc-steps">
                <li><span><strong>Your team, your hours, your page.</strong>We prepare the booking page in your name and colours, then test the setup with you before activation.</span></li>
                <li><span><strong>They book, it calls.</strong>Bookings queue a confirmation call while your allowance and spending limit permit. Cancellation and reschedule requests are flagged for your team.</span></li>
                <li><span><strong>You see everything.</strong>Review outcomes and available recordings, transcripts and summaries in your dashboard. A no-answer is flagged for a person.</span></li>
              </ol>
              <div className="rc-plans">
                {PLANS.map((plan, index) => (
                  <article key={plan.name} className={plan.featured ? "rc-plan rc-plan--on" : "rc-plan"}>
                    {plan.featured && <p className="rc-plan__flag">More room to grow</p>}
                    <p className="rc-plan__name">{plan.name}</p>
                    <p className="rc-plan__price"><b>{plan.price}</b><span>/month</span></p>
                    <p className="rc-plan__calls">{plan.calls}</p>
                    <p className="rc-plan__who">{plan.who}</p>
                    <p className="rc-plan__who">First month + setup: <b>${plan.firstPilot.toLocaleString()}</b> if pilot pricing is available; <b>${plan.firstStandard.toLocaleString()}</b> standard. Before tax.</p>
                    <a className="rc-plan__cta" href={`/start?plan=${["front", "busy", "full"][index]}`}>{plan.cta}</a>
                    <ul className="rc-plan__list">
                      {plan.has.map((line) => (
                        <li key={line}>
                          <svg viewBox="0 0 20 20" aria-hidden><path d="M5 10.5l3.2 3.2L15 7" /></svg>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              <p className="rc-plans__note">
                <b>{SETUP_OFFER}</b> Setup is paid once. {SETUP_SCOPE}
              </p>
              <p className="rc-plans__note">
                Call counts are estimates; your allowance is measured in minutes, rounded up separately for each call. Extra minutes are 49 cents each, only within a spending limit you choose. Extra spending starts at $0. Setup does not repeat on renewal. Unused minutes expire at renewal. Each plan includes one business location; calendar sync and multiple locations are not included. Month to month — leave whenever you like.
              </p>
              <p className="sc-body" style={{ marginTop: "var(--sc-6)" }}>
                Calendar and booking-software connections are on the roadmap. <a href="/features#coming-soon">Vote for what you need next.</a>
              </p>
            </div>
          </div>
        </section>

        {/* 08 · Colophon. The last act holds. */}
        <section id="colophon" data-sc-act="pin" data-sc-span="1.15">
          <div data-sc-stage className="rc-colophon">
            <div className="rc-colophon__inner" data-sc-cue="0 1 0 0">
              <p className="rc-run">
                <a href="#hear">{simulated ? "Ask for a call" : "Have it call you"}</a>. Or <a href="/demos">open one of the three demos</a> and book something.
              </p>
              <hr className="rc-hair" />
              <p>{PRODUCT_NAME}. A booking page and an AI front desk for businesses that run on appointments.</p>
              <footer>
                <a href="/features">Features &amp; benefits</a>
                <a href="/features#coming-soon">Coming soon</a>
                <a href="/account">Owner sign in</a>
                <span>The three demo businesses are fictional.</span>
                <span>© {new Date().getFullYear()}</span>
              </footer>
            </div>
          </div>
        </section>
      </main>
    </ScrollCraftMount>
  );
}
