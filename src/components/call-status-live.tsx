"use client";

import { useEffect, useRef, useState } from "react";
import type { AppointmentStatus, CallOutcome, CallStatus } from "@/lib/types";
import type { CallOutcomeCopy } from "@/verticals/types";
import type { Terms } from "@/verticals/terms";
import { AlertTriangle, CheckCircle, PhoneRinging, Waveform } from "./icons";

type Payload = {
  status: AppointmentStatus;
  call: {
    status: CallStatus;
    outcome: CallOutcome;
    durationSeconds: number | null;
    summary: string | null;
  } | null;
};

const stagesFor = (t: Terms): { key: CallStatus; label: string; detail: string }[] => [
  { key: "queued", label: "Queued", detail: "Handing the details to the assistant" },
  { key: "ringing", label: "Calling you", detail: "Your phone should ring any second" },
  { key: "in_progress", label: "On the call", detail: `Confirming your ${t.booking.one}` },
  { key: "completed", label: "Done", detail: "Outcome recorded" },
];

/** Live confirmation-call tracker shown to the client after booking. */
export function CallStatusLive({
  appointmentId,
  reference,
  initial,
  terms,
  outcomes,
}: {
  appointmentId: string;
  reference: string;
  initial: Payload;
  terms: Terms;
  outcomes: CallOutcomeCopy;
}) {
  const STAGES = stagesFor(terms);
  const [data, setData] = useState<Payload>(initial);
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const callStatus = data.call?.status ?? "queued";
  const terminal = callStatus === "completed" || callStatus === "failed";

  useEffect(() => {
    if (terminal) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/appointments/${appointmentId}/status?ref=${encodeURIComponent(reference)}`,
          { cache: "no-store" },
        );
        if (response.ok) setData(await response.json());
      } catch {
        // Transient network blip — the next tick tries again.
      }
      setElapsed((value) => value + 3);
    }, 3000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [appointmentId, reference, terminal]);

  const activeIndex = Math.max(
    0,
    STAGES.findIndex((stage) => stage.key === (callStatus === "failed" ? "completed" : callStatus)),
  );
  const outcome = data.call?.outcome ?? (callStatus === "failed" ? "failed" : null);
  const summary = outcome ? outcomes[outcome] : null;

  return (
    <section className="card overflow-hidden">
      <header className="flex items-center gap-3 border-b border-line p-5">
        <span
          className={`relative grid size-11 shrink-0 place-items-center rounded-full ${
            terminal
              ? summary?.tone === "good"
                ? "bg-success-soft text-success"
                : "bg-warning-soft text-warning"
              : "bg-accent-soft text-accent"
          }`}
        >
          {!terminal && <span className="pulse-ring absolute inset-0 rounded-full opacity-25" />}
          {terminal ? (
            summary?.tone === "good" ? (
              <CheckCircle width={20} height={20} className="relative" />
            ) : (
              <AlertTriangle width={20} height={20} className="relative" />
            )
          ) : (
            <PhoneRinging width={20} height={20} className="relative" />
          )}
        </span>
        <div className="min-w-0">
          <h2 className="text-[15.5px] font-semibold text-ink">
            {terminal ? (summary?.title ?? "Call finished") : "Confirmation call in progress"}
          </h2>
          <p className="text-[13px] text-muted">
            {terminal
              ? (summary?.body ?? "The outcome has been recorded.")
              : `Usually takes under a minute${elapsed > 0 ? ` · ${elapsed}s elapsed` : ""}`}
          </p>
        </div>
        {!terminal && (
          <span className="equalizer ml-auto hidden items-end gap-[3px] text-accent sm:flex">
            <span style={{ animationDelay: "0ms" }} />
            <span style={{ animationDelay: "140ms" }} />
            <span style={{ animationDelay: "280ms" }} />
          </span>
        )}
      </header>

      <ol className="grid gap-0 p-5 sm:grid-cols-4 sm:gap-3">
        {STAGES.map((stage, index) => {
          const done = index < activeIndex || terminal;
          const current = index === activeIndex && !terminal;
          return (
            <li key={stage.key} className="flex gap-3 py-2 sm:block">
              <div className="flex items-center gap-2 sm:mb-2">
                <span
                  className={`size-2.5 shrink-0 rounded-full transition ${
                    done ? "bg-primary" : current ? "bg-accent" : "bg-surface-3"
                  }`}
                />
                <span
                  aria-hidden
                  className={`hidden h-px flex-1 sm:block ${done ? "bg-primary/40" : "bg-line"}`}
                />
              </div>
              <div>
                <p
                  className={`text-[13px] font-semibold ${
                    done || current ? "text-ink" : "text-subtle"
                  }`}
                >
                  {stage.label}
                </p>
                <p className="text-[12px] leading-snug text-muted">{stage.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {terminal && data.call?.summary && (
        <div className="border-t border-line bg-surface-2/60 p-5">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-subtle">
            What the assistant recorded
          </p>
          <p className="mt-2 flex gap-2 text-[13.5px] leading-relaxed text-muted">
            <Waveform width={16} height={16} className="mt-0.5 shrink-0 text-subtle" />
            {data.call.summary}
          </p>
        </div>
      )}
    </section>
  );
}
