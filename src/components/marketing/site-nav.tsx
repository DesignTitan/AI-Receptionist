"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { NavMascot } from "@/components/marketing/nav-mascot";
import profileIcon from "@/components/marketing/profile-icon.json";
import { TryCallPlate } from "@/components/marketing/try-call-plate";

const LINKS = [
  { href: "/#turn", label: "How it works" },
  { href: "/#industries", label: "Industries" },
  { href: "/#terms", label: "Pricing" },
];

const STAFF_PAGES = [
  { href: "/admin", label: "Appointments" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/roadmap", label: "Feature suggestions" },
  { href: "/admin/account-recovery", label: "Account recovery requests" },
  { href: "/admin/login", label: "Staff sign in" },
];
const PAGES = [
  { href: "/features", label: "Features" },
  { href: "/demos", label: "Demos" },
];

export function SiteNav({ cta, simulated, turnstileSiteKey, showCall = true, accountOptions, applicationLinks }: { cta: string; simulated: boolean; turnstileSiteKey: string | null; showCall?: boolean; accountOptions?: ReactNode; applicationLinks?: ReactNode }) {
  const pathname = usePathname();
  const [internalPages, setInternalPages] = useState<{ href: string; label: string }[]>([]);
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
    if (process.env.NODE_ENV !== "development") return;
    let cancelled = false;
    void fetch("/__dev/pages-data.json").then(r => r.json()).then(data => {
      if (cancelled || !Array.isArray(data.pages)) return;
      setInternalPages(data.pages.filter((page: { kind: string; access: string }) =>
        page.access === "development" && ["internal", "study"].includes(page.kind)));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

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
      <span className="rc-nav__glass" aria-hidden="true" style={{ backdropFilter: "blur(24px) saturate(150%)", WebkitBackdropFilter: "blur(24px) saturate(150%)" }} />
      <NavMascot />
      <ul className="rc-nav__text-links" aria-label="Homepage sections">
        {LINKS.map(link => <li key={link.href}><a href={pathname === "/" ? link.href.slice(1) : link.href}>{link.label}</a></li>)}
      </ul>
      <div className="rc-nav__right">
        <div className="rc-nav__actions">
          <button ref={menuButton} type="button" className="rc-nav__menu" aria-label="Browse site" aria-expanded={menuOpen} aria-controls="rc-site-menu" onClick={() => { setMenuOpen(!menuOpen); setOpen(false); setAccountOpen(false); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={menuOpen ? "m6 6 12 12M18 6 6 18" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
          {showCall && <button ref={callButton} type="button" className="rc-nav__cta" aria-label="Let’s talk" title="Let’s talk" aria-expanded={open} aria-controls="rc-nav-pop" onClick={() => { setOpen(!open); setMenuOpen(false); setAccountOpen(false); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 7 7l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3.5 5.5a2 2 0 0 1 2-2Z"/></svg>
            <span>Let’s talk</span>
          </button>}
          <div className="rc-nav__account" data-open={accountOpen}
            onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setAccountOpen(false); }}>
            <button ref={accountButton} type="button" className="rc-nav__profile" aria-label="Account" aria-expanded={accountOpen} aria-controls="rc-account-options"
              onClick={() => { setAccountOpen(!accountOpen); setMenuOpen(false); setOpen(false); }}
              onKeyDown={event => { if (event.key === "ArrowDown") { event.preventDefault(); setAccountOpen(true); requestAnimationFrame(() => root.current?.querySelector<HTMLAnchorElement>("#rc-account-options a")?.focus()); } }}>
              <svg viewBox={profileIcon.viewBox} aria-hidden="true">
                <g className="rc-nav__profile-face">{profileIcon.paths.map((d, i) => <path d={d} key={i}/>)}</g>
              </svg>
            </button>
            <div id="rc-account-options" className="rc-nav__account-options" hidden={!accountOpen}>
              {accountOptions ?? <><a href="/account/login">Log In <span aria-hidden="true">↗</span></a>
              <a href="/#terms">View plans <span aria-hidden="true">↗</span></a></>}
            </div>
          </div>
        </div>
      </div>
      <div id="rc-site-menu" className="rc-nav__site-menu" hidden={!menuOpen}>
        {applicationLinks}
        <p>Explore the site</p>
        {PAGES.map(link => <a key={link.href} href={link.href} aria-current={link.href === pathname ? "page" : undefined} onClick={() => setMenuOpen(false)}>{link.label}<span aria-hidden="true">↗</span></a>)}
        <p>Staff · sign-in required</p>
        {STAFF_PAGES.map(link => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}<span aria-hidden="true">↗</span></a>)}
        {internalPages.length > 0 && <><p>Internal tools · local only</p>{internalPages.map(link => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}<span aria-hidden="true">↗</span></a>)}</>}
        <div className="rc-nav__menu-sections"><p>Homepage sections</p>{LINKS.map(link => <a key={link.href} href={pathname === "/" ? link.href.slice(1) : link.href} onClick={() => setMenuOpen(false)}>{link.label}<span aria-hidden="true">↓</span></a>)}</div>
      </div>
      {showCall && open && <div className="rc-nav__pop" id="rc-nav-pop" role="dialog" aria-label={cta}>
        <div className="rc-nav__pop-head"><p>{simulated ? "Ask for a call" : "Have it call you"}</p><button type="button" aria-label="Close" onClick={() => { setOpen(false); callButton.current?.focus(); }}>×</button></div>
        <TryCallPlate simulated={simulated} turnstileSiteKey={turnstileSiteKey} compact />
      </div>}
    </nav>
  );
}
