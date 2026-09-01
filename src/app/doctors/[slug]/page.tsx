import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/booking-flow";
import { DoctorAvatar } from "@/components/doctor-avatar";
import {
  ChevronLeft,
  Clock,
  Globe,
  MapPin,
  Shield,
  Star,
  Stethoscope,
} from "@/components/icons";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { getDoctorBySlug, listDoctors } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) return { title: "Doctor not found" };
  return {
    title: `Book Dr. ${doctor.name} · ${doctor.specialty}`,
    description: doctor.bio.slice(0, 160),
  };
}

export default async function DoctorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor || !doctor.is_active) notFound();

  const others = (await listDoctors()).filter((d) => d.id !== doctor.id).slice(0, 3);

  return (
    <div className="min-h-dvh">
      <SiteHeader />

      <main id="main" className="mx-auto max-w-6xl px-5 py-8 lg:py-12">
        <Link
          href="/#doctors"
          className="mb-6 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted transition hover:text-ink"
        >
          <ChevronLeft width={16} height={16} />
          All doctors
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          {/* ── Profile ──────────────────────────────────────── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card overflow-hidden">
              <div className="relative aspect-[4/3] bg-surface-2">
                <DoctorAvatar
                  name={doctor.name}
                  src={doctor.photo_url}
                  priority
                  sizes="(min-width: 1024px) 460px, 100vw"
                />
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">
                      Dr. {doctor.name}
                    </h1>
                    <span className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[12px] font-semibold text-ink">
                      <Star width={12} height={12} className="text-amber-500" />
                      {doctor.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-1 text-[13.5px] text-muted">{doctor.credentials}</p>
                  <span className="mt-3 inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12.5px] font-semibold text-primary">
                    {doctor.specialty}
                  </span>
                </div>

                <p className="text-[14px] leading-relaxed text-muted">{doctor.bio}</p>

                <dl className="space-y-3 border-t border-line pt-5 text-[13.5px]">
                  <Detail icon={Stethoscope} label="Experience">
                    {doctor.years_experience} years · {doctor.reviews_count} patient reviews
                  </Detail>
                  <Detail icon={Globe} label="Speaks">
                    {doctor.languages.join(", ")}
                  </Detail>
                  <Detail icon={MapPin} label="Location">
                    {doctor.location}
                  </Detail>
                  <Detail icon={Clock} label="Clinic hours">
                    {doctor.start_time}–{doctor.end_time} ·{" "}
                    {doctor.working_days.map((d) => WEEKDAYS[d]).join(", ")}
                  </Detail>
                  <Detail icon={Shield} label="Training">
                    {doctor.education}
                  </Detail>
                </dl>

                <div className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
                  <span className="text-[13px] text-muted">Consultation</span>
                  <span className="text-[15px] font-semibold text-ink">
                    ${doctor.consultation_fee}
                    <span className="ml-1 text-[12.5px] font-normal text-muted">
                      / {doctor.slot_minutes} min
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Booking ──────────────────────────────────────── */}
          <div>
            <header className="mb-5">
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink">
                Book an appointment
              </h2>
              <p className="mt-1.5 text-[14px] text-muted">
                All times shown in {env.timezone.replace("_", " ")}. After booking, our AI
                receptionist calls you within a minute to confirm.
              </p>
            </header>

            <BookingFlow doctor={doctor} />
          </div>
        </div>

        {/* ── Other doctors ──────────────────────────────────── */}
        {others.length > 0 && (
          <section className="mt-16 border-t border-line pt-10">
            <h2 className="text-[15px] font-semibold text-ink">Other doctors at the clinic</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {others.map((other) => (
                <Link
                  key={other.id}
                  href={`/doctors/${other.slug}`}
                  className="card flex items-center gap-3.5 p-3.5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
                >
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                    <DoctorAvatar name={other.name} src={other.photo_url} sizes="56px" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold text-ink">
                      Dr. {other.name}
                    </span>
                    <span className="block truncate text-[12.5px] text-muted">
                      {other.specialty}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: (props: { width?: number; height?: number; className?: string }) => React.ReactElement;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon width={16} height={16} className="mt-0.5 shrink-0 text-subtle" />
      <div className="min-w-0">
        <dt className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-subtle">
          {label}
        </dt>
        <dd className="mt-0.5 text-ink">{children}</dd>
      </div>
    </div>
  );
}
