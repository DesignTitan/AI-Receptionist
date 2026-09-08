/** Provider duration fields have explicit units; unknown values must never become a zero-minute charge. */
export function durationSeconds(
  report: Record<string, unknown>,
  body: Record<string, unknown>,
): number | null {
  const raw =
    report.call_duration_in_seconds ??
    report.duration_seconds ??
    body.call_duration_in_seconds ??
    body.duration_seconds ??
    report.duration ??
    body.duration;
  if (
    typeof raw === "number" ||
    (typeof raw === "string" && /^\d+(\.\d+)?$/.test(raw))
  ) {
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.ceil(n) : null;
  }
  const clock = report.call_duration ?? body.call_duration;
  if (typeof clock === "string" && /^\d+:\d{1,2}(:\d{1,2})?$/.test(clock)) {
    const parts = clock.split(":").map(Number);
    if (parts.slice(1).some((n) => n >= 60)) return null;
    return parts.reduce((a, b) => a * 60 + b, 0);
  }
  return null;
}
export function reportedCostCents(
  report: Record<string, unknown>,
): number | null {
  const ai = report.voiceai_cost,
    phone = report.telephony_cost;
  if (
    typeof ai === "number" &&
    typeof phone === "number" &&
    ai >= 0 &&
    phone >= 0
  )
    return (ai + phone) * 100;
  return null;
}
