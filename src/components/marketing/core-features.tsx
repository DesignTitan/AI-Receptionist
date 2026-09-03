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
    alt: "The booking page: a client picks a day and a time with one of your people.",
    caption: "Your people, your hours, your colours — live the same day.",
  },
  {
    key: "after",
    tab: "Open after hours",
    screen: "/scrollcraft/06-after-p.webp",
    alt: "Bookings taken overnight and on a closed day, each confirmed within a minute.",
    caption: "Eleven of last week's thirty-eight bookings came in after you closed.",
  },
  {
    key: "noshow",
    tab: "Fewer no-shows",
    screen: "/scrollcraft/06-noshow-p.webp",
    alt: "Confirmation rate, no-shows, slots refilled and value recovered this month.",
    caption: "A voice gets confirmed. A text gets ignored.",
  },
  {
    key: "voice",
    tab: "Sounds like you",
    screen: "/scrollcraft/06-voice-p.webp",
    alt: "The greeting, the rules and the number the assistant calls from, per business.",
    caption: "Your words, your rules, your number on their screen.",
  },
];

/**
 * The core-features tab strip: a chip, a two-line title, a lede, and four real
 * tabs. Clicking one swaps the screen below. Tabs, not links: arrow keys move
 * between them and the panel is labelled, so it works without a mouse.
 */
export function CoreFeatures() {
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
            One desk to run
            <span> every booking you take.</span>
          </h2>
        </div>
        <p className="rc-cf__lede">
          The booking page, the confirmation call, the record of it and the ones that need a person.
          Four parts of the same desk, so you stop stitching tools together and get on with the work.
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
