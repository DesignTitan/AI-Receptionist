import type { Metadata } from "next";
import Link from "next/link";
import { CoreFeatures } from "@/components/marketing/core-features";
import { RoadmapBoard } from "@/components/marketing/roadmap-board";
import { ROADMAP } from "@/lib/roadmap/catalogue";
import { PLANS, SETUP_OFFER, SETUP_SCOPE } from "@/lib/platform/pricing";
import { FEATURE_GROUPS, PILLARS, STATUS_LABEL } from "@/lib/marketing/feature-inventory";
import "./features.css";

export const metadata: Metadata = {
  title: "Features and benefits",
  description: "Everything bubs™ does for a business that runs on appointments: online booking, AI confirmation calls, records and follow-up, usage controls, and the incoming-call pilot. Each feature marked as included, pilot or coming soon.",
};

const CHAPTERS = [
  { id: "online-booking", name: "Online booking" },
  { id: "confirmation-calls", name: "Confirmation calls" },
  { id: "incoming-calls", name: "Incoming calls", pilot: true },
  { id: "coverage", name: "Answering schedules", pilot: true },
  { id: "call-records", name: "Bookings and follow-up" },
  { id: "usage-controls", name: "Usage and spending" },
];

export default function FeaturesPage() {
  return (
    <div className="features-page">


      <main id="main">
        <section className="features-hero" aria-labelledby="features-title">
          <p className="features-eyebrow">Features</p>
          <h1 id="features-title">Every booking taken.<br /><span>Every visit confirmed.</span></h1>
          <div className="features-hero__bottom">
            <p>An online booking page, an AI receptionist that calls to confirm, and one place to see what needs you. Here is everything it does, and what is still on the way.</p>
            <div className="features-actions">
              <Link href="/start" className="features-button">Set up my business <span aria-hidden="true">↗</span></Link>
              <Link href="/demos" className="features-button features-button--outline">Try online booking</Link>
            </div>
          </div>
        </section>

        <section className="features-pillars" aria-label="What it does">
          {PILLARS.map((pillar, index) => (
            <a href={pillar.href} key={pillar.id} className="features-pillar">
              <span className="features-pillar__number">0{index + 1}</span>
              <span className="features-pillar__title">{pillar.title}</span>
              <span className="features-pillar__detail">{pillar.detail}</span>
              <span className="features-pillar__go" aria-hidden="true">↓</span>
            </a>
          ))}
        </section>

        <CoreFeatures />

        <section className="features-inventory" id="everything" aria-labelledby="features-inventory-title">
          <div className="features-section-heading">
            <p className="features-eyebrow">Everything included</p>
            <h2 id="features-inventory-title">The whole list,<br />in one place.</h2>
            <p className="features-body">Every feature, grouped by the job it does. <strong>Included</strong> is on every plan today. <strong>Pilot</strong> means your phone line is reviewed and tested with you first. <strong>Coming soon</strong> links to the public roadmap, where you can vote.</p>
          </div>
          <div className="features-inventory__grid">
            {FEATURE_GROUPS.map(group => (
              <section className="features-group" key={group.id} aria-labelledby={`group-${group.id}`}>
                <header className="features-group__head">
                  <p className="features-eyebrow">{group.number}</p>
                  <h3 id={`group-${group.id}`}>{group.title}</h3>
                  <p className="features-group__summary">{group.summary}</p>
                  {group.storyId && <a className="features-group__story" href={`#${group.storyId}`}>Read the story <span aria-hidden="true">↑</span></a>}
                </header>
                <ul className="features-items">
                  {group.items.map(item => (
                    <li className="features-item" key={item.name} data-status={item.status}>
                      <span className="features-item__mark" aria-hidden="true">{item.status === "included" ? "✓" : item.status === "pilot" ? "◐" : "○"}</span>
                      <span className="features-item__text">
                        <span className="features-item__name">{item.name}</span>
                        <span className="features-item__detail">{item.detail}</span>
                      </span>
                      {item.status === "soon"
                        ? <a className="features-status" href="#coming-soon">{STATUS_LABEL[item.status]}</a>
                        : <span className="features-status">{STATUS_LABEL[item.status]}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>

        <section className="features-plans" aria-labelledby="features-plans-title">
          <div className="features-section-heading">
            <p className="features-eyebrow">A plan for your working day</p>
            <h2 id="features-plans-title">The same core tools.<br />Room for your team to grow.</h2>
            <p className="features-body">Choose the minutes and team size that fit your business. Online booking, confirmation calls, call records and spending controls are included across all three plans. Incoming features remain subject to pilot connection and testing.</p>
          </div>
          <ul className="features-plan-list">
            {Object.values(PLANS).map(plan => (
              <li key={plan.name}>
                <h3>{plan.name}</h3>
                <p><strong>{plan.minutes.toLocaleString()}</strong> minutes per month</p>
                <p>Up to {plan.teamLimit} bookable team members</p>
              </li>
            ))}
          </ul>
          <div className="features-plan-footer">
            <p className="features-small">Each plan covers one business location. {SETUP_OFFER}</p>
            <Link className="features-text-link" href="/#terms">See plans and full pricing <span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        <section className="features-faq" id="setup" aria-labelledby="features-faq-title">
          <div className="features-section-heading">
            <p className="features-eyebrow">Before you get started</p>
            <h2 id="features-faq-title">A clear path from<br />“I need this” to setup.</h2>
            <p className="features-body">We prepare the business details and test the service with you before activation. Here’s what to expect.</p>
          </div>
          <div className="features-faq__questions">
            <details>
              <summary>What happens after I get started?</summary>
              <p>Sign in, tell us about your business and team, and choose a plan. After checkout, we prepare your booking page and voice configuration, then arrange a test with you before activation.</p>
              <p>{SETUP_SCOPE} Setup is paid once; your exact fee is confirmed before payment.</p>
            </details>
            <details>
              <summary>Can I keep my business phone number?</summary>
              <p>Keeping your public number is the goal of the incoming-call pilot. We review your phone provider and service to work out the connection. Forwarding or routing may need to be set up with your carrier, and the complete route must be tested before customers use it.</p>
              <p>Outgoing confirmation calls use a dedicated number configured during setup. Selecting a provider during signup does not connect your existing line.</p>
            </details>
            <details>
              <summary>Will it work with my current booking software?</summary>
              <p>Appointments are managed in the bubs™ appointment book. Calendar and practice-software synchronization are not available yet. Tell us which system you use during setup so we can check whether this workflow fits your business before activation.</p>
            </details>
            <details>
              <summary>Can the AI change or cancel an appointment?</summary>
              <p>During an outgoing confirmation call, an explicit cancellation can update the booking. A request for a different time is recorded for your team to follow up; the assistant does not arrange the new time.</p>
              <p>The incoming-call pilot supports new bookings. Changes to an existing appointment need staff help.</p>
            </details>
            <details>
              <summary>What happens if I use all my call minutes?</summary>
              <p>Additional spending starts at zero. You can choose a recurring monthly spending limit if you want extra minutes. When there is not enough available call budget, AI calling pauses and online booking remains available for your team to confirm manually.</p>
              <p>For a tested incoming connection, callers use the staff or voicemail fallback configured during setup. Usage notices stay in your dashboard; email alerts require connected delivery.</p>
            </details>
            <details>
              <summary>Is it right for my kind of business?</summary>
              <p>It is built around a customer booking time with a member of your team: salons, studios and other appointment businesses. Each plan covers one location, with US or Canadian phone numbers. Your hours, service durations, phone setup and existing appointment software help us check the fit.</p>
              <p><Link className="features-text-link" href="/demos">Explore the booking demos <span aria-hidden="true">↗</span></Link></p>
            </details>
          </div>
        </section>

        <section className="features-close" aria-labelledby="features-close-title">
          <p className="features-eyebrow">Make room for your day</p>
          <h2 id="features-close-title">Your next appointment.<br /><span>A little less to do.</span></h2>
          <p>See how it feels to give customers a simpler way to book, and your team a clearer way to follow up.</p>
          <div className="features-actions">
            <Link href="/start" className="features-button">Set up my business <span aria-hidden="true">↗</span></Link>
            <Link href="/#terms" className="features-button features-button--outline">See plans and pricing</Link>
          </div>
        </section>
        <RoadmapBoard seeds={ROADMAP} />
      </main>


    </div>
  );
}
