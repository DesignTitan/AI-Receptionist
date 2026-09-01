import Link from "next/link";
import { env } from "@/lib/env";
import { PulseMark } from "./icons";
import { ThemeToggle } from "./theme-toggle";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex min-w-0 items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-on-primary shadow-sm transition group-hover:scale-105">
        <PulseMark width={20} height={20} strokeWidth={2} />
      </span>
      {!compact && (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[15px] font-semibold tracking-tight text-ink">
            {env.clinicName}
          </span>
          {/* The eyebrow is the first thing to go when the header gets tight. */}
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-subtle sm:block">
            Same-day scheduling
          </span>
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line surface-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
          <a className="transition hover:text-ink" href="/#doctors">
            Our doctors
          </a>
          <a className="transition hover:text-ink" href="/#how-it-works">
            How it works
          </a>
          <a className="transition hover:text-ink" href="/#questions">
            Questions
          </a>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link
            href="/#doctors"
            className="inline-flex h-9 items-center whitespace-nowrap rounded-full bg-primary px-4 text-sm font-semibold text-on-primary transition hover:bg-primary-hover"
          >
            Book now
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              A demonstration clinic for an AI front desk: patients book online, an
              AI receptionist calls to confirm, and every call is logged where the
              practice can see it.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
                Patients
              </h3>
              <ul className="space-y-2 text-muted">
                <li>
                  <a className="transition hover:text-ink" href="/#doctors">
                    Find a doctor
                  </a>
                </li>
                <li>
                  <a className="transition hover:text-ink" href="/#how-it-works">
                    How booking works
                  </a>
                </li>
                <li>
                  <a className="transition hover:text-ink" href="/#questions">
                    Common questions
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
                Practice
              </h3>
              <ul className="space-y-2 text-muted">
                <li>
                  <Link className="transition hover:text-ink" href="/admin">
                    Staff dashboard
                  </Link>
                </li>
                <li>
                  <a
                    className="transition hover:text-ink"
                    href="/api/webhooks/new-booking"
                  >
                    Booking webhook
                  </a>
                </li>
                <li>
                  <a className="transition hover:text-ink" href="/api/webhooks/voice">
                    Voice webhook
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
                Urgent care
              </h3>
              <p className="text-muted">
                If this is a medical emergency, call your local emergency number
                instead of booking online.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {env.clinicName}. Demo project.</p>
          <p>Fictional clinic. No real medical services are provided.</p>
        </div>
      </div>
    </footer>
  );
}
