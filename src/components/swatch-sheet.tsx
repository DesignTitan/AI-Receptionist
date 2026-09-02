/**
 * TEMPORARY — verification surface for the theming chunk. Renders every
 * colour token as a chip plus a display-face sample, so all palette × mode
 * combinations can be eyeballed. Delete once the salon and studio land.
 */
const TOKENS = [
  "bg", "bg-elevated", "surface", "surface-2", "surface-3", "border", "border-strong",
  "fg", "fg-muted", "fg-subtle",
  "primary", "primary-hover", "primary-soft", "on-primary", "accent", "accent-soft",
  "success", "success-soft", "warning", "warning-soft", "danger", "danger-soft", "info", "info-soft",
];

export function SwatchSheet({ label }: { label: string }) {
  return (
    <main id="main" className="mx-auto max-w-6xl px-5 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Swatches</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-ink">{label}</h1>
      <p className="mt-2 font-display text-4xl italic text-primary" data-probe="display">
        The quick brown fox — display face
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {TOKENS.map((name) => (
          <div key={name} className="card overflow-hidden" data-token={name}>
            <div className="h-14 border-b border-line" style={{ background: `var(--${name})` }} />
            <div className="p-2.5 text-[12px] font-medium text-ink">--{name}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <span className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary">bg-primary</span>
        <span className="rounded-full bg-accent-soft px-4 py-2 text-sm font-semibold text-accent">bg-accent-soft</span>
        <span className="card px-4 py-2 text-sm text-muted">card / text-muted</span>
      </div>
    </main>
  );
}
