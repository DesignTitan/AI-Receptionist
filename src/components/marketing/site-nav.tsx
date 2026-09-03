"use client";

import { useEffect, useState } from "react";
import { PRODUCT_NAME } from "@/components/marketing/product-chrome";

const LINKS = [
  { id: "features", label: "Features" },
  { id: "proof", label: "Proof" },
  { id: "industries", label: "Industries" },
  { id: "terms", label: "Pricing" },
];

/**
 * The floating navigation: a centred pill at the top of the page with the
 * brand, four chapter links and the one call to action. It marks the chapter
 * under the reader the same way the margin folio does.
 */
export function SiteNav({ cta }: { cta: string }) {
  const [current, setCurrent] = useState<string | null>(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    [...LINKS.map((l) => l.id), "desk", "cost", "turn", "hear"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return (
    <nav className="rc-nav" aria-label="Site">
      <a className="rc-nav__brand" href="#desk"><i aria-hidden />{PRODUCT_NAME}</a>
      <ul className="rc-nav__links">
        {LINKS.map((l) => (
          <li key={l.id}>
            <a href={`#${l.id}`} aria-current={current === l.id ? "true" : undefined}>{l.label}</a>
          </li>
        ))}
      </ul>
      <a className="rc-nav__cta" href="#hear">{cta}</a>
    </nav>
  );
}
