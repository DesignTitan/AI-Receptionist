"use client";

import { useEffect, useRef, useState } from "react";
import { PRODUCT_NAME } from "@/components/marketing/product-chrome";
import { TryCallPlate } from "@/components/marketing/try-call-plate";

const LINKS = [
  { href: "/features", label: "Features" },
  { href: "#turn", label: "How it works" },
  { href: "#industries", label: "Industries" },
  { href: "#terms", label: "Pricing" },
];

export function SiteNav({ cta, simulated, turnstileSiteKey }: { cta: string; simulated: boolean; turnstileSiteKey: string | null }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [hidden, setHidden] = useState(false);
  const root = useRef<HTMLElement | null>(null);
  const callButton = useRef<HTMLButtonElement | null>(null);
  const menuButton = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const hero = document.getElementById("desk");
    let previous = window.scrollY;
    let frame = 0;
    function update() {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const past = hero ? hero.getBoundingClientRect().bottom <= 0 : true;
      setPastHero(past);
      if (!past) { setHidden(false); previous = y; }
      else if (Math.abs(y - previous) > 8) {
        setHidden(y > previous);
        previous = y;
      }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, []);

  useEffect(() => {
    if (!open && !menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false); setMenuOpen(false);
        (open ? callButton : menuButton).current?.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) { setOpen(false); setMenuOpen(false); }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    if (open) root.current?.querySelector<HTMLInputElement>(".rc-nav__pop input")?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, [open, menuOpen]);

  return (
    <nav className="rc-nav rc-nav--traditional" aria-label="Site" ref={root} data-past-hero={pastHero} data-hidden={hidden && !open && !menuOpen} data-menu-open={menuOpen}>
      <button ref={menuButton} className="rc-nav__menu" aria-expanded={menuOpen} aria-controls="rc-site-links" onClick={() => { setMenuOpen(!menuOpen); setOpen(false); }}>Menu</button>
      <a className="rc-nav__brand" href="#desk" aria-label={`${PRODUCT_NAME} — home`} onClick={() => setMenuOpen(false)}><img src="/marketing/happy-pillow-mascot.png" width={60} height={60} alt="" /></a>
      <div className="rc-nav__right">
        <ul className="rc-nav__text-links" id="rc-site-links">
          {LINKS.map(link => <li key={link.href}><a href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a></li>)}
          <li className="rc-nav__mobile-login"><a href="/account/login">Log in</a></li>
        </ul>
        <div className="rc-nav__actions">
          <button ref={callButton} type="button" className="rc-nav__cta" aria-label={cta} title={cta} aria-expanded={open} aria-controls="rc-nav-pop" onClick={() => { setOpen(!open); setMenuOpen(false); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 7 7l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3.5 5.5a2 2 0 0 1 2-2Z"/></svg>
          </button>
          <a className="rc-nav__login" href="/account/login">Log in</a>
          <a className="rc-nav__signup" href="/start">Sign up</a>
        </div>
      </div>
      {open && <div className="rc-nav__pop" id="rc-nav-pop" role="dialog" aria-label={cta}>
        <div className="rc-nav__pop-head"><p>{simulated ? "Ask for a call" : "Have it call you"}</p><button type="button" aria-label="Close" onClick={() => { setOpen(false); callButton.current?.focus(); }}>×</button></div>
        <TryCallPlate simulated={simulated} turnstileSiteKey={turnstileSiteKey} compact />
      </div>}
    </nav>
  );
}
