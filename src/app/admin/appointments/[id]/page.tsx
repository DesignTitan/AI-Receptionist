import type { Metadata } from "next";
import { providerLabel } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentActions } from "@/components/admin/appointment-actions";
import { AdminHeader } from "@/components/admin/shell";
import { AppointmentBadge, CallBadge } from "@/components/admin/status-badge";
import { ProviderAvatar } from "@/components/provider-avatar";
import { ChevronLeft, Mail, Phone, Sparkle, Waveform } from "@/components/icons";
import { getAppointment } from "@/lib/db";
import { env } from "@/lib/env";
import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatTime,
  relativeTime,
  timezoneLabel,
} from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Appointment record",
  robots: { index: false, follow: false },
};

export default async function AdminAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appointment = await getAppointment(id);
  if (!appointment) notFound();

  const { provider, client, call } = appointment;
  const tz = env.timezone;

  const timeline = [
    { label: "Booked online", at: appointment.created_at },
    call ? { label: "Call queued", at: call.created_at } : null,
    call?.started_at ? { label: "Call connected", at: call.started_at } : null,
    call?.ended_at ? { label: "Call ended", at: call.ended_at } : null,
    appointment.updated_at !== appointment.created_at
      ? { label: "Status updated", at: appointment.updated_at }
      : null,
  ].filter(Boolean) as { label: string; at: string }[];

  return (
    <div className="min-h-dvh bg-bg">
      <AdminHeader />

      <main id="main" className="mx-auto max-w-6xl px-5 py-8">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted transition hover:text-ink"
        >
          <ChevronLeft width={16} height={16} />
          All appointments
        </Link>

        <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[12.5px] uppercase tracking-wide text-subtle">
              {appointment.reference}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-ink">
              {client?.full_name ?? "Unknown patient"}
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              {formatDate(appointment.starts_at, tz)} · {formatTime(appointment.starts_at, tz)}–
              {formatTime(appointment.ends_at, tz)} {timezoneLabel(tz)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AppointmentBadge status={appointment.status} />
            <span className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-subtle">
              Call
              <CallBadge status={call?.status ?? null} outcome={call?.outcome} />
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          {/* ── Call record ─────────────────────────────────── */}
          <div className="space-y-6">
            <section className="card overflow-hidden">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                  <Waveform width={18} height={18} className="text-primary" />
                  Confirmation call
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-muted">
                  {call?.provider && (
                    <span className="rounded-full bg-surface-2 px-2.5 py-1 font-medium">
                      via {call.provider}
                    </span>
                  )}
                  {call?.duration_seconds ? (
                    <span>{formatDuration(call.duration_seconds)}</span>
                  ) : null}
                  {call?.cost ? <span>${call.cost.toFixed(2)}</span> : null}
                </div>
              </header>

              <div className="space-y-5 p-5">
                {call?.recording_url ? (
                  <div className="rounded-xl bg-surface-2 p-4">
                    <p className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-subtle">
                      Recording
                    </p>
                    {/* preload="metadata" so the duration shows before playback. */}
                    <audio controls preload="metadata" src={call.recording_url} className="w-full">
                      Your browser can&apos;t play this recording.{" "}
                      <a href={call.recording_url}>Download it instead.</a>
                    </audio>
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[13px] text-muted">
                    {call
                      ? "No recording for this call yet."
                      : "No call has been placed for this appointment."}
                  </p>
                )}

                {call?.summary && (
                  <div className="rounded-xl bg-accent-soft p-4">
                    <p className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-accent">
                      <Sparkle width={13} height={13} />
                      AI summary
                    </p>
                    <p className="text-[14px] leading-relaxed text-ink">{call.summary}</p>
                  </div>
                )}

                {call?.error && (
                  <p className="rounded-xl bg-danger-soft px-4 py-3 text-[13px] text-danger">
                    {call.error}
                  </p>
                )}

                {call?.transcript && (
                  <div>
                    <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-subtle">
                      Transcript
                    </p>
                    <div className="space-y-2 rounded-xl border border-line bg-surface-2/50 p-4">
                      {call.transcript.split("\n").map((line, index) => {
                        const [speaker, ...rest] = line.split(":");
                        const said = rest.join(":").trim();
                        if (!said) {
                          return (
                            <p key={index} className="text-[13.5px] leading-relaxed text-muted">
                              {line}
                            </p>
                          );
                        }
                        const isAgent = /agent|ava|assistant/i.test(speaker);
                        return (
                          <p key={index} className="flex gap-3 text-[13.5px] leading-relaxed">
                            <span
                              className={`w-14 shrink-0 text-[11.5px] font-semibold uppercase tracking-wide ${
                                isAgent ? "text-accent" : "text-subtle"
                              }`}
                            >
                              {speaker.trim()}
                            </span>
                            <span className={isAgent ? "text-ink" : "text-muted"}>{said}</span>
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="card p-5">
              <h2 className="mb-4 text-[15px] font-semibold text-ink">Timeline</h2>
              <ol className="space-y-3.5">
                {timeline.map((entry) => (
                  <li key={entry.label + entry.at} className="flex gap-3.5">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4">
                      <span className="text-[13.5px] text-ink">{entry.label}</span>
                      <span className="text-[12.5px] text-subtle">
                        {formatDateTime(entry.at, tz)} · {relativeTime(entry.at)}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* ── Sidebar ─────────────────────────────────────── */}
          <aside className="space-y-6">
            <section className="card p-5">
              <h2 className="mb-4 text-[15px] font-semibold text-ink">Client</h2>
              <dl className="space-y-3 text-[13.5px]">
                <Row label="Name">{client?.full_name ?? "—"}</Row>
                <Row label="Phone">
                  {client?.phone ? (
                    <a
                      href={`tel:${client.phone.replace(/[^\d+]/g, "")}`}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <Phone width={14} height={14} />
                      {client.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </Row>
                <Row label="Email">
                  {client?.email ? (
                    <a
                      href={`mailto:${client.email}`}
                      className="inline-flex items-center gap-1.5 break-all text-primary hover:underline"
                    >
                      <Mail width={14} height={14} />
                      {client.email}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </Row>
                <Row label="Client type">
                  {appointment.is_new_client ? "New patient" : "Returning patient"}
                </Row>
                <Row label="Reason">{appointment.reason || "Not provided"}</Row>
              </dl>
            </section>

            <section className="card p-5">
              <h2 className="mb-4 text-[15px] font-semibold text-ink">Provider</h2>
              {provider && (
                <div className="flex items-center gap-3">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                    <ProviderAvatar name={provider.name} src={provider.photo_url} sizes="48px" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-ink">
                      {providerLabel(provider)}
                    </p>
                    <p className="truncate text-[12.5px] text-muted">{provider.specialty}</p>
                    <p className="truncate text-[12.5px] text-subtle">{provider.location}</p>
                  </div>
                </div>
              )}
            </section>

            <section className="card p-5">
              <h2 className="mb-4 text-[15px] font-semibold text-ink">Actions</h2>
              <AppointmentActions appointmentId={appointment.id} status={appointment.status} />
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-subtle">
        {label}
      </dt>
      <dd className="mt-0.5 text-ink">{children}</dd>
    </div>
  );
}
