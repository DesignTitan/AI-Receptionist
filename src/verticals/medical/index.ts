import { Calendar, Mail, PhoneRinging, PulseMark, Shield, Stethoscope } from "@/components/icons";
import type { Vertical } from "../types";
import { MEDICAL_ROSTER } from "./roster";
import { buildMedicalSeed } from "./seed";
import { MEDICAL_TERMS } from "./terms";

const BRAND = "Northlake Family Health";
const ARRIVAL = "arrive ten minutes early with photo ID and your insurance card";

/**
 * The reference vertical: a family clinic where the front desk calls you
 * back. Every string that was hardcoded across the app before verticals
 * existed lives here now, verbatim.
 */
export const medical: Vertical = {
  slug: "medical",
  brand: BRAND,
  brandEyebrow: "Same-day scheduling",
  tagline: "A family clinic where the front desk calls you back.",
  referencePrefix: "NL",
  theme: {
    displayFont: "editorial",
    swatch: { primary: "#0e7c72", onPrimary: "#ffffff", ink: "#0a1c24" },
  },
  terms: MEDICAL_TERMS,
  icons: { mark: PulseMark, provider: Stethoscope },

  voice: {
    agentName: "Ava",
    arrivalAdvice: ARRIVAL,
    newClientNote: " Mention that a new-patient intake form will be texted to them.",
    rules:
      "never give medical advice, never discuss test results or diagnoses, never take payment or insurance numbers over the phone. If asked a clinical question, say a member of the care team will follow up. Speak plainly and do not rush.",
    categoryFallback: "General practice",
  },

  copy: {
    meta: {
      title: "Book a doctor in under a minute",
      description:
        "Book with a Northlake physician online and get a confirmation call from our AI receptionist within sixty seconds — no hold music, no phone tag.",
      ogDescription: "Real appointments, confirmed by voice within a minute of booking.",
    },
    hero: {
      eyebrow: "AI front desk · confirmation call in under 60 seconds",
      headline: {
        line1: "Book your doctor.",
        line2Before: "We'll ",
        emphasis: "call to confirm",
        line2After: ".",
      },
      body: `No hold music, no phone tag, no voicemail that never gets returned. Choose a doctor and a time at ${BRAND}, and a voice assistant rings you back within the minute to lock it in.`,
      primaryCta: "Find a doctor",
      secondaryCta: "How it works",
      rosterBullet: "{count} physicians accepting patients",
      bullets: ["Same-week appointments", "Every call recorded and logged"],
    },
    stats: [
      ["58 sec", "Median time to confirmation call"],
      ["94%", "Bookings confirmed on the first call"],
      ["0", "Patients left on hold"],
      ["24/7", "The front desk never closes"],
    ],
    steps: [
      {
        icon: Stethoscope,
        title: "Pick your doctor",
        body: "Browse the roster with real availability — specialty, languages, consult fee and the next open slot, all on the card.",
      },
      {
        icon: Calendar,
        title: "Choose a time",
        body: "Live slots straight from the schedule, so nothing you can select is already taken. Booking takes about forty seconds.",
      },
      {
        icon: PhoneRinging,
        title: "We call to confirm",
        body: "Within a minute your phone rings. Our AI receptionist confirms the details, answers logistics, and notes anything you need changed.",
      },
    ],
    roster: {
      eyebrow: "Our doctors",
      title: "Care from people who stay",
      body: "Average tenure at Northlake is nine years. Pick the person you want to see — availability is live, so anything you can select is genuinely open.",
    },
    owner: {
      eyebrow: "For the practice",
      title: "Every booking, call and recording in one place",
      body: "Bookings land in Supabase, the confirmation call fires through your voice provider, and the outcome comes back with a recording, transcript and summary — plus an email to the owner the moment the call ends.",
      cta: "Open the staff dashboard",
      features: [
        {
          icon: PhoneRinging,
          title: "Voice provider of your choice",
          body: "Vapi, Bland.ai or OmniDimension — one env var switches the back end.",
        },
        {
          icon: Mail,
          title: "Owner notifications",
          body: "Patient details, outcome and a link to the recording, by email.",
        },
        {
          icon: Shield,
          title: "Locked-down data",
          body: "Row level security on every table; only the doctor roster is public.",
        },
      ],
    },
    faq: {
      eyebrow: "Questions",
      title: "Before you book",
      items: [
        {
          q: "Who actually calls me?",
          a: "An AI voice agent. It introduces itself as an automated assistant, confirms the appointment, and hands anything clinical or unusual to a human on the care team. You can ask it to reschedule and the front desk follows up with times.",
        },
        {
          q: "What if I miss the call?",
          a: "Nothing breaks. Your slot stays reserved and the practice sees a 'no answer' flag on the dashboard, so a person can follow up. You'll also get the details by email if you gave us one.",
        },
        {
          q: "Is the call recorded?",
          a: "Yes — the recording, transcript and summary are attached to your appointment so the clinic has an accurate record of what was agreed. This is a demonstration project, not a live medical service.",
        },
        {
          q: "Can I book for someone else?",
          a: "Book under the patient's name, but give the phone number that should receive the confirmation call. The agent asks who it is speaking to before confirming anything.",
        },
      ],
    },
    footer: {
      blurb:
        "A demonstration clinic for an AI front desk: patients book online, an AI receptionist calls to confirm, and every call is logged where the practice can see it.",
      clientsHeading: "Patients",
      operatorHeading: "Practice",
      asideHeading: "Urgent care",
      aside: "If this is a medical emergency, call your local emergency number instead of booking online.",
      disclaimer: "Fictional clinic. No real medical services are provided.",
    },
    callPreview: {
      subject: "Maya Thompson",
      phone: "+1 415 555 0142",
      lines: [
        { who: "Ava", text: `Hi Maya — this is Ava at ${BRAND}. This call is recorded.` },
        { who: "Maya", text: "Oh, hi." },
        { who: "Ava", text: "I'm confirming Thursday at 10:30 with Dr. Vasquez. Still good?" },
        { who: "Maya", text: "Yes, that works." },
        { who: "Ava", text: "You're all set. Arrive ten minutes early with your ID." },
      ],
    },
    confirmation: {
      footnote:
        "If plans change, tell the assistant when it calls, or contact the front desk with your reference number. This is a demonstration project — no real medical services are provided.",
    },
    callOutcomes: {
      confirmed: {
        title: "Confirmed by phone",
        body: `You're all set. Please ${ARRIVAL}.`,
        tone: "good",
      },
      rescheduled: {
        title: "Reschedule requested",
        body: "We've noted that this time doesn't work. The front desk will text you options shortly.",
        tone: "warn",
      },
      cancelled: {
        title: "Appointment cancelled",
        body: "This booking has been cancelled. You can book a new time whenever you're ready.",
        tone: "warn",
      },
      voicemail: {
        title: "We left a voicemail",
        body: "Your slot is still held. Call the clinic back or wait for our follow-up.",
        tone: "warn",
      },
      no_answer: {
        title: "We couldn't reach you",
        body: "Your slot is still held. Someone from the practice will try again shortly.",
        tone: "warn",
      },
      failed: {
        title: "The call didn't go through",
        body: "Your booking is safe — a member of the team will follow up by hand.",
        tone: "warn",
      },
    },
  },

  seed: { providers: MEDICAL_ROSTER, build: buildMedicalSeed },
};
