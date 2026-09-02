import { noun, type Terms } from "../nouns";

export const STUDIO_TERMS: Terms = {
  provider: noun("director", "directors"),
  client: noun("client", "clients"),
  booking: noun("session", "sessions"),
  visit: noun("session", "sessions"),
  business: noun("studio", "studios"),
  providerPrefix: "",
  providerCategory: "Discipline",
  allCategories: "All disciplines",
  feeLabel: "Discovery session",
  feeShort: "per session",
  educationLabel: "Background",
  hoursLabel: "Studio hours",
  reasonLabel: "What are you working on?",
  reasonHint: "Optional. A sentence or a link is plenty.",
  reasonPlaceholder: "Rebrand ahead of a Series A — name, identity and site by spring.",
  newClientLabel: "We haven't worked together before.",
  newClientHint: "We'll send a short brief form before the session.",
  bookCta: "Book a session",
};
