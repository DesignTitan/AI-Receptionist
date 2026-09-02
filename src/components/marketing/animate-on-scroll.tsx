"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Starts each `.animate-on-scroll` element's entrance animation the first
 * time it scrolls into view (see the matching rules in globals.css). One
 * shared observer; elements already in view on mount fire immediately, so
 * above-the-fold content isn't held back. Re-scans on client navigation.
 * The <noscript> style keeps everything visible when JS never runs.
 */
const ONCE = true;

export function AnimateOnScroll({ selector = ".animate-on-scroll" }: { selector?: string }) {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("animate");
          if (ONCE) io.unobserve(entry.target);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll(selector).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname, selector]);

  return (
    <noscript>
      <style>{`.animate-on-scroll{animation:none!important}`}</style>
    </noscript>
  );
}
