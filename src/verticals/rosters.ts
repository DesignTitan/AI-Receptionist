import { MEDICAL_ROSTER } from "./medical/roster.ts";
import { SALON_ROSTER } from "./salon/roster.ts";
import { STUDIO_ROSTER } from "./studio/roster.ts";

/**
 * Every vertical's roster, for `scripts/generate-seed-sql.ts`. Roster modules
 * carry only type imports, so plain Node can run this without a build step —
 * which is why this file exists instead of the script importing `./index`.
 */
export const ROSTERS = [MEDICAL_ROSTER, SALON_ROSTER, STUDIO_ROSTER];
