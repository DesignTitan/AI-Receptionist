/**
 * Tier A vocabulary: the domain nouns that appear inline inside UI that is
 * otherwise identical across verticals ("Reason for visit", "I'm a new
 * patient", "Dr. "). Plain data with no functions, so client components can
 * import it and it can cross the RSC boundary as a prop.
 *
 * The rule for what belongs here versus in a vertical's `copy`: if swapping
 * the noun gives a sentence that reads naturally for a clinic, a salon and a
 * studio, it is a term. If the sentence should be *written differently* per
 * vertical, it is copy, authored three times. Three good sentences beat one
 * mediocre template.
 */
export type NounForms = { one: string; many: string; One: string; Many: string };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** All four forms precomputed so no call site does string surgery. */
export const noun = (one: string, many: string): NounForms => ({
  one,
  many,
  One: cap(one),
  Many: cap(many),
});

export type Terms = {
  provider: NounForms;
  client: NounForms;
  booking: NounForms;
  visit: NounForms;
  business: NounForms;
  /** Honorific in front of a provider's name — "Dr. " for a clinic, "" for a salon. */
  providerPrefix: string;
  /** What the roster is filtered by: "Specialty" / "Discipline". */
  providerCategory: string;
  allCategories: string;
  feeLabel: string;
  feeShort: string;
  educationLabel: string;
  hoursLabel: string;
  reasonLabel: string;
  reasonHint: string;
  reasonPlaceholder: string;
  newClientLabel: string;
  newClientHint: string;
  bookCta: string;
};
