import Link from "next/link";
import { CallPreview } from "@/components/call-preview";
import { ProviderDirectory } from "@/components/provider-directory";
import { ArrowRight, Check, Sparkle } from "@/components/icons";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { listProviders } from "@/lib/db";
import { env } from "@/lib/env";
import { resolveVertical } from "@/verticals/resolve";

export const dynamic = "force-dynamic";

export default async function DemoHomePage({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const v = await resolveVertical(params);
  const { hero, stats, steps, roster, owner, faq } = v.copy;
  const providers = await listProviders(v.slug);
  const nextAvailable = providers.length;

  return (
    <div className="min-h-dvh">
      <SiteHeader vertical={v} />

      <main id="main">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="aurora absolute inset-0 -z-10" />
          <div className="grid-backdrop absolute inset-0 -z-10" />
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-[12.5px] font-medium text-muted backdrop-blur">
                <Sparkle width={14} height={14} className="text-accent" />
                {hero.eyebrow}
              </span>

              <h1 className="mt-6 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-6xl">
                {hero.headline.line1}
                <br />
                {hero.headline.line2Before}
                <span className="font-display italic font-normal text-primary">
                  {hero.headline.emphasis}
                </span>
                {hero.headline.line2After}
              </h1>

              <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-muted">{hero.body}</p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#providers"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-on-primary shadow-[var(--shadow-md)] transition hover:bg-primary-hover"
                >
                  {hero.primaryCta}
                  <ArrowRight width={18} height={18} />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex h-12 items-center rounded-full border border-line bg-surface px-6 text-[15px] font-semibold text-ink transition hover:border-line-strong"
                >
                  {hero.secondaryCta}
                </a>
              </div>

              <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-muted">
                {[hero.rosterBullet.replace("{count}", String(nextAvailable)), ...hero.bullets].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check width={15} height={15} className="text-primary" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="relative lg:pl-6">
              <div className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-primary/10 via-transparent to-accent/10 blur-2xl" />
              <CallPreview preview={v.copy.callPreview} />
            </div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────── */}
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
            {steps.map((step, index) => (
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

        {/* ── Roster ───────────────────────────────────────────── */}
        <section id="providers" className="scroll-mt-16 border-t border-line bg-surface-2/60 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {roster.eyebrow}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
                  {roster.title}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{roster.body}</p>
              </div>
              <p className="text-[13px] text-subtle">
                Times shown in {env.timezone.replace("_", " ")}
              </p>
            </header>

            <ProviderDirectory providers={providers} terms={v.terms} />
          </div>
        </section>

        {/* ── For the operator ─────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="card overflow-hidden">
            <div className="grid gap-10 p-8 md:grid-cols-2 md:p-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  {owner.eyebrow}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink">
                  {owner.title}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">{owner.body}</p>
                <Link
                  href="/admin"
                  className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-bg transition hover:opacity-90"
                >
                  {owner.cta}
                  <ArrowRight width={16} height={16} />
                </Link>
              </div>

              <ul className="grid grid-cols-1 gap-4 self-center">
                {owner.features.map((item) => (
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
                {faq.eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink">
                {faq.title}
              </h2>
            </header>

            <div className="divide-y divide-line border-y border-line">
              {faq.items.map((item) => (
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

      <SiteFooter vertical={v} />
    </div>
  );
}
