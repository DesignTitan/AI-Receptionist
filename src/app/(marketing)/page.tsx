import type { Metadata } from "next";
import { Folio } from "@/components/marketing/folio";
import { PRODUCT_NAME } from "@/components/marketing/product-chrome";
import { ScrollCraftMount } from "@/components/marketing/scrollcraft-mount";
import { CoreFeatures } from "@/components/marketing/core-features";
import { SiteNav } from "@/components/marketing/site-nav";
import { TryCallPlate } from "@/components/marketing/try-call-plate";
import { env, isLiveCallReady } from "@/lib/env";
import "./receptionist.css";

/** Rendered per request: the call plate's mode follows the environment, not the last build. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${PRODUCT_NAME} · The front desk that calls back` },
  description:
    "A booking page and an AI receptionist for any business that runs on appointments. Clients book online; it phones them inside a minute to confirm; you see every call.",
};

const CHAPTERS = [
  { id: "desk", n: "01", title: "The front desk" },
  { id: "cost", n: "02", title: "The cost" },
  { id: "turn", n: "03", title: "It calls back" },
  { id: "features", n: "04", title: "Core features" },
  { id: "proof", n: "05", title: "Proof" },
  { id: "industries", n: "06", title: "Your industry" },
  { id: "hear", n: "07", title: "Hear it yourself" },
  { id: "terms", n: "08", title: "Terms" },
  { id: "colophon", n: "09", title: "Colophon" },
];

const PLANS = [
  {
    name: "Front desk",
    price: "$149",
    calls: "200 calls a month",
    who: "One room, one chair, one pair of hands.",
    cta: "Start here",
    featured: false,
    has: [
      "Your booking page, in your colours",
      "A confirmation call inside a minute",
      "Recording, transcript and summary",
      "Reschedules and cancellations on the call",
      "Email support",
    ],
  },
  {
    name: "Busy desk",
    price: "$299",
    calls: "600 calls a month",
    who: "A team that fills its day and misses calls.",
    cta: "Start here",
    featured: true,
    has: [
      "Everything in Front desk",
      "No-answers flagged for a person",
      "After-hours and weekend bookings",
      "Your own number on their screen",
      "Priority support",
    ],
  },
  {
    name: "Full desk",
    price: "$599",
    calls: "1,500 calls a month",
    who: "Several locations, or a very long day.",
    cta: "Talk to us",
    featured: false,
    has: [
      "Everything in Busy desk",
      "Several businesses on one dashboard",
      "A voice line for each business",
      "Your script tuned with you, quarterly",
      "A named person on your account",
    ],
  },
];

const RAIL = [
  { h: "Health and wellness", p: "Visits confirmed, intake reminded, the no-show flagged before it happens.", img: "ind-health.jpg" },
  { h: "Personal care", p: "Colour, cuts, facials, massage: confirmed while your hands are busy.", img: "ind-care.jpg" },
  { h: "Professional services", p: "Consultations confirmed and reschedules taken, with no phone tag.", img: "ind-professional.jpg" },
  { h: "Creative studios and agencies", p: "Discovery sessions booked with the person who would do the work.", img: "ind-studio.jpg" },
  { h: "Trades and field service", p: "The window confirmed the night before, so the van never waits.", img: "ind-trades.jpg" },
  { h: "Instruction and sessions", p: "Lessons confirmed, cancellations noticed, the slot offered on.", img: "ind-lessons.jpg" },
];

export default function HomePage() {
  // Live only with a voice line AND the human check; otherwise the plate takes a callback request.
  const simulated = !isLiveCallReady();
  return (
    <ScrollCraftMount>
      <Folio chapters={simulated ? CHAPTERS.map((c) => (c.id === "hear" ? { ...c, title: "Ask for a call" } : c)) : CHAPTERS} />
      <div className="sc-grain" aria-hidden="true" />

      <main id="main">
        <SiteNav cta={simulated ? "Ask for a call" : "Have it call you"} simulated={simulated} turnstileSiteKey={env.turnstile.siteKey ?? null} />
        {/* 01 · Title page. Type on paper, no media above the fold. */}
        <section id="desk" className="rc-chapter rc-title" data-sc-act="flow">
          <div className="sc-wrap">
            <p className="rc-mark"><i aria-hidden /> {PRODUCT_NAME}</p>
            <div className="sc-stack" data-sc-in data-sc-stagger="70">
              <h1 className="sc-display sc-display--xl">The front desk that calls back.</h1>
              <p className="sc-lede">
                A booking page and an AI receptionist for any business that runs on appointments.
                Your clients book online. It phones them inside a minute to confirm. You see every call.
              </p>
              <div className="rc-title__actions">
                <a href="#hear">{simulated ? "Ask for a call" : "Have it call you"}</a>
                <a href="/demos">See the demos</a>
              </div>
            </div>
          </div>
        </section>
        <section className="rc-chapter" data-sc-act="flow" style={{ paddingTop: 0 }}>
          <div className="sc-wrap rc-plates rc-plates--flip">
            <figure className="rc-media" data-sc-in>
              <img src="/scrollcraft/01-booking.jpg" width={1600} height={1000} alt="The booking page of the salon demo: a week of days and the open times under Sasha Reyes." />
              <figcaption>A booking on the salon demo. Live availability, forty seconds to book.</figcaption>
            </figure>
            <div className="sc-stack" data-sc-in data-sc-stagger="60">
              <h2 className="sc-display sc-display--md">Every booking begins with a phone that rang.</h2>
              <p className="sc-body">
                Someone found you, picked a time, and dialled. Whether that became a booking depended
                on who could pick up. This page is about what happens when nobody can.
              </p>
            </div>
          </div>
        </section>

        {/* 02 · The cost. A hard cut to ink. No numbers: none are verified. */}
        <section id="cost" className="rc-chapter rc-dark" data-sc-act="flow">
          <div className="sc-wrap rc-plates">
            <div className="sc-stack" data-sc-in data-sc-stagger="60">
              <h2 className="sc-display sc-display--lg">The call that went to voicemail was a booking.</h2>
              <p className="sc-lede">
                Hands were busy. The room was full. It was seven in the evening. They did not leave a
                message. They booked the next place on the list.
              </p>
              <p className="sc-body">
                A front desk cannot answer every call, and a client will not wait for one to be
                returned. The booking was lost in the gap between the two.
              </p>
            </div>
            <figure className="rc-media" data-sc-parallax="-0.7">
              <img src="/scrollcraft/02-missed-call.jpg" width={1440} height={300} alt="A dashboard row reading No answer, flagged for a person to follow up." />
              <figcaption>How a missed call looks on the dashboard: flagged, so a person follows up.</figcaption>
            </figure>
          </div>
        </section>

        {/* 03 · The turn. The one film chapter: the real confirmation page walking to confirmed. */}
        <section id="turn" data-sc-act="scrub" data-sc-span="2.4" data-sc-dwell="0.32">
          <div data-sc-stage>
            <picture>
              <source media="(max-width: 860px)" srcSet="/scrollcraft/03-turn-poster-p.jpg" />
              <img className="sc-stage__poster" src="/scrollcraft/03-turn-poster.jpg" alt="" />
            </picture>
            <video data-sc-scrub data-sc-src="/scrollcraft/03-turn.mp4" data-sc-src-mobile="/scrollcraft/03-turn-p.mp4" muted playsInline />
            <div className="sc-scrim sc-scrim--lead" aria-hidden="true" />
            <div className="sc-copy sc-copy--lead" data-sc-cue="0 0.58 0">
              <h2 className="sc-display sc-display--lg" data-sc-kinetic="lines">It calls them back before they have put the phone down.</h2>
              <p className="sc-lede">Within a minute of a booking the assistant rings the client, confirms the time, and takes a reschedule or a cancellation on the call.</p>
            </div>
            <div className="sc-copy sc-copy--trail" data-sc-cue="0.62 0.96">
              <h2 className="sc-display sc-display--md">Recorded. Transcribed. Summarised. Every time.</h2>
            </div>
          </div>
        </section>

        {/* 04 · Proof. An iris into the real dashboard, then the record. */}
        <div className="rc-textured textured-section">
          <section id="features" className="rc-features" data-sc-act="flow">
            <div className="sc-wrap">
              <CoreFeatures />
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
                    <h3>A confirmation call inside a minute.</h3>
                    <p>Every booking gets a call, not a text nobody reads. The client confirms, moves or cancels on the phone, and it is done before they have put it down.</p>
                    <p className="rc-card__foot">Your front desk keeps working after hours.</p>
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
                    <p>The call ends and all three are already there: the recording to play, the transcript line by line, and one line of what was agreed. The same three land in your inbox.</p>
                    <p className="rc-card__foot">Nothing to write up afterwards.</p>
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
                    <p className="rc-card__eyebrow"><span aria-hidden />Nothing is lost to voicemail</p>
                    <h3>Every no-answer is flagged.</h3>
                    <p>A no-answer is flagged for a person. A reschedule comes back with the times that suit. A cancellation frees the slot. Each one is a row you can open.</p>
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

        <section id="industries" data-sc-act="pan" data-sc-span="2.4">
          <div data-sc-stage>
            <div className="rc-rail" data-sc-pan="0.06">
              <div className="rc-rail__lead">
                <h2 className="sc-display sc-display--md">Any business that runs on appointments.</h2>
                <p className="sc-body">If a client picks a person and a time, and someone has to phone them to make sure, this is for you.</p>
              </div>
              {RAIL.map((item) => (
                <article key={item.h} className="rc-tile" style={{ "--shot": `url(/scrollcraft/${item.img})` } as React.CSSProperties}>
                  <div className="rc-tile__body">
                    <h3>{item.h}</h3>
                    <p>{item.p}</p>
                  </div>
                </article>
              ))}
              <div className="rc-rail__note">
                <h3>Three are live today.</h3>
                <p>A clinic, a salon and a studio, each taking real bookings. <a href="/demos">Open the demos.</a></p>
              </div>
            </div>
          </div>
        </section>

        {/* Authored silence: one quiet screen before the peak. */}
        <section className="rc-silence" aria-hidden="true" />

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
                <li><span><strong>Your team, your hours, your page.</strong>We set up the booking page in your name and your colours. Live the same day.</span></li>
                <li><span><strong>They book, it calls.</strong>Every booking gets a confirmation call inside a minute. Reschedules and cancellations are taken on the call.</span></li>
                <li><span><strong>You see everything.</strong>Recording, transcript and summary in your dashboard and your inbox. A no-answer is flagged for a person.</span></li>
              </ol>
              <div className="rc-plans">
                {PLANS.map((plan) => (
                  <article key={plan.name} className={plan.featured ? "rc-plan rc-plan--on" : "rc-plan"}>
                    {plan.featured && <p className="rc-plan__flag">Most businesses</p>}
                    <p className="rc-plan__name">{plan.name}</p>
                    <p className="rc-plan__price"><b>{plan.price}</b><span>/month</span></p>
                    <p className="rc-plan__calls">{plan.calls}</p>
                    <p className="rc-plan__who">{plan.who}</p>
                    <a className="rc-plan__cta" href="#hear">{plan.cta}</a>
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
                <b>$1,000 to set up, once.</b> Your page, your people, your voice line, and a test call with you
                on it. Calls beyond your plan are 30 cents each. Month to month — leave whenever you like.
              </p>
              <p className="sc-body" style={{ marginTop: "var(--sc-6)" }}>
                Calendar and practice-software sync is not built yet. If you need it, you would be the reason it gets built.
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
                <a href="/admin">Staff dashboard</a>
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
