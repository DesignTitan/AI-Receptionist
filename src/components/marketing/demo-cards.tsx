import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { providerLabel } from "@/lib/format";
import { VERTICALS } from "@/verticals";
import { demoPaths } from "@/verticals/paths";

/**
 * One card per themed business. The colour band is a literal hex from the
 * vertical's swatch — these render on the product palette, so `bg-primary`
 * would paint all three the same indigo.
 */
export function DemoCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Object.values(VERTICALS).map((v, index) => {
        const p = demoPaths(v.slug);
        const reveal = [
          "animate-on-scroll [animation:animationIn_0.7s_ease-out_0.05s_both]",
          "animate-on-scroll [animation:animationIn_0.7s_ease-out_0.18s_both]",
          "animate-on-scroll [animation:animationIn_0.7s_ease-out_0.31s_both]",
        ][index % 3];
        const Mark = v.icons.mark;
        const first = v.seed.providers[0];
        return (
          <article
            key={v.slug}
            className={`${reveal} group card overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-float)]`}
          >
            <Link
              href={p.home}
              className="block p-6 focus-visible:outline-none"
              style={{ background: v.theme.swatch.primary, color: v.theme.swatch.onPrimary }}
            >
              <span className="grid size-10 place-items-center rounded-xl bg-white/15">
                <Mark width={20} height={20} strokeWidth={2} />
              </span>
              <p className="mt-5 text-[19px] font-semibold tracking-tight">{v.brand}</p>
              <p className="mt-0.5 text-[11.5px] font-medium uppercase tracking-[0.14em] opacity-75">
                {v.brandEyebrow}
              </p>
            </Link>
            <div className="space-y-4 p-5">
              <p className="text-[14px] leading-relaxed text-muted">{v.tagline}</p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-line pt-4 text-[12.5px] text-muted">
                <dt>Bookable {v.terms.provider.many}</dt>
                <dd className="text-right font-medium text-ink">{v.seed.providers.length}</dd>
                <dt>Assistant</dt>
                <dd className="text-right font-medium text-ink">{v.voice.agentName}</dd>
              </dl>
              <div className="flex flex-col gap-2">
                <Link
                  href={p.home}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-surface-2 px-4 py-2.5 text-sm font-semibold text-ink transition group-hover:bg-primary group-hover:text-on-primary"
                >
                  Open the demo
                  <ArrowRight width={16} height={16} />
                </Link>
                <Link
                  href={p.book(first.slug)}
                  className="text-center text-[12.5px] font-medium text-muted transition hover:text-ink"
                >
                  Book with {providerLabel(first)} →
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
