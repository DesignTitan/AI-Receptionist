"use client";

import { useLayoutEffect } from "react";
import type { VerticalSlug } from "@/lib/types";

/**
 * Puts `data-vertical` on <html> so a demo renders in its own palette and
 * display face. Two mechanisms, because the root layout does not re-render
 * on client-side navigation:
 *
 * - an inline script for hard loads, which runs before the demo's markup is
 *   parsed so there is no flash of the product palette;
 * - a layout effect for soft navigations, which also removes the attribute
 *   on unmount, so leaving a demo for /admin returns to the product palette
 *   without any other layout having to know.
 */
export function VerticalTheme({ slug }: { slug: VerticalSlug }) {
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-vertical", slug);
    return () => document.documentElement.removeAttribute("data-vertical");
  }, [slug]);

  // `slug` was validated against the registry by resolveVertical(), so this
  // is a closed set of known strings, not an injection surface.
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.setAttribute('data-vertical','${slug}')`,
      }}
    />
  );
}
