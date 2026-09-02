"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertTriangle, Check, PhoneRinging, XMark } from "@/components/icons";
import type { AppointmentStatus } from "@/lib/types";

/** Staff controls: override the status, or put the confirmation call through again. */
export function AppointmentActions({
  appointmentId,
  status,
  clientNoun,
}: {
  appointmentId: string;
  status: AppointmentStatus;
  clientNoun: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (label: string, body: Record<string, unknown>) => {
    setBusy(label);
    setError(null);
    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "That didn't work. Try again.");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(null);
    }
  };

  const disabled = busy !== null || pending;

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => run("recall", { action: "recall" })}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14.5px] font-semibold text-on-primary transition enabled:hover:bg-primary-hover disabled:opacity-60"
      >
        <PhoneRinging width={17} height={17} />
        {busy === "recall" ? "Dialling…" : `Call the ${clientNoun} again`}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled || status === "confirmed"}
          onClick={() => run("confirm", { status: "confirmed" })}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-line text-[13.5px] font-medium text-ink transition enabled:hover:border-success enabled:hover:text-success disabled:opacity-40"
        >
          <Check width={15} height={15} />
          Mark confirmed
        </button>
        <button
          type="button"
          disabled={disabled || status === "cancelled"}
          onClick={() => run("cancel", { status: "cancelled" })}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-line text-[13.5px] font-medium text-ink transition enabled:hover:border-danger enabled:hover:text-danger disabled:opacity-40"
        >
          <XMark width={15} height={15} />
          Cancel
        </button>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2.5 text-[12.5px] text-danger">
          <AlertTriangle width={15} height={15} className="mt-px shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
