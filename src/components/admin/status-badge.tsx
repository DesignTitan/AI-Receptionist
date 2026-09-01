import type { AppointmentStatus, CallOutcome, CallStatus } from "@/lib/types";

const APPOINTMENT: Record<AppointmentStatus, { label: string; className: string }> = {
  pending: { label: "Awaiting call", className: "bg-info-soft text-info" },
  confirmed: { label: "Confirmed", className: "bg-success-soft text-success" },
  rescheduled: { label: "Reschedule", className: "bg-warning-soft text-warning" },
  cancelled: { label: "Cancelled", className: "bg-danger-soft text-danger" },
  completed: { label: "Completed", className: "bg-surface-3 text-muted" },
  no_answer: { label: "No answer", className: "bg-warning-soft text-warning" },
};

const CALL: Record<CallStatus, { label: string; className: string }> = {
  queued: { label: "Queued", className: "bg-surface-3 text-muted" },
  ringing: { label: "Ringing", className: "bg-accent-soft text-accent" },
  in_progress: { label: "On call", className: "bg-accent-soft text-accent" },
  completed: { label: "Completed", className: "bg-success-soft text-success" },
  failed: { label: "Failed", className: "bg-danger-soft text-danger" },
};

/** A completed call is only "good" if it actually confirmed something. */
const OUTCOME: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "bg-success-soft text-success" },
  rescheduled: { label: "Reschedule requested", className: "bg-warning-soft text-warning" },
  cancelled: { label: "Cancelled", className: "bg-danger-soft text-danger" },
  voicemail: { label: "Voicemail", className: "bg-warning-soft text-warning" },
  no_answer: { label: "No answer", className: "bg-warning-soft text-warning" },
  failed: { label: "Failed", className: "bg-danger-soft text-danger" },
};

const shell =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap";

export function AppointmentBadge({ status }: { status: AppointmentStatus }) {
  const tone = APPOINTMENT[status];
  return <span className={`${shell} ${tone.className}`}>{tone.label}</span>;
}

export function CallBadge({
  status,
  outcome,
}: {
  status: CallStatus | null;
  outcome?: CallOutcome;
}) {
  if (!status) {
    return <span className={`${shell} bg-surface-3 text-subtle`}>No call</span>;
  }
  const live = status === "ringing" || status === "in_progress";
  const resolved = status === "completed" && outcome ? OUTCOME[outcome] : undefined;
  const tone = resolved ?? CALL[status];
  return (
    <span className={`${shell} ${tone.className}`}>
      {live && <span className="size-1.5 animate-pulse rounded-full bg-current" />}
      {tone.label}
    </span>
  );
}
