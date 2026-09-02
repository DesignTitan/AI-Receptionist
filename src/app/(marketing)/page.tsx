import type { Metadata } from "next";
import { Folio } from "@/components/marketing/folio";
import { PRODUCT_NAME } from "@/components/marketing/product-chrome";
import { ScrollCraftMount } from "@/components/marketing/scrollcraft-mount";
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
  { id: "proof", n: "04", title: "Proof" },
  { id: "industries", n: "05", title: "Your industry" },
  { id: "hear", n: "06", title: "Hear it yourself" },
  { id: "terms", n: "07", title: "Terms" },
  { id: "colophon", n: "08", title: "Colophon" },
];

const RAIL = [
  { h: "Health and wellness", p: "Visits confirmed, intake reminded, the no-show flagged before it happens." },
  { h: "Personal care", p: "Colour, cuts, facials, massage: confirmed while your hands are busy." },
  { h: "Professional services", p: "Consultations confirmed and reschedules taken, with no phone tag." },
  { h: "Creative studios and agencies", p: "Discovery sessions booked with the person who would do the work." },
  { h: "Trades and field service", p: "The window confirmed the night before, so the van never waits." },
  { h: "Instruction and sessions", p: "Lessons confirmed, cancellations noticed, the slot offered on." },
];

export default function HomePage() {
  // Live only with a voice line AND the human check; otherwise the plate takes a callback request.
  const simulated = !isLiveCallReady();
  return (
    <ScrollCraftMount>
      <Folio chapters={simulated ? CHAPTERS.map((c) => (c.id === "hear" ? { ...c, title: "Ask for a call" } : c)) : CHAPTERS} />
      <div className="sc-grain" aria-hidden="true" />

      <main id="main">
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
            <div className="rc-deck" aria-label="Three things the dashboard shows">
              <article className="rc-card" style={{ "--i": 0, "--in": -1, "--next": 0.2 } as React.CSSProperties}>
                <div className="rc-card__copy">
                  <p className="rc-card__eyebrow"><span aria-hidden />Every call, on the record</p>
                  <h3>Recording, transcript, summary.</h3>
                  <p>
                    The call ends and three things are already in the dashboard: the recording, the transcript
                    line by line, and a one-line summary of what was agreed. The same three land in your inbox.
                  </p>
                  <p className="rc-card__foot">Nothing to write up afterwards.</p>
                </div>
                <figure className="rc-card__media">
                  <img src="/scrollcraft/04a-record.jpg" width={820} height={730} alt="A call record: the recording, the assistant's summary, and the transcript line by line." />
                </figure>
              </article>
              <article className="rc-card" style={{ "--i": 1, "--in": 0.2, "--next": 0.55 } as React.CSSProperties}>
                <div className="rc-card__copy">
                  <p className="rc-card__eyebrow"><span aria-hidden />Nothing is lost to voicemail</p>
                  <h3>Every no-answer is flagged.</h3>
                  <p>
                    A no-answer is flagged for a person. A reschedule comes back with the times that suit. A
                    cancellation frees the slot. Each one is a row you can open.
                  </p>
                  <p className="rc-card__foot">The exceptions, not the routine.</p>
                </div>
                <figure className="rc-card__media">
                  <img src="/scrollcraft/04b-statuses.jpg" width={550} height={440} alt="Booking rows with their call outcomes: confirmed, no answer, reschedule requested." />
                </figure>
              </article>
              <article className="rc-card" style={{ "--i": 2, "--in": 0.55, "--next": 9 } as React.CSSProperties}>
                <div className="rc-card__copy">
                  <p className="rc-card__eyebrow"><span aria-hidden />One desk, every business</p>
                  <h3>Three businesses. One front desk.</h3>
                  <p>
                    A clinic, a salon and a design studio run on the same desk, each in its own colours and its
                    own words. Filter by business, or see all of it at once.
                  </p>
                  <p className="rc-card__foot">Built to be yours, not a template.</p>
                </div>
                <figure className="rc-card__media rc-card__media--wide">
                  <img src="/scrollcraft/04c-businesses.jpg" width={1380} height={716} alt="The dashboard's totals and the three business filters: Northlake Family Health, Solstice Salon & Spa, Halide Studio." />
                </figure>
              </article>
            </div>
          </div>
        </section>

        {/* 05 · Their industry. Lateral: breadth. */}
        <section id="industries" data-sc-act="pan" data-sc-span="2.4">
          <div data-sc-stage>
            <div className="rc-rail" data-sc-pan="0.06">
              <div className="rc-rail__lead">
                <h2 className="sc-display sc-display--md">Any business that runs on appointments.</h2>
                <p className="sc-body">If a client picks a person and a time, and someone has to phone them to make sure, this is for you.</p>
              </div>
              {RAIL.map((item) => (
                <article key={item.h}>
                  <h3>{item.h}</h3>
                  <p>{item.p}</p>
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
              <div className="rc-price">
                <div><b>$199</b><span>a month, per business. Month to month.</span></div>
                <div><b>$1,000</b><span>to set up: your page, your people, your voice line, a test call with you on it.</span></div>
                <div><b>500</b><span>calls a month, fair use. Most businesses never reach it.</span></div>
              </div>
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
