import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lock } from "@/components/icons";
import { DemoCards } from "@/components/marketing/demo-cards";

export const metadata: Metadata = {
  title: "Live demos",
  description: "Three fictional businesses running the same AI front desk. Book a slot, watch the confirmation call, open the shared dashboard.",
};

export default function DemosPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-5 py-14">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Live demos</p>
        <h1 className="mt-3 text-[2.4rem] font-semibold leading-[1.08] tracking-[-0.03em] text-ink sm:text-5xl">
          Three businesses, one product.
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-muted">
          Each demo is the real thing. Pick a person, book a slot, and watch the confirmation call
          walk from queued to confirmed on the page — then open the shared dashboard to see it land
          beside the other two businesses.
        </p>
      </header>

      <div className="mt-12">
        <DemoCards />
      </div>

      <section className="mt-12 card p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-bg">
            <Lock width={19} height={19} />
          </span>
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight text-ink">The staff dashboard</h2>
            <p className="mt-1 max-w-xl text-[14px] leading-relaxed text-muted">
              One sign-in, every business. Filter by business, open a booking, play the recording,
              read the transcript. The demo password is shown on the sign-in screen.
            </p>
          </div>
        </div>
        <Link
          href="/admin"
          className="mt-5 inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-bg transition hover:opacity-90 md:mt-0"
        >
          Open the dashboard
          <ArrowRight width={16} height={16} />
        </Link>
      </section>
    </main>
  );
}
