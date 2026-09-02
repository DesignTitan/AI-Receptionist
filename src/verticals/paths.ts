import type { VerticalSlug } from "@/lib/types";
import { TENANT_SLUG } from "./slugs";

/**
 * Every URL a themed demo links to, so the `/demo/<slug>` prefix lives in
 * exactly one place. Pure — safe to import from client components.
 */
export function demoPaths(slug: VerticalSlug) {
  // On a customer's own deployment their business lives at the root.
  const own = TENANT_SLUG === slug;
  const base = own ? "" : `/demo/${slug}`;
  const home = own ? "/" : base;
  return {
    home,
    roster: `${home}#providers`,
    howItWorks: `${home}#how-it-works`,
    questions: `${home}#questions`,
    book: (providerSlug: string) => `${base}/book/${providerSlug}`,
    confirmation: (id: string, reference: string) =>
      `${base}/confirmation/${id}?ref=${encodeURIComponent(reference)}`,
    api: {
      availability: `/api/demo/${slug}/availability`,
      bookings: `/api/demo/${slug}/bookings`,
    },
  };
}

export type DemoPaths = ReturnType<typeof demoPaths>;
