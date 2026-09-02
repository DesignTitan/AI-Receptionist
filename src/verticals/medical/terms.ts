import { noun, type Terms } from "../nouns";

export const MEDICAL_TERMS: Terms = {
  provider: noun("doctor", "doctors"),
  client: noun("patient", "patients"),
  booking: noun("appointment", "appointments"),
  visit: noun("visit", "visits"),
  business: noun("clinic", "clinics"),
  providerPrefix: "Dr. ",
  providerCategory: "Specialty",
  allCategories: "All specialties",
  feeLabel: "Consultation",
  feeShort: "consult",
  educationLabel: "Training",
  hoursLabel: "Clinic hours",
  reasonLabel: "Reason for visit",
  reasonHint: "Optional. Please don't include sensitive medical detail.",
  reasonPlaceholder: "Annual physical and a question about my iron levels.",
  newClientLabel: "I'm a new patient.",
  newClientHint: "We'll text an intake form before the visit.",
  bookCta: "Book an appointment",
};
