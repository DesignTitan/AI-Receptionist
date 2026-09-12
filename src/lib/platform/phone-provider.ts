export const PHONE_PROVIDERS = {
  unknown: "I’m not sure yet",
  none: "I don’t have business phone service",
  comcast: "Comcast Business / Xfinity",
  tmobile: "T-Mobile",
  att: "AT&T",
  verizon: "Verizon",
  ringcentral: "RingCentral",
  nextiva: "Nextiva",
  vonage: "Vonage",
  zoom: "Zoom Phone",
  google: "Google Voice",
  other: "Another provider",
} as const;
export type PhoneProvider = keyof typeof PHONE_PROVIDERS;
export type PhoneSetup = {
  provider: PhoneProvider;
  serviceType: "unknown" | "business_line" | "cloud_phone" | "mobile";
  serviceName: string;
  bookingSystem: string;
};
export const DEFAULT_PHONE_SETUP: PhoneSetup = { provider: "unknown", serviceType: "unknown", serviceName: "", bookingSystem: "" };
export function validatePhoneSetup(value: unknown): PhoneSetup {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("Check your phone setup details.");
  const s = value as Record<string, unknown>;
  if (typeof s.provider !== "string" || !Object.hasOwn(PHONE_PROVIDERS, s.provider)) throw Error("Choose your phone provider, or select Not sure yet.");
  if (!["unknown", "business_line", "cloud_phone", "mobile"].includes(String(s.serviceType))) throw Error("Choose your phone service type.");
  const clean = (key: string) => {
    if (typeof s[key] !== "string" || s[key].length > 160) throw Error("Keep phone and booking software details under 160 characters.");
    return s[key].trim();
  };
  return { provider: s.provider as PhoneProvider, serviceType: s.serviceType as PhoneSetup["serviceType"], serviceName: clean("serviceName"), bookingSystem: clean("bookingSystem") };
}
export function phoneSetupGuidance(setup: PhoneSetup) {
  if (setup.provider === "none") return "That’s okay. We’ll help arrange your AI number and discuss how customers can reach you. You don’t need to choose a provider here.";
  if (setup.provider === "comcast") return "Check whether your account says Business VoiceEdge, Voice Mobility or Business Voice. The connection steps depend on that service.";
  if (setup.serviceType === "mobile" || setup.provider === "tmobile") return "We’ll test a separate AI answering number first, then help you choose which calls to forward from your mobile. A separate destination is needed to transfer callers to a person.";
  if (setup.provider === "unknown") return "You can continue. We’ll help identify your provider from your phone bill during setup.";
  return "We’ll review the forwarding or phone-system connection your service supports and test it with you before activation.";
}
