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
export const INDUSTRY_VALUE_EXAMPLES = [
  { name: "Medical & dental", ticket: 150, unit: "Completed visit", note: "Illustrative $150 collected per visit. Use actual collections after payer adjustments, not billed charges." },
  { name: "Healthcare & wellness", ticket: 100, unit: "Completed session", note: "Illustrative $100 session. Use collected fees and account for payer mix or prepaid packages." },
  { name: "Fitness & movement", ticket: 75, unit: "Paid training session", note: "Illustrative $75 session. A missed visit on an unlimited membership may not lose incremental revenue." },
  { name: "Personal care", ticket: 77, unit: "Completed salon visit", note: "Zenoti 2026 reports a $77 median salon ticket. This is a vendor-sample median, not your average or a benchmark for every personal-care service." },
  { name: "Retail & shops", ticket: 100, unit: "Completed purchase", note: "Illustrative $100 purchase. Count completed purchases attributable to follow-up, not every showroom appointment." },
  { name: "Pet services", ticket: 90, unit: "Completed groom", note: "Illustrative $90 groom. Adjust for breed, service, consumables and staff costs." },
  { name: "Creative studios", ticket: 350, unit: "Completed shoot", note: "Illustrative $350 shoot. Exclude retained deposits and include editing, travel and fulfillment costs." },
  { name: "Home & auto services", ticket: 200, unit: "Completed paid job", note: "Illustrative $200 job. An estimate is not a sale; deduct parts, travel and job-specific labor." },
  { name: "Professional services", ticket: 200, unit: "Paid consultation", note: "Illustrative $200 consultation. A free discovery call is not collected revenue; use actual paid work." },
  { name: "Lessons & coaching", ticket: 60, unit: "Completed paid lesson", note: "Illustrative $60 lesson. Prepaid lessons, makeup sessions and cancellation fees change the amount genuinely at risk." },
] as const;
