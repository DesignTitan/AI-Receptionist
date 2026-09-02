import { Calendar, Mail, PhoneRinging, Scissors, Shield, Sparkle } from "@/components/icons";
import type { Vertical } from "../types";
import { SALON_ROSTER } from "./roster";
import { buildSalonSeed } from "./seed";
import { SALON_TERMS } from "./terms";

const BRAND = "Solstice Salon & Spa";
const ARRIVAL = "arrive five minutes early so we can start on time";

/** A salon and spa: the proof that the product is not a clinic tool. */
export const salon: Vertical = {
  slug: "salon",
  brand: BRAND,
  brandEyebrow: "Hair · skin · massage",
  tagline: "A salon where nobody sits on hold with wet hair.",
  referencePrefix: "SS",
  theme: {
    displayFont: "fashion",
    swatch: { primary: "#b0475c", onPrimary: "#ffffff", ink: "#231a1d" },
  },
  terms: SALON_TERMS,
  icons: { mark: Sparkle, provider: Scissors },

  voice: {
    agentName: "Robin",
    arrivalAdvice: ARRIVAL,
    newClientNote: " Mention that a short consultation form will be texted to them.",
    rules:
      "never quote a final price for colour work over the phone — say the stylist will confirm at the consultation. Never take payment details over the phone. If asked about a product reaction or a skin concern, say the salon will call back. Speak warmly and do not rush.",
    categoryFallback: "Hair & beauty",
  },

  copy: {
    meta: {
      title: "Book your stylist in under a minute",
      description:
        "Book colour, cuts, facials and massage at Solstice online and get a confirmation call from our assistant within sixty seconds — no hold music, no phone tag.",
      ogDescription: "Real appointments, confirmed by voice within a minute of booking.",
    },
    hero: {
      eyebrow: "AI front desk · confirmation call in under 60 seconds",
      headline: {
        line1: "Book your stylist.",
        line2Before: "We'll ",
        emphasis: "call to confirm",
        line2After: ".",
      },
      body: `Colour, cuts, facials and massage, booked in under a minute — and a real confirmation call before you've put your phone down. Pick your person and a time at ${BRAND}; our assistant rings you back to lock it in.`,
      primaryCta: "Find a stylist",
      secondaryCta: "How it works",
      rosterBullet: "{count} stylists taking bookings",
      bullets: ["Same-week appointments", "Every call recorded and logged"],
    },
    stats: [
      ["58 sec", "Median time to confirmation call"],
      ["94%", "Bookings confirmed on the first call"],
      ["0", "Guests left on hold"],
      ["24/7", "The front desk never closes"],
    ],
    steps: [
      {
        icon: Scissors,
        title: "Pick your stylist",
        body: "Browse the team by specialty — colour, cuts, skin, massage — with real availability and starting prices on every card.",
      },
      {
        icon: Calendar,
        title: "Choose a time",
        body: "Live slots straight from the book, so nothing you can select is already taken. Booking takes about forty seconds.",
      },
      {
        icon: PhoneRinging,
        title: "We call to confirm",
        body: "Within a minute your phone rings. Our assistant confirms the details, answers logistics, and notes anything you'd like changed.",
      },
    ],
    roster: {
      eyebrow: "Our stylists",
      title: "People who remember how you like it",
      body: "Most of the team has been at Solstice for over five years. Pick the person you want — availability is live, so anything you can select is genuinely open.",
    },
    owner: {
      eyebrow: "For the salon",
      title: "Every booking, call and recording in one place",
      body: "Bookings land in your dashboard, the confirmation call goes out on its own, and the outcome comes back with a recording, transcript and summary — plus an email the moment the call ends.",
      cta: "Open the staff dashboard",
      features: [
        {
          icon: PhoneRinging,
          title: "No more phone tag",
          body: "The assistant handles confirmations while your hands are busy.",
        },
        {
          icon: Mail,
          title: "Owner notifications",
          body: "Guest details, outcome and a link to the recording, by email.",
        },
        {
          icon: Shield,
          title: "Your guest list stays yours",
          body: "Nothing is shared; only the team roster is public.",
        },
      ],
    },
    faq: {
      eyebrow: "Questions",
      title: "Before you book",
      items: [
        {
          q: "Who actually calls me?",
          a: "An AI voice assistant. It introduces itself as automated, confirms the appointment, and passes anything unusual to the front desk. You can ask it to reschedule and the salon follows up with times.",
        },
        {
          q: "What if I miss the call?",
          a: "Nothing breaks. Your slot stays reserved and the salon sees a 'no answer' flag, so a person can follow up. You'll also get the details by email if you gave us one.",
        },
        {
          q: "Can it quote me a price for colour?",
          a: "It will tell you the starting price. Colour work is priced at the consultation once your stylist has seen your hair — the assistant won't guess.",
        },
        {
          q: "Is the call recorded?",
          a: "Yes — the recording, transcript and summary are attached to your appointment so the salon has an accurate record of what was agreed. This is a demonstration project, not a real salon.",
        },
      ],
    },
    footer: {
      blurb:
        "A demonstration salon for an AI front desk: guests book online, an assistant calls to confirm, and every call is logged where the team can see it.",
      clientsHeading: "Guests",
      operatorHeading: "Salon",
      asideHeading: "Running late?",
      aside: "Tell the assistant when it calls, or text the salon — we hold your slot for ten minutes.",
      disclaimer: "Fictional salon. No real services are provided.",
    },
    callPreview: {
      subject: "Jade Okafor",
      phone: "+1 415 555 0198",
      lines: [
        { who: "Robin", text: `Hi Jade — this is Robin at ${BRAND}.` },
        { who: "Jade", text: "Oh, hi!" },
        { who: "Robin", text: "I'm confirming Saturday at 2:00 with Sasha for balayage. Still good?" },
        { who: "Jade", text: "Yes, perfect." },
        { who: "Robin", text: "Lovely. Come five minutes early and we'll get you a coffee." },
      ],
    },
    confirmation: {
      footnote:
        "If plans change, tell the assistant when it calls, or text the salon with your reference number. This is a demonstration project — no real services are provided.",
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
        body: "Your slot is still held. Call the salon back or wait for our follow-up.",
        tone: "warn",
      },
      no_answer: {
        title: "We couldn't reach you",
        body: "Your slot is still held. Someone from the salon will try again shortly.",
        tone: "warn",
      },
      failed: {
        title: "The call didn't go through",
        body: "Your booking is safe — a member of the team will follow up by hand.",
        tone: "warn",
      },
    },
  },

  seed: { providers: SALON_ROSTER, build: buildSalonSeed },
};
