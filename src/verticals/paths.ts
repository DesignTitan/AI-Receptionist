import type { VerticalSlug } from "@/lib/types";

/**
 * Every URL a themed demo links to, so the `/demo/<slug>` prefix lives in
 * exactly one place. Pure — safe to import from client components.
 */
export function demoPaths(slug: VerticalSlug) {
  const base = `/demo/${slug}`;
  return {
    home: base,
    roster: `${base}#providers`,
    howItWorks: `${base}#how-it-works`,
    questions: `${base}#questions`,
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
