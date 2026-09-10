"use client";

import { useId, useRef, useState } from "react";

type Feature = {
  key: string;
  tab: string;
  screen: string;
  alt: string;
  caption: string;
};

const FEATURES: Feature[] = [
  {
    key: "book",
    tab: "Your booking page",
    screen: "/scrollcraft/06-book-p.webp",
    alt: "Illustrative booking interface: a client picks a day and a time with a team member.",
    caption: "Your logo, your team, your hours. We prepare and test the booking page with you. Illustrative interface.",
  },
  {
    key: "after",
    tab: "Open after hours",
    screen: "/scrollcraft/06-after-p.webp",
    alt: "Illustrative interface showing example bookings received outside business hours, not measured customer results.",
    caption: "Customers can book online after you close, for appointments during your working hours. Figures shown are illustrative.",
  },
  {
    key: "noshow",
    tab: "See what’s confirmed",
    screen: "/scrollcraft/06-noshow-p.webp",
    alt: "Analytics concept with example confirmation and no-show figures. This is not a live product dashboard or measured performance.",
    caption: "Confirmation calls record the response and flag follow-ups for your team. Analytics shown are an illustrative concept.",
  },
  {
    key: "voice",
    tab: "Calls for your business",
    screen: "/scrollcraft/06-voice-p.webp",
    alt: "Illustrative setup concept showing a greeting, call rules and a dedicated confirmation-call number.",
    caption: "A dedicated confirmation-call number, configured for your business during setup. Interface shown is a concept.",
  },
];

/**
 * The original scrolling feature strip: a chip, a two-line title, a lede, and four
 * tabs. Clicking one swaps the screen below. Arrow keys move between tabs and
 * the panel is labelled, so it works without a mouse.
 */
export function ScrollingFeatures() {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const feature = FEATURES[active];

  function onKey(e: React.KeyboardEvent<HTMLButtonElement>, i: number) {
    const last = FEATURES.length - 1;
    const next = e.key === "ArrowRight" ? (i === last ? 0 : i + 1) : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="rc-cf">
      <div className="rc-cf__head">
        <div>
          <p className="rc-chip"><span aria-hidden />Core features</p>
          <h2 className="sc-display sc-display--md">
            Your bookings. Your calls.
            <span> All together.</span>
          </h2>
        </div>
        <p className="rc-cf__lede">
          Give customers a place to book, let AI make the confirmation calls, and see who needs a follow-up.
          Less time on the phone. More time for your business.
        </p>
      </div>

      <div className="rc-cf__tabs" role="tablist" aria-label="Core features">
        {FEATURES.map((f, i) => (
          <button
            key={f.key}
            ref={(el) => { tabs.current[i] = el; }}
            role="tab"
            type="button"
            id={`${id}-tab-${f.key}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel`}
            tabIndex={i === active ? 0 : -1}
            className="rc-cf__tab"
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {f.tab}
          </button>
        ))}
      </div>

      <div className="rc-cf__stage" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${feature.key}`}>
        {/* two layers: the sharp desert behind, the frosted panel (an alpha PNG) in front;
            both ride the section's scroll progress so the panel floats over the scene */}
        <div className="rc-cf__frame">
          <img className="rc-cf__bg" src="/scrollcraft/06-bg.jpg" width={1600} height={1000} alt="" aria-hidden="true" />
          <img className="rc-cf__panel" key={feature.key} src={feature.screen} width={1600} height={1000} alt={feature.alt} />
        </div>
      </div>

      <p className="rc-cf__caption">{feature.caption}</p>
    </div>
  );
}
