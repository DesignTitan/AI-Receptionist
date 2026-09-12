"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NavMascot } from "@/components/marketing/nav-mascot";
import profileIcon from "@/components/marketing/profile-icon.json";
import { TryCallPlate } from "@/components/marketing/try-call-plate";

const LINKS = [
  { href: "/features", label: "Features" },
  { href: "/#turn", label: "How it works" },
  { href: "/#industries", label: "Industries" },
  { href: "/#terms", label: "Pricing" },
];

export function SiteNav({ cta, simulated, turnstileSiteKey }: { cta: string; simulated: boolean; turnstileSiteKey: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [hidden, setHidden] = useState(false);
  const root = useRef<HTMLElement | null>(null);
  const callButton = useRef<HTMLButtonElement | null>(null);
  const accountButton = useRef<HTMLButtonElement | null>(null);
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
  }, [pathname]);

  useEffect(() => {
    if (!open && !menuOpen && !accountOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false); setMenuOpen(false); setAccountOpen(false);
        (open ? callButton : accountOpen ? accountButton : menuButton).current?.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) { setOpen(false); setMenuOpen(false); setAccountOpen(false); }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    if (open) root.current?.querySelector<HTMLInputElement>(".rc-nav__pop input")?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, [open, menuOpen, accountOpen]);

  return (
    <nav className="rc-nav rc-nav--traditional" aria-label="Site" ref={root} data-past-hero={pathname !== "/" || pastHero} data-hidden={hidden && !open && !menuOpen && !accountOpen} data-menu-open={menuOpen}>
      <button ref={menuButton} className="rc-nav__menu" aria-expanded={menuOpen} aria-controls="rc-site-links" onClick={() => { setMenuOpen(!menuOpen); setOpen(false); setAccountOpen(false); }}>Menu</button>
      <ul className="rc-nav__text-links" id="rc-site-links">
        {LINKS.map(link => <li key={link.href}><a href={link.href} aria-current={link.href === pathname ? "page" : undefined} onClick={() => setMenuOpen(false)}>{link.label}</a></li>)}
      </ul>
      <NavMascot />
      <div className="rc-nav__right">
        <div className="rc-nav__actions">
          <button ref={callButton} type="button" className="rc-nav__cta" aria-label="Let’s talk" title="Let’s talk" aria-expanded={open} aria-controls="rc-nav-pop" onClick={() => { setOpen(!open); setMenuOpen(false); setAccountOpen(false); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 7 7l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3.5 5.5a2 2 0 0 1 2-2Z"/></svg>
            <span>Let’s talk</span>
          </button>
          <div className="rc-nav__account" data-open={accountOpen}
            onPointerEnter={event => { if (event.pointerType === "mouse") { setAccountOpen(true); setMenuOpen(false); setOpen(false); } }}
            onPointerLeave={event => { if (!event.currentTarget.contains(document.activeElement)) setAccountOpen(false); }}
            onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setAccountOpen(false); }}>
            <button ref={accountButton} type="button" className="rc-nav__profile" aria-label="Account" aria-expanded={accountOpen} aria-controls="rc-account-options"
              onClick={() => { setAccountOpen(true); setMenuOpen(false); setOpen(false); }}
              onKeyDown={event => { if (event.key === "ArrowDown") { event.preventDefault(); setAccountOpen(true); requestAnimationFrame(() => root.current?.querySelector<HTMLAnchorElement>("#rc-account-options a")?.focus()); } }}>
              <svg viewBox={profileIcon.viewBox} aria-hidden="true">
                <defs><linearGradient id="rc-profile-mint" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f3fff9"/><stop offset=".5" stopColor="#bde8d5"/><stop offset="1" stopColor="#599f89"/></linearGradient></defs>
                <g className="rc-nav__profile-depth" transform="translate(2 3)">{profileIcon.paths.map((d, i) => <path d={d} key={i}/>)}</g>
                <g className="rc-nav__profile-face">{profileIcon.paths.map((d, i) => <path d={d} key={i}/>)}</g>
              </svg>
            </button>
            <div id="rc-account-options" className="rc-nav__account-options" hidden={!accountOpen}>
              <a href="/account/login">Log In <span aria-hidden="true">↗</span></a>
              <a href="/start">Sign Up <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
      </div>
      {open && <div className="rc-nav__pop" id="rc-nav-pop" role="dialog" aria-label={cta}>
        <div className="rc-nav__pop-head"><p>{simulated ? "Ask for a call" : "Have it call you"}</p><button type="button" aria-label="Close" onClick={() => { setOpen(false); callButton.current?.focus(); }}>×</button></div>
        <TryCallPlate simulated={simulated} turnstileSiteKey={turnstileSiteKey} compact />
      </div>}
    </nav>
  );
}
