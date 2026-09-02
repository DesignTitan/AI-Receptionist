import { CallPreview } from "@/components/call-preview";
import { Faq, Hero, SplitFeature, StatStrip, StepGrid } from "@/components/marketing/blocks";
import { ProviderDirectory } from "@/components/provider-directory";
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

  return (
    <div className="min-h-dvh">
      <SiteHeader vertical={v} />

      <main id="main">
        <Hero
          eyebrow={hero.eyebrow}
          headline={hero.headline}
          body={hero.body}
          primary={{ label: hero.primaryCta, href: "#providers" }}
          secondary={{ label: hero.secondaryCta, href: "#how-it-works" }}
          bullets={[hero.rosterBullet.replace("{count}", String(providers.length)), ...hero.bullets]}
          aside={<CallPreview preview={v.copy.callPreview} />}
        />

        <StatStrip stats={stats} />

        <StepGrid
          eyebrow="How it works"
          title="Three steps, and the phone call comes to you"
          steps={steps}
        />

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

        <SplitFeature
          eyebrow={owner.eyebrow}
          title={owner.title}
          body={owner.body}
          cta={{ label: owner.cta, href: "/admin" }}
          features={owner.features}
        />

        <Faq eyebrow={faq.eyebrow} title={faq.title} items={faq.items} />
      </main>

      <SiteFooter vertical={v} />
    </div>
  );
}
