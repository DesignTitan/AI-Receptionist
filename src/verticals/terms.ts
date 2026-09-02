import type { VerticalSlug } from "@/lib/types";
import { MEDICAL_TERMS } from "./medical/terms";

export { noun, type NounForms, type Terms } from "./nouns";

/**
 * Client-safe registry of each vertical's vocabulary. Kept apart from the
 * full configs in `./index` so a client component can look up a prefix or a
 * label without pulling icons, voice scripts and seed rosters into the bundle.
 */
export const TERMS = { medical: MEDICAL_TERMS } satisfies Record<VerticalSlug, unknown>;
