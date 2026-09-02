"use client";

import { useEffect, useRef } from "react";

type Engine = { mount: (root: Element | Document) => unknown };

/**
 * Mounts the scrollcraft engine on this subtree after hydration. The engine is
 * a browser-only IIFE, so it is imported inside the effect rather than at
 * module scope (client components still render on the server). Fonts change
 * every measured height, so it re-lays out once they settle.
 */
export function ScrollCraftMount({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let inst: { destroy?: () => void } | undefined;
    let cancelled = false;
    (async () => {
      await import("@/vendor/scrollcraft/scrollcraft.js");
      if (cancelled || !ref.current) return;
      const engine = (window as unknown as { ScrollCraft?: Engine }).ScrollCraft;
      inst = engine?.mount(ref.current) as typeof inst;
      const relayout = () => dispatchEvent(new Event("resize"));
      document.fonts?.ready.then(relayout);
      addEventListener("load", relayout, { once: true });
    })();
    return () => {
      cancelled = true;
      inst?.destroy?.();
    };
  }, []);

  return <div ref={ref} className="rc">{children}</div>;
}
