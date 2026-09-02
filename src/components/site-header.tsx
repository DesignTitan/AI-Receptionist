import Link from "next/link";
import type { Vertical } from "@/verticals";
import { demoPaths } from "@/verticals/paths";
import { ThemeToggle } from "./theme-toggle";

export function Logo({ vertical: v, compact = false }: { vertical: Vertical; compact?: boolean }) {
  const Mark = v.icons.mark;
  return (
    <Link href={demoPaths(v.slug).home} className="group flex min-w-0 items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-on-primary shadow-sm transition group-hover:scale-105">
        <Mark width={20} height={20} strokeWidth={2} />
      </span>
      {!compact && (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[15px] font-semibold tracking-tight text-ink">
            {v.brand}
          </span>
          {/* The eyebrow is the first thing to go when the header gets tight. */}
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-subtle sm:block">
            {v.brandEyebrow}
          </span>
        </span>
      )}
    </Link>
  );
}

export function SiteHeader({ vertical: v }: { vertical: Vertical }) {
  const t = v.terms;
  const p = demoPaths(v.slug);
  return (
    <header className="sticky top-0 z-40 border-b border-line surface-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Logo vertical={v} />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
          <a className="transition hover:text-ink" href={p.roster}>
            Our {t.provider.many}
          </a>
          <a className="transition hover:text-ink" href={p.howItWorks}>
            How it works
          </a>
          <a className="transition hover:text-ink" href={p.questions}>
            Questions
          </a>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link
            href={p.roster}
            className="inline-flex h-9 items-center whitespace-nowrap rounded-full bg-primary px-4 text-sm font-semibold text-on-primary transition hover:bg-primary-hover"
          >
            Book now
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ vertical: v }: { vertical: Vertical }) {
  const t = v.terms;
  const f = v.copy.footer;
  const p = demoPaths(v.slug);
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo vertical={v} />
            <p className="mt-4 text-sm leading-relaxed text-muted">{f.blurb}</p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
                {f.clientsHeading}
              </h3>
              <ul className="space-y-2 text-muted">
                <li>
                  <a className="transition hover:text-ink" href={p.roster}>
                    Find a {t.provider.one}
                  </a>
                </li>
                <li>
                  <a className="transition hover:text-ink" href={p.howItWorks}>
                    How booking works
                  </a>
                </li>
                <li>
                  <a className="transition hover:text-ink" href={p.questions}>
                    Common questions
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
                {f.operatorHeading}
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
                {f.asideHeading}
              </h3>
              <p className="text-muted">{f.aside}</p>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {v.brand}. Demo project.</p>
          <p>{f.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
