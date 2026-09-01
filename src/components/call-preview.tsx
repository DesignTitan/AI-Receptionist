import { PhoneRinging, Waveform } from "./icons";

const LINES = [
  { who: "Ava", text: "Hi Maya — this is Ava at Northlake Family Health." },
  { who: "Maya", text: "Oh, hi." },
  { who: "Ava", text: "I'm confirming Thursday at 10:30 with Dr. Vasquez. Still good?" },
  { who: "Maya", text: "Yes, that works." },
  { who: "Ava", text: "You're all set. Arrive ten minutes early with your ID." },
];

/** Decorative hero panel: what the confirmation call looks like from the clinic's side. */
export function CallPreview() {
  return (
    <div className="card relative overflow-hidden p-5 shadow-[var(--shadow-float)]">
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <span className="relative grid size-10 place-items-center rounded-full bg-accent-soft text-accent">
          <span className="pulse-ring absolute inset-0 rounded-full opacity-25" />
          <PhoneRinging width={18} height={18} className="relative" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            Outbound confirmation call
          </p>
          <p className="text-xs text-muted">+1 415 555 0142 · Maya Thompson</p>
        </div>
        <span className="equalizer flex items-end gap-[3px] text-primary">
          <span style={{ animationDelay: "0ms" }} />
          <span style={{ animationDelay: "120ms" }} />
          <span style={{ animationDelay: "240ms" }} />
          <span style={{ animationDelay: "80ms" }} />
        </span>
      </div>

      <ul className="space-y-2.5 py-4">
        {LINES.map((line, index) => (
          <li
            key={line.text}
            className="rise flex gap-2.5 text-[13px] leading-relaxed"
            style={{ animationDelay: `${180 + index * 260}ms` }}
          >
            <span
              className={`mt-0.5 shrink-0 text-[11px] font-semibold uppercase tracking-wide ${
                line.who === "Ava" ? "text-accent" : "text-subtle"
              }`}
            >
              {line.who}
            </span>
            <span className={line.who === "Ava" ? "text-ink" : "text-muted"}>{line.text}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-success-soft px-3.5 py-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-success">
          <Waveform width={16} height={16} />
          Confirmed · 0:47
        </div>
        <span className="text-[11.5px] text-muted">Recording saved to dashboard</span>
      </div>
    </div>
  );
}
