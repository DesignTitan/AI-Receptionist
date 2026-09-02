import { Calendar, Layers, Mail, PhoneRinging, Shield, Sparkle } from "@/components/icons";
import type { Vertical } from "../types";
import { STUDIO_ROSTER } from "./roster";
import { buildStudioSeed } from "./seed";
import { STUDIO_TERMS } from "./terms";

const BRAND = "Halide Studio";
const ARRIVAL = "have a link to anything you'd like the director to look at beforehand";

/**
 * A brand and design studio: proof the product reaches past personal
 * services. What you book is a paid discovery session with the director who
 * would actually lead your project.
 */
export const studio: Vertical = {
  slug: "studio",
  brand: BRAND,
  brandEyebrow: "Brand · product · motion",
  tagline: "A design studio where the first conversation is about the work.",
  referencePrefix: "HS",
  theme: {
    displayFont: "technical",
    swatch: { primary: "#161616", onPrimary: "#f4f4f1", ink: "#141414" },
  },
  terms: STUDIO_TERMS,
  icons: { mark: Layers, provider: Sparkle },

  voice: {
    agentName: "Jules",
    arrivalAdvice: ARRIVAL,
    newClientNote: " Mention that a short brief form will be emailed to them.",
    rules:
      "never quote a project fee or a timeline over the phone — say the director will scope it in the session and follow up in writing. Never discuss other clients' work. If asked whether the studio can take the project on, say the director will answer that in the session. Speak plainly and do not oversell.",
    categoryFallback: "Creative",
  },

  copy: {
    meta: {
      title: "Book a session with a director",
      description:
        "Book a discovery session with a Halide director online and get a confirmation call from our assistant within sixty seconds — no back-and-forth, no scheduling links.",
      ogDescription: "Real sessions, confirmed by voice within a minute of booking.",
    },
    hero: {
      eyebrow: "AI front desk · confirmation call in under 60 seconds",
      headline: {
        line1: "Book a director.",
        line2Before: "We'll ",
        emphasis: "call to confirm",
        line2After: ".",
      },
      body: `Skip the "does Thursday work?" thread. Pick the director who'd lead your project, choose a time, and ${BRAND}'s assistant calls within the minute to confirm — so the first conversation is about the work.`,
      primaryCta: "Find a director",
      secondaryCta: "How it works",
      rosterBullet: "{count} directors taking sessions",
      bullets: ["Sessions this week", "Every call recorded and logged"],
    },
    stats: [
      ["58 sec", "Median time to confirmation call"],
      ["94%", "Sessions confirmed on the first call"],
      ["0", "Scheduling emails"],
      ["24/7", "The front desk never closes"],
    ],
    steps: [
      {
        icon: Layers,
        title: "Pick your director",
        body: "Browse the leads by discipline — brand, product, motion, content, build — with real availability on every card.",
      },
      {
        icon: Calendar,
        title: "Choose a time",
        body: "Live slots straight from the studio calendar, so nothing you can select is already taken. Booking takes about forty seconds.",
      },
      {
        icon: PhoneRinging,
        title: "We call to confirm",
        body: "Within a minute your phone rings. Our assistant confirms the details, asks what you'd like the director to see first, and notes anything you'd like changed.",
      },
    ],
    roster: {
      eyebrow: "Our directors",
      title: "Talk to the person who'd actually do the work",
      body: "No account managers in between. Every session is with the director who would lead your project — availability is live, so anything you can select is genuinely open.",
    },
    owner: {
      eyebrow: "For the studio",
      title: "Every session, call and recording in one place",
      body: "Sessions land in your dashboard, the confirmation call goes out on its own, and the outcome comes back with a recording, transcript and summary — plus an email the moment the call ends.",
      cta: "Open the studio dashboard",
      features: [
        {
          icon: PhoneRinging,
          title: "No scheduling threads",
          body: "The assistant confirms while your directors stay in the work.",
        },
        {
          icon: Mail,
          title: "Owner notifications",
          body: "Client details, outcome and a link to the recording, by email.",
        },
        {
          icon: Shield,
          title: "Client list stays private",
          body: "Nothing is shared; only the directors' profiles are public.",
        },
      ],
    },
    faq: {
      eyebrow: "Questions",
      title: "Before you book",
      items: [
        {
          q: "Who actually calls me?",
          a: "An AI voice assistant. It introduces itself as automated, confirms the session, and passes anything unusual to the studio. You can ask it to reschedule and someone follows up with times.",
        },
        {
          q: "Is the session free?",
          a: "It's a paid discovery session, credited against the project if we go ahead. That keeps the calendar for people who are serious, and it means you get a director's full attention rather than a sales pitch.",
        },
        {
          q: "Can it tell me what a project would cost?",
          a: "No — and neither will we, until we've understood it. The director will scope it in the session and follow up in writing.",
        },
        {
          q: "Is the call recorded?",
          a: "Yes — the recording, transcript and summary are attached to your session so the studio has an accurate record of what was agreed. This is a demonstration project, not a real studio.",
        },
      ],
    },
    footer: {
      blurb:
        "A demonstration studio for an AI front desk: clients book sessions online, an assistant calls to confirm, and every call is logged where the team can see it.",
      clientsHeading: "Clients",
      operatorHeading: "Studio",
      asideHeading: "Working remotely?",
      aside: "Most sessions are video calls. The link arrives with your confirmation email; in-studio is by arrangement.",
      disclaimer: "Fictional studio. No real services are provided.",
    },
    callPreview: {
      subject: "Nadia Feld",
      phone: "+1 415 555 0134",
      lines: [
        { who: "Jules", text: `Hi Nadia — this is Jules at ${BRAND}. This call is recorded.` },
        { who: "Nadia", text: "Hi." },
        { who: "Jules", text: "I'm confirming Tuesday at 11:00 with Mira, about the rebrand. Still good?" },
        { who: "Nadia", text: "Yes, that works." },
        { who: "Jules", text: "Great. If there's a deck you'd like Mira to see first, reply with a link." },
      ],
    },
    confirmation: {
      footnote:
        "If plans change, tell the assistant when it calls, or email the studio with your reference number. This is a demonstration project — no real services are provided.",
    },
    callOutcomes: {
      confirmed: {
        title: "Confirmed by phone",
        body: `You're all set. Please ${ARRIVAL}.`,
        tone: "good",
      },
      rescheduled: {
        title: "Reschedule requested",
        body: "We've noted that this time doesn't work. The studio will email you options shortly.",
        tone: "warn",
      },
      cancelled: {
        title: "Session cancelled",
        body: "This session has been cancelled. You can book a new time whenever you're ready.",
        tone: "warn",
      },
      voicemail: {
        title: "We left a voicemail",
        body: "Your slot is still held. Call the studio back or wait for our follow-up.",
        tone: "warn",
      },
      no_answer: {
        title: "We couldn't reach you",
        body: "Your slot is still held. Someone from the studio will try again shortly.",
        tone: "warn",
      },
      failed: {
        title: "The call didn't go through",
        body: "Your session is safe — a member of the team will follow up by hand.",
        tone: "warn",
      },
    },
  },

  seed: { providers: STUDIO_ROSTER, build: buildStudioSeed },
};
