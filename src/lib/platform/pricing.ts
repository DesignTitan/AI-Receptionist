/** Pricing v2: one source for the storefront, entitlement checks and Stripe catalogue. */
export const PRICING_VERSION = "minutes-v2";
export const SETUP_CENTS = 49900;
export const SMALL_TEAM_SETUP_CENTS = 8900;
export function setupCents(plan: Plan) {
  return plan === "full" ? SETUP_CENTS : SMALL_TEAM_SETUP_CENTS;
}
export const PILOT_SETUP_CENTS = 29900;
export const PILOT_CUSTOMERS = 10;
export const SETUP_SCOPE =
  "One business, booking-page configuration, dedicated phone setup and one test session. Custom integrations and extra work are quoted separately.";
export const SETUP_OFFER =
  "$89 one-time setup for Front desk and Busy desk; $499 for Full desk. Custom and enterprise setup is quoted separately.";
export const OVERAGE_CENTS = 49;
export const MAX_CALL_MINUTES = 5;
export const MAX_BUDGET_CENTS = 50000;
export const PLANS = {
  front: {
    name: "Front desk",
    monthly: 199,
    minutes: 300,
    teamLimit: 3,
    estimatedCalls: 150,
    who: "Independent businesses and small teams.",
  },
  busy: {
    name: "Busy desk",
    monthly: 399,
    minutes: 750,
    teamLimit: 10,
    estimatedCalls: 375,
    who: "A growing team with a full appointment book.",
  },
  full: {
    name: "Full desk",
    monthly: 749,
    minutes: 1500,
    teamLimit: 20,
    estimatedCalls: 750,
    who: "A busy single-location business with a larger team.",
  },
} as const;
export type Plan = keyof typeof PLANS;
export const COMMON_FEATURES = [
  "Branded online booking page",
  "Dedicated confirmation-call number",
  "AI confirmation calls with recording notice",
  "Call summaries, with available transcripts and recordings",
  "Cancellation and reschedule requests flagged for your team",
  "24/7 online booking",
  "Usage dashboard, notices and spending controls",
  "Email support",
];
export function planFeatures(plan: Plan) {
  return [
    `${PLANS[plan].minutes.toLocaleString()} minutes per billing month`,
    `Up to ${PLANS[plan].teamLimit} bookable team members`,
    ...COMMON_FEATURES,
  ];
}
export function billableMinutes(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0)
    throw Error("Valid call duration required");
  return Math.ceil(seconds / 60);
}
export function estimateOverage(minutes: number, plan: Plan) {
  return Math.max(0, minutes - PLANS[plan].minutes) * OVERAGE_CENTS;
}
export function recommendPlan(minutes: number, teamSize = 1): Plan {
  return (Object.keys(PLANS) as Plan[])
    .filter((p) => PLANS[p].teamLimit >= teamSize)
    .reduce(
      (best, p) =>
        PLANS[p].monthly * 100 + estimateOverage(minutes, p) <
        PLANS[best].monthly * 100 + estimateOverage(minutes, best)
          ? p
          : best,
      "full",
    );
}
/** Conservative planning, not guaranteed net profit. Provider rate includes a buffer above measured $0.145. */
export function economics(
  plan: Plan,
  costPerMinute = 0.2,
  supportReserve = 25,
) {
  const p = PLANS[plan];
  const fees = p.monthly * 0.036 + 0.3;
  const cost = p.minutes * costPerMinute + 5 + supportReserve + fees;
  return {
    revenue: p.monthly,
    cost,
    contribution: p.monthly - cost,
    margin: (p.monthly - cost) / p.monthly,
  };
}
