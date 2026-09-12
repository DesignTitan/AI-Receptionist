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
        <img className="rc-nav-mascot__rest" src="/marketing/happy-mascot-pointed.png" width={60} height={60} alt="" />
        <img className="rc-nav-mascot__wink" style={{ opacity: winking ? 1 : 0, zIndex: 2, pointerEvents: "none" }} src="/marketing/happy-pillow-wink.png" width={60} height={60} alt="" />
      </span>
      <span className="rc-nav-mascot__name">bubs</span>
    </button>
    <span className="rc-nav-mascot__speech" role="status" aria-live="polite" aria-atomic="true" data-visible={greeting !== null}>{greeting !== null ? GREETINGS[greeting] : ""}</span>
  </div>;
}
