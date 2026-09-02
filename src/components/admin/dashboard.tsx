"use client";

import Link from "next/link";
import { providerLabel } from "@/lib/format";
import { useCallback, useEffect, useRef, useState } from "react";
import { Refresh, Search, XMark } from "@/components/icons";
import { formatDateTime, formatDuration, relativeTime } from "@/lib/time";
import type { AppointmentDetail, AppointmentStatus } from "@/lib/types";
import type { DashboardStats } from "@/lib/db";
import { AppointmentBadge, CallBadge } from "./status-badge";

type Feed = { appointments: AppointmentDetail[]; stats: DashboardStats };

const FILTERS: { key: AppointmentStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Awaiting call" },
  { key: "confirmed", label: "Confirmed" },
  { key: "rescheduled", label: "Reschedule" },
  { key: "no_answer", label: "No answer" },
  { key: "cancelled", label: "Cancelled" },
];

const POLL_MS = 8000;

export function Dashboard({ initial, timezone }: { initial: Feed; timezone: string }) {
  const [feed, setFeed] = useState<Feed>(initial);
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const requestRef = useRef(0);

  const load = useCallback(
    async (silent = true) => {
      const ticket = ++requestRef.current;
      if (!silent) setRefreshing(true);
      try {
        const params = new URLSearchParams({ status });
        if (query.trim()) params.set("q", query.trim());
        const response = await fetch(`/api/admin/appointments?${params}`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = await response.json();
        // Ignore responses that arrive after a newer request has been issued.
        if (ticket !== requestRef.current) return;
        setFeed({ appointments: data.appointments, stats: data.stats });
        setUpdatedAt(data.fetchedAt);
      } catch {
        // Leave the last good data on screen; the next tick retries.
      } finally {
        if (!silent) setRefreshing(false);
      }
    },
    [status, query],
  );

  // Refetch on filter/search change, then keep polling for live updates.
  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const { stats, appointments } = feed;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Appointments</h1>
          <p className="mt-1 flex items-center gap-2 text-[13px] text-muted">
            <span className="size-1.5 animate-pulse rounded-full bg-success" />
            Live · {updatedAt ? `updated ${relativeTime(updatedAt)}` : "connecting"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load(false)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-[13.5px] font-medium text-ink transition hover:border-line-strong"
        >
          <Refresh width={16} height={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total bookings" value={stats.total} hint={`${stats.upcoming7Days} in next 7 days`} />
        <Stat
          label="Confirmed by call"
          value={stats.confirmed}
          hint={`${stats.confirmationRate}% reach rate`}
          tone="good"
        />
        <Stat label="Awaiting call" value={stats.awaiting} hint="Queued or dialling" tone="info" />
        <Stat
          label="Needs attention"
          value={stats.needsAttention}
          hint="No answer or reschedule"
          tone={stats.needsAttention > 0 ? "warn" : undefined}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="scroll-x flex gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setStatus(filter.key)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
                status === filter.key
                  ? "border-primary bg-primary text-on-primary"
                  : "border-line bg-surface text-muted hover:text-ink"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto w-full sm:w-72">
          <Search
            width={16}
            height={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, phone or reference"
            className="w-full rounded-xl border border-line bg-surface py-2 pl-9 pr-8 text-[13.5px] text-ink placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-[var(--primary-ring)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtle transition hover:text-ink"
            >
              <XMark width={15} height={15} />
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        {appointments.length === 0 ? (
          <p className="px-5 py-20 text-center text-[14px] text-muted">
            Nothing matches that filter.
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="scroll-x hidden md:block">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-surface-2/60 text-[11.5px] uppercase tracking-[0.08em] text-subtle">
                    <Th>Client</Th>
                    <Th>Provider</Th>
                    <Th>Appointment</Th>
                    <Th>Call</Th>
                    <Th>Status</Th>
                    <Th>Booked</Th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="group border-b border-line last:border-0 transition hover:bg-surface-2/50"
                    >
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/appointments/${appointment.id}`}
                          className="block"
                        >
                          <span className="block text-[14px] font-medium text-ink">
                            {appointment.client?.full_name ?? "—"}
                          </span>
                          <span className="block text-[12.5px] text-muted">
                            {appointment.client?.phone}
                            {appointment.is_new_client && (
                              <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-accent">
                                NEW
                              </span>
                            )}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-[13.5px] text-muted">
                        <span className="block text-ink">{providerLabel(appointment.provider)}</span>
                        <span className="block text-[12.5px]">
                          {appointment.provider?.specialty}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[13.5px] text-ink">
                        {formatDateTime(appointment.starts_at, timezone)}
                      </td>
                      <td className="px-4 py-3.5">
                        <CallBadge
                          status={appointment.call?.status ?? null}
                          outcome={appointment.call?.outcome}
                        />
                        {appointment.call?.duration_seconds ? (
                          <span className="ml-2 text-[12px] text-subtle">
                            {formatDuration(appointment.call.duration_seconds)}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5">
                        <AppointmentBadge status={appointment.status} />
                      </td>
                      <td className="px-4 py-3.5 text-[12.5px] text-muted">
                        <div className="flex items-center justify-between gap-3">
                          {relativeTime(appointment.created_at)}
                          <Link
                            href={`/admin/appointments/${appointment.id}`}
                            className="text-[12.5px] font-semibold text-primary opacity-0 transition group-hover:opacity-100"
                          >
                            Open
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <ul className="divide-y divide-line md:hidden">
              {appointments.map((appointment) => (
                <li key={appointment.id}>
                  <Link
                    href={`/admin/appointments/${appointment.id}`}
                    className="block p-4 transition active:bg-surface-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[14.5px] font-medium text-ink">
                          {appointment.client?.full_name}
                        </p>
                        <p className="truncate text-[12.5px] text-muted">
                          {providerLabel(appointment.provider)} ·{" "}
                          {formatDateTime(appointment.starts_at, timezone)}
                        </p>
                      </div>
                      <AppointmentBadge status={appointment.status} />
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <CallBadge
                        status={appointment.call?.status ?? null}
                        outcome={appointment.call?.outcome}
                      />
                      <span className="text-[12px] text-subtle">
                        {relativeTime(appointment.created_at)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

const TONES = {
  good: "text-success",
  warn: "text-warning",
  info: "text-info",
} as const;

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone?: keyof typeof TONES;
}) {
  return (
    <div className="card p-4">
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-subtle">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${tone ? TONES[tone] : "text-ink"}`}>
        {value}
      </p>
      <p className="mt-1 text-[12px] text-muted">{hint}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}
