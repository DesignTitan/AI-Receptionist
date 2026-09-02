import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { VERTICALS } from "@/verticals";
import { demoPaths } from "@/verticals/paths";

/**
 * Who the product is for. The three with live demos link out; the rest are
 * the catalogue — each costs a directory under src/verticals/ and two
 * palette blocks to promote into a demo.
 */
const GROUPS: { title: string; items: string[] }[] = [
  {
    title: "Health & wellness",
    items: [
      "Dental practices",
      "Med spas & aesthetics",
      "Veterinary clinics",
      "Chiropractic, physio & massage",
      "Optometrists",
      "Dermatology & cosmetic clinics",
      "Fertility & specialist clinics",
    ],
  },
  {
    title: "Personal care",
    items: ["Barbershops", "Nail & lash studios", "Tattoo studios", "Day spas"],
  },
  {
    title: "Professional services",
    items: [
      "Law firms",
      "Accountants & tax prep",
      "Financial advisors",
      "Mortgage brokers",
      "Immigration consultants",
      "Insurance agents",
      "Real estate viewings",
      "Recruiters",
    ],
  },
  {
    title: "Creative & agencies",
    items: ["Branding agencies", "Photographers", "Video production", "Architects & interiors"],
  },
  {
    title: "Trades & field service",
    items: [
      "Auto repair & detailing",
      "HVAC, plumbing & electrical",
      "Home cleaning",
      "Pest control",
      "Appliance repair",
      "Movers",
    ],
  },
  {
    title: "Instruction & sessions",
    items: [
      "Personal trainers",
      "Yoga & pilates studios",
      "Driving schools",
      "Tutors & test prep",
      "Music lessons",
      "Dog training & grooming",
    ],
  },
];

const DEMO_LABEL: Record<string, string> = {
  medical: "Medical clinics",
  salon: "Salons & spas",
  studio: "Design studios",
};

export function Industries() {
  return (
    <section id="industries" className="scroll-mt-20 border-t border-line bg-surface-2/60 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Who it's for</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Any business that runs on appointments
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            If a client picks a person and a time, and someone has to phone them to make sure,
            this is for you. Three are live demos today; the rest are a configuration away.
          </p>
        </header>

        <div className="mt-10 flex flex-wrap gap-2">
          {Object.values(VERTICALS).map((v) => (
            <Link
              key={v.slug}
              href={demoPaths(v.slug).home}
              className="inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-4 py-2 text-[13px] font-semibold text-bg transition hover:opacity-90"
            >
              <span
                aria-hidden
                className="inline-block size-2 rounded-full"
                style={{ background: v.theme.swatch.primary, boxShadow: "0 0 0 2px rgb(255 255 255 / .35)" }}
              />
              {DEMO_LABEL[v.slug]}
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] opacity-70">
                Live demo
              </span>
              <ArrowRight width={14} height={14} />
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
                {group.title}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] font-medium text-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-dashed border-line-strong bg-surface p-6 md:flex md:items-start md:gap-8">
          <div className="md:w-1/3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">A different motion</p>
            <h3 className="mt-2 text-[19px] font-semibold tracking-tight text-ink">Software & SaaS</h3>
          </div>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted md:mt-0 md:flex-1">
            For a software company the booking isn't an appointment, it's a sales demo — and the
            call isn't a confirmation, it's qualification before a human's calendar gets burned.
            Same machinery, different script. Ask us about it.
          </p>
        </div>
      </div>
    </section>
  );
}
