import Link from "next/link";
import { CallPreview } from "@/components/call-preview";
import { ProviderDirectory } from "@/components/provider-directory";
import {
  ArrowRight,
  Calendar,
  Check,
  Mail,
  PhoneRinging,
  Shield,
  Sparkle,
  Stethoscope,
} from "@/components/icons";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { listProviders } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const STEPS = [
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
];

const FAQ = [
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
];

export default async function HomePage() {
  const providers = await listProviders();
  const nextAvailable = providers.length;

  return (
    <div className="min-h-dvh">
      <SiteHeader />

      <main id="main">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="aurora absolute inset-0 -z-10" />
          <div className="grid-backdrop absolute inset-0 -z-10" />
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-[12.5px] font-medium text-muted backdrop-blur">
                <Sparkle width={14} height={14} className="text-accent" />
                AI front desk · confirmation call in under 60 seconds
              </span>

              <h1 className="mt-6 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-6xl">
                Book your doctor.
                <br />
                We&apos;ll{" "}
                <span className="font-display italic font-normal text-primary">
                  call to confirm
                </span>
                .
              </h1>

              <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-muted">
                No hold music, no phone tag, no voicemail that never gets returned. Choose a
                doctor and a time at {env.clinicName}, and a voice assistant rings you back
                within the minute to lock it in.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#doctors"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-on-primary shadow-[var(--shadow-md)] transition hover:bg-primary-hover"
                >
                  Find a doctor
                  <ArrowRight width={18} height={18} />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex h-12 items-center rounded-full border border-line bg-surface px-6 text-[15px] font-semibold text-ink transition hover:border-line-strong"
                >
                  How it works
                </a>
              </div>

              <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-muted">
                {[
                  `${nextAvailable} physicians accepting patients`,
                  "Same-week appointments",
                  "Every call recorded and logged",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check width={15} height={15} className="text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative lg:pl-6">
              <div className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-primary/10 via-transparent to-accent/10 blur-2xl" />
              <CallPreview />
            </div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────── */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-line px-5 sm:grid-cols-4 sm:divide-x">
            {[
              ["58 sec", "Median time to confirmation call"],
              ["94%", "Bookings confirmed on the first call"],
              ["0", "Patients left on hold"],
              ["24/7", "The front desk never closes"],
            ].map(([value, label]) => (
              <div key={label} className="px-2 py-8 text-center sm:px-6">
                <div className="text-3xl font-semibold tracking-tight text-ink">{value}</div>
                <div className="mt-1.5 text-[12.5px] leading-snug text-muted">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
          <header className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
              Three steps, and the phone call comes to you
            </h2>
          </header>

          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="reveal card relative p-6">
                <span className="absolute right-5 top-5 font-display text-4xl leading-none text-line-strong">
                  {index + 1}
                </span>
                <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <step.icon width={22} height={22} />
                </span>
                <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Doctors ──────────────────────────────────────────── */}
        <section id="providers" className="scroll-mt-16 border-t border-line bg-surface-2/60 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Our doctors
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
                  Care from people who stay
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  Average tenure at Northlake is nine years. Pick the person you want to see —
                  availability is live, so anything you can select is genuinely open.
                </p>
              </div>
              <p className="text-[13px] text-subtle">
                Times shown in {env.timezone.replace("_", " ")}
              </p>
            </header>

            <ProviderDirectory providers={providers} />
          </div>
        </section>

        {/* ── For the practice ─────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="card overflow-hidden">
            <div className="grid gap-10 p-8 md:grid-cols-2 md:p-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  For the practice
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink">
                  Every booking, call and recording in one place
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">
                  Bookings land in Supabase, the confirmation call fires through your voice
                  provider, and the outcome comes back with a recording, transcript and
                  summary — plus an email to the owner the moment the call ends.
                </p>
                <Link
                  href="/admin"
                  className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-bg transition hover:opacity-90"
                >
                  Open the staff dashboard
                  <ArrowRight width={16} height={16} />
                </Link>
              </div>

              <ul className="grid grid-cols-1 gap-4 self-center">
                {[
                  {
                    icon: PhoneRinging,
                    title: "Voice provider of your choice",
                    body: "Vapi, Bland.ai or OmniDimension — one env var switches the back end.",
                  },
                  {
                    icon: Mail,
                    title: "Owner notifications",
                    body: "Client details, outcome and a link to the recording, by email.",
                  },
                  {
                    icon: Shield,
                    title: "Locked-down data",
                    body: "Row level security on every table; only the doctor roster is public.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4 rounded-xl bg-surface-2 p-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface text-accent">
                      <item.icon width={19} height={19} />
                    </span>
                    <div>
                      <p className="text-[14.5px] font-semibold text-ink">{item.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section id="questions" className="scroll-mt-20 border-t border-line bg-surface py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr]">
            <header>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Questions
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink">
                Before you book
              </h2>
            </header>

            <div className="divide-y divide-line border-y border-line">
              {FAQ.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-medium text-ink marker:hidden">
                    {item.q}
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-muted transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-muted">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
