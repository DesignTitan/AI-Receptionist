import { noun, type Terms } from "../nouns";

export const SALON_TERMS: Terms = {
  provider: noun("stylist", "stylists"),
  client: noun("guest", "guests"),
  booking: noun("appointment", "appointments"),
  visit: noun("visit", "visits"),
  business: noun("salon", "salons"),
  providerPrefix: "",
  providerCategory: "Specialty",
  allCategories: "All specialties",
  feeLabel: "Starting price",
  feeShort: "and up",
  educationLabel: "Trained at",
  hoursLabel: "Salon hours",
  reasonLabel: "What are you booking?",
  reasonHint: "Optional. Colour, cut, facial — whatever you have in mind.",
  reasonPlaceholder: "Balayage refresh and a trim.",
  newClientLabel: "I'm a new guest.",
  newClientHint: "We'll text a short consultation form before your visit.",
  bookCta: "Book an appointment",
};
