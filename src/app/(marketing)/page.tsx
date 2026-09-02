import type { Metadata } from "next";
import { CallPreview } from "@/components/call-preview";
import { ArrowRight, Calendar, Mail, PhoneRinging, Shield, Waveform } from "@/components/icons";
import { Faq, Hero, SplitFeature, StatStrip, StepGrid } from "@/components/marketing/blocks";
import { DemoCards } from "@/components/marketing/demo-cards";
import { HeroVideo } from "@/components/marketing/hero-video";
import { Industries } from "@/components/marketing/industries";
import { PRODUCT_NAME } from "@/components/marketing/product-chrome";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { VERTICALS } from "@/verticals";

export const metadata: Metadata = {
  title: { absolute: `${PRODUCT_NAME} · The front desk that calls back` },
  description:
    "A booking page and an AI front desk for clinics, salons, studios — any business that runs on appointments. Clients book online; the assistant phones within a minute to confirm; every call is logged.",
};

const STEPS = [
  {
    icon: Calendar,
    title: "Your bookable team",
    body: "Load your people, their hours and what they offer. Your booking page is live the same day, in your name and your colours.",
  },
  {
    icon: PhoneRinging,
    title: "They book, we call",
    body: "Within a minute of every booking the assistant rings the client to confirm — and takes reschedules and cancellations on the call, no phone tag.",
  },
  {
    icon: Waveform,
    title: "Every call, logged",
    body: "Recording, transcript and a one-line summary land in your dashboard and your inbox the moment the call ends. Nothing is lost to voicemail.",
  },
];

const FAQ = [
  {
    q: "Who actually makes the call?",
    a: "An AI voice agent, on the voice provider you choose. It introduces itself as automated, confirms the booking, handles reschedules and cancellations, and passes anything unusual to a person. Every call is recorded and transcribed.",
  },
  {
    q: "Can it sync with my calendar or practice software?",
    a: "Not yet — it's the next thing we build, and if you need it, you'll be the reason. Today every booking lands in your dashboard and your inbox within seconds, so nothing is lost; it just isn't written into your other system automatically.",
  },
  {
    q: "Does it replace my website?",
    a: "It doesn't have to. Run it as your booking page on its own address and point 'Book now' at it, or let it be the whole site if you'd rather. An embeddable widget is on the roadmap.",
  },
  {
    q: "What happens when a client doesn't pick up?",
    a: "The slot stays held, the booking is flagged 'no answer' in your dashboard, and a person can follow up — or you can have the assistant try again with one click.",
  },
  {
    q: "How do I get started?",
    a: "Try the three demos. They're real: book a slot, take the call, then open the shared dashboard and watch it land. Then get in touch and we'll set up a page for your business.",
  },
];

export default function HomePage() {
  const contact = env.contactEmail;
  return (
    <main id="main">
      <Hero
        eyebrow="An AI front desk for any business that takes bookings"
        headline={{
          line1: "Stop losing bookings",
          line2Before: "to ",
          emphasis: "voicemail",
          line2After: ".",
        }}
        body={`${PRODUCT_NAME} gives clinics, salons, studios — anyone who runs on appointments — a booking page and a front desk that phones every client within a minute to confirm, then logs the call where you can see it.`}
        primary={{ label: "See the live demos", href: "/demos" }}
        secondary={{ label: "How it works", href: "#how-it-works" }}
        bullets={[
          "Three live demos you can book right now",
          "Recording, transcript and summary on every call",
          "Vapi, Bland or OmniDimension under the hood",
        ]}
        aside={<CallPreview preview={VERTICALS.medical.copy.callPreview} />}
        background={<HeroVideo />}
      />

      <StatStrip
        stats={[
          ["58 sec", "From booking to confirmation call"],
          ["94%", "Bookings confirmed on the first call"],
          ["0", "Clients left on hold"],
          ["24/7", "The front desk never closes"],
        ]}
      />

      <StepGrid eyebrow="How it works" title="Three steps, and the phone call comes from you" steps={STEPS} />

      <section id="demos" className="scroll-mt-20 border-t border-line py-20">
        <div className="mx-auto max-w-6xl px-5">
          <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Live demos</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
                See it running as three different businesses
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Same product, three skins. Each one takes real bookings and places a real
                (simulated) confirmation call you can watch walk through.
              </p>
            </div>
            <Button href="/demos" variant="secondary" size="md">
              All demos
              <ArrowRight width={16} height={16} />
            </Button>
          </header>
          <DemoCards />
        </div>
      </section>

      <Industries />

      <SplitFeature
        eyebrow="What's in the box"
        title="Booking page, voice front desk, one dashboard"
        body="Your clients pick a person and a time on a page that looks like yours. The assistant confirms by phone within the minute. You get the recording, the transcript and a one-line summary — and an email the moment the call ends."
        cta={{ label: "Open the staff dashboard", href: "/admin" }}
        features={[
          {
            icon: PhoneRinging,
            title: "Your choice of voice provider",
            body: "Vapi, Bland.ai or OmniDimension — swap with one setting.",
          },
          {
            icon: Mail,
            title: "Owner notifications",
            body: "Client details, outcome and a link to the recording, by email.",
          },
          {
            icon: Shield,
            title: "Your client list stays yours",
            body: "Row-level security on every table; only your team roster is public.",
          },
        ]}
      />

      <Faq eyebrow="Questions" title="Before you ask for a call" items={FAQ} />

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="card relative overflow-hidden p-8 text-center md:p-14">
          <div className="aurora absolute inset-0 -z-10 opacity-70" />
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            See it work before you talk to anyone.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-muted">
            Book a slot in any demo. Your phone won't ring — the call is simulated — but the
            dashboard will show you exactly what your front desk would have seen.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/demos">
              Open the demos
              <ArrowRight width={18} height={18} />
            </Button>
            {contact && (
              <Button href={`mailto:${contact}`} variant="secondary">
                Talk to us
              </Button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
