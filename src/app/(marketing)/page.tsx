import { PLANS as PRICING, planFeatures, PILOT_SETUP_CENTS, SETUP_CENTS, SETUP_OFFER, SETUP_SCOPE, OVERAGE_CENTS, type Plan } from "@/lib/platform/pricing";
import type { Metadata } from "next";
import { PRODUCT_NAME } from "@/components/marketing/product-chrome";
import { ScrollCraftMount } from "@/components/marketing/scrollcraft-mount";
import { SiteNav } from "@/components/marketing/site-nav";
import { TryCallPlate } from "@/components/marketing/try-call-plate";
import { env, isLiveCallReady } from "@/lib/env";
import "./receptionist.css";

/** The demo call follows the current environment, rather than the last build. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${PRODUCT_NAME} · Your AI receptionist. Your day back.` },
  description: "Online booking, AI confirmation calls and a clear view of what needs your attention. An AI receptionist for businesses that run on appointments.",
};

const PLANS = (Object.entries(PRICING) as [Plan, typeof PRICING[Plan]][]).map(([id, p]) => ({
  id, name: p.name, price: `$${p.monthly}`,
  calls: `${p.minutes.toLocaleString()} minutes a month · estimated ${p.estimatedCalls} two-minute calls`,
  firstPilot: p.monthly + PILOT_SETUP_CENTS / 100, firstStandard: p.monthly + SETUP_CENTS / 100,
  who: p.who, cta: "Set up my business", featured: id === "busy", has: planFeatures(id).slice(0, 2),
}));

export default function HomePage() {
  const simulated = !isLiveCallReady();
  return (
    <ScrollCraftMount>
      <main id="main" className="rc-home">
        <SiteNav cta={simulated ? "Ask for a call" : "Have it call you"} simulated={simulated} turnstileSiteKey={env.turnstile.siteKey ?? null} />
        <section id="desk" className="rc-home-hero" aria-labelledby="hero-title">
          <img className="rc-home-hero__image" src="/marketing/coastal-owner.png" width={1254} height={1254} fetchPriority="high" alt="A business owner enjoying a quiet coffee by the sea, with her phone set aside." />
          <div className="sc-wrap rc-home-hero__copy">
            <p className="rc-kicker">For businesses that run on appointments</p>
            <h1 id="hero-title">Your AI receptionist.<br />Your day back.</h1>
            <p>Let customers book online. Let AI make the confirmation calls. See what needs your attention, so you can get back to the people and work that matter.</p>
            <div className="rc-home-actions">
              <a className="rc-home-button" href="/demos">See it in action <span aria-hidden="true">↗</span></a>
              <a className="rc-home-link" href="/features">Explore the features <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <p className="rc-home-hero__caption">Online booking. AI confirmation calls. One place to follow up.</p>
        </section>

        <section id="benefits" className="rc-chapter" data-sc-act="flow">
          <div className="sc-wrap">
            <div className="rc-home-heading">
              <p className="rc-kicker">Make room for the work you love</p>
              <h2 className="sc-display sc-display--lg">You built a business.<br />It shouldn’t keep you at the desk.</h2>
              <p className="sc-lede">A client in your chair. A full afternoon. A well-earned day off. Give booking and routine follow-up a place of their own.</p>
            </div>
            <div className="rc-home-benefits">
              <article><span>01 / More attention</span><h3>Stay with your customer.</h3><p>Your booking page lets the next person choose a team member and available time, without waiting for you to finish.</p></article>
              <article><span>02 / Less chasing</span><h3>Hand off the confirmation call.</h3><p>Turn on AI calls to check appointment details with customers. Confirmations and requests come back to your dashboard.</p></article>
              <article><span>03 / More breathing room</span><h3>Step away. Stay informed.</h3><p>Online booking stays open after hours. When you return, see what’s booked and which conversations need a person.</p></article>
            </div>
            <a className="rc-home-link" href="/features">See everything your receptionist can do <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section id="how-it-works" className="rc-chapter rc-dark" data-sc-act="flow">
          <div className="sc-wrap rc-home-split">
            <div className="sc-stack">
              <p className="rc-kicker">From booking to follow-up</p>
              <h2 className="sc-display sc-display--lg">A simpler day starts with a better booking.</h2>
              <p className="sc-lede">Your business on the page. Your team in the appointment book. Your choice about when AI makes a call.</p>
              <a className="rc-home-link" href="/demos">Try an online booking <span aria-hidden="true">↗</span></a>
            </div>
            <ol className="rc-home-process">
              <li><span>01</span><div><h3>Your customer books.</h3><p>They choose a team member and an available time on your branded booking page.</p></div></li>
              <li><span>02</span><div><h3>AI calls to confirm.</h3><p>When you enable confirmation calls and minutes are available, AI follows up about the appointment.</p></div></li>
              <li><span>03</span><div><h3>You see what needs you.</h3><p>Review the outcome and call summary. Your team handles unanswered calls and requests to choose a different time.</p></div></li>
            </ol>
          </div>
        </section>

        <section id="incoming" className="rc-chapter" data-sc-act="flow">
          <div className="sc-wrap rc-home-split">
            <div><p className="rc-kicker">The next chapter <span className="rc-home-badge">Incoming call pilot</span></p><h2 className="sc-display sc-display--lg">What if the next caller could book, too?</h2></div>
            <div className="sc-stack"><p className="sc-lede">We’re preparing AI phone booking for pilot businesses: callers ask for an appointment, choose an available time and agree the details in the conversation.</p><p className="sc-body">Let callers choose AI or your team. Give staff the first ring. Plan coverage for a busy afternoon or time away. Your phone connection must be reviewed and tested before these options go live.</p><a className="rc-home-link" href="/features#incoming-calls">Explore incoming call options <span aria-hidden="true">↗</span></a></div>
          </div>
        </section>

        <section id="industries" className="rc-chapter rc-home-industries" data-sc-act="flow">
          <div className="sc-wrap rc-home-split">
            <div><p className="rc-kicker">Built around appointments</p><h2 className="sc-display sc-display--md">Different businesses.<br />The same need for a little more time.</h2></div>
            <div className="sc-stack"><p className="sc-body">Salons and spas. Studios and consultants. Lessons, sessions and service appointments. Start with the way your customers book and the people who do the work.</p><p className="sc-body">Explore three fictional businesses to see the experience. We review your phone service and any existing booking software during setup.</p><a className="rc-home-link" href="/demos">Find a demo that feels like you <span aria-hidden="true">↗</span></a></div>
          </div>
        </section>

        <section id="hear" className="rc-chapter rc-home-call" data-sc-act="flow">
          <div className="sc-wrap rc-home-split">
            <div className="sc-stack"><p className="rc-kicker">Experience the conversation</p><h2 className="sc-display sc-display--lg">{simulated ? "Let’s talk about your business." : "Meet your next receptionist."}</h2><p className="sc-lede">{simulated ? "Request a callback to talk through your appointments, your phone setup and the help you need." : "Hear the AI for yourself. Enter your details to receive a demonstration call."}</p></div>
            <TryCallPlate simulated={simulated} turnstileSiteKey={env.turnstile.siteKey ?? null} />
          </div>
        </section>

        <section id="terms" className="rc-chapter" data-sc-act="flow">
          <div className="sc-wrap">
            <div className="sc-stack">
              <p className="rc-kicker">Room for your business to grow</p>
              <h2 className="sc-display sc-display--lg">The same core features.<br />The minutes your team needs.</h2>
              <p className="sc-lede">Choose a monthly allowance. See your usage. Decide whether to allow extra minutes, with a spending limit you control.</p>
              <div className="rc-plans">
                {PLANS.map((plan) => (
                  <article key={plan.name} className={plan.featured ? "rc-plan rc-plan--on" : "rc-plan"}>
                    {plan.featured && <p className="rc-plan__flag">More room to grow</p>}
                    <p className="rc-plan__name">{plan.name}</p>
                    <p className="rc-plan__price"><b>{plan.price}</b><span>/month</span></p>
                    <p className="rc-plan__calls">{plan.calls}</p>
                    <p className="rc-plan__who">{plan.who}</p>
                    <p className="rc-plan__who">First month + setup: <b>${plan.firstPilot.toLocaleString()}</b> if pilot pricing is available; <b>${plan.firstStandard.toLocaleString()}</b> standard. Before tax.</p>
                    <a className="rc-plan__cta" href={`/start?plan=${plan.id}`}>{plan.cta}</a>
                    <p className="rc-plan__who">All core booking and confirmation features included.</p>
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
                Call counts are estimates; your allowance is measured in minutes, rounded up separately for each call. Extra minutes are {OVERAGE_CENTS} cents each, only within a spending limit you choose. Extra spending starts at $0. Setup does not repeat on renewal. Unused minutes expire at renewal. Each plan includes one business location; calendar sync and multiple locations are not included. Month to month — leave whenever you like.
              </p>
            </div>
          </div>
        </section>

        <section id="questions" className="rc-chapter rc-home-questions" data-sc-act="flow">
          <div className="sc-wrap rc-home-split">
            <div><p className="rc-kicker">Before you begin</p><h2 className="sc-display sc-display--md">A few things you’ll want to know.</h2><a className="rc-home-link" href="/features#setup">More about features and setup <span aria-hidden="true">↗</span></a></div>
            <div>
              <details><summary>What can I start with?</summary><p>Start with your branded booking page, AI confirmation calls and owner dashboard through guided setup. Incoming AI phone booking and answering schedules are a pilot offering, awaiting a tested phone connection.</p></details>
              <details><summary>Will it work with the number and software I already use?</summary><p>Tell us your phone provider and booking software during setup. We check compatibility first. The current product uses its own appointment book; external calendar and booking-software sync are not included. Selecting your provider does not change your phone service.</p></details>
              <details><summary>What happens when I use my included minutes?</summary><p>Extra spending starts at $0. You can choose a monthly cap for additional minutes at {OVERAGE_CENTS} cents per minute. AI calls pause when there isn’t enough budget for another call. Online booking stays available.</p></details>
            </div>
          </div>
        </section>

        <section id="colophon" className="rc-chapter rc-dark rc-home-close">
          <div className="sc-wrap">
            <p className="rc-kicker">Your business. With room to breathe.</p>
            <h2 className="sc-display sc-display--lg">Give your next booking<br />a better beginning.</h2>
            <p className="sc-lede">Tell us how your business works. We’ll help you set up the booking page, confirmation calls and controls that fit.</p>
            <div className="rc-home-actions"><a className="rc-home-button" href="/start">Set up my business <span aria-hidden="true">↗</span></a><a className="rc-home-link" href="/features">Explore all features <span aria-hidden="true">↗</span></a></div>
            <footer className="rc-home-footer"><a href="#desk">{PRODUCT_NAME}</a><nav aria-label="Footer"><a href="/features">Features</a><a href="/demos">Demos</a><a href="#terms">Pricing</a><a href="/account">Owner sign in</a></nav><small>© {new Date().getFullYear()} · Demo businesses are fictional.</small></footer>
          </div>
        </section>
      </main>
    </ScrollCraftMount>
  );
}
