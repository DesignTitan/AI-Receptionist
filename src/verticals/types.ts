import type { ReactElement, SVGProps } from "react";
import type { Appointment, CallLog, Client, Provider, VerticalSlug } from "@/lib/types";
import type { Terms } from "./nouns";

export type Icon = (props: SVGProps<SVGSVGElement>) => ReactElement;

export type CallOutcomeCopy = Record<string, { title: string; body: string; tone: "good" | "warn" }>;

/** Tier B — authored prose. Never produced by substituting nouns into a shared sentence. */
export type VerticalCopy = {
  meta: { title: string; description: string; ogDescription: string };
  hero: {
    eyebrow: string;
    headline: { line1: string; line2Before: string; emphasis: string; line2After: string };
    body: string;
    primaryCta: string;
    secondaryCta: string;
    /** Rendered with `{count}` replaced by the number of active providers. */
    rosterBullet: string;
    bullets: string[];
  };
  stats: [value: string, label: string][];
  steps: { icon: Icon; title: string; body: string }[];
  roster: { eyebrow: string; title: string; body: string };
  owner: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    features: { icon: Icon; title: string; body: string }[];
  };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  footer: {
    blurb: string;
    clientsHeading: string;
    operatorHeading: string;
    asideHeading: string;
    aside: string;
    disclaimer: string;
  };
  callPreview: { subject: string; phone: string; lines: { who: string; text: string }[] };
  confirmation: { footnote: string };
  callOutcomes: CallOutcomeCopy;
};

/** Tier B for the phone agent. The script's structure is shared; these are the parts that aren't. */
export type VerticalVoice = {
  agentName: string;
  /** Imperative clause: "arrive ten minutes early with photo ID". Used by the agent, the simulator, the .ics and the confirmation page. */
  arrivalAdvice: string;
  /** Appended to the agent's confirmation step for first-time clients. Empty string to skip. */
  newClientNote: string;
  /** The whole "Rules:" paragraph — a clinic carries the no-medical-advice rule, a salon doesn't. */
  rules: string;
  /** Shown as the provider's category when the roster row has none. */
  categoryFallback: string;
};

export type Vertical = {
  slug: VerticalSlug;
  brand: string;
  brandEyebrow: string;
  /** One line for the marketing demo card. */
  tagline: string;
  /** "NL" → references like NL-7QK4M2. */
  referencePrefix: string;
  theme: {
    displayFont: "editorial" | "fashion" | "technical";
    /** Literal hex for the contexts CSS variables cannot reach: email HTML, marketing swatches. */
    swatch: { primary: string; onPrimary: string; ink: string };
  };
  terms: Terms;
  /** The only two domain-bound glyphs: the brand mark and the "who you see" icon. */
  icons: { mark: Icon; provider: Icon };
  voice: VerticalVoice;
  copy: VerticalCopy;
  seed: {
    providers: Provider[];
    build: (now: number) => { clients: Client[]; appointments: Appointment[]; calls: CallLog[] };
  };
};
