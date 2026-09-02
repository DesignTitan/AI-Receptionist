import type { VerticalSlug } from "@/lib/types";
import { medical } from "./medical";
import { salon } from "./salon";
import type { Vertical } from "./types";

export type { CallOutcomeCopy, Icon, Vertical, VerticalCopy, VerticalVoice } from "./types";
export { TERMS, noun, type NounForms, type Terms } from "./terms";

/**
 * Every themed business the product can render. Adding one is a directory
 * under `src/verticals/`, a line here, a member on `VerticalSlug`, and two
 * palette blocks in globals.css — the closed record types make the compiler
 * the checklist.
 */
export const VERTICALS: Record<VerticalSlug, Vertical> = { medical, salon };
export const VERTICAL_SLUGS = Object.keys(VERTICALS) as VerticalSlug[];

export const getVertical = (slug: VerticalSlug): Vertical => VERTICALS[slug];

/** Lookup from an untrusted string (a route param). */
export const findVertical = (slug: string): Vertical | null =>
  (VERTICALS as Record<string, Vertical>)[slug] ?? null;

/** What the single-tenant routes render until `/demo/[vertical]` lands. */
export const DEFAULT_VERTICAL: Vertical = medical;
