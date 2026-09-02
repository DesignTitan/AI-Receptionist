"use client";

import { useEffect, useState } from "react";

/** The chaptered-editorial nav: a folio in the margin, current chapter marked, clickable. */
export function Folio({ chapters }: { chapters: { id: string; n: string; title: string }[] }) {
  const [current, setCurrent] = useState(chapters[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    chapters.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [chapters]);
  return (
    <nav className="rc-folio" aria-label="Chapters">
      <ol>
        {chapters.map((c) => (
          <li key={c.id}>
            <a href={`#${c.id}`} aria-current={current === c.id ? "true" : undefined}>
              <span className="rc-folio__n">{c.n}</span>
              <span className="rc-folio__t">{c.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
