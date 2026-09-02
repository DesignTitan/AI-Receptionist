import type { VerticalSlug } from "@/lib/types";

/**
 * The slugs, without the configs. Safe for the proxy and client bundles,
 * which must not pull icons, seed rosters and voice scripts along.
 */
export const VERTICAL_SLUGS = ["medical", "salon", "studio"] as const satisfies readonly VerticalSlug[];

// Compile-time completeness: adding a member to VerticalSlug without listing it here fails here.
type Missing = Exclude<VerticalSlug, (typeof VERTICAL_SLUGS)[number]>;
const complete: [Missing] extends [never] ? true : never = true;
void complete;

export const isVerticalSlug = (value: string | undefined): value is VerticalSlug =>
  !!value && (VERTICAL_SLUGS as readonly string[]).includes(value);

/**
 * Single-tenant mode. A customer's own deployment sets NEXT_PUBLIC_TENANT to
 * its slug at build time: that business renders at `/`, the product site and
 * the other demos disappear. Unset (the product deployment) keeps everything.
 * Build-time because client bundles inline NEXT_PUBLIC_* and each customer is
 * its own build anyway.
 */
export const TENANT_SLUG: VerticalSlug | null = isVerticalSlug(process.env.NEXT_PUBLIC_TENANT)
  ? process.env.NEXT_PUBLIC_TENANT
  : null;
