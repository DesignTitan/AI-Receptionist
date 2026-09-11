/** User-controlled scenario, not a forecast of product performance. Values are USD. */
export function appointmentValue(input: { ticket: number; margin: number; missed: number; recovered: number; monthlyCost: number }) {
  const clean = (n: number) => Number.isFinite(n) ? Math.max(0, n) : 0;
  const ticket = clean(input.ticket);
  const margin = Math.min(100, clean(input.margin)) / 100;
  const missed = Math.floor(clean(input.missed));
  const recovered = Math.min(missed, Math.floor(clean(input.recovered)));
  const cost = clean(input.monthlyCost);
  const contribution = ticket * margin;
  return { recovered, revenueAtRisk: missed * ticket, recoveredRevenue: recovered * ticket,
    recoveredContribution: recovered * contribution, net: recovered * contribution - cost,
    breakEven: contribution > 0 ? Math.ceil(cost / contribution) : null };
}
