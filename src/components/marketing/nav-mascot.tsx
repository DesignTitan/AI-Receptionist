"use client";

import { useEffect, useRef, useState } from "react";

const GREETINGS = ["Hi!", "Lovely to see you.", "How’s your day?", "You rang?", "I’m all ears.", "You’ve got this.", "Tiny pillow. Big hello.", "Still here for you."];

export function NavMascot() {
  const [animating, setAnimating] = useState(false);
  const [winking, setWinking] = useState(false);
  const [greeting, setGreeting] = useState<number | null>(null);
  const nextGreeting = useRef(0);
  const nodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const winkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (nodTimer.current) clearTimeout(nodTimer.current);
    if (winkTimer.current) clearTimeout(winkTimer.current);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
  }, []);

  function nod() {
    if (nodTimer.current) clearTimeout(nodTimer.current);
    setAnimating(true);
    nodTimer.current = setTimeout(() => setAnimating(false), 850);
  }

  function sayHello() {
    if (winkTimer.current) clearTimeout(winkTimer.current);
    setWinking(true);
    winkTimer.current = setTimeout(() => setWinking(false), 220);
    setGreeting(nextGreeting.current++ % GREETINGS.length);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setGreeting(null), 1000);
  }

  return <div className="rc-nav__brand rc-nav-mascot">
    <button type="button" className="rc-nav-mascot__button" aria-label="Say hello to bubs"
      onPointerEnter={event => { if (event.pointerType !== "touch") nod(); }}
      onFocus={nod} onClick={sayHello}
      onKeyDown={event => { if (event.key === "Escape") { setGreeting(null); if (bubbleTimer.current) clearTimeout(bubbleTimer.current); } }}>
      <span className="rc-nav-mascot__character" data-animating={animating} data-winking={winking}>
        <svg viewBox="0 0 64 64" width="60" height="60" aria-hidden="true" focusable="false">
          <path fill="#B9DDB7" d="M32 7C15 7 8 12 8 28v8c0 7 1 11 5 15L9 59l14-6c3 1 6 1 9 1 17 0 24-5 24-20v-6C56 12 49 7 32 7Z" />
          <ellipse cx="23" cy="29" rx="6.5" ry="7.5" fill="#FFFCEE" />
          <ellipse cx="24" cy="30" rx="4.2" ry="5.2" fill="#173B31" />
          <circle cx="25.4" cy="27.8" r="1.6" fill="#FFFCEE" />
          {winking ? <path d="M37 30q4-5 8 0" fill="none" stroke="#173B31" strokeWidth="3" strokeLinecap="round" /> : <>
            <ellipse cx="41" cy="29" rx="6.5" ry="7.5" fill="#FFFCEE" />
            <ellipse cx="40" cy="30" rx="4.2" ry="5.2" fill="#173B31" />
            <circle cx="41.4" cy="27.8" r="1.6" fill="#FFFCEE" />
          </>}
          <path d="M26 40q6 3 12 0c-1 9-11 9-12 0Z" fill="#173B31" />
          <ellipse cx="17" cy="38" rx="3.5" ry="2" fill="#8CBE93" />
          <ellipse cx="47" cy="38" rx="3.5" ry="2" fill="#8CBE93" />
        </svg>
      </span>
      <span className="rc-nav-mascot__name">bubs</span>
    </button>
    <span className="rc-nav-mascot__speech" role="status" aria-live="polite" aria-atomic="true" data-visible={greeting !== null}>{greeting !== null ? GREETINGS[greeting] : ""}</span>
  </div>;
}
