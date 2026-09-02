import type { ReactNode } from "react";
import { ArrowRight, Check, Sparkle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Icon } from "@/verticals/types";

/*
 * Section blocks shared by the marketing site and every themed demo. Pure
 * presentation: copy comes in as props, so a vertical and the product can't
 * drift apart visually. Layout conventions: max-w-6xl, px-5, py-20, and only
 * sm/md/lg breakpoints.
 */

export type Headline = { line1: string; line2Before: string; emphasis: string; line2After: string };
export type Cta = { label: string; href: string };

export function Hero({
  eyebrow,
  headline,
  body,
  primary,
  secondary,
  bullets,
  aside,
}: {
  eyebrow: string;
  headline: Headline;
  body: string;
  primary: Cta;
  secondary?: Cta;
  bullets: string[];
  aside: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="aurora absolute inset-0 -z-10" />
      <div className="grid-backdrop absolute inset-0 -z-10" />
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-[12.5px] font-medium text-muted backdrop-blur">
            <Sparkle width={14} height={14} className="text-accent" />
            {eyebrow}
          </span>

          <h1 className="mt-6 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-6xl">
            {headline.line1}
            <br />
            {headline.line2Before}
            <span className="font-display italic font-normal text-primary">{headline.emphasis}</span>
            {headline.line2After}
          </h1>

          <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-muted">{body}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href={primary.href}>
              {primary.label}
              <ArrowRight width={18} height={18} />
            </Button>
            {secondary && (
              <Button href={secondary.href} variant="secondary">
                {secondary.label}
              </Button>
            )}
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-muted">
            {bullets.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check width={15} height={15} className="text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:pl-6">
          <div className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-primary/10 via-transparent to-accent/10 blur-2xl" />
          {aside}
        </div>
      </div>
    </section>
  );
}

export function StatStrip({ stats }: { stats: [string, string][] }) {
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-line px-5 sm:grid-cols-4 sm:divide-x">
        {stats.map(([value, label]) => (
          <div key={label} className="px-2 py-8 text-center sm:px-6">
            <div className="text-3xl font-semibold tracking-tight text-ink">{value}</div>
            <div className="mt-1.5 text-[12.5px] leading-snug text-muted">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StepGrid({
  id = "how-it-works",
  eyebrow,
  title,
  steps,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  steps: { icon: Icon; title: string; body: string }[];
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
          {title}
        </h2>
      </header>

      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="reveal card relative p-6">
            <span className="absolute right-5 top-5 font-display text-4xl leading-none text-line-strong">
              {index + 1}
            </span>
            <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
              <step.icon width={22} height={22} />
            </span>
            <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-ink">{step.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SplitFeature({
  eyebrow,
  title,
  body,
  cta,
  features,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: Cta;
  features: { icon: Icon; title: string; body: string }[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="card overflow-hidden">
        <div className="grid gap-10 p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink">{title}</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">{body}</p>
            <Button href={cta.href} variant="ink" size="md" className="mt-7">
              {cta.label}
              <ArrowRight width={16} height={16} />
            </Button>
          </div>

          <ul className="grid grid-cols-1 gap-4 self-center">
            {features.map((item) => (
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
  );
}

export function Faq({
  id = "questions",
  eyebrow,
  title,
  items,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  items: { q: string; a: string }[];
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line bg-surface py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr]">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink">{title}</h2>
        </header>

        <div className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-medium text-ink marker:hidden">
                {item.q}
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-muted transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
