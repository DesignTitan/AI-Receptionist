import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallStatusLive } from "@/components/call-status-live";
import { DoctorAvatar } from "@/components/doctor-avatar";
import { Calendar, Check, Clock, MapPin, Phone, User } from "@/components/icons";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { getAppointment } from "@/lib/db";
import { env } from "@/lib/env";
import { formatDate, formatTime, timezoneLabel } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your appointment",
  robots: { index: false, follow: false },
};

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { id } = await params;
  const { ref } = await searchParams;
  const appointment = await getAppointment(id);

  // The reference acts as the capability token for this page.
  if (!appointment || !ref || appointment.reference !== ref.toUpperCase()) notFound();

  const tz = env.timezone;
  const { doctor, patient } = appointment;

  return (
    <div className="min-h-dvh">
      <SiteHeader />

      <main id="main" className="mx-auto max-w-3xl px-5 py-10 lg:py-14">
        <div className="mb-8 flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-on-primary">
            <Check width={26} height={26} strokeWidth={2.4} />
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.02em] text-ink">
              You&apos;re booked
              {patient?.full_name ? `, ${patient.full_name.split(" ")[0]}` : ""}.
            </h1>
            <p className="mt-1.5 text-[15px] text-muted">
              Reference{" "}
              <span className="font-semibold text-ink">{appointment.reference}</span> · keep this
              page open to watch the confirmation call.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <CallStatusLive
            appointmentId={appointment.id}
            reference={appointment.reference}
            initial={{
              status: appointment.status,
              call: appointment.call
                ? {
                    status: appointment.call.status,
                    outcome: appointment.call.outcome,
                    durationSeconds: appointment.call.duration_seconds,
                    summary: appointment.call.summary,
                  }
                : null,
            }}
          />

          {/* ── Appointment card ─────────────────────────────── */}
          <section className="card overflow-hidden">
            <div className="flex items-center gap-4 border-b border-line p-5">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                {doctor && (
                  <DoctorAvatar name={doctor.name} src={doctor.photo_url} sizes="56px" />
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[16px] font-semibold text-ink">
                  Dr. {doctor?.name}
                </p>
                <p className="truncate text-[13px] text-muted">
                  {doctor?.specialty} · {doctor?.credentials}
                </p>
              </div>
            </div>

            <dl className="grid gap-px bg-line sm:grid-cols-2">
              <Item icon={Calendar} label="Date">
                {formatDate(appointment.starts_at, tz)}
              </Item>
              <Item icon={Clock} label="Time">
                {formatTime(appointment.starts_at, tz)} – {formatTime(appointment.ends_at, tz)}{" "}
                {timezoneLabel(tz)}
              </Item>
              <Item icon={MapPin} label="Location">
                {doctor?.location}
              </Item>
              <Item icon={User} label="Patient">
                {patient?.full_name}
                {appointment.is_new_patient && (
                  <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
                    New
                  </span>
                )}
              </Item>
              <Item icon={Phone} label="We'll call">
                {patient?.phone}
              </Item>
              {appointment.reason && (
                <Item icon={Check} label="Reason">
                  {appointment.reason}
                </Item>
              )}
            </dl>

            <div className="flex flex-wrap gap-3 border-t border-line p-5">
              <a
                href={`/api/appointments/${appointment.id}/ics?ref=${appointment.reference}`}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[14.5px] font-semibold text-on-primary transition hover:bg-primary-hover"
              >
                <Calendar width={17} height={17} />
                Add to calendar
              </a>
              <Link
                href="/#doctors"
                className="inline-flex h-11 items-center rounded-xl border border-line px-5 text-[14.5px] font-semibold text-ink transition hover:border-line-strong"
              >
                Book another visit
              </Link>
            </div>
          </section>

          <p className="px-1 text-[13px] leading-relaxed text-subtle">
            If plans change, tell the assistant when it calls, or contact the front desk with your
            reference number. This is a demonstration project — no real medical services are
            provided.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Item({
  icon: Icon,
  label,
  children,
}: {
  icon: (props: { width?: number; height?: number; className?: string }) => React.ReactElement;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 bg-surface p-5">
      <Icon width={17} height={17} className="mt-0.5 shrink-0 text-subtle" />
      <div className="min-w-0">
        <dt className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-subtle">
          {label}
        </dt>
        <dd className="mt-1 text-[14.5px] text-ink">{children}</dd>
      </div>
    </div>
  );
}
