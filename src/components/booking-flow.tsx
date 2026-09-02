"use client";

import { useEffect, useMemo, useState } from "react";
import { clientTypeLabel, providerLabel } from "@/lib/format";
import { useRouter } from "next/navigation";
import type { Provider, Slot } from "@/lib/types";
import { demoPaths } from "@/verticals/paths";
import type { Terms } from "@/verticals/terms";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  PhoneRinging,
} from "./icons";

type CalendarDay = { date: string; openSlots: number; closed: boolean };
type Step = 0 | 1 | 2;

const STEPS = ["Choose a time", "Your details", "Confirm"];
const DAYS_PER_PAGE = 7;

const dayLabel = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
    day: date.toLocaleDateString("en-US", { day: "numeric", timeZone: "UTC" }),
    month: date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
  };
};

export function BookingFlow({ provider, terms: t }: { provider: Provider; terms: Terms }) {
  const router = useRouter();
  const paths = demoPaths(provider.vertical);
  const [step, setStep] = useState<Step>(0);

  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [page, setPage] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [tzLabel, setTzLabel] = useState("");
  const [tz, setTz] = useState<string | undefined>(undefined);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    reason: "",
    isNewClient: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load the availability calendar once per provider.
  useEffect(() => {
    let cancelled = false;
    fetch(`${paths.api.availability}?provider=${provider.slug}&calendar=1`)
      .then((r) => r.json())
      .then((data: { days?: CalendarDay[] }) => {
        if (cancelled || !data.days) return;
        setCalendar(data.days);
        const firstOpen = data.days.find((d) => d.openSlots > 0);
        if (firstOpen) {
          setSelectedDate(firstOpen.date);
          setPage(Math.floor(data.days.indexOf(firstOpen) / DAYS_PER_PAGE));
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [provider.slug, paths.api.availability]);

  // Load slots whenever the selected day changes.
  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    setSlotsLoading(true);
    setSelectedSlot(null);
    fetch(`${paths.api.availability}?provider=${provider.slug}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data: { slots?: Slot[]; timezoneLabel?: string; timezone?: string }) => {
        if (cancelled) return;
        setSlots(data.slots ?? []);
        if (data.timezoneLabel) setTzLabel(data.timezoneLabel);
        if (data.timezone) setTz(data.timezone);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [provider.slug, selectedDate, paths.api.availability]);

  const pageDays = useMemo(
    () => calendar.slice(page * DAYS_PER_PAGE, page * DAYS_PER_PAGE + DAYS_PER_PAGE),
    [calendar, page],
  );
  const maxPage = Math.max(0, Math.ceil(calendar.length / DAYS_PER_PAGE) - 1);
  // Grouped off the server-rendered label so the split follows business time,
  // not whatever timezone the client's browser is in.
  const morning = slots.filter((s) => s.label.toUpperCase().includes("AM"));
  const afternoon = slots.filter((s) => !s.label.toUpperCase().includes("AM"));

  const validateDetails = () => {
    const next: Record<string, string> = {};
    if (form.fullName.trim().length < 2) next.fullName = "Please enter your full name.";
    if (form.phone.replace(/\D/g, "").length < 7) {
      next.phone = "We need a number the assistant can call.";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      next.email = "That email doesn't look right.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(paths.api.bookings, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider.id,
          startsAt: selectedSlot.start,
          fullName: form.fullName,
          phone: form.phone,
          email: form.email || undefined,
          reason: form.reason || undefined,
          isNewClient: form.isNewClient,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors) setErrors(data.errors);
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        if (response.status === 409) {
          // The slot went while the form was open — refresh what's left.
          setStep(0);
          setSelectedSlot(null);
          if (selectedDate) {
            const refreshed = await fetch(
              `${paths.api.availability}?provider=${provider.slug}&date=${selectedDate}`,
            ).then((r) => r.json());
            setSlots(refreshed.slots ?? []);
          }
        }
        return;
      }
      router.push(paths.confirmation(data.appointmentId, data.reference));
    } catch {
      setSubmitError("We couldn't reach the server. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      {/* Stepper */}
      <ol className="flex border-b border-line bg-surface-2/60">
        {STEPS.map((label, index) => {
          const state = index === step ? "current" : index < step ? "done" : "todo";
          return (
            <li key={label} className="flex-1">
              <button
                type="button"
                disabled={index > step}
                onClick={() => index < step && setStep(index as Step)}
                className={`flex w-full items-center justify-center gap-2 px-2 py-3.5 text-[13px] font-medium transition ${
                  state === "current"
                    ? "text-ink"
                    : state === "done"
                      ? "text-primary hover:bg-surface-2"
                      : "text-subtle"
                }`}
              >
                <span
                  className={`grid size-5 place-items-center rounded-full text-[11px] font-semibold ${
                    state === "current"
                      ? "bg-primary text-on-primary"
                      : state === "done"
                        ? "bg-primary-soft text-primary"
                        : "bg-surface-3 text-subtle"
                  }`}
                >
                  {state === "done" ? <Check width={12} height={12} strokeWidth={2.5} /> : index + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="p-5 sm:p-6">
        {/* ── Step 1: date + time ───────────────────────────── */}
        {step === 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                <Calendar width={17} height={17} className="text-primary" />
                Pick a day
              </h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  aria-label="Previous week"
                  className="grid size-8 place-items-center rounded-lg border border-line text-muted transition enabled:hover:text-ink disabled:opacity-40"
                >
                  <ChevronLeft width={16} height={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                  disabled={page >= maxPage}
                  aria-label="Next week"
                  className="grid size-8 place-items-center rounded-lg border border-line text-muted transition enabled:hover:text-ink disabled:opacity-40"
                >
                  <ChevronRight width={16} height={16} />
                </button>
              </div>
            </div>

            <div className="scroll-x -mx-1 flex gap-2 px-1 pb-1">
              {pageDays.length === 0 &&
                Array.from({ length: DAYS_PER_PAGE }).map((_, i) => (
                  <div key={i} className="shimmer h-[74px] w-[68px] shrink-0 rounded-xl bg-surface-2" />
                ))}
              {pageDays.map((day) => {
                const { weekday, day: dayNum, month } = dayLabel(day.date);
                const selected = day.date === selectedDate;
                const closed = day.openSlots === 0;
                const label = day.closed ? "Closed" : closed ? "Full" : `${day.openSlots} open`;
                return (
                  <button
                    key={day.date}
                    type="button"
                    disabled={closed}
                    onClick={() => setSelectedDate(day.date)}
                    className={`w-[68px] shrink-0 rounded-xl border px-2 py-2.5 text-center transition ${
                      selected
                        ? "border-primary bg-primary text-on-primary"
                        : closed
                          ? "border-line bg-surface-2/50 text-subtle opacity-60"
                          : "border-line bg-surface text-ink hover:border-primary/50"
                    }`}
                  >
                    <div className="text-[11px] uppercase tracking-wide opacity-75">{weekday}</div>
                    <div className="text-lg font-semibold leading-tight">{dayNum}</div>
                    <div className="text-[10.5px] opacity-75">{label}</div>
                    <div className="sr-only">{month}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-7">
              <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
                <Clock width={17} height={17} className="text-primary" />
                Available times
                {tzLabel && (
                  <span className="text-[12px] font-normal text-subtle">({tzLabel})</span>
                )}
              </h2>

              {slotsLoading ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="shimmer h-10 rounded-lg bg-surface-2" />
                  ))}
                </div>
              ) : slots.filter((s) => s.available).length === 0 ? (
                <p className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-[13.5px] text-muted">
                  Nothing open on this day. Try another date above.
                </p>
              ) : (
                <div className="space-y-5">
                  {[
                    ["Morning", morning],
                    ["Afternoon", afternoon],
                  ].map(([label, group]) => {
                    const list = (group as Slot[]).filter((s) => s.available);
                    if (list.length === 0) return null;
                    return (
                      <div key={label as string}>
                        <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-subtle">
                          {label as string}
                        </p>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {list.map((slot) => {
                            const selected = selectedSlot?.start === slot.start;
                            return (
                              <button
                                key={slot.start}
                                type="button"
                                onClick={() => setSelectedSlot(slot)}
                                className={`h-10 rounded-lg border text-[13.5px] font-medium transition ${
                                  selected
                                    ? "border-primary bg-primary text-on-primary"
                                    : "border-line bg-surface text-ink hover:border-primary/60 hover:bg-primary-soft"
                                }`}
                              >
                                {slot.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!selectedSlot}
              onClick={() => setStep(1)}
              className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-semibold text-on-primary transition enabled:hover:bg-primary-hover disabled:opacity-40"
            >
              Continue
              <ArrowRight width={17} height={17} />
            </button>
          </div>
        )}

        {/* ── Step 2: details ───────────────────────────────── */}
        {step === 1 && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (validateDetails()) setStep(2);
            }}
            className="space-y-4"
          >
            <Field
              label="Full name"
              error={errors.fullName}
              input={
                <input
                  autoFocus
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Maya Thompson"
                  autoComplete="name"
                  className={inputClass(errors.fullName)}
                />
              }
            />
            <Field
              label="Mobile number"
              hint="The assistant calls this number within a minute."
              error={errors.phone}
              input={
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 415 555 0142"
                  inputMode="tel"
                  autoComplete="tel"
                  className={inputClass(errors.phone)}
                />
              }
            />
            <Field
              label="Email"
              hint="Optional — for your written confirmation."
              error={errors.email}
              input={
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  inputMode="email"
                  autoComplete="email"
                  className={inputClass(errors.email)}
                />
              }
            />
            <Field
              label={t.reasonLabel}
              hint={t.reasonHint}
              error={errors.reason}
              input={
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows={3}
                  maxLength={600}
                  placeholder={t.reasonPlaceholder}
                  className={`${inputClass(errors.reason)} resize-none`}
                />
              }
            />

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-2/60 p-3.5">
              <input
                type="checkbox"
                checked={form.isNewClient}
                onChange={(e) => setForm({ ...form, isNewClient: e.target.checked })}
                className="mt-0.5 size-4 accent-[var(--primary)]"
              />
              <span className="text-[13.5px] leading-relaxed text-muted">
                <span className="font-medium text-ink">{t.newClientLabel}</span> {t.newClientHint}
              </span>
            </label>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="h-12 rounded-xl border border-line px-5 text-[15px] font-semibold text-ink transition hover:border-line-strong"
              >
                Back
              </button>
              <button
                type="submit"
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-semibold text-on-primary transition hover:bg-primary-hover"
              >
                Review booking
                <ArrowRight width={17} height={17} />
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: review ────────────────────────────────── */}
        {step === 2 && selectedSlot && (
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Check everything over</h2>
            <dl className="mt-4 divide-y divide-line rounded-xl border border-line">
              <Row label={t.provider.One} value={`${providerLabel(provider)} · ${provider.specialty}`} />
              <Row
                label="When"
                value={`${new Date(selectedSlot.start).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  timeZone: tz,
                })} at ${selectedSlot.label}${tzLabel ? ` ${tzLabel}` : ""}`}
              />
              <Row label="Where" value={provider.location} />
              <Row label="Name" value={form.fullName} />
              <Row label="Phone" value={form.phone} />
              {form.email && <Row label="Email" value={form.email} />}
              {form.reason && <Row label="Reason" value={form.reason} />}
              <Row
                label={t.client.One}
                value={clientTypeLabel(form.isNewClient, t)}
              />
            </dl>

            <div className="mt-5 flex gap-3 rounded-xl bg-accent-soft p-4">
              <PhoneRinging width={20} height={20} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-[13.5px] leading-relaxed text-muted">
                As soon as you confirm, our AI receptionist calls{" "}
                <span className="font-medium text-ink">{form.phone || "your number"}</span> to
                verify these details. It takes about thirty seconds, and the call is recorded
                for the {t.business.one}&apos;s records.
              </p>
            </div>

            {submitError && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-danger-soft p-3.5 text-[13.5px] text-danger">
                <AlertTriangle width={17} height={17} className="mt-0.5 shrink-0" />
                {submitError}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={submitting}
                className="h-12 rounded-xl border border-line px-5 text-[15px] font-semibold text-ink transition hover:border-line-strong disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-semibold text-on-primary transition enabled:hover:bg-primary-hover disabled:opacity-60"
              >
                {submitting ? "Booking…" : "Confirm booking"}
                {!submitting && <Check width={17} height={17} strokeWidth={2.4} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputClass = (error?: string) =>
  `w-full rounded-xl border bg-surface px-3.5 py-2.5 text-[14.5px] text-ink placeholder:text-subtle transition focus:outline-none focus:ring-4 ${
    error
      ? "border-danger focus:ring-[var(--danger-soft)]"
      : "border-line focus:border-primary focus:ring-[var(--primary-ring)]"
  }`;

function Field({
  label,
  hint,
  error,
  input,
}: {
  label: string;
  hint?: string;
  error?: string;
  input: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[13.5px] font-medium text-ink">{label}</span>
        {hint && !error && <span className="text-[11.5px] text-subtle">{hint}</span>}
      </span>
      {input}
      {error && <span className="mt-1.5 block text-[12.5px] text-danger">{error}</span>}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 px-4 py-3">
      <dt className="w-24 shrink-0 text-[13px] text-muted">{label}</dt>
      <dd className="text-[13.5px] font-medium text-ink">{value}</dd>
    </div>
  );
}
