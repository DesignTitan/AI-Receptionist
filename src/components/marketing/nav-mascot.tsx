"use client";

import { useEffect, useRef, useState } from "react";

const GREETINGS = ["Hi!", "Lovely to see you.", "How’s your day?", "You rang?", "I’m all ears.", "You’ve got this.", "Tiny pillow. Big hello.", "Still here for you."];

export function NavMascot() {
  const [greeting, setGreeting] = useState<number | null>(null);
  const nextGreeting = useRef(0);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
  }, []);

  function sayHello() {
    setGreeting(nextGreeting.current++ % GREETINGS.length);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setGreeting(null), 1000);
  }

  return <div className="rc-nav__brand rc-nav-mascot">
    <button type="button" className="rc-nav-mascot__button" aria-label="Say hello to bubs"
      onClick={sayHello}
      onKeyDown={event => { if (event.key === "Escape") { setGreeting(null); if (bubbleTimer.current) clearTimeout(bubbleTimer.current); } }}>
      <span className="rc-nav-mascot__character">
        <svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true" focusable="false">
          <path fill="currentColor" fillRule="evenodd" d={
            "M32 7C15 7 8 12 8 28v8c0 7 1 11 5 15L9 59l14-6c3 1 6 1 9 1 17 0 24-5 24-20v-6C56 12 49 7 32 7Z " +
            "M23 36q9 4 18 0c-1 13-17 13-18 0Z"
          } />
        </svg>
      </span>
      <span className="rc-nav-mascot__name">bubs</span>
    </button>
    <span className="rc-nav-mascot__speech" role="status" aria-live="polite" aria-atomic="true" data-visible={greeting !== null}>{greeting !== null ? GREETINGS[greeting] : ""}</span>
  </div>;
}
