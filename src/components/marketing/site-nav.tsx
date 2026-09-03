"use client";

import { useEffect, useRef, useState } from "react";
import { PRODUCT_NAME } from "@/components/marketing/product-chrome";
import { TryCallPlate } from "@/components/marketing/try-call-plate";

const I = {
  features: <svg viewBox="0 0 24 24" aria-hidden><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></svg>,
  proof: <svg viewBox="0 0 24 24" aria-hidden><path d="M3 12h2l2-5 3 10 3-14 3 14 2-5h3"/></svg>,
  industries: <svg viewBox="0 0 24 24" aria-hidden><path d="M4 10 5.2 5h13.6L20 10"/><path d="M4 10c0 1.4 1.1 2.5 2.5 2.5S9 11.4 9 10c0 1.4 1.1 2.5 2.5 2.5S14 11.4 14 10c0 1.4 1.1 2.5 2.5 2.5S20 11.4 20 10"/><path d="M5.5 12.5V20h13v-7.5M10 20v-5h4v5"/></svg>,
  terms: <svg viewBox="0 0 24 24" aria-hidden><path d="M3.5 12.5V5a1.5 1.5 0 0 1 1.5-1.5h7.5l8 8-9 9-8-8Z"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>,
  call: <svg viewBox="0 0 24 24" aria-hidden><path d="M5.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 7 7l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3.5 5.5a2 2 0 0 1 2-2Z"/></svg>,
  close: <svg viewBox="0 0 24 24" aria-hidden><path d="M6 6l12 12M18 6 6 18"/></svg>,
};

const LINKS = [
  { id: "desk", label: PRODUCT_NAME, icon: <i className="rc-nav__dot" aria-hidden /> },
  { id: "features", label: "Features", icon: I.features },
  { id: "proof", label: "Proof", icon: I.proof },
  { id: "industries", label: "Industries", icon: I.industries },
  { id: "terms", label: "Pricing", icon: I.terms },
];

/**
 * The floating navigation: a soft pill of icon tabs (home, then four chapters)
 * where only the current one shows its label in a raised white tab, and beside
 * it a round accent button, the one call to action. The call button opens a small dropdown with the real "ask for a
 * call" form: name, number, what you run, the human check. Same form, same
 * server, same honesty as the plate in chapter six.
 */
export function SiteNav({ cta, simulated, turnstileSiteKey }: { cta: string; simulated: boolean; turnstileSiteKey: string | null }) {
  const [current, setCurrent] = useState<string>("desk");
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    [...LINKS.map((l) => l.id), "cost", "turn", "hear"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onDown = (e: MouseEvent) => { if (root.current && !root.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    const first = root.current?.querySelector<HTMLInputElement>(".rc-nav__pop input");
    first?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, [open]);

  return (
    <nav className="rc-nav" aria-label="Site" ref={root}>
      {/* icon tabs; only the current chapter carries its label, in a raised white tab */}
      <ul className="rc-nav__pill rc-nav__links">
        {LINKS.map((l) => (
          <li key={l.id}>
            <a href={`#${l.id}`} aria-label={l.label} aria-current={current === l.id ? "true" : undefined}>{l.icon}<span>{l.label}</span></a>
          </li>
        ))}
      </ul>
      <button type="button" className="rc-nav__cta" aria-label={cta} title={cta} aria-expanded={open} aria-controls="rc-nav-pop" onClick={() => setOpen((v) => !v)}>
        {I.call}
      </button>
      {open && (
        <div className="rc-nav__pop" id="rc-nav-pop" role="dialog" aria-label={cta}>
          <div className="rc-nav__pop-head">
            <p>{simulated ? "Ask for a call" : "Have it call you"}</p>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)}>{I.close}</button>
          </div>
          <TryCallPlate simulated={simulated} turnstileSiteKey={turnstileSiteKey} compact />
        </div>
      )}
    </nav>
  );
}
