import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { DEFAULT_VERTICAL as v } from "@/verticals";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader vertical={v} />
      <main id="main" className="relative grid flex-1 place-items-center px-5 py-24">
        <div className="aurora absolute inset-0 -z-10" />
        <div className="max-w-md text-center">
          <p className="font-display text-6xl text-primary">404</p>
          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-ink">
            We couldn&apos;t find that page
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
            The link may be out of date, or the appointment reference may not match. Try starting
            from the {v.terms.provider.one} list.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[14.5px] font-semibold text-on-primary transition hover:bg-primary-hover"
          >
            Back to booking
            <ArrowRight width={17} height={17} />
          </Link>
        </div>
      </main>
      <SiteFooter vertical={v} />
    </div>
  );
}
