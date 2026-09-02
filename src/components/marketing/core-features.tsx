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
    tab: "Booking page",
    screen: "/scrollcraft/01-booking.jpg",
    alt: "The booking page: a client picks a person, a day and a time.",
    caption: "Your people, your hours, your colours — live the same day.",
  },
  {
    key: "call",
    tab: "The call",
    screen: "/scrollcraft/03-confirmed.jpg",
    alt: "A booking confirmed, with the confirmation call in progress underneath it.",
    caption: "A confirmation call inside a minute, while they are still on the page.",
  },
  {
    key: "record",
    tab: "The record",
    screen: "/scrollcraft/04-dashboard.jpg",
    alt: "The dashboard: every booking with the outcome of its call.",
    caption: "Every call recorded, transcribed and summarised, in one list.",
  },
  {
    key: "flag",
    tab: "What needs you",
    screen: "/scrollcraft/05-attention.jpg",
    alt: "Bookings flagged after a no-answer, waiting for a person.",
    caption: "The ones nobody answered, flagged instead of buried.",
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
        <div className="rc-cf__frame">
          <img key={feature.key} src={feature.screen} width={1600} height={1000} alt={feature.alt} />
        </div>
      </div>

      <p className="rc-cf__caption">{feature.caption}</p>
    </div>
  );
}
